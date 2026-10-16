/* אותיות גדולות וקטנות / Big and Small Letters — every English letter has two shapes.

   Mother Duck carries a capital letter, and her ducklings each carry a small
   one. The voice says the letter's name — "Find the small letter for bee" —
   and the child finds the duckling that belongs to her. When they do, the
   duckling swims to its mother. A duckling from another family says its own
   letter's name.

   It is the English alphabet in both languages (it is the game for learning
   English letters); the instructions follow the page.

   Sets: A–H, I–R, S–Z, and the small letters that look alike (b d p q, m n u). */

(function () {
  const SETS = [
    { id: 'ah', emoji: '🐥', label: { he: 'A עד H', en: 'A to H' }, pool: [...'ABCDEFGH'], options: 3 },
    { id: 'ir', emoji: '🦆', label: { he: 'I עד R', en: 'I to R' }, pool: [...'IJKLMNOPQR'], options: 3 },
    { id: 'sz', emoji: '🔤', label: { he: 'S עד Z', en: 'S to Z' }, pool: [...'STUVWXYZ'], options: 3 },
    { id: 'alike', emoji: '🔍', label: { he: 'אותיות דומות', en: 'Look-alike letters' }, groups: ['bdpq', 'mnuh', 'iljt', 'vwyx', 'aeoc', 'fktl'].map((g) => [...g]), options: 4 },
  ];

  const TEXT = {
    he: { ask: (L) => `איזה ברווזון שייך לאמא ${L}?` },
    en: { ask: (L) => `Which duckling belongs to Mother ${L}?` },
  };

  const ROUNDS = 6;

  const CSS = `
    .bs-pond { direction: ltr; position: relative; width: min(100%, 640px); border-radius: var(--radius); padding: 18px 10px 22px; overflow: hidden;
      background: linear-gradient(180deg, #8fdcff, #3fb2e8); display: grid; gap: 14px; justify-items: center; }
    .bs-mom { display: flex; align-items: center; gap: 4px; }
    .bs-mom .duck { font-size: 72px; line-height: 1; }
    .bs-card { min-width: 76px; height: 76px; padding: 0 10px; border-radius: 18px; background: #fff; display: grid; place-items: center;
      font: 700 3.2rem/1 Fredoka, sans-serif; color: var(--sub-ink); box-shadow: 0 5px 0 rgba(0,0,0,.15); }
    .bs-kids { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .bs-kid { border: none; background: none; padding: 0; cursor: pointer; display: grid; justify-items: center; gap: 2px; transition: transform .6s ease; }
    .bs-kid .chick { font-size: 46px; line-height: 1; }
    .bs-kid .bs-card { min-width: 64px; height: 64px; font-size: 2.6rem; }
    .bs-kid.home { transform: translateY(-110px) scale(.8); opacity: .0; transition: transform .8s ease, opacity .8s .5s; }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('bs-style', CSS);

    let round = 0;
    let last = null;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function choose() {
      if (set.groups) {
        const g = EDKit.pick(set.groups);
        const opts = EDKit.shuffle(g).slice(0, set.options);
        return { opts, target: EDKit.pick(opts.filter((x) => x !== last) || opts) };
      }
      const target = EDKit.pick(set.pool.filter((x) => x.toLowerCase() !== last)).toLowerCase();
      const opts = EDKit.shuffle([target, ...EDKit.shuffle(set.pool.map((x) => x.toLowerCase()).filter((x) => x !== target)).slice(0, set.options - 1)]);
      return { opts, target };
    }

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const { opts, target } = choose();
      last = target;
      const big = target.toUpperCase();
      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(text.ask(big), lang)}
        <div class="bs-pond">
          <div class="bs-mom"><span class="duck" aria-hidden="true">🦆</span><span class="bs-card">${big}</span></div>
          <div class="bs-kids">${opts.map((ch) => `<button type="button" class="bs-kid" data-ch="${ch}" aria-label="${ch}"><span class="bs-card">${ch}</span><span class="chick" aria-hidden="true">🐥</span></button>`).join('')}</div>
        </div>`;
      const ask = ['bigsmall-ask', EDVoiceLines.letter(big)];
      EDKit.voice(wrap, ask, lang);
      wrap.querySelectorAll('.bs-kid').forEach((b) => b.addEventListener('click', () => {
        const ch = b.dataset.ch;
        if (ch !== target) { EDKit.nope(b); EDVoice.say([EDVoiceLines.letter(ch), ...ask], lang); return; }
        b.classList.add('home');
        wrap.querySelectorAll('.bs-kid').forEach((o) => { o.disabled = true; });
        EDVoice.say([EDVoiceLines.letter(ch), `praise-${1 + Math.floor(Math.random() * 4)}`], lang);
        round += 1;
        clock.later(next, 1900);
      }));
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('abc-big-small', { sets: SETS, mount, unmount });
})();
