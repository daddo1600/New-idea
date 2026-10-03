#!/usr/bin/env node
/* Layout shift on a repeat desktop visit (no intro, the season greeting and hat added by site.js).
   Loads the home page twice in one browser session per time zone, then reads the second load's
   cumulative layout shift (CLS). Exits 1 if any is above 0.
   Usage: serve website/ (python3 -m http.server 8765 -d website), then
     node tools/website/cls-check.js [base URL] [--shot path.png]
   Needs Playwright (PLAYWRIGHT=/path/to/playwright, default /opt/node22/lib/node_modules/playwright). */
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');

const args = process.argv.slice(2);
const shotAt = args.indexOf('--shot');
const shot = shotAt >= 0 ? args.splice(shotAt, 2)[1] : null;
const BASE = args[0] || 'http://127.0.0.1:8765/index.html';
const ZONES = [['London', 'Europe/London', 'en-GB'], ['New York', 'America/New_York', 'en-US'], ['Toronto', 'America/Toronto', 'en-CA']];

(async () => {
  const browser = await chromium.launch();
  let worst = 0;
  for (const [name, tz, locale] of ZONES) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, timezoneId: tz, locale });
    await ctx.addInitScript(() => {
      window.__cls = 0; window.__shifts = [];
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (e.hadRecentInput) continue;
            window.__cls += e.value;
            window.__shifts.push({ at: Math.round(e.startTime), value: +e.value.toFixed(4) });
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (err) { /* no layout-shift entries in this browser */ }
    });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'load' }); // first visit: the intro plays and marks itself seen
    await page.waitForTimeout(4500);
    await page.goto(BASE, { waitUntil: 'load' }); // the repeat visit: no intro
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => ({
      cls: window.__cls, shifts: window.__shifts,
      intro: !!document.querySelector('.sprout-intro'),
      greeting: (document.querySelector('.hero .season-greeting') || {}).textContent || null,
    }));
    worst = Math.max(worst, r.cls);
    console.log(`${name.padEnd(9)} CLS ${r.cls.toFixed(4)}  greeting: ${r.greeting || 'none'}  intro on repeat: ${r.intro}${r.shifts.length ? '  shifts: ' + JSON.stringify(r.shifts) : ''}`);
    if (shot && name === 'London') await page.screenshot({ path: shot });
    await ctx.close();
  }
  await browser.close();
  console.log(worst > 0 ? 'FAIL: layout shift on a repeat visit' : 'OK: CLS 0 on every repeat visit');
  process.exit(worst > 0 ? 1 : 0);
})();
