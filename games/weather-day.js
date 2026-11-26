/* איזה מזג אוויר? / What Is the Weather? — dressing for the day that is outside
   the window.

   The rack a child picks from is made of the *other* days' clothes rather than
   of nonsense: a scarf on a sunny day is wrong because it belongs to the snowy
   one, not because it is a silly thing to own. That keeps the wrong answers
   honest — every item on the rack is right somewhere, which is what makes
   choosing worth doing.

   No item belongs to two days. A coat that suited both the rain and the snow
   would make the question unanswerable at exactly the moment a child was
   reasoning properly, so the rain gets the things that keep water off and the
   snow gets the things that keep warmth in.

   More than one answer is wanted each round, and the round only ends when all
   of them are found, so the game is never over on a single lucky tap. */

(function () {
  const DAYS = [
    {
      id: 'sun', emoji: '☀️',
      he: 'יום שמשי', en: 'a sunny day',
      wear: [
        { emoji: '👕', he: 'חולצה קצרה', en: 't-shirt' },
        { emoji: '🕶️', he: 'משקפי שמש', en: 'sunglasses' },
        { emoji: '🧢', he: 'כובע מצחייה', en: 'cap' },
      ],
    },
    {
      id: 'rain', emoji: '🌧️',
      he: 'יום גשום', en: 'a rainy day',
      wear: [
        { emoji: '☂️', he: 'מטרייה', en: 'umbrella' },
        { emoji: '👢', he: 'מגפי גשם', en: 'rain boots' },
        { emoji: '🧥', he: 'מעיל גשם', en: 'raincoat' },
      ],
    },
    {
      id: 'snow', emoji: '❄️',
      he: 'יום מושלג', en: 'a snowy day',
      wear: [
        { emoji: '🧣', he: 'צעיף', en: 'scarf' },
        { emoji: '🧤', he: 'כפפות', en: 'gloves' },
        { emoji: '🧦', he: 'גרביים חמות', en: 'warm socks' },
      ],
    },
  ];

  /* Three runs. The first is two days told apart, which is the whole question
     at five; the third asks for everything the day needs off a full rack. */
  const SETS = [
    {
      id: 'two', emoji: '☀️',
      label: { he: 'שמש וגשם', en: 'Sun and rain' },
      days: ['sun', 'rain'], need: 2, rack: 4, rounds: 4,
    },
    {
      id: 'three', emoji: '❄️',
      label: { he: 'גם שלג', en: 'Snow as well' },
      days: ['sun', 'rain', 'snow'], need: 2, rack: 5, rounds: 5,
    },
    {
      id: 'all', emoji: '🌈',
      label: { he: 'מתלבשים לגמרי', en: 'Dressed for it' },
      days: ['sun', 'rain', 'snow'], need: 3, rack: 7, rounds: 6,
    },
  ];

  const TEXT = {
    he: {
      step:     (n, of) => `שלב ${n} מתוך ${of}`,
      ask:      (day) => `מה לובשים ב${day}?`,
      lead:     (n) => `בוחרים ${n} דברים שמתאימים ליום הזה`,
      found:    (n, of) => `מצאתם ${n} מתוך ${of}`,
      notThis:  'זה מתאים ליום אחר. מחפשים משהו שמתאים להיום',
      wellDone: 'כל הכבוד!',
      dressedAll: 'התלבשתם נכון לכל יום!',
      again:    'עוד פעם ⛅',
      exit:     'למשחק אחר',
    },
    en: {
      step:     (n, of) => `Step ${n} of ${of}`,
      ask:      (day) => `What do you wear on ${day}?`,
      lead:     (n) => `Pick ${n} things that suit this day`,
      found:    (n, of) => `You found ${n} of ${of}`,
      notThis:  'That one belongs to a different day. Look for something for today',
      wellDone: 'Well done!',
      dressedAll: 'You dressed right for every day!',
      again:    'Again ⛅',
      exit:     'Another game',
    },
  };

  const CSS = `
    .wd {
      --wd-rack-gap: 12px;
      display: flex; flex-direction: column; align-items: center; gap: 18px;
      padding: 8px 0 20px; width: 100%; container-type: inline-size;
    }
    .wd-progress { display: flex; gap: 9px; flex-wrap: wrap; justify-content: center; }
    .wd-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .wd-dot.done { background: var(--pos); }
    .wd-ask { text-align: center; }
    .wd-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .wd-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }

    .wd-window {
      display: grid; place-items: center; gap: 8px;
      padding: 20px 28px; width: min(100%, 220px);
      background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius);
    }
    .wd-sky { font-size: 74px; line-height: 1; }
    .wd-day { font-weight: 700; font-size: 1.2rem; }

    .wd-rack { display: flex; flex-wrap: wrap; gap: var(--wd-rack-gap); justify-content: center; width: 100%; }
    .wd-item {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      width: clamp(64px, 28cqw, 104px); min-height: 64px; padding: 12px 8px;
      background: var(--bg-raise); border: 2px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); cursor: pointer;
      transition: transform 0.12s ease;
    }
    .wd-item:hover:not([disabled]) { transform: translateY(-3px); }
    .wd-item .wd-thing { font-size: 40px; line-height: 1; }
    .wd-item .wd-name { font-size: 0.82rem; font-weight: 700; text-align: center; line-height: 1.2; }
    .wd-item.yes {
      border-color: var(--pos); background: var(--sub-tint, var(--sel-tint));
      cursor: default; animation: wd-pack 0.3s ease;
    }
    @keyframes wd-pack { from { transform: scale(1.18); } }
    .wd-item.nope { animation: wd-shake 0.36s ease; }
    @keyframes wd-shake { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }

    .wd-end { text-align: center; margin: auto; }
    .wd-end .wd-stars { font-size: 46px; letter-spacing: 4px; }
    .wd-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .wd-end p { color: var(--text-soft); margin: 0 0 22px; }
    .wd-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    @media (min-width: 641px) {
      .wd { flex: 1; justify-content: center; }
    }
    @container (min-width: 760px) {
      .wd-window { width: clamp(280px, 38cqw, 410px); }
      .wd-sky { font-size: clamp(86px, 10cqw, 112px); }
      .wd-item {
        /* Leave room for the full seven-item rack on one row. */
        width: min(148px, calc((100cqw - 6 * var(--wd-rack-gap)) / 7));
        padding: 16px 6px;
      }
      .wd-item .wd-thing { font-size: clamp(50px, 6cqw, 68px); }
      .wd-item .wd-name { font-size: 0.95rem; }
    }
    @media (min-width: 641px) and (max-height: 700px) {
      body.game-deck #stage:has(> .wd) { min-height: 0; padding-block: 10px; }
      .wd { gap: 10px; padding: 6px 0; }
      .wd-window { display: flex; justify-content: center; align-items: center; gap: 14px; padding: 10px 12px; }
      .wd-sky { font-size: clamp(64px, 8cqw, 86px); }
      .wd-item { padding-block: 9px; }
    }
    @media (max-width: 560px) {
      .wd-sky { font-size: 58px; }
      .wd-item { width: clamp(64px, 28cqw, 88px); padding: 10px 6px; }
      .wd-item .wd-thing { font-size: 34px; }
      .wd-item .wd-name { font-size: 0.76rem; }
      .wd-actions .btn { min-width: 64px; min-height: 64px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .wd-item.yes { animation: none; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const dayById = (id) => DAYS.find((d) => d.id === id);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    const days = set.days.map(dayById);

    if (!document.getElementById('wd-style')) {
      const style = document.createElement('style');
      style.id = 'wd-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    /* The run walks the days more than once, reshuffled each time round, so two
       or three days still make a run of a decent length without settling into
       an order a child could answer without looking at the window. */
    const weather = [];
    while (weather.length < set.rounds) weather.push(...shuffle(days));
    weather.length = set.rounds;

    let round = 0;
    let found = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'wd';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.wd-hint').textContent = line; };

    function nextRound() {
      if (round >= weather.length) return finish();

      locked = false;
      found = 0;
      const day = weather[round];
      const need = Math.min(set.need, day.wear.length);
      const right = shuffle(day.wear).slice(0, need);
      /* The rack is filled out of the other days *this run is about*, so a run
         called "sun and rain" never quietly hands the child a scarf. */
      const wrong = shuffle(days.filter((d) => d.id !== day.id).flatMap((d) => d.wear))
        .slice(0, Math.max(0, set.rack - need));

      wrap.innerHTML = `
        <div class="wd-progress" role="img" aria-label="${text.step(round + 1, weather.length)}">
          ${weather.map((_, i) => `<span class="wd-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="wd-ask">
          <h2>${text.ask(day[lang] || day.he)}</h2>
          <p class="wd-hint" aria-live="polite">${text.lead(need)}</p>
        </div>
        <div class="wd-window">
          <span class="wd-sky" aria-hidden="true">${day.emoji}</span>
          <span class="wd-day">${day[lang] || day.he}</span>
        </div>
        <div class="wd-rack"></div>`;

      const rack = wrap.querySelector('.wd-rack');
      shuffle([...right, ...wrong]).forEach((item) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'wd-item';
        b.innerHTML = `
          <span class="wd-thing" aria-hidden="true">${item.emoji}</span>
          <span class="wd-name">${item[lang] || item.he}</span>`;
        b.addEventListener('click', () => pick(b, item, day, need));
        rack.append(b);
      });
    }

    function pick(button, item, day, need) {
      if (locked || button.disabled) return;

      if (!day.wear.includes(item)) {
        /* Wrong for today is not wrong: it wobbles, and the line says it
           belongs to another day rather than that the child was mistaken. */
        button.classList.remove('nope');
        void button.offsetWidth;
        button.classList.add('nope');
        hint(text.notThis);
        return;
      }

      button.classList.add('yes');
      button.disabled = true;
      found += 1;
      hint(text.found(found, need));

      if (found < need) return;

      locked = true;
      round += 1;
      later(nextRound, 700);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="wd-end">
          <div class="wd-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.dressedAll}</p>
          <div class="wd-actions">
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

  EDGames.register('weather-day', { sets: SETS, mount, unmount });
})();
