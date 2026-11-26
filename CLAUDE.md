# EDgames — Project Rules & Decisions (`CLAUDE.md`)

Read this before touching `EDgames`. Alongside `README.md` and `docs/ACCOUNTS.md`, this records Almon's design and architecture decisions so Claude, Gemini (`gemini-mac`), and the PC agents stay aligned.

> **Before building or rebuilding any game, read `docs/GAME-STANDARD.md` (set by Almon 2026-11-20).** A game is done only when `node scripts/shoot-game.mjs <id>` passes and every screenshot has been looked at. Paid voices come last, after Almon approves a game. Finished example: Whispering Woods (`docs/briefs/whispering-woods-pilot.md`). Current brief: `docs/briefs/sun-mirror-valley.md`, then in order `potion-lab.md`, `star-factory.md`, `circuit-lab.md` (Almon's 26 Nov sort: these 4 get the bigger pass; one game at a time, each waits for his OK). 8 other games get small Codex fixes (board cards); the remaining 45 stay as they are on purpose. Check section 8 (common mistakes) of the standard before every hand-over, and push a mock-up page (art) or live link (game) for Almon to review himself (section 9).

## 1. Current Design & Architecture (31 October 2026)

- **Home screen (`play.html` + `assets/app.js` + `assets/styles.css`):**
  - Almon picked **Direction 1 — Console Deck (`הקונסולה`, from `mockups/v4/1-console/`)** as the live structure for `play.html`.
  - Do **not** revert `play.html` back to the old multi-row horizontal scrolling shelves or bottom tab bar.
  - Structure of `play.html`:
    1. **Top Hardware Bar (`.console-top`):** Logo link to `index.html?home=1`, `ED-DECK` LED kicker, brand title, active kid-theme badge, age segmented switcher (`#age-chips`), sound toggle (`#sound-toggle`), language toggle (`#lang-toggle`), account button (`#account-chip`), and the **Design & Settings (`#settings-toggle`)** button.
    2. **Inner Console Screen (`.console-screen` / `.deck-layout`):**
       - **Spotlight Stage (`#spotlight-stage`):** Previews the active game (defaults to `EDRecent.game()` when matching) with cover art, subject + age tag, cartridge index (`#01`), title, blurb, prev/next bumper buttons (`#prev-game`, `#next-game`), and launch button (`#spot-play`).
       - **Cartridge Bay (`#cartridge-grid`):** Numbered game cartridges (`#01–#57`) with search (`#q`) and clear-filter (`#clear`). Clicking an unselected cartridge loads it into the Spotlight Stage; clicking the selected cartridge (or `#spot-play`) launches the game in `EDPlayer` (`assets/player.js`) or opens `#lock-dialog` if locked by plan tier.
    3. **Bottom Channel Dock (`#subject-rail.channel-dock`):** Horizontal Switch-style dock of subject channels with their drawn marks (`EDGlyphs.mark`).

- **Kid Website Themes (`EDTheme` in `assets/i18n.js` + `#settings-dialog`):**
  - Almon requested 3 selectable website themes in Settings:
    - `default`: **Studio Console (`עיצוב סטודיו`)**
    - `princess`: **Princess & Fairytales (`נסיכות ואגדות 👑`)**
    - `spiderman`: **Spider-Man (`ספיידרמן 🕷️`)**
  - Stored in `localStorage` under `edgames-kid-theme` (and overridable via `?theme=`).
  - **Game frame vs. game canvas (`game.html`):** The outer wrapper of `game.html` (`body.game-deck`, `.console-top`, `.game-console-screen`, `.game-deck-bar`) is part of the Console Deck website shell and wears both the Console Deck structure and the active kid theme (`data-kid-theme`), while the inner game canvas (`#stage` and all 57 game modules in `games/*.js`) remains a clean white canvas (`#ffffff`) with standard `:root` tokens so the games' own internal graphics and colour mechanics are never altered.
- **High-Quality 60fps Illustrative World & Physics Games Standard (18–20 November 2026):**
  - **Style 1 + 3 Illustrative World Trilogy (20 November 2026 — Cartridges `#01`–`#03`):** Almon picked **Style 1 (*Arise: A Simple Story* 3D clay-and-wood sculpted diorama with warm volumetric point/rim lighting and shallow depth-of-field bokeh)** combined with **Style 3 (Painterly twilight bioluminescent nature panorama)** as the visual direction for new games (`mockups/illustrative-worlds/`, `assets/worlds/`):
    1. **The Lantern in the Whispering Woods (`whispering-woods`, `games/whispering-woods.js`, Cartridge `#01`, Ages 3–4, `nature`):** 4 steps × 4 rounds of continuous lantern-beam tracking, auditory/visual habitat discovery, and 1-to-1 tap-to-count correspondence (`1–6`), with rich multi-species woodland populations that scale smaller (`1.0x → 0.48x`) and deeper into natural bark/moss/fern camouflage (`0.60 → 0.06` base opacity outside the lantern beam) on harder steps.
    2. **The Woodland Stream Crossing (`stream-crossing`, `games/stream-crossing.js`, Cartridge `#02`, Ages 3–4, `shapes`):** 4 steps × 4 rounds teaching size seriation (Small/Medium/Large/Giant), subitizing & dot order (`1–4`), and river stone shapes with tactile water-ripple physics and Little Bear hopping stone-by-stone into his candle-lit burrow.
    3. **The Sun-Mirror Valley (`sun-mirror-valley`, `games/sun-mirror-valley.js`, Cartridge `#03`, Ages 6–8, `logic`):** 4 steps × 4 rounds of live 60fps optical ray-tracing, reflection angles, focusing lenses (`+2`, `+4`), and turquoise crystal beam-splitter prisms (`÷2` equal division and asymmetric ratios) to simultaneously power the Botanical Greenhouse Dome and the Golden Watermill.
  - **The Inventor's Circuit Lab (`circuit-lab`, `games/circuit-lab.js`, Cartridge `#04`)** introduces a realistic play-first game loop and museum-grade physical materials (walnut wood planks, brushed brass, 14-node Verlet cloth-braided cables, porcelain knife switches, curved-glass analog voltmeter, blackbody tungsten Edison bulb, shallow-water wave tank sailboat driven by a brushed-brass DC fan motor, and a copper-wound electromagnet cargo crane) teaching electrical loops, voltage regulation (`3V / 6V / 9V`), motor polarity (`+ / −`), and physical Boolean logic (`AND` series / `OR` parallel / track diverter).
  - **Moko's Magic Potion Lab (`potion-lab`, `games/potion-lab.js`, Cartridge `#05`)** and **The Star Factory (`star-factory`, `games/star-factory.js`, Cartridge `#06`)** provide full-scene 60fps high-DPI interactive math worlds with a 40-node shallow-water fluid wave solver, gravity-simulated pouring streams, buoyancy physics for sliced fruit pieces, subtraction drain valves, and multi-layered expressive characters (**Moko the Alchemy Monster** with 5 visual transformations and **Lumi the Star-Bot**).

## Before pushing

Run `node scripts/check-game-media.mjs` from the repo root before each push.
It reads the game content lists and checks the files under `assets/` without a
browser or network. The table shows gaps and file reuse per game, followed by
the affected entries and files without runtime references. A dash means the
game has no word or spoken picture list covered by the audit. Emoji and drawn
art count as pictures. Reusing the same file for the same word is allowed.
The check exits with status 1 only for broken media (a referenced file that is
missing, mis-cased or empty, an invalid inline picture, an unreadable game, or a
file shared by different words). Words without a recording or picture yet, and
unused design art, are listed for information: voices are added last on purpose.
Update the audit when a game adds a new content format or dynamic asset path.

Install the browser test tools once from the repo root:

```sh
npm install --no-save --package-lock=false playwright@1.64.1
npx playwright install chromium
```

Run `node scripts/smoke-games.mjs` before each push. It starts a local static
server and opens the landing page, the play page, and every ready game in the
catalog at 390 px and 1280 px. Paid games use a throwaway Pro session, and all
requests stay local. The table shows which pages opened, and the command exits
with an error if a page logs a console or JavaScript error, a request fails, or a
game never shows its first screen.

## 2. Standing Constraints

- **Vanilla HTML/CSS/JS only.** No frameworks, no build step, no TypeScript in the frontend. Must work when opened over `http://` and degrade gracefully on `file://`.
- **Bilingual (`he` RTL default, `en` LTR toggle):** Every UI string in `play.html` / `game.html` / `index.html` / `account.html` must have entries in both `UI.he` and `UI.en` in `assets/i18n.js`.
- **Persistent Game Layer (`assets/player.js`):** Opening a game from `play.html` runs it in an iframe overlay (`#play=<id>`) so pressing Back hides the frame without losing the child's progress in the round.
- **Accounts & Plans (`worker/`, `assets/auth.js`, `assets/tiers.js`):** Plan names and prices were finalized by Almon on 2026-11-08: ניצנים / Sprouts (Free, ₪0), סקרנים / Explorers (Basic, ₪19/mo or ₪149/yr; $4.99/mo or $39/yr), and אלופים / Champions (Pro, ₪29/mo or ₪229/yr; $7.99/mo or $59/yr). No early access launch perk. Payment provider is not wired yet; do not connect a real payment gateway without Almon's explicit instruction.
