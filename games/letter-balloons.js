/* בלוני אותיות / Letter Balloons — hearing a letter's name and catching it.

   Balloons with letters on them float up the screen. The voice says which
   letter to pop — "מפוצצים את כל הבלונים עם האות מם" — and the child pops
   every balloon that has it. A balloon with another letter wobbles and says
   its own name instead of popping, so a wrong tap still teaches a letter.
   Three pops of the right letter and the voice calls a new one.

   Always the Hebrew alef-bet. Sets: two letters in the air and slow, three
   letters, four look-alike letters and a little faster. */

(function () {
  const SETS = [
    { id: 'two', emoji: '🎈', label: { he: 'שתי אותיות', en: 'Two letters' }, letters: 2, speed: 38, every: 1300, pool: [...'אבגדהוזחטילמנסקרשת'] },
    { id: 'three', emoji: '🎉', label: { he: 'שלוש אותיות', en: 'Three letters' }, letters: 3, speed: 46, every: 1100, pool: [...'אבגדהוזחטיכלמנסעפצקרשת'] },
    { id: 'alike', emoji: '🔍', label: { he: 'אותיות דומות', en: 'Look-alike letters' }, letters: 4, speed: 54, every: 950, groups: ['בכפנ', 'דרךו', 'החתק', 'וזןי', 'סםטמ'].map((g) => [...g]) },
  ];

  const TEXT = {
    he: { ask: 'מפוצצים את הבלונים עם האות', left: (n) => `עוד ${n}` },
    en: { ask: 'Pop the balloons with the letter', left: (n) => `${n} to go` },
  };

  const ROUNDS = 4;
  const PER_ROUND = 3;
  const HUES = ['#ff5d8f', '#ffc531', '#4aa3ff', '#3ccf7a', '#a66cff', '#ff8a1f'];

  const CSS = `
    .lb-sky { position: relative; width: min(100%, 680px); height: min(56vh, 430px); min-height: 300px; border-radius: var(--radius); overflow: hidden;
      background: linear-gradient(180deg, #7fd0ff, #d9f2ff); touch-action: manipulation; }
    .lb-target { display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 18px; background: var(--sub-solid); color: #fff; font-size: 2.6rem; font-weight: 700; font-family: Heebo, Fredoka, sans-serif; }
    .lb-b { position: absolute; left: 0; top: 0; width: 74px; height: 92px; border: none; padding: 0; background: none; cursor: pointer; will-change: transform; }
    .lb-b .skin { position: absolute; inset: 0 0 18px; border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%; background: var(--h);
      box-shadow: inset -8px -10px 0 rgba(0,0,0,.12), inset 8px 8px 0 rgba(255,255,255,.3); display: grid; place-items: center;
      color: #fff; font-size: 2.3rem; font-weight: 700; font-family: Heebo, Fredoka, sans-serif; text-shadow: 0 2px 0 rgba(0,0,0,.2); }
    .lb-b .skin::after { content: ''; position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-top-color: var(--h); }
    .lb-b .str { position: absolute; left: 50%; bottom: 0; width: 1.5px; height: 18px; background: #6b7a90; }
    .lb-b.wob { animation: kit-shake .4s ease; }
    .lb-pop { position: absolute; font-size: 44px; pointer-events: none; animation: lb-pop .5s ease forwards; }
    @keyframes lb-pop { from { transform: scale(.6); opacity: 1; } to { transform: scale(1.6); opacity: 0; } }
  `;

  let frame = null;
  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('lb-style', CSS);

    let round = 0;
    let popped = 0;
    let target = null;
    let letters = [];
    let balloons = [];
    let spawnIn = 0;
    let last = performance.now();
    let sinceTarget = 0;

    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);
    wrap.innerHTML = `
      <div class="kit-dots-slot"></div>
      ${EDKit.head(text.ask, lang)}
      <div class="lb-target" aria-live="polite"></div>
      <div class="lb-sky"></div>
      <p class="kit-hint" aria-live="polite"></p>`;
    const sky = wrap.querySelector('.lb-sky');
    const hint = wrap.querySelector('.kit-hint');

    function newRound() {
      if (round >= ROUNDS) { cancelAnimationFrame(frame); frame = null; return EDKit.end(wrap, ctx, lang); }
      popped = 0;
      letters = set.groups ? EDKit.shuffle(EDKit.pick(set.groups)).slice(0, set.letters) : EDKit.shuffle(set.pool).slice(0, set.letters);
      target = EDKit.pick(letters.filter((l) => l !== target));
      wrap.querySelector('.kit-dots-slot').innerHTML = EDKit.dots(ROUNDS, round);
      wrap.querySelector('.lb-target').textContent = target;
      hint.textContent = text.left(PER_ROUND);
      EDKit.voice(wrap, ['balloons-pop', EDVoiceLines.letter(target)], lang);
    }

    function spawn() {
      /* At least every third balloon is one to pop, so there is always something to do. */
      sinceTarget += 1;
      const ch = sinceTarget >= 3 || Math.random() < 0.38 ? target : EDKit.pick(letters);
      if (ch === target) sinceTarget = 0;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lb-b';
      b.setAttribute('aria-label', ch);
      b.style.setProperty('--h', EDKit.pick(HUES));
      b.innerHTML = `<span class="skin">${ch}</span><span class="str"></span>`;
      const x = 8 + Math.random() * (sky.clientWidth - 90);
      const item = { el: b, ch, x, y: sky.clientHeight + 10, sway: Math.random() * 6.28, speed: set.speed * (0.85 + Math.random() * 0.3) };
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); tap(item); });
      sky.append(b);
      balloons.push(item);
    }

    function tap(item) {
      if (item.gone) return;
      if (item.ch !== target) {
        item.el.classList.remove('wob'); void item.el.offsetWidth; item.el.classList.add('wob');
        EDVoice.say(EDVoiceLines.letter(item.ch), lang);
        return;
      }
      item.gone = true;
      item.el.remove();
      const boom = document.createElement('span');
      boom.className = 'lb-pop';
      boom.textContent = '💥';
      boom.style.left = `${item.x + 10}px`;
      boom.style.top = `${item.y}px`;
      sky.append(boom);
      clock.later(() => boom.remove(), 600);
      EDSound.note([900, 300], { seconds: 0.12, wave: 'triangle', gain: 0.12 });
      popped += 1;
      hint.textContent = text.left(PER_ROUND - popped);
      if (popped >= PER_ROUND) {
        round += 1;
        EDKit.praise(lang);
        clock.later(newRound, 1300);
      }
    }

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      spawnIn -= dt * 1000;
      if (spawnIn <= 0 && round < ROUNDS) { spawn(); spawnIn = set.every; }
      balloons = balloons.filter((b) => {
        if (b.gone) return false;
        b.y -= b.speed * dt;
        b.sway += dt * 1.6;
        b.el.style.transform = `translate(${b.x + Math.sin(b.sway) * 10}px, ${b.y}px)`;
        if (b.y < -110) { b.el.remove(); return false; }
        return true;
      });
      frame = requestAnimationFrame(tick);
    }

    newRound();
    frame = requestAnimationFrame(tick);
  }

  function unmount() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('letter-balloons', { sets: SETS, mount, unmount });
})();
