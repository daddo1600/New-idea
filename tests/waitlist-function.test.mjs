// Tests for functions/api/waitlist.js with a fake D1 binding.
// Run: node --test tests/waitlist-function.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleWaitlist, cleanGroup } from '../functions/api/waitlist.js';

const URL_ = 'https://milesprout.app/api/waitlist';

function fakeDB() {
  const rows = new Map();
  return {
    rows,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() {
              assert.match(sql, /^INSERT OR IGNORE INTO waitlist/);
              const [email, segment, country, consent_at, source, created_at] = args;
              if (!rows.has(email)) rows.set(email, { email, segment, country, consent_at, source, created_at });
              return { success: true };
            },
          };
        },
      };
    },
  };
}

function postJSON(body, headers = {}) {
  return new Request(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://milesprout.app', ...headers },
    body: JSON.stringify(body),
  });
}

function postForm(fields, headers = {}) {
  return new Request(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    body: new URLSearchParams(fields).toString(),
  });
}

test('stores a valid sign-up, trimmed and lowercased, with only the allowed columns', async () => {
  const DB = fakeDB();
  const res = await handleWaitlist(postJSON({ email: '  Sam@Example.CO.UK ', segment: 'food', country: 'UK', consent: 'yes', source: 'hero', company: '' }), { DB });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  const row = DB.rows.get('sam@example.co.uk');
  assert.ok(row);
  assert.equal(row.segment, 'food');
  assert.equal(row.country, 'UK');
  assert.equal(row.source, 'hero');
  assert.match(row.consent_at, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual(Object.keys(row).sort(), ['consent_at', 'country', 'created_at', 'email', 'segment', 'source']);
});

test('a duplicate looks exactly like a first sign-up', async () => {
  const DB = fakeDB();
  const a = await handleWaitlist(postJSON({ email: 'a@b.com', consent: 'yes' }), { DB });
  const b = await handleWaitlist(postJSON({ email: 'A@B.com', consent: 'yes' }), { DB });
  assert.deepEqual(await a.json(), await b.json());
  assert.equal(DB.rows.size, 1);
});

test('unknown segment/country/source are dropped, not stored', async () => {
  const DB = fakeDB();
  await handleWaitlist(postJSON({ email: 'x@y.org', consent: 'yes', segment: '<script>', country: 'Narnia', source: 'evil' }), { DB });
  const row = DB.rows.get('x@y.org');
  assert.equal(row.segment, null);
  assert.equal(row.country, null);
  assert.equal(row.source, 'web');
});

test('rejects bad emails', async () => {
  const DB = fakeDB();
  for (const email of ['', 'nope', 'a@b', 'a b@c.com', 'a@b.c', 'x'.repeat(250) + '@b.com']) {
    const res = await handleWaitlist(postJSON({ email, consent: 'yes' }), { DB });
    assert.equal(res.status, 400, email);
    assert.equal((await res.json()).error, 'email');
  }
  assert.equal(DB.rows.size, 0);
});

test('requires consent', async () => {
  const DB = fakeDB();
  const res = await handleWaitlist(postJSON({ email: 'a@b.com' }), { DB });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'consent');
  assert.equal(DB.rows.size, 0);
});

test('honeypot: pretends success, stores nothing', async () => {
  const DB = fakeDB();
  const res = await handleWaitlist(postJSON({ email: 'bot@spam.com', consent: 'yes', company: 'ACME' }), { DB });
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(DB.rows.size, 0);
});

test('no DB binding: 503 with a clear message', async () => {
  const res = await handleWaitlist(postJSON({ email: 'a@b.com', consent: 'yes' }), {});
  assert.equal(res.status, 503);
  assert.match((await res.json()).message, /D1/);
});

test('plain form post redirects (303) to the success or error page', async () => {
  const DB = fakeDB();
  const ok = await handleWaitlist(postForm({ email: 'form@ex.com', consent: 'yes', source: 'waitlist-page' }), { DB });
  assert.equal(ok.status, 303);
  assert.equal(ok.headers.get('Location'), 'https://milesprout.app/waitlist?joined=1#joined');
  assert.equal(DB.rows.get('form@ex.com').source, 'waitlist-page');
  const bad = await handleWaitlist(postForm({ email: 'nope', consent: 'yes' }), { DB });
  assert.equal(bad.status, 303);
  assert.equal(bad.headers.get('Location'), 'https://milesprout.app/waitlist?error=1#error');
});

test('refuses other methods and cross-site origins', async () => {
  const get = await handleWaitlist(new Request(URL_), { DB: fakeDB() });
  assert.equal(get.status, 405);
  const x = await handleWaitlist(postJSON({ email: 'a@b.com', consent: 'yes' }, { Origin: 'https://evil.example' }), { DB: fakeDB() });
  assert.equal(x.status, 403);
});

test('a database error is reported, not swallowed', async () => {
  const DB = { prepare: () => ({ bind: () => ({ run: async () => { throw new Error('boom'); } }) }) };
  const orig = console.error; console.error = () => {};
  const res = await handleWaitlist(postJSON({ email: 'a@b.com', consent: 'yes' }), { DB });
  console.error = orig;
  assert.equal(res.status, 500);
});

// ---------- Founding testers (/testers) ----------

