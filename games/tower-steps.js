/* מדרגות המגדל / The Tower Stairs — one step of the tower has lost its number.

   The stairs are a number line stood on its end: five steps in a row, each one
   taller than the last, and one of them blank. A child who cannot yet say which
   number is missing can count along the steps out loud and arrive at it, which
   is the whole reason the run is drawn rather than written as a sum.

   The stair rises with the count and falls when the count does, so "down the
   tower" looks like going down and not merely like smaller numbers. Because the
   missing step's neighbours are already on screen, the wrong answers are the
   numbers just outside the run — where a child who counts from the wrong end
   lands.

   A number is a piece of arithmetic, so every one of them keeps its LTR run in
   both languages, the way the age ranges on the cards do. */

(function () {
  /* Three runs, and the third is a different lesson rather than a longer climb:
     the steps stop being one apart. */
  const SETS = [
    {
      id: 'up', emoji: '⬆️',
      label: { he: 'עולים אחד־אחד', en: 'Up one by one' },
      step: 1, min: 1, max: 10, span: 5, options: 3,
    },
    {
      id: 'down', emoji: '🐉',
      label: { he: 'יורדים מהמגדל', en: 'Down the tower' },
      step: -1, min: 1, max: 20, span: 5, options: 3,
    },
    {
      id: 'twos', emoji: '✨',
      label: { he: 'מדלגים בשתיים', en: 'Skipping by twos' },
      step: 2, min: 2, max: 20, span: 5, options: 4,
    },
  ];

  const TEXT = {
    he: {
      step:      (n, of) => `שלב ${n} מתוך ${of}`,
      ask:       'איזו מדרגה נעלמה מהמגדל?',
      countUp:   'אפשר לספור את המדרגות מלמטה',
      countDown: 'אפשר לספור את המדרגות מלמעלה',
      countJump: 'אפשר לדלג בשתיים ולהגיע למדרגה החסרה',
      tryAgain:  'לא המספר הזה. סופרים עוד פעם ומנסים שוב',
      stair:     (n) => `מדרגה ${n}`,
      missing:   'מדרגה בלי מספר',
      number:    (n) => `המספר ${n}`,
      wellDone:  'כל הכבוד!',
      builtAll:  'תיקנתם את כל המדרגות!',
      again:     'עוד פעם 🏰',
      exit:      'למשחק אחר',
    },
    en: {
      step:      (n, of) => `Step ${n} of ${of}`,
      ask:       'Which stair has vanished from the tower?',
      countUp:   'You can count the stairs from the bottom',
      countDown: 'You can count the stairs from the top',
      countJump: 'You can skip by twos to reach the missing stair',
      tryAgain:  'Not that number. Count again and have another go',
      stair:     (n) => `stair ${n}`,
      missing:   'a stair with no number',
      number:    (n) => `the number ${n}`,
      wellDone:  'Well done!',
      builtAll:  'You mended every stair!',
      again:     'Again 🏰',
      exit:      'Another game',
    },
  };

  const ROUNDS = 5;
  /* Whoever is doing the climbing waits on the step before the gap. */
  const CLIMBER = '🧙';

  const CSS = `
    .ts { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 8px 0 20px; width: 100%; }
    .ts-progress { display: flex; gap: 9px; }
    .ts-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .ts-dot.done { background: var(--pos); }
    .ts-ask { text-align: center; }
    .ts-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .ts-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }
    .ts-stairs {
      display: flex; align-items: flex-end; justify-content: center; gap: 8px;
      width: 100%; max-width: 560px; padding: 18px 14px 14px;
      background: linear-gradient(180deg, #eef4fa, #e3ecf5);
      border: 1.5px solid var(--border); border-radius: var(--radius);
    }
    .ts-stair { flex: 1 1 0; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .ts-climber { font-size: 28px; line-height: 1; }
    .ts-block {
      width: 100%; height: var(--ts-h); border-radius: var(--radius-sm);
      display: grid; place-items: end center; padding-bottom: 8px;
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: 1.5rem;
      font-variant-numeric: tabular-nums; direction: ltr;
      background: var(--sub-tint, var(--sel-tint));
      border: 2px solid var(--sub-ink, var(--border));
      color: var(--sub-ink, var(--text));
    }
    .ts-block.gap { background: var(--bg-raise); border-style: dashed; color: var(--text-soft); }
    .ts-block.yes { background: var(--pos); border-color: var(--pos); color: var(--on-accent); }
    .ts-numbers { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
    .ts-number {
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: 2rem;
      font-variant-numeric: tabular-nums; direction: ltr;
      width: 86px; height: 86px; border-radius: 24px;
      background: var(--bg-raise); color: var(--text);
      border: 2px solid var(--border); cursor: pointer;
      transition: transform 0.12s ease, background 0.15s ease;
    }
    .ts-number:hover:not([disabled]) { transform: translateY(-3px); }
    .ts-number.nope { animation: ts-shake 0.36s ease; }
    @keyframes ts-shake { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .ts-end { text-align: center; margin: auto; }
    .ts-end .ts-stars { font-size: 46px; letter-spacing: 4px; }
    .ts-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .ts-end p { color: var(--text-soft); margin: 0 0 22px; }
    .ts-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .ts-stairs { gap: 5px; padding: 14px 10px 10px; }
      .ts-block { font-size: 1.2rem; }
      .ts-climber { font-size: 22px; }
      .ts-number { width: 72px; height: 72px; font-size: 1.7rem; }
    }
  `;

  const between = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const text = TEXT[ctx.lang] || TEXT.he;
    const set = ctx.set || SETS[0];
    const stride = Math.abs(set.step);
    const countLine = set.step > 1 ? text.countJump : (set.step > 0 ? text.countUp : text.countDown);

    if (!document.getElementById('ts-style')) {
      const style = document.createElement('style');
      style.id = 'ts-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let round = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'ts';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.ts-hint').textContent = line; };

    /* The run has to fit between 1 and the set's ceiling in whichever direction
       it goes, and it starts on its own grid — so a climb by twos stays on even
       numbers instead of drifting onto the odd ones. */
    function run() {
      const reach = stride * (set.span - 1);
      const lo = set.step > 0 ? set.min : set.min + reach;
      const hi = set.step > 0 ? set.max - reach : set.max;
      const start = lo + stride * between(0, Math.floor((hi - lo) / stride));
      return Array.from({ length: set.span }, (_, i) => start + set.step * i);
    }

    /* Numbers a miscount actually produces: the nearest steps that are not
       already on screen, since everything inside the run is. Taking them in
       order of distance rather than searching a fixed window matters at the
       bottom of the number line — a run of 2,3,4,5,6 missing its 2 has nothing
       below it and the whole run above it, and a narrow search came back with
       one wrong answer instead of two. Ties are broken by the shuffle, so a
       gap does not always collect its neighbours from the same side. */
    function choices(answer, shown) {
      const ceiling = set.max + stride;
      const off = [];
      for (let n = 1; n <= ceiling; n += 1) {
        if (n !== answer && !shown.has(n)) off.push(n);
      }
      /* Shuffled first so the stable sort keeps equally distant numbers in a
         random order rather than always reaching for the lower one. */
      const apart = shuffle(off).sort((a, b) => Math.abs(a - answer) - Math.abs(b - answer));
      return shuffle([answer, ...apart.slice(0, set.options - 1)]);
    }

    function nextRound() {
      if (round >= ROUNDS) return finish();

      locked = false;
      const steps = run();
      const gap = between(0, set.span - 1);
      const answer = steps[gap];
      const shown = new Set(steps.filter((_, i) => i !== gap));
      /* Somebody has to be looking at the hole, and they stand on the step
         before it — or after it, when the hole is the first one. */
      const climber = gap === 0 ? 1 : gap - 1;

      wrap.innerHTML = `
        <div class="ts-progress" role="img" aria-label="${text.step(round + 1, ROUNDS)}">
          ${Array.from({ length: ROUNDS }, (_, i) => `<span class="ts-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="ts-ask">
          <h2 aria-live="polite">${text.ask}</h2>
          <p class="ts-hint">${countLine}</p>
        </div>
        <div class="ts-stairs">
          ${steps.map((value, i) => `
            <div class="ts-stair">
              <span class="ts-climber" aria-hidden="true">${i === climber ? CLIMBER : ''}</span>
              <div class="ts-block ${i === gap ? 'gap' : ''}"
                   style="--ts-h: ${46 + (set.step > 0 ? i : set.span - 1 - i) * 16}px"
                   aria-label="${i === gap ? text.missing : text.stair(value)}">${i === gap ? '?' : value}</div>
            </div>`).join('')}
        </div>
        <div class="ts-numbers"></div>`;

      const row = wrap.querySelector('.ts-numbers');
      choices(answer, shown).forEach((n) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ts-number';
        b.textContent = n;
        b.setAttribute('aria-label', text.number(n));
        b.addEventListener('click', () => answerWith(b, n, answer));
        row.append(b);
      });
    }

    function answerWith(button, picked, answer) {
      if (locked) return;

      if (picked !== answer) {
        /* Wrong costs nothing: the number wobbles and the hint sends the child
           back to counting the steps rather than trying the next button. */
        button.classList.remove('nope');
        void button.offsetWidth;
        button.classList.add('nope');
        hint(text.tryAgain);
        return;
      }

      locked = true;
      round += 1;

      /* The missing step is built back into the tower before the next one. */
      const block = wrap.querySelector('.ts-block.gap');
      block.textContent = answer;
      block.setAttribute('aria-label', text.stair(answer));
      block.classList.remove('gap');
      block.classList.add('yes');
      wrap.querySelectorAll('.ts-number').forEach((b) => { b.disabled = true; });

      later(nextRound, 620);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="ts-end">
          <div class="ts-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.builtAll}</p>
          <div class="ts-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    nextRound();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  EDGames.register('tower-steps', { sets: SETS, mount, unmount });
})();
