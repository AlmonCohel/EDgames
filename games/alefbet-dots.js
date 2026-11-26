/* מחברים נקודות א-ב / Alef-Bet Dot to Dot — the order of the letters, drawn.

   Dots labelled א, ב, ג… are scattered on the page; joined in alef-bet order
   they draw a picture — a house, a crown, a fish, a star. Each dot says its
   letter's name as it is joined, so the alef-bet is heard in order while it is
   drawn in order, and the picture coming out of the lines is the reward for
   getting the order right. A dot out of turn wobbles and the voice says which
   letter to look for.

   Sets: short pictures (up to ז), longer ones (up to י), long ones (up to ל). */

(function () {
  const ALEFBET = [...'אבגדהוזחטיכל'];

  const heart = Array.from({ length: 12 }, (_, i) => {
    const t = Math.PI - (i / 12) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [50 + x * 2.6, 46 - y * 2.6];
  });

  const PICS = {
    house: { pts: [[50, 8], [88, 40], [80, 40], [80, 90], [20, 90], [20, 40], [12, 40]], fill: '#ff9a5c' },
    crown: { pts: [[10, 82], [10, 28], [30, 54], [50, 16], [70, 54], [90, 28], [90, 82]], fill: '#ffd23f' },
    boat: { pts: [[46, 8], [80, 56], [92, 60], [76, 86], [24, 86], [8, 60], [46, 60]], fill: '#4aa3ff' },
    kite: { pts: [[50, 6], [68, 24], [84, 44], [50, 94], [16, 44], [32, 24]], fill: '#ff7eb6' },
    fish: { pts: [[8, 50], [28, 28], [58, 22], [78, 40], [94, 24], [94, 76], [78, 60], [58, 78], [28, 72]], fill: '#ff8a1f' },
    star: { pts: Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 ? 20 : 46; return [50 + Math.cos(a) * r, 54 + Math.sin(a) * r]; }), fill: '#ffc531' },
    tree: { pts: [[50, 6], [80, 44], [66, 44], [88, 72], [56, 72], [56, 94], [44, 94], [44, 72], [12, 72], [34, 44], [20, 44]], fill: '#3ccf7a' },
    heart: { pts: heart, fill: '#ff4d6d' },
  };

  // Keep the 28-unit hit circles apart while the lines still join the original outline.
  const TARGETS = {
    house: [[50, 8], [100, 34], [70, 43], [80, 90], [20, 90], [30, 43], [0, 34]],
    crown: [[10, 86], [6, 25], [26, 54], [50, 14], [74, 54], [94, 25], [90, 86]],
    boat: [[46, 8], [72, 44], [101, 60], [76, 90], [24, 90], [5, 60], [41, 59]],
    kite: [[50, 4], [76, 20], [94, 47], [50, 94], [6, 47], [24, 20]],
    fish: [[3, 48], [24, 24], [56, 19], [77, 46], [100, 23], [100, 80], [70, 74], [43, 91], [23, 69]],
    star: [[50, 3], [67, 30], [99, 36], [78, 58], [83, 92], [50, 73], [17, 92], [22, 58], [1, 36], [33, 30]],
    tree: [[50, 4], [95, 25], [65, 36], [99, 62], [69, 67], [69, 100], [31, 100], [31, 67], [1, 62], [35, 36], [5, 25]],
    heart: [[50, 113], [77, 94], [95, 69], [101, 38], [91, 9], [65, -5], [50, 43], [35, -5], [9, 9], [-1, 38], [5, 69], [23, 94]],
  };

  const SETS = [
    { id: 'short', emoji: '🏠', label: { he: 'עד ז', en: 'Up to Zayin' }, pics: ['house', 'crown', 'boat', 'kite'], rounds: 3 },
    { id: 'medium', emoji: '⭐', label: { he: 'עד י', en: 'Up to Yud' }, pics: ['fish', 'star'], rounds: 2 },
    { id: 'long', emoji: '❤️', label: { he: 'עד ל', en: 'Up to Lamed' }, pics: ['tree', 'heart'], rounds: 2 },
  ];

  const TEXT = {
    he: { ask: 'מחברים את הנקודות לפי הסדר: א, ב, ג…', wow: { house: 'בית', crown: 'כתר', boat: 'סירה', kite: 'עפיפון', fish: 'דג', star: 'כוכב', tree: 'עץ', heart: 'לב' } },
    en: { ask: 'Join the dots in Alef-Bet order: א, ב, ג…', wow: { house: 'A house', crown: 'A crown', boat: 'A boat', kite: 'A kite', fish: 'A fish', star: 'A star', tree: 'A tree', heart: 'A heart' } },
  };

  const CSS = `
    body.game-deck .console-chassis--game:has(.ad-game) { height: 100dvh; }
    body.game-deck .game-console-screen:has(.ad-game),
    body.game-deck #stage:has(> .ad-game) { min-height: min-content; }
    .kit.ad-game { flex: 1; min-height: 0; padding: 4px 0 6px; }
    .ad-info { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .ad-paper { position: relative; align-self: stretch; flex: 1; min-width: 0; min-height: min(100vw, 420px); border-radius: var(--radius); background: #fffdf6; border: 2px solid var(--border); box-shadow: 0 6px 0 var(--edge, var(--border)); }
    .ad-paper svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    @media (min-width: 800px) {
      .kit.ad-game:has(.ad-paper) { flex-direction: row; }
      .ad-info { flex: 0 0 23%; }
      .ad-info .kit-head { flex-direction: column; }
      .ad-paper { min-height: 260px; }
    }
    .ad-shape { fill: transparent; transition: fill .8s ease; }
    .ad-shape.on { fill: var(--f); }
    .ad-line { stroke: var(--sub-solid, #0f8ea0); stroke-width: 1.6; stroke-linecap: round; }
    .ad-guides { pointer-events: none; }
    .ad-guides line { stroke: #8d9ab0; stroke-width: .6; }
    .ad-guides circle { fill: #52607c; }
    .ad-dot { cursor: pointer; }
    .ad-dot circle.hit { fill: transparent; }
    .ad-dot circle.pin { fill: #fff; stroke: #52607c; stroke-width: .8; }
    .ad-dot.next circle.pin { fill: #ffe27a; stroke: #a57900; animation: ad-pulse .8s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
    @keyframes ad-pulse { to { transform: scale(1.16); } }
    .ad-dot.done circle.pin { fill: var(--sub-solid, #0f8ea0); stroke: none; }
    .ad-dot.done text { fill: #fff; }
    .ad-dot text { font: 800 9px Heebo, Fredoka, sans-serif; fill: #1e2a44; }
    .ad-marker { pointer-events: none; }
    .ad-dot.wob .ad-marker { animation: kit-shake .4s ease; transform-box: fill-box; transform-origin: center; }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('ad-style', CSS);

    const order = EDKit.shuffle(set.pics);
    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kit ad-game';
    root.append(wrap);

    function next() {
      if (round >= set.rounds) return EDKit.end(wrap, ctx, lang);
      const name = order[round % order.length];
      const pic = PICS[name];
      const n = pic.pts.length;
      let at = 0;
      const targets = TARGETS[name];
      wrap.innerHTML = `
        <div class="ad-info">
          ${EDKit.dots(set.rounds, round)}
          ${EDKit.head(text.ask, lang)}
        </div>
        <div class="ad-paper">
          <svg viewBox="-16 -20 132 150" aria-hidden="true">
            <polygon class="ad-shape" style="--f:${pic.fill}" points="${pic.pts.map((p) => p.join(',')).join(' ')}"/>
            <g class="ad-guides">
              ${pic.pts.map(([x, y], i) => `
                <line x1="${x}" y1="${y}" x2="${targets[i][0]}" y2="${targets[i][1]}"/>
                <circle cx="${x}" cy="${y}" r="1.3"/>`).join('')}
            </g>
            <g class="ad-lines"></g>
            ${targets.map(([x, y], i) => `
              <g class="ad-dot${i === 0 ? ' next' : ''}" data-i="${i}" transform="translate(${x} ${y})">
                <circle class="hit" r="14"/>
                <g class="ad-marker">
                  <circle class="pin" r="8"/>
                  <text y="3.25" text-anchor="middle">${ALEFBET[i]}</text>
                </g>
              </g>`).join('')}
          </svg>
        </div>`;
      EDKit.voice(wrap, ['dots-ask'], lang);
      const lines = wrap.querySelector('.ad-lines');
      const line = (a, b) => lines.insertAdjacentHTML('beforeend', `<line class="ad-line" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`);

      wrap.querySelectorAll('.ad-dot').forEach((g) => g.addEventListener('click', () => {
        const i = Number(g.dataset.i);
        if (at >= n) return;
        if (i !== at) {
          g.classList.remove('wob'); void g.getBoundingClientRect(); g.classList.add('wob');
          EDVoice.say(['dots-look', EDVoiceLines.letter(ALEFBET[at])], lang);
          return;
        }
        g.classList.remove('next');
        g.classList.add('done');
        if (at > 0) line(pic.pts[at - 1], pic.pts[at]);
        EDVoice.say(EDVoiceLines.letter(ALEFBET[at]), 'he');
        at += 1;
        if (at < n) { wrap.querySelector(`.ad-dot[data-i="${at}"]`).classList.add('next'); return; }
        /* Close the outline and colour the picture in. */
        line(pic.pts[n - 1], pic.pts[0]);
        clock.later(() => {
          wrap.querySelector('.ad-shape').classList.add('on');
          wrap.querySelector('.kit-head h2').textContent = `${text.wow[name]}! 🎉`;
          EDVoice.say(['dots-wow', `pic-${name}`], lang);
          EDKit.confetti(30);
          round += 1;
          clock.later(next, 2800);
        }, 500);
      }));
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('alefbet-dots', { sets: SETS, mount, unmount });
})();
