/* זוג זוג / Pair by Pair — turning cards over and remembering where the twin is.

   A wrong pair turns back over after a moment rather than being taken away or
   counted, so the only thing the game ever asks for is another look. The board
   never gets harder inside a run: the run you picked is the size you get.

   Cards keep their place in the grid once matched instead of vanishing — the
   whole skill is remembering positions, and a board that reflows underneath a
   child destroys the map they just built. */

(function () {
  /* Three runs, growing board by board. Each has its own deck as well as its
     own size, so the second time round is a different picture and not the same
     six animals again. */
  const SETS = [
    {
      id: 'three', emoji: '🐣',
      label: { he: 'שלושה זוגות', en: 'Three pairs' },
      deck: ['🐶', '🐱', '🐰', '🐼', '🦊', '🐷'],
      pairs: 3, columns: 3,
    },
    {
      id: 'six', emoji: '🚗',
      label: { he: 'שישה זוגות', en: 'Six pairs' },
      deck: ['🚗', '🚌', '🚂', '🚑', '🚒', '🚕', '🛵', '🚜', '✈️', '⛵'],
      pairs: 6, columns: 4,
    },
    {
      id: 'eight', emoji: '🍎',
      label: { he: 'שמונה זוגות', en: 'Eight pairs' },
      deck: ['🍎', '🍌', '🍇', '🍓', '🍉', '🥕', '🍪', '🧀', '🍞', '🥑', '🍐', '🌽'],
      pairs: 8, columns: 4,
    },
  ];

  const TEXT = {
    he: {
      ask:       'הופכים שני קלפים ומחפשים זוג',
      found:     (n, of) => `נמצאו ${n} זוגות מתוך ${of}`,
      tryAgain:  'לא זוג הפעם. זוכרים איפה הם היו?',
      card:      'קלף הפוך',
      wellDone:  'כל הכבוד!',
      foundAll:  'מצאתם את כל הזוגות!',
      again:     'עוד פעם 🧠',
      exit:      'למשחק אחר',
    },
    en: {
      ask:       'Turn two cards over and look for a pair',
      found:     (n, of) => `${n} of ${of} pairs found`,
      tryAgain:  'Not a pair this time. Remember where they were?',
      card:      'face-down card',
      wellDone:  'Well done!',
      foundAll:  'You found every pair!',
      again:     'Again 🧠',
      exit:      'Another game',
    },
  };

  /* Long enough to look at the second card, short enough that a four-year-old
     does not start tapping over it. */
  const PEEK_MS = 1100;

  const CSS = `
    .mp { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .mp-ask { text-align: center; }
    .mp-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .mp-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }
    .mp-board {
      display: grid; gap: 12px;
      grid-template-columns: repeat(var(--mp-cols), minmax(0, 1fr));
      width: 100%; max-width: 560px;
    }
    .mp-card {
      aspect-ratio: 3 / 4;
      background: none; border: none; padding: 0; margin: 0;
      cursor: pointer; perspective: 700px;
    }
    .mp-card[disabled] { cursor: default; }
    /* The span this lands on is inline by default, and an inline box ignores
       width, height and transform — so without display:block the faces have no
       area to paint and the flip never moves. */
    .mp-face {
      display: block;
      position: relative; width: 100%; height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.34s ease;
    }
    .mp-card.up .mp-face, .mp-card.done .mp-face { transform: rotateY(180deg); }
    .mp-front, .mp-back {
      position: absolute; inset: 0;
      display: grid; place-items: center;
      border-radius: var(--radius-sm);
      backface-visibility: hidden;
      font-size: clamp(26px, 7vw, 44px); line-height: 1;
    }
    .mp-front {
      background: var(--sub-ink, var(--accent-strong)); color: var(--on-accent);
      font-family: "Rubik", sans-serif; font-weight: 700;
    }
    .mp-back {
      transform: rotateY(180deg);
      background: var(--bg-raise); border: 2px solid var(--border);
    }
    .mp-card.done .mp-back { border-color: var(--pos); background: var(--sub-tint, var(--sel-tint)); }
    .mp-card:hover:not([disabled]) .mp-face { transform: translateY(-3px); }
    .mp-card.up:hover .mp-face, .mp-card.done:hover .mp-face { transform: rotateY(180deg); }
    .mp-end { text-align: center; margin: auto; }
    .mp-end .mp-stars { font-size: 46px; letter-spacing: 4px; }
    .mp-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .mp-end p { color: var(--text-soft); margin: 0 0 22px; }
    .mp-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .mp-board { gap: 8px; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const text = TEXT[ctx.lang] || TEXT.he;
    const set = ctx.set || SETS[0];

    if (!document.getElementById('mp-style')) {
      const style = document.createElement('style');
      style.id = 'mp-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let open = [];
    let found = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'mp';
    root.append(wrap);

    wrap.innerHTML = `
      <div class="mp-ask">
        <h2>${text.ask}</h2>
        <p class="mp-hint" aria-live="polite">${text.found(0, set.pairs)}</p>
      </div>
      <div class="mp-board"></div>`;

    const hint = (line) => { wrap.querySelector('.mp-hint').textContent = line; };
    const board = wrap.querySelector('.mp-board');
    board.style.setProperty('--mp-cols', set.columns);

    const faces = shuffle(set.deck).slice(0, set.pairs);
    shuffle([...faces, ...faces]).forEach((face) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mp-card';
      b.dataset.face = face;
      b.setAttribute('aria-label', text.card);
      b.innerHTML = `
        <span class="mp-face">
          <span class="mp-front" aria-hidden="true">?</span>
          <span class="mp-back" aria-hidden="true">${face}</span>
        </span>`;
      b.addEventListener('click', () => turn(b));
      board.append(b);
    });

    function turn(card) {
      if (locked || card.classList.contains('up') || card.disabled) return;

      card.classList.add('up');
      card.setAttribute('aria-label', card.dataset.face);
      open.push(card);
      if (open.length < 2) return;

      const [a, b] = open;
      if (a.dataset.face === b.dataset.face) {
        open = [];
        found += 1;
        [a, b].forEach((c) => { c.classList.remove('up'); c.classList.add('done'); c.disabled = true; });
        hint(text.found(found, set.pairs));
        if (found === set.pairs) {
          locked = true;
          later(finish, 640);
        }
        return;
      }

      /* Both stay face up long enough to be read, then turn back. Nothing is
         taken away and nothing is counted against the child. */
      locked = true;
      later(() => {
        open.forEach((c) => { c.classList.remove('up'); c.setAttribute('aria-label', text.card); });
        open = [];
        locked = false;
      }, PEEK_MS);
      hint(text.tryAgain);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="mp-end">
          <div class="mp-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.foundAll}</p>
          <div class="mp-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  EDGames.register('memory-pairs', { sets: SETS, mount, unmount });
})();
