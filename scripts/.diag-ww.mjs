import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.woff2': 'font/woff2',
};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = path.relative(root, file);
    if (relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || !types[path.extname(file)]) {
      res.writeHead(404).end();
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] }).end(body);
  } catch (error) {
    res.writeHead(['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code) ? 404 : 500).end();
  }
});

await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  args: ['--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  serviceWorkers: 'block',
  storageState: { cookies: [], origins: [{ origin, localStorage: [
    { name: 'edgames-session', value: 'smoke-test' },
    { name: 'edgames-user', value: JSON.stringify({ plan: 'pro' }) },
  ] }] },
});
const page = await context.newPage();
const counts = new Map();
const timeline = [];
const t0 = process.hrtime.bigint();
page.on('request', (req) => {
  const u = req.url();
  counts.set(u, (counts.get(u) || 0) + 1);
  const t = Number(process.hrtime.bigint() - t0) / 1e6;
  timeline.push(`${t.toFixed(0)}ms ${u.replace(origin, '')}`);
});
page.on('console', (m) => console.log('CONSOLE', m.type(), m.text()));
await page.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (url.origin === origin) return route.continue();
  if (url.origin === 'https://fonts.googleapis.com' && url.pathname === '/css2') {
    return route.fulfill({ contentType: 'text/css', body: '' });
  }
  if (url.protocol === 'https:' && url.pathname === '/pulse.js' && route.request().resourceType() === 'script') {
    return route.fulfill({ contentType: 'text/javascript', body: '' });
  }
  return route.abort('blockedbyclient');
});
const firstScreen = '#stage > :not(.stage-note, script, style):is(:not(:empty), canvas, img, svg):visible';
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 20 });
await page.goto(origin + '/game.html?id=whispering-woods', { timeout: 8000 });
await page.locator(firstScreen).first().waitFor({ state: 'visible', timeout: 8000 });
console.log('--- first screen visible at', (Number(process.hrtime.bigint() - t0) / 1e6).toFixed(0), 'ms, requests so far:', timeline.length, '---');
try {
  await page.waitForLoadState('networkidle', { timeout: 8000 });
  console.log('--- networkidle reached at', (Number(process.hrtime.bigint() - t0) / 1e6).toFixed(0), 'ms ---');
} catch (e) {
  console.log('--- networkidle TIMED OUT:', e.message.split('\n')[0], '---');
}
console.log('--- total requests:', timeline.length, '---');
console.log('--- repeated URLs (count > 1) ---');
for (const [u, c] of counts) if (c > 1) console.log(c, u.replace(origin, ''));
console.log('--- last 60 timeline entries ---');
for (const line of timeline.slice(-60)) console.log(line);
await browser.close();
server.close();
