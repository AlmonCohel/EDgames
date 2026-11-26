# Brief — Star Factory rebuild (מפעל הכוכבים)

**For:** Gemini. **From:** Almon via Claude, 26 November 2026.
**Order:** 3 of 4 bigger-pass games. Start after Potion Lab is approved.
**Read first:** `docs/GAME-STANDARD.md` (all, especially sections 2, 8 and 9).
Whispering Woods and Stream Crossing are the finished examples.

**Goal: one art hand-over and one game hand-over, with no fix rounds.**

## Why it is getting a bigger pass (Almon's sort, 26 Nov)

The scene is code shapes (gears, ledges, number blocks, Lumi the robot) in a
card under the task line; on a phone the play area is small (55% of a phone
screen, 61% of a laptop). The number blocks the child drags are small and sit
in a big empty tray. "חותכים בלייזר / Laser Slice" and "מאסטר המפעל / Master
Inventor" are too adult.

## Keep

- The idea: join number blocks to fill a gap of the right length so Lumi's star
  can roll across (adding, making ten, splitting a block).
- Lumi the robot as the friend the child helps.

## Hand-over 1 — the art (show Almon before writing code)

`assets/worlds/star-factory/` with `style.md`, in the house clay-diorama style.

- **`bg.jpg`** (≥2400 px): a night factory/space workshop with two ledges and a
  clear gap between them, **no blocks, no stars and no Lumi** painted in.
- **Cut-outs** (2× display size): number blocks 1–10 as one family (same
  material, length matches the number, dots or segments a child can count),
  Lumi waiting / pointing / cheering / "hmm", the star orb, a gap marker
  showing the length needed (a glowing outline, like Stream Crossing's target).
- **`cover.jpg`** 800×800: Lumi watching the star roll across a block bridge.
- **Mock-up page** `mockups/star-factory/index.html`, one mock screen per step,
  laptop and phone-upright, Hebrew first. Push and wait for Almon's OK.

## Hand-over 2 — the game

- **`fullscreen: true`**; the factory fills the screen. On a phone held
  upright, the gap and the blocks are both on screen and draggable (64 px+).
- **Simple step names**: e.g. מחברים / Join, עד עשר / Make Ten, חוצים / Split,
  כל המפעל / The Whole Factory.
- **One idea per step**; step 4 mixes them one idea per round, at random.
- **The world reacts**: blocks click together, the star rolls across, Lumi
  cheers; a too-long or too-short bridge makes the star stop at the edge and
  roll back, no buzzer.
- **Speak each round's task** ("Build a bridge 3 long!").
- **Random every round**: gap length and the blocks offered.
- **Cover** via `assets/covers.js` → `cover.jpg`. Rewrite the blurb plainly.

Run `node scripts/shoot-game.mjs star-factory`, look at every shot, push, give
Almon the live link with the section 8 pass/fail list.
