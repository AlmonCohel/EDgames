/* The site's own sound — a gentle tune on the home screen and a soft tap under
   every button, with one switch in the app bar that cycles through
   music → sounds only → quiet.

   Made the same way as everything else here: no audio files. The tune is a
   short pentatonic melody played by an oscillator "pluck" over a soft bass,
   scheduled a little ahead of time so it loops without gaps. Pentatonic so no
   two notes ever clash, slow and quiet so it sits under a child playing rather
   than on top of them.

   Rules it keeps:
   - Nothing sounds before the page is touched (no browser allows it anyway);
     the first press anywhere starts the tune if the switch says so.
   - The tune plays on the home screen and, since October 2026, under every
     game that has no sound of its own (catalog `sound: true` marks the ones
     that do — the listening games must not compete with it). A game opened
     from the home screen runs in a layer over it (assets/player.js), so the
     tune simply carries on; a game opened on its own plays it itself.
   - A spoken instruction ducks the tune while it is said (`duck()`).
   - The choice is remembered in localStorage, per browser, like the language.
   - A hidden tab goes quiet, and comes back where it was. */

const EDMusic = window.EDMusic = (() => {
  const KEY = 'edgames-sound';
  const STATES = ['all', 'effects', 'off'];
  let state = 'all';
  try { const s = localStorage.getItem(KEY); if (STATES.includes(s)) state = s; } catch { /* default */ }

  let ac = null, master = null, musicBus = null, fxBus = null;
  let wantsMusic = false;      // set by the page: only the home screen does
  let playing = false, timer = null, nextAt = 0, step = 0;

  function context() {
    if (ac) return ac;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ac = new Ctor();
      master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
      musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
      fxBus = ac.createGain(); fxBus.gain.value = 0.5; fxBus.connect(master);
    } catch { ac = null; }
    return ac;
  }

  /* ---- the tune ----
     C major pentatonic, two four-bar phrases, eighth notes at 96 bpm.
     0 is a rest; numbers are semitones above middle C. */
  const BPM = 96, EIGHTH = 60 / BPM / 2;
  const MELODY = [
    7, 0, 9, 7, 4, 0, 2, 0,   4, 7, 0, 9, 12, 0, 9, 0,
    7, 0, 4, 2, 0, 4, 7, 0,   2, 0, 4, 2, 0, 0, 0, 0,
    12, 0, 9, 12, 14, 0, 12, 0, 9, 7, 0, 9, 7, 0, 4, 0,
    7, 0, 9, 7, 4, 2, 0, 4,   0, 2, 0, 0, 0, 0, 0, 0,
  ];
  const BASS = [-12, -5, -3, -8];   // one per bar: C, G, A, E — the "I V vi iii" walk
  const hz = (semi) => 261.63 * Math.pow(2, semi / 12);

  function pluck(t, f, vol, len) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = f;
    o2.type = 'sine'; o2.frequency.value = f * 2;
    lp.type = 'lowpass'; lp.frequency.value = 2200;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + len);
    o.connect(g); o2.connect(g); g.connect(lp).connect(musicBus);
    o.start(t); o2.start(t); o.stop(t + len + 0.05); o2.stop(t + len + 0.05);
  }

  function schedule() {
    while (nextAt < ac.currentTime + 0.25) {
      const note = MELODY[step % MELODY.length];
      if (note) pluck(nextAt, hz(note), 0.16, EIGHTH * 2.4);
      if (step % 8 === 0) pluck(nextAt, hz(BASS[(step / 8) % BASS.length]), 0.22, EIGHTH * 7);
      if (step % 4 === 2) pluck(nextAt, hz(BASS[Math.floor(step / 8) % BASS.length] + 7), 0.08, EIGHTH * 2);
      nextAt += EIGHTH; step += 1;
    }
  }

  function startMusic() {
    if (playing || !wantsMusic || state !== 'all' || document.hidden) return;
    if (!context()) return;
    if (ac.state === 'suspended') ac.resume();
    playing = true;
    nextAt = ac.currentTime + 0.05;
    musicBus.gain.cancelScheduledValues(ac.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ac.currentTime);
    musicBus.gain.linearRampToValueAtTime(ducked ? 0.06 : 0.32, ac.currentTime + 1.5);   // fade in
    schedule();
    timer = setInterval(schedule, 100);
  }

  /* While a voice speaks the tune steps back, then returns. */
  let ducked = 0;
  function duck(on) {
    ducked = Math.max(0, ducked + (on ? 1 : -1));
    if (!ac || !playing) return;
    const t = ac.currentTime;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(musicBus.gain.value, t);
    musicBus.gain.linearRampToValueAtTime(ducked ? 0.06 : 0.32, t + 0.25);
  }

  function stopMusic() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    const t = ac.currentTime;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(musicBus.gain.value, t);
    musicBus.gain.linearRampToValueAtTime(0, t + 0.4);
  }

  /* ---- taps ---- */
  function tap(kind = 'tap') {
    if (state === 'off' || !context()) return;
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + 0.01, o = ac.createOscillator(), g = ac.createGain();
    const [a, b] = kind === 'open' ? [520, 880] : [700, 460];
    o.type = 'sine';
    o.frequency.setValueAtTime(a, t); o.frequency.exponentialRampToValueAtTime(b, t + 0.09);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.008); g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    o.connect(g).connect(fxBus); o.start(t); o.stop(t + 0.16);
  }

  /* ---- the switch ---- */
  const ICON = {
    all: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>',
    effects: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9.5a3.5 3.5 0 0 1 0 5"/></svg>',
    off: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M17 10l4 4M21 10l-4 4"/></svg>',
  };

  function paint(btn) {
    const name = EDLang.t(`sound.${state}`);
    btn.innerHTML = `${ICON[state]}<span>${name}</span>`;
    btn.setAttribute('aria-label', EDLang.t('sound.label').replace('{state}', name));
    btn.dataset.state = state;
  }

  function mount() {
    const btn = document.getElementById('sound-toggle');
    if (btn) {
      paint(btn);
      btn.addEventListener('click', () => {
        state = STATES[(STATES.indexOf(state) + 1) % STATES.length];
        try { localStorage.setItem(KEY, state); } catch { /* this visit only */ }
        paint(btn);
        if (state === 'all') startMusic(); else stopMusic();
        tap('open');
      });
    }

    /* Every press makes its small sound, and the first one also starts the tune. */
    document.addEventListener('pointerdown', (e) => {
      startMusic();
      if (e.target.closest('#sound-toggle')) return;
      if (e.target.closest('.tile, .continue, .cartridge, .play-launch-btn')) tap('open');
      else if (e.target.closest('button, .chip, .tab, .btn, .hw-btn, .age-btn, .channel-key, .bumper-btn, a')) tap();
    }, { capture: true });
    document.addEventListener('keydown', startMusic, { once: true });
    /* The switch on a game page and the one on the home screen are the same
       setting: a change in one window reaches the other through storage. */
    window.addEventListener('storage', (e) => {
      if (e.key !== KEY || !STATES.includes(e.newValue)) return;
      state = e.newValue;
      if (btn) paint(btn);
      if (state === 'all') startMusic(); else stopMusic();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopMusic(); else startMusic(); });
  }

  return {
    /* Called once per page. `music` is true on the home screen only. */
    init({ music = false } = {}) {
      wantsMusic = music;
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
      else mount();
    },
    tap,
    duck,
    /* The home screen turns the tune off while a game with its own sounds is
       in front, and back on when it is not. */
    want(on) {
      wantsMusic = Boolean(on);
      if (wantsMusic) startMusic(); else stopMusic();
    },
    get state() { return state; },
  };
})();
