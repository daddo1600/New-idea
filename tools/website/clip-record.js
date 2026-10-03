/* global __dirname */
/**
 * Records the real app for the website's hero clip (website/assets/video/drive-logged.*), at 2x.
 *
 * 1. Start the web preview: cd milemint && CI=1 BROWSER=none npx expo start --web --port 8083
 * 2. node tools/website/clip-record.js           (OUT=dir to record elsewhere; default ./rec next to this file)
 * 3. python3 tools/website/clip-encode.py website/assets/video
 *
 * Take A, ?demo=driving&clip&region=GB: the Home screen while a drive is being recorded.
 * Take B, ?demo=1&clip&region=GB: parked; Meanwood Rd → Home waits under "To sort" and is
 * swiped right (touch events) to Work, so the total goes up by £1.21.
 * Frames are screenshots at device pixels (390×844 CSS at 2x = 780×1688), so the clip
 * stays sharp when the hero zooms in on the phone. Each take is saved as frames plus their
 * timestamps (frames.txt, for ffmpeg's concat demuxer) and marks.json (when the swipe started).
 */
const fs = require('fs');
const path = require('path');

const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');

const BASE = process.env.BASE || 'http://localhost:8083';
const OUT = process.env.OUT || path.join(__dirname, 'rec');
const VW = 390, VH = 844, DPR = 2;

async function take(browser, query, script) {
  const dir = path.join(OUT, query.replace(/[^a-z0-9]/gi, '_'));
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR, hasTouch: true, isMobile: true });
  const page = await context.newPage();
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

  const cdp = await context.newCDPSession(page);
  const frames = [];
  // Chrome's screencast sends CSS-size frames in headless mode, so grab real screenshots (device pixels,
  // 780×1688) as fast as they come (about 20-30 a second); each is stamped with when it was taken.
  let grabbing = true;
  const grab = (async () => {
    while (grabbing) {
      const t = Date.now() / 1000;
      const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, optimizeForSpeed: true, clip: { x: 0, y: 0, width: VW, height: VH, scale: DPR } });
      const file = `f${String(frames.length).padStart(5, '0')}.jpg`;
      fs.writeFileSync(path.join(dir, file), Buffer.from(shot.data, 'base64'));
      frames.push({ file, t });
    }
  })();
  await page.waitForTimeout(300);
  const marks = {};
  const now = () => Date.now() / 1000;
  await script(page, cdp, (name) => (marks[name] = now()));
  grabbing = false;
  await grab;
  await context.close();

  const t0 = frames[0].t;
  const lines = [];
  frames.forEach((fr, i) => {
    const next = frames[i + 1] ? frames[i + 1].t : fr.t + 0.1;
    lines.push(`file '${fr.file}'`, `duration ${(next - fr.t).toFixed(4)}`);
  });
  lines.push(`file '${frames[frames.length - 1].file}'`);
  fs.writeFileSync(path.join(dir, 'frames.txt'), lines.join('\n') + '\n');
  const rel = {};
  for (const [k, v] of Object.entries(marks)) rel[k] = +(v - t0).toFixed(3);
  fs.writeFileSync(path.join(dir, 'marks.json'), JSON.stringify(rel));
  console.log(JSON.stringify({ query, frames: frames.length, seconds: +(frames[frames.length - 1].t - t0).toFixed(2), marks: rel }));
}

(async () => {
  const browser = await chromium.launch();
  await take(browser, 'demo=driving&clip&region=GB', async (page) => {
    await page.waitForTimeout(3500);
  });
  await take(browser, 'demo=1&clip&region=GB', async (page, cdp, mark) => {
    await page.waitForTimeout(2500);
    const box = await page.locator('text=Work or personal?').first().boundingBox();
    const y = box.y - 20;
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
    await page.waitForTimeout(6500);
  });
  await browser.close();
})();
