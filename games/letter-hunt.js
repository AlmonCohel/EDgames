/* ציד אותיות / Letter Hunt — finding every copy of one letter in a field of others.

   The alphabet the child hunts through is the alphabet on screen: Hebrew when
   the site is in Hebrew, the Latin one when it is in English. A hunt for ב in
   a grid of Latin letters would be a puzzle about fonts, not about letters.

   Each round hides the same letter more than once, because a child who stops at
   the first one has learned to spot a shape, not to read a line. */

(function () {
  const ALPHABET = {
    he: [...'אבגדהוזחטיכלמנסעפצקרשת'],
    en: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  };

  /* The first letters a child meets, in the order each language teaches them. */
  const FIRST = {
    he: [...'אבגדהוזחטי'],
    en: [...'ABCDEFGHIJ'],
  };

  /* Letters that are told apart by one stroke or one direction. The hardest run
     draws the target and most of its neighbours from the same group, so the
     child has to look at the difference rather than at the general shape. */
  const LOOKALIKES = {
    he: [[...'בכ'], [...'דר'], [...'החת'], [...'וזן'], [...'גנ'], [...'סם']],
    en: [[...'BDPR'], [...'CGOQ'], [...'EF'], [...'ILT'], [...'MNW'], [...'UVY']],
  };

  const SETS = [
    {
      id: 'first', emoji: '🔤',
      label: { he: 'אותיות ראשונות', en: 'First letters' },
      pool: 'first', cells: 12, targets: 2,
    },
    {
      id: 'all', emoji: '🔠',
      label: { he: 'כל האותיות', en: 'All the letters' },
      pool: 'all', cells: 16, targets: 3,
    },
    {
      id: 'similar', emoji: '👀',
      label: { he: 'אותיות דומות', en: 'Look-alike letters' },
      pool: 'lookalikes', cells: 16, targets: 3,
    },
  ];

  const TEXT = {
    he: {
      step:     (n, of) => `שלב ${n} מתוך ${of}`,
      ask:      (letter, n) => `מצאו את האות ${letter} — היא מסתתרת ${n} פעמים`,
      found:    (n, of) => `נמצאו ${n} מתוך ${of}`,
      keepGoing: 'זו אות אחרת. מסתכלים טוב ומנסים שוב',
      letter:   (l) => `האות ${l}`,
      wellDone: 'כל הכבוד!',
      foundAll: 'מצאתם את כל האותיות!',
      again:    'עוד פעם 🔍',
      exit:     'למשחק אחר',
    },
    en: {
      step:     (n, of) => `Step ${n} of ${of}`,
      ask:      (letter, n) => `Find the letter ${letter} — it is hiding ${n} times`,
      found:    (n, of) => `Found ${n} of ${of}`,
      keepGoing: 'That is a different letter. Look again',
      letter:   (l) => `the letter ${l}`,
      wellDone: 'Well done!',
      foundAll: 'You found every letter!',
      again:    'Again 🔍',
      exit:     'Another game',
    },
  };

  const ROUNDS = 4;

  const CSS = `
    .lh { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .lh-progress { display: flex; gap: 9px; }
    .lh-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .lh-dot.done { background: var(--pos); }
    .lh-ask { text-align: center; }
    .lh-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .lh-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }
    .lh-target {
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: 3rem; line-height: 1.2;
      width: 96px; height: 96px; margin: 0 auto; border-radius: 24px;
      display: grid; place-items: center;
      background: var(--sub-tint, var(--sel-tint)); color: var(--sub-ink, var(--sel-ink));
    }
    .lh-grid {
      display: grid; gap: 12px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      width: 100%; max-width: 520px;
    }
    .lh-cell {
      aspect-ratio: 1 / 1;
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: clamp(1.6rem, 6vw, 2.2rem);
      background: var(--bg-raise); color: var(--text);
      border: 2px solid var(--border); border-radius: var(--radius-sm);
      cursor: pointer;
      transition: transform 0.12s ease, background 0.15s ease;
    }
    .lh-cell:hover:not([disabled]) { transform: translateY(-3px); }
    .lh-cell.yes { background: var(--pos); border-color: var(--pos); color: var(--on-accent); cursor: default; }
    .lh-cell.nope { animation: lh-shake 0.36s ease; }
    @keyframes lh-shake { 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }
    .lh-end { text-align: center; margin: auto; }
    .lh-end .lh-stars { font-size: 46px; letter-spacing: 4px; }
    .lh-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .lh-end p { color: var(--text-soft); margin: 0 0 22px; }
    .lh-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .lh-grid { gap: 8px; }
      .lh-target { width: 76px; height: 76px; font-size: 2.4rem; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const oneOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = ALPHABET[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];

    if (!document.getElementById('lh-style')) {
      const style = document.createElement('style');
      style.id = 'lh-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let round = 0;
    let left = 0;

    const wrap = document.createElement('div');
    wrap.className = 'lh';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.lh-hint').textContent = line; };

    /* A round is a target letter and the letters it hides among. The look-alike
       run keeps most of the field inside the target's own group; the other two
       draw from the whole pool. */
    function deal() {
      if (set.pool === 'lookalikes') {
        const group = oneOf(LOOKALIKES[lang]);
        const target = oneOf(group);
        const near = group.filter((l) => l !== target);
        const rest = ALPHABET[lang].filter((l) => !group.includes(l));
        /* Two thirds of the field are near-misses, so the grid still has some
           easy letters to rule out and does not read as a wall of one shape. */
        const fill = set.cells - set.targets;
        const pool = [
          ...Array.from({ length: Math.round(fill * 0.7) }, () => oneOf(near)),
          ...Array.from({ length: fill - Math.round(fill * 0.7) }, () => oneOf(rest)),
        ];
        return { target, others: pool };
      }

      const pool = set.pool === 'first' ? FIRST[lang] : ALPHABET[lang];
      const target = oneOf(pool);
      const rest = pool.filter((l) => l !== target);
      return {
        target,
        others: Array.from({ length: set.cells - set.targets }, () => oneOf(rest)),
      };
    }

    function nextRound() {
      if (round >= ROUNDS) return finish();

      const { target, others } = deal();
      left = set.targets;

      wrap.innerHTML = `
        <div class="lh-progress" role="img" aria-label="${text.step(round + 1, ROUNDS)}">
          ${Array.from({ length: ROUNDS }, (_, i) => `<span class="lh-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="lh-ask">
          <h2 aria-live="polite">${text.ask(target, set.targets)}</h2>
          <div class="lh-target" aria-hidden="true">${target}</div>
        </div>
        <p class="lh-hint">${text.found(0, set.targets)}</p>
        <div class="lh-grid"></div>`;

      const grid = wrap.querySelector('.lh-grid');
      shuffle([...Array.from({ length: set.targets }, () => target), ...others]).forEach((letter) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'lh-cell';
        b.textContent = letter;
        b.setAttribute('aria-label', text.letter(letter));
        b.addEventListener('click', () => tap(b, letter === target));
        grid.append(b);
      });
    }

    function tap(cell, isTarget) {
      if (cell.disabled) return;

      if (!isTarget) {
        /* A wrong letter is a look, not a mistake: it wobbles and stays where
           it is, and nothing is counted. */
        cell.classList.remove('nope');
        void cell.offsetWidth;
        cell.classList.add('nope');
        hint(text.keepGoing);
        return;
      }

      cell.classList.add('yes');
      cell.disabled = true;
      left -= 1;
      hint(text.found(set.targets - left, set.targets));
      if (left) return;

      round += 1;
      later(nextRound, 620);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="lh-end">
          <div class="lh-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.foundAll}</p>
          <div class="lh-actions">
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

  EDGames.register('letter-hunt', { sets: SETS, mount, unmount });
})();
