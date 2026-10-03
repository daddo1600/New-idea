// Tests for functions/api/scene.js: the scene key and every fallback to the standard scene.
// Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sceneKey, countryOfZone, onRequestGet } from '../functions/api/scene.js';

const london = { country: 'GB', regionCode: 'ENG', region: 'England', city: 'London', timezone: 'Europe/London' };

test('London, with a matching browser time zone, gets the London scene', () => {
  assert.equal(sceneKey(london, 'Europe/London'), 'uk-london');
});

test('the rest of the UK: city, countryside and Scotland keys', () => {
  assert.equal(sceneKey({ ...london, city: 'Leeds' }, 'Europe/London'), 'uk-city');
  assert.equal(sceneKey({ ...london, city: 'Skipton' }, 'Europe/London'), 'uk-country');
  assert.equal(sceneKey({ ...london, regionCode: 'SCT', city: 'Fort William' }, 'Europe/London'), 'uk-scotland');
  assert.equal(sceneKey({ ...london, regionCode: 'SCT', city: 'Edinburgh' }, 'Europe/London'), 'uk-edinburgh');
});

test('the other three countries', () => {
  assert.equal(sceneKey({ country: 'AU', regionCode: 'NSW', city: 'Sydney' }, 'Australia/Sydney'), 'au-sydney');
  assert.equal(sceneKey({ country: 'AU', regionCode: 'NT', city: 'Darwin' }, 'Australia/Darwin'), 'au-outback');
  assert.equal(sceneKey({ country: 'AU', regionCode: 'VIC', city: 'Ballarat' }, 'Australia/Melbourne'), 'au-town');
  assert.equal(sceneKey({ country: 'CA', regionCode: 'ON', city: 'Toronto' }, 'America/Toronto'), 'ca-toronto');
  assert.equal(sceneKey({ country: 'CA', regionCode: 'QC', city: 'Montreal' }, 'America/Toronto'), 'ca-quebec');
  assert.equal(sceneKey({ country: 'CA', regionCode: 'BC', city: 'Vancouver' }, 'America/Vancouver'), 'ca-west');
  assert.equal(sceneKey({ country: 'US', regionCode: 'TX', city: 'Austin' }, 'America/Chicago'), 'us-city');
});

test('standard: unknown location, Tor, other countries', () => {
  assert.equal(sceneKey(undefined, 'Europe/London'), 'standard');
  assert.equal(sceneKey({}, 'Europe/London'), 'standard');
  assert.equal(sceneKey({ country: 'T1' }, 'Europe/London'), 'standard');
  assert.equal(sceneKey({ country: 'XX' }, 'Europe/London'), 'standard');
  assert.equal(sceneKey({ country: 'NZ', city: 'Auckland' }, 'Pacific/Auckland'), 'standard');
});

test('standard: EU visitors, even with a matching-looking setup', () => {
  assert.equal(sceneKey({ country: 'IE', isEUCountry: '1', city: 'Dublin' }, 'Europe/Dublin'), 'standard');
  assert.equal(sceneKey({ ...london, isEUCountry: '1' }, 'Europe/London'), 'standard');
});

test('standard: no browser time zone, UTC or Etc/*', () => {
  assert.equal(sceneKey(london, ''), 'standard');
  assert.equal(sceneKey(london, undefined), 'standard');
  assert.equal(sceneKey(london, 'UTC'), 'standard');
  assert.equal(sceneKey(london, 'Etc/GMT+1'), 'standard');
});

test('standard: the browser time zone is in another country (VPN-like)', () => {
  assert.equal(sceneKey(london, 'America/New_York'), 'standard');
  assert.equal(sceneKey({ country: 'US', city: 'Ashburn' }, 'Europe/London'), 'standard');
  assert.equal(sceneKey({ country: 'CA', regionCode: 'ON' }, 'America/New_York'), 'standard');
});

test('countryOfZone covers the four countries and nothing else', () => {
  assert.equal(countryOfZone('Europe/London'), 'GB');
  assert.equal(countryOfZone('Australia/Perth'), 'AU');
  assert.equal(countryOfZone('America/Montreal'), 'CA');
  assert.equal(countryOfZone('America/Los_Angeles'), 'US');
  assert.equal(countryOfZone('Europe/Paris'), 'other');
  assert.equal(countryOfZone(''), null);
});

