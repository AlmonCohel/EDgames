/* סופרים ברווזים / Counting Ducks — counting a small group and naming the number.

   The lake lays its creatures out in a wrapped row rather than scattering them,
   because a three-year-old counts by moving along a line and loses a pile. For
   the same reason nothing changes place once a round has started — the bobbing
   is idle, not travel: the child is counting, not chasing.

   A wrong number never ends the round — it comes back with an invitation to
   count again, one at a time. */

(function () {
  /* Three runs, and the third is a different lesson rather than bigger numbers:
     the lake fills up with frogs, turtles and fish too, and only the ducks
     count. */
  const SETS = [
    {
      id: 'few', emoji: '🦆',
      label: { he: 'עד חמישה', en: 'Up to five' },
      sprite: '🦆',
      many: { he: 'ברווזים', en: 'ducks' },
      min: 1, max: 5, options: 3, clutter: [],
    },
    {
      id: 'ten', emoji: '🐤',
      label: { he: 'עד עשרה', en: 'Up to ten' },
      sprite: '🐤',
      many: { he: 'אפרוחים', en: 'chicks' },
      min: 4, max: 10, options: 3, clutter: [],
    },
    {
      id: 'only', emoji: '🐸',
      label: { he: 'רק הברווזים', en: 'Only the ducks' },
      sprite: '🦆',
      many: { he: 'ברווזים', en: 'ducks' },
      min: 3, max: 8, options: 4, clutter: ['🐸', '🐢', '🐟'],
    },
  ];

  /* Hebrew glues the article to the noun ("את הברווזים"), English keeps it
     loose — one line per language rather than a shared frame with a slot. */
  const TEXT = {
    he: {
      step:      (n, of) => `שלב ${n} מתוך ${of}`,
      ask:       (many) => `כמה ${many} באגם?`,
      onlyThese: (many) => `סופרים רק את ה${many}`,
      countAgain: 'אפשר לספור שוב, אחד־אחד',
      number:    (n) => `המספר ${n}`,
      wellDone:  'כל הכבוד!',
      countedAll: 'ספרתם הכול נכון!',
      again:     'עוד פעם 🦆',
      exit:      'למשחק אחר',
    },
    en: {
      step:      (n, of) => `Step ${n} of ${of}`,
      ask:       (many) => `How many ${many} are in the lake?`,
      onlyThese: (many) => `Count only the ${many}`,
      countAgain: 'Count them again, one at a time',
      number:    (n) => `the number ${n}`,
      wellDone:  'Well done!',
      countedAll: 'You counted every one!',
      again:     'Again 🦆',
      exit:      'Another game',
    },
  };

  const ROUNDS = 5;

  const CSS = `
    .cd { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 8px 0 20px; width: 100%; }
    .cd-progress { display: flex; gap: 9px; }
    .cd-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .cd-dot.done { background: var(--pos); }
    .cd-ask { text-align: center; }
    .cd-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .cd-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }
    .cd-lake {
      display: flex; flex-wrap: wrap; align-content: center; justify-content: center;
      gap: 10px 16px; padding: 22px;
      width: 100%; max-width: 640px; min-height: 210px;
      background: linear-gradient(180deg, #e6f2fb, #d6eaf8);
      border: 1.5px solid var(--border); border-radius: var(--radius);
    }
    .cd-swimmer { font-size: 46px; line-height: 1; animation: cd-bob 2.6s ease-in-out infinite; }
    .cd-swimmer:nth-child(even) { animation-delay: -1.3s; }
    .cd-swimmer.extra { opacity: 0.85; }
    @keyframes cd-bob { 50% { transform: translateY(-6px); } }
    .cd-numbers { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
    .cd-number {
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: 2rem;
      font-variant-numeric: tabular-nums;
      width: 86px; height: 86px; border-radius: 24px;
      background: var(--bg-raise); color: var(--text);
      border: 2px solid var(--border); cursor: pointer;
      transition: transform 0.12s ease, background 0.15s ease;
    }
    .cd-number:hover { transform: translateY(-3px); }
    .cd-number.yes { background: var(--pos); border-color: var(--pos); color: var(--on-accent); }
    .cd-number.nope { animation: cd-shake 0.36s ease; }
    @keyframes cd-shake { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .cd-end { text-align: center; margin: auto; }
    .cd-end .cd-stars { font-size: 46px; letter-spacing: 4px; }
    .cd-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .cd-end p { color: var(--text-soft); margin: 0 0 22px; }
    .cd-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .cd-swimmer { font-size: 36px; }
      .cd-lake { gap: 8px 12px; padding: 16px; min-height: 170px; }
      .cd-number { width: 72px; height: 72px; font-size: 1.7rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      .cd-swimmer { animation: none; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const between = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const text = TEXT[ctx.lang] || TEXT.he;
    const set = ctx.set || SETS[0];
    const manyName = set.many[ctx.lang] || set.many.he;

    if (!document.getElementById('cd-style')) {
      const style = document.createElement('style');
      style.id = 'cd-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let round = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'cd';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.cd-hint').textContent = line; };

    /* Numbers on either side of the answer, so the choice is a real count and
       not "the big one" or "the small one". */
    function choices(answer) {
      const near = new Set([answer]);
      let reach = 1;
      while (near.size < set.options) {
        [answer - reach, answer + reach].forEach((n) => {
          if (n >= 1 && n <= set.max + 2 && near.size < set.options) near.add(n);
        });
        reach += 1;
      }
      return shuffle([...near]);
    }

    function nextRound() {
      if (round >= ROUNDS) return finish();

      locked = false;
      const answer = between(set.min, set.max);
      const extras = set.clutter.length
        ? Array.from({ length: between(2, 4) }, () => set.clutter[Math.floor(Math.random() * set.clutter.length)])
        : [];

      wrap.innerHTML = `
        <div class="cd-progress" role="img" aria-label="${text.step(round + 1, ROUNDS)}">
          ${Array.from({ length: ROUNDS }, (_, i) => `<span class="cd-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="cd-ask">
          <h2 aria-live="polite">${text.ask(manyName)}</h2>
          <p class="cd-hint">${extras.length ? text.onlyThese(manyName) : ''}</p>
        </div>
        <div class="cd-lake"></div>
        <div class="cd-numbers"></div>`;

      /* The creatures are decorative: counting them is the task, so reading the
         answer out of the markup would hand it over. */
      const lake = wrap.querySelector('.cd-lake');
      const crowd = shuffle([
        ...Array.from({ length: answer }, () => set.sprite),
        ...extras,
      ]);
      crowd.forEach((sprite) => {
        const s = document.createElement('span');
        s.className = `cd-swimmer${sprite === set.sprite ? '' : ' extra'}`;
        s.setAttribute('aria-hidden', 'true');
        s.textContent = sprite;
        lake.append(s);
      });

      const row = wrap.querySelector('.cd-numbers');
      choices(answer).forEach((n) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cd-number';
        b.textContent = n;
        b.setAttribute('aria-label', text.number(n));
        b.addEventListener('click', () => answerWith(b, n, answer));
        row.append(b);
      });
    }

    function answerWith(button, picked, answer) {
      if (locked) return;

      if (picked !== answer) {
        /* Wrong costs nothing at this age — a shake, and a nudge to count the
           row again instead of guessing the next number along. */
        button.classList.remove('nope');
        void button.offsetWidth;
        button.classList.add('nope');
        hint(text.countAgain);
        return;
      }

      locked = true;
      round += 1;
      button.classList.add('yes');
      later(nextRound, 520);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="cd-end">
          <div class="cd-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.countedAll}</p>
          <div class="cd-actions">
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

  EDGames.register('count-the-ducks', { sets: SETS, mount, unmount });
})();
