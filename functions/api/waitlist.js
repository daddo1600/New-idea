// POST /api/waitlist: adds an email to the pre-launch waitlist (Cloudflare Pages Function).
//
// Storage: a D1 database bound to the Pages project as `DB`, with
//   CREATE TABLE waitlist (email TEXT PRIMARY KEY, segment TEXT, country TEXT,
//                          consent_at TEXT, source TEXT, created_at TEXT);
// We store only those columns: no IP address, no user agent, no cookies.
//
// Bot checks (besides the hidden "company" honeypot):
//   - Cloudflare Turnstile: when the TURNSTILE_SECRET_KEY variable is set on the Pages project, the
//     form's token (cf-turnstile-response) is checked with Cloudflare's siteverify. A form posted
//     without JavaScript has no token, so it's turned away with a page asking to turn JavaScript on or
//     to email us. Without the secret, nothing is checked (a warning is logged), so the form works
//     before Turnstile is set up.
//   - At most 5 sign-ups an hour from one IP address. Only a SHA-256 hash of the address with a salt
//     that changes daily is kept, in its own table (created on first use), and only for that hour:
//       CREATE TABLE waitlist_rate (ip_hash TEXT NOT NULL, at INTEGER NOT NULL)
//     With RATE_LIMIT_SALT (a random secret on the project) the day's salt is HMAC(RATE_LIMIT_SALT, day),
//     so the hashes can't be brute-forced back to addresses; without it the salt is the day alone.
//
// Accepts JSON (from the site's script) or a normal form post (no JavaScript).
// JSON gets JSON back; a form post gets a 303 redirect to /waitlist?joined=1#joined
// (or /waitlist?error=1#error), or to /testers?... when it came from the founding testers page.
//
// Founding testers (source "testers"), without changing the table:
//   - source is stored as "testers", or "testers:<group>" when the sign-up link had ?g=<group>
//     (group: lowercase a-z, 0-9 and hyphens, at most 40 characters).
//   - the optional iPhone model goes in segment as "<segment>|<device>", e.g. "parcels|12-to-15",
//     or "|older" when no segment was chosen. Waitlist rows never contain "|".

const MAX_BODY = 4096;
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const SEGMENTS = new Set(['food', 'parcels', 'ridehail', 'care', 'trades', 'other']);
const COUNTRIES = new Set(['UK', 'US', 'CA', 'AU', 'other']);
// 'hero' was the home form's source until Oct 2026 (the form is now further down the page); still accepted.
const SOURCES = new Set(['home', 'hero', 'home-bottom', 'waitlist-page', 'testers']);
const DEVICES = new Set(['15pro-or-newer', '12-to-15', 'older', 'not-sure']);
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export const MESSAGES = {
  rate: "That's a lot of sign-ups from one connection. Please try again in an hour, or email hello@milesprout.app.",
  bot: "We couldn't check that you're not a bot. Please try again, or email hello@milesprout.app and we'll add you.",
  js: 'Please turn on JavaScript so we can check you\'re not a bot, or email hello@milesprout.app and we\'ll add you.',
};

let warnedNoSecret = false;
let rateTableReady = false;

// Group tag from a sign-up link (?g=fb-leeds-couriers): lowercase, runs of anything other than
// a-z / 0-9 / hyphen become one hyphen, no hyphens at the ends, at most 40 characters.
export function cleanGroup(v) {
  return str(v)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '');
}

