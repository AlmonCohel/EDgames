/* בועות לפי הסדר / Bubbles in Order — the order of the numbers, not just their names.

   Numbered bubbles float loose on the water and are popped in order, each one
   said aloud as it goes. A bubble out of order only wiggles. The line under the
   heading always names the one that is next, so a child who lost the thread can
   pick it up again.

   Sets: up to five, up to ten, and backwards from ten. */

(function () {
  const SETS = [
    { id: 'to5', emoji: '🖐️', label: { he: 'עד חמש', en: 'Up to 5' }, from: 1, to: 5 },
    { id: 'to10', emoji: '🔟', label: { he: 'עד עשר', en: 'Up to 10' }, from: 1, to: 10 },
    { id: 'back', emoji: '🚀', label: { he: 'אחורה מעשר', en: 'Back from 10' }, from: 10, to: 1 },
  ];

  const TEXT = {
    he: { ask: 'מפוצצים את הבועות לפי הסדר', back: 'סופרים אחורה ומפוצצים', next: 'עכשיו: ', bubble: (n) => `בועה ${n}` },
    en: { ask: 'Pop the bubbles in order', back: 'Count backwards and pop', next: 'Next: ', bubble: (n) => `bubble ${n}` },
  };

  const ROUNDS = 3;

  const CSS = `
    .bc-sea { display: flex; flex-wrap: wrap; gap: 14px 18px; justify-content: center; width: 100%; max-width: 560px; padding: 22px 12px; border-radius: 26px;
      background: linear-gradient(180deg, #d7f2ff, #8ed6f5); }
    .bc-bubble { width: 84px; height: 84px; border-radius: 50%; border: 3px solid rgba(255,255,255,.95); cursor: pointer; font: inherit; font-weight: 700; font-size: 2rem; color: #14527a;
      background: radial-gradient(circle at 32% 28%, #fff 0 12%, rgba(255,255,255,.55) 34%, rgba(255,255,255,.2) 70%); box-shadow: 0 4px 12px rgba(20,82,122,.25);
      animation: bc-float 3.2s ease-in-out infinite; transition: transform .18s, opacity .18s; }
    .bc-bubble:nth-child(3n) { animation-delay: -1.1s; }
    .bc-bubble:nth-child(3n+1) { animation-delay: -2.1s; }
    .bc-bubble.popped { transform: scale(1.5); opacity: 0; pointer-events: none; animation: none; }
    @keyframes bc-float { 50% { translate: 0 -7px; } }
    @media (prefers-reduced-motion: reduce) { .bc-bubble { animation: none; } }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('bc-style', CSS);

    const step = set.from < set.to ? 1 : -1;
    const order = [];
    for (let n = set.from; n !== set.to + step; n += step) order.push(n);

    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      let at = 0;
      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(step > 0 ? text.ask : text.back, lang)}
        <p class="kit-hint" aria-live="polite"></p>
        <div class="bc-sea">
          ${EDKit.shuffle(order).map((n) => `<button type="button" class="bc-bubble" data-n="${n}" aria-label="${text.bubble(n)}">${n}</button>`).join('')}
        </div>`;
      const hint = wrap.querySelector('.kit-hint');
      const showNext = () => { hint.textContent = `${text.next}${order[at]}`; };
      showNext();
      EDKit.voice(wrap, step > 0 ? 'bubbles-ask' : 'bubbles-back', lang);

      wrap.querySelectorAll('.bc-bubble').forEach((b) => b.addEventListener('click', () => {
        if (Number(b.dataset.n) !== order[at]) { EDKit.nope(b); return; }
        b.classList.add('popped');
        EDVoice.say(EDVoiceLines.num(order[at]), lang);
        at += 1;
        if (at < order.length) { showNext(); return; }
        hint.textContent = '';
        round += 1;
        clock.later(() => { EDKit.praise(lang); clock.later(next, 1200); }, 800);
      }));
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('bubble-count', { sets: SETS, mount, unmount });
})();
