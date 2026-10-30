/* End-to-end tests of the accounts API: a real local Worker and a real local
   D1 (a throwaway folder each run), with a stand-in for the mail relay so the
   reset link in the actual email can be followed.

     cd worker && node --test test/api.test.mjs */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const workerDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 18791;
const API = `http://127.0.0.1:${PORT}`;
const ORIGIN = 'https://almoncohel.github.io';
const persist = mkdtempSync(join(tmpdir(), 'edgames-d1-'));
const devVars = join(workerDir, '.dev.vars');
let dev, relay;
const mail = [];

async function call(method, path, body, token, ip) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: ORIGIN,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(ip ? { 'CF-Connecting-IP': ip } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, headers: res.headers, ...(await res.json()) };
}

const PW = 'correct horse battery';
const signup = (email, plan = 'free', ip = '10.0.0.1') => call('POST', '/auth/signup', { email, password: PW, plan, accept: true, lang: 'en' }, null, ip);

before(async () => {
  relay = createServer((req, res) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => {
      mail.push(JSON.parse(data));
      res.setHeader('Content-Type', 'application/json');
      res.end('{"ok":true}');
    });
  }).listen(18792);
  writeFileSync(devVars, 'MAIL_RELAY_URL=http://127.0.0.1:18792/\nMAIL_RELAY_SECRET=test\nAPP_URL=http://x/account.html\n');
  execFileSync('npx', ['--yes', 'wrangler@4', 'd1', 'migrations', 'apply', 'edgames', '--local', '--persist-to', persist], { cwd: workerDir, stdio: 'ignore', env: { ...process.env, CI: '1' } });
  dev = spawn('npx', ['--yes', 'wrangler@4', 'dev', '--port', String(PORT), '--persist-to', persist, '--ip', '127.0.0.1'], { cwd: workerDir, stdio: 'ignore', detached: true });
  for (let i = 0; i < 120; i += 1) {
    try { if ((await fetch(`${API}/health`)).ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('wrangler dev did not start');
});

after(() => {
  try { process.kill(-dev.pid); } catch { /* gone */ }
  relay.close();
  rmSync(devVars, { force: true });
  rmSync(persist, { recursive: true, force: true });
});

test('sign up on each plan: free is active, paid is early access with nothing charged', async () => {
  const free = await signup('Free@Example.com', 'free');
  assert.equal(free.status, 200);
  assert.equal(free.user.email, 'free@example.com');
  assert.equal(free.user.plan, 'free');
  assert.equal(free.user.planStatus, 'active');
  const pro = await signup('pro@example.com', 'pro');
  assert.equal(pro.user.plan, 'pro');
  assert.equal(pro.user.planStatus, 'early_access');
  assert.equal((await call('GET', '/me', undefined, pro.token)).user.plan, 'pro');
});

test('sign-up refuses bad input, a repeated email, and not accepting the terms', async () => {
  const base = { email: 'new@example.com', password: PW, plan: 'free', accept: true };
  assert.equal((await call('POST', '/auth/signup', { ...base, email: 'nope' })).error, 'bad_email');
  assert.equal((await call('POST', '/auth/signup', { ...base, password: 'short' })).error, 'weak_password');
  assert.equal((await call('POST', '/auth/signup', { ...base, plan: 'platinum' })).error, 'bad_plan');
  assert.equal((await call('POST', '/auth/signup', { ...base, plan: 'guest' })).error, 'bad_plan');
  assert.equal((await call('POST', '/auth/signup', { ...base, accept: false })).error, 'must_accept');
  const again = await call('POST', '/auth/signup', { ...base, email: 'FREE@example.com' });
  assert.equal(again.status, 409);
  assert.equal(again.error, 'email_taken');
});

test('what the site is told about a user has no password hash or billing details in it', async () => {
  const s = await signup('fields@example.com', 'basic');
  assert.deepEqual(Object.keys(s.user).sort(), ['createdAt', 'email', 'lang', 'plan', 'planSince', 'planStatus']);
});

test('log in, log out, and a wrong password says nothing about the email', async () => {
  await signup('login@example.com');
  const ok = await call('POST', '/auth/login', { email: ' LOGIN@example.com ', password: PW });
  assert.equal(ok.status, 200);
  const wrongPw = await call('POST', '/auth/login', { email: 'login@example.com', password: 'wrong wrong' });
  const noUser = await call('POST', '/auth/login', { email: 'ghost@example.com', password: 'wrong wrong' });
  assert.equal(wrongPw.status, 401);
  assert.deepEqual([wrongPw.error, noUser.error], ['bad_login', 'bad_login']);
  assert.equal((await call('POST', '/auth/logout', {}, ok.token)).status, 200);
  assert.equal((await call('GET', '/me', undefined, ok.token)).status, 401);
});

test('/me refuses no token and a made-up token', async () => {
  assert.equal((await call('GET', '/me')).status, 401);
  assert.equal((await call('GET', '/me', undefined, 'f'.repeat(64))).status, 401);
});

test('changing plan up and down, and an invalid plan', async () => {
  const s = await signup('change@example.com');
  const up = await call('POST', '/me/plan', { plan: 'basic' }, s.token);
  assert.deepEqual([up.user.plan, up.user.planStatus], ['basic', 'early_access']);
  const down = await call('POST', '/me/plan', { plan: 'free' }, s.token);
  assert.deepEqual([down.user.plan, down.user.planStatus], ['free', 'active']);
  assert.equal((await call('POST', '/me/plan', { plan: 'x' }, s.token)).error, 'bad_plan');
  assert.equal((await call('POST', '/me/plan', { plan: 'pro' })).status, 401);
});

test('too many wrong passwords pause that email, even for the right password', async () => {
  await signup('locked@example.com', 'free', '10.0.0.2');
  for (let i = 0; i < 8; i += 1) await call('POST', '/auth/login', { email: 'locked@example.com', password: 'wrong wrong' }, null, '10.0.0.3');
  const res = await call('POST', '/auth/login', { email: 'locked@example.com', password: PW }, null, '10.0.0.3');
  assert.equal(res.status, 429);
  assert.equal(res.error, 'too_many');
});

test('forgot: the link in the email resets the password once, and signs out every device', async () => {
  const s = await signup('reset@example.com', 'free', '10.0.0.4');
  mail.length = 0;
  assert.equal((await call('POST', '/auth/forgot', { email: 'reset@example.com' })).status, 200);
  assert.equal(mail.length, 1);
  assert.equal(mail[0].to, 'reset@example.com');
  assert.equal(mail[0].subject, 'Reset your EDgames password');
  const token = mail[0].body.match(/token=([0-9a-f]+)/)[1];

  assert.equal((await call('POST', '/auth/reset', { token, password: 'short' })).error, 'weak_password');
  assert.equal((await call('POST', '/auth/reset', { token: 'bad', password: 'a new password' })).error, 'bad_token');
  assert.equal((await call('POST', '/auth/reset', { token, password: 'a new password' })).status, 200);
  assert.equal((await call('POST', '/auth/reset', { token, password: 'another password' })).error, 'bad_token');
  assert.equal((await call('GET', '/me', undefined, s.token)).status, 401);
  assert.equal((await call('POST', '/auth/login', { email: 'reset@example.com', password: PW })).status, 401);
  assert.equal((await call('POST', '/auth/login', { email: 'reset@example.com', password: 'a new password' })).status, 200);
});

test('forgot answers the same for an unknown email and sends nothing', async () => {
  mail.length = 0;
  const res = await call('POST', '/auth/forgot', { email: 'ghost@example.com' });
  assert.equal(res.status, 200);
  assert.equal(mail.length, 0);
});

test('delete account: needs the password, then the account and its sessions are gone', async () => {
  const s = await signup('gone@example.com', 'pro', '10.0.0.5');
  const wrong = await call('DELETE', '/me', { password: 'wrong wrong' }, s.token);
  assert.equal(wrong.status, 403);
  assert.equal((await call('DELETE', '/me', { password: PW }, s.token)).status, 200);
  assert.equal((await call('GET', '/me', undefined, s.token)).status, 401);
  assert.equal((await call('POST', '/auth/login', { email: 'gone@example.com', password: PW })).status, 401);
});

test('CORS: the site is allowed, another site is not, preflight answers', async () => {
  const ok = await fetch(`${API}/health`, { headers: { Origin: ORIGIN } });
  assert.equal(ok.headers.get('access-control-allow-origin'), ORIGIN);
  const other = await fetch(`${API}/health`, { headers: { Origin: 'https://evil.example' } });
  assert.equal(other.headers.get('access-control-allow-origin'), null);
  const pre = await fetch(`${API}/me`, { method: 'OPTIONS', headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'GET' } });
  assert.equal(pre.status, 204);
  assert.match(pre.headers.get('access-control-allow-headers'), /Authorization/);
});

test('sign-ups from one address are limited', async () => {
  let last;
  for (let i = 0; i < 11; i += 1) last = await signup(`bulk${i}@example.com`, 'free', '10.0.0.9');
  assert.equal(last.status, 429);
});

test('unknown routes and broken JSON answer cleanly', async () => {
  assert.equal((await call('GET', '/nope')).status, 404);
  const res = await fetch(`${API}/auth/login`, { method: 'POST', body: '{not json' });
  assert.equal(res.status, 400);
});
