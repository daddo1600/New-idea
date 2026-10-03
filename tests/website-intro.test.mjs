// The home page intro: the seasons calendar (website/assets/season.js) and the money it counts up
// (website/assets/site.js), checked against the app (milemint/src/domain/regions.ts) and the
// research-checked figures (research_notes/launch-2026/website-claims-check.md §3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

function loadSeason() {
  const window = { matchMedia: () => ({ matches: false }), addEventListener() {}, sessionStorage: { getItem: () => '1' } };
  const html = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, classList: { add() {} } };
  const ctx = { window, location: { search: '', hash: '' }, navigator: { language: 'en-GB' }, history: {}, document: { documentElement: html }, Intl, Math, Date };
  vm.runInNewContext(read('website/assets/intro-gate.js'), ctx); // decides the country (window.MSCountry) first
  vm.runInNewContext(read('website/assets/season.js'), ctx);
  return window.MSSeason;
}
const S = loadSeason();
const at = (iso) => new Date(iso + 'T12:00:00');
const id = (iso, tz) => (S.pick(at(iso), tz) || { id: null }).id;

test('northern autumn shows in the UK, US and Canada in its window', () => {
  assert.equal(id('2026-10-03', 'Europe/London'), 'autumn');
  assert.equal(id('2026-11-25', 'Europe/London'), 'autumn');
  assert.equal(id('2026-11-26', 'Europe/London'), null);
  assert.equal(id('2026-10-03', 'America/New_York'), 'autumn');
  assert.equal(id('2026-10-03', 'America/Toronto'), 'autumn');
  assert.equal(id('2026-11-11', 'America/Chicago'), null);
  assert.equal(id('2026-11-12', 'America/Chicago'), null); // US and Canada end on 10 Nov
});

test('celebrations without approved art fall back to the season', () => {
  assert.equal(id('2026-10-31', 'Europe/London'), 'autumn'); // Halloween: not live
  assert.equal(id('2026-11-05', 'Europe/London'), 'autumn'); // Bonfire Night: not live
});

test('quiet days beat everything', () => {
  assert.equal(id('2026-11-11', 'Europe/London'), null); // Remembrance Day
  assert.equal(id('2026-11-08', 'Europe/London'), null); // Remembrance Sunday 2026
  assert.equal(id('2026-11-09', 'Europe/London'), 'autumn');
  assert.ok(S.covers({ month: 11, weekday: 0, nth: 2 }, at('2027-11-14'))); // Remembrance Sunday 2027
  assert.ok(S.covers({ month: 5, weekday: 1, nth: -1 }, at('2027-05-31'))); // Memorial Day 2027
  assert.ok(!S.covers({ month: 5, weekday: 1, nth: -1 }, at('2027-05-24')));
  assert.ok(S.covers({ month: 11, weekday: 2, nth: 1 }, at('2026-11-03'))); // Melbourne Cup 2026
  assert.ok(S.covers('1231-0102', at('2027-01-02')) && S.covers('1231-0102', at('2026-12-31')) && !S.covers('1231-0102', at('2027-01-03')));
});

test('no season for unknown places, the standard scene, or the Top End', () => {
  assert.equal(id('2026-10-03', 'Europe/Paris'), null);
  assert.equal(id('2026-10-03', ''), null);
  assert.equal(id('2026-11-02', 'Australia/Darwin'), null);
  assert.equal(id('2026-07-15', 'Australia/Darwin'), null);
});

test('jacaranda is drawn but not live yet; other old seasons are off', () => {
  assert.equal(id('2026-11-02', 'Australia/Sydney'), null);
  assert.equal(id('2026-10-28', 'Australia/Brisbane'), null);
  assert.equal(id('2026-12-10', 'Europe/London'), null); // festive art: not live
  assert.equal(id('2027-01-01', 'Europe/Paris'), null); // new year: not live
  assert.ok(S.ambient({ id: 'jacaranda', southern: true }).includes('fx-jac'));
  assert.ok(S.ambient({ id: 'autumn', southern: false }).includes('fx-land'));
});

