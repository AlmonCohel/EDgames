/* אות אחרי אות / Spell It — the spelling workshop.

   The word is said, the picture is shown, and the letters are scattered on the
   workbench. Each tile can be tapped or dragged onto the row of blanks, always
   in order, left to right: the order is the lesson. Every tile says its letter
   name when touched, so the child hears "see... ay... tee" while the word
   builds. A wrong tile drops back with a thud; after two misses on the same
   blank the right tile glows. A finished word is said whole, ripples through
   its letters, and is shown with its Hebrew beside it.

   Sets: three letters, four letters (plus one letter that belongs to nothing),
   five letters (plus two). */

(function () {
  const SETS = [
    {
      id: 'three', emoji: '🐱', label: { he: 'שלוש אותיות', en: 'Three letters' }, extra: 0,
      words: [['cat', '🐱', 'חתול'], ['dog', '🐶', 'כלב'], ['sun', '☀️', 'שמש'], ['hat', '🎩', 'כובע'], ['bus', '🚌', 'אוטובוס'], ['pig', '🐷', 'חזיר'], ['bee', '🐝', 'דבורה'], ['fox', '🦊', 'שועל'], ['key', '🔑', 'מפתח'], ['egg', '🥚', 'ביצה']],
    },
    {
      id: 'four', emoji: '🐸', label: { he: 'ארבע אותיות', en: 'Four letters' }, extra: 1,
      words: [['frog', '🐸', 'צפרדע'], ['fish', '🐟', 'דג'], ['milk', '🥛', 'חלב'], ['tree', '🌳', 'עץ'], ['bird', '🐦', 'ציפור'], ['cake', '🍰', 'עוגה'], ['star', '⭐', 'כוכב'], ['duck', '🦆', 'ברווז'], ['ship', '🚢', 'ספינה'], ['bear', '🐻', 'דוב']],
    },
    {
      id: 'five', emoji: '🍎', label: { he: 'חמש אותיות', en: 'Five letters' }, extra: 2,
      words: [['apple', '🍎', 'תפוח'], ['horse', '🐴', 'סוס'], ['house', '🏠', 'בית'], ['plane', '✈️', 'מטוס'], ['bread', '🍞', 'לחם'], ['snake', '🐍', 'נחש'], ['mouse', '🐭', 'עכבר'], ['tiger', '🐯', 'נמר'], ['lemon', '🍋', 'לימון'], ['sheep', '🐑', 'כבשה']],
    },
  ];

  const TEXT = {
    he: { ask: 'שומעים ומאייתים את המילה', done: 'כתבתם את המילה!' },
    en: { ask: 'Listen and spell the word', done: 'You spelled it!' },
  };

  const ROUNDS = 5;
  const SCALE = [523, 587, 659, 698, 784, 880];

  const CSS = `
    .sp { gap: 12px; }
    .sp-pic { width: 150px; height: 150px; border-radius: 50%; display: grid; place-items: center; font-size: 4.4rem; line-height: 1.25; overflow: visible;
      background: radial-gradient(circle at 35% 30%, #fff 0%, var(--sub-tint) 72%); border: 3px solid #fff;
      box-shadow: 0 10px 0 var(--sub-edge, rgba(0,0,0,.2)), 0 18px 28px rgba(30,42,68,.16); animation: sp-bob 3s ease-in-out infinite; }
    @keyframes sp-bob { 50% { transform: translateY(-6px); } }
    .sp-slots { display: flex; gap: 8px; justify-content: center; direction: ltr; margin-top: 6px; min-height: 76px; }
    .sp-slot { width: clamp(46px, 14vw, 62px); height: clamp(60px, 18vw, 76px); border-radius: 14px; display: grid; place-items: center;
      font: 700 clamp(2rem, 9vw, 2.8rem)/1 Fredoka, system-ui, sans-serif; color: #fff; background: rgba(255,255,255,.7);
      border: 3px dashed var(--border); transition: border-color .2s, background .2s; }
    .sp-slot.now { border-color: var(--sub-solid); background: #fff; animation: sp-pulse 1.3s ease-in-out infinite; }
    .sp-slot.in { border: 3px solid var(--sub-edge); background: var(--sub-solid); box-shadow: 0 5px 0 var(--sub-edge); animation: sp-land .35s cubic-bezier(.3,1.7,.5,1); }
    @keyframes sp-pulse { 50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--sub-solid) 22%, transparent); } }
    @keyframes sp-land { 0% { transform: translateY(-22px) scale(1.25); } 100% { transform: none; } }
    .sp-slot.wave { animation: sp-wave .6s ease both; animation-delay: calc(var(--i) * 90ms); }
    @keyframes sp-wave { 40% { transform: translateY(-16px) scale(1.12); } }
    .sp-gloss { min-height: 2.2rem; display: flex; gap: 12px; align-items: baseline; justify-content: center; font-weight: 700; }
    .sp-gloss b { font-size: 1.5rem; color: var(--sub-ink); }
    .sp-gloss span { font-size: 1.15rem; color: var(--text-soft); }
    .sp-bench { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 420px; padding: 14px; border-radius: 22px;
      background: linear-gradient(#e7c595, #d2a56a); box-shadow: inset 0 3px 0 rgba(255,255,255,.35), 0 6px 0 #a8773d; direction: ltr; }
    .sp-tile { width: clamp(50px, 15vw, 64px); height: clamp(58px, 17vw, 72px); border-radius: 12px; border: none; cursor: grab;
      font: 700 clamp(1.9rem, 8vw, 2.6rem)/1 Fredoka, system-ui, sans-serif; color: var(--text); background: #fffdf6;
      box-shadow: 0 5px 0 #c9b88f, 0 8px 10px rgba(60,40,10,.25); transform: rotate(var(--tilt, 0deg)); transition: transform .15s; }
    .sp-tile:active { cursor: grabbing; }
    .sp-tile.used { visibility: hidden; }
    .sp-tile.glow { animation: sp-glow 0.9s ease-in-out infinite; }
    @keyframes sp-glow { 50% { box-shadow: 0 0 0 6px #ffd23f, 0 5px 0 #c9b88f; transform: translateY(-6px) rotate(var(--tilt, 0deg)); } }
    @media (prefers-reduced-motion: reduce) { .sp-pic, .sp-slot.now, .sp-slot.wave, .sp-slot.in, .sp-tile.glow { animation: none; } }
  `;

  const clock = EDKit.timers();
  const ABC = 'abcdefghijklmnopqrstuvwxyz';

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const set = ctx.set || SETS[0];
    EDKit.style('sp-style', CSS);

    const words = EDKit.shuffle(set.words).slice(0, ROUNDS);
    let round = 0;
    let busy = false;
    const wrap = document.createElement('div');
    wrap.className = 'kit sp';
    root.append(wrap);

    const wordKey = (w) => ({ key: `word-${w}`, lang: 'en' });
    const letterKey = (c) => ({ key: `letter-${c}`, lang: 'en' });

    function next() {
      if (round >= words.length) return EDKit.end(wrap, ctx, lang, TEXT[lang].done);
      busy = false;
      const [word, pic, he] = words[round];
      const letters = word.split('');
      const spare = EDKit.shuffle(ABC.split('').filter((c) => !letters.includes(c))).slice(0, set.extra);
      let tiles = EDKit.shuffle([...letters, ...spare]);
      /* A shuffle that happens to spell the word is not a puzzle. */
      if (!spare.length && tiles.join('') === word) tiles = tiles.reverse();
      let at = 0;
      let misses = 0;

      wrap.innerHTML = `
        ${EDKit.dots(words.length, round)}
        ${EDKit.head(TEXT[lang].ask, lang)}
        <div class="sp-pic" aria-hidden="true">${pic}</div>
        <div class="sp-slots" role="group" aria-label="${word.length}">
          ${letters.map(() => '<div class="sp-slot"></div>').join('')}
        </div>
        <div class="sp-gloss" aria-live="polite"></div>
        <div class="sp-bench">
          ${tiles.map((c, i) => `<button type="button" class="sp-tile" data-c="${c}" style="--tilt:${(i % 3 - 1) * 2.5}deg" aria-label="${c}">${c}</button>`).join('')}
        </div>`;
      const slots = [...wrap.querySelectorAll('.sp-slot')];
      const bench = [...wrap.querySelectorAll('.sp-tile')];
      const mark = () => {
        slots.forEach((s, i) => s.classList.toggle('now', i === at));
        bench.forEach((b) => b.classList.remove('glow'));
      };
      mark();

      EDKit.voice(wrap, round === 0 ? ['spell-ask', wordKey(word)] : [wordKey(word)], lang);
      const say = wrap.querySelector('.kit-say');
      say.onclick = () => { say.classList.remove('nudge'); EDVoice.say([wordKey(word)], lang); };

      function place(tile) {
        if (busy || tile.classList.contains('used')) return;
        const c = tile.dataset.c;
        if (c !== letters[at]) {
          misses += 1;
          EDKit.nope(tile);
          EDSound.note(170, { seconds: 0.22, wave: 'triangle', gain: 0.2 });
          EDVoice.say([letterKey(c)], lang);
          if (misses >= 2) {
            const right = bench.find((b) => !b.classList.contains('used') && b.dataset.c === letters[at]);
            if (right) right.classList.add('glow');
          }
          return;
        }
        misses = 0;
        tile.classList.add('used');
        const slot = slots[at];
        slot.textContent = c;
        slot.classList.remove('now');
        slot.classList.add('in');
        EDSound.note(SCALE[at % SCALE.length], { seconds: 0.35, wave: 'triangle', gain: 0.22 });
        at += 1;
        if (at < letters.length) {
          mark();
          EDVoice.say([letterKey(c)], lang);
          return;
        }
        busy = true;
        bench.forEach((b) => b.classList.remove('glow'));
        clock.later(() => {
          slots.forEach((s, i) => { s.style.setProperty('--i', i); s.classList.remove('in'); s.classList.add('wave'); });
          EDKit.confetti(24);
          wrap.querySelector('.sp-gloss').innerHTML = `<b dir="ltr">${word}</b><span>${he}</span>`;
          EDVoice.say([wordKey(word)], lang).then(() => EDKit.praise(lang));
        }, 250);
        round += 1;
        clock.later(next, 3300);
      }

      bench.forEach((tile) => EDKit.drag(tile, {
        onTap: () => place(tile),
        onDrop: (under) => { if (under && under.closest('.sp-slots')) place(tile); },
      }));
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('spell-it', { sets: SETS, mount, unmount });
})();
