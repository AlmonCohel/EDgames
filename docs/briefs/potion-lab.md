# Brief — Moko's Potion Lab rebuild (מעבדת השיקויים של מוקו)

**For:** Gemini. **From:** Almon via Claude, 26 November 2026.
**Order:** 2 of 4 bigger-pass games. Start after Sun-Mirror Valley is approved.
**Read first:** `docs/GAME-STANDARD.md` (all, especially sections 2, 8 and 9).
Whispering Woods and Stream Crossing are the finished examples.

**Goal: one art hand-over and one game hand-over, with no fix rounds.**

## Why it is getting a bigger pass (Almon's sort, 26 Nov)

There is no painting at all. The room, shelf, bottles, cauldron, fire and Moko
are flat code shapes, and the game sits in a card under the task line (52% of
a phone screen, 61% of a laptop). Words like "מתכון מדויק / Exact Alchemy" and
"שיקוי המאסטר" are too adult for ages 4–8.

## Keep

- The idea: pour potions to reach a line on the cauldron (adding), cut fruit
  into pieces (more pieces), get an exact amount; Moko changes when fed.
- Moko as the friend the child helps. His look can change in the art, but keep
  him a friendly round monster.

## Hand-over 1 — the art (show Almon before writing code)

`assets/worlds/potion-lab/` with `style.md`, in the house clay-diorama style
(warm, Whispering Woods light).

- **`bg.jpg`** (≥2400 px): a cosy lab corner, window with moon, shelf, a big
  cauldron with a measuring scale on it, a fire under it, **no bottles, no fruit
  and no Moko** painted in.
- **Cut-outs** (2× display size): bottles in 3 colours (full / tipped pouring),
  fruit whole / halves / quarters (lemon, apple, star-fruit), Moko waiting /
  drinking / happy / a few transformed looks (colour, sparkles, wings) /
  "hmm" for too much.
- Liquid level, bubbles and pouring stream may be drawn by code (they are
  liquid and light).
- **`cover.jpg`** 800×800: Moko beside the bubbling cauldron, no text.
- **Mock-up page** `mockups/potion-lab/index.html`, one mock screen per step at
  laptop and phone-upright size, Hebrew first. Push and wait for Almon's OK.

## Hand-over 2 — the game

- **`fullscreen: true`**; the lab fills the screen. On a phone held upright, the
  bottles, the cauldron line and Moko are all on screen and draggable by a
  small finger (64 px+).
- **Simple step names**: e.g. מוזגים / Pour, חותכים / Cut, בדיוק עד הקו / Just
  Right, מוקו רעב / Feed Moko. No "+1 / ×2 / −1" as the only way to read a
  bottle for a 4-year-old: show the amount as filled dots or the bottle size,
  and the number beside it for older kids.
- **One idea per step**; step 4 mixes them one idea per round, at random.
- **The world reacts**: the potion bubbles and changes colour, Moko drinks and
  transforms; too much makes him go "hmm" and the level drains back, no buzzer.
- **Speak each round's task** ("Fill up to 4!").
- **Random every round**: target line, which bottles are offered.
- **Cover** via `assets/covers.js` → `cover.jpg`. Rewrite the blurb plainly.

Run `node scripts/shoot-game.mjs potion-lab`, look at every shot, push, give
Almon the live link with the section 8 pass/fail list.
