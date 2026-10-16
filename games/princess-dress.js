/* מלבישים את הנסיכה / Dress the Princess — listening to what she asks for.

   The princess is going to the ball and says what she wants to wear: a pink
   dress, then a crown with a blue jewel, then red shoes. The child listens and
   dresses her — the dress, the jewel and the shoes change on the princess
   herself, a drawn one rather than a picture of one, so every choice is seen
   on her straight away. When she is dressed she twirls.

   What it teaches is the thing a three-year-old practises all day: holding one
   spoken request in mind and acting on it, then two in a row, then three. The
   colours are said, never written, so nothing needs reading.

   Sets: the dress, the dress and the crown, the whole outfit (and more colours). */

(function () {
  const COLOURS = {
    pink: '#ff7eb6', purple: '#a66cff', blue: '#4aa3ff', yellow: '#ffd23f', green: '#3ccf7a', red: '#ff4d4d',
  };
  const NAMES = {
    he: { pink: 'ורוד', purple: 'סגול', blue: 'כחול', yellow: 'צהוב', green: 'ירוק', red: 'אדום' },
    en: { pink: 'pink', purple: 'purple', blue: 'blue', yellow: 'yellow', green: 'green', red: 'red' },
  };

  /* Hebrew colour words agree with what they describe. */
  const FEM = { pink: 'ורודה', purple: 'סגולה', blue: 'כחולה', yellow: 'צהובה', green: 'ירוקה', red: 'אדומה' };
  const PLURAL = { pink: 'ורודות', purple: 'סגולות', blue: 'כחולות', yellow: 'צהובות', green: 'ירוקות', red: 'אדומות' };

  const SETS = [
    { id: 'dress', emoji: '👗', label: { he: 'שמלה', en: 'The dress' }, parts: ['dress'], options: 3 },
    { id: 'crown', emoji: '👑', label: { he: 'שמלה וכתר', en: 'Dress and crown' }, parts: ['dress', 'gem'], options: 3 },
    { id: 'all', emoji: '👠', label: { he: 'כל הבגדים', en: 'The whole outfit' }, parts: ['dress', 'gem', 'shoes'], options: 4 },
  ];

  const TEXT = {
    he: {
      ask: { dress: (c) => `הנסיכה רוצה שמלה ${FEM[c]}`, gem: (c) => `ועכשיו כתר עם אבן ${FEM[c]}`, shoes: (c) => `ונעליים ${PLURAL[c]}` },
      ready: 'הנסיכה מוכנה לנשף!',
    },
    en: {
      ask: { dress: (c) => `The princess wants a ${NAMES.en[c]} dress`, gem: (c) => `Now a crown with a ${NAMES.en[c]} jewel`, shoes: (c) => `And ${NAMES.en[c]} shoes` },
      ready: 'The princess is ready for the ball!',
    },
  };

  const ROUNDS = 3;

  const CSS = `
    .pd-room { position: relative; width: min(100%, 520px); border-radius: var(--radius); padding: 10px 0 0;
      background: radial-gradient(circle at 50% 20%, #fff5fb 0 30%, #ffd6ea 60%, #f7b6d6); overflow: hidden; display: grid; place-items: center; }
    .pd-room::before { content: ''; position: absolute; inset: 0; background:
      radial-gradient(circle at 12% 18%, #fff 0 2px, transparent 3px), radial-gradient(circle at 85% 30%, #fff 0 2px, transparent 3px),
      radial-gradient(circle at 70% 10%, #fff 0 1.5px, transparent 3px), radial-gradient(circle at 25% 60%, #fff 0 1.5px, transparent 3px); }
    /* Sized to the height left on the screen, so the colours to pick stay in view on a laptop. */
    .pd-girl { position: relative; width: min(64vw, clamp(140px, calc((100vh - 462px) / 1.5), 250px)); height: auto; display: block; }
    .pd-girl .pd-dress, .pd-girl .pd-gem, .pd-girl .pd-shoe { transition: fill .35s ease; }
    .pd-girl.twirl { animation: pd-twirl 1.4s ease; transform-origin: 50% 90%; }
    @keyframes pd-twirl { 30% { transform: rotateY(180deg) scale(1.04); } 60% { transform: rotateY(360deg) scale(1.04); } }
    .pd-opts { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .pd-opt { width: 86px; height: 86px; padding: 8px; border-radius: 22px; border: 2px solid var(--border); background: var(--surface); cursor: pointer;
      box-shadow: 0 6px 0 var(--edge, var(--border)); display: grid; place-items: center; }
    .pd-opt:active { transform: translateY(4px); box-shadow: 0 2px 0 var(--edge, var(--border)); }
    .pd-opt svg { width: 100%; height: 100%; }
    .pd-sparkle { position: absolute; font-size: 26px; animation: pd-spark 1.4s ease forwards; pointer-events: none; }
    @keyframes pd-spark { from { transform: scale(0); opacity: 1; } to { transform: translateY(-50px) scale(1.3); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .pd-girl.twirl, .pd-sparkle { animation: none; } }
  `;

  /* The princess, drawn on a 200 × 300 page. The dress, the jewel and the
     shoes carry classes so the game can recolour them. */
  const GIRL = `
    <svg class="pd-girl" viewBox="0 0 200 300" aria-hidden="true">
      <ellipse cx="100" cy="292" rx="70" ry="7" fill="#000" opacity=".12"/>
      <path d="M58 70c-6 40-2 92 10 120h64c12-28 16-80 10-120-4-30-24-44-42-44s-38 14-42 44z" fill="#f2b33d"/>
      <path class="pd-shoe" d="M70 278c0-7 8-10 16-10s10 4 10 10z" fill="#e3e3ea"/>
      <path class="pd-shoe" d="M104 278c0-6 2-10 10-10s16 3 16 10z" fill="#e3e3ea"/>
      <path class="pd-dress" d="M78 112h44l6 40c22 30 36 76 40 122H32c4-46 18-92 40-122z" fill="#eef0f5"/>
      <path d="M50 230c16 10 34 14 50 14s34-4 50-14l6 22c-18 10-36 14-56 14s-38-4-56-14z" fill="#fff" opacity=".35"/>
      <path d="M72 152c18 8 38 8 56 0" stroke="#fff" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
      <circle class="pd-dress" cx="72" cy="118" r="13" fill="#eef0f5"/>
      <circle class="pd-dress" cx="128" cy="118" r="13" fill="#eef0f5"/>
      <path d="M62 126c-8 18-10 34-4 44M138 126c8 18 10 34 4 44" stroke="#f7d1b5" stroke-width="9" stroke-linecap="round" fill="none"/>
      <rect x="93" y="96" width="14" height="18" rx="5" fill="#f7d1b5"/>
      <circle cx="100" cy="72" r="30" fill="#f7d1b5"/>
      <path d="M70 70c0-22 14-34 30-34s30 12 30 34c-8-12-20-18-30-18s-22 6-30 18z" fill="#f2b33d"/>
      <circle cx="89" cy="74" r="3.6" fill="#1e2a44"/><circle cx="111" cy="74" r="3.6" fill="#1e2a44"/>
      <circle cx="90.2" cy="72.8" r="1.2" fill="#fff"/><circle cx="112.2" cy="72.8" r="1.2" fill="#fff"/>
      <circle cx="82" cy="84" r="5" fill="#ff9eb8" opacity=".6"/><circle cx="118" cy="84" r="5" fill="#ff9eb8" opacity=".6"/>
      <path d="M92 88c5 5 11 5 16 0" stroke="#c0505f" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M76 44l8-20 10 14 6-18 6 18 10-14 8 20z" fill="#ffd23f" stroke="#e0a800" stroke-width="2" stroke-linejoin="round"/>
      <circle class="pd-gem" cx="100" cy="36" r="5.5" fill="#e3e3ea" stroke="#fff" stroke-width="1.5"/>
    </svg>`;

  const ICON = {
    dress: (c) => `<svg viewBox="0 0 60 60"><path d="M24 8h12l2 12c8 10 12 22 13 34H9c1-12 5-24 13-34z" fill="${c}"/><path d="M18 40h24" stroke="#fff" stroke-width="3" opacity=".6"/></svg>`,
    gem: (c) => `<svg viewBox="0 0 60 60"><path d="M10 40l6-24 9 12 5-16 5 16 9-12 6 24z" fill="#ffd23f" stroke="#e0a800" stroke-width="2"/><circle cx="30" cy="34" r="9" fill="${c}" stroke="#fff" stroke-width="2"/></svg>`,
    shoes: (c) => `<svg viewBox="0 0 60 60"><path d="M8 40c0-10 10-14 20-12l14 6c6 2 10 6 10 10v4H8z" fill="${c}"/><path d="M44 48v6" stroke="${c}" stroke-width="5" stroke-linecap="round"/></svg>`,
  };

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('pd-style', CSS);

    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function nextRound() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang, text.ready);
      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head('', lang)}
        <div class="pd-room">${GIRL}</div>
        <div class="pd-opts"></div>`;
      let part = 0;
      ask();

      function ask() {
        const which = set.parts[part];
        const wanted = EDKit.pick(Object.keys(COLOURS));
        const options = EDKit.shuffle([wanted, ...EDKit.shuffle(Object.keys(COLOURS).filter((c) => c !== wanted)).slice(0, set.options - 1)]);
        wrap.querySelector('.kit-head h2').textContent = text.ask[which](wanted);
        EDKit.voice(wrap, `${which}-${wanted}`, lang);
        const row = wrap.querySelector('.pd-opts');
        row.innerHTML = options.map((c) => `<button type="button" class="pd-opt" data-c="${c}" aria-label="${NAMES[lang][c]}">${ICON[which](COLOURS[c])}</button>`).join('');
        row.querySelectorAll('.pd-opt').forEach((b) => b.addEventListener('click', () => {
          if (b.dataset.c !== wanted) { EDKit.nope(b); EDVoice.say(`${which}-${wanted}`, lang); return; }
          const cls = which === 'shoes' ? '.pd-shoe' : which === 'gem' ? '.pd-gem' : '.pd-dress';
          wrap.querySelectorAll(cls).forEach((el) => el.setAttribute('fill', COLOURS[wanted]));
          sparkle();
          row.querySelectorAll('.pd-opt').forEach((o) => { o.disabled = true; });
          part += 1;
          if (part < set.parts.length) { clock.later(ask, 900); return; }
          /* Dressed: she twirls, and on to the next outfit. */
          clock.later(() => {
            wrap.querySelector('.pd-girl').classList.add('twirl');
            wrap.querySelector('.kit-head h2').textContent = text.ready;
            EDVoice.say('dress-ready', lang);
            EDKit.confetti(30);
            round += 1;
            clock.later(nextRound, 3200);
          }, 600);
        }));
      }
    }

    function sparkle() {
      const room = wrap.querySelector('.pd-room');
      for (let i = 0; i < 6; i += 1) {
        const s = document.createElement('span');
        s.className = 'pd-sparkle';
        s.textContent = '✨';
        s.style.left = `${20 + Math.random() * 60}%`;
        s.style.top = `${20 + Math.random() * 60}%`;
        room.append(s);
        clock.later(() => s.remove(), 1500);
      }
    }

    nextRound();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('princess-dress', { sets: SETS, mount, unmount });
})();