test('cleanGroup: lowercase a-z 0-9 and hyphens, at most 40 characters', () => {
  assert.equal(cleanGroup('fb-Leeds-Couriers'), 'fb-leeds-couriers');
  assert.equal(cleanGroup('  WA Deliveroo_riders!! '), 'wa-deliveroo-riders');
  assert.equal(cleanGroup('<script>alert(1)</script>'), 'script-alert-1-script');
  assert.equal(cleanGroup('reddit--ukpf'), 'reddit-ukpf');
  assert.equal(cleanGroup('x'.repeat(60)).length, 40);
  assert.equal(cleanGroup('a'.repeat(39) + '-b'), 'a'.repeat(39));
  assert.equal(cleanGroup('ÉÉÉ'), '');
  assert.equal(cleanGroup(undefined), '');
  assert.equal(cleanGroup(42), '42');
});

test('tester with a group: source is testers:<group>, device goes in segment as segment|device', async () => {
  const DB = fakeDB();
  const res = await handleWaitlist(postJSON({ email: 't@ex.com', consent: 'yes', source: 'testers', group: 'FB Leeds Couriers', segment: 'parcels', country: 'UK', device: '12-to-15' }), { DB });
  assert.deepEqual(await res.json(), { ok: true });
  const row = DB.rows.get('t@ex.com');
  assert.equal(row.source, 'testers:fb-leeds-couriers');
  assert.equal(row.segment, 'parcels|12-to-15');
  assert.equal(row.country, 'UK');
  assert.deepEqual(Object.keys(row).sort(), ['consent_at', 'country', 'created_at', 'email', 'segment', 'source']);
});

test('tester without a group or segment: source testers, segment null or |device', async () => {
  const DB = fakeDB();
  await handleWaitlist(postJSON({ email: 'a@ex.com', consent: 'yes', source: 'testers', group: '' }), { DB });
  await handleWaitlist(postJSON({ email: 'b@ex.com', consent: 'yes', source: 'testers', group: '!!!', device: 'older' }), { DB });
  assert.equal(DB.rows.get('a@ex.com').source, 'testers');
  assert.equal(DB.rows.get('a@ex.com').segment, null);
  assert.equal(DB.rows.get('b@ex.com').source, 'testers');
  assert.equal(DB.rows.get('b@ex.com').segment, '|older');
});

test('unknown device is dropped; group and device are ignored on the plain waitlist', async () => {
  const DB = fakeDB();
  await handleWaitlist(postJSON({ email: 'a@ex.com', consent: 'yes', source: 'testers', segment: 'food', device: 'iphone 99' }), { DB });
  await handleWaitlist(postJSON({ email: 'b@ex.com', consent: 'yes', source: 'hero', segment: 'food', group: 'fb-x', device: 'older' }), { DB });
  assert.equal(DB.rows.get('a@ex.com').segment, 'food');
  assert.equal(DB.rows.get('b@ex.com').source, 'hero');
  assert.equal(DB.rows.get('b@ex.com').segment, 'food');
});

test('testers form post (no JS) redirects back to /testers, keeping the group on error', async () => {
  const DB = fakeDB();
  const ok = await handleWaitlist(postForm({ email: 'f@ex.com', consent: 'yes', source: 'testers', group: 'wa-friends', device: '15pro-or-newer' }), { DB });
  assert.equal(ok.status, 303);
  assert.equal(ok.headers.get('Location'), 'https://milesprout.app/testers?joined=1#joined');
  assert.equal(DB.rows.get('f@ex.com').source, 'testers:wa-friends');
  assert.equal(DB.rows.get('f@ex.com').segment, '|15pro-or-newer');
  const bad = await handleWaitlist(postForm({ email: 'nope', consent: 'yes', source: 'testers', group: 'wa-friends' }), { DB });
  assert.equal(bad.headers.get('Location'), 'https://milesprout.app/testers?g=wa-friends&error=1#error');
  const bad2 = await handleWaitlist(postForm({ email: 'nope', consent: 'yes', source: 'testers' }), { DB });
  assert.equal(bad2.headers.get('Location'), 'https://milesprout.app/testers?error=1#error');
  const hp = await handleWaitlist(postForm({ email: 'bot@ex.com', consent: 'yes', source: 'testers', company: 'x' }), { DB });
  assert.equal(hp.headers.get('Location'), 'https://milesprout.app/testers?joined=1#joined');
  assert.equal(DB.rows.has('bot@ex.com'), false);
});

test('no-JS testers post takes the group from a same-origin /testers Referer', async () => {
  const DB = fakeDB();
  await handleWaitlist(postForm({ email: 'r@ex.com', consent: 'yes', source: 'testers', group: '' }, { Referer: 'https://milesprout.app/testers?g=Reddit-UKPF' }), { DB });
  await handleWaitlist(postForm({ email: 's@ex.com', consent: 'yes', source: 'testers' }, { Referer: 'https://evil.example/testers?g=evil' }), { DB });
  await handleWaitlist(postForm({ email: 'u@ex.com', consent: 'yes', source: 'testers', group: 'from-form' }, { Referer: 'https://milesprout.app/testers?g=from-ref' }), { DB });
  assert.equal(DB.rows.get('r@ex.com').source, 'testers:reddit-ukpf');
  assert.equal(DB.rows.get('s@ex.com').source, 'testers');
  assert.equal(DB.rows.get('u@ex.com').source, 'testers:from-form');
});
