/* הצפרדע קופצת / Frog Hops — the number line, as a row of lily pads.

   The voice asks for a pad by its number; the child finds it and the frog hops
   there pad by pad, counting every hop out loud. A wrong pad is not wrong, it
   is a number: the pad says its own name and the frog waits. So the game
   teaches two things at once — what a numeral looks like and that the numbers
   come in order, one more each step.

   The line runs left to right in both languages (like the piano and the sums),
   because a number line is a picture of order, not a sentence to be read.

   Sets: pads 1–5, pads 1–10, and pads 1–10 with only 1, 5 and 10 written, so
   the child has to count along the line to find the rest. */

(function () {
  const SETS = [
    { id: 'five', emoji: '🐸', label: { he: 'עד 5', en: 'Up to 5' }, pads: 5, hidden: false },
    { id: 'ten', emoji: '🪷', label: { he: 'עד 10', en: 'Up to 10' }, pads: 10, hidden: false },
    { id: 'count', emoji: '🔍', label: { he: 'סופרים לבד', en: 'Count it yourself' }, pads: 10, hidden: true },
  ];

  const TEXT = {
    he: { ask: (n) => `קופצים לעלה מספר ${n}`, hint: 'לוחצים על העלה הנכון', thats: (n) => `זה ${n}. מחפשים עלה אחר` },
    en: { ask: (n) => `Hop to lily pad number ${n}`, hint: 'Tap the right lily pad', thats: (n) => `That is ${n}. Look for another pad` },
  };

  const ROUNDS = 5;
  const HOP_MS = 520;

  const CSS = `
    .fh-pond { direction: ltr; position: relative; width: 100%; max-width: 820px; padding: 70px 10px 22px; border-radius: var(--radius);
      background: linear-gradient(180deg, #8fdcff, #3fb2e8); box-shadow: inset 0 -10px 0 rgba(0,0,0,.08); overflow: hidden; }
    .fh-pond::before { content: ''; position: absolute; inset: 0; background: repeating-radial-gradient(circle at 20% 80%, transparent 0 22px, rgba(255,255,255,.18) 23px 25px); }
    .fh-row { position: relative; display: grid; grid-template-columns: repeat(var(--fh-n), minmax(0, 1fr)); gap: 6px; }
    .fh-pad { position: relative; aspect-ratio: 1; border: none; padding: 0; cursor: pointer; background: none; display: grid; place-items: center; }
    .fh-pad svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .fh-pad b { position: relative; font-size: clamp(18px, 4.4vw, 34px); font-weight: 700; color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,.25); }
    .fh-pad.start b { font-size: clamp(14px, 3vw, 22px); }
    .fh-pad.said b { color: #ffe27a; }
    .fh-frog { position: absolute; top: 6px; width: calc((100% - 20px) / var(--fh-n)); font-size: clamp(30px, 6vw, 54px); text-align: center; line-height: 1;
      transition: left ${HOP_MS - 40}ms ease-in-out; pointer-events: none; z-index: 2; }
    .fh-frog.hop { animation: fh-hop ${HOP_MS - 40}ms ease-in-out; }
    @keyframes fh-hop { 50% { transform: translateY(-46px) scale(1.1); } }
    @media (prefers-reduced-motion: reduce) { .fh-frog { transition: none; } .fh-frog.hop { animation: none; } }
  `;

  const PAD = '<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="56" rx="46" ry="34" fill="#1b8a4a" opacity=".35"/><path d="M50 50 L92 40 A46 34 0 1 1 74 22 Z" fill="#3cc46a"/><path d="M50 50 L92 40 A46 34 0 1 1 74 22 Z" fill="none" stroke="#1f9a4c" stroke-width="3"/></svg>';

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('fh-style', CSS);

    let round = 0;
    let at = 0;            // the pad the frog is on; 0 is the bank
    let busy = false;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    /* Targets never repeat the pad the frog is already on. */
    function nextTarget() {
      let n;
      do { n = 1 + Math.floor(Math.random() * set.pads); } while (n === at);
      return n;
    }

    const shows = (n) => !set.hidden || n === 1 || n === 5 || n === 10;

    function draw(target) {
      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(text.ask(target), lang)}
        <div class="fh-pond" style="--fh-n:${set.pads + 1}">
          <div class="fh-frog" aria-hidden="true">🐸</div>
          <div class="fh-row">
            ${Array.from({ length: set.pads + 1 }, (_, i) => `
              <button type="button" class="fh-pad${i === 0 ? ' start' : ''}" data-n="${i}" aria-label="${i}">
                ${i === 0 ? '<b>🌿</b>' : `${PAD}<b>${shows(i) ? i : ''}</b>`}
              </button>`).join('')}
          </div>
        </div>
        <p class="kit-hint" aria-live="polite">${text.hint}</p>`;
      placeFrog(false);
      wrap.querySelectorAll('.fh-pad').forEach((p) => p.addEventListener('click', () => tapPad(Number(p.dataset.n), p, target)));
      EDKit.voice(wrap, [{ key: 'hop-to', lang }, EDVoiceLines.num(target)], lang);
    }

    function placeFrog(hop) {
      const frog = wrap.querySelector('.fh-frog');
      const row = wrap.querySelector('.fh-row');
      if (!frog || !row) return;
      const pad = row.children[at];
      frog.style.left = `${row.offsetLeft + pad.offsetLeft}px`;
      frog.style.width = `${pad.offsetWidth}px`;
      if (hop) { frog.classList.remove('hop'); void frog.offsetWidth; frog.classList.add('hop'); }
    }

    function tapPad(n, el, target) {
      if (busy || n === 0) return;
      if (n !== target) {
        EDKit.nope(el);
        el.classList.add('said');
        clock.later(() => el.classList.remove('said'), 900);
        EDVoice.say(EDVoiceLines.num(n), lang);
        wrap.querySelector('.kit-hint').textContent = text.thats(n);
        return;
      }
      busy = true;
      /* Hop there one pad at a time, saying each number on the way. Going
         back down the line counts down. */
      const dir = n > at ? 1 : -1;
      const hops = [];
      for (let i = at + dir; dir > 0 ? i <= n : i >= n; i += dir) hops.push(i);
      hops.forEach((p, k) => clock.later(() => {
        at = p;
        placeFrog(true);
        EDVoice.say(EDVoiceLines.num(p), lang);
      }, k * HOP_MS));
      clock.later(() => {
        EDKit.yes(el);
        EDKit.praise(lang);
        round += 1;
        clock.later(() => { busy = false; if (round >= ROUNDS) EDKit.end(wrap, ctx, lang); else draw(nextTarget()); }, 1200);
      }, hops.length * HOP_MS);
    }

    window.addEventListener('resize', onResize = () => placeFrog(false));
    draw(nextTarget());
  }

  let onResize = null;
  function unmount() {
    clock.clear();
    EDVoice.stop();
    if (onResize) window.removeEventListener('resize', onResize);
  }

  EDGames.register('frog-hops', { sets: SETS, mount, unmount });
})();
