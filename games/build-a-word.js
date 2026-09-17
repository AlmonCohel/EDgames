/* בונים מילה / Build a Word — the picture is the word, and the letters are on
   the table in the wrong order.

   The letters are tapped, not dragged. That is the same call `shape-match`
   makes and the same reason — a small hand on a tablet loses the piece halfway
   — and here it buys something else too: a tap can go into the next empty place
   on its own, so a child spelling a word never also has to aim at a 40px slot.

   The word is filled from its beginning. A letter that is not the next one
   wobbles and stays where it was, which turns the wrong tap into "not yet"
   rather than "no" — and since the tray holds the word's own letters, a child
   who cannot spell it yet can still get there by trying, at no cost. The last
   run puts one letter on the table that belongs to no part of the word, which
   is the first time a wrong tap means something other than "wrong order".

   Slots and letters are laid out as elements in a row rather than as a string,
   so the word reads in the direction of the page without any bidi wrangling —
   the same thing `wizard-spell` does. */

(function () {
  /* Hebrew and English are separate lists rather than two columns of one,
     because a word does not translate into a word of the same length made of
     the same kind of letters — and length is what the runs are sorted by. */
  const WORDS = {
    he: [
      { emoji: '🐶', word: 'כלב' },
      { emoji: '☀️', word: 'שמש' },
      { emoji: '🏠', word: 'בית' },
      { emoji: '🌹', word: 'ורד' },
      { emoji: '🌙', word: 'ירח' },
      { emoji: '🍞', word: 'לחם' },
      { emoji: '🧒', word: 'ילד' },
      { emoji: '🐻', word: 'דוב' },
      { emoji: '💧', word: 'מים' },
      { emoji: '🐮', word: 'פרה' },
      { emoji: '🌸', word: 'פרח' },
      { emoji: '👁️', word: 'עין' },
      { emoji: '🥛', word: 'חלב' },
      { emoji: '🐘', word: 'פיל' },
      { emoji: '⛄', word: 'שלג' },
      { emoji: '🌈', word: 'קשת' },
      { emoji: '🥕', word: 'גזר' },
      { emoji: '🐱', word: 'חתול' },
      { emoji: '🦁', word: 'אריה' },
      { emoji: '⭐', word: 'כוכב' },
      { emoji: '🍎', word: 'תפוח' },
      { emoji: '🐰', word: 'ארנב' },
      { emoji: '🦆', word: 'ברווז' },
      { emoji: '🎂', word: 'עוגה' },
      { emoji: '🔑', word: 'מפתח' },
      { emoji: '🕊️', word: 'יונה' },
      { emoji: '🐑', word: 'כבשה' },
      { emoji: '🦋', word: 'פרפר' },
      { emoji: '🐸', word: 'צפרדע' },
      { emoji: '🎈', word: 'בלון' },
      { emoji: '🍌', word: 'בננה' },
      { emoji: '🥚', word: 'ביצה' },
      { emoji: '🐦', word: 'ציפור' },
      { emoji: '🐝', word: 'דבורה' },
      { emoji: '🍋', word: 'לימון' },
    ],
    en: [
      { emoji: '🐱', word: 'CAT' },
      { emoji: '🐶', word: 'DOG' },
      { emoji: '☀️', word: 'SUN' },
      { emoji: '🐝', word: 'BEE' },
      { emoji: '🚌', word: 'BUS' },
      { emoji: '🎩', word: 'HAT' },
      { emoji: '🐮', word: 'COW' },
      { emoji: '🥚', word: 'EGG' },
      { emoji: '🦊', word: 'FOX' },
      { emoji: '🐷', word: 'PIG' },
      { emoji: '👁️', word: 'EYE' },
      { emoji: '🚗', word: 'CAR' },
      { emoji: '🛏️', word: 'BED' },
      { emoji: '🐜', word: 'ANT' },
      { emoji: '🔑', word: 'KEY' },
      { emoji: '🐟', word: 'FISH' },
      { emoji: '🌳', word: 'TREE' },
      { emoji: '⭐', word: 'STAR' },
      { emoji: '🏠', word: 'HOUSE' },
      { emoji: '🍎', word: 'APPLE' },
      { emoji: '🌙', word: 'MOON' },
      { emoji: '🐸', word: 'FROG' },
      { emoji: '🦆', word: 'DUCK' },
      { emoji: '🐻', word: 'BEAR' },
      { emoji: '🍞', word: 'BREAD' },
      { emoji: '🍋', word: 'LEMON' },
      { emoji: '🐦', word: 'BIRD' },
      { emoji: '🚲', word: 'BIKE' },
      { emoji: '🐑', word: 'SHEEP' },
      { emoji: '🕊️', word: 'DOVE' },
      { emoji: '🌧️', word: 'RAIN' },
      { emoji: '⛄', word: 'SNOW' },
      { emoji: '🥛', word: 'MILK' },
    ],
  };

  /* The ordinary forms only. A Hebrew letter that changes shape at the end of a
     word would be a strange thing to offer as a letter that does not belong. */
  const ALPHABET = {
    he: [...'אבגדהוזחטיכלמנסעפצקרשת'],
    en: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  };

  /* Three runs: short words, longer ones, then longer ones with a letter on the
     table that belongs to no part of the word — the first time a wrong tap
     means something other than "not that one yet". */
  const SETS = [
    {
      id: 'short', emoji: '✏️',
      label: { he: 'מילים קצרות', en: 'Short words' },
      min: 3, max: 3, spare: 0,
    },
    {
      id: 'longer', emoji: '📝',
      label: { he: 'מילים ארוכות', en: 'Longer words' },
      min: 4, max: 5, spare: 0,
    },
    {
      id: 'spare', emoji: '🎯',
      label: { he: 'אות מיותרת', en: 'One letter too many' },
      min: 4, max: 5, spare: 1,
    },
  ];

  const TEXT = {
    he: {
      step:     (n, of) => `שלב ${n} מתוך ${of}`,
      ask:      'בונים את המילה שבתמונה',
      lead:     'לוחצים על האותיות לפי הסדר',
      leadSpare: 'שימו לב: אות אחת כאן לא שייכת למילה',
      notNext:  'לא האות הזאת. מה האות הבאה במילה?',
      letter:   (l) => `האות ${l}`,
      blank:    'מקום ריק',
      wellDone: 'כל הכבוד!',
      builtAll: 'בניתם את כל המילים!',
      again:    'עוד פעם ✏️',
      exit:     'למשחק אחר',
    },
    en: {
      step:     (n, of) => `Step ${n} of ${of}`,
      ask:      'Build the word in the picture',
      lead:     'Tap the letters in order',
      leadSpare: 'Watch out: one letter here does not belong to the word',
      notNext:  'Not that one. Which letter comes next?',
      letter:   (l) => `the letter ${l}`,
      blank:    'empty place',
      wellDone: 'Well done!',
      builtAll: 'You built every word!',
      again:    'Again ✏️',
      exit:     'Another game',
    },
  };

  const ROUNDS = 5;

  const CSS = `
    .bw { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .bw-progress { display: flex; gap: 9px; }
    .bw-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .bw-dot.done { background: var(--pos); }
    .bw-ask { text-align: center; }
    .bw-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .bw-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }

    .bw-card {
      display: grid; place-items: center; gap: 14px;
      padding: 20px 24px; width: 100%; max-width: 460px;
      background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius);
    }
    .bw-picture { font-size: 64px; line-height: 1; }
    .bw-slots { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .bw-slot {
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: clamp(1.5rem, 6vw, 2rem);
      width: 54px; height: 62px; border-radius: var(--radius-sm);
      display: grid; place-items: center;
      background: transparent; border: 2px dashed var(--sub-ink, var(--border)); color: var(--text);
    }
    .bw-slot.set {
      background: var(--pos); border: 2px solid var(--pos); color: var(--on-accent);
      animation: bw-drop 0.28s ease;
    }
    @keyframes bw-drop { from { transform: scale(1.3); opacity: 0.4; } }

    .bw-letters { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .bw-letter {
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: 1.9rem;
      width: 78px; height: 78px; border-radius: 22px;
      background: var(--bg-raise); color: var(--text);
      border: 2px solid var(--border); cursor: pointer;
      transition: transform 0.12s ease;
    }
    .bw-letter:hover:not([disabled]) { transform: translateY(-3px); }
    /* A used letter keeps its place on the table rather than closing the row
       up, so the letters still to come do not move under the child's finger. */
    .bw-letter.used { visibility: hidden; }
    .bw-letter.nope { animation: bw-shake 0.36s ease; }
    @keyframes bw-shake { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }

    .bw-end { text-align: center; margin: auto; }
    .bw-end .bw-stars { font-size: 46px; letter-spacing: 4px; }
    .bw-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .bw-end p { color: var(--text-soft); margin: 0 0 22px; }
    .bw-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    @media (max-width: 560px) {
      .bw-picture { font-size: 52px; }
      .bw-slots { gap: 6px; }
      .bw-slot { width: 42px; height: 50px; }
      .bw-letter { width: 64px; height: 64px; font-size: 1.6rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      .bw-slot.set { animation: none; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = WORDS[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];

    if (!document.getElementById('bw-style')) {
      const style = document.createElement('style');
      style.id = 'bw-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    /* Five different words a run, so nothing comes round twice inside it. */
    const pool = WORDS[lang].filter((w) => w.word.length >= set.min && w.word.length <= set.max);
    const words = shuffle(pool).slice(0, ROUNDS);

    let round = 0;
    let at = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'bw';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.bw-hint').textContent = line; };

    /* The word's own letters, plus however many the run adds that are in no
       part of it — so a spare letter is always genuinely spare. */
    function tiles(word) {
      const own = [...word];
      const spare = shuffle(ALPHABET[lang].filter((l) => !own.includes(l))).slice(0, set.spare);
      return shuffle([...own, ...spare]);
    }

    function nextRound() {
      if (round >= words.length) return finish();

      locked = false;
      at = 0;
      const { emoji, word } = words[round];
      const letters = [...word];

      wrap.innerHTML = `
        <div class="bw-progress" role="img" aria-label="${text.step(round + 1, words.length)}">
          ${words.map((_, i) => `<span class="bw-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="bw-ask">
          <h2>${text.ask}</h2>
          <p class="bw-hint" aria-live="polite">${set.spare ? text.leadSpare : text.lead}</p>
        </div>
        <div class="bw-card">
          <span class="bw-picture" aria-hidden="true">${emoji}</span>
          <div class="bw-slots" role="img" aria-label="${letters.map(() => text.blank).join(' ')}">
            ${letters.map(() => '<span class="bw-slot" aria-hidden="true"></span>').join('')}
          </div>
        </div>
        <div class="bw-letters"></div>`;

      const row = wrap.querySelector('.bw-letters');
      tiles(word).forEach((l) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'bw-letter';
        b.textContent = l;
        b.setAttribute('aria-label', text.letter(l));
        b.addEventListener('click', () => place(b, l, letters));
        row.append(b);
      });
    }

    function place(button, letter, letters) {
      if (locked || button.disabled) return;

      if (letter !== letters[at]) {
        /* Out of order, or a letter the word never had. Both are a second look
           at the picture, and neither is counted. */
        button.classList.remove('nope');
        void button.offsetWidth;
        button.classList.add('nope');
        hint(text.notNext);
        return;
      }

      const slot = wrap.querySelectorAll('.bw-slot')[at];
      slot.textContent = letter;
      slot.classList.add('set');
      button.classList.add('used');
      button.disabled = true;
      at += 1;

      /* The word is read out as far as it has been built, so the slots say
         something truer than "empty, empty, empty" all the way through. */
      wrap.querySelector('.bw-slots').setAttribute(
        'aria-label',
        letters.map((l, i) => (i < at ? l : text.blank)).join(' '),
      );

      if (at < letters.length) return hint('');

      locked = true;
      round += 1;
      later(nextRound, 720);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="bw-end">
          <div class="bw-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.builtAll}</p>
          <div class="bw-actions">
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

  EDGames.register('build-a-word', { sets: SETS, mount, unmount });
})();
