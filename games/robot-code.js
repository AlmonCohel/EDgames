/* מתכנתים רובוט / Code the Robot — the idea behind programming.

   The difference from The Way Home, where a key moves the turtle at once: here
   every step is planned first, then the robot runs the whole plan by itself. When
   it bumps into something it goes back to the start and the plan stays on
   screen, so the plan is fixed rather than rewritten. That is debugging, and it is
   the whole point.

   The board and the plan always run left to right, whatever the page's language:
   an arrow pointing right has to move the robot right.

   Sets: an empty 4×4 board, a 5×5 board with walls, and the same with exactly as
   many steps as the shortest way needs. */

(function () {
  const SETS = [
    { id: 'walk', emoji: '🤖', label: { he: 'לוח ריק', en: 'Empty board' }, size: 4, walls: 0, minPath: 3, exact: false },
    { id: 'walls', emoji: '🧱', label: { he: 'עם קירות', en: 'With walls' }, size: 5, walls: 6, minPath: 5, exact: false },
    { id: 'exact', emoji: '🎯', label: { he: 'הדרך הקצרה', en: 'The shortest way' }, size: 5, walls: 6, minPath: 5, exact: true },
  ];

  const MOVES = {
    up: { dx: 0, dy: -1, glyph: '⬆️' },
    down: { dx: 0, dy: 1, glyph: '⬇️' },
    left: { dx: -1, dy: 0, glyph: '⬅️' },
    right: { dx: 1, dy: 0, glyph: '➡️' },
  };

  const TEXT = {
    he: {
      ask: 'בונים דרך לסוללה, ואז מפעילים', run: 'הפעלה ▶', undo: 'מחיקת צעד', clear: 'מתחילים מחדש',
      steps: (n) => `יש לכם ${n} צעדים בדיוק`, up: 'למעלה', down: 'למטה', left: 'שמאלה', right: 'ימינה', empty: 'התוכנית ריקה. לוחצים על חיצים',
    },
    en: {
      ask: 'Plan a way to the battery, then run it', run: 'Run ▶', undo: 'Delete a step', clear: 'Start again',
      steps: (n) => `You have exactly ${n} steps`, up: 'up', down: 'down', left: 'left', right: 'right', empty: 'The plan is empty. Press the arrows',
    },
  };

  const ROUNDS = 4;
  const STEP_MS = 480;
  const MAX_PLAN = 16;

  const CSS = `
    .rc-board { position: relative; display: grid; gap: 4px; width: min(66vw, 42vh, 340px); aspect-ratio: 1; border: 6px solid #c9d6ea; background: #c9d6ea; border-radius: 18px; }
    .rc-cell { background: #f5f8fd; border-radius: 9px; display: grid; place-items: center; font-size: clamp(20px, 6.5vw, 32px); }
    .rc-robot { position: absolute; display: grid; place-items: center; font-size: clamp(24px, 7.5vw, 38px); transition: left .36s ease, top .36s ease; pointer-events: none; }
    .rc-robot.bump { animation: kit-shake .4s ease; }
    .rc-plan { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; align-items: center; min-height: 50px; width: 100%; max-width: 520px; padding: 6px; background: #eef3fb; border-radius: 14px; font-size: .92rem; color: var(--text-soft); }
    .rc-step { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 9px; background: #fff; font-size: 1.25rem; box-shadow: 0 2px 0 var(--edge); }
    .rc-step.empty { background: transparent; box-shadow: none; border: 2px dashed #b9c9e0; }
    .rc-step.now { background: #ffe27a; }
    .rc-pad { display: grid; grid-template-columns: repeat(3, 58px); grid-template-rows: repeat(2, 58px); gap: 8px; justify-content: center; }
    .rc-pad .kit-opt { min-width: 0; min-height: 0; width: 58px; height: 58px; padding: 0; font-size: 1.7rem; border-radius: 16px; }
    .rc-pad [data-m="up"] { grid-column: 2; grid-row: 1; }
    .rc-pad [data-m="left"] { grid-column: 1; grid-row: 2; }
    .rc-pad [data-m="down"] { grid-column: 2; grid-row: 2; }
    .rc-pad [data-m="right"] { grid-column: 3; grid-row: 2; }
    .rc-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  `;

  const clock = EDKit.timers();

  /* The length of the shortest way, or 0 when there is none. */
  function shortest(size, walls, from, to) {
    const key = (p) => `${p.x},${p.y}`;
    const seen = new Set([key(from)]);
    let layer = [from];
    for (let d = 1; layer.length; d += 1) {
      const nextLayer = [];
      for (const p of layer) {
        for (const m of Object.values(MOVES)) {
          const q = { x: p.x + m.dx, y: p.y + m.dy };
          if (q.x < 0 || q.y < 0 || q.x >= size || q.y >= size || walls.has(key(q)) || seen.has(key(q))) continue;
          if (q.x === to.x && q.y === to.y) return d;
          seen.add(key(q));
          nextLayer.push(q);
        }
      }
      layer = nextLayer;
    }
    return 0;
  }

  /* Random until it is solvable and far enough apart to be worth planning. */
  function makeBoard(set) {
    const { size } = set;
    const cell = () => ({ x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) });
    for (;;) {
      const robot = cell();
      const goal = cell();
      const walls = new Set();
      while (walls.size < set.walls) {
        const w = cell();
        if ((w.x !== robot.x || w.y !== robot.y) && (w.x !== goal.x || w.y !== goal.y)) walls.add(`${w.x},${w.y}`);
      }
      const need = shortest(size, walls, robot, goal);
      if (need >= set.minPath && need <= MAX_PLAN) return { robot, goal, walls, need };
    }
  }

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('rc-style', CSS);

    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const board = makeBoard(set);
      const limit = set.exact ? board.need : MAX_PLAN;
      const plan = [];
      let running = false;

      /* One cell and one 4px gap, as a share of the board's inside. */
      const pitch = (i) => `calc(${i} * (100% + 4px) / ${set.size})`;
      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(text.ask, lang)}
        <p class="kit-hint" aria-live="polite">${set.exact ? text.steps(board.need) : ''}</p>
        <div class="rc-board" dir="ltr" style="grid-template-columns:repeat(${set.size},1fr)">
          ${Array.from({ length: set.size * set.size }, (_, i) => {
            const x = i % set.size;
            const y = Math.floor(i / set.size);
            const inner = board.walls.has(`${x},${y}`) ? '🧱' : (x === board.goal.x && y === board.goal.y ? '🔋' : '');
            return `<div class="rc-cell">${inner}</div>`;
          }).join('')}
          <div class="rc-robot" aria-hidden="true">🤖</div>
        </div>
        <div class="rc-plan" dir="ltr"></div>
        <div class="rc-pad" dir="ltr">
          ${Object.entries(MOVES).map(([id, m]) => `<button type="button" class="kit-opt" data-m="${id}" aria-label="${text[id]}">${m.glyph}</button>`).join('')}
        </div>
        <div class="rc-actions">
          <button type="button" class="btn rc-run">${text.run}</button>
          <button type="button" class="btn btn--ghost rc-undo">${text.undo}</button>
          <button type="button" class="btn btn--ghost rc-clear">${text.clear}</button>
        </div>`;
      EDKit.voice(wrap, 'robot-ask', lang);

      const robotEl = wrap.querySelector('.rc-robot');
      const planEl = wrap.querySelector('.rc-plan');
      const hint = wrap.querySelector('.kit-hint');
      const baseHint = hint.textContent;

      function place(p, instant) {
        robotEl.style.transition = instant ? 'none' : '';
        robotEl.style.width = `calc((100% - ${(set.size - 1) * 4}px) / ${set.size})`;
        robotEl.style.height = robotEl.style.width;
        robotEl.style.left = pitch(p.x);
        robotEl.style.top = pitch(p.y);
      }

      function drawPlan(active = -1) {
        const slots = plan.map((m, i) => `<span class="rc-step${i === active ? ' now' : ''}">${MOVES[m].glyph}</span>`);
        if (set.exact) for (let i = plan.length; i < limit; i += 1) slots.push('<span class="rc-step empty"></span>');
        planEl.innerHTML = slots.length ? slots.join('') : text.empty;
      }

      const setBusy = (on) => {
        running = on;
        wrap.querySelectorAll('.rc-pad button, .rc-actions button').forEach((b) => { b.disabled = on; });
      };

      /* A bump puts the robot back and leaves the plan alone, to be fixed. */
      function failed() {
        robotEl.classList.remove('bump');
        void robotEl.offsetWidth;
        robotEl.classList.add('bump');
        EDVoice.say('robot-bump', lang);
        clock.later(() => { place(board.robot); drawPlan(); setBusy(false); }, 900);
      }

      function run() {
        if (running || !plan.length) return;
        setBusy(true);
        hint.textContent = baseHint;
        let at = { ...board.robot };
        let i = 0;
        const step = () => {
          drawPlan(i);
          const m = MOVES[plan[i]];
          const to = { x: at.x + m.dx, y: at.y + m.dy };
          const blocked = to.x < 0 || to.y < 0 || to.x >= set.size || to.y >= set.size || board.walls.has(`${to.x},${to.y}`);
          if (blocked) { failed(); return; }
          at = to;
          place(at);
          i += 1;
          if (at.x === board.goal.x && at.y === board.goal.y) {
            clock.later(() => {
              EDKit.confetti(24);
              EDVoice.say('robot-win', lang);
              round += 1;
              clock.later(next, 2100);
            }, STEP_MS);
            return;
          }
          if (i >= plan.length) { clock.later(failed, STEP_MS); return; }
          clock.later(step, STEP_MS);
        };
        step();
      }

      wrap.querySelectorAll('.rc-pad button').forEach((b) => b.addEventListener('click', () => {
        if (running) return;
        if (plan.length >= limit) { EDKit.nope(b); return; }
        plan.push(b.dataset.m);
        drawPlan();
      }));
      wrap.querySelector('.rc-run').addEventListener('click', run);
      wrap.querySelector('.rc-undo').addEventListener('click', () => { if (!running) { plan.pop(); drawPlan(); } });
      wrap.querySelector('.rc-clear').addEventListener('click', () => { if (!running) { plan.length = 0; drawPlan(); } });

      place(board.robot, true);
      drawPlan();
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('robot-code', { sets: SETS, mount, unmount });
})();
