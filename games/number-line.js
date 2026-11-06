/* קפיצות על ציר המספרים / Number Line Jumps — arithmetic you can watch.

   A frog on a long number line, and a camera that follows it. Adding is hopping
   right, taking away is hopping left, and the arcs it leaves behind are the sum
   written as a picture. The child hops step by step ("counting on"), each hop
   says its number, and presses "I'm here" when they think that is the answer.
   A wrong answer is not a buzzer: the frog stays and the goal blinks after two
   tries.

   The last set turns it round: the frog and the flag are both shown, the child
   guesses how many hops it takes, and then the frog does exactly that many, so
   a wrong guess is seen to fall short or overshoot.

   Sets: hop forward (adding), hop back (taking away), skip counting, how many
   hops. */

(function () {
  const SETS = [
    { id: 'add', emoji: '➕', label: { he: 'קופצים קדימה', en: 'Hop forward' }, mode: 'add' },
    { id: 'sub', emoji: '➖', label: { he: 'קופצים אחורה', en: 'Hop back' }, mode: 'sub' },
    { id: 'skip', emoji: '🦘', label: { he: 'קפיצות גדולות', en: 'Big hops' }, mode: 'skip' },
    { id: 'gap', emoji: '🚩', label: { he: 'כמה קפיצות?', en: 'How many hops?' }, mode: 'gap' },
  ];

  const TEXT = {
    he: {
      hop: 'קפיצה', back: 'אחורה', here: 'הגעתי!', hops: (n) => (n === 1 ? 'קפיצה אחת' : `${n} קפיצות`),
      skip: (s, k) => `קפיצות של ${s}, ${k} פעמים`, gap: (a, b) => `מ-${a} עד ${b}: כמה קפיצות?`, cant: 'זה הקצה של הציר',
    },
    en: {
      hop: 'Hop', back: 'Back', here: "I'm here!", hops: (n) => (n === 1 ? '1 hop' : `${n} hops`),
      skip: (s, k) => `Hop by ${s}, ${k} times`, gap: (a, b) => `From ${a} to ${b}: how many hops?`, cant: 'That is the end of the line',
    },
  };

  const ROUNDS = 5;
  const T = 58;
  const PENTA = [0, 2, 4, 7, 9];

  const CSS = `
    .nl { gap: 10px; }
    .nl-view { position: relative; width: 100%; max-width: 640px; height: 190px; overflow: hidden; border-radius: 26px;
      background: linear-gradient(#bfe6ff 0%, #e9f7ff 62%, #8ad36b 62.5%, #5fb84a 100%); border: 3px solid #fff; box-shadow: 0 6px 0 var(--edge); direction: ltr; }
    .nl-track { position: absolute; left: 0; top: 0; bottom: 0; transition: transform .38s cubic-bezier(.4,0,.2,1); }
    .nl-line { position: absolute; left: 0; right: 0; bottom: 46px; height: 8px; border-radius: 4px; background: #fffdf6; box-shadow: 0 3px 0 #b9a77a; }
    .nl-tick { position: absolute; bottom: 20px; width: ${T}px; text-align: center; font: 700 1rem/1 Fredoka, system-ui, sans-serif; color: #2b4b2b; }
    .nl-tick::before { content: ''; position: absolute; left: 50%; top: -17px; width: 3px; height: 16px; margin-left: -1.5px; background: #fffdf6; border-radius: 2px; }
    .nl-tick.big { font-size: 1.25rem; color: var(--text); }
    .nl-tick.dim { color: transparent; }
    .nl-arcs { position: absolute; left: 0; bottom: 54px; overflow: visible; pointer-events: none; }
    .nl-arc { fill: none; stroke: var(--sub-solid); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: nl-draw .34s ease forwards; }
    @keyframes nl-draw { to { stroke-dashoffset: 0; } }
    .nl-frog { position: absolute; bottom: 54px; width: 54px; margin-left: -27px; transition: left .34s linear; z-index: 2; }
    .nl-frog svg { display: block; width: 100%; filter: drop-shadow(0 4px 0 rgba(0,0,0,.18)); }
    .nl-flag { position: absolute; bottom: 60px; font-size: 2rem; line-height: 1; margin-left: -9px; z-index: 1; }
    .nl-ring { position: absolute; bottom: 44px; width: 44px; height: 44px; margin-left: -22px; border-radius: 50%; border: 4px dashed #ffb000; animation: nl-spin 4s linear infinite; }
    @keyframes nl-spin { to { transform: rotate(360deg); } }
    .nl-pill { min-height: 2rem; padding: 4px 16px; border-radius: 20px; background: var(--sub-tint); color: var(--sub-ink); font-weight: 700; }
    .nl-btns { display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; }
    .nl-btn { border: none; cursor: pointer; border-radius: 22px; font: 700 1.5rem/1 Fredoka, system-ui, sans-serif; padding: 16px 28px; min-height: 64px;
      color: #fff; background: var(--sub-solid); box-shadow: 0 6px 0 var(--sub-edge); }
    .nl-btn:active { transform: translateY(4px); box-shadow: 0 2px 0 var(--sub-edge); }
    .nl-btn.go { padding: 18px 40px; font-size: 1.9rem; }
    .nl-btn.ok { background: var(--pos); box-shadow: 0 6px 0 #0f5a37; }
    .nl-btn.alt { background: #fff; color: var(--text); border: 2px solid var(--border); box-shadow: 0 6px 0 var(--edge); }
    .nl-btn[disabled] { opacity: .5; cursor: default; }
    .nl-btn.glow, .nl-opts .kit-opt.glow { animation: nl-glow .9s ease-in-out infinite; }
    @keyframes nl-glow { 50% { box-shadow: 0 0 0 7px #ffd23f; } }
    .nl-opts .kit-opt { min-width: 74px; min-height: 74px; font-size: 2.2rem; }
    @media (prefers-reduced-motion: reduce) { .nl-arc { animation: none; stroke-dashoffset: 0; } .nl-ring, .nl-btn.glow, .nl-opts .kit-opt.glow { animation: none; } .nl-track, .nl-frog { transition: none; } }
  `;

  const FROG = `<svg viewBox="0 0 60 50" aria-hidden="true">
    <ellipse cx="30" cy="34" rx="22" ry="14" fill="#4ec24a"/><ellipse cx="30" cy="40" rx="14" ry="8" fill="#b7f29a"/>
    <circle cx="17" cy="19" r="9" fill="#4ec24a"/><circle cx="43" cy="19" r="9" fill="#4ec24a"/>
    <circle cx="17" cy="18" r="6" fill="#fff"/><circle cx="43" cy="18" r="6" fill="#fff"/>
    <circle cx="18.5" cy="18.5" r="3" fill="#1e2a44"/><circle cx="41.5" cy="18.5" r="3" fill="#1e2a44"/>
    <path d="M20 33q10 8 20 0" stroke="#1e6b2a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="12" cy="45" rx="9" ry="4" fill="#3aa83a"/><ellipse cx="48" cy="45" rx="9" ry="4" fill="#3aa83a"/></svg>`;

  const clock = EDKit.timers();
  const between = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const numKey = (n) => ((n >= 0 && n <= 20) || n === 30 || n === 40 ? `num-${n}` : null);

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('nl-style', CSS);

    let round = 0;
    let lastKey = '';
    const wrap = document.createElement('div');
    wrap.className = 'kit nl';
    root.append(wrap);

    function problem() {
      for (;;) {
        let p;
        if (set.mode === 'add') {
          const b = between(2, 9);
          const a = between(0, 20 - b);
          p = { start: a, step: 1, dir: 1, answer: a + b, max: 20, title: `${a} + ${b} = ?`, say: [numKey(a), 'nl-plus', numKey(b), 'nl-where'] };
        } else if (set.mode === 'sub') {
          const b = between(2, 9);
          const a = between(b, 20);
          p = { start: a, step: 1, dir: -1, answer: a - b, max: 20, title: `${a} − ${b} = ?`, say: [numKey(a), 'nl-minus', numKey(b), 'nl-where'] };
        } else if (set.mode === 'skip') {
          const s = EDKit.pick([2, 3, 4, 5, 10]);
          const k = between(3, s >= 10 ? 4 : (s === 5 ? 4 : 5));
          p = { start: 0, step: s, dir: 1, answer: s * k, max: Math.max(10, Math.ceil((s * k + s) / 10) * 10), title: text.skip(s, k), say: [`nl-skip-${s}-${k}`], label: s };
        } else {
          const from = between(0, 12);
          const hops = between(3, 9);
          p = { start: from, goal: from + hops, step: 1, dir: 1, answer: hops, max: 20, title: text.gap(from, from + hops), say: ['nl-gap', numKey(from), 'nl-to', numKey(from + hops), 'nl-howmany'] };
        }
        p.say = p.say.filter(Boolean);
        const key = `${p.title}`;
        if (key !== lastKey) { lastKey = key; return p; }
      }
    }

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const p = problem();
      const gap = set.mode === 'gap';
      let pos = p.start;
      let hops = 0;
      let busy = false;
      let misses = 0;
      const x = (n) => n * T + T / 2;

      const ticks = Array.from({ length: p.max + 1 }, (_, n) => {
        const labelled = p.label ? n % p.label === 0 : true;
        return `<div class="nl-tick ${labelled ? 'big' : 'dim'}" style="left:${n * T}px">${n}</div>`;
      }).join('');
      const options = gap ? EDKit.shuffle([p.answer, ...EDKit.shuffle([p.answer - 2, p.answer - 1, p.answer + 1, p.answer + 2].filter((n) => n > 0)).slice(0, 3)]) : [];

      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(`<span dir="ltr">${p.title}</span>`, lang)}
        <div class="nl-view">
          <div class="nl-track" style="width:${(p.max + 1) * T}px">
            <div class="nl-line"></div>
            ${ticks}
            <svg class="nl-arcs" width="${(p.max + 1) * T}" height="90" aria-hidden="true"></svg>
            ${gap ? `<div class="nl-flag" style="left:${x(p.goal)}px" aria-hidden="true">🚩</div>` : ''}
            <div class="nl-ring" style="left:${x(p.answer)}px;display:none"></div>
            <div class="nl-frog" style="left:${x(pos)}px" role="img" aria-label="frog">${FROG}</div>
          </div>
        </div>
        <div class="nl-pill" aria-live="polite"></div>
        ${gap
    ? `<div class="kit-opts nl-opts">${options.map((n) => `<button type="button" class="kit-opt" data-n="${n}">${n}</button>`).join('')}</div>`
    : `<div class="nl-btns">
          <button type="button" class="nl-btn alt" data-back>${p.dir > 0 ? '◀' : '▶'} ${text.back}</button>
          <button type="button" class="nl-btn go" data-hop>${text.hop} ${p.dir > 0 ? '+' : '−'}${p.step} ${p.dir > 0 ? '▶' : '◀'}</button>
          <button type="button" class="nl-btn ok" data-here>${text.here} ✓</button>
        </div>`}`;

      const view = wrap.querySelector('.nl-view');
      const track = wrap.querySelector('.nl-track');
      const frog = wrap.querySelector('.nl-frog');
      const arcs = wrap.querySelector('.nl-arcs');
      const pill = wrap.querySelector('.nl-pill');
      const ring = wrap.querySelector('.nl-ring');
      const place = () => {
        const w = view.clientWidth || 320;
        const full = (p.max + 1) * T;
        let tx = w / 2 - x(pos);
        tx = full <= w ? (w - full) / 2 : Math.min(0, Math.max(w - full, tx));
        track.style.transform = `translateX(${tx}px)`;
        frog.style.left = `${x(pos)}px`;
      };
      place();
      /* The camera jumps to the start without gliding in from nowhere. */
      track.style.transition = 'none';
      requestAnimationFrame(() => requestAnimationFrame(() => { track.style.transition = ''; }));

      const arc = (from, to) => {
        const x1 = x(from);
        const x2 = x(to);
        const h = Math.min(70, 24 + Math.abs(x2 - x1) * 0.22);
        arcs.insertAdjacentHTML('beforeend', `<path class="nl-arc" pathLength="1" d="M${x1} 86 Q${(x1 + x2) / 2} ${86 - h * 2} ${x2} 86" opacity=".85"/>`);
      };

      function hopTo(to, ms = 360) {
        const from = pos;
        pos = to;
        place();
        arc(from, to);
        const dist = Math.abs(to - from);
        frog.firstElementChild.animate(
          [{ transform: 'translateY(0) scale(1,1)' }, { transform: 'translateY(0) scale(1.15,.8)', offset: 0.12 },
            { transform: `translateY(${-30 - Math.min(dist, 4) * 8}px) scale(.92,1.12)`, offset: 0.5 }, { transform: 'translateY(0) scale(1.18,.78)', offset: 0.88 }, { transform: 'translateY(0) scale(1,1)' }],
          { duration: ms, easing: 'ease-in-out' },
        );
        const tone = PENTA[to % 5] + 12 * (Math.floor(to / 5) % 2);
        EDSound.note(262 * 2 ** (tone / 12), { seconds: 0.28, wave: 'triangle', gain: 0.24, delay: ms / 1000 - 0.18 });
        return new Promise((done) => clock.later(done, ms));
      }

      function success() {
        busy = true;
        const eq = gap ? `${p.start} → ${p.goal}: ${p.answer}` : (set.mode === 'skip' ? `0 → ${p.answer}` : p.title.replace('?', p.answer));
        pill.innerHTML = `<span dir="ltr">${eq}</span>`;
        EDKit.confetti(26);
        const speak = numKey(p.answer);
        (speak ? EDVoice.say([speak], lang) : Promise.resolve()).then(() => EDKit.praise(lang));
        round += 1;
        clock.later(next, 2700);
      }

      EDKit.voice(wrap, p.say, lang);

      if (gap) {
        wrap.querySelectorAll('.kit-opt').forEach((btn) => btn.addEventListener('click', async () => {
          if (busy) return;
          busy = true;
          wrap.querySelectorAll('.kit-opt').forEach((b) => b.classList.remove('glow'));
          const n = Number(btn.dataset.n);
          for (let i = 1; i <= n && pos < p.max; i += 1) {
            hops += 1;
            pill.textContent = text.hops(hops);
            await hopTo(pos + 1, 300);
          }
          if (pos === p.goal) { EDKit.yes(btn); success(); return; }
          EDKit.nope(btn);
          misses += 1;
          EDVoice.say('try-again', lang);
          await new Promise((done) => clock.later(done, 1100));
          hops = 0;
          pill.textContent = '';
          arcs.innerHTML = '';
          pos = p.start;
          place();
          if (misses >= 2) {
            const right = wrap.querySelector(`.kit-opt[data-n="${p.answer}"]`);
            if (right) right.classList.add('glow');
          }
          busy = false;
        }));
        return undefined;
      }

      const hopBtn = wrap.querySelector('[data-hop]');
      const backBtn = wrap.querySelector('[data-back]');
      const hereBtn = wrap.querySelector('[data-here]');

      async function step(dir) {
        if (busy) return;
        const to = pos + dir * p.step;
        if (to < 0 || to > p.max) { EDKit.nope(dir === p.dir ? hopBtn : backBtn); pill.textContent = text.cant; return; }
        busy = true;
        const forward = dir === p.dir;
        hops += forward ? 1 : -1;
        pill.textContent = hops > 0 ? text.hops(hops) : '';
        const n = numKey(to);
        if (n) EDVoice.say([n], lang);
        await hopTo(to);
        busy = false;
      }

      hopBtn.addEventListener('click', () => step(p.dir));
      backBtn.addEventListener('click', () => step(-p.dir));
      hereBtn.addEventListener('click', () => {
        if (busy) return;
        if (pos === p.answer) { EDKit.yes(hereBtn); success(); return; }
        misses += 1;
        EDKit.nope(hereBtn);
        EDVoice.say('try-again', lang);
        if (misses >= 2) {
          ring.style.display = 'block';
          /* The goal ring is on screen only if the camera is looking at it. */
          const w = view.clientWidth || 320;
          const tx = Math.min(0, Math.max(w - (p.max + 1) * T, w / 2 - (x(pos) + x(p.answer)) / 2));
          track.style.transform = `translateX(${tx}px)`;
        }
      });
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('number-line', { sets: SETS, mount, unmount });
})();
