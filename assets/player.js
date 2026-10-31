/* The game layer — why going back no longer loses a game.

   A game used to be a page of its own: going back to the home screen threw it
   away, and opening it again started it from the first round. A child presses
   "back" by mistake all the time. So a game opened from the home screen now
   runs in a frame laid over it, and "back" — the game's own button, the
   browser's, a phone's back gesture — only hides the frame. Open the same game
   again and it is the same frame, exactly where it was left.

   - A few games stay alive at once (MAX); the one left longest ago goes first.
   - A hidden game is paused (game.html holds its timers and silences it, see
     EDPause there), so nothing carries on playing behind the home screen.
   - Opening a game pushes one history entry (#play=<id>), so the browser's back
     closes the layer instead of leaving the site, and a reload reopens it.
   - The site's tune keeps playing across, unless the game has its own sounds
     (`sound: true` in the catalog).

   game.html still works on its own — a shared link or a bookmark opens it as a
   plain page, as before. */

const EDPlayer = window.EDPlayer = (() => {
  const MAX = 4;
  const frames = new Map();   // game id -> { frame, used }
  let layer = null;
  let current = null;

  function ensureLayer() {
    if (layer) return layer;
    layer = document.createElement('div');
    layer.className = 'player';
    layer.hidden = true;
    document.body.append(layer);
    return layer;
  }

  const idOf = (href) => {
    try { return new URL(href, location.href).searchParams.get('id'); } catch { return null; }
  };

  const ctl = (entry) => {
    try { return entry.frame.contentWindow.EDPause || null; } catch { return null; }
  };

  function evict() {
    while (frames.size >= MAX) {
      let oldest = null;
      frames.forEach((v, k) => { if (k !== current && (!oldest || v.used < frames.get(oldest).used)) oldest = k; });
      if (!oldest) return;
      frames.get(oldest).frame.remove();
      frames.delete(oldest);
    }
  }

  function show(id, href) {
    ensureLayer();
    let entry = frames.get(id);
    if (!entry) {
      evict();
      const frame = document.createElement('iframe');
      frame.title = EDLang.pick(gameById(id).title);
      /* Clap the Beat asks for the microphone from inside the frame. */
      frame.allow = 'microphone; autoplay';
      frame.src = href;
      frame.addEventListener('load', () => {
        try {
          if (window.EDTheme && frame.contentWindow.EDTheme) {
            frame.contentWindow.EDTheme.set(window.EDTheme.current, false);
          }
          frame.contentWindow.focus();
        } catch { /* fine */ }
      });
      layer.append(frame);
      entry = { frame, used: 0 };
      frames.set(id, entry);
    }
    frames.forEach((v, k) => { v.frame.hidden = k !== id; if (k !== id) { const c = ctl(v); if (c) c.pause(); } });
    entry.used = Date.now();
    current = id;
    layer.hidden = false;
    document.body.classList.add('playing');
    const c = ctl(entry);
    if (c) c.resume();
    /* Keys (the arrow and keyboard games) go to the game, not the page under it. */
    try { entry.frame.contentWindow.focus(); } catch { /* fine */ }
    const game = gameById(id);
    if (window.EDMusic) EDMusic.want(!(game && game.sound));
  }

  function hide() {
    if (!layer || layer.hidden) return;
    const entry = frames.get(current);
    if (entry) { const c = ctl(entry); if (c) c.pause(); }
    layer.hidden = true;
    document.body.classList.remove('playing');
    current = null;
    if (window.EDMusic) EDMusic.want(true);
    /* The game just left is now the one the "carry on" card offers. */
    if (window.EDApp && EDApp.refreshContinue) EDApp.refreshContinue();
  }

  const base = () => location.pathname + location.search;

  function open(href, { push = true } = {}) {
    const id = idOf(href);
    const game = id && gameById(id);
    if (!game) return false;
    if (push) {
      try { history.pushState({ edPlay: id, href }, '', `${base()}#play=${encodeURIComponent(id)}`); }
      catch { /* file:// — the layer still works, the browser's back just leaves */ }
    }
    show(id, href);
    return true;
  }

  function close() {
    if (history.state && history.state.edPlay) history.back();
    else hide();
  }

  window.addEventListener('popstate', (e) => {
    const s = e.state;
    if (s && s.edPlay) show(s.edPlay, s.href);
    else hide();
  });

  /* Every link to a game on the home screen — tiles, the carry-on card, the
     "coming soon" list — opens in the layer. A click with a modifier (new tab)
     is left to the browser. */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="game.html"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open(a.getAttribute('href'));
  });

  /* A reload while a game was open comes back to it. */
  function resumeFromHash() {
    const m = location.hash.match(/^#play=(.+)$/);
    if (!m) return;
    const id = decodeURIComponent(m[1]);
    if (!gameById(id)) return;
    const params = new URLSearchParams({ id });
    EDLang.stamp(params);
    const href = `game.html?${params}`;
    try { history.replaceState(null, '', base()); } catch { /* file:// */ }
    open(href);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resumeFromHash);
  else resumeFromHash();

  return { open, close, get current() { return current; } };
})();
