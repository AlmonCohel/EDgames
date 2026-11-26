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
  // Reuse the seed and soil from this game's cover.
  const SEED = '<ellipse cx="38" cy="106" rx="6" ry="4" fill="#a86d38"/>';
  const PLANTED_SEED = `<svg viewBox="27 97 22 22" focusable="false">
    <rect x="18" y="68" width="40" height="52" fill="#d9f2ff"/>
    <path d="M18 108h40v12H18z" fill="#8a5a2f"/>${SEED}
  </svg>`;
  const LOOSE_SEED = `<svg viewBox="31 99 14 14" focusable="false">${SEED}</svg>`;

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
          { picture: PLANTED_SEED, he: 'גרגר קסום', en: 'A magic bean' },
          { emoji: '🌱', he: 'נבט קטן', en: 'A little sprout' },
          { emoji: '🌳', he: 'עץ עד השמיים', en: 'A tree up to the sky' },
        ],
        [
          { emoji: '🧸', he: 'בובה קטנה', en: 'A little doll' },
          { emoji: '✨', he: 'קסם בלילה', en: 'Magic in the night' },
          { emoji: '👦', he: 'ילד אמיתי', en: 'A real boy' },
        ],
        [
          { emoji: '🧺🍰', he: 'סל עם עוגות', en: 'A basket of cakes' },
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
          { emoji: '🌾🏚️', he: 'בית מקש מתעופף', en: 'A straw house blows away' },
          { emoji: '🧱🏠', he: 'בונים בית מלבנים', en: 'A brick house goes up' },
          { emoji: '🐺', he: 'הזאב מתייאש', en: 'The wolf gives up' },
        ],
        [
          { emoji: '🏰', he: 'שמחה בטירה', en: 'A happy castle' },
          { emoji: '🧵', he: 'דוקרת אצבע בכישור', en: 'A prick from a spindle' },
          { emoji: '😴', he: 'שינה ארוכה מאוד', en: 'A very long sleep' },
          { emoji: '🥱', he: 'מתעוררים', en: 'Waking up' },
        ],
        [
          { emoji: '🍞', he: 'פירורי לחם בדרך', en: 'Breadcrumbs on the way' },
          { emoji: '🌲', he: 'יער חשוך', en: 'A dark forest' },
          { emoji: '🍬🏠', he: 'בית ממתקים', en: 'A house of sweets' },
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
          { emoji: '🏰🍽️', he: 'ארוחה בטירה', en: 'Dinner at the castle' },
          { emoji: '🤴', he: 'הצפרדע היא נסיך', en: 'The frog is a prince' },
        ],
        [
          { emoji: '🌾', he: 'חדר מלא קש', en: 'A room full of straw' },
          { emoji: '🧵', he: 'גלגל טווייה', en: 'A spinning wheel' },
          { emoji: '🌾🏅', he: 'הקש הופך לזהב', en: 'The straw turns to gold' },
          { emoji: '👑', he: 'המלך מופתע', en: 'The king is amazed' },
          { emoji: '🍽️🎉', he: 'חגיגה בארמון', en: 'A feast in the palace' },
        ],
        [
          { emoji: '🐄', he: 'פרה בשוק', en: 'A cow at the market' },
          { emoji: '🛍️', picture: LOOSE_SEED, he: 'שקית גרגרים', en: 'A bag of beans' },
          { emoji: '🌿☁️', he: 'גבעול עד העננים', en: 'A stalk up to the clouds' },
          { emoji: '🏰☁️', he: 'טירה בעננים', en: 'A castle in the clouds' },
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
    body.game-deck #stage:has(> .so) { min-height: 0; }
    .so {
      --so-gap: clamp(8px, 2dvh, 18px);
      display: flex; flex: 1; flex-direction: column; gap: var(--so-gap);
    }
    .so-progress { display: flex; justify-content: center; gap: 9px; }
    .so-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .so-dot.done { background: var(--pos); }
    .so-ask { text-align: center; }
    .so-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .so-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; line-height: 1.4; min-height: 1.4em; }
    /* Give slots and cards equal space, then pack the rows towards their shared gap. */
    .so-board {
      --so-cell-gap: clamp(8px, 1vw, 14px);
      --so-card-width: calc((100cqw - (var(--so-cards-across) - 1) * var(--so-cell-gap)) / var(--so-cards-across));
      --so-card-height: clamp(64px,
        (100% - (var(--so-rows) - 1) * var(--so-cell-gap)) / var(--so-rows),
        1.3 * var(--so-card-width));
      container-type: inline-size;
      display: grid; flex: 1; grid-template-rows: repeat(2, minmax(0, 1fr)); gap: var(--so-gap);
    }
    .so-strip, .so-tray {
      display: grid; gap: var(--so-cell-gap);
      grid-template-columns: repeat(var(--so-columns), minmax(0, 1fr));
      grid-auto-rows: var(--so-card-height);
    }
    .so-strip { align-content: end; }
    .so-tray { align-content: start; }
    .so-slot, .so-card {
      min-width: 0; min-height: 64px;
      container-type: size;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
      border-radius: var(--radius-sm); padding: 8px 6px;
    }
    .so-slot { border: 2px dashed var(--border); background: var(--bg-raise); }
    .so-slot.full { border-style: solid; border-color: var(--pos); background: var(--sub-tint, var(--sel-tint)); }
    .so-order {
      font-weight: 700; font-size: clamp(1.25rem, 4dvh, 2rem);
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
    .so-scene {
      display: flex; align-items: center;
      --so-picture-width: 48cqi;
      font-size: min(var(--so-picture-width), max(22px, 100cqh - var(--so-caption-space, 42px)), 112px);
      line-height: 1; white-space: nowrap;
    }
    .so-scene--pair { --so-picture-width: 24cqi; }
    .so-scene svg { width: 1.08em; height: 1.08em; border-radius: 0.15em; }
    .so-caption { font-size: clamp(0.78rem, 5cqi, 1.15rem); line-height: 1.25; text-align: center; }
    .so-end { text-align: center; margin: auto; }
    .so-end .so-stars { font-size: 46px; letter-spacing: 4px; }
    .so-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .so-end p { color: var(--text-soft); margin: 0 0 22px; }
    .so-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .so { --so-rows: 1; --so-cards-across: var(--so-columns); }
    .so[data-scenes="3"] { --so-columns: 3; }
    .so[data-scenes="4"] { --so-columns: 4; }
    .so[data-scenes="5"] { --so-columns: 5; }
    @media (max-width: 640px) {
      body.game-deck:has(#stage > .so) .game-header h1 {
        font-size: clamp(0.8rem, 4vw, 0.875rem);
        line-height: 1.3; white-space: normal; overflow-wrap: anywhere;
      }
    }
    /* Six tracks let the last two targets sit centered below the first three. */
    @media (max-width: 480px) {
      .so[data-scenes="4"] { --so-columns: 2; --so-rows: 2; }
      .so[data-scenes="4"] .so-board { width: min(100%, 280px); align-self: center; }
      .so[data-scenes="5"] { --so-columns: 6; --so-cards-across: 3; --so-rows: 2; }
      .so[data-scenes="5"] :is(.so-slot, .so-card) { grid-column: span 2; }
      .so[data-scenes="5"] :is(.so-slot, .so-card):nth-child(4) { grid-column: 2 / span 2; }
      .so-hint { min-height: 2.8em; }
    }
    @media (max-width: 480px) and (max-height: 700px) {
      body.game-deck #stage:has(> .so) { padding: 8px; }
      .so { --so-gap: 8px; --so-caption-space: 34px; }
      .so-ask h2 { font-size: 1.2rem; line-height: 1.2; }
      .so-hint { font-size: 0.85rem; }
      .so-slot, .so-card { padding: 4px; gap: 3px; }
      .so-caption { font-size: 0.72rem; line-height: 1.15; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const showScene = (scene, lang) => {
    const emojis = scene.emoji?.match(/\p{Extended_Pictographic}/gu) || [];
    const paired = emojis.length > 1 || (scene.emoji && scene.picture);
    return `
      <span class="so-scene${paired ? ' so-scene--pair' : ''}" aria-hidden="true">${scene.emoji || ''}${scene.picture || ''}</span>
      <span class="so-caption">${scene[lang]}</span>`;
  };

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
      wrap.dataset.scenes = scenes.length;
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
        <div class="so-board">
          <div class="so-strip">
            ${scenes.map((_, i) => `
              <div class="so-slot" aria-label="${text.slot(i + 1)}: ${text.blank}">
                <span class="so-order" aria-hidden="true">${i + 1}</span>
              </div>`).join('')}
          </div>
          <div class="so-tray"></div>
        </div>`;

      const tray = wrap.querySelector('.so-tray');
      shuffle(scenes.map((scene, i) => ({ scene, i }))).forEach(({ scene, i }) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'so-card';
        b.dataset.index = i;
        b.setAttribute('aria-label', scene[lang]);
        b.innerHTML = showScene(scene, lang);
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
      slot.innerHTML = showScene(scene, lang);

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
