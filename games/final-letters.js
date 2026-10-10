/* אותיות סופיות / Final Letters — the five Hebrew letters that change at the end of a word.

   כ מ נ פ צ each have a second shape, ך ם ן ף ץ, used only as a word's last
   letter. Hebrew reading sites teach them as a family ("מנצפ״ך") and in three
   steps, and the three sets here follow those steps:

     pairs  — which final shape belongs to this letter?
     ending — a word with its last letter missing: the ordinary shape or the
              final one? (the rule itself: at the end, the final shape)
     spot   — a whole word: tap the final letter in it.

   The letters stay Hebrew in the English version too. English has no final
   letters, so the English text explains the idea and the game teaches Hebrew. */

(function () {
  const PAIRS = [['כ', 'ך'], ['מ', 'ם'], ['נ', 'ן'], ['פ', 'ף'], ['צ', 'ץ']];

  /* Words that end in a final letter, each with a picture a child can name. */
  const WORDS = [
    ['לחם', '🍞'], ['ים', '🌊'], ['שעון', '⏰'], ['בלון', '🎈'], ['לימון', '🍋'],
    ['עץ', '🌳'], ['חץ', '🏹'], ['כף', '🥄'], ['עוף', '🐔'], ['אף', '👃'], ['מלך', '👑'],
  ];

  const SETS = [
    { id: 'pairs', emoji: '🔗', label: { he: 'מי הזוג שלי?', en: 'Find the pair' }, mode: 'pairs' },
    { id: 'ending', emoji: '🍞', label: { he: 'סוף המילה', en: 'End of the word' }, mode: 'ending' },
    { id: 'spot', emoji: '🔍', label: { he: 'איפה הסופית?', en: 'Spot the final' }, mode: 'spot' },
  ];

  const TEXT = {
    he: {
      step: (n, of) => `שלב ${n} מתוך ${of}`,
      pairs: (l) => `לאות ${l} יש צורה סופית. איזו היא?`,
      ending: 'איזו אות משלימה את המילה?',
      endingHint: 'בסוף מילה כותבים אות סופית',
      spot: 'געו באות הסופית במילה',
      intro: 'כ מ נ פ צ — בסוף מילה הן משנות צורה',
      right: 'נכון!',
      wrong: 'עוד לא. מסתכלים שוב',
      wellDone: 'כל הכבוד!',
      done: 'אתם מכירים את האותיות הסופיות!',
      again: 'עוד פעם 🔗',
      exit: 'למשחק אחר',
    },
    en: {
      step: (n, of) => `Step ${n} of ${of}`,
      pairs: (l) => `The Hebrew letter ${l} has an end-of-word shape. Which one?`,
      ending: 'Which letter finishes the word?',
      endingHint: 'At the end of a Hebrew word, use the final shape',
      spot: 'Tap the final letter in the word',
      intro: 'Five Hebrew letters change shape at the end of a word',
      right: 'Yes!',
      wrong: 'Not yet. Look again',
      wellDone: 'Well done!',
      done: 'You know the Hebrew final letters!',
      again: 'Again 🔗',
      exit: 'Another game',
    },
  };

  const ROUNDS = 5;

  const CSS = `
    .fn { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 6px 0 18px; width: 100%; }
    .fn-progress { display: flex; gap: 9px; }
    .fn-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .fn-dot.done { background: var(--pos); }
    .fn h2 { margin: 0; font-size: 1.35rem; text-align: center; text-wrap: balance; }
    .fn-hint { margin: 0; color: var(--text-soft); font-size: .95rem; min-height: 1.6em; text-align: center; }
    .fn-family { display: flex; gap: 6px; direction: rtl; }
    .fn-family span { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; font-weight: 700; background: var(--sub-tint, var(--sel-tint)); color: var(--sub-ink, var(--sel-ink)); }
    .fn-big { width: 120px; height: 120px; border-radius: 30px; display: grid; place-items: center; font-size: 4.2rem; font-weight: 700; background: var(--sub-solid, var(--pos)); color: #fff; box-shadow: 0 6px 0 var(--sub-edge, #0003); }
    .fn-pic { font-size: 72px; line-height: 1; }
    .fn-word { display: flex; gap: 8px; direction: rtl; }
    .fn-slot { width: 64px; height: 76px; border-radius: 18px; display: grid; place-items: center; font-size: 2.6rem; font-weight: 700; background: var(--bg-raise); border: 2px solid var(--border); color: var(--text); box-shadow: 0 4px 0 var(--edge, var(--border)); }
    button.fn-slot { cursor: pointer; font: inherit; font-size: 2.6rem; font-weight: 700; }
    .fn-slot.empty { border-style: dashed; color: var(--text-soft); box-shadow: none; }
    .fn-choices { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .fn-choice { width: 84px; height: 84px; border-radius: 24px; font: inherit; font-weight: 700; font-size: 2.6rem; background: var(--bg-raise); color: var(--text); border: 2px solid var(--border); box-shadow: 0 5px 0 var(--edge, var(--border)); cursor: pointer; transition: transform .08s, box-shadow .08s; }
    .fn-choice:active, button.fn-slot:active { transform: translateY(4px); box-shadow: 0 1px 0 var(--edge, var(--border)); }
    .yes { background: var(--pos) !important; color: #fff !important; border-color: var(--pos) !important; }
    .nope { animation: fn-shake .36s ease; }
    @keyframes fn-shake { 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }
    .fn-end { text-align: center; margin: auto; }
    .fn-end .fn-stars { font-size: 46px; letter-spacing: 4px; }
    .fn-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .fn-end p { color: var(--text-soft); margin: 0 0 22px; }
    .fn-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const FINALS = PAIRS.map((p) => p[1]);
  const regularOf = (f) => PAIRS.find((p) => p[1] === f)[0];

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];

    if (!document.getElementById('fn-style')) {
      const style = document.createElement('style');
      style.id = 'fn-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    const pairDeck = shuffle(PAIRS);
    const wordDeck = shuffle(WORDS).slice(0, ROUNDS);
    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'fn';
    root.append(wrap);

    const progress = () => `<div class="fn-progress" role="img" aria-label="${text.step(round + 1, ROUNDS)}">${Array.from({ length: ROUNDS }, (_, i) => `<span class="fn-dot ${i < round ? 'done' : ''}"></span>`).join('')}</div>`;
    const family = () => `<div class="fn-family" aria-hidden="true">${PAIRS.map((p) => `<span>${p[1]}</span>`).join('')}</div>`;

    function choiceButtons(box, list, correct, onRight) {
      list.forEach((l) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'fn-choice';
        b.textContent = l;
        b.addEventListener('click', () => answer(b, l === correct, onRight));
        box.append(b);
      });
    }

    function answer(b, ok, onRight) {
      if (wrap.dataset.lock) return;
      const hint = wrap.querySelector('.fn-hint');
      if (!ok) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); hint.textContent = text.wrong; return; }
      wrap.dataset.lock = '1';
      b.classList.add('yes');
      hint.textContent = text.right;
      if (onRight) onRight();
      later(() => { delete wrap.dataset.lock; round += 1; next(); }, 1200);
    }

    function next() {
      if (round >= ROUNDS) return finish();

      if (set.mode === 'pairs') {
        const [reg, fin] = pairDeck[round % pairDeck.length];
        wrap.innerHTML = `${progress()}<h2>${text.pairs(reg)}</h2><div class="fn-big" aria-hidden="true">${reg}</div><div class="fn-choices"></div><p class="fn-hint" aria-live="polite">${text.intro}</p>`;
        const others = shuffle(FINALS.filter((f) => f !== fin)).slice(0, 2);
        choiceButtons(wrap.querySelector('.fn-choices'), shuffle([fin, ...others]), fin);
        return;
      }

      const [word, pic] = wordDeck[round];
      const letters = [...word];

      if (set.mode === 'ending') {
        const fin = letters[letters.length - 1];
        wrap.innerHTML = `${progress()}<h2>${text.ending}</h2><div class="fn-pic" role="img" aria-label="${word}">${pic}</div>
          <div class="fn-word">${letters.map((l, i) => `<span class="fn-slot ${i === letters.length - 1 ? 'empty' : ''}">${i === letters.length - 1 ? '?' : l}</span>`).join('')}</div>
          <div class="fn-choices"></div><p class="fn-hint" aria-live="polite">${text.endingHint}</p>`;
        const slot = wrap.querySelector('.fn-slot.empty');
        choiceButtons(wrap.querySelector('.fn-choices'), shuffle([fin, regularOf(fin)]), fin, () => { slot.textContent = fin; slot.classList.remove('empty'); slot.classList.add('yes'); });
        return;
      }

      // spot: tap the final letter inside the word
      wrap.innerHTML = `${progress()}<h2>${text.spot}</h2><div class="fn-pic" role="img" aria-label="${word}">${pic}</div><div class="fn-word"></div>${family()}<p class="fn-hint" aria-live="polite">${text.intro}</p>`;
      const box = wrap.querySelector('.fn-word');
      letters.forEach((l, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'fn-slot';
        b.textContent = l;
        b.addEventListener('click', () => answer(b, i === letters.length - 1 && FINALS.includes(l)));
        box.append(b);
      });
    }

    function finish() {
      wrap.innerHTML = `
        <div class="fn-end">
          <div class="fn-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.done}</p>
          <div class="fn-actions">
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

  EDGames.register('final-letters', { sets: SETS, mount, unmount });
})();
