/* תופסים בלחיצה / Catch and Click — aiming at something that will not hold still.

   Mouse Moves teaches the four things a mouse does, one at a time, against a
   target that waits politely where it was put. Everything a child then meets on
   a real computer moves: a video's slider, a window's edge, a menu that opens
   under the pointer. This game is the missing half of the skill — keep the
   arrow on a thing while it travels, and click it there.

   Nothing is ever missed for good: a target bounces off the walls instead of
   escaping, a click on empty grass costs nothing, and if a round runs long the
   whole field slows down rather than the child being asked to try harder.

   The field is a coordinate space, so it is pinned to LTR in both languages,
   exactly as Mouse Moves does — a position read off a pointer is physical, and
   is written straight back as `left`. */

(function () {
  /* px per second, and the emoji size that goes with it: the slow run is also
     the big one, so the first set is forgiving twice over. */
  const SETS = [
    {
      id: 'slow', emoji: '🐞',
      label: { he: 'לאט לאט', en: 'Nice and slow' },
      sprite: '🐞',
      one:  { he: 'חיפושית', en: 'ladybird' },
      many: { he: 'חיפושיות', en: 'ladybirds' },
      counts: [1, 1, 1, 2, 2], speed: 34, size: 66,
    },
    {
      id: 'quick', emoji: '🐠',
      label: { he: 'קצת יותר מהר', en: 'A bit quicker' },
      sprite: '🐠',
      one:  { he: 'דג', en: 'fish' },
      many: { he: 'דגים', en: 'fish' },
      counts: [1, 2, 2, 3, 3], speed: 66, size: 56,
    },
    {
      id: 'lots', emoji: '🫧',
      label: { he: 'הרבה ביחד', en: 'Lots at once' },
      sprite: '🫧',
      one:  { he: 'בועה', en: 'bubble' },
      many: { he: 'בועות', en: 'bubbles' },
      counts: [2, 3, 3, 4, 4], speed: 92, size: 46,
    },
  ];

  /* Hebrew glues the article to the noun ("את החיפושית"), English keeps it
     loose — one line per language rather than a shared sentence with a slot. */
  const TEXT = {
    he: {
      step:      (n, of) => `שלב ${n} מתוך ${of}`,
      one:       (name) => `תופסים את ה${name} בלחיצה`,
      many:      (name) => `תופסים את כל ה${name} בלחיצה`,
      aim:       (name) => `מכוונים את החץ אל ה${name} ולוחצים`,
      slower:    'מאיטים קצת',
      wellDone:  'כל הכבוד!',
      caughtAll: 'תפסתם את כולם!',
      again:     'עוד פעם 🐞',
      exit:      'למשחק אחר',
    },
    en: {
      step:      (n, of) => `Step ${n} of ${of}`,
      one:       (name) => `Catch the ${name} with a click`,
      many:      (name) => `Catch all the ${name} with a click`,
      aim:       (name) => `Move the arrow onto the ${name} and click`,
      slower:    'Slowing them down a little',
      wellDone:  'Well done!',
      caughtAll: 'You caught every one!',
      again:     'Again 🐞',
      exit:      'Another game',
    },
  };

  const HELP_AFTER = 9000;
  const HOP_MS = 1500;

  /* A child who asked for less movement still gets the game: instead of gliding,
     a target hops to a new place every so often, so aiming is still the job. */
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CSS = `
    .cc { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .cc-progress { display: flex; gap: 9px; }
    .cc-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .cc-dot.done { background: var(--pos); }
    .cc-ask { text-align: center; }
    .cc-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .cc-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }
    .cc-field {
      direction: ltr;
      position: relative; width: 100%; max-width: 720px; height: 360px;
      background: var(--surface); border: 1.5px solid var(--border);
      border-radius: var(--radius); overflow: hidden;
      touch-action: none;
    }
    .cc-thing {
      position: absolute; font-size: var(--cc-size); line-height: 1;
      background: none; border: none; padding: 4px; margin: 0;
      cursor: pointer; user-select: none;
    }
    .cc-thing.gone { animation: cc-gone 0.34s ease forwards; }
    .cc-splash {
      position: absolute; width: 26px; height: 26px; margin: -13px 0 0 -13px;
      border: 2.5px solid var(--accent); border-radius: 50%;
      pointer-events: none; opacity: 0.7;
      animation: cc-splash 0.4s ease forwards;
    }
    @keyframes cc-gone   { to { transform: scale(1.7); opacity: 0; } }
    @keyframes cc-splash { to { transform: scale(2.2); opacity: 0; } }
    .cc-end { text-align: center; margin: auto; }
    .cc-end .cc-stars { font-size: 46px; letter-spacing: 4px; }
    .cc-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .cc-end p { color: var(--text-soft); margin: 0 0 22px; }
    .cc-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 560px) {
      .cc-field { height: 300px; }
      .cc-thing { font-size: calc(var(--cc-size) * 0.8); }
    }
    @media (prefers-reduced-motion: reduce) {
      .cc-thing.gone { opacity: 0; animation: none; }
      .cc-splash { opacity: 0; animation: none; }
    }
  `;

  let timers = [];
  let frame = null;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  function mount(root, ctx) {
    const text = TEXT[ctx.lang] || TEXT.he;
    const set = ctx.set || SETS[0];
    const COUNTS = set.counts;
    const oneName = set.one[ctx.lang] || set.one.he;
    const manyName = set.many[ctx.lang] || set.many.he;

    if (!document.getElementById('cc-style')) {
      const style = document.createElement('style');
      style.id = 'cc-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let round = 0;
    let things = [];
    let field = null;
    let locked = false;
    let finished = false;
    let hopMs = HOP_MS;
    let last = 0;

    const wrap = document.createElement('div');
    wrap.className = 'cc';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.cc-hint').textContent = line; };

    function shell(count) {
      wrap.innerHTML = `
        <div class="cc-progress" role="img" aria-label="${text.step(round + 1, COUNTS.length)}">
          ${Array.from({ length: COUNTS.length }, (_, i) => `<span class="cc-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="cc-ask">
          <h2 aria-live="polite">${count === 1 ? text.one(oneName) : text.many(manyName)}</h2>
          <p class="cc-hint"></p>
        </div>
        <div class="cc-field"></div>`;
      const el = wrap.querySelector('.cc-field');
      el.style.setProperty('--cc-size', `${set.size}px`);
      return el;
    }

    const spot = (span) => Math.random() * Math.max(1, span);

    function draw(t) {
      t.el.style.left = `${t.x}px`;
      t.el.style.top = `${t.y}px`;
    }

    function spawn(count) {
      things = Array.from({ length: count }, () => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'cc-thing';
        el.textContent = set.sprite;
        el.setAttribute('aria-label', oneName);
        field.append(el);

        /* Never launched straight along an axis: a target that only ever slides
           sideways is chased with one hand, and the point is aiming in two. */
        const angle = (0.35 + Math.random() * 0.3) * (Math.PI / 2);
        const way = () => (Math.random() < 0.5 ? -1 : 1);
        const t = {
          el,
          w: el.offsetWidth,
          h: el.offsetHeight,
          x: 0, y: 0,
          vx: Math.cos(angle) * set.speed * way(),
          vy: Math.sin(angle) * set.speed * way(),
        };
        t.x = spot(field.clientWidth - t.w);
        t.y = spot(field.clientHeight - t.h);
        draw(t);

        el.addEventListener('click', () => caught(t));
        return t;
      });
    }

    /* ---- Movement ---- */

    function advance(dt) {
      const maxX = field.clientWidth;
      const maxY = field.clientHeight;
      things.forEach((t) => {
        t.x += t.vx * dt;
        t.y += t.vy * dt;
        /* The walls of the field turn it round rather than letting it leave —
           a target that escapes is a round that cannot be finished. */
        if (t.x < 0) { t.x = 0; t.vx = Math.abs(t.vx); }
        if (t.x > maxX - t.w) { t.x = maxX - t.w; t.vx = -Math.abs(t.vx); }
        if (t.y < 0) { t.y = 0; t.vy = Math.abs(t.vy); }
        if (t.y > maxY - t.h) { t.y = maxY - t.h; t.vy = -Math.abs(t.vy); }
        draw(t);
      });
    }

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      advance(dt);
      frame = requestAnimationFrame(tick);
    }

    function hopAll() {
      things.forEach((t) => {
        t.x = spot(field.clientWidth - t.w);
        t.y = spot(field.clientHeight - t.h);
        draw(t);
      });
      later(hopAll, hopMs);
    }

    function startMotion() {
      if (REDUCED) { later(hopAll, hopMs); return; }
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }

    function stopMotion() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      timers.forEach(clearTimeout);
      timers = [];
    }

    /* ---- Play ---- */

    function splash(x, y) {
      const s = document.createElement('div');
      s.className = 'cc-splash';
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      field.append(s);
      /* Removed on a timer rather than on animationend, so it still goes away
         where animations are switched off. */
      later(() => s.remove(), 420);
    }

    function caught(t) {
      if (locked || finished) return;
      things = things.filter((x) => x !== t);
      t.el.disabled = true;
      t.el.classList.add('gone');
      if (things.length) {
        later(() => t.el.remove(), 360);
        return;
      }

      /* The last one of the round: the field is about to be rebuilt anyway, so
         it is left to fade rather than given a removal timer that stopMotion
         would clear a line later. */
      locked = true;
      stopMotion();
      round += 1;
      later(nextRound, 420);
    }

    function nextRound() {
      if (round >= COUNTS.length) return finish();

      locked = false;
      hopMs = HOP_MS;
      const count = COUNTS[round];
      field = shell(count);
      spawn(count);

      /* A miss lands on the grass, not on a target — it gets a ripple where the
         click went and a reminder of what to aim at, and costs nothing else. */
      field.addEventListener('pointerdown', (e) => {
        if (locked || finished || e.target !== field) return;
        const box = field.getBoundingClientRect();
        splash(e.clientX - box.left, e.clientY - box.top);
        hint(text.aim(count === 1 ? oneName : manyName));
      });

      startMotion();
      later(slowDown, HELP_AFTER);
    }

    /* Long round, so the field gets easier instead of the child being asked to
       be quicker. It happens once, and it is said out loud. */
    function slowDown() {
      if (locked || finished || !things.length) return;
      things.forEach((t) => { t.vx *= 0.5; t.vy *= 0.5; });
      hopMs *= 2;
      hint(text.slower);
    }

    function finish() {
      finished = true;
      stopMotion();
      wrap.innerHTML = `
        <div class="cc-end">
          <div class="cc-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.caughtAll}</p>
          <div class="cc-actions">
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
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    timers.forEach(clearTimeout);
    timers = [];
  }

  EDGames.register('click-catch', { sets: SETS, mount, unmount });
})();
