/* מי לא שייך? / Who Does Not Belong? — sorting by what a thing is.

   A few pictures from one family and one from another. After the answer the
   family is named, so a child who guessed still hears the idea behind it.

   Sets: far-apart families (three plus one), the same with more on the table, and
   close families where a quick look is not enough: the sea or the farm, fruit or
   vegetables, the sky or the road. */

(function () {
  const F = {
    animals: { he: 'חיות', en: 'animals', items: ['🐶', '🐱', '🐰', '🐮', '🐷', '🐸'] },
    food: { he: 'אוכל', en: 'food', items: ['🍎', '🍌', '🍕', '🍓', '🍞', '🧀'] },
    vehicles: { he: 'כלי תחבורה', en: 'vehicles', items: ['🚗', '🚌', '🚲', '🚂', '🚜', '⛵'] },
    clothes: { he: 'בגדים', en: 'clothes', items: ['👕', '👗', '👟', '🧦', '🧢', '🧤'] },
    sea: { he: 'חיות ים', en: 'sea animals', items: ['🐟', '🐬', '🐙', '🦀', '🐳', '🦈'] },
    farm: { he: 'חיות משק', en: 'farm animals', items: ['🐮', '🐷', '🐔', '🐑', '🐴', '🦆'] },
    fruit: { he: 'פירות', en: 'fruit', items: ['🍎', '🍌', '🍇', '🍓', '🍐', '🍊'] },
    veg: { he: 'ירקות', en: 'vegetables', items: ['🥕', '🥦', '🌽', '🍅', '🥒', '🍆'] },
    sky: { he: 'דברים שעפים', en: 'things that fly', items: ['✈️', '🚁', '🎈', '🚀', '🦅', '🐝'] },
    road: { he: 'דברים שנוסעים על כביש', en: 'things on the road', items: ['🚗', '🚌', '🚕', '🚑', '🚒', '🚚'] },
  };

  const FAR = [['animals', 'food'], ['food', 'vehicles'], ['vehicles', 'clothes'], ['clothes', 'animals'], ['animals', 'vehicles'], ['food', 'clothes']];
  const CLOSE = [['sea', 'farm'], ['farm', 'sea'], ['fruit', 'veg'], ['veg', 'fruit'], ['sky', 'road'], ['road', 'sky']];

  const SETS = [
    { id: 'three', emoji: '🐶', label: { he: 'ארבע תמונות', en: 'Four pictures' }, same: 3, pairs: FAR },
    { id: 'five', emoji: '🍎', label: { he: 'שש תמונות', en: 'Six pictures' }, same: 5, pairs: FAR },
    { id: 'close', emoji: '🐬', label: { he: 'משפחות קרובות', en: 'Close families' }, same: 3, pairs: CLOSE },
  ];

  const TEXT = {
    he: { ask: 'מי לא שייך?', all: (name) => `כל השאר: ${name}` },
    en: { ask: 'Who does not belong?', all: (name) => `All the others: ${name}` },
  };

  const CSS = `
    .oo-grid { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; max-width: 480px; }
    .oo-grid .kit-opt { width: 112px; height: 112px; font-size: 3.4rem; }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('oo-style', CSS);

    const rounds = EDKit.shuffle(set.pairs);
    let round = 0;
    let busy = false;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function next() {
      if (round >= rounds.length) return EDKit.end(wrap, ctx, lang);
      busy = false;
      const [mainId, oddId] = rounds[round];
      const main = F[mainId];
      const odd = EDKit.pick(F[oddId].items.filter((e) => !main.items.includes(e)));
      const shown = EDKit.shuffle([...EDKit.shuffle(main.items).slice(0, set.same), odd]);
      wrap.innerHTML = `
        ${EDKit.dots(rounds.length, round)}
        ${EDKit.head(text.ask, lang)}
        <p class="kit-hint" aria-live="polite"></p>
        <div class="oo-grid">
          ${shown.map((e) => `<button type="button" class="kit-opt" data-odd="${e === odd}">${e}</button>`).join('')}
        </div>`;
      EDKit.voice(wrap, 'odd-ask', lang);
      wrap.querySelectorAll('.kit-opt').forEach((b) => b.addEventListener('click', () => {
        if (busy) return;
        if (b.dataset.odd !== 'true') { EDKit.nope(b); EDVoice.say('try-again', lang); return; }
        busy = true;
        EDKit.yes(b);
        wrap.querySelector('.kit-hint').textContent = text.all(main[lang]);
        EDKit.praise(lang);
        round += 1;
        clock.later(next, 1900);
      }));
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('odd-one-out', { sets: SETS, mount, unmount });
})();
