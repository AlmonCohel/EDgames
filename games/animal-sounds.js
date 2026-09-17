/* מי אמר את זה? / Who Said That? — a call goes out and the child says whose it was.

   The site has no sound files and no way to fetch any, so every call here is
   drawn in frequency and played through `EDSound` — see the note at the top of
   `assets/sound.js`. An oscillator sliding from 180Hz down to 110 is a cartoon
   of a cow, not a cow, and asking a four-year-old to recognise a cartoon of a
   cow would be asking them to lose. So the call is also written out, the way it
   is written in a picture book — מו, Moo — and appears the moment the sound
   does. A child who cannot read still has the sound; a child who can has both;
   a tablet with no audio at all still has a game, which is the case the written
   line really earns its place in.

   Nothing plays until the speaker is pressed. That is the browser's rule about
   sound before a gesture, and it happens to be the right shape for the game
   anyway: pressing the speaker is the round starting. */

(function () {
  /* Each voice is a list of notes — a pitch or a pitch to slide through, and
     when it comes in. Two notes with a gap is a bark; eighteen wobbles around
     one pitch is a bee. */
  const ANIMALS = [
    {
      id: 'cow', emoji: '🐮', he: 'פרה', en: 'cow', says: { he: 'מוּ', en: 'Moo' },
      voice: [{ pitch: [186, 152, 124, 112], wave: 'sawtooth', seconds: 0.9, gain: 0.17 }],
    },
    {
      id: 'sheep', emoji: '🐑', he: 'כבשה', en: 'sheep', says: { he: 'מֶה', en: 'Baa' },
      voice: [{ pitch: EDSound.wobble(340, 34, 8), wave: 'sawtooth', seconds: 0.8, gain: 0.15 }],
    },
    {
      id: 'horse', emoji: '🐴', he: 'סוס', en: 'horse', says: { he: 'יְהַהַה', en: 'Neigh' },
      voice: [{
        pitch: [700, 660, 730, 630, 690, 590, 620, 530, 560, 470, 410, 370],
        wave: 'sawtooth', seconds: 0.95, gain: 0.14,
      }],
    },
    {
      id: 'hen', emoji: '🐔', he: 'תרנגולת', en: 'hen', says: { he: 'קוֹ קוֹ', en: 'Cluck' },
      voice: [
        { pitch: [540, 470], wave: 'square', seconds: 0.1, gain: 0.12 },
        { pitch: [540, 460], wave: 'square', seconds: 0.1, gain: 0.12, delay: 0.17 },
        { pitch: [560, 430], wave: 'square', seconds: 0.14, gain: 0.12, delay: 0.36 },
      ],
    },
    {
      id: 'duck', emoji: '🦆', he: 'ברווז', en: 'duck', says: { he: 'גַע גַע', en: 'Quack' },
      voice: [
        { pitch: [330, 250], wave: 'sawtooth', seconds: 0.14, gain: 0.15 },
        { pitch: [330, 240], wave: 'sawtooth', seconds: 0.16, gain: 0.15, delay: 0.24 },
      ],
    },
    {
      id: 'pig', emoji: '🐷', he: 'חזיר', en: 'pig', says: { he: 'אוֹינְק', en: 'Oink' },
      voice: [
        { pitch: [210, 300, 195], wave: 'sawtooth', seconds: 0.22, gain: 0.15 },
        { pitch: [205, 290, 190], wave: 'sawtooth', seconds: 0.24, gain: 0.15, delay: 0.32 },
      ],
    },
    {
      id: 'cat', emoji: '🐱', he: 'חתול', en: 'cat', says: { he: 'מִיאָאוּ', en: 'Meow' },
      voice: [{ pitch: [430, 720, 660, 420], wave: 'sawtooth', seconds: 0.7, gain: 0.14 }],
    },
    {
      id: 'dog', emoji: '🐶', he: 'כלב', en: 'dog', says: { he: 'הַב הַב', en: 'Woof' },
      voice: [
        { pitch: [320, 180], wave: 'square', seconds: 0.13, gain: 0.16 },
        { pitch: [310, 170], wave: 'square', seconds: 0.15, gain: 0.16, delay: 0.26 },
      ],
    },
    {
      id: 'bird', emoji: '🐦', he: 'ציפור', en: 'bird', says: { he: 'צִיוּ צִיוּ', en: 'Tweet' },
      voice: [
        { pitch: [2100, 3100], wave: 'sine', seconds: 0.09, gain: 0.1 },
        { pitch: [2200, 3200], wave: 'sine', seconds: 0.09, gain: 0.1, delay: 0.15 },
        { pitch: [2000, 2900], wave: 'sine', seconds: 0.11, gain: 0.1, delay: 0.3 },
      ],
    },
    {
      id: 'frog', emoji: '🐸', he: 'צפרדע', en: 'frog', says: { he: 'קְוָואק', en: 'Ribbit' },
      voice: [
        { pitch: [150, 108], wave: 'square', seconds: 0.18, gain: 0.15 },
        { pitch: [148, 104], wave: 'square', seconds: 0.2, gain: 0.15, delay: 0.3 },
      ],
    },
    {
      id: 'bee', emoji: '🐝', he: 'דבורה', en: 'bee', says: { he: 'זזזזז', en: 'Bzzz' },
      voice: [{ pitch: EDSound.wobble(195, 14, 20), wave: 'sawtooth', seconds: 1, gain: 0.11 }],
    },
    {
      id: 'lion', emoji: '🦁', he: 'אריה', en: 'lion', says: { he: 'רררר', en: 'Roar' },
      voice: [{ pitch: [118, 96, 84, 74, 70], wave: 'sawtooth', seconds: 1.2, gain: 0.2 }],
    },
  ];

  /* Three runs: the yard, the house and the garden, then everything at once
     with a fourth animal on the row — and a lion, who lives in neither and only
     turns up in the last one. */
  const SETS = [
    {
      id: 'farm', emoji: '🐮',
      label: { he: 'חיות בחצר', en: 'In the yard' },
      animals: ['cow', 'sheep', 'horse', 'hen', 'duck', 'pig'], options: 3,
    },
    {
      id: 'home', emoji: '🐱',
      label: { he: 'בבית ובגינה', en: 'House and garden' },
      animals: ['cat', 'dog', 'bird', 'frog', 'bee'], options: 3,
    },
    {
      id: 'all', emoji: '🦁',
      label: { he: 'כל החיות', en: 'Every animal' },
      animals: ANIMALS.map((a) => a.id), options: 4,
    },
  ];

  const TEXT = {
    he: {
      step:      (n, of) => `שלב ${n} מתוך ${of}`,
      ask:       'מי אמר את זה?',
      press:     'לוחצים על הרמקול כדי לשמוע',
      hearAgain: 'אפשר לשמוע שוב כמה פעמים שרוצים',
      tryAgain:  'לא זאת החיה. שומעים עוד פעם?',
      noSound:   'במכשיר הזה אין קול — הקול כתוב מתחת לרמקול.',
      speaker:   'להשמיע את הקול',
      wellDone:  'כל הכבוד!',
      foundAll:  'זיהיתם את כל החיות!',
      again:     'עוד פעם 🐮',
      exit:      'למשחק אחר',
    },
    en: {
      step:      (n, of) => `Step ${n} of ${of}`,
      ask:       'Who said that?',
      press:     'Press the speaker to listen',
      hearAgain: 'You can hear it again as often as you like',
      tryAgain:  'Not that one. Shall we listen again?',
      noSound:   'This device has no sound — the call is written under the speaker.',
      speaker:   'Play the sound',
      wellDone:  'Well done!',
      foundAll:  'You knew every animal!',
      again:     'Again 🐮',
      exit:      'Another game',
    },
  };

  const ROUNDS = 5;

  const CSS = `
    .an { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 8px 0 20px; width: 100%; }
    .an-progress { display: flex; gap: 9px; }
    .an-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--border); }
    .an-dot.done { background: var(--pos); }
    .an-ask { text-align: center; }
    .an-ask h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .an-hint { margin: 0; color: var(--text-soft); font-size: 0.95rem; min-height: 1.6em; }

    .an-listen {
      display: grid; place-items: center; gap: 10px;
      padding: 18px 24px; min-width: 210px;
      background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius);
    }
    .an-speaker {
      width: 112px; height: 112px; border-radius: 50%;
      display: grid; place-items: center; font-size: 46px; line-height: 1;
      background: var(--sub-ink, var(--accent-strong)); color: var(--on-accent);
      border: none; cursor: pointer;
      box-shadow: 0 10px 24px rgba(0,0,0,0.14);
      transition: transform 0.12s ease;
    }
    .an-speaker:hover { transform: translateY(-3px); }
    .an-speaker.calling { animation: an-pulse 0.5s ease; }
    @keyframes an-pulse { 50% { transform: scale(1.09); } }
    /* Kept in the layout while it is empty, so the panel does not jump taller
       the first time the call is played. */
    .an-says {
      font-family: "Rubik", sans-serif; font-weight: 700; font-size: 1.5rem;
      min-height: 1.5em; color: var(--text); visibility: hidden;
    }
    .an-says.shown { visibility: visible; }

    .an-animals { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }
    .an-animal {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      width: 118px; padding: 12px 8px;
      background: var(--bg-raise); border: 2px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); cursor: pointer;
      transition: transform 0.12s ease;
    }
    .an-animal:hover:not([disabled]) { transform: translateY(-3px); }
    .an-animal .an-face { font-size: 46px; line-height: 1; }
    .an-animal .an-name { font-size: 0.95rem; font-weight: 700; }
    .an-animal.yes { border-color: var(--pos); background: var(--sub-tint, var(--sel-tint)); }
    .an-animal.nope { animation: an-shake 0.36s ease; }
    @keyframes an-shake { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }

    .an-end { text-align: center; margin: auto; }
    .an-end .an-stars { font-size: 46px; letter-spacing: 4px; }
    .an-end h2 { margin: 10px 0 6px; font-size: 1.7rem; }
    .an-end p { color: var(--text-soft); margin: 0 0 22px; }
    .an-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    @media (max-width: 560px) {
      .an-speaker { width: 92px; height: 92px; font-size: 38px; }
      .an-animal { width: 96px; padding: 10px 6px; }
      .an-animal .an-face { font-size: 38px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .an-speaker.calling { animation: none; }
    }
  `;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const animalById = (id) => ANIMALS.find((a) => a.id === id);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    const cast = set.animals.map(animalById);
    const options = Math.min(set.options, cast.length);

    if (!document.getElementById('an-style')) {
      const style = document.createElement('style');
      style.id = 'an-style';
      style.textContent = CSS;
      document.head.append(style);
    }

    let round = 0;
    let target = null;
    let locked = false;
    /* A browser with no Web Audio at all. Told apart from "not pressed yet" so
       the game can say which it is rather than sitting there quietly. */
    let mute = false;

    const wrap = document.createElement('div');
    wrap.className = 'an';
    root.append(wrap);

    const hint = (line) => { wrap.querySelector('.an-hint').textContent = line; };

    function call() {
      const speaker = wrap.querySelector('.an-speaker');
      const says = wrap.querySelector('.an-says');

      /* The first press is also what lets this browser make a sound at all. */
      mute = !EDSound.wake();
      if (!mute) target.voice.forEach((n) => EDSound.note(n.pitch, n));

      says.classList.add('shown');
      hint(mute ? text.noSound : text.hearAgain);

      speaker.classList.remove('calling');
      void speaker.offsetWidth;
      speaker.classList.add('calling');
    }

    function nextRound() {
      if (round >= ROUNDS) return finish();

      locked = false;
      const picks = shuffle(cast).slice(0, options);
      target = picks[Math.floor(Math.random() * picks.length)];

      wrap.innerHTML = `
        <div class="an-progress" role="img" aria-label="${text.step(round + 1, ROUNDS)}">
          ${Array.from({ length: ROUNDS }, (_, i) => `<span class="an-dot ${i < round ? 'done' : ''}"></span>`).join('')}
        </div>
        <div class="an-ask">
          <h2>${text.ask}</h2>
          <p class="an-hint" aria-live="polite">${text.press}</p>
        </div>
        <div class="an-listen">
          <button type="button" class="an-speaker" aria-label="${text.speaker}">🔊</button>
          <span class="an-says" aria-live="polite">${target.says[lang] || target.says.he}</span>
        </div>
        <div class="an-animals"></div>`;

      wrap.querySelector('.an-speaker').addEventListener('click', call);

      const row = wrap.querySelector('.an-animals');
      shuffle(picks).forEach((animal) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'an-animal';
        b.innerHTML = `
          <span class="an-face" aria-hidden="true">${animal.emoji}</span>
          <span class="an-name">${animal[lang] || animal.he}</span>`;
        b.addEventListener('click', () => answer(b, animal));
        row.append(b);
      });

      /* Rounds after the first can start with the call already going, because
         by then the child has pressed something and the browser will let us. */
      if (EDSound.running()) call();
    }

    function answer(button, animal) {
      if (locked) return;

      if (animal.id !== target.id) {
        /* A wrong animal is another listen, not a mistake — nothing is counted
           and the call is still there to press. */
        button.classList.remove('nope');
        void button.offsetWidth;
        button.classList.add('nope');
        hint(text.tryAgain);
        return;
      }

      locked = true;
      round += 1;
      button.classList.add('yes');
      wrap.querySelectorAll('.an-animal').forEach((b) => { b.disabled = true; });
      hint('');
      later(nextRound, 700);
    }

    function finish() {
      wrap.innerHTML = `
        <div class="an-end">
          <div class="an-stars" aria-hidden="true">⭐⭐⭐</div>
          <h2>${text.wellDone}</h2>
          <p>${text.foundAll}</p>
          <div class="an-actions">
            <button type="button" class="btn" data-again>${text.again}</button>
            <button type="button" class="btn btn--ghost" data-exit>${text.exit}</button>
          </div>
        </div>`;
      wrap.querySelector('[data-again]').addEventListener('click', ctx.again);
      wrap.querySelector('[data-exit]').addEventListener('click', ctx.exit);
    }

    nextRound();
  }

  function unmount() {
    timers.forEach(clearTimeout);
    timers = [];
    /* A call left ringing would follow the child back to the home screen. */
    EDSound.hush();
  }

  EDGames.register('animal-sounds', { sets: SETS, mount, unmount });
})();
