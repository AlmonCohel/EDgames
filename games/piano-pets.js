/* פסנתר החיות / Animal Piano — eight keys, eight animals, one scale.

   A key is a real note off a major scale, played in its animal's voice: the
   pitch is the music, the waveform and the little bend on top of it are the
   cow, the bird, the frog. That way the keyboard is an instrument you can play
   a tune on rather than eight unrelated noises, and it is still true that every
   key is a different animal.

   The first run is the toy: press anything, hear the animal, and the row of
   dots fills as each one is met. It ends when all eight have been, which is a
   goal a three-year-old can hold and does not need reading to understand. The
   other two runs play a short phrase and ask for it back — the same keyboard,
   with something to aim at.

   The keyboard is pinned LTR in both languages, the way `plus-minus` pins a
   sum. Low notes on the left is not a reading direction, it is what a keyboard
   is, and a Hebrew page that mirrored it would have the scale climbing the
   wrong way against every real instrument the child will ever sit at. */

(function () {
  /* A major scale from middle C. `shape` bends the note around its own pitch —
     a cat's slide up and back, a sheep's wobble — and is written as multiples
     so one table serves whichever key it lands on. */
  const KEYS = [
    { hz: 261.6, emoji: '🐮', he: 'פרה',     en: 'cow',   wave: 'sawtooth', shape: [1, 0.94] },
    { hz: 293.7, emoji: '🐷', he: 'חזיר',    en: 'pig',   wave: 'sawtooth', shape: [1, 1.1, 0.96] },
    { hz: 329.6, emoji: '🐑', he: 'כבשה',    en: 'sheep', wave: 'triangle', shape: [1, 1.04, 0.97, 1.04, 0.97, 1] },
    { hz: 349.2, emoji: '🐶', he: 'כלב',     en: 'dog',   wave: 'square',   shape: [1, 0.88] },
    { hz: 392.0, emoji: '🐱', he: 'חתול',    en: 'cat',   wave: 'sawtooth', shape: [1, 1.12, 1.02] },
    { hz: 440.0, emoji: '🦆', he: 'ברווז',   en: 'duck',  wave: 'sawtooth', shape: [1, 0.9] },
    { hz: 493.9, emoji: '🐸', he: 'צפרדע',   en: 'frog',  wave: 'square',   shape: [1, 0.84] },
    { hz: 523.3, emoji: '🐦', he: 'ציפור',   en: 'bird',  wave: 'sine',     shape: [1, 1.18, 1.06] },
  ];

  /* Tunes are written as positions on the keyboard above, so a phrase stays a
     phrase whichever animals end up on which key. */
  const SETS = [
    {
      id: 'free', emoji: '🎹',
      label: { he: 'מנגנים חופשי', en: 'Free play' },
      tunes: null,
    },
    {
      id: 'short', emoji: '🎵',
      label: { he: 'שיר קצר', en: 'A short tune' },
      tunes: [[0, 2, 4], [4, 2, 0], [2, 4, 2], [0, 4, 0], [1, 3, 5], [5, 3, 1], [3, 5, 7]],
      rounds: 4,
    },
    {
      id: 'long', emoji: '🎶',
      label: { he: 'שיר ארוך', en: 'A longer tune' },
      tunes: [[0, 2, 4, 2, 0], [4, 4, 2, 2, 0], [0, 1, 2, 3, 4], [7, 5, 4, 2, 0], [2, 0, 2, 4, 2], [3, 5, 7, 5, 3]],
      rounds: 3,
    },
  ];

  const TEXT = {
    he: {
      step:      (n, of) => `שלב ${n} מתוך ${of}`,
      playAsk:   'מנגנים! כל קליד הוא חיה אחרת',
      met:       (n, of) => `הכרתם ${n} חיות מתוך ${of}`,
      copyAsk:   'מקשיבים לשיר ומנגנים אותו בחזרה',
      listenFirst: 'לוחצים על "לשמוע את השיר" כדי להתחיל',
      yourTurn:  'עכשיו אתם — לפי הסדר',
      playing:   'מקשיבים…',
      notThat:   'לא הקליד הזה. אפשר לשמוע את השיר שוב',
      listen:    'לשמוע את השיר 🎧',
      key:       (name) => `הקליד של ה${name}`,
      wellDone:  'כל הכבוד!',
      metAll:    'הכרתם את כל החיות!',
      playedAll: 'ניגנתם את כל השירים!',
      again:     'עוד פעם 🎹',
      exit:      'למשחק אחר',
    },
    en: {
      step:      (n, of) => `Step ${n} of ${of}`,
      playAsk:   'Play! Every key is a different animal',
      met:       (n, of) => `You have met ${n} of ${of} animals`,
      copyAsk:   'Listen to the tune, then play it back',
      listenFirst: 'Press "Hear the tune" to begin',
      yourTurn:  'Your turn now — in order',
      playing:   'Listening…',
      notThat:   'Not that key. You can hear the tune again',
      listen:    'Hear the tune 🎧',
      key:       (name) => `the ${name} key`,
      wellDone:  'Well done!',
      metAll:    'You met every animal!',
      playedAll: 'You played every tune!',
      again:     'Again 🎹',
      exit:      'Another game',
    },
  };

  /* Slow enough for a four-year-old to hear the notes apart. */
  const BEAT_MS = 540;

  const CSS = `
    .pp { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .pp-progress { display: flex; gap: 9px; flex-wrap: wrap; justify-content: center; }
    .pp-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .pp-dot.done { background: var(--pos); }
    .pp-ask { text-align: center; }
    .pp-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .pp-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }

    /* A keyboard is low-note-left in every language — see the note above. */
    .pp-board {
      direction: ltr;
      display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 6px;
      width: 100%; max-width: 640px;
      padding: 12px; border-radius: var(--radius);
      background: var(--surface); border: 1.5px solid var(--border);
    }
    .pp-key {
      display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px;
      min-height: 132px; padding: 8px 2px 10px;
      background: var(--bg-raise); border: 2px solid var(--border);
      border-radius: 6px 6px var(--radius-sm) var(--radius-sm);
      color: var(--text); cursor: pointer;
      transition: transform 0.1s ease, background 0.15s ease;
    }
    .pp-key .pp-face { font-size: 34px; line-height: 1; }
    .pp-key .pp-name { font-size: 0.72rem; font-weight: 700; text-align: center; }
    .pp-key:hover:not([disabled]) { transform: translateY(-3px); }
    /* Pressed by the child and lit by the tune are deliberately the same thing
       to look at: what the game just did is what it is asking for back. */
    .pp-key.lit { background: var(--sub-solid, var(--accent-strong)); border-color: var(--sub-solid, var(--accent-strong)); color: var(--on-accent); }
    .pp-key.met { border-color: var(--pos); }
    .pp-key.nope { animation: pp-shake 0.36s ease; }
    @keyframes pp-shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }

    .pp-listen { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    .pp-end { text-align: center; margin: auto; }
    .pp-end .pp-stars { font-size: 46px; letter-spacing: 4px; }
    .pp-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .pp-end p { color: var(--text-soft); margin: 0 0 22px; }
    .pp-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    /* Eight keys across a phone would be 38px each, under the 44px this site
       taps with. Two rows of four keeps the scale climbing left to right and
       the keys big enough to hit. */
    @media (max-width: 560px) {
      .pp-board { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; padding: 10px; }
      .pp-key { min-height: 96px; }
      .pp-key .pp-face { font-size: 30px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .pp-key { transition: background 0.15s ease; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    const tunes = set.tunes ? shuffle(set.tunes).slice(0, set.rounds) : null;
    const steps = tunes ? tunes.length : KEYS.length;

    if (!document.getElementById('pp-style')) {
      const style = document.createElement('style');
      style.id = 'pp-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let tune = 0;
    let at = 0;
    const met = new Set();
    let locked = false;

    const wrap = document.createElement('div');
    wrap.className = 'pp';
    root.append(wrap);

    wrap.innerHTML = `
      <div class="pp-progress" role="img"></div>
      <div class="pp-ask">
        <h2>${tunes ? text.copyAsk : text.playAsk}</h2>
        <p class="pp-hint" aria-live="polite"></p>
      </div>
      <div class="pp-board" role="group"></div>
      ${tunes ? `<div class="pp-listen"><button type="button" class="btn" data-listen>${text.listen}</button></div>` : ''}`;

    const hint = (line) => { wrap.querySelector('.pp-hint').textContent = line; };
    const board = wrap.querySelector('.pp-board');
    const dots = wrap.querySelector('.pp-progress');

    function drawProgress(done, label) {
      dots.setAttribute('aria-label', label);
      dots.innerHTML = Array.from({ length: steps }, (_, i) =>
        `<span class="pp-dot ${i < done ? 'done' : ''}"></span>`).join('');
    }

    KEYS.forEach((key, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pp-key';
      b.setAttribute('aria-label', text.key(key[lang] || key.he));
      b.innerHTML = `
        <span class="pp-face" aria-hidden="true">${key.emoji}</span>
        <span class="pp-name">${key[lang] || key.he}</span>`;
      b.addEventListener('click', () => press(i));
      board.append(b);
    });

    const keyEls = [...board.querySelectorAll('.pp-key')];

    function sound(i) {
      const key = KEYS[i];
      EDSound.note(key.shape.map((m) => key.hz * m), {
        wave: key.wave, seconds: 0.5, gain: 0.16,
      });
    }

    function light(i, ms = 260) {
      const el = keyEls[i];
      el.classList.add('lit');
      later(() => el.classList.remove('lit'), ms);
    }

    /* ---- Free play: meet all eight ---- */

    function pressFree(i) {
      EDSound.wake();
      sound(i);
      light(i);
      if (met.has(i)) return;

      met.add(i);
      keyEls[i].classList.add('met');
      drawProgress(met.size, text.met(met.size, KEYS.length));
      hint(text.met(met.size, KEYS.length));
      if (met.size === KEYS.length) {
        locked = true;
        later(() => finish(text.metAll), 900);
      }
    }

    /* ---- Copy the tune ---- */

    function playTune() {
      EDSound.wake();
      locked = true;
      at = 0;
      hint(text.playing);
      tunes[tune].forEach((i, n) => {
        later(() => { sound(i); light(i, BEAT_MS - 90); }, n * BEAT_MS);
      });
      later(() => {
        locked = false;
        hint(text.yourTurn);
      }, tunes[tune].length * BEAT_MS);
    }

    function pressTune(i) {
      const wanted = tunes[tune];
      sound(i);

      if (i !== wanted[at]) {
        /* A wrong key still plays its animal — it is a piano, and pressing it
           should always do something. Nothing is counted and nothing is lost:
           the tune waits at the note it was waiting at. */
        const el = keyEls[i];
        el.classList.remove('nope');
        void el.offsetWidth;
        el.classList.add('nope');
        hint(text.notThat);
        return;
      }

      light(i);
      at += 1;
      if (at < wanted.length) return;

      /* Stays locked: the next tune has not been heard yet, and judging keys
         against a phrase nobody has played would be a trap. `playTune` is what
         unlocks the keyboard, and the Listen button is always there. */
      locked = true;
      tune += 1;
      drawProgress(tune, text.step(Math.min(tune + 1, steps), steps));
      if (tune >= tunes.length) return later(() => finish(text.playedAll), 800);
      later(() => hint(text.listenFirst), 800);
    }

    function press(i) {
      if (locked) return;
      if (tunes) pressTune(i); else pressFree(i);
    }

    function finish(line) {
      EDSound.hush();
      wrap.innerHTML = `
        <div class="pp-end">
          <div class="pp-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${line}</p>
          <div class="pp-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    if (tunes) {
      wrap.querySelector('[data-listen]').addEventListener('click', playTune);
      hint(text.listenFirst);
      /* Until the tune has been heard there is nothing to copy, so the keys
         wait rather than starting a round nobody has been asked for. */
      locked = true;
      drawProgress(0, text.step(1, steps));
    } else {
      drawProgress(0, text.met(0, KEYS.length));
      hint(text.met(0, KEYS.length));
    }
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
    EDSound.hush();
  }

  EDGames.register('piano-pets', { sets: SETS, mount, unmount });
})();
