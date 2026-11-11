/* המאזניים / The Balance — what "equals" really means.

   A beam on a pivot, weights on both pans, one place left empty. Put a number
   tile in the empty place and the beam answers at once: heavy side down, light
   side up, and level when the two sides are equal. There is no "wrong" buzzer;
   the scale is the teacher, and a child can try tiles until it settles. When it
   is level it chimes and the equation is written out under it.

   Sets: make a single weight balance (to ten), find the missing number (to
   twenty), and two sums that must be equal. */

(function () {
  const SETS = [
    { id: 'make', emoji: '⚖️', label: { he: 'משלימים להיות שווים', en: 'Make it equal' }, mode: 'make', top: 10 },
    { id: 'missing', emoji: '❓', label: { he: 'המספר החסר', en: 'The missing number' }, mode: 'missing', top: 20 },
    { id: 'both', emoji: '🟰', label: { he: 'שני צדדים', en: 'Two sides' }, mode: 'both', top: 12 },
  ];

  const TEXT = {
    he: { ask: 'איזה מספר יאזן את המאזניים?', eq: 'שווה' },
    en: { ask: 'Which number balances the scale?', eq: 'equals' },
  };

  const ROUNDS = 5;
  const COLOURS = ['#2f6ae8', '#e8621c', '#1c9a57', '#d6337a', '#7c4ced', '#d98a00'];

  const CSS = `
    .bs { gap: 10px; }
    .bs-stage { position: relative; width: min(100%, 520px); height: 290px; direction: ltr; border-radius: 26px; overflow: hidden;
      background: linear-gradient(#cfeaff, #f1faff 70%, #f6e3bd 70.4%, #ecd09b); border: 3px solid #fff; box-shadow: 0 6px 0 var(--edge); }
    .bs-post { position: absolute; left: 50%; bottom: 0; width: 22px; height: 200px; margin-left: -11px; background: linear-gradient(90deg, #8a6a3d, #b99058, #8a6a3d); border-radius: 8px 8px 0 0; }
    .bs-base { position: absolute; left: 50%; bottom: 0; width: 150px; height: 20px; margin-left: -75px; background: #7a5a30; border-radius: 12px 12px 0 0; }
    .bs-beam { position: absolute; left: 6%; right: 6%; top: 62px; height: 14px; border-radius: 8px; background: linear-gradient(#e2b765, #b98c3e);
      box-shadow: 0 3px 0 #8a6528; transform: rotate(var(--rot, 0deg)); transition: transform .9s cubic-bezier(.3,1.6,.5,1); }
    .bs-hub { position: absolute; left: 50%; top: -9px; width: 32px; height: 32px; margin-left: -16px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff1b0, #d9a520); box-shadow: 0 2px 0 #8a6528; }
    .bs-pan { position: absolute; top: 7px; width: 0; transform: rotate(calc(var(--rot, 0deg) * -1)); transform-origin: 50% 0; transition: transform .9s cubic-bezier(.3,1.6,.5,1); }
    .bs-pan.l { left: 68px; } .bs-pan.r { right: 68px; }
    .bs-chains { position: absolute; left: -54px; top: 0; width: 108px; height: 78px; border-top: 0;
      background: linear-gradient(to bottom right, transparent calc(50% - 1.5px), #8a929c calc(50% - 1.5px), #8a929c calc(50% + 1.5px), transparent calc(50% + 1.5px)) left/50% 100% no-repeat,
                  linear-gradient(to bottom left, transparent calc(50% - 1.5px), #8a929c calc(50% - 1.5px), #8a929c calc(50% + 1.5px), transparent calc(50% + 1.5px)) right/50% 100% no-repeat; }
    .bs-dish { position: absolute; left: -64px; top: 76px; width: 128px; height: 16px; border-radius: 0 0 64px 64px / 0 0 16px 16px; background: linear-gradient(#cfd6e4, #8e9ab3); box-shadow: 0 3px 0 #66718a; }
    .bs-load { position: absolute; left: -64px; top: 22px; width: 128px; height: 54px; display: flex; gap: 4px; justify-content: center; align-items: flex-end; }
    .bs-w { min-width: 38px; height: 40px; padding: 0 6px; border-radius: 10px; display: grid; place-items: center; color: #fff;
      font: 700 1.3rem/1 Fredoka, system-ui, sans-serif; box-shadow: 0 4px 0 rgba(0,0,0,.25), inset 0 3px 0 rgba(255,255,255,.3); }
    .bs-w.q { background: rgba(255,255,255,.75) !important; color: var(--sub-ink); border: 3px dashed var(--sub-solid); box-shadow: none; }
    .bs-w.q.has { background: var(--sub-solid) !important; color: #fff; border: 3px solid var(--sub-edge); box-shadow: 0 4px 0 var(--sub-edge); animation: kit-pop .4s ease; }
    .bs-plus { align-self: center; font: 700 1.1rem Fredoka, system-ui; color: var(--text-soft); }
    .bs-stage.level .bs-hub { box-shadow: 0 0 0 8px rgba(255,214,64,.55), 0 2px 0 #8a6528; }
    .bs-eq { min-height: 2.4rem; font: 700 1.8rem/1 Fredoka, system-ui, sans-serif; color: var(--sub-ink); direction: ltr; }
    .bs-tray { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 520px; }
    .bs-tray .kit-opt { min-width: 58px; min-height: 58px; padding: 4px; font-size: 1.8rem; border-radius: 16px; }
    .bs-tray .kit-opt.on { background: var(--sub-solid); color: #fff; border-color: var(--sub-edge); }
    .bs-tray .kit-opt[disabled] { opacity: .55; }
    @media (prefers-reduced-motion: reduce) { .bs-beam, .bs-pan { transition: none; } }
  `;

  const clock = EDKit.timers();
  const between = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const set = ctx.set || SETS[0];
    EDKit.style('bs-style', CSS);

    let round = 0;
    let lastKey = '';
    const wrap = document.createElement('div');
    wrap.className = 'kit bs';
    root.append(wrap);

    /* left and right are lists of terms; null in right is the empty place. */
    function problem() {
      for (;;) {
        let left;
        let right;
        let answer;
        if (set.mode === 'make') {
          const total = between(4, set.top);
          const a = between(1, total - 1);
          left = [total]; right = [a, null]; answer = total - a;
        } else if (set.mode === 'missing') {
          const total = between(11, set.top);
          const a = between(3, total - 3);
          left = [total]; right = Math.random() < 0.5 ? [a, null] : [null, a]; answer = total - a;
        } else {
          const a = between(1, 7);
          const b = between(1, 7);
          const c = between(1, Math.min(a + b - 1, 9));
          left = [a, b]; right = [c, null]; answer = a + b - c;
        }
        const key = `${left}|${right}`;
        if (key !== lastKey && answer >= 1) { lastKey = key; return { left, right, answer }; }
      }
    }

    const sum = (list, fill) => list.reduce((s, n) => s + (n === null ? fill : n), 0);
    const side = (list, fill, colourSeed) => list.map((n, i) => {
      const term = n === null
        ? `<div class="bs-w q ${fill ? 'has' : ''}">${fill || '?'}</div>`
        : `<div class="bs-w" style="background:${COLOURS[(n + colourSeed + i) % COLOURS.length]}">${n}</div>`;
      return (i ? '<span class="bs-plus">+</span>' : '') + term;
    }).join('');

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const p = problem();
      let chosen = 0;
      let done = false;
      const top = Math.max(set.top, p.answer + 3);
      const nums = [];
      for (let n = 1; n <= Math.min(top, 12); n += 1) nums.push(n);
      /* The tray always holds the answer, and stays small enough to fit a phone. */
      const tray = top > 12
        ? EDKit.shuffle([p.answer, ...EDKit.shuffle(Array.from({ length: 20 }, (_, i) => i + 1).filter((n) => n !== p.answer)).slice(0, 9)]).sort((a, b) => a - b)
        : nums;

      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(TEXT[lang].ask, lang)}
        <div class="bs-stage">
          <div class="bs-post"></div><div class="bs-base"></div>
          <div class="bs-beam">
            <div class="bs-hub"></div>
            <div class="bs-pan l"><div class="bs-chains"></div><div class="bs-load" data-side="l"></div><div class="bs-dish"></div></div>
            <div class="bs-pan r"><div class="bs-chains"></div><div class="bs-load" data-side="r"></div><div class="bs-dish"></div></div>
          </div>
        </div>
        <div class="bs-eq" aria-live="polite"></div>
        <div class="bs-tray">
          ${tray.map((n) => `<button type="button" class="kit-opt" data-n="${n}">${n}</button>`).join('')}
        </div>`;
      const stage = wrap.querySelector('.bs-stage');
      const beam = wrap.querySelector('.bs-beam');
      const eq = wrap.querySelector('.bs-eq');

      function render() {
        wrap.querySelector('[data-side="l"]').innerHTML = side(p.left, 0, 0);
        wrap.querySelector('[data-side="r"]').innerHTML = side(p.right, chosen, 3);
        const l = sum(p.left, 0);
        const r = sum(p.right, chosen);
        /* With nothing chosen the beam leans to the heavier side, which is the
           left: the empty place weighs nothing. */
        const rot = Math.max(-17, Math.min(17, (r - l) * 3.2));
        beam.style.setProperty('--rot', `${rot}deg`);
        beam.querySelectorAll('.bs-pan').forEach((el) => el.style.setProperty('--rot', `${rot}deg`));
        return l === r;
      }
      render();

      EDKit.voice(wrap, round === 0 ? 'bal-ask' : 'bal-again', lang);

      wrap.querySelectorAll('.kit-opt').forEach((btn) => EDKit.drag(btn, {
        onTap: () => choose(btn),
        onDrop: (under) => { if (under && under.closest('.bs-stage')) choose(btn); },
      }));

      function choose(btn) {
        if (done) return;
        chosen = Number(btn.dataset.n);
        wrap.querySelectorAll('.kit-opt').forEach((b) => b.classList.toggle('on', b === btn));
        EDSound.note(180 + chosen * 14, { seconds: 0.18, wave: 'triangle', gain: 0.16 });
        if (!render()) return;
        done = true;
        wrap.querySelectorAll('.kit-opt').forEach((b) => { b.disabled = true; });
        stage.classList.add('level');
        const left = p.left.join(' + ');
        const right = p.right.map((n) => (n === null ? chosen : n)).join(' + ');
        eq.textContent = `${left} = ${right}`;
        clock.later(() => {
          EDSound.note([660, 880], { seconds: 0.45, wave: 'sine', gain: 0.22 });
          EDKit.confetti(26);
          EDKit.praise(lang);
        }, 650);
        round += 1;
        clock.later(next, 3300);
      }
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('balance-scale', { sets: SETS, mount, unmount });
})();
