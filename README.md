# גנון משחקים — EDgames

A small static site of educational games for children aged 3–8. Hebrew (RTL) by
default with an English (LTR) toggle. No build step, no framework, no backend —
plain HTML/CSS/JS served as files.

## Layout

```
index.html            the home screen: app bar, subject rail, shelves, bottom bar
game.html             the host page a game runs inside
assets/styles.css     theme tokens + shared components
assets/i18n.js        the two UI string tables and the language toggle
assets/catalog.js     subjects, age groups, and the game catalog
assets/glyphs.js      the seven drawn subject marks and the interface icons
assets/scenes.js      one drawn picture per game, for the tiles and the game page
assets/app.js         the home screen: filtering, shelves and results
assets/recent.js      the last game opened, for the card at the top of the home screen
assets/sound.js       tones made on the spot, for the three games that listen
assets/game-host.js   loads and mounts a game module by id, and picks its set
games/<id>.js         one file per game
mockups/              the three design directions; direction 3 is the one that was built
netlify.toml          publish config
```

## The shape of the home screen

It is an app shell, phone first: an app bar, one horizontal rail of subjects,
and a fixed bottom bar holding the two things a grown-up does — filter by age,
search. On a screen 900px or wider the bottom bar becomes a side rail and the
rows wrap into a grid; nothing is designed twice.

There are two modes over the one catalog, and which is on screen depends only on
whether anything is filtered:

- **Browse** — the game last played, a row of everything ready, a row per
  subject with more than one finished game, and a list of what is still being
  built. Nineteen games across seven subjects reads well as rows and badly as a
  wall. All nineteen are finished, so the *בקרוב* / *Coming soon* list is empty
  and its shelf hides itself — a heading with nothing under it reads as a
  section that failed to load, not as work that is done. Add a game with
  `status: 'soon'` and the shelf comes back on its own.
- **Results** — the same tiles laid flat, with the count line and the empty
  state. Picking a subject, an age or a search term is a question, and a
  question deserves an answer rather than a rearranged shelf.

The two filter drawers open from the bottom bar, so on a phone they appear just
above it, where the thumb already is; Escape closes them, as does pressing the
same tab again.

## Running it

Open `index.html` in a browser, or serve the folder (`npx serve .`). Games load
over `<script src>` so `file://` works too.

## Filters

Age groups are 3–4 / 5–6 / 7–8. A game matches a group when their ranges
overlap, so a game marked 3–5 appears under both 3–4 and 5–6. Subject and the
search box narrow further; several chips in the same row are an OR. The filter
state is kept in the URL, so opening a game and coming back keeps it. Opened as
a file, where the browser refuses to rewrite the URL, the same state falls back
to `sessionStorage` — for that tab and that session, which is as long as the URL
would have held it.

A page opened on a link that already carries a filter opens the drawer that
filter came from, so a narrowed list is never unexplained.

## Pictures

The artwork is the site's own, drawn in two sizes of idea:

- **A subject is a mark** — seven of them in `assets/glyphs.js`, plus the few
  interface icons the chrome needs. They are what the rail chips wear and what
  bleeds oversized across a card as the ghost behind the picture.
- **A game is a scene** — nineteen of them in `assets/scenes.js`, one per game:
  balloons and a burst for Color Pop, a duck on the water for Counting Ducks, a
  staircase with one step missing for The Tower Stairs. This is the site for
  children who cannot read the title yet, so a tile has to say what the game is
  before it is pressed, and a shelf of seven repeating marks did not.

Emoji used to do both jobs and that is most of what read as unfinished — an
emoji is the machine's drawing, not ours, it differs on every device, and it
looks like a placeholder nobody got round to replacing.

