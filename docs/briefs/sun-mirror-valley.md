# Brief — Sun-Mirror Valley rebuild (עמק מראות השמש)

**For:** Gemini. **From:** Almon via Claude, 26 November 2026.
**Order:** 1 of 4 bigger-pass games (Sun-Mirror Valley → Potion Lab → Star
Factory → Circuit Lab). Stream Crossing is finished, so this one is next.
**Read first:** `docs/GAME-STANDARD.md`, all of it, especially section 8
(common mistakes) and section 9 (Almon sees the design at every stage).
Whispering Woods and Stream Crossing are the finished examples. Reuse how they
do cut-outs, tint, covers, full screen and the sliding camera.

**Goal: one art hand-over and one game hand-over, with no fix rounds.**

## Why it is getting a bigger pass (Almon's sort, 26 Nov)

On the first screen the painted valley sits small inside a card, under a long
spoken-task line and a parent hint. On a phone held upright the world is a thin
strip at the bottom (game area 52% of the phone screen, 61% of a laptop). The
mirror, crystal and their labels ("כיוון מראה", "לחממה בלבד") are code shapes
and pills drawn on top of the painting.

## Keep

- The idea: aim the sunbeam with a mirror; split it with a crystal; send the
  light to the watermill and the greenhouse. Ages 6–8.
- The painted valley (`assets/worlds/sun-mirror-valley.jpg`) as the style
  reference.

## Hand-over 1 — the art (show Almon before writing code)

Put everything in `assets/worlds/sun-mirror-valley/` with a `style.md`.

- **`bg.jpg`** (≥2400 px wide): the same valley, lighthouse, greenhouse and
  watermill, with **no mirror, no crystal and no beam** painted in. Leave clear
  ground where the mirror and crystals stand.
- **Cut-outs** (2× display size, same light): stone mirror on a stand (drawn so
  code can rotate the mirror face), crystal (idle / lit), watermill wheel as a
  separate piece so it can turn, greenhouse windows lit / unlit, flowers closed
  / open, a small helper character (the hiker already in the painting can
  become a cut-out) in waiting / pointing / cheering.
- The beam itself may be drawn by code (it is light), with a soft glow, not a
  hard yellow bar.
- **`cover.jpg`** 800×800: the beam bouncing off the mirror into the lit
  greenhouse, no text.
- **Mock-up page** `mockups/sun-mirror-valley/index.html`: all the art, plus one
  mock screen per step at laptop and phone-upright size, Hebrew first, one line
  under each screen with what the child hears. Commit, push, and wait for
  Almon's OK on `https://almoncohel.github.io/EDgames/mockups/sun-mirror-valley/`.

## Hand-over 2 — the game

- **`fullscreen: true`** in `assets/catalog.js`; the valley fills the screen.
  On a phone held upright, the mirror, the crystal and the target must all be on
  screen (camera may slide, as in Stream Crossing).
- **Simple step names and words.** Not "פיצול חכם / Smart Ratios" or "מאסטר
  האור". Suggested: מראה / Mirror, גביש / Crystal, שני יעדים / Two Places,
  כל העמק / The Whole Valley. No "עוצמה 6", "עדשת מיקוד" or ratios on screen;
  if the beam has strength, show it as brightness or as a number of sun dots.
- **One idea per step**: 1 aim one mirror at one target; 2 send the beam
  through one crystal; 3 split it so both the mill and the greenhouse light
  up; 4 mix the three, one idea per round, picked at random.
- **The world reacts**: the mill wheel turns, the greenhouse lights up, flowers
  open, the helper cheers. A miss makes the beam fade on the rocks, no buzzer.
- **Speak each round's task** in plain words (Mac voices for now).
- **Random every round**: mirror and crystal start angles, which target.
- **Cover**: point `assets/covers.js` to `cover.jpg` (section 7).
- Rewrite the catalog blurb in plain words (section 6: no "ancient", "botanical").

Run `node scripts/shoot-game.mjs sun-mirror-valley`, look at every shot, push,
and give Almon the live link with the section 8 pass/fail list.
