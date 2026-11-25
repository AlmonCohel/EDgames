import assert from 'node:assert/strict';

/* Sentence Train places its word cards through EDKit.drag (assets/kit.js),
   shared by several games. That helper tracked one gesture per card with no
   pointer id, so a second finger landing on a card already mid-drag silently
   took over its state and orphaned the floating ghost copy it had lifted. */
export async function checkSentenceTrain(page) {
  const viewport = page.viewportSize();
  const url = new URL(page.url());
  const failures = [];
  page.setDefaultTimeout(4000);

  async function check(name, run) {
    try {
      url.searchParams.set('set', 'short');
      await page.goto(url.href, { waitUntil: 'load' });
      await page.locator('.st-card').first().waitFor();
      await run();
      console.log(`PASS ${viewport.width}px ${name}`);
    } catch (error) {
      const message = `${name}: ${error.message.split('\n')[0]}`;
      failures.push(message);
      console.error(`FAIL ${viewport.width}px ${message}`);
    }
  }

  // The usual way to play: tap each card into the next empty car, in order.
  await check('tapping cards in order fills the train', async () => {
    const before = await page.locator('.st-car.in').count();
    const cards = await page.locator('.st-card').all();
    let placed = false;
    for (const card of cards) {
      await card.click();
      if (await page.locator('.st-car.in').count() > before) { placed = true; break; }
    }
    assert.ok(placed, 'one tap should place its word on the train');
  });

  // Dragging a card onto the train places it the same way a tap does.
  await check('dragging a card onto the train places it', async () => {
    const before = await page.locator('.st-car.in').count();
    const train = await page.locator('.st-train').boundingBox();
    const cards = await page.locator('.st-card:not(.used)').all();
    let placed = false;
    for (const card of cards) {
      const box = await card.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(train.x + train.width / 2, train.y + train.height / 2, { steps: 10 });
      await page.mouse.up();
      if (await page.locator('.st-car.in').count() > before) { placed = true; break; }
      await page.mouse.up().catch(() => {});
    }
    assert.ok(placed, 'one drag onto the train should place its word');
  });

  await check('a second finger on a lifted card leaves no ghost behind', async () => {
    const result = await page.evaluate(() => {
      const el = document.querySelector('.st-card');
      const r = el.getBoundingClientRect();
      const fire = (type, init) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, ...init }));
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      fire('pointerdown', { pointerId: 1, clientX: cx, clientY: cy });
      // Move far enough (>= 9px) to count as a drag and lift the ghost copy.
      fire('pointermove', { pointerId: 1, clientX: cx + 60, clientY: cy + 30 });
      const ghostsAfterLift = document.querySelectorAll('.kit-ghost').length;

      // A second finger lands on the same card while the first is still down.
      fire('pointerdown', { pointerId: 2, clientX: cx, clientY: cy });
      // The first finger — the one actually dragging — lifts off.
      fire('pointerup', { pointerId: 1, clientX: cx + 60, clientY: cy + 30 });
      const ghostsAfterFirstUp = document.querySelectorAll('.kit-ghost').length;
      // The second finger lifts off too.
      fire('pointerup', { pointerId: 2, clientX: cx, clientY: cy });
      const ghostsAfterBothUp = document.querySelectorAll('.kit-ghost').length;
      const stillLifted = el.classList.contains('kit-lifted');

      return { ghostsAfterLift, ghostsAfterFirstUp, ghostsAfterBothUp, stillLifted };
    });
    assert.equal(result.ghostsAfterLift, 1, 'dragging far enough should lift one ghost');
    assert.equal(result.ghostsAfterFirstUp, 0, 'the dragging finger lifting off should remove its ghost');
    assert.equal(result.ghostsAfterBothUp, 0, 'no ghost should remain once both fingers are up');
    assert.equal(result.stillLifted, false, 'the card should not stay marked as lifted');
  });

  if (failures.length) throw new Error(failures.join(' | '));
}
