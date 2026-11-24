import assert from 'node:assert/strict';

async function woodlandChecks(page, run) {
  const url = new URL(page.url());
  const viewport = page.viewportSize();
  const touch = viewport.width === 390;
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  const sendTouch = (type, touchPoints = []) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
  const failures = [];
  let visit = 0;
  page.setDefaultTimeout(2500);

  async function check(name, set, steps, size = viewport) {
    try {
      await page.setViewportSize(size);
      url.searchParams.set('lang', 'en');
      url.searchParams.set('set', set);
      url.searchParams.set('test', String(++visit));
      await page.goto(url.href, { waitUntil: 'load' });
      await steps();
      console.log(`PASS ${viewport.width}px ${name}`);
    } catch (error) {
      const message = `${name}: ${error.message.split('\n')[0]}`;
      failures.push(message);
      console.error(`FAIL ${viewport.width}px ${message}`);
    } finally {
      if (touch) await sendTouch('touchCancel').catch(() => {});
      else await page.mouse.up();
    }
  }

  async function center(locator, id = 0) {
    const bounds = await locator.boundingBox();
    assert.ok(bounds, 'input target is visible');
    return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2, id };
  }

  await run({ check, center, touch, sendTouch });
  if (failures.length) throw new Error(failures.join(' | '));
}

export function checkStreamCrossing(page) {
  return woodlandChecks(page, async ({ check, center, touch, sendTouch }) => {
    const note = page.locator('#sc-ask');
    const dots = page.locator('#sc-dots .done');
    const stones = page.locator('.sc-hit');
    const prompt = (num) => note.filter({ hasText: `Find the stone with ${num} dot` });
    const stone = (num) => page.getByRole('button', { name: `${num} stone`, exact: true });

    if (touch) {
      await check('a canceled touch does not place a stone', 'count', async () => {
        await page.locator('#sc-info-btn').click();
        const correct = await center(stone(1));
        await sendTouch('touchStart', [correct]);
        await sendTouch('touchCancel');
        await page.waitForTimeout(950);
        assert.ok(await prompt('one').isVisible());
        await stone(1).tap();
        await prompt('two').waitFor();
      });

      await check('a second finger cannot take over or finish a stone drag', 'count', async () => {
        await page.locator('#sc-info-btn').click();
        const correct = await center(stone(1), 0);
        const wrong = await center(stones.and(page.locator(':not([aria-label="1 stone"])')).first(), 1);
        await sendTouch('touchStart', [correct]);
        await sendTouch('touchStart', [correct, wrong]);
        await sendTouch('touchEnd');
        await prompt('two').waitFor();
      });
    } else {
      await check('a secondary mouse click does not place a stone', 'count', async () => {
        await page.locator('#sc-info-btn').click();
        await stone(1).click({ button: 'right' });
        await page.waitForTimeout(950);
        assert.ok(await prompt('one').isVisible());
      });

      await check('releasing an old press after keyboard input leaves the next stone alone', 'count', async () => {
        await page.locator('#sc-info-btn').click();
        const oldStone = await center(stone(1));
        const staleAudio = [];
        const collect = (request) => {
          if (/\/sc-oops\.mp3$/.test(new URL(request.url()).pathname)) staleAudio.push(request.url());
        };
        page.on('request', collect);
        try {
          await page.mouse.move(oldStone.x, oldStone.y);
          await page.mouse.down();
          await stone(1).press('Enter');
          await prompt('two').waitFor();
          await page.mouse.up();
          await page.waitForTimeout(950);
          assert.equal(staleAudio.length, 0, 'the old press did not trigger wrong-answer feedback');
          assert.ok(await prompt('two').isVisible(), 'the next prompt is still waiting');
        } finally {
          page.off('request', collect);
        }
      });

      await check('the bear lands on the same stone when resized during a hop', 'count', async () => {
        const landingSize = { width: 980, height: 800 };
        const launchSize = { width: 1800, height: 740 };
        const now = new Date();
        await page.clock.install({ time: now });
        await page.clock.pauseAt(new Date(now.getTime() + 1000));
        try {
          await page.setViewportSize(landingSize);
          await page.reload({ waitUntil: 'load' });
          await page.clock.runFor(32);
          const canvas = await page.locator('.sc-canvas').boundingBox();
          const worldWidth = canvas.height * 2560 / 1429;
          // Sample the bear's upper body, above the moving water effects.
          const clip = {
            x: Math.round(canvas.x + canvas.width / 2 - worldWidth * 0.15) - 10,
            y: Math.round(canvas.y + canvas.height * 0.515) - 124,
            width: 20,
            height: 20,
          };
          const blank = await page.screenshot({ clip });
          await stone(1).press('Enter');
          await page.clock.runFor(640);
          const settled = await page.screenshot({ clip });
          assert.ok(!settled.equals(blank), 'the bear is visible above the first stone');

          await page.setViewportSize(launchSize);
          await page.locator('#game-reset').press('Enter');
          await page.clock.runFor(32);
          await stone(1).press('Enter');
          await page.clock.runFor(300);
          await page.setViewportSize(landingSize);
          await page.clock.runFor(340);
          const resized = await page.screenshot({ clip });
          assert.ok(resized.equals(settled), 'the bear landed at the resized stone coordinates');
        } finally {
          await page.clock.resume();
        }
      });
    }

    await check('the last crossing fills its progress dot, and Again starts the next step', 'count', async () => {
      await page.locator('#sc-info-btn').click();
      const words = ['one', 'two', 'three', 'four'];
      for (const [round, size] of [3, 4, 4].entries()) {
        for (let i = 0; i < size; i++) {
          await prompt(words[i]).waitFor({ timeout: 5000 });
          await stone(i + 1).press('Enter');
        }
        if (round < 2) {
          await prompt('one').waitFor({ timeout: 6000 });
          assert.equal(await dots.count(), round + 1);
        }
      }
      await page.locator('#sc-end [data-again]').waitFor({ timeout: 6000 });
      const completed = await dots.count();
      await page.locator('#sc-end [data-again]').click();
      await page.getByRole('button', { name: /^(circle|square|triangle|star) stone$/ }).first().waitFor();
      assert.equal(await dots.count(), 0);
      assert.equal(completed, 3);
    });
  });
}

