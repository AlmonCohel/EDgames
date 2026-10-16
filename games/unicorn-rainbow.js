/* הקשת של חד-הקרן / The Unicorn's Rainbow — order, stripe by stripe.

   The unicorn wants to reach the cloud castle, and the only way across the sky
   is a rainbow. The small rainbow in the corner is the plan; the child paints
   the big one to match it, outer stripe first, by tapping the paint pots.
   Every stripe painted is named out loud. When the rainbow is whole the
   unicorn trots over it to the castle.

   The third step is the unicorn's path on the ground instead: a row of stars,
   hearts and moons in a pattern, and the child picks what comes next, so the
   unicorn can step on.

   Sets: three stripes, the real rainbow (six, in its real order), patterns. */

(function () {
  const PAINT = { red: '#ff4d4d', orange: '#ff9a1f', yellow: '#ffd23f', green: '#3ccf7a', blue: '#4aa3ff', purple: '#a66cff', pink: '#ff7eb6' };
  const REAL = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

  const SETS = [
    { id: 'three', emoji: '🌈', label: { he: 'שלושה פסים', en: 'Three stripes' }, mode: 'copy', stripes: 3, rounds: 4 },
    { id: 'real', emoji: '🦄', label: { he: 'הקשת האמיתית', en: 'The real rainbow' }, mode: 'copy', stripes: 6, rounds: 2 },
    { id: 'pattern', emoji: '⭐', label: { he: 'השביל של חד-הקרן', en: "The unicorn's path" }, mode: 'pattern', rounds: 5 },
  ];

  const PATTERNS = [
    ['⭐', '💗'], ['🌙', '⭐'], ['💗', '💗', '⭐'], ['⭐', '🌙', '💗'], ['🌸', '⭐', '⭐'], ['💎', '🌸'],
  ];

  const TEXT = {
    he: { copy: 'צובעים את הקשת כמו בתמונה הקטנה', pattern: 'מה בא עכשיו בשביל?', plan: 'התוכנית', go: 'חד-הקרן יוצא לדרך!' },
    en: { copy: 'Paint the rainbow like the little picture', pattern: 'What comes next on the path?', plan: 'The plan', go: 'Off goes the unicorn!' },
  };

  const CSS = `
    .ur-sky { direction: ltr; position: relative; width: min(100%, 640px, max(300px, calc((100vh - 430px) * 1.78))); aspect-ratio: 16 / 9; border-radius: var(--radius); overflow: hidden;
      background: linear-gradient(180deg, #8fd3ff, #d6f0ff 70%, #f4fbff); }
    .ur-sky svg.ur-arc { position: absolute; inset: 0; width: 100%; height: 100%; }
    .ur-stripe { fill: none; stroke-linecap: butt; transition: stroke .3s; }
    .ur-stripe.empty { stroke: rgba(255,255,255,.55); stroke-dasharray: 6 6; }
    .ur-stripe.now { stroke: #fff; stroke-dasharray: none; animation: ur-glow .9s ease-in-out infinite alternate; }
    @keyframes ur-glow { to { stroke: #fff6c2; } }
    .ur-plan { position: absolute; top: 8px; inset-inline-end: 8px; width: 26%; background: rgba(255,255,255,.8); border-radius: 14px; padding: 4px 4px 0; text-align: center;
      font-size: .7rem; font-weight: 700; color: var(--text-soft); }
    .ur-plan svg { width: 100%; display: block; }
    .ur-sky .ur-plan { right: 8px; left: auto; }
    .ur-who { position: absolute; font-size: clamp(34px, 8vw, 62px); line-height: 1; transform: translate(-50%, -100%); transition: left .28s linear, top .28s linear; z-index: 2; }
    .ur-castle { position: absolute; right: 2%; bottom: 6%; font-size: clamp(38px, 9vw, 70px); line-height: 1; }
    .ur-cloud { position: absolute; bottom: 2%; width: 26%; height: 16%; background: #fff; border-radius: 40px; box-shadow: 20px -14px 0 4px #fff, -10px -8px 0 2px #fff; }
    .ur-pots { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .ur-pot { width: 70px; height: 70px; border-radius: 50% 50% 18px 18px; border: 3px solid rgba(0,0,0,.12); cursor: pointer; box-shadow: 0 6px 0 rgba(0,0,0,.15), inset 0 8px 0 rgba(255,255,255,.35); }
    .ur-pot:active { transform: translateY(4px); box-shadow: 0 2px 0 rgba(0,0,0,.15); }
    .ur-path { direction: ltr; display: flex; gap: 8px; align-items: center; justify-content: center; flex-wrap: wrap; padding: 18px 10px; border-radius: var(--radius); width: min(100%, 680px);
      background: linear-gradient(180deg, #c7f0c4, #8fd88a); position: relative; }
    .ur-step { width: 58px; height: 58px; border-radius: 50%; background: #fff8e6; display: grid; place-items: center; font-size: 32px; box-shadow: 0 5px 0 #e6d3a8; }
    .ur-step.gap { background: rgba(255,255,255,.4); border: 3px dashed #fff; box-shadow: none; }
    .ur-step .uni { font-size: 40px; }
  `;

  /* A rainbow on a 400 × 225 page: stripe i (0 = outer). */
  const arc = (r) => `M ${200 - r} 215 A ${r} ${r} 0 0 1 ${200 + r} 215`;
  const R0 = 175;
  const strokeFor = (n) => Math.min(26, 120 / n);
  const radius = (i, n) => R0 - i * strokeFor(n) - strokeFor(n) / 2;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('ur-style', CSS);

    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    const nextRound = () => {
      if (round >= set.rounds) return EDKit.end(wrap, ctx, lang);
      return set.mode === 'pattern' ? patternRound() : copyRound();
    };

    function copyRound() {
      const n = set.stripes;
      const plan = n === 6 ? REAL : EDKit.shuffle(Object.keys(PAINT)).slice(0, n);
      const pots = EDKit.shuffle(n === 6 ? [...REAL] : [...plan, ...EDKit.shuffle(Object.keys(PAINT).filter((c) => !plan.includes(c))).slice(0, 1)]);
      let at = 0;
      const sw = strokeFor(n);
      wrap.innerHTML = `
        ${EDKit.dots(set.rounds, round)}
        ${EDKit.head(text.copy, lang)}
        <div class="ur-sky">
          <div class="ur-cloud" style="left:-4%"></div><div class="ur-cloud" style="right:-4%"></div>
          <svg class="ur-arc" viewBox="0 0 400 225" aria-hidden="true">
            ${plan.map((c, i) => `<path class="ur-stripe empty${i === 0 ? ' now' : ''}" data-i="${i}" d="${arc(radius(i, n))}" stroke-width="${sw}"/>`).join('')}
          </svg>
          <div class="ur-plan" aria-label="${text.plan}">${text.plan}
            <svg viewBox="0 0 400 225">${plan.map((c, i) => `<path d="${arc(radius(i, n))}" stroke="${PAINT[c]}" stroke-width="${sw}" fill="none"/>`).join('')}</svg>
          </div>
          <div class="ur-castle" aria-hidden="true">🏰</div>
          <div class="ur-who" aria-hidden="true" style="left:9%;top:92%">🦄</div>
        </div>
        <div class="ur-pots">${pots.map((c) => `<button type="button" class="ur-pot" data-c="${c}" style="background:${PAINT[c]}" aria-label="${c}"></button>`).join('')}</div>`;
      EDKit.voice(wrap, 'rainbow-ask', lang);
      wrap.querySelectorAll('.ur-pot').forEach((p) => p.addEventListener('click', () => {
        if (at >= n) return;
        const c = p.dataset.c;
        EDVoice.say(`color-${c}`, lang);
        if (c !== plan[at]) { EDKit.nope(p); return; }
        const stripe = wrap.querySelector(`.ur-stripe[data-i="${at}"]`);
        stripe.classList.remove('empty', 'now');
        stripe.setAttribute('stroke', PAINT[c]);
        stripe.style.stroke = PAINT[c];
        at += 1;
        const nextStripe = wrap.querySelector(`.ur-stripe[data-i="${at}"]`);
        if (nextStripe) nextStripe.classList.add('now');
        if (at === n) clock.later(cross, 700);
      }));
    }

    /* The unicorn trots over the middle of the rainbow to the castle. */
    function cross() {
      EDVoice.say('rainbow-go', lang);
      const who = wrap.querySelector('.ur-who');
      const r = radius(Math.floor(set.stripes / 2), set.stripes) + strokeFor(set.stripes) / 2;
      const steps = 16;
      for (let k = 0; k <= steps; k += 1) {
        clock.later(() => {
          const a = Math.PI - (Math.PI * k) / steps;
          const x = 200 + Math.cos(a) * r;
          const y = 215 - Math.sin(a) * r;
          who.style.left = `${(x / 400) * 100}%`;
          who.style.top = `${(y / 225) * 100}%`;
        }, 600 + k * 280);
      }
      clock.later(() => { EDKit.confetti(30); round += 1; clock.later(nextRound, 1400); }, 600 + steps * 280 + 300);
    }

    function patternRound() {
      const unit = EDKit.pick(PATTERNS);
      const shown = unit.length * 2 + Math.floor(Math.random() * unit.length);
      const seq = Array.from({ length: shown + 1 }, (_, i) => unit[i % unit.length]);
      const answer = seq[shown];
      const choices = EDKit.shuffle([...new Set([answer, ...EDKit.shuffle(['⭐', '💗', '🌙', '🌸', '💎'].filter((x) => x !== answer)).slice(0, 2)])]);
      wrap.innerHTML = `
        ${EDKit.dots(set.rounds, round)}
        ${EDKit.head(text.pattern, lang)}
        <div class="ur-path">
          <div class="ur-step"><span class="uni" aria-hidden="true">🦄</span></div>
          ${seq.slice(0, shown).map((x) => `<div class="ur-step">${x}</div>`).join('')}
          <div class="ur-step gap" aria-hidden="true"></div>
          <div class="ur-step">🏰</div>
        </div>
        <div class="kit-opts">${choices.map((x) => `<button type="button" class="kit-opt" data-x="${x}">${x}</button>`).join('')}</div>`;
      EDKit.voice(wrap, 'pattern-ask', lang);
      wrap.querySelectorAll('.kit-opt').forEach((b) => b.addEventListener('click', () => {
        if (b.dataset.x !== answer) { EDKit.nope(b); EDVoice.say('try-again', lang); return; }
        EDKit.yes(b);
        const gap = wrap.querySelector('.ur-step.gap');
        gap.classList.remove('gap');
        gap.textContent = answer;
        wrap.querySelectorAll('.kit-opt').forEach((o) => { o.disabled = true; });
        EDKit.praise(lang);
        round += 1;
        clock.later(nextRound, 1500);
      }));
    }

    nextRound();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('unicorn-rainbow', { sets: SETS, mount, unmount });
})();
