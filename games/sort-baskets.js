/* מסדרים לסלים / Sort into Baskets — one rule at a time.

   Things arrive one by one and each goes in its basket. The basket says what it
   holds in a picture and in a word, so it can be played before reading.

   Sets: by colour (red, blue), by where it lives (land, sea), by what it is (food, toys). */

(function () {
  const SETS = [
    {
      id: 'colour', emoji: '🎨', label: { he: 'לפי צבע', en: 'By colour' },
      a: { sign: '❤️', name: { he: 'אדום', en: 'Red' }, items: ['🍎', '🍓', '🍅', '🚒', '🌹', '🌶️'] },
      b: { sign: '💙', name: { he: 'כחול', en: 'Blue' }, items: ['🐳', '👖', '🌊', '🚙', '🧢', '🐟'] },
    },
    {
      id: 'place', emoji: '🌊', label: { he: 'יבשה וים', en: 'Land and sea' },
      a: { sign: '🌳', name: { he: 'ביבשה', en: 'On land' }, items: ['🐮', '🐶', '🐘', '🦒', '🐴', '🐰'] },
      b: { sign: '🌊', name: { he: 'בים', en: 'In the sea' }, items: ['🐟', '🐬', '🐙', '🦀', '🐳', '🦈'] },
    },
    {
      id: 'kind', emoji: '🧸', label: { he: 'אוכל וצעצועים', en: 'Food and toys' },
      a: { sign: '🍽️', name: { he: 'אוכל', en: 'Food' }, items: ['🍎', '🥕', '🍞', '🧀', '🍕', '🍌'] },
      b: { sign: '🧸', name: { he: 'צעצועים', en: 'Toys' }, items: ['🎈', '⚽', '🎲', '🚂', '🪁', '🎯'] },
    },
  ];
  /* 🪁 is Emoji 12, the newest a Windows 10 machine draws. */

  const TEXT = {
    he: { ask: 'לאיזה סל זה הולך?' },
    en: { ask: 'Which basket does it go in?' },
  };

  const PER_RUN = 8;

  const CSS = `
    .sb-item { font-size: 4.4rem; line-height: 1.15; animation: sb-in .35s cubic-bezier(.3,1.6,.5,1); }
    .sb-item.going { transition: transform .35s ease-in, opacity .35s ease-in; transform: scale(.3) translateY(90px); opacity: 0; }
    @keyframes sb-in { from { transform: scale(.4); opacity: 0; } }
    .sb-row { display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; width: 100%; }
    .sb-basket { width: min(36vw, 200px); padding: 14px 10px 12px; border-radius: 26px; border: 3px solid #b77a36; background: linear-gradient(180deg, #f0c48a, #d79a52);
      box-shadow: 0 7px 0 #a86d38; cursor: pointer; font: inherit; color: #4a2c0c; font-weight: 700; font-size: 1.1rem; }
    .sb-basket:active { transform: translateY(4px); box-shadow: 0 3px 0 #a86d38; }
    .sb-sign { display: block; font-size: 3rem; line-height: 1.2; }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const set = ctx.set || SETS[0];
    EDKit.style('sb-style', CSS);

    /* Half and half, so guessing one basket all the way never wins. */
    const pick = (side) => EDKit.shuffle(set[side].items).slice(0, PER_RUN / 2).map((e) => ({ e, side }));
    const queue = EDKit.shuffle([...pick('a'), ...pick('b')]);
    let round = 0;
    let busy = false;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function next() {
      if (round >= queue.length) return EDKit.end(wrap, ctx, lang);
      busy = false;
      const { e, side } = queue[round];
      wrap.innerHTML = `
        ${EDKit.dots(queue.length, round)}
        ${EDKit.head(TEXT[lang].ask, lang)}
        <div class="sb-item" aria-hidden="true">${e}</div>
        <div class="sb-row">
          ${['a', 'b'].map((s) => `<button type="button" class="sb-basket" data-side="${s}"><span class="sb-sign" aria-hidden="true">${set[s].sign}</span>${EDLang.pick(set[s].name)}</button>`).join('')}
        </div>`;
      if (round === 0) EDKit.voice(wrap, 'sort-ask', lang);
      else wrap.querySelector('.kit-say').onclick = () => EDVoice.say('sort-ask', lang);
      wrap.querySelectorAll('.sb-basket').forEach((b) => b.addEventListener('click', () => {
        if (busy) return;
        if (b.dataset.side !== side) { EDKit.nope(b); EDVoice.say('try-again', lang); return; }
        busy = true;
        wrap.querySelector('.sb-item').classList.add('going');
        if (round % 3 === 2) EDKit.praise(lang);
        round += 1;
        clock.later(next, 650);
      }));
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('sort-baskets', { sets: SETS, mount, unmount });
})();
