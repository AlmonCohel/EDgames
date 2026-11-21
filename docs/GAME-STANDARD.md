# EDgames — Game Quality Standard

Every new game, and every rebuild of an old one, must meet this page before it
is called done. It applies to every agent that builds for EDgames: Gemini,
Claude, Codex and the PC agents. Almon set it on 20 November 2026 after a review
of the six games added 18–20 November.

**The test behind every rule:** put the game in front of a child who cannot read
yet. Does the child know what to do, enjoy doing it, and feel the world react?

---

## 1. A child can play without reading

- Every round's **exact task is spoken**. Say "Find 3 owls", not a general
  line for the whole step ("Find the animals hiding in the forest").
- Text on screen is for the parent. The game must still work with it hidden.
- **No adult or technical words** anywhere the child sees or hears them. Words
  like "SW1: OPEN", "Photometer", "Voltage dial", "camouflage" or "ratio" are
  out. Use words a 4-year-old uses: light, big, small, more, friend, home.
- **One idea per question.** Don't mix two concepts in one task. For example,
  "the Large Stone (3 dots)" mixes size and counting, so ask about one of them.
- **Touch targets are big**, at least 64 px on a 390 px-wide phone, and placed
  far enough apart that a small finger doesn't hit the wrong one.
- Ages 6–8 may read short sentences, but the spoken rule still applies.

## 2. The art: everything the child touches is real art

The biggest problem in the November games is that the background painting looks
great, but the things the child plays with are flat shapes drawn by code on top
of it.

- **One style reference per game.** Keep a single reference picture and its
  written image prompt. Make every image for the game from them, so the
  lighting, materials and camera angle match.
- **Paint the background without the playable things in it.** If the child
  finds owls, the painted background has no owls. Never draw a game object on
  top of the same object already painted into the background.
- **Each playable thing is its own cut-out picture**: a transparent PNG in the
  same style and light as the background, with a version for each state it
  needs (for example *hidden*, *found* and *happy*, or *idle*, *picked up* and
  *placed*).
- **Characters are art too.** A character the story is about (Little Bear, the
  girl with the lantern, Moko) is a cut-out with at least 2–3 poses so it can
  react. It is not part of the background.
- **Code is for effects, not objects.** Canvas drawing is fine for light, glow,
  beams, sparkles, ripples, particles and shadows. It is not fine for animals,
  characters, stones, tools, machines or anything else the child picks or taps.
- File layout: `assets/worlds/<game-id>/bg.jpg`,
  `assets/worlds/<game-id>/<thing>-<state>.png` and
  `assets/worlds/<game-id>/style.md` (the reference prompt).
- Keep the files light. Aim for a background under 800 KB and each cut-out
  under 150 KB.

## 3. The game fills the screen

- **The whole scene is visible with no scrolling** at phone (390×844), tablet
  (1024×768) and laptop (1280×800) sizes.
- **The play area is most of the screen.** The title, step buttons and parent
  text sit behind one small button or in a thin bar, not stacked above the game.
  The screenshot script reports how much of the screen the stage takes and
  whether anything is cut off.

## 4. The world reacts

- **Every tap or drag gets a sound and a visible reaction straight away**:
  a bounce, wiggle, glow or a character turning to look.
- **Right answers are celebrated** by the character, not just with a tick
  (Little Bear jumps, the owl blinks and hoots).
- **Wrong answers are gentle**: a soft wobble and a hint, never a buzzer or
  anything red that feels like failing.
- **Counting is spoken on every tap**: "one… two… three!"
- **Motion follows the real thing.** A stone that splashes makes ripples, and
  a light that turns on lights up what is near it.

## 5. Voice

- **For now, voices come from the Mac** (`node scripts/make-voice.mjs`,
  Carmit and Samantha). That is a placeholder, so keep lines short and
  plain.
- **Paid voices are the last step**, only after Almon has approved a game.
  Do not add or buy voice services before then.
- Write one line per round task plus the counting words. Put them in both
  Hebrew and English in `assets/voice-lines.js`.

## 6. Honest descriptions

- **Commit messages, `CLAUDE.md`, `README.md` and catalog blurbs describe what
  is actually on screen.** Words like "museum-grade", "ray-traced", "photoreal"
  or "3D" are allowed only if a screenshot shows them.
- **Don't call a game done because the code exists.** It is done when the
  screenshots pass this page (section 10).

## 7. The cover matches the game

The cover is the card on the home screen and the small icon in the game
header. It is the first thing a parent sees, so it must look like the game.

- **Make it from the game's own art.** Compose a square `cover.jpg` (800×800,
  under 150 KB) from the game's background and its main character or animals,
  in the same light and style, with no text. Save it in
  `assets/worlds/<game-id>/`.
- In `assets/covers.js`, the game's entry returns an SVG that only shows that
  picture:
  `<image href="assets/worlds/<id>/cover.jpg" width="200" height="200" preserveAspectRatio="xMidYMid slice"/>`.
  Don't draw a new cover from code shapes.
