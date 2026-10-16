/* עוגת יום הולדת / Birthday Cake — counting out a number, not just reading one.

   Most counting games ask "how many are there?"; this one asks the harder,
   earlier skill: make there be that many. The voice asks for four candles, the
   child taps the cake to stand candles on it, and every candle is counted out
   loud as it goes on — one, two, three, four — so the count is heard as well
   as seen. Tap a candle to take it off again. When the number is right the
   candles light, and the child blows them out one tap at a time.

   Sets: up to 3, up to 5, up to 10. */

(function () {
  const SETS = [
    { id: 'three', emoji: '🧁', label: { he: 'עד 3', en: 'Up to 3' }, max: 3 },
    { id: 'five', emoji: '🎂', label: { he: 'עד 5', en: 'Up to 5' }, max: 5 },
    { id: 'ten', emoji: '🎉', label: { he: 'עד 10', en: 'Up to 10' }, max: 10 },
  ];

  const TEXT = {
    he: {
      ask: (n) => `שמים ${n} נרות על העוגה`,
      one: 'שמים נר אחד על העוגה',
      tapCake: 'לוחצים על העוגה כדי להוסיף נר, ועל נר כדי להוריד אותו',
      ready: 'מוכן! 🎂',
      more: 'צריך עוד נרות!',
      less: 'יותר מדי נרות — לוחצים על נר כדי להוריד',
      blow: 'מכבים את הנרות — לוחצים על כל להבה',
      cake: 'העוגה',
    },
    en: {
      ask: (n) => `Put ${n} candles on the cake`,
      one: 'Put one candle on the cake',
      tapCake: 'Tap the cake to add a candle, tap a candle to take it off',
      ready: 'Done! 🎂',
      more: 'We need more candles!',
      less: 'Too many candles — tap one to take it off',
      blow: 'Blow out the candles — tap every flame',
      cake: 'the cake',
    },
  };

  const ROUNDS = 4;
  const COLOURS = ['#ff5d8f', '#2f9bff', '#ffc531', '#7c4ced', '#1cc47a', '#ff8a1f'];

  const CSS = `
    .bc-big { font-size: 56px; font-weight: 700; line-height: 1; color: var(--sub-solid); min-height: 64px; }
    .bc-stage { position: relative; width: min(100%, 460px, max(280px, calc((100vh - 566px) * 1.53))); aspect-ratio: 46 / 30; }
    .bc-cake { position: absolute; inset: 0; width: 100%; height: 100%; cursor: pointer; }
    .bc-candles { position: absolute; left: 13%; right: 13%; top: 8%; height: 38%; display: flex; justify-content: center; align-items: flex-end; gap: 2%; pointer-events: none; }
    .bc-candle { pointer-events: auto; position: relative; width: 6.5%; max-width: 26px; height: 78%; border: none; padding: 0; cursor: pointer; border-radius: 6px 6px 3px 3px;
      background: repeating-linear-gradient(135deg, var(--c) 0 7px, #fff 7px 12px); box-shadow: inset -3px 0 0 rgba(0,0,0,.12); animation: bc-in .3s cubic-bezier(.3,1.7,.5,1); }
    @keyframes bc-in { from { transform: translateY(-40px) scale(.6); opacity: 0; } }
    .bc-candle::before { content: ''; position: absolute; left: 50%; top: -9px; width: 2px; height: 9px; background: #444; transform: translateX(-50%); }
    .bc-flame { position: absolute; left: 50%; top: -34px; width: 18px; height: 26px; transform: translateX(-50%); border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      background: radial-gradient(circle at 50% 70%, #fff7c2 0 25%, #ffc531 45%, #ff7a1a 75%); box-shadow: 0 0 18px 6px rgba(255, 190, 60, .55); animation: bc-flick .35s ease-in-out infinite alternate; }
    @keyframes bc-flick { to { transform: translateX(-50%) scale(1.08, .92) rotate(4deg); } }
    .bc-candle.out .bc-flame { display: none; }
    .bc-candle.out::after { content: '〰'; position: absolute; top: -30px; left: 50%; transform: translateX(-50%); color: #aab; font-size: 14px; animation: bc-smoke 1s forwards; }
    @keyframes bc-smoke { to { top: -60px; opacity: 0; } }
    .bc-count { font-size: 1.1rem; font-weight: 700; color: var(--text-soft); min-height: 1.6em; }
  `;

  const CAKE_SVG = `
    <svg class="bc-cake" viewBox="0 0 460 300" aria-hidden="true">
      <ellipse cx="230" cy="282" rx="210" ry="16" fill="#000" opacity=".12"/>
      <ellipse cx="230" cy="268" rx="205" ry="22" fill="#e8eef7"/>
      <rect x="60" y="150" width="340" height="110" rx="16" fill="#ff9fc6"/>
      <rect x="60" y="205" width="340" height="16" fill="#fff" opacity=".7"/>
      <ellipse cx="230" cy="150" rx="170" ry="34" fill="#ffd1e4"/>
      <path d="M60 150c0 30 20 26 26 8 6 30 26 30 30 4 8 30 30 28 32 4 6 30 30 30 34 2 6 30 28 30 32 4 6 28 30 30 34 4 6 28 28 28 32 4 6 26 26 28 30 8 4 22 22 22 30-26z" fill="#fff"/>
      ${[90, 140, 190, 240, 290, 340, 370].map((x, i) => `<circle cx="${x}" cy="${238 + (i % 2) * 10}" r="6" fill="${['#ffc531', '#2f9bff', '#1cc47a', '#7c4ced'][i % 4]}"/>`).join('')}
    </svg>`;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('bc-style', CSS);

    /* Four targets, spread over the set's range and not repeating. */
    const pool = EDKit.shuffle(Array.from({ length: set.max }, (_, i) => i + 1));
    const targets = Array.from({ length: ROUNDS }, (_, i) => pool[i % pool.length]);
    let round = 0;

    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const want = targets[round];
      let count = 0;
      let phase = 'build';

      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(want === 1 ? text.one : text.ask(want), lang)}
        <div class="bc-big" aria-hidden="true">${want}</div>
        <div class="bc-stage">
          ${CAKE_SVG}
          <div class="bc-candles"></div>
        </div>
        <div class="bc-count" aria-live="polite"></div>
        <p class="kit-hint">${text.tapCake}</p>
        <button type="button" class="btn" data-ready>${text.ready}</button>`;

      const row = wrap.querySelector('.bc-candles');
      const hint = wrap.querySelector('.kit-hint');
      const countEl = wrap.querySelector('.bc-count');
      const readyBtn = wrap.querySelector('[data-ready]');
      EDKit.voice(wrap, `candles-${want}`, lang);

      function show() { countEl.textContent = count ? String(count) : ''; }

      function add() {
        if (phase !== 'build' || count >= 10) return;
        count += 1;
        const c = document.createElement('button');
        c.type = 'button';
        c.className = 'bc-candle';
        c.style.setProperty('--c', COLOURS[(count - 1) % COLOURS.length]);
        c.setAttribute('aria-label', String(count));
        c.addEventListener('click', (e) => { e.stopPropagation(); tapCandle(c); });
        row.append(c);
        show();
        EDVoice.say(EDVoiceLines.num(count), lang);
      }

      function tapCandle(c) {
        if (phase === 'build') {
          c.remove();
          count -= 1;
          show();
          if (count) EDVoice.say(EDVoiceLines.num(count), lang);
          return;
        }
        if (phase === 'blow' && !c.classList.contains('out')) {
          c.classList.add('out');
          if (!row.querySelector('.bc-candle:not(.out)')) {
            phase = 'done';
            EDKit.confetti();
            EDKit.praise(lang);
            round += 1;
            clock.later(next, 1800);
          }
        }
      }

      wrap.querySelector('.bc-cake').addEventListener('click', add);
      readyBtn.addEventListener('click', () => {
        if (phase !== 'build') return;
        if (count < want) { hint.textContent = text.more; EDKit.nope(readyBtn); EDVoice.say('candles-more', lang); return; }
        if (count > want) { hint.textContent = text.less; EDKit.nope(readyBtn); EDVoice.say('candles-less', lang); return; }
        phase = 'blow';
        readyBtn.hidden = true;
        row.querySelectorAll('.bc-candle').forEach((c) => c.insertAdjacentHTML('beforeend', '<span class="bc-flame"></span>'));
        hint.textContent = text.blow;
        EDVoice.say('candles-blow', lang);
      });
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('birthday-candles', { sets: SETS, mount, unmount });
})();
