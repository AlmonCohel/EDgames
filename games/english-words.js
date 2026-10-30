/* מילים ראשונות באנגלית / First English Words — hearing comes first.

   The word is said, not shown: pick the picture from the sound alone, the way a
   first language is learned. Only after the right answer does the word appear,
   with its Hebrew beside it, and it is said once more. A wrong picture simply says
   the word again.

   With the site's sound on "quiet" there is nothing to hear, so the word is printed
   from the start instead of the game being unplayable.

   Sets: animals, food, things around us. */

(function () {
  const SETS = [
    {
      id: 'animals', emoji: '🐶', label: { he: 'חיות', en: 'Animals' },
      words: [['dog', '🐶', 'כלב'], ['cat', '🐱', 'חתול'], ['fish', '🐟', 'דג'], ['bird', '🐦', 'ציפור'], ['horse', '🐴', 'סוס'], ['cow', '🐮', 'פרה'], ['duck', '🦆', 'ברווז'], ['frog', '🐸', 'צפרדע']],
    },
    {
      id: 'food', emoji: '🍎', label: { he: 'אוכל', en: 'Food' },
      words: [['apple', '🍎', 'תפוח'], ['banana', '🍌', 'בננה'], ['bread', '🍞', 'לחם'], ['milk', '🥛', 'חלב'], ['egg', '🥚', 'ביצה'], ['cake', '🍰', 'עוגה'], ['cheese', '🧀', 'גבינה'], ['water', '💧', 'מים']],
    },
    {
      id: 'things', emoji: '⚽', label: { he: 'דברים מסביב', en: 'Things around us' },
      words: [['ball', '⚽', 'כדור'], ['book', '📖', 'ספר'], ['car', '🚗', 'מכונית'], ['house', '🏠', 'בית'], ['tree', '🌳', 'עץ'], ['sun', '☀️', 'שמש'], ['star', '⭐', 'כוכב'], ['key', '🔑', 'מפתח']],
    },
  ];

  const TEXT = {
    he: { ask: 'מקשיבים ומוצאים את התמונה', hear: 'לשמוע שוב' },
    en: { ask: 'Listen and find the picture', hear: 'Hear it again' },
  };

  const ROUNDS = 6;

  const CSS = `
    .ew-grid { display: grid; grid-template-columns: repeat(2, 128px); gap: 14px; justify-content: center; }
    .ew-grid .kit-opt { width: 128px; height: 128px; font-size: 4rem; }
    .ew-word { min-height: 3.2rem; display: flex; gap: 12px; justify-content: center; align-items: baseline; font-weight: 700; }
    .ew-word b { font-size: 2.2rem; color: var(--sub-solid); font-weight: 700; }
    .ew-word span { font-size: 1.3rem; color: var(--text-soft); }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const set = ctx.set || SETS[0];
    EDKit.style('ew-style', CSS);

    const quiet = EDSound.quiet();
    const rounds = EDKit.shuffle(set.words).slice(0, ROUNDS);
    let round = 0;
    let busy = false;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    const wordKey = (w) => ({ key: `word-${w}`, lang: 'en' });

    function next() {
      if (round >= rounds.length) return EDKit.end(wrap, ctx, lang);
      busy = false;
      const [word, pic, he] = rounds[round];
      const others = EDKit.shuffle(set.words.filter((w) => w[0] !== word)).slice(0, 3);
      const options = EDKit.shuffle([rounds[round], ...others]);
      wrap.innerHTML = `
        ${EDKit.dots(rounds.length, round)}
        ${EDKit.head(TEXT[lang].ask, lang)}
        <div class="ew-word" dir="ltr" aria-live="polite">${quiet ? `<b>${word}</b>` : ''}</div>
        <div class="ew-grid">
          ${options.map(([w, p, h]) => `<button type="button" class="kit-opt" data-w="${w}" aria-label="${lang === 'he' ? h : w}">${p}</button>`).join('')}
        </div>`;
      /* The instruction once, on the first round; after that the word alone, so
         a run of six is six words and not six sentences. */
      EDKit.voice(wrap, round === 0 ? ['words-ask', wordKey(word)] : [wordKey(word)], lang);
      const say = wrap.querySelector('.kit-say');
      say.onclick = () => { say.classList.remove('nudge'); EDVoice.say([wordKey(word)], lang); };
      wrap.querySelectorAll('.kit-opt').forEach((b) => b.addEventListener('click', () => {
        if (busy) return;
        if (b.dataset.w !== word) { EDKit.nope(b); EDVoice.say([wordKey(word)], lang); return; }
        busy = true;
        EDKit.yes(b);
        wrap.querySelector('.ew-word').innerHTML = `<b>${word}</b><span dir="rtl" aria-hidden="${lang !== 'he'}">${he}</span><span aria-hidden="true">${pic}</span>`;
        EDVoice.say([wordKey(word)], lang).then(() => EDKit.praise(lang));
        round += 1;
        clock.later(next, 2600);
      }));
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('english-words', { sets: SETS, mount, unmount });
})();
