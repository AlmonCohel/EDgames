/* גשר הנחל הקטן / The Woodland Stream Crossing — Style 1 + 3 (3D sculpted
   riverbank diorama with bioluminescent cyan flowers, warm candle-lit burrow,
   and tactile water stepping-stone physics) for ages 3–4.

   Core Play Loop:
   1. Visual Goal: Little Bear stands on the left mossy bank with a basket of
      glowing berries, looking across the stream toward his warm burrow.
      Swirling water whirlpools mark the missing stepping stones (1..4).
   2. Grab & Splash (Drag or Tap): The child drags (or taps) a sculpted river
      stone from the lower mossy shore into the active swirling whirlpool.
   3. Self-Evident Water Physics: A stone of the wrong size/dot-count/shape bobs
      gently on the ripples and glides back to shore; the matching stone lands
      with a splash, parts the water stream, and lights its carved golden dots!
   4. Crossing Payoff: Once all 4 stones bridge the stream, Little Bear hops
      stone-by-stone ("1! 2! 3! 4!") into the glowing burrow!
   4 Progressive Steps x 4 Rounds each = 16 rounds. */

(function () {
  const SETS = [
    { id: 'sizes',  emoji: '🪨', label: { he: 'גודל האבן',       en: 'Stone Sizes'        }, mode: 'sizes'  },
    { id: 'dots',   emoji: '✨', label: { he: 'סופרים נקודות',   en: 'Glowing Dots'       }, mode: 'dots'   },
    { id: 'shapes', emoji: '🔺', label: { he: 'צורות הנהר',      en: 'River Shapes'       }, mode: 'shapes' },
    { id: 'bridge', emoji: '🐻', label: { he: 'בונים את הגשר',   en: 'Full Stream Bridge' }, mode: 'bridge' },
  ];

  const TEXT = {
    he: {
      askSizes: (szName, dots) => `עזרו לדובון לחצות! שימו במערבולת הזוהרת ${szName} (${dots} נקודות)`,
      askDots: (dots) => `איזו אבן משלימה את הגשר לפי הסדר? בחרו אבן עם ${dots} נקודות זוהרות`,
      askShapes: (shName) => `התאימו את צורת האבן למערבולת במים: חפשו אבן בצורת ${shName}`,
      askBridge: (dots) => `בונים את כל הגשר לדובון! הניחו עכשיו את האבן עם ${dots} נקודות`,
      hintDrag: 'גררו או לחצו על האבן המתאימה על החוף התחתון כדי להניח אותה במערבולת הזוהרת',
      hintBob: 'האבן הזו לא מתאימה למערבולת הזו — נסו אבן אחרת מהחוף!',
      hintHop: 'הגשר שלם! תראו את הדובון קופץ מעל הנחל אל המאורה החמה!',
      stoneAria: (label) => `אבן נחל ${label} — לחצו או גררו אל הנחל`,
      sizeNames: { 1: 'אבן קטנה', 2: 'אבן בינונית', 3: 'אבן גדולה', 4: 'אבן ענקית' },
      shapeNames: { circle: 'עיגול', square: 'ריבוע', triangle: 'משולש', diamond: 'מעוין' },
    },
    en: {
      askSizes: (szName, dots) => `Help Little Bear cross! Place the ${szName} (${dots} dots) into the glowing whirlpool`,
      askDots: (dots) => `Which stone comes next in order? Pick the stone with ${dots} glowing dots`,
      askShapes: (shName) => `Match the whirlpool shape in the stream: find the ${shName} stone`,
      askBridge: (dots) => `Build Little Bear's whole bridge! Next place the stone with ${dots} dots`,
      hintDrag: 'Drag or tap the matching river stone on the foreground shore to splash it into the whirlpool',
      hintBob: 'That stone does not fit this whirlpool — try another stone from the shore!',
      hintHop: 'The bridge is complete! Watch Little Bear hop across the stream to his warm burrow!',
      stoneAria: (label) => `River stone ${label} — tap or drag into the stream`,
      sizeNames: { 1: 'Small Stone', 2: 'Medium Stone', 3: 'Large Stone', 4: 'Giant Stone' },
      shapeNames: { circle: 'Circle', square: 'Square', triangle: 'Triangle', diamond: 'Diamond' },
    },
  };

  /* 4 Steps x 4 Rounds = 16 Handcrafted Stream Crossing Rounds.
     Slots 0..3 represent the 4 stepping-stone positions across the stream:
     slot 0 (dots:1, circle), slot 1 (dots:2, square), slot 2 (dots:3, triangle), slot 3 (dots:4, diamond). */
  const STREAM_SLOTS = [
    { u: 0.305, v: 0.505, dots: 1, size: 1, shape: 'circle'   },
    { u: 0.432, v: 0.495, dots: 2, size: 2, shape: 'square'   },
    { u: 0.570, v: 0.510, dots: 3, size: 3, shape: 'triangle' },
    { u: 0.708, v: 0.510, dots: 4, size: 4, shape: 'diamond'  },
  ];

  const SHORE_POS = [
    { u: 0.36, v: 0.82 },
    { u: 0.56, v: 0.82 },
    { u: 0.76, v: 0.80 },
  ];

  const ROUNDS = {
    sizes: [
      { missing: [2], choices: [1, 2, 3] },
      { missing: [1], choices: [1, 2, 3] },
      { missing: [0], choices: [1, 2, 3] },
      { missing: [3], choices: [2, 3, 4] },
    ],
    dots: [
      { missing: [1], choices: [1, 2, 3] },
      { missing: [2], choices: [2, 3, 4] },
      { missing: [3], choices: [1, 3, 4] },
      { missing: [1, 2], choices: [2, 3, 4] },
    ],
    shapes: [
      { missing: [0], choices: [1, 2, 3] },
      { missing: [1], choices: [1, 2, 3] },
      { missing: [2], choices: [1, 3, 4] },
      { missing: [3], choices: [2, 3, 4] },
    ],
    bridge: [
      { missing: [1, 2], choices: [1, 2, 3] },
      { missing: [2, 3], choices: [2, 3, 4] },
      { missing: [0, 2], choices: [1, 2, 3] },
      { missing: [1, 2, 3], choices: [2, 3, 4] },
    ],
  };

  const CSS = `
    .sc-wrap { width: 100%; max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .sc-top { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 0 4px; }
    .sc-top .kit-head { flex: 1; min-width: 220px; }
    .sc-top .kit-head h2 { font-size: clamp(1.05rem, 2.1vw, 1.32rem); line-height: 1.3; }
    .sc-stage-box {
      position: relative; width: 100%; height: clamp(420px, 64vh, 560px);
      border-radius: 24px; overflow: hidden;
      background: #071b24;
      border: 3px solid #2d4c3e;
      box-shadow: 0 14px 36px rgba(5, 14, 18, .55), inset 0 2px 10px rgba(125, 211, 252, .16);
      user-select: none; -webkit-user-select: none; touch-action: none;
    }
    .sc-canvas { width: 100%; height: 100%; display: block; }
    .sc-ui { position: absolute; inset: 0; pointer-events: none; }
    .sc-stone-btn {
      position: absolute; pointer-events: auto;
      transform: translate(-50%, -50%);
      width: 96px; height: 72px; border-radius: 22px;
      background: transparent; border: 2px solid transparent;
      cursor: pointer; padding: 0; margin: 0; color: transparent; font-size: 0;
    }
    .sc-stone-btn:focus-visible {
      outline: 3px solid #fde047; outline-offset: 2px;
      background: rgba(254, 224, 71, .16);
    }
    @media (max-width: 600px) {
      .sc-stage-box { height: auto; aspect-ratio: 16 / 10; min-height: 235px; max-height: 320px; border-radius: 18px; }
      .sc-stone-btn { width: 72px; height: 54px; }
    }
  `;

  function sfxSplash(ok) {
    if (!window.EDSound || !EDSound.canPlay()) return;
    if (ok) {
      EDSound.tone({ freq: 220, end: 140, dur: 0.09, type: 'triangle', gain: 0.2 });
      setTimeout(() => EDSound.tone({ freq: 523.25, end: 659.25, dur: 0.14, type: 'sine', gain: 0.16 }), 65);
    } else {
      EDSound.tone({ freq: 280, end: 210, dur: 0.12, type: 'sine', gain: 0.14 });
    }
  }

  function sfxHop(stepIdx) {
    if (!window.EDSound || !EDSound.canPlay()) return;
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
    const f = notes[stepIdx % notes.length];
    EDSound.tone({ freq: f, end: f * 1.12, dur: 0.13, type: 'sine', gain: 0.18 });
  }

  let cleanupFn = null;

  function mount(root, ctx) {
    EDKit.style('sc-style', CSS);
    const lang = ctx.lang;
    const t = TEXT[lang] || TEXT.he;
    const mode = (ctx.set && ctx.set.mode) || 'sizes';
    const rounds = ROUNDS[mode] || ROUNDS.sizes;

    const bgImg = new Image();
    bgImg.src = 'assets/worlds/stream-crossing.jpg';

    const stoneImgs = {};
    ['circle', 'square', 'triangle', 'diamond'].forEach((sh) => {
      const im = new Image();
      im.src = `assets/worlds/stone-${sh}.png`;
      stoneImgs[sh] = im;
    });

    let roundIdx = 0;
    let round = rounds[0];
    let locked = false;
    let rafId = 0;
    let timeTick = 0;
    const tm = EDKit.timers();

    /* Stream & Bear Physical State */
    let slotFilled = [true, true, false, true];
    let activeMissingQueue = [];
    let shoreChoices = []; // [{ slotId: 1..4, u, v, wobble: 0, used: false }]
    let draggingStone = null;
    let dragX = 0, dragY = 0;
    let ripples = [];
    let bearHopProgress = -1; // -1 = waiting on left bank, 0..5 = hopping across stones to burrow!

    function spawnRipple(x, y, col = '#fde047') {
      ripples.push({ x, y, r: 8, alpha: 0.95, col });
    }

    root.innerHTML = `
      <div class="kit sc-wrap">
        <div class="sc-top">
          ${EDKit.dots(rounds.length, 0)}
          ${EDKit.head('', lang)}
        </div>
        <p class="kit-hint" id="sc-hint">${t.hintDrag}</p>
        <div class="sc-stage-box" id="sc-box">
          <canvas class="sc-canvas" id="sc-canvas"></canvas>
          <div class="sc-ui" id="sc-ui"></div>
        </div>
      </div>
    `;

    const box = root.querySelector('#sc-box');
    const canvas = root.querySelector('#sc-canvas');
    const ctx2d = canvas.getContext('2d');
    const uiLayer = root.querySelector('#sc-ui');
    const headH2 = root.querySelector('.kit-head h2');
    const hintEl = root.querySelector('#sc-hint');

    let W = 880, H = 500, dpr = 1;
    let choiceBtns = [];

    function currentMapper() {
      if (!bgImg.complete || !bgImg.naturalWidth) return (u, v) => ({ x: u * W, y: v * H });
      const iw = bgImg.naturalWidth;
      const ih = bgImg.naturalHeight;
      const scale = Math.max(W / iw, H / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const ox = (W - dw) * 0.5;
      const oy = (H - dh) * 0.5;
      return (u, v) => ({ x: ox + u * dw, y: oy + v * dh });
    }

    function drawArtCover() {
      const bg = ctx2d.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#071b24');
      bg.addColorStop(1, '#081b18');
      ctx2d.fillStyle = bg;
      ctx2d.fillRect(0, 0, W, H);

      if (!bgImg.complete || !bgImg.naturalWidth) return (u, v) => ({ x: u * W, y: v * H });
      const iw = bgImg.naturalWidth;
      const ih = bgImg.naturalHeight;
      const scale = Math.max(W / iw, H / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const ox = (W - dw) * 0.5;
      const oy = (H - dh) * 0.5;
      ctx2d.drawImage(bgImg, ox, oy, dw, dh);
      return (u, v) => ({ x: ox + u * dw, y: oy + v * dh });
    }

    function syncButtons() {
      const map = currentMapper();
      choiceBtns.forEach((btn, idx) => {
        const ch = shoreChoices[idx];
        if (!ch) return;
        const p = map(ch.u, ch.v);
        btn.style.left = `${p.x}px`;
        btn.style.top = `${p.y}px`;
        btn.hidden = ch.used;
      });
    }

    function resize() {
      const r = box.getBoundingClientRect();
      W = Math.max(300, r.width);
      H = Math.max(220, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      syncButtons();
    }

    function updateHeadline() {
      if (!activeMissingQueue.length) return;
      const targetSlotIdx = activeMissingQueue[0];
      const slot = STREAM_SLOTS[targetSlotIdx];
      if (mode === 'sizes') {
        headH2.textContent = t.askSizes(t.sizeNames[slot.size], slot.dots);
      } else if (mode === 'dots') {
        headH2.textContent = t.askDots(slot.dots);
      } else if (mode === 'shapes') {
        headH2.textContent = t.askShapes(t.shapeNames[slot.shape]);
      } else {
        headH2.textContent = t.askBridge(slot.dots);
      }
    }

    function loadRound(idx) {
      roundIdx = idx;
      round = rounds[idx];
      locked = false;
      bearHopProgress = -1;

      slotFilled = [true, true, true, true];
      activeMissingQueue = [...round.missing];
      activeMissingQueue.forEach((mIdx) => { slotFilled[mIdx] = false; });

      shoreChoices = round.choices.map((dotsVal, i) => ({
        dots: dotsVal,
        size: dotsVal,
        shape: STREAM_SLOTS[dotsVal - 1].shape,
        u: SHORE_POS[i].u,
        v: SHORE_POS[i].v,
        wobble: 0,
        used: false,
      }));

      const dotsEl = root.querySelector('.kit-dots');
      if (dotsEl) dotsEl.outerHTML = EDKit.dots(rounds.length, roundIdx);

      updateHeadline();
      hintEl.textContent = t.hintDrag;

      uiLayer.innerHTML = '';
      choiceBtns = shoreChoices.map((ch, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'sc-stone-btn';
        b.dataset.stone = String(ch.dots);
        b.setAttribute('aria-label', t.stoneAria(String(ch.dots)));
        b.addEventListener('click', () => tryStoneChoice(i));
        uiLayer.append(b);
        return b;
      });
      syncButtons();

      const voiceKey = mode === 'sizes' ? 'sc-sizes'
        : mode === 'dots' ? 'sc-dots'
        : mode === 'shapes' ? 'sc-shapes' : 'sc-bridge';
      EDKit.voice(root, voiceKey, lang);
    }

    function tryStoneChoice(choiceIdx) {
      if (locked || !activeMissingQueue.length) return;
      const ch = shoreChoices[choiceIdx];
      if (!ch || ch.used) return;

      const targetSlotIdx = activeMissingQueue[0];
      const targetSlot = STREAM_SLOTS[targetSlotIdx];
      const map = currentMapper();
      const wp = map(targetSlot.u, targetSlot.v);

      if (ch.dots === targetSlot.dots) {
        /* Correct stone! Lands with a splash and locks into the stream */
        ch.used = true;
        slotFilled[targetSlotIdx] = true;
        activeMissingQueue.shift();
        sfxSplash(true);
        spawnRipple(wp.x, wp.y, '#fde047');
        spawnRipple(wp.x, wp.y, '#7dd3fc');
        syncButtons();

        if (window.EDVoice && window.EDVoiceLines) {
          EDVoice.say(EDVoiceLines.num(targetSlot.dots), lang);
        }

        if (activeMissingQueue.length > 0) {
          updateHeadline();
        } else {
          /* Bridge complete! Little Bear hops across all 4 stones to the burrow! */
          locked = true;
          hintEl.textContent = t.hintHop;
          bearHopProgress = 0;
          for (let h = 0; h < 4; h++) {
            tm.later(() => sfxHop(h), h * 220);
          }

          const allDots = root.querySelectorAll('.kit-dot');
          if (allDots[roundIdx]) allDots[roundIdx].classList.add('done');

          tm.later(() => {
            EDKit.praise(lang);
            if (roundIdx + 1 < rounds.length) {
              tm.later(() => loadRound(roundIdx + 1), 950);
            } else {
              tm.later(() => {
                cancelAnimationFrame(rafId);
                EDKit.end(root, ctx, lang);
              }, 950);
            }
          }, 1150);
        }
      } else {
        /* Self-evident water physics: wrong-sized stone bobs gently on the ripples */
        ch.wobble = 1;
        sfxSplash(false);
        spawnRipple(wp.x, wp.y, '#fb923c');
        hintEl.textContent = t.hintBob;
      }
    }

    /* Pointer drag support for shore stones */
    box.addEventListener('pointerdown', (e) => {
      if (locked) return;
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const map = currentMapper();
      for (let i = 0; i < shoreChoices.length; i++) {
        const ch = shoreChoices[i];
        if (ch.used) continue;
        const p = map(ch.u, ch.v);
        if (Math.hypot(px - p.x, py - p.y) < 46) {
          draggingStone = i;
          dragX = px;
          dragY = py;
          return;
        }
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (draggingStone === null) return;
      const r = canvas.getBoundingClientRect();
      dragX = e.clientX - r.left;
      dragY = e.clientY - r.top;
    });

    window.addEventListener('pointerup', () => {
      if (draggingStone !== null) {
        const idx = draggingStone;
        draggingStone = null;
        tryStoneChoice(idx);
      }
    });

    /* Helper: Trace a smooth sculpted 3D stone silhouette (circle, square, triangle, or diamond) */
    function traceStonePath(shape, useShape, dy = 0, scale = 1) {
      ctx2d.beginPath();
      if (useShape && shape === 'square') {
        ctx2d.roundRect(-34 * scale, (-21 + dy) * scale, 68 * scale, 42 * scale, 12 * scale);
      } else if (useShape && shape === 'triangle') {
        const s = scale;
        ctx2d.moveTo(0, (-27 + dy) * s);
        ctx2d.quadraticCurveTo(10 * s, (-27 + dy) * s, 35 * s, (14 + dy) * s);
        ctx2d.quadraticCurveTo(38 * s, (21 + dy) * s, 28 * s, (21 + dy) * s);
        ctx2d.lineTo(-28 * s, (21 + dy) * s);
        ctx2d.quadraticCurveTo(-38 * s, (21 + dy) * s, -35 * s, (14 + dy) * s);
        ctx2d.quadraticCurveTo(-10 * s, (-27 + dy) * s, 0, (-27 + dy) * s);
        ctx2d.closePath();
      } else if (useShape && shape === 'diamond') {
        const s = scale;
        ctx2d.moveTo(0, (-26 + dy) * s);
        ctx2d.quadraticCurveTo(8 * s, (-26 + dy) * s, 36 * s, (-4 + dy) * s);
        ctx2d.quadraticCurveTo(42 * s, (0 + dy) * s, 36 * s, (4 + dy) * s);
        ctx2d.quadraticCurveTo(8 * s, (26 + dy) * s, 0, (26 + dy) * s);
        ctx2d.quadraticCurveTo(-8 * s, (26 + dy) * s, -36 * s, (4 + dy) * s);
        ctx2d.quadraticCurveTo(-42 * s, (0 + dy) * s, -36 * s, (-4 + dy) * s);
        ctx2d.quadraticCurveTo(-8 * s, (-26 + dy) * s, 0, (-26 + dy) * s);
        ctx2d.closePath();
      } else {
        ctx2d.ellipse(0, dy * scale, 36 * scale, 22 * scale, 0, 0, Math.PI * 2);
      }
    }

    /* Helper: Draw a REAL 3D Illustrated Clay & Moss River Stone Sprite with Carved Glowing Dots */
    function drawSculptedStone(x, y, sizeLevel, shape, dotsCount, isPlaced, isDragging) {
      ctx2d.save();
      ctx2d.translate(x, y);
      const useShape = mode === 'shapes';
      const spriteKey = useShape ? shape : 'circle';
      const im = stoneImgs[spriteKey] || stoneImgs.circle;
      const baseScale = (W < 540 ? 0.66 : 1) * (useShape ? 0.98 : (0.68 + sizeLevel * 0.14)) * (isDragging ? 1.08 : 1);
      ctx2d.scale(baseScale, baseScale);

      /* 1. Soft Water Ripples (in stream) or Ground Contact Shadow (on mossy shore) */
      if (isPlaced) {
        const pulse = Math.sin(timeTick * 0.05 + sizeLevel) * 2.2;
        ctx2d.strokeStyle = 'rgba(175, 228, 245, 0.42)';
        ctx2d.lineWidth = 2.2;
        ctx2d.beginPath();
        ctx2d.ellipse(0, 14, 46 + pulse, 24 + pulse * 0.5, 0, 0, Math.PI * 2);
        ctx2d.stroke();
        ctx2d.strokeStyle = 'rgba(175, 228, 245, 0.20)';
        ctx2d.lineWidth = 1.4;
        ctx2d.beginPath();
        ctx2d.ellipse(0, 15, 55 + pulse * 1.2, 29 + pulse * 0.6, 0, 0, Math.PI * 2);
        ctx2d.stroke();
      } else {
        ctx2d.fillStyle = 'rgba(6, 15, 8, 0.48)';
        ctx2d.beginPath();
        ctx2d.ellipse(2, isDragging ? 24 : 18, 42, 22, 0, 0, Math.PI * 2);
        ctx2d.fill();
      }

      /* 2. Draw the Real 3D Illustrated Mossy Clay Stone Sprite */
      if (im && im.complete && im.naturalWidth) {
        const targetW = spriteKey === 'diamond' ? 78 : 92;
        const targetH = targetW * (im.naturalHeight / im.naturalWidth);
        if (isDragging) {
          ctx2d.shadowColor = 'rgba(254, 240, 138, 0.65)';
          ctx2d.shadowBlur = 16;
        }
        ctx2d.drawImage(im, -targetW / 2, -targetH / 2, targetW, targetH);
        ctx2d.shadowBlur = 0;
      }

      /* 3. Carved Recessed Golden Glowing Holes on the Top Face of the 3D Stone */
      const topOffsetY = spriteKey === 'triangle' ? -4 : spriteKey === 'diamond' ? -8 : -9;
      const dotCoords = {
        1: [[0, topOffsetY]],
        2: [[-13, topOffsetY - 2], [13, topOffsetY + 2]],
        3: [[-14, topOffsetY + 5], [0, topOffsetY - 7], [14, topOffsetY + 5]],
        4: [[-12, topOffsetY - 6], [12, topOffsetY - 6], [-12, topOffsetY + 6], [12, topOffsetY + 6]],
      }[dotsCount] || [[0, topOffsetY]];

      dotCoords.forEach(([dx, dy]) => {
        /* Dark carved stone socket */
        ctx2d.fillStyle = 'rgba(28, 20, 12, 0.68)';
        ctx2d.beginPath();
        ctx2d.ellipse(dx, dy + 0.8, 7.0, 4.9, 0, 0, Math.PI * 2);
        ctx2d.fill();

        /* Warm incandescent golden glow nestled inside the carved hole */
        const holeGlow = ctx2d.createRadialGradient(dx, dy, 1, dx, dy, 8.8);
        holeGlow.addColorStop(0, '#fffbeb');
        holeGlow.addColorStop(0.42, '#fde047');
        holeGlow.addColorStop(0.76, 'rgba(245, 158, 11, 0.85)');
        holeGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx2d.fillStyle = holeGlow;
        ctx2d.beginPath();
        ctx2d.ellipse(dx, dy, 8.8, 6.2, 0, 0, Math.PI * 2);
        ctx2d.fill();
      });

      ctx2d.restore();
    }

    function tick() {
      timeTick++;
      ctx2d.save();
      ctx2d.scale(dpr, dpr);

      const map = drawArtCover();

      /* 1. Draw the 4 Stream Stepping-Stone Positions (Placed 3D Stones vs Soft Shaped Water Ripples) */
      const activeTargetIdx = activeMissingQueue.length ? activeMissingQueue[0] : -1;
      const useShape = mode === 'shapes';
      STREAM_SLOTS.forEach((slot, idx) => {
        const p = map(slot.u, slot.v);
        if (slotFilled[idx]) {
          drawSculptedStone(p.x, p.y, slot.size, slot.shape, slot.dots, true, false);
        } else {
          /* Soft Shaped Water Whirlpool matching the exact silhouette & size of the needed stone */
          const isCurrent = idx === activeTargetIdx;
          const slotScale = (W < 540 ? 0.68 : 1) * (useShape ? 0.96 : (0.70 + slot.size * 0.14));
          const breathe = 1 + Math.sin(timeTick * 0.06 + idx) * 0.04;
          ctx2d.save();
          ctx2d.translate(p.x, p.y);
          ctx2d.scale(slotScale * breathe, slotScale * breathe);

          /* Translucent water socket */
          ctx2d.fillStyle = isCurrent ? 'rgba(254, 240, 138, 0.14)' : 'rgba(125, 211, 252, 0.10)';
          traceStonePath(slot.shape, useShape, 0, 1);
          ctx2d.fill();

          /* Soft glowing water ripple outline in the exact shape */
          ctx2d.strokeStyle = isCurrent ? 'rgba(254, 240, 138, 0.88)' : 'rgba(186, 230, 253, 0.55)';
          ctx2d.lineWidth = isCurrent ? 2.6 : 1.8;
          traceStonePath(slot.shape, useShape, 0, 1);
          ctx2d.stroke();

          ctx2d.strokeStyle = isCurrent ? 'rgba(254, 240, 138, 0.32)' : 'rgba(186, 230, 253, 0.22)';
          ctx2d.lineWidth = 1.4;
          traceStonePath(slot.shape, useShape, 0, 1.18);
          ctx2d.stroke();

          /* Subtle golden shimmer dots inside the water target */
          const dotCoords = {
            1: [[0, 0]],
            2: [[-11, -2], [11, 2]],
            3: [[-13, 5], [0, -6], [13, 5]],
            4: [[-11, -5], [11, -5], [-11, 5], [11, 5]],
          }[slot.dots] || [[0, 0]];
          dotCoords.forEach(([dx, dy]) => {
            ctx2d.fillStyle = isCurrent ? 'rgba(254, 240, 138, 0.72)' : 'rgba(186, 230, 253, 0.45)';
            ctx2d.beginPath();
            ctx2d.arc(dx, dy, 3.6, 0, Math.PI * 2);
            ctx2d.fill();
          });

          ctx2d.restore();
        }
      });

      /* 2. Draw Foreground Shore Candidate 3D Stones */
      shoreChoices.forEach((ch, idx) => {
        if (ch.used) return;
        const p = map(ch.u, ch.v);
        const wx = ch.wobble > 0.01 ? Math.sin(timeTick * 0.45) * 9 * ch.wobble : 0;
        ch.wobble *= 0.9;
        const drawX = draggingStone === idx ? dragX : p.x + wx;
        const drawY = draggingStone === idx ? dragY : p.y;
        drawSculptedStone(drawX, drawY, ch.size, ch.shape, ch.dots, false, draggingStone === idx);
      });

      /* 3. Water Splash Ripples */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 1.8;
        rp.alpha -= 0.028;
        if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }
        ctx2d.strokeStyle = rp.col;
        ctx2d.globalAlpha = rp.alpha;
        ctx2d.lineWidth = 2.5;
        ctx2d.beginPath();
        ctx2d.ellipse(rp.x, rp.y, rp.r, rp.r * 0.52, 0, 0, Math.PI * 2);
        ctx2d.stroke();
      }
      ctx2d.globalAlpha = 1;

      /* 4. Animated Hopping Bear & Golden Stepping Arc when Bridge is Completed */
      if (bearHopProgress >= 0) {
        bearHopProgress = Math.min(5, bearHopProgress + 0.065);
        const pathPts = [
          map(0.18, 0.34),
          map(STREAM_SLOTS[0].u, STREAM_SLOTS[0].v),
          map(STREAM_SLOTS[1].u, STREAM_SLOTS[1].v),
          map(STREAM_SLOTS[2].u, STREAM_SLOTS[2].v),
          map(STREAM_SLOTS[3].u, STREAM_SLOTS[3].v),
          map(0.84, 0.25),
        ];
        const segIdx = Math.min(4, Math.floor(bearHopProgress));
        const segT = bearHopProgress - segIdx;
        const a = pathPts[segIdx];
        const b = pathPts[segIdx + 1];
        const bx = a.x + (b.x - a.x) * segT;
        const by = a.y + (b.y - a.y) * segT - Math.sin(segT * Math.PI) * 34;

        ctx2d.fillStyle = '#f59e0b';
        ctx2d.strokeStyle = '#fef08a';
        ctx2d.lineWidth = 2.5;
        ctx2d.beginPath();
        ctx2d.arc(bx, by - 14, 18, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.stroke();
        ctx2d.font = '20px sans-serif';
        ctx2d.textAlign = 'center';
        ctx2d.fillText('🐻', bx, by - 7);
      }

      ctx2d.restore();
      rafId = requestAnimationFrame(tick);
    }

    resize();
    bgImg.onload = () => syncButtons();
    const ro = new ResizeObserver(() => resize());
    ro.observe(box);
    loadRound(0);
    rafId = requestAnimationFrame(tick);

    cleanupFn = () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      tm.clear();
    };
  }

  function unmount() {
    if (cleanupFn) { cleanupFn(); cleanupFn = null; }
  }

  EDGames.register('stream-crossing', { sets: SETS, mount, unmount });
})();
