// The site's Content-Security-Policy (website/_headers) against what the pages and assets load.
// A blocked resource fails silently on Cloudflare (the feature tiles once lost their ticks: data: SVGs
// under img-src 'self'), so check it here: node --test tests/website-csp.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../website/', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

// _headers: the CSP for a path (a later exact-path block with "! Content-Security-Policy" replaces /*)
function cspFor(path) {
  let csp = null, match = false;
  for (const line of read('_headers').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      const pat = line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      match = new RegExp('^' + pat + '$').test(path);
      continue;
    }
    const m = /^\s*Content-Security-Policy:\s*(.+)$/.exec(line);
    if (match && m) csp = m[1];
  }
  assert.ok(csp, 'no CSP for ' + path);
  const dirs = {};
  csp.split(';').forEach((d) => { const [k, ...v] = d.trim().split(/\s+/); if (k) dirs[k] = v; });
  return (name) => dirs[name] || dirs['default-src'] || [];
}
const allows = (sources, url) => {
  if (/^data:/.test(url)) return sources.includes('data:');
  if (/^https?:\/\//.test(url)) return sources.some((s) => url.startsWith(s));
  return sources.includes("'self'");
};

const PAGES = { '/': 'index.html', '/waitlist': 'waitlist.html', '/testers': 'testers.html', '/privacy': 'privacy.html', '/partners': 'partners.html', '/support': 'support.html', '/r/': 'r/index.html', '/404': '404.html' };

test('every script and stylesheet on each page is allowed by that path\'s CSP, with no inline script', () => {
  for (const [path, file] of Object.entries(PAGES)) {
    const policy = cspFor(path), html = read(file);
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      const src = /src="([^"]+)"/.exec(m[1]);
      if (src) assert.ok(allows(policy('script-src'), src[1]), `${path}: script ${src[1]}`);
      else assert.ok(/application\/ld\+json/.test(m[1]) || !m[2].trim(), `${path}: inline script`);
    }
    for (const m of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)) assert.ok(allows(policy('style-src'), m[1]), `${path}: style ${m[1]}`);
    assert.ok(!/\son[a-z]+="/.test(html), `${path}: inline event handler`);
  }
});

test('Cloudflare Turnstile is allowed exactly on the pages with a sign-up form', () => {
  const TS = 'https://challenges.cloudflare.com';
  for (const [path, file] of Object.entries(PAGES)) {
    const policy = cspFor(path), hasForm = /data-waitlist/.test(read(file));
    assert.equal(policy('script-src').includes(TS), hasForm, `${path}: script-src Turnstile`);
    assert.equal(policy('frame-src').includes(TS), hasForm, `${path}: frame-src Turnstile`);
  }
});

test('the CSS and scripts load no data: images or fonts the CSP would block', () => {
  const policy = cspFor('/');
  const files = ['assets/site.css', 'assets/site.js', 'assets/season.js', 'assets/intro-gate.js', ...readdirSync(new URL('assets/scenes/', root)).map((f) => 'assets/scenes/' + f)];
  for (const f of files) {
    const s = read(f);
    for (const m of s.matchAll(/url\(\s*["']?(data:[^"')]{0,30})/g)) {
      assert.ok(allows(policy('img-src'), m[1]) || allows(policy('font-src'), m[1]), `${f}: ${m[1]}… is blocked by img-src ${policy('img-src').join(' ')}`);
    }
  }
});
