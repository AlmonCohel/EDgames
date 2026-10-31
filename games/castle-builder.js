/* בונים טירה / Build the Castle — shapes, put where the plan says.

   The princess needs a castle, and the builder's plan is drawn in dashed white
   lines on blue paper, like a real blueprint. One part of the plan glows at a
   time; the child picks the shape that fits it from the tray — a square wall,
   a tall rectangle tower, a triangle roof, a round window, an arched door —
   and it is built there in colour, its name said out loud. When the last
   piece is in, a flag goes up and the princess moves in.

   Sets: a little castle (3 pieces), a tower (5), a whole castle with two towers (8). */

(function () {
  const COLOUR = { square: '#ff9fc6', rect: '#b99cff', triangle: '#ff6f91', circle: '#8fd3ff', arch: '#c98a4b' };

  const PLANS = {
    small: [
      { k: 'square', x: 100, y: 140, w: 100, h: 100 },
      { k: 'triangle', x: 90, y: 75, w: 120, h: 65 },
      { k: 'arch', x: 132, y: 186, w: 36, h: 54 },
    ],
    tower: [
      { k: 'rect', x: 120, y: 90, w: 60, h: 150 },
      { k: 'triangle', x: 108, y: 30, w: 84, h: 60 },
      { k: 'arch', x: 134, y: 190, w: 32, h: 50 },
      { k: 'circle', x: 136, y: 116, w: 28, h: 28 },
      { k: 'square', x: 60, y: 180, w: 60, h: 60 },
    ],
    castle: [
      { k: 'rect', x: 40, y: 100, w: 60, h: 140 },
      { k: 'rect', x: 200, y: 100, w: 60, h: 140 },
      { k: 'square', x: 100, y: 140, w: 100, h: 100 },
      { k: 'triangle', x: 30, y: 45, w: 80, h: 55 },
      { k: 'triangle', x: 190, y: 45, w: 80, h: 55 },
      { k: 'arch', x: 130, y: 182, w: 40, h: 58 },
      { k: 'circle', x: 56, y: 128, w: 28, h: 28 },
      { k: 'circle', x: 216, y: 128, w: 28, h: 28 },
    ],
  };

  const SETS = [
    { id: 'small', emoji: '🏠', label: { he: 'טירה קטנה', en: 'A little castle' }, plan: 'small', tray: ['square', 'triangle', 'arch', 'circle'] },
    { id: 'tower', emoji: '🗼', label: { he: 'מגדל', en: 'A tower' }, plan: 'tower', tray: ['square', 'rect', 'triangle', 'arch', 'circle'] },
    { id: 'castle', emoji: '🏰', label: { he: 'טירה גדולה', en: 'A big castle' }, plan: 'castle', tray: ['square', 'rect', 'triangle', 'arch', 'circle'] },
  ];

  const NAMES = {
    he: { square: 'ריבוע', rect: 'מלבן', triangle: 'משולש', circle: 'עיגול', arch: 'קשת' },
    en: { square: 'square', rect: 'rectangle', triangle: 'triangle', circle: 'circle', arch: 'arch' },
  };
  const TEXT = {
    he: { ask: 'איזו צורה מתאימה למקום שמנצנץ?', done: 'הטירה מוכנה! הנסיכה עוברת לגור בה' },
    en: { ask: 'Which shape fits the sparkling spot?', done: 'The castle is ready! The princess is moving in' },
  };

  const CSS = `
    .cb-site { direction: ltr; position: relative; width: min(100%, 520px, max(280px, calc((100vh - 452px) * 1.15))); border-radius: var(--radius); overflow: hidden;
      background: #2f6ae8; background-image: linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px); background-size: 20px 20px; }
    .cb-site.built { background: linear-gradient(180deg, #8fd3ff, #e4f6ff 75%, #8fdc7a 75%); transition: background .8s; }
    .cb-site svg { display: block; width: 100%; height: auto; }
    .cb-slot { fill: rgba(255,255,255,.12); stroke: #fff; stroke-width: 2.5; stroke-dasharray: 7 6; filter: drop-shadow(0 1px 2px rgba(0,0,0,.25)); }
    .cb-slot.now { fill: rgba(255,246,170,.5); stroke: #fff6aa; stroke-width: 4; animation: cb-glow .8s ease-in-out infinite alternate; }
    @keyframes cb-glow { to { fill: rgba(255,246,170,.85); } }
    .cb-piece { stroke: rgba(0,0,0,.18); stroke-width: 2; animation: cb-drop .45s cubic-bezier(.3,1.6,.5,1); transform-box: fill-box; transform-origin: 50% 100%; }
    @keyframes cb-drop { from { transform: translateY(-60px) scale(.8); opacity: 0; } }
    .cb-flag { transform-box: fill-box; transform-origin: 0 50%; animation: cb-wave .6s ease-in-out infinite alternate; }
    @keyframes cb-wave { to { transform: skewY(-10deg) scaleX(.9); } }
    .cb-tray { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .cb-tray .kit-opt { min-width: 84px; min-height: 84px; padding: 10px; }
    .cb-tray svg { width: 56px; height: 56px; }
  `;

  function shape(p, cls, fill) {
    const f = fill ? `fill="${fill}"` : '';
    if (p.k === 'triangle') return `<path class="${cls}" ${f} d="M${p.x} ${p.y + p.h}L${p.x + p.w / 2} ${p.y}L${p.x + p.w} ${p.y + p.h}Z"/>`;
    if (p.k === 'circle') return `<circle class="${cls}" ${f} cx="${p.x + p.w / 2}" cy="${p.y + p.h / 2}" r="${p.w / 2}"/>`;
    if (p.k === 'arch') return `<path class="${cls}" ${f} d="M${p.x} ${p.y + p.h}V${p.y + p.w / 2}A${p.w / 2} ${p.w / 2} 0 0 1 ${p.x + p.w} ${p.y + p.w / 2}V${p.y + p.h}Z"/>`;
    return `<rect class="${cls}" ${f} x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="3"/>`;
  }

  const ICON = {
    square: { k: 'square', x: 8, y: 8, w: 40, h: 40 },
    rect: { k: 'rect', x: 16, y: 2, w: 24, h: 52 },
    triangle: { k: 'triangle', x: 4, y: 8, w: 48, h: 40 },
    circle: { k: 'circle', x: 6, y: 6, w: 44, h: 44 },
    arch: { k: 'arch', x: 12, y: 4, w: 32, h: 48 },
  };

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('cb-style', CSS);
    const plan = PLANS[set.plan];
    let at = 0;

    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);
    wrap.innerHTML = `
      ${EDKit.dots(plan.length, 0)}
      ${EDKit.head(text.ask, lang)}
      <div class="cb-site">
        <svg viewBox="0 0 300 260" aria-hidden="true">
          <g class="cb-built"></g>
          <g class="cb-slots">${plan.map((p, i) => shape(p, `cb-slot${i === 0 ? ' now' : ''}`)).join('')}</g>
        </svg>
      </div>
      <div class="cb-tray">${EDKit.shuffle(set.tray).map((k) => `<button type="button" class="kit-opt" data-k="${k}" aria-label="${NAMES[lang][k]}"><svg viewBox="0 0 56 56">${shape(ICON[k], '', COLOUR[k])}</svg></button>`).join('')}</div>`;

    const slots = [...wrap.querySelectorAll('.cb-slot')];
    const built = wrap.querySelector('.cb-built');
    EDKit.voice(wrap, 'build-ask', lang);

    wrap.querySelectorAll('.cb-tray .kit-opt').forEach((b) => b.addEventListener('click', () => {
      if (at >= plan.length) return;
      const k = b.dataset.k;
      EDVoice.say(`shape-${k}`, lang);
      if (k !== plan[at].k) { EDKit.nope(b); return; }
      EDKit.yes(b);
      slots[at].classList.remove('now');
      slots[at].style.visibility = 'hidden';
      /* Doors and windows go in front of the walls they sit on. */
      built.insertAdjacentHTML('beforeend', shape(plan[at], 'cb-piece', COLOUR[k]));
      at += 1;
      wrap.querySelector('.kit-dots').outerHTML = EDKit.dots(plan.length, at);
      if (at < plan.length) { slots[at].classList.add('now'); return; }
      finish();
    }));

    function finish() {
      wrap.querySelectorAll('.cb-tray .kit-opt').forEach((o) => { o.disabled = true; });
      const roof = plan.filter((p) => p.k === 'triangle')[0] || plan[0];
      const door = plan.find((p) => p.k === 'arch');
      clock.later(() => {
        wrap.querySelector('.cb-site').classList.add('built');
        built.insertAdjacentHTML('beforeend', `
          <path d="M${roof.x + roof.w / 2} ${roof.y}v-26" stroke="#7a5230" stroke-width="3"/>
          <path class="cb-flag" d="M${roof.x + roof.w / 2} ${roof.y - 26}h22l-6 7 6 7h-22z" fill="#ff4d8d"/>
          ${door ? `<text x="${door.x + door.w / 2}" y="${door.y + door.h - 8}" font-size="${door.w * 0.85}" text-anchor="middle">👸</text>` : ''}`);
        wrap.querySelector('.kit-head h2').textContent = text.done;
        EDVoice.say('build-done', lang);
        EDKit.confetti(50);
      }, 600);
      clock.later(() => EDKit.end(wrap, ctx, lang, text.done), 4200);
    }
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('castle-builder', { sets: SETS, mount, unmount });
})();
