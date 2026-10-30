/* משלימים לעשר / Make Ten — the ten frame, the picture behind mental arithmetic.

   Two rows of five is the point: seven dots in a ten frame is "five and two" at a
   glance, and "three missing" without counting. So the frame is always that
   shape, and after the answer the missing dots are filled in a second colour and
   the sum is written out under it.

   Sets: making five, making ten, and adding two amounts up to ten. */

(function () {
  const SETS = [
    { id: 'five', emoji: '🖐️', label: { he: 'משלימים לחמש', en: 'Make five' }, mode: 'make', whole: 5 },
    { id: 'ten', emoji: '🔟', label: { he: 'משלימים לעשר', en: 'Make ten' }, mode: 'make', whole: 10 },
    { id: 'sums', emoji: '➕', label: { he: 'כמה ביחד?', en: 'How many altogether?' }, mode: 'sum', whole: 10 },
  ];

  const TEXT = {
    he: { make: (n) => `כמה עוד צריך כדי להגיע ל${n === 5 ? 'חמש' : 'עשר'}?`, sum: 'כמה זה ביחד?' },
    en: { make: (n) => `How many more to make ${n === 5 ? 'five' : 'ten'}?`, sum: 'How many altogether?' },
  };

  const ROUNDS = 6;

  const CSS = `
    .mt-frame { display: grid; gap: 6px; padding: 8px; background: #1e2a44; border-radius: 16px; }
    .mt-cell { width: clamp(44px, 13vw, 60px); aspect-ratio: 1; background: #fff; border-radius: 8px; display: grid; place-items: center; }
    .mt-dot { width: 72%; aspect-ratio: 1; border-radius: 50%; background: var(--sub-solid); }
    .mt-dot.b { background: #f5a623; }
    .mt-dot.fresh { animation: kit-pop .4s ease; }
    .mt-sum { min-height: 2.6rem; font-size: 1.9rem; font-weight: 700; color: var(--sub-ink); }
    .mt-opts { gap: 10px; }
    .mt-opts .kit-opt { min-width: 66px; min-height: 66px; font-size: 2.1rem; padding: 6px; }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('mt-style', CSS);

    let round = 0;
    let last = '';
    let busy = false;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    const between = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

    /* a dots of one colour and b of the other; the same question twice in a row
       looks like the page did not change. */
    function question() {
      for (;;) {
        let a;
        let b;
        if (set.mode === 'make') {
          a = between(1, set.whole - 1);
          b = set.whole - a;
        } else {
          a = between(1, 7);
          b = between(1, set.whole - a);
        }
        if (`${a}+${b}` !== last) { last = `${a}+${b}`; return { a, b }; }
      }
    }

    function frame(a, b) {
      const cells = [];
      for (let i = 0; i < set.whole; i += 1) {
        cells.push(`<div class="mt-cell">${i < a ? '<span class="mt-dot"></span>' : (i < a + b ? '<span class="mt-dot b"></span>' : '')}</div>`);
      }
      return `<div class="mt-frame" dir="ltr" style="grid-template-columns:repeat(5,auto)" role="img" aria-label="${a}${b ? ` + ${b}` : ''}">${cells.join('')}</div>`;
    }

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      busy = false;
      const { a, b } = question();
      const making = set.mode === 'make';
      const answer = making ? b : a + b;
      const max = making ? set.whole - 1 : set.whole;
      const pool = [];
      for (let n = Math.max(1, answer - 3); n <= Math.min(max, answer + 3); n += 1) if (n !== answer) pool.push(n);
      const options = EDKit.shuffle([answer, ...EDKit.shuffle(pool).slice(0, 3)]);
      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(making ? text.make(set.whole) : text.sum, lang)}
        <div class="mt-holder">${making ? frame(a, 0) : frame(a, b)}</div>
        <div class="mt-sum" dir="ltr" aria-live="polite"></div>
        <div class="kit-opts mt-opts">
          ${options.map((n) => `<button type="button" class="kit-opt" data-n="${n}">${n}</button>`).join('')}
        </div>`;
      EDKit.voice(wrap, making ? `ten-ask-${set.whole}` : 'ten-sum', lang);
      wrap.querySelectorAll('.kit-opt').forEach((btn) => btn.addEventListener('click', () => {
        if (busy) return;
        if (Number(btn.dataset.n) !== answer) { EDKit.nope(btn); EDVoice.say('try-again', lang); return; }
        busy = true;
        EDKit.yes(btn);
        if (making) {
          wrap.querySelector('.mt-holder').innerHTML = frame(a, b);
          wrap.querySelectorAll('.mt-dot.b').forEach((d) => d.classList.add('fresh'));
        }
        wrap.querySelector('.mt-sum').textContent = `${a} + ${b} = ${a + b}`;
        EDKit.praise(lang);
        round += 1;
        clock.later(next, 2100);
      }));
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('make-ten', { sets: SETS, mount, unmount });
})();
