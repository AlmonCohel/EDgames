# Brief — Circuit Lab rebuild (מעבדת החשמל והמכונות)

**For:** Gemini. **From:** Almon via Claude, 26 November 2026.
**Order:** 4 of 4 bigger-pass games. Start after Star Factory is approved.
**Read first:** `docs/GAME-STANDARD.md` (all, especially sections 1, 2, 8, 9).
Whispering Woods and Stream Crossing are the finished examples.

**Goal: one art hand-over and one game hand-over, with no fix rounds.**

## Why it is getting a bigger pass (Almon's sort, 26 Nov)

The lab is code shapes on a dark panel in a card under a two-line task (55% of
a phone screen, 61% of a laptop). The words are for an electrician, not a child
of 4–8: "6V", "3V / 9V", "SW1: פתוח", "ספק כוח מעבדתי DC", "וסת עוצמה",
"נורת להט אדיסון", a voltmeter dial. This is the game furthest from the
standard (section 1: no technical words).

## Keep

- The idea: close a loop of wire to make something work — a bulb lights, a fan
  turns and a boat sails, a magnet crane lifts a box. Switches decide which
  thing gets the power.

## Change

- **No volts, no meters, no switch codes.** The battery is a battery. "Strength"
  (if kept at all) is 1, 2 or 3 battery cells the child can count, and only from
  step 3 on.

## Hand-over 1 — the art (show Almon before writing code)

`assets/worlds/circuit-lab/` with `style.md`, in the house clay-diorama style
(a warm wooden workbench in a cosy workshop).

- **`bg.jpg`** (≥2400 px): the workbench, **no battery, wires, bulb, fan, boat
  or crane** painted in; clear space for them.
- **Cut-outs** (2× display size): battery (1, 2, 3 cells), a big friendly
  switch open / closed, bulb off / on, fan still / spinning, little boat in a
  water tray, crane with magnet off / holding a box, a small inventor character
  waiting / pointing / cheering / "hmm".
- Wires and sparks may be drawn by code (thick, soft, coloured), with clear
  end-points a child can drag to.
- **`cover.jpg`** 800×800: the inventor and a glowing bulb on the bench.
- **Mock-up page** `mockups/circuit-lab/index.html`, one mock screen per step,
  laptop and phone-upright, Hebrew first. Push and wait for Almon's OK.

## Hand-over 2 — the game

- **`fullscreen: true`**; the bench fills the screen. On a phone held upright
  the battery, the switch and the thing to power are all on screen, with
  64 px+ targets.
- **Simple step names**: e.g. נורה / Light, מאוורר / Fan, מפסקים / Switches,
  כל הסדנה / Whole Workshop. Plain title and blurb (section 6).
- **One idea per step**: 1 join the wire and close the switch to light the
  bulb; 2 make the fan blow the boat across; 3 pick the right switch so only
  the thing asked for turns on; 4 mix them one idea per round, at random.
- **The world reacts**: the bulb glows and the room warms, the boat sails, the
  crane lifts; a gap in the loop shows a small spark at the gap, the
  inventor goes "hmm", no buzzer.
- **Speak each round's task** ("Make the bulb light up!").
- **Random every round**: which thing to power, where the gap is.
- **Cover** via `assets/covers.js` → `cover.jpg`.

Run `node scripts/shoot-game.mjs circuit-lab`, look at every shot, push, give
Almon the live link with the section 8 pass/fail list.