test('the reply: only a scene key, never cached, nothing else', async () => {
  const req = new Request('https://milesprout.app/api/scene?tz=Europe%2FLondon');
  Object.defineProperty(req, 'cf', { value: london });
  const res = await onRequestGet({ request: req });
  assert.equal(res.headers.get('Cache-Control'), 'private, no-store');
  const body = await res.json();
  assert.deepEqual(body, { scene: 'uk-london' });
  assert.ok(!JSON.stringify(body).includes('London')); // the key, never the city
});

test('?scene=standard (the visitor\'s choice) always wins', async () => {
  const req = new Request('https://milesprout.app/api/scene?tz=Europe%2FLondon&scene=standard');
  Object.defineProperty(req, 'cf', { value: london });
  assert.deepEqual(await (await onRequestGet({ request: req })).json(), { scene: 'standard' });
});

test('nothing is logged', async () => {
  const seen = [];
  const orig = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  for (const k of Object.keys(orig)) console[k] = (...a) => seen.push(a);
  try {
    const req = new Request('https://milesprout.app/api/scene?tz=Europe%2FLondon');
    Object.defineProperty(req, 'cf', { value: london });
    await onRequestGet({ request: req });
  } finally { Object.assign(console, orig); }
  assert.equal(seen.length, 0);
});

test('legacy time zone aliases map to their country (older browsers and settings still report them)', () => {
  for (const tz of ['America/Indianapolis', 'America/Louisville', 'America/Fort_Wayne', 'America/Knox_IN', 'America/Shiprock', 'America/Atka', 'Navajo',
    'US/Eastern', 'US/Central', 'US/Mountain', 'US/Pacific', 'US/Alaska', 'US/Hawaii', 'US/East-Indiana', 'US/Michigan', 'US/Arizona', 'US/Aleutian']) assert.equal(countryOfZone(tz), 'US', tz);
  for (const tz of ['Canada/Eastern', 'Canada/Central', 'Canada/Mountain', 'Canada/Pacific', 'Canada/Atlantic', 'Canada/Newfoundland', 'Canada/Saskatchewan', 'Canada/Yukon', 'America/Coral_Harbour', 'America/Montreal']) assert.equal(countryOfZone(tz), 'CA', tz);
  for (const tz of ['Australia/ACT', 'Australia/Canberra', 'Australia/NSW', 'Australia/North', 'Australia/Queensland', 'Australia/South', 'Australia/Tasmania', 'Australia/Victoria', 'Australia/West', 'Australia/Yancowinna', 'Australia/LHI']) assert.equal(countryOfZone(tz), 'AU', tz);
  for (const tz of ['GB', 'GB-Eire', 'Europe/Belfast']) assert.equal(countryOfZone(tz), 'GB', tz);
  // a visitor on a legacy zone isn't taken for "VPN-like"
  assert.equal(sceneKey({ country: 'GB', city: 'London' }, 'GB'), 'uk-london');
  assert.equal(sceneKey({ country: 'US', city: 'Indianapolis', regionCode: 'IN' }, 'America/Indianapolis'), 'us-city');
  assert.equal(sceneKey({ country: 'CA', regionCode: 'ON', city: 'Toronto' }, 'Canada/Eastern'), 'ca-toronto');
  assert.equal(sceneKey({ country: 'AU', regionCode: 'ACT', city: 'Canberra' }, 'Australia/ACT'), 'au-town');
});

test('the page decides the country from the same zone lists as /api/scene (intro-gate.js)', async () => {
  const { readFileSync } = await import('node:fs');
  const fn = readFileSync(new URL('../functions/api/scene.js', import.meta.url), 'utf8');
  const gate = readFileSync(new URL('../website/assets/intro-gate.js', import.meta.url), 'utf8');
  for (const name of ['CA_ZONES', 'US_ZONES']) {
    const re = new RegExp(name + ' = (/.*/);');
    assert.equal(re.exec(gate)[1], re.exec(fn)[1], name + ' in step');
  }
  assert.ok(gate.includes("/^(Europe\\/(London|Belfast)|GB|GB-Eire)$/"), 'GB aliases on the page too');
});
