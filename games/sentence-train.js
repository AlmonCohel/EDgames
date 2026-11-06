/* רכבת המשפטים / Sentence Train — build a sentence, then watch it ride.

   A picture says what happened; the sentence is on loose word cards. Each card
   goes onto the next empty car, left to right, by tap or by drag. Touching a
   card says the word, so a child who cannot read yet can still match the sound
   to the shape. A card that does not belong rolls back. When the last car is
   filled the whole sentence is read aloud, the train whistles and rides off,
   and the sentence stays on the platform with its Hebrew.

   Sets: short sentences (3–4 words), middle (5), long (6–7). */

(function () {
  /* [sentence, picture, Hebrew] */
  const SETS = [
    {
      id: 'short', emoji: '🐱', label: { he: 'משפטים קצרים', en: 'Short sentences' },
      items: [
        ['The cat sleeps', '🐱😴', 'החתול ישן'], ['I like milk', '🥛😋', 'אני אוהב חלב'], ['The dog runs', '🐶🏃', 'הכלב רץ'],
        ['I see a bird', '👀🐦', 'אני רואה ציפור'], ['A fish can swim', '🐟🌊', 'דג יכול לשחות'], ['The sun is hot', '☀️🔥', 'השמש חמה'],
        ['We eat bread', '🍞😋', 'אנחנו אוכלים לחם'],
      ],
    },
    {
      id: 'middle', emoji: '🐸', label: { he: 'משפטים באורך בינוני', en: 'Middle sentences' },
      items: [
        ['The frog can jump high', '🐸⬆️', 'הצפרדע יכולה לקפוץ גבוה'], ['I have a red ball', '⚽🔴', 'יש לי כדור אדום'], ['The bird is in the tree', '🐦🌳', 'הציפור על העץ'],
        ['My mom has a car', '👩🚗', 'לאמא שלי יש מכונית'], ['The cake is very big', '🍰🐘', 'העוגה גדולה מאוד'], ['The horse eats an apple', '🐴🍎', 'הסוס אוכל תפוח'],
        ['We go to the park', '🌳🚶', 'אנחנו הולכים לפארק'],
      ],
    },
    {
      id: 'long', emoji: '🚂', label: { he: 'משפטים ארוכים', en: 'Long sentences' },
      items: [
        ['The little cat is on the bed', '🐱🛏️', 'החתולה הקטנה על המיטה'], ['I can see a big yellow star', '👀⭐', 'אני רואה כוכב צהוב גדול'],
        ['The duck swims in the blue water', '🦆💧', 'הברווז שוחה במים הכחולים'], ['We eat cheese and bread for lunch', '🧀🍞', 'אנחנו אוכלים גבינה ולחם בצהריים'],
        ['My dog likes to run in the park', '🐶🌳', 'הכלב שלי אוהב לרוץ בפארק'], ['The bear sleeps in a little house', '🐻🏠', 'הדוב ישן בבית קטן'],
      ],
    },
  ];

  const TEXT = {
    he: { ask: 'מסדרים את המילים ברכבת', done: 'הרכבת הגיעה!' },
    en: { ask: 'Put the words on the train', done: 'The train arrived!' },
  };

  const ROUNDS = 4;
  const slug = (w) => w.toLowerCase().replace(/[^a-z]/g, '');

  const CSS = `
    .st { gap: 12px; overflow: hidden; }
    .st-pic { font-size: 3.6rem; line-height: 1; padding: 10px 26px; border-radius: 26px; background: #fff; border: 3px solid var(--border);
      box-shadow: 0 6px 0 var(--edge); letter-spacing: 8px; }
    .st-rail { width: 100%; padding: 6px 0 4px; direction: ltr; }
    .st-train { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 26px 8px; margin: 0 auto; padding: 0 10px 14px; position: relative; }
    .st.go .st-train { animation: st-ride 2.2s cubic-bezier(.5,0,.8,.6) forwards; }
    @keyframes st-ride { 0% { transform: translateX(0); } 12% { transform: translateX(-14px); } 100% { transform: translateX(160vw); } }
    .st-engine { font-size: 3rem; line-height: 1; transform: scaleX(-1); filter: drop-shadow(0 4px 0 rgba(0,0,0,.18)); }
    .st-car { position: relative; min-width: 62px; height: 56px; padding: 0 10px; border-radius: 12px 12px 6px 6px; display: grid; place-items: center;
      border: 3px dashed var(--border); background: rgba(255,255,255,.7); font: 700 1.1rem/1 Fredoka, system-ui, sans-serif; color: #fff; transition: min-width .2s; }
    .st-car::after { content: ''; position: absolute; left: 14px; right: 14px; bottom: -13px; height: 12px;
      background: radial-gradient(circle at 8px 6px, #44506a 6px, transparent 7px) left/auto 100% no-repeat, radial-gradient(circle at calc(100% - 8px) 6px, #44506a 6px, transparent 7px) right/auto 100% no-repeat; }
    .st-car::before { content: ''; position: absolute; left: -9px; bottom: 6px; width: 9px; height: 5px; background: #8a929c; border-radius: 2px; }
    .st-car.now { border-color: var(--sub-solid); background: #fff; animation: sp-pulse 1.3s ease-in-out infinite; }
    .st-car.in { border: 3px solid var(--sub-edge); background: var(--sub-solid); box-shadow: 0 5px 0 var(--sub-edge); animation: st-couple .4s cubic-bezier(.3,1.7,.5,1); }
    @keyframes st-couple { 0% { transform: translateY(-26px) scale(1.15); } 100% { transform: none; } }
    @keyframes sp-pulse { 50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--sub-solid) 22%, transparent); } }
    .st-line { min-height: 4.4rem; text-align: center; }
    .st-line b { display: block; font-size: 1.6rem; color: var(--sub-ink); }
    .st-line span { color: var(--text-soft); font-size: 1.1rem; }
    .st-pool { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 520px; direction: ltr; min-height: 60px; }
    .st-card { padding: 12px 18px; border-radius: 14px; border: 2px solid var(--border); background: #fff; cursor: grab;
      font: 700 1.4rem/1 Fredoka, system-ui, sans-serif; color: var(--text); box-shadow: 0 5px 0 var(--edge); transform: rotate(var(--tilt, 0deg)); }
    .st-card:active { cursor: grabbing; }
    .st-card.used { visibility: hidden; }
    .st-card.glow { animation: st-glow .9s ease-in-out infinite; }
    @keyframes st-glow { 50% { box-shadow: 0 0 0 6px #ffd23f, 0 5px 0 var(--edge); } }
    @media (prefers-reduced-motion: reduce) { .st.go .st-train { animation: none; opacity: 0; } .st-car.now, .st-car.in, .st-card.glow { animation: none; } }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const set = ctx.set || SETS[0];
    EDKit.style('st-style', CSS);

    const rounds = EDKit.shuffle(set.items).slice(0, ROUNDS);
    let round = 0;
    let busy = false;
    const wrap = document.createElement('div');
    wrap.className = 'kit st';
    root.append(wrap);

    const wordKey = (w) => ({ key: `sw-${slug(w)}`, lang: 'en' });
    const sentKey = (i) => ({ key: `sent-${slug(i)}`, lang: 'en' });

    function next() {
      if (round >= rounds.length) return EDKit.end(wrap, ctx, lang, TEXT[lang].done);
      busy = false;
      wrap.classList.remove('go');
      const [sentence, pic, he] = rounds[round];
      const words = sentence.split(' ');
      let at = 0;
      let misses = 0;
      let order = EDKit.shuffle(words.map((w, i) => ({ w, i })));
      if (order.every((o, i) => o.w === words[i])) order = order.reverse();

      wrap.innerHTML = `
        ${EDKit.dots(rounds.length, round)}
        ${EDKit.head(TEXT[lang].ask, lang)}
        <div class="st-pic" aria-hidden="true">${pic}</div>
        <div class="st-rail"><div class="st-train">
          <div class="st-engine" aria-hidden="true">🚂</div>
          ${words.map(() => '<div class="st-car"></div>').join('')}
        </div></div>
        <div class="st-line" aria-live="polite"></div>
        <div class="st-pool">
          ${order.map((o, k) => `<button type="button" class="st-card" data-w="${o.w}" style="--tilt:${(k % 3 - 1) * 2}deg">${o.w}</button>`).join('')}
        </div>`;
      const cars = [...wrap.querySelectorAll('.st-car')];
      const cards = [...wrap.querySelectorAll('.st-card')];
      const mark = () => {
        cars.forEach((c, i) => c.classList.toggle('now', i === at));
        cards.forEach((c) => c.classList.remove('glow'));
      };
      mark();

      EDKit.voice(wrap, round === 0 ? ['train-ask', sentKey(sentence)] : [sentKey(sentence)], lang);
      const say = wrap.querySelector('.kit-say');
      say.onclick = () => { say.classList.remove('nudge'); EDVoice.say([sentKey(sentence)], lang); };

      function place(card) {
        if (busy || card.classList.contains('used')) return;
        const w = card.dataset.w;
        if (w !== words[at]) {
          misses += 1;
          EDKit.nope(card);
          EDSound.note(170, { seconds: 0.22, wave: 'triangle', gain: 0.2 });
          EDVoice.say([wordKey(w)], lang);
          if (misses >= 2) {
            const right = cards.find((c) => !c.classList.contains('used') && c.dataset.w === words[at]);
            if (right) right.classList.add('glow');
          }
          return;
        }
        misses = 0;
        card.classList.add('used');
        cars[at].textContent = w;
        cars[at].classList.remove('now');
        cars[at].classList.add('in');
        EDSound.drum({ gain: 0.2 });
        at += 1;
        if (at < words.length) {
          mark();
          EDVoice.say([wordKey(w)], lang);
          return;
        }
        busy = true;
        cards.forEach((c) => c.classList.remove('glow'));
        round += 1;
        EDVoice.say([sentKey(sentence)], lang).then(() => {
          wrap.querySelector('.st-line').innerHTML = `<b dir="ltr">${sentence}.</b><span>${he}</span>`;
          EDSound.note([440, 440, 660], { seconds: 0.5, wave: 'square', gain: 0.1 });
          EDSound.note(660, { seconds: 0.4, wave: 'square', gain: 0.1, delay: 0.55 });
          EDKit.confetti(24);
          clock.later(() => wrap.classList.add('go'), 700);
          EDKit.praise(lang);
          clock.later(next, 3600);
        });
      }

      cards.forEach((card) => EDKit.drag(card, {
        onTap: () => place(card),
        onDrop: (under) => { if (under && under.closest('.st-train')) place(card); },
      }));
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('sentence-train', { sets: SETS, mount, unmount });
})();
