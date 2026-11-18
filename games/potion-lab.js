/* מעבדת השיקויים של מוקו / Moko's Magic Potion Lab — 60fps fluid wave physics,
   tactile pouring, fruit slicing (multiplication/equal groups), subtraction drain,
   and monster transformations (ages 4–8).

   Inside a cozy moonlit alchemist's treehouse workshop:
   - UPPER APOTHECARY SHELF: Ornate crystal potion flasks (+1 Ruby, +2 Emerald,
     +3 Sapphire, +5 Gold). Drag a flask over the cauldron (or tap it) to uncork,
     tilt, and pour a real gravity-simulated stream of glowing liquid droplets!
   - GRADUATED GLASS CAULDRON (40-Node Shallow-Water Wave Engine): Every droplet
     and sliced fruit splashes the coupled wave surface, blends the potion's RGB
     colour in real time, and raises the meniscus along the illuminated 0..10
     graduated number scale.
   - BRASS DRAIN SPIGOT (-1 / -2): Poured too much, or solving an Exact Alchemy
     compensation puzzle (like 5 + 3 - 1 = 7)? Open the brass drain valve on the
     left of the cauldron to drain liquid into the catch-beaker!
   - OAK CHOPPING BOARD (Equal Groups & Multiplication): Swipe or tap whole
     Star-Berries (x2 halves) and Moon-Apples (x3 wedges) with the enchanted
     cleaver; the slices leap into the cauldron and bob on the waves with real
     buoyancy physics!
   - MOKO THE ALCHEMY MONSTER: Tracks your hands with big glossy eyes, points to
     the drain tap if you overfill, opens wide ("AAAH!") when the recipe is ready,
     gulps down the glowing potion mug, and transforms into 5 magical forms
     (Fairy Wings, Star King, Rainbow Shimmer, Anti-Gravity Bubble, Star Dragon)!

   Sets: Measure & Pour (volume & addition), Slice & Multiply (equal groups x2/x3),
   Exact Alchemy (addition + subtraction compensation), Master Alchemist (both
   volume and sliced ingredients). */

