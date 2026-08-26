/* פיצוץ צבעים / Color Pop — the reference game module.
   Shows how a game plugs into the host: register an id with mount/unmount,
   keep all state, CSS and text inside the module, and clean up on unmount.

   A game speaks the language the host hands it in ctx.lang. Both languages
   live here rather than in the shared table, for the same reason the CSS does:
   a game owns everything that is only its own. */

(function () {
  const COLORS = [
    { id: 'red',    he: 'אדום', en: 'red',    hex: '#e5533d' },
    { id: 'blue',   he: 'כחול', en: 'blue',   hex: '#3d7ee5' },
    { id: 'yellow', he: 'צהוב', en: 'yellow', hex: '#f2c33d' },
    { id: 'green',  he: 'ירוק', en: 'green',  hex: '#4caf7d' },
    { id: 'purple', he: 'סגול', en: 'purple', hex: '#9b6fd4' },
    { id: 'orange', he: 'כתום', en: 'orange', hex: '#f28c3d' },
    { id: 'pink',   he: 'ורוד', en: 'pink',   hex: '#ef8fb8' },
    { id: 'brown',  he: 'חום',  en: 'brown',  hex: '#a9714b' },
    { id: 'grey',   he: 'אפור', en: 'grey',   hex: '#9aa5a0' },
    { id: 'black',  he: 'שחור', en: 'black',  hex: '#3a3f3c' },
  ];

  /* Three runs, and each is a different lesson rather than the same six
     balloons reshuffled: the four colours every child meets first, the four
     that come after them, then everything at once with a fourth balloon on
     the row to choose from. */
  const SETS = [
    {
      id: 'basics', emoji: '🔴',
      label: { he: 'צבעים ראשונים', en: 'First colours' },
      colors: ['red', 'blue', 'yellow', 'green'], options: 3,
    },
    {
      id: 'more', emoji: '🟣',
      label: { he: 'עוד צבעים', en: 'More colours' },
      colors: ['purple', 'orange', 'pink', 'brown'], options: 3,
    },
    {
      id: 'all', emoji: '🌈',
      label: { he: 'כל הצבעים', en: 'All the colours' },
      colors: COLORS.map((c) => c.id), options: 4,
    },
  ];

  /* Hebrew glues the definite article to the colour ("הבלון האדום"), English
     puts the colour before the noun — so the ask is one string per language
     rather than a shared sentence with a slot. */
  const TEXT = {
    he: {
      step:      (n, of) => `שלב ${n} מתוך ${of}`,
      ask:       (color) => `מצאו את הבלון ה${color}`,
      balloon:   (color) => `בלון ${color}`,
      wellDone:  'כל הכבוד!',
      poppedAll: 'פוצצתם את כל הבלונים!',
      again:     'עוד פעם 🎈',
      exit:      'למשחק אחר',
    },
    en: {
      step:      (n, of) => `Step ${n} of ${of}`,
      ask:       (color) => `Find the ${color} balloon`,
      balloon:   (color) => `${color} balloon`,
      wellDone:  'Well done!',
      poppedAll: 'You popped every balloon!',
      again:     'Again 🎈',
      exit:      'Another game',
    },
  };

  const ROUNDS = 6;

  const CSS = `
    .cp { display: flex; flex-direction: column; align-items: center; gap: 26px; padding: 8px 0 20px; width: 100%; }
    .cp-progress { display: flex; gap: 9px; }
    .cp-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .cp-dot.done { background: var(--pos); }
    .cp-ask { text-align: center; }
    .cp-ask h2 { margin: 0 0 14px; font-size: 1.5rem; }
    .cp-swatch {
      width: 96px; height: 96px; border-radius: 26px; margin: 0 auto;
      box-shadow: 0 10px 26px rgba(0,0,0,0.16);
    }
    .cp-balloons { display: flex; gap: 22px; flex-wrap: wrap; justify-content: center; }
    .cp-balloon {
      width: 118px; height: 142px; border: none; padding: 0; cursor: pointer;
      border-radius: 50% 50% 46% 46%;
      box-shadow: inset -12px -14px 0 rgba(0,0,0,0.10), 0 12px 24px rgba(0,0,0,0.15);
      position: relative;
      transition: transform 0.15s ease;
    }
    .cp-balloon::after {
      content: ''; position: absolute; bottom: -13px; inset-inline-start: calc(50% - 3px);
      width: 6px; height: 15px; background: rgba(0,0,0,0.18); border-radius: 3px;
    }
    .cp-balloon:hover { transform: translateY(-7px) scale(1.04); }
    .cp-balloon.pop { animation: cp-pop 0.32s ease forwards; }
    .cp-balloon.nope { animation: cp-shake 0.36s ease; }
    @keyframes cp-pop   { to { transform: scale(1.5); opacity: 0; } }
    @keyframes cp-shake { 25% { transform: translateX(-9px) rotate(-4deg); } 75% { transform: translateX(9px) rotate(4deg); } }
    .cp-end { text-align: center; }
    .cp-end .cp-stars { font-size: 46px; letter-spacing: 4px; }
    .cp-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .cp-end p { color: var(--text-soft); margin: 0 0 22px; }
    .cp-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .cp-balloon { width: 92px; height: 112px; }
      .cp-balloons { gap: 16px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .cp-balloon.pop { opacity: 0; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const text = TEXT[ctx.lang] || TEXT.he;
    const set = ctx.set || SETS[0];
    const palette = COLORS.filter((c) => set.colors.includes(c.id));
    const options = Math.min(set.options, palette.length);

    if (!document.getElementById('cp-style')) {
      const style = document.createElement('style');
      style.id = 'cp-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let round = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'cp';
    root.append(wrap);

    function nextRound() {
      if (round >= ROUNDS) return finish();

      locked = false;
      const picks = shuffle(palette).slice(0, options);
      const target = picks[Math.floor(Math.random() * picks.length)];

      wrap.innerHTML = `
        <div class="cp-progress" role="img" aria-label="${text.step(round + 1, ROUNDS)}">
          ${Array.from({ length: ROUNDS }, (_, i) => `<span class="cp-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="cp-ask">
          <h2>${text.ask(target[ctx.lang] || target.he)}</h2>
          <div class="cp-swatch" style="background:${target.hex}" aria-hidden="true"></div>
        </div>
        <div class="cp-balloons"></div>`;

      const row = wrap.querySelector('.cp-balloons');
      shuffle(picks).forEach((color) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cp-balloon';
        b.style.background = color.hex;
        b.setAttribute('aria-label', text.balloon(color[ctx.lang] || color.he));
        b.addEventListener('click', () => answer(b, color, target));
        row.append(b);
      });
    }

    function answer(button, color, target) {
      if (locked) return;

      if (color.id !== target.id) {
        /* Wrong taps cost nothing at this age — just a shake and another try. */
        button.classList.remove('nope');
        void button.offsetWidth;
        button.classList.add('nope');
        return;
      }

      locked = true;
      round += 1;
      button.classList.add('pop');
      later(nextRound, 420);
    }

    function finish() {
      /* Everyone finishes with three stars — a wrong tap costs nothing here,
         so the round only ends on the right answer. That is the design. */
      wrap.innerHTML = `
        <div class="cp-end">
          <div class="cp-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.poppedAll}</p>
          <div class="cp-actions">
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

  EDGames.register('color-pop', { sets: SETS, mount, unmount });
})();
