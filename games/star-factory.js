/* מפעל הכוכבים / The Star Factory — tactile 60fps number physics, fusion & laser slicing (ages 4–8).

   In Lumi's cosmic star observatory, a golden Star Orb waits at the launcher to
   roll across the chasm to Lumi the Star-Bot. Between the cliffs lies a holographic
   bridge blueprint of length N (or two bridge chasms in Master Inventor).

   On the magnetic workbench below sit glowing, squishy energy blocks of length 1–10:
   - FUSE (חיבור): Drag one block onto another on the workbench — a magnetic plasma
     tether arcs between them showing their sum, and releasing fuses them into one
     larger block! Or drop blocks one after another into the bridge chasm and watch
     them fuse inside the bridge.
   - SLICE (חיסור ופירוק): Need a 4 but only have a 7? Tap or swipe across any
     glowing cyan laser seam between a block's segments to slice it into two pieces
     (7 -> 4 and 3) with spring recoil physics! Or drop the oversized 7 directly
     onto the 4-unit bridge gap to see the 3-unit overhang and slice off the extra
     right on the bridge (7 - 3 = 4).
   - 60FPS ROLL: The moment the bridge is complete, the launcher gate opens and the
     Golden Star Orb rolls across each unit of the child's bridge — playing an
     ascending pentatonic marimba scale and collecting the 3 floating stars — before
     leaping off the ramp into Lumi's waiting arms!

   Because number units are conserved and fusing/slicing are true mathematical
   inverses, a child can never get stuck: any slice can be fused back together, and
   any valid combination of blocks that fills the bridge works.

   Sets: Fuse Blocks (bonds to 6), Bridge to Ten (composing 6–10), Laser Slice
   (subtraction & decomposition), Master Inventor (double bridges: slice + fuse). */

