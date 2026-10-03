// POST /api/waitlist: adds an email to the pre-launch waitlist (Cloudflare Pages Function).
//
// Storage: a D1 database bound to the Pages project as `DB`, with
//   CREATE TABLE waitlist (email TEXT PRIMARY KEY, segment TEXT, country TEXT,
//                          consent_at TEXT, source TEXT, created_at TEXT);
// We store only those columns: no IP address, no user agent, no cookies.
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
  const ok = () => (isForm ? redirect(request, joinedPath) : json({ ok: true }));
  const fail = (error, status) => (isForm ? redirect(request, errorPath) : json({ ok: false, error }, status));

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

  return ok();
}

export function onRequestPost(context) {
  return handleWaitlist(context.request, context.env);
}

export function onRequest(context) {
  return handleWaitlist(context.request, context.env);
}
