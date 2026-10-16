/* זחל ה-ABC / The ABC Caterpillar — which letter comes next.

   A caterpillar is made of letters in ABC order, one per body segment, and one
   segment is empty. The child picks the missing letter from the leaves below.
   When it is right the whole caterpillar is read out, letter by letter, and it
   wiggles off — so the order is heard every round, not just seen.

   English alphabet in both languages. The caterpillar crawls left to right,
   the way English is written, whatever the page's direction.

   Sets: the start of the alphabet (A–G), anywhere in it, and two letters missing. */

(function () {
  const ABC = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  const SETS = [
    { id: 'start', emoji: '🐛', label: { he: 'A עד G', en: 'A to G' }, from: 0, to: 7, len: 4, gaps: 1 },
    { id: 'any', emoji: '🍃', label: { he: 'בכל מקום', en: 'Anywhere' }, from: 0, to: 26, len: 5, gaps: 1 },
    { id: 'two', emoji: '🦋', label: { he: 'שתי אותיות חסרות', en: 'Two missing' }, from: 0, to: 26, len: 6, gaps: 2 },
  ];

  const TEXT = {
    he: { ask: 'איזו אות חסרה בזחל?' },
    en: { ask: 'Which letter is missing from the caterpillar?' },
  };

  const ROUNDS = 5;
  const HUES = ['#7bd96b', '#5cc94e', '#9be27f', '#4fbf6a'];

  const CSS = `
    .ac-garden { direction: ltr; width: min(100%, 700px); border-radius: var(--radius); padding: 22px 10px; overflow: hidden;
      background: linear-gradient(180deg, #e5f8ff, #c9f0c2 60%, #94d97f); display: grid; justify-items: center; }
    .ac-body { display: flex; align-items: center; gap: 0; transition: transform 1.2s ease-in; }
    .ac-body.go { transform: translateX(120%); }
    .ac-head { width: 70px; height: 70px; border-radius: 50%; background: #ff6f91; position: relative; margin-inline-start: -8px; order: 99; box-shadow: inset -6px -6px 0 rgba(0,0,0,.1); }
    .ac-head::before, .ac-head::after { content: ''; position: absolute; top: 22px; width: 12px; height: 12px; border-radius: 50%; background: #1e2a44; box-shadow: inset 3px -3px 0 #fff; }
    .ac-head::before { left: 34px; } .ac-head::after { left: 50px; }
    .ac-head i { position: absolute; top: -18px; left: 30px; width: 3px; height: 20px; background: #1e2a44; transform: rotate(-15deg); }
    .ac-head i + i { left: 48px; transform: rotate(15deg); }
    .ac-seg { width: clamp(46px, 12vw, 66px); aspect-ratio: 1; border-radius: 50%; margin-inline-start: -6px; display: grid; place-items: center;
      font: 700 clamp(1.5rem, 5vw, 2.3rem)/1 Fredoka, sans-serif; color: #1e5a2a; box-shadow: inset -5px -6px 0 rgba(0,0,0,.1); }
    .ac-seg.gap { background: rgba(255,255,255,.55) !important; border: 3px dashed #4fbf6a; color: transparent; }
    .ac-seg.lit { animation: kit-pop .4s ease; }
    .ac-leaves { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .ac-leaves .kit-opt { border-radius: 50% 6px 50% 6px; background: #5cc94e; color: #fff; border-color: #3fa63a; box-shadow: 0 6px 0 #2f8a2c; font-family: Fredoka, sans-serif; }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('ac-style', CSS);

    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const start = set.from + Math.floor(Math.random() * (set.to - set.from - set.len + 1));
      const run = ABC.slice(start, start + set.len);
      /* Gaps never on the first letter, so there is always somewhere to start counting from. */
      const gapAt = EDKit.shuffle(run.map((_, i) => i).slice(1)).slice(0, set.gaps).sort((a, b) => a - b);
      let filled = 0;
      const want = () => run[gapAt[filled]];
      /* Wrong leaves are letters close by in the alphabet and not already on
         the caterpillar, which is what makes the order the question. */
      const decoys = () => {
        const shown = run.filter((_, i) => !gapAt.slice(filled).includes(i));
        const w = ABC.indexOf(want());
        return EDKit.shuffle(ABC.filter((l, i) => l !== want() && !shown.includes(l) && Math.abs(i - w) <= 4)).slice(0, 2);
      };

      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(text.ask, lang)}
        <div class="ac-garden">
          <div class="ac-body">
            ${run.map((l, i) => `<span class="ac-seg${gapAt.includes(i) ? ' gap' : ''}" data-i="${i}" style="background:${HUES[i % HUES.length]}">${l}</span>`).join('')}
            <span class="ac-head" aria-hidden="true"><i></i><i></i></span>
          </div>
        </div>
        <div class="ac-leaves"></div>`;
      EDKit.voice(wrap, 'cat-ask', lang);

      function leaves() {
        const opts = EDKit.shuffle([want(), ...decoys()]);
        const row = wrap.querySelector('.ac-leaves');
        row.innerHTML = opts.map((l) => `<button type="button" class="kit-opt" data-l="${l}">${l}</button>`).join('');
        row.querySelectorAll('.kit-opt').forEach((b) => b.addEventListener('click', () => {
          const l = b.dataset.l;
          EDVoice.say(EDVoiceLines.letter(l), lang);
          if (l !== want()) { EDKit.nope(b); return; }
          const seg = wrap.querySelector(`.ac-seg[data-i="${gapAt[filled]}"]`);
          seg.classList.remove('gap');
          seg.classList.add('lit');
          filled += 1;
          if (filled < gapAt.length) { leaves(); return; }
          row.querySelectorAll('.kit-opt').forEach((o) => { o.disabled = true; });
          /* Read the whole caterpillar out, then off it goes. */
          clock.later(() => {
            EDVoice.say(run.map((x) => EDVoiceLines.letter(x)), lang);
            run.forEach((_, i) => clock.later(() => { const s = wrap.querySelector(`.ac-seg[data-i="${i}"]`); if (s) { s.classList.remove('lit'); void s.offsetWidth; s.classList.add('lit'); } }, i * 650));
          }, 500);
          clock.later(() => { wrap.querySelector('.ac-body').classList.add('go'); }, 700 + run.length * 650);
          clock.later(() => { round += 1; next(); }, 2100 + run.length * 650);
        }));
      }
      leaves();
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('abc-caterpillar', { sets: SETS, mount, unmount });
})();
