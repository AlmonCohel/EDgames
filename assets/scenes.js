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

    /* Three bubbles rising, the biggest at the bottom. */
    'bubble-count': `
      <circle cx="11" cy="22" r="6.5"/>
      <circle cx="22" cy="14" r="4.5"/>
      <circle cx="13" cy="7" r="2.8"/>`,

    /* Three the same, and a triangle that is not. */
    'odd-one-out': `
      <circle cx="9" cy="9" r="4.5"/>
      <circle cx="23" cy="9" r="4.5"/>
      <circle cx="9" cy="23" r="4.5"/>
      <path d="M23 18l5 9H18z"/>`,

    /* A basket with a thing dropping into it. */
    'sort-baskets': `
      <path d="M6 16h20l-2.5 11h-15z"/>
      <path d="M11 16v11M16 16v11M21 16v11"/>
      <circle cx="16" cy="7" r="3.5"/>`,

    /* A pizza with one slice pulled away. */
    'pizza-shop': `
      <path d="M16 16 16 4a12 12 0 1 0 12 12z"/>
      <path d="M20 12V3.500A9 9 0 0 1 28.5 12z"/>
      <circle cx="10" cy="14" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="13" cy="22" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="21" cy="21" r="1.5" fill="currentColor" stroke="none"/>`,

    /* A robot's head, an antenna and two eyes. */
    'robot-code': `
      <rect x="6" y="11" width="20" height="16" rx="4"/>
      <path d="M16 11V6"/>
      <circle cx="16" cy="4.5" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="18" r="1.8" fill="currentColor" stroke="none"/>
      <circle cx="20" cy="18" r="1.8" fill="currentColor" stroke="none"/>
      <path d="M12 23h8"/>`,

    /* A flask, half full. */
    'color-lab': `
      <path d="M12.5 4h7M14 4v9L6.5 25c-1 2 .3 3.5 2.3 3.500h14.400c2 0 3.3-1.5 2.3-3.500L18 13V4"/>
      <path d="M10 19h12"/>`,

    /* A speech bubble with an A. */
    'english-words': `
      <path d="M6 6h20a2.5 2.5 0 0 1 2.5 2.500v11a2.5 2.5 0 0 1-2.5 2.500H14l-6 5v-5H6a2.5 2.5 0 0 1-2.5-2.500v-11A2.5 2.5 0 0 1 6 6z"/>
      <path d="M12 18.5 16 9.500l4 9M13.4 15.500h5.2"/>`,

    /* A ten frame: two rows of five. */
    'make-ten': `
      <rect x="3" y="9" width="26" height="14" rx="2"/>
      <path d="M8.2 9v14M13.4 9v14M18.6 9v14M23.8 9v14M3 16h26"/>
      <circle cx="5.6" cy="12.5" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="10.8" cy="12.5" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="12.5" r="1.3" fill="currentColor" stroke="none"/>`,

    /* A circle, a square, a circle, and a dashed place with nothing in it yet. */
    'what-next': `
      <circle cx="6" cy="16" r="3.5"/>
      <rect x="11.5" y="12.5" width="7" height="7" rx="1"/>
      <rect x="22" y="12" width="8" height="8" rx="1.5" stroke-dasharray="2 2.5"/>`,

    /* An apple, an arrow, and the letter its name begins with. */
    'first-letter': `
      <path d="M9.5 12.5c-3.6-2.2-6.8.6-6 4.4.8 4 3.2 6.2 6 5.2 2.8 1 5.2-1.2 6-5.2.8-3.8-2.4-6.6-6-4.4z"/>
      <path d="M9.5 12.5c0-1.6.4-2.6 1.2-3.4"/>
      <path d="M18 17h4.5M20.5 15l2 2-2 2"/>
      <rect x="24" y="12" width="6.5" height="10" rx="1.6"/>`,

    /* An ordinary letter tied to its final shape. */
    'final-letters': `
      <rect x="2.5" y="8" width="10" height="11" rx="2"/>
      <rect x="19.5" y="8" width="10" height="16" rx="2"/>
      <path d="M12.5 13.5c2-2 5-2 7 0" stroke-dasharray="1.6 2.2"/>
      <path d="M24.5 12v8"/>`,

    /* A dotted letter with a pencil going over it. */
    'letter-trace': `
      <path d="M6 6l14 20M6 26c3-6 6-8 9-8M17 12c3 0 6 2 9 8" stroke-dasharray="2.2 2.6"/>
      <path d="M20 26l8-8 3 3-8 8-4 1z"/>
      <path d="M6 6l7 10"/>`,

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
  
    /* October 2026 — one line drawing each, the fallback under the covers. */
    'birthday-candles': `
      <rect x="5" y="17" width="22" height="10" rx="2"/>
      <path d="M11 17v-6M16 17v-6M21 17v-6"/>
      <path d="M11 8.5v-1M16 8.5v-1M21 8.5v-1"/>`,
    'frog-hops': `
      <ellipse cx="6" cy="25" rx="4.5" ry="2"/><ellipse cx="16" cy="25" rx="4.5" ry="2"/><ellipse cx="26" cy="25" rx="4.5" ry="2"/>
      <path d="M6 21c3-12 14-12 20-4" stroke-dasharray="2 3"/>
      <circle cx="16" cy="9" r="3.5"/>`,
    'more-or-less': `
      <path d="M3 18h11l-1.5 8h-8z"/><path d="M18 18h11l-1.5 8h-8z"/>
      <circle cx="8.5" cy="15" r="2"/><circle cx="21" cy="15" r="2"/><circle cx="26" cy="15" r="2"/><circle cx="23.5" cy="11" r="2"/>`,
    'princess-dress': `
      <circle cx="16" cy="8" r="3.5"/>
      <path d="M13 13h6l1.5 5c3 3 4.5 6 5 9H6.5c.5-3 2-6 5-9z"/>
      <path d="M13 4l1-2.5 2 1.5 2-1.5 1 2.5"/>`,
    'unicorn-rainbow': `
      <path d="M4 26a12 12 0 0 1 24 0"/><path d="M8 26a8 8 0 0 1 16 0"/><path d="M12 26a4 4 0 0 1 8 0"/>
      <path d="M22 9l3-6 1 6"/>`,
    'castle-shadows': `
      <ellipse cx="16" cy="15" rx="8.5" ry="11.5"/>
      <path d="M11.5 19l-1-7 3.5 3 2-4 2 4 3.5-3-1 7z" fill="currentColor" stroke="none"/>
      <path d="M12 28h8"/>`,
    'castle-builder': `
      <rect x="4" y="13" width="7" height="14"/><rect x="21" y="13" width="7" height="14" stroke-dasharray="2 2.4"/>
      <rect x="11" y="18" width="10" height="9"/>
      <path d="M3 13l4.5-7 4.5 7"/><path d="M14 27v-3.5a2 2 0 0 1 4 0V27"/>`,
    'letter-listen': `
      <path d="M4 12h4l5-4v14l-5-4H4z"/>
      <path d="M16.5 10.5c1.6 2.4 1.6 5.6 0 8M20 8c3 4 3 10 0 14"/>
      <rect x="22.5" y="19" width="7" height="9" rx="1.5"/>`,
    'letter-balloons': `
      <ellipse cx="10" cy="11" rx="5.5" ry="7"/><ellipse cx="22" cy="9" rx="5.5" ry="7"/>
      <path d="M10 18c0 3-2 5 0 9M22 16c0 3 2 6 0 11"/>`,
    'alefbet-dots': `
      <path d="M16 4l3.4 7.6 8.1.8-6.1 5.4 1.8 8L16 21.7l-7.2 4.1 1.8-8-6.1-5.4 8.1-.8z" stroke-dasharray="2.2 2.6"/>
      <circle cx="16" cy="4" r="1.6" fill="currentColor" stroke="none"/><circle cx="27.5" cy="12.4" r="1.6" fill="currentColor" stroke="none"/>`,
    'abc-big-small': `
      <path d="M4 22l5-14 5 14M6 17.5h6"/>
      <circle cx="23" cy="20" r="3.5"/><path d="M26.5 16.5V24"/>`,
    'abc-caterpillar': `
      <circle cx="5" cy="20" r="3.5"/><circle cx="12" cy="18" r="3.5"/><circle cx="19" cy="20" r="3.5" stroke-dasharray="1.8 2"/>
      <circle cx="26" cy="16" r="4"/><path d="M24.5 12l-1-3M27.5 12l1-3"/>`,
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
