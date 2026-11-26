import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Almon Cohel/AppData/Local/BrainWorktrees/cd1c6eda';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
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
await page.waitForTimeout(500);

const info = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.age-btn, .channel-key span, #bay-count').forEach((el) => {
    const cs = getComputedStyle(el);
    out.push({
      text: el.textContent.trim().slice(0, 20),
      color: cs.color,
      bg: cs.backgroundColor,
      parentBg: el.parentElement ? getComputedStyle(el.parentElement).backgroundColor : null,
      parentBgImg: el.parentElement ? getComputedStyle(el.parentElement).backgroundImage.slice(0,40) : null,
    });
  });
  return out;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
server.close();