// No-JS posts can't copy ?g= into the form, so fall back to the page the form was on
// (same-origin Referer, which our Referrer-Policy sends in full).
function groupFromReferer(request) {
  try {
    const ref = new URL(request.headers.get('Referer') || '');
    const here = new URL(request.url);
    if (ref.origin !== here.origin || !/^\/testers(\.html)?$/.test(ref.pathname)) return '';
    return cleanGroup(ref.searchParams.get('g'));
  } catch {
    return '';
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function redirect(request, path) {
  return new Response(null, {
    status: 303,
    headers: { Location: new URL(path, request.url).toString(), 'Cache-Control': 'no-store' },
  });
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

// Today's salt (UTC day): HMAC-SHA256(RATE_LIMIT_SALT, day) when the secret is set, else the day alone.
async function daySalt(secret) {
  const day = new Date().toISOString().slice(0, 10);
  if (!secret) return day;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(day)));
}

// SHA-256 of the IP with today's salt: the raw address is never stored.
async function hashIp(ip, secret) {
  const salt = await daySalt(secret);
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}|${ip}`)));
}

// True when this IP hash already has RATE_LIMIT sign-ups in the last hour. Old rows are cleared as we go.
async function overLimit(DB, ipHash, now) {
  if (!rateTableReady) {
    await DB.prepare('CREATE TABLE IF NOT EXISTS waitlist_rate (ip_hash TEXT NOT NULL, at INTEGER NOT NULL)').run();
    await DB.prepare('CREATE INDEX IF NOT EXISTS waitlist_rate_ip ON waitlist_rate (ip_hash, at)').run();
    rateTableReady = true;
  }
  await DB.prepare('DELETE FROM waitlist_rate WHERE at < ?1').bind(now - RATE_WINDOW_MS).run();
  const row = await DB.prepare('SELECT COUNT(*) AS n FROM waitlist_rate WHERE ip_hash = ?1').bind(ipHash).first();
  return Number(row && row.n) >= RATE_LIMIT;
}

// Cloudflare Turnstile: is this token good, for this site and this form? Network trouble or no
// answer within 5 s counts as a failure.
async function turnstileOk(token, secret, ip, host) {
  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set('remoteip', ip);
  try {
    const res = await fetch(SITEVERIFY, { method: 'POST', body: form, signal: AbortSignal.timeout(5000) });
    const out = await res.json();
    if (!out || !out.success) return false;
    if (out.action && out.action !== 'waitlist') return false;
    if (out.hostname && host && out.hostname !== host) return false;
    return true;
  } catch (err) {
    console.error('turnstile siteverify failed', err && err.message);
    return false;
  }
}

/** For tests: forget the per-isolate state (the warning and the rate table check). */
export function resetForTests() {
  warnedNoSecret = false;
  rateTableReady = false;
}

function str(v) {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

async function readBody(request) {
  const type = (request.headers.get('Content-Type') || '').toLowerCase();
  const text = await request.text();
  if (text.length > MAX_BODY) return { tooBig: true };
  if (type.includes('application/json')) {
    try {
      const data = JSON.parse(text);
      return { isForm: false, data: data && typeof data === 'object' ? data : {} };
    } catch {
      return { isForm: false, data: {}, bad: true };
    }
  }
  // application/x-www-form-urlencoded (plain HTML form post)
  return { isForm: true, data: Object.fromEntries(new URLSearchParams(text)) };
}

export async function handleWaitlist(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }

  // Only accept posts from our own pages.
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ ok: false, error: 'origin' }, 403);

  const body = await readBody(request);
  if (body.tooBig) return json({ ok: false, error: 'too_large' }, 413);
  const { isForm, data } = body;
  const testers = str(data.source) === 'testers';
  const group = testers ? cleanGroup(data.group) || (isForm ? groupFromReferer(request) : '') : '';
  // no-JS posts go back to the page they came from; an error keeps the group tag for the retry
  const page = testers ? '/testers' : '/waitlist';
  const joinedPath = `${page}?joined=1#joined`;
  const errorPath = `${page}?${group ? `g=${group}&` : ''}error=1#error`;
  // no-JS pages with their own message: /waitlist?error=js#error-js, ?error=rate#error-rate
  const errorPage = (kind) => `${page}?${group ? `g=${group}&` : ''}error=${kind}#error-${kind}`;
  const ok = () => (isForm ? redirect(request, joinedPath) : json({ ok: true }));
  const fail = (error, status) => (isForm ? redirect(request, errorPath) : json({ ok: false, error }, status));
  const refuse = (error, status, kind) =>
    isForm ? redirect(request, errorPage(kind)) : json({ ok: false, error, message: MESSAGES[error] }, status);

  // Honeypot: people never see the "company" field. Pretend it worked and store nothing.
  if (str(data.company).trim() !== '') return ok();

  const email = str(data.email).trim().toLowerCase();
  if (body.bad || email.length < 3 || email.length > 254 || !EMAIL_RE.test(email)) return fail('email', 400);

  const consent = data.consent === true || ['yes', 'on', 'true', '1'].includes(str(data.consent).toLowerCase());
  if (!consent) return fail('consent', 400);

  if (!env || !env.DB) {
    return isForm
      ? redirect(request, errorPath)
      : json({ ok: false, error: 'unavailable', message: 'Waitlist storage is not set up: bind a D1 database as DB.' }, 503);
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const nowMs = Date.now();
  let ipHash = '';
  if (ip) {
    try {
      ipHash = await hashIp(ip, str(env.RATE_LIMIT_SALT));
      if (await overLimit(env.DB, ipHash, nowMs)) return refuse('rate', 429, 'rate');
    } catch (err) {
      // the limit is a guard, not a gate: a hiccup here shouldn't lose a real sign-up
      console.error('waitlist rate limit check failed', err && err.message);
      ipHash = '';
    }
  }

  const secret = str(env.TURNSTILE_SECRET_KEY);
  const token = str(data['cf-turnstile-response']).trim();
  if (secret) {
    if (!token) return isForm ? redirect(request, errorPage('js')) : refuse('bot', 400, 'js');
    if (!(await turnstileOk(token, secret, ip, new URL(request.url).hostname))) return refuse('bot', 403, 'js');
  } else if (!warnedNoSecret) {
    warnedNoSecret = true;
    console.warn('waitlist: TURNSTILE_SECRET_KEY is not set, so the Turnstile bot check is skipped');
  }

  let segment = SEGMENTS.has(str(data.segment)) ? str(data.segment) : null;
  const device = testers && DEVICES.has(str(data.device)) ? str(data.device) : '';
  if (device) segment = `${segment || ''}|${device}`;
  const country = COUNTRIES.has(str(data.country)) ? str(data.country) : null;
  let source = SOURCES.has(str(data.source)) ? str(data.source) : 'web';
  if (testers && group) source = `testers:${group}`;
  const now = new Date().toISOString();

  try {
    // INSERT OR IGNORE: signing up twice looks the same as signing up once (no "already registered" leak).
    await env.DB.prepare(
      'INSERT OR IGNORE INTO waitlist (email, segment, country, consent_at, source, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)'
    )
      .bind(email, segment, country, now, source, now)
      .run();
  } catch (err) {
    console.error('waitlist insert failed', err && err.message);
    return fail('server', 500);
  }

  if (ipHash) {
    try {
      await env.DB.prepare('INSERT INTO waitlist_rate (ip_hash, at) VALUES (?1, ?2)').bind(ipHash, nowMs).run();
    } catch (err) {
      console.error('waitlist rate record failed', err && err.message);
    }
  }

  return ok();
}

export function onRequestPost(context) {
  return handleWaitlist(context.request, context.env);
}

export function onRequest(context) {
  return handleWaitlist(context.request, context.env);
}
