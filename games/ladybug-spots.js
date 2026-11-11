/* נקודות החיפושית / Ladybug Spots — doubles, subitizing and wing sums (ages 3–5).

   A big red ladybug sits on a green leaf, her shell split down the middle into
   two wings. Because each wing holds at most five spots in a dice pattern, a
   small child can read each wing at a glance and see how two parts make a whole.

   In the first set the left wing already carries 1 to 4 spots and the child puts
   the same number on the right wing to discover doubles (1+1, 2+2, 3+3, 4+4).
   In the second set both wings have spots — tapping any spot lights it and
   counts aloud — and the child picks the total. In the third set a golden leaf
   badge asks for a target total, and the child adds the missing spots onto the
   right wing until the ladybug has that many altogether.

   Sets: twin wings (doubles), both wings together (addition), complete the spots
   (missing addend). */

(function () {
  const SETS = [
    { id: 'wings', emoji: '🐞', label: { he: 'כנפיים תאומות', en: 'Twin wings' }, mode: 'wings' },
    { id: 'count', emoji: '🔢', label: { he: 'שתי הכנפיים ביחד', en: 'Both wings together' }, mode: 'count' },
    { id: 'make', emoji: '✨', label: { he: 'משלימים נקודות', en: 'Complete the spots' }, mode: 'make' },
  ];

  const TEXT = {
    he: {
      wings: (n) => `שימו ${n} נקודות גם על הכנף השנייה`,
      count: 'כמה נקודות יש לחיפושית ביחד?',
      make: (t) => `הוסיפו נקודות עד שלחיפושית יהיו ${t} נקודות`,
      hintAdd: 'לוחצים על הכנף הימנית או גוררים נקודה כדי להוסיף',
      hintCount: 'אפשר ללחוץ על הנקודות כדי לספור אותן בקול',
      addSpot: '+ נקודה',
      removeSpot: '− נקודה',
    },
    en: {
      wings: (n) => `Put ${n} ${n === 1 ? 'spot' : 'spots'} on the other wing too`,
      count: 'How many spots does the ladybug have altogether?',
      make: (t) => `Add spots until the ladybug has ${t} spots altogether`,
      hintAdd: 'Tap the right wing or drag a spot onto it',
      hintCount: 'Tap the spots to count them out loud',
      addSpot: '+ Spot',
      removeSpot: '− Spot',
    },
  };

  /* Dice-like spot positions inside a wing, as [cx, cy] in the 320x270 SVG. */
  const LEFT_SPOTS = {
    1: [[112, 152]],
    2: [[116, 118], [108, 184]],
    3: [[120, 108], [112, 152], [104, 194]],
    4: [[128, 114], [96, 124], [126, 182], [96, 190]],
    5: [[130, 106], [94, 114], [114, 150], [130, 190], [96, 196]],
  };
  const RIGHT_SPOTS = {
    1: [[208, 152]],
    2: [[204, 118], [212, 184]],
    3: [[200, 108], [208, 152], [216, 194]],
    4: [[192, 114], [224, 124], [194, 182], [224, 190]],
    5: [[190, 106], [226, 114], [206, 150], [190, 190], [224, 196]],
  };

  const ROUNDS = 5;
  const PENTA = [262, 294, 330, 392, 440, 523, 587, 659];

  const CSS = `
    .lb { gap: 10px; }
    .lb-stage { position: relative; width: min(100%, 460px); height: 268px; border-radius: 26px; overflow: hidden;
      background: radial-gradient(circle at 50% 45%, #a8eb7d 0%, #58b947 72%, #3d9130 100%);
      border: 3px solid #fff; box-shadow: 0 6px 0 var(--edge); display: grid; place-items: center; direction: ltr; }
    .lb-goal { position: absolute; top: 10px; right: 14px; background: #ffd23f; color: #4a3000;
      border: 3px solid #fff; border-radius: 18px; padding: 4px 14px; font: 700 1.45rem/1.1 Fredoka, sans-serif;
      box-shadow: 0 4px 0 rgba(0,0,0,.18); z-index: 3; }
    .lb-wing-badges { position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 86px; pointer-events: none; z-index: 3; }
    .lb-wbadge { min-width: 34px; height: 34px; padding: 0 9px; border-radius: 17px; background: rgba(255,255,255,.9);
      color: #1e2a44; font: 700 1.2rem/34px Fredoka, sans-serif; text-align: center; box-shadow: 0 3px 0 rgba(0,0,0,.18); }
    .lb-svg { width: min(100%, 320px); height: 256px; display: block; overflow: visible; }
    .lb-stage.flutter .lb-svg { animation: lb-fly .7s ease-in-out; }
    @keyframes lb-fly { 30% { transform: translateY(-10px) scale(1.05); } 65% { transform: translateY(-4px) scale(1.02); } }
    .lb-wing-r.interactive { cursor: pointer; }
    .lb-wing-r.need-glow { stroke: #ffd23f; stroke-width: 5; stroke-dasharray: 9 6; }
    .lb-spot { cursor: pointer; transition: transform .15s, fill .15s; transform-box: fill-box; transform-origin: center; }
    .lb-spot.pop { animation: kit-pop .32s ease; }
    .lb-spot.lit { fill: #ffd23f; stroke: #fff; stroke-width: 3; transform: scale(1.22); }
    .lb-eq { min-height: 2.1rem; font: 700 1.7rem/1.2 Fredoka, sans-serif; color: var(--sub-ink); direction: ltr; text-align: center; }
    .lb-controls { display: flex; gap: 12px; justify-content: center; align-items: center; flex-wrap: wrap; min-height: 70px; }
    .lb-dot-btn { border: 2px solid var(--border); background: var(--surface); border-radius: 20px; padding: 10px 20px; min-height: 62px;
      cursor: pointer; box-shadow: 0 5px 0 var(--edge); display: flex; align-items: center; gap: 10px;
      font: 700 1.3rem/1 Fredoka, Heebo, sans-serif; color: var(--text); }
    .lb-dot-btn:active { transform: translateY(3px); box-shadow: 0 2px 0 var(--edge); }
    .lb-dot-circle { width: 28px; height: 28px; border-radius: 50%; background: #1e2a44; display: inline-block; box-shadow: inset -3px -3px 0 rgba(255,255,255,.22); }
    .lb-controls .kit-opt { min-width: 72px; min-height: 72px; font-size: 2.2rem; }
  `;

  const clock = EDKit.timers();
  const between = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('lb-style', CSS);

    let round = 0;
    let lastKey = '';
    const wrap = document.createElement('div');
    wrap.className = 'kit lb';
    root.append(wrap);

    function makeProblem() {
      for (;;) {
        let p;
        if (set.mode === 'wings') {
          const left = between(1, 4);
          p = { left, right: 0, targetRight: left, total: left * 2 };
        } else if (set.mode === 'count') {
          const left = between(1, 4);
          const right = between(1, 4);
          p = { left, right, targetRight: right, total: left + right };
        } else {
          const left = between(1, 4);
          const targetRight = between(1, 4);
          p = { left, right: 0, targetRight, total: left + targetRight };
        }
        const key = `${set.mode}:${p.left}:${p.targetRight}`;
        if (key !== lastKey) {
          lastKey = key;
          return p;
        }
      }
    }

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const p = makeProblem();
      let rightCount = p.right;
      let busy = false;
      let tapCount = 0;

      const addingMode = set.mode === 'wings' || set.mode === 'make';
      const headLine = set.mode === 'wings'
        ? text.wings(p.left)
        : (set.mode === 'count' ? text.count : text.make(p.total));
      const voiceItems = set.mode === 'wings'
        ? 'spots-wings'
        : (set.mode === 'count' ? 'spots-count' : ['spots-make', EDVoiceLines.num(p.total)]);

      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(headLine, lang)}
        <div class="lb-stage">
          ${set.mode === 'make' ? `<div class="lb-goal" aria-hidden="true">🐞 ${p.total}</div>` : ''}
          <svg class="lb-svg" viewBox="0 0 320 270" aria-hidden="true"></svg>
          <div class="lb-wing-badges">
            <span class="lb-wbadge" data-badge-l>${p.left}</span>
            <span class="lb-wbadge" data-badge-r>${rightCount}</span>
          </div>
        </div>
        <div class="lb-eq" aria-live="polite"></div>
        <div class="lb-controls"></div>
        <p class="kit-hint" aria-live="polite">${addingMode ? text.hintAdd : text.hintCount}</p>`;

      const stage = wrap.querySelector('.lb-stage');
      const svg = wrap.querySelector('.lb-svg');
      const badgeR = wrap.querySelector('[data-badge-r]');
      const eqEl = wrap.querySelector('.lb-eq');
      const controls = wrap.querySelector('.lb-controls');

      EDKit.voice(wrap, voiceItems, lang);

      function renderBug() {
        const lSpots = LEFT_SPOTS[p.left] || [];
        const rSpots = RIGHT_SPOTS[rightCount] || [];
        const needGlow = addingMode && !busy && rightCount < p.targetRight;

        svg.innerHTML = `
          <!-- Leaf vein background -->
          <ellipse cx="160" cy="148" rx="138" ry="108" fill="#4aa73b" opacity=".45"/>
          <path d="M22 148 Q160 140 298 148" stroke="#7be068" stroke-width="4" fill="none" opacity=".55"/>
          <!-- Legs -->
          <g stroke="#1e2a44" stroke-width="6" stroke-linecap="round">
            <path d="M92 108 L58 92"/><path d="M84 150 L46 150"/><path d="M94 192 L60 210"/>
            <path d="M228 108 L262 92"/><path d="M236 150 L274 150"/><path d="M226 192 L260 210"/>
          </g>
          <!-- Antennae & Head -->
          <path d="M142 46 Q126 18 108 24" stroke="#1e2a44" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M178 46 Q194 18 212 24" stroke="#1e2a44" stroke-width="5" fill="none" stroke-linecap="round"/>
          <circle cx="108" cy="24" r="6" fill="#1e2a44"/><circle cx="212" cy="24" r="6" fill="#1e2a44"/>
          <ellipse cx="160" cy="64" rx="42" ry="30" fill="#1e2a44"/>
          <circle cx="143" cy="54" r="8" fill="#fff"/><circle cx="177" cy="54" r="8" fill="#fff"/>
          <circle cx="145" cy="54" r="4" fill="#1e2a44"/><circle cx="175" cy="54" r="4" fill="#1e2a44"/>
          <!-- Shadow -->
          <ellipse cx="160" cy="160" rx="88" ry="92" fill="rgba(0,0,0,.22)"/>
          <!-- Left Wing -->
          <path class="lb-wing-l" d="M158 70 C92 70 68 112 72 162 C75 208 112 238 158 238 Z"
            fill="#f03a47" stroke="#1e2a44" stroke-width="4"/>
          <ellipse cx="116" cy="96" rx="18" ry="9" fill="#fff" opacity=".28" transform="rotate(-25 116 96)"/>
          <!-- Right Wing -->
          <path class="lb-wing-r ${addingMode ? 'interactive' : ''} ${needGlow ? 'need-glow' : ''}" data-wing="r"
            d="M162 70 C228 70 252 112 248 162 C245 208 208 238 162 238 Z"
            fill="${addingMode && rightCount === 0 ? '#ff6b76' : '#f03a47'}" stroke="#1e2a44" stroke-width="4"/>
          <ellipse cx="204" cy="96" rx="18" ry="9" fill="#fff" opacity=".24" transform="rotate(25 204 96)"/>
          <!-- Center seam -->
          <line x1="160" y1="68" x2="160" y2="240" stroke="#1e2a44" stroke-width="5" stroke-linecap="round"/>
          <!-- Left wing spots -->
          ${lSpots.map(([cx, cy], i) => `<circle class="lb-spot" data-side="l" data-i="${i}" cx="${cx}" cy="${cy}" r="14.5" fill="#1e2a44"/>`).join('')}
          <!-- Right wing spots -->
          ${rSpots.map(([cx, cy], i) => `<circle class="lb-spot pop" data-side="r" data-i="${i}" cx="${cx}" cy="${cy}" r="14.5" fill="#1e2a44"/>`).join('')}
        `;

        badgeR.textContent = String(rightCount);

        if (addingMode) {
          const wingR = svg.querySelector('[data-wing="r"]');
          if (wingR) wingR.addEventListener('click', () => addSpotToRight());
          svg.querySelectorAll('.lb-spot[data-side="r"]').forEach((sp) => {
            sp.addEventListener('click', (e) => {
              e.stopPropagation();
              if (rightCount < p.targetRight) addSpotToRight();
              else removeSpotFromRight();
            });
          });
        } else {
          /* In 'count' mode, tapping any spot lights it up and counts aloud. */
          svg.querySelectorAll('.lb-spot').forEach((sp) => {
            sp.addEventListener('click', () => {
              if (busy) return;
              if (!sp.classList.contains('lit')) {
                sp.classList.add('lit');
                tapCount += 1;
              } else {
                tapCount = Math.min(p.total, tapCount + 1);
              }
              EDSound.note(PENTA[(tapCount - 1) % PENTA.length], { seconds: 0.18, wave: 'triangle', gain: 0.18 });
              EDVoice.say(EDVoiceLines.num(tapCount), lang);
            });
          });
        }
      }

      function completeRound() {
        busy = true;
        stage.classList.add('flutter');
        eqEl.textContent = `${p.left} + ${p.targetRight} = ${p.total}`;
        EDSound.note([523, 659, 784], { seconds: 0.45, wave: 'triangle', gain: 0.22 });
        EDKit.confetti(28);
        EDVoice.say([EDVoiceLines.num(p.total)], lang).then(() => EDKit.praise(lang));
        round += 1;
        clock.later(next, 2700);
      }

      function addSpotToRight() {
        if (busy || !addingMode || rightCount >= 5) return;
        rightCount += 1;
        renderBug();
        const spokenNum = set.mode === 'make' ? p.left + rightCount : rightCount;
        EDSound.note(PENTA[(spokenNum - 1) % PENTA.length], { seconds: 0.2, wave: 'triangle', gain: 0.2 });
        EDVoice.say(EDVoiceLines.num(spokenNum), lang);
        if (rightCount === p.targetRight) {
          busy = true;
          clock.later(completeRound, 420);
        }
      }

      function removeSpotFromRight() {
        if (busy || !addingMode || rightCount <= 0) return;
        rightCount -= 1;
        renderBug();
        EDSound.note(220, { seconds: 0.14, wave: 'sine', gain: 0.15 });
      }

      if (addingMode) {
        controls.innerHTML = `
          <button type="button" class="lb-dot-btn" data-add-spot>
            <span class="lb-dot-circle"></span>
            <span>${text.addSpot}</span>
          </button>`;
        const addBtn = controls.querySelector('[data-add-spot]');
        EDKit.drag(addBtn, {
          onTap: () => addSpotToRight(),
          onDrop: (under) => { if (under && under.closest('.lb-stage')) addSpotToRight(); },
        });
      } else {
        const pool = [2, 3, 4, 5, 6, 7, 8].filter((n) => n !== p.total);
        const opts = EDKit.shuffle([p.total, ...EDKit.shuffle(pool).slice(0, 3)]).sort((a, b) => a - b);
        controls.innerHTML = opts.map((n) => `<button type="button" class="kit-opt" data-n="${n}">${n}</button>`).join('');
        controls.querySelectorAll('.kit-opt').forEach((btn) => {
          const choose = () => {
            if (busy) return;
            const n = Number(btn.dataset.n);
            if (n !== p.total) {
              EDKit.nope(btn);
              EDVoice.say('try-again', lang);
              return;
            }
            EDKit.yes(btn);
            svg.querySelectorAll('.lb-spot').forEach((sp) => sp.classList.add('lit'));
            completeRound();
          };
          EDKit.drag(btn, {
            onTap: choose,
            onDrop: (under) => { if (under && under.closest('.lb-stage')) choose(); },
          });
        });
      }

      renderBug();
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('ladybug-spots', { sets: SETS, mount, unmount });
})();
