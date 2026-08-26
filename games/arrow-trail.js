/* בדרך הביתה / The Way Home — the arrow keys as a direction, not a place.

   Meet the Keyboard teaches where a key is. This one teaches what a key does:
   one press moves the animal one square, and a path is a sentence of presses.
   That is the skill every other program then borrows — a list, a menu, a form.

   The garden is a coordinate space rather than a piece of text, so it is pinned
   to LTR in both languages: the left arrow has to move the animal left, and a
   mirrored board would teach the opposite. All the reading happens above it,
   where direction still matters.

   An on-screen arrow pad mirrors the real keys, so a tablet with no keyboard
   gets a game rather than a dead end — the same bargain Meet the Keyboard
   makes. */

(function () {
  /* The name is what a screen reader is given, because "חץ ←" reads as nothing;
     the cap is what is printed on the pad button. */
  const DIRS = {
    ArrowLeft:  { dx: -1, dy: 0, cap: '←', he: 'חץ שמאלה', en: 'left arrow' },
    ArrowUp:    { dx: 0, dy: -1, cap: '↑', he: 'חץ למעלה', en: 'up arrow' },
    ArrowDown:  { dx: 0, dy: 1,  cap: '↓', he: 'חץ למטה',  en: 'down arrow' },
    ArrowRight: { dx: 1, dy: 0,  cap: '→', he: 'חץ ימינה', en: 'right arrow' },
  };

  const PAD = ['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'];

  const HOME = '🏠';
  const WALL = '🌳';

  /* Hebrew glues the article to the animal ("את הצב"), English keeps it loose,
     so the ask is one line per language rather than a shared frame. */
  const TEXT = {
    he: {
      step:     (n, of) => `שלב ${n} מתוך ${of}`,
      goHome:   (animal) => `מובילים את ה${animal} אל הבית`,
      collect:  'אוספים מה שבדרך, ואז הולכים הביתה',
      lead:     'לוחצים על מקשי החצים במקלדת',
      hint:     'החץ שמאיר הוא הכיוון הנכון',
      blocked:  'שם יש עץ — אפשר ללכת מסביב',
      edge:     'זה כבר הקצה של הגינה',
      notYet:   'קודם אוספים את מה שנשאר בדרך',
      wellDone: 'כל הכבוד!',
      allHome:  'הגעתם הביתה בכל הדרכים!',
      again:    'עוד פעם 🐢',
      exit:     'למשחק אחר',
    },
    en: {
      step:     (n, of) => `Step ${n} of ${of}`,
      goHome:   (animal) => `Take the ${animal} home`,
      collect:  'Pick up what is on the way, then go home',
      lead:     'Press the arrow keys on the keyboard',
      hint:     'The arrow that lights up is the way to go',
      blocked:  'There is a tree there — you can go around it',
      edge:     'That is the edge of the garden',
      notYet:   'Pick up what is still on the way first',
      wellDone: 'Well done!',
      allHome:  'You found your way home every time!',
      again:    'Again 🐢',
      exit:     'Another game',
    },
  };

  /* Three runs, and each is a different lesson rather than the same garden with
     the trees moved: one arrow at a time, then paths that only work if you turn,
     then a detour you have to plan before you walk it.

     A level is drawn as rows of characters — S is where the animal starts, H is
     home, # is a tree and * is something to pick up on the way. Written this way
     a level is read at a glance, which is what stops a broken one being added. */
  const SETS = [
    {
      id: 'straight', emoji: '➡️',
      label: { he: 'קו ישר', en: 'Straight lines' },
      animal: { sprite: '🐢', he: 'צב', en: 'turtle' },
      treat: '🍓',
      levels: [
        ['.....',
         'S...H',
         '.....',
         '.....'],
        ['..H..',
         '.....',
         '.....',
         '..S..'],
        ['.....',
         '.....',
         'H...S',
         '.....'],
        ['...S.',
         '.....',
         '.....',
         '...H.'],
      ],
    },
    {
      id: 'turns', emoji: '🌳',
      label: { he: 'פניות', en: 'Turns' },
      animal: { sprite: '🐰', he: 'ארנב', en: 'rabbit' },
      treat: '🥕',
      levels: [
        ['S.#..',
         '..#..',
         '..#..',
         '....H'],
        ['..H..',
         '.###.',
         '.....',
         'S....'],
        ['S.#..',
         '..#.H',
         '..#..',
         '.....'],
        ['....S',
         '.##..',
         '..#..',
         'H.#..'],
      ],
    },
    {
      id: 'treats', emoji: '🌰',
      label: { he: 'אוספים בדרך', en: 'Pick things up' },
      animal: { sprite: '🐿️', he: 'סנאי', en: 'squirrel' },
      treat: '🌰',
      levels: [
        ['.....',
         'S.*.H',
         '.....',
         '.....'],
        ['*...H',
         '.....',
         '..S..',
         '*....'],
        ['*.#..',
         '..#..',
         'S...H',
         '..#.*'],
        ['....*',
         '.###.',
         'S...H',
         '*....'],
      ],
    },
  ];

  const HINT_AFTER = 8000;

  const CSS = `
    .at { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 8px 0 20px; width: 100%; }
    .at-progress { display: flex; gap: 9px; }
    .at-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .at-dot.done { background: var(--pos); }
    .at-ask { text-align: center; }
    .at-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .at-lead { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }
    /* The garden is a map, not a sentence: left is left in both languages. */
    .at-board { direction: ltr; display: grid; gap: 7px; }
    .at-cell {
      width: var(--at-cell); height: var(--at-cell);
      display: grid; place-items: center;
      font-size: calc(var(--at-cell) * 0.62); line-height: 1;
      background: var(--bg-raise);
      border: 1.5px solid var(--border); border-radius: 13px;
    }
    .at-cell.wall { background: var(--sub-tint, var(--sel-tint)); border-style: dashed; }
    .at-cell.home { border-color: var(--accent); background: var(--sel-tint); }
    .at-cell.here { animation: at-hop 0.26s ease; }
    .at-cell.nope { animation: at-shake 0.36s ease; }
    .at-pad { display: grid; grid-template-columns: repeat(3, auto); gap: 7px; justify-content: center; direction: ltr; }
    .at-key {
      font: inherit; font-weight: 700; font-family: "Rubik", system-ui, sans-serif;
      width: clamp(46px, 12vw, 58px); height: clamp(46px, 12vw, 58px);
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--bg-raise); color: var(--text);
      border: 1.5px solid var(--border); border-radius: 13px;
      box-shadow: 0 3px 0 rgba(24, 74, 46, 0.16);
      cursor: pointer; padding: 0;
      transition: transform 0.08s ease, background 0.15s ease;
    }
    .at-key:hover  { background: var(--sub-tint, var(--sel-tint)); }
    .at-key:active { transform: translateY(2px); box-shadow: none; }
    .at-key.target { background: var(--sel-tint); color: var(--sel-ink); border-color: var(--accent); animation: at-pulse 1s ease-in-out infinite; }
    .at-key[data-code="ArrowUp"]    { grid-column: 2; }
    .at-key[data-code="ArrowLeft"]  { grid-column: 1; grid-row: 2; }
    .at-key[data-code="ArrowDown"]  { grid-column: 2; grid-row: 2; }
    .at-key[data-code="ArrowRight"] { grid-column: 3; grid-row: 2; }
    @keyframes at-hop   { 45% { transform: translateY(-8px); } }
    @keyframes at-pulse { 50% { transform: translateY(-3px); } }
    @keyframes at-shake { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
    .at-end { text-align: center; margin: auto; }
    .at-end .at-stars { font-size: 46px; letter-spacing: 4px; }
    .at-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .at-end p { color: var(--text-soft); margin: 0 0 22px; }
    .at-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .at-board { gap: 5px; }
      .at-cell { border-radius: 10px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .at-key.target { animation: none; outline: 3px solid var(--accent-strong); outline-offset: 2px; }
    }
  `;

  /* A level as drawn turns into the only three things the game asks about:
     where everything is, and what is walkable. */
  function parse(rows) {
    const level = { cols: rows[0].length, rows: rows.length, walls: new Set(), treats: [], start: null, home: null };
    rows.forEach((line, y) => {
      [...line].forEach((ch, x) => {
        if (ch === '#') level.walls.add(`${x},${y}`);
        else if (ch === 'S') level.start = { x, y };
        else if (ch === 'H') level.home = { x, y };
        else if (ch === '*') level.treats.push({ x, y });
      });
    });
    return level;
  }

  const same = (a, b) => a.x === b.x && a.y === b.y;

  const inside = (level, p) => p.x >= 0 && p.y >= 0 && p.x < level.cols && p.y < level.rows;

  const open = (level, p) => inside(level, p) && !level.walls.has(`${p.x},${p.y}`);

  /* Which arrow gets you closer, walked breadth-first so a tree in the way is
     answered with the way around it rather than the way into it. Each frontier
     entry remembers the arrow it started with, and the first one to reach the
     goal is the one to light up. */
  function stepToward(level, from, goal) {
    const key = (p) => `${p.x},${p.y}`;
    const seen = new Set([key(from)]);
    let edge = [];

    Object.entries(DIRS).forEach(([code, d]) => {
      const at = { x: from.x + d.dx, y: from.y + d.dy };
      if (!open(level, at) || seen.has(key(at))) return;
      seen.add(key(at));
      edge.push({ code, at });
    });

    while (edge.length) {
      const next = [];
      for (const node of edge) {
        if (same(node.at, goal)) return node.code;
        for (const d of Object.values(DIRS)) {
          const at = { x: node.at.x + d.dx, y: node.at.y + d.dy };
          if (!open(level, at) || seen.has(key(at))) continue;
          seen.add(key(at));
          next.push({ code: node.code, at });
        }
      }
      edge = next;
    }
    return null;
  }

  let timers = [];
  let onKeyDown = null;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  function mount(root, ctx) {
    const text = TEXT[ctx.lang] || TEXT.he;
    const set = ctx.set || SETS[0];
    const LEVELS = set.levels;
    const animalName = set.animal[ctx.lang] || set.animal.he;

    if (!document.getElementById('at-style')) {
      const style = document.createElement('style');
      style.id = 'at-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let index = 0;
    let level = null;
    let at = null;
    let left = [];
    let locked = false;
    let finished = false;
    let hintTimer = null;

    const wrap = document.createElement('div');
    wrap.className = 'at';
    root.append(wrap);

    const cellEl = (x, y) => wrap.querySelector(`.at-cell[data-at="${x},${y}"]`);
    const padEl = (code) => wrap.querySelector(`.at-key[data-code="${code}"]`);
    const lead = (line) => { wrap.querySelector('.at-lead').textContent = line; };

    function padButton(code) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'at-key';
      b.dataset.code = code;
      b.textContent = DIRS[code].cap;
      b.setAttribute('aria-label', DIRS[code][ctx.lang] || DIRS[code].he);
      /* Out of the tab order on purpose: the real arrow keys are this game's
         input, and a focused pad button would swallow them. */
      b.tabIndex = -1;
      b.addEventListener('click', () => go(code));
      return b;
    }

    function buildShell() {
      wrap.innerHTML = `
        <div class="at-progress" role="img" aria-label="${text.step(index + 1, LEVELS.length)}"></div>
        <div class="at-ask">
          <h2 aria-live="polite"></h2>
          <p class="at-lead"></p>
        </div>
        <div class="at-board"></div>
        <div class="at-pad"></div>`;

      const pad = wrap.querySelector('.at-pad');
      PAD.forEach((code) => pad.append(padButton(code)));
    }

    function buildBoard() {
      const board = wrap.querySelector('.at-board');
      /* The cell shrinks as the garden widens, so a four-wide and a five-wide
         level both sit inside the stage on a phone. 70vw of viewport shared out
         between the columns leaves room for the page and stage padding either
         side, which together take about 80px on the narrowest phone. */
      board.style.setProperty('--at-cell', `clamp(40px, ${Math.floor(70 / level.cols)}vw, 76px)`);
      board.style.gridTemplateColumns = `repeat(${level.cols}, var(--at-cell))`;
      /* The board is a picture of where things are; the ask above it is what a
         screen reader is given, the same bargain Meet the Keyboard makes with
         its key caps. */
      board.setAttribute('aria-hidden', 'true');
      board.replaceChildren(...Array.from({ length: level.cols * level.rows }, (_, i) => {
        const c = document.createElement('div');
        c.className = 'at-cell';
        c.dataset.at = `${i % level.cols},${Math.floor(i / level.cols)}`;
        return c;
      }));
    }

    /* One pass over the garden — small enough that redrawing it beats keeping
       track of what changed. */
    function paint() {
      for (let y = 0; y < level.rows; y += 1) {
        for (let x = 0; x < level.cols; x += 1) {
          const c = cellEl(x, y);
          const wall = level.walls.has(`${x},${y}`);
          const home = same({ x, y }, level.home);
          c.classList.remove('here', 'nope');
          c.classList.toggle('wall', wall);
          c.classList.toggle('home', home);
          if (same({ x, y }, at)) c.textContent = set.animal.sprite;
          else if (left.some((t) => same(t, { x, y }))) c.textContent = set.treat;
          else if (home) c.textContent = HOME;
          else if (wall) c.textContent = WALL;
          else c.textContent = '';
        }
      }
      wrap.querySelector('.at-ask h2').textContent = left.length ? text.collect : text.goHome(animalName);
    }

    function armHint() {
      clearTimeout(hintTimer);
      wrap.querySelectorAll('.at-key').forEach((k) => k.classList.remove('target'));
      hintTimer = later(showHint, HINT_AFTER);
    }

    /* A child who cannot see the way out is not left stuck: after a while the
       arrow that helps lights up on the pad. */
    function showHint() {
      if (locked || finished) return;
      const goal = left[0] || level.home;
      const code = stepToward(level, at, goal);
      if (!code) return;
      padEl(code)?.classList.add('target');
      lead(text.hint);
    }

    /* paint() has just cleared the class off every cell, so the reflow is what
       makes the hop play again when the animal walks back onto a square. */
    function hop() {
      const c = cellEl(at.x, at.y);
      void c.offsetWidth;
      c.classList.add('here');
    }

    function refuse(cell, line) {
      lead(line);
      if (!cell) return;
      cell.classList.remove('nope');
      void cell.offsetWidth;
      cell.classList.add('nope');
    }

    function go(code) {
      if (locked || finished) return;
      const d = DIRS[code];
      const next = { x: at.x + d.dx, y: at.y + d.dy };

      if (!inside(level, next)) return refuse(cellEl(at.x, at.y), text.edge);
      if (!open(level, next)) return refuse(cellEl(next.x, next.y), text.blocked);

      at = next;
      left = left.filter((t) => !same(t, at));

      /* Home only opens once the garden is empty — otherwise the shortest path
         quietly skips the part the run is about. */
      if (same(at, level.home) && left.length === 0) {
        paint();
        hop();
        locked = true;
        clearTimeout(hintTimer);
        index += 1;
        return later(nextLevel, 520);
      }

      paint();
      hop();
      lead(same(at, level.home) ? text.notYet : text.lead);
      armHint();
    }

    function nextLevel() {
      if (index >= LEVELS.length) return finish();

      locked = false;
      level = parse(LEVELS[index]);
      at = { ...level.start };
      left = level.treats.map((t) => ({ ...t }));

      wrap.querySelector('.at-progress').innerHTML =
        Array.from({ length: LEVELS.length }, (_, i) => `<span class="at-dot ${i < index ? 'done' : ''}"></span>`).join('');
      wrap.querySelector('.at-progress').setAttribute('aria-label', text.step(index + 1, LEVELS.length));

      buildBoard();
      paint();
      lead(text.lead);
      armHint();
    }

    function finish() {
      finished = true;
      wrap.innerHTML = `
        <div class="at-end">
          <div class="at-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.allHome}</p>
          <div class="at-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    /* The arrow keys scroll the page, which would move the garden out from under
       the child pressing them, so they are swallowed while a level is running. */
    onKeyDown = (e) => {
      if (finished || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!DIRS[e.code]) return;
      e.preventDefault();
      go(e.code);
    };
    window.addEventListener('keydown', onKeyDown);

    buildShell();
    nextLevel();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
    if (onKeyDown) window.removeEventListener('keydown', onKeyDown);
    onKeyDown = null;
  }

  EDGames.register('arrow-trail', { sets: SETS, mount, unmount });
})();
