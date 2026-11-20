/* פנס היער הלוחץ / The Lantern in the Whispering Woods — Style 1 (Arise 3D clay &
   wood nocturnal woodland diorama with warm volumetric lantern rim-lighting and
   bokeh foreground) for ages 3–4.

   Core Play Loop (zero reading required):
   1. Listen & Seek: hear what woodland animal family is hiding and how many to find.
   2. Sweep the Golden Lantern: move your finger or mouse across the 3D nocturnal
      forest glade. Camouflaged creatures blend into the bark, moss, and fern
      shadows until the warm lantern cone illuminates them in golden rim-light!
   3. Tap-to-Count (1-to-1 correspondence): tap each discovered target creature;
      it hops happily, lights a golden firefly number orb (1, 2, 3...), and counts
      aloud in Hebrew or English!
   4. 4 Progressive Steps x 4 Rounds each = 16 rounds, scaling from large cozy
      animals in Step 1 to smaller, highly camouflaged creatures in Steps 2–4. */

(function () {
  const SETS = [
    { id: 'glade',   emoji: '🦉', label: { he: 'שביל הינשופים',    en: 'Hollow Oak Glade'    }, mode: 'glade'   },
    { id: 'thicket', emoji: '🌿', label: { he: 'מחבוא השרכים',     en: 'Fern & Bark Thicket' }, mode: 'thicket' },
    { id: 'deep',    emoji: '🐸', label: { he: 'אלומת הצללים',     en: 'Deep Camouflage'     }, mode: 'deep'    },
    { id: 'ranger',  emoji: '🏮', label: { he: 'אלופי היער הלילי', en: 'Night Ranger'        }, mode: 'ranger'  },
  ];

  const TEXT = {
    he: {
      ask: (count, name) => `האירו בפנס ומצאו ${count} ${name} שמסתתרים ביער!`,
      hintSweep: 'הזיזו את פנס הזהב בין העצים והשיחים וגעו בכל חיה שמצאתם כדי לספור בקול',
      hintMore: (done, total) => `מצאתם ${done} מתוך ${total} — המשיכו להאיר בפנס ולחפש!`,
      hintDone: 'כל הכבוד! מצאתם וספרתם את כולם!',
      targetAria: (name, idx) => `${name} מוסווה מספר ${idx} — לחצו להאיר ולספור`,
      species: {
        owl:      { name: 'גוזלי ינשוף',      sing: 'גוזל ינשוף' },
        hedgehog: { name: 'קיפודים קטנים',    sing: 'קיפוד קטן'  },
        bunny:    { name: 'ארנבוני יער',      sing: 'ארנבון יער' },
        fawn:     { name: 'עופרים ושועלים',   sing: 'עופר קטן'   },
        frog:     { name: 'צפרדעי טחב מוסוות', sing: 'צפרדע טחב'  },
        squirrel: { name: 'סנאי קליפה חומים', sing: 'סנאי אלון'  },
        dormouse: { name: 'נמנמני צללים זעירים', sing: 'נמנמן יער' },
      },
    },
    en: {
      ask: (count, name) => `Shine your lantern and find ${count} ${name} hiding in the woods!`,
      hintSweep: 'Sweep the golden lantern through the trees and ferns, then tap each animal to count aloud',
      hintMore: (done, total) => `Found ${done} of ${total} — keep sweeping your lantern to find the rest!`,
      hintDone: 'Wonderful! You found and counted them all!',
      targetAria: (name, idx) => `Camouflaged ${name} ${idx} — tap to shine lantern and count`,
      species: {
        owl:      { name: 'baby owls',            sing: 'baby owl'      },
        hedgehog: { name: 'baby hedgehogs',       sing: 'baby hedgehog' },
        bunny:    { name: 'woodland bunnies',     sing: 'woodland bunny' },
        fawn:     { name: 'fawns and fox cubs',   sing: 'little fawn'   },
        frog:     { name: 'camouflaged moss frogs', sing: 'moss frog'   },
        squirrel: { name: 'bark-brown squirrels', sing: 'oak squirrel'  },
        dormouse: { name: 'tiny shadow dormice',  sing: 'dormouse'      },
      },
    },
  };

  /* 4 Steps x 4 Rounds = 16 Handcrafted Nocturnal Forest Rounds.
     Notice how each step increases the number of animals in the scene, shrinks
     their size (`scale`: 1.0 -> 0.78 -> 0.62 -> 0.50), and deepens their natural
     camouflage (`baseAlpha`: 0.58 -> 0.25 -> 0.11 -> 0.06 outside the lantern beam). */
  const ROUNDS = {
    glade: [
      {
        kind: 'owl', scale: 1.0, baseAlpha: 0.6,
        targets: [
          { u: 0.468, v: 0.435 }, { u: 0.496, v: 0.372 }, { u: 0.524, v: 0.435 },
        ],
        neighbors: [
          { kind: 'hedgehog', u: 0.265, v: 0.635 }, { kind: 'hedgehog', u: 0.308, v: 0.628 },
          { kind: 'fawn', u: 0.618, v: 0.635 }, { kind: 'frog', u: 0.685, v: 0.71 },
        ],
      },
      {
        kind: 'hedgehog', scale: 0.96, baseAlpha: 0.55,
        targets: [
          { u: 0.258, v: 0.635 }, { u: 0.305, v: 0.628 }, { u: 0.382, v: 0.685 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.472, v: 0.435 }, { kind: 'owl', u: 0.522, v: 0.435 },
          { kind: 'fawn', u: 0.618, v: 0.635 }, { kind: 'squirrel', u: 0.39, v: 0.31 },
        ],
      },
      {
        kind: 'bunny', scale: 0.92, baseAlpha: 0.5,
        targets: [
          { u: 0.21, v: 0.69 }, { u: 0.355, v: 0.66 }, { u: 0.555, v: 0.67 }, { u: 0.69, v: 0.69 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.496, v: 0.38 }, { kind: 'hedgehog', u: 0.28, v: 0.63 },
          { kind: 'fawn', u: 0.62, v: 0.63 }, { kind: 'squirrel', u: 0.59, v: 0.27 },
        ],
      },
      {
        kind: 'fawn', scale: 0.9, baseAlpha: 0.46,
        targets: [
          { u: 0.618, v: 0.635 }, { u: 0.42, v: 0.65 }, { u: 0.19, v: 0.64 }, { u: 0.71, v: 0.66 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.47, v: 0.43 }, { kind: 'owl', u: 0.52, v: 0.43 },
          { kind: 'hedgehog', u: 0.27, v: 0.63 }, { kind: 'frog', u: 0.65, v: 0.73 },
        ],
      },
    ],
    thicket: [
      {
        kind: 'owl', scale: 0.78, baseAlpha: 0.26,
        targets: [
          { u: 0.47, v: 0.43 }, { u: 0.52, v: 0.43 }, { u: 0.39, v: 0.29 }, { u: 0.585, v: 0.27 },
        ],
        neighbors: [
          { kind: 'hedgehog', u: 0.27, v: 0.63 }, { kind: 'frog', u: 0.54, v: 0.69 },
          { kind: 'squirrel', u: 0.44, v: 0.55 }, { kind: 'fawn', u: 0.62, v: 0.63 },
          { kind: 'bunny', u: 0.18, v: 0.67 },
        ],
      },
      {
        kind: 'frog', scale: 0.76, baseAlpha: 0.24,
        targets: [
          { u: 0.535, v: 0.69 }, { u: 0.665, v: 0.72 }, { u: 0.34, v: 0.71 }, { u: 0.22, v: 0.53 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.495, v: 0.39 }, { kind: 'hedgehog', u: 0.28, v: 0.63 },
          { kind: 'squirrel', u: 0.45, v: 0.28 }, { kind: 'fawn', u: 0.62, v: 0.63 },
          { kind: 'bunny', u: 0.39, v: 0.66 },
        ],
      },
      {
        kind: 'squirrel', scale: 0.74, baseAlpha: 0.22,
        targets: [
          { u: 0.37, v: 0.33 }, { u: 0.44, v: 0.54 }, { u: 0.56, v: 0.49 },
          { u: 0.61, v: 0.25 }, { u: 0.26, v: 0.48 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.495, v: 0.42 }, { kind: 'hedgehog', u: 0.28, v: 0.63 },
          { kind: 'frog', u: 0.55, v: 0.71 }, { kind: 'fawn', u: 0.62, v: 0.63 },
          { kind: 'bunny', u: 0.17, v: 0.66 },
        ],
      },
      {
        kind: 'hedgehog', scale: 0.72, baseAlpha: 0.2,
        targets: [
          { u: 0.265, v: 0.635 }, { u: 0.308, v: 0.628 }, { u: 0.175, v: 0.68 },
          { u: 0.415, v: 0.675 }, { u: 0.57, v: 0.685 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.47, v: 0.43 }, { kind: 'owl', u: 0.52, v: 0.43 },
          { kind: 'squirrel', u: 0.38, v: 0.28 }, { kind: 'frog', u: 0.67, v: 0.72 },
          { kind: 'fawn', u: 0.62, v: 0.63 },
        ],
      },
    ],
    deep: [
      {
        kind: 'frog', scale: 0.62, baseAlpha: 0.12,
        targets: [
          { u: 0.19, v: 0.56 }, { u: 0.33, v: 0.69 }, { u: 0.48, v: 0.65 },
          { u: 0.56, v: 0.71 }, { u: 0.69, v: 0.72 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.495, v: 0.41 }, { kind: 'hedgehog', u: 0.27, v: 0.63 },
          { kind: 'squirrel', u: 0.43, v: 0.29 }, { kind: 'dormouse', u: 0.55, v: 0.54 },
          { kind: 'fawn', u: 0.62, v: 0.63 }, { kind: 'bunny', u: 0.38, v: 0.64 },
        ],
      },
      {
        kind: 'dormouse', scale: 0.6, baseAlpha: 0.11,
        targets: [
          { u: 0.23, v: 0.49 }, { u: 0.39, v: 0.58 }, { u: 0.45, v: 0.32 },
          { u: 0.55, v: 0.56 }, { u: 0.67, v: 0.59 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.47, v: 0.43 }, { kind: 'owl', u: 0.52, v: 0.43 },
          { kind: 'hedgehog', u: 0.29, v: 0.63 }, { kind: 'frog', u: 0.54, v: 0.70 },
          { kind: 'squirrel', u: 0.60, v: 0.26 }, { kind: 'fawn', u: 0.62, v: 0.63 },
        ],
      },
      {
        kind: 'squirrel', scale: 0.58, baseAlpha: 0.1,
        targets: [
          { u: 0.15, v: 0.42 }, { u: 0.35, v: 0.27 }, { u: 0.43, v: 0.51 },
          { u: 0.57, v: 0.47 }, { u: 0.64, v: 0.24 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.495, v: 0.41 }, { kind: 'hedgehog', u: 0.27, v: 0.63 },
          { kind: 'dormouse', u: 0.37, v: 0.65 }, { kind: 'frog', u: 0.53, v: 0.70 },
          { kind: 'fawn', u: 0.62, v: 0.63 }, { kind: 'bunny', u: 0.21, v: 0.68 },
        ],
      },
      {
        kind: 'owl', scale: 0.58, baseAlpha: 0.1,
        targets: [
          { u: 0.47, v: 0.43 }, { u: 0.496, v: 0.37 }, { u: 0.522, v: 0.43 },
          { u: 0.33, v: 0.22 }, { u: 0.63, v: 0.21 }, { u: 0.16, v: 0.35 },
        ],
        neighbors: [
          { kind: 'hedgehog', u: 0.27, v: 0.63 }, { kind: 'hedgehog', u: 0.31, v: 0.63 },
          { kind: 'frog', u: 0.54, v: 0.70 }, { kind: 'dormouse', u: 0.43, v: 0.57 },
          { kind: 'fawn', u: 0.62, v: 0.63 }, { kind: 'squirrel', u: 0.57, v: 0.51 },
        ],
      },
    ],
    ranger: [
      {
        kind: 'frog', scale: 0.52, baseAlpha: 0.08,
        targets: [
          { u: 0.18, v: 0.58 }, { u: 0.32, v: 0.71 }, { u: 0.45, v: 0.67 },
          { u: 0.54, v: 0.71 }, { u: 0.68, v: 0.73 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.495, v: 0.41 }, { kind: 'hedgehog', u: 0.27, v: 0.63 },
          { kind: 'squirrel', u: 0.38, v: 0.28 }, { kind: 'dormouse', u: 0.56, v: 0.53 },
          { kind: 'fawn', u: 0.62, v: 0.63 }, { kind: 'bunny', u: 0.22, v: 0.68 },
        ],
      },
      {
        kind: 'dormouse', scale: 0.5, baseAlpha: 0.07,
        targets: [
          { u: 0.24, v: 0.48 }, { u: 0.37, v: 0.56 }, { u: 0.44, v: 0.31 },
          { u: 0.56, v: 0.54 }, { u: 0.66, v: 0.58 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.47, v: 0.43 }, { kind: 'owl', u: 0.52, v: 0.43 },
          { kind: 'hedgehog', u: 0.28, v: 0.63 }, { kind: 'frog', u: 0.53, v: 0.70 },
          { kind: 'squirrel', u: 0.61, v: 0.25 }, { kind: 'fawn', u: 0.62, v: 0.63 },
        ],
      },
      {
        kind: 'squirrel', scale: 0.5, baseAlpha: 0.07,
        targets: [
          { u: 0.15, v: 0.39 }, { u: 0.34, v: 0.25 }, { u: 0.43, v: 0.50 },
          { u: 0.52, v: 0.28 }, { u: 0.57, v: 0.49 }, { u: 0.65, v: 0.23 },
        ],
        neighbors: [
          { kind: 'owl', u: 0.495, v: 0.41 }, { kind: 'hedgehog', u: 0.27, v: 0.63 },
          { kind: 'dormouse', u: 0.39, v: 0.65 }, { kind: 'frog', u: 0.54, v: 0.70 },
          { kind: 'fawn', u: 0.62, v: 0.63 }, { kind: 'bunny', u: 0.20, v: 0.67 },
        ],
      },
      {
        kind: 'owl', scale: 0.48, baseAlpha: 0.06,
        targets: [
          { u: 0.47, v: 0.43 }, { u: 0.496, v: 0.37 }, { u: 0.522, v: 0.43 },
          { u: 0.31, v: 0.22 }, { u: 0.62, v: 0.21 }, { u: 0.16, v: 0.33 },
        ],
        neighbors: [
          { kind: 'hedgehog', u: 0.27, v: 0.63 }, { kind: 'hedgehog', u: 0.31, v: 0.63 },
          { kind: 'frog', u: 0.53, v: 0.70 }, { kind: 'dormouse', u: 0.43, v: 0.57 },
          { kind: 'fawn', u: 0.62, v: 0.63 }, { kind: 'squirrel', u: 0.57, v: 0.50 },
        ],
      },
    ],
  };

  const CSS = `
    .ww-wrap { width: 100%; max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .ww-top { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 0 4px; }
    .ww-top .kit-head { flex: 1; min-width: 220px; }
    .ww-top .kit-head h2 { font-size: clamp(1.05rem, 2.1vw, 1.32rem); line-height: 1.3; }
    .ww-stage-box {
      position: relative; width: 100%; height: clamp(420px, 64vh, 560px);
      border-radius: 24px; overflow: hidden;
      background: #06131c;
      border: 3px solid #3d2817;
      box-shadow: 0 14px 36px rgba(5, 12, 18, .55), inset 0 2px 10px rgba(255, 210, 120, .15);
      user-select: none; -webkit-user-select: none; touch-action: none;
    }
    .ww-canvas { width: 100%; height: 100%; display: block; cursor: crosshair; }
    .ww-ui { position: absolute; inset: 0; pointer-events: none; }
    .ww-hit {
      position: absolute; pointer-events: auto;
      transform: translate(-50%, -50%);
      width: 56px; height: 56px; border-radius: 50%;
      background: transparent; border: 2px solid transparent;
      cursor: pointer; padding: 0; margin: 0; color: transparent; font-size: 0;
    }
    .ww-hit:focus-visible {
      outline: 3px solid #ffd23f; outline-offset: 2px;
      background: rgba(255, 210, 63, .18);
    }
    .ww-counter-bar {
      position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 8px; align-items: center;
      background: rgba(9, 20, 28, .86); backdrop-filter: blur(8px);
      border: 1.5px solid rgba(245, 158, 11, .5);
      padding: 6px 16px; border-radius: 99px;
      pointer-events: none;
    }
    .ww-slot {
      width: 28px; height: 28px; border-radius: 50%;
      display: grid; place-items: center;
      font-family: Fredoka, sans-serif; font-weight: 700; font-size: 14px;
      background: rgba(255, 255, 255, .08);
      border: 1.5px solid rgba(255, 255, 255, .2);
      color: rgba(255, 255, 255, .35);
      transition: transform .2s cubic-bezier(.34,1.56,.64,1), background .2s;
    }
    .ww-slot.found {
      background: linear-gradient(180deg, #fbbf24, #d97706);
      border-color: #fef08a; color: #1c1004;
      transform: scale(1.12);
      box-shadow: 0 0 12px rgba(251, 191, 36, .6);
    }
    @media (max-width: 600px) {
      .ww-stage-box { height: auto; aspect-ratio: 16 / 10; min-height: 235px; max-height: 320px; border-radius: 18px; }
      .ww-hit { width: 44px; height: 44px; }
      .ww-slot { width: 22px; height: 22px; font-size: 11px; }
    }
  `;

  function sfxFind(num) {
    if (!window.EDSound || !EDSound.canPlay()) return;
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const f = notes[(num - 1) % notes.length];
    EDSound.tone({ freq: f, end: f * 1.15, dur: 0.16, type: 'sine', gain: 0.18 });
  }

  function sfxRustle() {
    if (!window.EDSound || !EDSound.canPlay()) return;
    EDSound.tone({ freq: 310, end: 390, dur: 0.08, type: 'triangle', gain: 0.12 });
  }

  let cleanupFn = null;

  function mount(root, ctx) {
    EDKit.style('ww-style', CSS);
    const lang = ctx.lang;
    const t = TEXT[lang] || TEXT.he;
    const mode = (ctx.set && ctx.set.mode) || 'glade';
    const rounds = ROUNDS[mode] || ROUNDS.glade;

    const bgImg = new Image();
    bgImg.src = 'assets/worlds/whispering-woods.jpg';

    let roundIdx = 0;
    let round = rounds[0];
    let locked = false;
    let rafId = 0;
    let timeTick = 0;
    const tm = EDKit.timers();

    /* Lantern focus normalized coordinates (0..1) */
    const LANTERN_HAND = { u: 0.755, v: 0.505 };
    let lanternU = 0.495, lanternV = 0.42;
    let targetU = 0.495, targetV = 0.42;
    let foundStates = []; // [{ found: bool, num: int, pop: float }]
    let sparks = [];

    const fireflies = Array.from({ length: 34 }, () => ({
      u: 0.1 + Math.random() * 0.8,
      v: 0.15 + Math.random() * 0.65,
      r: 1.4 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
    }));

    function spawnSparks(x, y) {
      for (let i = 0; i < 16; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.4 + Math.random() * 3.8;
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.2, r: 1.8 + Math.random() * 2.4, life: 1 });
      }
    }

    root.innerHTML = `
      <div class="kit ww-wrap">
        <div class="ww-top">
          ${EDKit.dots(rounds.length, 0)}
          ${EDKit.head('', lang)}
        </div>
        <p class="kit-hint" id="ww-hint">${t.hintSweep}</p>
        <div class="ww-stage-box" id="ww-box">
          <canvas class="ww-canvas" id="ww-canvas"></canvas>
          <div class="ww-ui" id="ww-ui"></div>
          <div class="ww-counter-bar" id="ww-counter"></div>
        </div>
      </div>
    `;

    const box = root.querySelector('#ww-box');
    const canvas = root.querySelector('#ww-canvas');
    const ctx2d = canvas.getContext('2d');
    const uiLayer = root.querySelector('#ww-ui');
    const counterBar = root.querySelector('#ww-counter');
    const headH2 = root.querySelector('.kit-head h2');
    const hintEl = root.querySelector('#ww-hint');

    let W = 880, H = 500, dpr = 1;
    let hitButtons = [];

    function drawArtCover() {
      const bg = ctx2d.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#04121b');
      bg.addColorStop(1, '#091812');
      ctx2d.fillStyle = bg;
      ctx2d.fillRect(0, 0, W, H);

      if (!bgImg.complete || !bgImg.naturalWidth) {
        return (u, v) => ({ x: u * W, y: v * H });
      }
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

    function syncHitButtons() {
      const map = currentMapper();
      hitButtons.forEach((btn, idx) => {
        const tg = round.targets[idx];
        if (!tg) return;
        const p = map(tg.u, tg.v);
        btn.style.left = `${p.x}px`;
        btn.style.top = `${p.y}px`;
      });
    }

    function resize() {
      const r = box.getBoundingClientRect();
      W = Math.max(300, r.width);
      H = Math.max(220, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      syncHitButtons();
    }

    function loadRound(idx) {
      roundIdx = idx;
      round = rounds[idx];
      locked = false;
      foundStates = round.targets.map(() => ({ found: false, num: 0, pop: 0 }));

      const spName = (t.species[round.kind] || t.species.owl).name;
      headH2.textContent = t.ask(round.targets.length, spName);
      hintEl.textContent = t.hintSweep;

      const dotsEl = root.querySelector('.kit-dots');
      if (dotsEl) dotsEl.outerHTML = EDKit.dots(rounds.length, roundIdx);

      /* Build bottom counter slots */
      counterBar.innerHTML = round.targets.map((_, i) => `<span class="ww-slot" data-slot="${i}">${i + 1}</span>`).join('');

      /* Build accessible HTML tap targets for each hidden target creature */
      uiLayer.innerHTML = '';
      hitButtons = round.targets.map((tg, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ww-hit';
        b.dataset.animal = String(i);
        b.setAttribute('aria-label', t.targetAria((t.species[round.kind] || t.species.owl).sing, i + 1));
        b.addEventListener('click', () => onTapTarget(i));
        uiLayer.append(b);
        return b;
      });
      syncHitButtons();

      const voiceKey = mode === 'glade' ? 'ww-glade'
        : mode === 'thicket' ? 'ww-thicket'
        : mode === 'deep' ? 'ww-deep' : 'ww-ranger';
      EDKit.voice(root, voiceKey, lang);
    }

    function onTapTarget(idx) {
      if (locked) return;
      const st = foundStates[idx];
      const tg = round.targets[idx];
      targetU = tg.u;
      targetV = tg.v;
      if (st.found) return;

      const nextNum = foundStates.filter((s) => s.found).length + 1;
      st.found = true;
      st.num = nextNum;
      st.pop = 1;

      const map = currentMapper();
      const p = map(tg.u, tg.v);
      spawnSparks(p.x, p.y);
      sfxFind(nextNum);

      /* Count out loud in Hebrew or English! */
      if (window.EDVoice && window.EDVoiceLines) {
        EDVoice.say(EDVoiceLines.num(nextNum), lang);
      }

      const slot = counterBar.querySelector(`[data-slot="${nextNum - 1}"]`);
      if (slot) slot.classList.add('found');

      const total = round.targets.length;
      if (nextNum < total) {
        hintEl.textContent = t.hintMore(nextNum, total);
      } else {
        hintEl.textContent = t.hintDone;
        locked = true;
        const allDots = root.querySelectorAll('.kit-dot');
        if (allDots[roundIdx]) allDots[roundIdx].classList.add('done');

        tm.later(() => {
          EDKit.praise(lang);
          if (roundIdx + 1 < rounds.length) {
            tm.later(() => loadRound(roundIdx + 1), 900);
          } else {
            tm.later(() => {
              cancelAnimationFrame(rafId);
              EDKit.end(root, ctx, lang);
            }, 900);
          }
        }, 550);
      }
    }

    /* Pointer tracking for continuous lantern sweep */
    function updateLanternFromPointer(e) {
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      targetU = Math.max(0.08, Math.min(0.92, px / r.width));
      targetV = Math.max(0.1, Math.min(0.88, py / r.height));
    }

    box.addEventListener('pointermove', updateLanternFromPointer);
    box.addEventListener('pointerdown', (e) => {
      updateLanternFromPointer(e);
      if (locked) return;
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const map = currentMapper();

      /* Check if pointer tapped near a target creature */
      for (let i = 0; i < round.targets.length; i++) {
        const p = map(round.targets[i].u, round.targets[i].v);
        if (Math.hypot(px - p.x, py - p.y) < 38) {
          onTapTarget(i);
          return;
        }
      }
      /* Check if pointer tapped a camouflaged neighbor -> cute rustle! */
      for (const nb of round.neighbors) {
        const p = map(nb.u, nb.v);
        if (Math.hypot(px - p.x, py - p.y) < 34) {
          sfxRustle();
          spawnSparks(p.x, p.y);
          return;
        }
      }
    });

    /* ---- Sculpted 3D Clay Creature Renderer with Camouflage & Rim-Lighting ---- */
    function drawCreature(x, y, kind, scale, litFactor, foundState, idx) {
      ctx2d.save();
      const bob = Math.sin(timeTick * 0.08 + idx * 1.7) * (foundState && foundState.found ? 4 : 1.5);
      const s = scale * (W < 540 ? 0.78 : 1) * (1 + (foundState ? foundState.pop * 0.25 : 0));
      ctx2d.translate(x, y + bob);
      ctx2d.scale(s, s);

      /* Camouflage blending: outside lantern beam, alpha drops to round.baseAlpha */
      const alpha = foundState && foundState.found
        ? 1
        : Math.min(1, round.baseAlpha + litFactor * (1 - round.baseAlpha));
      ctx2d.globalAlpha = alpha;

      /* Warm golden rim-light halo when illuminated by the lantern */
      if (litFactor > 0.2 || (foundState && foundState.found)) {
        const glow = ctx2d.createRadialGradient(0, 0, 4, 0, 0, 32);
        glow.addColorStop(0, `rgba(255, 215, 95, ${0.55 * Math.max(litFactor, foundState && foundState.found ? 0.9 : 0)})`);
        glow.addColorStop(1, 'rgba(255, 160, 30, 0)');
        ctx2d.fillStyle = glow;
        ctx2d.beginPath();
        ctx2d.arc(0, 0, 32, 0, Math.PI * 2);
        ctx2d.fill();
      }

      /* Palette per woodland species (camouflaged bark/moss tones warming in lantern light) */
      const palettes = {
        owl:      { body: '#8d5b34', belly: '#d8b482', rim: '#ffd166' },
        hedgehog: { body: '#5c4028', belly: '#c69f73', rim: '#ffca58' },
        bunny:    { body: '#9c7a56', belly: '#ead7bd', rim: '#ffe28a' },
        fawn:     { body: '#a85d28', belly: '#f0cfa0', rim: '#ffd670' },
        frog:     { body: '#36633b', belly: '#87b875', rim: '#b7f07b' },
        squirrel: { body: '#9e471c', belly: '#e39c5b', rim: '#ffc966' },
        dormouse: { body: '#6e5239', belly: '#cbb092', rim: '#ffe082' },
      };
      const pal = palettes[kind] || palettes.owl;

      /* Ears / Tufts / Spines */
      ctx2d.fillStyle = pal.body;
      ctx2d.strokeStyle = litFactor > 0.25 || (foundState && foundState.found) ? pal.rim : '#1f140b';
      ctx2d.lineWidth = 2;

      if (kind === 'bunny') {
        ctx2d.beginPath();
        ctx2d.ellipse(-7, -20, 4.5, 11, -0.15, 0, Math.PI * 2);
        ctx2d.ellipse(7, -20, 4.5, 11, 0.15, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.stroke();
      } else if (kind === 'hedgehog') {
        ctx2d.beginPath();
        ctx2d.arc(0, 2, 19, Math.PI, 0);
        ctx2d.fill();
        ctx2d.stroke();
      } else if (kind === 'squirrel' || kind === 'fawn' || kind === 'dormouse') {
        ctx2d.beginPath();
        ctx2d.arc(-10, -13, 5.5, 0, Math.PI * 2);
        ctx2d.arc(10, -13, 5.5, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.stroke();
      }

      /* Sculpted Clay Body */
      ctx2d.fillStyle = pal.body;
      ctx2d.beginPath();
      ctx2d.ellipse(0, 2, 16, 17, 0, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.stroke();

      /* Soft Belly Patch */
      ctx2d.fillStyle = pal.belly;
      ctx2d.beginPath();
      ctx2d.ellipse(0, 6, 10, 10, 0, 0, Math.PI * 2);
      ctx2d.fill();

      /* Blinking Glossy Eyes (visible even in partial shadow so kids spot subtle eye glints!) */
      const blink = Math.sin(timeTick * 0.05 + idx * 2.3) > 0.94;
      ctx2d.globalAlpha = Math.max(alpha, 0.48 + litFactor * 0.52);
      if (!blink) {
        ctx2d.fillStyle = '#fff9e6';
        ctx2d.beginPath();
        ctx2d.arc(-6, -3, 4.2, 0, Math.PI * 2);
        ctx2d.arc(6, -3, 4.2, 0, Math.PI * 2);
        ctx2d.fill();

        ctx2d.fillStyle = '#18120c';
        ctx2d.beginPath();
        ctx2d.arc(-5.5, -3, 2.3, 0, Math.PI * 2);
        ctx2d.arc(6.5, -3, 2.3, 0, Math.PI * 2);
        ctx2d.fill();

        ctx2d.fillStyle = '#ffffff';
        ctx2d.beginPath();
        ctx2d.arc(-6.4, -4, 1, 0, Math.PI * 2);
        ctx2d.arc(5.6, -4, 1, 0, Math.PI * 2);
        ctx2d.fill();
      }

      /* Beak or Nose */
      ctx2d.fillStyle = kind === 'owl' ? '#f59e0b' : '#2d180e';
      ctx2d.beginPath();
      ctx2d.arc(0, 1, 2.4, 0, Math.PI * 2);
      ctx2d.fill();

      ctx2d.restore();

      /* Golden Firefly Number Orb above discovered target creatures */
      if (foundState && foundState.found) {
        foundState.pop *= 0.86;
        const orbY = y - 28 * scale + bob;
        const orbR = W < 540 ? 12 : 14.5;
        ctx2d.save();
        ctx2d.fillStyle = '#f59e0b';
        ctx2d.strokeStyle = '#fef08a';
        ctx2d.lineWidth = 2.2;
        ctx2d.beginPath();
        ctx2d.arc(x, orbY, orbR, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.stroke();

        ctx2d.fillStyle = '#1c1004';
        ctx2d.font = `700 ${W < 540 ? 12 : 14}px Fredoka, sans-serif`;
        ctx2d.textAlign = 'center';
        ctx2d.fillText(String(foundState.num), x, orbY + 4.5);
        ctx2d.restore();
      }
    }

    function tick() {
      timeTick++;
      lanternU += (targetU - lanternU) * 0.16;
      lanternV += (targetV - lanternV) * 0.16;

      ctx2d.save();
      ctx2d.scale(dpr, dpr);

      const map = drawArtCover();
      const hand = map(LANTERN_HAND.u, LANTERN_HAND.v);
      const focus = map(lanternU, lanternV);
      const beamRadius = Math.min(W, H) * 0.24;

      /* 1. Draw Camouflaged Background Neighbor Creatures */
      round.neighbors.forEach((nb, i) => {
        const p = map(nb.u, nb.v);
        const dist = Math.hypot(p.x - focus.x, p.y - focus.y);
        const lit = Math.max(0, 1 - dist / beamRadius);
        drawCreature(p.x, p.y, nb.kind, round.scale * 0.92, lit, null, i + 20);
      });

      /* 2. Draw Target Creatures to Find & Count */
      round.targets.forEach((tg, i) => {
        const p = map(tg.u, tg.v);
        const dist = Math.hypot(p.x - focus.x, p.y - focus.y);
        const lit = Math.max(0, 1 - dist / beamRadius);
        drawCreature(p.x, p.y, round.kind, round.scale, lit, foundStates[i], i);
      });

      /* 3. Volumetric Golden Lantern Beam & Spotlight Halo */
      ctx2d.save();
      ctx2d.globalCompositeOperation = 'screen';
      const beamGrad = ctx2d.createLinearGradient(hand.x, hand.y, focus.x, focus.y);
      beamGrad.addColorStop(0, 'rgba(255, 210, 105, 0.42)');
      beamGrad.addColorStop(1, 'rgba(255, 185, 65, 0.08)');
      ctx2d.fillStyle = beamGrad;
      ctx2d.beginPath();
      ctx2d.moveTo(hand.x, hand.y);
      ctx2d.lineTo(focus.x - beamRadius * 0.55, focus.y - beamRadius * 0.55);
      ctx2d.lineTo(focus.x + beamRadius * 0.55, focus.y + beamRadius * 0.55);
      ctx2d.closePath();
      ctx2d.fill();

      const spotGrad = ctx2d.createRadialGradient(focus.x, focus.y, 4, focus.x, focus.y, beamRadius);
      spotGrad.addColorStop(0, 'rgba(255, 232, 138, 0.52)');
      spotGrad.addColorStop(0.55, 'rgba(255, 165, 45, 0.2)');
      spotGrad.addColorStop(1, 'rgba(255, 120, 0, 0)');
      ctx2d.fillStyle = spotGrad;
      ctx2d.beginPath();
      ctx2d.arc(focus.x, focus.y, beamRadius, 0, Math.PI * 2);
      ctx2d.fill();

      /* Drifting Forest Fireflies */
      fireflies.forEach((f) => {
        const fp = map(f.u, f.v);
        const fx = fp.x + Math.sin(timeTick * 0.03 + f.phase) * 14;
        const fy = fp.y + Math.cos(timeTick * 0.025 + f.phase) * 10;
        const a = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(timeTick * 0.07 + f.phase));
        ctx2d.fillStyle = `rgba(255, 230, 115, ${a})`;
        ctx2d.beginPath();
        ctx2d.arc(fx, fy, f.r, 0, Math.PI * 2);
        ctx2d.fill();
      });

      /* Celebration Firefly Sparks */
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.04;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx2d.fillStyle = `rgba(255, 225, 100, ${s.life})`;
        ctx2d.beginPath();
        ctx2d.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx2d.fill();
      }
      ctx2d.restore();

      ctx2d.restore();
      rafId = requestAnimationFrame(tick);
    }

    resize();
    bgImg.onload = () => syncHitButtons();
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

  EDGames.register('whispering-woods', { sets: SETS, mount, unmount });
})();
