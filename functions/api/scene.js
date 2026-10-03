// GET /api/scene?tz=<browser time zone>: which hero scenery to show (Cloudflare Pages Function).
//
// Returns only a scene key, e.g. {"scene":"uk-london"}, worked out in memory from Cloudflare's rough
// location for the request (request.cf: country, isEUCountry, regionCode/region, city, timezone) and
// checked against the browser's own time zone. Nothing is logged, stored or sent anywhere, the city is
// never returned, and the reply is `Cache-Control: private, no-store`.
//
// The standard scene whenever we can't tell or shouldn't:
//   - no country, Tor (T1), XX, or a country other than GB, US, CA, AU;
//   - the EU (isEUCountry);
//   - no browser time zone, or UTC / Etc/* (privacy tools, Tor);
//   - the browser time zone points to another country than the server's (VPN-like);
//   - ?scene=standard (the visitor's choice; the page also handles it without asking us).
// Research and rules: research_notes/launch-2026/local-scenes-research.md (§1-2).

const COUNTRIES = new Set(['GB', 'US', 'CA', 'AU']);

// Browser time zone -> country, for the cross-check (only the four countries matter).
const CA_ZONES = /^America\/(Toronto|Montreal|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Glace_Bay|Goose_Bay|Whitehorse|Dawson|Dawson_Creek|Fort_Nelson|Creston|Iqaluit|Rankin_Inlet|Resolute|Cambridge_Bay|Inuvik|Yellowknife|Swift_Current|Atikokan|Blanc-Sablon|Nipigon|Thunder_Bay|Rainy_River|Pangnirtung)$|^Canada\//;
const US_ZONES = /^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Adak|Boise|Detroit|Juneau|Sitka|Metlakatla|Nome|Yakutat|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)|Pacific\/Honolulu|US\/.+)$/;
const GB_ZONES = /^(Europe\/(London|Belfast)|GB|GB-Eire)$/;

export function countryOfZone(tz) {
  if (!tz || typeof tz !== 'string') return null;
  if (/^Australia\//.test(tz)) return 'AU';
  if (CA_ZONES.test(tz)) return 'CA';
  if (US_ZONES.test(tz)) return 'US';
  if (GB_ZONES.test(tz)) return 'GB';
  return 'other';
}

// Big UK cities (lower case) for the city scenes; the rest of a nation gets its countryside scene.
const UK_CITIES = new Set(['london', 'city of london', 'westminster', 'manchester', 'birmingham', 'leeds', 'liverpool', 'bristol', 'sheffield', 'newcastle upon tyne', 'nottingham', 'leicester', 'glasgow', 'edinburgh', 'cardiff', 'belfast']);

/**
 * The ideal scene key for a request's rough location and the browser's time zone. The page maps keys
 * it doesn't have artwork for yet to the nearest one it has (e.g. every UK key to London for now).
 */
export function sceneKey(cf, browserTz) {
  if (!cf || typeof cf !== 'object') return 'standard';
  const country = String(cf.country || '').toUpperCase();
  if (!COUNTRIES.has(country)) return 'standard';
  if (cf.isEUCountry === '1' || cf.isEUCountry === true) return 'standard';
  const tz = typeof browserTz === 'string' ? browserTz.trim() : '';
  if (!tz || /^(UTC|GMT|Etc\/.*|Universal|Zulu)$/i.test(tz)) return 'standard';
  if (countryOfZone(tz) !== country) return 'standard'; // VPN-like: the two disagree
  const region = String(cf.regionCode || cf.region || '').toUpperCase();
  const city = String(cf.city || '').toLowerCase();
  if (country === 'GB') {
    if (city === 'london' || city === 'city of london' || city === 'westminster') return 'uk-london';
    if (region === 'SCT' || region === 'SCOTLAND') return city === 'edinburgh' || city === 'glasgow' ? 'uk-edinburgh' : 'uk-scotland';
    return UK_CITIES.has(city) ? 'uk-city' : 'uk-country';
  }
  if (country === 'AU') {
    if (region === 'NT' || (region === 'WA' && city !== 'perth') || /Australia\/(Darwin|Broken_Hill)/.test(tz)) return 'au-outback';
    if (region === 'NSW' || city === 'sydney') return 'au-sydney';
    return 'au-town';
  }
  if (country === 'CA') {
    if (region === 'QC') return 'ca-quebec';
    if (/^America\/(Vancouver|Edmonton|Regina|Winnipeg)$/.test(tz)) return 'ca-west';
    return 'ca-toronto';
  }
  return 'us-city';
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const choice = url.searchParams.get('scene');
  const scene = choice === 'standard' ? 'standard' : sceneKey(context.request.cf, url.searchParams.get('tz'));
  return new Response(JSON.stringify({ scene }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
