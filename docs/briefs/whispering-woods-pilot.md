# Brief — Whispering Woods pilot rebuild

**For:** Gemini (gemini-mac). **From:** Almon via Claude, 20 November 2026.
**Read first:** `docs/GAME-STANDARD.md`. This brief applies it to one game.

## Why this game first

`whispering-woods` has the best art of the November games, so it is the pilot.
If the method works here, the other five games are redone the same way, and only
then do we start new games. **Don't start any other game until Almon approves
this one.**

## What is wrong today (from the 20 Nov review)

- The background painting already has owls, hedgehogs and a fawn in it. The
  game then draws round code-made faces on top of them (`drawCreature` in
  `games/whispering-woods.js`), so you see a painted fawn with a cartoon
  circle face stuck on it.
- In step 4 the "5 moss frogs" are tiny faint dots that a 3-year-old can't
  find.
- The voice plays one general line per step. The actual task ("find 3 owls")
  is only written, and a 3–4 year old can't read it.
- Words like "camouflage", "Fern & Bark Thicket" and "Night Ranger" are too
  hard for ages 3–4.
- The game is a small window. Run `node scripts/shoot-game.mjs whispering-woods`
  and look at `review-shots/whispering-woods/report.txt`: the stage takes 22%
  of a phone screen and is cut off on tablet and laptop.

## What to do

1. **Art (do this first and show it before writing code).**
   - Write `assets/worlds/whispering-woods/style.md` with the one style
     reference prompt (Arise-style clay diorama with warm lantern light, the
     look Almon picked).
   - Paint a new `bg.jpg` from it with **no animals in it**: the same forest,
     tree hollow, log, stream and girl with the lantern.
   - Make each animal as its own transparent PNG in the same style and light:
     owl, hedgehog, fawn, frog, squirrel, bunny and dormouse. Each needs at
     least a *hidden* pose (tucked or peeking), a *found* pose (looking out)
     and a *happy* pose (a little jump or wave).
   - Make the girl a cut-out too, with 2–3 poses (looking, pointing,
     cheering), so she can react.
2. **Game.**
   - Replace `drawCreature` with the cut-outs. Code may still draw the lantern
     beam, the glow, fireflies and sparkles.
   - Hiding means animals tucked behind ferns, logs and branches (part of the
     picture covering them), not fading them to nearly invisible. In the lantern
     beam they peek out.
   - Every round's task is spoken ("Find 3 owls!"), and counting is spoken on
     each tap ("one… two… three!"). Use the Mac voices for now
     (`scripts/make-voice.mjs`). Paid voices come at the very end, so don't add
     any.
   - Use plain, short step names a 3-year-old would understand.
   - When an animal is found it does its happy pose with a sound, and the
     girl cheers at the end of a round.
3. **Full screen.** The game fills the screen. The title, step buttons and
   parent text sit in a thin bar or behind one small button. **Make this an
   opt-in for this game only** (for example a flag on its entry in
   `assets/catalog.js` that `game.html` reads), so the other 56 games don't
   change yet.
4. **Check.** Run `node scripts/shoot-game.mjs whispering-woods`, open
   `review-shots/whispering-woods/index.html`, look at every picture, and fix
   until the checklist in `docs/GAME-STANDARD.md` passes. The report should
   show no "CUT OFF", and the stage should be most of the screen at every size.

## How to hand over

- Hand over **twice**: first the art (step 1) by itself, then the finished
  game. Almon looks at the art before any code is written, which saves wasted
  work if the look is wrong.
- Each hand-over is a note of no more than 5 lines, with the checklist ticked
  and the `review-shots/whispering-woods/` folder ready. Claude reviews the
  screenshots and sends back one list of fixes.
- Commit messages describe what is on screen, without big adjectives. Don't
  deploy beyond the normal push until Almon has played it.
