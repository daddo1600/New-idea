// Tests for functions/api/waitlist.js with a fake D1 binding.
// Run: node --test tests/waitlist-function.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleWaitlist, cleanGroup, resetForTests } from '../functions/api/waitlist.js';

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

test("the home form's source is 'home'; the old 'hero' is still accepted", async () => {
  const DB = fakeDB();
  await handleWaitlist(postJSON({ email: 'h@ex.com', consent: 'yes', source: 'home' }), { DB });
  await handleWaitlist(postJSON({ email: 'o@ex.com', consent: 'yes', source: 'hero' }), { DB });
  await handleWaitlist(postJSON({ email: 'x@ex.com', consent: 'yes', source: 'somewhere' }), { DB });
  assert.equal(DB.rows.get('h@ex.com').source, 'home');
  assert.equal(DB.rows.get('o@ex.com').source, 'hero');
  assert.equal(DB.rows.get('x@ex.com').source, 'web');
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

// ---------- Bot checks: Cloudflare Turnstile and the per-IP rate limit ----------

// A fake D1 that also understands the rate-limit table.
function fakeDB2() {
  const rows = new Map();
  const rate = [];
  const sqls = [];
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    async run() {
      sqls.push(sql);
      if (/^CREATE (TABLE|INDEX) IF NOT EXISTS/.test(sql)) return { success: true };
      if (/^DELETE FROM waitlist_rate WHERE at < \?1$/.test(sql)) {
        for (let i = rate.length - 1; i >= 0; i--) if (rate[i].at < args[0]) rate.splice(i, 1);
        return { success: true };
      }
      if (/^INSERT INTO waitlist_rate/.test(sql)) { rate.push({ ip_hash: args[0], at: args[1] }); return { success: true }; }
      if (/^INSERT OR IGNORE INTO waitlist /.test(sql)) {
        const [email, segment, country, consent_at, source, created_at] = args;
        if (!rows.has(email)) rows.set(email, { email, segment, country, consent_at, source, created_at });
        return { success: true };
      }
      throw new Error('unexpected SQL: ' + sql);
    },
    async first() {
      sqls.push(sql);
      assert.match(sql, /^SELECT COUNT\(\*\) AS n FROM waitlist_rate WHERE ip_hash = \?1$/);
      return { n: rate.filter((r) => r.ip_hash === args[0]).length };
    },
  });
  return { rows, rate, sqls, prepare: (sql) => stmt(sql) };
}

// Replaces fetch with a fake siteverify; returns the calls made.
function mockSiteverify(success) {
  const calls = [];
  const orig = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: new URLSearchParams(String(init.body)) });
    return new Response(JSON.stringify({ success, 'error-codes': success ? [] : ['invalid-input-response'] }), { headers: { 'Content-Type': 'application/json' } });
  };
  calls.restore = () => { globalThis.fetch = orig; };
  return calls;
}

const quiet = async (fn) => {
  const [e, w] = [console.error, console.warn];
  const logged = [];
  console.error = (...a) => logged.push(['error', ...a]);
  console.warn = (...a) => logged.push(['warn', ...a]);
  try { return { result: await fn(), logged }; } finally { console.error = e; console.warn = w; }
};

const SECRET = { TURNSTILE_SECRET_KEY: '0x4AAAAtest-secret' };

test('turnstile: a good token is checked with siteverify (secret, response, remoteip) and the sign-up stored', async () => {
  resetForTests();
  const DB = fakeDB2();
  const calls = mockSiteverify(true);
  try {
    const res = await handleWaitlist(postJSON({ email: 'ok@ex.com', consent: 'yes', 'cf-turnstile-response': 'tok-123' }, { 'CF-Connecting-IP': '203.0.113.7' }), { DB, ...SECRET });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
  } finally { calls.restore(); }
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.equal(calls[0].body.get('secret'), SECRET.TURNSTILE_SECRET_KEY);
  assert.equal(calls[0].body.get('response'), 'tok-123');
  assert.equal(calls[0].body.get('remoteip'), '203.0.113.7');
  assert.ok(DB.rows.has('ok@ex.com'));
});

test('turnstile: a bad token is refused with a clear message, and nothing is stored', async () => {
  resetForTests();
  const DB = fakeDB2();
  const calls = mockSiteverify(false);
  try {
    const res = await handleWaitlist(postJSON({ email: 'no@ex.com', consent: 'yes', 'cf-turnstile-response': 'bad' }), { DB, ...SECRET });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.error, 'bot');
    assert.match(body.message, /hello@milesprout\.app/);
    // the no-JS path: back to the page with its own message
    const form = await handleWaitlist(postForm({ email: 'no@ex.com', consent: 'yes', 'cf-turnstile-response': 'bad' }), { DB, ...SECRET });
    assert.equal(form.status, 303);
    assert.equal(form.headers.get('Location'), 'https://milesprout.app/waitlist?error=js#error-js');
  } finally { calls.restore(); }
  assert.equal(DB.rows.size, 0);
});

