/* מוצאים צורה / Find the Shape — fitting each shape into the hole it belongs in.

   Dragging is the obvious way to do this and the wrong one for the audience: a
   four-year-old on a tablet loses the piece halfway. So it is two taps — pick a
   shape from the tray, then tap a hole — and the tray always has one shape
   picked already, which makes the common case a single tap.

   Every piece is the same colour on purpose. Colour would let a child match
   without looking at the outline, and the outline is the whole lesson. */

(function () {
  /* Ratios rather than pixel sizes: one --sm-size drives the board and the tray,
     and a rectangle stays a rectangle at any of them. */
  const SHAPES = [
    { id: 'circle',   w: 1,    h: 1,    he: 'עיגול',  en: 'circle' },
    { id: 'square',   w: 1,    h: 1,    he: 'ריבוע',  en: 'square' },
    { id: 'triangle', w: 1.1,  h: 1,    he: 'משולש',  en: 'triangle' },
    { id: 'rect',     w: 1.45, h: 0.8,  he: 'מלבן',   en: 'rectangle' },
    { id: 'star',     w: 1.15, h: 1.1,  he: 'כוכב',   en: 'star' },
    { id: 'diamond',  w: 1,    h: 1.15, he: 'מעוין',  en: 'diamond' },
    { id: 'cross',    w: 1,    h: 1,    he: 'פלוס',   en: 'cross' },
    { id: 'oval',     w: 1.4,  h: 0.9,  he: 'אליפסה', en: 'oval' },
  ];

  /* The big/small run only ever uses circle, square and triangle — all
     masculine in Hebrew — so one form of each adjective is enough. */
  const SIZES = {
    m: { px: 88 },
    s: { px: 58, he: 'קטן',  en: 'small' },
    l: { px: 104, he: 'גדול', en: 'big' },
  };

  /* Three runs: the shapes every child meets first, then the ones that come
     after them, then a board where the shape is not enough and the size decides
     which hole a piece goes in. */
  const SETS = [
    {
      id: 'first', emoji: '⭕',
      label: { he: 'צורות ראשונות', en: 'First shapes' },
      shapes: ['circle', 'square', 'triangle'], sizes: ['m'], holes: 3, boards: 3,
    },
    {
      id: 'more', emoji: '⭐',
      label: { he: 'עוד צורות', en: 'More shapes' },
      shapes: ['rect', 'star', 'diamond', 'cross', 'oval'], sizes: ['m'], holes: 4, boards: 3,
    },
    {
      id: 'sizes', emoji: '🔍',
      label: { he: 'גדול וקטן', en: 'Big and small' },
      shapes: ['circle', 'square', 'triangle'], sizes: ['s', 'l'], holes: 6, boards: 2,
    },
  ];

  /* Hebrew puts the adjective after the noun and repeats the article on it
     ("העיגול הגדול"), English puts it in front of one — so the definite form is
     built per language rather than glued together from a shared frame. */
  const TEXT = {
    he: {
      step:     (n, of) => `לוח ${n} מתוך ${of}`,
      ask:      (def) => `איפה מתאים ${def}?`,
      lead:     'בוחרים צורה ולוחצים על החור שמתאים לה',
      notHere:  'החור הזה לא מתאים, ננסה אחר',
      tray:     'הצורות שלנו',
      wellDone: 'כל הכבוד!',
      filledAll: 'מילאתם את כל הלוחות!',
      again:    'עוד פעם 🔺',
      exit:     'למשחק אחר',
      def:      (shape, adj) => (adj ? `ה${shape} ה${adj}` : `ה${shape}`),
      indef:    (shape, adj) => (adj ? `${shape} ${adj}` : shape),
      hole:     (name) => `חור בצורת ${name}`,
    },
    en: {
      step:     (n, of) => `Board ${n} of ${of}`,
      ask:      (def) => `Where does ${def} go?`,
      lead:     'Pick a shape and tap the hole that fits it',
      notHere:  'Not that hole — try another one',
      tray:     'Our shapes',
      wellDone: 'Well done!',
      filledAll: 'You filled every board!',
      again:    'Again 🔺',
      exit:     'Another game',
      def:      (shape, adj) => (adj ? `the ${adj} ${shape}` : `the ${shape}`),
      indef:    (shape, adj) => (adj ? `${adj} ${shape}` : shape),
      hole:     (name) => `${name} hole`,
    },
  };

  const CSS = `
    .sm { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .sm-progress { display: flex; gap: 9px; }
    .sm-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .sm-dot.done { background: var(--pos); }
    .sm-ask { text-align: center; }
    .sm-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .sm-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }

    .sm-board {
      display: flex; flex-wrap: wrap; justify-content: center; align-items: center;
      gap: 16px; padding: 22px; width: 100%; max-width: 660px; min-height: 230px;
      background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius);
    }
    .sm-hole, .sm-piece {
      display: grid; place-items: center;
      background: none; border: none; padding: 6px; margin: 0; cursor: pointer;
      border-radius: var(--radius-sm);
      transition: transform 0.12s ease;
    }
    .sm-hole:hover, .sm-piece:hover { transform: translateY(-3px); }
    .sm-hole[disabled] { cursor: default; }
    .sm-hole[disabled]:hover { transform: none; }
    .sm-hole.nope { animation: sm-shake 0.36s ease; }
    @keyframes sm-shake { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }

    .sm-shape { width: var(--sm-w); height: var(--sm-h); background: rgba(20, 51, 31, 0.13); }
    .sm-shape.solid { background: var(--sub-ink, var(--accent-strong)); }
    .sm-shape.set { animation: sm-drop 0.3s ease; }
    @keyframes sm-drop { from { transform: scale(1.35); opacity: 0.4; } }

    .sm-circle   { border-radius: 50%; }
    .sm-oval     { border-radius: 50%; }
    .sm-square   { border-radius: 8px; }
    .sm-rect     { border-radius: 8px; }
    .sm-triangle { clip-path: polygon(50% 2%, 100% 100%, 0 100%); }
    .sm-diamond  { clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
    .sm-star     { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
    .sm-cross    { clip-path: polygon(34% 0, 66% 0, 66% 34%, 100% 34%, 100% 66%, 66% 66%, 66% 100%, 34% 100%, 34% 66%, 0 66%, 0 34%, 34% 34%); }

    .sm-tray-label { color: var(--text-soft); font-size: 0.95rem; margin: 0; }
    .sm-tray { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; min-height: 96px; align-items: center; }
    .sm-piece[aria-pressed="true"] { background: var(--sub-tint, var(--sel-tint)); box-shadow: inset 0 0 0 2px var(--sub-ink, var(--sel-ink)); }
    .sm-piece.gone { visibility: hidden; }

    .sm-end { text-align: center; margin: auto; }
    .sm-end .sm-stars { font-size: 46px; letter-spacing: 4px; }
    .sm-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .sm-end p { color: var(--text-soft); margin: 0 0 22px; }
    .sm-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    @media (max-width: 560px) {
      .sm-board { padding: 14px; gap: 10px; min-height: 190px; }
      .sm-hole, .sm-piece { padding: 3px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .sm-shape.set { animation: none; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const shapeById = (id) => SHAPES.find((s) => s.id === id);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];

    if (!document.getElementById('sm-style')) {
      const style = document.createElement('style');
      style.id = 'sm-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    /* Every shape/size combination the set allows. A board is a handful of them
       and a piece is matched to its hole by that key. */
    const deck = set.shapes.flatMap((shape) => set.sizes.map((size) => ({ shape, size, key: `${shape}-${size}` })));

    let board = 0;
    let pieces = [];
    let selected = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'sm';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.sm-hint').textContent = line; };

    function nameOf(piece, definite) {
      const shape = shapeById(piece.shape);
      const size = SIZES[piece.size];
      const adj = size.he ? (size[lang] || size.he) : '';
      return text[definite ? 'def' : 'indef'](shape[lang] || shape.he, adj);
    }

    function shapeEl(piece, solid) {
      const shape = shapeById(piece.shape);
      const px = SIZES[piece.size].px;
      const el = document.createElement('div');
      el.className = `sm-shape sm-${piece.shape}${solid ? ' solid' : ''}`;
      el.style.setProperty('--sm-w', `${Math.round(px * shape.w)}px`);
      el.style.setProperty('--sm-h', `${Math.round(px * shape.h)}px`);
      return el;
    }

    /* The tray always has something picked, so a child who does not understand
       "pick one first" can still just tap a hole and get somewhere. */
    function selectFirstLeft() {
      const next = pieces.findIndex((p) => !p.placed);
      if (next !== -1) select(next);
    }

    function select(i) {
      selected = i;
      pieces.forEach((p, n) => p.chip.setAttribute('aria-pressed', String(n === i)));
      wrap.querySelector('.sm-ask h2').textContent = text.ask(nameOf(pieces[i], true));
    }

    function nextBoard() {
      if (board >= set.boards) return finish();

      locked = false;
      pieces = shuffle(deck).slice(0, Math.min(set.holes, deck.length))
        .map((p) => ({ ...p, placed: false }));

      wrap.innerHTML = `
        <div class="sm-progress" role="img" aria-label="${text.step(board + 1, set.boards)}">
          ${Array.from({ length: set.boards }, (_, i) => `<span class="sm-dot ${i < board ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="sm-ask">
          <h2 aria-live="polite"></h2>
          <p class="sm-hint">${text.lead}</p>
        </div>
        <div class="sm-board"></div>
        <p class="sm-tray-label">${text.tray}</p>
        <div class="sm-tray"></div>`;

      const boardEl = wrap.querySelector('.sm-board');
      shuffle(pieces).forEach((piece) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'sm-hole';
        b.dataset.key = piece.key;
        b.setAttribute('aria-label', text.hole(nameOf(piece, false)));
        b.append(shapeEl(piece, false));
        b.addEventListener('click', () => drop(b, piece.key));
        boardEl.append(b);
      });

      const tray = wrap.querySelector('.sm-tray');
      pieces.forEach((piece, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'sm-piece';
        b.setAttribute('aria-pressed', 'false');
        b.setAttribute('aria-label', nameOf(piece, false));
        b.append(shapeEl(piece, true));
        b.addEventListener('click', () => { if (!piece.placed) select(i); });
        piece.chip = b;
        tray.append(b);
      });

      select(0);
    }

    function drop(hole, key) {
      if (locked) return;
      const piece = pieces[selected];

      if (piece.key !== key) {
        /* A hole that does not fit costs nothing — it wobbles, the piece stays
           in hand, and the child tries the next one. */
        hole.classList.remove('nope');
        void hole.offsetWidth;
        hole.classList.add('nope');
        hint(text.notHere);
        return;
      }

      piece.placed = true;
      piece.chip.classList.add('gone');
      piece.chip.disabled = true;
      piece.chip.setAttribute('aria-pressed', 'false');

      hole.disabled = true;
      hole.replaceChildren(shapeEl(piece, true));
      hole.firstChild.classList.add('set');
      hint('');

      if (pieces.some((p) => !p.placed)) return selectFirstLeft();

      locked = true;
      board += 1;
      later(nextBoard, 620);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="sm-end">
          <div class="sm-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.filledAll}</p>
          <div class="sm-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    nextBoard();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  EDGames.register('shape-match', { sets: SETS, mount, unmount });
})();