export function checkWhisperingWoods(page) {
  return woodlandChecks(page, async ({ check, center, touch, sendTouch }) => {
    const animals = page.locator('.ww-hit');
    const found = page.locator('.ww-slot.found');
    const dots = page.locator('#ww-dots .done');

    if (touch) {
      await check('a lantern sweep and a canceled touch do not collect animals', 'tree', async () => {
        const animal = await center(animals.first());
        await sendTouch('touchStart', [animal]);
        await sendTouch('touchMove', [{ ...animal, y: animal.y + 100 }]);
        await sendTouch('touchEnd');
        assert.equal(await found.count(), 0, 'a sweep should leave the count at zero');
        await sendTouch('touchStart', [animal]);
        await sendTouch('touchCancel');
        assert.equal(await found.count(), 0, 'a canceled touch should leave the count at zero');
        await page.touchscreen.tap(animal.x, animal.y);
        assert.equal(await found.count(), 1, 'one tap found one animal');
      });

      await check('a narrow portrait round still has all five ground animals', 'woods', async () => {
        for (let i = 0; i < 5; i++) await animals.nth(i).press('Enter');
        await page.locator('.ww-hit[aria-label="hedgehog 1"]').waitFor({ timeout: 5000 });
        assert.equal(await animals.count(), 5);
      }, { width: 300, height: 880 });
    } else {
      await check('rotating a partly found round keeps the count and the remaining animals reachable', 'tree', async () => {
        const canvas = await page.locator('.ww-canvas').boundingBox();
        const points = await Promise.all((await animals.all()).map((animal) => center(animal)));
        const edgeIndex = points.findIndex(({ x }) => x < canvas.x + canvas.width * 0.40 || x > canvas.x + canvas.width * 0.60);
        // Find one animal, leaving any outer animal for the portrait check.
        await animals.nth(edgeIndex === 0 ? 1 : 0).press('Enter');
        await page.setViewportSize({ width: 300, height: 944 });
        await page.locator('.ww-canvas').waitFor();
        await page.waitForTimeout(150);
        assert.equal(await found.count(), 1);
        assert.equal(await page.locator('.ww-hit:visible').count(), 3);
        const resized = await page.locator('.ww-canvas').boundingBox();
        for (const animal of await animals.all()) {
          const { x } = await center(animal);
          assert.ok(x >= resized.x && x <= resized.x + resized.width, 'animal is inside the portrait stage');
        }
      });

      await check('short landscape rounds keep every animal on the stage', 'woods', async () => {
        const canvas = await page.locator('.ww-canvas').boundingBox();
        for (let attempt = 0; attempt < 6; attempt++) {
          assert.equal(await animals.count(), 5);
          for (const animal of await animals.all()) {
            const { y } = await center(animal);
            assert.ok(y >= canvas.y && y <= canvas.y + canvas.height, 'animal is inside the landscape stage');
          }
          await page.locator('#game-reset').press('Enter');
        }
      }, { width: 1920, height: 430 });
    }

    await check('each animal counts once, Reset restarts the step, and Again advances it', 'tree', async () => {
      await animals.first().press('Enter');
      await animals.first().press('Enter');
      assert.equal(await found.count(), 1);
      await page.locator('#game-reset').press('Enter');
      assert.equal(await found.count(), 0);
      for (const [round, count] of [3, 3, 3, 4].entries()) {
        assert.equal(await animals.count(), count);
        for (let i = 0; i < count; i++) await animals.nth(i).press('Enter');
        assert.equal(await dots.count(), round + 1);
        if (round < 3) await found.first().waitFor({ state: 'detached', timeout: 5000 });
      }
      await page.locator('.ww-end-overlay [data-again]').click({ timeout: 5000 });
      await page.locator('.ww-hit[aria-label="bunny 4"]').waitFor();
      assert.equal(await found.count(), 0);
      assert.equal(await dots.count(), 0);
    });
  });
}
