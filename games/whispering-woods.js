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

  /* Fixed animal sizes as a fraction of the Lantern Girl's height (her head is ~0.30).
     An owl is smaller than her head; frogs and dormice are smaller still. */
  const SPECIES_SCALE = {
    bunny:    0.29,
    owl:      0.25,
    squirrel: 0.24,
    hedgehog: 0.22,
    frog:     0.19,
    dormouse: 0.18,
  };

  /* 12 landmark-mapped hiding spots on bg.jpg (all u <= 0.665 so nothing overlaps
     the girl at u=0.835, and none sit on the empty foreground ground). */
  const HIDING_SPOTS = [
    { id: 'hollow',           u: 0.499, v: 0.456, cover: 'hollow',    perch: true,  ground: true  },
    { id: 'branch-left',      u: 0.335, v: 0.265, cover: 'none',      perch: true,  ground: false },
    { id: 'branch-right',     u: 0.655, v: 0.235, cover: 'none',      perch: true,  ground: false },
    { id: 'log-mouth',        u: 0.272, v: 0.605, cover: 'log',       perch: false, ground: true  },
    { id: 'log-top',          u: 0.225, v: 0.465, cover: 'fern',      perch: false, ground: true  },
    { id: 'far-left-mid',     u: 0.145, v: 0.535, cover: 'fern',      perch: false, ground: true  },
    { id: 'left-ferns',       u: 0.155, v: 0.665, cover: 'fern',      perch: false, ground: true  },
    { id: 'left-roots',       u: 0.368, v: 0.648, cover: 'mushrooms', perch: false, ground: true  },
    { id: 'trunk-left-fern',  u: 0.375, v: 0.485, cover: 'fern',      perch: false, ground: true  },
    { id: 'center-roots',     u: 0.455, v: 0.590, cover: 'leaves',    perch: false, ground: true  },
    { id: 'trunk-right-fern', u: 0.612, v: 0.525, cover: 'fern',      perch: false, ground: true  },
    { id: 'stream-bank',      u: 0.662, v: 0.630, cover: 'mushrooms', perch: false, ground: true  },
  ];

  /* 11 hiding spots inside the centered portrait-phone zoom (u in [0.405, 0.592],
     v in [0.225, 0.735]) so every animal stays well inside the visible screen
     with >= 10% margin from every edge. */
  const PORTRAIT_SPOTS = [
    { id: 'hollow',          u: 0.499, v: 0.456, cover: 'hollow',    perch: true,  ground: true  },
    { id: 'branch-left-hi',  u: 0.420, v: 0.235, cover: 'none',      perch: true,  ground: false },
    { id: 'branch-right-hi', u: 0.580, v: 0.225, cover: 'none',      perch: true,  ground: false },
    { id: 'branch-left-mid', u: 0.408, v: 0.355, cover: 'none',      perch: true,  ground: false },
    { id: 'trunk-left',      u: 0.405, v: 0.535, cover: 'fern',      perch: false, ground: true  },
    { id: 'trunk-right',     u: 0.592, v: 0.535, cover: 'fern',      perch: false, ground: true  },
    { id: 'center-roots',    u: 0.495, v: 0.590, cover: 'leaves',    perch: false, ground: true  },
    { id: 'left-roots',      u: 0.415, v: 0.655, cover: 'mushrooms', perch: false, ground: true  },
    { id: 'right-roots',     u: 0.588, v: 0.650, cover: 'mushrooms', perch: false, ground: true  },
    { id: 'moss-left',       u: 0.448, v: 0.735, cover: 'leaves',    perch: false, ground: true  },
    { id: 'moss-right',      u: 0.552, v: 0.735, cover: 'none',      perch: false, ground: true  },
  ];

  const PERCH_SPECIES = new Set(['owl', 'squirrel']);
  const PROP_COVERS = ['fern', 'mushrooms', 'leaves'];
  const MAX_SAME_COVER = 2;

  /* Empty-ground resting spots for the lantern beam at round start (away from all animals) */
  const REST_SPOTS = [
    { u: 0.548, v: 0.762 }, // mossy foreground by the glowing blue flowers
    { u: 0.735, v: 0.725 }, // mossy bank by the stream near the girl
    { u: 0.310, v: 0.758 }, // mossy foreground in front of the log
    { u: 0.725, v: 0.435 }, // open night air above the stream
  ];

  const PORTRAIT_REST_SPOTS = [
    { u: 0.500, v: 0.770 }, // center mossy foreground above carved ledge
    { u: 0.500, v: 0.255 }, // upper oak trunk between branches
    { u: 0.555, v: 0.365 }, // right trunk side below hanging lantern
    { u: 0.445, v: 0.365 }, // left trunk side
    { u: 0.500, v: 0.680 }, // lower center moss
  ];

  const ROUNDS = {
    tree: [
      { kind: 'owl',      count: 3, neighborCount: 3 },
      { kind: 'hedgehog', count: 3, neighborCount: 3 },
      { kind: 'bunny',    count: 3, neighborCount: 3 },
      { kind: 'owl',      count: 4, neighborCount: 3 },
    ],
    leaves: [
      { kind: 'bunny',    count: 4, neighborCount: 3 },
      { kind: 'squirrel', count: 4, neighborCount: 3 },
      { kind: 'hedgehog', count: 4, neighborCount: 3 },
      { kind: 'frog',     count: 4, neighborCount: 3 },
    ],
    stream: [
      { kind: 'dormouse', count: 4, neighborCount: 3 },
      { kind: 'frog',     count: 5, neighborCount: 3 },
      { kind: 'squirrel', count: 5, neighborCount: 3 },
      { kind: 'bunny',    count: 5, neighborCount: 3 },
    ],
    woods: [
      { kind: 'owl',      count: 5, neighborCount: 4 },
      { kind: 'hedgehog', count: 5, neighborCount: 3 },
      { kind: 'dormouse', count: 5, neighborCount: 3 },
      { kind: 'frog',     count: 5, neighborCount: 4 },
    ],
  };

  function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function assignRoundCovers(targets, neighbors, targetKind) {
    const counts = Object.create(null);
    const firstFlip = Object.create(null);
    const all = shuffle([
      ...targets.map((entry) => ({ entry, kind: targetKind })),
      ...neighbors.map((entry) => ({ entry, kind: entry.kind })),
    ]);

    for (const { entry, kind } of all) {
      if (!PROP_COVERS.includes(entry.cover)) continue;
      const allowed = SMALL_SPECIES.has(kind) ? ['fern', 'mushrooms', 'leaves'] : ['fern', 'mushrooms'];
      const preferred = allowed.includes(entry.cover) ? entry.cover : allowed[0];
      const candidates = [preferred, ...shuffle(allowed.filter((c) => c !== preferred))];
      const chosen = candidates.find((c) => (counts[c] || 0) < MAX_SAME_COVER);

      if (!chosen) {
        entry.cover = 'none';
        continue;
      }

      counts[chosen] = (counts[chosen] || 0) + 1;
      entry.cover = chosen;
      if (counts[chosen] === 1) {
        firstFlip[chosen] = Math.random() < 0.5 ? -1 : 1;
        entry.coverFlip = firstFlip[chosen];
      } else {
        entry.coverFlip = -firstFlip[chosen];
      }
      entry.coverScale = 0.85 + Math.random() * 0.30;
      entry.coverTilt = (Math.random() * 2 - 1) * 0.14;
    }
  }

  function spotInFrame(geom, spot, inset = 0) {
    const p = geom.map(spot.u, spot.v);
    const mx = geom.W * inset;
    const my = geom.H * inset;
    return p.x >= mx && p.x <= geom.W - mx && p.y >= my && p.y <= geom.H - my;
  }

  function buildRound(spec, geom) {
    const canPerch = PERCH_SPECIES.has(spec.kind);
    const canHide = (s) => canPerch || s.ground;
    const spots = geom.isPortrait ? PORTRAIT_SPOTS : HIDING_SPOTS;
    const visible = spots.filter((s) => spotInFrame(geom, s));
    let pool = visible.filter(canHide).length >= spec.count ? visible : spots;
    if (geom.isPortrait) {
      const safe = visible.filter((s) => spotInFrame(geom, s, 0.10));
      if (safe.filter(canHide).length >= spec.count) pool = safe;
    }

    const eligible = pool.filter(canHide);
    const pickedTargets = shuffle(eligible).slice(0, spec.count);
    const usedIds = new Set(pickedTargets.map((s) => s.id));

    const remaining = shuffle(pool.filter((s) => !usedIds.has(s.id)));
    const otherSpecies = shuffle(SPECIES.filter((sp) => sp !== spec.kind));
    const neighbors = [];
    for (let i = 0; i < spec.neighborCount && remaining.length; i++) {
      const sp = otherSpecies[i % otherSpecies.length];
      const spotIdx = remaining.findIndex((s) => PERCH_SPECIES.has(sp) || s.ground);
      if (spotIdx < 0) break;
      const spot = remaining.splice(spotIdx, 1)[0];
      neighbors.push({ kind: sp, u: spot.u, v: spot.v, cover: spot.cover, spotId: spot.id });
    }

    const targets = pickedTargets.map((s) => ({ u: s.u, v: s.v, cover: s.cover, spotId: s.id }));
    assignRoundCovers(targets, neighbors, spec.kind);

    return {
      kind: spec.kind,
      targets,
      neighbors,
    };
  }

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
        // Darker and slightly cooler, preserving each animal's own colours (no blue wash)
        d[i]     = Math.round(d[i]     * (1 - 0.74 * k));
        d[i + 1] = Math.round(d[i + 1] * (1 - 0.70 * k));
        d[i + 2] = Math.round(d[i + 2] * (1 - 0.64 * k));
      }
      g.putImageData(id, 0, 0);
      nightCache.set(key, c);
      return c;
    } catch {
      return img;
    }
  }

  /* getNightSprite's per-pixel pass is cheap once, but every target and
     neighbor animal needs it on the very first drawn frame — doing it there
     bunches several full-image pixel passes into one frame instead of
     spreading them across each picture's own load. Warming them here, as
     each picture arrives, keeps the first frame light. */
  function warmNightSprite(src, strength) {
    const img = loadImg(src);
    const go = () => getNightSprite(src, img, strength);
    if (img.complete && img.naturalWidth) go();
    else img.addEventListener('load', go, { once: true });
  }

  function preloadArt() {
    loadImg(`${ART}bg.jpg`);
    SPECIES.forEach((sp) => {
      warmNightSprite(`${ART}${sp}-hidden.png`, 0.90);
      warmNightSprite(`${ART}${sp}-found.png`, 0.90);
      warmNightSprite(`${ART}${sp}-happy.png`, 0.90);
    });
    COVERS.forEach((cv) => warmNightSprite(`${ART}cover-${cv}.png`, 0.72));
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
    let round = { kind: rounds[0].kind, targets: [], neighbors: [] };
    let roundPortrait = null;
    let locked = false;
    let roundWon = false;
    let rafId = 0;
    let timeTick = 0;
    const tm = EDKit.timers();

    /* Girl stands on the right mossy stone bank */
    const GIRL_POS = { u: 0.835, v: 0.525 };
    let lanternU = 0.548, lanternV = 0.762;
    let targetU = 0.548, targetV = 0.762;
    let camU = 0.50, targetCamU = 0.50;
    let foundStates = [];
    let neighborStates = [];
    let sparks = [];
    let press = null;

    const fireflies = Array.from({ length: 30 }, () => ({
      u: 0.08 + Math.random() * 0.84,
      v: 0.10 + Math.random() * 0.72,
      r: 1.4 + Math.random() * 2.2,
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
       - Portrait (upright phone): zoom into the middle of the scene to fill the full height;
         sweeping the lantern left/right smoothly pans across the whole forest. */
    function sceneGeom() {
      const iw = (bgImg.complete && bgImg.naturalWidth) ? bgImg.naturalWidth : 1376;
      const ih = (bgImg.complete && bgImg.naturalHeight) ? bgImg.naturalHeight : 768;
      const isPortrait = W < H * 1.05;
      let scale, dw, dh, ox, oy;
      if (isPortrait) {
        scale = H / ih;
        dw = iw * scale;
        dh = H;
        const halfVisU = Math.min(0.5, (W / dw) * 0.5);
        const clampedCam = Math.max(halfVisU, Math.min(1 - halfVisU, camU));
        ox = W * 0.5 - clampedCam * dw;
        oy = 0;
      } else {
        scale = Math.max(W / iw, H / ih);
        dw = iw * scale;
        dh = ih * scale;
        ox = (W - dw) * 0.5;
        oy = (H - dh) * 0.5;
      }
      return {
        isPortrait, W, H, scale, dw, dh, ox, oy,
        map: (u, v) => ({ x: ox + u * dw, y: oy + v * dh }),
        unmap: (x, y) => ({ u: (x - ox) / dw, v: (y - oy) / dh }),
      };
    }

    function pickRestSpot(roundData) {
      const g = sceneGeom();
      const all = [...roundData.targets, ...roundData.neighbors];
      const beamR = Math.max(76, Math.min(g.dw * 0.125, g.dh * 0.22));
      const pool = g.isPortrait ? PORTRAIT_REST_SPOTS : REST_SPOTS;
      let best = pool[0];
      let bestMin = -1;
      for (const cand of pool) {
        const cp = g.map(cand.u, cand.v);
        if (g.isPortrait && (cp.x < W * 0.10 || cp.x > W * 0.90 || cp.y < H * 0.10 || cp.y > H * 0.90)) {
          continue;
        }
        let minD = Infinity;
        for (const a of all) {
          const ap = g.map(a.u, a.v);
          const d = Math.hypot(cp.x - ap.x, cp.y - ap.y);
          if (d < minD) minD = d;
        }
        if (minD > bestMin) {
          bestMin = minD;
          best = cand;
        }
      }
      return best;
    }

    function syncHitButtons() {
      const g = sceneGeom();
      hitButtons.forEach((btn, idx) => {
        const tg = round.targets[idx];
        if (!tg) return;
        const p = g.map(tg.u, tg.v);
        const onScreen = p.x >= -16 && p.x <= W + 16 && p.y >= -16 && p.y <= H + 16;
        btn.style.left = `${p.x}px`;
        btn.style.top = `${p.y}px`;
        btn.style.visibility = onScreen ? 'visible' : 'hidden';
        btn.style.pointerEvents = onScreen ? 'auto' : 'none';
      });
    }

    function resize() {
      const r = box.getBoundingClientRect();
      W = Math.max(300, r.width);
      H = Math.max(240, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const geom = sceneGeom();
      const clipped = round.targets.some((spot) => !spotInFrame(geom, spot));
      if (roundPortrait !== null && !locked && (roundPortrait !== geom.isPortrait || clipped)) {
        loadRound(roundIdx, foundStates);
        return;
      }
      syncHitButtons();
    }

    function loadRound(idx, previousFinds = []) {
      roundIdx = idx;
      camU = 0.50;
      targetCamU = 0.50;
      const g = sceneGeom();
      roundPortrait = g.isPortrait;
      round = buildRound(rounds[idx], g);
      locked = false;
      roundWon = false;
      foundStates = round.targets.map((_, i) => previousFinds[i]?.found
        ? { found: true, num: previousFinds[i].num, pop: 0, peek: 0 }
        : { found: false, num: 0, pop: 0, peek: 0 });
      const foundCount = foundStates.filter((s) => s.found).length;
      neighborStates = round.neighbors.map(() => ({ wobble: 0, peek: 0 }));
      sparks = [];
      press = null;

      /* Start the lantern on empty ground away from every animal */
      const rest = pickRestSpot(round);
      lanternU = rest.u;
      lanternV = rest.v;
      targetU = rest.u;
      targetV = rest.v;

      const spInfo = t.species[round.kind] || t.species.owl;
      headH2.textContent = t.ask(round.targets.length, spInfo.name);
      hintEl.textContent = t.tip;
      dotsPill.innerHTML = EDKit.dots(rounds.length, roundIdx);

      /* Bottom firefly counter bar with the target animal's own real clay portrait */
      counterBar.innerHTML =
        `<img class="ww-target-icon" src="${ART}${round.kind}-found.png" alt="">` +
        round.targets.map((_, i) => `<span class="ww-slot${i < foundCount ? ' found' : ''}" data-slot="${i}">${i + 1}</span>`).join('');

      /* Accessible 64px+ tap buttons for each target animal */
      uiLayer.innerHTML = '';
      hitButtons = round.targets.map((tg, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ww-hit';
        b.dataset.animal = String(i);
        b.setAttribute('aria-label', t.targetAria(spInfo.sing, i + 1));
        b.addEventListener('click', (e) => {
          if (e.detail === 0) onTapTarget(i);
        });
        uiLayer.append(b);
        return b;
      });
      syncHitButtons();

      /* Speak the EXACT task for this round ("Find 3 owls!", etc.) */
      const voiceKey = `ww-find-${round.targets.length}-${round.kind}`;
      if (!foundCount) EDKit.voice(root, voiceKey, lang);
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
      const g = sceneGeom();
      const uv = g.unmap(px, py);
      if (g.isPortrait) {
        const halfVisU = Math.min(0.5, (W / g.dw) * 0.5);
        const minU = Math.max(0.08, 0.50 - halfVisU + 0.02);
        const maxU = Math.min(0.92, 0.50 + halfVisU - 0.02);
        targetU = Math.max(minU, Math.min(maxU, uv.u));
        targetV = Math.max(0.12, Math.min(0.84, uv.v));
      } else {
        targetU = Math.max(0.08, Math.min(0.84, uv.u));
        targetV = Math.max(0.12, Math.min(0.82, uv.v));
      }
    }

    function movedFromPress(e) {
      return Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10;
    }

    function cancelPress(e) {
      if (press?.id === e.pointerId) press = null;
    }

    box.addEventListener('pointermove', (e) => {
      if (!e.isPrimary) return;
      if (press?.id === e.pointerId && movedFromPress(e)) press.moved = true;
      updateLanternFromPointer(e);
    });
    box.addEventListener('pointerdown', (e) => {
      if (locked || !e.isPrimary || e.button !== 0) return;
      if (e.target.closest('.ww-hud-top, .ww-end-overlay')) return;
      press = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
      updateLanternFromPointer(e);
    });
    box.addEventListener('pointercancel', cancelPress);
    box.addEventListener('pointerleave', cancelPress);
    box.addEventListener('pointerup', (e) => {
      if (press?.id !== e.pointerId) return;
      const moved = press.moved || movedFromPress(e);
      press = null;
      if (locked || moved || e.target.closest('.ww-hud-top, .ww-end-overlay')) return;
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const g = sceneGeom();

      const hitR = Math.max(36, g.dw * 0.040);
      let nearest = -1;
      let nearestDist = hitR;
      for (let i = 0; i < round.targets.length; i++) {
        const p = g.map(round.targets[i].u, round.targets[i].v);
        const dist = Math.hypot(px - p.x, py - p.y);
        if (dist < nearestDist) {
          nearest = i;
          nearestDist = dist;
        }
      }
      if (nearest >= 0) {
        onTapTarget(nearest);
        return;
      }
      for (let i = 0; i < round.neighbors.length; i++) {
        const nb = round.neighbors[i];
        const p = g.map(nb.u, nb.v);
        if (Math.hypot(px - p.x, py - p.y) < hitR * 0.9) {
          targetU = nb.u;
          targetV = nb.v;
          neighborStates[i].wobble = 1;
          sfxRustle();
          spawnSparks(p.x, p.y, 6);
          return;
        }
      }
      updateLanternFromPointer(e);
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

    function drawLitSprite(src, x, y, maxDim, warmBlend, nightStrength = 0.85, angle = 0, flipX = 1) {
      const img = loadImg(src);
      if (!img.complete || !img.naturalWidth) return null;
      const s = maxDim / Math.max(img.naturalWidth, img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;

      ctx2d.save();
      ctx2d.translate(x, y);
      if (angle) ctx2d.rotate(angle);
      if (flipX < 0) ctx2d.scale(-1, 1);

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

    function drawCoverProp(entry, coverType, x, y, unit, girlH, lit) {
      if (!coverType || coverType === 'none' || coverType === 'log' || coverType === 'hollow') return;
      const src = `${ART}cover-${coverType}.png`;
      const baseSize = coverType === 'fern'
        ? girlH * 0.34
        : coverType === 'mushrooms'
          ? girlH * 0.28
          : girlH * 0.24;
      const scale = entry.coverScale || 1;
      const flip = entry.coverFlip || 1;
      const tilt = entry.coverTilt || 0;
      const propSize = baseSize * scale;
      const dy = coverType === 'fern' ? unit * 0.22 : coverType === 'leaves' ? unit * 0.32 : unit * 0.24;
      const dx = (coverType === 'fern' ? -unit * 0.10 : coverType === 'mushrooms' ? -unit * 0.08 : unit * 0.04) * flip;
      drawGroundShadow(x + dx, y + dy + propSize * 0.26, propSize * 0.42, propSize * 0.11, 0.36);
      drawLitSprite(src, x + dx, y + dy, propSize, lit * 0.88, 0.72, tilt, flip);
    }

    function drawAnimalEntry(entry, kind, x, y, unit, girlH, lit, st, isTarget, idx) {
      const isFound = Boolean(isTarget && st && st.found);
      const peekTarget = isFound ? 1 : (lit > 0.20 ? Math.min(1, (lit - 0.16) * 1.55) : 0);
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
        bounceY = -Math.abs(Math.sin(timeTick * 0.1 + idx)) * (unit * 0.12) - st.pop * unit * 0.24;
        popScale = 1.08 + st.pop * 0.16;
      } else {
        // Tuck behind cover when hidden, peek upward when lantern hits
        const tuckOffset = (entry.cover && entry.cover !== 'none') ? (1 - peek) * unit * 0.18 : 0;
        bounceY = tuckOffset + Math.sin(timeTick * 0.05 + idx * 1.9) * 1.4;
      }

      const pose = isFound ? 'happy' : (peek > 0.45 ? 'found' : 'hidden');
      const src = `${ART}${kind}-${pose}.png`;
      const warmBlend = isFound ? 1 : (lit <= 0.04 ? 0 : Math.min(1, lit * 1.25));

      // Soft warm golden halo behind lit / found animal
      if (warmBlend > 0.18) {
        ctx2d.save();
        const halo = ctx2d.createRadialGradient(x, y + bounceY, unit * 0.1, x, y + bounceY, unit * 0.85);
        halo.addColorStop(0, `rgba(255, 218, 110, ${0.46 * warmBlend})`);
        halo.addColorStop(1, 'rgba(255, 165, 40, 0)');
        ctx2d.fillStyle = halo;
        ctx2d.beginPath();
        ctx2d.arc(x, y + bounceY, unit * 0.85, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }

      // Soft ground contact shadow directly under the animal
      if (entry.cover !== 'hollow') {
        drawGroundShadow(x, y + unit * 0.42, unit * 0.42 * popScale, unit * 0.13, 0.48);
      }

      // Enforce rule: leaf pile only for small animals
      const cover = (entry.cover === 'leaves' && !SMALL_SPECIES.has(kind)) ? 'none' : entry.cover;

      if (isFound) {
        // Once found, cover stays behind the happy jumping animal
        drawCoverProp(entry, cover, x, y, unit, girlH, lit);
        drawLitSprite(src, x, y + bounceY, unit * popScale, warmBlend, 0.90, wobbleAngle);
      } else {
        // Hidden/peeking: animal is tucked behind its foreground cover piece
        drawLitSprite(src, x, y + bounceY, unit * popScale, warmBlend, 0.90, wobbleAngle);
        drawCoverProp(entry, cover, x, y, unit, girlH, lit);
      }

      // Golden firefly number orb above found target animals
      if (isFound) {
        const orbY = y + bounceY - unit * 0.58;
        const orbR = Math.max(12, Math.min(18, unit * 0.22));
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
      ctx2d.fillStyle = '#04121b';
      ctx2d.fillRect(0, 0, W, H);
      if (bgImg.complete && bgImg.naturalWidth) {
        ctx2d.drawImage(bgImg, g.ox, g.oy, g.dw, g.dh);
      }
    }

    function tick() {
      timeTick += 1;
      lanternU += (targetU - lanternU) * 0.16;
      lanternV += (targetV - lanternV) * 0.16;
      const prevCam = camU;
      camU += (targetCamU - camU) * 0.14;
      if (Math.abs(camU - prevCam) > 0.0004) syncHitButtons();

      ctx2d.save();
      ctx2d.scale(dpr, dpr);

      const g = sceneGeom();
      drawBackground(g);

      const focus = g.map(lanternU, lanternV);
      const beamRadius = Math.max(76, Math.min(g.dw * 0.125, g.dh * 0.22));
      const girlH = Math.max(115, g.dh * 0.34);
      const unitFor = (sp) => Math.max(28, girlH * (SPECIES_SCALE[sp] || 0.24));

      /* Compute whether any unfound target animal is near the lantern beam -> girl points! */
      let nearUnfound = false;
      round.targets.forEach((tg, i) => {
        if (foundStates[i] && foundStates[i].found) return;
        const p = g.map(tg.u, tg.v);
        if (Math.hypot(p.x - focus.x, p.y - focus.y) < beamRadius * 0.85) nearUnfound = true;
      });

      /* 1. Draw animals inside the real oak tree hollow opening in bg.jpg,
            clipped strictly to the inner dark hole so they peek out over the
            tree's real sculpted bark lip with no floating cutout. */
      const hollowTargets = [];
      const hollowNeighbors = [];
      const otherNeighbors = [];
      const otherTargets = [];

      round.neighbors.forEach((nb, i) => {
        if (nb.cover === 'hollow') hollowNeighbors.push({ item: nb, i });
        else otherNeighbors.push({ item: nb, i });
      });
      round.targets.forEach((tg, i) => {
        if (tg.cover === 'hollow') hollowTargets.push({ item: tg, i });
        else otherTargets.push({ item: tg, i });
      });

      const hCx = g.ox + 0.499 * g.dw;
      const hCy = g.oy + 0.394 * g.dh;
      const hRx = 0.041 * g.dw;
      const hRy = 0.086 * g.dh;

      const drawInsideHollow = (fn) => {
        ctx2d.save();
        ctx2d.beginPath();
        ctx2d.ellipse(hCx, hCy, hRx, hRy, 0, 0, Math.PI * 2);
        ctx2d.clip();
        fn();
        /* Soft inner-lip shadow at the bottom of the hole so the animal sits deep inside */
        const lipGrad = ctx2d.createLinearGradient(0, hCy + hRy * 0.42, 0, hCy + hRy);
        lipGrad.addColorStop(0, 'rgba(6, 4, 2, 0)');
        lipGrad.addColorStop(1, 'rgba(6, 4, 2, 0.72)');
        ctx2d.fillStyle = lipGrad;
        ctx2d.fillRect(hCx - hRx, hCy + hRy * 0.42, hRx * 2, hRy * 0.6);
        ctx2d.restore();
      };

      hollowNeighbors.forEach(({ item, i }) => {
        const p = g.map(item.u, item.v);
        const lit = Math.max(0, 1 - Math.hypot(p.x - focus.x, p.y - focus.y) / beamRadius);
        drawInsideHollow(() => {
          drawAnimalEntry(item, item.kind, p.x, p.y, unitFor(item.kind), girlH, lit, neighborStates[i], false, i + 20);
        });
      });
      hollowTargets.forEach(({ item, i }) => {
        const p = g.map(item.u, item.v);
        const lit = Math.max(0, 1 - Math.hypot(p.x - focus.x, p.y - focus.y) / beamRadius);
        const isFound = Boolean(foundStates[i] && foundStates[i].found);
        if (!isFound) {
          drawInsideHollow(() => {
            drawAnimalEntry(item, round.kind, p.x, p.y, unitFor(round.kind), girlH, lit, foundStates[i], true, i);
          });
        }
      });
      /* Found hollow targets pop out on top of the hollow rim */
      hollowTargets.forEach(({ item, i }) => {
        if (!foundStates[i] || !foundStates[i].found) return;
        const p = g.map(item.u, item.v);
        drawAnimalEntry(item, round.kind, p.x, p.y, unitFor(round.kind), girlH, 1, foundStates[i], true, i);
      });

      /* 2. Draw all other neighbors & target animals sorted by depth (v) */
      const depthList = [
        ...otherNeighbors.map(({ item, i }) => ({ item, i, isTarget: false })),
        ...otherTargets.map(({ item, i }) => ({ item, i, isTarget: true })),
      ].sort((a, b) => a.item.v - b.item.v);

      depthList.forEach(({ item, i, isTarget }) => {
        const p = g.map(item.u, item.v);
        const lit = Math.max(0, 1 - Math.hypot(p.x - focus.x, p.y - focus.y) / beamRadius);
        if (isTarget) {
          drawAnimalEntry(item, round.kind, p.x, p.y, unitFor(round.kind), girlH, lit, foundStates[i], true, i);
        } else {
          drawAnimalEntry(item, item.kind, p.x, p.y, unitFor(item.kind), girlH, lit, neighborStates[i], false, i + 30);
        }
      });

      /* 3. Compute Lantern Girl pose + lantern hand position */
      const girlPose = roundWon ? 'cheering' : (nearUnfound ? 'pointing' : 'looking');
      const girlPos = g.map(GIRL_POS.u, GIRL_POS.v);
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
