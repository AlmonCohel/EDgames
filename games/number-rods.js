/* מגדל הקוביות / Block Towers — numbers as physical heights (ages 3–5).

   For a child of three to five, a number is not a squiggle on a page — it is how
   tall a stack of blocks stands. On the left stands the goal tower with a golden
   star on top and ruler lines running across the sky, so the child can compare
   heights directly by eye. Next to it stands their own tower.

   In the first set the child stacks blocks of 1 or 2 until the two towers stand
   level and the star bridge connects. In the second set a partial tower is
   already standing and the child picks or drags the single rod that completes the
   height. In the third set the tower starts too tall and the child pops blocks
   off the top to bring it down to match.

   Sets: build to the height, the missing piece, take away blocks. */

(function () {
  const SETS = [
    { id: 'build', emoji: '🧱', label: { he: 'בונים לגובה', en: 'Build to the height' }, mode: 'build' },
    { id: 'fit', emoji: '🧩', label: { he: 'החלק החסר', en: 'The missing piece' }, mode: 'fit' },
    { id: 'take', emoji: '➖', label: { he: 'מורידים קוביות', en: 'Take away blocks' }, mode: 'take' },
  ];

  const TEXT = {
    he: {
      build: (n) => `בונים מגדל בגובה ${n} עד הכוכב`,
      fit: (n) => `איזה חלק ישלים את המגדל לגובה ${n}?`,
      take: (n) => `המגדל גבוה מדי! מורידים קוביות עד גובה ${n}`,
      hintBuild: 'לוחצים או גוררים קובייה למגדל. לחיצה על המגדל מורידה קובייה',
      hintFit: 'בוחרים או גוררים את החלק שיתאים בדיוק עד הקו של הכוכב',
      hintTake: 'לוחצים על הקובייה העליונה או על הכפתור כדי להוריד קובייה',
      takeBtn: 'מורידים קובייה 1−',
      addOne: '+1 קובייה',
      addTwo: '+2 קוביות',
      piece: (n) => `חלק של ${n}`,
    },
    en: {
      build: (n) => `Build a tower ${n} blocks tall to reach the star`,
      fit: (n) => `Which piece completes the tower to ${n}?`,
      take: (n) => `Too tall! Take blocks off down to ${n}`,
      hintBuild: 'Tap or drag a block onto the tower. Tap the tower to take one off',
      hintFit: 'Tap or drag the piece that reaches the star line',
      hintTake: 'Tap the top block or the button to take a block off',
      takeBtn: 'Take 1 off −1',
      addOne: '+1 block',
      addTwo: '+2 blocks',
      piece: (n) => `piece of ${n}`,
    },
  };

  const COLOURS = {
    1: '#ff5d8f',
    2: '#ff9a1f',
    3: '#ffc531',
    4: '#2fc57d',
    5: '#2f80ed',
    6: '#8a4dff',
  };

  const ROUNDS = 5;
  const MAX_H = 6;
  const UNIT_PX = 34;
  const PENTA = [262, 294, 330, 392, 440, 523, 587];

  const CSS = `
    .nr { gap: 10px; }
    .nr-stage { position: relative; width: min(100%, 540px); height: 288px; border-radius: 26px; overflow: hidden;
      background: linear-gradient(180deg, #cbeaff 0%, #eef9ff 80%, #8fd468 80.5%, #5fb84a 100%);
      border: 3px solid #fff; box-shadow: 0 6px 0 var(--edge); direction: ltr; }
    .nr-lines { position: absolute; left: 0; right: 0; bottom: 42px; height: ${MAX_H * UNIT_PX}px; pointer-events: none; }
    .nr-line { position: absolute; left: 12px; right: 12px; height: 0; border-top: 1.5px dashed rgba(30, 50, 80, .14); }
    .nr-line.goal-line { border-top: 3px dashed #ffb000; z-index: 2; }
    .nr-goal-tag { position: absolute; left: 8px; transform: translateY(-50%); background: #ffb000; color: #4a3000;
      font: 700 .9rem/1.25 Fredoka, sans-serif; padding: 2px 7px; border-radius: 9px; box-shadow: 0 2px 0 rgba(0,0,0,.15); z-index: 5; }
    .nr-towers { position: absolute; left: 0; right: 0; bottom: 42px; display: flex; justify-content: center; align-items: flex-end; gap: clamp(28px, 9vw, 68px); }
    .nr-col { display: flex; flex-direction: column; align-items: center; position: relative; width: 78px; }
    .nr-stack { display: flex; flex-direction: column-reverse; align-items: center; width: 76px; position: relative; z-index: 3; }
    .nr-stack.mine { cursor: pointer; }
    .nr-unit { width: 74px; height: ${UNIT_PX}px; border-radius: 9px; background: var(--c, #2f80ed);
      border: 2.5px solid rgba(255,255,255,.78); box-shadow: inset 0 -4px 0 rgba(0,0,0,.16), 0 2px 4px rgba(0,0,0,.12);
      display: grid; place-items: center; color: #fff; font: 700 1.15rem/1 Fredoka, sans-serif;
      text-shadow: 0 1px 2px rgba(0,0,0,.28); animation: nr-drop .24s cubic-bezier(.3,1.5,.5,1); user-select: none; }
    .nr-unit.extra-shake { animation: nr-wobble 1.2s ease-in-out infinite; border-color: #ffe082; }
    @keyframes nr-drop { from { transform: translateY(-22px) scale(.88); opacity: 0; } }
    @keyframes nr-wobble { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
    .nr-ghost { width: 74px; border-radius: 9px; border: 3px dashed rgba(47, 106, 232, .55); background: rgba(255,255,255,.38);
      display: grid; place-items: center; font: 700 1.35rem/1 Fredoka, sans-serif; color: #2f6ae8; pointer-events: none; }
    .nr-star { font-size: 1.9rem; line-height: 1; margin-bottom: 2px; filter: drop-shadow(0 3px 0 rgba(0,0,0,.18)); z-index: 4; }
    .nr-bridge { position: absolute; left: 50%; transform: translateX(-50%); height: 10px; width: 0;
      background: linear-gradient(90deg, #ffd23f, #ff9a1f); border-radius: 5px; box-shadow: 0 3px 0 #c77800;
      transition: width .35s ease; z-index: 3; pointer-events: none; }
    .nr-stage.level .nr-bridge { width: clamp(114px, 24vw, 154px); }
    .nr-foot { position: absolute; bottom: 10px; font: 700 1.25rem/1.2 Fredoka, sans-serif; color: #fff;
      background: rgba(20, 50, 20, .38); padding: 3px 14px; border-radius: 12px; }
    .nr-eq { min-height: 2.1rem; font: 700 1.7rem/1.2 Fredoka, sans-serif; color: var(--sub-ink); direction: ltr; text-align: center; }
    .nr-tray { display: flex; gap: 12px; justify-content: center; align-items: flex-end; flex-wrap: wrap; min-height: 76px; }
    .nr-rod-btn { border: 2px solid var(--border); background: var(--surface); border-radius: 18px; padding: 8px 14px;
      cursor: pointer; box-shadow: 0 5px 0 var(--edge); display: flex; flex-direction: column; align-items: center; gap: 4px;
      font: 700 1.1rem/1 Fredoka, Heebo, sans-serif; color: var(--text); transition: transform .1s; }
    .nr-rod-btn:active { transform: translateY(3px); box-shadow: 0 2px 0 var(--edge); }
    .nr-mini-stack { display: flex; flex-direction: column-reverse; gap: 1px; pointer-events: none; }
    .nr-mini-unit { width: 46px; height: 18px; border-radius: 5px; background: var(--c); border: 1.5px solid rgba(255,255,255,.8); }
  `;

  const clock = EDKit.timers();
  const between = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('nr-style', CSS);

    let round = 0;
    let lastKey = '';
    const wrap = document.createElement('div');
    wrap.className = 'kit nr';
    root.append(wrap);

    function makeProblem() {
      for (;;) {
        let p;
        if (set.mode === 'build') {
          const goal = between(2, 6);
          p = { goal, base: 0, start: 0, answer: goal };
        } else if (set.mode === 'fit') {
          const goal = between(3, 6);
          const base = between(Math.max(1, goal - 4), goal - 1);
          p = { goal, base, start: base, answer: goal - base };
        } else {
          const goal = between(1, 4);
          const start = between(goal + 1, 6);
          p = { goal, base: goal, start, answer: start - goal };
        }
        const key = `${set.mode}:${p.goal}:${p.start}`;
        if (key !== lastKey) {
          lastKey = key;
          return p;
        }
      }
    }

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const p = makeProblem();
      /* `pieces` holds the list of block sizes on the child's tower, e.g. [1, 1, 2]. */
      let pieces = [];
      if (set.mode === 'fit') pieces = [p.base];
      else if (set.mode === 'take') pieces = Array.from({ length: p.start }, () => 1);
      let busy = false;

      const sumPieces = () => pieces.reduce((s, v) => s + v, 0);

      const titleLine = set.mode === 'build'
        ? text.build(p.goal)
        : (set.mode === 'fit' ? text.fit(p.goal) : text.take(p.goal));
      const hintLine = set.mode === 'build'
        ? text.hintBuild
        : (set.mode === 'fit' ? text.hintFit : text.hintTake);
      const voiceKey = set.mode === 'build' ? 'rods-build' : (set.mode === 'fit' ? 'rods-fit' : 'rods-take');

      const linesHtml = Array.from({ length: MAX_H }, (_, i) => {
        const h = i + 1;
        const isGoal = h === p.goal;
        return `<div class="nr-line ${isGoal ? 'goal-line' : ''}" style="bottom:${h * UNIT_PX}px">
          ${isGoal ? `<span class="nr-goal-tag">${p.goal} ⭐</span>` : ''}
        </div>`;
      }).join('');

      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(titleLine, lang)}
        <div class="nr-stage">
          <div class="nr-lines">${linesHtml}</div>
          <div class="nr-bridge" style="bottom:${42 + p.goal * UNIT_PX - 5}px"></div>
          <div class="nr-towers">
            <div class="nr-col">
              <div class="nr-star" aria-hidden="true">⭐</div>
              <div class="nr-stack goal">
                ${Array.from({ length: p.goal }, (_, i) => `<div class="nr-unit" style="--c:${COLOURS[p.goal]}">${i + 1}</div>`).join('')}
              </div>
              <div class="nr-foot">${p.goal}</div>
            </div>
            <div class="nr-col">
              <div class="nr-star mine-star" aria-hidden="true" style="visibility:hidden">🌟</div>
              <div class="nr-stack mine" data-mine></div>
              <div class="nr-foot" data-mine-foot>0</div>
            </div>
          </div>
        </div>
        <div class="nr-eq" aria-live="polite"></div>
        <div class="nr-tray"></div>
        <p class="kit-hint" aria-live="polite">${hintLine}</p>`;

      const stage = wrap.querySelector('.nr-stage');
      const mineStack = wrap.querySelector('[data-mine]');
      const mineFoot = wrap.querySelector('[data-mine-foot]');
      const mineStar = wrap.querySelector('.mine-star');
      const eqEl = wrap.querySelector('.nr-eq');
      const trayEl = wrap.querySelector('.nr-tray');

      EDKit.voice(wrap, [voiceKey, EDVoiceLines.num(p.goal)], lang);

      function renderTower() {
        const h = sumPieces();
        let unitIdx = 0;
        const unitsHtml = pieces.map((sz, pIdx) => {
          const col = set.mode === 'fit'
            ? (pIdx === 0 ? COLOURS[p.base] : COLOURS[sz])
            : COLOURS[Math.min(6, Math.max(1, h))];
          return Array.from({ length: sz }, () => {
            unitIdx += 1;
            const isExtra = set.mode === 'take' && unitIdx > p.goal;
            return `<div class="nr-unit ${isExtra ? 'extra-shake' : ''}" style="--c:${col}" data-piece="${pIdx}">${unitIdx}</div>`;
          }).join('');
        }).join('');

        const ghostHtml = set.mode === 'fit' && pieces.length === 1
          ? `<div class="nr-ghost" style="height:${(p.goal - p.base) * UNIT_PX}px">?</div>`
          : '';

        mineStack.innerHTML = unitsHtml + ghostHtml;
        mineFoot.textContent = String(h);
      }

      function celebrate(eqText) {
        busy = true;
        stage.classList.add('level');
        mineStar.style.visibility = 'visible';
        eqEl.textContent = eqText;
        EDSound.note([523, 659, 784], { seconds: 0.45, wave: 'triangle', gain: 0.22 });
        EDKit.confetti(28);
        EDVoice.say([EDVoiceLines.num(p.goal)], lang).then(() => EDKit.praise(lang));
        round += 1;
        clock.later(next, 2700);
      }

      function addBlock(sz, btnEl) {
        if (busy) return;
        const cur = sumPieces();
        if (set.mode === 'build') {
          if (cur + sz > MAX_H) {
            if (btnEl) EDKit.nope(btnEl);
            return;
          }
          pieces.push(sz);
          renderTower();
          const now = sumPieces();
          EDSound.note(PENTA[Math.min(now, PENTA.length - 1)], { seconds: 0.2, wave: 'triangle', gain: 0.2 });
          EDVoice.say(EDVoiceLines.num(now), lang);
          if (now === p.goal) {
            const eq = pieces.length > 1 ? `${pieces.join(' + ')} = ${p.goal}` : `${p.goal} = ${p.goal}`;
            celebrate(eq);
          }
        } else if (set.mode === 'fit') {
          busy = true;
          pieces = [p.base, sz];
          renderTower();
          const now = sumPieces();
          EDSound.note(PENTA[Math.min(now, PENTA.length - 1)], { seconds: 0.22, wave: 'triangle', gain: 0.2 });
          if (sz === p.answer) {
            if (btnEl) EDKit.yes(btnEl);
            celebrate(`${p.base} + ${sz} = ${p.goal}`);
          } else {
            if (btnEl) EDKit.nope(btnEl);
            EDVoice.say('try-again', lang);
            clock.later(() => {
              pieces = [p.base];
              renderTower();
              busy = false;
            }, 950);
          }
        }
      }

      function popBlock() {
        if (busy) return;
        if (set.mode === 'build' && pieces.length > 0) {
          pieces.pop();
          renderTower();
          const now = sumPieces();
          EDSound.note(PENTA[Math.max(0, now)], { seconds: 0.16, wave: 'sine', gain: 0.16 });
          if (now > 0) EDVoice.say(EDVoiceLines.num(now), lang);
          if (now === p.goal) celebrate(`${p.goal} = ${p.goal}`);
        } else if (set.mode === 'take' && pieces.length > p.goal) {
          pieces.pop();
          renderTower();
          const now = sumPieces();
          EDSound.note(PENTA[Math.max(0, now)], { seconds: 0.2, wave: 'triangle', gain: 0.2 });
          EDVoice.say(EDVoiceLines.num(now), lang);
          if (now === p.goal) {
            celebrate(`${p.start} − ${p.answer} = ${p.goal}`);
          }
        }
      }

      mineStack.addEventListener('click', () => popBlock());

      if (set.mode === 'build') {
        const choices = p.goal >= 4 ? [1, 2] : [1];
        trayEl.innerHTML = choices.map((sz) => `
          <button type="button" class="nr-rod-btn" data-sz="${sz}">
            <div class="nr-mini-stack">
              ${Array.from({ length: sz }, () => `<span class="nr-mini-unit" style="--c:${COLOURS[sz]}"></span>`).join('')}
            </div>
            <span>${sz === 1 ? text.addOne : text.addTwo}</span>
          </button>`).join('');
        trayEl.querySelectorAll('.nr-rod-btn').forEach((btn) => {
          const sz = Number(btn.dataset.sz);
          EDKit.drag(btn, {
            onTap: () => addBlock(sz, btn),
            onDrop: (under) => { if (under && under.closest('.nr-stage')) addBlock(sz, btn); },
          });
        });
      } else if (set.mode === 'fit') {
        const opts = [1, 2, 3, 4];
        trayEl.innerHTML = opts.map((sz) => `
          <button type="button" class="nr-rod-btn" data-sz="${sz}" aria-label="${text.piece(sz)}">
            <div class="nr-mini-stack">
              ${Array.from({ length: sz }, () => `<span class="nr-mini-unit" style="--c:${COLOURS[sz]}"></span>`).join('')}
            </div>
            <span>+${sz}</span>
          </button>`).join('');
        trayEl.querySelectorAll('.nr-rod-btn').forEach((btn) => {
          const sz = Number(btn.dataset.sz);
          EDKit.drag(btn, {
            onTap: () => addBlock(sz, btn),
            onDrop: (under) => { if (under && under.closest('.nr-stage')) addBlock(sz, btn); },
          });
        });
      } else {
        trayEl.innerHTML = `<button type="button" class="btn nr-take-btn">${text.takeBtn}</button>`;
        trayEl.querySelector('.nr-take-btn').addEventListener('click', () => popBlock());
      }

      renderTower();
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('number-rods', { sets: SETS, mount, unmount });
})();
