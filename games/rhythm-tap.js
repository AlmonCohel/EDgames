/* מוחאים בקצב / Clap the Beat — the drum plays a pattern and you give it back.

   A rhythm is written here as the gaps between the beats, not the beats: `[1, 2]`
   is three hits with a short wait and then a long one. That is the thing the
   game is actually about — how long you leave between claps — and writing it
   this way means the same pattern can be checked against a child who taps the
   whole thing twice as fast as it was played.

   Which is the important part. Judging a four-year-old against a metronome is
   judging them against the wrong thing: they have the rhythm right and their
   own tempo, and those are not the same mistake. So the check is done in the
   child's own time — their taps are measured end to end, that span is divided
   into as many units as the pattern has, and each gap is then only asked
   whether it was a short one or a long one. Play it twice as slowly and it is
   still right. Play four even claps where three were even and one was long, and
   it is not, and the drum says so by playing the pattern again.

   Nothing is ever counted against a child here. A miss replays the beat. */

(function () {
  /* Three runs, and the first is not an easier rhythm — it is a different
     question. Even gaps throughout, so all it asks is how many times, which is
     where a four-year-old starts. Shape only begins to matter in the second. */
  const SETS = [
    {
      id: 'count', emoji: '👏',
      label: { he: 'כמה פעמים', en: 'How many claps' },
      patterns: [[1], [1, 1], [1, 1, 1], [1, 1, 1, 1]], shape: false,
    },
    {
      id: 'longshort', emoji: '🥁',
      label: { he: 'קצר וארוך', en: 'Short and long' },
      patterns: [[1, 2], [2, 1], [1, 1, 2], [2, 1, 1], [1, 2, 1]], shape: true,
    },
    {
      id: 'longer', emoji: '🎼',
      label: { he: 'קצבים ארוכים', en: 'Longer beats' },
      patterns: [[1, 1, 2, 1], [2, 1, 1, 2], [1, 2, 1, 2], [1, 1, 2, 2, 1], [2, 2, 1, 1, 2]], shape: true,
    },
  ];

  const TEXT = {
    he: {
      step:      (n, of) => `שלב ${n} מתוך ${of}`,
      ask:       'מקשיבים לקצב ומוחאים אותו בחזרה',
      listenFirst: 'לוחצים על "לשמוע את הקצב" כדי להתחיל',
      playing:   'מקשיבים…',
      yourTurn:  (n) => `עכשיו אתם — ${n} פעמים על התוף`,
      tooFast:   'קצת מהר מדי. נשמע עוד פעם ומנסים לאט',
      notYet:    'כמעט! נשמע את הקצב עוד פעם',
      listen:    'לשמוע את הקצב 🎧',
      drum:      'התוף',
      wellDone:  'כל הכבוד!',
      tappedAll: 'מחאתם את כל הקצבים!',
      again:     'עוד פעם 🥁',
      exit:      'למשחק אחר',
    },
    en: {
      step:      (n, of) => `Step ${n} of ${of}`,
      ask:       'Listen to the beat, then clap it back',
      listenFirst: 'Press "Hear the beat" to begin',
      playing:   'Listening…',
      yourTurn:  (n) => `Your turn — ${n} taps on the drum`,
      tooFast:   'A bit too fast. Listen again and take your time',
      notYet:    'Nearly! Let us hear the beat once more',
      listen:    'Hear the beat 🎧',
      drum:      'the drum',
      wellDone:  'Well done!',
      tappedAll: 'You clapped every beat!',
      again:     'Again 🥁',
      exit:      'Another game',
    },
  };

  const ROUNDS = 4;
  /* One short gap. A long one is twice this — far enough apart that the
     difference is the thing you hear rather than a thing you measure. */
  const UNIT_MS = 430;
  /* A gap longer than this many units counts as a long one. Halfway between
     the two, so nothing has to be accurate — only nearer one than the other. */
  const LONG_AT = 1.5;
  /* Under this, the whole attempt was one flurry of taps and there is no tempo
     in it to divide up. Asked for again rather than guessed at. */
  const TOO_FAST_MS = 260;

  const CSS = `
    .rt { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .rt-progress { display: flex; gap: 9px; }
    .rt-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .rt-dot.done { background: var(--pos); }
    .rt-ask { text-align: center; }
    .rt-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .rt-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }

    .rt-drum {
      width: 190px; height: 190px; border-radius: 50%;
      display: grid; place-items: center; font-size: 76px; line-height: 1;
      background: var(--sub-solid, var(--accent-strong)); color: var(--on-accent);
      border: none; cursor: pointer;
      box-shadow: 0 12px 28px rgba(0,0,0,0.16);
      transition: transform 0.08s ease;
    }
    .rt-drum[disabled] { cursor: default; opacity: 0.75; }
    .rt-drum.hit { animation: rt-hit 0.2s ease; }
    @keyframes rt-hit { 40% { transform: scale(0.93); } }
    .rt-drum.nope { animation: rt-shake 0.4s ease; }
    @keyframes rt-shake { 25% { transform: translateX(-10px) rotate(-3deg); } 75% { transform: translateX(10px) rotate(3deg); } }

    /* One mark per tap the pattern wants, filling as they arrive, so a child
       can see how many are left without being able to count yet. */
    .rt-taps { display: flex; gap: 10px; min-height: 22px; align-items: center; }
    .rt-tap { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border); }
    .rt-tap.on { background: var(--pos); border-color: var(--pos); }

    .rt-listen { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    .rt-end { text-align: center; margin: auto; }
    .rt-end .rt-stars { font-size: 46px; letter-spacing: 4px; }
    .rt-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .rt-end p { color: var(--text-soft); margin: 0 0 22px; }
    .rt-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    @media (max-width: 560px) {
      .rt-drum { width: 156px; height: 156px; font-size: 62px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .rt-drum.hit, .rt-drum.nope { animation: none; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];

    if (!document.getElementById('rt-style')) {
      const style = document.createElement('style');
      style.id = 'rt-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    /* Four patterns a run, drawn from the set without repeating inside it. */
    const beats = shuffle(set.patterns).slice(0, Math.min(ROUNDS, set.patterns.length));

    let round = 0;
    let taps = [];
    /* The drum is deaf until the pattern has been heard — there is nothing to
       copy before that, and a tap judged against an unplayed beat is a trap. */
    let listening = false;

    const wrap = document.createElement('div');
    wrap.className = 'rt';
    root.append(wrap);

    wrap.innerHTML = `
      <div class="rt-progress" role="img"></div>
      <div class="rt-ask">
        <h2>${text.ask}</h2>
        <p class="rt-hint" aria-live="polite">${text.listenFirst}</p>
      </div>
      <div class="rt-taps" aria-hidden="true"></div>
      <button type="button" class="rt-drum" aria-label="${text.drum}" disabled>🥁</button>
      <div class="rt-listen"><button type="button" class="btn" data-listen>${text.listen}</button></div>`;

    const hint = (line) => { wrap.querySelector('.rt-hint').textContent = line; };
    const drum = wrap.querySelector('.rt-drum');
    const dots = wrap.querySelector('.rt-progress');
    const tapRow = wrap.querySelector('.rt-taps');

    const wanted = () => beats[round];
    const wantedTaps = () => wanted().length + 1;

    function drawProgress() {
      dots.setAttribute('aria-label', text.step(Math.min(round + 1, beats.length), beats.length));
      dots.innerHTML = beats.map((_, i) =>
        `<span class="rt-dot ${i < round ? 'done' : ''}"></span>`).join('');
    }

    function drawTaps() {
      tapRow.innerHTML = Array.from({ length: wantedTaps() }, (_, i) =>
        `<span class="rt-tap ${i < taps.length ? 'on' : ''}"></span>`).join('');
    }

    function thump() {
      drum.classList.remove('hit');
      void drum.offsetWidth;
      drum.classList.add('hit');
    }

    function playBeat() {
      EDSound.wake();
      listening = false;
      drum.disabled = true;
      taps = [];
      drawTaps();
      hint(text.playing);

      /* The hits are handed to the audio clock all at once so the rhythm is
         exact; the drum's flash follows on ordinary timers, which is close
         enough for something you watch. */
      let at = 0;
      for (let i = 0; i < wantedTaps(); i += 1) {
        EDSound.drum({ delay: at / 1000 });
        later(thump, at);
        at += (wanted()[i] || 0) * UNIT_MS;
      }

      later(() => {
        listening = true;
        drum.disabled = false;
        hint(text.yourTurn(wantedTaps()));
      }, at + 420);
    }

    function tap() {
      if (!listening) return;
      taps.push(performance.now());
      EDSound.drum();
      thump();
      drawTaps();
      if (taps.length >= wantedTaps()) judge();
    }

    /* The gaps the child left, read as shorts and longs in their own tempo
       rather than against the clock the pattern was played on. */
    function shapeOf(times) {
      const span = times.at(-1) - times[0];
      if (span < TOO_FAST_MS) return null;
      const unit = span / sum(wanted());
      return times.slice(1).map((t, i) => (t - times[i] > unit * LONG_AT ? 2 : 1));
    }

    function judge() {
      listening = false;
      drum.disabled = true;

      /* The first run only ever asks how many, and reaching this point is the
         answer to that. Nothing about its timing is looked at. */
      if (set.shape) {
        const heard = shapeOf(taps);
        if (!heard) return retry(text.tooFast);
        if (!heard.every((gap, i) => gap === wanted()[i])) return retry(text.notYet);
      }

      round += 1;
      drawProgress();
      hint('');
      if (round >= beats.length) return later(finish, 800);
      later(() => {
        taps = [];
        drawTaps();
        hint(text.listenFirst);
      }, 800);
    }

    /* Not a wrong answer — the same beat, played again, as many times as it
       takes. Nothing is counted and the run does not move on. */
    function retry(line) {
      drum.classList.remove('nope');
      void drum.offsetWidth;
      drum.classList.add('nope');
      hint(line);
      later(playBeat, 1100);
    }

    function finish() {
      EDSound.hush();
      wrap.innerHTML = `
        <div class="rt-end">
          <div class="rt-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.tappedAll}</p>
          <div class="rt-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    drum.addEventListener('click', tap);
    wrap.querySelector('[data-listen]').addEventListener('click', playBeat);
    drawProgress();
    drawTaps();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
    EDSound.hush();
  }

  EDGames.register('rhythm-tap', { sets: SETS, mount, unmount });
})();
