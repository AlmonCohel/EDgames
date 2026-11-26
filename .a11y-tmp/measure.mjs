import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Almon Cohel/AppData/Local/BrainWorktrees/cd1c6eda';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

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
const base = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();

async function measurePage(urlPath, viewport, label) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  let totalBytes = 0;
  let reqCount = 0;
  page.on('response', async (resp) => {
    try {
      const h = resp.headers();
      const len = h['content-length'] ? parseInt(h['content-length'], 10) : (await resp.body().then((b) => b.length).catch(() => 0));
      totalBytes += len || 0;
      reqCount += 1;
    } catch {}
  });

  const longTasks = [];
  await page.addInitScript(() => {
    window.__longTasks = [];
    try {
      const obs = new PerformanceObserver((list) => {
        list.getEntries().forEach((e) => window.__longTasks.push(e.duration));
      });
      obs.observe({ entryTypes: ['longtask'] });
    } catch {}
  });

  const t0 = Date.now();
  await page.goto(`${base}${urlPath}`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const loadMs = Date.now() - t0;

  const nav = await page.evaluate(() => {
    const [entry] = performance.getEntriesByType('navigation');
    return entry ? { domContentLoaded: entry.domContentLoadedEventEnd, loadEvent: entry.loadEventEnd } : null;
  });
  const lt = await page.evaluate(() => window.__longTasks || []);

  // Touch target audit: interactive elements smaller than 44x44 (css px)
  const smallTargets = await page.evaluate(() => {
    const sel = 'button, a[href], input, [role="button"], [role="option"], [role="radio"]';
    const out = [];
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return; // hidden
      if (r.width < 44 || r.height < 44) {
        out.push({ tag: el.tagName, id: el.id || null, cls: el.className, w: Math.round(r.width), h: Math.round(r.height) });
      }
    });
    return out;
  });

  // Accessible-name audit: interactive elements with no visible text, aria-label, aria-labelledby, alt or title
  const unlabeled = await page.evaluate(() => {
    const sel = 'button, a[href], input, [role="button"], [role="option"]';
    const out = [];
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const text = (el.textContent || '').trim();
      const hasLabel = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title');
      const hasAlt = el.tagName === 'INPUT' && el.getAttribute('placeholder');
      if (!text && !hasLabel && !hasAlt) {
        out.push({ tag: el.tagName, id: el.id || null, cls: el.className, html: el.outerHTML.slice(0, 160) });
      }
    });
    return out;
  });

  // Images without explicit width/height
  const unsizedImgs = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        out.push({ src: img.getAttribute('src'), id: img.id || null });
      }
    });
    return out;
  });

  await ctx.close();
  return { label, loadMs, nav, longTasksCount: lt.length, longTasksTotalMs: Math.round(lt.reduce((a, b) => a + b, 0)), totalBytes, reqCount, smallTargets, unlabeled, unsizedImgs };
}

const results = [];
for (const [urlPath, label] of [['/account.html', 'account.html'], ['/privacy.html', 'privacy.html'], ['/terms.html', 'terms.html']]) {
  for (const [vp, vlabel] of [[{ width: 390, height: 844 }, 'phone'], [{ width: 1280, height: 800 }, 'laptop']]) {
    results.push(await measurePage(urlPath, vp, `${label} @ ${vlabel}`));
  }
}

await browser.close();
server.close();

console.log(JSON.stringify(results, null, 2));