Both are one pen: a 32×32 viewBox, round caps, `currentColor` so a drawing is
white on its subject's field and takes any other colour without being redrawn.
Scenes use a slightly lighter stroke than the marks, because a scene carries
more lines in the same square. Two conventions run through them: a dashed
outline is always a place with nothing in it yet — the hole in the sorting
board, the missing stair, the gap in the spell — and the two scenes whose
meaning is their direction are listed in `EDScenes.FLIP` and turn round with
the page, so the arrow on the tile runs the way the board it opens runs.

Under the picture a game's cover still carries a field: one of four
compositions and one of three weights, picked off the game's id and then spread
so no two games in one subject collide — `EDGlyphs.covers`. That began as the
way to tell two tiles of one subject apart; now that the picture does that, the
field is the texture a row is made of. A game keeps its field for good unless a
game is later added to the same subject ahead of it.

A game's own text and pictures are still its own business, and several games use
emoji inside their rounds on purpose — a ladybird is a ladybird.

## Language

Hebrew is the default; the 🌐 button in the header switches to English and
back. The choice is kept in `localStorage` so it survives a fresh visit, and
mirrored into `?lang=en` so a shared link opens in the language it was shared
in — the URL wins over the stored choice. Hebrew, being the default, stays out
of the URL. Switching reloads the page: the grid's filters live in the URL and
survive it, and a running game wants a fresh mount anyway.

Text lives in three places, by owner:

- **Site chrome** — `UI.he` / `UI.en` in `assets/i18n.js`, keyed. Static markup
  carries `data-i18n="key"` (`-html`, `-content`, `-placeholder`, `-label` for
  the other targets) and `EDLang.applyStatic()` swaps it in.
- **Catalog text** — `{ he, en }` on the entry itself, read with
  `EDLang.pick(field)`. Adding a game stays one entry.
- **A game's own text** — inside its module, next to its CSS.

`assets/i18n.js` loads in `<head>` so `lang` and `dir` are set before the first
paint and an English visit never flashes RTL.

## Sets

A **set** is one run of a game: the same rules with different questions. Every
game carries at least three, so a child who presses *עוד פעם* / *Again* three
times gets three different games rather than the same one reshuffled.

The picker sits between the header and the stage, so a grown-up can put a set on
without going into the game, and repeat one the child liked. Pressing *Again* at
the end moves on to the next set and wraps around at the last. The set on screen
is kept in the URL as `?set=<id>`, which makes it bookmarkable and survives the
language toggle's reload.

Which axis a game varies is the game's own call: colours in Color Pop, which
mouse skill is drilled hardest (and what is on the field) in Mouse Moves, which
part of the keyboard in Meet the Keyboard, how much the path has to bend in The
Way Home, and how fast and how many at once in Catch and Click. The later games
vary the same way: how far the counting goes — and whether there are frogs on
the lake to leave out — in Counting Ducks, which shapes and whether size decides
the hole in Find the Shape, which deck and how many pairs in Pair by Pair, how
alike the letters on the grid are in Letter Hunt, and whether the sum still
arrives with cookies to count in Plus and Minus. The fairytale three do the
same: how many pictures a tale is told in in What Happened First, whether the
tower is climbed, come down or skipped up in twos in The Tower Stairs, and
whether the missing letter is the one a word opens or closes with — and how much
word there is behind it — in The Wizard's Spell.

The six that finished the catalog vary the same way: which animals are in
earshot in Who Said That?, whether the keyboard is free to play with or has a
tune to copy back — and how long the tune is — in Animal Piano, whether a rhythm
is only counted or has short and long gaps in it in Clap the Beat, how much of
the picture is missing *and whether the finished one stays on screen to copy
from* in Park Puzzle, how many days are in play and how much of the rack suits
none of them in What Is the Weather?, and how long the word is — and whether a
letter is on the table that belongs to no part of it — in Build a Word.

## Sound

