/* עמק מראות השמש / The Sun-Mirror Valley
   Full-screen twilight valley light-aiming game for ages 6–8.

   Visual build matches the approved mock-up (commit 9f28f9a):
   - Clean 2560x1429 valley background (assets/worlds/sun-mirror-valley/bg.jpg)
   - Transparent 2x cut-outs: stone mirror stand & swinging mirror face,
     idle/lit crystal, unlit/lit greenhouse with soft radial aura, perspective
     watermill wheel with river clip & foam splash, closed/open wildflowers
     (max 2 varied clumps), and helper hiker (waiting / pointing / cheering)
   - Beams drawn strictly ABOVE mirror, crystal, and targets, meeting at the
     exact glass centre with an organic glint: warm gold from tower/mirror,
     bright cyan leaving the crystal; misses fade softly on the rocks (no buzzer)
   - Screen-wide drag aiming plus >=84px hit targets so upright-phone play is
     effortless; gentle sliding camera keeps mirror, crystal, and targets in view
   - 4 steps x 4 rounds, one idea per step, random start angles & targets,
     spoken task in plain words every round. */

(function () {
  const ART = {
    bg: 'assets/worlds/sun-mirror-valley/bg.jpg',
    mirrorStand: 'assets/worlds/sun-mirror-valley/mirror-stand.png',
    mirrorFace: 'assets/worlds/sun-mirror-valley/mirror-face.png',
    crystalIdle: 'assets/worlds/sun-mirror-valley/crystal-idle.png',
    crystalLit: 'assets/worlds/sun-mirror-valley/crystal-lit.png',
    greenhouseUnlit: 'assets/worlds/sun-mirror-valley/greenhouse-unlit.png',
    greenhouseLit: 'assets/worlds/sun-mirror-valley/greenhouse-lit.png',
    watermillWheel: 'assets/worlds/sun-mirror-valley/watermill-wheel.png',
    flowersClosed: 'assets/worlds/sun-mirror-valley/flowers-closed.png',
    flowersOpen: 'assets/worlds/sun-mirror-valley/flowers-open.png',
    hikerWaiting: 'assets/worlds/sun-mirror-valley/hiker-waiting.png',
    hikerPointing: 'assets/worlds/sun-mirror-valley/hiker-pointing.png',
    hikerCheering: 'assets/worlds/sun-mirror-valley/hiker-cheering.png',
  };

  const SETS = [
    { id: 'mirror',  emoji: '🪞', label: { he: 'מראה',     en: 'Mirror'           }, mode: 'mirror'  },
    { id: 'crystal', emoji: '💎', label: { he: 'גביש',     en: 'Crystal'          }, mode: 'crystal' },
    { id: 'two',     emoji: '✨', label: { he: 'שני יעדים', en: 'Two Places'       }, mode: 'two'     },
    { id: 'valley',  emoji: '🌄', label: { he: 'כל העמק',   en: 'The Whole Valley' }, mode: 'valley'  },
  ];

  const TEXT = {
    he: {
      ask: {
        'smv-mirror-greenhouse': 'כוונו את המראה כדי להאיר את החממה!',
        'smv-mirror-mill': 'כוונו את המראה אל טחנת המים!',
        'smv-crystal-greenhouse': 'סובבו את הגביש כדי לשלוח את האור אל החממה!',
        'smv-crystal-mill': 'סובבו את הגביש כדי לשלוח את האור אל טחנת המים!',
        'smv-split-both': 'פצלו את האור בגביש כדי להאיר גם את החממה וגם את טחנת המים!',
        'smv-whole-valley': 'כוונו את המראה ואת הגביש כדי להאיר את כל העמק!',
      },
      tip: 'גררו בכל מקום על המסך כדי לסובב את המראה או את הגביש אל היעד',
      infoLabel: 'הוראות להורים',
      hearAgain: 'לשמוע שוב',
      done: 'כל הכבוד! העמק כולו מאיר!',
      mirrorAria: 'סיבוב המראה',
      crystalAria: 'סיבוב הגביש',
    },
    en: {
      ask: {
        'smv-mirror-greenhouse': 'Turn the mirror to shine light on the greenhouse!',
        'smv-mirror-mill': 'Turn the mirror toward the watermill!',
        'smv-crystal-greenhouse': 'Turn the crystal to send the light to the greenhouse!',
        'smv-crystal-mill': 'Turn the crystal to send the light to the watermill!',
        'smv-split-both': 'Split the light in the crystal so both the greenhouse and the watermill light up!',
        'smv-whole-valley': 'Turn the mirror and the crystal to light up the whole valley!',
      },
      tip: 'Drag anywhere on the screen to turn the mirror or the crystal toward the target',
      infoLabel: 'Parent note',
      hearAgain: 'Hear again',
      done: 'Well done! The whole valley is glowing!',
      mirrorAria: 'Turn the mirror',
      crystalAria: 'Turn the crystal',
    },
  };

  /* World coordinates (matching approved mock-up 9f28f9a on 2560x1429 bg.jpg) */
  const WORLD_W = 2560;
  const WORLD_H = 1429;
  const TOWER_UV = { u: 0.202, v: 0.122 };
  const SPLIT_SPREAD_DEG = 40.3; // Exact angle between greenhouse & watermill from crystal

  const DEG = 180 / Math.PI;
  const RAD = Math.PI / 180;

  function normAngle(deg) {
    let a = ((deg + 180) % 360 + 360) % 360 - 180;
    return a;
  }

  function angleDiff(a, b) {
    return normAngle(a - b);
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /* Pick a random start angle for the mirror that clearly misses every target
     (always bouncing harmlessly onto the valley rocks or open sky). */
  function pickWrongMirrorAngle(prevAngle) {
    const bands = [
      [118, 154],  // Down-left onto the foreground rocks (exact mockup miss look)
      [42, 74],    // Down-right into lower valley slope
      [-64, -44],  // Up-right into twilight sky above greenhouse
    ];
    for (let tries = 0; tries < 12; tries++) {
      const [lo, hi] = bands[Math.floor(Math.random() * bands.length)];
      const a = randBetween(lo, hi);
      if (prevAngle == null || Math.abs(angleDiff(a, prevAngle)) > 18) return a;
    }
    return randBetween(122, 150);
  }

  /* Pick a random start angle for the crystal where NO outgoing ray hits greenhouse or mill. */
  function pickWrongCrystalAngle(isSplit, prevAngle) {
    const bands = isSplit
      ? [
          [-86, -58],  // Both split rays point high into sky (lower ray <= -38°, >21° above greenhouse)
          [66, 94],    // Both split rays point low onto slope (upper ray >= +46°, >22° below watermill)
          [126, 156],  // Both split rays point down-left into rocks
        ]
      : [
          [-78, -46],  // High into twilight sky above mountain gap
          [54, 84],    // Down into rocky river bank
          [122, 154],  // Down-left into rocks
        ];
    for (let tries = 0; tries < 12; tries++) {
      const [lo, hi] = bands[Math.floor(Math.random() * bands.length)];
      const a = randBetween(lo, hi);
      if (prevAngle == null || Math.abs(angleDiff(a, prevAngle)) > 18) return a;
    }
    return isSplit ? -72 : -62;
  }

  /* Build 4 randomized rounds per step:
     - Step 1 (mirror): aim mirror at random target (greenhouse or mill), no crystal
     - Step 2 (crystal): mirror aimed into crystal; turn crystal to aim cyan ray at random target
     - Step 3 (two): mirror aimed into crystal; turn splitter crystal to light both targets
     - Step 4 (valley): mix the three ideas (1 per round, shuffled) + whole-valley finale */
  function buildRounds(mode) {
    let lastMirror = null;
    let lastCrystal = null;

    const makeMirrorRound = (target) => {
      const startMirror = pickWrongMirrorAngle(lastMirror);
      lastMirror = startMirror;
      return {
        kind: 'mirror',
        hasCrystal: false,
        isSplit: false,
        mirrorMovable: true,
        crystalMovable: false,
        target, // 'greenhouse' | 'mill'
        startMirror,
        startCrystal: 0,
        voiceKey: target === 'greenhouse' ? 'smv-mirror-greenhouse' : 'smv-mirror-mill',
        startHikerPose: 'pointing',
      };
    };

    const makeCrystalRound = (target) => {
      const startCrystal = pickWrongCrystalAngle(false, lastCrystal);
      lastCrystal = startCrystal;
      return {
        kind: 'crystal',
        hasCrystal: true,
        isSplit: false,
        mirrorMovable: false,
        crystalMovable: true,
        target, // 'greenhouse' | 'mill'
        startMirror: null, // Locked straight onto crystal
        startCrystal,
        voiceKey: target === 'greenhouse' ? 'smv-crystal-greenhouse' : 'smv-crystal-mill',
        startHikerPose: 'waiting',
      };
    };

    const makeSplitRound = () => {
      const startCrystal = pickWrongCrystalAngle(true, lastCrystal);
      lastCrystal = startCrystal;
      return {
        kind: 'split',
        hasCrystal: true,
        isSplit: true,
        mirrorMovable: false,
        crystalMovable: true,
        target: 'both',
        startMirror: null, // Locked straight onto crystal
        startCrystal,
        voiceKey: 'smv-split-both',
        startHikerPose: 'pointing',
      };
    };

    const makeWholeRound = () => {
      const startMirror = pickWrongMirrorAngle(lastMirror);
      const startCrystal = pickWrongCrystalAngle(true, lastCrystal);
      lastMirror = startMirror;
      lastCrystal = startCrystal;
      return {
        kind: 'whole',
        hasCrystal: true,
        isSplit: true,
        mirrorMovable: true,
        crystalMovable: true,
        target: 'both',
        startMirror,
        startCrystal,
        voiceKey: 'smv-whole-valley',
        startHikerPose: 'waiting',
      };
    };

    if (mode === 'mirror') {
      const targets = shuffle(['greenhouse', 'mill', 'greenhouse', 'mill']);
      return targets.map(makeMirrorRound);
    }
    if (mode === 'crystal') {
      const targets = shuffle(['greenhouse', 'mill', 'greenhouse', 'mill']);
      return targets.map(makeCrystalRound);
    }
    if (mode === 'two') {
      return [makeSplitRound(), makeSplitRound(), makeSplitRound(), makeSplitRound()];
    }
    /* Step 4 — The Whole Valley: mix all three ideas randomly (one idea per round) + finale */
    const mix = shuffle(['mirror', 'crystal', 'split']);
    const rounds = mix.map((k) => {
      const tgt = Math.random() < 0.5 ? 'greenhouse' : 'mill';
      if (k === 'mirror') return makeMirrorRound(tgt);
      if (k === 'crystal') return makeCrystalRound(tgt);
      return makeSplitRound();
    });
    rounds.push(makeWholeRound());
    return rounds;
  }

  /* ---- Gentle tactile WebAudio feedback (uses real EDSound.note API, never a buzzer) ---- */
  let lastTickAt = 0;
  function sfxTurnTick(isCrystal) {
    const now = performance.now();
    if (now - lastTickAt < 95) return;
    lastTickAt = now;
    if (!window.EDSound || EDSound.quiet()) return;
    EDSound.wake();
    const base = isCrystal ? 640 : 280;
    EDSound.note([base, base * 1.12], { seconds: 0.055, wave: isCrystal ? 'sine' : 'triangle', gain: 0.06 });
  }

  function sfxCrystalWake() {
    if (!window.EDSound || EDSound.quiet()) return;
    EDSound.wake();
    [523.25, 659.25, 783.99].forEach((f, i) => {
      EDSound.note(f, { seconds: 0.22, wave: 'sine', gain: 0.12, delay: i * 0.055 });
    });
  }

  function sfxTargetLit() {
    if (!window.EDSound || EDSound.quiet()) return;
    EDSound.wake();
    EDSound.note([587.33, 783.99], { seconds: 0.2, wave: 'sine', gain: 0.13 });
  }

  function sfxCelebrate() {
    if (!window.EDSound || EDSound.quiet()) return;
    EDSound.wake();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      EDSound.note(f, { seconds: 0.26, wave: 'sine', gain: 0.14, delay: i * 0.085 });
    });
  }

  const CSS = `
    .smv-stage {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #061823;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      direction: ltr;
      cursor: grab;
    }
    .smv-stage.is-dragging { cursor: grabbing; }

    /* Seamless upright-phone sky and meadow continuations (matching approved mock-up 9f28f9a) */
    .smv-phone-sky,
    .smv-phone-meadow {
      display: none;
      position: absolute;
      left: 0; right: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .smv-stage.is-portrait {
      background: linear-gradient(
        to bottom,
        #061c28 0%,
        #0c2f3f 18%,
        #103b4a 34%,
        #0a2832 70%,
        #072029 85%,
        #04141c 100%
      );
    }
    .smv-stage.is-portrait .smv-phone-sky {
      display: block;
      top: 0;
      height: 31%;
      background-image: url('assets/worlds/sun-mirror-valley/bg.jpg');
      background-repeat: no-repeat;
      background-size: 260% 560%;
      background-position: 50% 0%;
      transform: scaleY(-1);
      filter: brightness(0.94);
      -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.88) 0%, #000 35%, #000 78%, transparent 100%);
      mask-image: linear-gradient(to top, rgba(0,0,0,0.88) 0%, #000 35%, #000 78%, transparent 100%);
    }
    .smv-stage.is-portrait .smv-phone-meadow {
      display: block;
      bottom: 0;
      height: 44%;
      background-image: url('assets/worlds/sun-mirror-valley/bg.jpg');
      background-repeat: no-repeat;
      background-size: 165% 400%;
      background-position: 34% 99%;
      filter: brightness(0.92);
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.82) 18%, #000 34%, #000 100%);
      mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.82) 18%, #000 34%, #000 100%);
    }

    /* Proportional 2560x1429 world camera */
    .smv-world {
      position: absolute;
      z-index: 1;
      transition: left 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: left;
    }
    .smv-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: fill;
      display: block;
      pointer-events: none;
    }
    .smv-stage.is-portrait .smv-bg {
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 84%, transparent 100%);
      mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 84%, transparent 100%);
    }

    .smv-ground-shadow {
      position: absolute;
      left: 50%; bottom: -6%;
      width: 92%; height: 22%;
      transform: translateX(-50%);
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(4, 15, 12, 0.72) 0%, rgba(5, 18, 15, 0.34) 56%, transparent 100%);
      z-index: -1;
      pointer-events: none;
    }

    /* ---- Stone Mirror Assembly ---- */
    .smv-mirror {
      position: absolute;
      left: 43.8%;
      top: 66.6%;
      width: 8.0%;
      transform: translate(-50%, -100%);
      z-index: 6;
      pointer-events: none;
    }
    .smv-stage.is-portrait .smv-mirror {
      left: 44.2%;
      top: 66.4%;
      width: 9.4%;
    }
    .smv-mirror-stand {
      display: block;
      width: 100%;
      height: auto;
    }
    .smv-mirror-face-wrap {
      position: absolute;
      left: 51.4%;
      top: 45.5%;
      width: 65%;
      transform: translate(-50%, -50%);
    }
    .smv-mirror-disc {
      position: relative;
      width: 100%;
      transform-origin: center center;
      filter:
        drop-shadow(var(--edge-x, -4px) 2px 0 rgba(74, 48, 22, 0.96))
        drop-shadow(0 4px 6px rgba(4, 14, 20, 0.55));
      will-change: transform;
    }
    .smv-mirror-disc img {
      display: block;
      width: 100%;
      height: auto;
      filter: brightness(1.13) contrast(1.04) saturate(1.06);
    }
    .smv-mirror-disc::after {
      content: '';
      position: absolute;
      inset: 14%;
      border-radius: 50%;
      pointer-events: none;
      background: var(--mirror-sheen, linear-gradient(115deg, rgba(255, 245, 205, 0.42) 0%, rgba(255, 232, 160, 0.14) 45%, rgba(8, 24, 34, 0.28) 100%));
      mix-blend-mode: screen;
    }
    .smv-mirror-disc::before {
      content: '';
      position: absolute;
      inset: 13%;
      border-radius: 50%;
      pointer-events: none;
      background: var(--mirror-shade, linear-gradient(90deg, rgba(6, 18, 26, 0.34) 0%, rgba(6, 18, 26, 0) 55%));
      z-index: 2;
    }

    /* ---- Crystal Prism ---- */
    .smv-crystal {
      position: absolute;
      left: 57.6%;
      top: 58.4%;
      width: 4.2%;
      transform: translate(-50%, -100%);
      z-index: 6;
      pointer-events: none;
    }
    .smv-stage.is-portrait .smv-crystal {
      width: 5.0%;
    }
    .smv-crystal[hidden] { display: none; }
    .smv-crystal-turn {
      transform-origin: 50% 82%;
      will-change: transform;
    }
    .smv-crystal img {
      display: block;
      width: 100%;
      height: auto;
    }
    .smv-crystal .img-lit { display: none; }
    .smv-crystal.is-lit .img-idle { display: none; }
    .smv-crystal.is-lit .img-lit { display: block; }
    .smv-crystal-aura {
      position: absolute;
      left: 50%; top: 44%;
      width: 240%; height: 150%;
      transform: translate(-50%, -50%);
      background: radial-gradient(ellipse at center, rgba(84, 232, 255, 0.36) 0%, rgba(56, 210, 248, 0.13) 45%, rgba(56, 210, 248, 0) 74%);
      opacity: 0;
      transition: opacity 0.25s ease;
      z-index: -1;
      pointer-events: none;
    }
    .smv-crystal.is-lit .smv-crystal-aura { opacity: 1; }

    /* ---- Greenhouse (soft wide radial light behind building, zero hard oval) ---- */
    .smv-greenhouse {
      position: absolute;
      left: 83.8%;
      top: 44.6%;
      width: 10.6%;
      transform: translate(-50%, -100%);
      z-index: 4;
      pointer-events: none;
    }
    .smv-greenhouse img {
      display: block;
      width: 100%;
      height: auto;
      position: relative;
      z-index: 1;
    }
    .smv-greenhouse .img-lit { display: none; }
    .smv-greenhouse.is-lit .img-unlit { display: none; }
    .smv-greenhouse.is-lit .img-lit { display: block; }
    .smv-gh-aura {
      position: absolute;
      left: 50%; top: 48%;
      width: 215%; height: 185%;
      transform: translate(-50%, -50%);
      background: radial-gradient(
        ellipse at center,
        rgba(255, 214, 102, 0.34) 0%,
        rgba(255, 192, 68, 0.15) 38%,
        rgba(255, 178, 52, 0.04) 62%,
        rgba(255, 178, 52, 0) 78%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
      pointer-events: none;
    }
    .smv-greenhouse.is-lit .smv-gh-aura { opacity: 1; }

    /* ---- Watermill Wheel (in perspective on mill side wall, river clip + splash) ---- */
    .smv-wheel {
      position: absolute;
      left: 81.9%;
      top: 69.6%;
      width: 5.8%;
      transform: translate(-50%, -50%) scaleX(0.62) skewY(-12deg);
      z-index: 5;
      pointer-events: none;
    }
    .smv-wheel-shadow {
      position: absolute;
      left: 38%; top: 52%;
      width: 96%; height: 96%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(4, 14, 18, 0.65) 0%, rgba(4, 14, 18, 0.28) 58%, transparent 82%);
      z-index: 0;
    }
    .smv-wheel-aura {
      position: absolute;
      left: 50%; top: 50%;
      width: 220%; height: 180%;
      transform: translate(-50%, -50%);
      background: radial-gradient(
        ellipse at center,
        rgba(103, 232, 249, 0.34) 0%,
        rgba(103, 232, 249, 0.13) 40%,
        rgba(103, 232, 249, 0) 74%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
    }
    .smv-wheel.is-gold .smv-wheel-aura {
      background: radial-gradient(
        ellipse at center,
        rgba(255, 214, 102, 0.36) 0%,
        rgba(255, 192, 68, 0.14) 40%,
        rgba(255, 178, 52, 0) 74%
      );
    }
    .smv-wheel-clip {
      position: relative;
      z-index: 1;
      width: 100%;
      -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 79%, rgba(0, 0, 0, 0.58) 91%, rgba(0, 0, 0, 0.14) 100%);
      mask-image: linear-gradient(to bottom, #000 0%, #000 79%, rgba(0, 0, 0, 0.58) 91%, rgba(0, 0, 0, 0.14) 100%);
    }
    .smv-wheel-clip img {
      display: block;
      width: 100%;
      height: auto;
      filter: brightness(0.88) contrast(1.05);
      will-change: transform;
    }
    .smv-wheel-splash {
      position: absolute;
      left: -14%; right: -14%; bottom: -8%;
      height: 26%;
      z-index: 2;
      background: radial-gradient(
        ellipse at 50% 60%,
        rgba(155, 224, 236, 0.48) 0%,
        rgba(74, 166, 188, 0.24) 40%,
        rgba(20, 74, 92, 0) 68%
      );
      transition: background 0.3s ease;
    }
    .smv-wheel.is-lit .smv-wheel-aura { opacity: 1; }
    .smv-wheel.is-lit .smv-wheel-clip img {
      filter: brightness(1.08) contrast(1.04) saturate(1.06);
    }
    .smv-wheel.is-lit .smv-wheel-splash {
      background: radial-gradient(
        ellipse at 50% 60%,
        rgba(206, 248, 255, 0.62) 0%,
        rgba(103, 214, 236, 0.28) 42%,
        rgba(24, 86, 108, 0) 68%
      );
    }

    /* ---- Helper Hiker ---- */
    .smv-hiker {
      position: absolute;
      left: 65.4%;
      top: 79.8%;
      width: 6.0%;
      transform: translate(-50%, -100%);
      z-index: 9;
      pointer-events: none;
    }
    .smv-stage.is-portrait .smv-hiker { width: 6.8%; }
    .smv-hiker img {
      display: none;
      width: 100%;
      height: auto;
      filter: drop-shadow(0 6px 10px rgba(4, 14, 20, 0.5));
    }
    .smv-hiker[data-pose="waiting"] .img-waiting { display: block; }
    .smv-hiker[data-pose="pointing"] .img-pointing { display: block; }
    .smv-hiker[data-pose="cheering"] .img-cheering {
      display: block;
      animation: smv-hop 0.65s ease-in-out infinite;
    }
    @keyframes smv-hop {
      0%, 100% { transform: translateY(0); }
      45% { transform: translateY(-9%); }
    }

    /* ---- Meadow Wildflowers (max 2 clumps, varied size, flip & tilt) ---- */
    .smv-flower {
      position: absolute;
      transform: translate(-50%, -100%);
      z-index: 9;
      pointer-events: none;
    }
    .smv-flower img {
      display: block;
      width: 100%;
      height: auto;
    }
    .smv-flower .img-open { display: none; }
    .smv-stage.is-bloom .smv-flower .img-closed { display: none; }
    .smv-stage.is-bloom .smv-flower .img-open {
      display: block;
      filter: drop-shadow(0 0 10px rgba(56, 224, 255, 0.45));
    }
    .smv-phone-flowers {
      display: none;
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 9;
    }
    .smv-stage.is-portrait .smv-phone-flowers { display: block; }
    .smv-stage.is-portrait .smv-world .smv-flower { display: none; }

    /* ---- Beam SVG strictly ABOVE mirror (6), crystal (6), wheel (5), greenhouse (4) ---- */
    .smv-beams {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
      z-index: 8;
    }

    /* ---- Accessible >=84px Hit Targets & Active Grip Ring ---- */
    .smv-hit-layer {
      position: absolute;
      inset: 0;
      z-index: 10;
      pointer-events: none;
    }
    .smv-hit {
      position: absolute;
      transform: translate(-50%, -50%);
      min-width: 84px;
      min-height: 84px;
      border-radius: 50%;
      background: transparent;
      border: 2px solid transparent;
      padding: 0;
      margin: 0;
      cursor: grab;
      pointer-events: auto;
      display: grid;
      place-items: center;
      touch-action: none;
    }
    .smv-hit:active { cursor: grabbing; }
    .smv-hit[hidden] { display: none; }
    .smv-hit:focus-visible {
      outline: 3px solid #fde047;
      outline-offset: 2px;
      background: rgba(254, 224, 71, 0.14);
    }
    /* Subtle soft grip ring on the active turnable piece (never on any target!) */
    .smv-hit-ring {
      width: 68%;
      height: 68%;
      border-radius: 50%;
      border: 2px dashed rgba(254, 240, 138, 0.42);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.18);
      opacity: 0;
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: none;
    }
    .smv-hit[data-piece="crystal"] .smv-hit-ring {
      border-color: rgba(103, 232, 249, 0.52);
      box-shadow: 0 0 12px rgba(56, 217, 245, 0.22);
    }
    .smv-hit.is-active .smv-hit-ring {
      opacity: 0.82;
      animation: smv-ring-pulse 2.4s ease-in-out infinite;
    }
    .smv-stage.is-dragging .smv-hit.is-active .smv-hit-ring {
      opacity: 1;
      border-style: solid;
      transform: scale(1.08);
      animation: none;
    }
    .smv-stage.is-solved .smv-hit-ring { opacity: 0 !important; }
    @keyframes smv-ring-pulse {
      0%, 100% { transform: scale(0.96); opacity: 0.52; }
      50% { transform: scale(1.06); opacity: 0.88; }
    }

    /* ---- Thin Full-Screen HUD (Speaker + Progress Dots + Collapsible Parent Note) ---- */
    .smv-hud-top {
      position: absolute;
      top: 10px;
      left: 12px;
      right: 12px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      pointer-events: none;
      z-index: 15;
    }
    .smv-hud-top[dir="rtl"] { direction: rtl; }
    .smv-hud-top[dir="ltr"] { direction: ltr; }
    .smv-hud-left {
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
    }
    .smv-say-btn {
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
    .smv-say-btn:active { transform: scale(0.93); }
    .smv-say-btn.nudge { animation: kit-nudge 1s ease infinite; }
    .smv-dots-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 12px;
      border-radius: 99px;
      background: rgba(6, 22, 30, 0.74);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 224, 150, 0.25);
    }
    .smv-dots-pill .kit-dots { gap: 7px; }
    .smv-dots-pill .kit-dot { width: 11px; height: 11px; background: rgba(255, 255, 255, 0.24); }
    .smv-dots-pill .kit-dot.done { background: #fbbf24; box-shadow: 0 0 8px rgba(251, 191, 36, 0.65); }

    .smv-hud-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      pointer-events: auto;
    }
    .smv-info-btn {
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
    .smv-parent-note {
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
    .smv-parent-note[hidden] { display: none; }
    .smv-parent-note h2 { margin: 0 0 4px; font-size: 1rem; color: #fde68a; }
    .smv-parent-note p { margin: 0; font-size: 0.85rem; color: #d6ebe8; line-height: 1.35; }

    /* ---- Celebration Sparkles ---- */
    .smv-sparkles {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 11;
      overflow: hidden;
    }
    .smv-spark {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: smv-spark-rise 1.15s ease-out forwards;
    }
    @keyframes smv-spark-rise {
      0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
      100% { transform: translate(calc(-50% + var(--sx)), calc(-50% + var(--sy))) scale(1.25); opacity: 0; }
    }

    /* ---- End-of-Step Overlay ---- */
    .smv-end-overlay {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgba(4, 15, 24, 0.82);
      backdrop-filter: blur(8px);
      z-index: 20;
      padding: 20px;
      direction: rtl;
    }
    .smv-end-overlay[dir="ltr"] { direction: ltr; }
    .smv-end-overlay[hidden] { display: none; }
    .smv-end-overlay .kit-end {
      background: rgba(9, 27, 38, 0.94);
      border: 2px solid rgba(251, 191, 36, 0.55);
      border-radius: 26px;
      padding: 26px 28px;
      color: #fef9e7;
      box-shadow: 0 18px 44px rgba(0, 0, 0, 0.6);
      max-width: 400px;
      width: 100%;
    }
    .smv-end-overlay .kit-end p { color: #c7e2de; }
    .smv-end-overlay .btn--ghost {
      color: #fef9e7;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.35);
      box-shadow: none;
    }

    @media (max-width: 600px) {
      .smv-say-btn { width: 52px; height: 52px; font-size: 24px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .smv-hiker[data-pose="cheering"] .img-cheering,
      .smv-hit.is-active .smv-hit-ring,
      .smv-spark { animation: none; }
    }
  `;

  let cleanupFn = null;
  let svgUid = 0;

  function mount(root, ctx) {
    EDKit.style('smv-style', CSS);

    const lang = ctx.lang === 'en' ? 'en' : 'he';
    const dir = lang === 'he' ? 'rtl' : 'ltr';
    const t = TEXT[lang] || TEXT.he;
    const mode = (ctx.set && ctx.set.mode) || 'mirror';
    const tm = EDKit.timers();

    if (window.EDVoice) {
      EDVoice.warm([
        'smv-mirror-greenhouse', 'smv-mirror-mill',
        'smv-crystal-greenhouse', 'smv-crystal-mill',
        'smv-split-both', 'smv-whole-valley', 'smv-yay',
      ], lang);
    }

    root.innerHTML = `
      <div class="smv-stage" id="smv-stage">
        <div class="smv-phone-sky" aria-hidden="true"></div>
        <div class="smv-phone-meadow" aria-hidden="true"></div>

        <div class="smv-world" id="smv-world">
          <img class="smv-bg" id="smv-bg" src="${ART.bg}" alt="" draggable="false">

          <div class="smv-greenhouse" id="smv-gh">
            <span class="smv-gh-aura"></span>
            <span class="smv-ground-shadow"></span>
            <img class="img-unlit" src="${ART.greenhouseUnlit}" alt="" draggable="false">
            <img class="img-lit" src="${ART.greenhouseLit}" alt="" draggable="false">
          </div>

          <div class="smv-wheel" id="smv-wheel">
            <span class="smv-wheel-shadow"></span>
            <span class="smv-wheel-aura"></span>
            <div class="smv-wheel-clip">
              <img id="smv-wheel-img" src="${ART.watermillWheel}" alt="" draggable="false">
            </div>
            <span class="smv-wheel-splash"></span>
          </div>

          <div class="smv-mirror" id="smv-mirror">
            <span class="smv-ground-shadow"></span>
            <img class="smv-mirror-stand" src="${ART.mirrorStand}" alt="" draggable="false">
            <div class="smv-mirror-face-wrap" id="smv-mirror-face-wrap">
              <div class="smv-mirror-disc" id="smv-mirror-disc">
                <img src="${ART.mirrorFace}" alt="" draggable="false">
              </div>
            </div>
          </div>

          <div class="smv-crystal" id="smv-crystal" hidden>
            <span class="smv-crystal-aura"></span>
            <span class="smv-ground-shadow"></span>
            <div class="smv-crystal-turn" id="smv-crystal-turn">
              <img class="img-idle" src="${ART.crystalIdle}" alt="" draggable="false">
              <img class="img-lit" src="${ART.crystalLit}" alt="" draggable="false">
            </div>
          </div>

          <svg class="smv-beams" id="smv-beams" aria-hidden="true"></svg>

          <div class="smv-hiker" id="smv-hiker" data-pose="waiting">
            <span class="smv-ground-shadow"></span>
            <img class="img-waiting" src="${ART.hikerWaiting}" alt="" draggable="false">
            <img class="img-pointing" src="${ART.hikerPointing}" alt="" draggable="false">
            <img class="img-cheering" src="${ART.hikerCheering}" alt="" draggable="false">
          </div>

          <div class="smv-flower" id="smv-fl-1" style="left:21.5%; top:93.0%; width:8.2%; transform:translate(-50%,-100%) rotate(-7deg);">
            <span class="smv-ground-shadow"></span>
            <img class="img-closed" src="${ART.flowersClosed}" alt="" draggable="false">
            <img class="img-open" src="${ART.flowersOpen}" alt="" draggable="false">
          </div>
          <div class="smv-flower" id="smv-fl-2" style="left:47.5%; top:91.0%; width:5.8%; transform:translate(-50%,-100%) scaleX(-1) rotate(11deg);">
            <span class="smv-ground-shadow"></span>
            <img class="img-closed" src="${ART.flowersClosed}" alt="" draggable="false">
            <img class="img-open" src="${ART.flowersOpen}" alt="" draggable="false">
          </div>
        </div>

        <div class="smv-phone-flowers" aria-hidden="true">
          <div class="smv-flower" style="left:26%; top:88%; width:24%; transform:translate(-50%,-100%) rotate(-7deg);">
            <span class="smv-ground-shadow"></span>
            <img class="img-closed" src="${ART.flowersClosed}" alt="" draggable="false">
            <img class="img-open" src="${ART.flowersOpen}" alt="" draggable="false">
          </div>
          <div class="smv-flower" style="left:75%; top:84%; width:17%; transform:translate(-50%,-100%) scaleX(-1) rotate(11deg);">
            <span class="smv-ground-shadow"></span>
            <img class="img-closed" src="${ART.flowersClosed}" alt="" draggable="false">
            <img class="img-open" src="${ART.flowersOpen}" alt="" draggable="false">
          </div>
        </div>

        <div class="smv-sparkles" id="smv-sparkles" aria-hidden="true"></div>

        <div class="smv-hit-layer" id="smv-hit-layer">
          <button type="button" class="smv-hit" id="smv-hit-mirror" data-piece="mirror" aria-label="${t.mirrorAria}">
            <span class="smv-hit-ring"></span>
          </button>
          <button type="button" class="smv-hit" id="smv-hit-crystal" data-piece="crystal" aria-label="${t.crystalAria}" hidden>
            <span class="smv-hit-ring"></span>
          </button>
        </div>

        <div class="smv-hud-top" dir="${dir}">
          <div class="smv-hud-left">
            <button type="button" class="smv-say-btn" id="smv-say" aria-label="${t.hearAgain}">🔊</button>
            <div class="smv-dots-pill"><div class="kit-dots" id="smv-dots"></div></div>
          </div>
          <div class="smv-hud-right">
            <button type="button" class="smv-info-btn" id="smv-info-btn" aria-expanded="false" aria-label="${t.infoLabel}">?</button>
            <div class="smv-parent-note" id="smv-parent-note" hidden>
              <h2 id="smv-ask"></h2>
              <p>${t.tip}</p>
            </div>
          </div>
        </div>

        <div class="smv-end-overlay" id="smv-end" dir="${dir}" hidden></div>
      </div>
    `;

    const stageEl = root.querySelector('#smv-stage');
    const worldEl = root.querySelector('#smv-world');
    const ghEl = root.querySelector('#smv-gh');
    const wheelEl = root.querySelector('#smv-wheel');
    const wheelImgEl = root.querySelector('#smv-wheel-img');
    const mirrorFaceWrapEl = root.querySelector('#smv-mirror-face-wrap');
    const mirrorDiscEl = root.querySelector('#smv-mirror-disc');
    const crystalEl = root.querySelector('#smv-crystal');
    const crystalTurnEl = root.querySelector('#smv-crystal-turn');
    const beamsSvg = root.querySelector('#smv-beams');
    const hikerEl = root.querySelector('#smv-hiker');
    const fl1El = root.querySelector('#smv-fl-1');
    const fl2El = root.querySelector('#smv-fl-2');
    const sparklesEl = root.querySelector('#smv-sparkles');
    const hitMirrorBtn = root.querySelector('#smv-hit-mirror');
    const hitCrystalBtn = root.querySelector('#smv-hit-crystal');
    const sayBtn = root.querySelector('#smv-say');
    const dotsEl = root.querySelector('#smv-dots');
    const infoBtn = root.querySelector('#smv-info-btn');
    const parentNoteEl = root.querySelector('#smv-parent-note');
    const askEl = root.querySelector('#smv-ask');
    const endOverlay = root.querySelector('#smv-end');

    const rounds = buildRounds(mode);
    let roundIdx = 0;
    let round = rounds[0];

    /* Live optical & animation state */
    let mirrorAngle = 140;     // Degrees of reflected golden beam from mirror
    let crystalAngle = -50;    // Degrees of outgoing cyan beam (or center of split)
    let activePiece = 'mirror';
    let solved = false;
    let crystalWasLit = false;
    let targetWasLit = false;
    let alignedMs = 0;
    let wheelDeg = 0;
    let wheelSpeed = 0;        // deg/sec, smoothly accelerates when lit
    let lastFrameAt = 0;
    let rafId = 0;
    let dragState = null;      // { pointerId, piece, startX, startY, startAngle, lastPolar, moved }
    let camMode = 'start';     // 'start' | 'crystal' | 'solved'
    let worldW = 1000;
    let worldH = 558;
    let isPortraitMode = false;

    /* Cached landmark centres inside worldEl (pixel coordinates 0..worldW, 0..worldH) */
    const pts = {
      tower: { x: 202, y: 122 },
      mirror: { x: 440, y: 320 },
      crystal: { x: 576, y: 282 },
      greenhouse: { x: 838, y: 204 },
      wheel: { x: 819, y: 388 },
    };

    /* Exact target angles computed from real rendered landmark coordinates */
    const angles = {
      mirrorToCrystal: -16.0,
      mirrorToGreenhouse: -16.4,
      mirrorToMill: 10.0,
      crystalToGreenhouse: -16.6,
      crystalToMill: 23.7,
      crystalSplitMid: 3.55,
    };

    function measureLandmarks() {
      const wRect = worldEl.getBoundingClientRect();
      const sRect = stageEl.getBoundingClientRect();
      worldW = Math.max(100, wRect.width);
      worldH = Math.max(100, wRect.height);

      function centerOf(el, ox, oy, fallbackU, fallbackV) {
        if (!el || el.hidden) {
          return { x: fallbackU * worldW, y: fallbackV * worldH };
        }
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) {
          return { x: fallbackU * worldW, y: fallbackV * worldH };
        }
        return {
          x: (r.left - wRect.left) + r.width * ox,
          y: (r.top - wRect.top) + r.height * oy,
        };
      }

      pts.tower = { x: TOWER_UV.u * worldW, y: TOWER_UV.v * worldH };
      pts.mirror = centerOf(mirrorFaceWrapEl, 0.5, 0.5, 0.440, 0.576);
      pts.crystal = centerOf(crystalEl, 0.5, 0.43, 0.576, 0.505);
      pts.greenhouse = centerOf(ghEl, 0.5, 0.54, 0.838, 0.365);
      pts.wheel = centerOf(wheelEl, 0.5, 0.50, 0.819, 0.696);

      angles.mirrorToCrystal = Math.atan2(pts.crystal.y - pts.mirror.y, pts.crystal.x - pts.mirror.x) * DEG;
      angles.mirrorToGreenhouse = Math.atan2(pts.greenhouse.y - pts.mirror.y, pts.greenhouse.x - pts.mirror.x) * DEG;
      angles.mirrorToMill = Math.atan2(pts.wheel.y - pts.mirror.y, pts.wheel.x - pts.mirror.x) * DEG;
      angles.crystalToGreenhouse = Math.atan2(pts.greenhouse.y - pts.crystal.y, pts.greenhouse.x - pts.crystal.x) * DEG;
      angles.crystalToMill = Math.atan2(pts.wheel.y - pts.crystal.y, pts.wheel.x - pts.crystal.x) * DEG;
      angles.crystalSplitMid = (angles.crystalToGreenhouse + angles.crystalToMill) * 0.5;

      /* Position >=84px accessible hit targets right over mirror and crystal in stage coordinates */
      const offsetX = wRect.left - sRect.left;
      const offsetY = wRect.top - sRect.top;
      const hitSize = Math.max(84, Math.round(worldW * 0.105));

      hitMirrorBtn.style.left = `${(offsetX + pts.mirror.x).toFixed(1)}px`;
      hitMirrorBtn.style.top = `${(offsetY + pts.mirror.y).toFixed(1)}px`;
      hitMirrorBtn.style.width = `${hitSize}px`;
      hitMirrorBtn.style.height = `${hitSize}px`;

      hitCrystalBtn.style.left = `${(offsetX + pts.crystal.x).toFixed(1)}px`;
      hitCrystalBtn.style.top = `${(offsetY + pts.crystal.y).toFixed(1)}px`;
      hitCrystalBtn.style.width = `${hitSize}px`;
      hitCrystalBtn.style.height = `${hitSize}px`;
    }

    function applyCamera() {
      const sRect = stageEl.getBoundingClientRect();
      const vw = Math.max(300, sRect.width);
      const vh = Math.max(300, sRect.height);
      const aspect = vw / vh;
      isPortraitMode = aspect < 0.92;
      stageEl.classList.toggle('is-portrait', isPortraitMode);

      if (isPortraitMode) {
        /* Portrait phone (390x844): exact approved mock-up framing so mirror, crystal,
           greenhouse & watermill are ALL visible together, with smooth camera slide. */
        const w = vw * 1.78;
        const h = w * (WORLD_H / WORLD_W);
        const top = vh * 0.205;
        const leftPct = camMode === 'solved' || camMode === 'crystal' ? -0.655 : -0.605;
        worldEl.style.width = `${w.toFixed(1)}px`;
        worldEl.style.height = `${h.toFixed(1)}px`;
        worldEl.style.top = `${top.toFixed(1)}px`;
        worldEl.style.left = `${(vw * leftPct).toFixed(1)}px`;
      } else {
        /* Tablet (1024x768), Laptop (1280x800), Wide (1460x640):
           cover viewport cleanly with zero scrolling and keep tower, mirror, crystal,
           greenhouse, watermill, hiker, and flowers comfortably in frame. */
        const scale = Math.max(vw / WORLD_W, vh / WORLD_H);
        const drawW = WORLD_W * scale;
        const drawH = WORLD_H * scale;
        const panX = aspect < 1.65 ? 0.56 : 0.50;
        const panY = aspect > 1.95 ? 0.36 : 0.50;
        const left = (vw - drawW) * panX;
        const top = (vh - drawH) * panY;
        worldEl.style.width = `${drawW.toFixed(1)}px`;
        worldEl.style.height = `${drawH.toFixed(1)}px`;
        worldEl.style.left = `${left.toFixed(1)}px`;
        worldEl.style.top = `${top.toFixed(1)}px`;

        /* On wide short screens, keep foreground wildflowers comfortably inside the bottom edge */
        const maxFlV = Math.min(93.0, ((vh - top - 8) / drawH) * 100);
        fl1El.style.top = `${maxFlV.toFixed(1)}%`;
        fl2El.style.top = `${Math.min(91.0, maxFlV - 1.5).toFixed(1)}%`;
      }

      measureLandmarks();
    }

    /* Update the stone mirror's visible 3D swing on its side pivot pins */
    function updateMirrorVisual(outAngleDeg) {
      /* Map outgoing beam angle continuously so:
         - Aimed right-up (-16°): scaleX ~0.88, skewY ~-13deg, rot ~+9deg, edgeX ~-4px
         - Aimed right-down (+10°): scaleX ~0.83, skewY ~+2deg, rot ~-2deg, edgeX ~-2px
         - Aimed down-left (+142°): scaleX ~0.50, skewY ~+19deg, rot ~-14deg, edgeX ~+5px */
      const rad = outAngleDeg * RAD;
      const cosA = Math.cos(rad); // +1 pointing right, -1 pointing left
      const sinA = Math.sin(rad); // -1 pointing up, +1 pointing down

      const scaleX = 0.68 + 0.21 * cosA;              // 0.47..0.89
      const skewY = 4 + 13 * sinA - 12 * (cosA > 0 ? cosA * Math.max(0, -sinA) : -cosA * 0.7);
      const rot = -2 - 11 * sinA + 7 * (cosA > 0 ? cosA * Math.max(0, -sinA) : -cosA * 0.6);
      const edgeX = -4.5 * cosA;                      // -4.5px right-facing, +4.5px left-facing

      mirrorDiscEl.style.transform = `scaleX(${scaleX.toFixed(3)}) skewY(${skewY.toFixed(1)}deg) rotate(${rot.toFixed(1)}deg)`;
      mirrorDiscEl.style.setProperty('--edge-x', `${edgeX.toFixed(1)}px`);

      if (cosA < 0) {
        mirrorDiscEl.style.setProperty(
          '--mirror-shade',
          'linear-gradient(270deg, rgba(5, 16, 24, 0.52) 0%, rgba(5, 16, 24, 0.14) 46%, rgba(5, 16, 24, 0) 75%)'
        );
        mirrorDiscEl.style.setProperty(
          '--mirror-sheen',
          'linear-gradient(95deg, rgba(255, 244, 195, 0.42) 0%, rgba(255, 224, 130, 0.12) 44%, transparent 72%)'
        );
      } else {
        mirrorDiscEl.style.setProperty(
          '--mirror-shade',
          'linear-gradient(90deg, rgba(5, 16, 24, 0.30) 0%, rgba(5, 16, 24, 0) 48%)'
        );
        mirrorDiscEl.style.setProperty(
          '--mirror-sheen',
          'linear-gradient(125deg, rgba(255, 250, 218, 0.52) 0%, rgba(255, 226, 140, 0.22) 52%, transparent 82%)'
        );
      }
    }

    function updateCrystalVisual(angleDeg) {
      /* Subtle physical turn in its carved stone socket as the child turns the crystal */
      const diff = angleDiff(angleDeg, angles.crystalSplitMid);
      const tilt = Math.max(-14, Math.min(14, diff * 0.18));
      const sx = 0.86 + 0.14 * Math.cos(Math.min(Math.PI * 0.5, Math.abs(diff) * RAD * 0.85));
      crystalTurnEl.style.transform = `rotate(${tilt.toFixed(1)}deg) scaleX(${sx.toFixed(3)})`;
    }

    /* Evaluate optical paths from current mirrorAngle & crystalAngle */
    function evaluateOptics() {
      const mTol = 7.2;
      const cTol = 7.6;

      let mirrorHitsCrystal = false;
      let mirrorHitsGh = false;
      let mirrorHitsMill = false;
      let effectiveMirrorAngle = mirrorAngle;

      if (round.hasCrystal) {
        if (!round.mirrorMovable) {
          mirrorHitsCrystal = true;
          effectiveMirrorAngle = angles.mirrorToCrystal;
        } else if (Math.abs(angleDiff(mirrorAngle, angles.mirrorToCrystal)) <= mTol) {
          mirrorHitsCrystal = true;
          effectiveMirrorAngle = angles.mirrorToCrystal;
        } else if (Math.abs(angleDiff(mirrorAngle, angles.mirrorToMill)) <= mTol) {
          mirrorHitsMill = true;
          effectiveMirrorAngle = angles.mirrorToMill;
        }
      } else {
        if (Math.abs(angleDiff(mirrorAngle, angles.mirrorToGreenhouse)) <= mTol) {
          mirrorHitsGh = true;
          effectiveMirrorAngle = angles.mirrorToGreenhouse;
        } else if (Math.abs(angleDiff(mirrorAngle, angles.mirrorToMill)) <= mTol) {
          mirrorHitsMill = true;
          effectiveMirrorAngle = angles.mirrorToMill;
        }
      }

      let crystalHitsGh = false;
      let crystalHitsMill = false;
      const crystalRays = []; // { angle, target: 'greenhouse'|'mill'|null }

      if (round.hasCrystal && mirrorHitsCrystal) {
        if (round.isSplit) {
          const half = SPLIT_SPREAD_DEG * 0.5;
          const aUp = normAngle(crystalAngle - half);
          const aDn = normAngle(crystalAngle + half);

          const upGh = Math.abs(angleDiff(aUp, angles.crystalToGreenhouse)) <= cTol;
          const dnMill = Math.abs(angleDiff(aDn, angles.crystalToMill)) <= cTol;
          const upMill = Math.abs(angleDiff(aUp, angles.crystalToMill)) <= cTol;
          const dnGh = Math.abs(angleDiff(aDn, angles.crystalToGreenhouse)) <= cTol;

          if (upGh && dnMill) {
            crystalHitsGh = true;
            crystalHitsMill = true;
            crystalRays.push({ angle: angles.crystalToGreenhouse, target: 'greenhouse' });
            crystalRays.push({ angle: angles.crystalToMill, target: 'mill' });
          } else {
            const t1 = upGh ? 'greenhouse' : (upMill ? 'mill' : null);
            const t2 = dnMill ? 'mill' : (dnGh ? 'greenhouse' : null);
            if (t1 === 'greenhouse' || t2 === 'greenhouse') crystalHitsGh = true;
            if (t1 === 'mill' || t2 === 'mill') crystalHitsMill = true;
            crystalRays.push({
              angle: t1 === 'greenhouse' ? angles.crystalToGreenhouse : (t1 === 'mill' ? angles.crystalToMill : aUp),
              target: t1,
            });
            crystalRays.push({
              angle: t2 === 'mill' ? angles.crystalToMill : (t2 === 'greenhouse' ? angles.crystalToGreenhouse : aDn),
              target: t2,
            });
          }
        } else {
          const hitsGh = Math.abs(angleDiff(crystalAngle, angles.crystalToGreenhouse)) <= cTol;
          const hitsMill = Math.abs(angleDiff(crystalAngle, angles.crystalToMill)) <= cTol;
          if (hitsGh) {
            crystalHitsGh = true;
            crystalRays.push({ angle: angles.crystalToGreenhouse, target: 'greenhouse' });
          } else if (hitsMill) {
            crystalHitsMill = true;
            crystalRays.push({ angle: angles.crystalToMill, target: 'mill' });
          } else {
            crystalRays.push({ angle: crystalAngle, target: null });
          }
        }
      }

      const ghLit = mirrorHitsGh || crystalHitsGh;
      const millLit = mirrorHitsMill || crystalHitsMill;
      const millByGold = mirrorHitsMill && !crystalHitsMill;

      let goalMet = false;
      if (round.target === 'greenhouse') {
        goalMet = round.hasCrystal ? (mirrorHitsCrystal && crystalHitsGh) : mirrorHitsGh;
      } else if (round.target === 'mill') {
        goalMet = round.hasCrystal ? (mirrorHitsCrystal && crystalHitsMill) : mirrorHitsMill;
      } else if (round.target === 'both') {
        goalMet = mirrorHitsCrystal && crystalHitsGh && crystalHitsMill;
      }

      return {
        effectiveMirrorAngle,
        mirrorHitsCrystal,
        mirrorHitsGh,
        mirrorHitsMill,
        crystalRays,
        ghLit,
        millLit,
        millByGold,
        goalMet,
      };
    }

    /* Project a missed ray from origin along angleDeg, stopping cleanly inside the valley rocks/sky */
    function missEndpoint(origin, angleDeg, maxFraction) {
      const len = worldW * maxFraction;
      const rad = angleDeg * RAD;
      let x = origin.x + Math.cos(rad) * len;
      let y = origin.y + Math.sin(rad) * len;
      /* Clamp softly inside the visible valley bounds */
      const padX = worldW * 0.05;
      const padY = worldH * 0.06;
      const dx = x - origin.x;
      const dy = y - origin.y;
      let t = 1;
      if (x < padX && dx < 0) t = Math.min(t, (padX - origin.x) / dx);
      if (x > worldW - padX && dx > 0) t = Math.min(t, (worldW - padX - origin.x) / dx);
      if (y < padY && dy < 0) t = Math.min(t, (padY - origin.y) / dy);
      if (y > worldH - padY && dy > 0) t = Math.min(t, (worldH - padY - origin.y) / dy);
      t = Math.max(0.15, t);
      return { x: origin.x + dx * t, y: origin.y + dy * t };
    }

    function renderBeams(state) {
      const W = worldW;
      const H = worldH;
      if (W < 20 || H < 20) return;

      const uid = `smvg${++svgUid}`;
      const scale = W / 1000;
      const outerW = Math.max(7, 13.5 * scale);
      const midW = Math.max(3.5, 6.2 * scale);
      const coreW = Math.max(1.8, 3.0 * scale);

      beamsSvg.setAttribute('viewBox', `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`);

      const defs = [`
        <filter id="${uid}-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="${(3.6 * scale).toFixed(2)}"/>
        </filter>
        <radialGradient id="${uid}-gold-glint">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="28%" stop-color="#fffbe0" stop-opacity="0.96"/>
          <stop offset="52%" stop-color="#ffd56b" stop-opacity="0.52"/>
          <stop offset="76%" stop-color="#ffae2b" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#ffaa22" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="${uid}-cyan-glint">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96"/>
          <stop offset="26%" stop-color="#c8fbff" stop-opacity="0.82"/>
          <stop offset="58%" stop-color="#38d9f5" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#38d9f5" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="${uid}-target-gold">
          <stop offset="0%" stop-color="#fff8d6" stop-opacity="0.72"/>
          <stop offset="35%" stop-color="#ffc248" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#ffaa22" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="${uid}-target-cyan">
          <stop offset="0%" stop-color="#e8fdff" stop-opacity="0.70"/>
          <stop offset="38%" stop-color="#4ce0f8" stop-opacity="0.24"/>
          <stop offset="100%" stop-color="#38d9f5" stop-opacity="0"/>
        </radialGradient>
      `];
      const body = [];
      let gradIdx = 0;

      function addBeam(p1, p2, colour, fadeEnd) {
        const isCyan = colour === 'cyan';
        const cOuter = isCyan ? '#38d9f5' : '#ffae2b';
        const cMid = isCyan ? '#99f3ff' : '#ffe184';
        const cCore = isCyan ? '#f0feff' : '#fffdf0';

        if (!fadeEnd) {
          body.push(`<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${cOuter}" stroke-opacity="0.46" stroke-width="${outerW.toFixed(2)}" stroke-linecap="round" filter="url(#${uid}-blur)"/>`);
          body.push(`<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${cMid}" stroke-opacity="0.62" stroke-width="${midW.toFixed(2)}" stroke-linecap="round"/>`);
          body.push(`<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${cCore}" stroke-opacity="0.96" stroke-width="${coreW.toFixed(2)}" stroke-linecap="round"/>`);
        } else {
          const gOuter = `${uid}-fo-${++gradIdx}`;
          const gCore = `${uid}-fc-${gradIdx}`;
          defs.push(`
            <linearGradient id="${gOuter}" gradientUnits="userSpaceOnUse" x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}">
              <stop offset="0%" stop-color="${cOuter}" stop-opacity="0.48"/>
              <stop offset="58%" stop-color="${cOuter}" stop-opacity="0.24"/>
              <stop offset="100%" stop-color="${cOuter}" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="${gCore}" gradientUnits="userSpaceOnUse" x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}">
              <stop offset="0%" stop-color="${cCore}" stop-opacity="0.95"/>
              <stop offset="52%" stop-color="${cMid}" stop-opacity="0.52"/>
              <stop offset="100%" stop-color="${cCore}" stop-opacity="0"/>
            </linearGradient>
          `);
          body.push(`<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="url(#${gOuter})" stroke-width="${(outerW * 0.92).toFixed(2)}" stroke-linecap="round" filter="url(#${uid}-blur)"/>`);
          body.push(`<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="url(#${gCore})" stroke-width="${(coreW * 1.15).toFixed(2)}" stroke-linecap="round"/>`);
        }
      }

      function addMirrorGlint(p) {
        const rHalo = Math.max(15, 25 * scale);
        body.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${rHalo.toFixed(1)}" fill="url(#${uid}-gold-glint)"/>`);
      }

      function addCrystalGlint(p, bright) {
        const r = Math.max(12, (bright ? 22 : 16) * scale);
        body.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#${uid}-cyan-glint)"/>`);
        body.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r * 0.25).toFixed(1)}" fill="#ffffff" fill-opacity="0.92"/>`);
      }

      function addImpactSpark(p, colour) {
        const r = Math.max(9, 15 * scale);
        const id = colour === 'cyan' ? `${uid}-target-cyan` : `${uid}-target-gold`;
        body.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#${id})"/>`);
      }

      /* 1. Incoming golden sunbeam from tower straight to the mirror glass centre */
      addBeam(pts.tower, pts.mirror, 'gold', false);

      /* 2. Outgoing golden beam from mirror */
      if (state.mirrorHitsCrystal) {
        addBeam(pts.mirror, pts.crystal, 'gold', false);
      } else if (state.mirrorHitsGh) {
        addBeam(pts.mirror, pts.greenhouse, 'gold', false);
        addImpactSpark(pts.greenhouse, 'gold');
      } else if (state.mirrorHitsMill) {
        addBeam(pts.mirror, pts.wheel, 'gold', false);
        addImpactSpark(pts.wheel, 'gold');
      } else {
        const endPt = missEndpoint(pts.mirror, state.effectiveMirrorAngle, 0.21);
        addBeam(pts.mirror, endPt, 'gold', true);
      }

      /* 3. Cyan beam(s) leaving the lit crystal */
      if (state.mirrorHitsCrystal) {
        for (const ray of state.crystalRays) {
          if (ray.target === 'greenhouse') {
            addBeam(pts.crystal, pts.greenhouse, 'cyan', false);
            addImpactSpark(pts.greenhouse, 'cyan');
          } else if (ray.target === 'mill') {
            addBeam(pts.crystal, pts.wheel, 'cyan', false);
            addImpactSpark(pts.wheel, 'cyan');
          } else {
            const endPt = missEndpoint(pts.crystal, ray.angle, 0.175);
            addBeam(pts.crystal, endPt, 'cyan', true);
          }
        }
        addCrystalGlint(pts.crystal, state.goalMet);
      }

      /* 4. Bright organic glint right at the mirror glass centre */
      addMirrorGlint(pts.mirror);

      beamsSvg.innerHTML = `<defs>${defs.join('')}</defs>${body.join('')}`;
    }

    function spawnCelebrationSparkles(state) {
      const wRect = worldEl.getBoundingClientRect();
      const sRect = stageEl.getBoundingClientRect();
      const ox = wRect.left - sRect.left;
      const oy = wRect.top - sRect.top;

      const origins = [];
      if (state.ghLit) origins.push({ x: ox + pts.greenhouse.x, y: oy + pts.greenhouse.y, color: round.hasCrystal ? '#67e8f9' : '#fde047' });
      if (state.millLit) origins.push({ x: ox + pts.wheel.x, y: oy + pts.wheel.y, color: round.hasCrystal ? '#67e8f9' : '#fde047' });

      for (const org of origins) {
        for (let i = 0; i < 12; i++) {
          const sp = document.createElement('span');
          sp.className = 'smv-spark';
          const a = Math.random() * Math.PI * 2;
          const dist = 26 + Math.random() * 54;
          sp.style.left = `${org.x.toFixed(1)}px`;
          sp.style.top = `${org.y.toFixed(1)}px`;
          sp.style.background = i % 3 === 0 ? '#ffffff' : org.color;
          sp.style.boxShadow = `0 0 8px ${org.color}`;
          sp.style.setProperty('--sx', `${(Math.cos(a) * dist).toFixed(1)}px`);
          sp.style.setProperty('--sy', `${(Math.sin(a) * dist - 22).toFixed(1)}px`);
          sp.style.animationDelay = `${(Math.random() * 0.22).toFixed(2)}s`;
          sparklesEl.appendChild(sp);
          tm.later(() => sp.remove(), 1450);
        }
      }
    }

    function updateActiveHitRings() {
      hitMirrorBtn.hidden = !round.mirrorMovable;
      hitCrystalBtn.hidden = !round.crystalMovable;
      hitMirrorBtn.classList.toggle('is-active', !solved && round.mirrorMovable && activePiece === 'mirror');
      hitCrystalBtn.classList.toggle('is-active', !solved && round.crystalMovable && activePiece === 'crystal');
    }

    function syncVisuals() {
      const state = evaluateOptics();

      /* In whole-valley round, when mirror lights up crystal for the first time,
         chime & smoothly hand active drag control to the crystal + slide phone camera. */
      if (round.hasCrystal && state.mirrorHitsCrystal && !crystalWasLit) {
        crystalWasLit = true;
        if (round.mirrorMovable && round.crystalMovable && !solved) {
          sfxCrystalWake();
          if (!dragState) {
            activePiece = 'crystal';
            camMode = 'crystal';
            applyCamera();
            updateActiveHitRings();
          }
        }
      } else if (!state.mirrorHitsCrystal) {
        crystalWasLit = false;
      }

      /* Gentle sound when target first lights up */
      if (state.goalMet && !targetWasLit && !solved) {
        targetWasLit = true;
        sfxTargetLit();
      } else if (!state.goalMet) {
        targetWasLit = false;
      }

      crystalEl.classList.toggle('is-lit', state.mirrorHitsCrystal);
      ghEl.classList.toggle('is-lit', state.ghLit);
      wheelEl.classList.toggle('is-lit', state.millLit);
      wheelEl.classList.toggle('is-gold', state.millByGold);
      stageEl.classList.toggle('is-bloom', solved || state.goalMet);

      if (!solved) {
        hikerEl.setAttribute('data-pose', dragState ? 'pointing' : round.startHikerPose);
      }

      updateMirrorVisual(state.effectiveMirrorAngle);
      if (round.hasCrystal) updateCrystalVisual(crystalAngle);
      renderBeams(state);
      return state;
    }

    function completeRound(state) {
      if (solved) return;
      solved = true;
      dragState = null;
      stageEl.classList.remove('is-dragging');
      stageEl.classList.add('is-solved');
      stageEl.classList.add('is-bloom');

      /* Lock beams cleanly to exact target centres */
      if (round.hasCrystal) mirrorAngle = angles.mirrorToCrystal;
      else if (round.target === 'greenhouse') mirrorAngle = angles.mirrorToGreenhouse;
      else if (round.target === 'mill') mirrorAngle = angles.mirrorToMill;

      if (round.hasCrystal) {
        if (round.isSplit) crystalAngle = angles.crystalSplitMid;
        else if (round.target === 'greenhouse') crystalAngle = angles.crystalToGreenhouse;
        else if (round.target === 'mill') crystalAngle = angles.crystalToMill;
      }

      camMode = 'solved';
      applyCamera();
      hikerEl.setAttribute('data-pose', 'cheering');
      updateActiveHitRings();
      const finalState = syncVisuals();
      spawnCelebrationSparkles(finalState);
      sfxCelebrate();

      /* Update progress dots immediately */
      updateHud(roundIdx + 1);

      tm.later(() => {
        if (window.EDKit) EDKit.praise(lang);
      }, 240);

      tm.later(() => {
        if (roundIdx + 1 < rounds.length) {
          startRound(roundIdx + 1);
        } else {
          endOverlay.hidden = false;
          EDKit.end(endOverlay, ctx, lang, t.done);
        }
      }, 1950);
    }

    function updateHud(doneCount) {
      dotsEl.innerHTML = '';
      for (let i = 0; i < rounds.length; i++) {
        const d = document.createElement('span');
        d.className = 'kit-dot' + (i < doneCount ? ' done' : '');
        dotsEl.appendChild(d);
      }
      askEl.textContent = t.ask[round.voiceKey] || '';
    }

    function speakTask() {
      sayBtn.classList.remove('nudge');
      if (!window.EDVoice) return;
      EDVoice.say(round.voiceKey, lang).then((heard) => {
        if (!heard) sayBtn.classList.add('nudge');
      });
    }

    function startRound(idx) {
      tm.clear();
      roundIdx = idx;
      round = rounds[idx];
      solved = false;
      alignedMs = 0;
      targetWasLit = false;
      dragState = null;

      stageEl.classList.remove('is-dragging', 'is-solved', 'is-bloom');
      crystalEl.hidden = !round.hasCrystal;

      /* Set active piece & camera framing for start of round */
      activePiece = round.mirrorMovable ? 'mirror' : 'crystal';
      camMode = round.mirrorMovable ? 'start' : 'crystal';

      /* Apply layout & measure exact target angles before setting locked mirror angle */
      applyCamera();

      mirrorAngle = round.startMirror == null ? angles.mirrorToCrystal : round.startMirror;
      crystalAngle = round.startCrystal;
      /* Hard guarantee (Section 8 #1): never start a round with any target lit or beam resting on it. */
      for (let guard = 0; guard < 8; guard++) {
        const check = evaluateOptics();
        if (!check.ghLit && !check.millLit && !check.goalMet) break;
        if (round.mirrorMovable) mirrorAngle = pickWrongMirrorAngle(mirrorAngle);
        if (round.crystalMovable) crystalAngle = pickWrongCrystalAngle(round.isSplit, crystalAngle);
      }
      crystalWasLit = round.hasCrystal && !round.mirrorMovable;

      hikerEl.setAttribute('data-pose', round.startHikerPose);
      updateHud(roundIdx);
      updateActiveHitRings();
      syncVisuals();
      speakTask();
    }

    /* ---- Screen-wide Ergonomic Drag & Tap Controls ---- */
    function pivotInClient(piece) {
      const wRect = worldEl.getBoundingClientRect();
      const pt = piece === 'crystal' ? pts.crystal : pts.mirror;
      return { x: wRect.left + pt.x, y: wRect.top + pt.y };
    }

    function pickPieceForPointer(clientX, clientY, explicitPiece) {
      if (explicitPiece) {
        if (explicitPiece === 'mirror' && round.mirrorMovable) return 'mirror';
        if (explicitPiece === 'crystal' && round.crystalMovable) return 'crystal';
      }
      if (round.mirrorMovable && !round.crystalMovable) return 'mirror';
      if (round.crystalMovable && !round.mirrorMovable) return 'crystal';

      /* Both movable (Step 4 finale): touching directly near either piece grabs it;
         dragging anywhere else turns the active piece (mirror until crystal is lit, then crystal). */
      const pm = pivotInClient('mirror');
      const pc = pivotInClient('crystal');
      const dm = Math.hypot(clientX - pm.x, clientY - pm.y);
      const dc = Math.hypot(clientX - pc.x, clientY - pc.y);
      if (dm < 68 && dm <= dc) return 'mirror';
      if (dc < 68 && dc < dm) return 'crystal';
      return activePiece;
    }

    function onPointerDown(e, explicitPiece) {
      if (solved || !endOverlay.hidden) return;
      if (e.button > 0) return;
      /* Ignore HUD buttons & parent note clicks */
      if (e.target.closest('.smv-hud-top, .smv-end-overlay')) return;

      if (window.EDSound) EDSound.wake();

      const piece = pickPieceForPointer(e.clientX, e.clientY, explicitPiece);
      activePiece = piece;
      updateActiveHitRings();

      const pv = pivotInClient(piece);
      const startPolar = Math.atan2(e.clientY - pv.y, e.clientX - pv.x) * DEG;

      dragState = {
        pointerId: e.pointerId,
        piece,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        lastPolar: startPolar,
        moved: false,
      };
      stageEl.classList.add('is-dragging');
      hikerEl.setAttribute('data-pose', 'pointing');

      try { stageEl.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }

    function applyAngleDelta(piece, deltaDeg) {
      if (Math.abs(deltaDeg) < 0.05) return;
      if (piece === 'mirror') {
        mirrorAngle = normAngle(mirrorAngle + deltaDeg);
      } else {
        crystalAngle = normAngle(crystalAngle + deltaDeg);
      }
      sfxTurnTick(piece === 'crystal');
      syncVisuals();
    }

    function onPointerMove(e) {
      if (!dragState || e.pointerId !== dragState.pointerId || solved) return;
      const dx = e.clientX - dragState.lastX;
      const dy = e.clientY - dragState.lastY;
      if (!dragState.moved && Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY) >= 5) {
        dragState.moved = true;
      }

      const pv = pivotInClient(dragState.piece);
      const dist = Math.hypot(e.clientX - pv.x, e.clientY - pv.y);
      const curPolar = Math.atan2(e.clientY - pv.y, e.clientX - pv.x) * DEG;

      let delta;
      if (dist >= 38) {
        /* Natural polar tracking around the piece (works smoothly from anywhere on screen!) */
        delta = angleDiff(curPolar, dragState.lastPolar);
        /* Clamp extreme single-frame jumps */
        delta = Math.max(-24, Math.min(24, delta));
      } else {
        /* Right on top of the pivot: smooth linear drag so there is never a polar singularity */
        delta = (dy * 0.65 - dx * 0.35);
      }

      dragState.lastX = e.clientX;
      dragState.lastY = e.clientY;
      dragState.lastPolar = curPolar;

      applyAngleDelta(dragState.piece, delta);
    }

    function onPointerUp(e) {
      if (!dragState || e.pointerId !== dragState.pointerId) return;
      const wasMoved = dragState.moved;
      const piece = dragState.piece;
      dragState = null;
      stageEl.classList.remove('is-dragging');

      if (solved) return;

      if (!wasMoved) {
        /* Tap gives an immediate gentle 16-degree turn + stone/crystal sound */
        applyAngleDelta(piece, 16);
      }

      /* In whole-valley round, if mirror now lights crystal, switch active focus cleanly to crystal */
      const state = syncVisuals();
      if (round.mirrorMovable && round.crystalMovable && state.mirrorHitsCrystal && activePiece === 'mirror') {
        activePiece = 'crystal';
        camMode = 'crystal';
        applyCamera();
        updateActiveHitRings();
      }

      /* Release while aligned solves immediately so it feels crisp and responsive */
      if (state.goalMet) {
        completeRound(state);
      }
    }

    function onPointerCancel(e) {
      if (!dragState || e.pointerId !== dragState.pointerId) return;
      dragState = null;
      stageEl.classList.remove('is-dragging');
    }

    /* Keyboard support on the hit buttons */
    function onHitKey(e, piece) {
      if (solved) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activePiece = piece;
        updateActiveHitRings();
        applyAngleDelta(piece, 8);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activePiece = piece;
        updateActiveHitRings();
        applyAngleDelta(piece, -8);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activePiece = piece;
        updateActiveHitRings();
        applyAngleDelta(piece, 16);
      }
    }

    stageEl.addEventListener('pointerdown', (e) => onPointerDown(e, null));
    hitMirrorBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); onPointerDown(e, 'mirror'); });
    hitCrystalBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); onPointerDown(e, 'crystal'); });
    hitMirrorBtn.addEventListener('keydown', (e) => onHitKey(e, 'mirror'));
    hitCrystalBtn.addEventListener('keydown', (e) => onHitKey(e, 'crystal'));
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    sayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakTask();
    });

    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = parentNoteEl.hidden;
      parentNoteEl.hidden = !open;
      infoBtn.setAttribute('aria-expanded', String(open));
    });

    /* Re-sync pixel-exact beam endpoints whenever art images finish loading or window resizes */
    const onImgLoad = () => {
      applyCamera();
      syncVisuals();
    };
    worldEl.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', onImgLoad, { once: true });
    });

    const onResize = () => {
      applyCamera();
      syncVisuals();
    };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    if (ro) ro.observe(stageEl);
    window.addEventListener('resize', onResize);

    /* Main 60fps loop: smooth waterwheel rotation & alignment dwell completion */
    function tick(now) {
      if (!lastFrameAt) lastFrameAt = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameAt) / 1000));
      lastFrameAt = now;

      const state = evaluateOptics();

      /* Waterwheel turns smoothly when lit and coasts gently to a stop when unlit */
      const targetSpeed = state.millLit ? 68 : 0;
      wheelSpeed += (targetSpeed - wheelSpeed) * Math.min(1, dt * 4.5);
      if (wheelSpeed > 0.3) {
        wheelDeg = (wheelDeg + wheelSpeed * dt) % 360;
        wheelImgEl.style.transform = `rotate(${wheelDeg.toFixed(1)}deg)`;
      }

      /* Hold on target for 420ms -> celebrate & complete round! */
      if (!solved) {
        if (state.goalMet) {
          alignedMs += dt * 1000;
          if (alignedMs >= 420) {
            completeRound(state);
          }
        } else {
          alignedMs = Math.max(0, alignedMs - dt * 1200);
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    startRound(0);
    rafId = requestAnimationFrame(tick);

    /* Debug hook for automated playthrough verification (read-only state + current angles) */
    stageEl._smvDebug = {
      getState: () => ({
        mode,
        roundIdx,
        totalRounds: rounds.length,
        round,
        mirrorAngle,
        crystalAngle,
        activePiece,
        solved,
        angles: { ...angles },
        pts: {
          mirror: { ...pts.mirror },
          crystal: { ...pts.crystal },
          greenhouse: { ...pts.greenhouse },
          wheel: { ...pts.wheel },
        },
        optics: evaluateOptics(),
      }),
    };

    cleanupFn = () => {
      cancelAnimationFrame(rafId);
      tm.clear();
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      if (window.EDVoice) EDVoice.stop();
      if (window.EDSound) EDSound.hush();
    };
  }

  function unmount() {
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
  }

  EDGames.register('sun-mirror-valley', { sets: SETS, mount, unmount });
})();
