/* הלחש של הקוסם / The Wizard's Spell — one letter has fallen out of the word,
   and the spell does not work without it.

   The picture alone would be a guessing game: a child looking at a crown could
   be thinking of a king. So the word is on screen too, with a tile missing, and
   the rest of the letters say which word we mean — which turns the round into
   reading rather than naming.

   The alphabet the child picks from is the alphabet on screen: Hebrew when the
   site is in Hebrew, the Latin one when it is in English, with its own word list
   either way. A Hebrew word does not translate into an English one that happens
   to start with the same letter, so the two lists are written separately rather
   than being two columns of one table.

   The tiles are laid out as elements in a row, not as a string, so the word
   reads in the direction of the page it is on without any bidi wrangling. */

(function () {
  /* Five letters change shape at the end of a Hebrew word. The buttons only
     ever offer the ordinary forms, so words ending in one of these sit out the
     run that hides the last letter. */
  const FINALS = [...'ךםןףץ'];

  const WORDS = {
    he: [
      { emoji: '👑', word: 'כתר' },
      { emoji: '🐺', word: 'זאב' },
      { emoji: '🌲', word: 'יער' },
      { emoji: '🐴', word: 'סוס' },
      { emoji: '🕯️', word: 'נר' },
      { emoji: '🧚', word: 'פיה' },
      { emoji: '🏰', word: 'טירה' },
      { emoji: '🥚', word: 'ביצה' },
      { emoji: '🍎', word: 'תפוח' },
      { emoji: '🗝️', word: 'מפתח' },
      { emoji: '🌳', word: 'עץ' },
      { emoji: '🧙', word: 'קוסם' },
      { emoji: '👸', word: 'נסיכה', long: true },
      { emoji: '🍬', word: 'ממתקים', long: true },
      { emoji: '🐉', word: 'דרקון', long: true },
      { emoji: '🐸', word: 'צפרדע', long: true },
      { emoji: '🦢', word: 'ברבור', long: true },
      { emoji: '🧹', word: 'מטאטא', long: true },
    ],
    en: [
      { emoji: '👑', word: 'CROWN' },
      { emoji: '🐺', word: 'WOLF' },
      { emoji: '🐸', word: 'FROG' },
      { emoji: '🗝️', word: 'KEY' },
      { emoji: '💍', word: 'RING' },
      { emoji: '🍎', word: 'APPLE' },
      { emoji: '🐴', word: 'HORSE' },
      { emoji: '💰', word: 'GOLD' },
      { emoji: '🦉', word: 'OWL' },
      { emoji: '🔔', word: 'BELL' },
      { emoji: '🌳', word: 'TREE' },
      { emoji: '🧹', word: 'BROOM' },
      { emoji: '🏰', word: 'CASTLE', long: true },
      { emoji: '🐉', word: 'DRAGON', long: true },
      { emoji: '🧙', word: 'WIZARD', long: true },
      { emoji: '🤴', word: 'PRINCE', long: true },
      { emoji: '🌲', word: 'FOREST', long: true },
      { emoji: '👸', word: 'PRINCESS', long: true },
    ],
  };

  const ALPHABET = {
    he: [...'אבגדהוזחטיכלמנסעפצקרשת'],
    en: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  };

  /* Three runs: the letter a word opens with, the letter it closes with, and
     then the long words, where the opening letter has more word behind it to
     read past. */
  const SETS = [
    {
      id: 'first', emoji: '🔤',
      label: { he: 'האות הראשונה', en: 'The first letter' },
      spot: 'first', long: false, options: 3,
    },
    {
      id: 'last', emoji: '🔚',
      label: { he: 'האות האחרונה', en: 'The last letter' },
      spot: 'last', long: false, options: 3,
    },
    {
      id: 'longer', emoji: '📜',
      label: { he: 'מילים ארוכות', en: 'Longer words' },
      spot: 'first', long: true, options: 4,
    },
  ];

  const TEXT = {
    he: {
      step:      (n, of) => `שלב ${n} מתוך ${of}`,
      askFirst:  'באיזו אות מתחילה המילה?',
      askLast:   'באיזו אות נגמרת המילה?',
      look:      'מסתכלים על התמונה וקוראים את המילה',
      tryAgain:  'לא האות הזאת. קוראים את המילה עוד פעם',
      letter:    (l) => `האות ${l}`,
      blank:     'חסרה אות',
      wellDone:  'כל הכבוד!',
      spelledAll: 'השלמתם את כל הלחשים!',
      again:     'עוד פעם 🔮',
      exit:      'למשחק אחר',
    },
    en: {
      step:      (n, of) => `Step ${n} of ${of}`,
      askFirst:  'Which letter does the word start with?',
      askLast:   'Which letter does the word end with?',
      look:      'Look at the picture and read the word',
      tryAgain:  'Not that letter. Read the word once more',
      letter:    (l) => `the letter ${l}`,
      blank:     'a letter is missing',
      wellDone:  'Well done!',
      spelledAll: 'You finished every spell!',
      again:     'Again 🔮',
      exit:      'Another game',
    },
  };

  const ROUNDS = 5;

  const CSS = `
    .ws { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .ws-progress { display: flex; gap: 9px; }
    .ws-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .ws-dot.done { background: var(--pos); }
    .ws-ask { text-align: center; }
    .ws-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .ws-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }
    .ws-scroll {
      display: grid; place-items: center; gap: 14px;
      padding: 20px 24px; width: 100%; max-width: 420px;
      background: linear-gradient(180deg, #fbf6ea, #f3ead6);
      border: 1.5px solid var(--border); border-radius: var(--radius);
    }
    .ws-picture { font-size: 64px; line-height: 1; }
    .ws-word { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .ws-tile {
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: clamp(1.5rem, 6vw, 2rem);
      width: 54px; height: 62px; border-radius: var(--radius-sm);
      display: grid; place-items: center;
      background: var(--bg-raise); border: 2px solid var(--border); color: var(--text);
    }
    .ws-tile.hole { border-style: dashed; border-color: var(--sub-ink, var(--border)); background: transparent; }
    .ws-tile.yes { background: var(--pos); border-color: var(--pos); color: var(--on-accent); }
    .ws-letters { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
    .ws-letter {
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: 2rem;
      width: 86px; height: 86px; border-radius: 24px;
      background: var(--bg-raise); color: var(--text);
      border: 2px solid var(--border); cursor: pointer;
      transition: transform 0.12s ease, background 0.15s ease;
    }
    .ws-letter:hover:not([disabled]) { transform: translateY(-3px); }
    .ws-letter.nope { animation: ws-shake 0.36s ease; }
    @keyframes ws-shake { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .ws-end { text-align: center; margin: auto; }
    .ws-end .ws-stars { font-size: 46px; letter-spacing: 4px; }
    .ws-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .ws-end p { color: var(--text-soft); margin: 0 0 22px; }
    .ws-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .ws-picture { font-size: 52px; }
      .ws-word { gap: 6px; }
      .ws-tile { width: 42px; height: 50px; }
      .ws-letter { width: 72px; height: 72px; font-size: 1.7rem; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const oneOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = WORDS[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    const ask = set.spot === 'last' ? text.askLast : text.askFirst;

    if (!document.getElementById('ws-style')) {
      const style = document.createElement('style');
      style.id = 'ws-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    /* Five different words a run, so nothing comes round twice inside it. */
    const pool = WORDS[lang]
      .filter((w) => Boolean(w.long) === set.long)
      .filter((w) => set.spot !== 'last' || !FINALS.includes(w.word.at(-1)));
    const spells = shuffle(pool).slice(0, ROUNDS);

    let round = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'ws';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.ws-hint').textContent = line; };

    /* Letters that are not in the word at all, so the only tile the answer can
       belong to is the empty one. */
    function choices(answer, word) {
      const inWord = [...word];
      const rest = shuffle(ALPHABET[lang].filter((l) => !inWord.includes(l)));
      return shuffle([answer, ...rest.slice(0, set.options - 1)]);
    }

    function nextRound() {
      if (round >= spells.length) return finish();

      locked = false;
      const spell = spells[round];
      const letters = [...spell.word];
      const hole = set.spot === 'last' ? letters.length - 1 : 0;
      const answer = letters[hole];

      wrap.innerHTML = `
        <div class="ws-progress" role="img" aria-label="${text.step(round + 1, spells.length)}">
          ${spells.map((_, i) => `<span class="ws-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="ws-ask">
          <h2 aria-live="polite">${ask}</h2>
          <p class="ws-hint">${text.look}</p>
        </div>
        <div class="ws-scroll">
          <span class="ws-picture" aria-hidden="true">${spell.emoji}</span>
          <div class="ws-word" role="img" aria-label="${letters.map((l, i) => (i === hole ? text.blank : l)).join(' ')}">
            ${letters.map((l, i) => `
              <span class="ws-tile ${i === hole ? 'hole' : ''}" aria-hidden="true">${i === hole ? '' : l}</span>`).join('')}
          </div>
        </div>
        <div class="ws-letters"></div>`;

      const row = wrap.querySelector('.ws-letters');
      choices(answer, spell.word).forEach((l) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ws-letter';
        b.textContent = l;
        b.setAttribute('aria-label', text.letter(l));
        b.addEventListener('click', () => answerWith(b, l, answer, spell.word));
        row.append(b);
      });
    }

    function answerWith(button, picked, answer, word) {
      if (locked) return;

      if (picked !== answer) {
        /* A wrong letter is a second look, not a mistake: it wobbles, nothing
           is counted, and the hint points back at the word. */
        button.classList.remove('nope');
        void button.offsetWidth;
        button.classList.add('nope');
        hint(text.tryAgain);
        return;
      }

      locked = true;
      round += 1;

      /* The letter drops into its tile and the word is whole, which is the
         thing the child was reading towards. */
      const tile = wrap.querySelector('.ws-tile.hole');
      tile.textContent = answer;
      tile.classList.remove('hole');
      tile.classList.add('yes');
      wrap.querySelector('.ws-word').setAttribute('aria-label', [...word].join(' '));
      wrap.querySelectorAll('.ws-letter').forEach((b) => { b.disabled = true; });

      later(nextRound, 640);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="ws-end">
          <div class="ws-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.spelledAll}</p>
          <div class="ws-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    nextRound();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  EDGames.register('wizard-spell', { sets: SETS, mount, unmount });
})();
