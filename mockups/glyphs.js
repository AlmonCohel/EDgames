/* Seven drawn subject marks, as one SVG sprite.

   This file is the argument behind all three directions, so it is worth stating
   plainly: the reason the live grid looks unfinished is that every card's
   picture is an emoji, and an emoji is the machine's drawing, not ours — it
   differs on every device and it reads as a placeholder that nobody got round
   to replacing.

   The obvious fix is to draw nineteen pictures, one per game, and that is a
   real project. This is the cheap version of the same fix: draw seven, one per
   SUBJECT, and let colour and composition do the rest. A card then carries a
   mark that is ours, on a field that says what the game is about, and no two
   subjects look alike. Nineteen games become seven drawings — and every game
   added later inherits one for free.

   Stroke-based on purpose: one path set scales from a 28px chip to a 120px
   card panel, and takes its colour from `currentColor` so a mark is never
   hard-coded to a palette a direction might change. */

const EDGlyphs = (() => {
  /* 32×32 viewBox, 2.6 stroke, round caps — the same pen for all seven so they
     read as one family rather than seven clip-art finds. */
  const MARKS = {
    letters: `
      <path d="M16 10.8C13.4 8.3 10.3 7.2 6.2 7.2v16.4c4.1 0 7.2 1.1 9.8 3.6"/>
      <path d="M16 10.8c2.6-2.5 5.7-3.6 9.8-3.6v16.4c-4.1 0-7.2 1.1-9.8 3.6"/>
      <path d="M16 10.8V27.2"/>`,
    numbers: `
      <path d="M7 25V19M13.7 25v-9.5M20.3 25V12M27 25V8.5"/>
      <circle cx="7" cy="14.5" r="1.6" fill="currentColor" stroke="none"/>
      <circle cx="13.7" cy="11" r="1.6" fill="currentColor" stroke="none"/>
      <circle cx="20.3" cy="7.5" r="1.6" fill="currentColor" stroke="none"/>`,
    shapes: `
      <circle cx="11" cy="11" r="5.5"/>
      <path d="M21.5 5.5 27 16h-11z"/>
      <rect x="9" y="20" width="14" height="8" rx="2"/>`,
    memory: `
      <rect x="4.5" y="7" width="11" height="17" rx="2.5" transform="rotate(-7 10 15.5)"/>
      <rect x="16.5" y="8" width="11" height="17" rx="2.5" transform="rotate(7 22 16.5)"/>
      <path d="M20.2 15.2a2.6 2.6 0 1 1 2.4 3.6v1.6"/>`,
    nature: `
      <path d="M16 27V13"/>
      <path d="M16 15c0-4.5 3.2-8 8-8.5.6 4.8-2.4 8.8-8 9.2z"/>
      <path d="M16 21c-3.6 0-6.4-2.4-6.8-6 3.8-.4 6.6 1.8 6.8 5.2z"/>`,
    music: `
      <path d="M12.5 23V8l12-2.5V20"/>
      <ellipse cx="9.2" cy="23.4" rx="3.6" ry="3"/>
      <ellipse cx="21.2" cy="20.4" rx="3.6" ry="3"/>
      <path d="M12.5 12.5l12-2.5"/>`,
    computer: `
      <path d="M8 5.5 23 15.2l-6.6 1.4L13.9 23z"/>
      <path d="M24 22.5l3.2 3.2M20 26.4l1.2 1.2M27.4 18.2l1.4 1.4"/>`,
  };

  /* One hidden sprite per page; every mark is referenced by <use>, so a page
     with nineteen cards still parses seven drawings. */
  function sprite() {
    const symbols = Object.keys(MARKS).map((id) => `
      <symbol id="mark-${id}" viewBox="0 0 32 32">
        <g fill="none" stroke="currentColor" stroke-width="2.6"
           stroke-linecap="round" stroke-linejoin="round">${MARKS[id]}</g>
      </symbol>`).join('');
    return `<svg width="0" height="0" aria-hidden="true" style="position:absolute">${symbols}</svg>`;
  }

  /* Decorative by definition — the card already says the subject in words. */
  function mark(subject, cls) {
    const id = MARKS[subject] ? subject : 'shapes';
    return `<svg class="${cls || 'mark'}" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="#mark-${id}"/></svg>`;
  }

  function inject() {
    document.body.insertAdjacentHTML('afterbegin', sprite());
  }

  /* Seven marks across nineteen games means a subject's games would otherwise
     all wear the identical picture — which is most visible in direction 3,
     where a row IS a subject and four grey cursors in a line look like a
     rendering fault. So each game also gets one of four field compositions,
     picked off its id: where the oversized ghost mark bleeds in from, which way
     it leans, and whether the field carries a circle, a dot grid or stripes
     behind it. Same seven drawings, nineteen distinguishable covers, and a game
     keeps its own cover for good because the id never changes. */
  function variant(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return h % 4;
  }

  /* A second, independent axis: how heavy the field sits. Four compositions on
     their own still collide across a seven-game subject; four times three
     weights does not. A different multiplier, so tone and variant do not move
     together. */
  function tone(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i) * 7) >>> 0;
    return h % 3;
  }

  return { sprite, mark, inject, variant, tone };
})();
