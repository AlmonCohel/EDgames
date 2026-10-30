/* EDgames accounts API. The games themselves are static files on GitHub Pages
   and play with this Worker switched off; it only answers who is signed in and
   which plan they are on.

     POST   /auth/signup   { email, password, plan, accept, lang }
     POST   /auth/login    { email, password }
     POST   /auth/logout
     POST   /auth/forgot   { email, lang }
     POST   /auth/reset    { token, password }
     GET    /me
     POST   /me/plan       { plan }
     DELETE /me            { password }
     GET    /health

   Answers are { ok: true, ... } or { ok: false, error: '<code>' }; the codes are
   translated in assets/i18n.js, under auth.error.<code>. */

/* Must match the ids in assets/tiers.js. 'guest' is not a plan: it is having no account. */
const PLANS = ['free', 'basic', 'pro'];
const TERMS_VERSION = '2026-10-30';

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 200;
/* Workers' WebCrypto refuses more than 100,000. The count is stored with each
   hash, so raising it later only affects new passwords. */
const PBKDF2_ITERATIONS = 100000;
const SESSION_DAYS = 90;
const RESET_MINUTES = 60;
const MAX_BODY = 10000;

const MINUTE = 60;
const HOUR = 3600;

class Refused extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}

const now = () => new Date().toISOString();
const later = (ms) => new Date(Date.now() + ms).toISOString();
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (s) => Uint8Array.from(s.match(/../g), (h) => parseInt(h, 16));
const randomHex = (bytes) => hex(crypto.getRandomValues(new Uint8Array(bytes)));
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

/* ---- Passwords ---- */

async function derive(password, saltHex, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(saltHex), iterations }, key, 256));
}

async function hashPassword(password) {
  const salt = randomHex(16);
  return ['pbkdf2-sha256', PBKDF2_ITERATIONS, salt, await derive(password, salt, PBKDF2_ITERATIONS)].join('$');
}

async function verifyPassword(password, stored) {
  const [scheme, iterations, salt, want] = String(stored).split('$');
  if (scheme !== 'pbkdf2-sha256' || !want) return false;
  const got = await derive(password, salt, Number(iterations));
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i += 1) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}

/* Spent on an email with no account, so a wrong email takes as long as a wrong password. */
const DUMMY_SALT = '00'.repeat(16);

function checkPassword(password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN) throw new Refused('weak_password');
  if (password.length > PASSWORD_MAX) throw new Refused('weak_password');
}

function checkEmail(raw) {
  const email = String(raw || '').trim().toLowerCase();
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Refused('bad_email');
  return email;
}

const checkLang = (lang) => (lang === 'en' ? 'en' : 'he');

/* ---- Rate limits ---- */

async function hits(env, key, windowSec) {
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM rate_hits WHERE key = ? AND at > ?')
    .bind(await sha256(key), Math.floor(Date.now() / 1000) - windowSec).first();
  return row.n;
}

async function hit(env, key) {
  const nowSec = Math.floor(Date.now() / 1000);
  await env.DB.prepare('INSERT INTO rate_hits (key, at) VALUES (?, ?)').bind(await sha256(key), nowSec).run();
  /* Nothing here looks back further than a day, and a cron would be overkill for a table this small. */
  if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM rate_hits WHERE at < ?').bind(nowSec - 86400).run();
}

async function limit(env, key, windowSec, max) {
  if (await hits(env, key, windowSec) >= max) throw new Refused('too_many', 429);
  await hit(env, key);
}

const clientIp = (request) => request.headers.get('CF-Connecting-IP') || 'unknown';

/* ---- The audit log ---- */

function logEvent(env, userId, type, detail) {
  return env.DB.prepare('INSERT INTO events (user_id, type, detail, at) VALUES (?, ?, ?, ?)')
    .bind(userId, type, detail ? JSON.stringify(detail) : null, now()).run();
}

/* ---- Plans ----

   A plan past its end date counts as free. That date is what a payment provider
   will move; nothing else in the app needs to know a provider exists. */

function effectivePlan(user) {
  if (user.plan_expires_at && user.plan_expires_at < now()) return 'free';
  return user.plan;
}

function publicUser(user) {
  return {
    email: user.email,
    plan: effectivePlan(user),
    planStatus: user.plan_status,
    planSince: user.plan_since,
    lang: user.lang,
    createdAt: user.created_at,
  };
}

async function applyPlan(env, userId, plan, status, source) {
  await env.DB.prepare('UPDATE users SET plan = ?, plan_status = ?, plan_since = ?, plan_expires_at = NULL WHERE id = ?')
    .bind(plan, status, now(), userId).run();
  await logEvent(env, userId, 'plan_change', { plan, status, source });
}

