/* Who is signed in, and what they may open.

   The session token and the last answer about the account are kept in
   localStorage, so a page knows the plan before its first paint and a game opens
   with no signal. EDAuth.refresh() asks the server and corrects that copy; the
   server is the one that decides what a plan is.

   The games never wait for any of this. With the API down or the site opened as
   a file, a child still plays everything a guest can.

   Note what this does not do: the game files are public, so the lock is a door
   sign rather than a safe. See docs/ACCOUNTS.md before charging for anything. */

const EDAuth = window.EDAuth = (() => {
  const TOKEN_KEY = 'edgames-session';
  const USER_KEY = 'edgames-user';
  const ENTERED_KEY = 'edgames-entered';

  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const API = local ? `http://${location.hostname}:18791` : 'https://edgames-api.almon-cohel.workers.dev';

  /* localStorage throws in a few browsers on file:// and in private windows. */
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => {
    try {
      if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
    } catch { /* then this tab forgets it */ }
  };

  const token = () => read(TOKEN_KEY);

  function user() {
    try { return JSON.parse(read(USER_KEY)); } catch { return null; }
  }

  function save(session, account) {
    if (session) write(TOKEN_KEY, session);
    write(USER_KEY, JSON.stringify(account));
    markEntered();
  }

  function forget() {
    write(TOKEN_KEY, null);
    write(USER_KEY, null);
  }

  const plan = () => (token() && user() && user().plan) || 'guest';
  const canPlay = (game) => tierRank(plan()) >= tierRank(gameTier(game));

  /* Having chosen once, by signing in or by "play without an account", the
     landing page steps aside on later visits. */
  const markEntered = () => write(ENTERED_KEY, '1');
  const hasEntered = () => read(ENTERED_KEY) === '1';

  /* Rejects with an Error whose .code is the API's, or 'network'. */
  async function call(method, path, body) {
    let res;
    try {
      res = await fetch(API + path, {
        method,
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw Object.assign(new Error('network'), { code: 'network' });
    }
    const out = await res.json().catch(() => ({ ok: false, error: 'server' }));
    if (!out.ok) throw Object.assign(new Error(out.error), { code: out.error });
    return out;
  }

  async function signup(fields) {
    const out = await call('POST', '/auth/signup', { ...fields, lang: EDLang.current });
    save(out.token, out.user);
    return out.user;
  }

  async function login(email, password) {
    const out = await call('POST', '/auth/login', { email, password });
    save(out.token, out.user);
    return out.user;
  }

  /* Signing out always works here, even if the server cannot be told. */
  async function logout() {
    try { await call('POST', '/auth/logout', {}); } catch { /* the token just expires */ }
    forget();
  }

  const forgot = (email) => call('POST', '/auth/forgot', { email, lang: EDLang.current });
  const reset = (resetToken, password) => call('POST', '/auth/reset', { token: resetToken, password });

  async function setPlan(next) {
    const out = await call('POST', '/me/plan', { plan: next });
    save(null, out.user);
    return out.user;
  }

  async function deleteAccount(password) {
    await call('DELETE', '/me', { password });
    forget();
  }

  /* Corrects the stored copy. Resolves true when the plan on this device changed.
     Only a clear "this session is over" signs anyone out; no signal never does. */
  async function refresh() {
    if (!token()) return false;
    const before = plan();
    try {
      save(null, (await call('GET', '/me')).user);
    } catch (err) {
      if (err.code === 'signed_out') forget();
    }
    return plan() !== before;
  }

  return { user, plan, canPlay, markEntered, hasEntered, signup, login, logout, forgot, reset, setPlan, deleteAccount, refresh };
})();
