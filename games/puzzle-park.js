/* פאזל בפארק / Park Puzzle — a picture with pieces out of it, and the pieces
   put back.

   A real jigsaw needs a photograph cut up, and this site has no pictures to cut
   — so the picture is built out of a grid of little scenes instead: a sun, two
   trees, a fountain, a duck on the water. It comes apart the same way and it
   goes back the same way, and it has the advantage that every piece is a thing
   a child can name.

   Pieces are placed with two taps, not dragged — the same call `shape-match`
   makes and for the same reason: a four-year-old on a tablet loses the piece
   halfway across. The tray always has one piece already picked, so the ordinary
   case is a single tap on the hole.

   A piece is matched by what is drawn on it rather than by which hole it came
   out of, so when the park loses both its trees either tree goes in either gap.
   Telling a child that one tree is in the wrong tree-shaped hole would be a lie
   about the picture.

   The three runs escalate in the way this game's subject asks for. Two pieces
   and four are copying: the finished picture sits above the board the whole
   time. Six covers it over — one look at the start, and a button to look again
   — which turns the same board from a copying task into a remembering one. */

(function () {
  const PICTURES = [
    {
      id: 'park', columns: 3,
      he: 'הפארק', en: 'the park',
      cells: [
        '☀️', '☁️', '🐦',
        '🌳', '⛲', '🌳',
        '🌷', '🐢', '🌻',
      ],
    },
    {
      id: 'playground', columns: 3,
      he: 'גן המשחקים', en: 'the playground',
      cells: [
        '☁️', '🎈', '☁️',
        '🎠', '🧒', '⚽',
        '🍀', '🚲', '🌷',
      ],
    },
    {
      id: 'pond', columns: 4,
      he: 'האגם', en: 'the pond',
      cells: [
        '☀️', '☁️', '🦋', '☁️',
        '🌲', '🌲', '🐿️', '🌲',
        '💧', '🦆', '🦆', '💧',
        '🐟', '💧', '🐟', '🌾',
      ],
    },
  ];

  /* All three pictures every run; what changes is how much of each is missing,
     and whether the finished one stays on screen to copy from. */
  const SETS = [
    {
      id: 'two', emoji: '🧩',
      label: { he: 'שתי חתיכות', en: 'Two pieces' },
      holes: 2, remember: false,
    },
    {
      id: 'four', emoji: '🌳',
      label: { he: 'ארבע חתיכות', en: 'Four pieces' },
      holes: 4, remember: false,
    },
    {
      id: 'six', emoji: '🦆',
      label: { he: 'שש חתיכות — מהזיכרון', en: 'Six pieces, from memory' },
      holes: 6, remember: true,
    },
  ];

  const TEXT = {
    he: {
      step:     (n, of) => `תמונה ${n} מתוך ${of}`,
      ask:      (name) => `משלימים את התמונה של ${name}`,
      model:    'ככה התמונה צריכה להיראות',
      lead:     'בוחרים חתיכה ולוחצים על המקום הריק שלה',
      notHere:  'החתיכה הזאת לא שייכת לשם. מנסים מקום אחר',
      covered:  'התמונה מכוסה. זוכרים איפה כל חתיכה?',
      tray:     'החתיכות שנפלו',
      peek:     'לראות שוב 👀',
      hole:     'מקום ריק בתמונה',
      wellDone: 'כל הכבוד!',
      builtAll: 'הרכבתם את כל התמונות!',
      again:    'עוד פעם 🧩',
      exit:     'למשחק אחר',
    },
    en: {
      step:     (n, of) => `Picture ${n} of ${of}`,
      ask:      (name) => `Finish the picture of ${name}`,
      model:    'This is how the picture should look',
      lead:     'Pick a piece and tap the empty place it belongs in',
      notHere:  'That piece does not go there. Try another place',
      covered:  'The picture is covered. Do you remember where each piece goes?',
      tray:     'The pieces that fell out',
      peek:     'Look again 👀',
      hole:     'an empty place in the picture',
      wellDone: 'Well done!',
      builtAll: 'You put every picture back together!',
      again:    'Again 🧩',
      exit:     'Another game',
    },
  };

  /* Long enough to take the picture in, short enough that it is remembering
     rather than reading off. The button gives back as many looks as are asked
     for — nothing here is a test. */
  const PEEK_MS = 2600;

  const CSS = `
    .pk { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 8px 0 20px; width: 100%; }
    .pk-progress { display: flex; gap: 9px; }
    .pk-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .pk-dot.done { background: var(--pos); }
    .pk-ask { text-align: center; }
    .pk-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .pk-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }

    .pk-grid {
      display: grid; grid-template-columns: repeat(var(--pk-cols), minmax(0, 1fr)); gap: 6px;
    }
    .pk-cell {
      aspect-ratio: 1; display: grid; place-items: center; line-height: 1;
      border-radius: 10px; background: var(--bg-raise); border: 2px solid transparent;
    }

    /* The finished picture, small and captioned, as the thing to work from. */
    .pk-model { position: relative; display: grid; gap: 6px; justify-items: center; }
    .pk-model .pk-grid { width: 150px; }
    .pk-model .pk-cell { font-size: 20px; background: none; }
    .pk-model-label { font-size: 0.85rem; color: var(--text-soft); }
    .pk-cover {
      position: absolute; inset: 0; border-radius: var(--radius-sm);
      background: var(--sub-tint, var(--sel-tint));
      display: grid; place-items: center; font-size: 28px;
      transition: opacity 0.25s ease;
    }
    .pk-cover.lifted { opacity: 0; pointer-events: none; }

    .pk-board {
      padding: 14px; border-radius: var(--radius);
      background: var(--surface); border: 1.5px solid var(--border);
    }
    .pk-board .pk-grid { width: min(340px, 78vw); }
    .pk-board .pk-cell { font-size: clamp(24px, 8vw, 40px); }
    .pk-hole {
      font: inherit; padding: 0; color: var(--text); cursor: pointer;
      border: 2px dashed var(--sub-ink, var(--border)); background: transparent;
      transition: transform 0.12s ease;
    }
    .pk-hole:hover:not([disabled]) { transform: translateY(-3px); }
    .pk-hole[disabled] { cursor: default; }
    .pk-hole.nope { animation: pk-shake 0.36s ease; }
    @keyframes pk-shake { 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }
    .pk-cell.set { border-color: var(--pos); border-style: solid; animation: pk-drop 0.3s ease; }
    @keyframes pk-drop { from { transform: scale(1.3); opacity: 0.4; } }

    .pk-tray-label { color: var(--text-soft); font-size: 0.95rem; margin: 0; }
    .pk-tray { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; min-height: 66px; align-items: center; }
    .pk-piece {
      width: 62px; height: 62px; display: grid; place-items: center;
      font-size: 32px; line-height: 1; cursor: pointer;
      background: var(--bg-raise); border: 2px solid var(--border); border-radius: var(--radius-sm);
      transition: transform 0.12s ease;
    }
    .pk-piece:hover:not([disabled]) { transform: translateY(-3px); }
    .pk-piece[aria-pressed="true"] { border-color: var(--sub-ink, var(--sel-ink)); background: var(--sub-tint, var(--sel-tint)); }
    .pk-piece.gone { visibility: hidden; }

    .pk-end { text-align: center; margin: auto; }
    .pk-end .pk-stars { font-size: 46px; letter-spacing: 4px; }
    .pk-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .pk-end p { color: var(--text-soft); margin: 0 0 22px; }
    .pk-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    @media (max-width: 560px) {
      .pk-piece { width: 54px; height: 54px; font-size: 28px; }
      .pk-board { padding: 10px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .pk-cell.set { animation: none; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];

    if (!document.getElementById('pk-style')) {
      const style = document.createElement('style');
      style.id = 'pk-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    const pictures = shuffle(PICTURES);
    let picture = 0;
    let pieces = [];
    let selected = 0;
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'pk';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.pk-hint').textContent = line; };

    /* The tray always has something picked, so a child who has not understood
       "pick one first" can still tap a hole and get somewhere. */
    function selectFirstLeft() {
      const next = pieces.findIndex((p) => !p.placed);
      if (next !== -1) select(next);
    }

    function select(i) {
      selected = i;
      pieces.forEach((p, n) => p.chip.setAttribute('aria-pressed', String(n === i)));
    }

    function peek() {
      const cover = wrap.querySelector('.pk-cover');
      if (!cover) return;
      cover.classList.add('lifted');
      later(() => cover.classList.remove('lifted'), PEEK_MS);
    }

    function nextPicture() {
      if (picture >= pictures.length) return finish();

      locked = false;
      const pic = pictures[picture];
      const holes = shuffle(pic.cells.map((_, i) => i)).slice(0, Math.min(set.holes, pic.cells.length));
      pieces = shuffle(holes).map((i) => ({ emoji: pic.cells[i], placed: false }));

      wrap.innerHTML = `
        <div class="pk-progress" role="img" aria-label="${text.step(picture + 1, pictures.length)}">
          ${pictures.map((_, i) => `<span class="pk-dot ${i < picture ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="pk-ask">
          <h2>${text.ask(pic[lang] || pic.he)}</h2>
          <p class="pk-hint" aria-live="polite">${set.remember ? text.covered : text.lead}</p>
        </div>
        <div class="pk-model">
          <div class="pk-grid" style="--pk-cols:${pic.columns}" aria-hidden="true">
            ${pic.cells.map((c) => `<span class="pk-cell">${c}</span>`).join('')}
          </div>
          <span class="pk-model-label">${text.model}</span>
          ${set.remember ? '<span class="pk-cover lifted" aria-hidden="true">🙈</span>' : ''}
        </div>
        ${set.remember ? `<button type="button" class="btn btn--ghost" data-peek>${text.peek}</button>` : ''}
        <div class="pk-board">
          <div class="pk-grid" style="--pk-cols:${pic.columns}"></div>
        </div>
        <p class="pk-tray-label">${text.tray}</p>
        <div class="pk-tray"></div>`;

      const board = wrap.querySelector('.pk-board .pk-grid');
      pic.cells.forEach((cell, i) => {
        if (!holes.includes(i)) {
          const span = document.createElement('span');
          span.className = 'pk-cell';
          span.textContent = cell;
          board.append(span);
          return;
        }
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pk-cell pk-hole';
        b.dataset.emoji = cell;
        b.setAttribute('aria-label', text.hole);
        b.addEventListener('click', () => drop(b, cell));
        board.append(b);
      });

      const tray = wrap.querySelector('.pk-tray');
      pieces.forEach((piece, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pk-piece';
        b.textContent = piece.emoji;
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => { if (!piece.placed) select(i); });
        piece.chip = b;
        tray.append(b);
      });

      if (set.remember) {
        wrap.querySelector('[data-peek]').addEventListener('click', peek);
        /* The cover starts up rather than dropping and lifting again, so the
           board does not open on a flash of the thing it is about to hide. */
        peek();
      }

      select(0);
    }

    function drop(hole, wanted) {
      if (locked) return;
      const piece = pieces[selected];

      if (piece.emoji !== wanted) {
        /* A wrong place costs nothing: the hole wobbles, the piece stays in
           hand, and the child tries the next one. */
        hole.classList.remove('nope');
        void hole.offsetWidth;
        hole.classList.add('nope');
        hint(text.notHere);
        return;
      }

      piece.placed = true;
      piece.chip.classList.add('gone');
      piece.chip.disabled = true;
      piece.chip.setAttribute('aria-pressed', 'false');

      hole.disabled = true;
      hole.textContent = piece.emoji;
      hole.classList.add('set');
      hole.removeAttribute('aria-label');
      hint('');

      if (pieces.some((p) => !p.placed)) return selectFirstLeft();

      locked = true;
      picture += 1;
      later(nextPicture, 700);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="pk-end">
          <div class="pk-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.builtAll}</p>
          <div class="pk-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    nextPicture();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  EDGames.register('puzzle-park', { sets: SETS, mount, unmount });
})();
