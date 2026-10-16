/* The site's spoken voice — instructions, letter names and numbers said out
   loud, for the children who cannot read yet (which, at three to five, is most
   of them).

   Every line is a small recording under assets/voice/<lang>/<key>.mp3, made
   from the text in assets/voice-lines.js by scripts/make-voice.mjs (macOS
   voices: Carmit for Hebrew, Samantha for English). A line with no recording,
   or a page opened as a file where nothing can be fetched, falls back to the
   browser's own speech in the same words — and stays silent rather than read
   Hebrew in an English voice.

     EDVoice.say('trace.ask', 'he');                    // one line
     EDVoice.say(['letter.bet', 'hop.go'], 'he');       // a sentence in pieces
     EDVoice.say([{ key: 'letter.a', lang: 'en' }], 'he');
     EDVoice.stop();

   `say` resolves to true when it was heard and false when the browser would
   not play it yet (no touch on this page) — a game then makes its speaker
   button bounce so the child presses it. The switch's "quiet" silences the
   voice too. While it speaks, the site's tune steps back. */

const EDVoice = window.EDVoice = (() => {
  let seq = 0;

  /* The tune lives on the home screen when the game runs in its layer. */
  function tune() {
    try { if (window.EDPause && EDPause.embedded && parent.EDMusic) return parent.EDMusic; } catch { /* other origin */ }
    return window.EDMusic || null;
  }

  const lineText = (lang, key) => ((window.EDVoiceLines || {})[lang] || {})[key] || '';
  const fileFor = (lang, key) => `assets/voice/${lang}/${key}.mp3`;

  function browserSpeech(text, lang) {
    return new Promise((done) => {
      const ss = window.speechSynthesis;
      if (!ss || !text) return done();
      const prefix = lang === 'he' ? 'he' : 'en';
      const voice = ss.getVoices().find((v) => v.lang.toLowerCase().startsWith(prefix) || (prefix === 'he' && v.lang.startsWith('iw')));
      if (!voice && prefix === 'he') return done();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = prefix === 'he' ? 'he-IL' : 'en-US';
      if (voice) u.voice = voice;
      u.rate = 0.9;
      const t = setTimeout(done, 8000);
      u.onend = u.onerror = () => { clearTimeout(t); done(); };
      ss.speak(u);
    });
  }

  /* Waits a moment for the audio to be allowed; false if it never is. */
  function ready() {
    if (!EDSound.wake()) return Promise.resolve(false);
    if (EDSound.running()) return Promise.resolve(true);
    return new Promise((ok) => {
      let n = 0;
      const t = setInterval(() => {
        n += 1;
        if (EDSound.running()) { clearInterval(t); ok(true); } else if (n > 8) { clearInterval(t); ok(false); }
      }, 40);
    });
  }

  async function say(items, lang = 'he') {
    stop();
    const mine = seq;
    if (EDSound.quiet()) return true;
    const list = (Array.isArray(items) ? items : [items])
      .map((it) => (typeof it === 'string' ? { key: it, lang } : { lang, ...it }));
    if (!(await ready())) return false;
    if (mine !== seq) return true;
    const t = tune();
    if (t) t.duck(true);
    try {
      for (const it of list) {
        if (mine !== seq) break;
        try {
          await EDSound.sample(fileFor(it.lang, it.key), { tag: 'voice', gain: 1 });
        } catch {
          await browserSpeech(lineText(it.lang, it.key), it.lang);
        }
      }
    } finally {
      if (t) t.duck(false);
    }
    return true;
  }

  function stop() {
    seq += 1;
    EDSound.hush('voice');
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch { /* none */ }
  }

  /* Loads a few lines ahead so the first instruction is not late. */
  function warm(keys, lang = 'he') {
    keys.forEach((k) => { EDSound.load(fileFor(lang, k)).catch(() => {}); });
  }

  window.addEventListener('edpause', stop);

  return { say, stop, warm, text: lineText };
})();
