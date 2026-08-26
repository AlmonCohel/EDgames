/* מכירים את המקלדת / Meet the Keyboard — find a key on a real keyboard.

   The game asks for one key at a time and waits for the child to press it on
   the keyboard in front of them. An on-screen keyboard mirrors the real one so
   the eye has somewhere to search; it is also clickable, so a tablet without a
   keyboard still gets a game rather than a dead end.

   Keys are matched on event.code, not on the character produced, so a Hebrew
   layout answers the same as an English one — the letter printed on the key cap
   is what the child is looking for either way. */

(function () {
  /* The rows of a keyboard, by code. Caps for letters and digits are derived,
     so only the named keys need spelling out. */
  const ROWS = [
    ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'],
    ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
    ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Backspace'],
    ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Enter'],
    ['Space'],
  ];

  const ARROWS = ['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'];

  /* The named keys. `he` / `en` are how the key is spoken; where they are
     missing the ask falls back to the cap, wrapped LTR so a Latin key name
     keeps its direction inside a Hebrew sentence. */
  const NAMED = {
    Space:      { cap: '⎵', wide: 'space', he: 'מקש הרווח',   en: 'the space bar' },
    Enter:      { cap: '↵', wide: 'big',   he: 'מקש אנטר',    en: 'the Enter key' },
    Backspace:  { cap: '⌫', wide: 'big',   he: 'מקש המחיקה',  en: 'the backspace key' },
    ShiftLeft:  { cap: '⇧', wide: 'big',   he: 'מקש השיפט',   en: 'the Shift key' },
    ArrowLeft:  { cap: '←', he: 'החץ שמאלה', en: 'the left arrow key' },
    ArrowRight: { cap: '→', he: 'החץ ימינה',  en: 'the right arrow key' },
    ArrowUp:    { cap: '↑', he: 'החץ למעלה',  en: 'the up arrow key' },
    ArrowDown:  { cap: '↓', he: 'החץ למטה',   en: 'the down arrow key' },
  };

  const capOf = (code) => {
    if (NAMED[code]) return NAMED[code].cap;
    if (code.startsWith('Key')) return code.slice(3);
    return code.slice(5); /* DigitN */
  };

  const ltr = (s) => `<span class="kk-lit" dir="ltr">${s}</span>`;

  /* Hebrew names the key inside the phrase ("על מקש הרווח"), English hangs it
     off "Press" — one line per language rather than a shared frame. */
  const TEXT = {
    he: {
      step:     (n, of) => `שלב ${n} מתוך ${of}`,
      ask:      (code) => (NAMED[code]?.he ? `לחצו על ${NAMED[code].he}` : `לחצו על המקש ${ltr(capOf(code))}`),
      keyLabel: (code) => (NAMED[code]?.he || `המקש ${capOf(code)}`),
      hint:     'הנה הוא, מסומן במקלדת שלמטה',
      lead:     'מחפשים את המקש על המקלדת ולוחצים עליו',
      wellDone: 'כל הכבוד!',
      foundAll: 'מצאתם את כל המקשים!',
      again:    'עוד פעם ⌨️',
      exit:     'למשחק אחר',
    },
    en: {
      step:     (n, of) => `Step ${n} of ${of}`,
      ask:      (code) => (NAMED[code]?.en ? `Press ${NAMED[code].en}` : `Press the ${ltr(capOf(code))} key`),
      keyLabel: (code) => (NAMED[code]?.en || `the ${capOf(code)} key`),
      hint:     'Here it is, marked on the keyboard below',
      lead:     'Find the key on the keyboard and press it',
      wellDone: 'Well done!',
      foundAll: 'You found every key!',
      again:    'Again ⌨️',
      exit:     'Another game',
    },
  };

  const ROUNDS = 6;
  const HINT_AFTER = 7000;

  /* Three runs, one part of the keyboard each. A run used to be a handful of
     letters, digits and specials mixed together, so a second go looked like
     the first with different letters; a child hunting for letters is doing a
     different job from one hunting for the space bar, and the sets say so. */
  const SETS = [
    { id: 'letters', emoji: '🔤', label: { he: 'אותיות', en: 'Letters' },       pool: 'letters' },
    { id: 'numbers', emoji: '🔢', label: { he: 'מספרים', en: 'Numbers' },       pool: 'digits' },
    { id: 'special', emoji: '⌨️', label: { he: 'מקשים מיוחדים', en: 'Special keys' }, pool: 'specials' },
  ];

  const CSS = `
    .kk { display: flex; flex-direction: column; align-items: center; gap: 22px; padding: 8px 0 20px; width: 100%; }
    .kk-progress { display: flex; gap: 9px; }
    .kk-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .kk-dot.done { background: var(--pos); }
    .kk-ask { text-align: center; }
    .kk-ask h2 { margin: 0 0 6px; font-size: 1.5rem; }
    .kk-lit { display: inline-block; font-family: "Rubik", system-ui, sans-serif; color: var(--accent-ink); }
    .kk-lead { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }
    /* The board is a picture of a physical keyboard, so it stays LTR in both
       languages — a mirrored QWERTY would be a picture of nothing. */
    .kk-board { direction: ltr; display: flex; flex-direction: column; align-items: center; gap: 7px; width: 100%; }
    .kk-row { display: flex; gap: 7px; justify-content: center; width: 100%; }
    .kk-key {
      font: inherit; font-weight: 700; font-family: "Rubik", system-ui, sans-serif;
      width: clamp(30px, 7.2vw, 54px); height: clamp(38px, 8vw, 54px);
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--bg-raise); color: var(--text);
      border: 1.5px solid var(--border); border-radius: 11px;
      box-shadow: 0 3px 0 rgba(24, 74, 46, 0.16);
      cursor: pointer; padding: 0;
      transition: transform 0.08s ease, background 0.15s ease;
    }
    .kk-key[data-wide="big"]   { width: clamp(52px, 12vw, 86px); }
    .kk-key[data-wide="space"] { width: clamp(150px, 44vw, 320px); }
    .kk-key:hover  { background: var(--sub-tint, var(--sel-tint)); }
    .kk-key:active { transform: translateY(2px); box-shadow: none; }
    .kk-key.target { background: var(--sel-tint); color: var(--sel-ink); border-color: var(--accent); animation: kk-pulse 1s ease-in-out infinite; }
    .kk-key.hit    { background: var(--pos); color: #fff; border-color: var(--pos); animation: none; }
    .kk-key.nope   { animation: kk-shake 0.36s ease; }
    .kk-arrows { display: grid; grid-template-columns: repeat(3, auto); gap: 7px; justify-content: center; direction: ltr; }
    .kk-arrows .kk-key[data-code="ArrowUp"]    { grid-column: 2; }
    .kk-arrows .kk-key[data-code="ArrowLeft"]  { grid-column: 1; grid-row: 2; }
    .kk-arrows .kk-key[data-code="ArrowDown"]  { grid-column: 2; grid-row: 2; }
    .kk-arrows .kk-key[data-code="ArrowRight"] { grid-column: 3; grid-row: 2; }
    @keyframes kk-pulse { 50% { transform: translateY(-3px); } }
    @keyframes kk-shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
    .kk-end { text-align: center; margin: auto; }
    .kk-end .kk-stars { font-size: 46px; letter-spacing: 4px; }
    .kk-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .kk-end p { color: var(--text-soft); margin: 0 0 22px; }
    .kk-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .kk-row, .kk-board { gap: 5px; }
      .kk-key { border-radius: 9px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .kk-key.target { animation: none; outline: 3px solid var(--accent-strong); outline-offset: 2px; }
      .kk-key.nope { animation: none; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  const pick = (codes, n) => shuffle(codes).slice(0, n);

  /* The right Shift answers a left-Shift ask, and a numeric-keypad Enter is
     still Enter — the child pressed the key the picture shows. */
  function normalize(code) {
    if (code === 'ShiftRight') return 'ShiftLeft';
    if (code === 'NumpadEnter') return 'Enter';
    return code;
  }

  let timers = [];
  let onKeyDown = null;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  function mount(root, ctx) {
    const text = TEXT[ctx.lang] || TEXT.he;
    const set = ctx.set || SETS[0];

    if (!document.getElementById('kk-style')) {
      const style = document.createElement('style');
      style.id = 'kk-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    const POOLS = {
      letters: ROWS.flat().filter((c) => c.startsWith('Key')),
      digits: ROWS[0],
      specials: [...Object.keys(NAMED).filter((c) => !c.startsWith('Arrow')), ...ARROWS],
    };

    let targets = [];
    let round = 0;
    let locked = false;
    let finished = false;
    let hintTimer = null;

    const wrap = document.createElement('div');
    wrap.className = 'kk';
    root.append(wrap);

    function keyButton(code) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'kk-key';
      b.dataset.code = code;
      if (NAMED[code]?.wide) b.dataset.wide = NAMED[code].wide;
      b.textContent = capOf(code);
      b.setAttribute('aria-label', text.keyLabel(code));
      /* Out of the tab order on purpose: the real keyboard is this game's
         input, and a focused key cap would swallow the Space and Enter the
         child is being asked to press. */
      b.tabIndex = -1;
      b.addEventListener('click', () => press(code));
      return b;
    }

    function buildShell() {
      wrap.innerHTML = `
        <div class="kk-progress" role="img" aria-label="${text.step(1, ROUNDS)}"></div>
        <div class="kk-ask">
          <h2 aria-live="polite"></h2>
          <p class="kk-lead"></p>
        </div>
        <div class="kk-board"></div>`;

      const board = wrap.querySelector('.kk-board');
      ROWS.forEach((row) => {
        const r = document.createElement('div');
        r.className = 'kk-row';
        row.forEach((code) => r.append(keyButton(code)));
        board.append(r);
      });

      const arrows = document.createElement('div');
      arrows.className = 'kk-arrows';
      ARROWS.forEach((code) => arrows.append(keyButton(code)));
      board.append(arrows);
    }

    const keyEl = (code) => wrap.querySelector(`.kk-key[data-code="${code}"]`);

    function nextRound() {
      if (round >= ROUNDS) return finish();

      locked = false;
      const target = targets[round];

      wrap.querySelectorAll('.kk-key').forEach((k) => k.classList.remove('hit', 'target', 'nope'));
      wrap.querySelector('.kk-progress').innerHTML =
        Array.from({ length: ROUNDS }, (_, i) => `<span class="kk-dot ${i < round ? 'done' : ''}"></span>`).join('');
      wrap.querySelector('.kk-progress').setAttribute('aria-label', text.step(round + 1, ROUNDS));
      wrap.querySelector('.kk-ask h2').innerHTML = text.ask(target);
      wrap.querySelector('.kk-lead').textContent = text.lead;

      /* A child who cannot find the key is not left hunting: after a few
         seconds, or after one wrong press, the key lights up on the picture. */
      clearTimeout(hintTimer);
      hintTimer = later(showHint, HINT_AFTER);
    }

    function showHint() {
      if (locked || finished) return;
      keyEl(targets[round])?.classList.add('target');
      wrap.querySelector('.kk-lead').textContent = text.hint;
    }

    function press(code) {
      if (locked || finished) return;
      const el = keyEl(code);
      if (!el) return;

      if (code !== targets[round]) {
        /* A wrong key costs nothing — it shows where the right one is. */
        el.classList.remove('nope');
        void el.offsetWidth;
        el.classList.add('nope');
        showHint();
        return;
      }

      locked = true;
      clearTimeout(hintTimer);
      el.classList.remove('target');
      el.classList.add('hit');
      round += 1;
      later(nextRound, 480);
    }

    function finish() {
      finished = true;
      wrap.innerHTML = `
        <div class="kk-end">
          <div class="kk-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.foundAll}</p>
          <div class="kk-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    function start() {
      targets = pick(POOLS[set.pool], ROUNDS);
      round = 0;
      finished = false;
      buildShell();
      nextRound();
    }

    /* Space scrolls the page and Backspace can walk the history back, so every
       key the game knows about is swallowed while a round is running. */
    onKeyDown = (e) => {
      if (finished || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const code = normalize(e.code);
      if (!keyEl(code)) return;
      e.preventDefault();
      press(code);
    };
    window.addEventListener('keydown', onKeyDown);

    start();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
    if (onKeyDown) window.removeEventListener('keydown', onKeyDown);
    onKeyDown = null;
  }

  EDGames.register('keyboard-keys', { sets: SETS, mount, unmount });
})();
