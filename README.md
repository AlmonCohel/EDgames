# גנון משחקים — EDgames

A small static site of educational games for children aged 3–8. Hebrew (RTL) by
default with an English (LTR) toggle, Deep Green Light theme. No build step, no
framework, no backend — plain HTML/CSS/JS served as files.

## Layout

```
index.html            the grid: hero, filters, game cards
game.html             the host page a game runs inside
assets/styles.css     theme tokens + shared components
assets/i18n.js        the two UI string tables and the language toggle
assets/catalog.js     subjects, age groups, and the game catalog
assets/app.js         filtering and grid rendering
assets/game-host.js   loads and mounts a game module by id, and picks its set
games/<id>.js         one file per game
netlify.toml          publish config
```

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
arrives with cookies to count in Plus and Minus.

## Adding a game

1. Add an entry to `GAMES` in `assets/catalog.js` with `status: 'soon'`. Give
   `title` and `blurb` in both languages. It appears in the grid right away,
   marked *בקרוב* / *Soon*, and its page explains that it is still being built.
2. Write `games/<id>.js`. The id in the catalog and the filename must match.
3. Flip `status` to `'ready'`.

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

- Deep Green Light tokens from the house design system; glass cards; floating
  shapes used once, behind content. The canvas stays neutral on purpose — the
  colour a child sees belongs to the subject of the card, not to the site.
- Direction-agnostic: logical CSS properties throughout, so `dir="rtl"` and
  `dir="ltr"` both lay out correctly. The back arrow is mirrored under
  `[dir="rtl"]` only, and number ranges keep their LTR wrappers in both.
- Big tap targets (46px+ chips, 48px buttons) because the audience has small
  fingers, and wrong answers never punish.
- Focus is visible, `prefers-reduced-motion` is respected, and the grid has a
  real empty state.
