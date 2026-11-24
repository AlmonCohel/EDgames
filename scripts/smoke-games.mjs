#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { checkCircuitLab } from './check-circuit-lab.mjs';
import { checkPotionLab } from './check-potion-lab.mjs';
import { checkStarFactory } from './check-star-factory.mjs';
import { checkStreamCrossing, checkWhisperingWoods } from './check-woodland-games.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const checks = {
  'circuit-lab': checkCircuitLab, 'potion-lab': checkPotionLab, 'star-factory': checkStarFactory,
  'stream-crossing': checkStreamCrossing, 'whispering-woods': checkWhisperingWoods,
};
const gameCheck = Object.keys(checks).find((id) => process.argv.includes(`--${id}`));
const sizes = [{ width: 390, height: 844 }, { width: 1280, height: 800 }];
const timeout = 8000;
const cartridges = '#cartridge-grid .cartridge[data-status="ready"]';
const firstScreen = '#stage > :not(.stage-note, script, style):is(:not(:empty), canvas, img, svg):visible';
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

async function open(context, origin, route, screen, afterLoad) {
  const page = await context.newPage();
  const errors = new Set();
  page.on('console', (message) => {
    if (message.type() === 'error') errors.add(`Console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.add(`Page error: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.add(`HTTP ${response.status()}: ${response.url()}`);
  });
  page.on('requestfailed', (request) => {
    errors.add(`Request failed: ${request.url()} (${request.failure()?.errorText})`);
  });
  try {
    // Stand in for the two optional remote assets and fail on any other off-origin request.
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
    await page.goto(origin + route, { timeout });
    if (new URL(page.url()).pathname !== new URL(route, origin).pathname) {
      throw new Error(`Unexpected navigation to ${page.url()}`);
    }
    try {
      await page.locator(screen).first().waitFor({ state: 'visible', timeout });
    } catch (error) {
      if (error.name !== 'TimeoutError') throw error;
      throw new Error(`First screen did not appear within ${timeout / 1000}s (${screen})`);
    }
    // Game mounts can start image or audio requests after the document loads.
    await page.waitForLoadState('networkidle', { timeout });
    const result = await afterLoad?.(page);
    return { errors, result };
  } catch (error) {
    errors.add(error.message.split('\n')[0]);
    return { errors };
  } finally {
    await page.close();
  }
}

function printTable(results) {
  const labelWidth = Math.max('Page'.length, ...[...results.keys()].map((name) => name.length));
  console.log(`${'Page'.padEnd(labelWidth)}  ${sizes.map(({ width }) => `${width}px`.padStart(7)).join('  ')}`);
  for (const [name, checks] of results) {
    const statuses = sizes.map(({ width }) => checks.get(width) ?? 'SKIP');
    console.log(`${name.padEnd(labelWidth)}  ${statuses.map((status) => status.padStart(7)).join('  ')}`);
  }
}

let browser;
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({
    args: ['--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'],
  });
  const results = new Map();
  const failures = [];
  let passed = 0;

  for (const viewport of sizes) {
    const options = { viewport, hasTouch: viewport.width === 390, serviceWorkers: 'block' };
    if (gameCheck === 'potion-lab' || gameCheck === 'star-factory') options.deviceScaleFactor = 1.333;
    const guest = await browser.newContext(options);
    const record = async (context, name, route, screen, afterLoad) => {
      const { errors, result } = await open(context, origin, route, screen, afterLoad);
      if (!results.has(name)) results.set(name, new Map());
      results.get(name).set(viewport.width, errors.size ? 'FAIL' : 'PASS');
      if (errors.size) failures.push(`${name} (${viewport.width}px)\n  ${[...errors].join('\n  ')}`);
      else passed++;
      return result;
    };

    if (!gameCheck) await record(guest, 'Home', '/', 'main h1');
    const ids = gameCheck ? [gameCheck] : await record(guest, 'Play', '/play.html', cartridges, async (page) => {
      // Read the rendered catalog so new ready games (including missing modules) get tested.
      const cards = await page.locator(cartridges).all();
      return Promise.all(cards.map((card) => card.getAttribute('data-id')));
    });
    await guest.close();
    if (!ids?.length) continue;

    const pro = await browser.newContext({
      ...options,
      storageState: { cookies: [], origins: [{ origin, localStorage: [
        { name: 'edgames-session', value: 'smoke-test' },
        { name: 'edgames-user', value: JSON.stringify({ plan: 'pro' }) },
      ] }] },
    });
    for (const id of ids) {
      await record(pro, id, `/game.html?id=${encodeURIComponent(id)}`, firstScreen,
        checks[gameCheck]);
    }
    await pro.close();
  }

  printTable(results);
  if (failures.length) console.error(`\n${failures.join('\n\n')}`);
  const skipped = results.size * sizes.length - passed - failures.length;
  console.log(`\n${passed} passed, ${failures.length} failed, ${skipped} skipped`);
  if (failures.length || skipped) process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  try {
    await browser?.close();
  } finally {
    server.close();
  }
}
