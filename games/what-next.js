/* מה בא עכשיו? / What Comes Next? — finding the rule, the heart of logic.

   Nothing is told; the rule has to be read off what is on the screen. Patterns of
   shapes first, then jumps between numbers, then a three-by-three board where every
   row keeps one shape and every column keeps one colour, and one square is missing:
   two rules at once, the kind of question a reasoning test opens with.

   The shapes are drawn here rather than borrowed from emoji, so that a circle and
   a square of one colour are exactly the same size and colour on every machine.

   Sets: patterns, number jumps, the board. */

(function () {
  const SETS = [
    { id: 'patterns', emoji: '🔺', label: { he: 'סדרות של צורות', en: 'Shape patterns' }, mode: 'pattern' },
    { id: 'jumps', emoji: '🔢', label: { he: 'קפיצות של מספרים', en: 'Number jumps' }, mode: 'jump' },
    { id: 'board', emoji: '💡', label: { he: 'הלוח החסר', en: 'The missing square' }, mode: 'board' },
  ];

  const TEXT = {
    he: { pattern: 'מה בא עכשיו?', jump: 'מה המספר הבא?', board: 'מה חסר במשבצת?' },
    en: { pattern: 'What comes next?', jump: 'What is the next number?', board: 'What is missing from the square?' },
  };

  const COLOURS = ['#e53935', '#1e88e5', '#43a047', '#f5a623', '#8e24aa'];
  const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond'];

  function piece({ shape, colour }) {
    const body = {
      circle: '<circle cx="24" cy="24" r="19"/>',
      square: '<rect x="6" y="6" width="36" height="36" rx="5"/>',
      triangle: '<path d="M24 5 44 42H4z"/>',
      star: '<path d="M24 3l6.2 13.5 14.8 1.7-11 10 3 14.5L24 35.3 11 42.7l3-14.5-11-10 14.8-1.7z"/>',
      diamond: '<path d="M24 3 44 24 24 45 4 24z"/>',
    }[shape];
    return `<svg class="wn-piece" viewBox="0 0 48 48" aria-hidden="true" fill="${colour}">${body}</svg>`;
  }

  const same = (a, b) => a.shape === b.shape && a.colour === b.colour;

  const ROUNDS = 5;

  const CSS = `
    .wn-row { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; }
    .wn-cell { width: clamp(40px, 11.5vw, 66px); aspect-ratio: 1; display: grid; place-items: center; background: #f2f6fc; border-radius: 12px; font-size: clamp(1.4rem, 5vw, 2rem); font-weight: 700; color: var(--text); }
    .wn-cell.gap { background: none; border: 3px dashed var(--sub-solid); color: var(--sub-solid); }
    .wn-piece { width: 78%; height: 78%; display: block; }
    .wn-board { display: grid; grid-template-columns: repeat(3, auto); gap: 6px; }
    .wn-opts { gap: 8px; }
    .wn-opts .kit-opt { min-width: 70px; min-height: 70px; width: 70px; height: 70px; padding: 8px; font-size: 1.8rem; }
  `;

  const clock = EDKit.timers();

  /* ---- The three kinds of question: what is shown, the answer, wrong options ---- */

  const distinct = (list, n) => EDKit.shuffle(list).slice(0, n);

  function patternQuestion(round) {
    const shapes = distinct(SHAPES, 3);
    const colours = distinct(COLOURS, 3);
    const units = [
      [0, 1],           // A B
      [0, 1, 2],        // A B C
      [0, 0, 1],        // A A B
      [0, 1, 1],        // A B B
      [0, 1, 2, 1],     // A B C B
    ];
    const unit = units[Math.min(round, units.length - 1)];
    const at = (i) => ({ shape: shapes[unit[i % unit.length]], colour: colours[unit[i % unit.length]] });
    const shown = Array.from({ length: unit.length * 2 + 1 }, (_, i) => at(i));
    const answer = at(shown.length);
    const wrong = [0, 1, 2].map((k) => ({ shape: shapes[k], colour: colours[k] })).filter((p) => !same(p, answer));
    return {
      html: `<div class="wn-row">${shown.map((p) => `<div class="wn-cell">${piece(p)}</div>`).join('')}<div class="wn-cell gap">?</div></div>`,
      options: EDKit.shuffle([answer, ...wrong]).map((p) => ({ html: piece(p), right: same(p, answer), label: p.shape })),
      voice: 'next-ask',
    };
  }

  function jumpQuestion(round) {
    /* The jumps a child meets at school, gentlest first. The last goes down. */
    const steps = [2, 5, 10, 3, -1];
    const step = steps[Math.min(round, steps.length - 1)];
    const start = step < 0 ? 8 + Math.floor(Math.random() * 8) : step * (1 + Math.floor(Math.random() * 3));
    const shown = [0, 1, 2, 3].map((i) => start + i * step);
    const answer = start + 4 * step;
    const wrong = [answer + step, answer - 2 * step, answer + 1, answer - 1]
      .filter((n, i, all) => n > 0 && n !== answer && all.indexOf(n) === i && !shown.includes(n));
    const options = EDKit.shuffle([answer, ...EDKit.shuffle(wrong).slice(0, 3)]);
    return {
      html: `<div class="wn-row" dir="ltr">${shown.map((n) => `<div class="wn-cell">${n}</div>`).join('')}<div class="wn-cell gap">?</div></div>`,
      options: options.map((n) => ({ html: String(n), right: n === answer, label: String(n) })),
      voice: 'next-num',
    };
  }

  function boardQuestion() {
    const shapes = distinct(SHAPES, 3);
    const colours = distinct(COLOURS, 3);
    const missing = Math.floor(Math.random() * 9);
    const cell = (i) => ({ shape: shapes[Math.floor(i / 3)], colour: colours[i % 3] });
    const answer = cell(missing);
    /* Wrong in the row's rule, wrong in the column's rule, wrong in both. */
    const otherShape = shapes.find((s) => s !== answer.shape);
    const otherColour = colours.find((c) => c !== answer.colour);
    const wrong = [
      { shape: otherShape, colour: answer.colour },
      { shape: answer.shape, colour: otherColour },
      { shape: otherShape, colour: otherColour },
    ];
    return {
      html: `<div class="wn-board" dir="ltr">${Array.from({ length: 9 }, (_, i) => (i === missing ? '<div class="wn-cell gap">?</div>' : `<div class="wn-cell">${piece(cell(i))}</div>`)).join('')}</div>`,
      options: EDKit.shuffle([answer, ...wrong]).map((p) => ({ html: piece(p), right: same(p, answer), label: p.shape })),
      voice: 'next-board',
    };
  }

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const set = ctx.set || SETS[0];
    EDKit.style('wn-style', CSS);

    let round = 0;
    let busy = false;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    const ask = { pattern: patternQuestion, jump: jumpQuestion, board: boardQuestion }[set.mode];

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      busy = false;
      const q = ask(round);
      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(TEXT[lang][set.mode], lang)}
        ${q.html}
        <div class="kit-opts wn-opts" dir="ltr">
          ${q.options.map((o, i) => `<button type="button" class="kit-opt" data-i="${i}" aria-label="${o.label}">${o.html}</button>`).join('')}
        </div>`;
      EDKit.voice(wrap, q.voice, lang);
      wrap.querySelectorAll('.kit-opt').forEach((b) => b.addEventListener('click', () => {
        if (busy) return;
        const o = q.options[Number(b.dataset.i)];
        if (!o.right) { EDKit.nope(b); EDVoice.say('try-again', lang); return; }
        busy = true;
        EDKit.yes(b);
        const gap = wrap.querySelector('.wn-cell.gap');
        gap.classList.remove('gap');
        gap.innerHTML = o.html;
        EDKit.praise(lang);
        round += 1;
        clock.later(next, 1900);
      }));
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('what-next', { sets: SETS, mount, unmount });
})();
