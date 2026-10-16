/* איפה יש יותר? / Which Has More? — comparing two amounts before knowing sums.

   Two baskets of fruit; the voice asks which has more (or, in the second step,
   which has less). The fruit is laid out in a loose heap rather than a row, so
   the answer comes from looking and counting, not from comparing the length of
   two lines. After the answer, the chosen basket is counted out loud, fruit by
   fruit, so every round also ends in a count.

   The third step turns it round: a number is said and shown, and the child
   finds the basket with exactly that many among three.

   Sets: more (1–5), less (1–6), the number (1–6, three baskets). */

(function () {
  const SETS = [
    { id: 'more', emoji: '🍎', label: { he: 'איפה יותר', en: 'Which has more' }, mode: 'more', max: 5 },
    { id: 'less', emoji: '🍐', label: { he: 'איפה פחות', en: 'Which has less' }, mode: 'less', max: 6 },
    { id: 'match', emoji: '🔢', label: { he: 'בדיוק המספר', en: 'Exactly the number' }, mode: 'match', max: 6 },
  ];

  const FRUIT = ['🍎', '🍊', '🍌', '🍓', '🍐', '🍇', '🍋', '🍑'];

  const TEXT = {
    he: { more: 'באיזה סל יש יותר פירות?', less: 'באיזה סל יש פחות פירות?', match: (n) => `באיזה סל יש בדיוק ${n}?`, basket: (n) => `סל עם ${n}` },
    en: { more: 'Which basket has more fruit?', less: 'Which basket has less fruit?', match: (n) => `Which basket has exactly ${n}?`, basket: (n) => `basket with ${n}` },
  };

  const ROUNDS = 5;

  const CSS = `
    .ml-num { font-size: 64px; font-weight: 700; line-height: 1; color: var(--sub-solid); }
    .ml-row { display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; width: 100%; }
    .ml-basket { position: relative; width: min(42vw, 230px); aspect-ratio: 1; border: none; padding: 0; background: none; cursor: pointer; }
    .ml-row.three .ml-basket { width: min(29vw, 200px); }
    .ml-basket svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .ml-fruit { position: absolute; font-size: clamp(22px, 5vw, 36px); line-height: 1; transform: translate(-50%, -50%); transition: transform .2s; }
    .ml-fruit.counted { transform: translate(-50%, -50%) scale(1.35); filter: drop-shadow(0 0 6px #ffe27a); }
    .ml-basket.kit-nope svg, .ml-basket.kit-yes svg { }
    .ml-basket.kit-yes { background: none !important; }
    .ml-basket.kit-yes .ml-rim { stroke: var(--pos); stroke-width: 8; }
  `;

  const BASKET = `<svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse cx="50" cy="92" rx="40" ry="5" fill="#000" opacity=".12"/>
    <path d="M10 48h80l-9 40c-1 4-4 6-8 6H27c-4 0-7-2-8-6z" fill="#d79a52"/>
    <path d="M14 58h72M17 70h66M20 82h60" stroke="#b77a36" stroke-width="3"/>
    <path d="M30 48v44M50 48v46M70 48v44" stroke="#b77a36" stroke-width="2.5"/>
    <rect class="ml-rim" x="7" y="42" width="86" height="10" rx="5" fill="#c4843c" stroke="transparent"/>
  </svg>`;

  /* Loose heap positions inside a basket (percent), front row low. */
  const SPOTS = [[50, 36], [32, 38], [68, 38], [41, 24], [59, 24], [22, 28], [78, 28], [50, 12], [32, 12], [68, 12]];

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('ml-style', CSS);

    let round = 0;
    let busy = false;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function amounts() {
      const r = () => 1 + Math.floor(Math.random() * set.max);
      if (set.mode === 'match') {
        const want = r();
        const others = EDKit.shuffle(Array.from({ length: set.max }, (_, i) => i + 1).filter((n) => n !== want)).slice(0, 2);
        return { counts: EDKit.shuffle([want, ...others]), want };
      }
      let a, b;
      do { a = r(); b = r(); } while (a === b);
      return { counts: [a, b], want: set.mode === 'more' ? Math.max(a, b) : Math.min(a, b) };
    }

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      busy = false;
      const { counts, want } = amounts();
      const fruit = EDKit.pick(FRUIT);
      const line = set.mode === 'match' ? text.match(want) : text[set.mode];
      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(line, lang)}
        ${set.mode === 'match' ? `<div class="ml-num" aria-hidden="true">${want}</div>` : ''}
        <div class="ml-row${counts.length === 3 ? ' three' : ''}">
          ${counts.map((n) => `
            <button type="button" class="ml-basket" data-n="${n}" aria-label="${text.basket(n)}">
              ${BASKET}
              ${EDKit.shuffle(SPOTS.slice(0, Math.max(n, 1))).slice(0, n).map(([x, y]) => `<span class="ml-fruit" style="left:${x}%;top:${y + 18}%">${fruit}</span>`).join('')}
            </button>`).join('')}
        </div>`;
      EDKit.voice(wrap, set.mode === 'match' ? ['match-ask', EDVoiceLines.num(want)] : `${set.mode}-ask`, lang);
      wrap.querySelectorAll('.ml-basket').forEach((b) => b.addEventListener('click', () => answer(b, Number(b.dataset.n), want)));
    }

    function answer(b, n, want) {
      if (busy) return;
      if (n !== want) { EDKit.nope(b); EDVoice.say('try-again', lang); return; }
      busy = true;
      EDKit.yes(b);
      /* Count the basket out loud, fruit by fruit, lighting each one. */
      const fruits = [...b.querySelectorAll('.ml-fruit')].sort((p, q) => parseFloat(q.style.top) - parseFloat(p.style.top));
      fruits.forEach((f, i) => clock.later(() => { f.classList.add('counted'); EDVoice.say(EDVoiceLines.num(i + 1), lang); }, 300 + i * 650));
      clock.later(() => { EDKit.praise(lang); round += 1; clock.later(next, 1100); }, 300 + fruits.length * 650 + 200);
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('more-or-less', { sets: SETS, mount, unmount });
})();
