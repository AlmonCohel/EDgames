/* פנס היער הלוחץ / The Lantern in the Whispering Woods
   Sculpted polymer-clay nocturnal woodland diorama for ages 3–4.

   - Empty clay diorama background (assets/worlds/whispering-woods/bg.jpg)
   - 6 woodland animals as transparent PNG cut-outs (hidden, found, happy):
     owl, hedgehog, bunny, frog, squirrel, dormouse
   - 4 foreground hiding-cover cut-outs (fern, leaves, mushrooms, hollow)
   - Lantern girl cut-out (looking, pointing, cheering)
   - Night dark-teal tint outside the lantern beam, full warm color inside it,
     soft ground shadows, spoken task per round, spoken count on every tap. */

(function () {
  const ART = 'assets/worlds/whispering-woods/';
  const SPECIES = ['owl', 'hedgehog', 'bunny', 'frog', 'squirrel', 'dormouse'];
  const COVERS = ['fern', 'leaves', 'mushrooms', 'hollow'];
  const GIRL_POSES = ['looking', 'pointing', 'cheering'];
  const SMALL_SPECIES = new Set(['frog', 'dormouse', 'hedgehog']);

  const SETS = [
    { id: 'tree',   emoji: '🦉', label: { he: 'העץ',   en: 'Tree'   }, mode: 'tree'   },
    { id: 'leaves', emoji: '🌿', label: { he: 'העלים', en: 'Leaves' }, mode: 'leaves' },
    { id: 'stream', emoji: '🐸', label: { he: 'הנחל',  en: 'Stream' }, mode: 'stream' },
    { id: 'woods',  emoji: '🏮', label: { he: 'היער',  en: 'Woods'  }, mode: 'woods'  },
  ];

  const TEXT = {
    he: {
      ask: (n, name) => `מצאו ${n} ${name}!`,
      tip: 'הזיזו את האצבע להאיר בפנס ולחצו על כל חיה שמצאתם',
      done: 'כל הכבוד! מצאתם את כולם!',
      infoLabel: 'הוראות להורים',
      targetAria: (name, idx) => `${name} ${idx}`,
      species: {
        owl:      { name: 'ינשופים',  sing: 'ינשוף'  },
        hedgehog: { name: 'קיפודים',  sing: 'קיפוד'  },
        bunny:    { name: 'ארנבים',   sing: 'ארנב'   },
        frog:     { name: 'צפרדעים',  sing: 'צפרדע'  },
        squirrel: { name: 'סנאים',    sing: 'סנאי'   },
        dormouse: { name: 'עכברונים', sing: 'עכברון' },
      },
    },
    en: {
      ask: (n, name) => `Find ${n} ${name}!`,
      tip: 'Move your finger to shine the lantern, then tap each animal you find',
      done: 'Yay! You found them all!',
      infoLabel: 'Parent note',
      targetAria: (name, idx) => `${name} ${idx}`,
      species: {
        owl:      { name: 'owls',        sing: 'owl'          },
        hedgehog: { name: 'hedgehogs',   sing: 'hedgehog'     },
        bunny:    { name: 'bunnies',     sing: 'bunny'        },
        frog:     { name: 'frogs',       sing: 'frog'         },
        squirrel: { name: 'squirrels',   sing: 'squirrel'     },
        dormouse: { name: 'little mice', sing: 'little mouse' },
      },
    },
  };

  /* Hiding spots carefully mapped onto bg.jpg landmarks (u: 0.14..0.72 so every
     spot is cleanly visible on phone, tablet, and laptop; girl stands at u=0.835).
     `cover`: 'hollow' | 'log' | 'fern' | 'mushrooms' | 'leaves' (small animals only) | 'none' */
  const ROUNDS = {
    tree: [
      {
        kind: 'owl', scale: 1.0,
        targets: [
          { u: 0.456, v: 0.425, cover: 'hollow' },
          { u: 0.500, v: 0.368, cover: 'hollow' },
          { u: 0.544, v: 0.425, cover: 'hollow' },
        ],
        neighbors: [
          { kind: 'hedgehog', u: 0.270, v: 0.612, cover: 'log' },
          { kind: 'bunny',    u: 0.185, v: 0.665, cover: 'fern' },
          { kind: 'frog',     u: 0.618, v: 0.648, cover: 'leaves' },
        ],
      },
      {
        kind: 'hedgehog', scale: 0.98,
        targets: [
          { u: 0.258, v: 0.614, cover: 'log' },
          { u: 0.312, v: 0.618, cover: 'log' },
          { u: 0.415, v: 0.668, cover: 'leaves' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.498, v: 0.398, cover: 'hollow' },
          { kind: 'squirrel', u: 0.348, v: 0.270, cover: 'none' },
          { kind: 'frog',     u: 0.625, v: 0.655, cover: 'mushrooms' },
        ],
      },
      {
        kind: 'bunny', scale: 0.96,
        targets: [
          { u: 0.185, v: 0.665, cover: 'fern' },
          { u: 0.395, v: 0.658, cover: 'mushrooms' },
          { u: 0.615, v: 0.642, cover: 'fern' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.498, v: 0.398, cover: 'hollow' },
          { kind: 'hedgehog', u: 0.275, v: 0.614, cover: 'log' },
          { kind: 'dormouse', u: 0.515, v: 0.668, cover: 'leaves' },
        ],
      },
      {
        kind: 'owl', scale: 0.92,
        targets: [
          { u: 0.468, v: 0.425, cover: 'hollow' },
          { u: 0.526, v: 0.425, cover: 'hollow' },
          { u: 0.345, v: 0.268, cover: 'none' },
          { u: 0.642, v: 0.242, cover: 'none' },
        ],
        neighbors: [
          { kind: 'hedgehog', u: 0.275, v: 0.614, cover: 'log' },
          { kind: 'bunny',    u: 0.410, v: 0.660, cover: 'fern' },
          { kind: 'frog',     u: 0.615, v: 0.655, cover: 'leaves' },
        ],
      },
    ],
    leaves: [
      {
        kind: 'bunny', scale: 0.90,
        targets: [
          { u: 0.175, v: 0.665, cover: 'fern' },
          { u: 0.355, v: 0.662, cover: 'mushrooms' },
          { u: 0.505, v: 0.655, cover: 'fern' },
          { u: 0.630, v: 0.638, cover: 'mushrooms' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.498, v: 0.398, cover: 'hollow' },
          { kind: 'hedgehog', u: 0.268, v: 0.614, cover: 'log' },
          { kind: 'squirrel', u: 0.355, v: 0.270, cover: 'none' },
        ],
      },
      {
        kind: 'squirrel', scale: 0.90,
        targets: [
          { u: 0.345, v: 0.268, cover: 'none' },
          { u: 0.498, v: 0.405, cover: 'hollow' },
          { u: 0.642, v: 0.242, cover: 'none' },
          { u: 0.225, v: 0.465, cover: 'fern' },
        ],
        neighbors: [
          { kind: 'hedgehog', u: 0.278, v: 0.614, cover: 'log' },
          { kind: 'frog',     u: 0.595, v: 0.658, cover: 'leaves' },
          { kind: 'bunny',    u: 0.415, v: 0.662, cover: 'mushrooms' },
        ],
      },
      {
        kind: 'hedgehog', scale: 0.88,
        targets: [
          { u: 0.268, v: 0.614, cover: 'log' },
          { u: 0.165, v: 0.675, cover: 'leaves' },
          { u: 0.415, v: 0.668, cover: 'mushrooms' },
          { u: 0.605, v: 0.658, cover: 'leaves' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.498, v: 0.398, cover: 'hollow' },
          { kind: 'squirrel', u: 0.640, v: 0.245, cover: 'none' },
          { kind: 'bunny',    u: 0.505, v: 0.655, cover: 'fern' },
        ],
      },
      {
        kind: 'frog', scale: 0.88,
        targets: [
          { u: 0.205, v: 0.670, cover: 'leaves' },
          { u: 0.385, v: 0.675, cover: 'mushrooms' },
          { u: 0.555, v: 0.665, cover: 'fern' },
          { u: 0.668, v: 0.648, cover: 'leaves' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.498, v: 0.398, cover: 'hollow' },
          { kind: 'hedgehog', u: 0.275, v: 0.614, cover: 'log' },
          { kind: 'squirrel', u: 0.350, v: 0.270, cover: 'none' },
        ],
      },
    ],
    stream: [
      {
        kind: 'dormouse', scale: 0.86,
        targets: [
          { u: 0.272, v: 0.614, cover: 'log' },
          { u: 0.498, v: 0.415, cover: 'hollow' },
          { u: 0.410, v: 0.670, cover: 'leaves' },
          { u: 0.615, v: 0.655, cover: 'mushrooms' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.345, v: 0.270, cover: 'none' },
          { kind: 'bunny',    u: 0.175, v: 0.665, cover: 'fern' },
          { kind: 'frog',     u: 0.530, v: 0.672, cover: 'leaves' },
        ],
      },
      {
        kind: 'frog', scale: 0.84,
        targets: [
          { u: 0.168, v: 0.668, cover: 'fern' },
          { u: 0.305, v: 0.678, cover: 'leaves' },
          { u: 0.445, v: 0.665, cover: 'mushrooms' },
          { u: 0.575, v: 0.668, cover: 'leaves' },
          { u: 0.682, v: 0.642, cover: 'fern' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.498, v: 0.398, cover: 'hollow' },
          { kind: 'hedgehog', u: 0.268, v: 0.612, cover: 'log' },
          { kind: 'squirrel', u: 0.640, v: 0.245, cover: 'none' },
        ],
      },
      {
        kind: 'squirrel', scale: 0.84,
        targets: [
          { u: 0.165, v: 0.455, cover: 'fern' },
          { u: 0.345, v: 0.268, cover: 'none' },
          { u: 0.498, v: 0.405, cover: 'hollow' },
          { u: 0.642, v: 0.242, cover: 'none' },
          { u: 0.395, v: 0.658, cover: 'mushrooms' },
        ],
        neighbors: [
          { kind: 'hedgehog', u: 0.272, v: 0.614, cover: 'log' },
          { kind: 'frog',     u: 0.605, v: 0.658, cover: 'leaves' },
          { kind: 'bunny',    u: 0.205, v: 0.672, cover: 'fern' },
        ],
      },
      {
        kind: 'bunny', scale: 0.84,
        targets: [
          { u: 0.165, v: 0.668, cover: 'fern' },
          { u: 0.282, v: 0.616, cover: 'log' },
          { u: 0.415, v: 0.662, cover: 'mushrooms' },
          { u: 0.548, v: 0.658, cover: 'fern' },
          { u: 0.668, v: 0.642, cover: 'mushrooms' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.498, v: 0.398, cover: 'hollow' },
          { kind: 'dormouse', u: 0.348, v: 0.676, cover: 'leaves' },
          { kind: 'squirrel', u: 0.345, v: 0.270, cover: 'none' },
        ],
      },
    ],
    woods: [
      {
        kind: 'owl', scale: 0.82,
        targets: [
          { u: 0.456, v: 0.425, cover: 'hollow' },
          { u: 0.500, v: 0.368, cover: 'hollow' },
          { u: 0.544, v: 0.425, cover: 'hollow' },
          { u: 0.345, v: 0.268, cover: 'none' },
          { u: 0.642, v: 0.242, cover: 'none' },
        ],
        neighbors: [
          { kind: 'hedgehog', u: 0.272, v: 0.614, cover: 'log' },
          { kind: 'bunny',    u: 0.185, v: 0.668, cover: 'fern' },
          { kind: 'frog',     u: 0.610, v: 0.658, cover: 'leaves' },
          { kind: 'dormouse', u: 0.415, v: 0.668, cover: 'mushrooms' },
        ],
      },
      {
        kind: 'hedgehog', scale: 0.82,
        targets: [
          { u: 0.262, v: 0.614, cover: 'log' },
          { u: 0.165, v: 0.672, cover: 'leaves' },
          { u: 0.395, v: 0.668, cover: 'mushrooms' },
          { u: 0.535, v: 0.668, cover: 'leaves' },
          { u: 0.662, v: 0.648, cover: 'fern' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.498, v: 0.398, cover: 'hollow' },
          { kind: 'squirrel', u: 0.345, v: 0.268, cover: 'none' },
          { kind: 'bunny',    u: 0.315, v: 0.652, cover: 'fern' },
        ],
      },
      {
        kind: 'dormouse', scale: 0.82,
        targets: [
          { u: 0.272, v: 0.614, cover: 'log' },
          { u: 0.498, v: 0.415, cover: 'hollow' },
          { u: 0.185, v: 0.672, cover: 'leaves' },
          { u: 0.418, v: 0.668, cover: 'mushrooms' },
          { u: 0.625, v: 0.655, cover: 'leaves' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.642, v: 0.242, cover: 'none' },
          { kind: 'bunny',    u: 0.530, v: 0.652, cover: 'fern' },
          { kind: 'squirrel', u: 0.345, v: 0.268, cover: 'none' },
        ],
      },
      {
        kind: 'frog', scale: 0.82,
        targets: [
          { u: 0.168, v: 0.670, cover: 'fern' },
          { u: 0.305, v: 0.678, cover: 'leaves' },
          { u: 0.445, v: 0.665, cover: 'mushrooms' },
          { u: 0.578, v: 0.668, cover: 'leaves' },
          { u: 0.682, v: 0.642, cover: 'fern' },
        ],
        neighbors: [
          { kind: 'owl',      u: 0.498, v: 0.398, cover: 'hollow' },
          { kind: 'hedgehog', u: 0.268, v: 0.614, cover: 'log' },
          { kind: 'squirrel', u: 0.345, v: 0.268, cover: 'none' },
          { kind: 'bunny',    u: 0.505, v: 0.645, cover: 'mushrooms' },
        ],
      },
    ],
  };

  const CSS = `
    .ww-stage-box {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #04121b;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }
    .ww-canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: pointer;
    }
    .ww-ui {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .ww-hit {
      position: absolute;
      pointer-events: auto;
      transform: translate(-50%, -50%);
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: transparent;
      border: 2px solid transparent;
      cursor: pointer;
      padding: 0;
      margin: 0;
      color: transparent;
      font-size: 0;
    }
    .ww-hit:focus-visible {
      outline: 3px solid #ffd23f;
      outline-offset: 2px;
      background: rgba(255, 210, 63, 0.18);
    }
    .ww-hud-top {
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
    .ww-hud-left {
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
    }
    .ww-say-btn {
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
    .ww-say-btn:active { transform: scale(0.93); }
    .ww-say-btn.nudge { animation: kit-nudge 1s ease infinite; }
    .ww-dots-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 12px;
      border-radius: 99px;
      background: rgba(6, 19, 28, 0.72);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 224, 150, 0.25);
    }
    .ww-dots-pill .kit-dots { gap: 7px; }
    .ww-dots-pill .kit-dot { width: 11px; height: 11px; background: rgba(255, 255, 255, 0.24); }
    .ww-dots-pill .kit-dot.done { background: #fbbf24; box-shadow: 0 0 8px rgba(251, 191, 36, 0.65); }

    .ww-hud-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      pointer-events: auto;
    }
    .ww-info-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 224, 150, 0.35);
      background: rgba(6, 19, 28, 0.76);
      backdrop-filter: blur(6px);
      color: #fef3c7;
      font: 700 18px Fredoka, sans-serif;
      cursor: pointer;
      display: grid;
      place-items: center;
    }
    .ww-parent-note {
      max-width: min(320px, 76vw);
      padding: 10px 14px;
      border-radius: 16px;
      background: rgba(6, 19, 28, 0.9);
      backdrop-filter: blur(8px);
      border: 1.5px solid rgba(251, 191, 36, 0.45);
      color: #fef9e7;
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.5);
      text-align: start;
    }
    .ww-parent-note[hidden] { display: none; }
    .ww-parent-note h2 { margin: 0 0 4px; font-size: 1rem; color: #fde68a; }
    .ww-parent-note p { margin: 0; font-size: 0.85rem; color: #d6ebe8; line-height: 1.35; }

    .ww-counter-bar {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      align-items: center;
      background: rgba(7, 20, 29, 0.84);
      backdrop-filter: blur(8px);
      border: 1.5px solid rgba(251, 191, 36, 0.5);
      padding: 6px 14px;
      border-radius: 99px;
      pointer-events: none;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);
      z-index: 6;
    }
    .ww-target-icon {
      width: 38px;
      height: 38px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
      margin-inline-end: 2px;
    }
    .ww-slot {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-family: Fredoka, sans-serif;
      font-weight: 700;
      font-size: 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.22);
      color: rgba(255, 255, 255, 0.42);
      transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), background 0.2s;
    }
    .ww-slot.found {
      background: linear-gradient(180deg, #fbbf24, #d97706);
      border-color: #fef08a;
      color: #1c1004;
      transform: scale(1.14);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.65);
    }

    .ww-end-overlay {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgba(4, 15, 24, 0.82);
      backdrop-filter: blur(8px);
      z-index: 12;
      padding: 20px;
    }
    .ww-end-overlay .kit-end {
      background: rgba(9, 27, 38, 0.94);
      border: 2px solid rgba(251, 191, 36, 0.55);
      border-radius: 26px;
      padding: 26px 28px;
      color: #fef9e7;
      box-shadow: 0 18px 44px rgba(0, 0, 0, 0.6);
      max-width: 400px;
      width: 100%;
    }
    .ww-end-overlay .kit-end p { color: #c7e2de; }
    .ww-end-overlay .btn--ghost { color: #fef9e7; border-color: rgba(255, 255, 255, 0.3); }

    @media (max-width: 600px) {
      .ww-hit { width: 64px; height: 64px; }
      .ww-say-btn { width: 52px; height: 52px; font-size: 24px; }
      .ww-target-icon { width: 34px; height: 34px; }
      .ww-slot { width: 28px; height: 28px; font-size: 14px; }
      .ww-counter-bar { bottom: 18px; padding: 6px 12px; gap: 7px; }
    }
  `;

  function sfxFind(num) {
    if (!window.EDSound || !EDSound.canPlay()) return;
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const f = notes[(num - 1) % notes.length];
    EDSound.tone({ freq: f, end: f * 1.18, dur: 0.18, type: 'sine', gain: 0.2 });
  }

  function sfxRustle() {
    if (!window.EDSound || !EDSound.canPlay()) return;
    EDSound.tone({ freq: 290, end: 360, dur: 0.09, type: 'triangle', gain: 0.11 });
  }

  function sfxCheer() {
    if (!window.EDSound || !EDSound.canPlay()) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => {
        if (window.EDSound && EDSound.canPlay()) {
          EDSound.tone({ freq: f, end: f * 1.05, dur: 0.16, type: 'sine', gain: 0.16 });
        }
      }, i * 85);
    });
  }

  /* ---- Image loader + dark-teal night-tint cache ---- */
  const imgCache = new Map();
  const nightCache = new Map();

  function loadImg(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const im = new Image();
    im.src = src;
    imgCache.set(src, im);
    return im;
  }

  function getNightSprite(src, img, strength) {
    const key = `${src}@${strength}`;
    if (nightCache.has(key)) return nightCache.get(key);
    if (!img || !img.complete || !img.naturalWidth) return null;
    try {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      const id = g.getImageData(0, 0, c.width, c.height);
      const d = id.data;
      const k = strength;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue;
        // Darken and cool-shift toward moonlit forest teal
        d[i]     = Math.round(d[i]     * (1 - 0.68 * k) + 6  * k);
        d[i + 1] = Math.round(d[i + 1] * (1 - 0.50 * k) + 28 * k);
        d[i + 2] = Math.round(d[i + 2] * (1 - 0.36 * k) + 42 * k);
      }
      g.putImageData(id, 0, 0);
      nightCache.set(key, c);
      return c;
    } catch {
      return img;
    }
  }

  function preloadArt() {
    loadImg(`${ART}bg.jpg`);
    SPECIES.forEach((sp) => {
      loadImg(`${ART}${sp}-hidden.png`);
      loadImg(`${ART}${sp}-found.png`);
      loadImg(`${ART}${sp}-happy.png`);
    });
    COVERS.forEach((cv) => loadImg(`${ART}cover-${cv}.png`));
    GIRL_POSES.forEach((p) => loadImg(`${ART}girl-${p}.png`));
  }

  let cleanupFn = null;

  function mount(root, ctx) {
    EDKit.style('ww-style', CSS);
    preloadArt();

    const lang = ctx.lang;
    const t = TEXT[lang] || TEXT.he;
    const mode = (ctx.set && ctx.set.mode) || 'tree';
    const rounds = ROUNDS[mode] || ROUNDS.tree;
    const bgImg = loadImg(`${ART}bg.jpg`);

    let roundIdx = 0;
    let round = rounds[0];
    let locked = false;
    let roundWon = false;
    let rafId = 0;
    let timeTick = 0;
    const tm = EDKit.timers();

    /* Girl stands on the right mossy stone bank */
    const GIRL_POS = { u: 0.835, v: 0.525 };
    let lanternU = 0.498, lanternV = 0.42;
    let targetU = 0.498, targetV = 0.42;
    let foundStates = [];
    let neighborStates = [];
    let sparks = [];

    const fireflies = Array.from({ length: 30 }, () => ({
      u: 0.08 + Math.random() * 0.84,
      v: 0.10 + Math.random() * 0.72,
      r: 1.4 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
    }));

    const skyStars = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.34,
      r: 0.8 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
    }));

    function spawnSparks(x, y, count = 16) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.4 + Math.random() * 3.6;
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.4, r: 1.8 + Math.random() * 2.4, life: 1 });
      }
    }

    root.innerHTML = `
      <div class="ww-stage-box" id="ww-box">
        <canvas class="ww-canvas" id="ww-canvas"></canvas>
        <div class="ww-ui" id="ww-ui"></div>
        <div class="ww-hud-top">
          <div class="ww-hud-left">
            <button type="button" class="kit-say ww-say-btn" aria-label="${EDKit.text(lang).hear}">🔊</button>
            <div class="ww-dots-pill" id="ww-dots">${EDKit.dots(rounds.length, 0)}</div>
          </div>
          <div class="ww-hud-right">
            <button type="button" class="ww-info-btn" id="ww-info-btn" aria-label="${t.infoLabel}" aria-expanded="false">?</button>
            <div class="ww-parent-note" id="ww-parent-note" hidden>
              <h2 id="ww-head"></h2>
              <p id="ww-hint">${t.tip}</p>
            </div>
          </div>
        </div>
        <div class="ww-counter-bar" id="ww-counter"></div>
      </div>
    `;

    const box = root.querySelector('#ww-box');
    const canvas = root.querySelector('#ww-canvas');
    const ctx2d = canvas.getContext('2d');
    const uiLayer = root.querySelector('#ww-ui');
    const counterBar = root.querySelector('#ww-counter');
    const dotsPill = root.querySelector('#ww-dots');
    const headH2 = root.querySelector('#ww-head');
    const hintEl = root.querySelector('#ww-hint');
    const infoBtn = root.querySelector('#ww-info-btn');
    const parentNote = root.querySelector('#ww-parent-note');

    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = parentNote.hidden;
      parentNote.hidden = !open;
      infoBtn.setAttribute('aria-expanded', String(open));
    });

    let W = 900, H = 600, dpr = 1;
    let hitButtons = [];

    /* Scene layout geometry:
       - Landscape (tablet / laptop): fill entire viewport cleanly with bg.jpg (cover).
       - Portrait (phone 390x844): frame the whole diorama across the full width inside
         a seamless starry-night-sky + dark-forest canvas so NOTHING is cut off! */
    function sceneGeom() {
      const iw = (bgImg.complete && bgImg.naturalWidth) ? bgImg.naturalWidth : 1376;
      const ih = (bgImg.complete && bgImg.naturalHeight) ? bgImg.naturalHeight : 768;
      const isPortrait = W < H * 1.05;
      let scale, dw, dh, ox, oy;
      if (isPortrait) {
        // Show 94% of the diorama width (from left log edge to right bank girl)
        scale = (W / (iw * 0.90));
        dw = iw * scale;
        dh = ih * scale;
        ox = (W - dw) * 0.52;
        oy = (H - dh) * 0.50;
      } else {
        scale = Math.max(W / iw, H / ih);
        dw = iw * scale;
        dh = ih * scale;
        ox = (W - dw) * 0.5;
        oy = (H - dh) * 0.5;
      }
      return {
        isPortrait, scale, dw, dh, ox, oy,
        map: (u, v) => ({ x: ox + u * dw, y: oy + v * dh }),
        unmap: (x, y) => ({ u: (x - ox) / dw, v: (y - oy) / dh }),
      };
    }

    function syncHitButtons() {
      const g = sceneGeom();
      hitButtons.forEach((btn, idx) => {
        const tg = round.targets[idx];
        if (!tg) return;
        const p = g.map(tg.u, tg.v);
        btn.style.left = `${p.x}px`;
        btn.style.top = `${p.y}px`;
      });
    }

    function resize() {
      const r = box.getBoundingClientRect();
      W = Math.max(300, r.width);
      H = Math.max(240, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      syncHitButtons();
    }

    function loadRound(idx) {
      roundIdx = idx;
      round = rounds[idx];
      locked = false;
      roundWon = false;
      foundStates = round.targets.map(() => ({ found: false, num: 0, pop: 0, peek: 0 }));
      neighborStates = round.neighbors.map(() => ({ wobble: 0, peek: 0 }));

      const spInfo = t.species[round.kind] || t.species.owl;
      headH2.textContent = t.ask(round.targets.length, spInfo.name);
      hintEl.textContent = t.tip;
      dotsPill.innerHTML = EDKit.dots(rounds.length, roundIdx);

      /* Bottom firefly counter bar with the target animal's own real clay portrait */
      counterBar.innerHTML =
        `<img class="ww-target-icon" src="${ART}${round.kind}-found.png" alt="">` +
        round.targets.map((_, i) => `<span class="ww-slot" data-slot="${i}">${i + 1}</span>`).join('');

      /* Accessible 64px+ tap buttons for each target animal */
      uiLayer.innerHTML = '';
      hitButtons = round.targets.map((tg, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ww-hit';
        b.dataset.animal = String(i);
        b.setAttribute('aria-label', t.targetAria(spInfo.sing, i + 1));
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          onTapTarget(i);
        });
        uiLayer.append(b);
        return b;
      });
      syncHitButtons();

      /* Speak the EXACT task for this round ("Find 3 owls!", etc.) */
      const voiceKey = `ww-find-${round.targets.length}-${round.kind}`;
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

      const p = sceneGeom().map(tg.u, tg.v);
      spawnSparks(p.x, p.y, 18);
      sfxFind(nextNum);

      /* Count aloud on every tap ("one... two... three!") */
      if (window.EDVoice && window.EDVoiceLines) {
        EDVoice.say(EDVoiceLines.num(nextNum), lang);
      }

      const slot = counterBar.querySelector(`[data-slot="${nextNum - 1}"]`);
      if (slot) slot.classList.add('found');

      if (nextNum >= round.targets.length) {
        locked = true;
        roundWon = true;
        hintEl.textContent = t.done;
        const allDots = dotsPill.querySelectorAll('.kit-dot');
        if (allDots[roundIdx]) allDots[roundIdx].classList.add('done');

        const gp = sceneGeom().map(GIRL_POS.u, GIRL_POS.v);
        spawnSparks(gp.x, gp.y - 30, 24);
        sfxCheer();

        tm.later(() => {
          EDKit.praise(lang);
          if (roundIdx + 1 < rounds.length) {
            tm.later(() => loadRound(roundIdx + 1), 1300);
          } else {
            tm.later(() => {
              cancelAnimationFrame(rafId);
              const ov = document.createElement('div');
              ov.className = 'ww-end-overlay';
              box.append(ov);
              EDKit.end(ov, ctx, lang);
            }, 1300);
          }
        }, 600);
      }
    }

    function updateLanternFromPointer(e) {
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const uv = sceneGeom().unmap(px, py);
      targetU = Math.max(0.08, Math.min(0.84, uv.u));
      targetV = Math.max(0.12, Math.min(0.82, uv.v));
    }

    box.addEventListener('pointermove', updateLanternFromPointer);
    box.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.ww-hud-top, .ww-end-overlay')) return;
      updateLanternFromPointer(e);
      if (locked) return;
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const g = sceneGeom();
      const hitR = Math.max(36, g.dw * 0.042);

      for (let i = 0; i < round.targets.length; i++) {
        const p = g.map(round.targets[i].u, round.targets[i].v);
        if (Math.hypot(px - p.x, py - p.y) < hitR) {
          onTapTarget(i);
          return;
        }
      }
      for (let i = 0; i < round.neighbors.length; i++) {
        const nb = round.neighbors[i];
        const p = g.map(nb.u, nb.v);
        if (Math.hypot(px - p.x, py - p.y) < hitR * 0.9) {
          neighborStates[i].wobble = 1;
          sfxRustle();
          spawnSparks(p.x, p.y, 6);
          return;
        }
      }
    });

    /* ---- Sprite + shadow + night-tint helpers ---- */
    function drawGroundShadow(x, y, rx, ry, alpha = 0.5) {
      ctx2d.save();
      const grad = ctx2d.createRadialGradient(x, y, rx * 0.1, x, y, rx);
      grad.addColorStop(0, `rgba(2, 8, 12, ${alpha})`);
      grad.addColorStop(1, 'rgba(2, 8, 12, 0)');
      ctx2d.fillStyle = grad;
      ctx2d.beginPath();
      ctx2d.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.restore();
    }

    function drawLitSprite(src, x, y, maxDim, warmBlend, nightStrength = 0.85, angle = 0) {
      const img = loadImg(src);
      if (!img.complete || !img.naturalWidth) return null;
      const s = maxDim / Math.max(img.naturalWidth, img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;

      ctx2d.save();
      ctx2d.translate(x, y);
      if (angle) ctx2d.rotate(angle);

      const night = getNightSprite(src, img, nightStrength);
      if (night && warmBlend < 0.98) {
        ctx2d.globalAlpha = 1;
        ctx2d.drawImage(night, -dw / 2, -dh / 2, dw, dh);
      }
      if (warmBlend > 0.02) {
        ctx2d.globalAlpha = Math.min(1, warmBlend);
        ctx2d.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      }
      ctx2d.restore();
      return { dw, dh };
    }

    function drawCoverProp(coverType, x, y, unit, lit) {
      if (!coverType || coverType === 'none' || coverType === 'log' || coverType === 'hollow') return;
      const src = `${ART}cover-${coverType}.png`;
      const sizeMul = coverType === 'fern' ? 1.48 : coverType === 'mushrooms' ? 1.24 : 1.28;
      const dy = coverType === 'fern' ? unit * 0.24 : coverType === 'leaves' ? unit * 0.34 : unit * 0.26;
      const dx = coverType === 'fern' ? -unit * 0.12 : coverType === 'mushrooms' ? -unit * 0.10 : unit * 0.05;
      drawGroundShadow(x + dx, y + dy + unit * 0.28, unit * 0.52, unit * 0.14, 0.36);
      drawLitSprite(src, x + dx, y + dy, unit * sizeMul, 0.28 + lit * 0.72, 0.65);
    }

    function drawAnimalEntry(entry, kind, x, y, unit, lit, st, isTarget, idx) {
      const isFound = Boolean(isTarget && st && st.found);
      const peekTarget = isFound ? 1 : (lit > 0.24 ? Math.min(1, (lit - 0.2) * 1.6) : 0);
      if (st) st.peek += (peekTarget - st.peek) * 0.18;
      const peek = st ? st.peek : 0;

      // Gentle wobble on wrong-neighbor tap
      let wobbleAngle = 0;
      if (!isTarget && st && st.wobble > 0.01) {
        wobbleAngle = Math.sin(st.wobble * Math.PI * 5) * 0.16 * st.wobble;
        st.wobble *= 0.88;
      }

      // Pop-up spring when found
      let bounceY = 0;
      let popScale = 1;
      if (isFound) {
        st.pop *= 0.88;
        bounceY = -Math.abs(Math.sin(timeTick * 0.1 + idx)) * (unit * 0.11) - st.pop * unit * 0.22;
        popScale = 1.08 + st.pop * 0.16;
      } else {
        // Tuck behind cover when hidden, peek upward when lantern hits
        const tuckOffset = (entry.cover && entry.cover !== 'none') ? (1 - peek) * unit * 0.16 : 0;
        bounceY = tuckOffset + Math.sin(timeTick * 0.05 + idx * 1.9) * 1.6;
      }

      const pose = isFound ? 'happy' : (peek > 0.45 ? 'found' : 'hidden');
      const src = `${ART}${kind}-${pose}.png`;
      const warmBlend = isFound ? 1 : Math.min(1, lit * 1.25);

      // Soft warm golden halo behind lit / found animal
      if (warmBlend > 0.18) {
        ctx2d.save();
        const halo = ctx2d.createRadialGradient(x, y + bounceY, unit * 0.1, x, y + bounceY, unit * 0.82);
        halo.addColorStop(0, `rgba(255, 218, 110, ${0.46 * warmBlend})`);
        halo.addColorStop(1, 'rgba(255, 165, 40, 0)');
        ctx2d.fillStyle = halo;
        ctx2d.beginPath();
        ctx2d.arc(x, y + bounceY, unit * 0.82, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }

      // Soft ground contact shadow directly under the animal
      drawGroundShadow(x, y + unit * 0.42, unit * 0.42 * popScale, unit * 0.13, 0.48);

      // Enforce rule: leaf pile only for small animals
      const cover = (entry.cover === 'leaves' && !SMALL_SPECIES.has(kind)) ? 'fern' : entry.cover;

      if (isFound) {
        // Once found, cover stays behind the happy jumping animal
        drawCoverProp(cover, x, y, unit, lit);
        drawLitSprite(src, x, y + bounceY, unit * popScale, warmBlend, 0.88, wobbleAngle);
      } else {
        // Hidden/peeking: animal is tucked behind its foreground cover piece
        drawLitSprite(src, x, y + bounceY, unit * popScale, warmBlend, 0.88, wobbleAngle);
        drawCoverProp(cover, x, y, unit, lit);
      }

      // Golden firefly number orb above found target animals
      if (isFound) {
        const orbY = y + bounceY - unit * 0.56;
        const orbR = Math.max(12, Math.min(18, unit * 0.18));
        ctx2d.save();
        ctx2d.fillStyle = '#f59e0b';
        ctx2d.strokeStyle = '#fef08a';
        ctx2d.lineWidth = 2.2;
        ctx2d.beginPath();
        ctx2d.arc(x, orbY, orbR, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.stroke();
        ctx2d.fillStyle = '#1c1004';
        ctx2d.font = `700 ${Math.round(orbR * 1.15)}px Fredoka, sans-serif`;
        ctx2d.textAlign = 'center';
        ctx2d.textBaseline = 'middle';
        ctx2d.fillText(String(st.num), x, orbY + 1);
        ctx2d.restore();
      }
    }

    function drawBackground(g) {
      // Seamless deep-teal starry night backdrop (visible above/below diorama on portrait phone)
      const sky = ctx2d.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#04141e');
      sky.addColorStop(0.45, '#07222e');
      sky.addColorStop(0.75, '#061519');
      sky.addColorStop(1, '#040c10');
      ctx2d.fillStyle = sky;
      ctx2d.fillRect(0, 0, W, H);

      if (g.isPortrait) {
        skyStars.forEach((st) => {
          const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(timeTick * 0.04 + st.phase));
          ctx2d.fillStyle = `rgba(225, 245, 255, ${a})`;
          ctx2d.beginPath();
          ctx2d.arc(st.x * W, st.y * H, st.r, 0, Math.PI * 2);
          ctx2d.fill();
        });
      }

      if (bgImg.complete && bgImg.naturalWidth) {
        ctx2d.drawImage(bgImg, g.ox, g.oy, g.dw, g.dh);
        if (g.isPortrait) {
          // Soft top & bottom gradient edge blend into the night sky and forest floor
          const fadeH = Math.max(24, g.dh * 0.1);
          const topG = ctx2d.createLinearGradient(0, g.oy, 0, g.oy + fadeH);
          topG.addColorStop(0, '#061c27');
          topG.addColorStop(1, 'rgba(6, 28, 39, 0)');
          ctx2d.fillStyle = topG;
          ctx2d.fillRect(0, g.oy - 2, W, fadeH + 2);

          const botG = ctx2d.createLinearGradient(0, g.oy + g.dh - fadeH, 0, g.oy + g.dh + 2);
          botG.addColorStop(0, 'rgba(5, 16, 20, 0)');
          botG.addColorStop(1, '#051014');
          ctx2d.fillStyle = botG;
          ctx2d.fillRect(0, g.oy + g.dh - fadeH, W, fadeH + 4);
        }
      }
    }

    function tick() {
      timeTick += 1;
      lanternU += (targetU - lanternU) * 0.16;
      lanternV += (targetV - lanternV) * 0.16;

      ctx2d.save();
      ctx2d.scale(dpr, dpr);

      const g = sceneGeom();
      drawBackground(g);

      const focus = g.map(lanternU, lanternV);
      const beamRadius = Math.max(85, Math.min(g.dw * 0.19, g.dh * 0.34));
      const baseUnit = Math.max(36, g.dw * 0.088 * round.scale);

      /* Compute whether any unfound target animal is near the lantern beam -> girl points! */
      let nearUnfound = false;
      round.targets.forEach((tg, i) => {
        if (foundStates[i] && foundStates[i].found) return;
        const p = g.map(tg.u, tg.v);
        if (Math.hypot(p.x - focus.x, p.y - focus.y) < beamRadius * 0.82) nearUnfound = true;
      });

      /* 1. Draw animals inside the oak tree hollow first, then the hollow bark lip on top! */
      let hasHollowOccupant = false;
      const hollowTargets = [];
      const hollowNeighbors = [];
      const otherNeighbors = [];
      const otherTargets = [];

      round.neighbors.forEach((nb, i) => {
        if (nb.cover === 'hollow') { hasHollowOccupant = true; hollowNeighbors.push({ item: nb, i }); }
        else otherNeighbors.push({ item: nb, i });
      });
      round.targets.forEach((tg, i) => {
        if (tg.cover === 'hollow') { hasHollowOccupant = true; hollowTargets.push({ item: tg, i }); }
        else otherTargets.push({ item: tg, i });
      });

      hollowNeighbors.forEach(({ item, i }) => {
        const p = g.map(item.u, item.v);
        const lit = Math.max(0, 1 - Math.hypot(p.x - focus.x, p.y - focus.y) / beamRadius);
        drawAnimalEntry(item, item.kind, p.x, p.y, baseUnit * 0.88, lit, neighborStates[i], false, i + 20);
      });
      hollowTargets.forEach(({ item, i }) => {
        const p = g.map(item.u, item.v);
        const lit = Math.max(0, 1 - Math.hypot(p.x - focus.x, p.y - focus.y) / beamRadius);
        drawAnimalEntry(item, round.kind, p.x, p.y, baseUnit * 0.92, lit, foundStates[i], true, i);
      });
      if (hasHollowOccupant) {
        const hp = g.map(0.498, 0.462);
        const hLit = Math.max(0, 1 - Math.hypot(hp.x - focus.x, hp.y - focus.y) / (beamRadius * 1.2));
        drawLitSprite(`${ART}cover-hollow.png`, hp.x, hp.y, g.dw * 0.145, 0.35 + hLit * 0.65, 0.55);
      }

      /* 2. Draw all other neighbors & target animals sorted by depth (v) */
      const depthList = [
        ...otherNeighbors.map(({ item, i }) => ({ item, i, isTarget: false })),
        ...otherTargets.map(({ item, i }) => ({ item, i, isTarget: true })),
      ].sort((a, b) => a.item.v - b.item.v);

      depthList.forEach(({ item, i, isTarget }) => {
        const p = g.map(item.u, item.v);
        const lit = Math.max(0, 1 - Math.hypot(p.x - focus.x, p.y - focus.y) / beamRadius);
        if (isTarget) {
          drawAnimalEntry(item, round.kind, p.x, p.y, baseUnit, lit, foundStates[i], true, i);
        } else {
          drawAnimalEntry(item, item.kind, p.x, p.y, baseUnit * 0.92, lit, neighborStates[i], false, i + 30);
        }
      });

      /* 3. Compute Lantern Girl pose + lantern hand position */
      const girlPose = roundWon ? 'cheering' : (nearUnfound ? 'pointing' : 'looking');
      const girlPos = g.map(GIRL_POS.u, GIRL_POS.v);
      const girlH = Math.max(105, g.dh * 0.34);
      const cheerBounce = roundWon ? -Math.abs(Math.sin(timeTick * 0.14)) * (girlH * 0.08) : Math.sin(timeTick * 0.04) * 1.5;
      const girlImg = loadImg(`${ART}girl-${girlPose}.png`);
      let gw = girlH * 0.6, gh = girlH;
      if (girlImg.complete && girlImg.naturalWidth) {
        const gs = girlH / Math.max(girlImg.naturalWidth, girlImg.naturalHeight);
        gw = girlImg.naturalWidth * gs;
        gh = girlImg.naturalHeight * gs;
      }
      /* Lantern hand coordinates (always in her left hand, viewer-right) */
      const handOffset = girlPose === 'cheering'
        ? { x: gw * 0.36, y: -gh * 0.14 }
        : girlPose === 'pointing'
          ? { x: gw * 0.34, y: gh * 0.24 }
          : { x: gw * 0.34, y: gh * 0.08 };
      const hand = { x: girlPos.x + handOffset.x, y: girlPos.y + cheerBounce + handOffset.y };

      /* 3a. Soft feathered lantern light beam drawn behind the girl so it never cuts sharply across her poncho */
      ctx2d.save();
      ctx2d.globalCompositeOperation = 'screen';
      ctx2d.filter = 'blur(16px)';
      const ang = Math.atan2(focus.y - hand.y, focus.x - hand.x);
      const px = -Math.sin(ang) * beamRadius * 0.68;
      const py = Math.cos(ang) * beamRadius * 0.68;
      const beamGrad = ctx2d.createLinearGradient(hand.x, hand.y, focus.x, focus.y);
      beamGrad.addColorStop(0, 'rgba(255, 220, 120, 0.34)');
      beamGrad.addColorStop(0.55, 'rgba(255, 200, 90, 0.16)');
      beamGrad.addColorStop(1, 'rgba(255, 185, 70, 0.03)');
      ctx2d.fillStyle = beamGrad;
      ctx2d.beginPath();
      ctx2d.moveTo(hand.x, hand.y);
      ctx2d.lineTo(focus.x + px, focus.y + py);
      ctx2d.lineTo(focus.x - px, focus.y - py);
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.restore();

      /* 3b. Draw the Lantern Girl cut-out on the right mossy bank */
      drawGroundShadow(girlPos.x, girlPos.y + girlH * 0.45, girlH * 0.28, girlH * 0.08, 0.55);
      drawLitSprite(`${ART}girl-${girlPose}.png`, girlPos.x, girlPos.y + cheerBounce, girlH, 1, 0);

      /* 4. Lantern Flame Glow, Soft Spotlight Halo, Fireflies & Sparks */
      ctx2d.save();
      ctx2d.globalCompositeOperation = 'screen';

      // Warm lantern flame core glow at her hand
      const handGlow = ctx2d.createRadialGradient(hand.x, hand.y, 2, hand.x, hand.y, beamRadius * 0.45);
      handGlow.addColorStop(0, 'rgba(255, 236, 155, 0.68)');
      handGlow.addColorStop(0.5, 'rgba(255, 175, 55, 0.22)');
      handGlow.addColorStop(1, 'rgba(255, 130, 0, 0)');
      ctx2d.fillStyle = handGlow;
      ctx2d.beginPath();
      ctx2d.arc(hand.x, hand.y, beamRadius * 0.45, 0, Math.PI * 2);
      ctx2d.fill();

      // Soft spotlight circle around cursor/finger
      const spotGrad = ctx2d.createRadialGradient(focus.x, focus.y, 4, focus.x, focus.y, beamRadius);
      spotGrad.addColorStop(0, 'rgba(255, 234, 145, 0.44)');
      spotGrad.addColorStop(0.55, 'rgba(255, 170, 50, 0.16)');
      spotGrad.addColorStop(1, 'rgba(255, 120, 0, 0)');
      ctx2d.fillStyle = spotGrad;
      ctx2d.beginPath();
      ctx2d.arc(focus.x, focus.y, beamRadius, 0, Math.PI * 2);
      ctx2d.fill();

      // Drifting forest fireflies
      fireflies.forEach((f) => {
        const fp = g.map(f.u, f.v);
        const fx = fp.x + Math.sin(timeTick * 0.03 + f.phase) * 14;
        const fy = fp.y + Math.cos(timeTick * 0.025 + f.phase) * 10;
        const a = 0.28 + 0.52 * (0.5 + 0.5 * Math.sin(timeTick * 0.07 + f.phase));
        ctx2d.fillStyle = `rgba(255, 232, 120, ${a})`;
        ctx2d.beginPath();
        ctx2d.arc(fx, fy, f.r, 0, Math.PI * 2);
        ctx2d.fill();
      });

      // Celebration sparkles
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.036;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx2d.fillStyle = `rgba(255, 228, 108, ${s.life})`;
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