/* THE SEAM FOR PAYMENTS. There is no provider yet, so asking for a paid plan
   grants it, marked `early_access`, and nothing is charged. With a provider this
   returns its checkout URL for the paid plans, and that provider's webhook is
   what calls applyPlan(..., 'active', ...). See docs/ACCOUNTS.md. */
async function requestPlan(env, userId, plan, source) {
  await applyPlan(env, userId, plan, plan === 'free' ? 'active' : 'early_access', source);
}

/* ---- Sessions ---- */

async function openSession(env, userId) {
  const token = randomHex(32);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now()),
    env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .bind(await sha256(token), userId, now(), later(SESSION_DAYS * 86400000)),
  ]);
  return token;
}

const bearer = (request) => (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');

async function currentUser(env, request) {
  const token = bearer(request);
  if (!token) throw new Refused('signed_out', 401);
  const user = await env.DB.prepare(`
    SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?`)
    .bind(await sha256(token), now()).first();
  if (!user) throw new Refused('signed_out', 401);
  return user;
}

/* ---- Reset mail ----

   Sent through Tally's mail relay, a small Apps Script that mails from the
   owner's Google account. Fails quietly on purpose: /auth/forgot answers the same
   whether or not an email has an account, so its result is only logged. */

function resetMail(lang, link) {
  if (lang === 'en') {
    return {
      subject: 'Reset your EDgames password',
      body: `We received a request to reset the password of your EDgames account.\n\nTo choose a new password, open this link (it works for one hour):\n${link}\n\nIf this was not you, ignore this email and your password stays the same.`,
    };
  }
  return {
    subject: 'איפוס סיסמה — הגנון של עלמון',
    body: `קיבלנו בקשה לאיפוס הסיסמה של החשבון שלכם בהגנון של עלמון.\n\nלבחירת סיסמה חדשה, פתחו את הקישור הזה (הוא עובד במשך שעה):\n${link}\n\nאם זה לא הייתם אתם, אפשר להתעלם מהמייל והסיסמה תישאר כפי שהיא.`,
  };
}

async function sendResetMail(env, user, token) {
  if (!env.MAIL_RELAY_URL) { console.error('reset mail: MAIL_RELAY_URL is not set'); return false; }
  const link = `${env.APP_URL}?view=reset&token=${token}`;
  const mail = resetMail(user.lang, link);
  try {
    const res = await fetch(env.MAIL_RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: env.MAIL_RELAY_SECRET, to: user.email, name: user.lang === 'en' ? 'EDgames' : 'הגנון של עלמון', ...mail }),
    });
    const out = await res.json();
    if (!out.ok) throw new Error(out.error || 'relay refused');
    return true;
  } catch (err) {
    console.error(`reset mail failed: ${err.message}`);
    return false;
  }
}

/* ---- Routes ---- */

