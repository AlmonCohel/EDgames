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
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();

async function contrastAudit(urlPath, viewport, label) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${base}${urlPath}`, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  const results = await page.evaluate(() => {
    function parseColor(c) {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(',').map((s) => parseFloat(s));
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    }
    function luminance({ r, g, b }) {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }
    function ratio(c1, c2) {
      const l1 = luminance(c1), l2 = luminance(c2);
      const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }
    function over(top, bottom) {
      const a = top.a + bottom.a * (1 - top.a);
      if (a === 0) return { r: 255, g: 255, b: 255, a: 0 };
      const mix = (c) => (top[c] * top.a + bottom[c] * bottom.a * (1 - top.a)) / a;
      return { r: mix('r'), g: mix('g'), b: mix('b'), a };
    }
    function effectiveBg(el) {
      const layers = [];
      let node = el;
      while (node) {
        const cs = getComputedStyle(node);
        const bg = parseColor(cs.backgroundColor);
        if (bg && bg.a > 0) layers.push(bg);
        node = node.parentElement;
      }
      let result = { r: 255, g: 255, b: 255, a: 1 }; // page default
      for (let i = layers.length - 1; i >= 0; i -= 1) result = over(layers[i], result);
      return result;
    }
    const out = [];
    const all = document.querySelectorAll('body *');
    all.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasOwnText) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) return;
      const fg = parseColor(cs.color);
      if (!fg) return;
      const bg = effectiveBg(el);
      const effFg = fg.a < 1 ? over(fg, bg) : fg;
      const fontSize = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700 || cs.fontWeight === 'bold';
      const large = fontSize >= 18.66 || (fontSize >= 14 && bold);
      const req = large ? 3 : 4.5;
      const cr = ratio(effFg, bg);
      if (cr < req) {
        out.push({
          tag: el.tagName, id: el.id || null, cls: (el.className || '').toString().slice(0, 60),
          text: el.textContent.trim().slice(0, 40), fontSize, bold, cr: Math.round(cr * 100) / 100, req,
        });
      }
    });
    // dedupe by tag+cls+text
    const seen = new Set();
    return out.filter((o) => {
      const key = `${o.tag}|${o.cls}|${o.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  await ctx.close();
  return { label, failures: results };
}

const out = [];
for (const [urlPath, label] of [['/play.html', 'play.html'], ['/game.html?id=color-pop', 'game.html'], ['/account.html?view=login', 'account.html-login'], ['/account.html?view=signup', 'account.html-signup']]) {
  for (const [vp, vlabel] of [[{ width: 390, height: 844 }, 'phone'], [{ width: 1280, height: 800 }, 'laptop']]) {
    out.push(await contrastAudit(urlPath, vp, `${label} @ ${vlabel}`));
  }
}
await browser.close();
server.close();
console.log(JSON.stringify(out, null, 2));
