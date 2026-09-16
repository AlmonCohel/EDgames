/* The site's own drawings: seven subject marks and the handful of interface
   icons the chrome needs, as one SVG sprite.

   This file is the argument behind all three directions, so it is worth stating
   plainly: the reason the live grid looks unfinished is that every card's
   picture is an emoji, and an emoji is the machine's drawing, not ours — it
   differs on every device and it reads as a placeholder that nobody got round
   to replacing.

   The obvious fix is to draw nineteen pictures, one per game. That is a real
   project and it now exists, in `scenes.js`. What stayed here is the seven:
   one drawing per SUBJECT, which is a different job and still a needed one —
   it is what the rail chips wear, what bleeds across a card as the ghost
   behind the game's own picture, and what a game whose scene has yet to be
   drawn borrows in the meantime.

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

  /* The interface icons — the bottom bar, the search box, the language toggle,
     the way back out of a game. Drawn on a 24 viewBox with a lighter pen than
     the marks, because these are furniture and the marks are the artwork. The
     chrome used to be emoji here too, which is the same fault one size down:
     the bar looked different on every machine it was opened on. */
  const ICONS = {
    home:   `<path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>`,
    age:    `<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M8 9h8M8 13h5"/>`,
    search: `<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/>`,
    globe:  `<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5c-2.6 2.4-2.6 14.6 0 17M12 3.5c2.6 2.4 2.6 14.6 0 17M3.9 9h16.2M3.9 15h16.2"/>`,
    back:   `<path d="M19 12H5M11 6l-6 6 6 6"/>`,
  };

  /* One hidden sprite per page; every drawing is referenced by <use>, so a page
     with nineteen tiles still parses seven marks. */
  function sprite() {
    const symbols = Object.keys(MARKS).map((id) => `
      <symbol id="mark-${id}" viewBox="0 0 32 32">
        <g fill="none" stroke="currentColor" stroke-width="2.6"
           stroke-linecap="round" stroke-linejoin="round">${MARKS[id]}</g>
      </symbol>`).join('');
    const icons = Object.keys(ICONS).map((id) => `
      <symbol id="ico-${id}" viewBox="0 0 24 24">${ICONS[id]}</symbol>`).join('');
    return `<svg width="0" height="0" aria-hidden="true" style="position:absolute">${symbols}${icons}</svg>`;
  }

  /* Decorative by definition — the card already says the subject in words. */
  function mark(subject, cls) {
    const id = MARKS[subject] ? subject : 'shapes';
    return `<svg class="${cls || 'mark'}" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="#mark-${id}"/></svg>`;
  }

  /* Same rule: every control carrying one also carries its name in text or in
     an aria-label, so the drawing never has to be read. */
  function icon(name, cls) {
    return `<svg class="${cls || 'ico'}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-${name}"/></svg>`;
  }

  function inject() {
    document.body.insertAdjacentHTML('afterbegin', sprite());
  }

  /* Each game also gets one of four field compositions, picked off its id:
     where the oversized ghost mark bleeds in from, which way it leans, and
     whether the field carries a circle, a dot grid or stripes behind it. This
     began as the answer to seven marks across nineteen games — a row IS a
     subject here, and four grey cursors in a line look like a rendering fault.
     The picture on top is the game's own now, so the field is texture rather
     than the thing that tells two tiles apart; it is kept because a shelf of
     one flat colour is duller than a shelf that varies, and a game keeps its
     own field for good because the id never changes. */
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

  /* Which cover each game actually wears, decided across the whole catalog
     rather than one game at a time.

     Two hashes over four compositions and three weights is not enough on its
     own: a subject holds up to seven games, and the ids in one subject are
     alike enough to clump — all four keyboard-and-mouse games hash to the same
     composition, and two of them to the same weight as well. A shelf of four
     identical covers is the exact rendering fault this scheme exists to avoid.

     So the hash is a preference, not an answer. A game takes a composition no
     other game on its shelf is using yet, closest to the one it hashed to, and
     only starts sharing compositions — separated by weight — once all four are
     spoken for. A game's cover is still fixed for good, unless a game is one
     day added to the same subject ahead of it. */
  function covers(games) {
    const shelves = {};
    const out = new Map();

    games.forEach((g) => {
      const shelf = shelves[g.subject] || (shelves[g.subject] = { variants: new Set(), pairs: new Set() });
      const v0 = variant(g.id);
      const t0 = tone(g.id);
      let picked = null;

      for (let dv = 0; dv < 4 && !picked; dv++) {
        const v = (v0 + dv) % 4;
        if (shelf.variants.size < 4 && shelf.variants.has(v)) continue;
        for (let dt = 0; dt < 3; dt++) {
          const t = (t0 + dt) % 3;
          if (!shelf.pairs.has(v * 3 + t)) { picked = { variant: v, tone: t }; break; }
        }
      }

      /* A subject past twelve games has run out of distinct covers. Let them
         repeat rather than leave one undrawn. */
      if (!picked) picked = { variant: v0, tone: t0 };

      shelf.variants.add(picked.variant);
      shelf.pairs.add(picked.variant * 3 + picked.tone);
      out.set(g.id, picked);
    });

    return out;
  }

  return { sprite, mark, icon, inject, variant, tone, covers };
})();