(function () {
  const SETS = [
    { id: 'pour', emoji: '🧪', label: { he: 'מודדים שיקוי', en: 'Measure & Pour' }, mode: 'pour' },
    { id: 'slice', emoji: '🍓', label: { he: 'חותכים מרכיבים', en: 'Slice & Multiply' }, mode: 'slice' },
    { id: 'exact', emoji: '⚖️', label: { he: 'מתכון מדויק', en: 'Exact Alchemy' }, mode: 'exact' },
    { id: 'master', emoji: '👑', label: { he: 'שיקוי המאסטר', en: 'Master Alchemist' }, mode: 'master' },
  ];

  const TEXT = {
    he: {
      askPour: (v) => `מזגו שיקוי לקדרה בדיוק עד קו ${v}`,
      askSlice: (v, s) => `מזגו שיקוי עד ${v} וחתכו ${s} פרוסות פרי על הקרש`,
      askExact: (v) => `אלכימיה מדויקת: הגיעו לקו ${v} בעזרת הבקבוקים וברז הריקון`,
      askMaster: (v, s) => `מתכון המאסטר למוקו: קו שיקוי ${v} ו-${s} פרוסות פרי`,
      hintPour: 'גוררים או לוחצים על בקבוק שיקוי כדי למזוג לקדרה. אם מזגתם יותר מדי — פותחים את הברז (−1)',
      hintSlice: 'לוחצים או מחליקים על הפרי שעל קרש החיתוך 🔪 כדי לחתוך אותו לפרוסות קופצות!',
      hintHigh: 'מפלס השיקוי גבוה מהקו! לחצו על ברז הנחושת משמאל לקדרה כדי לרוקן',
      hintFeed: 'השיקוי מוכן! גררו או לחצו על ספל הזהב 🍵 כדי להשקות את מוקו!',
      feedLabel: '🍵 השקו את מוקו!',
      drainLabel: 'ברז ריקון',
      emptyBtn: '↺ איפוס קדרה',
      boardLabel: 'קרש חיתוך קסום',
      scoopLabel: '🥄 הוצא פרוסה (−1)',
      flaskAria: (n) => `בקבוק שיקוי פלוס ${n}`,
      drainAria: (n) => `ברז ריקון מינוס ${n}`,
      fruitAria: (name, mult) => `חיתוך ${name} ל-${mult} פרוסות`,
      feedAria: 'השקו את מוקו בשיקוי המוכן',
      transforms: [
        { id: 'wings', icon: '🦋', name: 'כנפי פיה!' },
        { id: 'crown', icon: '👑', name: 'מלך הכוכבים!' },
        { id: 'rainbow', icon: '🌈', name: 'פרוות קשת!' },
        { id: 'bubble', icon: '🫧', name: 'בועת ריחוף!' },
        { id: 'dragon', icon: '🐉', name: 'דרקון כוכבים!' },
      ],
      mokoChats: ['מממ... טעים!', 'עוד שיקוי! ★', 'זה מבעבע! 🫧', 'איזה ריח קסום!'],
      berry: 'פטל כוכבים',
      apple: 'תפוח ירח',
    },
    en: {
      askPour: (v) => `Pour potion into the cauldron right up to line ${v}`,
      askSlice: (v, s) => `Fill potion to ${v} and slice ${s} fruit pieces on the board`,
      askExact: (v) => `Exact Alchemy: reach line ${v} using the flasks and the drain tap`,
      askMaster: (v, s) => `Master Recipe for Moko: potion line ${v} and ${s} fruit slices`,
      hintPour: 'Drag or tap a crystal flask to pour into the cauldron. If you overfill, open the brass drain tap (−1)',
      hintSlice: 'Tap or swipe across a magic fruit on the chopping board 🔪 to slice it into jumping pieces!',
      hintHigh: 'The potion is above the target line! Tap the brass drain tap on the left of the cauldron',
      hintFeed: 'The potion is ready! Drag or tap the Golden Mug 🍵 to feed Moko!',
      feedLabel: '🍵 Feed Moko!',
      drainLabel: 'Drain Tap',
      emptyBtn: '↺ Reset Cauldron',
      boardLabel: 'Magic Chopping Board',
      scoopLabel: '🥄 Scoop 1 out (−1)',
      flaskAria: (n) => `Potion flask plus ${n}`,
      drainAria: (n) => `Drain tap minus ${n}`,
      fruitAria: (name, mult) => `Slice ${name} into ${mult} pieces`,
      feedAria: 'Feed the finished potion to Moko',
      transforms: [
        { id: 'wings', icon: '🦋', name: 'Fairy Wings!' },
        { id: 'crown', icon: '👑', name: 'Star King!' },
        { id: 'rainbow', icon: '🌈', name: 'Rainbow Coat!' },
        { id: 'bubble', icon: '🫧', name: 'Levitation Bubble!' },
        { id: 'dragon', icon: '🐉', name: 'Star Dragon!' },
      ],
      mokoChats: ['Yum yum!', 'More potion! ★', 'So bubbly! 🫧', 'Smells magical!'],
      berry: 'Star-Berry',
      apple: 'Moon-Apple',
    },
  };

  /* Crystal Flask Visual Definitions */
  const FLASK_STYLES = {
    1: { shape: 'round', r: 255, g: 59, b: 107, hex: '#ff3b6b', rim: '#ff9ebb' },
    2: { shape: 'cone', r: 16, g: 185, b: 129, hex: '#10b981', rim: '#6ee7b7' },
    3: { shape: 'diamond', r: 59, g: 130, b: 246, hex: '#3b82f6', rim: '#93c5fd' },
    4: { shape: 'round', r: 168, g: 85, b: 247, hex: '#a855f7', rim: '#d8b4fe' },
    5: { shape: 'amphora', r: 245, g: 158, b: 11, hex: '#f59e0b', rim: '#fde68a' },
  };

  /* Progressive Handcrafted Recipes per Set (5 rounds each). */
  const RECIPES = {
    pour: [
      { startVol: 0, targetVol: 4, flasks: [1, 2], drains: [1], targetSlices: 0, fruits: [2] },
      { startVol: 0, targetVol: 6, flasks: [1, 2, 3], drains: [1], targetSlices: 0, fruits: [2] },
      { startVol: 0, targetVol: 7, flasks: [2, 3, 5], drains: [1], targetSlices: 0, fruits: [2] },
      { startVol: 0, targetVol: 8, flasks: [1, 3, 5], drains: [1], targetSlices: 0, fruits: [2] },
      { startVol: 0, targetVol: 10, flasks: [2, 3, 5], drains: [1], targetSlices: 0, fruits: [2] },
    ],
    slice: [
      { startVol: 4, targetVol: 4, flasks: [1, 2], drains: [1], targetSlices: 4, fruits: [2] },
      { startVol: 3, targetVol: 5, flasks: [2], drains: [1], targetSlices: 6, fruits: [2, 3] },
      { startVol: 6, targetVol: 6, flasks: [2, 3], drains: [1], targetSlices: 6, fruits: [3] },
      { startVol: 4, targetVol: 7, flasks: [3], drains: [1], targetSlices: 8, fruits: [2, 3] },
      { startVol: 5, targetVol: 8, flasks: [3], drains: [1], targetSlices: 9, fruits: [3, 2] },
    ],
    exact: [
      /* Start overfilled at 7, drain down to 5! */
      { startVol: 7, targetVol: 5, flasks: [2, 3], drains: [1, 2], targetSlices: 0, fruits: [2] },
      /* Target 4 using +5 and -1 (5 - 1 = 4)! */
      { startVol: 0, targetVol: 4, flasks: [3, 5], drains: [1], targetSlices: 0, fruits: [2] },
      /* Target 7 using +5, +3, and -1 (5 + 3 - 1 = 7)! */
      { startVol: 0, targetVol: 7, flasks: [3, 5], drains: [1], targetSlices: 0, fruits: [2] },
      /* Start at 9, target 6 using -2 and -1 (9 - 2 - 1 = 6)! */
      { startVol: 9, targetVol: 6, flasks: [2, 5], drains: [1, 2], targetSlices: 0, fruits: [2] },
      /* Target 9 using +5, +5, and -1 (5 + 5 - 1 = 9)! */
      { startVol: 0, targetVol: 9, flasks: [5, 2], drains: [1], targetSlices: 0, fruits: [2] },
    ],
    master: [
      { startVol: 0, targetVol: 5, flasks: [2, 3], drains: [1], targetSlices: 4, fruits: [2] },
      { startVol: 0, targetVol: 6, flasks: [2, 5], drains: [1], targetSlices: 6, fruits: [3, 2] },
      { startVol: 0, targetVol: 7, flasks: [3, 5], drains: [1], targetSlices: 6, fruits: [2, 3] },
      { startVol: 2, targetVol: 8, flasks: [3, 5], drains: [1, 2], targetSlices: 8, fruits: [2, 3] },
      { startVol: 0, targetVol: 9, flasks: [5, 3], drains: [1], targetSlices: 9, fruits: [3, 2] },
    ],
  };

  const ROUNDS = 5;
  const MAX_VOL = 10;
  const PENTA = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0, 880.0, 1046.5];

  const CSS = `
    .pl { gap: 8px; max-width: 920px; margin: 0 auto; user-select: none; width: 100%; }
    .pl-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; width: 100%; padding: 0 4px; }
    .pl-badges { display: inline-flex; align-items: center; gap: 6px; background: #1e1633; padding: 4px 10px; border-radius: 999px;
      border: 2px solid #4c3575; box-shadow: 0 3px 0 #120c21; }
    .pl-badge-slot { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.08);
      display: grid; place-items: center; font-size: 1.05rem; transition: transform .25s; }
    .pl-badge-slot.earned { background: radial-gradient(circle, #fde68a, #f59e0b); transform: scale(1.1); box-shadow: 0 0 8px rgba(245,158,11,.6); }
    .pl-stage-wrap { position: relative; width: 100%; border-radius: 26px; overflow: hidden;
      background: #171128; border: 3.5px solid #4c3575; box-shadow: 0 9px 0 var(--edge), 0 18px 36px rgba(15, 10, 30, .34); direction: ltr; }
    .pl-canvas { display: block; width: 100%; height: auto; aspect-ratio: 900 / 520; touch-action: none; cursor: pointer; }
    .pl-hotspots { position: absolute; inset: 0; pointer-events: none; }
    .pl-hotspot { position: absolute; appearance: none; background: transparent; border: 2px solid transparent;
      border-radius: 14px; padding: 0; margin: 0; opacity: 0; pointer-events: none; cursor: pointer; }
    .pl-hotspot:focus-visible { opacity: 1; border-color: #fde68a; box-shadow: 0 0 0 4px rgba(245, 158, 11, .45); outline: none; }
    .pl-hint { margin: 2px 0 0; color: var(--text-soft); font-size: .95rem; text-align: center; min-height: 1.4em; }
  `;

  const clock = EDKit.timers();
  let rafId = 0;
  let activeCleanup = null;

  /* ---- Rich Procedural WebAudio Sound Effects ---- */
  function sfxCorkPop() {
    EDSound.note([240, 620], { seconds: 0.08, wave: 'sine', gain: 0.18 });
  }
  function sfxSplash(vol) {
    const f = PENTA[Math.max(0, Math.min(vol, PENTA.length - 1))];
    EDSound.note([f * 0.85, f * 1.15, f], { seconds: 0.22, wave: 'triangle', gain: 0.2 });
  }
  function sfxDrain(vol) {
    const f = PENTA[Math.max(0, Math.min(vol, PENTA.length - 1))];
    EDSound.note([f * 1.18, f * 0.88], { seconds: 0.2, wave: 'sine', gain: 0.18 });
  }
  function sfxSliceFruit() {
    EDSound.note([880, 1420, 640], { seconds: 0.14, wave: 'sawtooth', gain: 0.11 });
    EDSound.note(1046.5, { seconds: 0.16, wave: 'triangle', gain: 0.15, delay: 0.04 });
  }
  function sfxRecipeReady() {
    [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => {
      EDSound.note(n, { seconds: 0.3, wave: 'triangle', gain: 0.18, delay: i * 0.065 });
    });
  }
  function sfxGulp(i) {
    EDSound.note([280 + i * 65, 460 + i * 75], { seconds: 0.14, wave: 'sine', gain: 0.2 });
  }
  function sfxTransform() {
    [587.3, 740.0, 880.0, 1174.7, 1480.0].forEach((n, i) => {
      EDSound.note(n, { seconds: 0.34, wave: 'sine', gain: 0.17, delay: i * 0.055 });
    });
  }
  function sfxMokoGiggle() {
    EDSound.note(EDSound.wobble(620, 130, 3), { seconds: 0.26, wave: 'sine', gain: 0.17 });
  }

  /* ---- Canvas Drawing Helpers ---- */
  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawStar(ctx, cx, cy, r, pts = 5, inner = 0.46, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i += 1) {
      const a = rot + (i * Math.PI) / pts;
      const rad = i % 2 === 0 ? r : r * inner;
      const px = cx + Math.cos(a) * rad;
      const py = cy + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('pl-style', CSS);

    const W = 900;
    const H = 520;
    const TABLE_Y = 418;
    const CAUL_CX = 436;
    const CAUL_CY = 304;
    const CAUL_R = 104;
    const CAUL_TOP_Y = CAUL_CY - 82;
    const CAUL_BOT_Y = CAUL_CY + 90;

    let round = 0;
    const earnedBadges = [];

    const wrap = document.createElement('div');
    wrap.className = 'kit pl';
    root.append(wrap);

    /* Pendulum lantern state on top right of workshop. */
    const lantern = { x: 822, y: 12, angle: 0.14, vel: 0 };
    const pointer = { x: W / 2, y: H / 2 };

    /* 40-node Coupled Shallow-Water Wave Surface Solver for the Cauldron. */
    const WAVE_N = 40;
    const waveH = new Float32Array(WAVE_N);
    const waveV = new Float32Array(WAVE_N);

    function splashWave(normX, impulse = 18) {
      const centerIdx = Math.max(2, Math.min(WAVE_N - 3, Math.round(normX * (WAVE_N - 1))));
      for (let i = -3; i <= 3; i += 1) {
        const idx = centerIdx + i;
        if (idx > 0 && idx < WAVE_N - 1) {
          waveV[idx] += impulse * Math.cos((i / 4) * (Math.PI / 2));
        }
      }
    }

    function stepWavePhysics(dt) {
      const k = 150; // spring restoring stiffness
      const damp = 4.2; // wave damping
      const spread = 180; // neighbor wave propagation speed
      for (let i = 1; i < WAVE_N - 1; i += 1) {
        const acc = -k * waveH[i] - damp * waveV[i] + spread * (waveH[i - 1] + waveH[i + 1] - 2 * waveH[i]);
        waveV[i] += acc * dt;
      }
      for (let i = 1; i < WAVE_N - 1; i += 1) {
        waveH[i] += waveV[i] * dt;
        waveH[i] = Math.max(-16, Math.min(16, waveH[i]));
      }
      waveH[0] = waveH[1] * 0.5;
      waveH[WAVE_N - 1] = waveH[WAVE_N - 2] * 0.5;
    }

    /* Rising cauldron bubbles. */
    const bubbles = Array.from({ length: 18 }, (_, i) => ({
      xOff: ((i * 37) % 140) - 70,
      yProg: (i * 0.19) % 1,
      r: 2.5 + (i % 4) * 1.4,
      speed: 0.32 + (i % 5) * 0.08,
      phase: i * 1.3,
    }));

    /* Moko the Alchemy Monster character state. */
    const moko = {
      x: 736,
      y: 326,
      scaleX: 1,
      scaleY: 1,
      jumpY: 0,
      vy: 0,
      mouthOpen: 0,
      targetMouth: 0,
      happyTimer: 0,
      gulpTimer: 0,
      transformId: '',
      speech: '',
      speechTimer: 0,
    };

    let particles = [];
    let floatTexts = [];
    let streamDrops = [];

    function spawnParticles(x, y, count, opts = {}) {
      const {
        colors = ['#fde68a', '#34d399', '#ff5d8f', '#60a5fa', '#ffffff'],
        kind = 'spark',
        speed = 165,
        gravity = 230,
      } = opts;
      for (let i = 0; i < count; i += 1) {
        const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const sp = speed * (0.4 + Math.random() * 0.8);
        particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 45,
          r: kind === 'star' ? 6 + Math.random() * 5 : 3 + Math.random() * 3.5,
          color: colors[i % colors.length],
          kind,
          gravity,
          life: 0,
          maxLife: 0.6 + Math.random() * 0.45,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 7,
        });
      }
    }

    function spawnFloatText(x, y, str, color = '#fde68a') {
      floatTexts.push({ x, y, str, color, life: 0, maxLife: 1.2 });
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

      const recipeList = RECIPES[set.mode] || RECIPES.pour;
      const spec = recipeList[round % recipeList.length];
      const needsSlices = spec.targetSlices > 0;
      const roundTransform = text.transforms[round % text.transforms.length];

      let logicalVol = spec.startVol;
      let displayVol = spec.startVol;
      let logicalSlices = 0;
      let historyTerms = spec.startVol > 0 ? [`${spec.startVol}`] : [];
      let phase = 'brew'; // 'brew' | 'ready' | 'drinking' | 'transformed'

      /* Current blended liquid RGB colour inside the cauldron. */
      const liquidColor = spec.startVol > 0
        ? { r: 139, g: 92, b: 246 }
        : { r: 56, g: 189, b: 248 };

      moko.transformId = '';
      moko.happyTimer = 0;
      moko.gulpTimer = 0;
      moko.targetMouth = 0;
      streamDrops = [];

      /* Floating fruit slices bobbing inside the cauldron. */
      let floatingSlices = [];
      let sliceSeq = 1;

      /* Build Crystal Potion Flasks on the Upper Apothecary Shelf. */
      const shelfY = 136;
      const flaskCount = spec.flasks.length;
      const flaskSpacing = flaskCount <= 2 ? 116 : 96;
      const flaskStartX = CAUL_CX - ((flaskCount - 1) * flaskSpacing) / 2;
      const flasks = spec.flasks.map((addVal, idx) => {
        const st = FLASK_STYLES[addVal] || FLASK_STYLES[2];
        const homeX = flaskStartX + idx * flaskSpacing;
        const homeY = shelfY - 30;
        return {
          id: `flask-${idx}-${addVal}`,
          addVal,
          style: st,
          homeX,
          homeY,
          x: homeX,
          y: homeY,
          tilt: 0,
          scale: 1,
          pouringTimer: 0,
        };
      });

      /* Build Brass Drain Spigots on the lower-left of the cauldron. */
      const drains = spec.drains.map((subVal, idx) => ({
        id: `drain-${subVal}`,
        subVal,
        x: CAUL_CX - CAUL_R - 36,
        y: CAUL_CY + 14 + idx * 46,
        openTimer: 0,
      }));

      /* Build Whole Magical Fruits on the Oak Chopping Board (left counter). */
      const boardX = 138;
      const boardY = 366;
      const boardFruits = spec.fruits.map((mult, idx) => ({
        id: `fruit-${mult}`,
        mult,
        kind: mult === 3 ? 'apple' : 'berry',
        name: mult === 3 ? text.apple : text.berry,
        x: boardX + (spec.fruits.length > 1 ? (idx === 0 ? -36 : 38) : 0),
        y: boardY - 12,
        slashTimer: 0,
        scale: 1,
      }));

      /* Golden Serve Mug that rises when the recipe is complete! */
      const serveMug = {
        x: CAUL_CX + 128,
        y: CAUL_CY - 22,
        homeX: CAUL_CX + 128,
        homeY: CAUL_CY - 22,
        active: false,
        scale: 0,
      };

      const titleLine = set.mode === 'slice'
        ? text.askSlice(spec.targetVol, spec.targetSlices)
        : (set.mode === 'exact'
          ? text.askExact(spec.targetVol)
          : (set.mode === 'master'
            ? text.askMaster(spec.targetVol, spec.targetSlices)
            : text.askPour(spec.targetVol)));

      const initialHint = (set.mode === 'slice' || set.mode === 'master')
        ? text.hintSlice
        : text.hintPour;

      const badgesHtml = Array.from({ length: ROUNDS }, (_, i) => {
        const b = earnedBadges[i];
        return `<span class="pl-badge-slot ${b ? 'earned' : ''}" aria-hidden="true">${b || '⭐'}</span>`;
      }).join('');

      wrap.innerHTML = `
        <div class="pl-header">
          ${EDKit.dots(ROUNDS, round)}
          ${EDKit.head(titleLine, lang)}
          <div class="pl-badges" aria-hidden="true">${badgesHtml}</div>
        </div>
        <div class="pl-stage-wrap">
          <canvas class="pl-canvas" width="${W}" height="${H}"></canvas>
          <div class="pl-hotspots" data-hotspots></div>
        </div>
        <p class="pl-hint" data-hint aria-live="polite">${initialHint}</p>`;

      const canvas = wrap.querySelector('.pl-canvas');
      const hotspotsEl = wrap.querySelector('[data-hotspots]');
      const hintEl = wrap.querySelector('[data-hint]');

      /* Voice prompt for the round. */
      const voiceItems = set.mode === 'slice'
        ? ['pl-slice']
        : (set.mode === 'exact'
          ? ['pl-exact', EDVoiceLines.num(spec.targetVol)]
          : (set.mode === 'master'
            ? ['pl-master']
            : ['pl-pour', EDVoiceLines.num(spec.targetVol)]));
      EDKit.voice(wrap, voiceItems, lang);

      function isRecipeComplete() {
        const volOk = logicalVol === spec.targetVol;
        const slicesOk = !needsSlices || logicalSlices === spec.targetSlices;
        return volOk && slicesOk;
      }

      function buildEquationText() {
        const volExpr = historyTerms.length > 0
          ? `${historyTerms.join(' ')} = ${logicalVol}`
          : `${logicalVol} / ${spec.targetVol}`;
        if (!needsSlices) {
          return `${volExpr}   (🎯 ${spec.targetVol})`;
        }
        return `🧪 ${logicalVol}/${spec.targetVol}   |   🍓 ${logicalSlices}/${spec.targetSlices}`;
      }

      /* Sync semantic overlay buttons over interactive canvas objects for keyboard & test accessibility. */
      function syncHotspots() {
        const pctX = (x) => `${((x / W) * 100).toFixed(2)}%`;
        const pctY = (y) => `${((y / H) * 100).toFixed(2)}%`;
        const pctW = (w) => `${((w / W) * 100).toFixed(2)}%`;
        const pctH = (h) => `${((h / H) * 100).toFixed(2)}%`;

        const btns = [];
        flasks.forEach((f) => {
          btns.push(`<button type="button" class="pl-hotspot" data-action="flask" data-val="${f.addVal}"
            aria-label="${text.flaskAria(f.addVal)}"
            style="left:${pctX(f.homeX - 32)};top:${pctY(f.homeY - 36)};width:${pctW(64)};height:${pctH(74)}"></button>`);
        });
        drains.forEach((d) => {
          btns.push(`<button type="button" class="pl-hotspot" data-action="drain" data-val="${d.subVal}"
            aria-label="${text.drainAria(d.subVal)}"
            style="left:${pctX(d.x - 32)};top:${pctY(d.y - 20)};width:${pctW(64)};height:${pctH(40)}"></button>`);
        });
        boardFruits.forEach((bf) => {
          btns.push(`<button type="button" class="pl-hotspot" data-action="fruit" data-mult="${bf.mult}"
            aria-label="${text.fruitAria(bf.name, bf.mult)}"
            style="left:${pctX(bf.x - 34)};top:${pctY(bf.y - 30)};width:${pctW(68)};height:${pctH(64)}"></button>`);
        });
        if (logicalSlices > 0) {
          btns.push(`<button type="button" class="pl-hotspot" data-action="scoop"
            aria-label="${text.scoopLabel}"
            style="left:${pctX(boardX - 55)};top:${pctY(boardY - 76)};width:${pctW(110)};height:${pctH(32)}"></button>`);
        }
        if (phase === 'ready') {
          btns.push(`<button type="button" class="pl-hotspot" data-action="feed"
            aria-label="${text.feedAria}"
            style="left:${pctX(serveMug.x - 45)};top:${pctY(serveMug.y - 45)};width:${pctW(90)};height:${pctH(90)}"></button>`);
        }
        btns.push(`<button type="button" class="pl-hotspot" data-action="reset-cauldron"
          aria-label="${text.emptyBtn}"
          style="left:${pctX(CAUL_CX - CAUL_R - 72)};top:${pctY(TABLE_Y - 34)};width:${pctW(86)};height:${pctH(32)}"></button>`);

        hotspotsEl.innerHTML = btns.join('');
        hotspotsEl.querySelectorAll('.pl-hotspot').forEach((b) => {
          b.addEventListener('click', () => {
            const act = b.dataset.action;
            if (act === 'flask') {
              const fl = flasks.find((x) => x.addVal === Number(b.dataset.val));
              if (fl) pourFlask(fl);
            } else if (act === 'drain') {
              const dr = drains.find((x) => x.subVal === Number(b.dataset.val));
              if (dr) triggerDrain(dr);
            } else if (act === 'fruit') {
              const fr = boardFruits.find((x) => x.mult === Number(b.dataset.mult));
              if (fr) sliceFruitOnBoard(fr);
            } else if (act === 'scoop') {
              scoopOneSlice();
            } else if (act === 'feed') {
              feedMoko();
            } else if (act === 'reset-cauldron') {
              resetCauldronState();
            }
          });
        });
      }

      /* ---- Core Gameplay Actions: Pour, Drain, Slice Fruit, Scoop, Feed Moko ---- */

      function pourFlask(flask) {
        if (phase !== 'brew' && phase !== 'ready') return;
        if (logicalVol >= MAX_VOL + 2) {
          hintEl.textContent = text.hintHigh;
          EDVoice.say('pl-high', lang);
          return;
        }
        const add = flask.addVal;
        logicalVol = Math.min(MAX_VOL + 2, logicalVol + add);
        if (historyTerms.length === 0) historyTerms.push(`${add}`);
        else historyTerms.push(`+ ${add}`);
        if (historyTerms.length > 5) historyTerms = [`${logicalVol}`];

        flask.pouringTimer = 0.65;
        flask.scale = 1.15;
        sfxCorkPop();
        clock.later(() => sfxSplash(logicalVol), 110);

        /* Emit a stream of glowing liquid droplets from the pouring position into the cauldron! */
        const pourX = CAUL_CX - 18;
        const pourY = CAUL_TOP_Y - 38;
        for (let i = 0; i < 24; i += 1) {
          streamDrops.push({
            x: pourX + (Math.random() - 0.5) * 10,
            y: pourY - i * 4,
            vx: 14 + (Math.random() - 0.5) * 24,
            vy: 90 + Math.random() * 80,
            r: 4 + Math.random() * 3.5,
            color: flask.style.hex,
            targetY: CAUL_BOT_Y - (logicalVol / MAX_VOL) * (CAUL_BOT_Y - CAUL_TOP_Y - 18),
            rgb: flask.style,
            kind: 'in',
          });
        }

        splashWave(0.45, 22);
        spawnFloatText(CAUL_CX, CAUL_TOP_Y - 18, `+${add}`, flask.style.rim);
        EDVoice.say(EDVoiceLines.num(logicalVol), lang);

        evaluateBrewState();
      }

      function triggerDrain(drain) {
        if ((phase !== 'brew' && phase !== 'ready') || logicalVol <= 0) return;
        const sub = Math.min(logicalVol, drain.subVal);
        logicalVol -= sub;
        if (historyTerms.length === 0) historyTerms.push(`${logicalVol}`);
        else historyTerms.push(`− ${sub}`);
        if (historyTerms.length > 5) historyTerms = [`${logicalVol}`];

        drain.openTimer = 0.55;
        sfxDrain(logicalVol);
        splashWave(0.15, -16);

        /* Stream of droplets pouring out of the brass drain spigot into the catch-beaker! */
        for (let i = 0; i < 16; i += 1) {
          streamDrops.push({
            x: drain.x - 10,
            y: drain.y + 8,
            vx: -28 + (Math.random() - 0.5) * 16,
            vy: 40 + i * 6,
            r: 3.5 + Math.random() * 2.5,
            color: `rgb(${Math.round(liquidColor.r)},${Math.round(liquidColor.g)},${Math.round(liquidColor.b)})`,
            targetY: TABLE_Y - 12,
            kind: 'out',
          });
        }

        spawnFloatText(drain.x - 10, drain.y - 18, `−${sub}`, '#fda4af');
        EDVoice.say(EDVoiceLines.num(logicalVol), lang);

        evaluateBrewState();
      }

      function sliceFruitOnBoard(bf) {
        if (phase !== 'brew' && phase !== 'ready') return;
        bf.slashTimer = 0.45;
        bf.scale = 1.24;
        sfxSliceFruit();

        const added = bf.mult;
        logicalSlices += added;

        spawnParticles(bf.x, bf.y, 16, {
          colors: bf.kind === 'apple' ? ['#4ade80', '#bbf7d0', '#fde68a'] : ['#fb7185', '#fda4af', '#fde68a'],
          speed: 140,
        });
        spawnFloatText(bf.x, bf.y - 28, `+${added} 🍓`, '#fde68a');

        /* Add `added` buoyant fruit slices that arc into the cauldron and float on the waves! */
        for (let i = 0; i < added; i += 1) {
          sliceSeq += 1;
          floatingSlices.push({
            id: sliceSeq,
            kind: bf.kind,
            normX: 0.2 + ((floatingSlices.length * 0.19 + i * 0.17) % 0.6),
            flyTimer: 0.38,
            startX: bf.x + (i - 1) * 14,
            startY: bf.y,
          });
        }
        clock.later(() => splashWave(0.35, 16), 240);
        EDVoice.say(EDVoiceLines.num(logicalSlices), lang);

        evaluateBrewState();
      }

      function scoopOneSlice() {
        if ((phase !== 'brew' && phase !== 'ready') || logicalSlices <= 0) return;
        logicalSlices -= 1;
        floatingSlices.pop();
        sfxCorkPop();
        splashWave(0.5, -10);
        spawnFloatText(CAUL_CX - 40, CAUL_TOP_Y - 10, '−1 🍓', '#fda4af');
        EDVoice.say(EDVoiceLines.num(logicalSlices), lang);
        evaluateBrewState();
      }

      function resetCauldronState() {
        if (phase === 'drinking' || phase === 'transformed') return;
        logicalVol = spec.startVol;
        logicalSlices = 0;
        floatingSlices = [];
        historyTerms = spec.startVol > 0 ? [`${spec.startVol}`] : [];
        phase = 'brew';
        serveMug.active = false;
        serveMug.scale = 0;
        moko.targetMouth = 0;
        sfxDrain(logicalVol);
        splashWave(0.5, -14);
        hintEl.textContent = initialHint;
        syncHotspots();
      }

      function evaluateBrewState() {
        if ( isRecipeComplete() ) {
          if (phase !== 'ready') {
            phase = 'ready';
            serveMug.active = true;
            serveMug.x = serveMug.homeX;
            serveMug.y = serveMug.homeY;
            moko.targetMouth = 1;
            moko.happyTimer = 2.0;
            hintEl.textContent = text.hintFeed;
            sfxRecipeReady();
            spawnParticles(CAUL_CX, CAUL_TOP_Y, 26, {
              colors: ['#fde68a', '#34d399', '#ffffff'],
              kind: 'star',
              speed: 175,
            });
            EDVoice.say('pl-feed', lang);
          }
        } else {
          phase = 'brew';
          serveMug.active = false;
          moko.targetMouth = 0;
          if (logicalVol > spec.targetVol) {
            hintEl.textContent = text.hintHigh;
          } else {
            hintEl.textContent = initialHint;
          }
        }
        syncHotspots();
      }

      function feedMoko() {
        if (phase !== 'ready') return;
        phase = 'drinking';
        serveMug.active = false;
        moko.gulpTimer = 0.85;
        moko.targetMouth = 0.4;
        sfxGulp(0);
        clock.later(() => sfxGulp(1), 220);
        clock.later(() => sfxGulp(2), 440);

        clock.later(() => {
          phase = 'transformed';
          moko.transformId = roundTransform.id;
          moko.vy = -210;
          moko.scaleX = 1.26;
          moko.scaleY = 0.78;
          moko.happyTimer = 3.2;
          moko.targetMouth = 0;
          moko.speech = `${roundTransform.icon} ${roundTransform.name}`;
          moko.speechTimer = 2.6;
          earnedBadges[round] = roundTransform.icon;

          /* Refresh header badge slots */
          const slots = wrap.querySelectorAll('.pl-badge-slot');
          if (slots[round]) {
            slots[round].textContent = roundTransform.icon;
            slots[round].classList.add('earned');
          }

          sfxTransform();
          spawnParticles(moko.x, moko.y - 30, 44, {
            colors: ['#fde68a', '#ff5d8f', '#34d399', '#60a5fa', '#c084fc'],
            kind: 'star',
            speed: 230,
          });
          EDKit.confetti(30);
          EDKit.praise(lang);

          round += 1;
          clock.later(startRound, 2700);
        }, 720);
      }

      /* ---- Direct Canvas Pointer Handling (Touch / Mouse / Pen) ---- */
      let dragItem = null;
      /* dragItem can be:
         - { kind: 'flask', flask, startX, startY, moved: false }
         - { kind: 'mug', startX, startY, moved: false }
         - { kind: 'knife-swipe', lastX, lastY } */

      function toCanvasPt(e) {
        const r = canvas.getBoundingClientRect();
        return {
          x: ((e.clientX - r.left) / (r.width || W)) * W,
          y: ((e.clientY - r.top) / (r.height || H)) * H,
        };
      }

      function onPointerDown(e) {
        if (e.button > 0) return;
        const pt = toCanvasPt(e);
        pointer.x = pt.x;
        pointer.y = pt.y;

        /* 1. Swinging Brass Lantern Easter Egg! */
        if (Math.hypot(pt.x - lantern.x, pt.y - (lantern.y + 42)) <= 36) {
          lantern.vel += (pt.x < lantern.x ? 3.2 : -3.2);
          EDSound.note(880, { seconds: 0.14, wave: 'triangle', gain: 0.12 });
          return;
        }

        /* 2. When recipe is ready: check Golden Serve Mug OR Moko tap! */
        if (phase === 'ready') {
          if (Math.hypot(pt.x - serveMug.x, pt.y - serveMug.y) <= 46) {
            try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
            dragItem = { kind: 'mug', startX: pt.x, startY: pt.y, moved: false };
            return;
          }
          if (Math.hypot(pt.x - moko.x, pt.y - moko.y) <= 78) {
            feedMoko();
            return;
          }
        }

        /* 3. Tapping Moko anytime makes Moko giggle and chat! */
        if (Math.hypot(pt.x - moko.x, pt.y - moko.y) <= 72) {
          sfxMokoGiggle();
          moko.vy = -140;
          moko.scaleX = 1.18;
          moko.scaleY = 0.84;
          moko.happyTimer = 1.2;
          moko.speech = EDKit.pick(text.mokoChats);
          moko.speechTimer = 1.4;
          spawnParticles(moko.x, moko.y - 35, 10, {
            colors: ['#ff5d8f', '#fde68a', '#c084fc'],
            kind: 'star',
            speed: 110,
          });
          return;
        }

        if (phase !== 'brew' && phase !== 'ready') return;

        /* 4. Check Crystal Potion Flasks on the Upper Shelf. */
        for (const f of flasks) {
          if (Math.hypot(pt.x - f.x, pt.y - f.y) <= 38) {
            try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
            sfxCorkPop();
            f.scale = 1.12;
            dragItem = { kind: 'flask', flask: f, startX: pt.x, startY: pt.y, moved: false };
            return;
          }
        }

        /* 5. Check Brass Drain Spigots on the left of the cauldron. */
        for (const d of drains) {
          if (Math.hypot(pt.x - d.x, pt.y - d.y) <= 34) {
            triggerDrain(d);
            return;
          }
        }

        /* 6. Check Reset Cauldron Pill on lower left of cauldron. */
        if (pt.x >= CAUL_CX - CAUL_R - 76 && pt.x <= CAUL_CX - CAUL_R + 18
            && pt.y >= TABLE_Y - 36 && pt.y <= TABLE_Y + 4) {
          resetCauldronState();
          return;
        }

        /* 7. Check Scoop Slice (-1) button or floating fruit slices in the cauldron. */
        if (logicalSlices > 0) {
          if (pt.x >= boardX - 58 && pt.x <= boardX + 58 && pt.y >= boardY - 82 && pt.y <= boardY - 46) {
            scoopOneSlice();
            return;
          }
          if (Math.hypot(pt.x - CAUL_CX, pt.y - CAUL_CY) <= CAUL_R - 8 && needsSlices && logicalSlices > spec.targetSlices) {
            scoopOneSlice();
            return;
          }
        }

        /* 8. Check Whole Magical Fruits on the Oak Chopping Board. */
        for (const bf of boardFruits) {
          if (Math.hypot(pt.x - bf.x, pt.y - bf.y) <= 38) {
            sliceFruitOnBoard(bf);
            return;
          }
        }

        /* 9. Otherwise start a knife swipe gesture (swiping across fruits on the chopping board slices them!). */
        try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        dragItem = { kind: 'knife-swipe', lastX: pt.x, lastY: pt.y, points: [pt] };
      }

      function onPointerMove(e) {
        const pt = toCanvasPt(e);
        pointer.x = pt.x;
        pointer.y = pt.y;
        if (!dragItem) return;

        if (dragItem.kind === 'flask') {
          if (Math.hypot(pt.x - dragItem.startX, pt.y - dragItem.startY) > 8) {
            dragItem.moved = true;
          }
          if (dragItem.moved) {
            dragItem.flask.x = pt.x;
            dragItem.flask.y = pt.y;
            /* Tilt flask as it nears the cauldron mouth! */
            const nearCauldron = Math.hypot(pt.x - CAUL_CX, pt.y - CAUL_TOP_Y) < 115;
            dragItem.flask.tilt = nearCauldron ? 0.85 : 0.15;
          }
        } else if (dragItem.kind === 'mug') {
          if (Math.hypot(pt.x - dragItem.startX, pt.y - dragItem.startY) > 8) {
            dragItem.moved = true;
          }
          if (dragItem.moved) {
            serveMug.x = pt.x;
            serveMug.y = pt.y;
            if (Math.hypot(pt.x - moko.x, pt.y - (moko.y - 8)) < 68) {
              dragItem = null;
              feedMoko();
            }
          }
        } else if (dragItem.kind === 'knife-swipe') {
          dragItem.points.push(pt);
          if (dragItem.points.length > 10) dragItem.points.shift();
          for (const bf of boardFruits) {
            if (bf.slashTimer <= 0 && Math.hypot(pt.x - bf.x, pt.y - bf.y) <= 36) {
              sliceFruitOnBoard(bf);
            }
          }
        }
      }

      function onPointerUp() {
        if (!dragItem) return;
        const st = dragItem;
        dragItem = null;

        if (st.kind === 'flask') {
          const f = st.flask;
          f.tilt = 0;
          f.scale = 1;
          if (!st.moved || Math.hypot(f.x - CAUL_CX, f.y - (CAUL_CY - 20)) < 145) {
            pourFlask(f);
          }
        } else if (st.kind === 'mug') {
          if (!st.moved || Math.hypot(serveMug.x - moko.x, serveMug.y - moko.y) < 110) {
            feedMoko();
          } else {
            serveMug.x = serveMug.homeX;
            serveMug.y = serveMug.homeY;
          }
        }
      }

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);

      activeCleanup = () => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
      };

      syncHotspots();

      /* ---- 60fps Update & Illustrated Render Loop ---- */
      let lastTime = performance.now();

      function frame(nowMs) {
        const dt = Math.min(0.05, (nowMs - lastTime) / 1000);
        lastTime = nowMs;
        const t = nowMs / 1000;

        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
          canvas.width = W * dpr;
          canvas.height = H * dpr;
        }
        const gctx = canvas.getContext('2d');
        gctx.save();
        gctx.scale(dpr, dpr);

        /* ---- 1. Step Physics Simulations ---- */
        stepWavePhysics(dt);

        /* Smoothly interpolate display liquid level toward logicalVol. */
        displayVol += (logicalVol - displayVol) * Math.min(1, dt * 8.5);

        /* Step pendulum lantern. */
        const lanternAcc = -18 * Math.sin(lantern.angle) - 1.8 * lantern.vel;
        lantern.vel += lanternAcc * dt;
        lantern.angle += lantern.vel * dt;

        /* Step flasks returning to shelf or tilting to pour. */
        flasks.forEach((f) => {
          if (f.pouringTimer > 0) {
            f.pouringTimer = Math.max(0, f.pouringTimer - dt);
            const pourX = CAUL_CX - 30;
            const pourY = CAUL_TOP_Y - 24;
            f.x += (pourX - f.x) * Math.min(1, dt * 16);
            f.y += (pourY - f.y) * Math.min(1, dt * 16);
            f.tilt += (1.15 - f.tilt) * Math.min(1, dt * 16);
          } else if (!dragItem || dragItem.flask !== f) {
            f.x += (f.homeX - f.x) * Math.min(1, dt * 12);
            f.y += (f.homeY - f.y) * Math.min(1, dt * 12);
            f.tilt *= 0.8;
          }
          f.scale += (1 - f.scale) * Math.min(1, dt * 14);
        });

        drains.forEach((d) => {
          if (d.openTimer > 0) d.openTimer = Math.max(0, d.openTimer - dt);
        });

        boardFruits.forEach((bf) => {
          if (bf.slashTimer > 0) bf.slashTimer = Math.max(0, bf.slashTimer - dt);
          bf.scale += (1 - bf.scale) * Math.min(1, dt * 14);
        });

        if (serveMug.active) {
          serveMug.scale += (1 - serveMug.scale) * Math.min(1, dt * 12);
          if (!dragItem || dragItem.kind !== 'mug') {
            serveMug.x += (serveMug.homeX - serveMug.x) * Math.min(1, dt * 10);
            serveMug.y = serveMug.homeY + Math.sin(t * 4.2) * 5;
          }
        } else {
          serveMug.scale *= 0.82;
        }

        /* Step falling potion stream droplets & blend liquid RGB colour. */
        streamDrops.forEach((dr) => {
          dr.x += dr.vx * dt;
          dr.y += dr.vy * dt;
          dr.vy += 460 * dt;
          if (dr.y >= dr.targetY) {
            dr.done = true;
            if (dr.kind === 'in' && dr.rgb) {
              liquidColor.r += (dr.rgb.r - liquidColor.r) * 0.035;
              liquidColor.g += (dr.rgb.g - liquidColor.g) * 0.035;
              liquidColor.b += (dr.rgb.b - liquidColor.b) * 0.035;
              splashWave(0.45 + (Math.random() - 0.5) * 0.18, 3.2);
            }
          }
        });
        streamDrops = streamDrops.filter((dr) => !dr.done);

        /* Step floating fruit slices jumping into the cauldron. */
        floatingSlices.forEach((fs) => {
          if (fs.flyTimer > 0) {
            fs.flyTimer = Math.max(0, fs.flyTimer - dt);
          }
        });

        /* Step Moko physics & expressions. */
        moko.mouthOpen += (moko.targetMouth - moko.mouthOpen) * Math.min(1, dt * 12);
        moko.jumpY += moko.vy * dt;
        if (moko.jumpY < 0) {
          moko.vy += 560 * dt;
        } else {
          moko.jumpY = 0;
          moko.vy = 0;
        }
        moko.scaleX += (1 - moko.scaleX) * Math.min(1, dt * 12);
        moko.scaleY += (1 - moko.scaleY) * Math.min(1, dt * 12);
        if (moko.happyTimer > 0) moko.happyTimer = Math.max(0, moko.happyTimer - dt);
        if (moko.gulpTimer > 0) moko.gulpTimer = Math.max(0, moko.gulpTimer - dt);
        if (moko.speechTimer > 0) moko.speechTimer = Math.max(0, moko.speechTimer - dt);

        /* Step particles & floating math callouts. */
        particles.forEach((p) => {
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += p.gravity * dt;
          p.rot += (p.vrot || 0) * dt;
        });
        particles = particles.filter((p) => p.life < p.maxLife);

        floatTexts.forEach((ft) => {
          ft.life += dt;
          ft.y -= 26 * dt;
        });
        floatTexts = floatTexts.filter((ft) => ft.life < ft.maxLife);

        /* ---- 2. Render Lush Alchemist's Workshop Scene ---- */
        drawWorkshopBackground(gctx, t);
        drawRecipeScroll(gctx, spec, roundTransform);
        drawApothecaryShelfAndFlasks(gctx, t);
        drawChoppingBoardStation(gctx, t);
        drawCauldronAndFluid(gctx, spec, t, dt);
        drawMokoMonster(gctx, spec, t);
        drawServeMug(gctx, t);
        drawForegroundEffects(gctx);

        gctx.restore();
        rafId = requestAnimationFrame(frame);
      }

      /* ---- Layer 1: Workshop Background, Moonlit Window, Swinging Lantern & Oak Table ---- */
      function drawWorkshopBackground(gctx, t) {
        const wallGrad = gctx.createLinearGradient(0, 0, 0, TABLE_Y);
        wallGrad.addColorStop(0, '#161029');
        wallGrad.addColorStop(0.6, '#261b47');
        wallGrad.addColorStop(1, '#1d1436');
        gctx.fillStyle = wallGrad;
        gctx.fillRect(0, 0, W, H);

        /* Subtle stone brick courses */
        gctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
        for (let row = 0; row < 6; row += 1) {
          for (let col = 0; col < 8; col += 1) {
            if ((row + col) % 2 === 0) {
              roundRectPath(gctx, col * 124 + (row % 2) * 52, row * 68 + 10, 110, 56, 8);
              gctx.fill();
            }
          }
        }

        /* Arched Moonlit Window on Left Wall */
        const winX = 54;
        const winY = 34;
        const winW = 104;
        const winH = 142;
        gctx.save();
        gctx.beginPath();
        gctx.arc(winX + winW / 2, winY + winW / 2, winW / 2, Math.PI, 0);
        gctx.lineTo(winX + winW, winY + winH);
        gctx.lineTo(winX, winY + winH);
        gctx.closePath();
        const nightSky = gctx.createLinearGradient(0, winY, 0, winY + winH);
        nightSky.addColorStop(0, '#091436');
        nightSky.addColorStop(1, '#1e3a8a');
        gctx.fillStyle = nightSky;
        gctx.fill();

        /* Crescent Moon & Twinkling Stars inside Window */
        gctx.save();
        gctx.clip();
        gctx.fillStyle = '#fef08a';
        gctx.beginPath();
        gctx.arc(winX + 64, winY + 48, 17, 0, Math.PI * 2);
        gctx.fill();
        gctx.fillStyle = '#0d1b42';
        gctx.beginPath();
        gctx.arc(winX + 57, winY + 44, 15, 0, Math.PI * 2);
        gctx.fill();

        [[26, 36], [34, 78], [78, 86], [46, 112], [82, 118]].forEach(([sx, sy], i) => {
          const a = 0.4 + 0.6 * Math.sin(t * 2.5 + i);
          gctx.fillStyle = `rgba(255, 252, 220, ${a.toFixed(2)})`;
          gctx.beginPath();
          gctx.arc(winX + sx, winY + sy, 1.8, 0, Math.PI * 2);
          gctx.fill();
        });
        gctx.restore();

        /* Window Mullions & Stone Arch Frame */
        gctx.strokeStyle = '#4c3575';
        gctx.lineWidth = 5;
        gctx.stroke();
        gctx.lineWidth = 3;
        gctx.beginPath();
        gctx.moveTo(winX + winW / 2, winY);
        gctx.lineTo(winX + winW / 2, winY + winH);
        gctx.moveTo(winX, winY + 86);
        gctx.lineTo(winX + winW, winY + 86);
        gctx.stroke();
        gctx.restore();

        /* Swinging Brass Alchemy Lantern on Right */
        gctx.save();
        gctx.translate(lantern.x, lantern.y);
        gctx.rotate(lantern.angle);
        /* Warm ambient lantern halo */
        const halo = gctx.createRadialGradient(0, 48, 4, 0, 48, 72);
        halo.addColorStop(0, 'rgba(253, 224, 71, 0.35)');
        halo.addColorStop(1, 'rgba(253, 224, 71, 0)');
        gctx.fillStyle = halo;
        gctx.beginPath();
        gctx.arc(0, 48, 72, 0, Math.PI * 2);
        gctx.fill();

        gctx.strokeStyle = '#d97706';
        gctx.lineWidth = 3;
        gctx.beginPath();
        gctx.moveTo(0, 0);
        gctx.lineTo(0, 28);
        gctx.stroke();

        roundRectPath(gctx, -16, 28, 32, 36, 8);
        gctx.fillStyle = '#fef08a';
        gctx.fill();
        gctx.lineWidth = 3;
        gctx.strokeStyle = '#b45309';
        gctx.stroke();
        gctx.fillStyle = '#92400e';
        gctx.fillRect(-20, 24, 40, 6);
        gctx.fillRect(-18, 62, 36, 6);
        gctx.restore();

        /* Oak Workbench Table across the bottom of the workshop */
        const woodGrad = gctx.createLinearGradient(0, TABLE_Y, 0, H);
        woodGrad.addColorStop(0, '#854d27');
        woodGrad.addColorStop(0.12, '#9a5b30');
        woodGrad.addColorStop(1, '#5c3216');
        gctx.fillStyle = woodGrad;
        gctx.fillRect(0, TABLE_Y, W, H - TABLE_Y);

        /* Table top bevel & wood plank lines */
        gctx.fillStyle = '#c27d48';
        gctx.fillRect(0, TABLE_Y, W, 6);
        gctx.strokeStyle = 'rgba(45, 20, 5, 0.35)';
        gctx.lineWidth = 2;
        [180, 390, 610, 790].forEach((px) => {
          gctx.beginPath();
          gctx.moveTo(px, TABLE_Y + 6);
          gctx.lineTo(px - 24, H);
          gctx.stroke();
        });
      }

      /* ---- Layer 2: Top Parchment Recipe Scroll ---- */
      function drawRecipeScroll(gctx, spec, roundTransform) {
        const sx = 236;
        const sy = 12;
        const sw = 408;
        const sh = 56;

        gctx.save();
        roundRectPath(gctx, sx, sy, sw, sh, 16);
        const pGrad = gctx.createLinearGradient(0, sy, 0, sy + sh);
        pGrad.addColorStop(0, '#312054');
        pGrad.addColorStop(1, '#1f1438');
        gctx.fillStyle = pGrad;
        gctx.fill();
        gctx.lineWidth = 2.5;
        gctx.strokeStyle = isRecipeComplete() ? '#34d399' : '#7c5cbf';
        gctx.stroke();

        /* Left Target Pill(s) */
        gctx.direction = 'ltr';
        gctx.font = '700 20px Fredoka, Heebo, sans-serif';
        gctx.textBaseline = 'middle';
        gctx.textAlign = 'left';
        gctx.fillStyle = '#fde68a';
        gctx.fillText(buildEquationText(), sx + 18, sy + sh / 2);

        /* Right Transformation Preview Pill */
        roundRectPath(gctx, sx + sw - 134, sy + 9, 122, 38, 12);
        gctx.fillStyle = isRecipeComplete() ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255, 255, 255, 0.08)';
        gctx.fill();
        gctx.direction = lang === 'he' ? 'rtl' : 'ltr';
        gctx.font = '700 15px Fredoka, Heebo, sans-serif';
        gctx.textAlign = 'center';
        gctx.fillStyle = '#f3e8ff';
        gctx.fillText(`${roundTransform.icon} ${roundTransform.name}`, sx + sw - 73, sy + 28);
        gctx.restore();
      }

      /* ---- Layer 3: Upper Apothecary Shelf & Crystal Potion Flasks ---- */
      function drawApothecaryShelfAndFlasks(gctx, t) {
        const shX = 248;
        const shW = 380;
        const shY = 136;

        /* Wooden Shelf Plank & Brackets */
        gctx.save();
        roundRectPath(gctx, shX, shY, shW, 13, 6);
        gctx.fillStyle = '#854d27';
        gctx.fill();
        gctx.lineWidth = 2;
        gctx.strokeStyle = '#c27d48';
        gctx.stroke();
        gctx.restore();

        /* Draw non-dragged flasks first, then active/dragged flask on top */
        const ordered = [...flasks].sort((a, b) => (dragItem && dragItem.flask === a ? 1 : (dragItem && dragItem.flask === b ? -1 : 0)));
        ordered.forEach((f) => {
          gctx.save();
          gctx.translate(f.x, f.y);
          gctx.rotate(f.tilt);
          gctx.scale(f.scale, f.scale);

          const col = f.style;
          /* Subtle magical aura around flask */
          gctx.shadowColor = col.hex;
          gctx.shadowBlur = 12;

          /* Bottle Glass Neck */
          roundRectPath(gctx, -9, -36, 18, 16, 4);
          gctx.fillStyle = 'rgba(220, 240, 255, 0.35)';
          gctx.fill();
          gctx.lineWidth = 2;
          gctx.strokeStyle = '#e0f2fe';
          gctx.stroke();

          /* Cork Stopper (pops up when pouring!) */
          if (f.pouringTimer <= 0 && Math.abs(f.tilt) < 0.4) {
            roundRectPath(gctx, -7, -44, 14, 10, 3);
            gctx.fillStyle = '#d97706';
            gctx.fill();
          }

          /* Bottle Body Silhouette */
          gctx.beginPath();
          if (col.shape === 'cone') {
            gctx.moveTo(-10, -20);
            gctx.lineTo(10, -20);
            gctx.lineTo(26, 22);
            gctx.quadraticCurveTo(26, 28, 18, 28);
            gctx.lineTo(-18, 28);
            gctx.quadraticCurveTo(-26, 28, -26, 22);
            gctx.closePath();
          } else if (col.shape === 'diamond') {
            gctx.moveTo(-9, -20);
            gctx.lineTo(9, -20);
            gctx.lineTo(27, 2);
            gctx.lineTo(14, 28);
            gctx.lineTo(-14, 28);
            gctx.lineTo(-27, 2);
            gctx.closePath();
          } else {
            gctx.arc(0, 5, 24, 0, Math.PI * 2);
          }
          gctx.fillStyle = col.hex;
          gctx.fill();
          gctx.lineWidth = 2.5;
          gctx.strokeStyle = '#ffffff';
          gctx.stroke();
          gctx.shadowBlur = 0;

          /* Specular Glass Shine */
          gctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
          gctx.beginPath();
          gctx.ellipse(-9, -2, 5, 11, -0.3, 0, Math.PI * 2);
          gctx.fill();

          /* Bold +N Value Medallion on the Flask */
          roundRectPath(gctx, -17, -7, 34, 24, 8);
          gctx.fillStyle = 'rgba(15, 23, 42, 0.52)';
          gctx.fill();
          gctx.fillStyle = '#ffffff';
          gctx.font = '700 18px Fredoka, sans-serif';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          gctx.fillText(`+${f.addVal}`, 0, 5);

          gctx.restore();
        });
      }

      /* ---- Layer 4: Left Counter — Oak Chopping Board & Magical Fruits ---- */
      function drawChoppingBoardStation(gctx, t) {
        const bx = 54;
        const by = 378;
        const bw = 172;
        const bh = 42;

        gctx.save();
        /* Oak Chopping Board */
        roundRectPath(gctx, bx, by, bw, bh, 12);
        gctx.fillStyle = '#d99b66';
        gctx.fill();
        gctx.lineWidth = 3;
        gctx.strokeStyle = '#78350f';
        gctx.stroke();

        /* Board Label & Slice Counter */
        if (needsSlices) {
          const ok = logicalSlices === spec.targetSlices;
          roundRectPath(gctx, bx + 16, by - 126, bw - 32, 30, 12);
          gctx.fillStyle = ok ? '#10b981' : '#312054';
          gctx.fill();
          gctx.lineWidth = 2;
          gctx.strokeStyle = ok ? '#a7f3d0' : '#a78bfa';
          gctx.stroke();
          gctx.direction = 'ltr';
          gctx.fillStyle = '#ffffff';
          gctx.font = '700 15px Fredoka, Heebo, sans-serif';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          gctx.fillText(`🍓 ${logicalSlices} / ${spec.targetSlices} ${ok ? '✓' : ''}`, bx + bw / 2, by - 111);
        }

        /* Scoop 1 Slice (-1) Button if slices > 0 */
        if (logicalSlices > 0) {
          roundRectPath(gctx, bx + 16, by - 90, bw - 32, 26, 10);
          gctx.fillStyle = logicalSlices > spec.targetSlices && needsSlices ? '#e11d48' : '#3b2863';
          gctx.fill();
          gctx.lineWidth = 1.8;
          gctx.strokeStyle = '#fda4af';
          gctx.stroke();
          gctx.direction = lang === 'he' ? 'rtl' : 'ltr';
          gctx.fillStyle = '#ffffff';
          gctx.font = '700 12px Fredoka, Heebo, sans-serif';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          gctx.fillText(text.scoopLabel, bx + bw / 2, by - 77);
        }

        /* Draw Whole Magical Fruits on the Chopping Board */
        boardFruits.forEach((bf) => {
          gctx.save();
          gctx.translate(bf.x, bf.y);
          gctx.scale(bf.scale, bf.scale);

          /* Fruit Shadow */
          gctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          gctx.beginPath();
          gctx.ellipse(0, 22, 22, 6, 0, 0, Math.PI * 2);
          gctx.fill();

          if (bf.kind === 'apple') {
            /* Glowing Moon-Apple (x3 wedges) */
            gctx.fillStyle = '#22c55e';
            gctx.strokeStyle = '#dcfce7';
            gctx.lineWidth = 2.2;
            gctx.beginPath();
            gctx.arc(0, 2, 21, 0, Math.PI * 2);
            gctx.fill();
            gctx.stroke();
            /* Leaf on top */
            gctx.fillStyle = '#86efac';
            gctx.beginPath();
            gctx.ellipse(6, -20, 7, 4, -0.4, 0, Math.PI * 2);
            gctx.fill();
          } else {
            /* Glowing Star-Berry (x2 halves) */
            gctx.fillStyle = '#f43f5e';
            gctx.strokeStyle = '#ffe4e6';
            gctx.lineWidth = 2.2;
            gctx.beginPath();
            gctx.moveTo(0, -19);
            gctx.bezierCurveTo(24, -19, 24, 15, 0, 22);
            gctx.bezierCurveTo(-24, 15, -24, -19, 0, -19);
            gctx.fill();
            gctx.stroke();
          }

          /* Dotted Cut Lines & x2 / x3 Multiplication Badge */
          gctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          gctx.lineWidth = 1.6;
          gctx.setLineDash([3, 3]);
          gctx.beginPath();
          gctx.moveTo(0, -16);
          gctx.lineTo(0, 18);
          gctx.stroke();
          gctx.setLineDash([]);

          roundRectPath(gctx, -16, -9, 32, 20, 7);
          gctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
          gctx.fill();
          gctx.fillStyle = '#fde68a';
          gctx.font = '700 14px Fredoka, sans-serif';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          gctx.fillText(`×${bf.mult}`, 0, 1);

          /* Gleaming Cleaver Slash Arc when sliced! */
          if (bf.slashTimer > 0) {
            gctx.strokeStyle = '#00e5ff';
            gctx.lineWidth = 4;
            gctx.shadowColor = '#00e5ff';
            gctx.shadowBlur = 12;
            gctx.beginPath();
            gctx.moveTo(-26, -24);
            gctx.lineTo(26, 24);
            gctx.stroke();
          }

          gctx.restore();
        });
        gctx.restore();
      }

      /* ---- Layer 5: Copper Fire Burner, Graduated Glass Cauldron, 40-Node Wave Fluid & Brass Drain Tap ---- */
      function drawCauldronAndFluid(gctx, spec, t) {
        /* 1. Copper Burner & Flickering Fire Tongues under the Cauldron */
        gctx.save();
        for (let i = 0; i < 7; i += 1) {
          const fx = CAUL_CX - 54 + i * 18;
          const fh = 22 + Math.sin(t * 11 + i * 1.7) * 8;
          const fGrad = gctx.createLinearGradient(fx, TABLE_Y + 4, fx, TABLE_Y - fh);
          fGrad.addColorStop(0, '#ff5722');
          fGrad.addColorStop(0.55, '#ff9800');
          fGrad.addColorStop(1, '#fef08a');
          gctx.fillStyle = fGrad;
          gctx.beginPath();
          gctx.moveTo(fx - 11, TABLE_Y + 4);
          gctx.quadraticCurveTo(fx + Math.sin(t * 9 + i) * 5, TABLE_Y - fh, fx + 11, TABLE_Y + 4);
          gctx.fill();
        }
        /* Iron Cauldron Stand Legs */
        gctx.fillStyle = '#334155';
        gctx.fillRect(CAUL_CX - 76, TABLE_Y - 16, 14, 22);
        gctx.fillRect(CAUL_CX + 62, TABLE_Y - 16, 14, 22);
        gctx.restore();

        /* 2. Brass Drain Spigots (-1 / -2) & Catch-Beaker on Left of Cauldron */
        drains.forEach((d) => {
          const isOverfilled = logicalVol > spec.targetVol;
          const pulse = isOverfilled ? 1 + Math.sin(t * 8) * 0.08 : 1;
          gctx.save();
          gctx.translate(d.x, d.y);
          gctx.scale(pulse, pulse);

          /* Brass Pipe connecting to Cauldron wall */
          gctx.fillStyle = '#d97706';
          gctx.strokeStyle = '#fef08a';
          gctx.lineWidth = 2;
          roundRectPath(gctx, -18, -12, 48, 24, 8);
          gctx.fill();
          gctx.stroke();

          /* Spigot Nozzle pointing down */
          gctx.fillRect(-18, 4, 12, 12);

          /* Valve Wheel & -N Label */
          roundRectPath(gctx, -24, -18, 44, 30, 10);
          gctx.fillStyle = isOverfilled ? '#e11d48' : '#b45309';
          gctx.fill();
          gctx.strokeStyle = '#fde68a';
          gctx.stroke();

          gctx.fillStyle = '#ffffff';
          gctx.font = '700 16px Fredoka, sans-serif';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          gctx.fillText(`−${d.subVal}`, -2, -3);
          gctx.restore();
        });

        /* Reset Cauldron Pill on table to the left of cauldron */
        gctx.save();
        const rstX = CAUL_CX - CAUL_R - 74;
        const rstY = TABLE_Y - 30;
        roundRectPath(gctx, rstX, rstY, 84, 26, 9);
        gctx.fillStyle = 'rgba(30, 22, 51, 0.85)';
        gctx.fill();
        gctx.lineWidth = 1.5;
        gctx.strokeStyle = '#7c5cbf';
        gctx.stroke();
        gctx.fillStyle = '#e9d5ff';
        gctx.font = '700 11.5px Fredoka, Heebo, sans-serif';
        gctx.textAlign = 'center';
        gctx.textBaseline = 'middle';
        gctx.fillText(text.emptyBtn, rstX + 42, rstY + 13);
        gctx.restore();

        /* 3. Cauldron Glass Interior & Clipped 40-Node Wave Liquid */
        const innerTop = CAUL_TOP_Y;
        const innerBot = CAUL_BOT_Y;
        const scaleSpan = innerBot - innerTop - 16;
        const levelY = (v) => innerBot - 6 - (v / MAX_VOL) * scaleSpan;

        gctx.save();
        /* Define rounded cauldron bowl path */
        gctx.beginPath();
        gctx.moveTo(CAUL_CX - CAUL_R + 10, innerTop);
        gctx.lineTo(CAUL_CX + CAUL_R - 10, innerTop);
        gctx.bezierCurveTo(
          CAUL_CX + CAUL_R + 14, innerTop + 70,
          CAUL_CX + CAUL_R - 8, innerBot + 14,
          CAUL_CX, innerBot + 14,
        );
        gctx.bezierCurveTo(
          CAUL_CX - CAUL_R + 8, innerBot + 14,
          CAUL_CX - CAUL_R - 14, innerTop + 70,
          CAUL_CX - CAUL_R + 10, innerTop,
        );
        gctx.closePath();

        gctx.fillStyle = 'rgba(18, 28, 56, 0.68)';
        gctx.fill();

        /* Clip liquid, bubbles, and floating fruit slices to the cauldron interior! */
        gctx.save();
        gctx.clip();

        if (displayVol > 0.02) {
          const baseSurfY = levelY(displayVol);
          const r = Math.round(liquidColor.r);
          const g = Math.round(liquidColor.g);
          const b = Math.round(liquidColor.b);

          gctx.beginPath();
          const leftX = CAUL_CX - CAUL_R - 10;
          const rightX = CAUL_CX + CAUL_R + 10;
          const spanX = rightX - leftX;

          for (let i = 0; i < WAVE_N; i += 1) {
            const wx = leftX + (i / (WAVE_N - 1)) * spanX;
            const wy = baseSurfY + waveH[i] + Math.sin(t * 3.2 + i * 0.35) * 1.8;
            if (i === 0) gctx.moveTo(wx, wy);
            else gctx.lineTo(wx, wy);
          }
          gctx.lineTo(rightX, innerBot + 30);
          gctx.lineTo(leftX, innerBot + 30);
          gctx.closePath();

          const liqGrad = gctx.createLinearGradient(0, baseSurfY - 10, 0, innerBot + 14);
          liqGrad.addColorStop(0, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, 0.92)`);
          liqGrad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.88)`);
          liqGrad.addColorStop(1, `rgba(${Math.max(0, r - 45)}, ${Math.max(0, g - 45)}, ${Math.max(0, b - 45)}, 0.95)`);
          gctx.fillStyle = liqGrad;
          gctx.fill();

          /* Glowing liquid surface meniscus rim */
          gctx.strokeStyle = `rgba(255, 255, 255, 0.55)`;
          gctx.lineWidth = 3;
          gctx.stroke();

          /* Rising Bubbles inside the Liquid */
          bubbles.forEach((bb) => {
            bb.yProg = (bb.yProg + bb.speed * 0.016) % 1;
            const bx = CAUL_CX + bb.xOff + Math.sin(t * 3 + bb.phase) * 6;
            const by = innerBot - bb.yProg * Math.max(12, innerBot - baseSurfY);
            if (by > baseSurfY + 4) {
              gctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
              gctx.beginPath();
              gctx.arc(bx, by, bb.r, 0, Math.PI * 2);
              gctx.fill();
            }
          });
        }

        /* Buoyant Floating Fruit Slices riding the wave surface! */
        const surfForSlices = levelY(Math.max(0.5, displayVol));
        floatingSlices.forEach((fs, idx) => {
          const waveIdx = Math.max(1, Math.min(WAVE_N - 2, Math.round(fs.normX * (WAVE_N - 1))));
          const targetX = (CAUL_CX - CAUL_R + 24) + fs.normX * (CAUL_R * 2 - 48);
          const targetY = surfForSlices + waveH[waveIdx] + Math.sin(t * 4 + idx) * 2.5;
          const slope = (waveH[waveIdx + 1] - waveH[waveIdx - 1]) * 0.04;

          let sx = targetX;
          let sy = targetY;
          if (fs.flyTimer > 0) {
            const p = 1 - fs.flyTimer / 0.38;
            sx = fs.startX + (targetX - fs.startX) * p;
            sy = fs.startY + (targetY - fs.startY) * p - Math.sin(p * Math.PI) * 95;
          }

          gctx.save();
          gctx.translate(sx, sy);
          gctx.rotate(slope);
          gctx.beginPath();
          gctx.arc(0, 0, 11, 0, Math.PI);
          gctx.closePath();
          gctx.fillStyle = fs.kind === 'apple' ? '#4ade80' : '#fb7185';
          gctx.fill();
          gctx.lineWidth = 2;
          gctx.strokeStyle = '#ffffff';
          gctx.stroke();
          gctx.restore();
        });

        gctx.restore(); // end interior clip

        /* 4. Illuminated Graduated Number Scale (0 .. 10) Etched on the Glass Cauldron */
        for (let v = 1; v <= MAX_VOL; v += 1) {
          const ty = levelY(v);
          const isTarget = v === spec.targetVol;
          const isCurrent = Math.round(displayVol) === v;

          gctx.save();
          if (isTarget) {
            /* Golden Dashed Target Level Line across the whole cauldron! */
            gctx.strokeStyle = '#fde047';
            gctx.lineWidth = 2.8;
            gctx.setLineDash([7, 5]);
            gctx.beginPath();
            gctx.moveTo(CAUL_CX - CAUL_R + 12, ty);
            gctx.lineTo(CAUL_CX + CAUL_R - 12, ty);
            gctx.stroke();
            gctx.setLineDash([]);

            /* Target Volume Pointer Pill on the right rim */
            const match = logicalVol === spec.targetVol;
            roundRectPath(gctx, CAUL_CX + CAUL_R - 4, ty - 13, 56, 26, 13);
            gctx.fillStyle = match ? '#10b981' : '#eab308';
            gctx.fill();
            gctx.lineWidth = 2;
            gctx.strokeStyle = '#ffffff';
            gctx.stroke();
            gctx.fillStyle = '#0f172a';
            gctx.font = '700 15px Fredoka, sans-serif';
            gctx.textAlign = 'center';
            gctx.textBaseline = 'middle';
            gctx.fillText(match ? `${v} ✓` : `🎯 ${v}`, CAUL_CX + CAUL_R + 24, ty);
          } else {
            const tickW = v % 5 === 0 ? 22 : 13;
            gctx.strokeStyle = isCurrent ? '#ffffff' : 'rgba(224, 242, 254, 0.48)';
            gctx.lineWidth = isCurrent ? 2.5 : 1.5;
            gctx.beginPath();
            gctx.moveTo(CAUL_CX - tickW / 2, ty);
            gctx.lineTo(CAUL_CX + tickW / 2, ty);
            gctx.stroke();
          }

          /* Scale numbers along the center-right of the glass */
          if (v % 2 === 0 || isTarget || isCurrent) {
            gctx.fillStyle = isTarget ? '#fde047' : (isCurrent ? '#ffffff' : 'rgba(224, 242, 254, 0.72)');
            gctx.font = (isTarget || isCurrent) ? '700 15px Fredoka, sans-serif' : '600 12.5px Fredoka, sans-serif';
            gctx.textAlign = 'left';
            gctx.textBaseline = 'middle';
            gctx.fillText(String(v), CAUL_CX + 16, ty);
          }
          gctx.restore();
        }

        /* 5. Cauldron Glass Outer Rim, Specular Highlights & Top Lip */
        gctx.lineWidth = 4;
        gctx.strokeStyle = isRecipeComplete() ? '#6ee7b7' : 'rgba(186, 230, 253, 0.78)';
        gctx.stroke();

        /* Curved Left Glass Specular Highlight */
        gctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        gctx.lineWidth = 5;
        gctx.lineCap = 'round';
        gctx.beginPath();
        gctx.moveTo(CAUL_CX - CAUL_R + 18, innerTop + 22);
        gctx.quadraticCurveTo(CAUL_CX - CAUL_R + 8, CAUL_CY + 20, CAUL_CX - CAUL_R + 36, innerBot - 12);
        gctx.stroke();

        /* Top Glass Lip */
        roundRectPath(gctx, CAUL_CX - CAUL_R + 2, innerTop - 7, (CAUL_R - 2) * 2, 13, 6.5);
        gctx.fillStyle = 'rgba(224, 242, 254, 0.42)';
        gctx.fill();
        gctx.lineWidth = 2.5;
        gctx.strokeStyle = '#e0f2fe';
        gctx.stroke();
        gctx.restore();

        /* Render Active Falling Potion Droplets */
        streamDrops.forEach((dr) => {
          gctx.save();
          gctx.fillStyle = dr.color;
          gctx.shadowColor = dr.color;
          gctx.shadowBlur = 8;
          gctx.beginPath();
          gctx.arc(dr.x, dr.y, dr.r, 0, Math.PI * 2);
          gctx.fill();
          gctx.restore();
        });
      }

      /* ---- Layer 6: Moko the Expressive Alchemy Monster & 5 Transformations ---- */
      function drawMokoMonster(gctx, spec, t) {
        const breathe = Math.sin(t * 3.1) * 3;
        const floatOff = (moko.transformId === 'wings' || moko.transformId === 'bubble')
          ? -24 + Math.sin(t * 4.5) * 8
          : 0;
        const mx = moko.x;
        const my = moko.y + breathe + moko.jumpY + floatOff;

        gctx.save();
        gctx.translate(mx, my);
        gctx.scale(moko.scaleX, moko.scaleY);

        /* Transformation 1: Iridescent Fluttering Fairy Wings behind Moko */
        if (moko.transformId === 'wings') {
          const flap = Math.sin(t * 14) * 0.22;
          [-1, 1].forEach((dir) => {
            gctx.save();
            gctx.scale(dir, 1);
            gctx.rotate(flap);
            gctx.fillStyle = 'rgba(103, 232, 249, 0.65)';
            gctx.strokeStyle = '#fde047';
            gctx.lineWidth = 2.5;
            gctx.beginPath();
            gctx.ellipse(46, -24, 34, 20, -0.35, 0, Math.PI * 2);
            gctx.fill();
            gctx.stroke();
            gctx.beginPath();
            gctx.ellipse(38, 6, 24, 14, 0.25, 0, Math.PI * 2);
            gctx.fill();
            gctx.stroke();
            gctx.restore();
          });
        }

        /* Transformation 2: Royal Velvet Cape behind Moko */
        if (moko.transformId === 'crown') {
          gctx.fillStyle = '#e11d48';
          gctx.strokeStyle = '#fde047';
          gctx.lineWidth = 3;
          gctx.beginPath();
          gctx.moveTo(-36, -20);
          gctx.lineTo(36, -20);
          gctx.lineTo(56, 78);
          gctx.lineTo(-56, 78);
          gctx.closePath();
          gctx.fill();
          gctx.stroke();
        }

        /* Little Golden Monster Horns & Floppy Ears */
        [-1, 1].forEach((dir) => {
          gctx.save();
          gctx.scale(dir, 1);
          /* Floppy Ear */
          gctx.fillStyle = '#7c3aed';
          gctx.beginPath();
          gctx.ellipse(48, -32, 16, 9, 0.4 + Math.sin(t * 4) * 0.08, 0, Math.PI * 2);
          gctx.fill();
          /* Golden Horn */
          gctx.fillStyle = '#fbbf24';
          gctx.strokeStyle = '#b45309';
          gctx.lineWidth = 2;
          gctx.beginPath();
          gctx.moveTo(22, -52);
          gctx.quadraticCurveTo(38, -78, 16, -74);
          gctx.closePath();
          gctx.fill();
          gctx.stroke();
          gctx.restore();
        });

        /* Plump Furry Monster Body */
        gctx.beginPath();
        gctx.ellipse(0, 12, 58, 68, 0, 0, Math.PI * 2);
        if (moko.transformId === 'rainbow') {
          const rGrad = gctx.createLinearGradient(-55, -55, 55, 70);
          rGrad.addColorStop(0, '#f43f5e');
          rGrad.addColorStop(0.33, '#eab308');
          rGrad.addColorStop(0.66, '#10b981');
          rGrad.addColorStop(1, '#3b82f6');
          gctx.fillStyle = rGrad;
        } else if (moko.transformId === 'dragon') {
          gctx.fillStyle = '#10b981';
        } else {
          const bGrad = gctx.createRadialGradient(-16, -18, 10, 0, 12, 68);
          bGrad.addColorStop(0, '#a78bfa');
          bGrad.addColorStop(1, '#6d28d9');
          gctx.fillStyle = bGrad;
        }
        gctx.fill();
        gctx.lineWidth = 3;
        gctx.strokeStyle = '#4c1d95';
        gctx.stroke();

        /* Cream Striped Monster Belly */
        gctx.fillStyle = '#ede9fe';
        gctx.beginPath();
        gctx.ellipse(0, 26, 36, 40, 0, 0, Math.PI * 2);
        gctx.fill();
        gctx.strokeStyle = '#c4b5fd';
        gctx.lineWidth = 2.5;
        [-10, 4, 18].forEach((sy) => {
          gctx.beginPath();
          gctx.arc(0, sy, 26, 0.25, Math.PI - 0.25);
          gctx.stroke();
        });

        /* Expressive Eye-Tracking Eyes */
        const lookAt = serveMug.active
          ? { x: serveMug.x, y: serveMug.y }
          : (dragItem && dragItem.kind === 'flask'
            ? { x: dragItem.flask.x, y: dragItem.flask.y }
            : pointer);
        const ang = Math.atan2(lookAt.y - my, lookAt.x - mx);
        const px = Math.cos(ang) * 4.2;
        const py = Math.sin(ang) * 3.4;

        [-19, 19].forEach((ex) => {
          gctx.fillStyle = '#ffffff';
          gctx.strokeStyle = '#4c1d95';
          gctx.lineWidth = 2.2;
          gctx.beginPath();
          gctx.arc(ex, -22, 13.5, 0, Math.PI * 2);
          gctx.fill();
          gctx.stroke();

          gctx.fillStyle = '#1e1b4b';
          gctx.beginPath();
          gctx.arc(ex + px, -22 + py, 6.2, 0, Math.PI * 2);
          gctx.fill();

          gctx.fillStyle = '#ffffff';
          gctx.beginPath();
          gctx.arc(ex + px - 2, -24 + py, 2.2, 0, Math.PI * 2);
          gctx.fill();
        });

        /* Dynamic Mouth (Smile -> Wide Open "AAAH!" when potion is ready -> Chewing/Gulping) */
        const open = moko.mouthOpen;
        if (moko.gulpTimer > 0) {
          /* Chewing / Gulping animation */
          const chew = Math.sin(t * 24) * 5;
          gctx.fillStyle = '#4c1d95';
          gctx.beginPath();
          gctx.ellipse(0, 2 + chew * 0.3, 16, 8 + Math.abs(chew), 0, 0, Math.PI * 2);
          gctx.fill();
        } else if (open > 0.25) {
          /* Wide-open excited "AAAH!" mouth waiting for the potion mug! */
          const mh = 12 + open * 16;
          gctx.fillStyle = '#3b0764';
          gctx.beginPath();
          gctx.ellipse(0, 4, 22, mh, 0, 0, Math.PI * 2);
          gctx.fill();
          /* Pink Tongue */
          gctx.fillStyle = '#fb7185';
          gctx.beginPath();
          gctx.ellipse(0, 4 + mh * 0.45, 13, mh * 0.42, 0, 0, Math.PI * 2);
          gctx.fill();
          /* Cute top snaggletooth */
          gctx.fillStyle = '#ffffff';
          gctx.beginPath();
          gctx.moveTo(-10, 4 - mh + 2);
          gctx.lineTo(-4, 4 - mh + 10);
          gctx.lineTo(2, 4 - mh + 2);
          gctx.fill();
        } else {
          /* Friendly grinning mouth with cute snaggletooth */
          gctx.strokeStyle = '#3b0764';
          gctx.lineWidth = 3.5;
          gctx.lineCap = 'round';
          gctx.beginPath();
          gctx.arc(0, -4, 18, 0.2, Math.PI - 0.2);
          gctx.stroke();

          gctx.fillStyle = '#ffffff';
          gctx.beginPath();
          gctx.moveTo(6, 11);
          gctx.lineTo(10, 18);
          gctx.lineTo(14, 10);
          gctx.closePath();
          gctx.fill();
        }

        /* Transformation 2: Jeweled Golden Crown on Moko's Head */
        if (moko.transformId === 'crown') {
          gctx.fillStyle = '#fbbf24';
          gctx.strokeStyle = '#b45309';
          gctx.lineWidth = 2.2;
          gctx.beginPath();
          gctx.moveTo(-24, -54);
          gctx.lineTo(-28, -80);
          gctx.lineTo(-10, -66);
          gctx.lineTo(0, -84);
          gctx.lineTo(10, -66);
          gctx.lineTo(28, -80);
          gctx.lineTo(24, -54);
          gctx.closePath();
          gctx.fill();
          gctx.stroke();
        }

        /* Transformation 4: Giant Iridescent Anti-Gravity Soap Bubble around Moko */
        if (moko.transformId === 'bubble') {
          gctx.strokeStyle = 'rgba(165, 243, 252, 0.85)';
          gctx.fillStyle = 'rgba(165, 243, 252, 0.14)';
          gctx.lineWidth = 3;
          gctx.beginPath();
          gctx.arc(0, 6, 82, 0, Math.PI * 2);
          gctx.fill();
          gctx.stroke();
        }

        /* Chubby Monster Paws (wave when happy or point to drain tap if overfilled!) */
        const overfilled = logicalVol > spec.targetVol && phase === 'brew';
        const pawY = moko.happyTimer > 0 ? -18 - Math.abs(Math.sin(t * 10)) * 12 : 24;
        gctx.fillStyle = '#8b5cf6';
        gctx.strokeStyle = '#4c1d95';
        gctx.lineWidth = 2.5;
        gctx.beginPath();
        gctx.arc(overfilled ? -68 : -54, overfilled ? 6 : pawY, 13, 0, Math.PI * 2);
        gctx.fill();
        gctx.stroke();
        gctx.beginPath();
        gctx.arc(54, pawY, 13, 0, Math.PI * 2);
        gctx.fill();
        gctx.stroke();

        /* Speech Bubble above Moko */
        if (moko.speechTimer > 0 && moko.speech) {
          gctx.direction = lang === 'he' ? 'rtl' : 'ltr';
          gctx.font = '700 15px Fredoka, Heebo, sans-serif';
          const tw = Math.max(76, gctx.measureText(moko.speech).width + 24);
          roundRectPath(gctx, -tw / 2, -116, tw, 30, 14);
          gctx.fillStyle = '#ffffff';
          gctx.fill();
          gctx.lineWidth = 2.5;
          gctx.strokeStyle = '#7c3aed';
          gctx.stroke();
          gctx.fillStyle = '#1e1b4b';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          gctx.fillText(moko.speech, 0, -101);
        }

        gctx.restore();
      }

      /* ---- Layer 7: Glowing Golden Potion Mug when Recipe is Ready ---- */
      function drawServeMug(gctx, t) {
        if (serveMug.scale < 0.05) return;
        gctx.save();
        gctx.translate(serveMug.x, serveMug.y);
        gctx.scale(serveMug.scale, serveMug.scale);

        /* Radiant Golden Halo */
        const pulse = 1 + Math.sin(t * 7) * 0.08;
        gctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
        gctx.beginPath();
        gctx.arc(0, 0, 44 * pulse, 0, Math.PI * 2);
        gctx.fill();

        /* Mug Handle */
        gctx.strokeStyle = '#fbbf24';
        gctx.lineWidth = 5;
        gctx.beginPath();
        gctx.arc(18, 2, 11, -Math.PI / 2, Math.PI / 2);
        gctx.stroke();

        /* Mug Body filled with the brewed potion colour */
        roundRectPath(gctx, -18, -18, 36, 40, 9);
        gctx.fillStyle = `rgb(${Math.round(liquidColor.r)},${Math.round(liquidColor.g)},${Math.round(liquidColor.b)})`;
        gctx.fill();
        gctx.lineWidth = 3;
        gctx.strokeStyle = '#fef08a';
        gctx.stroke();

        /* Foamy Star Top */
        gctx.fillStyle = '#ffffff';
        gctx.beginPath();
        gctx.ellipse(0, -17, 16, 5, 0, 0, Math.PI * 2);
        gctx.fill();

        /* Floating "Feed Moko!" Banner under the Mug */
        gctx.direction = lang === 'he' ? 'rtl' : 'ltr';
        gctx.font = '700 13.5px Fredoka, Heebo, sans-serif';
        const lw = Math.max(96, gctx.measureText(text.feedLabel).width + 18);
        roundRectPath(gctx, -lw / 2, 28, lw, 24, 12);
        gctx.fillStyle = '#10b981';
        gctx.fill();
        gctx.lineWidth = 2;
        gctx.strokeStyle = '#ffffff';
        gctx.stroke();
        gctx.fillStyle = '#ffffff';
        gctx.textAlign = 'center';
        gctx.textBaseline = 'middle';
        gctx.fillText(text.feedLabel, 0, 40);

        gctx.restore();
      }

      /* ---- Layer 8: Particles, Knife Trail & Floating Math Callouts ---- */
      function drawForegroundEffects(gctx) {
        if (dragItem && dragItem.kind === 'knife-swipe' && dragItem.points.length > 1) {
          gctx.save();
          gctx.strokeStyle = '#00e5ff';
          gctx.lineWidth = 4;
          gctx.lineCap = 'round';
          gctx.shadowColor = '#00e5ff';
          gctx.shadowBlur = 12;
          gctx.beginPath();
          dragItem.points.forEach((p, i) => {
            if (i === 0) gctx.moveTo(p.x, p.y);
            else gctx.lineTo(p.x, p.y);
          });
          gctx.stroke();
          gctx.restore();
        }

        particles.forEach((p) => {
          const alpha = Math.max(0, 1 - p.life / p.maxLife);
          gctx.save();
          gctx.globalAlpha = alpha;
          if (p.kind === 'star') {
            gctx.translate(p.x, p.y);
            gctx.rotate(p.rot);
            drawStar(gctx, 0, 0, p.r, 5, 0.45);
            gctx.fillStyle = p.color;
            gctx.fill();
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
          gctx.strokeStyle = '#120c21';
          gctx.strokeText(ft.str, ft.x, ft.y);
          gctx.fillStyle = ft.color;
          gctx.fillText(ft.str, ft.x, ft.y);
          gctx.restore();
        });
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

  EDGames.register('potion-lab', { sets: SETS, mount, unmount });
})();
