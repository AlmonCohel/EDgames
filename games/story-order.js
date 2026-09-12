/* מה קרה קודם? / What Happened First? — putting the pictures of a fairytale back
   into the order they happened in.

   Every tale here is a motif rather than a particular book — an egg that turns
   into a swan, a bean that turns into a tree, a shoe left behind at a ball —
   because a tale a child has never been told is a memory test, not a sequencing
   one. The pictures carry a short caption in both languages, so the order can be
   worked out from the scene and does not depend on knowing the story.

   The strip is filled from the beginning: the only picture that can be placed is
   the next one. A child who taps the ending first is asked what happened before
   it, which is the question the game is about — not told they were wrong. */

(function () {
  /* Three runs, growing by one picture each time. The scenes of every tale are
     written here in the order they happened; the shuffle is what the child
     undoes. */
  const SETS = [
    {
      id: 'three', emoji: '🥚',
      label: { he: 'שלוש תמונות', en: 'Three pictures' },
      tales: [
        [
          { emoji: '🥚', he: 'ביצה בקן', en: 'An egg in a nest' },
          { emoji: '🐣', he: 'אפרוח יוצא', en: 'A chick hatches' },
          { emoji: '🦢', he: 'ברבור גדול ולבן', en: 'A big white swan' },
        ],
        [
          { emoji: '🌰', he: 'גרגר קסום', en: 'A magic bean' },
          { emoji: '🌱', he: 'נבט קטן', en: 'A little sprout' },
          { emoji: '🌳', he: 'עץ עד השמיים', en: 'A tree up to the sky' },
        ],
        [
          { emoji: '🧸', he: 'בובה קטנה', en: 'A little doll' },
          { emoji: '✨', he: 'קסם בלילה', en: 'Magic in the night' },
          { emoji: '👦', he: 'ילד אמיתי', en: 'A real boy' },
        ],
        [
          { emoji: '🧺', he: 'סל עם עוגות', en: 'A basket of cakes' },
          { emoji: '🌲', he: 'שביל ביער', en: 'A path through the forest' },
          { emoji: '🏡', he: 'הבית של סבתא', en: "Grandmother's house" },
        ],
      ],
    },
    {
      id: 'four', emoji: '👠',
      label: { he: 'ארבע תמונות', en: 'Four pictures' },
      tales: [
        [
          { emoji: '🧹', he: 'מנקה את הבית', en: 'Sweeping the house' },
          { emoji: '🧚', he: 'פיה מגיעה', en: 'A fairy appears' },
          { emoji: '💃', he: 'ריקוד בנשף', en: 'Dancing at the ball' },
          { emoji: '👠', he: 'נעל נשארת', en: 'A shoe left behind' },
        ],
        [
          { emoji: '🐷', he: 'שלושה חזירים', en: 'Three little pigs' },
          { emoji: '🌾', he: 'בית מקש מתעופף', en: 'A straw house blows away' },
          { emoji: '🧱', he: 'בונים בית מלבנים', en: 'A brick house goes up' },
          { emoji: '🐺', he: 'הזאב מתייאש', en: 'The wolf gives up' },
        ],
        [
          { emoji: '🏰', he: 'שמחה בטירה', en: 'A happy castle' },
          { emoji: '🧵', he: 'דוקרת אצבע בכישור', en: 'A prick from a spindle' },
          { emoji: '😴', he: 'שינה ארוכה מאוד', en: 'A very long sleep' },
          { emoji: '🌸', he: 'מתעוררים', en: 'Waking up' },
        ],
        [
          { emoji: '🍞', he: 'פירורי לחם בדרך', en: 'Breadcrumbs on the way' },
          { emoji: '🌲', he: 'יער חשוך', en: 'A dark forest' },
          { emoji: '🍬', he: 'בית ממתקים', en: 'A house of sweets' },
          { emoji: '🏡', he: 'חוזרים הביתה', en: 'Home again' },
        ],
      ],
    },
    {
      id: 'five', emoji: '🐉',
      label: { he: 'אגדות ארוכות', en: 'Longer tales' },
      tales: [
        [
          { emoji: '👑', he: 'כתר נופל לבאר', en: 'A crown falls in the well' },
          { emoji: '🐸', he: 'צפרדע מוצאת אותו', en: 'A frog finds it' },
          { emoji: '🤝', he: 'הבטחה קטנה', en: 'A little promise' },
          { emoji: '🏰', he: 'ארוחה בטירה', en: 'Dinner at the castle' },
          { emoji: '🤴', he: 'הצפרדע היא נסיך', en: 'The frog is a prince' },
        ],
        [
          { emoji: '🌾', he: 'חדר מלא קש', en: 'A room full of straw' },
          { emoji: '🧵', he: 'גלגל טווייה', en: 'A spinning wheel' },
          { emoji: '✨', he: 'הקש הופך לזהב', en: 'The straw turns to gold' },
          { emoji: '👑', he: 'המלך מופתע', en: 'The king is amazed' },
          { emoji: '🎉', he: 'חגיגה בארמון', en: 'A feast in the palace' },
        ],
        [
          { emoji: '🐄', he: 'פרה בשוק', en: 'A cow at the market' },
          { emoji: '🌰', he: 'שקית גרגרים', en: 'A bag of beans' },
          { emoji: '🌳', he: 'גבעול עד העננים', en: 'A stalk up to the clouds' },
          { emoji: '☁️', he: 'טירה בעננים', en: 'A castle in the clouds' },
          { emoji: '💰', he: 'אוצר חוזר הביתה', en: 'Treasure comes home' },
        ],
      ],
    },
  ];

  const TEXT = {
    he: {
      step:     (n, of) => `שלב ${n} מתוך ${of}`,
      ask:      'מה קרה קודם, ומה אחר כך?',
      placed:   (n, of) => `${n} תמונות מתוך ${of} בסדר הנכון`,
      notYet:   'משהו קרה לפני זה. מחפשים מה קרה קודם',
      slot:     (n) => `תמונה ${n}`,
      blank:    'מקום ריק',
      wellDone: 'כל הכבוד!',
      toldAll:  'סיפרתם את כל האגדות בסדר הנכון!',
      again:    'עוד פעם 📖',
      exit:     'למשחק אחר',
    },
    en: {
      step:     (n, of) => `Step ${n} of ${of}`,
      ask:      'What happened first, and what came next?',
      placed:   (n, of) => `${n} of ${of} pictures in the right order`,
      notYet:   'Something happened before that. Look for what came first',
      slot:     (n) => `picture ${n}`,
      blank:    'empty place',
      wellDone: 'Well done!',
      toldAll:  'You told every tale in the right order!',
      again:    'Again 📖',
      exit:     'Another game',
    },
  };

  /* Three tales a run, however many the set has to choose from. */
  const TALES_PER_RUN = 3;

  const CSS = `
    .so { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .so-progress { display: flex; gap: 9px; }
    .so-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .so-dot.done { background: var(--pos); }
    .so-ask { text-align: center; }
    .so-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .so-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }
    .so-strip, .so-tray {
      display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
      width: 100%; max-width: 660px;
    }
    .so-slot, .so-card {
      flex: 1 1 104px; max-width: 140px; min-height: 124px;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
      border-radius: var(--radius-sm); padding: 8px 6px;
    }
    .so-slot { border: 2px dashed var(--border); background: var(--bg-raise); }
    .so-slot.full { border-style: solid; border-color: var(--pos); background: var(--sub-tint, var(--sel-tint)); }
    .so-order {
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: 1.1rem;
      font-variant-numeric: tabular-nums; color: var(--text-soft);
    }
    .so-card {
      background: var(--bg-raise); border: 2px solid var(--border);
      cursor: pointer; font: inherit; color: var(--text);
      transition: transform 0.12s ease, box-shadow 0.15s ease;
    }
    .so-card:hover:not([disabled]) { transform: translateY(-3px); }
    /* A placed picture leaves its hole in the tray rather than closing it up:
       the pictures that are left stay where the child last saw them. */
    .so-card.used { visibility: hidden; }
    .so-card.nope { animation: so-shake 0.36s ease; }
    @keyframes so-shake { 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }
    .so-scene { font-size: 40px; line-height: 1; }
    .so-caption { font-size: 0.85rem; line-height: 1.25; text-align: center; }
    .so-end { text-align: center; margin: auto; }
    .so-end .so-stars { font-size: 46px; letter-spacing: 4px; }
    .so-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .so-end p { color: var(--text-soft); margin: 0 0 22px; }
    .so-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .so-strip, .so-tray { gap: 8px; }
      .so-slot, .so-card { flex-basis: 88px; min-height: 104px; }
      .so-scene { font-size: 32px; }
      .so-caption { font-size: 0.78rem; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];

    if (!document.getElementById('so-style')) {
      const style = document.createElement('style');
      style.id = 'so-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    const tales = shuffle(set.tales).slice(0, TALES_PER_RUN);
    let tale = 0;
    let next = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'so';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.so-hint').textContent = line; };

    function nextTale() {
      if (tale >= tales.length) return finish();

      const scenes = tales[tale];
      next = 0;
      locked = false;

      wrap.innerHTML = `
        <div class="so-progress" role="img" aria-label="${text.step(tale + 1, tales.length)}">
          ${tales.map((_, i) => `<span class="so-dot ${i < tale ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="so-ask">
          <h2 aria-live="polite">${text.ask}</h2>
          <p class="so-hint">${text.placed(0, scenes.length)}</p>
        </div>
        <div class="so-strip">
          ${scenes.map((_, i) => `
            <div class="so-slot" aria-label="${text.slot(i + 1)}: ${text.blank}">
              <span class="so-order" aria-hidden="true">${i + 1}</span>
            </div>`).join('')}
        </div>
        <div class="so-tray"></div>`;

      const tray = wrap.querySelector('.so-tray');
      shuffle(scenes.map((scene, i) => ({ scene, i }))).forEach(({ scene, i }) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'so-card';
        b.dataset.index = i;
        b.setAttribute('aria-label', scene[lang]);
        b.innerHTML = `
          <span class="so-scene" aria-hidden="true">${scene.emoji}</span>
          <span class="so-caption">${scene[lang]}</span>`;
        b.addEventListener('click', () => place(b, i, scenes));
        tray.append(b);
      });
    }

    function place(card, index, scenes) {
      if (locked || card.disabled) return;

      if (index !== next) {
        /* Out of order is a look, not a mistake: the picture wobbles, stays in
           the tray, and the hint says which end of the tale to start from. */
        card.classList.remove('nope');
        void card.offsetWidth;
        card.classList.add('nope');
        hint(text.notYet);
        return;
      }

      const scene = scenes[index];
      const slot = wrap.querySelectorAll('.so-slot')[next];
      slot.classList.add('full');
      slot.setAttribute('aria-label', `${text.slot(next + 1)}: ${scene[lang]}`);
      slot.innerHTML = `
        <span class="so-scene" aria-hidden="true">${scene.emoji}</span>
        <span class="so-caption">${scene[lang]}</span>`;

      card.classList.add('used');
      card.disabled = true;
      next += 1;
      hint(text.placed(next, scenes.length));

      if (next < scenes.length) return;

      locked = true;
      tale += 1;
      later(nextTale, 700);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="so-end">
          <div class="so-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.toldAll}</p>
          <div class="so-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    nextTale();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  EDGames.register('story-order', { sets: SETS, mount, unmount });
})();
