/* The site's voice — tones worked out on the spot rather than played from files.

   Three of the games are about listening: an animal calls and you say who it
   was, a keyboard of animals is played, a drum beats a rhythm to copy. None of
   them can exist without sound, and this site has no build step and no asset
   pipeline — a folder of mp3s would be the first thing here that has to be
   fetched, cached and kept in step with the code. So the sounds are made by the
   browser out of an oscillator and a pitch curve, the same way the pictures are
   made out of an SVG path rather than a photograph.

   That has a limit worth saying plainly: a curve through an oscillator is a
   cartoon of a cow, not a recording of one. The game that guesses animals shows
   the call written out as well, so a child is never asked to recognise a sound
   this file cannot really make.

   A browser will not make a sound until the person has touched the page, so
   nothing here plays on its own. `wake()` is called from inside a real click —
   in practice the button the child presses to listen — and `running()` says
   whether a sound would be heard, so a game can tell "we have not been pressed
   yet" from "this browser has no audio at all".

     EDSound.wake();                          // from inside a click handler
     EDSound.note(440, { seconds: 0.4 });     // one pitch
     EDSound.note([300, 520, 240]);           // a pitch that slides through them
     EDSound.drum();                          // a beat
     EDSound.hush();                          // stop everything, on unmount

   Keep the volume low. This is played on a tablet held close to a child's
   face. */

const EDSound = (() => {
  let audio = null;
  let master = null;
  let broken = false;

  /* Everything still sounding, so unmount can silence a game mid-note instead
     of letting the last call follow the child back to the home screen. */
  const live = new Set();

  /* Nothing is ever scheduled for right now. The press that wakes the context
     is usually the same press that asks for a sound, and a note scheduled at
     exactly `currentTime` while the context is still coming out of suspend is
     the note that goes missing. A fiftieth of a second is inaudible as delay
     and there is no first sound to lose. */
  const LEAD = 0.02;

  function context() {
    if (broken) return null;
    if (audio) return audio;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) { broken = true; return null; }
    try {
      audio = new Ctor();
      master = audio.createGain();
      master.gain.value = 0.9;
      master.connect(audio.destination);
    } catch { broken = true; return null; }
    return audio;
  }

  /* Called from inside a click. Before that the context is created suspended
     and nothing it is handed is ever heard. */
  function wake() {
    const ac = context();
    if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
    return Boolean(ac);
  }

  const running = () => Boolean(audio) && audio.state === 'running';

  function track(node, endsAt) {
    live.add(node);
    node.onended = () => live.delete(node);
    /* Safari has been known not to fire onended on a stopped oscillator, so the
       set is swept on a timer as well as by the event. */
    setTimeout(() => live.delete(node), Math.max(0, endsAt * 1000 + 200));
  }

  /* pitch is one number, or a list the note slides through evenly across its
     length — which is all an animal call is: a shape drawn in frequency. */
  function note(pitch, opts = {}) {
    const ac = context();
    if (!ac) return;

    const {
      seconds = 0.4,
      wave = 'sine',
      gain = 0.22,
      delay = 0,
      attack = 0.014,
    } = opts;

    const start = ac.currentTime + Math.max(delay, LEAD);
    const osc = ac.createOscillator();
    const level = ac.createGain();
    osc.type = wave;

    const curve = Array.isArray(pitch) ? pitch : null;
    if (curve && curve.length > 1) {
      osc.frequency.setValueAtTime(curve[0], start);
      osc.frequency.setValueCurveAtTime(Float32Array.from(curve), start, seconds);
    } else {
      osc.frequency.setValueAtTime(curve ? curve[0] : pitch, start);
    }

    /* An exponential ramp cannot reach zero, so it is taken down to silence in
       all but name and the oscillator is stopped under it. */
    level.gain.setValueAtTime(0.0001, start);
    level.gain.exponentialRampToValueAtTime(gain, start + Math.min(attack, seconds / 2));
    level.gain.exponentialRampToValueAtTime(0.0001, start + seconds);

    osc.connect(level).connect(master);
    osc.start(start);
    osc.stop(start + seconds + 0.02);
    track(osc, delay + seconds);
  }

  /* A beat: a short burst of noise for the skin, and a low tone falling away
     under it for the drum's body. One without the other is a hiss or a thud. */
  function drum(opts = {}) {
    const ac = context();
    if (!ac) return;

    const { seconds = 0.22, gain = 0.34, pitch = 150, delay = 0 } = opts;
    const start = ac.currentTime + Math.max(delay, LEAD);

    const frames = Math.floor(ac.sampleRate * seconds);
    const buffer = ac.createBuffer(1, frames, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) {
      /* Faded out across the burst, or it reads as static rather than a hit. */
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
    }

    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const tame = ac.createBiquadFilter();
    tame.type = 'lowpass';
    tame.frequency.value = 1400;
    const noiseLevel = ac.createGain();
    noiseLevel.gain.value = gain * 0.5;
    noise.connect(tame).connect(noiseLevel).connect(master);
    noise.start(start);
    track(noise, delay + seconds);

    const body = ac.createOscillator();
    const bodyLevel = ac.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(pitch, start);
    body.frequency.exponentialRampToValueAtTime(pitch * 0.45, start + seconds);
    bodyLevel.gain.setValueAtTime(gain, start);
    bodyLevel.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    body.connect(bodyLevel).connect(master);
    body.start(start);
    body.stop(start + seconds + 0.02);
    track(body, delay + seconds);
  }

  /* A pitch curve that shakes around a middle — a bleat, a whinny, a buzz.
     Written as a helper so a game's animal table stays a table of numbers. */
  function wobble(middle, depth, cycles, points = 24) {
    return Array.from({ length: points }, (_, i) => {
      const at = i / (points - 1);
      return middle + Math.sin(at * cycles * Math.PI * 2) * depth;
    });
  }

  function hush() {
    live.forEach((node) => { try { node.stop(); } catch { /* already finished */ } });
    live.clear();
  }

  return { wake, running, note, drum, wobble, hush };
})();