test("the festive reindeer's noses are all brown (a red one is the Rudolph trade mark)", () => {
  const svg = S.rider('festive').svg;
  assert.ok(!/#EF4444/i.test(svg));
  assert.equal((svg.match(/#451A03/g) || []).length, 2);
});

// --- money ---
const site = read('website/assets/site.js');
const regions = read('milemint/src/domain/regions.ts');

function siteRegion(code) {
  const m = new RegExp(code + ": \\{ cur: '(\\w+)', locale: '([\\w-]+)', unit: '(mi|km)', tiers: (\\[\\[.*?\\]\\]), authority: '([^']+)' \\}").exec(site);
  assert.ok(m, 'APP_REGIONS.' + code + ' in site.js');
  return { cur: m[1], locale: m[2], unit: m[3], tiers: JSON.parse(m[4]), authority: m[5] };
}
// the page's one example: EXAMPLE_WEEK for WEEKS weeks (site.js)
const weekM = /var WEEKS = (\d+), EXAMPLE_WEEK = \{ mi: (\d+), km: (\d+) \};/.exec(site);
assert.ok(weekM, 'WEEKS and EXAMPLE_WEEK in site.js');
const WEEKS = +weekM[1], WEEK = { mi: +weekM[2], km: +weekM[3] };
function exampleYear(r) {
  let left = WEEK[r.unit] * WEEKS, total = 0;
  for (const [upTo, rate] of r.tiers) {
    if (left <= 0) break;
    const room = upTo === null ? left : Math.min(left, upTo);
    total += (room * rate) / 10;
    left -= room;
  }
  return Math.round(total);
}
/** The newest rate period's tiers for a region in regions.ts, as [[upTo, rate], ...]. */
function appTiers(currency) {
  const block = regions.slice(regions.indexOf(`currency: '${currency}'`));
  const periods = block.slice(0, block.indexOf('rule:')).match(/\{ from: '[\d-]+', tiers: \[(.*?)\] \}/g);
  const last = periods[periods.length - 1];
  return [...last.matchAll(/upTo: (null|[\d_]+), rate: (\d+)/g)].map((m) => [m[1] === 'null' ? null : +m[1].replace(/_/g, ''), +m[2]]);
}

test("the intro's rates match the app's current rates", () => {
  for (const [code, cur] of [['GB', 'GBP'], ['US', 'USD'], ['CA', 'CAD'], ['AU', 'AUD']]) {
    assert.deepEqual(siteRegion(code).tiers, appTiers(cur), code);
  }
});

test("a year of the example month is the expected figure", () => {
  const want = { GB: ['£2,640', 'HMRC'], US: ['$3,648', 'the IRS'], CA: ['$5,446', 'the CRA'], AU: ['$4,550', 'the ATO'] };
  for (const [code, [amount, authority]] of Object.entries(want)) {
    const r = siteRegion(code);
    const text = new Intl.NumberFormat(r.locale, { style: 'currency', currency: r.cur, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(exampleYear(r) / 100);
    assert.equal(text, amount, code);
    assert.equal(r.authority, authority, code);
  }
});

test("the intro uses the app's wording, and never the banned words", () => {
  assert.ok(site.includes("' · an example month of part-time work driving'"));
  assert.ok(site.includes("'A year of this is worth about '") && site.includes("'’s allowance rate.'"));
  assert.ok(site.includes("'’s rate.'"));
  for (const file of ['website/assets/site.js', 'website/assets/season.js', 'website/assets/intro-gate.js']) {
    const text = read(file);
    assert.ok(!/\btracking\b/i.test(text), file + ': tracking');
    assert.ok(!/\bwe keep\b|our servers/i.test(text), file + ': we keep');
  }
});

// The hero's money line and the calculator's starting point (RATES, yearWorth, defaultWeek in site.js)
function heroTiers(code) {
  const m = new RegExp(code + ": \\{ unit: '(mi|km)'[\\s\\S]*?tiers: (\\[\\[.*?\\]\\])").exec(site);
  assert.ok(m, 'RATES.' + code + ' in site.js');
  return { unit: m[1], tiers: JSON.parse(m[2].replace(/Infinity/g, 'null')) };
}
test('the intro and the hero/calculator show the same year for every country (one Canadian figure)', () => {
  assert.ok(site.includes("function defaultWeek(r) { return EXAMPLE_WEEK[r.unit]; }"), 'calculator starts at the example week');
  assert.ok(site.includes('DEMO_MONTH = { mi: EXAMPLE_WEEK.mi * WEEKS / 12, km: EXAMPLE_WEEK.km * WEEKS / 12 }'), 'intro month from the example week');
  for (const [app, hero] of [['GB', 'UK'], ['US', 'US'], ['CA', 'CA'], ['AU', 'AU']]) {
    const r = siteRegion(app), h = heroTiers(hero);
    assert.equal(h.unit, r.unit, app);
    let left = WEEK[h.unit] * WEEKS, total = 0; // yearWorth()
    for (const [upTo, rate] of h.tiers) {
      if (left <= 0) break;
      const band = upTo === null ? left : Math.min(left, upTo);
      total += band * rate;
      left -= band;
    }
    assert.equal(Math.round(total), Math.round(exampleYear(r) / 100), app);
  }
});

test("the hero's four money lines are in the page, with the figures the calculator works out", () => {
  const html = read('website/index.html');
  for (const [code, amount] of [['UK', '£2,640'], ['US', '$3,648'], ['CA', '$5,446'], ['AU', '$4,550']]) {
    const m = new RegExp('<span data-for="' + code + '">([^<]*)(?:<a class="money-amt" href="#calc" tabindex="-1" aria-hidden="true">)?<strong>([^<]+)</strong>(?:</a><span class="sr-only" data-amt-sr>([^<]+)</span>)?').exec(html);
    assert.ok(m, code + ' line in index.html');
    assert.equal(m[2], amount, code);
    if (m[3] !== undefined) assert.equal(m[3], amount, code + ' screen-reader copy');
  }
  // shown by <html data-cc>, set before paint
  assert.ok(read('website/assets/intro-gate.js').includes("setAttribute('data-cc', country())"));
  assert.ok(read('website/assets/site.css').includes('html[data-cc="CA"] .money-line [data-for="CA"]'));
});