- The screenshot check saves `cover.png` so you can see it at the size it is
  shown.

## 8. Common mistakes — check these before every hand-over

These all happened in the first Whispering Woods rebuild (20–21 Nov 2026), and
each one cost a full round of fixes. Check every one before you hand over.

1. **The answer shows before the child starts.** At the start of a round,
   nothing gives the answer away: no lit target, no glow, and no beam or
   pointer resting on it.
2. **Fixed positions.** Targets and answers must change place each round
   (random from a list of good spots or slots), or the child learns them by
   heart after two rounds.
3. **Art pieces that don't sit on the painting.** A cover piece or prop must
   line up with what is painted (a hole, a branch or the ground line). It
   must not float in front of it.
4. **Night or shade tints that change what a thing is.** Darken, but keep each
   thing's own colour. A brown hedgehog must not turn navy blue.
5. **Sizes that don't make sense.** Give each character and object one fixed
   size relative to the main character. For example, an owl is smaller than
   the girl's head.
6. **A phone held upright.** A wide scene becomes a thin strip. Zoom in to fill
   the height (or show a "turn sideways" picture), and keep every target inside
   the visible part, at least 10% away from the edges.
7. **The same cut-out stamped many times.** Use each prop at most twice per
   screen, and give each copy its own flip, size (85–115%) and small tilt.
8. **A character painted into the background.** If a character moves, reacts
   or is the hero (Little Bear, the girl), it is a cut-out with poses. It is
   never part of `bg.jpg`, and never an emoji or a code shape when it moves.
9. **Two ideas in one question.** Ask about shape *or* count *or* size. The
   other features should be the same on every choice (for example, all stones
   have the same dots when the question is about shape).
10. **The page shell, not full screen.** Rebuilt and new games set
    `fullscreen: true` on their entry in `assets/catalog.js`.
11. **An old cover.** See section 7.
12. **The stage-size number lies on phones.** The script measures the game
    frame, not the painted scene. Always look at the phone pictures.

## 9. Almon sees the design at every stage

Almon reviews the design himself, not only Claude. So every hand-over comes
with something he can open from any device:

- **Hand-over 1 (art) includes a mock-up page:** `mockups/<game-id>/index.html`,
  committed and pushed, so it opens at
  `https://almoncohel.github.io/EDgames/mockups/<game-id>/`. Hebrew first, with
  an English toggle, like `mockups/illustrative-worlds/`. It shows:
  - every art piece (background, each character pose, each object state),
  - **one mock screen per step** built by layering the real art files (HTML
    and CSS, not new code-drawn shapes), at laptop size and phone held
    upright, showing the start of a round and the "right answer" moment,
  - under each screen, one line of what the child hears,
  - the cover at card size.
  Wait for Almon's OK on the mock-up before writing game code.
- **Hand-over 2 (game):** the game is pushed so Almon can play it live, and the
  note gives the link `https://almoncohel.github.io/EDgames/game.html?id=<game-id>`.
- **Always commit and push** what you hand over. Files only on the Mac can't
  be seen by Almon.

## 10. What "done" means

1. Run the screenshot check:
   ```
   node scripts/shoot-game.mjs <game-id>
   ```
   It opens the game at phone, tablet and laptop size, goes through every
   step, saves pictures to `review-shots/<game-id>/`, and writes
   `review-shots/<game-id>/report.txt` with errors, the stage size and
   whether anything is cut off. Open `review-shots/<game-id>/index.html` to
   see all the pictures on one page. The folder is not committed.
2. **Look at every picture yourself** and fix what breaks this page. Repeat
   until it passes.
3. **Go through section 8 one item at a time.** For each item write *pass* and
   the name of the screenshot that proves it (for example `he-phone-step3.png`),
   or *fail* and what is wrong. A hand-over without this list is not finished.
   It also needs the mock-up page or live link from section 9.
4. Hand over with a note of no more than 5 lines: what changed, the folder
   path, the section 8 list, and anything you know is still wrong.
5. Claude reviews the screenshots against this page and sends back one list
   of fixes. Almon looks at the same mock-up or live game himself.
6. **Almon plays it with his daughter.** Her reaction is the final test.

## Checklist (copy into the hand-over note)

- [ ] Every round's task is spoken, and the game is playable with the text hidden
- [ ] No adult or technical words, and one idea per question
- [ ] Background has no painted copies of playable things
- [ ] Every playable thing and character is a cut-out with its states, in one style
- [ ] Code draws only effects (light, glow, particles), not objects
- [ ] Whole scene visible with no scrolling at 390×844, 1024×768 and 1280×800
- [ ] Every touch gets a sound and a reaction; right answers are celebrated, wrong ones are gentle
- [ ] Descriptions match the screenshots
- [ ] Cover is made from the game's own art (`review-shots/<id>/cover.png`)
- [ ] Mock-up page (art hand-over) or live link (game hand-over) pushed for Almon
- [ ] Every item in section 8 passes, with a screenshot name for each
- [ ] `node scripts/shoot-game.mjs <id>` ran clean and every picture was looked at
