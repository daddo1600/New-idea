// Tests for functions/api/waitlist.js with a fake D1 binding.
// Run: node --test tests/waitlist-function.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleWaitlist } from '../functions/api/waitlist.js';

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

function postForm(fields) {
  return new Request(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
