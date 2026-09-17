/* One drawing per game — the picture a child reads instead of pressing a tile
   to find out what is behind it.

   `glyphs.js` draws seven subject marks and says so plainly: the real fix is a
   picture per game, and seven marks plus a patterned field was the cheap
   version of it. This file is the real fix. A subject is still a mark; a game
   is now a scene of its own — balloons and a burst for Color Pop, a duck on the
   water for Counting Ducks, a staircase with one step missing for The Tower
   Stairs. Nothing here says what a game is called, because the title sits
   directly under it; a scene only has to say what happens in the game.

   Same pen as the marks, one step lighter — 32×32, round caps, 2.2 rather than
   2.6, because a scene carries more lines in the same square than a mark does.
   Colour comes from `currentColor`, so a scene is white on its subject's field
   and takes any other colour it is ever put on without being redrawn.

   A game with no scene here falls back to its subject's mark, so adding a game
   to the catalog never leaves an empty square — see `picture()`. */

const EDScenes = (() => {
  const SCENES = {
    /* A balloon on its string — knot and all, or it is a magnifying glass —
       and the one next to it going pop. */
    'color-pop': `
      <ellipse cx="10.5" cy="12" rx="6" ry="7.5"/>
      <path d="M9 19.4h3l-1.5 2.2z" fill="currentColor" stroke="none"/>
      <path d="M10.5 21.6c0 1.8-2.2 2-2.2 3.8s1.8 1.8 1.8 3.4"/>
      <path d="M23.5 6.4v3.2M23.5 16.6v3.2M17.4 13h3.2M26.4 13h3.2
               M19.2 8.7l2.3 2.3M27.8 8.7l-2.3 2.3M19.2 17.3l2.3-2.3M27.8 17.3l-2.3-2.3"/>`,

    /* A duck on the lake, with something to count above it. */
    'count-the-ducks': `
      <path d="M7 21.4c0-3.4 3.1-6 7-6 4.3 0 7.4 2.3 7.4 5.4 0 1.9-1.5 3-3.6 3H10c-1.7 0-3-1-3-2.4z"/>
      <circle cx="19.8" cy="13.2" r="3.4"/>
      <path d="M23.2 12.4l3.6 1.1-3.4 1.6z"/>
      <path d="M4 26.4c1.9-1.3 3.4-1.3 5.3 0s3.4 1.3 5.3 0 3.4-1.3 5.3 0 3.4 1.3 5.3 0"/>
      <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="10.5" cy="6" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="6" r="1.5" fill="currentColor" stroke="none"/>`,

    /* The sorting board with its three holes, and the round piece on its way
       into the one that fits. The holes are dashed because solid outlines read
       as three things already sitting on a panel, which is the opposite of
       what the game asks. Dashed means "nothing there yet" everywhere below. */
    'shape-match': `
      <rect x="2.5" y="15.5" width="27" height="13" rx="2.6"/>
      <circle cx="8.6" cy="22" r="3.1" stroke-dasharray="2.4 2"/>
      <rect x="14.9" y="18.9" width="6.2" height="6.2" rx="1.2" stroke-dasharray="2.4 2"/>
      <path d="M24.9 18.7l3.3 6.4h-6.6z" stroke-dasharray="2.4 2"/>
      <circle cx="8.6" cy="5.2" r="3.4" fill="currentColor" stroke="none"/>
      <path d="M8.6 9.2v2.6M5.9 10.4 8.6 13.1l2.7-2.7"/>`,

    /* An animal, and the sound coming out of it. */
    'animal-sounds': `
      <circle cx="12" cy="16.5" r="6.6"/>
      <path d="M8.2 11.4 6.6 6.2l5 2.6zM15.8 11.4 17.4 6.2l-5 2.6z"/>
      <circle cx="10" cy="15.5" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="14.6" cy="15.5" r="1.3" fill="currentColor" stroke="none"/>
      <path d="M20.6 12.4a6.5 6.5 0 0 1 0 8.6M24.4 9.4a11 11 0 0 1 0 14.6"/>`,

    /* Piano keys with a paw over them. */
    'piano-pets': `
      <rect x="3" y="14.5" width="26" height="13" rx="2.4"/>
      <path d="M11.7 14.5v13M20.3 14.5v13"/>
      <rect x="8.6" y="14.5" width="3.4" height="7" rx="0.8" fill="currentColor" stroke="none"/>
      <rect x="17.2" y="14.5" width="3.4" height="7" rx="0.8" fill="currentColor" stroke="none"/>
      <path d="M12.6 9.4c0-2 1.5-3.4 3.4-3.4s3.4 1.4 3.4 3.4c0 1.7-1.5 2.6-3.4 2.6s-3.4-.9-3.4-2.6z"/>
      <circle cx="11.4" cy="4.8" r="1.4" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="3.2" r="1.4" fill="currentColor" stroke="none"/>
      <circle cx="20.6" cy="4.8" r="1.4" fill="currentColor" stroke="none"/>`,

    /* Two cards turned over carrying the same thing, and one still face down
       between them. The back is the patterned grid a real card back has —
       drawn as crossed lines it read as a card struck through, which is a
       different thing entirely. */
    'memory-pairs': `
      <rect x="1.4" y="7.5" width="8.8" height="17" rx="2"/>
      <rect x="11.6" y="7.5" width="8.8" height="17" rx="2"/>
      <rect x="21.8" y="7.5" width="8.8" height="17" rx="2"/>
      <circle cx="5.8" cy="16" r="2.7" fill="currentColor" stroke="none"/>
      <circle cx="26.2" cy="16" r="2.7" fill="currentColor" stroke="none"/>
      <circle cx="14.4" cy="12.4" r="0.95" fill="currentColor" stroke="none"/>
      <circle cx="17.6" cy="12.4" r="0.95" fill="currentColor" stroke="none"/>
      <circle cx="14.4" cy="16" r="0.95" fill="currentColor" stroke="none"/>
      <circle cx="17.6" cy="16" r="0.95" fill="currentColor" stroke="none"/>
      <circle cx="14.4" cy="19.6" r="0.95" fill="currentColor" stroke="none"/>
      <circle cx="17.6" cy="19.6" r="0.95" fill="currentColor" stroke="none"/>`,

    /* A drum, two sticks coming down on it, and the beat underneath. */
    'rhythm-tap': `
      <ellipse cx="16" cy="13.4" rx="9.5" ry="3.6"/>
      <path d="M6.5 13.4v6.2c0 2 4.3 3.6 9.5 3.6s9.5-1.6 9.5-3.6v-6.2"/>
      <path d="M7.6 3.4 12.4 8.6M24.4 3.4 19.6 8.6"/>
      <circle cx="7" cy="26.6" r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="26.6" r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="17" cy="26.6" r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="22" cy="26.6" r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="27" cy="26.6" r="1.1" fill="currentColor" stroke="none"/>`,

    /* The mouse itself, wheel and all, being moved. */
    'mouse-moves': `
      <rect x="10" y="7.5" width="12.6" height="20" rx="6.3"/>
      <path d="M16.3 7.6v4.6"/>
      <path d="M6.8 13a5.6 5.6 0 0 0 0 9M3.6 10.4a9.5 9.5 0 0 0 0 14.2"/>`,

    /* The trail home, one turn at a time, and the arrow that walks it. */
    'arrow-trail': `
      <path d="M4 26.5h4.5v-4.5h4.5V17h3.4"/>
      <path d="M16.2 14.6 18.8 17l-2.6 2.4"/>
      <path d="M19.4 20.4 24.2 16l4.8 4.4V27h-9.6z"/>
      <path d="M22.4 27v-4.2h3.6V27"/>`,

    /* Three pictures of the tale, and the order they go in. */
    'story-order': `
      <rect x="2.5" y="7" width="8.4" height="10.6" rx="2"/>
      <rect x="11.8" y="7" width="8.4" height="10.6" rx="2"/>
      <rect x="21.1" y="7" width="8.4" height="10.6" rx="2"/>
      <circle cx="6.7" cy="12.3" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="14.4" cy="12.3" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="17.6" cy="12.3" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="22.8" cy="12.3" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="25.3" cy="12.3" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="27.8" cy="12.3" r="1.3" fill="currentColor" stroke="none"/>
      <path d="M4 24h22.6"/>
      <path d="M23.8 21.2 26.8 24l-3 2.8"/>`,

    /* A puzzle piece — knob one side, socket the other, or it is only a square
       — and the park it belongs to. */
    'puzzle-park': `
      <path d="M2.5 4.5h10.5v3.1a2.1 2.1 0 0 1 0 4.2V15H2.5v-3.1a2.1 2.1 0 0 0 0-4.2z"/>
      <path d="M22.5 11 27 18h-9z"/>
      <path d="M22.5 15.5 28.6 24H16.4z"/>
      <path d="M22.5 24v3.6"/>`,

    /* A wall of letters with the glass over the one being hunted. */
    'letter-hunt': `
      <rect x="3" y="4.5" width="6.2" height="6.2" rx="1.5"/>
      <rect x="10.4" y="4.5" width="6.2" height="6.2" rx="1.5"/>
      <rect x="17.8" y="4.5" width="6.2" height="6.2" rx="1.5"/>
      <rect x="3" y="12" width="6.2" height="6.2" rx="1.5"/>
      <rect x="10.4" y="12" width="6.2" height="6.2" rx="1.5"/>
      <circle cx="22" cy="20.6" r="6.3"/>
      <path d="M26.5 25 29.4 27.9"/>`,

    /* The wizard's hat, a sparkle either side, and the empty place in the
       spell. */
    'wizard-spell': `
      <path d="M9 18.6 16 4l7 14.6z"/>
      <path d="M6.6 19.2h18.8"/>
      <circle cx="16" cy="13.5" r="1.4" fill="currentColor" stroke="none"/>
      <rect x="12.6" y="22.4" width="6.8" height="6.4" rx="1.6" stroke-dasharray="3 2.6"/>
      <path d="M26 8.4v3.2M24.4 10h3.2M5.4 9v2.6M4.1 10.3h2.6"/>`,

    /* The tower's stairs, with the one that vanished drawn as a gap. */
    'tower-steps': `
      <path d="M2 28h5v-5h5v-5"/>
      <path d="M12 18h5v-5" stroke-dasharray="3 2.6"/>
      <path d="M17 13h5v-5h5"/>
      <path d="M27 8V4.2"/>
      <path d="M27 4.4l3 1.2-3 1.3z"/>`,

    /* The keyboard, and the key we asked for. */
    'keyboard-keys': `
      <rect x="2.5" y="11" width="27" height="16" rx="2.6"/>
      <path d="M5.5 16h2.6M18.6 16h2.6M23.6 16h2.6"/>
      <rect x="10.6" y="13.8" width="5.6" height="4.6" rx="1.2" fill="currentColor" stroke="none"/>
      <path d="M5.5 21h2.6M10 21h2.6M14.5 21h2.6M19 21h2.6M23.5 21h2.6"/>
      <path d="M13.4 3.4v3.6M11.3 5.2 13.4 7.4l2.1-2.2"/>`,

    /* The ladybird, with the arrow already on it. */
    'click-catch': `
      <circle cx="12.6" cy="16.4" r="7.4"/>
      <path d="M12.6 9v14.8"/>
      <path d="M8.8 10.6a5.4 5.4 0 0 1 7.6 0"/>
      <path d="M9.8 8.2 8.2 5.2M15.4 8.2l1.6-3"/>
      <circle cx="9" cy="14.4" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="16.2" cy="14.6" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="9.4" cy="19.6" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="19.8" r="1.3" fill="currentColor" stroke="none"/>
      <path d="M18.6 17.6 27.4 22.8l-3.4.9-1 3.4z"/>`,

    /* Sun, cloud and rain in one square — the three days the game asks about. */
    'weather-day': `
      <circle cx="9.5" cy="9" r="3.6"/>
      <path d="M9.5 3.6V1.8M3.9 9H2.1M5.5 5 4.2 3.7M13.5 5l1.3-1.3M5.5 13l-1.3 1.3"/>
      <path d="M11.5 24a4.5 4.5 0 0 1 .6-9 6 6 0 0 1 11.3 1.3 4 4 0 0 1-.4 7.7z"/>
      <path d="M14.5 26.2v2.4M19 26.2v2.4M23 26.2v2.2"/>`,

    /* Letter blocks with a hole in the middle, and the block going into it. */
    'build-a-word': `
      <rect x="12.2" y="3.2" width="7.6" height="9.4" rx="1.8"/>
      <path d="M16 14v1.6M13.9 13.6 16 15.8l2.1-2.2"/>
      <rect x="2.6" y="17.6" width="7.6" height="9.4" rx="1.8"/>
      <rect x="12.2" y="17.6" width="7.6" height="9.4" rx="1.8" stroke-dasharray="3 2.6"/>
      <rect x="21.8" y="17.6" width="7.6" height="9.4" rx="1.8"/>`,

    /* Cookies to count, and the two signs they are counted with. */
    'plus-minus': `
      <circle cx="7" cy="8.6" r="3.6"/>
      <circle cx="16" cy="8.6" r="3.6"/>
      <circle cx="25" cy="8.6" r="3.6"/>
      <circle cx="6" cy="7.6" r="1" fill="currentColor" stroke="none"/>
      <circle cx="8.2" cy="9.8" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="7.6" r="1" fill="currentColor" stroke="none"/>
      <circle cx="17.2" cy="9.8" r="1" fill="currentColor" stroke="none"/>
      <circle cx="24" cy="7.6" r="1" fill="currentColor" stroke="none"/>
      <circle cx="26.2" cy="9.8" r="1" fill="currentColor" stroke="none"/>
      <path d="M6 20.5h7M9.5 17v7"/>
      <path d="M19 20.5h7"/>`,
  };

  /* Two of the nineteen say something with their direction rather than only
     with their shapes: the arrow under the three story panels, and the
     staircase that climbs. Both games lay their own board out with the page,
     so in Hebrew the picture on the tile points one way and the board it opens
     points the other. These turn round with the page — the same thing
     `.icon-back` does to the back arrow, and for the same reason. Nothing else
     here has a direction worth mirroring: a duck facing right is a duck. */
  const FLIP = ['story-order', 'tower-steps'];

  /* One hidden sprite per page, same as the marks: nineteen drawings are
     parsed once and every tile that wants one references it by <use>. */
  function sprite() {
    const symbols = Object.keys(SCENES).map((id) => `
      <symbol id="scene-${id}" viewBox="0 0 32 32">
        <g fill="none" stroke="currentColor" stroke-width="2.2"
           stroke-linecap="round" stroke-linejoin="round">${SCENES[id]}</g>
      </symbol>`).join('');
    return `<svg width="0" height="0" aria-hidden="true" style="position:absolute">${symbols}</svg>`;
  }

  const has = (id) => Boolean(SCENES[id]);

  /* Decorative, like the marks: the game's title is always next to the picture,
     so nothing here ever has to be read out. */
  function scene(id, cls) {
    const classes = `${cls || 'scene'}${FLIP.includes(id) ? ' scene-turns' : ''}`;
    return `<svg class="${classes}" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="#scene-${id}"/></svg>`;
  }

  /* What a card should show for a game: its own scene, or its subject's mark
     while the scene is still to be drawn. A game added to the catalog is never
     left with an empty square, and it costs one entry above to give it a
     picture of its own. */
  function picture(game, cls) {
    return has(game.id) ? scene(game.id, cls || 'scene') : EDGlyphs.mark(game.subject, cls || 'scene');
  }

  function inject() {
    document.body.insertAdjacentHTML('afterbegin', sprite());
  }

  return { sprite, scene, picture, has, inject };
})();
