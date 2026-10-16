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
    .ad-paper { width: min(100%, 460px, max(280px, calc(100vh - 340px))); aspect-ratio: 1; border-radius: var(--radius); background: #fffdf6; border: 2px solid var(--border); box-shadow: 0 6px 0 var(--edge, var(--border)); }
    .ad-paper svg { width: 100%; height: 100%; display: block; overflow: visible; }
    .ad-shape { fill: transparent; transition: fill .8s ease; }
    .ad-shape.on { fill: var(--f); }
    .ad-line { stroke: var(--sub-solid, #0f8ea0); stroke-width: 1.6; stroke-linecap: round; }
    .ad-dot { cursor: pointer; }
    .ad-dot circle.hit { fill: transparent; }
    .ad-dot circle.pin { fill: #fff; stroke: #52607c; stroke-width: .8; }
    .ad-dot.next circle.pin { fill: #ffe27a; stroke: #e0a800; animation: ad-pulse .8s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
    @keyframes ad-pulse { to { transform: scale(1.35); } }
    .ad-dot.done circle.pin { fill: var(--sub-solid, #0f8ea0); stroke: none; }
    .ad-dot text { font: 700 6px Heebo, Fredoka, sans-serif; fill: #1e2a44; pointer-events: none; }
    .ad-dot.wob { animation: kit-shake .4s ease; transform-box: fill-box; }
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
    wrap.className = 'kit';
    root.append(wrap);

    function next() {
      if (round >= set.rounds) return EDKit.end(wrap, ctx, lang);
      const name = order[round % order.length];
      const pic = PICS[name];
      const n = pic.pts.length;
      let at = 0;
      /* Labels sit outside the outline, pushed away from its middle. */
      const cx = pic.pts.reduce((s, p) => s + p[0], 0) / n;
      const cy = pic.pts.reduce((s, p) => s + p[1], 0) / n;
      const label = ([x, y]) => { const d = Math.hypot(x - cx, y - cy) || 1; return [x + ((x - cx) / d) * 7, y + ((y - cy) / d) * 7 + 2]; };
      wrap.innerHTML = `
        ${EDKit.dots(set.rounds, round)}
        ${EDKit.head(text.ask, lang)}
        <div class="ad-paper">
          <svg viewBox="-8 -8 116 116" aria-hidden="true">
            <polygon class="ad-shape" style="--f:${pic.fill}" points="${pic.pts.map((p) => p.join(',')).join(' ')}"/>
            <g class="ad-lines"></g>
            ${pic.pts.map((p, i) => { const [lx, ly] = label(p); return `
              <g class="ad-dot${i === 0 ? ' next' : ''}" data-i="${i}">
                <circle class="hit" cx="${p[0]}" cy="${p[1]}" r="6"/>
                <circle class="pin" cx="${p[0]}" cy="${p[1]}" r="2.6"/>
                <text x="${lx}" y="${ly}" text-anchor="middle">${ALEFBET[i]}</text>
              </g>`; }).join('')}
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
