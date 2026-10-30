/* מעבדת הצבעים / The Colour Lab — what happens when colours meet.

   A colour is asked for; two pots are poured into the flask. A wrong mix is still
   an answer, and a real one: the flask shows what those two really make, and the
   sum stays on screen for a moment. Nothing is wasted, it is just an experiment.

   Sets: the three classic mixes, lighter shades with white and black, and all six
   with every pot on the shelf. */

(function () {
  const PAINT = {
    red: { hex: '#e53935', name: { he: 'אדום', en: 'red' } },
    yellow: { hex: '#fdd835', name: { he: 'צהוב', en: 'yellow' } },
    blue: { hex: '#1e88e5', name: { he: 'כחול', en: 'blue' } },
    white: { hex: '#ffffff', name: { he: 'לבן', en: 'white' } },
    black: { hex: '#33373d', name: { he: 'שחור', en: 'black' } },
    orange: { hex: '#fb8c00', name: { he: 'כתום', en: 'orange' } },
    green: { hex: '#43a047', name: { he: 'ירוק', en: 'green' } },
    purple: { hex: '#8e24aa', name: { he: 'סגול', en: 'purple' } },
    pink: { hex: '#f48fb1', name: { he: 'ורוד', en: 'pink' } },
    lightblue: { hex: '#81d4fa', name: { he: 'תכלת', en: 'light blue' } },
    gray: { hex: '#9e9e9e', name: { he: 'אפור', en: 'grey' } },
    muddy: { hex: '#7a6a4f', name: { he: 'צבע בוץ', en: 'a muddy colour' } },
  };

  const MIX = {
    'red+yellow': 'orange', 'blue+yellow': 'green', 'blue+red': 'purple',
    'red+white': 'pink', 'blue+white': 'lightblue', 'black+white': 'gray',
  };
  const mixOf = (a, b) => {
    if (a === b) return a;
    return MIX[[a, b].sort().join('+')] || 'muddy';
  };

  const SETS = [
    { id: 'first', emoji: '🧡', label: { he: 'הצבעים הראשונים', en: 'The first colours' }, targets: ['orange', 'green', 'purple'], pots: ['red', 'yellow', 'blue'] },
    { id: 'light', emoji: '🌸', label: { he: 'בהיר וכהה', en: 'Light and dark' }, targets: ['pink', 'lightblue', 'gray'], pots: ['red', 'blue', 'white', 'black'] },
    { id: 'all', emoji: '🌈', label: { he: 'כל הצבעים', en: 'All the colours' }, targets: ['orange', 'green', 'purple', 'pink', 'lightblue', 'gray'], pots: ['red', 'yellow', 'blue', 'white', 'black'] },
  ];

  const TEXT = {
    he: { ask: (c) => `מערבבים שני צבעים כדי לקבל ${c}`, pot: (c) => `לשפוך ${c}` },
    en: { ask: (c) => `Mix two colours to make ${c}`, pot: (c) => `pour ${c}` },
  };

  const CSS = `
    .cl-bench { display: flex; align-items: flex-end; justify-content: center; gap: 28px; flex-wrap: wrap; }
    .cl-goal { display: grid; justify-items: center; gap: 4px; font-weight: 600; font-size: .95rem; color: var(--text-soft); }
    .cl-splat { width: 92px; height: 92px; border-radius: 47% 53% 42% 58% / 55% 45% 58% 42%; border: 3px solid rgba(0,0,0,.08); }
    .cl-flask { width: 130px; display: block; }
    .cl-sum { min-height: 42px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; }
    .cl-dot { width: 30px; height: 30px; border-radius: 50%; border: 2px solid rgba(0,0,0,.15); display: inline-block; }
    .cl-pots { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .cl-pot { width: 76px; height: 84px; border: none; background: none; padding: 0; cursor: pointer; }
    .cl-pot svg { width: 100%; height: 100%; display: block; }
    .cl-pot:active { transform: translateY(4px); }
    .cl-pot[disabled] { cursor: default; }
  `;

  const POT = (hex) => `<svg viewBox="0 0 80 88" aria-hidden="true">
    <path d="M14 26h52l-5 52c-.4 4-3 6-7 6H26c-4 0-6.6-2-7-6z" fill="#dfe6ef"/>
    <path d="M15.5 34h49l-4.3 44c-.3 3-2 4.6-5.2 4.6H25c-3.2 0-4.9-1.6-5.2-4.6z" fill="${hex}" stroke="rgba(0,0,0,.12)"/>
    <rect x="10" y="20" width="60" height="10" rx="5" fill="#b8c4d4"/>
  </svg>`;

  const FLASK = (hex) => `<svg class="cl-flask" viewBox="0 0 120 150" aria-hidden="true">
    <path d="M47 18v42L18 118c-5 11 2 22 14 22h56c12 0 19-11 14-22L73 60V18z" fill="#f2f7fc" stroke="#9fb1c7" stroke-width="5" stroke-linejoin="round"/>
    <path d="M38 88h44l16 32c3 7-1 14-9 14H31c-8 0-12-7-9-14z" fill="${hex}"/>
    <rect x="40" y="10" width="40" height="11" rx="5.5" fill="#9fb1c7"/>
    <path d="M56 40v18" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
  </svg>`;

  const EMPTY = '#f2f7fc';

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('cl-style', CSS);

    const targets = EDKit.shuffle(set.targets);
    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function next() {
      if (round >= targets.length) return EDKit.end(wrap, ctx, lang);
      const target = targets[round];
      let first = null;
      let busy = false;
      wrap.innerHTML = `
        ${EDKit.dots(targets.length, round)}
        ${EDKit.head(text.ask(PAINT[target].name[lang]), lang)}
        <div class="cl-bench">
          <div class="cl-goal"><span class="cl-splat" style="background:${PAINT[target].hex}"></span>${PAINT[target].name[lang]}</div>
          <div class="cl-flask-box">${FLASK(EMPTY)}</div>
        </div>
        <div class="cl-sum" dir="ltr" aria-live="polite"></div>
        <div class="cl-pots">
          ${set.pots.map((c) => `<button type="button" class="cl-pot" data-c="${c}" aria-label="${text.pot(PAINT[c].name[lang])}">${POT(PAINT[c].hex)}</button>`).join('')}
        </div>`;
      EDKit.voice(wrap, ['lab-ask', `color-${target}`], lang);

      const flask = wrap.querySelector('.cl-flask-box');
      const sum = wrap.querySelector('.cl-sum');
      const dot = (c) => `<span class="cl-dot" style="background:${PAINT[c].hex}" title="${PAINT[c].name[lang]}"></span>`;

      wrap.querySelectorAll('.cl-pot').forEach((b) => b.addEventListener('click', () => {
        if (busy) return;
        const c = b.dataset.c;
        if (!first) {
          first = c;
          flask.innerHTML = FLASK(PAINT[c].hex);
          sum.innerHTML = `${dot(c)} +`;
          return;
        }
        busy = true;
        const made = mixOf(first, c);
        flask.innerHTML = FLASK(PAINT[made].hex);
        sum.innerHTML = `${dot(first)} + ${dot(c)} = ${dot(made)}`;
        if (made === target) {
          EDKit.praise(lang);
          EDKit.confetti(18);
          round += 1;
          clock.later(next, 2100);
        } else {
          EDVoice.say('lab-oops', lang);
          clock.later(() => {
            first = null;
            busy = false;
            flask.innerHTML = FLASK(EMPTY);
            sum.innerHTML = '';
          }, 2200);
        }
      }));
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('color-lab', { sets: SETS, mount, unmount });
})();