(function () {
  const SETS = [
    { id: 'fuse', emoji: '🌟', label: { he: 'מחברים כוכבים', en: 'Fuse Blocks' }, mode: 'fuse' },
    { id: 'ten', emoji: '🔟', label: { he: 'גשר העשר', en: 'Bridge to Ten' }, mode: 'ten' },
    { id: 'slice', emoji: '⚡', label: { he: 'חותכים בלייזר', en: 'Laser Slice' }, mode: 'slice' },
    { id: 'master', emoji: '⚙️', label: { he: 'מאסטר המפעל', en: 'Master Inventor' }, mode: 'master' },
  ];

  const TEXT = {
    he: {
      askFuse: (n) => `בנו גשר כוכבים באורך ${n} ללומי הרובוט`,
      askSlice: (n) => `הקובייה גדולה מדי! חתכו אותה בלייזר לגשר באורך ${n}`,
      askMaster: (a, b) => `הנדסו שני גשרים: גשר של ${a} וגשר של ${b}`,
      hintFuse: 'גוררים קוביות זו לזו כדי לחבר ביניהן, או לוחצים על קובייה כדי לשלוח לגשר',
      hintSlice: 'לחצו על קו הלייזר ✂️ שעל הקובייה (או החליקו עליו) כדי לחתוך אותה לשתיים',
      hintOverhang: (total, keep, extra) => `הקובייה של ${total} ארוכה ב-${extra}! לחצו על קו הלייזר ✂️ כדי לחתוך ל-${keep} ו-${extra}`,
      hintMaster: 'אפשר גם לחתוך קוביות בלייזר ✂️ וגם לחבר קוביות יחד כדי למלא את שני הגשרים',
      hintRoll: 'הגשר מוכן! כוכב האור מתגלגל ללומי!',
      laserBtn: '⚡ סכין לייזר',
      laserOn: '⚡ סכין לייזר: פעיל',
      sliceOverhangBtn: (keep, extra) => `✂️ חתוך בלייזר (${keep} | ${extra})`,
      resetBlocks: '↺ איפוס קוביות',
      bridgeLabel: (idx, need, cur) => (cur > 0 && cur < need ? `גשר ${idx}: ${cur}+?=${need}` : `גשר: ${need}`),
      blockAria: (v) => `קוביית אנרגיה ${v}`,
      sliceAria: (v, a, b) => `חיתוך קובייה ${v} ל-${a} ו-${b}`,
      lumiHi: ['היי! ★', 'איזה כיף! ♥', 'בואו נבנה! ⚡', 'וואו! 🌟'],
    },
    en: {
      askFuse: (n) => `Build a star bridge of length ${n} for Lumi the robot`,
      askSlice: (n) => `Too big! Slice the block with the laser for a bridge of ${n}`,
      askMaster: (a, b) => `Engineer two bridges: one of ${a} and one of ${b}`,
      hintFuse: 'Drag blocks together to fuse them, or tap a block to send it to the bridge',
      hintSlice: 'Tap a cyan laser seam ✂️ on a block (or swipe across it) to slice it in two',
      hintOverhang: (total, keep, extra) => `The ${total} block overhangs by ${extra}! Tap the laser line ✂️ to slice into ${keep} and ${extra}`,
      hintMaster: 'Slice blocks with the laser ✂️ and fuse blocks together to fill both bridges',
      hintRoll: 'Bridge complete! Here comes the Star Orb to Lumi!',
      laserBtn: '⚡ Laser Cutter',
      laserOn: '⚡ Laser Cutter: ON',
      sliceOverhangBtn: (keep, extra) => `✂️ Laser Slice (${keep} | ${extra})`,
      resetBlocks: '↺ Reset Blocks',
      bridgeLabel: (idx, need, cur) => (cur > 0 && cur < need ? `Bridge ${idx}: ${cur}+?=${need}` : `Bridge: ${need}`),
      blockAria: (v) => `Energy block ${v}`,
      sliceAria: (v, a, b) => `Slice block ${v} into ${a} and ${b}`,
      lumiHi: ['Hi there! ★', 'Yay! ♥', "Let's build! ⚡", 'Woohoo! 🌟'],
    },
  };

  /* Vibrant, distinct Cuisenaire-inspired palette for block lengths 1..10. */
  const BLOCK_COLORS = {
    1: { fill: '#ff5d8f', edge: '#b82556', glow: '#ff9ebb' },
    2: { fill: '#ff9a1f', edge: '#b86200', glow: '#ffd085' },
    3: { fill: '#f5b800', edge: '#a67600', glow: '#ffe985' },
    4: { fill: '#28c76f', edge: '#148244', glow: '#8df0b8' },
    5: { fill: '#2eb8ff', edge: '#0e74b5', glow: '#9ee0ff' },
    6: { fill: '#8a5cff', edge: '#5329bf', glow: '#c8b3ff' },
    7: { fill: '#ff477e', edge: '#ad1846', glow: '#ff99b6' },
    8: { fill: '#00c9b7', edge: '#007d72', glow: '#84f5eb' },
    9: { fill: '#ff7033', edge: '#b33906', glow: '#ffb494' },
    10: { fill: '#eab308', edge: '#9a6e00', glow: '#fef08a' },
  };

  /* Handcrafted + varied progressive puzzles per set. */
  const PUZZLES = {
    fuse: [
      { gaps: [3], blocks: [1, 2] },
      { gaps: [4], blocks: [2, 2, 1] },
      { gaps: [5], blocks: [2, 3, 1] },
      { gaps: [6], blocks: [4, 2, 3] },
      { gaps: [6], blocks: [2, 2, 2, 1] },
    ],
    ten: [
      { gaps: [7], blocks: [4, 3, 2, 5] },
      { gaps: [8], blocks: [5, 3, 4, 4] },
      { gaps: [9], blocks: [6, 3, 5, 4] },
      { gaps: [10], blocks: [5, 5, 6, 4] },
      { gaps: [10], blocks: [4, 3, 3, 7] },
    ],
    slice: [
      { gaps: [3], blocks: [5] },
      { gaps: [4], blocks: [7] },
      { gaps: [5], blocks: [8] },
      { gaps: [6], blocks: [9] },
      { gaps: [7], blocks: [10] },
    ],
    master: [
      { gaps: [3, 4], blocks: [7] },
      { gaps: [4, 4], blocks: [6, 2] },
      { gaps: [5, 3], blocks: [4, 4] },
      { gaps: [5, 4], blocks: [7, 2] },
      { gaps: [6, 4], blocks: [8, 2] },
    ],
  };

  const ROUNDS = 5;
  const PENTA = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880, 1046];

  const CSS = `
    .sf { gap: 10px; max-width: 780px; margin: 0 auto; user-select: none; }
    .sf-top { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; width: 100%; }
    .sf-stars-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 13px; border-radius: 999px;
      background: linear-gradient(135deg, #1d2b53, #2b4480); color: #ffd23f; font: 700 1.05rem/1.2 Fredoka, Heebo, sans-serif;
      border: 2px solid #4b6cb7; box-shadow: 0 3px 0 #0f172a; }
    .sf-arena { position: relative; width: 100%; max-width: 740px; border-radius: 26px; overflow: hidden;
      background: #0d1836; border: 3px solid #3b5998; box-shadow: 0 8px 0 var(--edge), 0 14px 28px rgba(13, 24, 54, .28); direction: ltr; }
    .sf-canvas { display: block; width: 100%; height: auto; aspect-ratio: 740 / 420; touch-action: none; cursor: grab; }
    .sf-canvas:active { cursor: grabbing; }
    .sf-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
      width: 100%; max-width: 740px; padding: 8px 12px; border-radius: 20px;
      background: linear-gradient(180deg, #14224a, #0e1938); border: 2px solid #2e4782; box-shadow: 0 5px 0 #091024; color: #f0f6ff; }
    .sf-eq { font: 700 1.35rem/1.2 Fredoka, Heebo, sans-serif; color: #ffd23f; min-height: 1.5em; display: flex; align-items: center;
      gap: 8px; padding: 2px 10px; border-radius: 12px; background: rgba(255, 255, 255, .07); direction: ltr; }
    .sf-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-inline-start: auto; }
    .sf-tool-btn { appearance: none; border: 2px solid #4768b5; background: #1d3166; color: #e2eeff;
      font: 700 .95rem/1.1 Fredoka, Heebo, sans-serif; padding: 9px 14px; min-height: 42px; border-radius: 14px;
      cursor: pointer; box-shadow: 0 4px 0 #0b132b; transition: transform .08s, background .15s, border-color .15s;
      display: inline-flex; align-items: center; gap: 6px; }
    .sf-tool-btn[hidden] { display: none !important; }
    .sf-tool-btn:hover { background: #263f80; }
    .sf-tool-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #0b132b; }
    .sf-tool-btn.active { background: #00c9b7; color: #052623; border-color: #9efcf2; box-shadow: 0 4px 0 #007368, 0 0 14px rgba(0, 201, 183, .45); }
    .sf-tool-btn.overhang-cut { background: linear-gradient(135deg, #00e5ff, #00b4d8); color: #041f2e; border-color: #ffffff;
      box-shadow: 0 4px 0 #006680, 0 0 16px rgba(0, 229, 255, .7); animation: sf-pulse 1s ease-in-out infinite; }
    @keyframes sf-pulse { 50% { box-shadow: 0 4px 0 #006680, 0 0 26px 4px rgba(0, 229, 255, .95); } }
    .sf-quick-tray { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; width: 100%; max-width: 740px; min-height: 54px; }
    .sf-chip-block { appearance: none; border: 2px solid rgba(255,255,255,.85); border-radius: 16px;
      padding: 8px 15px; min-height: 48px; min-width: 56px; cursor: pointer; color: #fff;
      font: 700 1.25rem/1 Fredoka, Heebo, sans-serif; background: var(--b-fill, #2eb8ff);
      box-shadow: 0 5px 0 var(--b-edge, #0e74b5); display: inline-flex; align-items: center; gap: 8px;
      transition: transform .1s, box-shadow .1s; }
    .sf-chip-block:hover { transform: translateY(-2px); }
    .sf-chip-block:active { transform: translateY(3px); box-shadow: 0 2px 0 var(--b-edge, #0e74b5); }
    .sf-chip-pips { display: inline-flex; gap: 3px; }
    .sf-chip-pip { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.9); }
    .sf-chip-seam { appearance: none; border: 1.5px dashed #7ef9ff; background: rgba(0, 210, 230, .2); color: #053b47;
      font: 700 .85rem/1 Fredoka, Heebo, sans-serif; padding: 6px 10px; min-height: 36px; border-radius: 11px; cursor: pointer; }
    .sf-chip-seam:hover { background: rgba(0, 210, 230, .35); }
    @media (max-width: 560px) {
      .sf-bar { padding: 7px 10px; gap: 6px; }
      .sf-eq { font-size: 1.12rem; }
      .sf-tool-btn { padding: 7px 11px; font-size: .86rem; min-height: 38px; }
      .sf-chip-block { min-height: 44px; padding: 6px 12px; font-size: 1.1rem; }
    }
  `;

  const clock = EDKit.timers();
  let rafId = 0;
  let activeCleanup = null;

  /* ---- Procedural WebAudio Sound Effects ---- */
  function sfxPickup() {
    EDSound.note([340, 510], { seconds: 0.09, wave: 'sine', gain: 0.15 });
  }
  function sfxPlace(units) {
    const f = PENTA[Math.min(units, PENTA.length - 1)];
    EDSound.note(f, { seconds: 0.2, wave: 'triangle', gain: 0.2 });
  }
  function sfxFuse(val) {
    const base = PENTA[Math.min(val, PENTA.length - 1)];
    EDSound.note([base * 0.75, base], { seconds: 0.24, wave: 'triangle', gain: 0.2 });
    EDSound.note(base * 1.25, { seconds: 0.28, wave: 'sine', gain: 0.16, delay: 0.06 });
  }
  function sfxSlice() {
    EDSound.note([960, 390, 680], { seconds: 0.17, wave: 'sawtooth', gain: 0.11 });
    EDSound.note(1240, { seconds: 0.14, wave: 'triangle', gain: 0.13, delay: 0.03 });
  }
  function sfxBridgeLock() {
    EDSound.note(523.25, { seconds: 0.28, wave: 'triangle', gain: 0.19 });
    EDSound.note(659.25, { seconds: 0.28, wave: 'triangle', gain: 0.18, delay: 0.07 });
    EDSound.note(783.99, { seconds: 0.36, wave: 'triangle', gain: 0.2, delay: 0.14 });
  }
  function sfxRollStep(idx) {
    const f = PENTA[idx % PENTA.length];
    EDSound.note(f, { seconds: 0.18, wave: 'triangle', gain: 0.18 });
  }
  function sfxStar(idx) {
    const notes = [1046.5, 1318.5, 1568.0];
    EDSound.note(notes[idx % notes.length], { seconds: 0.24, wave: 'sine', gain: 0.17 });
  }
  function sfxLumiGiggle() {
    EDSound.note(EDSound.wobble(700, 150, 3), { seconds: 0.26, wave: 'sine', gain: 0.17 });
  }

  /* ---- Canvas Drawing Helpers ---- */
  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawStarShape(ctx, cx, cy, r, points = 5, innerRatio = 0.46, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i += 1) {
      const a = rot + (i * Math.PI) / points;
      const rad = i % 2 === 0 ? r : r * innerRatio;
      const px = cx + Math.cos(a) * rad;
      const py = cy + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawGear(ctx, cx, cy, r, teeth, angle, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < teeth; i += 1) {
      const a = (i / teeth) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillRect(-r * 0.12, -r, r * 0.24, r * 0.28);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('sf-style', CSS);

    const W = 740;
    const H = 420;
    const TRACK_Y = 172;
    const BENCH_Y = 262;
    const BENCH_H = 144;
    const BLOCK_H = 54;

    let round = 0;
    let totalStars = 0;
    let blockSeq = 1;

    const wrap = document.createElement('div');
    wrap.className = 'kit sf';
    root.append(wrap);

    /* Starfield & background clockwork gears (persistent across rounds). */
    const bgStars = Array.from({ length: 42 }, (_, i) => ({
      x: (i * 173 + 29) % W,
      y: (i * 97 + 13) % (BENCH_Y - 12),
      r: 1 + (i % 3) * 0.75,
      phase: i * 0.9,
      speed: 1.5 + (i % 4) * 0.6,
    }));
    const gears = [
      { x: 112, y: 76, r: 44, teeth: 10, speed: 0.25, angle: 0, color: 'rgba(255, 210, 63, 0.11)' },
      { x: 178, y: 112, r: 28, teeth: 8, speed: -0.4, angle: 0.4, color: 'rgba(95, 208, 245, 0.12)' },
      { x: 618, y: 68, r: 38, teeth: 9, speed: 0.3, angle: 1.1, color: 'rgba(255, 210, 63, 0.10)' },
    ];

    /* Expressive pointer-tracking state for Lumi the Star-Bot. */
    const pointer = { x: W * 0.5, y: H * 0.5, active: false };
    const lumi = {
      x: W - 66,
      y: TRACK_Y - 38,
      scaleX: 1,
      scaleY: 1,
      vy: 0,
      jumpY: 0,
      blink: 0,
      happyTimer: 0,
      speech: '',
      speechTimer: 0,
      antennaTilt: 0,
    };

    let particles = [];
    let floatTexts = [];

    function spawnParticles(x, y, count, opts = {}) {
      const {
        colors = ['#ffd23f', '#5fd0f5', '#ff5d8f', '#28c76f', '#ffffff'],
        kind = 'spark',
        speed = 160,
        gravity = 240,
      } = opts;
      for (let i = 0; i < count; i += 1) {
        const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const sp = speed * (0.45 + Math.random() * 0.75);
        particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - (kind === 'heart' ? 70 : 30),
          r: kind === 'star' ? 6 + Math.random() * 5 : 3 + Math.random() * 3.5,
          color: colors[i % colors.length],
          kind,
          gravity,
          life: 0,
          maxLife: 0.55 + Math.random() * 0.45,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 8,
        });
      }
    }

    function spawnShockwave(x, y, color = '#ffd23f') {
      particles.push({
        x, y, vx: 0, vy: 0, r: 8, maxR: 58, color, kind: 'ring', gravity: 0, life: 0, maxLife: 0.42,
      });
    }

    function spawnFloatText(x, y, str, color = '#ffd23f') {
      floatTexts.push({ x, y, str, color, life: 0, maxLife: 1.15 });
    }

    function giggleLumi(customMsg) {
      sfxLumiGiggle();
      lumi.vy = -170;
      lumi.scaleX = 1.22;
      lumi.scaleY = 0.82;
      lumi.happyTimer = 1.4;
      lumi.speech = customMsg || EDKit.pick(text.lumiHi);
      lumi.speechTimer = 1.5;
      spawnParticles(lumi.x, lumi.y - 24, 12, {
        colors: ['#ff5d8f', '#ffd23f', '#5fd0f5'],
        kind: 'heart',
        speed: 110,
        gravity: 120,
      });
    }

    function startRound() {
      if (activeCleanup) {
        activeCleanup();
        activeCleanup = null;
      }
      if (round >= ROUNDS) {
        cancelAnimationFrame(rafId);
        return EDKit.end(wrap, ctx, lang);
      }

      const puzzleList = PUZZLES[set.mode] || PUZZLES.fuse;
      const spec = puzzleList[round % puzzleList.length];
      const totalBridgeUnits = spec.gaps.reduce((s, n) => s + n, 0);

      /* Size unitW so the bridge(s) + launcher cliff + Lumi cliff fit spaciously. */
      const UNIT_W = totalBridgeUnits >= 9 ? 40 : 44;
      const PILLAR_W = spec.gaps.length > 1 ? 34 : 0;
      const totalChasmW = totalBridgeUnits * UNIT_W + (spec.gaps.length - 1) * PILLAR_W;
      const chasmStartX = Math.round((W - totalChasmW) / 2) - 6;

      /* Build bridge gap state objects. */
      let cursorX = chasmStartX;
      const gaps = spec.gaps.map((target, idx) => {
        const g = {
          index: idx,
          target,
          x: cursorX,
          y: TRACK_Y - 6,
          width: target * UNIT_W,
          height: BLOCK_H,
          blocks: [],
          overhang: null,
          litUnits: 0,
        };
        cursorX += g.width + PILLAR_W;
        return g;
      });
      const chasmEndX = cursorX - PILLAR_W;

      lumi.x = Math.min(W - 46, Math.max(chasmEndX + 108, W - 78));
      lumi.y = TRACK_Y - 36;

      /* Floating collectible mini-stars along the bridge path. */
      const collectStars = [0.22, 0.5, 0.78].map((t, idx) => ({
        index: idx,
        x: chasmStartX + totalChasmW * t,
        baseY: TRACK_Y - 38,
        collected: false,
        scale: 1,
      }));

      /* Golden Star Orb sitting on the left launcher platform. */
      const orb = {
        x: chasmStartX - 36,
        y: TRACK_Y - 22,
        r: 18,
        rot: 0,
        rolling: false,
        done: false,
        lastUnitSound: -1,
      };

      let activeGapIdx = 0;
      let laserMode = set.mode === 'slice';
      let phase = 'build'; // 'build' | 'rolling' | 'celebrate'
      let equationStr = spec.gaps.map((n) => `? = ${n}`).join('   |   ');
      let benchBlocks = [];

      function makeBlock(value, x = W / 2, y = BENCH_Y + 55) {
        const id = blockSeq;
        blockSeq += 1;
        return {
          id,
          value,
          x,
          y,
          tx: x,
          ty: y,
          w: value * UNIT_W,
          h: BLOCK_H,
          scaleX: 1,
          scaleY: 1,
          tilt: 0,
          hoverSeam: 0,
        };
      }

      function layoutBench() {
        const count = benchBlocks.length;
        if (!count) return;
        const pad = 18;
        const totalW = benchBlocks.reduce((s, b) => s + b.value * UNIT_W, 0) + (count - 1) * pad;
        if (totalW <= W - 60) {
          let sx = (W - totalW) / 2;
          benchBlocks.forEach((b) => {
            b.w = b.value * UNIT_W;
            b.tx = sx;
            b.ty = BENCH_Y + (BENCH_H - BLOCK_H) / 2 + 6;
            sx += b.w + pad;
          });
        } else {
          /* Two neat rows on the workbench when many blocks are present. */
          const rowWidth = (row) => row.reduce((s, b) => s + b.value * UNIT_W, 0) + (row.length - 1) * 14;
          let half = Math.ceil(count / 2);
          const widestRow = (split) => Math.max(rowWidth(benchBlocks.slice(0, split)), rowWidth(benchBlocks.slice(split)));
          // Equal block counts can still put nearly all the units on one row.
          if (widestRow(half) > W - 36) {
            let bestWidth = widestRow(half);
            for (let split = 1; split < count; split += 1) {
              const width = widestRow(split);
              if (width < bestWidth) {
                half = split;
                bestWidth = width;
              }
            }
          }
          const rows = [benchBlocks.slice(0, half), benchBlocks.slice(half)];
          rows.forEach((row, rIdx) => {
            const rw = rowWidth(row);
            let sx = (W - rw) / 2;
            row.forEach((b) => {
              b.w = b.value * UNIT_W;
              b.tx = sx;
              b.ty = BENCH_Y + 16 + rIdx * (BLOCK_H + 14);
              sx += b.w + 14;
            });
          });
        }
      }

      function resetPuzzleBlocks() {
        if (phase !== 'build') return;
        cancelGesture();
        gaps.forEach((g) => {
          g.blocks = [];
          g.overhang = null;
          g.litUnits = 0;
        });
        activeGapIdx = 0;
        benchBlocks = spec.blocks.map((v) => makeBlock(v, W / 2, BENCH_Y + 60));
        layoutBench();
        benchBlocks.forEach((b) => {
          b.x = b.tx;
          b.y = b.ty - 14;
          b.scaleX = 0.88;
          b.scaleY = 1.14;
        });
        equationStr = spec.gaps.map((n) => `? = ${n}`).join('   |   ');
        updateHtmlControls();
      }

      const titleLine = set.mode === 'slice'
        ? text.askSlice(spec.gaps[0])
        : (set.mode === 'master'
          ? text.askMaster(spec.gaps[0], spec.gaps[1])
          : text.askFuse(spec.gaps[0]));

      const initialHint = set.mode === 'slice'
        ? text.hintSlice
        : (set.mode === 'master' ? text.hintMaster : text.hintFuse);

      wrap.innerHTML = `
        <div class="sf-top">
          ${EDKit.dots(ROUNDS, round)}
          <span class="sf-stars-pill" data-stars-pill>⭐ ${totalStars}</span>
        </div>
        ${EDKit.head(titleLine, lang)}
        <div class="sf-arena">
          <canvas class="sf-canvas" width="${W}" height="${H}"></canvas>
        </div>
        <div class="sf-bar">
          <div class="sf-eq" data-eq aria-live="polite"></div>
          <div class="sf-tools">
            <button type="button" class="sf-tool-btn" data-overhang-cut hidden></button>
            <button type="button" class="sf-tool-btn" data-laser-toggle></button>
            <button type="button" class="sf-tool-btn" data-reset-blocks>${text.resetBlocks}</button>
          </div>
        </div>
        <div class="sf-quick-tray" data-quick-tray></div>
        <p class="kit-hint" data-hint aria-live="polite">${initialHint}</p>`;

      const canvas = wrap.querySelector('.sf-canvas');
      const eqEl = wrap.querySelector('[data-eq]');
      const hintEl = wrap.querySelector('[data-hint]');
      const starsPill = wrap.querySelector('[data-stars-pill]');
      const laserBtn = wrap.querySelector('[data-laser-toggle]');
      const overhangCutBtn = wrap.querySelector('[data-overhang-cut]');
      const resetBlocksBtn = wrap.querySelector('[data-reset-blocks]');
      const quickTray = wrap.querySelector('[data-quick-tray]');

      /* Speak the round prompt out loud. */
      const voicePayload = set.mode === 'slice'
        ? ['sf-slice', EDVoiceLines.num(spec.gaps[0])]
        : (set.mode === 'master'
          ? ['sf-master']
          : ['sf-fuse', EDVoiceLines.num(spec.gaps[0])]);
      EDKit.voice(wrap, voicePayload, lang);

      function gapFilledUnits(g) {
        return g.blocks.reduce((s, b) => s + b.value, 0);
      }

      function currentOverhangGap() {
        return gaps.find((g) => g.overhang !== null) || null;
      }

      function updateEquationString() {
        const parts = gaps.map((g) => {
          if (g.overhang) {
            const { block, keep, extra } = g.overhang;
            return `${block.value} − ${extra} = ${keep}`;
          }
          const filled = gapFilledUnits(g);
          if (filled === 0) return `? = ${g.target}`;
          const sumExpr = g.blocks.map((b) => b.value).join(' + ');
          if (filled === g.target) return `${sumExpr} = ${g.target} ✓`;
          return `${sumExpr} + ? = ${g.target}`;
        });
        equationStr = parts.join('   |   ');
      }

      function updateHtmlControls() {
        updateEquationString();
        eqEl.textContent = equationStr;
        starsPill.textContent = `⭐ ${totalStars}`;

        laserBtn.textContent = laserMode ? text.laserOn : text.laserBtn;
        laserBtn.classList.toggle('active', laserMode);
        laserBtn.setAttribute('aria-pressed', String(laserMode));

        const ovGap = currentOverhangGap();
        if (ovGap && ovGap.overhang) {
          const { block, keep, extra } = ovGap.overhang;
          overhangCutBtn.hidden = false;
          overhangCutBtn.className = 'sf-tool-btn overhang-cut';
          overhangCutBtn.textContent = text.sliceOverhangBtn(keep, extra);
          hintEl.textContent = text.hintOverhang(block.value, keep, extra);
        } else {
          overhangCutBtn.hidden = true;
          if (phase === 'build') {
            hintEl.textContent = laserMode ? text.hintSlice : initialHint;
          }
        }

        /* Accessible & touch-friendly quick deck below the canvas. */
        if (phase !== 'build') {
          quickTray.innerHTML = '';
          return;
        }
        quickTray.innerHTML = benchBlocks.map((b) => {
          const col = BLOCK_COLORS[b.value] || BLOCK_COLORS[5];
          const pips = Array.from({ length: b.value }, () => '<span class="sf-chip-pip"></span>').join('');
          /* When a block has length >= 2, also offer a quick-slice button right next to it if laserMode is on or block > remaining gap. */
          const g = gaps[activeGapIdx] || gaps[0];
          const rem = Math.max(1, g.target - gapFilledUnits(g));
          const cutAt = b.value > rem ? rem : Math.floor(b.value / 2);
          const showSeamBtn = b.value >= 2 && (laserMode || b.value > rem || set.mode === 'slice' || set.mode === 'master');
          const seamHtml = showSeamBtn
            ? `<button type="button" class="sf-chip-seam" data-slice-id="${b.id}" data-cut="${cutAt}" aria-label="${text.sliceAria(b.value, cutAt, b.value - cutAt)}">✂️ ${cutAt}|${b.value - cutAt}</button>`
            : '';
          return `
            <div style="display:inline-flex;align-items:center;gap:4px">
              <button type="button" class="sf-chip-block" data-block-id="${b.id}"
                style="--b-fill:${col.fill};--b-edge:${col.edge}" aria-label="${text.blockAria(b.value)}">
                <span>${b.value}</span>
                <span class="sf-chip-pips" aria-hidden="true">${pips}</span>
              </button>
              ${seamHtml}
            </div>`;
        }).join('');

        quickTray.querySelectorAll('[data-block-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = Number(btn.dataset.blockId);
            const blk = benchBlocks.find((x) => x.id === id);
            if (!blk) return;
            cancelGesture();
            if (laserMode && blk.value >= 2) {
              const g = gaps[activeGapIdx] || gaps[0];
              const rem = Math.max(1, g.target - gapFilledUnits(g));
              const cut = blk.value > rem ? rem : Math.floor(blk.value / 2);
              sliceBenchBlock(blk, cut);
            } else {
              sendBlockToGap(blk, gaps[activeGapIdx] || gaps[0]);
            }
          });
        });

        quickTray.querySelectorAll('[data-slice-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = Number(btn.dataset.sliceId);
            const cut = Number(btn.dataset.cut);
            const blk = benchBlocks.find((x) => x.id === id);
            if (!blk) return;
            cancelGesture();
            sliceBenchBlock(blk, cut);
          });
        });
      }

      /* ---- Core Mathematical Actions: Fuse, Slice, Place in Bridge, Slice Overhang ---- */

      function fuseBenchBlocks(a, b) {
        if (phase !== 'build') return false;
        const sum = a.value + b.value;
        if (sum > 10) return false;
        const mx = (a.x + a.w / 2 + b.x + b.w / 2) / 2;
        const my = (a.y + b.y) / 2;
        benchBlocks = benchBlocks.filter((x) => x.id !== a.id && x.id !== b.id);
        const merged = makeBlock(sum, mx - (sum * UNIT_W) / 2, my);
        merged.scaleX = 1.28;
        merged.scaleY = 0.76;
        benchBlocks.push(merged);
        layoutBench();

        sfxFuse(sum);
        spawnShockwave(mx, my + BLOCK_H / 2, '#ffd23f');
        spawnParticles(mx, my + BLOCK_H / 2, 22, {
          colors: [BLOCK_COLORS[sum].fill, '#ffd23f', '#ffffff'],
          kind: 'star',
          speed: 170,
        });
        spawnFloatText(mx, my - 10, `${a.value} + ${b.value} = ${sum}`, '#ffd23f');
        EDVoice.say(EDVoiceLines.num(sum), lang);

        lumi.happyTimer = 0.9;
        updateHtmlControls();
        return true;
      }

      function sliceBenchBlock(blk, cutUnits) {
        if (phase !== 'build' || blk.value < 2) return false;
        const leftVal = Math.max(1, Math.min(blk.value - 1, cutUnits));
        const rightVal = blk.value - leftVal;
        const seamX = blk.x + leftVal * UNIT_W;
        const seamY = blk.y + BLOCK_H / 2;

        const idx = benchBlocks.findIndex((x) => x.id === blk.id);
        if (idx === -1) return false;

        const leftBlk = makeBlock(leftVal, blk.x - 14, blk.y);
        const rightBlk = makeBlock(rightVal, seamX + 14, blk.y);
        leftBlk.scaleX = 0.84;
        leftBlk.scaleY = 1.18;
        rightBlk.scaleX = 0.84;
        rightBlk.scaleY = 1.18;

        benchBlocks.splice(idx, 1, leftBlk, rightBlk);
        layoutBench();

        sfxSlice();
        spawnShockwave(seamX, seamY, '#00e5ff');
        spawnParticles(seamX, seamY, 20, {
          colors: ['#00e5ff', '#ffffff', '#ffd23f'],
          kind: 'laser',
          speed: 190,
        });
        spawnFloatText(seamX, blk.y - 12, `${blk.value} → ${leftVal} + ${rightVal}`, '#7ef9ff');
        EDVoice.say([EDVoiceLines.num(leftVal), EDVoiceLines.num(rightVal)], lang);

        updateHtmlControls();
        return true;
      }

      function sliceOverhangOnGap(gap) {
        if (!gap || !gap.overhang || phase !== 'build') return;
        const { block, keep, extra } = gap.overhang;
        const filled = gapFilledUnits(gap);
        const seamX = gap.x + (filled + keep) * UNIT_W;
        const seamY = gap.y + BLOCK_H / 2;

        gap.overhang = null;
        const fitBlock = makeBlock(keep, gap.x + filled * UNIT_W, gap.y);
        fitBlock.scaleX = 1.18;
        fitBlock.scaleY = 0.84;
        gap.blocks.push(fitBlock);

        const extraBlock = makeBlock(extra, seamX + 10, gap.y + 30);
        extraBlock.scaleX = 0.85;
        extraBlock.scaleY = 1.18;
        benchBlocks.push(extraBlock);
        layoutBench();

        sfxSlice();
        spawnShockwave(seamX, seamY, '#00e5ff');
        spawnParticles(seamX, seamY, 24, {
          colors: ['#00e5ff', '#ffd23f', '#ffffff'],
          kind: 'laser',
          speed: 200,
        });
        spawnFloatText(seamX, gap.y - 18, `${block.value} − ${extra} = ${keep}`, '#7ef9ff');

        checkBridgeCompletion(gap, `${block.value} − ${extra} = ${keep}`);
      }

      function sendBlockToGap(blk, targetGap) {
        if (phase !== 'build') return;
        /* Pick the best gap: if targetGap is already full, look for the first unfilled gap. */
        let gap = targetGap;
        if (!gap || gapFilledUnits(gap) >= gap.target) {
          gap = gaps.find((g) => gapFilledUnits(g) < g.target) || gaps[0];
        }
        activeGapIdx = gap.index;

        /* If this gap already has an overhang block, return the old overhang block to the bench first. */
        if (gap.overhang) {
          benchBlocks.push(gap.overhang.block);
          gap.overhang = null;
        }

        const filled = gapFilledUnits(gap);
        const rem = gap.target - filled;
        if (rem <= 0) return;

        benchBlocks = benchBlocks.filter((x) => x.id !== blk.id);

        if (blk.value <= rem) {
          blk.x = gap.x + filled * UNIT_W;
          blk.y = gap.y;
          blk.tx = blk.x;
          blk.ty = blk.y;
          blk.scaleX = 1.18;
          blk.scaleY = 0.84;
          gap.blocks.push(blk);

          const nowFilled = gapFilledUnits(gap);
          sfxPlace(nowFilled);
          spawnParticles(blk.x + blk.w / 2, blk.y + BLOCK_H / 2, 12, {
            colors: [BLOCK_COLORS[blk.value].fill, '#ffd23f'],
            speed: 120,
          });
          EDVoice.say(EDVoiceLines.num(nowFilled), lang);
          checkBridgeCompletion(gap);
        } else {
          /* Block is longer than the remaining gap: perch it in Overhang Slice Preview! */
          blk.x = gap.x + filled * UNIT_W;
          blk.y = gap.y - 8;
          blk.tx = blk.x;
          blk.ty = blk.y;
          gap.overhang = {
            block: blk,
            keep: rem,
            extra: blk.value - rem,
          };
          sfxPlace(rem);
          EDVoice.say('sf-overhang', lang);
          layoutBench();
          updateHtmlControls();
        }
      }

      function returnGapBlockToBench(gap, blk) {
        if (phase !== 'build') return;
        gap.blocks = gap.blocks.filter((x) => x.id !== blk.id);
        /* Re-pack remaining blocks in the gap cleanly from the left. */
        let gx = gap.x;
        gap.blocks.forEach((b) => {
          b.x = gx;
          b.tx = gx;
          gx += b.value * UNIT_W;
        });
        if (gap.overhang) {
          const preview = gap.overhang;
          const keep = gap.target - gapFilledUnits(gap);
          const extra = preview.block.value - keep;
          if (extra > 0) {
            preview.keep = keep;
            preview.extra = extra;
            preview.block.x = gx;
            preview.block.tx = gx;
          } else {
            benchBlocks.push(preview.block);
            gap.overhang = null;
          }
        }
        benchBlocks.push(blk);
        layoutBench();
        sfxPickup();
        updateHtmlControls();
      }

      function checkBridgeCompletion(justUpdatedGap, customEq) {
        layoutBench();
        /* If a gap just reached its exact target and had multiple blocks inside, fuse them visually! */
        if (justUpdatedGap && gapFilledUnits(justUpdatedGap) === justUpdatedGap.target) {
          const cx = justUpdatedGap.x + justUpdatedGap.width / 2;
          const cy = justUpdatedGap.y + BLOCK_H / 2;
          spawnShockwave(cx, cy, '#28c76f');
          spawnParticles(cx, cy, 18, {
            colors: ['#28c76f', '#ffd23f', '#ffffff'],
            kind: 'star',
            speed: 150,
          });
          if (customEq) {
            spawnFloatText(cx, justUpdatedGap.y - 16, customEq, '#ffd23f');
          } else if (justUpdatedGap.blocks.length > 1) {
            const expr = `${justUpdatedGap.blocks.map((b) => b.value).join(' + ')} = ${justUpdatedGap.target}`;
            spawnFloatText(cx, justUpdatedGap.y - 16, expr, '#ffd23f');
          }
          /* Advance activeGapIdx to the next unfilled gap if there is one. */
          const nextOpen = gaps.find((g) => gapFilledUnits(g) < g.target);
          if (nextOpen) activeGapIdx = nextOpen.index;
        }

        updateHtmlControls();

        /* Are ALL bridge gaps completely filled? */
        const allReady = gaps.every((g) => gapFilledUnits(g) === g.target && !g.overhang);
        if (!allReady) return;

        /* Launch the 60fps Star Orb Roll sequence! */
        phase = 'rolling';
        orb.rolling = true;
        orb.lastUnitSound = -1;
        hintEl.textContent = text.hintRoll;
        updateHtmlControls();

        sfxBridgeLock();
        EDVoice.say('sf-ready', lang);
        lumi.happyTimer = 3.0;
        lumi.speech = '🌟';
        lumi.speechTimer = 2.6;
      }

      /* Wire toolbar buttons. */
      laserBtn.addEventListener('click', () => {
        if (phase !== 'build') return;
        cancelGesture();
        laserMode = !laserMode;
        sfxPickup();
        updateHtmlControls();
      });
      overhangCutBtn.addEventListener('click', () => {
        const ovGap = currentOverhangGap();
        if (!ovGap) return;
        cancelGesture();
        sliceOverhangOnGap(ovGap);
      });
      resetBlocksBtn.addEventListener('click', () => {
        sfxPickup();
        resetPuzzleBlocks();
      });

      /* ---- Canvas Pointer (Touch / Mouse / Pen) Direct Manipulation ---- */
      let dragState = null;

      function startGesture(e, state) {
        dragState = { ...state, pointerId: e.pointerId };
        try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      }

      function endGesture() {
        const state = dragState;
        dragState = null;
        if (!state) return null;
        if (canvas.hasPointerCapture(state.pointerId)) canvas.releasePointerCapture(state.pointerId);
        if (state.kind === 'block') {
          state.block.tilt = 0;
          state.block.scaleX = 1;
          state.block.scaleY = 1;
        }
        return state;
      }

      function cancelGesture() {
        if (endGesture()?.kind === 'block') layoutBench();
      }

      function toCanvasCoords(e) {
        const r = canvas.getBoundingClientRect();
        return {
          x: ((e.clientX - r.left) / (r.width || W)) * W,
          y: ((e.clientY - r.top) / (r.height || H)) * H,
        };
      }

      function hitTestSeam(b, px, py) {
        if (b.value < 2) return 0;
        if (py < b.y - 18 || py > b.y + BLOCK_H + 18) return 0;
        const seamRadius = laserMode || set.mode === 'slice' ? 16 : 12;
        for (let k = 1; k < b.value; k += 1) {
          const sx = b.x + k * UNIT_W;
          if (Math.abs(px - sx) <= seamRadius) {
            /* In non-laser mode, tapping near the top/center scissor badge slices; in laserMode, the entire seam height slices. */
            if (laserMode || set.mode === 'slice' || py <= b.y + 26) {
              return k;
            }
          }
        }
        return 0;
      }

      function onPointerDown(e) {
        if (e.button > 0 || dragState) return;
        const pt = toCanvasCoords(e);
        pointer.x = pt.x;
        pointer.y = pt.y;
        pointer.active = true;

        /* 1. Check if the child tapped Lumi the Star-Bot! */
        if (Math.hypot(pt.x - lumi.x, pt.y - lumi.y) <= 44) {
          giggleLumi();
          return;
        }

        if (phase !== 'build') return;

        /* 2. Check if an Overhang Slice Preview is active on any bridge gap and its laser cut target was tapped. */
        for (const g of gaps) {
          if (g.overhang) {
            const filled = gapFilledUnits(g);
            const cutX = g.x + (filled + g.overhang.keep) * UNIT_W;
            const cutY = g.overhang.block.y + BLOCK_H / 2;
            if (Math.hypot(pt.x - cutX, pt.y - cutY) <= 34
                || (pt.x >= g.overhang.block.x && pt.x <= g.overhang.block.x + g.overhang.block.w
                    && pt.y >= g.overhang.block.y - 22 && pt.y <= g.overhang.block.y + BLOCK_H + 22)) {
              startGesture(e, { kind: 'tap', start: pt, action: () => sliceOverhangOnGap(g) });
              return;
            }
          }
        }

        /* 3. Check if a laser seam on a workbench block was tapped directly. */
        for (let i = benchBlocks.length - 1; i >= 0; i -= 1) {
          const b = benchBlocks[i];
          const seamK = hitTestSeam(b, pt.x, pt.y);
          if (seamK > 0) {
            startGesture(e, { kind: 'tap', start: pt, action: () => sliceBenchBlock(b, seamK) });
            return;
          }
        }

        /* 4. Check if a workbench block was pressed. */
        for (let i = benchBlocks.length - 1; i >= 0; i -= 1) {
          const b = benchBlocks[i];
          if (pt.x >= b.x - 6 && pt.x <= b.x + b.w + 6 && pt.y >= b.y - 6 && pt.y <= b.y + BLOCK_H + 6) {
            sfxPickup();
            startGesture(e, {
              kind: 'block',
              block: b,
              offsetX: pt.x - b.x,
              offsetY: pt.y - b.y,
              startX: pt.x,
              startY: pt.y,
              moved: false,
              fuseTarget: null,
              hoverGap: null,
            });
            b.scaleX = 1.08;
            b.scaleY = 1.08;
            return;
          }
        }

        /* 5. Check if a block inside a bridge gap was tapped (to return it to the workbench or select that gap). */
        for (const g of gaps) {
          for (let i = g.blocks.length - 1; i >= 0; i -= 1) {
            const b = g.blocks[i];
            if (pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= g.y - 8 && pt.y <= g.y + BLOCK_H + 8) {
              startGesture(e, { kind: 'tap', start: pt, action: () => returnGapBlockToBench(g, b) });
              return;
            }
          }
          if (pt.x >= g.x && pt.x <= g.x + g.width && pt.y >= g.y - 24 && pt.y <= g.y + BLOCK_H + 24) {
            startGesture(e, { kind: 'tap', start: pt, action: () => {
              activeGapIdx = g.index;
              updateHtmlControls();
            } });
            return;
          }
        }

        /* 6. Starting a drag on empty space starts a Laser Swipe gesture! */
        startGesture(e, {
          kind: 'laser-swipe',
          points: [pt],
          slicedIds: new Set(),
        });
      }

      function onPointerMove(e) {
        if (dragState && e.pointerId !== dragState.pointerId) return;
        const pt = toCanvasCoords(e);
        pointer.x = pt.x;
        pointer.y = pt.y;

        /* Highlight hovered seam on workbench blocks. */
        benchBlocks.forEach((b) => {
          b.hoverSeam = (!dragState && phase === 'build') ? hitTestSeam(b, pt.x, pt.y) : 0;
        });

        if (!dragState) return;

        if (dragState.kind === 'block') {
          const b = dragState.block;
          if (!dragState.moved && Math.hypot(pt.x - dragState.startX, pt.y - dragState.startY) > 8) {
            dragState.moved = true;
          }
          if (dragState.moved) {
            const nx = Math.max(8, Math.min(W - b.w - 8, pt.x - dragState.offsetX));
            const ny = Math.max(12, Math.min(H - BLOCK_H - 8, pt.y - dragState.offsetY));
            const vx = nx - b.x;
            b.x = nx;
            b.y = ny;
            b.tx = nx;
            b.ty = ny;
            b.tilt = Math.max(-0.18, Math.min(0.18, vx * 0.012));

            /* Check proximity to another workbench block for magnetic fusion! */
            let bestOther = null;
            let bestDist = 66;
            const bCx = b.x + b.w / 2;
            const bCy = b.y + BLOCK_H / 2;
            for (const other of benchBlocks) {
              if (other.id === b.id || b.value + other.value > 10) continue;
              const oCx = other.x + other.w / 2;
              const oCy = other.y + BLOCK_H / 2;
              const d = Math.hypot(bCx - oCx, bCy - oCy);
              if (d < bestDist) {
                bestDist = d;
                bestOther = other;
              }
            }
            dragState.fuseTarget = bestOther;

            /* Check proximity to any bridge gap! */
            let bestGap = null;
            let bestGapDistance = Infinity;
            for (const g of gaps) {
              if (gapFilledUnits(g) >= g.target || bCy < g.y - 55 || bCy > g.y + BLOCK_H + 55) continue;
              const distance = Math.max(g.x - bCx, bCx - (g.x + g.width), 0);
              if (distance <= 36 && distance < bestGapDistance) {
                bestGap = g;
                bestGapDistance = distance;
              }
            }
            dragState.hoverGap = bestGap;
          }
        } else if (dragState.kind === 'laser-swipe') {
          dragState.points.push(pt);
          if (dragState.points.length > 14) dragState.points.shift();
          const prev = dragState.points[dragState.points.length - 2];
          if (!prev || pt.x === prev.x || Math.hypot(pt.x - prev.x, pt.y - prev.y) < 6) return;

          /* Did the swipe segment cross a block's vertical seam? */
          for (const b of [...benchBlocks]) {
            if (b.value < 2 || dragState.slicedIds.has(b.id)) continue;
            for (let k = 1; k < b.value; k += 1) {
              const sx = b.x + k * UNIT_W;
              const crossing = (sx - prev.x) / (pt.x - prev.x);
              if (crossing < 0 || crossing > 1) continue;
              const y = prev.y + (pt.y - prev.y) * crossing;
              if (y >= b.y - 16 && y <= b.y + BLOCK_H + 16) {
                dragState.slicedIds.add(b.id);
                sliceBenchBlock(b, k);
                break;
              }
            }
          }
        }
      }

      function onPointerUp(e) {
        if (!dragState || e.pointerId !== dragState.pointerId) return;
        const st = endGesture();

        if (st.kind === 'tap') {
          const pt = toCanvasCoords(e);
          if (Math.hypot(pt.x - st.start.x, pt.y - st.start.y) <= 8) st.action();
          return;
        }

        if (st.kind === 'block') {
          const b = st.block;
          if (!st.moved) {
            /* It was a tap on the block! */
            if (laserMode && b.value >= 2) {
              const g = gaps[activeGapIdx] || gaps[0];
              const rem = Math.max(1, g.target - gapFilledUnits(g));
              const cut = b.value > rem ? rem : Math.floor(b.value / 2);
              sliceBenchBlock(b, cut);
            } else {
              sendBlockToGap(b, gaps[activeGapIdx] || gaps[0]);
            }
            return;
          }

          /* Dropped onto a bridge gap? */
          if (st.hoverGap) {
            sendBlockToGap(b, st.hoverGap);
            return;
          }

          /* Dropped onto another workbench block to fuse? */
          if (st.fuseTarget) {
            fuseBenchBlocks(b, st.fuseTarget);
            return;
          }

          /* Otherwise settle smoothly back onto the workbench. */
          layoutBench();
        }
      }

      function onPointerCancel(e) {
        if (dragState?.pointerId === e.pointerId) cancelGesture();
      }

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerCancel);
      canvas.addEventListener('lostpointercapture', onPointerCancel);

      activeCleanup = () => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerCancel);
        canvas.removeEventListener('lostpointercapture', onPointerCancel);
        cancelGesture();
      };

      resetPuzzleBlocks();

      /* ---- 60fps Update & Render Loop ---- */
      let lastTime = performance.now();

      function frame(nowMs) {
        const dt = Math.min(0.05, (nowMs - lastTime) / 1000);
        lastTime = nowMs;
        const t = nowMs / 1000;

        /* Resize high-DPI canvas backing store if needed. */
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const pixelWidth = Math.round(W * dpr);
        const pixelHeight = Math.round(H * dpr);
        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
          canvas.width = pixelWidth;
          canvas.height = pixelHeight;
        }
        const gctx = canvas.getContext('2d');
        gctx.save();
        gctx.scale(pixelWidth / W, pixelHeight / H);

        /* 1. Update Physics & Animations */
        const gearMult = phase === 'rolling' ? 3.5 : 1;
        gears.forEach((gr) => { gr.angle += gr.speed * gearMult * dt; });

        /* Update workbench blocks spring interpolation. */
        benchBlocks.forEach((b) => {
          if (!dragState || dragState.block !== b) {
            b.x += (b.tx - b.x) * Math.min(1, dt * 14);
            b.y += (b.ty - b.y) * Math.min(1, dt * 14);
            b.tilt *= 0.85;
          }
          b.scaleX += (1 - b.scaleX) * Math.min(1, dt * 15);
          b.scaleY += (1 - b.scaleY) * Math.min(1, dt * 15);
        });

        gaps.forEach((g) => {
          g.blocks.forEach((b) => {
            b.scaleX += (1 - b.scaleX) * Math.min(1, dt * 15);
            b.scaleY += (1 - b.scaleY) * Math.min(1, dt * 15);
          });
        });

        /* Update Rolling Star Orb during 'rolling' phase. */
        if (phase === 'rolling' && orb.rolling) {
          const rollSpeed = 235;
          orb.x += rollSpeed * dt;
          orb.rot += 7.5 * dt;

          /* Light up bridge units and play ascending marimba notes! */
          let globalUnitIdx = 0;
          gaps.forEach((g) => {
            for (let u = 0; u < g.target; u += 1) {
              const ux = g.x + u * UNIT_W + UNIT_W / 2;
              if (orb.x >= ux - 6) {
                g.litUnits = Math.max(g.litUnits, u + 1);
                if (globalUnitIdx > orb.lastUnitSound) {
                  orb.lastUnitSound = globalUnitIdx;
                  sfxRollStep(globalUnitIdx);
                  spawnParticles(ux, g.y + 4, 4, {
                    colors: ['#ffd23f', '#ffffff'],
                    speed: 75,
                    gravity: 160,
                  });
                }
              }
              globalUnitIdx += 1;
            }
          });

          /* Hop in an arc near Lumi at the end of the bridge! */
          if (orb.x > chasmEndX) {
            const jumpProg = Math.min(1, (orb.x - chasmEndX) / Math.max(24, lumi.x - chasmEndX));
            orb.y = (TRACK_Y - 22) - Math.sin(jumpProg * Math.PI) * 38;
          } else {
            orb.y = TRACK_Y - 22;
          }

          /* Collect floating stars along the bridge! */
          collectStars.forEach((st) => {
            if (!st.collected && Math.abs(orb.x - st.x) < 24) {
              st.collected = true;
              totalStars += 1;
              starsPill.textContent = `⭐ ${totalStars}`;
              sfxStar(st.index);
              spawnParticles(st.x, st.baseY, 16, {
                colors: ['#ffd23f', '#fff6b0', '#ffffff'],
                kind: 'star',
                speed: 150,
              });
              spawnFloatText(st.x, st.baseY - 14, '⭐ +1', '#ffd23f');
            }
          });

          /* Reached Lumi! */
          if (orb.x >= lumi.x - 16) {
            orb.rolling = false;
            orb.done = true;
            phase = 'celebrate';
            lumi.vy = -210;
            lumi.scaleX = 1.28;
            lumi.scaleY = 0.76;
            lumi.happyTimer = 3.0;
            lumi.speech = '🎉 ★';
            lumi.speechTimer = 2.4;

            spawnShockwave(lumi.x, lumi.y, '#ffd23f');
            spawnParticles(lumi.x, lumi.y - 16, 40, {
              colors: ['#ffd23f', '#ff5d8f', '#28c76f', '#2eb8ff', '#8a5cff'],
              kind: 'star',
              speed: 220,
            });
            EDKit.confetti(28);
            EDKit.praise(lang);

            round += 1;
            clock.later(startRound, 2500);
          }
        }

        /* Update Lumi physics & expressions. */
        lumi.jumpY += lumi.vy * dt;
        if (lumi.jumpY < 0) {
          lumi.vy += 560 * dt;
        } else {
          if (lumi.jumpY > 0 && lumi.vy > 40) {
            lumi.scaleX = 1.16;
            lumi.scaleY = 0.86;
          }
          lumi.jumpY = 0;
          lumi.vy = 0;
        }
        lumi.scaleX += (1 - lumi.scaleX) * Math.min(1, dt * 12);
        lumi.scaleY += (1 - lumi.scaleY) * Math.min(1, dt * 12);
        if (lumi.happyTimer > 0) lumi.happyTimer = Math.max(0, lumi.happyTimer - dt);
        if (lumi.speechTimer > 0) lumi.speechTimer = Math.max(0, lumi.speechTimer - dt);

        /* Update particles & floating callouts. */
        particles.forEach((p) => {
          p.life += dt;
          if (p.kind === 'ring') {
            p.r += (p.maxR - p.r) * dt * 10;
          } else {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.rot += (p.vrot || 0) * dt;
          }
        });
        particles = particles.filter((p) => p.life < p.maxLife);

        floatTexts.forEach((ft) => {
          ft.life += dt;
          ft.y -= 28 * dt;
        });
        floatTexts = floatTexts.filter((ft) => ft.life < ft.maxLife);

        /* ---- 2. Render Scene Layers ---- */

        /* Layer A: Cosmic Sky & Aurora */
        const skyGrad = gctx.createLinearGradient(0, 0, 0, H);
        skyGrad.addColorStop(0, '#091128');
        skyGrad.addColorStop(0.55, '#162a5c');
        skyGrad.addColorStop(1, '#101f44');
        gctx.fillStyle = skyGrad;
        gctx.fillRect(0, 0, W, H);

        /* Soft waving aurora ribbon across upper sky */
        gctx.save();
        gctx.beginPath();
        gctx.moveTo(0, 56);
        for (let x = 0; x <= W; x += 40) {
          const y = 52 + Math.sin(x * 0.012 + t * 1.1) * 16 + Math.cos(x * 0.02 - t * 0.7) * 8;
          gctx.lineTo(x, y);
        }
        gctx.lineTo(W, 120);
        gctx.lineTo(0, 120);
        gctx.closePath();
        const aurGrad = gctx.createLinearGradient(0, 30, 0, 120);
        aurGrad.addColorStop(0, 'rgba(46, 184, 255, 0.17)');
        aurGrad.addColorStop(0.5, 'rgba(40, 199, 111, 0.11)');
        aurGrad.addColorStop(1, 'rgba(40, 199, 111, 0)');
        gctx.fillStyle = aurGrad;
        gctx.fill();
        gctx.restore();

        /* Twinkling stars */
        bgStars.forEach((st) => {
          const alpha = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * st.speed + st.phase));
          gctx.fillStyle = `rgba(255, 250, 220, ${alpha.toFixed(2)})`;
          gctx.beginPath();
          gctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          gctx.fill();
        });

        /* Rotating background factory gears */
        gears.forEach((gr) => drawGear(gctx, gr.x, gr.y, gr.r, gr.teeth, gr.angle, gr.color));

        /* Layer B: Cliffs, Central Pillar & Launcher Platform */
        const drawCliff = (x, w) => {
          roundRectPath(gctx, x, TRACK_Y - 6, w, 92, 12);
          const cg = gctx.createLinearGradient(0, TRACK_Y - 6, 0, TRACK_Y + 86);
          cg.addColorStop(0, '#2a437e');
          cg.addColorStop(1, '#142247');
          gctx.fillStyle = cg;
          gctx.fill();
          gctx.lineWidth = 2.5;
          gctx.strokeStyle = '#5c82d6';
          gctx.stroke();

          /* Glowing top rail */
          roundRectPath(gctx, x + 2, TRACK_Y - 6, w - 4, 10, 5);
          gctx.fillStyle = '#7ba2ff';
          gctx.fill();
        };

        /* Left launcher cliff */
        drawCliff(-10, chasmStartX + 10);
        /* Right Lumi cliff */
        drawCliff(chasmEndX, W - chasmEndX + 10);
        /* Middle pillar for double-bridge Set 4 */
        if (gaps.length > 1) {
          const pX = gaps[0].x + gaps[0].width;
          drawCliff(pX, PILLAR_W);
        }

        /* Launcher Dome on Left Cliff */
        const domeX = Math.max(28, chasmStartX - 66);
        gctx.save();
        gctx.fillStyle = '#1e3366';
        gctx.strokeStyle = '#ffd23f';
        gctx.lineWidth = 2.5;
        gctx.beginPath();
        gctx.arc(domeX, TRACK_Y - 6, 22, Math.PI, 0);
        gctx.fill();
        gctx.stroke();
        gctx.restore();

        /* Layer C: Blueprint Bridge Gaps & Placed Bridge Blocks */
        gaps.forEach((g) => {
          const isSelected = g.index === activeGapIdx && phase === 'build';
          const filled = gapFilledUnits(g);
          const isComplete = filled === g.target && !g.overhang;

          /* Blueprint Hologram Slot */
          gctx.save();
          roundRectPath(gctx, g.x, g.y, g.width, BLOCK_H, 13);
          gctx.fillStyle = isComplete
            ? 'rgba(40, 199, 111, 0.18)'
            : (isSelected ? 'rgba(46, 184, 255, 0.16)' : 'rgba(255, 255, 255, 0.06)');
          gctx.fill();

          gctx.lineWidth = isSelected ? 3 : 2;
          gctx.strokeStyle = isComplete ? '#28c76f' : (isSelected ? '#5fd0f5' : 'rgba(140, 180, 255, 0.45)');
          gctx.setLineDash(isComplete ? [] : [7, 5]);
          gctx.stroke();
          gctx.setLineDash([]);

          /* Individual unit grid lines inside the gap */
          for (let u = 0; u < g.target; u += 1) {
            const ux = g.x + u * UNIT_W;
            if (u > 0) {
              gctx.strokeStyle = 'rgba(140, 180, 255, 0.22)';
              gctx.lineWidth = 1.5;
              gctx.beginPath();
              gctx.moveTo(ux, g.y + 4);
              gctx.lineTo(ux, g.y + BLOCK_H - 4);
              gctx.stroke();
            }
            /* Subtle unit number watermark in empty slots */
            if (u >= filled) {
              gctx.fillStyle = 'rgba(180, 215, 255, 0.45)';
              gctx.font = '700 14px Fredoka, sans-serif';
              gctx.textAlign = 'center';
              gctx.textBaseline = 'middle';
              gctx.fillText(String(u + 1), ux + UNIT_W / 2, g.y + BLOCK_H / 2);
            }
          }
          gctx.restore();

          /* Render blocks already inside this bridge gap */
          let bx = g.x;
          g.blocks.forEach((b) => {
            b.x = bx;
            b.y = g.y;
            drawNumberBlock(gctx, b, {
              inBridge: true,
              litUnits: Math.max(0, Math.min(b.value, g.litUnits - Math.round((bx - g.x) / UNIT_W))),
              t,
            });
            bx += b.value * UNIT_W;
          });

          /* Render Overhang Slice Preview if an oversized block is perched on this gap! */
          if (g.overhang) {
            const { block, keep, extra } = g.overhang;
            drawNumberBlock(gctx, block, {
              inBridge: false,
              overhangKeep: keep,
              t,
            });
            /* Glowing cyan Laser Cut Line + Pulsing Scissor Badge at the overhang boundary! */
            const cutX = block.x + keep * UNIT_W;
            const pulse = 1 + Math.sin(t * 8) * 0.12;
            gctx.save();
            gctx.strokeStyle = '#00e5ff';
            gctx.lineWidth = 4;
            gctx.shadowColor = '#00e5ff';
            gctx.shadowBlur = 12;
            gctx.setLineDash([6, 4]);
            gctx.beginPath();
            gctx.moveTo(cutX, block.y - 16);
            gctx.lineTo(cutX, block.y + BLOCK_H + 16);
            gctx.stroke();
            gctx.setLineDash([]);

            gctx.translate(cutX, block.y - 14);
            gctx.scale(pulse, pulse);
            gctx.fillStyle = '#00e5ff';
            gctx.beginPath();
            gctx.arc(0, 0, 16, 0, Math.PI * 2);
            gctx.fill();
            gctx.lineWidth = 2.5;
            gctx.strokeStyle = '#ffffff';
            gctx.stroke();
            gctx.fillStyle = '#041f2e';
            gctx.font = '700 15px Fredoka, sans-serif';
            gctx.textAlign = 'center';
            gctx.textBaseline = 'middle';
            gctx.fillText('✂', 0, 1);
            gctx.restore();

            /* Overhang badges: keep vs extra placed cleanly above the block */
            gctx.save();
            gctx.font = '700 14px Fredoka, sans-serif';
            gctx.textAlign = 'center';
            gctx.fillStyle = '#8df0b8';
            gctx.fillText(`✓ ${keep}`, block.x + (keep * UNIT_W) / 2, block.y - 10);
            gctx.fillStyle = '#ffb494';
            gctx.fillText(`−${extra}`, cutX + (extra * UNIT_W) / 2, block.y - 10);
            gctx.restore();
          }

          /* Target Length Pill under the gap */
          const pillW = filled > 0 && filled < g.target ? 94 : 68;
          const pillX = g.x + g.width / 2 - pillW / 2;
          const pillY = g.y + BLOCK_H + 8;
          gctx.save();
          roundRectPath(gctx, pillX, pillY, pillW, 26, 13);
          gctx.fillStyle = isComplete ? '#28c76f' : (isSelected ? '#2563eb' : '#1e2f5d');
          gctx.fill();
          gctx.lineWidth = 2;
          gctx.strokeStyle = isComplete ? '#8df0b8' : '#7ba2ff';
          gctx.stroke();
          gctx.fillStyle = '#ffffff';
          gctx.font = '700 15px Fredoka, Heebo, sans-serif';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          const pillLabel = isComplete
            ? `${g.target} ✓`
            : (filled > 0 ? `${filled} + ? = ${g.target}` : `⚡ ${g.target}`);
          gctx.fillText(pillLabel, g.x + g.width / 2, pillY + 13.5);
          gctx.restore();
        });

        /* Collectible Floating Mini-Stars above the bridge */
        collectStars.forEach((st, i) => {
          if (st.collected) return;
          const sy = st.baseY + Math.sin(t * 3.2 + i * 1.4) * 5;
          gctx.save();
          gctx.shadowColor = '#ffd23f';
          gctx.shadowBlur = 10;
          drawStarShape(gctx, st.x, sy, 12, 5, 0.48, -Math.PI / 2 + Math.sin(t * 2 + i) * 0.15);
          gctx.fillStyle = '#ffd23f';
          gctx.fill();
          gctx.lineWidth = 1.8;
          gctx.strokeStyle = '#fff9db';
          gctx.stroke();
          gctx.restore();
        });

        /* Layer D: The Golden Star Orb */
        if (!orb.done) {
          const oy = orb.y + (orb.rolling ? 0 : Math.sin(t * 4) * 3);
          gctx.save();
          gctx.translate(orb.x, oy);
          gctx.shadowColor = '#ffd23f';
          gctx.shadowBlur = 16;

          const orbGrad = gctx.createRadialGradient(-5, -6, 2, 0, 0, orb.r);
          orbGrad.addColorStop(0, '#fffbeb');
          orbGrad.addColorStop(0.55, '#ffd23f');
          orbGrad.addColorStop(1, '#e68a00');
          gctx.fillStyle = orbGrad;
          gctx.beginPath();
          gctx.arc(0, 0, orb.r, 0, Math.PI * 2);
          gctx.fill();

          gctx.rotate(orb.rot);
          drawStarShape(gctx, 0, 0, orb.r * 0.65, 5, 0.45);
          gctx.fillStyle = '#ffffff';
          gctx.fill();
          gctx.restore();
        }

        /* Layer E: Lumi the Expressive Star-Bot */
        drawLumiBot(gctx, t);

        /* Layer F: The Magnetic Workbench */
        gctx.save();
        roundRectPath(gctx, 18, BENCH_Y, W - 36, BENCH_H, 22);
        const benchGrad = gctx.createLinearGradient(0, BENCH_Y, 0, BENCH_Y + BENCH_H);
        benchGrad.addColorStop(0, 'rgba(23, 40, 84, 0.92)');
        benchGrad.addColorStop(1, 'rgba(13, 23, 52, 0.96)');
        gctx.fillStyle = benchGrad;
        gctx.fill();
        gctx.lineWidth = 2.5;
        gctx.strokeStyle = laserMode ? '#00e5ff' : '#3b5998';
        gctx.stroke();

        /* Subtle workbench grid grooves */
        gctx.strokeStyle = 'rgba(120, 165, 255, 0.08)';
        gctx.lineWidth = 1;
        for (let gx = 48; gx < W - 48; gx += UNIT_W) {
          gctx.beginPath();
          gctx.moveTo(gx, BENCH_Y + 10);
          gctx.lineTo(gx, BENCH_Y + BENCH_H - 10);
          gctx.stroke();
        }
        gctx.restore();

        /* Draw Workbench Blocks (non-dragged first, dragged block on top) */
        benchBlocks.forEach((b) => {
          if (dragState && dragState.block === b) return;
          const isFuseTarget = dragState && dragState.fuseTarget === b;
          drawNumberBlock(gctx, b, {
            inBridge: false,
            isFuseTarget,
            t,
          });
        });
        if (dragState && dragState.kind === 'block') {
          drawNumberBlock(gctx, dragState.block, {
            inBridge: false,
            isDragging: true,
            t,
          });
        }

        /* Magnetic Fusion Tether & Floating Sum Badge drawn on top of blocks */
        if (dragState && dragState.kind === 'block' && dragState.fuseTarget) {
          const a = dragState.block;
          const b = dragState.fuseTarget;
          const ax = a.x + a.w / 2;
          const ay = a.y + BLOCK_H / 2;
          const bx = b.x + b.w / 2;
          const by = b.y + BLOCK_H / 2;
          const mx = (ax + bx) / 2;
          const my = Math.min(a.y, b.y) - 18;

          gctx.save();
          gctx.strokeStyle = '#ffd23f';
          gctx.lineWidth = 5;
          gctx.shadowColor = '#ffd23f';
          gctx.shadowBlur = 14;
          gctx.setLineDash([8, 5]);
          gctx.beginPath();
          gctx.moveTo(ax, ay);
          gctx.lineTo(bx, by);
          gctx.stroke();
          gctx.setLineDash([]);

          /* Fusion sum preview badge */
          const sum = a.value + b.value;
          roundRectPath(gctx, mx - 50, my - 16, 100, 32, 16);
          gctx.fillStyle = '#ffd23f';
          gctx.fill();
          gctx.lineWidth = 2.5;
          gctx.strokeStyle = '#ffffff';
          gctx.stroke();
          gctx.shadowBlur = 0;
          gctx.fillStyle = '#0f172a';
          gctx.font = '700 17px Fredoka, sans-serif';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          gctx.fillText(`${a.value} + ${b.value} = ${sum}`, mx, my);
          gctx.restore();
        }

        /* Draw Laser Swipe Blade Trail */
        if (dragState && dragState.kind === 'laser-swipe' && dragState.points.length > 1) {
          gctx.save();
          gctx.strokeStyle = '#00e5ff';
          gctx.lineWidth = 5;
          gctx.lineCap = 'round';
          gctx.lineJoin = 'round';
          gctx.shadowColor = '#00e5ff';
          gctx.shadowBlur = 14;
          gctx.beginPath();
          dragState.points.forEach((p, idx) => {
            if (idx === 0) gctx.moveTo(p.x, p.y);
            else gctx.lineTo(p.x, p.y);
          });
          gctx.stroke();
          gctx.restore();
        }

        /* Layer G: Particles & Floating Math Callouts */
        particles.forEach((p) => {
          const alpha = Math.max(0, 1 - p.life / p.maxLife);
          gctx.save();
          gctx.globalAlpha = alpha;
          if (p.kind === 'ring') {
            gctx.strokeStyle = p.color;
            gctx.lineWidth = 3.5;
            gctx.beginPath();
            gctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            gctx.stroke();
          } else if (p.kind === 'star') {
            gctx.translate(p.x, p.y);
            gctx.rotate(p.rot);
            drawStarShape(gctx, 0, 0, p.r, 5, 0.45);
            gctx.fillStyle = p.color;
            gctx.fill();
          } else if (p.kind === 'heart') {
            gctx.fillStyle = p.color;
            gctx.font = '700 18px Fredoka, sans-serif';
            gctx.fillText('♥', p.x, p.y);
          } else {
            gctx.fillStyle = p.color;
            gctx.beginPath();
            gctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            gctx.fill();
          }
          gctx.restore();
        });

        floatTexts.forEach((ft) => {
          const alpha = Math.max(0, 1 - ft.life / ft.maxLife);
          gctx.save();
          gctx.globalAlpha = alpha;
          gctx.font = '700 22px Fredoka, Heebo, sans-serif';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          gctx.lineWidth = 4;
          gctx.strokeStyle = '#091128';
          gctx.strokeText(ft.str, ft.x, ft.y);
          gctx.fillStyle = ft.color;
          gctx.fillText(ft.str, ft.x, ft.y);
          gctx.restore();
        });

        gctx.restore();
        rafId = requestAnimationFrame(frame);
      }

      /* Draws a tactile segmented number block with star-pips, numeral badge, and laser seams. */
      function drawNumberBlock(gctx, b, opts = {}) {
        const {
          inBridge = false,
          isDragging = false,
          isFuseTarget = false,
          litUnits = 0,
          overhangKeep = 0,
          t = 0,
        } = opts;
        const col = BLOCK_COLORS[b.value] || BLOCK_COLORS[5];
        const w = b.value * UNIT_W;
        const h = BLOCK_H;

        gctx.save();
        gctx.translate(b.x + w / 2, b.y + h / 2);
        if (b.tilt) gctx.rotate(b.tilt);
        const pulse = isFuseTarget ? 1.07 + Math.sin(t * 10) * 0.03 : 1;
        gctx.scale(b.scaleX * pulse, b.scaleY * pulse);
        gctx.translate(-w / 2, -h / 2);

        /* Drop shadow */
        roundRectPath(gctx, 0, isDragging ? 11 : 5, w, h, 13);
        gctx.fillStyle = isDragging ? 'rgba(0, 0, 0, 0.42)' : col.edge;
        gctx.fill();

        /* Main block body */
        roundRectPath(gctx, 0, 0, w, h, 13);
        gctx.fillStyle = col.fill;
        gctx.fill();

        /* If in overhang preview, shade the extra overhanging units in warm orange! */
        if (overhangKeep > 0 && overhangKeep < b.value) {
          const cutPx = overhangKeep * UNIT_W;
          gctx.save();
          roundRectPath(gctx, 0, 0, w, h, 13);
          gctx.clip();
          gctx.fillStyle = 'rgba(232, 98, 28, 0.85)';
          gctx.fillRect(cutPx, 0, w - cutPx, h);
          gctx.restore();
        }

        /* Golden illumination as the Star Orb rolls over each unit! */
        if (litUnits > 0) {
          gctx.save();
          roundRectPath(gctx, 0, 0, w, h, 13);
          gctx.clip();
          gctx.fillStyle = 'rgba(255, 230, 100, 0.45)';
          gctx.fillRect(0, 0, Math.min(w, litUnits * UNIT_W), h);
          gctx.restore();
        }

        /* Top glossy highlight */
        roundRectPath(gctx, 4, 3, w - 8, h * 0.36, 9);
        gctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        gctx.fill();

        /* Outer crisp border */
        roundRectPath(gctx, 0, 0, w, h, 13);
        gctx.lineWidth = isFuseTarget ? 3.5 : 2.5;
        gctx.strokeStyle = isFuseTarget ? '#ffd23f' : 'rgba(255, 255, 255, 0.88)';
        gctx.stroke();

        /* Unit segments, star-pips & internal laser cut seams */
        for (let u = 0; u < b.value; u += 1) {
          const ux = u * UNIT_W;
          /* Star pip in upper corner of each unit segment */
          gctx.fillStyle = u < litUnits ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
          gctx.beginPath();
          gctx.arc(ux + UNIT_W / 2, 13, 3.6, 0, Math.PI * 2);
          gctx.fill();

          if (u > 0) {
            const isHoveredSeam = b.hoverSeam === u;
            const showLaserSeam = !inBridge && (laserMode || set.mode === 'slice' || set.mode === 'master' || isHoveredSeam);
            gctx.strokeStyle = showLaserSeam ? '#7ef9ff' : 'rgba(0, 0, 0, 0.22)';
            gctx.lineWidth = showLaserSeam ? 2.4 : 1.5;
            if (showLaserSeam) gctx.setLineDash([4, 3]);
            gctx.beginPath();
            gctx.moveTo(ux, 3);
            gctx.lineTo(ux, h - 3);
            gctx.stroke();
            gctx.setLineDash([]);

            /* Interactive Laser Scissor Node on the seam */
            if (!inBridge) {
              const nodeR = isHoveredSeam ? 9.5 : (showLaserSeam ? 7.5 : 5);
              gctx.fillStyle = showLaserSeam ? '#00e5ff' : 'rgba(255, 255, 255, 0.65)';
              gctx.beginPath();
              gctx.arc(ux, 4, nodeR, 0, Math.PI * 2);
              gctx.fill();
              if (isHoveredSeam) {
                /* Live split tooltip above the hovered seam */
                roundRectPath(gctx, ux - 28, -28, 56, 22, 8);
                gctx.fillStyle = '#00e5ff';
                gctx.fill();
                gctx.fillStyle = '#041f2e';
                gctx.font = '700 13px Fredoka, sans-serif';
                gctx.textAlign = 'center';
                gctx.textBaseline = 'middle';
                gctx.fillText(`${u} | ${b.value - u}`, ux, -17);
              }
            }
          }
        }

        /* Bold centered Numeral Badge */
        const badgeW = b.value >= 10 ? 38 : 30;
        roundRectPath(gctx, w / 2 - badgeW / 2, h / 2 - 11, badgeW, 26, 9);
        gctx.fillStyle = 'rgba(15, 23, 42, 0.36)';
        gctx.fill();

        gctx.fillStyle = '#ffffff';
        gctx.font = '700 22px Fredoka, Heebo, sans-serif';
        gctx.textAlign = 'center';
        gctx.textBaseline = 'middle';
        gctx.fillText(String(b.value), w / 2, h / 2 + 3);

        gctx.restore();
      }

      /* Draws Lumi the Star-Bot with real-time pointer/orb eye tracking. */
      function drawLumiBot(gctx, t) {
        const bob = Math.sin(t * 3.4) * 3.5;
        const lx = lumi.x;
        const ly = lumi.y + bob + lumi.jumpY;

        /* Hover shadow on the right cliff */
        gctx.save();
        gctx.fillStyle = 'rgba(9, 17, 40, 0.45)';
        gctx.beginPath();
        gctx.ellipse(lx, TRACK_Y - 4, Math.max(10, 22 - Math.abs(lumi.jumpY) * 0.15), 5, 0, 0, Math.PI * 2);
        gctx.fill();
        gctx.restore();

        gctx.save();
        gctx.translate(lx, ly);
        gctx.scale(lumi.scaleX, lumi.scaleY);

        /* Antenna with glowing star tip */
        const antSway = Math.sin(t * 4.5) * 3;
        gctx.strokeStyle = '#5fd0f5';
        gctx.lineWidth = 3;
        gctx.lineCap = 'round';
        gctx.beginPath();
        gctx.moveTo(0, -24);
        gctx.quadraticCurveTo(antSway, -32, antSway * 1.4, -38);
        gctx.stroke();

        gctx.fillStyle = '#ffd23f';
        gctx.shadowColor = '#ffd23f';
        gctx.shadowBlur = 10;
        gctx.beginPath();
        gctx.arc(antSway * 1.4, -40, 5, 0, Math.PI * 2);
        gctx.fill();
        gctx.shadowBlur = 0;

        /* Rounded Pearlescent Body */
        roundRectPath(gctx, -22, -24, 44, 50, 18);
        const bodyGrad = gctx.createLinearGradient(-22, -24, 22, 26);
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.65, '#d8e8ff');
        bodyGrad.addColorStop(1, '#9abcf5');
        gctx.fillStyle = bodyGrad;
        gctx.fill();
        gctx.lineWidth = 2.5;
        gctx.strokeStyle = '#5fd0f5';
        gctx.stroke();

        /* Glowing Star Core on Chest */
        drawStarShape(gctx, 0, 12, 7.5 + Math.sin(t * 5) * 0.8, 5, 0.48);
        gctx.fillStyle = '#ffd23f';
        gctx.fill();

        /* Face Visor */
        roundRectPath(gctx, -16, -16, 32, 17, 7);
        gctx.fillStyle = '#101d42';
        gctx.fill();

        /* Expressive Eyes (track pointer or rolling Star Orb!) */
        const lookTarget = (phase === 'rolling' || phase === 'celebrate')
          ? { x: orb.x, y: orb.y }
          : (dragState && dragState.kind === 'block'
            ? { x: dragState.block.x + dragState.block.w / 2, y: dragState.block.y }
            : pointer);
        const ang = Math.atan2(lookTarget.y - ly, lookTarget.x - lx);
        const px = Math.cos(ang) * 2.4;
        const py = Math.sin(ang) * 1.8;
        const isBlinking = (t % 3.8) > 3.66;

        if (lumi.happyTimer > 0) {
          /* Happy ^ ^ smiling eyes */
          gctx.strokeStyle = '#5fd0f5';
          gctx.lineWidth = 2.6;
          gctx.lineCap = 'round';
          [-7, 7].forEach((ex) => {
            gctx.beginPath();
            gctx.arc(ex, -6, 4.2, Math.PI * 1.15, Math.PI * 1.85);
            gctx.stroke();
          });
        } else if (isBlinking) {
          gctx.strokeStyle = '#5fd0f5';
          gctx.lineWidth = 2.2;
          [-7, 7].forEach((ex) => {
            gctx.beginPath();
            gctx.moveTo(ex - 4, -7.5);
            gctx.lineTo(ex + 4, -7.5);
            gctx.stroke();
          });
        } else {
          [-7, 7].forEach((ex) => {
            gctx.fillStyle = '#5fd0f5';
            gctx.beginPath();
            gctx.arc(ex + px, -7.5 + py, 3.8, 0, Math.PI * 2);
            gctx.fill();
            gctx.fillStyle = '#ffffff';
            gctx.beginPath();
            gctx.arc(ex + px - 1.1, -8.8 + py, 1.3, 0, Math.PI * 2);
            gctx.fill();
          });
        }

        /* Floating Robot Hands */
        const handWave = lumi.happyTimer > 0 ? -14 - Math.abs(Math.sin(t * 12)) * 8 : Math.sin(t * 3.4) * 3;
        gctx.fillStyle = '#e5f0ff';
        gctx.strokeStyle = '#5fd0f5';
        gctx.lineWidth = 2;
        [-28, 28].forEach((hx) => {
          gctx.beginPath();
          gctx.arc(hx, 2 + handWave, 5.5, 0, Math.PI * 2);
          gctx.fill();
          gctx.stroke();
        });

        /* Speech / Emotion Bubble */
        if (lumi.speechTimer > 0 && lumi.speech) {
          gctx.font = '700 13px Fredoka, Heebo, sans-serif';
          const tw = Math.max(44, gctx.measureText(lumi.speech).width + 18);
          roundRectPath(gctx, -tw / 2, -68, tw, 24, 12);
          gctx.fillStyle = '#ffffff';
          gctx.fill();
          gctx.lineWidth = 2;
          gctx.strokeStyle = '#5fd0f5';
          gctx.stroke();
          gctx.fillStyle = '#0f172a';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          gctx.fillText(lumi.speech, 0, -56);
        }

        gctx.restore();
      }

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(frame);
      return undefined;
    }

    startRound();
  }

  function unmount() {
    cancelAnimationFrame(rafId);
    if (activeCleanup) {
      activeCleanup();
      activeCleanup = null;
    }
    clock.clear();
    EDVoice.stop();
    EDSound.hush();
  }

  EDGames.register('star-factory', { sets: SETS, mount, unmount });
})();
