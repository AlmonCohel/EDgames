# Design directions — how to open them away from this machine

> **Direction 3 was chosen, and the site is now built as it.** These three pages
> stay as the record of what was decided and what was turned down; the live
> `index.html` and `game.html` are the finished version of direction 3, not
> these. Where the two differ, the site wins — a mockup is a drawing and it is
> allowed to be out of date.

These are ordinary files in this folder, so opening them normally means having
the repo checked out, which is no use on a phone. The links below serve the same
files straight off the `design-mockups-v2` branch over HTTPS, without putting
anything unreviewed on the live site.

**Start here** — the comparison page, all three side by side, with what each one
is trying to fix and what it would cost:

https://raw.githack.com/AlmonCohel/EDgames/design-mockups-v2/mockups/index.html

The three on their own, if the previews on that page are too small to judge:

| | |
|---|---|
| 1 — Poster · כרזה | https://raw.githack.com/AlmonCohel/EDgames/design-mockups-v2/mockups/1-poster.html |
| 2 — Trail · מסלול | https://raw.githack.com/AlmonCohel/EDgames/design-mockups-v2/mockups/2-trail.html |
| 3 — App · אפליקציה | https://raw.githack.com/AlmonCohel/EDgames/design-mockups-v2/mockups/3-app.html |

Directions 2 and 3 are designed phone-first. Open at least one of them on a
phone before deciding — on a laptop they are being judged on a screen they were
not drawn for.

## How this is served, and how to stop it

`raw.githack.com` is a proxy that re-serves a public repo's files with real
content types. That is the whole trick: GitHub's own raw URLs send HTML as
`text/plain`, so a browser shows you the source instead of the page. The mockups
pull `../assets/catalog.js` from the same branch through the same proxy, so the
real nineteen games and the real Hebrew render rather than filler.

Nothing is hosted anywhere new and no account was created. The links live
exactly as long as the branch does — delete `design-mockups-v2` and they stop
resolving the same minute. It is a preview proxy, not hosting: expect a slow
first load, and do not point anything permanent at it.

If a direction gets picked, that is when it belongs on the real domain. This
branch only ever adds this folder — every file the live grid is built from is
untouched by it — so merging it to `main` changes nothing a visitor sees, and
GitHub Pages then serves the same pages from
`almoncohel.github.io/EDgames/mockups/`, which is faster and does not depend on
a third party staying up.

## What is in here

| File | |
|---|---|
| `index.html` | the comparison page: the diagnosis, the three directions, costs, a recommendation |
| `1-poster.html` | direction 1 — same page shape, everything turned up until it means something |
| `2-trail.html` | direction 2 — the grid becomes one walked trail with three stations |
| `3-app.html` | direction 3 — a phone-first app shell; rails instead of a wall. **The one that was built.** |

The seven drawn subject marks all three directions share moved to
`../assets/glyphs.js` when direction 3 was built, because the live site needs
them too and one copy of a drawing is the whole point. These pages load it from
there.

Nothing else in here is loaded by the live site: `index.html` and `game.html` at
the repo root do not reference this folder.
