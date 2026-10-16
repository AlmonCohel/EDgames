/* The pieces every game since October 2026 is built from, so twelve new games
   do not carry twelve copies of the same progress dots and end screen.

   - A speaker button that says the round's instruction out loud, and bounces
     when the browser would not let it play yet (no touch on the page).
   - Progress dots, the big chunky answer button, a wrong-answer wiggle and a
     right-answer pop, a burst of confetti.
   - The end-of-step screen: stars, the spoken "you finished this step", and
     the Again / Another game buttons.

   A game still keeps its own CSS and its own text; this is only the furniture.
   All of it reads the theme tokens, so it takes the colour of the game's
   subject. */

const EDKit = window.EDKit = (() => {
  const CSS = `
    .kit { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 6px 0 18px; width: 100%; }
    .kit-dots { display: flex; gap: 9px; }
    .kit-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .kit-dot.done { background: var(--pos); }
    .kit-head { display: flex; align-items: center; gap: 12px; justify-content: center; text-align: center; }
    .kit-head h2 { margin: 0; font-size: 1.35rem; }
    .kit-hint { margin: -6px 0 0; color: var(--text-soft); font-size: .95rem; min-height: 1.5em; text-align: center; }
    .kit-say { width: 54px; height: 54px; flex: none; border-radius: 50%; border: none; cursor: pointer; font-size: 26px; line-height: 1;
      background: var(--sub-solid, var(--accent-strong)); color: #fff; box-shadow: 0 5px 0 var(--sub-edge, rgba(0,0,0,.25)); }
    .kit-say:active { transform: translateY(3px); box-shadow: 0 2px 0 var(--sub-edge, rgba(0,0,0,.25)); }
    .kit-say.nudge { animation: kit-nudge 1s ease infinite; }
    @keyframes kit-nudge { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.16); } }
    .kit-opts { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }
    .kit-opt { min-width: 92px; min-height: 92px; padding: 10px 16px; border-radius: 22px; border: 2px solid var(--border);
      background: var(--surface); color: var(--text); font: inherit; font-weight: 700; font-size: 2.6rem; line-height: 1; cursor: pointer;
      box-shadow: 0 6px 0 var(--edge, var(--border)); transition: transform .08s; display: grid; place-items: center; }
    .kit-opt:active { transform: translateY(4px); box-shadow: 0 2px 0 var(--edge, var(--border)); }
    .kit-opt[disabled] { cursor: default; }
    .kit-nope { animation: kit-shake .4s ease; }
    @keyframes kit-shake { 25% { transform: translateX(-9px) rotate(-3deg); } 75% { transform: translateX(9px) rotate(3deg); } }
    .kit-yes { animation: kit-pop .5s ease; border-color: var(--pos) !important; background: var(--sub-tint, #e3f6ea) !important; }
    @keyframes kit-pop { 40% { transform: scale(1.14); } }
    .kit-end { text-align: center; margin: auto; padding: 10px 0; }
    .kit-end .kit-stars { font-size: 46px; letter-spacing: 4px; }
    .kit-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .kit-end p { color: var(--text-soft); margin: 0 0 22px; }
    .kit-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .kit-confetti { position: fixed; inset: 0; pointer-events: none; z-index: 50; overflow: hidden; }
    .kit-confetti i { position: absolute; top: -20px; width: 10px; height: 14px; border-radius: 3px; animation: kit-fall 1.6s ease-in forwards; }
    @keyframes kit-fall { to { transform: translateY(105vh) rotate(540deg); opacity: .9; } }
    @media (prefers-reduced-motion: reduce) {
      .kit-say.nudge, .kit-nope, .kit-yes, .kit-confetti i { animation: none; }
    }
  `;

  const TEXT = {
    he: { hear: 'לשמוע שוב', wellDone: 'כל הכבוד!', done: 'סיימתם את השלב!', again: 'לשלב הבא ⭐', exit: 'למשחק אחר' },
    en: { hear: 'Hear it again', wellDone: 'Well done!', done: 'You finished this step!', again: 'Next step ⭐', exit: 'Another game' },
  };

  function style(id, css) {
    if (!document.getElementById('kit-style')) {
      const s = document.createElement('style');
      s.id = 'kit-style';
      s.textContent = CSS;
      document.head.append(s);
    }
    if (id && !document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = css;
      document.head.append(s);
    }
  }

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const t = (lang) => TEXT[lang] || TEXT.he;

  const dots = (n, done) => `<div class="kit-dots" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<span class="kit-dot ${i < done ? 'done' : ''}"></span>`).join('')}</div>`;

  /* The heading row: speaker first, then the line. */
  const head = (line, lang) => `<div class="kit-head"><button type="button" class="kit-say" aria-label="${t(lang).hear}">🔊</button><h2>${line}</h2></div>`;

  /* Says `items` and wires the speaker in `scope` to say them again. */
  function voice(scope, items, lang) {
    const btn = scope.querySelector('.kit-say');
    const go = () => {
      if (btn) btn.classList.remove('nudge');
      return EDVoice.say(items, lang).then((heard) => { if (!heard && btn) btn.classList.add('nudge'); return heard; });
    };
    if (btn) btn.onclick = go;
    return go();
  }

  function nope(el) {
    el.classList.remove('kit-nope');
    void el.offsetWidth;
    el.classList.add('kit-nope');
  }

  function yes(el) {
    el.classList.remove('kit-yes');
    void el.offsetWidth;
    el.classList.add('kit-yes');
  }

  const praise = (lang) => EDVoice.say(`praise-${1 + Math.floor(Math.random() * 4)}`, lang);

  function confetti(n = 40) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div');
    box.className = 'kit-confetti';
    const colours = ['#ff5d8f', '#ffc531', '#2f6ae8', '#1c9a57', '#7c4ced', '#e8621c'];
    box.innerHTML = Array.from({ length: n }, () => `<i style="left:${Math.random() * 100}%;background:${pick(colours)};animation-delay:${Math.random() * 0.5}s;animation-duration:${1.2 + Math.random()}s"></i>`).join('');
    document.body.append(box);
    setTimeout(() => box.remove(), 2600);
  }

  function end(wrap, ctx, lang, line) {
    const x = t(lang);
    wrap.innerHTML = `
      <div class="kit-end">
        <div class="kit-stars" aria-hidden="true">⭐⭐⭐</div>
        <h2>${x.wellDone}</h2>
        <p>${line || x.done}</p>
        <div class="kit-actions">
          <button type="button" class="btn" data-again>${x.again}</button>
          <button type="button" class="btn btn--ghost" data-exit>${x.exit}</button>
        </div>
      </div>`;
    wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
    wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    confetti();
    EDVoice.say('step-done', lang);
  }

  /* Timers a game can clear in one go on unmount. */
  function timers() {
    let list = [];
    return {
      later(fn, ms) { list.push(setTimeout(fn, ms)); },
      clear() { list.forEach(clearTimeout); list = []; },
    };
  }

  return { style, shuffle, pick, dots, head, voice, nope, yes, praise, confetti, end, timers, text: t };
})();
