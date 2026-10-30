# Accounts and plans

The ground work for selling EDgames. Built 2026-10-30. **No payment provider is connected and nothing is charged.**

## The plans

Each plan includes everything below it. A game's plan is the `tier` word on its entry in `assets/catalog.js`; moving a game between plans is that one word. Names and taglines are in `assets/tiers.js`.

| Plan | Needs | Holds |
|---|---|---|
| guest | nothing | the 34 games that existed before accounts (no `tier`) |
| free | an account | + Bubbles in Order, Who Does Not Belong?, Sort into Baskets |
| basic | an account; paid later | + The Pizza Shop, Code the Robot, The Colour Lab |
| pro | an account; paid later | + First English Words (English), Make Ten (maths), What Comes Next? (logic) |

Pro is a starter set: one game per learning track. Adding a game: README, "Adding a game", with `tier` on the entry. Plan ids must match `PLANS` in `worker/src/index.js`.

Prices are not decided, so none appear anywhere. The site says "free during the launch".

## Open decisions (Almon, 2026-10-30)

Nothing below is to be changed or proposed until he says so. Each has a Blocked card on The Brain.

- **The landing page design:** he is not happy with how it looks and does not yet know what he wants. It stays as it is for now.
- **Prices:** not set. None appear anywhere; do not add any.
- **Plan names:** Free, Basic and Pro are working names, not final. Change them only in `assets/tiers.js`. The ids `free`, `basic`, `pro` are internal and can stay.
- **More Pro games:** yes, but not as part of the build that made this. Not started.

## The pieces

| What | Where |
|---|---|
| Landing page | `index.html`, `assets/landing.js`. Shows until a visitor chooses once (`edgames-entered` in localStorage), then forwards to the games. `?home=1` always shows it; the logo on the games page links there. Links with a filter or `#play=` go straight to the games |
| The games' home screen | `play.html` (this was `index.html` until 2026-10-30) |
| Sign up, log in, forgot, reset, my account | `account.html`, `assets/account.js`, drawn per `?view=`. `?plan=` preselects, `?next=<game id>` opens that game afterwards |
| Legal | `privacy.html`, `terms.html`: both languages in one file |
| Auth client | `assets/auth.js` (`EDAuth`). `canPlay(game)` is the only lock check; `app.js` (the tile), `game-host.js` (a direct link) and `recent.js` (the carry-on card) all call it |
| API | `worker/src/index.js`, Cloudflare Worker `edgames-api`: https://edgames-api.almon-cohel.workers.dev |
| Database | D1 `edgames`, schema in `worker/migrations/` |
| Tests | `cd worker && node --test test/api.test.mjs` (a local Worker and D1, and a fake mail relay) |

## Deploying

`cd worker && npx wrangler@4 d1 migrations apply edgames --remote && npx wrangler@4 deploy`, then push `main` for the site (GitHub Pages). The Brain's deploy target runs all of that.

Worker secrets: `MAIL_RELAY_URL`, `MAIL_RELAY_SECRET`. These point at Tally's mail relay (`tally/mail-relay`), so reset mail goes out from the owner's Google account, with the sender name set to the site's. If Tally's relay is redeployed to a new URL or changes secret, update both here too.

## How it works

- **Accounts belong to the grown-up.** Email and password only. Nothing about a child is stored, and `privacy.html` promises that: keep it true.
- **Passwords:** PBKDF2-SHA256, 100,000 rounds (the most Workers allows), the count stored with each hash. 30 logins in 3 bursts of 10 on the live Worker: none failed, about 0.8s each, mostly network and D1.
- **Sessions:** a random token in localStorage, sent as `Authorization: Bearer`, SHA-256 in D1, 90 days. A bearer token because the site and the API are on different domains and browsers block third-party cookies. CORS allows only `ALLOWED_ORIGINS`.
- **Limits:** 8 wrong passwords per email per 15 minutes, 40 per address; 10 sign-ups per address per hour; 3 reset mails per email per hour. Stored hashed, cleared after a day.
- **The audit log** is the `events` table: signup, login, login_failed, plan_change, reset_requested, password_reset, account_deleted. No email in it, and `user_id` is cleared when an account is deleted.
- **The games never depend on the API.** It down, or the site opened as a file, a guest plays as before and a signed-in device keeps the plan it last knew. Only a clear "session ended" answer signs anyone out.

## Before charging real money

1. **Make the lock real.** The lock is on the page, not on the files: `games/*.js` are public on GitHub Pages and the repo is public, so someone technical can open a paid game. Fine while everything is free. To enforce it: make the repo private, move hosting (Cloudflare Pages), and have the Worker serve paid game files after checking the plan. `loadModule` in `assets/game-host.js` is the one place that loads a game.
2. **Connect a provider.** `requestPlan` in `worker/src/index.js` is the seam: for a paid plan, return the provider's checkout URL instead of granting it, and let a new webhook route call `applyPlan(..., 'active', ...)`. `users` already has `billing_provider`, `billing_ref` and `plan_expires_at`, and a plan past its date counts as free. Stripe does not onboard Israeli sellers (see `english-kids/README.md` for the candidates: Grow, Cardcom, PayPlus, Lemon Squeezy, Paddle).
3. **Move the early-access users.** Everyone on a paid plan now has `plan_status = 'early_access'`. `terms.html` promises notice, no charge without their confirmation, and a move to Free if they do not confirm. That needs a way to email them (only reset mail exists now).
4. **Add a parent gate.** A locked tile only says "call a grown-up". Add a check a small child cannot pass before any payment screen.
5. **Have a lawyer read `privacy.html` and `terms.html`.** They were written without one and name no legal entity, only an email. Children's data and consumer-cancellation rules are the points to check.
