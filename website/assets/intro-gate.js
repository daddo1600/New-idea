/* Home page only, loaded before the page paints: picks the visitor's country, keeps the page at the top on load, and decides whether the sprout intro plays
   (once per browser session; with reduced motion it's a still, see site.js) and, if so, puts up a plain green
   cover so the hero doesn't flash first. site.js swaps the cover for the animation. If
   site.js never runs, the cover fades away by itself (CSS failsafe in site.css).
   ?season=<id> (a preview of a season, see season.js) or ?intro=1 plays it again. */
(function () {
  /* The visitor's country, from ?country= (previews), the time zone, then the language: 'GB', 'US', 'CA' or 'AU'.
     Decided here, before the page paints, and put on <html data-cc>, so the hero's money line shows the
     right country's text from the first frame (index.html carries all four; site.css shows one). No location
     is asked for. season.js and site.js use window.MSCountry. */
  var CA_ZONES = /^America\/(Toronto|Montreal|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Glace_Bay|Goose_Bay|Whitehorse|Dawson|Dawson_Creek|Fort_Nelson|Creston|Iqaluit|Rankin_Inlet|Resolute|Cambridge_Bay|Inuvik|Yellowknife|Swift_Current|Atikokan|Blanc-Sablon|Nipigon|Thunder_Bay|Rainy_River|Pangnirtung|Coral_Harbour)$|^Canada\//;
  var US_ZONES = /^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Adak|Boise|Detroit|Juneau|Sitka|Metlakatla|Nome|Yakutat|Menominee|Indianapolis|Louisville|Fort_Wayne|Knox_IN|Shiprock|Atka|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)|Pacific\/Honolulu|US\/.+|Navajo)$/;

  /** The country a time zone belongs to, of the four: 'GB', 'US', 'CA', 'AU', or null. */
  function zoneCountry(tz) {
    if (/^Australia\//.test(tz)) return 'AU';
    if (CA_ZONES.test(tz)) return 'CA';
    if (US_ZONES.test(tz)) return 'US';
    if (/^(Europe\/(London|Belfast)|GB|GB-Eire)$/.test(tz)) return 'GB';
    return null;
  }
  function zone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (err) { return ''; } // old browser
  }
  /** A ?country= preview, if any: 'GB', 'US', 'CA' or 'AU'. */
  function forcedCountry() {
    var forced = /[?&]country=(UK|GB|US|CA|AU)\b/i.exec(location.search);
    return forced ? (forced[1].toUpperCase() === 'UK' ? 'GB' : forced[1].toUpperCase()) : null;
  }
  function country() {
    var forced = forcedCountry();
    if (forced) return forced;
    var byZone = zoneCountry(zone());
    if (byZone) return byZone;
    var lang = (navigator.language || '').toUpperCase();
    var m = /-(AU|US|CA|GB)\b/.exec(lang);
    return m ? m[1] : 'GB';
  }

  // One source of truth for "where": country() (money, units, seasons; never unknown, GB by default) and,
  // once site.js has asked /api/scene, scene (the hero's scenery; 'standard' whenever we can't tell).
  window.MSCountry = { country: country, zoneCountry: zoneCountry, zone: zone, forced: forcedCountry, scene: null, CA_ZONES: CA_ZONES, US_ZONES: US_ZONES };
  try { document.documentElement.setAttribute('data-cc', country()); } catch (err) { /* the UK text shows */ }

  /* The page always opens at the top unless the URL has a #hash. Safari otherwise restores the
     last scroll position (reload, reopening the tab, coming back), and with the page's smooth
     scrolling that looks like the page driving itself down to the screens. */
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!location.hash) {
      var touched = false;
      var mark = function () { touched = true; };
      ['touchstart', 'wheel', 'keydown', 'pointerdown'].forEach(function (e) { window.addEventListener(e, mark, { capture: true, passive: true, once: true }); });
      var top = function () { if (!location.hash && !touched && window.scrollY) window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); };
      top();
      window.addEventListener('load', top);
      window.addEventListener('pageshow', function (e) { if (e.persisted) top(); });
    }
  } catch (err) { /* old browser: nothing to do */ }
  try {
    var replay = /[?&](season=[a-z-]+|intro=1)/.test(window.location.search);
    if (!replay && window.sessionStorage.getItem('ms-intro-seen')) return;
    document.documentElement.classList.add('ms-intro');
  } catch (err) { /* storage blocked: no intro */ }
})();