async function signup(env, request, body) {
  const email = checkEmail(body.email);
  checkPassword(body.password);
  if (!PLANS.includes(body.plan)) throw new Refused('bad_plan');
  if (body.accept !== true) throw new Refused('must_accept');
  await limit(env, `signup|${clientIp(request)}`, HOUR, 10);

  const exists = await env.DB.prepare('SELECT 1 FROM users WHERE email = ?').bind(email).first();
  if (exists) throw new Refused('email_taken', 409);

  const id = crypto.randomUUID();
  const at = now();
  try {
    await env.DB.prepare(`
      INSERT INTO users (id, email, password_hash, plan_since, lang, terms_version, terms_accepted_at, created_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, email, await hashPassword(body.password), at, checkLang(body.lang), TERMS_VERSION, at, at, at).run();
  } catch (err) {
    /* Two sign-ups racing on one email. */
    if (/UNIQUE/i.test(err.message)) throw new Refused('email_taken', 409);
    throw err;
  }
  await logEvent(env, id, 'signup', { plan: body.plan });
  await requestPlan(env, id, body.plan, 'signup');

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  return { token: await openSession(env, id), user: publicUser(user) };
}

async function login(env, request, body) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '').slice(0, PASSWORD_MAX);
  const ipKey = `login-ip|${clientIp(request)}`;
  const emailKey = `login-email|${email}`;
  /* Only failures count, so a family signing in all day is never locked out. */
  if (await hits(env, emailKey, 15 * MINUTE) >= 8 || await hits(env, ipKey, 15 * MINUTE) >= 40) throw new Refused('too_many', 429);

  const user = email ? await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() : null;
  const good = user ? await verifyPassword(password, user.password_hash) : (await derive(password, DUMMY_SALT, PBKDF2_ITERATIONS), false);
  if (!good) {
    await hit(env, emailKey);
    await hit(env, ipKey);
    if (user) await logEvent(env, user.id, 'login_failed');
    throw new Refused('bad_login', 401);
  }

  await env.DB.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').bind(now(), user.id).run();
  await logEvent(env, user.id, 'login');
  return { token: await openSession(env, user.id), user: publicUser(user) };
}

async function logout(env, request) {
  const token = bearer(request);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return {};
}

/* Answers the same for every email, known or not, including when limited. */
async function forgot(env, request, body) {
  let email;
  try { email = checkEmail(body.email); } catch { return {}; }
  await limit(env, `forgot-ip|${clientIp(request)}`, HOUR, 10);
  if (await hits(env, `forgot-email|${email}`, HOUR) >= 3) return {};
  await hit(env, `forgot-email|${email}`);

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) return {};
  const token = randomHex(32);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM reset_tokens WHERE user_id = ?').bind(user.id),
    env.DB.prepare('INSERT INTO reset_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(await sha256(token), user.id, later(RESET_MINUTES * 60000)),
  ]);
  const sent = await sendResetMail(env, { ...user, lang: body.lang ? checkLang(body.lang) : user.lang }, token);
  await logEvent(env, user.id, 'reset_requested', { sent });
  return {};
}

async function reset(env, request, body) {
  checkPassword(body.password);
  await limit(env, `reset-ip|${clientIp(request)}`, HOUR, 10);
  const hash = await sha256(String(body.token || ''));
  const entry = await env.DB.prepare('SELECT * FROM reset_tokens WHERE token_hash = ? AND expires_at > ?').bind(hash, now()).first();
  if (!entry) throw new Refused('bad_token');
  /* Every device is signed out: if the password was stolen, so may a session have been. */
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(await hashPassword(body.password), entry.user_id),
    env.DB.prepare('DELETE FROM reset_tokens WHERE user_id = ?').bind(entry.user_id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(entry.user_id),
  ]);
  await logEvent(env, entry.user_id, 'password_reset');
  return {};
}

async function me(env, request) {
  return { user: publicUser(await currentUser(env, request)) };
}

async function changePlan(env, request, body) {
  const user = await currentUser(env, request);
  if (!PLANS.includes(body.plan)) throw new Refused('bad_plan');
  if (body.plan !== effectivePlan(user)) await requestPlan(env, user.id, body.plan, 'account_page');
  const fresh = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
  return { user: publicUser(fresh) };
}

async function deleteAccount(env, request, body) {
  const user = await currentUser(env, request);
  if (!(await verifyPassword(String(body.password || ''), user.password_hash))) throw new Refused('bad_password', 403);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM reset_tokens WHERE user_id = ?').bind(user.id),
    env.DB.prepare('UPDATE events SET user_id = NULL WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id),
    env.DB.prepare("INSERT INTO events (user_id, type, at) VALUES (NULL, 'account_deleted', ?)").bind(now()),
  ]);
  return {};
}

const ROUTES = {
  'POST /auth/signup': signup,
  'POST /auth/login': login,
  'POST /auth/logout': logout,
  'POST /auth/forgot': forgot,
  'POST /auth/reset': reset,
  'GET /me': me,
  'POST /me/plan': changePlan,
  'DELETE /me': deleteAccount,
  'GET /health': async () => ({}),
};

/* ---- The door ---- */

function corsHeaders(env, request) {
  const origin = request.headers.get('Origin');
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());
  if (!origin || !allowed.includes(origin)) return { Vary: 'Origin' };
  return {
    Vary: 'Origin',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

function json(env, request, status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...corsHeaders(env, request) },
  });
}

async function readBody(request) {
  if (request.method === 'GET') return {};
  const text = await request.text();
  if (text.length > MAX_BODY) throw new Refused('bad_request', 413);
  if (!text) return {};
  try {
    const body = JSON.parse(text);
    return body && typeof body === 'object' ? body : {};
  } catch {
    throw new Refused('bad_request');
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    const route = ROUTES[`${request.method} ${new URL(request.url).pathname}`];
    if (!route) return json(env, request, 404, { ok: false, error: 'not_found' });
    try {
      const out = await route(env, request, await readBody(request));
      return json(env, request, 200, { ok: true, ...out });
    } catch (err) {
      if (err instanceof Refused) return json(env, request, err.status, { ok: false, error: err.code });
      console.error(err.stack || err.message);
      return json(env, request, 500, { ok: false, error: 'server' });
    }
  },
};
