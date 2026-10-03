/* global __dirname */
/**
 * Records the real app for the website's hero clip (website/assets/video/drive-logged.*).
 *
 * 1. Start the web preview: cd milemint && CI=1 BROWSER=none npx expo start --web --port 8083
 * 2. node tools/website/clip-record.js           (OUT=dir to record elsewhere; default ./rec next to this file)
 * 3. python3 tools/website/clip-encode.py website/assets/video
 *
 * Take A, ?demo=driving&clip&region=GB: the Home screen while a drive is being recorded.
 * Take B, ?demo=1&clip&region=GB: parked; Meanwood Rd → Home waits under "To sort" and is
 * swiped right (touch events) to Work, so the total goes up by £1.21.
 * Playwright records CSS pixels (390×844) into the top left of the frame; the encoder crops it.
 * The printed marks are wall-clock seconds; the video runs about 3 s later (page start-up), so
 * check the cut points in clip-encode.py against frames before encoding.
 */
const fs = require('fs');
const path = require('path');

const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');

const BASE = process.env.BASE || 'http://localhost:8083';
const OUT = process.env.OUT || path.join(__dirname, 'rec');
const VW = 390, VH = 844;

async function take(browser, query, script) {
  const dir = path.join(OUT, query.replace(/[^a-z0-9]/gi, '_'));
  fs.rmSync(dir, { recursive: true, force: true });
  const context = await browser.newContext({
    viewport: { width: VW, height: VH }, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
    recordVideo: { dir, size: { width: VW * 2, height: VH * 2 } },
  });
  const page = await context.newPage();
  const t0 = Date.now();
  // The preview's SQLite runs in a worker that needs cross-origin isolation.
  await page.route(`${BASE}/**`, async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'cross-origin-embedder-policy': 'require-corp',
        'cross-origin-opener-policy': 'same-origin',
        'cross-origin-resource-policy': 'same-origin',
      },
    });
  });
  page.on('pageerror', (error) => console.error('page error:', error.message));
  await page.goto(`${BASE}/?${query}`, { waitUntil: 'networkidle', timeout: 300_000 });
  await page.waitForSelector('text=Settings', { timeout: 300_000 });
  await page.waitForTimeout(4000);
  const marks = { start: (Date.now() - t0) / 1000 };
  await script(page, (name) => (marks[name] = (Date.now() - t0) / 1000));
  marks.end = (Date.now() - t0) / 1000;
  await context.close();
  const file = fs.readdirSync(dir).find((f) => f.endsWith('.webm'));
  console.log(JSON.stringify({ query, file: path.join(dir, file), marks }));
}

(async () => {
  const browser = await chromium.launch();
  await take(browser, 'demo=driving&clip&region=GB', async (page) => {
    await page.waitForTimeout(3000);
  });
  await take(browser, 'demo=1&clip&region=GB', async (page, mark) => {
    await page.waitForTimeout(3300);
    const box = await page.locator('text=Work or personal?').first().boundingBox();
    const y = box.y - 20;
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, x, ty) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x, y: ty, id: 1, radiusX: 8, radiusY: 8, force: 1 }],
      });
    mark('swipe');
    await touch('touchStart', 50, y);
    for (let i = 1; i <= 28; i++) {
      const k = i / 28;
      await touch('touchMove', 50 + 260 * (1 - Math.pow(1 - k, 2)), y + 2 * Math.sin(k * 3)); // eases out, a slight wobble
      await page.waitForTimeout(22);
    }
    await page.waitForTimeout(80);
    await touch('touchEnd', 0, 0);
    mark('release');
    await page.waitForTimeout(6000);
  });
  await browser.close();
})();
