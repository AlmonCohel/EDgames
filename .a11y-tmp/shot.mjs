import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = 'C:/Users/Almon Cohel/AppData/Local/BrainWorktrees/cd1c6eda';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/play.html';
  const full = path.join(ROOT, p);
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(full);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`http://127.0.0.1:${port}/play.html`, { waitUntil: 'load' });
await page.waitForTimeout(400);
await page.focus('#q');
const box = await page.locator('.bay-search').boundingBox();
await page.screenshot({ path: path.join('.a11y-tmp', 'search-focus-after.png'), clip: { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 30), width: box.width + 60, height: box.height + 60 } });
await browser.close();
server.close();
