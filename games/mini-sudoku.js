/* גן הסודוקו / Picture Sudoku — one of each, in every row, column and box.

   A first logic puzzle with no numbers: pictures. Every puzzle is made fresh in
   the browser, and every one can be solved by pure reasoning — the generator
   only removes a picture if the board can still be finished by "this square can
   only be X" steps, never by guessing. So a hint is always honest: it points at
   a square that really has only one possibility.

   Pick a picture and then a square (or drag it there). The row, column and box
   of the square you touch are tinted, so the rule is something the child sees.
   A picture that breaks the rule bounces back and the twin it clashes with
   blinks; a picture that fits the rules but is not the answer says so gently.

   Sets: 3x3 (a first latin square), 4x4 with 2x2 boxes, and a harder 4x4. */

(function () {
  const SETS = [
    { id: 'three', emoji: '3️⃣', label: { he: 'שלוש על שלוש', en: '3 by 3' }, n: 3, box: null, givens: 3 },
    { id: 'four', emoji: '4️⃣', label: { he: 'ארבע על ארבע', en: '4 by 4' }, n: 4, box: [2, 2], givens: 9 },
    { id: 'hard', emoji: '🧠', label: { he: 'ארבע על ארבע - קשה', en: '4 by 4 - harder' }, n: 4, box: [2, 2], givens: 5 },
  ];

  const PIECES = [
    ['🐶', '🐱', '🐸', '🐵'],
    ['🍎', '🍌', '🍇', '🍓'],
    ['🚗', '🚌', '🚲', '✈️'],
  ];

  const TEXT = {
    he: {
      ask: 'בכל שורה, עמודה ותיבה - כל תמונה פעם אחת', hint: 'רמז', clash: 'התמונה הזאת כבר נמצאת באותה שורה, עמודה או תיבה',
      notHere: 'התמונה מתאימה לחוקים, אבל לא למקום הזה. חפשו משבצת שיש בה רק אפשרות אחת', hintMsg: 'במשבצת המסומנת יש רק אפשרות אחת', pick: 'בחרו תמונה ואז משבצת',
    },
    en: {
      ask: 'In every row, column and box - each picture once', hint: 'Hint', clash: 'That picture is already in the same row, column or box',
      notHere: 'It follows the rules, but not for this square. Look for a square with only one choice', hintMsg: 'The marked square has only one choice', pick: 'Pick a picture, then a square',
    },
  };

  const ROUNDS = 3;

  const CSS = `
    .sd { gap: 12px; }
    .sd-board { display: grid; direction: ltr; gap: 0; padding: 8px; border-radius: 22px; background: #5b4a8f; box-shadow: 0 8px 0 #3d3066, 0 16px 24px rgba(40,30,80,.25); }
    .sd-cell { position: relative; width: clamp(62px, 19vw, 86px); aspect-ratio: 1; border: none; padding: 0; cursor: pointer; display: grid; place-items: center;
      font-size: clamp(2rem, 9vw, 3rem); line-height: 1; background: #fffdf6; border-right: 1px solid #d9d2ee; border-bottom: 1px solid #d9d2ee; transition: background .15s; }
    .sd-cell.tint { background: #efe9ff; }
    .sd-cell.given { background: #e3dcf7; cursor: default; }
    .sd-cell.given.tint { background: #d6ccf2; }
    .sd-cell.sel { background: #ffe9a8; outline: 4px solid #ffb000; outline-offset: -4px; z-index: 1; }
    .sd-cell.bx-r { border-right: 4px solid #5b4a8f; }
    .sd-cell.bx-b { border-bottom: 4px solid #5b4a8f; }
    .sd-cell .pc { animation: sd-drop .32s cubic-bezier(.3,1.7,.5,1); }
    @keyframes sd-drop { 0% { transform: translateY(-26px) scale(1.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
    .sd-cell.clash { animation: kit-shake .4s ease; background: #ffd9d4; }
    .sd-cell.blink { animation: sd-blink .5s ease 3; }
    @keyframes sd-blink { 50% { background: #ff9d8f; } }
    .sd-cell.hint { animation: sd-hint 1s ease-in-out infinite; }
    @keyframes sd-hint { 50% { background: #b9f0c9; } }
    .sd-cell.win { animation: sd-win .6s ease both; animation-delay: calc(var(--i) * 60ms); }
    @keyframes sd-win { 40% { transform: scale(1.18); background: #b9f0c9; } }
    .sd-cell .ghost { opacity: .35; }
    .sd-pal { display: flex; gap: 12px; justify-content: center; }
    .sd-pick { width: clamp(58px, 17vw, 74px); aspect-ratio: 1; border-radius: 20px; border: 3px solid var(--border); background: #fff; cursor: grab;
      font-size: clamp(1.9rem, 8vw, 2.6rem); line-height: 1; box-shadow: 0 6px 0 var(--edge); transition: transform .1s; }
    .sd-pick.on { border-color: var(--sub-solid); background: var(--sub-tint); transform: translateY(-6px); box-shadow: 0 12px 0 var(--sub-edge); }
    .sd-msg { min-height: 2.6em; max-width: 420px; text-align: center; color: var(--text-soft); font-weight: 500; }
    .sd-tools { display: flex; gap: 10px; }
    @media (prefers-reduced-motion: reduce) { .sd-cell .pc, .sd-cell.hint, .sd-cell.win, .sd-cell.blink { animation: none; } }
  `;

  const clock = EDKit.timers();

  /* ---- the puzzle maker ---- */

  function peers(n, box) {
    const cells = n * n;
    const list = Array.from({ length: cells }, () => []);
    for (let a = 0; a < cells; a += 1) {
      for (let b = 0; b < cells; b += 1) {
        if (a === b) continue;
        const sameBox = box && Math.floor((a / n) / box[0]) === Math.floor((b / n) / box[0]) && Math.floor((a % n) / box[1]) === Math.floor((b % n) / box[1]);
        if (Math.floor(a / n) === Math.floor(b / n) || a % n === b % n || sameBox) list[a].push(b);
      }
    }
    return list;
  }

  /* Units are the groups that must hold every picture once. */
  function units(n, box) {
    const u = [];
    for (let i = 0; i < n; i += 1) {
      u.push(Array.from({ length: n }, (_, j) => i * n + j));
      u.push(Array.from({ length: n }, (_, j) => j * n + i));
    }
    if (box) {
      for (let br = 0; br < n; br += box[0]) {
        for (let bc = 0; bc < n; bc += box[1]) {
          const g = [];
          for (let r = 0; r < box[0]; r += 1) for (let c = 0; c < box[1]; c += 1) g.push((br + r) * n + bc + c);
          u.push(g);
        }
      }
    }
    return u;
  }

  function candidates(grid, i, n, P) {
    if (grid[i]) return [];
    const bad = new Set(P[i].map((j) => grid[j]));
    const out = [];
    for (let v = 1; v <= n; v += 1) if (!bad.has(v)) out.push(v);
    return out;
  }

  /* Solves with singles only (a square with one choice, or a picture with one
     place in its row/column/box). True when that is enough to finish. */
  function singlesSolve(start, n, P, U) {
    const grid = start.slice();
    for (;;) {
      let moved = false;
      for (let i = 0; i < grid.length; i += 1) {
        const c = candidates(grid, i, n, P);
        if (c.length === 1) { grid[i] = c[0]; moved = true; }
      }
      for (const g of U) {
        for (let v = 1; v <= n; v += 1) {
          if (g.some((i) => grid[i] === v)) continue;
          const spots = g.filter((i) => !grid[i] && candidates(grid, i, n, P).includes(v));
          if (spots.length === 1) { grid[spots[0]] = v; moved = true; }
        }
      }
      if (!moved) break;
    }
    return grid.every(Boolean);
  }

  function fullSolution(n, P) {
    const grid = Array(n * n).fill(0);
    const fill = (i) => {
      if (i === grid.length) return true;
      const opts = EDKit.shuffle(candidates(grid, i, n, P));
      for (const v of opts) { grid[i] = v; if (fill(i + 1)) return true; }
      grid[i] = 0;
      return false;
    };
    fill(0);
    return grid;
  }

  function makePuzzle(set) {
    const { n, box } = set;
    const P = peers(n, box);
    const U = units(n, box);
    const solution = fullSolution(n, P);
    const puzzle = solution.slice();
    for (const i of EDKit.shuffle(puzzle.map((_, k) => k))) {
      if (puzzle.filter(Boolean).length <= set.givens) break;
      const keep = puzzle[i];
      puzzle[i] = 0;
      if (!singlesSolve(puzzle, n, P, U)) puzzle[i] = keep;
    }
    return { solution, puzzle, P, U };
  }

  /* ---- the game ---- */

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('sd-style', CSS);

    const n = set.n;
    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kit sd';
    root.append(wrap);

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const { solution, puzzle, P, U } = makePuzzle(set);
      const pieces = PIECES[round % PIECES.length].slice(0, n);
      const grid = puzzle.slice();
      const given = puzzle.map(Boolean);
      let picked = 0;
      let sel = -1;
      let finished = false;

      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(text.ask, lang)}
        <div class="sd-board" style="grid-template-columns:repeat(${n}, auto)" role="grid">
          ${grid.map((_, i) => {
    const r = Math.floor(i / n);
    const c = i % n;
    const rb = set.box && (c + 1) % set.box[1] === 0 && c < n - 1 ? ' bx-r' : '';
    const bb = set.box && (r + 1) % set.box[0] === 0 && r < n - 1 ? ' bx-b' : '';
    return `<button type="button" class="sd-cell${rb}${bb}" data-i="${i}" role="gridcell"></button>`;
  }).join('')}
        </div>
        <div class="sd-pal">
          ${pieces.map((p, k) => `<button type="button" class="sd-pick" data-v="${k + 1}" aria-label="${p}">${p}</button>`).join('')}
        </div>
        <div class="sd-msg" aria-live="polite">${text.pick}</div>
        <div class="sd-tools"><button type="button" class="btn btn--ghost" data-hint>💡 ${text.hint}</button></div>`;

      const cells = [...wrap.querySelectorAll('.sd-cell')];
      const picks = [...wrap.querySelectorAll('.sd-pick')];
      const msg = wrap.querySelector('.sd-msg');
      const say = (m) => { msg.textContent = m; };

      function paint() {
        cells.forEach((el, i) => {
          el.classList.toggle('given', given[i]);
          el.classList.toggle('sel', i === sel);
          el.classList.toggle('tint', sel >= 0 && i !== sel && (P[sel].includes(i)));
          const v = grid[i];
          const shown = v ? `<span class="pc">${pieces[v - 1]}</span>` : '';
          if (el.dataset.v !== String(v)) { el.innerHTML = shown; el.dataset.v = String(v); }
        });
        picks.forEach((b) => b.classList.toggle('on', Number(b.dataset.v) === picked));
      }
      paint();
      EDKit.voice(wrap, round === 0 ? 'sudoku-ask' : 'sudoku-again', lang);

      function put(i, v) {
        if (finished || given[i]) return;
        if (grid[i] === v) { grid[i] = 0; paint(); return; }
        const twin = P[i].find((j) => grid[j] === v);
        if (twin !== undefined) {
          cells[i].classList.remove('clash');
          void cells[i].offsetWidth;
          cells[i].classList.add('clash');
          cells[twin].classList.add('blink');
          clock.later(() => cells[twin].classList.remove('blink'), 1600);
          EDSound.note(170, { seconds: 0.22, wave: 'triangle', gain: 0.2 });
          say(text.clash);
          EDVoice.say('sudoku-clash', lang);
          return;
        }
        if (v !== solution[i]) {
          EDKit.nope(cells[i]);
          EDSound.note(200, { seconds: 0.22, wave: 'triangle', gain: 0.2 });
          say(text.notHere);
          EDVoice.say('sudoku-notyet', lang);
          return;
        }
        grid[i] = v;
        cells.forEach((c) => c.classList.remove('hint'));
        EDSound.note(520 + v * 90, { seconds: 0.3, wave: 'triangle', gain: 0.22 });
        say('');
        paint();
        if (grid.every(Boolean)) win();
      }

      function win() {
        finished = true;
        sel = -1;
        paint();
        cells.forEach((c, i) => { c.style.setProperty('--i', i); c.classList.add('win'); });
        [523, 659, 784, 1047].forEach((f, k) => EDSound.note(f, { seconds: 0.4, wave: 'triangle', gain: 0.2, delay: k * 0.12 }));
        EDKit.confetti(30);
        EDKit.praise(lang);
        round += 1;
        clock.later(next, 3000);
      }

      cells.forEach((el, i) => {
        el.addEventListener('click', () => {
          if (finished) return;
          if (picked && !given[i]) { sel = i; put(i, picked); paint(); return; }
          sel = i;
          paint();
        });
      });

      picks.forEach((b) => EDKit.drag(b, {
        onTap: () => {
          const v = Number(b.dataset.v);
          if (sel >= 0 && !given[sel]) { put(sel, v); paint(); return; }
          picked = picked === v ? 0 : v;
          paint();
        },
        onDrop: (under) => {
          const cell = under && under.closest('.sd-cell');
          if (!cell) return;
          sel = Number(cell.dataset.i);
          put(sel, Number(b.dataset.v));
          paint();
        },
      }));

      wrap.querySelector('[data-hint]').addEventListener('click', () => {
        if (finished) return;
        let spot = -1;
        for (let i = 0; i < grid.length && spot < 0; i += 1) if (!grid[i] && candidates(grid, i, n, P).length === 1) spot = i;
        if (spot < 0) {
          /* No square has a single choice; a picture with one place in its group. */
          outer: for (const g of U) {
            for (let v = 1; v <= n; v += 1) {
              if (g.some((i) => grid[i] === v)) continue;
              const spots = g.filter((i) => !grid[i] && candidates(grid, i, n, P).includes(v));
              if (spots.length === 1) { spot = spots[0]; break outer; }
            }
          }
        }
        if (spot < 0) return;
        cells.forEach((c) => c.classList.remove('hint'));
        cells[spot].classList.add('hint');
        say(text.hintMsg);
        EDVoice.say('sudoku-hint', lang);
      });
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('mini-sudoku', { sets: SETS, mount, unmount });
})();
