// POST /api/waitlist: adds an email to the pre-launch waitlist (Cloudflare Pages Function).
//
// Storage: a D1 database bound to the Pages project as `DB`, with
//   CREATE TABLE waitlist (email TEXT PRIMARY KEY, segment TEXT, country TEXT,
//                          consent_at TEXT, source TEXT, created_at TEXT);
// We store only those columns: no IP address, no user agent, no cookies.
//
// Accepts JSON (from the site's script) or a normal form post (no JavaScript).
// JSON gets JSON back; a form post gets a 303 redirect to /waitlist?joined=1#joined
// (or /waitlist?error=1#error).

const MAX_BODY = 4096;
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const SEGMENTS = new Set(['food', 'parcels', 'ridehail', 'care', 'trades', 'other']);
const COUNTRIES = new Set(['UK', 'US', 'CA', 'AU', 'other']);
const SOURCES = new Set(['hero', 'home-bottom', 'waitlist-page']);

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
  const fail = (error, status) => (isForm ? redirect(request, '/waitlist?error=1#error') : json({ ok: false, error }, status));

  // Honeypot: people never see the "company" field. Pretend it worked and store nothing.
  if (str(data.company).trim() !== '') {
    return isForm ? redirect(request, '/waitlist?joined=1#joined') : json({ ok: true });
  }

  const email = str(data.email).trim().toLowerCase();
  if (body.bad || email.length < 3 || email.length > 254 || !EMAIL_RE.test(email)) return fail('email', 400);

  const consent = data.consent === true || ['yes', 'on', 'true', '1'].includes(str(data.consent).toLowerCase());
  if (!consent) return fail('consent', 400);

  if (!env || !env.DB) {
    return isForm
      ? redirect(request, '/waitlist?error=1#error')
      : json({ ok: false, error: 'unavailable', message: 'Waitlist storage is not set up: bind a D1 database as DB.' }, 503);
  }

  const segment = SEGMENTS.has(str(data.segment)) ? str(data.segment) : null;
  const country = COUNTRIES.has(str(data.country)) ? str(data.country) : null;
  const source = SOURCES.has(str(data.source)) ? str(data.source) : 'web';
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

  return isForm ? redirect(request, '/waitlist?joined=1#joined') : json({ ok: true });
}

export function onRequestPost(context) {
  return handleWaitlist(context.request, context.env);
}

export function onRequest(context) {
  return handleWaitlist(context.request, context.env);
}
