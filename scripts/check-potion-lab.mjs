import assert from 'node:assert/strict';

export async function checkPotionLab(page) {
  const url = new URL(page.url());
  const viewport = page.viewportSize();
  const touchDevice = viewport.width === 390;
  const canvas = page.locator('.pl-canvas');
  const flask = (val) => page.locator(`[data-action="flask"][data-val="${val}"]`);
  const action = (name) => page.locator(`[data-action="${name}"]`);
  const feed = action('feed');
  const badges = page.locator('.pl-badge-slot.earned');
  const dots = page.locator('.kit-dot.done');
  const press = (val) => flask(val).press('Enter');
  const cdp = touchDevice ? await page.context().newCDPSession(page) : null;
  const touch = (type, touchPoints = []) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
  const failures = [];

  async function check(name, run, set = 'pour') {
    try {
      await page.setViewportSize(viewport);
      url.searchParams.set('set', set);
      await page.goto(url.href, { waitUntil: 'domcontentloaded' });
      await canvas.waitFor();
      await run();
      console.log(`PASS ${viewport.width}px ${name}`);
    } catch (error) {
      const message = `${name}: ${error.message.split('\n')[0]}`;
      failures.push(message);
      console.error(`FAIL ${viewport.width}px ${message}`);
      if (cdp) await touch('touchCancel').catch(() => {});
    }
  }

  async function point(x, y, id = 0) {
    await canvas.scrollIntoViewIfNeeded();
    const bounds = await canvas.boundingBox();
    return { x: bounds.x + x * bounds.width / 900, y: bounds.y + y * bounds.height / 520, id };
  }

  async function tap(x, y) {
    const pt = await point(x, y);
    if (touchDevice) await page.touchscreen.tap(pt.x, pt.y);
    else await page.mouse.click(pt.x, pt.y);
  }

  await check('keyboard keeps focus on a flask after pouring', async () => {
    await press(2);
    await page.keyboard.press('Enter');
    assert.equal(await feed.count(), 1, 'The second Enter should pour from the same flask');
  });

  await check('capped pours show the amount that went in', async () => {
    async function equation(lastPour) {
      for (const amount of [1, 2, 2, 2, 2, 2, lastPour]) await press(amount);
      await page.waitForTimeout(120);
      // Keep the moving flasks and their glow out of the score comparison.
      const { x, y } = await point(250, 24);
      const end = await point(395, 50);
      return page.screenshot({ clip: { x, y, width: end.x - x, height: end.y - y } });
    }
    const actual = await equation(2);
    await page.reload({ waitUntil: 'domcontentloaded' });
    const expected = await equation(1);
    assert.ok(actual.equals(expected), 'Both pours should show 11 + 1 = 12');
  });

  await check('the whole visible scoop button removes one slice', async () => {
    await tap(138, 354);
    await tap(76, 300);
    await tap(138, 300);
    assert.equal(await action('scoop').count(), 0, 'Both taps inside the visible scoop button should count');
  }, 'slice');

  await check('the visible reset button beside the second drain resets the cauldron', async () => {
    await tap(296, 364);
    assert.equal(await feed.count(), 1, 'The second drain should reduce the volume from seven to five');
    await tap(296, 389);
    assert.equal(await feed.count(), 0);
    await tap(296, 364);
    assert.equal(await feed.count(), 1, 'Reset should restore seven so the second drain reaches five again');
  }, 'exact');

  await check('cauldron reset cancels a flask gesture', async () => {
    const start = await point(494, 106);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await action('reset-cauldron').press('Enter');
    await page.mouse.up();
    await press(2);
    assert.equal(await feed.count(), 0, 'Releasing the old gesture should add no potion');
  });

  await check('resize keeps touches or clicks aligned and rounds the canvas buffer size', async () => {
    const width = touchDevice ? 768 : 390;
    await page.setViewportSize({ width, height: viewport.height });
    assert.equal(Number(await canvas.getAttribute('width')), 1200, '900 × 1.333 should round to 1200');
    await tap(494, 106);
    await press(2);
    assert.equal(await feed.count(), 1, 'The flask should remain clickable at its resized position');
  });

  if (cdp) {
    await check('canceling a touch on a flask adds no potion', async () => {
      await touch('touchStart', [await point(494, 106)]);
      await touch('touchCancel');
      await press(2);
      assert.equal(await feed.count(), 0, 'A canceled touch should add no potion');
    });

    await check('canceling a touch on the mug leaves the recipe ready', async () => {
      await press(2);
      await press(2);
      await touch('touchStart', [await point(564, 282)]);
      await touch('touchCancel');
      await page.waitForTimeout(850);
      assert.equal(await badges.count(), 0, 'A canceled mug gesture should earn no badge');
      assert.equal(await feed.count(), 1, 'The canceled touch should leave the mug available');
      await feed.press('Enter');
      await badges.first().waitFor({ timeout: 1800 });
    });

    await check('a second finger cannot replace the flask gesture', async () => {
      const first = await point(378, 106, 1);
      const second = await point(494, 106, 2);
      await touch('touchStart', [first]);
      await touch('touchStart', [first, second]);
      await touch('touchEnd', [first]);
      await touch('touchEnd');
      await press(2);
      assert.equal(await feed.count(), 0, 'Only the first finger should pour its one unit');
      await press(1);
      assert.equal(await feed.count(), 1);
    });
  }

  await check('badges and progress agree through completion, next step and restart', async () => {
    const pours = [[2, 2], [3, 3], [2, 5], [3, 5], [5, 5]];
    for (const [round, amounts] of pours.entries()) {
      for (const amount of amounts) await press(amount);
      await feed.press('Enter');
      await badges.nth(round).waitFor({ timeout: 1800 });
      assert.equal(await dots.count(), round + 1, 'The dot should fill as soon as the badge is earned');
      if (round < pours.length - 1) {
        await page.locator('.pl-header h2').filter({ hasText: String([6, 7, 8, 10][round]) }).waitFor({ timeout: 3500 });
      }
    }
    await page.locator('.kit-end [data-again]').click();
    assert.equal(new URL(page.url()).searchParams.get('set'), 'slice');
    assert.equal(await badges.count(), 0);
    await action('fruit').first().press('Enter');
    await page.locator('#game-reset').click();
    assert.equal(await action('scoop').count(), 0);
    assert.equal(await dots.count(), 0);
    assert.equal(new URL(page.url()).searchParams.get('set'), 'slice');
  });

  await cdp?.detach();
  if (failures.length) throw new Error(failures.join('; '));
}
