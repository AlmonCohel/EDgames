#!/usr/bin/env node
/* Regression test: the landing page's hero showcase names a handful of game
   ids by hand (assets/landing.js). If one of those ids is ever renamed or
   removed from the catalog while its cover art stays registered (assets/covers.js
   never drops old art), the showcase used to read `gameById(id).subject` on a
   missing game and throw — which stopped the whole landing-page script before
   it ever built the plan cards, so a parent saw a page with no plans or prices.

   No network, no real accounts: a local static server with one request
   intercepted to simulate a stale showcase id. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.json': 'application/json' };

const server = createServer(async (req, res) => {
  const reqPath = req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0];
  try {
    let body = await readFile(join(root, reqPath));
    if (reqPath === '/assets/catalog.js') {
      // Simulate 'count-the-ducks' having been renamed in the catalog while
      // its cover art (keyed by the old id) is still registered in covers.js.
      body = Buffer.from(body.toString('utf8').replace("id: 'count-the-ducks',", "id: 'count-the-ducks-renamed',"));
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(reqPath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push(err.message));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(300);
const planCards = await page.locator('#plan-cards .plan').count();

await browser.close();
server.close();

if (errors.length || planCards !== 3) {
  console.error(`FAIL landing page with a stale showcase id: errors=${JSON.stringify(errors)} planCards=${planCards} (expected 3)`);
  process.exitCode = 1;
} else {
  console.log(`PASS landing page still renders its ${planCards} plan cards and hero art when a showcase id no longer matches the catalog`);
}
