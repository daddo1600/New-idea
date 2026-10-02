/* global __dirname */
/**
 * Captures the raw App Store screens from the web preview in demo mode, as a
 * UK courier (`?demo=courier&region=GB`), into raw/ at 390x844 @3x (1170x2532).
 * make_screenshots.py then frames them.
 *
 * 1. Start the preview: CI=1 npx expo start --web --port 8091
 * 2. node assets/store/capture.js            (from milemint/)
 *    PLAYWRIGHT=/path/to/playwright  BASE=http://localhost:8091  to override.
 *
 * Each run starts with fresh browser profiles, so the demo seeds itself again
 * (about half a minute). Times are "now": the demo dates everything from today.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');

const BASE = process.env.BASE || 'http://localhost:8091';
const RAW = path.join(__dirname, 'raw');
const COURIER = 'demo=courier&region=GB';

/** The preview's SQLite runs in a worker that needs cross-origin isolation. */
async function isolate(page) {
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
}

async function browser(scheme) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'store-shots-'));
  const context = await chromium.launchPersistentContext(profile, {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    colorScheme: scheme,
  });
  const page = context.pages()[0] ?? (await context.newPage());
  await isolate(page);
  page.on('pageerror', (error) => console.error('page error:', error.message));
  return { context, page };
}

/** Opens a screen and waits for the app (and, the first time, the demo seed). */
async function open(page, route, query, ready = 'text=Settings') {
  await page.goto(`${BASE}${route}${route.includes('?') ? '&' : '?'}${query}`, { waitUntil: 'networkidle', timeout: 300_000 });
  if (ready) await page.waitForSelector(ready, { timeout: 300_000 });
  await page.waitForTimeout(3500);
}

/** Scrolls the screen's scroll view (React Native web) so `text` sits `offset` px below the header. */
async function scrollTo(page, text, offset = 16) {
  await page.evaluate(
    ({ text, offset }) => {
      const target = [...document.querySelectorAll('div')].find((el) => el.textContent === text && el.children.length === 0)
        ?? [...document.querySelectorAll('div')].find((el) => el.textContent?.trim() === text);
      let scroller = target?.parentElement;
      while (scroller && !(scroller.scrollHeight > scroller.clientHeight && getComputedStyle(scroller).overflowY !== 'visible')) {
        scroller = scroller.parentElement;
      }
      if (!target || !scroller) throw new Error(`can't scroll to ${text}`);
      scroller.scrollTop += target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - offset;
    },
    { text, offset },
  );
  await page.waitForTimeout(800);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(RAW, `${name}.png`) });
  console.log('captured', name);
}

async function courier() {
  const { context, page } = await browser('light');
  try {
    // 1 Home: the shift started from the first drive of the afternoon, the running total under it.
    await open(page, '/', COURIER);
    await page.getByText(/^Start from/).first().click();
    await page.waitForTimeout(2500);
    await shot(page, 'home');

    // 2 Drives: one row per shift, logged by themselves.
    await open(page, '/drives', COURIER);
    await shot(page, 'drives');

    // 3 A drive from yesterday's shift: route map, Work or Personal.
    await page.getByText('Show drives ▾').nth(1).click();
    await page.waitForTimeout(1500);
    await page.getByText('Hyde Park → The Headrow, City Centre').first().click();
    await page.waitForTimeout(3000);
    await shot(page, 'trip');

    // 5 Exports (Pro).
    await open(page, '/report', COURIER, 'text=Export your mileage');
    await scrollTo(page, 'Export your mileage', 12);
    await shot(page, 'export');
  } finally {
    await context.close();
  }
}

async function money() {
  // 4 Money, in dark mode: quarterly figures for MTD and the tax set-aside.
  const { context, page } = await browser('dark');
  try {
    await open(page, '/money', COURIER);
    await scrollTo(page, 'Quarterly figures', 12);
    await shot(page, 'money');
  } finally {
    await context.close();
  }
}

async function plain() {
  const { context, page } = await browser('light');
  try {
    // 6 Privacy: the tracking set-up, as on first launch.
    await open(page, '/setup-tracking', 'demo=setup&region=GB', 'text=Private');
    await shot(page, 'privacy');

    // 7 Free vs Pro, with UK prices.
    await open(page, '/pro', 'demo=free&region=GB', 'text=What’s included');
    await scrollTo(page, 'What’s included', 12);
    await shot(page, 'compare');
  } finally {
    await context.close();
  }
}

(async () => {
  fs.mkdirSync(RAW, { recursive: true });
  const only = process.argv.slice(2);
  for (const [name, run] of Object.entries({ courier, money, plain })) {
    if (only.length === 0 || only.includes(name)) await run();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
