/* מעבדת החשמל והמכונות / The Inventor's Circuit Lab — 60fps realistic physical
   circuit, thermal filament, aerodynamic water-trough sailboat, and electromagnet
   cargo crane workbench (ages 4–8).

   Designed around a 4-layer continuous Play Loop (Toy-First Agency -> Live 60fps
   Nodal & Mechanical Simulation -> Self-Evident Physical Goal -> Chain-Reaction
   Payoff) with museum-grade realistic materials (walnut wood planks, brushed brass,
   glazed porcelain knife switches, 14-node Verlet cloth-braided cables, curved
   glass analog voltmeter, blackbody tungsten Edison bulb, and shallow-water wave
   tank). */

(function () {
  const SETS = [
    { id: 'spark', emoji: '💡', label: { he: 'הניצוץ הראשון', en: 'First Spark' }, mode: 'spark' },
    { id: 'motor', emoji: '⛵', label: { he: 'מנוע ורוח', en: 'Motors & Wind' }, mode: 'motor' },
    { id: 'switches', emoji: '🔌', label: { he: 'מפסקים חכמים', en: 'Smart Switches' }, mode: 'switches' },
    { id: 'machine', emoji: '⚙️', label: { he: 'המכונה הגדולה', en: 'Grand Contraption' }, mode: 'machine' },
  ];

  const TEXT = {
    he: {
      askSpark: (v, name) => `חברו את המעגל, סגרו את המפסק וכוונו מתח ${v}V כדי להדליק את נורת האדיסון (${name})`,
      askMotor: (v, dirName, buoyName) => `הפעילו את מנוע הרוח בכיוון ${dirName} ובעוצמה ${v}V כדי להשיט את הסירה אל ${buoyName}`,
      askSwitches: (logicName, v, targetName) => `${logicName}: הזרימו ${v}V אל ${targetName}`,
      askMachine: (v, dirName) => `המכונה הגדולה: חברו את כל המעגל וכוונו ${v}V (${dirName}) להפעלת המעבדה כולה!`,
      hintWire: 'לחצו או גררו את כבל הבד הרופף אל עמוד ההברגה מנחושת כדי לסגור את המעגל',
      hintSwitch: 'לחצו על מפסקי הנחושת כדי לסגור את גשר החשמל ולהזרים מתח',
      hintDiverter: 'לחצו על בורר המסילה (A / B) כדי לנתב את הזרם אל המכונה הנכונה',
      hintPolarity: 'הפכו את מתג הכיוון (+ / −) כדי להפוך את כיוון הרוח והמנוע',
      hintVolt: (v) => `סובבו או לחצו על ווסת העוצמה השחור כדי לכוון בדיוק ל-${v}V`,
      hintReady: 'המעגל יציב והמכונה פועלת בעוצמה המדויקת!',
      powerUnit: 'ספק כוח מעבדתי · DC',
      voltmeter: 'מד מתח (VOLTS)',
      rheostat: 'ווסת עוצמה',
      polarityLabel: 'כיוון זרם',
      polEast: '+ מזרח →',
      polWest: '← מערב −',
      wirePosAria: 'כבל חשמל אדום חיובי — לחצו או גררו לחיבור',
      wireNegAria: 'כבל הארקה שחור שלילי — לחצו או גררו לחיבור',
      sw1Aria: 'מפסק נחושת ראשי 1',
      sw2Aria: 'מפסק נחושת 2',
      diverterAria: 'בורר מסילה A או B',
      polarityAria: 'מתג היפוך כיוון פלוס מינוס',
      voltAria: (v) => `ווסת מתח ${v} וולט`,
      lockLabel: '⚡ מעגל יציב — הפעל!',
      resetBtn: '↺ איפוס שולחן',
      lampTitle: 'נורת להט אדיסון ומד אור',
      boatTitle: 'מנוע רוח ותעלת מים',
      craneTitle: 'מנוף אלקטרומגנט נחושת',
      lightNames: { 3: 'אור עדין (3V)', 6: 'אור קריאה (6V)', 9: 'מגדלור מלא (9V)' },
      buoyNames: {
        '3': 'מזח קרוב מזרח (+3V)',
        '6': 'מצוף אמצעי מזרח (+6V)',
        '9': 'פעמון הנמל המזרחי (+9V)',
        '-3': 'מזח קרוב מערב (−3V)',
        '-6': 'מצוף אמצעי מערב (−6V)',
        '-9': 'פעמון הנמל המערבי (−9V)',
      },
      cargoNames: { 3: 'ארגז כלים קל (3V)', 6: 'תיבת גלגלי שיניים (6V)', 9: 'עוגן פלדה כבד (9V)' },
      logicSeries: 'חיבור טורי (שני המפסקים יחד)',
      logicParallel: 'חיבור מקבילי (מסלול עוקף)',
      logicDiverter: 'ניתוב מסילה (בורר A/B)',
      clampHint: 'חבר כבל',
      closedTag: 'סגור ✓',
      openTag: 'פתוח ○',
      targetTag: 'יעד',
    },
    en: {
      askSpark: (v, name) => `Clamp the cables, close the switch, and dial ${v}V to heat the Edison bulb (${name})`,
      askMotor: (v, dirName, buoyName) => `Run the wind motor ${dirName} at ${v}V to sail the wooden boat to the ${buoyName}`,
      askSwitches: (logicName, v, targetName) => `${logicName}: deliver ${v}V to the ${targetName}`,
      askMachine: (v, dirName) => `Grand Contraption: wire the full circuit and dial ${v}V (${dirName}) to power the entire workbench!`,
      hintWire: 'Tap or drag the loose braided cloth cable onto its brass binding post to close the loop',
      hintSwitch: 'Tap the porcelain & brass knife switches to close the bridge and let current flow',
      hintDiverter: 'Tap the brass Track Diverter (A / B) to route electricity to the right apparatus',
      hintPolarity: 'Flip the Polarity Reverser (+ / −) to reverse the motor fan and wind direction',
      hintVolt: (v) => `Turn or tap the bakelite voltage dial to set exactly ${v}V`,
      hintReady: 'Circuit locked and stable — the contraption is running at target power!',
      powerUnit: 'LAB DC POWER SUPPLY',
      voltmeter: 'VOLTMETER (DC)',
      rheostat: 'VOLTAGE DIAL',
      polarityLabel: 'POLARITY',
      polEast: '+ EAST →',
      polWest: '← WEST −',
      wirePosAria: 'Positive red braided cable — tap or drag to clamp',
      wireNegAria: 'Negative black braided cable — tap or drag to clamp',
      sw1Aria: 'Brass knife switch 1',
      sw2Aria: 'Brass knife switch 2',
      diverterAria: 'Track diverter switch A or B',
      polarityAria: 'Polarity reverser switch plus or minus',
      voltAria: (v) => `Set voltage dial to ${v} volts`,
      lockLabel: '⚡ Circuit Stable — Engage!',
      resetBtn: '↺ Reset Bench',
      lampTitle: 'Edison Filament & Photometer',
      boatTitle: 'Brass Wind Motor & Water Tank',
      craneTitle: 'Copper Electromagnet Hoist',
      lightNames: { 3: 'Gentle Glow (3V)', 6: 'Reading Light (6V)', 9: 'Full Lighthouse (9V)' },
      buoyNames: {
        '3': 'East Near Pier (+3V)',
        '6': 'East Mid Buoy (+6V)',
        '9': 'East Harbor Bell (+9V)',
        '-3': 'West Near Pier (−3V)',
        '-6': 'West Mid Buoy (−6V)',
        '-9': 'West Harbor Bell (−9V)',
      },
      cargoNames: { 3: 'Light Steel Toolbox (3V)', 6: 'Brass Gear Crate (6V)', 9: 'Heavy Ship Anchor (9V)' },
      logicSeries: 'Series Logic (Close BOTH switches)',
      logicParallel: 'Parallel Logic (Bypass branch)',
      logicDiverter: 'Track Diverter (Route A/B)',
      clampHint: 'Clamp',
      closedTag: 'CLOSED ✓',
      openTag: 'OPEN ○',
      targetTag: 'TARGET',
    },
  };

  /* 4 Progressive Engineering Steps x 5 Contraptions = 20 Handcrafted Rounds. */
  const ROUNDS = {
    spark: [
      {
        topology: 'single', machines: ['lamp'],
        startWires: [true, true], startSwitches: [false, true],
        hasPolarity: false, startPolarity: 1, targetPolarity: 1,
        startVolt: 6, targetVolt: 6,
      },
      {
        topology: 'single', machines: ['lamp'],
        startWires: [false, true], startSwitches: [false, true],
        hasPolarity: false, startPolarity: 1, targetPolarity: 1,
        startVolt: 6, targetVolt: 6,
      },
      {
        topology: 'single', machines: ['lamp'],
        startWires: [true, false], startSwitches: [false, true],
        hasPolarity: false, startPolarity: 1, targetPolarity: 1,
        startVolt: 3, targetVolt: 9,
      },
      {
        topology: 'single', machines: ['lamp'],
        startWires: [false, true], startSwitches: [true, true],
        hasPolarity: false, startPolarity: 1, targetPolarity: 1,
        startVolt: 9, targetVolt: 3,
      },
      {
        topology: 'single', machines: ['lamp'],
        startWires: [false, false], startSwitches: [false, true],
        hasPolarity: false, startPolarity: 1, targetPolarity: 1,
        startVolt: 3, targetVolt: 6,
      },
    ],
    motor: [
      {
        topology: 'single', machines: ['boat'],
        startWires: [true, true], startSwitches: [false, true],
        hasPolarity: true, startPolarity: 1, targetPolarity: 1,
        startVolt: 3, targetVolt: 6,
      },
      {
        topology: 'single', machines: ['boat'],
        startWires: [false, true], startSwitches: [false, true],
        hasPolarity: true, startPolarity: 1, targetPolarity: 1,
        startVolt: 6, targetVolt: 9,
      },
      {
        topology: 'single', machines: ['boat'],
        startWires: [true, true], startSwitches: [false, true],
        hasPolarity: true, startPolarity: 1, targetPolarity: -1,
        startVolt: 6, targetVolt: 6,
      },
      {
        topology: 'single', machines: ['boat'],
        startWires: [true, false], startSwitches: [true, true],
        hasPolarity: true, startPolarity: -1, targetPolarity: 1,
        startVolt: 9, targetVolt: 3,
      },
      {
        topology: 'single', machines: ['boat'],
        startWires: [false, false], startSwitches: [false, true],
        hasPolarity: true, startPolarity: 1, targetPolarity: -1,
        startVolt: 3, targetVolt: 9,
      },
    ],
    switches: [
      {
        topology: 'series', machines: ['lamp'],
        startWires: [true, true], startSwitches: [true, false],
        hasPolarity: false, startPolarity: 1, targetPolarity: 1,
        startVolt: 6, targetVolt: 6,
      },
      {
        topology: 'series', machines: ['crane'],
        startWires: [false, true], startSwitches: [false, false],
        hasPolarity: false, startPolarity: 1, targetPolarity: 1,
        startVolt: 6, targetVolt: 9,
      },
      {
        topology: 'parallel', machines: ['crane'],
        startWires: [true, true], startSwitches: [true, false],
        hasPolarity: false, startPolarity: 1, targetPolarity: 1,
        startVolt: 3, targetVolt: 6,
      },
      {
        topology: 'diverter', machines: ['lamp', 'crane'],
        startWires: [true, true], startSwitches: [false, true],
        startDiverter: 'A', targetDiverter: 'B',
        hasPolarity: false, startPolarity: 1, targetPolarity: 1,
        startVolt: 6, targetVolt: 3,
      },
      {
        topology: 'series', machines: ['crane'],
        startWires: [false, false], startSwitches: [false, false],
        hasPolarity: false, startPolarity: 1, targetPolarity: 1,
        startVolt: 3, targetVolt: 9,
      },
    ],
    machine: [
      {
        topology: 'series', machines: ['lamp', 'boat'],
        startWires: [true, true], startSwitches: [true, false],
        hasPolarity: true, startPolarity: 1, targetPolarity: 1,
        startVolt: 3, targetVolt: 6,
      },
      {
        topology: 'single', machines: ['crane', 'boat'],
        startWires: [false, true], startSwitches: [false, true],
        hasPolarity: true, startPolarity: -1, targetPolarity: 1,
        startVolt: 6, targetVolt: 9,
      },
      {
        topology: 'series', machines: ['crane', 'boat'],
        startWires: [true, false], startSwitches: [false, false],
        hasPolarity: true, startPolarity: 1, targetPolarity: -1,
        startVolt: 3, targetVolt: 6,
      },
      {
        topology: 'diverter', machines: ['lamp', 'boat'],
        startWires: [true, true], startSwitches: [false, true],
        startDiverter: 'A', targetDiverter: 'AB',
        hasPolarity: true, startPolarity: -1, targetPolarity: 1,
        startVolt: 6, targetVolt: 3,
      },
      {
        topology: 'series', machines: ['crane', 'boat'],
        startWires: [false, false], startSwitches: [false, false],
        hasPolarity: true, startPolarity: 1, targetPolarity: -1,
        startVolt: 3, targetVolt: 9,
      },
    ],
  };

  const CSS = `
    .cl-wrap { width: 100%; max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .cl-top { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 0 4px; }
    .cl-top .kit-head { flex: 1; min-width: 220px; }
    .cl-top .kit-head h2 { font-size: clamp(1.02rem, 2.1vw, 1.28rem); line-height: 1.3; }
    .cl-stage-box {
      position: relative; width: 100%; height: clamp(430px, 65vh, 560px);
      border-radius: 24px; overflow: hidden;
      background: #1f130c;
      border: 3px solid #6b4c2b;
      box-shadow: 0 14px 34px rgba(15, 9, 4, .42), inset 0 2px 10px rgba(255, 215, 145, .14);
      user-select: none; -webkit-user-select: none; touch-action: none;
    }
    .cl-canvas { width: 100%; height: 100%; display: block; }
    .cl-ui { position: absolute; inset: 0; pointer-events: none; }

    /* Interactive HTML hardware targets synced to canvas coordinates */
    .cl-hit {
      position: absolute; pointer-events: auto;
      background: transparent; border: 2px solid transparent; border-radius: 14px;
      cursor: pointer; padding: 0; margin: 0; color: transparent; font-size: 0;
      transition: transform .1s ease, box-shadow .15s ease;
      transform: translate(-50%, -50%);
    }
    .cl-hit:focus-visible {
      outline: 3px solid #ffd23f; outline-offset: 2px;
      background: rgba(255, 210, 63, .12);
    }
    .cl-hit--pulse {
      animation: cl-ring-pulse 1.5s ease-in-out infinite;
    }
    @keyframes cl-ring-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255, 210, 63, 0); }
      50% { box-shadow: 0 0 0 7px rgba(255, 210, 63, .32); }
    }

    /* Voltage step buttons around the rotary dial */
    .cl-volt-btn {
      position: absolute; pointer-events: auto;
      transform: translate(-50%, -50%);
      min-width: 42px; min-height: 30px; padding: 2px 8px;
      border-radius: 10px; border: 2px solid #a87e3b;
      background: linear-gradient(180deg, #3c2f24, #1e1712);
      color: #f6e3ba; font-family: Fredoka, Heebo, sans-serif;
      font-weight: 700; font-size: 13px; cursor: pointer;
      box-shadow: 0 3px 0 #120d09, 0 4px 10px rgba(0,0,0,.45);
      transition: transform .08s, background .15s, border-color .15s;
    }
    .cl-volt-btn:hover { border-color: #ffd23f; color: #fff; }
    .cl-volt-btn:active { transform: translate(-50%, calc(-50% + 2px)); }
    .cl-volt-btn[aria-pressed="true"] {
      background: linear-gradient(180deg, #d99b26, #9c6712);
      border-color: #ffe89e; color: #1b1105;
      box-shadow: 0 3px 0 #5a3807, 0 0 14px rgba(255, 200, 70, .55);
    }

    .cl-reset-btn {
      background: var(--surface); border: 1.5px solid var(--border);
      color: var(--text-soft); border-radius: 99px;
      padding: 5px 12px; font: inherit; font-weight: 700; font-size: 12.5px;
      cursor: pointer; transition: transform .1s, border-color .15s;
    }
    .cl-reset-btn:hover { border-color: var(--text); color: var(--text); }
    .cl-reset-btn:active { transform: scale(.95); }

    .cl-lock-cta {
      position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%) scale(.9);
      pointer-events: none; opacity: 0;
      background: linear-gradient(180deg, #22c55e, #15803d);
      color: #fff; border: 2.5px solid #bbf7d0; border-radius: 99px;
      padding: 7px 20px; font-family: Fredoka, Heebo, sans-serif;
      font-weight: 700; font-size: clamp(.92rem, 2vw, 1.1rem);
      box-shadow: 0 5px 0 #14532d, 0 10px 24px rgba(22, 163, 74, .55);
      cursor: pointer; transition: opacity .18s, transform .2s cubic-bezier(.34,1.56,.64,1);
      z-index: 8; white-space: nowrap;
    }
    .cl-lock-cta.ready {
      pointer-events: auto; opacity: 1; transform: translateX(-50%) scale(1);
    }

    @media (max-width: 600px) {
      .cl-stage-box { height: clamp(460px, 70vh, 540px); border-radius: 18px; }
      .cl-volt-btn { min-width: 34px; min-height: 25px; font-size: 11px; padding: 1px 5px; border-radius: 8px; }
    }
  `;

  /* ---- Procedural Realistic WebAudio Synthesizer ---- */
  function sfxClamp(tm) {
    if (typeof EDSound === 'undefined' || EDSound.quiet()) return;
    EDSound.note([240, 180], { seconds: 0.045, wave: 'triangle', gain: 0.16 });
    tm.later(() => EDSound.note([1120, 1480], { seconds: 0.04, wave: 'sine', gain: 0.14 }), 28);
  }

  function sfxKnifeSwitch(closed, live, tm) {
    if (typeof EDSound === 'undefined' || EDSound.quiet()) return;
    EDSound.note(closed ? [320, 190] : [260, 140], { seconds: 0.055, wave: 'triangle', gain: 0.18 });
    if (closed) {
      tm.later(() => EDSound.note([880, 620], { seconds: 0.035, wave: 'square', gain: 0.08 }), 20);
    }
    if (closed && live) {
      tm.later(() => EDSound.note([2400, 1200], { seconds: 0.06, wave: 'sawtooth', gain: 0.07 }), 32);
    }
  }

  function sfxDetent(v) {
    if (typeof EDSound === 'undefined' || EDSound.quiet()) return;
    const pitch = v === 3 ? 420 : v === 6 ? 560 : 720;
    EDSound.note([pitch, pitch * 1.18], { seconds: 0.04, wave: 'triangle', gain: 0.15 });
  }

  function sfxBell(tm) {
    if (typeof EDSound === 'undefined' || EDSound.quiet()) return;
    [1046.5, 1318.5, 1567.98, 2093].forEach((f, i) => {
      tm.later(() => EDSound.note([f, f * 1.01], { seconds: 0.32, wave: 'sine', gain: 0.14 - i * 0.02 }), i * 55);
    });
  }

  /* ---- 14-Node Verlet Rope Cable Generator ---- */
  function createVerletCable(id, color, rimColor) {
    const N = 14;
    const pts = [];
    for (let i = 0; i < N; i++) {
      pts.push({ x: 0, y: 0, ox: 0, oy: 0 });
    }
    return {
      id,
      color,
      rimColor,
      pts,
      connected: true,
      dragging: false,
      plugX: 0,
      plugY: 0,
      anchorX: 0,
      anchorY: 0,
      postX: 0,
      postY: 0,
      restX: 0,
      restY: 0,
      nutAngle: 0,
    };
  }

  function initCablePoints(w) {
    const endX = w.connected ? w.postX : w.restX;
    const endY = w.connected ? w.postY : w.restY;
    w.plugX = endX;
    w.plugY = endY;
    const N = w.pts.length;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const x = w.anchorX + (endX - w.anchorX) * t;
      const y = w.anchorY + (endY - w.anchorY) * t + Math.sin(t * Math.PI) * 20;
      w.pts[i].x = w.pts[i].ox = x;
      w.pts[i].y = w.pts[i].oy = y;
    }
  }

  function stepVerletCable(w, sagLen) {
    const N = w.pts.length;
    if (!w.dragging && !w.connected) {
      w.plugX += (w.restX - w.plugX) * 0.18;
      w.plugY += (w.restY - w.plugY) * 0.18;
    } else if (w.connected) {
      w.plugX += (w.postX - w.plugX) * 0.35;
      w.plugY += (w.postY - w.plugY) * 0.35;
      w.nutAngle += (Math.PI * 2 - w.nutAngle) * 0.2;
    }

    for (let i = 1; i < N - 1; i++) {
      const p = w.pts[i];
      const vx = (p.x - p.ox) * 0.84;
      const vy = (p.y - p.oy) * 0.84;
      p.ox = p.x;
      p.oy = p.y;
      p.x += vx;
      p.y += vy + 0.45;
    }

    const seg = sagLen / (N - 1);
    for (let iter = 0; iter < 5; iter++) {
      w.pts[0].x = w.anchorX;
      w.pts[0].y = w.anchorY;
      w.pts[N - 1].x = w.plugX;
      w.pts[N - 1].y = w.plugY;
      for (let i = 0; i < N - 1; i++) {
        const a = w.pts[i];
        const b = w.pts[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.001;
        const diff = (d - seg) / d;
        if (i > 0) {
          a.x += dx * diff * 0.5;
          a.y += dy * diff * 0.5;
        }
        if (i + 1 < N - 1) {
          b.x -= dx * diff * 0.5;
          b.y -= dy * diff * 0.5;
        }
      }
    }
  }

  let cleanupFn = null;

  function mount(root, ctx) {
    EDKit.style('cl-style', CSS);
    const lang = ctx.lang;
    const t = TEXT[lang] || TEXT.he;
    const mode = (ctx.set && ctx.set.mode) || 'spark';
    const rounds = ROUNDS[mode] || ROUNDS.spark;

    let roundIdx = 0;
    let round = rounds[0];
    let locked = false;
    let rafId = 0;
    const tm = EDKit.timers();
    const pointerEvents = new AbortController();
    let drag = null;

    /* ---- Live Physical State ---- */
    const wirePos = createVerletCable('pos', '#c93326', '#ff8b7e');
    const wireNeg = createVerletCable('neg', '#252932', '#7a8499');
    let sw1 = { closed: false, angle: -1 };
    let sw2 = { closed: true, angle: 0 };
    let diverter = 'A'; // 'A' | 'B' | 'AB'
    let polarity = 1;   // 1 (+ East) | -1 (- West)
    let supplyVolt = 6; // 3 | 6 | 9
    let dialAngle = 0;

    /* Continuous 60fps simulated physical state */
    let meterVolt = 0;
    let meterVel = 0;
    let filamentTemp = 0;     // 0..1 (maps to 300K..2900K)
    let fanAngle = 0;
    let fanSpeed = 0;         // rad/frame
    let boatPos = 0;          // -9..+9 continuous position in water tank
    let boatVel = 0;
    let sailBillow = 0;       // -1..+1
    let bellSwing = 0;
    let bellVel = 0;
    let craneLift = 0;        // 0..1 vertical hoist height
    let craneVel = 0;
    let craneShake = 0;
    let stability = 0;        // 0..1 progress ring toward automatic lock
    let electronPhase = 0;
    let timeTick = 0;

    /* 30-Node Shallow Water Wave Tank for the Sailboat */
    const WN = 30;
    const waterH = new Float32Array(WN);
    const waterV = new Float32Array(WN);

    /* Sparks */
    let sparks = [];

    function spawnSparks(x, y, count = 14, col = '#ffd23f') {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.5 + Math.random() * 4.5;
        sparks.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 1.4,
          r: 1.5 + Math.random() * 2.4,
          col,
          life: 1,
        });
      }
    }

    /* ---- Build Stage DOM ---- */
    root.innerHTML = `
      <div class="kit cl-wrap">
        <div class="cl-top">
          ${EDKit.dots(rounds.length, 0)}
          ${EDKit.head('', lang)}
          <button type="button" class="cl-reset-btn" id="cl-reset">${t.resetBtn}</button>
        </div>
        <p class="kit-hint" id="cl-hint"></p>
        <div class="cl-stage-box" id="cl-box">
          <canvas class="cl-canvas" id="cl-canvas"></canvas>
          <div class="cl-ui" id="cl-ui">
            <button type="button" class="cl-hit" id="hit-wire-pos" aria-label="${t.wirePosAria}"></button>
            <button type="button" class="cl-hit" id="hit-wire-neg" aria-label="${t.wireNegAria}"></button>
            <button type="button" class="cl-hit" id="hit-sw1" aria-label="${t.sw1Aria}"></button>
            <button type="button" class="cl-hit" id="hit-sw2" aria-label="${t.sw2Aria}"></button>
            <button type="button" class="cl-hit" id="hit-diverter" aria-label="${t.diverterAria}"></button>
            <button type="button" class="cl-hit" id="hit-polarity" aria-label="${t.polarityAria}"></button>
            <button type="button" class="cl-volt-btn" data-volt="3" aria-label="${t.voltAria(3)}">3V</button>
            <button type="button" class="cl-volt-btn" data-volt="6" aria-label="${t.voltAria(6)}">6V</button>
            <button type="button" class="cl-volt-btn" data-volt="9" aria-label="${t.voltAria(9)}">9V</button>
            <button type="button" class="cl-lock-cta" id="cl-lock-cta">${t.lockLabel}</button>
          </div>
        </div>
      </div>
    `;

    const box = root.querySelector('#cl-box');
    const canvas = root.querySelector('#cl-canvas');
    const ctx2d = canvas.getContext('2d');
    const hintEl = root.querySelector('#cl-hint');
    const headH2 = root.querySelector('.kit-head h2');
    const dotsWrap = root.querySelector('.kit-dots');
    const hitWirePos = root.querySelector('#hit-wire-pos');
    const hitWireNeg = root.querySelector('#hit-wire-neg');
    const hitSw1 = root.querySelector('#hit-sw1');
    const hitSw2 = root.querySelector('#hit-sw2');
    const hitDiverter = root.querySelector('#hit-diverter');
    const hitPolarity = root.querySelector('#hit-polarity');
    const voltBtns = Array.from(root.querySelectorAll('.cl-volt-btn'));
    const lockCta = root.querySelector('#cl-lock-cta');
    const resetBtn = root.querySelector('#cl-reset');

    let W = 880, H = 500, dpr = 1;
    let layout = {};

    function computeLayout() {
      const phone = W < 560;
      const compact = W < 720;

      if (phone) {
        /* 2-Tier Stacked Phone Workbench:
           Top row (y: 10..212): Power Console on Left, Switches & Cables on Right.
           Bottom row (y: 222..H-10): Full-width Apparatus Deck! */
        const consoleX = 10;
        const consoleY = 10;
        const consoleW = Math.round(W * 0.46);
        const consoleH = 204;

        const midX = consoleX + consoleW + 8;
        const midW = W - midX - 10;

        const rightX = 10;
        const rightY = consoleY + consoleH + 10;
        const rightW = W - 20;
        const rightH = H - rightY - 10;

        const postPos = { x: consoleX + consoleW - 4, y: consoleY + 52 };
        const postNeg = { x: consoleX + consoleW - 4, y: consoleY + consoleH - 34 };
        const termPos = { x: midX + 16, y: consoleY + 52 };
        const termNeg = { x: midX + 16, y: consoleY + consoleH - 34 };

        wirePos.anchorX = postPos.x;
        wirePos.anchorY = postPos.y;
        wirePos.postX = termPos.x;
        wirePos.postY = termPos.y;
        wirePos.restX = midX + 4;
        wirePos.restY = termPos.y + 34;

        wireNeg.anchorX = postNeg.x;
        wireNeg.anchorY = postNeg.y;
        wireNeg.postX = termNeg.x;
        wireNeg.postY = termNeg.y;
        wireNeg.restX = midX + 4;
        wireNeg.restY = termNeg.y - 34;

        const dialCx = consoleX + consoleW * 0.5;
        const dialCy = consoleY + (round.hasPolarity ? 116 : 128);
        const dialR = 20;

        const polCx = consoleX + consoleW * 0.5;
        const polCy = consoleY + consoleH - 19;

        const swCenterX = midX + midW * 0.58;
        const topBusY = termPos.y;
        const botBusY = termNeg.y;

        layout = {
          phone, compact,
          consoleX, consoleY, consoleW, consoleH,
          midX, midW,
          rightX, rightY, rightW, rightH,
          postPos, postNeg, termPos, termNeg,
          dialCx, dialCy, dialR,
          polCx, polCy,
          swCenterX, topBusY, botBusY,
        };
      } else {
        /* 3-Column Wide Workbench for Tablet & Desktop */
        const consoleW = compact ? Math.min(200, W * 0.29) : Math.min(242, W * 0.27);
        const consoleX = 14;
        const consoleY = 16;
        const consoleH = H - 32;

        const midX = consoleX + consoleW + (compact ? 12 : 16);
        const midW = compact ? Math.max(150, W * 0.24) : Math.max(190, W * 0.24);
        const rightX = midX + midW + (compact ? 12 : 16);
        const rightY = consoleY;
        const rightW = Math.max(180, W - rightX - 14);
        const rightH = consoleH;

        const postPos = { x: consoleX + consoleW - 6, y: consoleY + consoleH * 0.24 };
        const postNeg = { x: consoleX + consoleW - 6, y: consoleY + consoleH * 0.78 };
        const termPos = { x: midX + 20, y: consoleY + consoleH * 0.24 };
        const termNeg = { x: midX + 20, y: consoleY + consoleH * 0.78 };

        wirePos.anchorX = postPos.x;
        wirePos.anchorY = postPos.y;
        wirePos.postX = termPos.x;
        wirePos.postY = termPos.y;
        wirePos.restX = midX - 4;
        wirePos.restY = termPos.y + 52;

        wireNeg.anchorX = postNeg.x;
        wireNeg.anchorY = postNeg.y;
        wireNeg.postX = termNeg.x;
        wireNeg.postY = termNeg.y;
        wireNeg.restX = midX - 4;
        wireNeg.restY = termNeg.y - 52;

        const dialCx = consoleX + consoleW * 0.5;
        const dialCy = consoleY + consoleH * (round.hasPolarity ? 0.54 : 0.62);
        const dialR = compact ? 27 : 34;

        const polCx = consoleX + consoleW * 0.5;
        const polCy = consoleY + consoleH * 0.82;

        const swCenterX = midX + midW * 0.54;
        const topBusY = termPos.y;
        const botBusY = termNeg.y;

        layout = {
          phone, compact,
          consoleX, consoleY, consoleW, consoleH,
          midX, midW,
          rightX, rightY, rightW, rightH,
          postPos, postNeg, termPos, termNeg,
          dialCx, dialCy, dialR,
          polCx, polCy,
          swCenterX, topBusY, botBusY,
        };
      }
    }

    function positionWireHit(wire, button) {
      button.style.left = `${wire.connected ? wire.postX : wire.plugX}px`;
      button.style.top = `${wire.connected ? wire.postY : wire.plugY}px`;
    }

    function syncHtmlControls() {
      const { phone, compact, midX, midW, dialCx, dialCy, dialR, polCx, polCy, swCenterX, topBusY } = layout;

      /* Wire hit targets follow either the loose plug or the binding post */
      for (const [wire, button] of [[wirePos, hitWirePos], [wireNeg, hitWireNeg]]) {
        positionWireHit(wire, button);
        button.style.width = '54px';
        button.style.height = '54px';
        button.classList.toggle('cl-hit--pulse', !wire.connected);
      }

      /* Switches */
      if (round.topology === 'series') {
        const sw1X = phone ? swCenterX : midX + midW * 0.34;
        const sw1Y = topBusY;
        const sw2X = phone ? swCenterX : midX + midW * 0.74;
        const sw2Y = phone ? topBusY + 62 : topBusY;

        hitSw1.style.left = `${sw1X}px`;
        hitSw1.style.top = `${sw1Y}px`;
        hitSw1.style.width = `${compact ? 54 : 66}px`;
        hitSw1.style.height = '48px';
        hitSw1.hidden = false;
        hitSw1.classList.toggle('cl-hit--pulse', !sw1.closed);

        hitSw2.style.left = `${sw2X}px`;
        hitSw2.style.top = `${sw2Y}px`;
        hitSw2.style.width = `${compact ? 54 : 66}px`;
        hitSw2.style.height = '48px';
        hitSw2.hidden = false;
        hitSw2.classList.toggle('cl-hit--pulse', !sw2.closed);
      } else if (round.topology === 'parallel') {
        hitSw1.hidden = true;
        hitSw2.style.left = `${swCenterX}px`;
        hitSw2.style.top = `${topBusY + (phone ? 54 : 58)}px`;
        hitSw2.style.width = '72px';
        hitSw2.style.height = '50px';
        hitSw2.hidden = false;
        hitSw2.classList.toggle('cl-hit--pulse', !sw2.closed);
      } else {
        hitSw1.style.left = `${swCenterX}px`;
        hitSw1.style.top = `${topBusY}px`;
        hitSw1.style.width = '72px';
        hitSw1.style.height = '50px';
        hitSw1.hidden = false;
        hitSw1.classList.toggle('cl-hit--pulse', !sw1.closed);
        hitSw2.hidden = true;
      }

      /* Diverter */
      if (round.topology === 'diverter') {
        hitDiverter.hidden = false;
        hitDiverter.style.left = `${swCenterX}px`;
        hitDiverter.style.top = `${topBusY + (phone ? 58 : 74)}px`;
        hitDiverter.style.width = '84px';
        hitDiverter.style.height = '50px';
        hitDiverter.classList.toggle('cl-hit--pulse', diverter !== round.targetDiverter);
      } else {
        hitDiverter.hidden = true;
      }

      /* Polarity Reverser */
      if (round.hasPolarity) {
        hitPolarity.hidden = false;
        hitPolarity.style.left = `${polCx}px`;
        hitPolarity.style.top = `${polCy}px`;
        hitPolarity.style.width = `${phone ? 112 : compact ? 128 : 156}px`;
        hitPolarity.style.height = `${phone ? 30 : 42}px`;
        hitPolarity.classList.toggle('cl-hit--pulse', polarity !== round.targetPolarity);
      } else {
        hitPolarity.hidden = true;
      }

      /* Voltage Dial Buttons (3V, 6V, 9V) */
      const btnSpread = phone ? 38 : compact ? dialR + 22 : dialR + 28;
      const btnYOffset = phone ? dialR + 14 : dialR + 20;
      const vCoords = [
        { v: 3, x: dialCx - btnSpread, y: dialCy + btnYOffset },
        { v: 6, x: dialCx,             y: dialCy + btnYOffset + (phone ? 2 : 4) },
        { v: 9, x: dialCx + btnSpread, y: dialCy + btnYOffset },
      ];
      voltBtns.forEach((btn) => {
        const v = Number(btn.dataset.volt);
        const pos = vCoords.find((c) => c.v === v);
        btn.style.left = `${pos.x}px`;
        btn.style.top = `${pos.y}px`;
        btn.setAttribute('aria-pressed', String(supplyVolt === v));
      });
    }

    function resize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      if (!width || !height || (layout.consoleW && W === width && H === height && dpr === scale)) return;
      stopDrag();
      W = width;
      H = height;
      dpr = scale;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      computeLayout();
      initCablePoints(wirePos);
      initCablePoints(wireNeg);
      syncHtmlControls();
    }

    /* ---- Live Circuit Nodal Solver ---- */
    function evaluateCircuit() {
      const bothWires = wirePos.connected && wireNeg.connected;
      let bridgeClosed = false;
      if (round.topology === 'single') {
        bridgeClosed = sw1.closed;
      } else if (round.topology === 'series') {
        bridgeClosed = sw1.closed && sw2.closed;
      } else if (round.topology === 'parallel') {
        bridgeClosed = sw2.closed;
      } else if (round.topology === 'diverter') {
        bridgeClosed = sw1.closed;
      }

      const busLive = bothWires && bridgeClosed;
      const busVolt = busLive ? supplyVolt : 0;
      const signedVolt = busVolt * polarity;

      let lampVolt = 0;
      let boatVolt = 0;
      let craneVolt = 0;

      if (busLive) {
        if (round.topology === 'diverter') {
          const mA = round.machines[0];
          const mB = round.machines[1] || round.machines[0];
          if (diverter === 'A' || diverter === 'AB') {
            if (mA === 'lamp') lampVolt = busVolt;
            if (mA === 'crane') craneVolt = busVolt;
            if (mA === 'boat') boatVolt = signedVolt;
          }
          if (diverter === 'B' || diverter === 'AB') {
            if (mB === 'lamp') lampVolt = busVolt;
            if (mB === 'crane') craneVolt = busVolt;
            if (mB === 'boat') boatVolt = signedVolt;
          }
        } else {
          if (round.machines.includes('lamp')) lampVolt = busVolt;
          if (round.machines.includes('crane')) craneVolt = busVolt;
          if (round.machines.includes('boat')) boatVolt = signedVolt;
        }
      }

      let goalMet = busLive && supplyVolt === round.targetVolt;
      if (round.hasPolarity && polarity !== round.targetPolarity) goalMet = false;
      if (round.topology === 'diverter' && diverter !== round.targetDiverter) goalMet = false;

      return {
        bothWires,
        bridgeClosed,
        busLive,
        busVolt,
        signedVolt,
        lampVolt,
        boatVolt,
        craneVolt,
        goalMet,
      };
    }

    function updateHeadlineAndHint() {
      const state = evaluateCircuit();
      let headline = '';
      if (mode === 'spark') {
        headline = t.askSpark(round.targetVolt, t.lightNames[round.targetVolt]);
      } else if (mode === 'motor') {
        const dirName = round.targetPolarity > 0 ? t.polEast : t.polWest;
        const buoyKey = String(round.targetVolt * round.targetPolarity);
        headline = t.askMotor(round.targetVolt, dirName, t.buoyNames[buoyKey]);
      } else if (mode === 'switches') {
        const logicName = round.topology === 'series' ? t.logicSeries
          : round.topology === 'parallel' ? t.logicParallel : t.logicDiverter;
        const targetMachine = round.machines.includes('crane')
          ? t.cargoNames[round.targetVolt]
          : t.lightNames[round.targetVolt];
        headline = t.askSwitches(logicName, round.targetVolt, targetMachine);
      } else {
        const dirName = round.targetPolarity > 0 ? t.polEast : t.polWest;
        headline = t.askMachine(round.targetVolt, dirName);
      }
      headH2.textContent = headline;

      if (state.goalMet) {
        hintEl.textContent = t.hintReady;
      } else if (!wirePos.connected || !wireNeg.connected) {
        hintEl.textContent = t.hintWire;
      } else if (!state.bridgeClosed) {
        hintEl.textContent = t.hintSwitch;
      } else if (round.topology === 'diverter' && diverter !== round.targetDiverter) {
        hintEl.textContent = t.hintDiverter;
      } else if (round.hasPolarity && polarity !== round.targetPolarity) {
        hintEl.textContent = t.hintPolarity;
      } else if (supplyVolt !== round.targetVolt) {
        hintEl.textContent = t.hintVolt(round.targetVolt);
      } else {
        hintEl.textContent = t.hintReady;
      }

      lockCta.classList.toggle('ready', state.goalMet && !locked);
      syncHtmlControls();
    }

    function loadRound(idx) {
      stopDrag();
      tm.clear();
      roundIdx = idx;
      round = rounds[idx];
      locked = false;
      stability = 0;

      wirePos.connected = Boolean(round.startWires[0]);
      wireNeg.connected = Boolean(round.startWires[1]);
      sw1.closed = Boolean(round.startSwitches[0]);
      sw1.angle = sw1.closed ? 0 : -1;
      sw2.closed = Boolean(round.startSwitches[1]);
      sw2.angle = sw2.closed ? 0 : -1;
      diverter = round.startDiverter || 'A';
      polarity = round.startPolarity || 1;
      supplyVolt = round.startVolt || 6;

      computeLayout();
      initCablePoints(wirePos);
      initCablePoints(wireNeg);

      dotsWrap.outerHTML = EDKit.dots(rounds.length, roundIdx);
      updateHeadlineAndHint();

      const voiceKey = mode === 'spark' ? 'cl-spark'
        : mode === 'motor' ? 'cl-motor'
        : mode === 'switches' ? 'cl-switches' : 'cl-machine';
      EDKit.voice(root, voiceKey, lang);
    }

    function completeRound() {
      if (locked) return;
      stopDrag();
      locked = true;
      lockCta.classList.remove('ready');
      sfxBell(tm);
      bellVel = 0.42;
      spawnSparks(W * 0.72, H * 0.36, 26, '#ffd23f');
      spawnSparks(W * 0.72, H * 0.64, 22, '#4ade80');
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
      }, 1150);
    }

    /* ---- Interactive Controls & Dragging ---- */
    function clampCable(wire) {
      if (locked || wire.connected) return;
      wire.connected = true;
      wire.dragging = false;
      sfxClamp(tm);
      spawnSparks(wire.postX, wire.postY, 12, '#ffd23f');
      updateHeadlineAndHint();
    }

    hitWirePos.addEventListener('click', (e) => { if (e.detail === 0) clampCable(wirePos); });
    hitWireNeg.addEventListener('click', (e) => { if (e.detail === 0) clampCable(wireNeg); });

    hitSw1.addEventListener('click', () => {
      if (locked) return;
      sw1.closed = !sw1.closed;
      const st = evaluateCircuit();
      sfxKnifeSwitch(sw1.closed, st.busLive, tm);
      if (sw1.closed && st.bothWires) {
        spawnSparks(layout.swCenterX, layout.topBusY, 14, '#ffd23f');
      }
      updateHeadlineAndHint();
    });

    hitSw2.addEventListener('click', () => {
      if (locked) return;
      sw2.closed = !sw2.closed;
      const st = evaluateCircuit();
      sfxKnifeSwitch(sw2.closed, st.busLive, tm);
      if (sw2.closed && st.bothWires) {
        spawnSparks(layout.swCenterX + 16, layout.topBusY + 30, 14, '#ffd23f');
      }
      updateHeadlineAndHint();
    });

    hitDiverter.addEventListener('click', () => {
      if (locked) return;
      if (round.targetDiverter === 'AB') {
        diverter = diverter === 'A' ? 'B' : diverter === 'B' ? 'AB' : 'A';
      } else {
        diverter = diverter === 'A' ? 'B' : 'A';
      }
      sfxKnifeSwitch(true, true, tm);
      spawnSparks(layout.swCenterX, layout.topBusY + 58, 12, '#ffd23f');
      updateHeadlineAndHint();
    });

    hitPolarity.addEventListener('click', () => {
      if (locked) return;
      polarity = polarity === 1 ? -1 : 1;
      sfxKnifeSwitch(true, true, tm);
      spawnSparks(layout.polCx, layout.polCy, 10, '#60a5fa');
      updateHeadlineAndHint();
    });

    voltBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (locked) return;
        const v = Number(btn.dataset.volt);
        supplyVolt = v;
        sfxDetent(v);
        spawnSparks(layout.dialCx, layout.dialCy, 8, '#ffd23f');
        updateHeadlineAndHint();
      });
    });

    lockCta.addEventListener('click', () => {
      const st = evaluateCircuit();
      if (st.goalMet && !locked) completeRound();
    });

    resetBtn.addEventListener('click', () => {
      if (locked) return;
      loadRound(roundIdx);
    });

    /* Canvas pointer drag for Verlet cables and rotary dial */
    function stopDrag() {
      if (!drag) return;
      const { id, wire } = drag;
      drag = null;
      if (wire) wire.dragging = false;
      if (box.hasPointerCapture(id)) box.releasePointerCapture(id);
    }

    function pointerPos(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    box.addEventListener('pointerdown', (e) => {
      if (locked || drag || !e.isPrimary || e.button !== 0) return;
      const p = pointerPos(e);
      const button = e.target.closest('button');
      if (button && button !== hitWirePos && button !== hitWireNeg) return;
      const wire = button === hitWirePos ? wirePos : button === hitWireNeg ? wireNeg
        : [wirePos, wireNeg].find((w) => !w.connected && Math.hypot(p.x - w.plugX, p.y - w.plugY) < 42);
      if (wire?.connected) return;
      if (!wire && Math.hypot(p.x - layout.dialCx, p.y - layout.dialCy) > layout.dialR + 10) return;

      drag = { id: e.pointerId, wire, start: p, moved: false };
      box.setPointerCapture(e.pointerId);
      if (wire) {
        wire.dragging = true;
      } else {
        const nextV = supplyVolt === 3 ? 6 : supplyVolt === 6 ? 9 : 3;
        supplyVolt = nextV;
        sfxDetent(nextV);
        updateHeadlineAndHint();
      }
    });

    function movedFromStart(p) {
      return Math.hypot(p.x - drag.start.x, p.y - drag.start.y) >= 9;
    }

    const onPointer = { signal: pointerEvents.signal };
    box.addEventListener('pointermove', (e) => {
      if (e.pointerId !== drag?.id) return;
      const p = pointerPos(e);
      const { wire } = drag;
      if (wire) {
        if (wire.connected) return;
        drag.moved ||= movedFromStart(p);
        if (!drag.moved) return;
        wire.plugX = p.x;
        wire.plugY = p.y;
        if (Math.hypot(p.x - wire.postX, p.y - wire.postY) < 44) clampCable(wire);
      } else {
        const dx = p.x - layout.dialCx;
        const nextV = dx < -14 ? 3 : dx > 14 ? 9 : 6;
        if (nextV !== supplyVolt) {
          supplyVolt = nextV;
          sfxDetent(nextV);
          updateHeadlineAndHint();
        }
      }
    }, onPointer);

    box.addEventListener('pointerup', (e) => {
      if (e.pointerId !== drag?.id) return;
      const { wire, moved } = drag;
      if (wire) {
        const p = pointerPos(e);
        if ((!moved && !movedFromStart(p)) || Math.hypot(p.x - wire.postX, p.y - wire.postY) < 44) {
          clampCable(wire);
        }
      }
      stopDrag();
    }, onPointer);

    function cancelPointer(e) {
      if (e.pointerId === drag?.id) stopDrag();
    }
    box.addEventListener('pointercancel', cancelPointer, onPointer);
    box.addEventListener('lostpointercapture', cancelPointer, onPointer);
    window.addEventListener('edpause', stopDrag, onPointer);

    /* ---- Drawing Helpers for Realistic Hardware ---- */
    function drawScrew(x, y, r, angle = 0.4) {
      ctx2d.save();
      ctx2d.translate(x, y);
      ctx2d.rotate(angle);
      const g = ctx2d.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
      g.addColorStop(0, '#f7deb0');
      g.addColorStop(0.6, '#b8893d');
      g.addColorStop(1, '#5e4114');
      ctx2d.fillStyle = g;
      ctx2d.beginPath();
      ctx2d.arc(0, 0, r, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.strokeStyle = '#3b2608';
      ctx2d.lineWidth = Math.max(1.1, r * 0.28);
      ctx2d.beginPath();
      ctx2d.moveTo(-r * 0.65, 0);
      ctx2d.lineTo(r * 0.65, 0);
      ctx2d.stroke();
      ctx2d.restore();
    }

    function drawBindingPost(x, y, col, label, connected, nutAngle, small) {
      ctx2d.save();
      const rad = small ? 10 : 12.5;
      ctx2d.fillStyle = 'rgba(0,0,0,0.45)';
      ctx2d.beginPath();
      ctx2d.arc(x + 2, y + 3, rad, 0, Math.PI * 2);
      ctx2d.fill();

      const bg = ctx2d.createRadialGradient(x - 2, y - 2, 2, x, y, rad);
      bg.addColorStop(0, '#ffe8b3');
      bg.addColorStop(0.55, '#c89b4b');
      bg.addColorStop(1, '#6e4f1a');
      ctx2d.fillStyle = bg;
      ctx2d.beginPath();
      ctx2d.arc(x, y, rad, 0, Math.PI * 2);
      ctx2d.fill();

      ctx2d.fillStyle = col;
      ctx2d.beginPath();
      ctx2d.arc(x, y, rad * 0.72, 0, Math.PI * 2);
      ctx2d.fill();

      ctx2d.save();
      ctx2d.translate(x, y);
      ctx2d.rotate(nutAngle || 0);
      ctx2d.fillStyle = '#e5bd6d';
      ctx2d.beginPath();
      ctx2d.arc(0, 0, rad * 0.42, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.restore();

      if (!connected) {
        const pulse = 0.5 + 0.5 * Math.sin(timeTick * 0.12);
        ctx2d.strokeStyle = `rgba(255, 215, 75, ${0.45 + pulse * 0.5})`;
        ctx2d.lineWidth = 2.2;
        ctx2d.beginPath();
        ctx2d.arc(x, y, rad + 3 + pulse * 4, 0, Math.PI * 2);
        ctx2d.stroke();
      }

      if (label) {
        ctx2d.fillStyle = '#f8e6c2';
        ctx2d.font = `700 ${small ? 10.5 : 12}px Fredoka, Heebo, sans-serif`;
        ctx2d.textAlign = 'center';
        ctx2d.fillText(label, x, y - rad - 4);
      }
      ctx2d.restore();
    }

    function drawVerletCable(w, liveVolt, small) {
      const pts = w.pts;
      if (!pts.length) return;
      ctx2d.save();

      ctx2d.strokeStyle = 'rgba(0, 0, 0, 0.42)';
      ctx2d.lineWidth = small ? 7.5 : 10;
      ctx2d.lineCap = 'round';
      ctx2d.lineJoin = 'round';
      ctx2d.beginPath();
      ctx2d.moveTo(pts[0].x + 2, pts[0].y + 5);
      for (let i = 1; i < pts.length; i++) {
        ctx2d.lineTo(pts[i].x + 2, pts[i].y + 5);
      }
      ctx2d.stroke();

      ctx2d.strokeStyle = w.color;
      ctx2d.lineWidth = small ? 6.5 : 8.5;
      ctx2d.beginPath();
      ctx2d.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx2d.lineTo(pts[i].x, pts[i].y);
      }
      ctx2d.stroke();

      ctx2d.strokeStyle = w.rimColor;
      ctx2d.lineWidth = small ? 2.4 : 3.2;
      ctx2d.setLineDash([4, 6]);
      ctx2d.beginPath();
      ctx2d.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx2d.lineTo(pts[i].x, pts[i].y);
      }
      ctx2d.stroke();
      ctx2d.setLineDash([]);

      if (liveVolt > 0 && w.connected) {
        ctx2d.strokeStyle = 'rgba(255, 230, 120, 0.72)';
        ctx2d.lineWidth = 3;
        ctx2d.setLineDash([6, 16]);
        ctx2d.lineDashOffset = -electronPhase * (w.id === 'pos' ? 1 : -1);
        ctx2d.beginPath();
        ctx2d.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx2d.lineTo(pts[i].x, pts[i].y);
        }
        ctx2d.stroke();
        ctx2d.setLineDash([]);
      }

      const tip = pts[pts.length - 1];
      const prev = pts[pts.length - 2];
      const ang = Math.atan2(tip.y - prev.y, tip.x - prev.x);
      ctx2d.save();
      ctx2d.translate(tip.x, tip.y);
      ctx2d.rotate(ang);
      ctx2d.fillStyle = '#e0b45c';
      ctx2d.strokeStyle = '#6b4c18';
      ctx2d.lineWidth = 1.5;
      ctx2d.beginPath();
      ctx2d.roundRect(-7, -5, 13, 10, 3);
      ctx2d.fill();
      ctx2d.stroke();
      ctx2d.restore();

      if (!w.connected) {
        const bob = Math.sin(timeTick * 0.1) * 2.5;
        ctx2d.fillStyle = 'rgba(28, 19, 12, 0.92)';
        ctx2d.strokeStyle = '#ffd23f';
        ctx2d.lineWidth = 1.6;
        ctx2d.beginPath();
        ctx2d.roundRect(tip.x - 32, tip.y + 12 + bob, 64, 20, 7);
        ctx2d.fill();
        ctx2d.stroke();
        ctx2d.fillStyle = '#ffe596';
        ctx2d.font = '700 10.5px Fredoka, Heebo, sans-serif';
        ctx2d.textAlign = 'center';
        ctx2d.fillText(`⚡ ${t.clampHint}`, tip.x, tip.y + 26 + bob);
      }

      ctx2d.restore();
    }

    function drawKnifeSwitch(cx, cy, sw, label, small) {
      ctx2d.save();
      const bw = small ? 50 : 64;
      const bh = small ? 24 : 30;

      ctx2d.fillStyle = 'rgba(0,0,0,0.45)';
      ctx2d.beginPath();
      ctx2d.roundRect(cx - bw / 2 + 2, cy - bh / 2 + 3, bw, bh, 6);
      ctx2d.fill();

      const pg = ctx2d.createLinearGradient(cx, cy - bh / 2, cx, cy + bh / 2);
      pg.addColorStop(0, '#f7f0e1');
      pg.addColorStop(1, '#d5c8b0');
      ctx2d.fillStyle = pg;
      ctx2d.strokeStyle = '#8c7654';
      ctx2d.lineWidth = 1.8;
      ctx2d.beginPath();
      ctx2d.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 6);
      ctx2d.fill();
      ctx2d.stroke();

      const p1x = cx - bw * 0.28;
      const p2x = cx + bw * 0.28;
      ctx2d.fillStyle = '#c89b4b';
      ctx2d.beginPath();
      ctx2d.arc(p1x, cy, 4.5, 0, Math.PI * 2);
      ctx2d.arc(p2x, cy, 4.5, 0, Math.PI * 2);
      ctx2d.fill();

      const targetAngle = sw.closed ? 0 : -0.82;
      sw.angle += (targetAngle - sw.angle) * 0.24;

      ctx2d.save();
      ctx2d.translate(p1x, cy);
      ctx2d.rotate(sw.angle);
      const bladeLen = p2x - p1x + 4;
      ctx2d.strokeStyle = '#d98236';
      ctx2d.lineWidth = small ? 4 : 5;
      ctx2d.lineCap = 'round';
      ctx2d.beginPath();
      ctx2d.moveTo(0, 0);
      ctx2d.lineTo(bladeLen, 0);
      ctx2d.stroke();

      ctx2d.fillStyle = sw.closed ? '#16a34a' : '#c93326';
      ctx2d.strokeStyle = '#fff';
      ctx2d.lineWidth = 1.3;
      ctx2d.beginPath();
      ctx2d.roundRect(bladeLen - 3, -5, 13, 10, 3.5);
      ctx2d.fill();
      ctx2d.stroke();
      ctx2d.restore();

      ctx2d.fillStyle = sw.closed ? '#86efac' : '#fde047';
      ctx2d.font = `700 ${small ? 10 : 11}px Fredoka, Heebo, sans-serif`;
      ctx2d.textAlign = 'center';
      ctx2d.fillText(`${label}: ${sw.closed ? t.closedTag : t.openTag}`, cx, cy + bh / 2 + 12);
      ctx2d.restore();
    }

    /* ---- Apparatus 1: Hand-Blown Edison Filament Lamp & Brass Photometer ---- */
    function drawEdisonLampBox(x, y, w, h, lampVolt, targetVolt) {
      ctx2d.save();
      ctx2d.fillStyle = 'rgba(22, 14, 9, 0.82)';
      ctx2d.strokeStyle = '#9b7432';
      ctx2d.lineWidth = 2.5;
      ctx2d.beginPath();
      ctx2d.roundRect(x, y, w, h, 14);
      ctx2d.fill();
      ctx2d.stroke();

      drawScrew(x + 11, y + 11, 4);
      drawScrew(x + w - 11, y + 11, 4);
      drawScrew(x + 11, y + h - 11, 4);
      drawScrew(x + w - 11, y + h - 11, 4);

      ctx2d.fillStyle = '#f3dfc1';
      ctx2d.font = '700 12px Fredoka, Heebo, sans-serif';
      ctx2d.textAlign = 'center';
      ctx2d.fillText(t.lampTitle, x + w * 0.5, y + 18);

      const bulbCx = x + w * 0.36;
      const bulbCy = y + h * 0.53;
      const bulbR = Math.min(w * 0.22, h * 0.27, 46);

      const targetTemp = lampVolt / 9;
      filamentTemp += (targetTemp - filamentTemp) * 0.1;

      if (filamentTemp > 0.03) {
        const glowR = bulbR * (1.8 + filamentTemp * 2.2);
        const rg = ctx2d.createRadialGradient(bulbCx, bulbCy - 6, 4, bulbCx, bulbCy - 6, glowR);
        const rCol = 255;
        const gCol = Math.round(110 + filamentTemp * 130);
        const bCol = Math.round(25 + filamentTemp * 155);
        rg.addColorStop(0, `rgba(${rCol}, ${gCol}, ${bCol}, ${0.58 * filamentTemp})`);
        rg.addColorStop(0.5, `rgba(255, 160, 45, ${0.26 * filamentTemp})`);
        rg.addColorStop(1, 'rgba(255, 140, 20, 0)');
        ctx2d.fillStyle = rg;
        ctx2d.beginPath();
        ctx2d.arc(bulbCx, bulbCy - 6, glowR, 0, Math.PI * 2);
        ctx2d.fill();
      }

      /* Brass E27 screw socket base & turned wood pedestal */
      const sockW = bulbR * 0.82;
      const sockH = bulbR * 0.48;
      const sockY = bulbCy + bulbR * 0.72;
      const sg = ctx2d.createLinearGradient(bulbCx - sockW / 2, sockY, bulbCx + sockW / 2, sockY);
      sg.addColorStop(0, '#7d5c21');
      sg.addColorStop(0.45, '#f5d488');
      sg.addColorStop(1, '#6b4c18');
      ctx2d.fillStyle = sg;
      ctx2d.beginPath();
      ctx2d.roundRect(bulbCx - sockW / 2, sockY, sockW, sockH, 5);
      ctx2d.fill();

      /* Hand-blown glass envelope */
      ctx2d.fillStyle = `rgba(255, 235, 185, ${0.09 + filamentTemp * 0.28})`;
      ctx2d.strokeStyle = filamentTemp > 0.2 ? '#ffe6a3' : 'rgba(210, 225, 245, 0.48)';
      ctx2d.lineWidth = 2.2;
      ctx2d.beginPath();
      ctx2d.arc(bulbCx, bulbCy - 4, bulbR, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.stroke();

      /* Coiled tungsten filament inside the bulb */
      ctx2d.save();
      if (filamentTemp > 0.05) {
        ctx2d.shadowColor = filamentTemp > 0.7 ? '#fff7c2' : '#ff7b24';
        ctx2d.shadowBlur = 10 + filamentTemp * 18;
      }
      const filColor = filamentTemp < 0.08 ? '#52525b'
        : filamentTemp < 0.45 ? '#ff5722'
        : filamentTemp < 0.78 ? '#ffb703' : '#fffbeb';
      ctx2d.strokeStyle = filColor;
      ctx2d.lineWidth = 2.4 + filamentTemp * 1.8;
      ctx2d.lineCap = 'round';
      ctx2d.lineJoin = 'round';
      ctx2d.beginPath();
      ctx2d.moveTo(bulbCx - bulbR * 0.28, sockY);
      ctx2d.lineTo(bulbCx - bulbR * 0.28, bulbCy - bulbR * 0.15);
      ctx2d.bezierCurveTo(
        bulbCx - bulbR * 0.36, bulbCy - bulbR * 0.75,
        bulbCx + bulbR * 0.36, bulbCy - bulbR * 0.75,
        bulbCx + bulbR * 0.28, bulbCy - bulbR * 0.15
      );
      ctx2d.lineTo(bulbCx + bulbR * 0.28, sockY);
      ctx2d.stroke();
      ctx2d.restore();

      /* Curved glass specular reflection streak */
      ctx2d.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx2d.lineWidth = 2.8;
      ctx2d.lineCap = 'round';
      ctx2d.beginPath();
      ctx2d.arc(bulbCx, bulbCy - 4, bulbR * 0.78, -Math.PI * 0.78, -Math.PI * 0.48);
      ctx2d.stroke();

      /* 3-Jewel Brass Photometer Column (3V, 6V, 9V) */
      const meterX = x + w * 0.72;
      const levels = [9, 6, 3];
      levels.forEach((lv, i) => {
        const ly = y + 34 + i * ((h - 54) / 2);
        const isTarget = lv === targetVolt && round.machines.includes('lamp');
        const isLit = lampVolt >= lv;

        ctx2d.fillStyle = isLit
          ? (lv === 3 ? '#f97316' : lv === 6 ? '#facc15' : '#fef08a')
          : '#27201c';
        ctx2d.strokeStyle = isTarget ? '#4ade80' : '#c89b4b';
        ctx2d.lineWidth = isTarget ? 2.6 : 1.6;
        ctx2d.beginPath();
        ctx2d.arc(meterX, ly, 10, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.stroke();

        ctx2d.fillStyle = isLit ? '#1c130c' : '#d6c5ad';
        ctx2d.font = '700 10px Fredoka, sans-serif';
        ctx2d.textAlign = 'center';
        ctx2d.fillText(`${lv}V`, meterX, ly + 3.5);

        if (isTarget) {
          ctx2d.fillStyle = '#4ade80';
          ctx2d.font = '700 10.5px Fredoka, Heebo, sans-serif';
          ctx2d.textAlign = 'left';
          ctx2d.fillText(`◀ ${t.targetTag}`, meterX + 14, ly + 4);
        }
      });

      ctx2d.restore();
    }

    /* ---- Apparatus 2: Copper-Wound Electromagnet Cargo Crane ---- */
    function drawElectromagnetBox(x, y, w, h, craneVolt, targetVolt) {
      ctx2d.save();
      ctx2d.fillStyle = 'rgba(22, 14, 9, 0.82)';
      ctx2d.strokeStyle = '#9b7432';
      ctx2d.lineWidth = 2.5;
      ctx2d.beginPath();
      ctx2d.roundRect(x, y, w, h, 14);
      ctx2d.fill();
      ctx2d.stroke();

      drawScrew(x + 11, y + 11, 4);
      drawScrew(x + w - 11, y + 11, 4);

      ctx2d.fillStyle = '#f3dfc1';
      ctx2d.font = '700 12px Fredoka, Heebo, sans-serif';
      ctx2d.textAlign = 'center';
      ctx2d.fillText(t.craneTitle, x + w * 0.5, y + 18);

      const cx = x + w * 0.45;
      const coilY = y + 36;
      const floorY = y + h - 14;

      let targetLift = 0;
      if (craneVolt >= targetVolt && craneVolt > 0) {
        targetLift = craneVolt === targetVolt ? 1 : 0.75;
        craneShake = 0;
      } else if (craneVolt > 0) {
        targetLift = 0.14;
        craneShake = Math.sin(timeTick * 0.85) * 3.2;
      } else {
        targetLift = 0;
        craneShake = 0;
      }
      craneVel = (craneVel + (targetLift - craneLift) * 0.12) * 0.78;
      craneLift = Math.max(0, Math.min(1.08, craneLift + craneVel));

      ctx2d.fillStyle = '#52525b';
      ctx2d.strokeStyle = '#a1a1aa';
      ctx2d.lineWidth = 1.4;
      ctx2d.beginPath();
      ctx2d.roundRect(x + 18, y + 24, w - 36, 8, 4);
      ctx2d.fill();
      ctx2d.stroke();

      const coreW = 50;
      const coreH = 24;
      ctx2d.fillStyle = '#3f3f46';
      ctx2d.strokeStyle = '#d4a959';
      ctx2d.lineWidth = 2;
      ctx2d.beginPath();
      ctx2d.roundRect(cx - coreW / 2, coilY, coreW, coreH, 5);
      ctx2d.fill();
      ctx2d.stroke();

      for (let i = 0; i < 7; i++) {
        const wx = cx - coreW / 2 + 6 + i * 6.4;
        ctx2d.strokeStyle = craneVolt > 0 ? '#f59e0b' : '#b45309';
        ctx2d.lineWidth = 3.5;
        ctx2d.beginPath();
        ctx2d.moveTo(wx, coilY + 3);
        ctx2d.lineTo(wx, coilY + coreH - 3);
        ctx2d.stroke();
      }

      if (craneVolt > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(timeTick * 0.18);
        ctx2d.strokeStyle = `rgba(96, 165, 250, ${0.35 + pulse * 0.35})`;
        ctx2d.lineWidth = 1.6;
        ctx2d.setLineDash([4, 4]);
        ctx2d.beginPath();
        ctx2d.arc(cx - 18, coilY + coreH + 5, 11 + pulse * 3, 0, Math.PI);
        ctx2d.arc(cx + 18, coilY + coreH + 5, 11 + pulse * 3, 0, Math.PI);
        ctx2d.stroke();
        ctx2d.setLineDash([]);
      }

      const dockY = coilY + coreH + 6;
      const cargoH = Math.min(28, (floorY - dockY) * 0.45);
      ctx2d.strokeStyle = '#4ade80';
      ctx2d.lineWidth = 2;
      ctx2d.setLineDash([5, 4]);
      ctx2d.beginPath();
      ctx2d.roundRect(cx - 28, dockY, 56, cargoH, 6);
      ctx2d.stroke();
      ctx2d.setLineDash([]);
      ctx2d.fillStyle = '#4ade80';
      ctx2d.font = '700 10px Fredoka, Heebo, sans-serif';
      ctx2d.textAlign = 'left';
      ctx2d.fillText(`◀ ${t.targetTag} (${targetVolt}V)`, cx + 33, dockY + cargoH * 0.65);

      const restCargoY = Math.max(dockY + 12, floorY - cargoH);
      const curCargoY = restCargoY - (restCargoY - dockY) * craneLift;
      const cargoX = cx + craneShake;

      ctx2d.fillStyle = '#334155';
      ctx2d.strokeStyle = craneLift > 0.9 ? '#4ade80' : '#94a3b8';
      ctx2d.lineWidth = 2.2;
      ctx2d.beginPath();
      ctx2d.roundRect(cargoX - 26, curCargoY, 52, cargoH, 5);
      ctx2d.fill();
      ctx2d.stroke();

      ctx2d.fillStyle = '#f8fafc';
      ctx2d.font = '700 11px Fredoka, Heebo, sans-serif';
      ctx2d.textAlign = 'center';
      ctx2d.fillText(`⚓ ${targetVolt}V`, cargoX, curCargoY + cargoH * 0.68);

      ctx2d.restore();
    }

    /* ---- Apparatus 3: Brushed-Brass Wind Motor & Glass Water Trough Sailboat ---- */
    function drawBoatTankBox(x, y, w, h, boatVolt, targetVolt, targetPol) {
      ctx2d.save();
      ctx2d.fillStyle = 'rgba(22, 14, 9, 0.82)';
      ctx2d.strokeStyle = '#9b7432';
      ctx2d.lineWidth = 2.5;
      ctx2d.beginPath();
      ctx2d.roundRect(x, y, w, h, 14);
      ctx2d.fill();
      ctx2d.stroke();

      ctx2d.fillStyle = '#f3dfc1';
      ctx2d.font = '700 12px Fredoka, Heebo, sans-serif';
      ctx2d.textAlign = 'center';
      ctx2d.fillText(t.boatTitle, x + w * 0.5, y + 18);

      const fanCx = x + 32;
      const fanCy = y + h * 0.55;
      const fanR = Math.min(22, h * 0.22);

      const targetFanSpeed = (boatVolt / 9) * 0.42;
      fanSpeed += (targetFanSpeed - fanSpeed) * 0.1;
      fanAngle += fanSpeed;

      ctx2d.save();
      ctx2d.translate(fanCx, fanCy);
      ctx2d.rotate(fanAngle);
      for (let i = 0; i < 4; i++) {
        ctx2d.rotate(Math.PI / 2);
        const bg = ctx2d.createLinearGradient(0, -4, fanR, 4);
        bg.addColorStop(0, '#fde68a');
        bg.addColorStop(1, '#b45309');
        ctx2d.fillStyle = bg;
        ctx2d.beginPath();
        ctx2d.ellipse(fanR * 0.55, 0, fanR * 0.48, 5, 0.22, 0, Math.PI * 2);
        ctx2d.fill();
      }
      ctx2d.restore();

      ctx2d.strokeStyle = '#d4a959';
      ctx2d.lineWidth = 2;
      ctx2d.beginPath();
      ctx2d.arc(fanCx, fanCy, fanR + 3, 0, Math.PI * 2);
      ctx2d.stroke();
      ctx2d.fillStyle = '#78350f';
      ctx2d.beginPath();
      ctx2d.arc(fanCx, fanCy, 6, 0, Math.PI * 2);
      ctx2d.fill();

      const tankX = fanCx + fanR + 10;
      const tankW = Math.max(80, x + w - tankX - 12);
      const tankY = y + 26;
      const tankH = h - 36;
      const waterBaseY = tankY + tankH * 0.62;

      if (Math.abs(fanSpeed) > 0.01) {
        const waveIdx = Math.floor(Math.random() * WN);
        waterV[waveIdx] += (Math.random() - 0.5) * Math.abs(fanSpeed) * 4.5;
      }
      for (let i = 0; i < WN; i++) {
        const l = i > 0 ? waterH[i - 1] : waterH[i];
        const r = i < WN - 1 ? waterH[i + 1] : waterH[i];
        waterV[i] += ((l + r) * 0.5 - waterH[i]) * 0.18 - waterH[i] * 0.04;
        waterV[i] *= 0.92;
      }
      for (let i = 0; i < WN; i++) waterH[i] += waterV[i];

      const targetBoat = boatVolt;
      boatVel = (boatVel + (targetBoat - boatPos) * 0.065) * 0.82;
      boatPos += boatVel;
      const targetBillow = Math.max(-1, Math.min(1, boatVolt / 6));
      sailBillow += (targetBillow - sailBillow) * 0.12;

      const hasNeg = round.hasPolarity;
      const minScale = hasNeg ? -10.5 : -1.5;
      const maxScale = 10.5;
      const posToX = (val) => tankX + ((val - minScale) / (maxScale - minScale)) * tankW;

      const stops = hasNeg ? [-9, -6, -3, 3, 6, 9] : [3, 6, 9];
      const goalVal = targetVolt * (round.hasPolarity ? targetPol : 1);

      stops.forEach((st) => {
        const bx = posToX(st);
        const isGoal = st === goalVal && round.machines.includes('boat');
        ctx2d.strokeStyle = isGoal ? '#4ade80' : 'rgba(212, 169, 89, 0.35)';
        ctx2d.lineWidth = isGoal ? 2.2 : 1.2;
        ctx2d.beginPath();
        ctx2d.moveTo(bx, tankY + 6);
        ctx2d.lineTo(bx, tankY + tankH - 4);
        ctx2d.stroke();

        ctx2d.fillStyle = isGoal ? '#4ade80' : '#d6c5ad';
        ctx2d.font = `${isGoal ? '700' : '600'} 9.5px Fredoka, sans-serif`;
        ctx2d.textAlign = 'center';
        ctx2d.fillText(`${st > 0 ? '+' : ''}${st}V`, bx, tankY + tankH - 5);

        if (isGoal) {
          bellVel = (bellVel - bellSwing * 0.18) * 0.9;
          bellSwing += bellVel;
          ctx2d.save();
          ctx2d.translate(bx, tankY + 13);
          ctx2d.rotate(bellSwing);
          ctx2d.fillStyle = '#ffd23f';
          ctx2d.strokeStyle = '#92400e';
          ctx2d.lineWidth = 1.4;
          ctx2d.beginPath();
          ctx2d.arc(0, 0, 6, Math.PI, 0);
          ctx2d.lineTo(8, 6);
          ctx2d.lineTo(-8, 6);
          ctx2d.closePath();
          ctx2d.fill();
          ctx2d.stroke();
          ctx2d.restore();
        }
      });

      /* Aerodynamic Wind Streamlines when motor fan spins */
      if (Math.abs(fanSpeed) > 0.02) {
        ctx2d.strokeStyle = 'rgba(186, 230, 253, 0.32)';
        ctx2d.lineWidth = 1.6;
        ctx2d.setLineDash([8, 12]);
        ctx2d.lineDashOffset = -timeTick * (boatVolt > 0 ? 1.8 : -1.8);
        for (let row = 0; row < 2; row++) {
          const wy = tankY + tankH * (0.28 + row * 0.2);
          ctx2d.beginPath();
          ctx2d.moveTo(tankX + 6, wy);
          ctx2d.lineTo(tankX + tankW - 6, wy);
          ctx2d.stroke();
        }
        ctx2d.setLineDash([]);
      }

      const clampedBoat = Math.max(minScale + 1, Math.min(maxScale - 1, boatPos));
      const boatX = posToX(clampedBoat);
      const boatWaveIdx = Math.max(0, Math.min(WN - 1, Math.floor(((boatX - tankX) / tankW) * WN)));
      const boatY = waterBaseY + waterH[boatWaveIdx] - 2;
      const boatTilt = boatVel * 0.18;

      ctx2d.save();
      ctx2d.translate(boatX, boatY);
      ctx2d.rotate(boatTilt);

      const hg = ctx2d.createLinearGradient(-18, -5, 18, 7);
      hg.addColorStop(0, '#d97706');
      hg.addColorStop(1, '#78350f');
      ctx2d.fillStyle = hg;
      ctx2d.strokeStyle = '#fde68a';
      ctx2d.lineWidth = 1.4;
      ctx2d.beginPath();
      ctx2d.moveTo(-18, -3);
      ctx2d.lineTo(18, -3);
      ctx2d.lineTo(12, 6);
      ctx2d.lineTo(-12, 6);
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.stroke();

      const mastH = Math.min(28, tankH * 0.36);
      ctx2d.strokeStyle = '#e5bd6d';
      ctx2d.lineWidth = 2.2;
      ctx2d.beginPath();
      ctx2d.moveTo(0, -3);
      ctx2d.lineTo(0, -mastH);
      ctx2d.stroke();

      const curveX = sailBillow * 14 || 4;
      ctx2d.fillStyle = '#fffbeb';
      ctx2d.strokeStyle = '#d97706';
      ctx2d.lineWidth = 1.4;
      ctx2d.beginPath();
      ctx2d.moveTo(0, -mastH + 2);
      ctx2d.quadraticCurveTo(curveX, -mastH * 0.52, 0, -5);
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.stroke();
      ctx2d.restore();

      const wg = ctx2d.createLinearGradient(0, waterBaseY - 6, 0, tankY + tankH);
      wg.addColorStop(0, 'rgba(56, 189, 248, 0.52)');
      wg.addColorStop(1, 'rgba(12, 74, 110, 0.78)');
      ctx2d.fillStyle = wg;
      ctx2d.beginPath();
      ctx2d.moveTo(tankX, tankY + tankH);
      for (let i = 0; i < WN; i++) {
        const wx = tankX + (i / (WN - 1)) * tankW;
        const wy = waterBaseY + waterH[i];
        ctx2d.lineTo(wx, wy);
      }
      ctx2d.lineTo(tankX + tankW, tankY + tankH);
      ctx2d.closePath();
      ctx2d.fill();

      ctx2d.strokeStyle = '#bae6fd';
      ctx2d.lineWidth = 1.8;
      ctx2d.beginPath();
      for (let i = 0; i < WN; i++) {
        const wx = tankX + (i / (WN - 1)) * tankW;
        const wy = waterBaseY + waterH[i];
        if (i === 0) ctx2d.moveTo(wx, wy); else ctx2d.lineTo(wx, wy);
      }
      ctx2d.stroke();

      ctx2d.strokeStyle = 'rgba(224, 242, 254, 0.55)';
      ctx2d.lineWidth = 2;
      ctx2d.beginPath();
      ctx2d.roundRect(tankX, tankY, tankW, tankH, 8);
      ctx2d.stroke();

      ctx2d.restore();
    }

    /* ---- Main 60fps Canvas Render Loop ---- */
    function tick() {
      timeTick++;
      const state = evaluateCircuit();
      electronPhase = (electronPhase + (state.busVolt * 0.35)) % 220;

      const meterTarget = state.busLive ? supplyVolt : 0;
      meterVel = (meterVel + (meterTarget - meterVolt) * 0.16) * 0.76;
      meterVolt += meterVel;

      if (state.goalMet && !locked) {
        stability = Math.min(1, stability + 0.019);
        if (stability >= 1) {
          completeRound();
        }
      } else {
        stability = Math.max(0, stability - 0.04);
      }

      const {
        phone, compact, consoleX, consoleY, consoleW, consoleH,
        midX, midW, rightX, rightY, rightW, rightH,
        postPos, postNeg, termPos, termNeg,
        dialCx, dialCy, dialR, polCx, polCy,
        swCenterX, topBusY, botBusY,
      } = layout;

      stepVerletCable(wirePos, phone ? 46 : 72);
      stepVerletCable(wireNeg, phone ? 46 : 72);
      if (!wirePos.connected) positionWireHit(wirePos, hitWirePos);
      if (!wireNeg.connected) positionWireHit(wireNeg, hitWireNeg);

      ctx2d.save();
      ctx2d.scale(dpr, dpr);

      /* 1. Realistic Walnut Workbench Planks */
      const woodGrad = ctx2d.createLinearGradient(0, 0, 0, H);
      woodGrad.addColorStop(0, '#2a1a10');
      woodGrad.addColorStop(0.5, '#332014');
      woodGrad.addColorStop(1, '#1e120b');
      ctx2d.fillStyle = woodGrad;
      ctx2d.fillRect(0, 0, W, H);

      const plankCount = 5;
      for (let i = 1; i < plankCount; i++) {
        const py = (H / plankCount) * i;
        ctx2d.strokeStyle = 'rgba(10, 5, 2, 0.65)';
        ctx2d.lineWidth = 2;
        ctx2d.beginPath();
        ctx2d.moveTo(0, py);
        ctx2d.lineTo(W, py);
        ctx2d.stroke();
      }

      if (filamentTemp > 0.04) {
        const amb = ctx2d.createRadialGradient(W * 0.7, H * 0.4, 20, W * 0.6, H * 0.5, W * 0.75);
        amb.addColorStop(0, `rgba(255, 195, 85, ${0.22 * filamentTemp})`);
        amb.addColorStop(1, 'rgba(255, 160, 50, 0)');
        ctx2d.fillStyle = amb;
        ctx2d.fillRect(0, 0, W, H);
      }

      /* 2. Power Supply & Voltmeter Console */
      ctx2d.fillStyle = 'rgba(0,0,0,0.45)';
      ctx2d.beginPath();
      ctx2d.roundRect(consoleX + 3, consoleY + 5, consoleW, consoleH, 14);
      ctx2d.fill();

      const cg = ctx2d.createLinearGradient(consoleX, consoleY, consoleX + consoleW, consoleY + consoleH);
      cg.addColorStop(0, '#322923');
      cg.addColorStop(1, '#1c1613');
      ctx2d.fillStyle = cg;
      ctx2d.strokeStyle = '#c89b4b';
      ctx2d.lineWidth = 2.6;
      ctx2d.beginPath();
      ctx2d.roundRect(consoleX, consoleY, consoleW, consoleH, 14);
      ctx2d.fill();
      ctx2d.stroke();

      drawScrew(consoleX + 10, consoleY + 10, 4);
      drawScrew(consoleX + consoleW - 10, consoleY + 10, 4);
      drawScrew(consoleX + 10, consoleY + consoleH - 10, 4);
      drawScrew(consoleX + consoleW - 10, consoleY + consoleH - 10, 4);

      ctx2d.fillStyle = '#e5bd6d';
      ctx2d.font = `700 ${phone ? 10 : compact ? 11 : 12}px Fredoka, Heebo, sans-serif`;
      ctx2d.textAlign = 'center';
      ctx2d.fillText(t.powerUnit, consoleX + consoleW * 0.5, consoleY + (phone ? 17 : 22));

      /* Curved-Glass Analog Voltmeter */
      const vmX = consoleX + (phone ? 10 : 14);
      const vmY = consoleY + (phone ? 23 : 32);
      const vmW = consoleW - (phone ? 20 : 28);
      const vmH = phone ? 54 : Math.min(104, consoleH * 0.27);
      ctx2d.fillStyle = '#fdf6e2';
      ctx2d.strokeStyle = '#9b7432';
      ctx2d.lineWidth = 2.5;
      ctx2d.beginPath();
      ctx2d.roundRect(vmX, vmY, vmW, vmH, 8);
      ctx2d.fill();
      ctx2d.stroke();

      const pivotX = vmX + vmW * 0.5;
      const pivotY = vmY + vmH - (phone ? 8 : 13);
      const arcR = Math.min(vmW * 0.38, vmH * 0.72);

      /* Printed scale arc */
      ctx2d.strokeStyle = 'rgba(120, 85, 32, 0.35)';
      ctx2d.lineWidth = 1.5;
      ctx2d.beginPath();
      ctx2d.arc(pivotX, pivotY, arcR, Math.PI, 0);
      ctx2d.stroke();

      [0, 3, 6, 9, 12].forEach((v) => {
        const a = Math.PI + (v / 12) * Math.PI;
        const tx1 = pivotX + Math.cos(a) * (arcR - 4);
        const ty1 = pivotY + Math.sin(a) * (arcR - 4);
        const tx2 = pivotX + Math.cos(a) * (arcR + 3);
        const ty2 = pivotY + Math.sin(a) * (arcR + 3);
        const isTarget = v === round.targetVolt;
        ctx2d.strokeStyle = isTarget ? '#16a34a' : '#574327';
        ctx2d.lineWidth = isTarget ? 2.6 : 1.4;
        ctx2d.beginPath();
        ctx2d.moveTo(tx1, ty1);
        ctx2d.lineTo(tx2, ty2);
        ctx2d.stroke();

        const lx = pivotX + Math.cos(a) * (arcR - (phone ? 11 : 14));
        const ly = pivotY + Math.sin(a) * (arcR - (phone ? 11 : 14));
        ctx2d.fillStyle = isTarget ? '#15803d' : '#433018';
        ctx2d.font = `700 ${phone ? 8.5 : 10.5}px Fredoka, sans-serif`;
        ctx2d.textAlign = 'center';
        ctx2d.fillText(`${v}`, lx, ly + 3);
      });

      const needleAng = Math.PI + (Math.max(0, Math.min(12, meterVolt)) / 12) * Math.PI;
      ctx2d.strokeStyle = '#d93829';
      ctx2d.lineWidth = 2.4;
      ctx2d.lineCap = 'round';
      ctx2d.beginPath();
      ctx2d.moveTo(pivotX, pivotY);
      ctx2d.lineTo(pivotX + Math.cos(needleAng) * (arcR - 2), pivotY + Math.sin(needleAng) * (arcR - 2));
      ctx2d.stroke();

      ctx2d.fillStyle = '#785520';
      ctx2d.beginPath();
      ctx2d.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
      ctx2d.fill();

      /* Bakelite Rotary Voltage Regulator Dial */
      const targetDialAng = supplyVolt === 3 ? -0.75 : supplyVolt === 6 ? 0 : 0.75;
      dialAngle += (targetDialAng - dialAngle) * 0.22;

      ctx2d.fillStyle = '#e5bd6d';
      ctx2d.font = `700 ${phone ? 9.5 : 11}px Fredoka, Heebo, sans-serif`;
      ctx2d.textAlign = 'center';
      ctx2d.fillText(`${t.rheostat}: ${supplyVolt}V`, dialCx, dialCy - dialR - (phone ? 5 : 8));

      ctx2d.save();
      ctx2d.translate(dialCx, dialCy);
      ctx2d.rotate(dialAngle);
      const dg = ctx2d.createRadialGradient(-4, -4, 2, 0, 0, dialR);
      dg.addColorStop(0, '#3f3731');
      dg.addColorStop(0.75, '#1c1815');
      dg.addColorStop(1, '#0c0a09');
      ctx2d.fillStyle = dg;
      ctx2d.strokeStyle = '#d4a959';
      ctx2d.lineWidth = 2.4;
      ctx2d.beginPath();
      ctx2d.arc(0, 0, dialR, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.stroke();

      ctx2d.strokeStyle = '#ffd23f';
      ctx2d.lineWidth = 3;
      ctx2d.lineCap = 'round';
      ctx2d.beginPath();
      ctx2d.moveTo(0, 3);
      ctx2d.lineTo(0, -dialR + 5);
      ctx2d.stroke();
      ctx2d.restore();

      /* Commutator Polarity Reverser Switch (+ / -) */
      if (round.hasPolarity) {
        const pw = phone ? 104 : compact ? 120 : 146;
        const ph = phone ? 22 : 30;
        ctx2d.fillStyle = '#14110f';
        ctx2d.strokeStyle = polarity === round.targetPolarity ? '#c89b4b' : '#ffd23f';
        ctx2d.lineWidth = 1.8;
        ctx2d.beginPath();
        ctx2d.roundRect(polCx - pw / 2, polCy - ph / 2, pw, ph, 8);
        ctx2d.fill();
        ctx2d.stroke();

        ctx2d.fillStyle = polarity > 0 ? '#2563eb' : '#d97706';
        ctx2d.beginPath();
        ctx2d.roundRect(polCx - pw / 2 + 3, polCy - ph / 2 + 3, pw - 6, ph - 6, 6);
        ctx2d.fill();

        ctx2d.fillStyle = '#fff';
        ctx2d.font = `700 ${phone ? 10 : 12}px Fredoka, Heebo, sans-serif`;
        ctx2d.textAlign = 'center';
        ctx2d.fillText(polarity > 0 ? t.polEast : t.polWest, polCx, polCy + (phone ? 3.5 : 4.5));
      }

      drawBindingPost(postPos.x, postPos.y, '#c93326', '+', true, Math.PI * 2, phone);
      drawBindingPost(postNeg.x, postNeg.y, '#1f242d', '−', true, Math.PI * 2, phone);

      /* 3. Circuit Bus Bars & Porcelain Knife Switches */
      const busEndX = phone ? (midX + midW - 10) : (rightX + 8);

      ctx2d.strokeStyle = wireNeg.connected ? '#78716c' : '#44403c';
      ctx2d.lineWidth = phone ? 4.5 : 6;
      ctx2d.lineCap = 'round';
      ctx2d.beginPath();
      ctx2d.moveTo(termNeg.x, botBusY);
      ctx2d.lineTo(busEndX, botBusY);
      if (phone) {
        ctx2d.lineTo(busEndX, rightY + 6);
      }
      ctx2d.stroke();

      ctx2d.strokeStyle = state.busLive ? '#f59e0b' : '#9a7b4f';
      ctx2d.lineWidth = phone ? 4.5 : 6;
      if (round.topology === 'parallel') {
        const splitX1 = midX + (phone ? 26 : 34);
        const splitX2 = midX + midW - 12;
        const branchBY = topBusY + (phone ? 54 : 58);
        ctx2d.beginPath();
        ctx2d.moveTo(termPos.x, topBusY);
        ctx2d.lineTo(swCenterX - 15, topBusY);
        ctx2d.moveTo(swCenterX + 15, topBusY);
        ctx2d.lineTo(busEndX, topBusY);
        ctx2d.moveTo(splitX1, topBusY);
        ctx2d.lineTo(splitX1, branchBY);
        ctx2d.lineTo(splitX2, branchBY);
        ctx2d.lineTo(splitX2, topBusY);
        ctx2d.stroke();

        ctx2d.strokeStyle = '#ef4444';
        ctx2d.lineWidth = 2;
        ctx2d.beginPath();
        ctx2d.arc(swCenterX, topBusY, 10, 0, Math.PI * 2);
        ctx2d.stroke();
        ctx2d.fillStyle = '#fca5a5';
        ctx2d.font = '700 9.5px Fredoka, sans-serif';
        ctx2d.textAlign = 'center';
        ctx2d.fillText('✕', swCenterX, topBusY + 3.5);

        drawKnifeSwitch(swCenterX, branchBY, sw2, 'SW2', phone || compact);
      } else if (round.topology === 'series' && phone) {
        /* On phone, stack SW1 and SW2 vertically along a series serpentine bus so they never collide! */
        const sw2Y = topBusY + 62;
        ctx2d.beginPath();
        ctx2d.moveTo(termPos.x, topBusY);
        ctx2d.lineTo(busEndX, topBusY);
        ctx2d.lineTo(busEndX, sw2Y);
        ctx2d.lineTo(termPos.x + 14, sw2Y);
        ctx2d.lineTo(termPos.x + 14, rightY + 6);
        ctx2d.stroke();

        drawKnifeSwitch(swCenterX, topBusY, sw1, 'SW1', true);
        drawKnifeSwitch(swCenterX, sw2Y, sw2, 'SW2', true);
      } else {
        ctx2d.beginPath();
        ctx2d.moveTo(termPos.x, topBusY);
        ctx2d.lineTo(busEndX, topBusY);
        if (phone) {
          ctx2d.lineTo(busEndX, rightY + 6);
        }
        ctx2d.stroke();

        if (round.topology === 'series') {
          drawKnifeSwitch(midX + midW * 0.34, topBusY, sw1, 'SW1', compact);
          drawKnifeSwitch(midX + midW * 0.74, topBusY, sw2, 'SW2', compact);
        } else {
          drawKnifeSwitch(swCenterX, topBusY, sw1, 'SW1', phone || compact);
        }
      }

      if (round.topology === 'diverter') {
        const dy = topBusY + (phone ? 58 : 74);
        ctx2d.fillStyle = '#f5eedc';
        ctx2d.strokeStyle = diverter === round.targetDiverter ? '#16a34a' : '#c89b4b';
        ctx2d.lineWidth = 2.2;
        ctx2d.beginPath();
        ctx2d.roundRect(swCenterX - 38, dy - 15, 76, 30, 8);
        ctx2d.fill();
        ctx2d.stroke();

        ctx2d.fillStyle = '#291d12';
        ctx2d.font = '700 11.5px Fredoka, Heebo, sans-serif';
        ctx2d.textAlign = 'center';
        ctx2d.fillText(`🔀 ${diverter}`, swCenterX, dy + 4.5);
      }

      drawBindingPost(termPos.x, termPos.y, '#c93326', '+', wirePos.connected, wirePos.nutAngle, phone);
      drawBindingPost(termNeg.x, termNeg.y, '#1f242d', '−', wireNeg.connected, wireNeg.nutAngle, phone);

      /* 4. Apparatus Deck (1 or 2 Physical Machines) */
      const hasTwo = round.machines.length === 2;
      if (!hasTwo) {
        const m = round.machines[0];
        if (m === 'lamp') {
          drawEdisonLampBox(rightX, rightY, rightW, rightH, state.lampVolt, round.targetVolt);
        } else if (m === 'crane') {
          drawElectromagnetBox(rightX, rightY, rightW, rightH, state.craneVolt, round.targetVolt);
        } else {
          drawBoatTankBox(rightX, rightY, rightW, rightH, state.boatVolt, round.targetVolt, round.targetPolarity);
        }
      } else {
        const gap = phone ? 8 : 12;
        const topH = (rightH - gap) * 0.48;
        const botY = rightY + topH + gap;
        const botH = rightH - topH - gap;
        if (round.machines[0] === 'lamp') {
          drawEdisonLampBox(rightX, rightY, rightW, topH, state.lampVolt, round.targetVolt);
        } else {
          drawElectromagnetBox(rightX, rightY, rightW, topH, state.craneVolt, round.targetVolt);
        }
        if (round.machines[1] === 'crane') {
          drawElectromagnetBox(rightX, botY, rightW, botH, state.craneVolt, round.targetVolt);
        } else {
          drawBoatTankBox(rightX, botY, rightW, botH, state.boatVolt, round.targetVolt, round.targetPolarity);
        }
      }

      /* 5. Foreground Verlet Braided Cloth Cables */
      drawVerletCable(wirePos, state.busVolt, phone);
      drawVerletCable(wireNeg, state.busVolt, phone);

      /* 6. Brass Stability Jewel Indicator when Goal is Met */
      if (stability > 0.02) {
        const jx = midX + midW * 0.5;
        const jy = phone ? (consoleY + consoleH - 18) : (consoleY + consoleH - 26);
        ctx2d.fillStyle = 'rgba(20, 83, 45, 0.9)';
        ctx2d.strokeStyle = '#4ade80';
        ctx2d.lineWidth = 2.2;
        ctx2d.beginPath();
        ctx2d.arc(jx, jy, 13, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.stroke();

        ctx2d.strokeStyle = '#fde047';
        ctx2d.lineWidth = 3;
        ctx2d.beginPath();
        ctx2d.arc(jx, jy, 13, -Math.PI / 2, -Math.PI / 2 + stability * Math.PI * 2);
        ctx2d.stroke();
      }

      /* 7. Contact Sparks */
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.16;
        s.life -= 0.045;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx2d.globalAlpha = s.life;
        ctx2d.fillStyle = s.col;
        ctx2d.beginPath();
        ctx2d.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx2d.fill();
      }
      ctx2d.globalAlpha = 1;

      ctx2d.restore();
      rafId = requestAnimationFrame(tick);
    }

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(box);
    loadRound(0);
    rafId = requestAnimationFrame(tick);

    cleanupFn = () => {
      stopDrag();
      pointerEvents.abort();
      cancelAnimationFrame(rafId);
      ro.disconnect();
      tm.clear();
    };
  }

  function unmount() {
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
  }

  EDGames.register('circuit-lab', { sets: SETS, mount, unmount });
})();
