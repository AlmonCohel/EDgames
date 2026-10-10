/* כותבים אות / Trace the Letter — writing a letter with a finger along its shape.

   Letter tracing is on every early-writing site, Hebrew or English: a big pale
   letter, a crayon, and the child goes over it. Here the letter is drawn into
   an off-screen canvas, sampled into a few hundred points, and a point counts as
   traced once the finger passes near it. When most of the letter is covered the
   letter is done — close enough is the point at this age, not a perfect stroke,
   and nothing is ever marked wrong.

   The alphabet follows the language on screen, like Letter Hunt. */

(function () {
  const ALPHA = {
    he: { first: [...'אבגדהוזחטי'], all: [...'אבגדהוזחטיכלמנסעפצקרשת'], finals: [...'ךםןףץ'] },
    en: { first: [...'ABCDEFGHIJ'], all: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'], finals: [...'abcdefghij'] },
  };

  const SETS = [
    { id: 'first', emoji: '✏️', label: { he: 'אותיות ראשונות', en: 'First letters' }, pool: 'first' },
    { id: 'all', emoji: '🖍️', label: { he: 'כל האותיות', en: 'All the letters' }, pool: 'all' },
    { id: 'finals', emoji: '🔤', label: { he: 'אותיות סופיות', en: 'Small letters' }, pool: 'finals' },
  ];

  const TEXT = {
    he: {
      step: (n, of) => `אות ${n} מתוך ${of}`,
      ask: (l) => `כותבים את האות ${l} עם האצבע`,
      hint: 'עוברים עם האצבע על כל האות',
      almost: 'עוד קצת! צובעים את כל האות',
      right: 'איזו אות יפה!',
      clear: 'מחיקה',
      wellDone: 'כל הכבוד!',
      done: 'כתבתם את כל האותיות!',
      again: 'עוד פעם ✏️',
      exit: 'למשחק אחר',
    },
    en: {
      step: (n, of) => `Letter ${n} of ${of}`,
      ask: (l) => `Write the letter ${l} with your finger`,
      hint: 'Go over the whole letter with your finger',
      almost: 'A little more! Colour in the whole letter',
      right: 'What a lovely letter!',
      clear: 'Clear',
      wellDone: 'Well done!',
      done: 'You wrote every letter!',
      again: 'Again ✏️',
      exit: 'Another game',
    },
  };

  const ROUNDS = 4;
  const DONE_AT = 0.78;    // share of the letter's points that must be traced
  const COLOURS = ['#7c4ced', '#2f6ae8', '#e8621c', '#1c9a57'];

  const CSS = `
    .lt { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 6px 0 16px; width: 100%; }
    .lt-progress { display: flex; gap: 9px; }
    .lt-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .lt-dot.done { background: var(--pos); }
    .lt h2 { margin: 0; font-size: 1.35rem; text-align: center; }
    .lt-hint { margin: 0; color: var(--text-soft); font-size: .95rem; min-height: 1.6em; text-align: center; }
    .lt-pad { position: relative; width: min(100%, 340px); aspect-ratio: 1; border-radius: 28px; background:
      repeating-linear-gradient(#fff 0 47px, #dbe8f7 47px 49px); border: 2px solid var(--border); box-shadow: 0 6px 0 var(--edge, var(--border)); overflow: hidden; touch-action: none; }
    .lt-pad canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
    .lt-meter { width: min(100%, 340px); height: 14px; border-radius: 7px; background: var(--border); overflow: hidden; }
    .lt-meter i { display: block; height: 100%; width: 0; background: var(--pos); border-radius: 7px; transition: width .15s; }
    .lt-row { display: flex; gap: 10px; }
    .lt-pop { position: absolute; inset: 0; display: grid; place-items: center; font-size: 90px; pointer-events: none; transform: scale(0); transition: transform .4s cubic-bezier(.3,1.8,.5,1); }
    .lt-pop.on { transform: scale(1); }
    .lt-end { text-align: center; margin: auto; }
    .lt-end .lt-stars { font-size: 46px; letter-spacing: 4px; }
    .lt-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .lt-end p { color: var(--text-soft); margin: 0 0 22px; }
    .lt-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  let timers = [];
  let cleanup = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = ALPHA[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];

    if (!document.getElementById('lt-style')) {
      const style = document.createElement('style');
      style.id = 'lt-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    const deck = shuffle(ALPHA[lang][set.pool]).slice(0, ROUNDS);
    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'lt';
    root.append(wrap);

    function next() {
      if (round >= ROUNDS) return finish();
      const letter = deck[round];
      const colour = COLOURS[round % COLOURS.length];
      wrap.innerHTML = `
        <div class="lt-progress" role="img" aria-label="${text.step(round + 1, ROUNDS)}">
          ${Array.from({ length: ROUNDS }, (_, i) => `<span class="lt-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <h2>${text.ask(letter)}</h2>
        <div class="lt-pad"><canvas class="lt-guide"></canvas><canvas class="lt-ink"></canvas><div class="lt-pop" aria-hidden="true">⭐</div></div>
        <div class="lt-meter" aria-hidden="true"><i></i></div>
        <p class="lt-hint" aria-live="polite">${text.hint}</p>
        <div class="lt-row"><button type="button" class="btn btn--ghost" data-clear>${text.clear}</button></div>`;
      const pad = wrap.querySelector('.lt-pad');
      const guide = wrap.querySelector('.lt-guide');
      const ink = wrap.querySelector('.lt-ink');
      const meter = wrap.querySelector('.lt-meter i');
      const hint = wrap.querySelector('.lt-hint');

      const size = pad.clientWidth, D = Math.min(window.devicePixelRatio || 1, 2);
      [guide, ink].forEach((c) => { c.width = size * D; c.height = size * D; c.getContext('2d').setTransform(D, 0, 0, D, 0, 0); });
      const font = `700 ${size * 0.72}px Fredoka, Heebo, sans-serif`;

      // the pale letter to trace over
      const g = guide.getContext('2d');
      g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#e4ecf8'; g.fillText(letter, size / 2, size * 0.54);
      g.setLineDash([3, 9]); g.lineWidth = 3; g.lineCap = 'round'; g.strokeStyle = '#a9bfdc'; g.strokeText(letter, size / 2, size * 0.54);

      // sample the letter into points
      const probe = document.createElement('canvas');
      probe.width = probe.height = size;
      const p = probe.getContext('2d');
      p.font = font; p.textAlign = 'center'; p.textBaseline = 'middle'; p.fillText(letter, size / 2, size * 0.54);
      const data = p.getImageData(0, 0, size, size).data;
      const pts = [];
      const step = Math.max(5, Math.round(size / 60));
      for (let y = 0; y < size; y += step) for (let x = 0; x < size; x += step) if (data[(y * size + x) * 4 + 3] > 128) pts.push({ x, y, hit: false });
      let hits = 0;
      const reach = size * 0.055;

      const x = ink.getContext('2d');
      x.lineWidth = size * 0.085; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = colour;
      let drawing = false, last = null, solved = false;
      const at = (e) => { const r = ink.getBoundingClientRect(); return { x: (e.clientX - r.left) * size / r.width, y: (e.clientY - r.top) * size / r.height }; };
      function mark(q) {
        for (const pt of pts) if (!pt.hit && Math.abs(pt.x - q.x) < reach && Math.abs(pt.y - q.y) < reach && Math.hypot(pt.x - q.x, pt.y - q.y) < reach) { pt.hit = true; hits++; }
        const share = pts.length ? hits / pts.length : 0;
        meter.style.width = `${Math.min(100, share / DONE_AT * 100)}%`;
        if (!solved && share >= DONE_AT) {
          solved = true;
          hint.textContent = text.right;
          wrap.querySelector('.lt-pop').classList.add('on');
          later(() => { round += 1; next(); }, 1300);
        }
      }
      const down = (e) => { if (solved) return; drawing = true; last = at(e); pad.setPointerCapture(e.pointerId); x.beginPath(); x.arc(last.x, last.y, x.lineWidth / 2, 0, 7); x.fillStyle = colour; x.fill(); mark(last); };
      const move = (e) => { if (!drawing || solved) return; const q = at(e); x.beginPath(); x.moveTo(last.x, last.y); x.lineTo(q.x, q.y); x.stroke();
        // fill in the points between two samples so a fast stroke still counts
        const n = Math.ceil(Math.hypot(q.x - last.x, q.y - last.y) / (reach / 2));
        for (let i = 1; i <= n; i++) mark({ x: last.x + (q.x - last.x) * i / n, y: last.y + (q.y - last.y) * i / n });
        last = q; };
      const up = () => { if (drawing && !solved && hits / pts.length > 0.25) hint.textContent = text.almost; drawing = false; };
      pad.addEventListener('pointerdown', down);
      pad.addEventListener('pointermove', move);
      pad.addEventListener('pointerup', up);
      pad.addEventListener('pointercancel', up);
      wrap.querySelector('[data-clear]').addEventListener('click', () => {
        if (solved) return;
        x.clearRect(0, 0, size, size); pts.forEach((pt) => { pt.hit = false; }); hits = 0; meter.style.width = '0'; hint.textContent = text.hint;
      });
    }

    function finish() {
      wrap.innerHTML = `
        <div class="lt-end">
          <div class="lt-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.done}</p>
          <div class="lt-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    /* The letter is drawn in the site's font, so wait for it: a canvas drawn
       before the font arrives would sample the fallback's shape. */
    (document.fonts && document.fonts.load ? document.fonts.load(`700 40px Fredoka`) : Promise.resolve()).then(next, next);
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
    cleanup.forEach((fn) => fn());
    cleanup = [];
  }

  EDGames.register('letter-trace', { sets: SETS, mount, unmount });
})();
