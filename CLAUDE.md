# EDgames — Project Rules & Decisions (`CLAUDE.md`)

Read this before touching `EDgames`. Alongside `README.md` and `docs/ACCOUNTS.md`, this records Almon's design and architecture decisions so Claude, Gemini (`gemini-mac`), and the PC agents stay aligned.

## 1. Current Design & Architecture (31 October 2026)

- **Home screen (`play.html` + `assets/app.js` + `assets/styles.css`):**
  - Almon picked **Direction 1 — Console Deck (`הקונסולה`, from `mockups/v4/1-console/`)** as the live structure for `play.html`.
  - Do **not** revert `play.html` back to the old multi-row horizontal scrolling shelves or bottom tab bar.
  - Structure of `play.html`:
    1. **Top Hardware Bar (`.console-top`):** Logo link to `index.html?home=1`, `ED-DECK` LED kicker, brand title, active kid-theme badge, age segmented switcher (`#age-chips`), sound toggle (`#sound-toggle`), language toggle (`#lang-toggle`), account button (`#account-chip`), and the **Design & Settings (`#settings-toggle`)** button.
    2. **Inner Console Screen (`.console-screen` / `.deck-layout`):**
       - **Spotlight Stage (`#spotlight-stage`):** Previews the active game (defaults to `EDRecent.game()` when matching) with cover art, subject + age tag, cartridge index (`#01`), title, blurb, prev/next bumper buttons (`#prev-game`, `#next-game`), and launch button (`#spot-play`).
       - **Cartridge Bay (`#cartridge-grid`):** Numbered game cartridges (`#01–#43`) with search (`#q`) and clear-filter (`#clear`). Clicking an unselected cartridge loads it into the Spotlight Stage; clicking the selected cartridge (or `#spot-play`) launches the game in `EDPlayer` (`assets/player.js`) or opens `#lock-dialog` if locked by plan tier.
    3. **Bottom Channel Dock (`#subject-rail.channel-dock`):** Horizontal Switch-style dock of subject channels with their drawn marks (`EDGlyphs.mark`).

- **Kid Website Themes (`EDTheme` in `assets/i18n.js` + `#settings-dialog`):**
  - Almon requested 3 selectable website themes in Settings:
    - `default`: **Studio Console (`עיצוב סטודיו`)**
    - `princess`: **Princess & Fairytales (`נסיכות ואגדות 👑`)**
    - `spiderman`: **Spider-Man (`ספיידרמן 🕷️`)**
  - Stored in `localStorage` under `edgames-kid-theme` (and overridable via `?theme=`).
  - **Hard rule from Almon:** The theme choice affects the **website shell only** (`play.html`, `index.html`, `account.html`), **never `game.html` or the games themselves**. `EDTheme` checks `isGamePage` and never sets `data-kid-theme` on `game.html`.

## 2. Standing Constraints

- **Vanilla HTML/CSS/JS only.** No frameworks, no build step, no TypeScript in the frontend. Must work when opened over `http://` and degrade gracefully on `file://`.
- **Bilingual (`he` RTL default, `en` LTR toggle):** Every UI string in `play.html` / `game.html` / `index.html` / `account.html` must have entries in both `UI.he` and `UI.en` in `assets/i18n.js`.
- **Persistent Game Layer (`assets/player.js`):** Opening a game from `play.html` runs it in an iframe overlay (`#play=<id>`) so pressing Back hides the frame without losing the child's progress in the round.
- **Accounts & Plans (`worker/`, `assets/auth.js`, `assets/tiers.js`):** Paid plans are in free early access (no payment provider wired). Do not wire payments or set prices without Almon's explicit instruction.
