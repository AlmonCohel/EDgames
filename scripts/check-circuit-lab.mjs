import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const wire = '#hit-wire-pos';
const looseWire = `${wire}.cl-hit--pulse`;

export async function checkCircuitLab(page) {
  page.setDefaultTimeout(8000);
  const viewport = page.viewportSize();
  const url = page.url();
  const press = (selector) => page.locator(selector).press('Enter');
  const voltage = (v) => `.cl-volt-btn[data-volt="${v}"]`;
  const stable = () => press('#cl-lock-cta.ready');
  const secondSpark = async () => {
    await press('#hit-sw1');
    await stable();
    await page.locator(looseWire).waitFor();
  };
  const center = async (selector) => {
    const locator = page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    const { x, y, width, height } = await locator.boundingBox();
    return { x: Math.round(x + width / 2), y: Math.round(y + height / 2) };
  };

  const failures = [];
  async function check(name, run) {
    try {
      await page.setViewportSize(viewport);
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.locator('#cl-canvas').waitFor();
      await run();
      console.log(`PASS ${viewport.width}px ${name}`);
    } catch (error) {
      const message = `${name}: ${error.message.split('\n')[0]}`;
      failures.push(message);
      console.error(`FAIL ${viewport.width}px ${message}`);
    }
  }

  await check('progress dots, final score, next step and restart', async () => {
    const dots = page.locator('.kit-dot.done');
    await secondSpark();
    assert.equal(await dots.count(), 1, 'Round two should keep the first completed dot');
    await press(wire);
    await press('#hit-sw1');
    await stable();
    await page.locator('#hit-wire-neg.cl-hit--pulse').waitFor();
    assert.equal(await dots.count(), 2);
    await press('#hit-wire-neg');
    await press('#hit-sw1');
    await press(voltage(9));
    await stable();
    await page.locator(looseWire).waitFor();
    assert.equal(await dots.count(), 3);
    await press(wire);
    await press(voltage(3));
    await stable();
    await page.locator('#hit-wire-neg.cl-hit--pulse').waitFor();
    assert.equal(await dots.count(), 4);
    await press(wire);
    await press('#hit-wire-neg');
    await press('#hit-sw1');
    await press(voltage(6));
    await stable();
    assert.equal(await dots.count(), 5);
    await page.locator('.kit-end [data-again]').click();
    assert.equal(new URL(page.url()).searchParams.get('set'), 'motor');
    assert.equal(await dots.count(), 0);
    await press(voltage(9));
    await press('#game-reset');
    assert.equal(await page.locator(voltage(3)).getAttribute('aria-pressed'), 'true');
    assert.equal(new URL(page.url()).searchParams.get('set'), 'motor');
  });

  await check('mouse cable drop, connection and tap', async () => {
    await secondSpark();
    const { x, y } = await center(wire);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 90, y + 100, { steps: 4 });
    await page.mouse.up();
    assert.equal(await page.locator(looseWire).count(), 1, 'An off-post drop connected the cable');

    await press('#cl-reset');
    const start = await center(wire);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 24, start.y - (viewport.width === 390 ? 34 : 52), { steps: 4 });
    await page.mouse.up();
    assert.equal(await page.locator(looseWire).count(), 0, 'A drag to the post should connect');
    await press('#cl-reset');
    await page.locator(wire).click();
    assert.equal(await page.locator(looseWire).count(), 0, 'A tap should connect');
  });

  if (viewport.width === 390) {
    await check('touch cancellation releases the cable', async () => {
      await secondSpark();
      const cdp = await page.context().newCDPSession(page);
      const touch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
      const start = await center(wire);
      await touch('touchStart', [start]);
      await touch('touchMove', [{ x: start.x + 74, y: start.y + 95 }]);
      await touch('touchCancel', []);
      await page.touchscreen.tap(start.x, start.y - 34);
      assert.equal(await page.locator(looseWire).count(), 1, 'A new finger completed the canceled drag');
      await page.locator(wire).tap();
      assert.equal(await page.locator(looseWire).count(), 0, 'A fresh touch should connect');
      await cdp.detach();
    });
  }

  await check('resizing realigns a loose wire and the canvas', async () => {
    await secondSpark();
    const width = viewport.width === 390 ? 1280 : 390;
    await page.setViewportSize({ width, height: viewport.height });
    await delay(120);
    const canvas = page.locator('#cl-canvas');
    const bounds = await canvas.boundingBox();
    const expectedX = bounds.width < 560
      ? 10 + Math.round(bounds.width * 0.46) + 8 + 4
      : 14 + Math.min(242, bounds.width * 0.27) + 16 - 4;
    const hit = await page.locator(wire).boundingBox();
    assert.ok(Math.abs(hit.x + hit.width / 2 - bounds.x - expectedX) < 2, 'Loose cable kept its old coordinates');
    assert.equal(Number(await canvas.getAttribute('width')), Math.round(bounds.width), 'Canvas should use the visible inner width');
  });

  await check('a dial gesture cannot change a completed round', async () => {
    const { x, y } = await center(voltage(6));
    const dialY = y - (viewport.width === 390 ? 36 : 58);
    await page.mouse.move(x, dialY);
    await page.mouse.down();
    await page.mouse.move(x + 1, dialY);
    await press('#hit-sw1');
    await stable();
    await page.mouse.move(x + 30, dialY);
    await page.mouse.up();
    assert.equal(await page.locator(voltage(6)).getAttribute('aria-pressed'), 'true',
      'The old drag changed the completed circuit voltage');
  });

  await check('bench reset cancels an in-flight dial gesture', async () => {
    const { x, y } = await center(voltage(6));
    const dialY = y - (viewport.width === 390 ? 36 : 58);
    await page.mouse.move(x, dialY);
    await page.mouse.down();
    assert.equal(await page.locator(voltage(9)).getAttribute('aria-pressed'), 'true');
    await press('#cl-reset');
    await page.mouse.move(x + 30, dialY);
    await page.mouse.up();
    assert.equal(await page.locator(voltage(6)).getAttribute('aria-pressed'), 'true',
      'The old drag changed the restored voltage');
  });

  await check('switch effects play and obey quiet mode', async () => {
    const cdp = await page.context().newCDPSession(page);
    let oscillators = 0;
    cdp.on('WebAudio.audioNodeCreated', ({ node }) => {
      if (node.nodeType === 'Oscillator') oscillators++;
    });
    await cdp.send('WebAudio.enable');
    await press('#hit-sw1');
    await delay(120);
    assert.equal(oscillators, 3, 'A live switch should play its three notes');
    await press('#hit-sw1');
    const toggle = page.locator('#sound-toggle');
    for (let i = 0; i < 3 && await toggle.getAttribute('data-state') !== 'off'; i++) {
      await toggle.press('Enter');
    }
    assert.equal(await toggle.getAttribute('data-state'), 'off');
    await delay(120);
    const before = oscillators;
    await press('#hit-sw1');
    await delay(120);
    assert.equal(oscillators, before, 'Quiet mode should suppress circuit notes');
    await cdp.detach();
  });

  if (failures.length) throw new Error(failures.join('; '));
}
