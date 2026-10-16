/* צללים בטירה / Shadows in the Castle — whose shadow is in the magic mirror?

   The castle's magic mirror shows only a shadow. The child looks at the
   outline and finds who, or what, it belongs to among the fairytale things on
   the shelf — the crown, the glass slipper, the frog prince, the dragon. When
   they find it the mirror lights up, shows it in colour and says its name.

   Matching an outline to a picture is the early visual skill under reading
   letters (which are outlines too). The shadow is the same picture drawn black,
   so it is always exactly that shape.

   Sets: things that look nothing alike, more to choose from, and things that
   look alike (the princess, the fairy and the mermaid; the ring, the jewel and
   the crown). Pictures are older emoji that Windows 10 still draws. */

(function () {
  const ITEMS = {
    crown: '👑', princess: '👸', prince: '🤴', unicorn: '🦄', dragon: '🐉', castle: '🏰', frog: '🐸', shoe: '👠',
    ring: '💍', pumpkin: '🎃', fairy: '🧚', swan: '🦢', key: '🗝️', gem: '💎', horse: '🐴', apple: '🍎', rose: '🌹', mermaid: '🧜‍♀️',
  };

  const SETS = [
    { id: 'easy', emoji: '🪞', label: { he: 'צללים שונים', en: 'Different shadows' }, pool: ['crown', 'unicorn', 'castle', 'frog', 'shoe', 'pumpkin', 'dragon', 'apple', 'key'], options: 3 },
    { id: 'more', emoji: '👑', label: { he: 'יותר לבחור', en: 'More to choose' }, pool: Object.keys(ITEMS), options: 4 },
    { id: 'alike', emoji: '🧚', label: { he: 'צללים דומים', en: 'Look-alike shadows' }, groups: [['princess', 'fairy', 'mermaid', 'prince'], ['ring', 'gem', 'crown', 'key'], ['unicorn', 'horse', 'dragon', 'swan'], ['rose', 'apple', 'pumpkin', 'gem']], options: 4 },
  ];

  const TEXT = {
    he: { ask: 'של מי הצל במראה הקסומה?' },
    en: { ask: 'Whose shadow is in the magic mirror?' },
  };

  const ROUNDS = 5;

  const CSS = `
    .cs-hall { width: min(100%, 560px); border-radius: var(--radius); padding: 16px 12px 18px; display: grid; justify-items: center; gap: 16px;
      background: linear-gradient(180deg, #5b3fb3, #8a5ad8 60%, #b98ae8); position: relative; overflow: hidden; }
    .cs-hall::before { content: ''; position: absolute; inset: 0; background:
      radial-gradient(circle at 10% 15%, #fff 0 1.5px, transparent 2.5px), radial-gradient(circle at 88% 22%, #fff 0 2px, transparent 3px),
      radial-gradient(circle at 70% 8%, #fff 0 1.5px, transparent 2.5px), radial-gradient(circle at 30% 30%, #fff 0 1px, transparent 2px); opacity: .7; }
    .cs-mirror { position: relative; width: min(52vw, 210px, max(130px, calc((100vh - 480px) * .75))); aspect-ratio: 3 / 4; border-radius: 50% 50% 46% 46% / 40% 40% 30% 30%;
      background: radial-gradient(circle at 40% 30%, #ffffff, #dff3ff 50%, #a8d8f5); border: 12px solid #ffcf3f; box-shadow: 0 0 0 5px #e09a00, 0 0 40px rgba(255, 230, 140, .6);
      display: grid; place-items: center; }
    .cs-mirror::after { content: ''; position: absolute; top: -26px; left: 50%; transform: translateX(-50%); width: 40px; height: 30px;
      background: radial-gradient(circle at 50% 70%, #ff7eb6 0 9px, transparent 10px), linear-gradient(#ffcf3f, #e09a00); clip-path: polygon(0 100%, 20% 20%, 50% 60%, 80% 20%, 100% 100%); }
    .cs-shadow { font-size: clamp(70px, 20vw, 120px); line-height: 1; filter: brightness(0) opacity(.82); transition: filter .6s ease; }
    .cs-mirror.found .cs-shadow { filter: none; animation: kit-pop .6s ease; }
    .cs-mirror.found { box-shadow: 0 0 0 5px #e09a00, 0 0 70px 20px rgba(255, 240, 160, .9); }
    .cs-shelf { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .cs-shelf .kit-opt { font-size: 3rem; min-width: 96px; min-height: 96px; }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('cs-style', CSS);

    let round = 0;
    let last = null;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function choose() {
      if (set.groups) {
        const g = EDKit.pick(set.groups);
        const opts = EDKit.shuffle(g).slice(0, set.options);
        return { opts, target: EDKit.pick(opts.filter((x) => x !== last)) };
      }
      const opts = EDKit.shuffle(set.pool.filter((x) => x !== last)).slice(0, set.options);
      return { opts, target: EDKit.pick(opts) };
    }

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const { opts, target } = choose();
      last = target;
      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(text.ask, lang)}
        <div class="cs-hall">
          <div class="cs-mirror"><span class="cs-shadow" aria-hidden="true">${ITEMS[target]}</span></div>
          <div class="cs-shelf">${opts.map((k) => `<button type="button" class="kit-opt" data-k="${k}" aria-label="${k}">${ITEMS[k]}</button>`).join('')}</div>
        </div>`;
      EDKit.voice(wrap, 'shadow-ask', lang);
      wrap.querySelectorAll('.kit-opt').forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.k;
        if (k !== target) { EDKit.nope(b); EDVoice.say(`item-${k}`, lang); return; }
        EDKit.yes(b);
        wrap.querySelector('.cs-mirror').classList.add('found');
        wrap.querySelectorAll('.kit-opt').forEach((o) => { o.disabled = true; });
        EDVoice.say([`item-${k}`, `praise-${1 + Math.floor(Math.random() * 4)}`], lang);
        round += 1;
        clock.later(next, 2200);
      }));
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('castle-shadows', { sets: SETS, mount, unmount });
})();
