/* ועוד ופחות / Plus and Minus — small sums, with cookies to count while you learn
   to stop counting.

   Adding is two plates pushed together; taking away is one plate with some of it
   already eaten, greyed out and still on the table. Both are countable, which
   means a child who cannot yet do the sum can always get there the slow way —
   and that is the point of the first two runs.

   The third drops the cookies. The same sums arrive as digits, which is the
   step the whole game exists to reach.

   A sum is a piece of arithmetic, so its row is pinned LTR in both languages,
   the way the age ranges on the cards are. */

(function () {
  /* Three runs, and the third is a different lesson rather than bigger numbers:
     the same arithmetic with nothing left to count. */
  const SETS = [
    {
      id: 'plus', emoji: '➕',
      label: { he: 'רק חיבור', en: 'Just adding' },
      ops: ['+'], max: 10, options: 3, cookies: true,
    },
    {
      id: 'minus', emoji: '➖',
      label: { he: 'רק חיסור', en: 'Just taking away' },
      ops: ['-'], max: 10, options: 3, cookies: true,
    },
    {
      id: 'numbers', emoji: '🔢',
      label: { he: 'עם מספרים', en: 'With numbers' },
      ops: ['+', '-'], max: 20, options: 4, cookies: false,
    },
  ];

  const TEXT = {
    he: {
      step:      (n, of) => `שלב ${n} מתוך ${of}`,
      askCookies: 'כמה עוגיות יש עכשיו?',
      askNumbers: 'כמה יוצא?',
      countThem: 'אפשר לספור את העוגיות אחת־אחת',
      thinkAgain: 'לא בדיוק. חושבים עוד רגע ומנסים שוב',
      number:    (n) => `המספר ${n}`,
      wellDone:  'כל הכבוד!',
      solvedAll: 'פתרתם את כל התרגילים!',
      again:     'עוד פעם ➕',
      exit:      'למשחק אחר',
    },
    en: {
      step:      (n, of) => `Step ${n} of ${of}`,
      askCookies: 'How many cookies are there now?',
      askNumbers: 'What does it come to?',
      countThem: 'You can count the cookies one by one',
      thinkAgain: 'Not quite. Have another think and try again',
      number:    (n) => `the number ${n}`,
      wellDone:  'Well done!',
      solvedAll: 'You solved every one!',
      again:     'Again ➕',
      exit:      'Another game',
    },
  };

  const ROUNDS = 5;
  const COOKIE = '🍪';

  const CSS = `
    .pm { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 8px 0 20px; width: 100%; }
    .pm-progress { display: flex; gap: 9px; }
    .pm-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .pm-dot.done { background: var(--pos); }
    .pm-ask { text-align: center; }
    .pm-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .pm-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }

    .pm-plate {
      direction: ltr;
      display: flex; align-items: center; justify-content: center; gap: 18px; flex-wrap: wrap;
      width: 100%; max-width: 620px; min-height: 120px; padding: 18px;
      background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius);
    }
    .pm-group { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; max-width: 260px; }
    .pm-cookie { font-size: 34px; line-height: 1.1; }
    .pm-cookie.eaten { opacity: 0.28; filter: grayscale(1); }
    .pm-op { font-family: "Rubik", sans-serif; font-weight: 700; font-size: 2rem; color: var(--text-soft); }

    .pm-sum {
      direction: ltr;
      font-family: "Rubik", sans-serif; font-weight: 700;
      font-size: clamp(2rem, 8vw, 3rem); font-variant-numeric: tabular-nums;
      letter-spacing: 2px;
    }

    .pm-numbers { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
    .pm-number {
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: 2rem;
      font-variant-numeric: tabular-nums;
      width: 86px; height: 86px; border-radius: 24px;
      background: var(--bg-raise); color: var(--text);
      border: 2px solid var(--border); cursor: pointer;
      transition: transform 0.12s ease, background 0.15s ease;
    }
    .pm-number:hover:not([disabled]) { transform: translateY(-3px); }
    .pm-number.yes { background: var(--pos); border-color: var(--pos); color: var(--on-accent); }
    .pm-number.nope { animation: pm-shake 0.36s ease; }
    @keyframes pm-shake { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }

    .pm-end { text-align: center; margin: auto; }
    .pm-end .pm-stars { font-size: 46px; letter-spacing: 4px; }
    .pm-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .pm-end p { color: var(--text-soft); margin: 0 0 22px; }
    .pm-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    @media (max-width: 560px) {
      .pm-cookie { font-size: 26px; }
      .pm-group { max-width: 180px; }
      .pm-number { width: 72px; height: 72px; font-size: 1.7rem; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const between = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const text = TEXT[ctx.lang] || TEXT.he;
    const set = ctx.set || SETS[0];

    if (!document.getElementById('pm-style')) {
      const style = document.createElement('style');
      style.id = 'pm-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let round = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'pm';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.pm-hint').textContent = line; };

    /* Nothing ever comes out below one: an answer of zero looks to a six-year-old
       like the question was a trick. */
    function deal() {
      const op = set.ops[Math.floor(Math.random() * set.ops.length)];
      if (op === '+') {
        const a = between(1, set.max - 1);
        return { op, a, b: between(1, set.max - a) };
      }
      const a = between(2, set.max);
      return { op, a, b: between(1, a - 1) };
    }

    const resultOf = (sum) => (sum.op === '+' ? sum.a + sum.b : sum.a - sum.b);

    /* Answers on either side of the right one, so the choice is arithmetic and
       not "the biggest number on the row". */
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

    function cookies(sum) {
      /* Adding shows two plates side by side; taking away shows one plate with
         the eaten cookies faded but still there to be counted. */
      const bite = (n, eaten) => Array.from({ length: n }, () =>
        `<span class="pm-cookie${eaten ? ' eaten' : ''}">${COOKIE}</span>`).join('');

      if (sum.op === '+') {
        return `
          <div class="pm-group">${bite(sum.a, false)}</div>
          <div class="pm-op" aria-hidden="true">+</div>
          <div class="pm-group">${bite(sum.b, false)}</div>`;
      }
      return `<div class="pm-group">${bite(sum.a - sum.b, false)}${bite(sum.b, true)}</div>`;
    }

    function nextRound() {
      if (round >= ROUNDS) return finish();

      locked = false;
      const sum = deal();
      const answer = resultOf(sum);

      wrap.innerHTML = `
        <div class="pm-progress" role="img" aria-label="${text.step(round + 1, ROUNDS)}">
          ${Array.from({ length: ROUNDS }, (_, i) => `<span class="pm-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="pm-ask">
          <h2 aria-live="polite">${set.cookies ? text.askCookies : text.askNumbers}</h2>
          <p class="pm-hint"></p>
        </div>
        ${set.cookies ? `<div class="pm-plate" aria-hidden="true">${cookies(sum)}</div>` : ''}
        <div class="pm-sum">${sum.a} ${sum.op === '+' ? '+' : '−'} ${sum.b} = ?</div>
        <div class="pm-numbers"></div>`;

      const row = wrap.querySelector('.pm-numbers');
      choices(answer).forEach((n) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pm-number';
        b.textContent = n;
        b.setAttribute('aria-label', text.number(n));
        b.addEventListener('click', () => answerWith(b, n, answer));
        row.append(b);
      });
    }

    function answerWith(button, picked, answer) {
      if (locked) return;

      if (picked !== answer) {
        /* Wrong costs nothing — the sum stays on screen and, where there are
           cookies, so does the way to work it out without doing the sum. */
        button.classList.remove('nope');
        void button.offsetWidth;
        button.classList.add('nope');
        hint(set.cookies ? text.countThem : text.thinkAgain);
        return;
      }

      locked = true;
      round += 1;
      button.classList.add('yes');
      later(nextRound, 620);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="pm-end">
          <div class="pm-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.solvedAll}</p>
          <div class="pm-actions">
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

  EDGames.register('plus-minus', { sets: SETS, mount, unmount });
})();
