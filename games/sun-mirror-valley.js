/* עמק מראות השמש / The Sun-Mirror Valley — Style 1 + 3 Fusion (Sweeping twilight
   mountain valley panorama with sculpted 3D stone mirror-monoliths, glowing
   turquoise crystal beam-splitter prisms, golden watermill, botanical greenhouse
   dome, and bioluminescent cyan wildflower meadow) for ages 6–8.

   Core Play Loop:
   1. Survey the Dormant Valley: The Botanical Greenhouse Dome (top-right) and
      the Golden Watermill (bottom-right) each display their required light-power.
   2. Steer, Focus & Split the Sunbeam:
      - Adjust or aim the Sun-Beacon / Stone Mirror Monolith (angle & focusing boost).
      - Rotate the Turquoise Crystal Prism (Direct Upper, Direct Lower, Equal Split ÷2,
        or Asymmetric Ratio Split) to divide the golden sunbeam across the valley.
   3. Live 60fps Ray-Tracing: Beams, energy counters, watermill rotation speed,
      and bioluminescent meadow pollen respond immediately to every adjustment.
   4. 4 Progressive Steps x 4 Rounds each = 16 rounds. */

(function () {
  const SETS = [
    { id: 'aim',    emoji: '🪞', label: { he: 'כיוון הקרן',   en: 'Aim the Beam'     }, mode: 'aim'    },
    { id: 'split',  emoji: '💎', label: { he: 'גביש הפיצול',  en: 'Crystal Splitter' }, mode: 'split'  },
    { id: 'ratio',  emoji: '⚖️', label: { he: 'פיצול חכם',    en: 'Smart Ratios'     }, mode: 'ratio'  },
    { id: 'master', emoji: '☀️', label: { he: 'מאסטר האור',   en: 'Valley Master'    }, mode: 'master' },
  ];

  const TEXT = {
    he: {
      askAim: (targetName, p) => `כוונו את מראת האבן ואת הגביש כדי לשלוח קרן שמש בעוצמה ${p} אל ${targetName}`,
      askSplit: (total, half) => `פצלו קרן שמש בעוצמה ${total} בגביש הטורקיז (${total}÷2) כדי לספק ${half} לחממה ו-${half} לטחנת המים!`,
      askRatio: (gNeed, mNeed) => `פיצול חכם: כוונו עוצמה ופיצול בגביש כדי שהחממה תקבל ${gNeed} וטחנת המים תקבל ${mNeed}`,
      askMaster: (gNeed, mNeed) => `מאסטר האור: כוונו את עדשת המראה ואת גביש הפיצול להפעלת החממה (${gNeed}) והטחנה (${mNeed}) יחד!`,
      hintMirror: 'לחצו על מראת האבן העתיקה (🪞) כדי לכוון את הקרן או להחליף עדשת מיקוד',
      hintPrism: 'לחצו על גביש הטורקיז הזוהר (💎) כדי לשנות את אופן פיצול קרני האור',
      hintReady: 'עוצמת האור מדויקת! החממה וטחנת המים מתעוררות לחיים!',
      mirrorAria: 'מראת אבן עתיקה — לחצו לסיבוב וכיוון עוצמת המיקוד',
      prismAria: 'גביש קריסטל מפצל — לחצו לשינוי פיצול הקרניים',
      lockLabel: '☀️ העמק מואר — המשך!',
      greenhouse: 'חממת הצמחים',
      watermill: 'טחנת המים',
      prismModes: {
        up:    '↖ לחממה בלבד',
        down:  '↙ לטחנה בלבד',
        equal: '💎 פיצול שווה (÷2)',
        asymA: '💎 פיצול (+1 / −1)',
        asymB: '💎 פיצול (+2 / −2)',
      },
    },
    en: {
      askAim: (targetName, p) => `Align the stone mirror and crystal to send a sunbeam of power ${p} to the ${targetName}`,
      askSplit: (total, half) => `Split a sunbeam of power ${total} through the Turquoise Prism (${total}÷2) to deliver ${half} to the Greenhouse and ${half} to the Watermill!`,
      askRatio: (gNeed, mNeed) => `Smart Ratios: tune the mirror and prism split so the Greenhouse gets ${gNeed} and the Watermill gets ${mNeed}`,
      askMaster: (gNeed, mNeed) => `Valley Master: align the mirror lens and crystal splitter to power both the Greenhouse (${gNeed}) and Watermill (${mNeed})!`,
      hintMirror: 'Tap the sculpted Stone Mirror (🪞) to align the beam or switch its focusing lens',
      hintPrism: 'Tap the glowing Turquoise Crystal Prism (💎) to change how the sunbeam splits',
      hintReady: 'Light energy matched! The greenhouse and golden watermill are awakening!',
      mirrorAria: 'Ancient stone mirror — tap to rotate and tune focusing lens',
      prismAria: 'Turquoise crystal splitter prism — tap to change beam splitting mode',
      lockLabel: '☀️ Valley Awakened — Continue!',
      greenhouse: 'Botanical Greenhouse',
      watermill: 'Golden Watermill',
      prismModes: {
        up:    '↖ Greenhouse Only',
        down:  '↙ Watermill Only',
        equal: '💎 Equal Split (÷2)',
        asymA: '💎 Ratio (+1 / −1)',
        asymB: '💎 Ratio (+2 / −2)',
      },
    },
  };

  /* 4 Steps x 4 Rounds = 16 Handcrafted Optical Math & Logic Rounds.
     - basePower: sun tower output
     - mirrorBoosts: array of available focusing lens boosts on the stone mirror (e.g. [0] or [0, 2, 4])
     - startMirrorIdx: initial index in mirrorBoosts (if -1, mirror is initially angled away/blocked!)
     - prismOptions: array of modes available on the crystal prism ('up', 'down', 'equal', 'asymA', 'asymB')
     - startPrismIdx: initial index in prismOptions
     - needGreen: target power for Botanical Greenhouse (0 if unused)
     - needMill: target power for Golden Watermill (0 if unused) */
  const ROUNDS = {
    aim: [
      {
        basePower: 6, mirrorBoosts: [0], startMirrorAligned: false,
        prismOptions: ['down', 'up'], startPrismIdx: 1,
        needGreen: 0, needMill: 6,
      },
      {
        basePower: 8, mirrorBoosts: [0], startMirrorAligned: false,
        prismOptions: ['down', 'up'], startPrismIdx: 0,
        needGreen: 8, needMill: 0,
      },
      {
        basePower: 4, mirrorBoosts: [0, 2], startMirrorAligned: true, startMirrorIdx: 0,
        prismOptions: ['up', 'down'], startPrismIdx: 0,
        needGreen: 0, needMill: 6,
      },
      {
        basePower: 6, mirrorBoosts: [0, 4], startMirrorAligned: false, startMirrorIdx: 0,
        prismOptions: ['down', 'up'], startPrismIdx: 0,
        needGreen: 10, needMill: 0,
      },
    ],
    split: [
      {
        basePower: 8, mirrorBoosts: [0], startMirrorAligned: true, startMirrorIdx: 0,
        prismOptions: ['down', 'up', 'equal'], startPrismIdx: 0,
        needGreen: 4, needMill: 4,
      },
      {
        basePower: 6, mirrorBoosts: [0], startMirrorAligned: false, startMirrorIdx: 0,
        prismOptions: ['up', 'equal', 'down'], startPrismIdx: 0,
        needGreen: 3, needMill: 3,
      },
      {
        basePower: 8, mirrorBoosts: [0, 2], startMirrorAligned: true, startMirrorIdx: 0,
        prismOptions: ['down', 'equal'], startPrismIdx: 0,
        needGreen: 5, needMill: 5,
      },
      {
        basePower: 8, mirrorBoosts: [0, 2, 4], startMirrorAligned: false, startMirrorIdx: 0,
        prismOptions: ['up', 'equal'], startPrismIdx: 0,
        needGreen: 6, needMill: 6,
      },
    ],
    ratio: [
      {
        basePower: 8, mirrorBoosts: [0], startMirrorAligned: true, startMirrorIdx: 0,
        prismOptions: ['equal', 'asymA', 'asymB'], startPrismIdx: 0,
        needGreen: 5, needMill: 3,
      },
      {
        basePower: 10, mirrorBoosts: [0], startMirrorAligned: true, startMirrorIdx: 0,
        prismOptions: ['equal', 'asymA', 'asymB'], startPrismIdx: 0,
        needGreen: 7, needMill: 3,
      },
      {
        basePower: 8, mirrorBoosts: [0, 2], startMirrorAligned: true, startMirrorIdx: 0,
        prismOptions: ['equal', 'asymA'], startPrismIdx: 0,
        needGreen: 6, needMill: 4,
      },
      {
        basePower: 8, mirrorBoosts: [0, 4], startMirrorAligned: false, startMirrorIdx: 0,
        prismOptions: ['equal', 'asymB'], startPrismIdx: 0,
        needGreen: 8, needMill: 4,
      },
    ],
    master: [
      {
        basePower: 6, mirrorBoosts: [0, 2, 4], startMirrorAligned: false, startMirrorIdx: 0,
        prismOptions: ['down', 'equal', 'asymA'], startPrismIdx: 0,
        needGreen: 5, needMill: 3,
      },
      {
        basePower: 6, mirrorBoosts: [0, 2, 4], startMirrorAligned: true, startMirrorIdx: 0,
        prismOptions: ['up', 'equal', 'asymA'], startPrismIdx: 0,
        needGreen: 5, needMill: 5,
      },
      {
        basePower: 8, mirrorBoosts: [0, 2, 4], startMirrorAligned: false, startMirrorIdx: 0,
        prismOptions: ['equal', 'asymA', 'asymB'], startPrismIdx: 0,
        needGreen: 7, needMill: 3,
      },
      {
        basePower: 8, mirrorBoosts: [0, 2, 4], startMirrorAligned: false, startMirrorIdx: 0,
        prismOptions: ['down', 'equal', 'asymB'], startPrismIdx: 0,
        needGreen: 8, needMill: 4,
      },
    ],
  };

  const LANDMARKS = {
    tower:      { u: 0.202, v: 0.125 },
    mirror:     { u: 0.448, v: 0.520 },
    prism:      { u: 0.575, v: 0.512 },
    greenhouse: { u: 0.835, v: 0.315 },
    watermill:  { u: 0.838, v: 0.685 },
  };

  const CSS = `
    .smv-wrap { width: 100%; max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .smv-top { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 0 4px; }
    .smv-top .kit-head { flex: 1; min-width: 220px; }
    .smv-top .kit-head h2 { font-size: clamp(1.02rem, 2.05vw, 1.28rem); line-height: 1.3; }
    .smv-stage-box {
      position: relative; width: 100%; height: clamp(420px, 64vh, 560px);
      border-radius: 24px; overflow: hidden;
      background: #071c29;
      border: 3px solid #9b7432;
      box-shadow: 0 14px 36px rgba(5, 12, 20, .55), inset 0 2px 10px rgba(254, 240, 138, .18);
      user-select: none; -webkit-user-select: none; touch-action: none;
    }
    .smv-canvas { width: 100%; height: 100%; display: block; }
    .smv-ui { position: absolute; inset: 0; pointer-events: none; }
    .smv-node-btn {
      position: absolute; pointer-events: auto;
      transform: translate(-50%, -50%);
      width: 78px; height: 78px; border-radius: 50%;
      background: transparent; border: 2px solid transparent;
      cursor: pointer; padding: 0; margin: 0; color: transparent; font-size: 0;
    }
    .smv-node-btn:focus-visible {
      outline: 3px solid #fde047; outline-offset: 2px;
      background: rgba(254, 224, 71, .15);
    }
    .smv-lock-cta {
      position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%) scale(.9);
      pointer-events: none; opacity: 0;
      background: linear-gradient(180deg, #f59e0b, #b45309);
      color: #fff; border: 2.5px solid #fef08a; border-radius: 99px;
      padding: 7px 22px; font-family: Fredoka, Heebo, sans-serif;
      font-weight: 700; font-size: clamp(.92rem, 2vw, 1.1rem);
      box-shadow: 0 5px 0 #78350f, 0 10px 24px rgba(245, 158, 11, .55);
      cursor: pointer; transition: opacity .18s, transform .2s cubic-bezier(.34,1.56,.64,1);
      z-index: 8; white-space: nowrap;
    }
    .smv-lock-cta.ready {
      pointer-events: auto; opacity: 1; transform: translateX(-50%) scale(1);
    }
    @media (max-width: 600px) {
      .smv-stage-box { height: auto; aspect-ratio: 16 / 10; min-height: 235px; max-height: 320px; border-radius: 18px; }
      .smv-node-btn { width: 58px; height: 58px; }
    }
  `;

  function sfxCrystal(freq = 660) {
    if (!window.EDSound || !EDSound.canPlay()) return;
    EDSound.tone({ freq, end: freq * 1.22, dur: 0.12, type: 'sine', gain: 0.16 });
  }

  let cleanupFn = null;

  function mount(root, ctx) {
    EDKit.style('smv-style', CSS);
    const lang = ctx.lang;
    const t = TEXT[lang] || TEXT.he;
    const mode = (ctx.set && ctx.set.mode) || 'aim';
    const rounds = ROUNDS[mode] || ROUNDS.aim;

    const bgImg = new Image();
    bgImg.src = 'assets/worlds/sun-mirror-valley.jpg';

    let roundIdx = 0;
    let round = rounds[0];
    let locked = false;
    let rafId = 0;
    let timeTick = 0;
    const tm = EDKit.timers();

    let mirrorAligned = true;
    let mirrorBoostIdx = 0;
    let prismIdx = 0;
    let stability = 0;
    let wheelAngle = 0;

    const pollen = Array.from({ length: 42 }, () => ({
      u: Math.random(),
      v: 0.62 + Math.random() * 0.36,
      r: 1.5 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
    }));

    root.innerHTML = `
      <div class="kit smv-wrap">
        <div class="smv-top">
          ${EDKit.dots(rounds.length, 0)}
          ${EDKit.head('', lang)}
        </div>
        <p class="kit-hint" id="smv-hint">${t.hintMirror}</p>
        <div class="smv-stage-box" id="smv-box">
          <canvas class="smv-canvas" id="smv-canvas"></canvas>
          <div class="smv-ui" id="smv-ui">
            <button type="button" class="smv-node-btn" id="btn-mirror" aria-label="${t.mirrorAria}"></button>
            <button type="button" class="smv-node-btn" id="btn-prism" aria-label="${t.prismAria}"></button>
            <button type="button" class="smv-lock-cta" id="smv-lock-cta">${t.lockLabel}</button>
          </div>
        </div>
      </div>
    `;

    const box = root.querySelector('#smv-box');
    const canvas = root.querySelector('#smv-canvas');
    const ctx2d = canvas.getContext('2d');
    const btnMirror = root.querySelector('#btn-mirror');
    const btnPrism = root.querySelector('#btn-prism');
    const lockCta = root.querySelector('#smv-lock-cta');
    const headH2 = root.querySelector('.kit-head h2');
    const hintEl = root.querySelector('#smv-hint');

    let W = 880, H = 500, dpr = 1;

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
      bg.addColorStop(0, '#071c29');
      bg.addColorStop(1, '#05151a');
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
      const pm = map(LANDMARKS.mirror.u, LANDMARKS.mirror.v);
      const pp = map(LANDMARKS.prism.u, LANDMARKS.prism.v);
      btnMirror.style.left = `${pm.x}px`;
      btnMirror.style.top = `${pm.y}px`;
      btnPrism.style.left = `${pp.x}px`;
      btnPrism.style.top = `${pp.y}px`;
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

    /* ---- Live Optical Ray-Tracing & Math Solver ---- */
    function evaluateOptics() {
      const boost = round.mirrorBoosts[mirrorBoostIdx] || 0;
      const incoming = mirrorAligned ? round.basePower + boost : 0;
      const pMode = round.prismOptions[prismIdx] || 'equal';

      let greenPower = 0;
      let millPower = 0;
      if (incoming > 0) {
        if (pMode === 'up') {
          greenPower = incoming;
        } else if (pMode === 'down') {
          millPower = incoming;
        } else if (pMode === 'equal') {
          greenPower = Math.floor(incoming / 2);
          millPower = incoming - greenPower;
        } else if (pMode === 'asymA') {
          greenPower = Math.floor(incoming / 2) + 1;
          millPower = incoming - greenPower;
        } else if (pMode === 'asymB') {
          greenPower = Math.floor(incoming / 2) + 2;
          millPower = incoming - greenPower;
        }
      }

      const greenOk = round.needGreen === 0 || greenPower === round.needGreen;
      const millOk = round.needMill === 0 || millPower === round.needMill;
      const goalMet = mirrorAligned && greenOk && millOk;

      return { boost, incoming, pMode, greenPower, millPower, greenOk, millOk, goalMet };
    }

    function updateTexts() {
      const st = evaluateOptics();
      if (mode === 'aim') {
        const tName = round.needGreen > 0 ? t.greenhouse : t.watermill;
        const p = round.needGreen > 0 ? round.needGreen : round.needMill;
        headH2.textContent = t.askAim(tName, p);
      } else if (mode === 'split') {
        const half = round.needGreen;
        headH2.textContent = t.askSplit(half * 2, half);
      } else if (mode === 'ratio') {
        headH2.textContent = t.askRatio(round.needGreen, round.needMill);
      } else {
        headH2.textContent = t.askMaster(round.needGreen, round.needMill);
      }

      if (st.goalMet) {
        hintEl.textContent = t.hintReady;
      } else if (!mirrorAligned || (round.needGreen + round.needMill > 0 && st.incoming !== (round.needGreen + round.needMill))) {
        hintEl.textContent = t.hintMirror;
      } else {
        hintEl.textContent = t.hintPrism;
      }

      lockCta.classList.toggle('ready', st.goalMet && !locked);
    }

    function loadRound(idx) {
      roundIdx = idx;
      round = rounds[idx];
      locked = false;
      stability = 0;

      mirrorAligned = Boolean(round.startMirrorAligned);
      mirrorBoostIdx = round.startMirrorIdx || 0;
      prismIdx = round.startPrismIdx || 0;

      const dotsEl = root.querySelector('.kit-dots');
      if (dotsEl) dotsEl.outerHTML = EDKit.dots(rounds.length, roundIdx);

      updateTexts();
      syncButtons();

      const voiceKey = mode === 'aim' ? 'smv-aim'
        : mode === 'split' ? 'smv-split'
        : mode === 'ratio' ? 'smv-ratio' : 'smv-master';
      EDKit.voice(root, voiceKey, lang);
    }

    function completeRound() {
      if (locked) return;
      locked = true;
      lockCta.classList.remove('ready');
      sfxCrystal(880);
      EDKit.praise(lang);

      const allDots = root.querySelectorAll('.kit-dot');
      if (allDots[roundIdx]) allDots[roundIdx].classList.add('done');

      tm.later(() => {
        if (roundIdx + 1 < rounds.length) {
          loadRound(roundIdx + 1);
        } else {
          cancelAnimationFrame(rafId);
          EDKit.end(root, ctx, lang);
        }
      }, 1100);
    }

    btnMirror.addEventListener('click', () => {
      if (locked) return;
      if (!mirrorAligned) {
        mirrorAligned = true;
      } else if (round.mirrorBoosts.length > 1) {
        mirrorBoostIdx = (mirrorBoostIdx + 1) % round.mirrorBoosts.length;
      } else {
        mirrorAligned = !mirrorAligned;
      }
      sfxCrystal(540 + mirrorBoostIdx * 110);
      updateTexts();
    });

    btnPrism.addEventListener('click', () => {
      if (locked) return;
      prismIdx = (prismIdx + 1) % round.prismOptions.length;
      sfxCrystal(720 + prismIdx * 90);
      updateTexts();
    });

    lockCta.addEventListener('click', () => {
      const st = evaluateOptics();
      if (st.goalMet && !locked) completeRound();
    });

    function drawPill(x, y, text, ok, highlight) {
      const padX = W < 540 ? 8 : 12;
      ctx2d.font = `700 ${W < 540 ? 10.5 : 12.5}px Fredoka, Heebo, sans-serif`;
      const tw = ctx2d.measureText(text).width;
      const bw = Math.max(W < 540 ? 48 : 62, tw + padX * 2);
      const bh = W < 540 ? 22 : 26;

      ctx2d.fillStyle = ok ? 'rgba(20, 83, 45, 0.94)' : 'rgba(11, 22, 36, 0.92)';
      ctx2d.strokeStyle = ok ? '#4ade80' : (highlight ? '#fde047' : '#c8a962');
      ctx2d.lineWidth = highlight ? 2.6 : 1.8;
      ctx2d.beginPath();
      ctx2d.roundRect(x - bw / 2, y - bh / 2, bw, bh, 99);
      ctx2d.fill();
      ctx2d.stroke();

      ctx2d.fillStyle = ok ? '#bbf7d0' : '#fef3c7';
      ctx2d.textAlign = 'center';
      ctx2d.fillText(text, x, y + (W < 540 ? 3.5 : 4.5));
    }

    function drawBeam(a, b, power, col = '#fde047') {
      if (power <= 0) return;
      ctx2d.save();
      ctx2d.globalCompositeOperation = 'screen';
      const w = Math.max(3, Math.min(14, power * 1.35)) * (W < 540 ? 0.72 : 1);

      /* Outer golden bloom */
      ctx2d.strokeStyle = 'rgba(255, 185, 50, 0.35)';
      ctx2d.lineWidth = w * 2.4;
      ctx2d.lineCap = 'round';
      ctx2d.beginPath();
      ctx2d.moveTo(a.x, a.y);
      ctx2d.lineTo(b.x, b.y);
      ctx2d.stroke();

      /* Core incandescent ray */
      ctx2d.strokeStyle = col;
      ctx2d.lineWidth = w;
      ctx2d.beginPath();
      ctx2d.moveTo(a.x, a.y);
      ctx2d.lineTo(b.x, b.y);
      ctx2d.stroke();

      /* Traveling photon pulses */
      ctx2d.strokeStyle = '#ffffff';
      ctx2d.lineWidth = Math.max(2, w * 0.45);
      ctx2d.setLineDash([8, 18]);
      ctx2d.lineDashOffset = -timeTick * 2.2;
      ctx2d.beginPath();
      ctx2d.moveTo(a.x, a.y);
      ctx2d.lineTo(b.x, b.y);
      ctx2d.stroke();
      ctx2d.setLineDash([]);
      ctx2d.restore();
    }

    function tick() {
      timeTick++;
      const st = evaluateOptics();

      if (st.goalMet && !locked) {
        stability = Math.min(1, stability + 0.02);
        if (stability >= 1) completeRound();
      } else {
        stability = Math.max(0, stability - 0.04);
      }

      ctx2d.save();
      ctx2d.scale(dpr, dpr);

      const map = drawArtCover();
      const pTower = map(LANDMARKS.tower.u, LANDMARKS.tower.v);
      const pMirror = map(LANDMARKS.mirror.u, LANDMARKS.mirror.v);
      const pPrism = map(LANDMARKS.prism.u, LANDMARKS.prism.v);
      const pGreen = map(LANDMARKS.greenhouse.u, LANDMARKS.greenhouse.v);
      const pMill = map(LANDMARKS.watermill.u, LANDMARKS.watermill.v);

      /* 1. Live Ray-Traced Sunbeams */
      drawBeam(pTower, pMirror, round.basePower, '#fde047');
      if (mirrorAligned) {
        drawBeam(pMirror, pPrism, st.incoming, '#fde047');
        if (st.greenPower > 0) drawBeam(pPrism, pGreen, st.greenPower, '#67e8f9');
        if (st.millPower > 0) drawBeam(pPrism, pMill, st.millPower, '#fde047');
      } else {
        /* Misaligned mirror bounces beam harmlessly into the sky/cliff */
        drawBeam(pMirror, { x: pMirror.x + 48, y: pMirror.y - 95 }, round.basePower, 'rgba(253, 224, 71, 0.45)');
      }

      /* 2. Interactive Rotating Rings on Stone Mirror & Turquoise Crystal Prism */
      const ringR = W < 540 ? 24 : 34;
      const needTotal = round.needGreen + round.needMill;
      const mirrorRight = mirrorAligned && st.incoming === needTotal;

      ctx2d.save();
      ctx2d.translate(pMirror.x, pMirror.y);
      ctx2d.rotate(timeTick * 0.025);
      ctx2d.strokeStyle = mirrorRight ? '#4ade80' : '#fde047';
      ctx2d.lineWidth = 2.6;
      ctx2d.setLineDash([6, 5]);
      ctx2d.beginPath();
      ctx2d.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx2d.stroke();
      ctx2d.restore();

      ctx2d.save();
      ctx2d.translate(pPrism.x, pPrism.y);
      ctx2d.rotate(-timeTick * 0.03);
      ctx2d.strokeStyle = st.goalMet ? '#4ade80' : '#38bdf8';
      ctx2d.lineWidth = 2.6;
      ctx2d.setLineDash([6, 5]);
      ctx2d.beginPath();
      ctx2d.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx2d.stroke();
      ctx2d.restore();

      /* 3. Spinning Golden Watermill Rose-Wheel when energized */
      if (st.millPower > 0) {
        wheelAngle += st.millPower * 0.012;
        ctx2d.save();
        ctx2d.translate(pMill.x - 4, pMill.y - 2);
        ctx2d.rotate(wheelAngle);
        ctx2d.strokeStyle = 'rgba(254, 240, 138, 0.78)';
        ctx2d.lineWidth = 2.2;
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3;
          ctx2d.beginPath();
          ctx2d.moveTo(-Math.cos(a) * 18, -Math.sin(a) * 18);
          ctx2d.lineTo(Math.cos(a) * 18, Math.sin(a) * 18);
          ctx2d.stroke();
        }
        ctx2d.restore();
      }

      /* 4. Floating Bioluminescent Cyan Wildflower Pollen */
      ctx2d.save();
      ctx2d.globalCompositeOperation = 'screen';
      pollen.forEach((p) => {
        const pos = map(p.u, p.v);
        const bx = pos.x + Math.sin(timeTick * 0.03 + p.phase) * 10;
        const by = pos.y - ((timeTick * 0.4 + p.phase * 15) % 45);
        ctx2d.fillStyle = `rgba(56, 224, 255, ${0.35 + (st.goalMet ? 0.45 : 0.15)})`;
        ctx2d.beginPath();
        ctx2d.arc(bx, by, p.r, 0, Math.PI * 2);
        ctx2d.fill();
      });
      ctx2d.restore();

      /* 5. Diegetic Energy & Operation Badges */
      drawPill(pTower.x, pTower.y - (W < 540 ? 22 : 30), `☀️ ${round.basePower}`, true, false);

      const mirrorText = !mirrorAligned
        ? '🪞 כוון מראה ↻'
        : st.boost > 0
          ? `🪞 +${st.boost} (=${st.incoming})`
          : `🪞 ${st.incoming}`;
      drawPill(pMirror.x, pMirror.y + ringR + 14, mirrorText, mirrorRight, !mirrorRight);

      drawPill(pPrism.x, pPrism.y - ringR - 14, t.prismModes[st.pMode], st.goalMet, mirrorRight && !st.goalMet);

      if (round.needGreen > 0) {
        drawPill(pGreen.x, pGreen.y - (W < 540 ? 24 : 34), `🌿 ${st.greenPower} / ${round.needGreen}`, st.greenOk, false);
      }
      if (round.needMill > 0) {
        drawPill(pMill.x, pMill.y + (W < 540 ? 24 : 34), `⚙️ ${st.millPower} / ${round.needMill}`, st.millOk, false);
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

  EDGames.register('sun-mirror-valley', { sets: SETS, mount, unmount });
})();
