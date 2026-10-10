/* מה האות הראשונה? / First Letter — a picture, and the letter its word starts with.

   The commonest first-letter exercise on Hebrew early-reading sites: show a
   thing the child can name out loud, and ask which letter opens the word. It
   trains the step between knowing a letter's shape and hearing its sound at the
   start of a word, which is what reading is built on.

   The word itself is shown only after the answer, so the child has to say it
   to themselves rather than read it off the screen. Every picture is an older
   emoji — see the README on Windows 10 — and each one has an unambiguous
   everyday name. */

(function () {
  const WORDS = {
    he: [
      ['א', 'אריה', '🦁'], ['א', 'אבטיח', '🍉'], ['א', 'אוטו', '🚗'],
      ['ב', 'בננה', '🍌'], ['ב', 'בית', '🏠'], ['ב', 'בלון', '🎈'],
      ['ג', 'גזר', '🥕'], ['ג', 'גלידה', '🍦'], ['ג', 'גיטרה', '🎸'],
      ['ד', 'דג', '🐟'], ['ד', 'דבורה', '🐝'], ['ד', 'דובי', '🧸'],
      ['ז', 'זברה', '🦓'], ['ח', 'חתול', '🐱'], ['ח', 'חלב', '🥛'],
      ['ט', 'טלפון', '📱'], ['ט', 'טרקטור', '🚜'], ['י', 'ירח', '🌙'], ['י', 'יד', '✋'],
      ['כ', 'כלב', '🐶'], ['כ', 'כדור', '⚽'], ['כ', 'כוכב', '⭐'],
      ['ל', 'לימון', '🍋'], ['ל', 'לב', '❤️'], ['מ', 'מטוס', '✈️'], ['מ', 'מפתח', '🔑'],
      ['נ', 'נחש', '🐍'], ['נ', 'נמלה', '🐜'], ['ס', 'סוס', '🐴'], ['ס', 'ספר', '📖'],
      ['ע', 'עוגה', '🎂'], ['ע', 'עץ', '🌳'], ['ע', 'ענבים', '🍇'],
      ['פ', 'פרח', '🌸'], ['פ', 'פיל', '🐘'], ['פ', 'פרפר', '🦋'],
      ['צ', 'צב', '🐢'], ['צ', 'צפרדע', '🐸'], ['ק', 'קוף', '🐵'], ['ק', 'קשת', '🌈'],
      ['ר', 'רכבת', '🚂'], ['ר', 'רובוט', '🤖'], ['ש', 'שמש', '☀️'], ['ש', 'שעון', '⏰'],
      ['ת', 'תפוח', '🍎'], ['ת', 'תות', '🍓'], ['ת', 'תרנגול', '🐓'],
    ],
    en: [
      ['A', 'Apple', '🍎'], ['B', 'Ball', '⚽'], ['B', 'Banana', '🍌'], ['C', 'Cat', '🐱'], ['C', 'Cake', '🎂'],
      ['D', 'Dog', '🐶'], ['D', 'Duck', '🦆'], ['E', 'Elephant', '🐘'], ['F', 'Fish', '🐟'], ['F', 'Flower', '🌸'],
      ['G', 'Grapes', '🍇'], ['H', 'House', '🏠'], ['K', 'Key', '🔑'], ['L', 'Lion', '🦁'], ['L', 'Lemon', '🍋'],
      ['M', 'Moon', '🌙'], ['M', 'Monkey', '🐵'], ['P', 'Plane', '✈️'], ['R', 'Rainbow', '🌈'], ['R', 'Robot', '🤖'],
      ['S', 'Sun', '☀️'], ['S', 'Snake', '🐍'], ['T', 'Tree', '🌳'], ['T', 'Train', '🚂'], ['Z', 'Zebra', '🦓'],
    ],
  };

  /* Letters a beginner mixes up by shape. The look-alike run offers the target's
     neighbours as the wrong answers, so the child has to listen and look. */
  const NEAR = {
    he: { 'ב': 'כפ', 'כ': 'בפ', 'פ': 'כב', 'ד': 'רה', 'ר': 'דו', 'ה': 'חת', 'ח': 'הת', 'ת': 'חה', 'ג': 'נז', 'נ': 'גכ', 'ז': 'וג', 'ס': 'טמ', 'ט': 'סמ', 'מ': 'סט', 'ע': 'צא', 'צ': 'עש', 'ש': 'צע', 'א': 'עש', 'י': 'וז', 'ל': 'כק', 'ק': 'רה' },
    en: { 'B': 'DP', 'D': 'BP', 'P': 'BR', 'R': 'PB', 'C': 'GO', 'G': 'CO', 'M': 'NW', 'E': 'FB', 'F': 'EP', 'T': 'IL', 'L': 'TI', 'S': 'ZC', 'Z': 'SN', 'K': 'HR', 'H': 'KN', 'A': 'HR' },
  };

  const SETS = [
    { id: 'three', emoji: '🍎', label: { he: 'שלוש אותיות', en: 'Three letters' }, choices: 3, mode: 'far' },
    { id: 'four', emoji: '🍌', label: { he: 'ארבע אותיות', en: 'Four letters' }, choices: 4, mode: 'far' },
    { id: 'similar', emoji: '👀', label: { he: 'אותיות דומות', en: 'Look-alike letters' }, choices: 3, mode: 'near' },
  ];

  const TEXT = {
    he: {
      step: (n, of) => `תמונה ${n} מתוך ${of}`,
      ask: 'באיזו אות מתחילה המילה?',
      hint: 'אומרים את המילה בקול ומקשיבים לצליל הראשון',
      right: (word, letter) => `נכון! ${word} מתחילה ב־${letter}`,
      wrong: 'לא בדיוק. אומרים שוב את המילה לאט',
      letter: (l) => `האות ${l}`,
      wellDone: 'כל הכבוד!',
      done: 'מצאתם את כל האותיות הראשונות!',
      again: 'עוד פעם 🍎',
      exit: 'למשחק אחר',
    },
    en: {
      step: (n, of) => `Picture ${n} of ${of}`,
      ask: 'Which letter does the word start with?',
      hint: 'Say the word out loud and listen to its first sound',
      right: (word, letter) => `Yes! ${word} starts with ${letter}`,
      wrong: 'Not quite. Say the word again, slowly',
      letter: (l) => `the letter ${l}`,
      wellDone: 'Well done!',
      done: 'You found every first letter!',
      again: 'Again 🍎',
      exit: 'Another game',
    },
  };

  const ROUNDS = 5;

  const CSS = `
    .fl { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 6px 0 18px; width: 100%; }
    .fl-progress { display: flex; gap: 9px; }
    .fl-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .fl-dot.done { background: var(--pos); }
    .fl h2 { margin: 0; font-size: 1.4rem; text-align: center; }
    .fl-hint { margin: 0; color: var(--text-soft); font-size: .95rem; min-height: 1.6em; text-align: center; }
    .fl-card {
      width: 168px; height: 168px; border-radius: 32px; display: grid; place-items: center;
      background: var(--sub-tint, var(--sel-tint)); box-shadow: 0 6px 0 var(--sub-edge, var(--border));
      font-size: 96px; line-height: 1; position: relative;
    }
    .fl-word {
      position: absolute; inset-block-end: -18px; inset-inline: 0; margin: 0 auto; width: fit-content;
      background: #fff; border: 2px solid var(--border); border-radius: 999px; padding: 2px 14px;
      font-size: 1.15rem; font-weight: 700; color: var(--text); opacity: 0; transform: scale(.6);
      transition: opacity .2s, transform .3s cubic-bezier(.3,1.6,.5,1);
    }
    .fl-word.on { opacity: 1; transform: none; }
    .fl-word b { color: var(--pos); }
    .fl-choices { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-top: 10px; }
    .fl-choice {
      width: 84px; height: 84px; border-radius: 24px; font: inherit; font-weight: 700; font-size: 2.6rem;
      background: var(--bg-raise); color: var(--text); border: 2px solid var(--border);
      box-shadow: 0 5px 0 var(--edge, var(--border)); cursor: pointer; transition: transform .08s, box-shadow .08s;
    }
    .fl-choice:active { transform: translateY(4px); box-shadow: 0 1px 0 var(--edge, var(--border)); }
    .fl-choice.yes { background: var(--pos); color: #fff; border-color: var(--pos); box-shadow: 0 5px 0 #0f5c39; }
    .fl-choice.nope { animation: fl-shake .36s ease; }
    @keyframes fl-shake { 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }
    .fl-end { text-align: center; margin: auto; }
    .fl-end .fl-stars { font-size: 46px; letter-spacing: 4px; }
    .fl-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .fl-end p { color: var(--text-soft); margin: 0 0 22px; }
    .fl-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = WORDS[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];

    if (!document.getElementById('fl-style')) {
      const style = document.createElement('style');
      style.id = 'fl-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    /* Five pictures, no two starting with the same letter, so the run is five
       different letters rather than three bananas and a ball. */
    const deck = [];
    for (const w of shuffle(WORDS[lang])) {
      if (!deck.some((d) => d[0] === w[0])) deck.push(w);
      if (deck.length === ROUNDS) break;
    }
    const letters = [...new Set(WORDS[lang].map((w) => w[0]))];

    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'fl';
    root.append(wrap);

    function options(target) {
      const near = set.mode === 'near' ? [...(NEAR[lang][target] || '')] : [];
      const far = shuffle(letters.filter((l) => l !== target && !near.includes(l)));
      return shuffle([target, ...[...near, ...far].slice(0, set.choices - 1)]);
    }

    function next() {
      if (round >= ROUNDS) return finish();
      const [target, word, pic] = deck[round];
      wrap.innerHTML = `
        <div class="fl-progress" role="img" aria-label="${text.step(round + 1, ROUNDS)}">
          ${Array.from({ length: ROUNDS }, (_, i) => `<span class="fl-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <h2>${text.ask}</h2>
        <div class="fl-card" role="img" aria-label="${word}">${pic}<span class="fl-word"><b>${word[0]}</b>${word.slice(1)}</span></div>
        <div class="fl-choices"></div>
        <p class="fl-hint" aria-live="polite">${text.hint}</p>`;
      const box = wrap.querySelector('.fl-choices');
      options(target).forEach((l) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'fl-choice';
        b.textContent = l;
        b.setAttribute('aria-label', text.letter(l));
        b.addEventListener('click', () => pick(b, l === target, word, target));
        box.append(b);
      });
    }

    function pick(b, ok, word, target) {
      if (wrap.dataset.lock) return;
      const hint = wrap.querySelector('.fl-hint');
      if (!ok) {
        b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
        hint.textContent = text.wrong;
        return;
      }
      wrap.dataset.lock = '1';
      b.classList.add('yes');
      wrap.querySelector('.fl-word').classList.add('on');
      hint.textContent = text.right(word, target);
      later(() => { delete wrap.dataset.lock; round += 1; next(); }, 1400);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="fl-end">
          <div class="fl-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.done}</p>
          <div class="fl-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    next();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  EDGames.register('first-letter', { sets: SETS, mount, unmount });
})();
