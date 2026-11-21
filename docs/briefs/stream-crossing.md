# Brief — Stream Crossing rebuild (גשר הנחל הקטן)

**For:** Gemini. **From:** Almon via Claude, 21 November 2026.
**Read first:** `docs/GAME-STANDARD.md`, all of it, and especially
**section 8 (common mistakes)**. Whispering Woods is the finished example of the
method. Look at `games/whispering-woods.js` and `assets/worlds/whispering-woods/`
for how the cut-outs, tint, covers and full screen were done, and reuse that.

**Goal: one art hand-over and one game hand-over, with no fix rounds.** Every
mistake that cost Whispering Woods a round is listed in section 8, so check
them yourself before handing over.

## What is wrong today (Claude's review, 21 Nov)

- **Little Bear is painted into the background**, so he can't move or react.
  When he "hops", the code draws a 🐻 emoji on an orange circle (around line
  601 of `games/stream-crossing.js`). This is section 8, item 8.
- **Two ideas in one question.** "Place the Large Stone (3 dots)" mixes size
  and counting, and in the shapes step the stones also carry different dot
  counts. This is section 8, item 9.
- **Adult words**, for example "whirlpool", "foreground shore" and "Full Stream
  Bridge". The target spot in the water is a thin yellow ring that is hard to
  read.
- **Not full screen.** The stage is 22% of a phone screen and is cut off on
  tablet and laptop.
- **The voice says one general line per step**, not the round's task.
- **The cover is code shapes**, not the game's art.

## Hand-over 1 — the art (show Almon before writing code)

Put everything in `assets/worlds/stream-crossing/` with a `style.md`, using the
same clay-diorama style and light as `assets/worlds/stream-crossing.jpg`.

- **`bg.jpg`:** the same stream, banks and burrow, with **no bear and no
  stones** in it. Leave clear open water between the banks for the stepping
  stones.
- **Little Bear** as cut-outs: `bear-waiting`, `bear-hop` (in the air),
  `bear-cheer`, and `bear-oops` (a gentle "hmm" for a wrong stone). He keeps
  the berry basket in the same hand in every pose.
- **Stones** as cut-outs, one clay-and-moss style:
  - **Size set:** the same round stone in 4 sizes (`stone-s`, `stone-m`,
    `stone-l`, `stone-xl`). You can make one image and scale it, but check
    that the moss and edges still look right at the smallest size.
  - **Shape set:** circle, square, triangle and star or heart (shapes a 3-year-old
    names), all the same size. The existing `assets/worlds/stone-*.png` can be
    reused if they pass the art check.
  - Glowing dots for the counting step may be drawn by code on a plain stone,
    since dots are a light effect.
- **The target spot in the water:** a soft glowing outline *of the needed
  stone* (its shape, or its size) under the water surface, so a child can see
  what goes there without words. This can be drawn by code as a glow.
- **`cover.jpg`:** 800×800, the bear on a stone mid-stream with the burrow
  glowing behind him, and no text.

- **Mock-up page** `mockups/stream-crossing/index.html` (standard section 9):
  all the art, plus one mock screen per step (Size, Count, Shape, Bridge) at
  laptop and phone-upright size, made by layering the real art: the bear on the
  shore, the stones offered, the glowing target outline, and the bear on the
  stone after a right answer. One line under each screen says what the child
  hears. Commit and push it so Almon can open
  `https://almoncohel.github.io/EDgames/mockups/stream-crossing/`.

Run `node scripts/shoot-game.mjs stream-crossing`, check the art section, and
wait for Almon's OK on the mock-up before writing game code.

## Hand-over 2 — the game

- **`fullscreen: true`** on its entry in `assets/catalog.js`.
- **One idea per step:**
  1. **Size:** all stones are the same shape with no dots. "Little Bear needs
     the *big* stone!"
  2. **Count:** all stones are the same shape and size, and only the number of
     dots changes. Build the bridge 1, 2, 3, 4 in order, counting out loud.
  3. **Shape:** all stones are the same size with no dots. "Find the
     *triangle*!"
  4. **The whole bridge:** keep one idea per round, and pick the idea (size,
     count or shape) for each round at random.
- **Little Bear reacts.** After every right stone he hops onto it (cut-out pose,
  splash, sound). After a wrong one he does `bear-oops`, the stone floats back,
  and there is no buzzer. At the end of the bridge he hops into the burrow and
  cheers.
- **Random every round:** the order of the stones on the shore, which wrong
  stones are offered, and the target.
- **Nothing gives the answer away** at the start. The right stone must not
  glow or bob differently from the others.
- **Speak each round's task** in plain words, with Mac voices for now. Use
  simple step names (for example גודל / Size, סופרים / Count, צורות / Shapes,
  כל הגשר / Bridge), and no words like "whirlpool" or "foreground".
- **Phone held upright:** the shore with the stones and the target spot must
  both be visible and big enough to drag with a small finger (section 8,
  item 6).
- **Cover:** point the `stream-crossing` entry in `assets/covers.js` to
  `cover.jpg` (section 7).

Push the game and give Almon the live link. Before handing over, write the section 8 list (pass or fail plus a screenshot
name for each) into the hand-over note.
