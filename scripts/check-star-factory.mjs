import assert from 'node:assert/strict';

export async function checkStarFactory(page) {
  const url = new URL(page.url());
  const viewport = page.viewportSize();
  const canvas = page.locator('.sf-canvas');
  const equation = page.locator('[data-eq]');
  const stars = page.locator('[data-stars-pill]');
  const reset = page.locator('[data-reset-blocks]');
  const cut = page.locator('[data-overhang-cut]');
  const dots = page.locator('.kit-dot.done');
  const block = (value) => page.locator('.sf-chip-block').filter({ hasText: new RegExp(`^\\s*${value}\\s*$`) }).first();
  const cdp = viewport.width === 390 ? await page.context().newCDPSession(page) : null;
  const touch = (type, points = []) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points });
  const failures = [];
  let visit = 0;
  page.setDefaultTimeout(8000);

  async function expectText(locator, pattern) {
    await locator.filter({ hasText: pattern }).waitFor({ timeout: 6500 });
  }

  async function check(name, run, set = 'fuse') {
    try {
      await page.setViewportSize(viewport);
      url.searchParams.set('set', set);
      url.searchParams.set('test', String(++visit));
      await page.goto(url.href, { waitUntil: 'domcontentloaded' });
      await canvas.waitFor();
      // Let blocks finish settling into their known coordinates.
      await page.waitForTimeout(400);
      await run();
      console.log(`PASS ${viewport.width}px ${name}`);
    } catch (error) {
      const message = `${name}: ${error.message.split('\n\n').slice(0, 2).join(' ')}`;
      failures.push(message);
      console.error(`FAIL ${viewport.width}px ${message}`);
      await page.mouse.up();
      if (cdp) await touch('touchCancel').catch(() => {});
    }
  }

  async function point(x, y, id = 0) {
    await canvas.scrollIntoViewIfNeeded();
    const bounds = await canvas.boundingBox();
    return { x: bounds.x + bounds.width * x / 740, y: bounds.y + bounds.height * y / 420, id };
  }

  async function tap(x, y) {
    const pt = await point(x, y);
    if (cdp) await page.touchscreen.tap(pt.x, pt.y);
    else await page.mouse.click(pt.x, pt.y);
  }

  async function drag(x1, y1, x2, y2) {
    const [from, to] = [await point(x1, y1), await point(x2, y2)];
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y);
    await page.mouse.up();
  }

  await check('releasing a drag after Reset Blocks does not place an old block', async () => {
    const pt = await point(317, 345);
    await page.mouse.move(pt.x, pt.y);
    await page.mouse.down();
    await reset.press('Enter');
    await page.mouse.up();
    assert.equal(await equation.textContent(), '? = 3');
    assert.equal(await block(1).count(), 1);
  });

  await check('quick-tray input during a drag cannot place the same block twice', async () => {
    const pt = await point(317, 345);
    await page.mouse.move(pt.x, pt.y);
    await page.mouse.down();
    await block(1).press('Enter');
    await page.mouse.up();
    assert.equal(await equation.textContent(), '1 + ? = 3');
    await block(2).press('Enter');
    assert.equal(await equation.textContent(), '1 + 2 = 3 ✓');
  });

  await check('returning a placed block updates the overhang cut', async () => {
    await block(2).press('Enter');
    await block(3).press('Enter');
    await block(5).press('Enter');
    assert.equal(await equation.textContent(), '5 − 3 = 2');
    await tap(254, 192);
    assert.equal(await equation.textContent(), '5 − 1 = 4');
    await cut.press('Enter');
    assert.equal(await equation.textContent(), '3 + 4 = 7 ✓');
  }, 'ten');

  await check('returning a placed block clears an overhang that now fits', async () => {
    await block(4).press('Enter');
    await block(5).press('Enter');
    assert.equal(await equation.textContent(), '5 − 2 = 3');
    await tap(254, 192);
    assert.equal(await equation.textContent(), '? = 7');
    assert.ok(await cut.isHidden());
    assert.equal(await block(5).count(), 1);
  }, 'ten');

  await check('a drop inside the second bridge goes to that bridge', async () => {
    await page.locator('[data-slice-id]').first().press('Enter');
    await page.waitForTimeout(400);
    await drag(289, 346, 360, 193);
    assert.equal(await equation.textContent(), '? = 3   |   3 + ? = 4');
  }, 'master');

  await check('a diagonal swipe outside the seam height leaves the block whole', async () => {
    await drag(250, 265, 420, 418);
    assert.equal(await block(2).count(), 1);
  });

  await check('a diagonal swipe crossing the seam near its endpoint cuts it', async () => {
    await drag(260, 417, 414, 368);
    assert.equal(await block(2).count(), 0);
    assert.equal(await page.locator('.sf-chip-block').count(), 3);
  });

  await check('fractional pixel density keeps the canvas sized and resize keeps taps aligned', async () => {
    const width = cdp ? 768 : 390;
    await page.setViewportSize({ width, height: viewport.height });
    assert.equal(Number(await canvas.getAttribute('width')), 986);
    assert.equal(Number(await canvas.getAttribute('height')), 560);
    await tap(317, 345);
    assert.equal(await equation.textContent(), '1 + ? = 3');
  });

  await check('a crowded workbench keeps all blocks within its two rows', async () => {
    for (const [round, values] of [[4, 3], [5, 3], [6, 3]].entries()) {
      for (const value of values) await block(value).press('Enter');
      await dots.nth(round).waitFor();
    }
    await page.waitForTimeout(400);
    await drag(260, 313, 480, 313);
    await page.waitForTimeout(400);
    await drag(275, 313, 490, 313);
    await expectText(block(10), /10/);
    assert.equal(await page.locator('.sf-chip-block').count(), 2);
    await page.waitForTimeout(400);
    await tap(530, 371);
    await expectText(block(9), /9/);
    await page.waitForTimeout(400);
    await tap(536, 316);
    assert.equal(await equation.textContent(), '10 = 10 ✓');
  }, 'ten');

  if (cdp) {
    await check('canceling a touch does not place a block', async () => {
      await touch('touchStart', [await point(317, 345)]);
      await touch('touchCancel');
      assert.equal(await equation.textContent(), '? = 3');
      await tap(317, 345);
      assert.equal(await equation.textContent(), '1 + ? = 3');
    });

    await check('canceling a touch on a seam does not cut the block', async () => {
      await touch('touchStart', [await point(401, 322)]);
      await touch('touchCancel');
      assert.equal(await block(2).count(), 1);
      await tap(401, 322);
      assert.equal(await page.locator('.sf-chip-block').count(), 3);
    });

    await check('a second finger cannot replace the first finger’s block', async () => {
      const first = await point(317, 345, 1);
      const second = await point(401, 350, 2);
      await touch('touchStart', [first]);
      await touch('touchStart', [first, second]);
      await touch('touchEnd');
      assert.equal(await equation.textContent(), '1 + ? = 3');
    });
  }

  await check('five rounds award fifteen stars and Again starts the next set at zero', async () => {
    const moves = [[1, 2], [2, 2], [2, 3], [4, 2], [2, 2, 2]];
    for (const [round, values] of moves.entries()) {
      for (const value of values) await block(value).press('Enter');
      await expectText(stars, new RegExp(` ${(round + 1) * 3}$`));
      if (round < moves.length - 1) await dots.nth(round).waitFor({ timeout: 6500 });
    }
    await page.locator('[data-again]').click();
    assert.equal(await equation.textContent(), '? = 7');
    assert.equal(await stars.textContent(), '⭐ 0');
    assert.equal(await dots.count(), 0);
  });

  if (failures.length) throw new Error(failures.join(' | '));
}
