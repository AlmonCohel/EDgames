/* גשר הנחל הקטן / The Woodland Stream Crossing
   Sculpted polymer-clay twilight riverbank diorama for ages 3–4.

   - Empty clay diorama background (assets/worlds/stream-crossing/bg.jpg)
   - Little Bear cut-outs (bear-waiting, bear-hop, bear-cheer, bear-oops)
   - Clay-and-moss river stone cut-outs:
       Size set:  stone-s, stone-m, stone-l, stone-xl (no dots)
       Shape set: stone-circle, stone-square, stone-triangle, stone-star (no dots)
       Count set: stone-l with glowing golden dots (1..4) drawn as light effects
   - One idea per step (Size, Count, Shapes, Bridge), spoken task per round,
     underwater glowing outline of the needed stone, full-screen responsive stage. */

(function () {
  const ART = 'assets/worlds/stream-crossing/';

  const SETS = [
    { id: 'sizes',  emoji: '🪨', label: { he: 'גודל',     en: 'Size'   }, mode: 'sizes'  },
    { id: 'count',  emoji: '✨', label: { he: 'סופרים',   en: 'Count'  }, mode: 'count'  },
    { id: 'shapes', emoji: '⭐', label: { he: 'צורות',    en: 'Shapes' }, mode: 'shapes' },
    { id: 'bridge', emoji: '🐻', label: { he: 'כל הגשר',  en: 'Bridge' }, mode: 'bridge' },
  ];

  const SIZES = ['s', 'm', 'l', 'xl'];
  const SIZE_FACTOR = { s: 0.42, m: 0.62, l: 0.82, xl: 1.04 };
  const SHAPES = ['circle', 'square', 'triangle', 'star'];

  const TEXT = {
    he: {
      sizeAsk:  { s: 'הדובון צריך את האבן הקטנה!', m: 'הדובון צריך את האבן הבינונית!', l: 'הדובון צריך את האבן הגדולה!', xl: 'הדובון צריך את האבן הענקית!' },
      countAsk: { 1: 'שימו את האבן עם נקודה אחת!', 2: 'שימו את האבן עם שתי נקודות!', 3: 'שימו את האבן עם שלוש נקודות!', 4: 'שימו את האבן עם ארבע נקודות!' },
      shapeAsk: { circle: 'מצאו את העיגול!', square: 'מצאו את הריבוע!', triangle: 'מצאו את המשולש!', star: 'מצאו את הכוכב!' },
      tip: 'גררו או לחצו על האבן המתאימה כדי לעזור לדובון לחצות את הנחל הביתה',
      infoLabel: 'הוראות להורים',
      done: 'כל הכבוד! הדובון הגיע הביתה!',
      sizeName:  { s: 'קטנה', m: 'בינונית', l: 'גדולה', xl: 'ענקית' },
      shapeName: { circle: 'עיגול', square: 'ריבוע', triangle: 'משולש', star: 'כוכב' },
      stoneAria: (label) => `אבן ${label}`,
    },
    en: {
      sizeAsk:  { s: 'Little Bear needs the small stone!', m: 'Little Bear needs the medium stone!', l: 'Little Bear needs the big stone!', xl: 'Little Bear needs the giant stone!' },
      countAsk: { 1: 'Find the stone with one dot!', 2: 'Find the stone with two dots!', 3: 'Find the stone with three dots!', 4: 'Find the stone with four dots!' },
      shapeAsk: { circle: 'Find the circle!', square: 'Find the square!', triangle: 'Find the triangle!', star: 'Find the star!' },
      tip: 'Drag or tap the matching stone on the bank to help Little Bear cross the stream',
      infoLabel: 'Parent note',
      done: 'Yay! Little Bear made it home!',
      sizeName:  { s: 'small', m: 'medium', l: 'big', xl: 'giant' },
      shapeName: { circle: 'circle', square: 'square', triangle: 'triangle', star: 'star' },
      stoneAria: (label) => `${label} stone`,
    },
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickWrong(pool, correct, count) {
    return shuffle(pool.filter((x) => x !== correct)).slice(0, count);
  }

  /* Build 3 randomized rounds per step — every round starts with an EMPTY stream
     of 3–4 stones, placed one glowing target at a time, strictly ONE idea per round. */
  function buildStepRounds(mode) {
    function makeRound(idea, count) {
      const n = count;
      const queue = Array.from({ length: n }, (_, i) => i);
      if (idea === 'sizes') {
        const picked = shuffle(SIZES).slice(0, n);
        const slots = picked.map((sz) => ({
          placed: false,
          idea: 'sizes',
          size: sz,
          shape: 'circle',
          dots: 0,
        }));
        return { idea: 'sizes', slots, queue };
      }
      if (idea === 'count') {
        const slots = queue.map((i) => ({
          placed: false,
          idea: 'count',
          size: 'l',
          shape: 'circle',
          dots: i + 1,
        }));
        return { idea: 'count', slots, queue };
      }
      const picked = shuffle(SHAPES).slice(0, n);
      const slots = picked.map((sh) => ({
        placed: false,
        idea: 'shapes',
        size: 'l',
        shape: sh,
        dots: 0,
      }));
      return { idea: 'shapes', slots, queue };
    }

    if (mode === 'sizes') {
      return [makeRound('sizes', 3), makeRound('sizes', 3), makeRound('sizes', 4)];
    }
    if (mode === 'count') {
      return [makeRound('count', 3), makeRound('count', 4), makeRound('count', 4)];
    }
    if (mode === 'shapes') {
      return [makeRound('shapes', 3), makeRound('shapes', 4), makeRound('shapes', 4)];
    }
    /* Bridge step: 3 rounds covering sizes, count, and shapes in random order, 4 stones each. */
    return shuffle(['sizes', 'count', 'shapes']).map((idea) => makeRound(idea, 4));
  }

  function makeChoicesForSlot(slot) {
    if (slot.idea === 'sizes') {
      const vals = shuffle([slot.size, ...pickWrong(SIZES, slot.size, 2)]);
      return vals.map((sz) => ({ idea: 'sizes', size: sz, shape: 'circle', dots: 0, correct: sz === slot.size }));
    }
    if (slot.idea === 'count') {
      const vals = shuffle([slot.dots, ...pickWrong([1, 2, 3, 4], slot.dots, 2)]);
      return vals.map((n) => ({ idea: 'count', size: 'l', shape: 'circle', dots: n, correct: n === slot.dots }));
    }
    const vals = shuffle([slot.shape, ...pickWrong(SHAPES, slot.shape, 2)]);
    return vals.map((sh) => ({ idea: 'shapes', size: 'l', shape: sh, dots: 0, correct: sh === slot.shape }));
  }

  function voiceKeyForSlot(slot) {
    if (slot.idea === 'sizes') return `sc-size-${slot.size}`;
    if (slot.idea === 'count') return `sc-count-${slot.dots}`;
    return `sc-shape-${slot.shape}`;
  }

  function askTextForSlot(slot, t) {
    if (slot.idea === 'sizes') return t.sizeAsk[slot.size];
    if (slot.idea === 'count') return t.countAsk[slot.dots];
    return t.shapeAsk[slot.shape];
  }

  function stoneSpriteName(item) {
    if (item.idea === 'sizes') return `stone-${item.size}.png`;
    if (item.idea === 'shapes') return `stone-${item.shape}.png`;
    return 'stone-l.png';
  }

  const CSS = `
    .sc-stage-box {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #061b24;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }
    .sc-canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: pointer;
    }
    .sc-ui {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .sc-hit {
      position: absolute;
      pointer-events: auto;
      transform: translate(-50%, -50%);
      min-width: 76px;
      min-height: 76px;
      border-radius: 26px;
      background: transparent;
      border: 2px solid transparent;
      cursor: grab;
      padding: 0;
      margin: 0;
      color: transparent;
      font-size: 0;
    }
    .sc-hit:active { cursor: grabbing; }
    .sc-hit:focus-visible {
      outline: 3px solid #fde047;
      outline-offset: 2px;
      background: rgba(254, 224, 71, 0.16);
    }
    .sc-hud-top {
      position: absolute;
      top: 10px;
      left: 12px;
      right: 12px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      pointer-events: none;
      z-index: 6;
    }
    .sc-hud-left {
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
    }
    .sc-say-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 2px solid #fde68a;
      background: linear-gradient(180deg, #f59e0b, #d97706);
      color: #1c1004;
      font-size: 26px;
      line-height: 1;
      display: grid;
      place-items: center;
      cursor: pointer;
      box-shadow: 0 5px 16px rgba(0, 0, 0, 0.45), 0 0 14px rgba(245, 158, 11, 0.35);
      transition: transform 0.12s;
    }
    .sc-say-btn:active { transform: scale(0.93); }
    .sc-say-btn.nudge { animation: kit-nudge 1s ease infinite; }
    .sc-dots-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 12px;
      border-radius: 99px;
      background: rgba(6, 22, 30, 0.74);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 224, 150, 0.25);
    }
    .sc-dots-pill .kit-dots { gap: 7px; }
    .sc-dots-pill .kit-dot { width: 11px; height: 11px; background: rgba(255, 255, 255, 0.24); }
    .sc-dots-pill .kit-dot.done { background: #fbbf24; box-shadow: 0 0 8px rgba(251, 191, 36, 0.65); }
    .sc-hud-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      pointer-events: auto;
    }
    .sc-info-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 224, 150, 0.35);
      background: rgba(6, 22, 30, 0.78);
      backdrop-filter: blur(6px);
      color: #fef3c7;
      font: 700 18px Fredoka, sans-serif;
      cursor: pointer;
      display: grid;
      place-items: center;
    }
    .sc-parent-note {
      max-width: min(320px, 76vw);
      padding: 10px 14px;
      border-radius: 16px;
      background: rgba(6, 22, 30, 0.92);
      backdrop-filter: blur(8px);
      border: 1.5px solid rgba(251, 191, 36, 0.45);
      color: #fef9e7;
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.5);
      text-align: start;
    }
    .sc-parent-note[hidden] { display: none; }
    .sc-parent-note h2 { margin: 0 0 4px; font-size: 1rem; color: #fde68a; }
    .sc-parent-note p { margin: 0; font-size: 0.85rem; color: #d6ebe8; line-height: 1.35; }
    .sc-end-overlay {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgba(4, 15, 24, 0.82);
      backdrop-filter: blur(8px);
      z-index: 12;
      padding: 20px;
    }
    .sc-end-overlay[hidden] { display: none; }
    .sc-end-overlay .kit-end {
      background: rgba(9, 27, 38, 0.94);
      border: 2px solid rgba(251, 191, 36, 0.55);
      border-radius: 26px;
      padding: 26px 28px;
      color: #fef9e7;
      box-shadow: 0 18px 44px rgba(0, 0, 0, 0.6);
      max-width: 400px;
      width: 100%;
    }
    .sc-end-overlay .kit-end p { color: #c7e2de; }
    .sc-end-overlay .btn--ghost { color: #fef9e7; background: rgba(255, 255, 255, 0.08); border: 1.5px solid rgba(255, 255, 255, 0.35); box-shadow: none; }

    @media (max-width: 600px) {
      .sc-say-btn { width: 52px; height: 52px; font-size: 24px; }
    }
  `;

  /* ---- Gentle tactile WebAudio effects ---- */
  function sfxPick() {
    if (!window.EDSound || !EDSound.canPlay()) return;
    EDSound.tone({ freq: 340, end: 460, dur: 0.08, type: 'sine', gain: 0.14 });
  }

  function sfxSplash(stepNum) {
    if (!window.EDSound || !EDSound.canPlay()) return;
    EDSound.tone({ freq: 240, end: 110, dur: 0.14, type: 'sine', gain: 0.22 });
    const notes = [440, 523.25, 659.25, 783.99];
    const f = notes[(stepNum - 1) % notes.length];
    setTimeout(() => {
      if (window.EDSound && EDSound.canPlay()) {
        EDSound.tone({ freq: f, end: f * 1.12, dur: 0.18, type: 'triangle', gain: 0.18 });
      }
    }, 65);
  }

  function sfxWobble() {
    if (!window.EDSound || !EDSound.canPlay()) return;
    /* Soft playful bubble plop — never a buzzer */
    EDSound.tone({ freq: 270, end: 215, dur: 0.15, type: 'sine', gain: 0.12 });
  }

  function sfxHop(idx) {
    if (!window.EDSound || !EDSound.canPlay()) return;
    const notes = [392, 440, 523.25, 587.33, 659.25];
    const f = notes[idx % notes.length];
    EDSound.tone({ freq: f, end: f * 1.25, dur: 0.13, type: 'sine', gain: 0.17 });
  }

  function sfxCheer() {
    if (!window.EDSound || !EDSound.canPlay()) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => {
        if (window.EDSound && EDSound.canPlay()) {
          EDSound.tone({ freq: f, end: f * 1.05, dur: 0.18, type: 'sine', gain: 0.17 });
        }
      }, i * 90);
    });
  }

  /* ---- Image preloader ---- */
  const imgCache = new Map();
  function loadImg(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const im = new Image();
    im.src = src;
    imgCache.set(src, im);
    return im;
  }

  function preloadArt() {
    [
      'bg.jpg',
      'bear-waiting.png', 'bear-hop.png', 'bear-cheer.png', 'bear-oops.png',
      'stone-s.png', 'stone-m.png', 'stone-l.png', 'stone-xl.png',
      'stone-circle.png', 'stone-square.png', 'stone-triangle.png', 'stone-star.png',
    ].forEach((f) => loadImg(`${ART}${f}`));
  }

  /* ---- Code-drawn light effects only: glowing dots + underwater target outline ---- */
  function drawGlowingDots(g, cx, cy, stoneW, stoneH, count) {
    if (!count || count <= 0) return;
    const r = Math.max(4.5, Math.min(stoneW, stoneH) * 0.088);
    const dx = stoneW * 0.175;
    const dy = stoneH * 0.135;
    const pts = count === 1 ? [[0, 0]]
      : count === 2 ? [[-dx, 0], [dx, 0]]
      : count === 3 ? [[0, -dy], [-dx, dy * 0.9], [dx, dy * 0.9]]
      : [[-dx, -dy * 0.85], [dx, -dy * 0.85], [-dx, dy * 0.85], [dx, dy * 0.85]];
    const topY = cy - stoneH * 0.11;
    for (const [ox, oy] of pts) {
      const px = cx + ox;
      const py = topY + oy;
      const glow = g.createRadialGradient(px, py, 0, px, py, r * 2.4);
      glow.addColorStop(0, 'rgba(255, 245, 165, 0.95)');
      glow.addColorStop(0.45, 'rgba(251, 191, 36, 0.55)');
      glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(px, py, r * 2.4, 0, Math.PI * 2);
      g.fill();

      g.fillStyle = '#fff9d6';
      g.beginPath();
      g.arc(px, py, r * 0.82, 0, Math.PI * 2);
      g.fill();
    }
  }

  function traceShapePath(g, shape, cx, cy, rx, ry) {
    g.beginPath();
    if (shape === 'square') {
      const x = cx - rx * 0.84;
      const y = cy - ry * 0.82;
      const w = rx * 1.68;
      const h = ry * 1.64;
      const cr = Math.min(w, h) * 0.22;
      g.moveTo(x + cr, y);
      g.lineTo(x + w - cr, y);
      g.quadraticCurveTo(x + w, y, x + w, y + cr);
      g.lineTo(x + w, y + h - cr);
      g.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
      g.lineTo(x + cr, y + h);
      g.quadraticCurveTo(x, y + h, x, y + h - cr);
      g.lineTo(x, y + cr);
      g.quadraticCurveTo(x, y, x + cr, y);
      g.closePath();
    } else if (shape === 'triangle') {
      g.moveTo(cx, cy - ry * 0.96);
      g.lineTo(cx + rx * 0.96, cy + ry * 0.78);
      g.lineTo(cx - rx * 0.96, cy + ry * 0.78);
      g.closePath();
    } else if (shape === 'star') {
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const k = i % 2 === 0 ? 1.04 : 0.48;
        const px = cx + Math.cos(a) * rx * k;
        const py = cy + Math.sin(a) * ry * k;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
    } else {
      g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    }
  }

  function drawUnderwaterTarget(g, cx, cy, slot, baseStoneW, timeTick, hovered) {
    const scale = slot.idea === 'sizes' ? SIZE_FACTOR[slot.size] : 0.84;
    const rx = baseStoneW * scale * 0.48;
    const ry = rx * 0.82;
    const pulse = 1 + Math.sin(timeTick * 2.8) * 0.045 + (hovered ? 0.06 : 0);

    g.save();
    /* Soft underwater luminous pool */
    const pool = g.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx * 1.55);
    pool.addColorStop(0, hovered ? 'rgba(254, 240, 138, 0.36)' : 'rgba(125, 226, 255, 0.30)');
    pool.addColorStop(0.65, hovered ? 'rgba(251, 191, 36, 0.14)' : 'rgba(56, 189, 248, 0.12)');
    pool.addColorStop(1, 'rgba(56, 189, 248, 0)');
    g.fillStyle = pool;
    g.beginPath();
    g.ellipse(cx, cy, rx * 1.55, ry * 1.55, 0, 0, Math.PI * 2);
    g.fill();

    /* Outer water ripple ring */
    const rp = (timeTick * 0.42) % 1;
    g.strokeStyle = `rgba(186, 242, 255, ${(1 - rp) * 0.42})`;
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(cx, cy, rx * (1.02 + rp * 0.42), ry * (1.02 + rp * 0.42), 0, 0, Math.PI * 2);
    g.stroke();

    /* Soft glowing underwater outline matching the needed stone's shape & size */
    g.shadowColor = hovered ? 'rgba(254, 240, 138, 0.9)' : 'rgba(125, 232, 255, 0.85)';
    g.shadowBlur = hovered ? 16 : 11;
    traceShapePath(g, slot.shape, cx, cy, rx * pulse, ry * pulse);
    g.fillStyle = hovered ? 'rgba(254, 240, 138, 0.22)' : 'rgba(165, 243, 252, 0.18)';
    g.fill();
    g.lineWidth = hovered ? 4 : 3.2;
    g.strokeStyle = hovered ? 'rgba(254, 243, 199, 0.96)' : 'rgba(186, 246, 255, 0.90)';
    g.lineJoin = 'round';
    g.stroke();

    /* In Count step, show soft glowing underwater dot rings so the child sees how many dots go there */
    if (slot.idea === 'count' && slot.dots > 0) {
      const dr = Math.max(4, rx * 0.16);
      const dx = rx * 0.36;
      const dy = ry * 0.36;
      const pts = slot.dots === 1 ? [[0, 0]]
        : slot.dots === 2 ? [[-dx, 0], [dx, 0]]
        : slot.dots === 3 ? [[0, -dy], [-dx, dy * 0.85], [dx, dy * 0.85]]
        : [[-dx, -dy * 0.8], [dx, -dy * 0.8], [-dx, dy * 0.8], [dx, dy * 0.8]];
      g.shadowBlur = 8;
      g.fillStyle = 'rgba(254, 243, 199, 0.82)';
      for (const [ox, oy] of pts) {
        g.beginPath();
        g.arc(cx + ox, cy + oy, dr, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.restore();
  }

  let cleanupFn = null;

  function mount(root, ctx) {
    EDKit.style('sc-style', CSS);
    preloadArt();

    const lang = ctx.lang;
    const t = TEXT[lang] || TEXT.he;
    const mode = (ctx.set && ctx.set.mode) || 'sizes';
    const bgImg = loadImg(`${ART}bg.jpg`);

    let rounds = buildStepRounds(mode);
    let roundIdx = 0;
    let round = rounds[0];
    let queuePos = 0;
    let choices = [];
    let locked = false;
    let rafId = 0;
    let timeTick = 0;
    const tm = EDKit.timers();

    /* Bear state: positioned on left bank, or on a bridge slot (0..3), or at burrow (4) */
    const bear = {
      pose: 'waiting',
      hopT: 1,
      fromSlotIdx: -1,
      slotIdx: -1, // -1 = left bank, 0..3 = bridge stone, 4 = burrow
      oopsTimer: 0,
    };

    /* Drag, camera & animation state */
    let dragging = null; // { pointerId, idx, x, y, startX, startY, moved }
    let returning = null; // { idx, fromX, fromY, toX, toY, t }
    let ripples = [];
    let droplets = [];
    let sparks = [];

    /* Sliding camera for portrait phones (world X offset in pixels) */
    const cam = {
      x: 0,
      targetX: 0,
      introPhase: 'follow', // 'burrow' | 'glide' | 'follow'
      glideFromX: 0,
      glideT: 1,
    };
    let shorePatchCanvas = null;

    function getShorePatch() {
      if (shorePatchCanvas) return shorePatchCanvas;
      if (!bgImg.complete || !bgImg.naturalWidth) return null;
      const bw = bgImg.naturalWidth;
      const bh = bgImg.naturalHeight;
      const off = document.createElement('canvas');
      off.width = 520;
      off.height = 280;
      const og = off.getContext('2d');
      /* Sample ONLY the clear mossy grass bank in the center of bg.jpg (no left/right cattails, no water) */
      og.drawImage(bgImg, bw * 0.39, bh * 0.74, bw * 0.38, bh * 0.26, 0, 0, off.width, off.height);
      /* Single-pass destination-in mask: softly feather the top edge so the mossy bank blends into the stream */
      og.globalCompositeOperation = 'destination-in';
      const mg = og.createLinearGradient(0, 0, 0, off.height);
      mg.addColorStop(0.00, 'rgba(0,0,0,0)');
      mg.addColorStop(0.16, 'rgba(0,0,0,0.85)');
      mg.addColorStop(0.28, 'rgba(0,0,0,1)');
      mg.addColorStop(1.00, 'rgba(0,0,0,1)');
      og.fillStyle = mg;
      og.fillRect(0, 0, off.width, off.height);
      og.globalCompositeOperation = 'source-over';
      shorePatchCanvas = off;
      return shorePatchCanvas;
    }

    root.innerHTML = `
      <div class="sc-stage-box" id="sc-box">
        <canvas class="sc-canvas" id="sc-canvas"></canvas>
        <div class="sc-ui" id="sc-ui"></div>
        <div class="sc-hud-top">
          <div class="sc-hud-left">
            <button type="button" class="sc-say-btn" id="sc-say" aria-label="${lang === 'he' ? 'שמעו שוב' : 'Hear again'}">🔊</button>
            <div class="sc-dots-pill"><div class="kit-dots" id="sc-dots"></div></div>
          </div>
          <div class="sc-hud-right">
            <button type="button" class="sc-info-btn" id="sc-info-btn" aria-expanded="false" aria-label="${t.infoLabel}">?</button>
            <div class="sc-parent-note" id="sc-parent-note" hidden>
              <h2 id="sc-ask"></h2>
              <p>${t.tip}</p>
            </div>
          </div>
        </div>
        <div class="sc-end-overlay" id="sc-end" hidden></div>
      </div>
    `;

    const box = root.querySelector('#sc-box');
    const canvas = root.querySelector('#sc-canvas');
    const uiLayer = root.querySelector('#sc-ui');
    const sayBtn = root.querySelector('#sc-say');
    const dotsEl = root.querySelector('#sc-dots');
    const infoBtn = root.querySelector('#sc-info-btn');
    const parentNote = root.querySelector('#sc-parent-note');
    const askEl = root.querySelector('#sc-ask');
    const endOverlay = root.querySelector('#sc-end');
    const g = canvas.getContext('2d');

    let viewW = 800, viewH = 500;
    function resize() {
      const r = box.getBoundingClientRect();
      viewW = Math.max(300, Math.round(r.width));
      viewH = Math.max(300, Math.round(r.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(viewW * dpr);
      canvas.height = Math.round(viewH * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const L = layout();
      cam.targetX = computeCamTarget(L);
      cam.x = clampCam(cam.x, L);
      layoutHitTargets();
    }

    function isPortrait() {
      return viewW / viewH < 0.95;
    }

    /* Compute responsive coordinates that keep Bear, bridge slots, burrow, and shore stones
       comfortably inside the visible frame on phone (390x844), tablet (1024x768), and laptop (1280x800).
       World landmarks (bankLeft, burrow, slots) are in world X (0..drawW); shore stones are in screen X. */
    function layout() {
      const bw = bgImg.naturalWidth || 2560;
      const bh = bgImg.naturalHeight || 1429;
      const scale = Math.max(viewW / bw, viewH / bh);
      const drawW = bw * scale;
      const drawH = bh * scale;
      const drawY = (viewH - drawH) * 0.5;
      const worldMap = (u, v) => ({ x: u * drawW, y: drawY + v * drawH });
      const landscapeCamX = (drawW - viewW) * 0.5;

      const slotCount = round ? round.slots.length : 4;

      if (isPortrait()) {
        /* Portrait phone: zoom to full height, map Bear/slots/burrow onto the real painted banks & stream,
           and let the camera slide smoothly from the burrow to Bear and across every hop. */
        const baseStoneW = Math.min(viewW * 0.255, 100);
        const bridgeStoneW = Math.min(viewW * 0.245, 96);
        const bearH = Math.min(viewH * 0.195, 154);
        const slots = slotCount === 3
          ? [
              worldMap(0.340, 0.530),
              worldMap(0.505, 0.505),
              worldMap(0.670, 0.525),
            ]
          : [
              worldMap(0.315, 0.535),
              worldMap(0.445, 0.505),
              worldMap(0.575, 0.530),
              worldMap(0.700, 0.505),
            ];
        const shore = [
          { x: viewW * 0.195, y: viewH * 0.862 },
          { x: viewW * 0.500, y: viewH * 0.850 },
          { x: viewW * 0.805, y: viewH * 0.862 },
        ];
        return {
          drawY, drawW, drawH, baseStoneW, bridgeStoneW, bearH,
          bankLeft: worldMap(0.180, 0.415),
          burrow:   worldMap(0.805, 0.355),
          slots,
          shore,
        };
      }

      /* Tablet & laptop: whole diorama fits on screen; shore stones sit on the clear central mossy bank */
      const baseStoneW = Math.min(drawW * 0.112, viewW * 0.135, 138);
      const bearH = Math.min(drawH * 0.265, 205);
      const slots = slotCount === 3
        ? [
            worldMap(0.350, 0.515),
            worldMap(0.510, 0.495),
            worldMap(0.670, 0.510),
          ]
        : [
            worldMap(0.320, 0.515),
            worldMap(0.445, 0.495),
            worldMap(0.575, 0.515),
            worldMap(0.700, 0.495),
          ];
      const screenMap = (u, v) => ({ x: u * drawW - landscapeCamX, y: drawY + v * drawH });
      return {
        drawY, drawW, drawH, baseStoneW, bridgeStoneW: baseStoneW, bearH,
        bankLeft: worldMap(0.178, 0.415),
        burrow:   worldMap(0.810, 0.345),
        slots,
        /* On wide, short windows the painting is trimmed top and bottom, so keep the
           shore stones fully inside the frame (with a small gap at the bottom). */
        shore: [
          screenMap(0.390, 0.855),
          screenMap(0.550, 0.845),
          screenMap(0.710, 0.855),
        ].map((p) => ({ x: p.x, y: Math.min(p.y, viewH - baseStoneW * 0.55 - 10) })),
      };
    }

    function clampCam(x, L) {
      return Math.max(0, Math.min(Math.max(0, L.drawW - viewW), x));
    }

    function computeCamTarget(L) {
      if (!isPortrait()) return (L.drawW - viewW) * 0.5;
      if (cam.introPhase === 'burrow') {
        /* Frame the warm candlelit burrow doorway on the right bank */
        return clampCam(L.drawW * 0.84 - viewW * 0.52, L);
      }
      if (bear.slotIdx >= L.slots.length) {
        /* Bear heading into or cheering at the burrow */
        return clampCam(L.drawW * 0.84 - viewW * 0.54, L);
      }
      const bearPt = bearAnchorFor(bear.slotIdx, L);
      const actIdx = activeSlotIdx();
      const targetPt = actIdx >= 0 ? L.slots[actIdx] : L.burrow;
      /* Frame both Bear and the next glowing target comfortably inside the portrait viewport */
      const midX = (bearPt.x + targetPt.x) * 0.5;
      return clampCam(midX - viewW * 0.5, L);
    }

    function activeCamX(L) {
      if (!isPortrait()) return (L.drawW - viewW) * 0.5;
      return clampCam(cam.x, L);
    }

    function bearAnchorFor(slotIdx, L) {
      if (slotIdx < 0) return L.bankLeft;
      if (slotIdx >= L.slots.length) return L.burrow;
      const p = L.slots[slotIdx];
      return { x: p.x, y: p.y - L.bridgeStoneW * 0.10 };
    }

    function spawnRipples(x, y, count = 3) {
      for (let i = 0; i < count; i++) {
        ripples.push({ x, y, r: 14 + i * 10, maxR: 78 + i * 18, life: 1 });
      }
    }

    function spawnSplash(x, y, count = 14) {
      for (let i = 0; i < count; i++) {
        const a = -Math.PI + Math.random() * Math.PI;
        const sp = 1.6 + Math.random() * 3.8;
        droplets.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 2.4,
          r: 2.2 + Math.random() * 2.6,
          life: 1,
        });
      }
    }

    function spawnSparks(x, y, count = 20) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.4 + Math.random() * 3.8;
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, r: 2 + Math.random() * 2.8, life: 1 });
      }
    }

    function activeSlotIdx() {
      return queuePos < round.queue.length ? round.queue[queuePos] : -1;
    }

    function speakCurrentTask() {
      const idx = activeSlotIdx();
      if (idx < 0) return;
      const slot = round.slots[idx];
      if (window.EDVoice) {
        EDVoice.say(voiceKeyForSlot(slot), lang);
      }
    }

    function updateHud() {
      dotsEl.innerHTML = '';
      for (let i = 0; i < rounds.length; i++) {
        const d = document.createElement('span');
        d.className = 'kit-dot' + (i < roundIdx ? ' done' : '');
        dotsEl.appendChild(d);
      }
      const idx = activeSlotIdx();
      if (idx >= 0) {
        askEl.textContent = askTextForSlot(round.slots[idx], t);
      }
    }

    function layoutHitTargets() {
      const L = layout();
      uiLayer.innerHTML = '';
      choices.forEach((ch, idx) => {
        const pos = L.shore[idx];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sc-hit';
        const scale = ch.idea === 'sizes' ? SIZE_FACTOR[ch.size] : 0.86;
        const hitW = Math.max(78, Math.round(L.baseStoneW * scale * 1.15));
        const hitH = Math.max(76, Math.round(hitW * 0.85));
        btn.style.left = `${pos.x}px`;
        btn.style.top = `${pos.y}px`;
        btn.style.width = `${hitW}px`;
        btn.style.height = `${hitH}px`;
        const label = ch.idea === 'sizes' ? t.sizeName[ch.size]
          : ch.idea === 'shapes' ? t.shapeName[ch.shape]
          : String(ch.dots);
        btn.setAttribute('aria-label', t.stoneAria(label));
        btn.dataset.idx = String(idx);
        btn.addEventListener('pointerdown', (e) => onChoiceDown(e, idx));
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            tryChoice(idx);
          }
        });
        uiLayer.appendChild(btn);
      });
    }

    function loadSubStep(speak = true) {
      const idx = activeSlotIdx();
      if (idx < 0) return;
      choices = makeChoicesForSlot(round.slots[idx]);
      updateHud();
      layoutHitTargets();
      if (speak) {
        tm.later(() => speakCurrentTask(), 260);
      }
    }

    function startRound(idx) {
      roundIdx = idx;
      round = rounds[roundIdx];
      queuePos = 0;
      locked = false;
      dragging = null;
      returning = null;
      bear.pose = 'waiting';
      bear.slotIdx = -1;
      bear.hopT = 1;
      bear.oopsTimer = 0;
      loadSubStep(true);
      const L = layout();
      if (isPortrait()) {
        /* Hold on the glowing burrow (~1.5s while the task is spoken), then glide back to Bear (~1s) */
        cam.introPhase = 'burrow';
        cam.x = computeCamTarget(L);
        cam.targetX = cam.x;
        cam.glideT = 1;
        tm.later(() => {
          if (cam.introPhase === 'burrow') {
            cam.introPhase = 'glide';
            cam.glideFromX = cam.x;
            cam.glideT = 0;
          }
        }, 1500);
      } else {
        cam.introPhase = 'follow';
        cam.glideT = 1;
        cam.x = computeCamTarget(L);
        cam.targetX = cam.x;
      }
    }

    function hopBearTo(targetSlotIdx, onLand) {
      bear.fromSlotIdx = bear.slotIdx;
      bear.slotIdx = targetSlotIdx;
      bear.hopT = 0;
      bear.pose = 'hop';
      sfxHop(Math.max(0, targetSlotIdx));
      tm.later(() => {
        bear.hopT = 1;
        if (onLand) onLand();
      }, 430);
    }

    function runCrossingSequence() {
      locked = true;
      /* Hop across any remaining placed stones into the burrow (slot = round.slots.length) */
      const burrowSlot = round.slots.length;
      const nextSlots = [];
      for (let s = bear.slotIdx + 1; s <= burrowSlot; s++) nextSlots.push(s);

      let step = 0;
      function hopNext() {
        if (step >= nextSlots.length) {
          bear.pose = 'cheer';
          dotsEl.children[roundIdx].classList.add('done');
          const L = layout();
          spawnSparks(L.burrow.x, L.burrow.y - 30, 26);
          sfxCheer();
          if (window.EDVoice) EDVoice.say('sc-yay', lang);
          tm.later(() => {
            if (roundIdx + 1 < rounds.length) {
              startRound(roundIdx + 1);
            } else {
              showEnd();
            }
          }, 1350);
          return;
        }
        const sIdx = nextSlots[step++];
        hopBearTo(sIdx, () => {
          const L = layout();
          if (sIdx < burrowSlot) {
            spawnRipples(L.slots[sIdx].x, L.slots[sIdx].y + 8, 2);
          }
          tm.later(hopNext, 200);
        });
      }
      hopNext();
    }

    function tryChoice(idx) {
      if (locked) return;
      const slotIdx = activeSlotIdx();
      if (slotIdx < 0) return;
      const choice = choices[idx];
      if (!choice) return;
      const L = layout();
      const targetPos = L.slots[slotIdx];

      if (choice.correct) {
        locked = true;
        dragging = null;
        round.slots[slotIdx].placed = true;
        spawnRipples(targetPos.x, targetPos.y + 8, 3);
        spawnSplash(targetPos.x, targetPos.y, 16);
        sfxSplash(slotIdx + 1);

        /* Speak count on Count step right when stone lands */
        if (round.idea === 'count' && window.EDVoice && window.EDVoiceLines) {
          EDVoice.say(EDVoiceLines.num(round.slots[slotIdx].dots), lang);
        }

        /* Little Bear hops onto the newly placed stone (or sequentially up to it) */
        const hopChain = [];
        for (let s = bear.slotIdx + 1; s <= slotIdx; s++) {
          if (round.slots[s].placed) hopChain.push(s);
        }
        let k = 0;
        function advanceChain() {
          if (k >= hopChain.length) {
            bear.pose = 'waiting';
            queuePos += 1;
            if (queuePos >= round.queue.length) {
              tm.later(runCrossingSequence, 260);
            } else {
              locked = false;
              loadSubStep(true);
            }
            return;
          }
          const nextS = hopChain[k++];
          hopBearTo(nextS, () => {
            const p = layout().slots[nextS];
            spawnRipples(p.x, p.y + 8, 2);
            tm.later(advanceChain, 140);
          });
        }
        tm.later(advanceChain, 160);
      } else {
        /* Gentle wrong feedback: wobble + bear-oops, NO buzzer, NO red */
        sfxWobble();
        bear.pose = 'oops';
        bear.oopsTimer = 1.15;
        if (window.EDVoice) EDVoice.say('sc-oops', lang);
        const shorePos = L.shore[idx];
        returning = {
          idx,
          fromX: dragging ? dragging.x : shorePos.x,
          fromY: dragging ? dragging.y : shorePos.y - 18,
          toX: shorePos.x,
          toY: shorePos.y,
          t: 0,
        };
      }
    }

    function clientToLocal(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function onChoiceDown(e, idx) {
      if (locked || dragging || !e.isPrimary || e.button !== 0) return;
      e.preventDefault();
      if (cam.introPhase !== 'follow') cam.introPhase = 'follow';
      const pt = clientToLocal(e);
      sfxPick();
      dragging = { pointerId: e.pointerId, idx, x: pt.x, y: pt.y, startX: pt.x, startY: pt.y, moved: false };
    }

    function onPointerMove(e) {
      if (!dragging || dragging.pointerId !== e.pointerId) return;
      const pt = clientToLocal(e);
      if (Math.hypot(pt.x - dragging.startX, pt.y - dragging.startY) > 10) {
        dragging.moved = true;
      }
      dragging.x = pt.x;
      dragging.y = pt.y;
    }

    function returnDrag(L, d) {
      const shorePos = L.shore[d.idx];
      returning = { idx: d.idx, fromX: d.x, fromY: d.y, toX: shorePos.x, toY: shorePos.y, t: 0 };
      dragging = null;
    }

    function onPointerUp(e) {
      if (!dragging || dragging.pointerId !== e.pointerId) return;
      onPointerMove(e);
      const d = dragging;
      const L = layout();
      const camXNow = activeCamX(L);
      const slotIdx = activeSlotIdx();
      const targetPos = slotIdx >= 0 ? L.slots[slotIdx] : null;
      const targetScreenX = targetPos ? targetPos.x - camXNow : 0;
      const droppedOnWater = targetPos && (
        Math.hypot(d.x - targetScreenX, d.y - targetPos.y) < L.baseStoneW * 1.15 ||
        d.y < viewH * 0.68
      );

      if (!d.moved || droppedOnWater) {
        tryChoice(d.idx);
        dragging = null;
      } else {
        /* Gently slide back to shore if released on the bank */
        returnDrag(L, d);
      }
    }

    function onPointerCancel(e) {
      if (dragging && dragging.pointerId === e.pointerId) returnDrag(layout(), dragging);
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    sayBtn.addEventListener('click', () => {
      speakCurrentTask();
    });

    infoBtn.addEventListener('click', () => {
      const open = parentNote.hidden;
      parentNote.hidden = !open;
      infoBtn.setAttribute('aria-expanded', String(open));
    });

    function showEnd() {
      locked = true;
      endOverlay.hidden = false;
      EDKit.end(endOverlay, ctx, lang);
    }

    /* ---- Render loop ---- */
    function drawStone(item, cx, cy, baseStoneW, lift = 0, wobble = 0, inWater = false) {
      const im = loadImg(`${ART}${stoneSpriteName(item)}`);
      if (!im.complete || !im.naturalWidth) return;
      const scale = item.idea === 'sizes' ? SIZE_FACTOR[item.size] : 0.86;
      const w = baseStoneW * scale * (1 + lift * 0.08);
      const h = w * (im.naturalHeight / im.naturalWidth);

      g.save();
      g.translate(cx, cy - lift * 14);
      if (wobble) g.rotate(wobble);

      if (inWater) {
        /* Soft diffused water ripple + dark wet shadow band where stone sits IN the stream (no bright ring) */
        const rRx = w * 0.72;
        const rRy = h * 0.30;
        g.save();
        g.translate(0, h * 0.36);
        g.scale(1, rRy / rRx);
        const rg = g.createRadialGradient(0, 0, rRx * 0.12, 0, 0, rRx);
        rg.addColorStop(0, 'rgba(3, 18, 26, 0.72)');
        rg.addColorStop(0.50, 'rgba(8, 34, 45, 0.44)');
        rg.addColorStop(0.72, 'rgba(130, 198, 212, 0.16)');
        rg.addColorStop(1, 'rgba(15, 50, 62, 0)');
        g.fillStyle = rg;
        g.beginPath();
        g.arc(0, 0, rRx, 0, Math.PI * 2);
        g.fill();
        g.restore();
      } else {
        /* Grounded mossy grass contact shadow under shore stones (offset gently opposite sunset/candle light) */
        const shY = h * 0.35 + lift * 12;
        const shRx = w * 0.56;
        const shRy = h * 0.28;
        g.save();
        g.translate(-w * 0.04, shY);
        g.scale(1, shRy / shRx);
        const sg = g.createRadialGradient(0, 0, shRx * 0.12, 0, 0, shRx);
        sg.addColorStop(0, `rgba(4, 14, 8, ${0.74 - lift * 0.24})`);
        sg.addColorStop(0.55, `rgba(7, 22, 12, ${0.42 - lift * 0.15})`);
        sg.addColorStop(0.82, `rgba(9, 26, 14, ${0.15 - lift * 0.06})`);
        sg.addColorStop(1, 'rgba(9, 26, 14, 0)');
        g.fillStyle = sg;
        g.beginPath();
        g.arc(0, 0, shRx, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }

      /* Crisp 640px slate stone — zero blur */
      g.drawImage(im, -w * 0.5, -h * 0.5, w, h);

      if (inWater) {
        /* Feathered see-through stream water wash covering the submerged bottom ~22% of the stone */
        const wRx = w * 0.54;
        const wRy = h * 0.23;
        g.save();
        g.translate(0, h * 0.39);
        g.scale(1, wRy / wRx);
        const wg = g.createRadialGradient(0, 0, wRx * 0.15, 0, 0, wRx);
        wg.addColorStop(0, 'rgba(15, 52, 65, 0.78)');
        wg.addColorStop(0.55, 'rgba(18, 60, 73, 0.52)');
        wg.addColorStop(0.82, 'rgba(20, 65, 78, 0.20)');
        wg.addColorStop(1, 'rgba(20, 65, 78, 0)');
        g.fillStyle = wg;
        g.beginPath();
        g.arc(0, 0, wRx, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }

      /* Glowing counting dots ONLY when item.dots > 0 (Count step) */
      if (item.dots > 0) {
        drawGlowingDots(g, 0, 0, w, h, item.dots);
      }
      g.restore();
    }

    function drawBear(L) {
      const im = loadImg(`${ART}bear-${bear.pose}.png`);
      if (!im.complete || !im.naturalWidth) return;
      const h = L.bearH;
      const w = h * (im.naturalWidth / im.naturalHeight);

      const destination = bearAnchorFor(bear.slotIdx, L);
      let bx = destination.x;
      let by = destination.y;
      let arcY = 0;
      if (bear.hopT < 1) {
        const start = bearAnchorFor(bear.fromSlotIdx, L);
        const p = bear.hopT;
        bx = start.x + (destination.x - start.x) * p;
        by = start.y + (destination.y - start.y) * p;
        arcY = -Math.sin(p * Math.PI) * Math.min(72, h * 0.42);
      } else if (bear.pose === 'waiting') {
        arcY = Math.sin(timeTick * 2.2) * 2.2;
      } else if (bear.pose === 'cheer') {
        arcY = -Math.abs(Math.sin(timeTick * 5.2)) * 10;
      }

      /* Soft ground contact shadow */
      const shScale = Math.max(0.55, 1 + arcY / 110);
      const bRx = w * 0.36 * shScale;
      const bRy = h * 0.085 * shScale;
      g.save();
      g.translate(bx, by + 1);
      g.scale(1, bRy / bRx);
      const bg = g.createRadialGradient(0, 0, bRx * 0.1, 0, 0, bRx);
      bg.addColorStop(0, 'rgba(4, 16, 22, 0.36)');
      bg.addColorStop(0.65, 'rgba(4, 16, 22, 0.16)');
      bg.addColorStop(1, 'rgba(4, 16, 22, 0)');
      g.fillStyle = bg;
      g.beginPath();
      g.arc(0, 0, bRx, 0, Math.PI * 2);
      g.fill();
      g.restore();

      g.drawImage(im, bx - w * 0.5, by - h + arcY, w, h);
    }

    let lastTs = performance.now();
    function frame(ts) {
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      timeTick += dt;

      if (bear.hopT < 1) {
        bear.hopT = Math.min(1, bear.hopT + dt / 0.42);
      }
      if (bear.oopsTimer > 0) {
        bear.oopsTimer = Math.max(0, bear.oopsTimer - dt);
        if (bear.oopsTimer === 0 && bear.pose === 'oops') {
          bear.pose = 'waiting';
        }
      }
      if (returning) {
        returning.t = Math.min(1, returning.t + dt / 0.32);
        if (returning.t >= 1) returning = null;
      }

      const L = layout();
      cam.targetX = computeCamTarget(L);
      if (isPortrait()) {
        if (cam.introPhase === 'glide') {
          cam.glideT = Math.min(1, cam.glideT + dt / 1.0);
          const u = cam.glideT;
          const ease = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
          cam.x = cam.glideFromX + (cam.targetX - cam.glideFromX) * ease;
          if (cam.glideT >= 1) cam.introPhase = 'follow';
        } else {
          cam.x += (cam.targetX - cam.x) * (1 - Math.exp(-dt * 4.8));
        }
      } else {
        cam.x = cam.targetX;
      }
      const camXNow = activeCamX(L);

      g.clearRect(0, 0, viewW, viewH);

      /* World layer (panned smoothly by -camXNow on upright phones, centered on tablet/laptop) */
      g.save();
      g.translate(-camXNow, 0);

      /* 1. Background diorama */
      if (bgImg.complete && bgImg.naturalWidth) {
        g.drawImage(bgImg, 0, L.drawY, L.drawW, L.drawH);
      } else {
        g.fillStyle = '#07222d';
        g.fillRect(camXNow, 0, viewW, viewH);
      }

      /* 2. Expanding water ripples */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += dt * 74;
        rp.life -= dt * 1.15;
        if (rp.life <= 0) { ripples.splice(i, 1); continue; }
        g.strokeStyle = `rgba(186, 240, 255, ${rp.life * 0.55})`;
        g.lineWidth = 2.2;
        g.beginPath();
        g.ellipse(rp.x, rp.y, rp.r, rp.r * 0.42, 0, 0, Math.PI * 2);
        g.stroke();
      }

      /* 3. Bridge slots: placed stones + active underwater glowing outline */
      const activeIdx = activeSlotIdx();
      const targetPos = activeIdx >= 0 ? L.slots[activeIdx] : null;
      const hoverActive = Boolean(
        dragging && targetPos && Math.hypot(dragging.x - (targetPos.x - camXNow), dragging.y - targetPos.y) < L.baseStoneW * 1.15
      );

      round.slots.forEach((slot, i) => {
        const pos = L.slots[i];
        if (slot.placed) {
          drawStone(slot, pos.x, pos.y, L.bridgeStoneW, 0, 0, true);
        } else if (i === activeIdx) {
          drawUnderwaterTarget(g, pos.x, pos.y, slot, L.bridgeStoneW, timeTick, hoverActive);
        }
      });

      /* 4. Little Bear cut-out */
      drawBear(L);

      /* 5. Water splash droplets & golden celebration sparks (in world space) */
      for (let i = droplets.length - 1; i >= 0; i--) {
        const p = droplets[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.life -= dt * 1.9;
        if (p.life <= 0) { droplets.splice(i, 1); continue; }
        g.fillStyle = `rgba(195, 245, 255, ${p.life * 0.85})`;
        g.beginPath();
        g.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        g.fill();
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life -= dt * 1.1;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        g.fillStyle = `rgba(254, 240, 138, ${p.life})`;
        g.beginPath();
        g.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        g.fill();
      }

      g.restore();

      /* Portrait foreground clear mossy bank (keeps shore stones on clean grass, away from cattails & water) */
      if (isPortrait()) {
        const patch = getShorePatch();
        if (patch) {
          const maxCam = Math.max(1, L.drawW - viewW);
          const panRatio = camXNow / maxCam;
          const pad = 28;
          const px = -pad * panRatio;
          g.drawImage(patch, px, viewH * 0.695, viewW + pad, viewH * 0.315);
        }
      }

      /* 6. Choice stones sitting calmly on the clear mossy foreground shore (all equal, nothing highlighted) */
      choices.forEach((ch, idx) => {
        if (dragging && dragging.idx === idx) return;
        let x = L.shore[idx].x;
        let y = L.shore[idx].y;
        let wobble = 0;
        if (returning && returning.idx === idx) {
          const p = returning.t;
          const ease = 1 - Math.pow(1 - p, 3);
          x = returning.fromX + (returning.toX - returning.fromX) * ease;
          y = returning.fromY + (returning.toY - returning.fromY) * ease;
          wobble = Math.sin(p * Math.PI * 4) * (1 - p) * 0.14;
        }
        drawStone(ch, x, y, L.baseStoneW, 0, wobble);
      });

      /* 7. Currently dragged stone on top */
      if (dragging) {
        const ch = choices[dragging.idx];
        if (ch) drawStone(ch, dragging.x, dragging.y, L.baseStoneW, 1, 0);
      }

      rafId = requestAnimationFrame(frame);
    }

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(box);
    window.addEventListener('resize', resize);

    resize();
    startRound(0);
    rafId = requestAnimationFrame(frame);

    cleanupFn = () => {
      cancelAnimationFrame(rafId);
      tm.clear();
      if (ro) ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }

  function unmount() {
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
  }

  EDGames.register('stream-crossing', { sets: SETS, mount, unmount });
})();
