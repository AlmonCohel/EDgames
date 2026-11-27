#!/usr/bin/env node
/*
  Screenshot check for one game, per docs/GAME-STANDARD.md section 7.

    node scripts/shoot-game.mjs <game-id> [more-ids…]

  For each game it opens game.html at phone, tablet and laptop size, goes
  through every step and saves what the screen shows (no scrolling) to
  review-shots/<game-id>/. It also writes:
    report.txt  — errors, how much of the screen the stage takes, cut-off check
    index.html  — all pictures on one page

  Needs playwright-core and a Chrome. It looks for playwright-core here, then
  in ../english-kids/node_modules. Chrome comes from $CHROME or the Playwright
  cache (~/Library/Caches/ms-playwright). The game runs as a Pro account in a
  throwaway browser, with no network calls to the live API.
*/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ids = process.argv.slice(2);
if (!ids.length) { console.error('usage: node scripts/shoot-game.mjs <game-id> [more-ids…]'); process.exit(1); }
for (const id of ids) {
  if (!fs.existsSync(path.join(ROOT, 'games', `${id}.js`))) { console.error(`no such game: games/${id}.js`); process.exit(1); }
}

/* ---- playwright-core + Chrome ---- */
async function loadPlaywright() {
  try { return await import('playwright-core'); } catch { /* fall through */ }
  const alt = path.join(ROOT, '..', 'english-kids', 'node_modules', 'playwright-core', 'index.mjs');
  if (fs.existsSync(alt)) return import(pathToFileURL(alt).href);
  console.error('playwright-core not found. Run: npm i -D playwright-core'); process.exit(1);
}
function findChrome() {
  if (process.env.CHROME && fs.existsSync(process.env.CHROME)) return process.env.CHROME;
  const cache = path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
  const names = [
    'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    'Chromium.app/Contents/MacOS/Chromium',
  ];
  if (!fs.existsSync(cache)) return null;
  const dirs = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) {
    for (const sub of fs.readdirSync(path.join(cache, d))) {
      for (const n of names) {
        const p = path.join(cache, d, sub, n);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
}

/* ---- tiny static server for the repo ---- */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2' };
function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

const SIZES = [
  { tag: 'phone', width: 390, height: 844, touch: true },
  { tag: 'tablet', width: 1024, height: 768, touch: true },
  { tag: 'laptop', width: 1280, height: 800, touch: false },
  { tag: 'wide', width: 1460, height: 640, touch: false }, // big wide screen, browser bars take height
  { tag: 'phone-side', width: 844, height: 390, touch: true }, // phone held sideways, full screen
  { tag: 'phone-side-bars', width: 800, height: 310, touch: true }, // phone held sideways, browser bar showing
];

const { chromium } = await loadPlaywright();
const exe = findChrome();
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;

for (const id of ids) {
  const out = path.join(ROOT, 'review-shots', id);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const report = [`Screenshot check: ${id}   (${new Date().toISOString()})`, ''];
  const pics = [];

  for (const lang of ['he', 'en']) {
    for (const size of SIZES) {
      const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 2, hasTouch: size.touch, isMobile: size.tag.startsWith('phone') });
      await ctx.route(/workers\.dev|edgames-api/, (r) => r.abort());
      await ctx.addInitScript(() => {
        try {
          localStorage.setItem('edgames-session', 'review');
          localStorage.setItem('edgames-user', JSON.stringify({ plan: 'pro', email: 'review@example.com' }));
        } catch { /* ignore */ }
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED/.test(m.text())) errors.push(m.text()); });
      await page.goto(`${base}/game.html?id=${encodeURIComponent(id)}&lang=${lang}`);
      await page.waitForTimeout(2500);

      const chips = page.locator('#set-chips .chip');
      const steps = Math.max(1, await chips.count());
      for (let s = 0; s < steps; s++) {
        if (s > 0) { await chips.nth(s).click().catch(() => {}); await page.waitForTimeout(2500); }
        await page.evaluate(() => window.scrollTo(0, 0));
        const m = await page.evaluate(() => {
          const el = document.querySelector('#stage canvas') || document.querySelector('#stage');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const vw = innerWidth, vh = innerHeight;
          const visW = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
          const visH = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
          return { share: Math.round((visW * visH) / (vw * vh) * 100), cut: r.bottom > vh + 1 || r.right > vw + 1,
            top: Math.round(r.top), bottom: Math.round(r.bottom), vh, pageScrolls: document.documentElement.scrollHeight > vh + 1 };
        });
        const name = `${lang}-${size.tag}-step${s + 1}.png`;
        await page.screenshot({ path: path.join(out, name) });
        pics.push({ name, lang, size: size.tag, step: s + 1 });
        report.push(m
          ? `${lang} ${size.tag.padEnd(6)} step ${s + 1}: stage ${String(m.share).padStart(3)}% of screen, starts at y=${m.top}${m.cut ? `, CUT OFF (ends at y=${m.bottom}, screen is ${m.vh})` : ''}${m.pageScrolls ? ', page scrolls' : ''}`
          : `${lang} ${size.tag} step ${s + 1}: no #stage found`);
      }
      if (errors.length) report.push(`  errors (${lang} ${size.tag}): ${[...new Set(errors)].slice(0, 5).join(' | ')}`);
      await ctx.close();
    }
  }

  /* The cover, at card size, as the home screen draws it. */
  {
    const ctx = await browser.newContext({ viewport: { width: 600, height: 600 }, deviceScaleFactor: 2 });
    await ctx.route(/workers\.dev|edgames-api/, (r) => r.abort());
    const page = await ctx.newPage();
    await page.goto(`${base}/game.html?id=${encodeURIComponent(id)}&lang=he`);
    await page.waitForTimeout(800);
    const has = await page.evaluate((gid) => {
      if (typeof EDCovers === 'undefined' || !EDCovers.has(gid)) return false;
      document.body.innerHTML = `<div id="cv" style="width:360px;height:360px;border-radius:20px;overflow:hidden;margin:20px">${EDCovers.art(gid).replace('<svg ', '<svg width="360" height="360" preserveAspectRatio="xMidYMid slice" ')}</div>`;
      return true;
    }, id);
    if (has) { await page.waitForTimeout(800); await page.locator('#cv').screenshot({ path: path.join(out, 'cover.png') }); }
    report.push('', has ? 'cover: saved cover.png' : 'cover: none in assets/covers.js');
    await ctx.close();
  }

  /* All of the game's art pieces, for an art review on one page. */
  const artDir = path.join(ROOT, 'assets', 'worlds', id);
  const art = fs.existsSync(artDir) ? fs.readdirSync(artDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort() : [];
  if (art.length) {
    report.push(`art: ${art.length} files in assets/worlds/${id}/ — ` + art.map((f) => `${f} ${Math.round(fs.statSync(path.join(artDir, f)).size / 1024)}KB`).join(', '));
  }

  report.push('', 'Standard: whole scene visible with no scrolling, and stage = most of the screen. See docs/GAME-STANDARD.md');
  fs.writeFileSync(path.join(out, 'report.txt'), report.join('\n') + '\n');
  const cards = pics.map((p) => `<figure class="${p.size}"><img src="${p.name}" loading="lazy"><figcaption>${p.lang} · ${p.size} · step ${p.step}</figcaption></figure>`).join('\n');
  fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>${id} — review</title>
<style>body{font:14px system-ui;background:#1d2027;color:#eee;margin:16px}pre{background:#111;padding:12px;border-radius:8px;white-space:pre-wrap}
.grid{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}figure{margin:0}img{display:block;border-radius:8px;border:1px solid #444}
.phone img{width:195px}.tablet img{width:512px}.laptop img{width:640px}.wide img{width:730px}.phone-side img,.phone-side-bars img{width:422px}figcaption{opacity:.7;margin-top:4px}</style>
<h1>${id}</h1><pre>${report.join('\n').replace(/</g, '&lt;')}</pre>
<h2>Cover</h2>${fs.existsSync(path.join(out, 'cover.png')) ? '<img src="cover.png" style="width:240px">' : '<p>none</p>'}
${art.length ? `<h2>Art pieces (light and dark backgrounds show bad edges)</h2><div class="grid">${art.map((f, i) => `<figure><img src="../../assets/worlds/${id}/${f}" style="max-width:${/^bg\./.test(f) ? 640 : 220}px;max-height:${/^bg\./.test(f) ? 400 : 220}px;background:${i % 2 ? '#d8cfbd' : '#173036'};padding:8px"><figcaption>${f}</figcaption></figure>`).join('')}</div>` : ''}
<h2>Screens</h2><div class="grid">${cards}</div>`);
  console.log(report.join('\n'));
  console.log(`\n→ ${path.relative(ROOT, out)}/index.html\n`);
}

await browser.close();
server.close();
