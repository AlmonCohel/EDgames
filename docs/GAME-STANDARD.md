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
  screenshots pass this page (section 7).

## 7. What "done" means

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
3. Hand over with a note of no more than 5 lines: what changed, the folder
   path, and anything you know is still wrong.
4. Claude reviews the screenshots against this page and sends back one list
   of fixes.
5. **Almon plays it with his daughter.** Her reaction is the final test.

## Checklist (copy into the hand-over note)

- [ ] Every round's task is spoken, and the game is playable with the text hidden
- [ ] No adult or technical words, and one idea per question
- [ ] Background has no painted copies of playable things
- [ ] Every playable thing and character is a cut-out with its states, in one style
- [ ] Code draws only effects (light, glow, particles), not objects
- [ ] Whole scene visible with no scrolling at 390×844, 1024×768 and 1280×800
- [ ] Every touch gets a sound and a reaction; right answers are celebrated, wrong ones are gentle
- [ ] Descriptions match the screenshots
- [ ] `node scripts/shoot-game.mjs <id>` ran clean and every picture was looked at
