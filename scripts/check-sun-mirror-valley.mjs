import assert from 'node:assert/strict';

export async function checkSunMirrorValley(page) {
  const viewport = page.viewportSize();
  const stage = page.locator('#smv-stage');
  const dots = stage.locator('.kit-dot');
  const done = stage.locator('.kit-dot.done');
  const solved = page.locator('#smv-stage.is-solved');
  const replay = stage.locator('#smv-end [data-again]');
  const fixedPoint = viewport.width === 390 ? { x: 324, y: 633 } : null;
  const tap = viewport.width === 390
    ? (x, y) => page.touchscreen.tap(x, y)
    : (x, y) => page.mouse.click(x, y);
  const url = new URL(page.url());
  url.searchParams.set('lang', 'en');

  for (const [index, set] of ['mirror', 'crystal', 'two', 'valley'].entries()) {
    url.searchParams.set('set', set);
    await page.goto(url.href, { waitUntil: 'domcontentloaded' });
    await stage.waitFor({ timeout: 8000 });
    assert.equal(await page.locator('#set-chips .chip').nth(index).getAttribute('aria-pressed'), 'true');
    assert.equal(await dots.count(), 4);

    const box = await stage.boundingBox();
    // On the upright phone use the exact off-center point from the QA failure.
    const { x, y } = fixedPoint ?? {
      x: Math.round(box.x + box.width * 0.83),
      y: Math.round(box.y + box.height * 0.78),
    };
    if (viewport.width === 390) {
      await stage.locator('#smv-portrait-tower').waitFor({ timeout: 8000 });
    }

    for (let round = 1; round <= 4; round++) {
      await solved.waitFor({ state: 'hidden', timeout: 5000 });
      // 46 taps cover a full turn at 8° per tap. The finale uses two pieces.
      const limit = set === 'valley' && round === 4 ? 92 : 46;
      for (let taps = 0; taps < limit && await done.count() < round; taps++) {
        await tap(x, y);
      }
      assert.equal(await done.count(), round, `${set} round ${round} stalled after ${limit} taps at (${x}, ${y})`);
    }
    await replay.waitFor({ timeout: 5000 });
  }

  assert.equal((await replay.innerText()).trim(), 'Play again');
  await replay.click();
  await replay.waitFor({ state: 'hidden', timeout: 5000 });
  assert.equal(await dots.count(), 4);
  assert.equal(await done.count(), 0);
  assert.equal(await page.locator('#set-chips .chip').first().getAttribute('aria-pressed'), 'true');
}
