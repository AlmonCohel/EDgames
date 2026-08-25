/* העכבר הזריז / Mouse Moves — the four things a mouse does.

   One skill per round, in the order they are learned: point at something, click
   it, double-click it, drag it somewhere. Everything is driven by pointer
   events, so the same rounds work with a mouse, a trackpad or a finger.

   The play field is a coordinate space rather than a piece of text: it is
   pinned to LTR so that a position measured from a pointer (which is always
   physical) can be written straight back as `left`, in Hebrew as in English.
   All the reading happens above the field, where direction still matters. */

(function () {
  /* Escalating, with the two harder skills coming round twice. */
  const ROUNDS = ['point', 'click', 'double', 'drag', 'double', 'drag'];

  const HOVER_MS = 800;

  const TEXT = {
    he: {
      step:      (n, of) => `שלב ${n} מתוך ${of}`,
      point:     'מזיזים את העכבר ומניחים את החץ על הפרפר',
      click:     'לוחצים פעם אחת על הבועה',
      double:    'לוחצים פעמיים מהר על הביצה',
      drag:      'גוררים את התפוח אל הסל',
      pointHint: 'לא ללחוץ — רק להניח את החץ ולהישאר',
      clickHint: 'לחיצה אחת קצרה',
      doubleHint: 'כמעט! שתי לחיצות מהר אחת אחרי השנייה',
      dragHint:  'לוחצים על התפוח, מחזיקים, וגוררים אל הסל',
      target:    { point: 'פרפר', click: 'בועה', double: 'ביצה', drag: 'תפוח' },
      basket:    'סל',
      wellDone:  'כל הכבוד!',
      allDone:   'אתם כבר יודעים להשתמש בעכבר!',
      again:     'עוד פעם 🖱️',
      exit:      'למשחק אחר',
    },
    en: {
      step:      (n, of) => `Step ${n} of ${of}`,
      point:     'Move the mouse and rest the arrow on the butterfly',
      click:     'Click the bubble once',
      double:    'Double-click the egg, quickly',
      drag:      'Drag the apple into the basket',
      pointHint: 'No clicking — just rest the arrow there and wait',
      clickHint: 'One short click',
      doubleHint: 'Almost! Two clicks, quickly one after the other',
      dragHint:  'Press on the apple, hold, and drag it to the basket',
      target:    { point: 'butterfly', click: 'bubble', double: 'egg', drag: 'apple' },
      basket:    'basket',
      wellDone:  'Well done!',
      allDone:   'You know how to use a mouse now!',
      again:     'Again 🖱️',
      exit:      'Another game',
    },
  };

  const SPRITE = { point: '🦋', click: '🫧', double: '🥚', drag: '🍎' };

  const CSS = `
    .mm { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .mm-progress { display: flex; gap: 9px; }
    .mm-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .mm-dot.done { background: var(--pos); }
    .mm-ask { text-align: center; }
    .mm-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .mm-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }
    .mm-field {
      direction: ltr;
      position: relative; width: 100%; max-width: 720px; height: 360px;
      background: var(--surface); border: 1.5px solid var(--border);
      border-radius: var(--radius); overflow: hidden;
      touch-action: none;
    }
    .mm-sprite {
      position: absolute; font-size: 62px; line-height: 1;
      background: none; border: none; padding: 6px; margin: 0;
      cursor: pointer; user-select: none;
      transition: transform 0.12s ease;
    }
    .mm-sprite:hover { transform: scale(1.08); }
    .mm-sprite.grab { cursor: grab; touch-action: none; }
    .mm-sprite.grabbing { cursor: grabbing; transform: scale(1.12); transition: none; }
    .mm-sprite.wobble { animation: mm-wobble 0.4s ease; }
    .mm-sprite.gone { animation: mm-gone 0.34s ease forwards; }
    .mm-basket { position: absolute; font-size: 70px; line-height: 1; padding: 6px; }
    .mm-basket.open { animation: mm-bump 0.34s ease; }
    .mm-ring {
      position: absolute; height: 8px; border-radius: 999px;
      background: var(--border); overflow: hidden;
    }
    .mm-ring i { display: block; height: 100%; width: 0; background: var(--pos); }
    .mm-ring.filling i { width: 100%; transition: width ${HOVER_MS}ms linear; }
    @keyframes mm-wobble { 25% { transform: rotate(-9deg); } 75% { transform: rotate(9deg); } }
    @keyframes mm-gone   { to { transform: scale(1.6); opacity: 0; } }
    @keyframes mm-bump   { 40% { transform: translateY(-12px) scale(1.1); } }
    .mm-end { text-align: center; margin: auto; }
    .mm-end .mm-stars { font-size: 46px; letter-spacing: 4px; }
    .mm-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .mm-end p { color: var(--text-soft); margin: 0 0 22px; }
    .mm-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .mm-field { height: 300px; }
      .mm-sprite { font-size: 52px; }
      .mm-basket { font-size: 60px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .mm-sprite:hover, .mm-sprite.grabbing { transform: none; }
      .mm-sprite.wobble, .mm-basket.open { animation: none; }
      .mm-sprite.gone { opacity: 0; animation: none; }
    }
  `;

  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  function mount(root, ctx) {
    const text = TEXT[ctx.lang] || TEXT.he;

    if (!document.getElementById('mm-style')) {
      const style = document.createElement('style');
      style.id = 'mm-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let round = 0;
    let locked = false;
    let hoverTimer = null;

    const wrap = document.createElement('div');
    wrap.className = 'mm';
    root.append(wrap);

    /* Somewhere inside the field, with a margin so nothing lands half outside
       and a target is never dropped exactly where the last one was. */
    function place(el, field, avoid) {
      const pad = 20;
      const w = el.offsetWidth || 74;
      const h = el.offsetHeight || 74;
      let left = 0;
      let top = 0;
      for (let tries = 0; tries < 12; tries += 1) {
        left = pad + Math.random() * Math.max(1, field.clientWidth - w - pad * 2);
        top = pad + Math.random() * Math.max(1, field.clientHeight - h - pad * 2);
        if (!avoid || Math.hypot(left - avoid.left, top - avoid.top) > 140) break;
      }
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      return { left, top };
    }

    function sprite(kind, tag) {
      const el = document.createElement(tag);
      if (tag === 'button') el.type = 'button';
      el.className = 'mm-sprite';
      el.textContent = SPRITE[kind];
      el.setAttribute('aria-label', text.target[kind]);
      return el;
    }

    function shell() {
      wrap.innerHTML = `
        <div class="mm-progress" role="img" aria-label="${text.step(round + 1, ROUNDS.length)}">
          ${Array.from({ length: ROUNDS.length }, (_, i) => `<span class="mm-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="mm-ask">
          <h2 aria-live="polite">${text[ROUNDS[round]]}</h2>
          <p class="mm-hint"></p>
        </div>
        <div class="mm-field"></div>`;
      return wrap.querySelector('.mm-field');
    }

    const hint = (line) => { wrap.querySelector('.mm-hint').textContent = line; };

    function win(el) {
      if (locked) return;
      locked = true;
      el.classList.add('gone');
      round += 1;
      later(nextRound, 420);
    }

    /* ---- The four skills ---- */

    function roundPoint(field) {
      /* A div, not a button: the child is being taught to point, and a button
         invites the click that is not the answer yet. */
      const bug = sprite('point', 'div');
      field.append(bug);
      place(bug, field);

      const ring = document.createElement('div');
      ring.className = 'mm-ring';
      ring.innerHTML = '<i></i>';
      field.append(ring);

      /* The bar sits under the butterfly and follows it, so the wait has
         somewhere visible to happen. */
      ring.style.width = `${bug.offsetWidth}px`;
      ring.style.left = bug.style.left;
      ring.style.top = `${parseFloat(bug.style.top) + bug.offsetHeight + 6}px`;

      bug.addEventListener('pointerenter', () => {
        if (locked) return;
        ring.classList.add('filling');
        hoverTimer = later(() => { ring.remove(); win(bug); }, HOVER_MS);
      });
      bug.addEventListener('pointerleave', () => {
        clearTimeout(hoverTimer);
        ring.classList.remove('filling');
      });
      bug.addEventListener('pointerdown', () => hint(text.pointHint));
    }

    function roundClick(field) {
      const bubble = sprite('click', 'button');
      field.append(bubble);
      place(bubble, field);
      bubble.addEventListener('click', () => win(bubble));
    }

    function roundDouble(field) {
      const egg = sprite('double', 'button');
      field.append(egg);
      place(egg, field);

      egg.addEventListener('click', () => {
        if (locked) return;
        /* A single click is not wrong, it is half the answer — say so. */
        egg.classList.remove('wobble');
        void egg.offsetWidth;
        egg.classList.add('wobble');
        hint(text.doubleHint);
      });
      egg.addEventListener('dblclick', () => win(egg));
    }

    function roundDrag(field) {
      const basket = document.createElement('div');
      basket.className = 'mm-basket';
      basket.textContent = '🧺';
      basket.setAttribute('aria-label', text.basket);
      field.append(basket);
      const where = place(basket, field);

      const apple = sprite('drag', 'div');
      apple.classList.add('grab');
      field.append(apple);
      place(apple, field, where);

      let grab = null;

      apple.addEventListener('pointerdown', (e) => {
        if (locked) return;
        const rect = apple.getBoundingClientRect();
        grab = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
        apple.setPointerCapture(e.pointerId);
        apple.classList.add('grabbing');
        hint(text.dragHint);
        e.preventDefault();
      });

      apple.addEventListener('pointermove', (e) => {
        if (!grab) return;
        const field_ = field.getBoundingClientRect();
        const left = Math.min(Math.max(0, e.clientX - field_.left - grab.dx), field.clientWidth - apple.offsetWidth);
        const top = Math.min(Math.max(0, e.clientY - field_.top - grab.dy), field.clientHeight - apple.offsetHeight);
        apple.style.left = `${left}px`;
        apple.style.top = `${top}px`;
      });

      const drop = () => {
        if (!grab) return;
        grab = null;
        apple.classList.remove('grabbing');

        const a = apple.getBoundingClientRect();
        const b = basket.getBoundingClientRect();
        const over = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        if (over) {
          basket.classList.add('open');
          win(apple);
        } else {
          /* Dropped short: it stays where it was let go, and the hint stands. */
          hint(text.dragHint);
        }
      };

      apple.addEventListener('pointerup', drop);
      apple.addEventListener('pointercancel', drop);
    }

    const BUILD = { point: roundPoint, click: roundClick, double: roundDouble, drag: roundDrag };

    function nextRound() {
      if (round >= ROUNDS.length) return finish();
      locked = false;
      const field = shell();
      BUILD[ROUNDS[round]](field);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="mm-end">
          <div class="mm-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.allDone}</p>
          <div class="mm-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', () => { round = 0; nextRound(); });
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    nextRound();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  EDGames.register('mouse-moves', { mount, unmount });
})();