test('turnstile: with the secret set, no token means JSON 400, and a no-JS post is asked to turn JavaScript on', async () => {
  resetForTests();
  const DB = fakeDB2();
  const calls = mockSiteverify(true);
  try {
    const res = await handleWaitlist(postJSON({ email: 'a@ex.com', consent: 'yes' }), { DB, ...SECRET });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'bot');
    const form = await handleWaitlist(postForm({ email: 'a@ex.com', consent: 'yes', source: 'testers', group: 'fb-x' }), { DB, ...SECRET });
    assert.equal(form.headers.get('Location'), 'https://milesprout.app/testers?g=fb-x&error=js#error-js');
  } finally { calls.restore(); }
  assert.equal(calls.length, 0);
  assert.equal(DB.rows.size, 0);
});

test('turnstile: without the secret nothing is checked (a warning is logged once), with or without a token', async () => {
  resetForTests();
  const DB = fakeDB2();
  const calls = mockSiteverify(false);
  let logged;
  try {
    ({ logged } = await quiet(async () => {
      const a = await handleWaitlist(postForm({ email: 'nojs@ex.com', consent: 'yes' }), { DB });
      assert.equal(a.headers.get('Location'), 'https://milesprout.app/waitlist?joined=1#joined');
      const b = await handleWaitlist(postJSON({ email: 'js@ex.com', consent: 'yes', 'cf-turnstile-response': 'whatever' }), { DB });
      assert.equal(b.status, 200);
    }));
  } finally { calls.restore(); }
  assert.equal(calls.length, 0);
  assert.equal(logged.filter((l) => l[0] === 'warn' && /TURNSTILE_SECRET_KEY/.test(l[1])).length, 1);
  assert.ok(DB.rows.has('nojs@ex.com') && DB.rows.has('js@ex.com'));
});

test('rate limit: 5 sign-ups an hour per IP, then 429 with a friendly message; only a hash is kept', async () => {
  resetForTests();
  const DB = fakeDB2();
  const ip = { 'CF-Connecting-IP': '198.51.100.23' };
  for (let i = 0; i < 5; i++) {
    const res = await handleWaitlist(postJSON({ email: `p${i}@ex.com`, consent: 'yes' }, ip), { DB });
    assert.equal(res.status, 200, `sign-up ${i + 1}`);
  }
  const sixth = await handleWaitlist(postJSON({ email: 'p5@ex.com', consent: 'yes' }, ip), { DB });
  assert.equal(sixth.status, 429);
  const body = await sixth.json();
  assert.equal(body.error, 'rate');
  assert.match(body.message, /try again in an hour/);
  assert.ok(!DB.rows.has('p5@ex.com'));
  const form = await handleWaitlist(postForm({ email: 'p6@ex.com', consent: 'yes' }, ip), { DB });
  assert.equal(form.headers.get('Location'), 'https://milesprout.app/waitlist?error=rate#error-rate');
  // another address isn't affected
  const other = await handleWaitlist(postJSON({ email: 'q@ex.com', consent: 'yes' }, { 'CF-Connecting-IP': '198.51.100.24' }), { DB });
  assert.equal(other.status, 200);
  // the table holds SHA-256 hex hashes, never the address
  assert.equal(DB.rate.length, 6);
  for (const r of DB.rate) {
    assert.match(r.ip_hash, /^[0-9a-f]{64}$/);
    assert.ok(!r.ip_hash.includes('198.51'));
  }
  assert.ok(DB.sqls.some((s) => /^CREATE TABLE IF NOT EXISTS waitlist_rate/.test(s)));
});

test('rate limit: entries older than an hour no longer count', async () => {
  resetForTests();
  const DB = fakeDB2();
  const ip = { 'CF-Connecting-IP': '192.0.2.9' };
  for (let i = 0; i < 5; i++) await handleWaitlist(postJSON({ email: `old${i}@ex.com`, consent: 'yes' }, ip), { DB });
  for (const r of DB.rate) r.at -= 61 * 60 * 1000; // an hour and a minute ago
  const res = await handleWaitlist(postJSON({ email: 'new@ex.com', consent: 'yes' }, ip), { DB });
  assert.equal(res.status, 200);
  assert.equal(DB.rate.length, 1);
});

test('honeypot still wins: pretends success before any Turnstile or rate check', async () => {
  resetForTests();
  const DB = fakeDB2();
  const calls = mockSiteverify(true);
  try {
    const res = await handleWaitlist(postJSON({ email: 'bot@spam.com', consent: 'yes', company: 'ACME', 'cf-turnstile-response': 'tok' }, { 'CF-Connecting-IP': '203.0.113.1' }), { DB, ...SECRET });
    assert.deepEqual(await res.json(), { ok: true });
  } finally { calls.restore(); }
  assert.equal(calls.length, 0);
  assert.equal(DB.rows.size, 0);
  assert.equal(DB.sqls.length, 0);
});