Three games listen: Who Said That?, Animal Piano and Clap the Beat. There are no
sound files. A folder of mp3s would be the first thing here that has to be
fetched, cached and kept in step with the code, and this site has no build step
to keep it there — so `assets/sound.js` makes the sounds out of an oscillator
and a pitch curve, the same way the tiles are made out of an SVG path rather
than a photograph. Only `game.html` loads it.

    EDSound.wake();                       // from inside a click
    EDSound.note(440, { seconds: 0.4 });  // one pitch
    EDSound.note([300, 520, 240]);        // a pitch that slides through them
    EDSound.drum();                       // a beat
    EDSound.hush();                       // on unmount, or the last note follows
                                          // the child back to the home screen

Two things follow from making sound this way rather than recording it. The first
is that a curve through an oscillator is a cartoon of a cow, not a cow — so Who
Said That? writes the call out as well, מו / Moo, and a child is never asked to
recognise a sound the file cannot really make. The second is that nothing plays
before the page has been touched, because no browser allows it; every one of the
three opens on a button that asks to be pressed, which is the round starting
anyway. A device with no Web Audio at all still gets a playable game, and is
told so rather than left in silence.

## Adding a game

1. Add an entry to `GAMES` in `assets/catalog.js` with `status: 'soon'`. Give
   `title` and `blurb` in both languages. It appears on the home screen right
   away, in the *בקרוב* / *Coming soon* list, and its page explains that it is
   still being built.
2. Write `games/<id>.js`. The id in the catalog and the filename must match.
3. Draw it a scene in `assets/scenes.js`, under the same id — a few strokes
   saying what happens in the game. Until there is one it borrows its subject's
   mark, so nothing is ever an empty square, but a game the child can tell
   apart at a glance is the whole point of that file.
4. Flip `status` to `'ready'`. It moves up into the shelves with a field of its
   own.

Inside a game's own rounds, pictures are usually emoji, and the font behind them
is the machine's, not ours. Windows 10 stops at Emoji 12, so anything newer —
🪄 🫘 🪵 🪙 🪜 and the rest of that batch — comes out as an empty box on the very
screen this is played on. If an emoji arrived after about 2019, check it renders
before building a round on it; the older, plainer one is the safer picture.

A game module registers itself with the host:

```js
EDGames.register('my-game', {
  sets: [ { id: 'easy', emoji: '🌱', label: { he: 'קל', en: 'Easy' }, /* ...whatever the game needs */ } ],
  mount(root, ctx) { /* root is the empty stage element */ },
  unmount() { /* optional — clear timers and listeners */ },
});
```

`ctx` carries `{ game, lang, set, again(), exit() }` — `game` is the catalog
entry, `lang` is `'he'` or `'en'`, `set` is the entry from `sets` the child is
playing, `again()` starts the next set, and `exit()` sends the child back to the
grid in the same language. The host only ever reads `id`, `emoji` and `label`
off a set; the rest is yours, and `mount` should fall back to the first set if
`ctx.set` is missing. A game with no `sets` still works — the picker stays
hidden and `again()` simply replays it.

Keep a game's CSS and its text inside its own module so games cannot restyle or
retranslate each other. `games/color-pop.js` is the worked example: it holds a
`TEXT` table with a line per language, because a sentence rarely survives being
assembled from slots in two grammars.

## House rules this follows

- One set of theme tokens in `assets/styles.css`, and a game module reads them
  rather than hard-coding a colour — `--pos`, `--border`, `--text-soft`, the
  per-subject `--sub-solid` / `--sub-tint` / `--sub-ink` triple and the rest. The
  canvas stays neutral on purpose: the colour a child sees belongs to the
  subject of the game, not to the site.
- Direction-agnostic: logical CSS properties throughout, so `dir="rtl"` and
  `dir="ltr"` both lay out correctly. The back arrow is mirrored under
  `[dir="rtl"]` only, and number ranges keep their LTR wrappers in both.
- Big tap targets (44px+ chips, 46px buttons, a 66px bottom bar) because the
  audience has small fingers, and wrong answers never punish.
- Focus is visible, `prefers-reduced-motion` is respected, and the results view
  has a real empty state.
