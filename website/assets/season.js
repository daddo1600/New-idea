/* MileSprout website: the seasons and road signs for the sprout intro, ported from the app
   (milemint/src/domain/seasons.ts, components/intro-scenery.tsx, components/season/*).
   No location is asked for: the country comes from the browser's time zone, then its language.
   ?season=<id> (festive, new-year, halloween, aussie-summer, winter, spring, summer, autumn)
   picks a season for previews and screenshots; ?season=none turns it off.
   Exposes window.MSSeason for site.js. Drawing is SVG strings in the logo's 100-unit box. */
(function () {
  'use strict';

  var IDS = ['festive', 'new-year', 'halloween', 'aussie-summer', 'winter', 'spring', 'summer', 'autumn', 'jacaranda'];

  /* ---------- Which country (only AU, US/CA and the rest matter here) ---------- */
  var CA_ZONES = /^America\/(Toronto|Montreal|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Glace_Bay|Goose_Bay|Whitehorse|Dawson|Dawson_Creek|Fort_Nelson|Creston|Iqaluit|Rankin_Inlet|Resolute|Cambridge_Bay|Inuvik|Yellowknife|Swift_Current|Atikokan|Blanc-Sablon|Nipigon|Thunder_Bay|Rainy_River|Pangnirtung)$/;
  var US_ZONES = /^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Adak|Boise|Detroit|Juneau|Sitka|Metlakatla|Nome|Yakutat|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)|Pacific\/Honolulu|US\/.+)$/;

  function country() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (err) { /* old browser */ }
    if (/^Australia\//.test(tz)) return 'AU';
    if (CA_ZONES.test(tz)) return 'CA';
    if (US_ZONES.test(tz)) return 'US';
    if (tz === 'Europe/London') return 'GB';
    var lang = (navigator.language || '').toUpperCase();
    var m = /-(AU|US|CA|GB)\b/.exec(lang);
    return m ? m[1] : 'GB';
  }

  /* ---------- Which season (same rules as the app) ---------- */
  function seasonId(day, southern) {
    if (day >= 1201 && day <= 1226) return 'festive';
    if (day >= 1231 || day <= 102) return 'new-year';
    if (day >= 1024 && day <= 1031) return 'halloween';
    var month = Math.floor(day / 100);
    var northern = month === 12 || month <= 2 ? 'winter' : month <= 5 ? 'spring' : month <= 8 ? 'summer' : 'autumn';
    if (!southern) return northern;
    var flipped = { winter: 'summer', spring: 'autumn', summer: 'winter', autumn: 'spring' }[northern];
    return flipped === 'summer' ? 'aussie-summer' : flipped;
  }

  function greeting(id, code) {
    switch (id) {
      case 'festive': return 'Happy holidays from MileSprout 🎁';
      case 'new-year': return 'Happy New Year 🎆';
      case 'halloween': return 'Happy Halloween 🎃';
      case 'aussie-summer': return 'Summer on the road ☀️';
      case 'winter': return 'Stay warm and drive safely ❄️';
      case 'spring': case 'jacaranda': return 'Spring is here 🌸';
      case 'summer': return 'Summer is here ☀️';
      case 'autumn': return code === 'US' || code === 'CA' ? 'Fall is here 🍂' : 'Autumn is here 🍂';
    }
    return '';
  }

  /* ---------- Where, for the seasons: the time zone only (never the language, never a default) ----------
     A season shows only when the time zone puts the visitor in a place we have art for; anyone
     else (EU, unknown, a VPN that hides the zone) gets the standard look with no season. */
  function area(tz) {
    if (/^Australia\/(Sydney|NSW|ACT|Canberra|Broken_Hill|Yancowinna)$/.test(tz)) return { code: 'AU', area: 'NSW' };
    if (/^Australia\/(Brisbane|Lindeman|Queensland)$/.test(tz)) return { code: 'AU', area: 'QLD' };
    // Darwin and the Top End have a wet and a dry season, not four: no season art there.
    if (/^Australia\/(Darwin|North)$/.test(tz)) return { code: 'AU', area: 'NT' };
    if (/^Australia\/(Melbourne|Victoria)$/.test(tz)) return { code: 'AU', area: 'VIC' };
    if (/^Australia\//.test(tz)) return { code: 'AU', area: '' };
    if (CA_ZONES.test(tz)) return { code: 'CA', area: '' };
    if (US_ZONES.test(tz)) return { code: 'US', area: '' };
    if (tz === 'Europe/London' || tz === 'GB' || tz === 'Europe/Belfast') return { code: 'GB', area: '' };
    return null;
  }

  /* ---------- The calendar (research_notes/launch-2026/scene-calendar.md, checked 3 Oct 2026) ----------
     `when`: 'MMDD' or 'MMDD-MMDD' every year, 'YYYY-MM-DD..YYYY-MM-DD' for dates that move,
     or { month, weekday (0 = Sunday), nth (-1 = last) }. `where`: country codes, or 'AU-NSW' style areas.
     Order of play: a quiet day beats everything, then a live celebration, then a live season. */
  var QUIET = [
    // Remembrance and solemn days: no overlay of any kind, the normal look stays.
    { what: 'Remembrance Day / Veterans Day', where: ['GB', 'US', 'CA', 'AU'], when: '1111' },
    { what: 'Remembrance Sunday', where: ['GB'], when: { month: 11, weekday: 0, nth: 2 } },
    { what: 'Memorial Day', where: ['US'], when: { month: 5, weekday: 1, nth: -1 } },
    { what: 'Juneteenth', where: ['US'], when: '0619' },
    { what: 'National Day for Truth and Reconciliation', where: ['CA'], when: '0930' },
    { what: 'Anzac Day', where: ['AU'], when: '0425' },
    { what: 'Australia Day (contested)', where: ['AU'], when: '0126' },
    { what: 'Melbourne Cup (trade mark, betting)', where: ['AU-VIC'], when: { month: 11, weekday: 2, nth: 1 } }
  ];
  /* Celebrations, held as data. None has art that has passed review yet (live: false), so on these
     days the season shows instead; switch one on only once its art passes marketing and QA. */
  var CELEBRATIONS = [
    { id: 'halloween', where: ['US', 'CA', 'GB'], when: '1030-1031', live: false },
    { id: 'bonfire-night', where: ['GB'], when: '1104-1107', live: false },
    { id: 'diwali', where: ['GB', 'US', 'CA', 'AU'], when: '2026-11-06..2026-11-09', live: false },
    { id: 'thanksgiving-us', where: ['US'], when: '2026-11-25..2026-11-29', live: false },
    { id: 'festive', where: ['GB', 'US', 'CA', 'AU'], when: '1201-1226', live: false },
    { id: 'new-year', where: ['GB', 'US', 'CA', 'AU', 'standard'], when: '1231-0102', live: false },
    { id: 'lunar-new-year', where: ['GB', 'US', 'CA', 'AU'], when: '2027-02-05..2027-02-14', live: false },
    { id: 'eid-al-fitr', where: ['GB', 'US', 'CA', 'AU'], when: '2027-03-09..2027-03-11', live: false },
    { id: 'easter', where: ['GB', 'US', 'CA', 'AU'], when: '2027-03-26..2027-03-29', live: false },
    { id: 'vaisakhi', where: ['GB', 'US', 'CA', 'AU'], when: '2027-04-10..2027-04-14', live: false },
    { id: 'eid-al-adha', where: ['GB', 'US', 'CA', 'AU'], when: '2027-05-16..2027-05-18', live: false },
    { id: 'canada-day', where: ['CA'], when: '0701', live: false },
    { id: 'independence-day', where: ['US'], when: '0703-0705', live: false },
    { id: 'thanksgiving-ca', where: ['CA'], when: '2027-10-09..2027-10-11', live: false },
    { id: 'diwali', where: ['GB', 'US', 'CA', 'AU'], when: '2027-10-28..2027-10-30', live: false },
    { id: 'halloween', where: ['US', 'CA', 'GB'], when: '1031', live: false },
    { id: 'thanksgiving-us', where: ['US'], when: '2027-11-24..2027-11-28', live: false }
  ];
  /* Seasons with redrawn art. Only northern autumn is live; every other season id stays off for visitors
     (?season=<id> still previews it). */
  var SEASONS = [
    { id: 'autumn', where: ['GB'], when: '1001-1125', live: true },
    { id: 'autumn', where: ['US', 'CA'], when: '0915-1110', live: true },
    // Jacaranda: drawn, but not yet good enough to show (3 Oct 2026); preview with ?season=jacaranda.
    { id: 'jacaranda', where: ['AU-NSW'], when: '1025-1130', live: false },
    { id: 'jacaranda', where: ['AU-QLD'], when: '1025-1031', live: false }
  ];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  /** Does `when` cover the local date `d`? */
  function covers(when, d) {
    var md = (d.getMonth() + 1) * 100 + d.getDate();
    if (typeof when === 'object') {
      if (d.getMonth() + 1 !== when.month || d.getDay() !== when.weekday) return false;
      if (when.nth > 0) return Math.ceil(d.getDate() / 7) === when.nth;
      return d.getDate() + 7 > new Date(d.getFullYear(), when.month, 0).getDate(); // the last one
    }
    if (when.indexOf('..') > 0) {
      var iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), r = when.split('..');
      return iso >= r[0] && iso <= r[1];
    }
    var parts = when.split('-'), a = +parts[0], b = parts[1] ? +parts[1] : a;
    return a <= b ? md >= a && md <= b : md >= a || md <= b; // a window across New Year wraps
  }
  function applies(entry, place, d) {
    var here = place ? [place.code, place.code + '-' + place.area] : ['standard'];
    return entry.where.some(function (w) { return here.indexOf(w) >= 0; }) && covers(entry.when, d);
  }
  /** The season to show on local date `d` for time zone `tz`, or null. Pure, for the tests. */
  function pick(d, tz) {
    var place = area(tz);
    if (place && place.area === 'NT') return null;
    var hit = function (list) {
      for (var i = 0; i < list.length; i++) if (list[i].live !== false && applies(list[i], place, d)) return list[i];
      return null;
    };
    if (hit(QUIET)) return null;
    var e = hit(CELEBRATIONS) || (place ? hit(SEASONS) : null);
    return e ? { id: e.id, code: place ? place.code : 'GB' } : null;
  }

  function detect() {
    var forced = /[?&]season=([a-z-]+)/.exec(location.search);
    var id, code;
    if (forced) {
      // a preview of any season, live or not
      if (forced[1] === 'none' || IDS.indexOf(forced[1]) < 0) return null;
      id = forced[1];
      code = id === 'aussie-summer' || id === 'jacaranda' ? 'AU' : country();
    } else {
      var tz = '';
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (err) { /* old browser */ }
      var hit = pick(new Date(), tz);
      if (!hit) return null;
      id = hit.id; code = hit.code;
    }
    return { id: id, code: code, southern: code === 'AU', greeting: greeting(id, code) };
  }

  /* ---------- Road signs (intro-scenery.tsx) ---------- */
  var INK = '#064E3B', LEAF = '#16A34A', SUN = '#FACC15';
  var GLYPHS = {
    fuel: '<rect x="4" y="4" width="10" height="16" rx="1.5" fill="' + INK + '"/><rect x="6" y="6.5" width="6" height="4" rx=".8" fill="' + SUN + '"/><path d="M14 8h1.5a2 2 0 0 1 2 2v5.5a1.5 1.5 0 0 0 3 0V9l-2-2" stroke="' + INK + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
    shop: '<rect x="4.5" y="10" width="15" height="10" fill="' + INK + '"/><path d="M3 10 5 4.5h14L21 10Z" fill="' + SUN + '"/><rect x="10" y="13.5" width="4" height="6.5" fill="#FFFFFF"/>',
    cafe: '<path d="M4.5 9.5h11V14a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" fill="' + INK + '"/><path d="M15.5 10.5h1.5a2.5 2.5 0 0 1 0 5h-1.5" stroke="' + INK + '" stroke-width="1.8" fill="none"/><path d="M8 3.5c-1 1.2 1 2 0 3.5M12 3.5c-1 1.2 1 2 0 3.5" stroke="' + LEAF + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    gift: '<rect x="4" y="9" width="16" height="12" rx="1.5" fill="#DC2626"/><rect x="3" y="6.5" width="18" height="4" rx="1" fill="#B91C1C"/><rect x="10.8" y="6.5" width="2.4" height="14.5" fill="' + SUN + '"/><path d="M12 6.5C9 2 5.5 4 8 6.5M12 6.5c3-4.5 6.5-2.5 4 0" stroke="' + SUN + '" stroke-width="1.8" fill="none"/>',
    pumpkin: '<path d="M12 6c0-2 1-3 3-3.5" stroke="' + LEAF + '" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M12 6c-6-1-9 3-9 7.5S6 21 12 20c6 1 9-2 9-6.5S18 5 12 6Z" fill="#F97316"/><path d="M8 11l2 2.5H6ZM16 11l2 2.5h-4ZM7.5 16q4.5 3 9 0" stroke="#431407" stroke-width="1.2" fill="#431407"/>',
    candy: '<path d="M3 8l4 4-4 4ZM21 8l-4 4 4 4Z" fill="#A855F7"/><circle cx="12" cy="12" r="5.5" fill="#F97316"/><path d="M9 9.5l6 5M9.5 15l5-6" stroke="#FFFFFF" stroke-width="1.2"/>',
    ghost: '<path d="M5 21V11a7 7 0 0 1 14 0v10l-2.5-2-2.3 2-2.2-2-2.2 2-2.3-2Z" fill="#E5E7EB" stroke="' + INK + '" stroke-width="1.2"/><circle cx="9.5" cy="11" r="1.4" fill="' + INK + '"/><circle cx="14.5" cy="11" r="1.4" fill="' + INK + '"/>'
  };
  // how far up the road (0-1) and which side; seasonal stand-ins replace the glyphs
  var PLACES = [{ glyph: 'fuel', at: 0.12, side: 1 }, { glyph: 'shop', at: 0.3, side: -1 }, { glyph: 'cafe', at: 0.6, side: 1 }];
  var SEASON_PLACES = { festive: ['gift', 'gift', 'gift'], halloween: ['pumpkin', 'ghost', 'candy'] };
  var BADGE_R = 11, OFFSET = 24, POP = 0.1, STAY = 0.1, LEAVE = 0.14, DRIFT = 8;

  /** Sign groups for the intro SVG; `roadAt(t)` gives {x, y} for 0..1 up the road. */
  function signs(season, roadAt) {
    var glyphs = season && SEASON_PLACES[season.id];
    return PLACES.map(function (p, i) {
      var r = roadAt(p.at);
      var g = (glyphs && glyphs[i]) || p.glyph;
      return {
        at: p.at, x: r.x + p.side * OFFSET, y: r.y,
        svg: '<g class="i-sign" opacity="0"><circle cy="1.6" r="' + BADGE_R + '" fill="#011C14" opacity=".3"/><circle r="' + BADGE_R + '" fill="#FFFFFF"/>' +
          '<g transform="translate(-7.5 -7.5) scale(.625)">' + GLYPHS[g] + '</g></g>'
      };
    });
  }

  /** The sign's look at drive progress p (springy pop in, a stay, then shrink away). */
  function signState(at, p, drop) {
    var c = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var appear = c((p - (at - POP)) / POP), leave = c((p - (at + STAY)) / LEAVE);
    var b = appear - 1, pop = 1 + 2.7 * b * b * b + 1.7 * b * b;
    return {
      opacity: Math.min(1, appear * 3) * (1 - leave),
      dy: DRIFT * leave - (drop ? 28 * (1 - appear) : 0),
      scale: Math.max(0, 0.3 + 0.7 * pop) * (1 - 0.6 * leave)
    };
  }

  /* ---------- Hats (season/hats.tsx), drawn in hat units, brim at y = -345 ---------- */
  function corks(still) {
    return [-185, -120, 120, 185].map(function (x, i) {
      var a = i % 2 === 0 ? 1 : -1;
      var anim = still ? '' : '<animateTransform attributeName="transform" type="rotate" values="' + (-14 * a) + ' ' + x + ' -320;' + (14 * a) + ' ' + x + ' -320;' + (-14 * a) + ' ' + x + ' -320" dur="1.04s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>';
      return '<g><line x1="' + x + '" y1="-320" x2="' + x + '" y2="-200" stroke="#3F2A14" stroke-width="6"/><ellipse cx="' + x + '" cy="-182" rx="17" ry="26" fill="#D4A373" stroke="#B07D4F" stroke-width="5"/>' + anim + '</g>';
    }).join('');
  }
  function hatArt(id, still) {
    switch (id) {
      case 'festive':
        return '<path d="M-125,-330 C-110,-470 -40,-585 70,-600 C110,-560 120,-470 125,-330 Z" fill="#DC2626"/><path d="M-60,-345 C-50,-450 0,-540 70,-600" stroke="#B91C1C" stroke-width="18" fill="none"/><rect x="-150" y="-360" width="300" height="70" rx="35" fill="#FFFFFF"/><circle cx="92" cy="-600" r="44" fill="#FFFFFF"/>';
      case 'winter':
        return '<path d="M-130,-330 C-130,-520 130,-520 130,-330 Z" fill="#FACC15"/><rect x="-130" y="-420" width="260" height="22" fill="#064E3B" opacity=".85"/><rect x="-130" y="-470" width="260" height="22" fill="#064E3B" opacity=".85"/><rect x="-145" y="-365" width="290" height="70" rx="20" fill="#064E3B"/>' +
          [-110, -70, -30, 10, 50, 90].map(function (x) { return '<rect x="' + x + '" y="-358" width="14" height="56" rx="7" fill="#0B7A55"/>'; }).join('') + '<circle cx="0" cy="-530" r="46" fill="#FFFFFF"/>';
      case 'halloween':
        return '<ellipse cx="0" cy="-330" rx="200" ry="42" fill="#1E1B2E"/><path d="M-100,-345 C-80,-460 -30,-560 60,-630 C40,-560 70,-460 100,-345 Z" fill="#2E2A45"/><rect x="-104" y="-385" width="208" height="40" fill="#F97316"/><rect x="-24" y="-389" width="48" height="48" rx="6" fill="none" stroke="#FACC15" stroke-width="12"/>';
      case 'new-year':
        return '<path d="M-105,-330 L0,-570 L105,-330 Z" fill="#FACC15"/><path d="M-62,-420 L62,-420 M-32,-495 L32,-495" stroke="#DB2777" stroke-width="20" stroke-linecap="round"/><circle cx="-60" cy="-365" r="14" fill="#38BDF8"/><circle cx="0" cy="-365" r="14" fill="#DB2777"/><circle cx="60" cy="-365" r="14" fill="#FFFFFF"/><circle cx="0" cy="-578" r="34" fill="#DB2777"/><path d="M-28,-605 L-52,-628 M28,-605 L52,-628" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/>';
      case 'aussie-summer':
        return corks(still) + '<ellipse cx="0" cy="-330" rx="230" ry="46" fill="#8B5A2B"/><path d="M-115,-345 C-120,-500 120,-500 115,-345 Z" fill="#A16B3B"/><path d="M-40,-470 C-10,-445 10,-445 40,-470" stroke="#7A4A22" stroke-width="14" fill="none" stroke-linecap="round"/><rect x="-117" y="-385" width="234" height="36" fill="#5C3A1A"/>';
      case 'summer':
        return '<path d="M-150,-170 L150,-170" stroke="#0F172A" stroke-width="16" stroke-linecap="round"/><rect x="-150" y="-180" width="120" height="78" rx="34" fill="#0F172A"/><rect x="30" y="-180" width="120" height="78" rx="34" fill="#0F172A"/><path d="M-125,-160 L-95,-160 M55,-160 L85,-160" stroke="#FFFFFF" stroke-width="10" stroke-opacity=".7" stroke-linecap="round"/>';
      case 'jacaranda':
        return [0, 60, 120, 180, 240, 300].map(function (a, i) { var r = a * Math.PI / 180; return '<g transform="translate(' + (Math.sin(r) * 56).toFixed(1) + ' ' + (-470 - Math.cos(r) * 56).toFixed(1) + ') rotate(' + a + ')"><path d="M0,-52 C34,-52 44,-14 30,18 L0,62 L-30,18 C-44,-14 -34,-52 0,-52 Z" fill="' + (i % 2 ? '#8B6BD9' : '#A78BFA') + '"/><ellipse cx="0" cy="-40" rx="20" ry="11" fill="#EDE4FE"/></g>'; }).join('') +
          '<circle cx="0" cy="-470" r="26" fill="#F5F3FF"/><circle cx="0" cy="-470" r="11" fill="#FACC15"/><path d="M0,-410 L0,-380" stroke="#15803D" stroke-width="14" stroke-linecap="round"/>';
      case 'spring':
        return [0, 72, 144, 216, 288].map(function (a) { var r = a * Math.PI / 180; return '<circle cx="' + (Math.sin(r) * 52).toFixed(1) + '" cy="' + (-470 - Math.cos(r) * 52).toFixed(1) + '" r="46" fill="#F9A8D4"/>'; }).join('') +
          '<circle cx="0" cy="-470" r="34" fill="#FACC15"/><path d="M0,-420 L0,-380" stroke="#15803D" stroke-width="14" stroke-linecap="round"/>';
    }
    return '';
  }
  /** The hat on the gold dot at the top of the road (51, 28), in mark units; '' when the season has none. */
  function hat(id, still) {
    var art = hatArt(id, still);
    if (!art) return '';
    if (id === 'summer') {
      return '<g class="i-hat" transform="translate(51 28) scale(.046) translate(0 132)"><g transform="translate(0 -170) scale(1.3) translate(0 170)">' + art + '</g></g>';
    }
    return '<g class="i-hat" transform="translate(51 21.6) scale(.04) translate(0 345)"><g transform="translate(0 -360) scale(1.45) translate(0 360)">' + art + '</g></g>';
  }

  /** Autumn turns the leaves gold and orange. */
  function palette(id) {
    return id === 'autumn' ? { light: '#FDE68A', deep: '#EA580C', shadow: '#9A3412' } : { light: '#77E8A0', deep: '#24B359', shadow: '#085E42' };
  }

  /* ---------- Riders (season/rider.tsx): stand-ins for the car ---------- */
  function reindeer(x) {
    return '<ellipse cx="' + x + '" cy="30" rx="11" ry="6" fill="#92400E"/><line x1="' + (x - 7) + '" y1="34" x2="' + (x - 10) + '" y2="44" stroke="#78350F" stroke-width="2.4" stroke-linecap="round"/><line x1="' + (x + 6) + '" y1="34" x2="' + (x + 10) + '" y2="44" stroke="#78350F" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M' + (x + 8) + ' 27 L' + (x + 13) + ' 19" stroke="#92400E" stroke-width="4" stroke-linecap="round"/><ellipse cx="' + (x + 15) + '" cy="17" rx="5" ry="3.6" fill="#92400E"/>' +
      '<path d="M' + (x + 12) + ' 14 l-2 -7 m1 3 l-4 -2 M' + (x + 15) + ' 13 l2 -7 m-1 3 l4 -2" stroke="#FDE68A" stroke-width="1.6" stroke-linecap="round" fill="none"/>' +
      '<circle cx="' + (x + 20) + '" cy="17" r="1.4" fill="#451A03"/>'; // every nose brown (a red one is the Rudolph trade mark)
  }
  var RIDERS = {
    festive: {
      w: 92, h: 46, tilt: -40, takeOff: true, reach: 1,
      art: '<path d="M26 22 C40 18 52 26 62 24 M26 22 C44 26 66 28 84 22" stroke="#FACC15" stroke-width="1.4" fill="none"/>' + reindeer(52) + reindeer(72) +
        '<rect x="6" y="10" width="14" height="14" rx="3" fill="#FACC15"/><rect x="12" y="6" width="10" height="10" rx="2" fill="#38BDF8"/><path d="M2 18 H28 C30 18 30 30 24 32 H8 C3 32 2 26 2 18 Z" fill="#DC2626"/>' +
        '<path d="M0 38 H26 C30 38 32 35 33 33" stroke="#FACC15" stroke-width="2.6" fill="none" stroke-linecap="round"/><line x1="8" y1="32" x2="8" y2="38" stroke="#FACC15" stroke-width="2"/><line x1="22" y1="32" x2="22" y2="38" stroke="#FACC15" stroke-width="2"/>'
    },
    halloween: {
      w: 30, h: 30, tilt: 0, takeOff: false, reach: 0.93,
      art: '<path d="M15 4 C16 1 19 1 20 2" stroke="#15803D" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="15" cy="17" rx="13" ry="11" fill="#F97316" stroke="#FFFFFF" stroke-width="2"/><path d="M9 12 l3 4 h-6 Z M21 12 l3 4 h-6 Z" fill="#431407"/><path d="M8 20 Q15 26 22 20 L19 21 L17 19 L15 21 L13 19 L11 21 Z" fill="#431407"/>'
    }
  };
  /** The app's logo is 120 pt wide = 100 mark units. */
  var PT = 100 / 120;
  function rider(id) {
    var r = RIDERS[id];
    if (!r) return null;
    return {
      reach: r.reach,
      svg: '<g class="i-rider"><g transform="scale(' + PT.toFixed(4) + ') rotate(' + r.tilt + ') translate(' + (-r.w / 2) + ' ' + (-r.h / 2) + ')">' + r.art + '</g></g>',
      /** {x, y} offset (mark units) for the sleigh's take-off at drive progress p. */
      soar: function (p) {
        if (!r.takeOff) return { x: 0, y: 0 };
        var lift = Math.max(0, (p - 0.6) / 0.4), s = lift * lift * 110 * PT;
        return { x: s * 0.75, y: -s };
      }
    };
  }

  /* ---------- The backdrop (season/ambient.tsx), as CSS-animated pieces ---------- */
  var seed = function (i, n) { var x = Math.sin(i * 97.13 + n * 13.7) * 10000; return x - Math.floor(x); };
  var FALL = {
    snow: ['#FFFFFF', '#E0F2FE'], leaves: ['#F59E0B', '#EA580C', '#FACC15', '#B45309'],
    petals: ['#F9A8D4', '#FBCFE8', '#FFFFFF'], stars: ['#FACC15', '#FFFFFF']
  };
  function piece(kind, color, size) {
    if (kind === 'snow') return '<i class="fx-dot" style="width:' + size + 'px;height:' + size + 'px;background:' + color + '"></i>';
    var inner = kind === 'stars' ? '<path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z" fill="' + color + '"/>'
      : kind === 'leaves' ? '<path d="M12 2C6 6 4 12 6 18c2 3 6 4 10 2 4-4 4-11-4-18Z" fill="' + color + '"/><path d="M12 4c-1 6-2 11-6 16" stroke="#7C2D12" stroke-opacity=".5" stroke-width="1.4" fill="none"/>'
      : '<ellipse cx="12" cy="12" rx="7" ry="10" fill="' + color + '"/>';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24">' + inner + '</svg>';
  }
  function falling(kind, count) {
    var out = '';
    for (var i = 0; i < count; i++) {
      var dur = (kind === 'snow' ? 4.2 : 3.6) + seed(i, 2) * 2.6;
      var size = Math.round(kind === 'snow' ? 4 + seed(i, 4) * 6 : 10 + seed(i, 4) * 8);
      out += '<span class="fx-fall' + (kind === 'stars' ? ' fx-twinkle' : '') + '" style="left:' + (seed(i, 1) * 100).toFixed(1) + '%;animation-duration:' + dur.toFixed(2) + 's;animation-delay:' + (-seed(i, 6) * dur).toFixed(2) + 's">' +
        '<span class="fx-sway" style="--sway:' + (14 + seed(i, 3) * 24).toFixed(0) + 'px;--spin:' + ((seed(i, 5) - 0.5) * 720).toFixed(0) + 'deg;animation-duration:' + (dur / 2).toFixed(2) + 's">' +
        piece(kind, FALL[kind][i % FALL[kind].length], size) + '</span></span>';
    }
    return out;
  }
  function bats() {
    var out = '';
    for (var i = 0; i < 5; i++) {
      out += '<span class="fx-bat' + (i % 2 ? ' fx-rtl' : '') + '" style="top:' + (12 + seed(i, 1) * 30).toFixed(1) + '%;animation-duration:' + (3.2 + seed(i, 3) * 1.6).toFixed(2) + 's;animation-delay:' + (seed(i, 2) * 0.9).toFixed(2) + 's">' +
        '<span class="fx-bob"><svg class="fx-flap" width="44" height="22" viewBox="0 0 48 24"><path d="M24 8C22 4 20 4 19 7 15 3 9 2 2 6c5 2 7 6 7 10 4-3 8-3 11 0 1-3 3-4 4-4s3 1 4 4c3-3 7-3 11 0 0-4 2-8 7-10-7-4-13-3-17 1-1-3-3-3-5 1Z" fill="#1E1B2E"/><circle cx="22" cy="10" r="1" fill="#FACC15"/><circle cx="26" cy="10" r="1" fill="#FACC15"/></svg></span></span>';
    }
    return out;
  }
  function fireworks() {
    var colors = ['#FACC15', '#F472B6', '#38BDF8', '#FFFFFF', '#4ADE80'], out = '';
    for (var i = 0; i < 6; i++) {
      var radius = 60 + seed(i, 3) * 50;
      out += '<span class="fx-burst" style="left:' + (15 + seed(i, 1) * 70).toFixed(1) + '%;top:' + (10 + seed(i, 2) * 30).toFixed(1) + '%">';
      for (var s = 0; s < 16; s++) {
        var a = s / 16 * Math.PI * 2;
        out += '<i class="fx-spark" style="background:' + colors[i % colors.length] + ';--dx:' + (Math.cos(a) * radius).toFixed(0) + 'px;--dy:' + (Math.sin(a) * radius).toFixed(0) + 'px;animation-delay:' + (i * 0.42).toFixed(2) + 's"></i>';
      }
      out += '</span>';
    }
    return out;
  }
  function sun() {
    var rays = '';
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2;
      rays += '<line x1="' + (50 + Math.cos(a) * 30).toFixed(1) + '" y1="' + (50 + Math.sin(a) * 30).toFixed(1) + '" x2="' + (50 + Math.cos(a) * 44).toFixed(1) + '" y2="' + (50 + Math.sin(a) * 44).toFixed(1) + '"/>';
    }
    return '<svg class="fx-sun" width="150" height="150" viewBox="0 0 100 100"><g class="fx-rays" stroke="#FDE047" stroke-width="4" stroke-linecap="round" opacity=".8">' + rays + '</g><circle cx="50" cy="50" r="22" fill="#FACC15"/></svg>';
  }
  var KANGAROO = 'M6 44c6-1 11-4 15-9 3-6 6-12 14-14 4-1 6-4 7-8l2-5 2 5c3 0 6 2 7 5l-4 1c-2 3-4 7-6 11-2 4-3 8-1 14l6 3H38l-4-6c-4 0-8 2-10 4l-4 2h-8c-2-2-4-2-6-3Z';
  function runner(kind, i, bottom, dur, small) {
    var k = small ? 1.2 : 1.6;
    var art = kind === 'kangaroo'
      ? '<svg width="' + 64 * k + '" height="' + 48 * k + '" viewBox="0 0 64 48"><path d="' + KANGAROO + '" fill="#7C2D12"/><path d="M22 34C14 38 8 42 1 46" stroke="#7C2D12" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="48" cy="11" r="1.3" fill="#FFFFFF"/></svg>'
      : '<svg width="' + 48 * k + '" height="' + 64 * k + '" viewBox="0 0 48 64"><ellipse cx="20" cy="30" rx="16" ry="11" fill="#3F2A1D"/><path d="M30 26C34 18 35 12 36 6" stroke="#57534E" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="37" cy="6" r="4" fill="#57534E"/><path d="M40 6l6 1-6 2Z" fill="#A8A29E"/><line x1="17" y1="40" x2="13" y2="62" stroke="#57534E" stroke-width="3" stroke-linecap="round"/><line x1="24" y1="40" x2="29" y2="62" stroke="#57534E" stroke-width="3" stroke-linecap="round"/></svg>';
    var hops = kind === 'kangaroo' ? 5 : 14;
    return '<span class="fx-run" style="bottom:' + bottom + 'px;animation-duration:' + dur + 's;animation-delay:' + (i * 0.5) + 's">' +
      '<span class="fx-' + kind + '" style="animation-duration:' + (dur / hops).toFixed(3) + 's">' + art + '</span></span>';
  }
  function outback() {
    return sun() + '<span class="fx-ground"></span>' + runner('kangaroo', 0, 70, 3.4) + runner('kangaroo', 1, 50, 4.0, true) + runner('emu', 2, 60, 2.4);
  }
  /* ---------- Redrawn: northern autumn and the Australian jacaranda spring ----------
     Layered like a painted backdrop: a warm haze, far and near hills (or the jacaranda trees), and
     pieces falling at three depths (small and slow far back, big and fluttering up close).
     Only CSS transforms move; with Reduce Motion everything holds still mid-fall. */
  function layer(depth, n, make) {
    var D = { far: { size: [9, 13], dur: [8, 11], sway: [8, 16] }, mid: { size: [15, 21], dur: [5.6, 7.4], sway: [16, 30] }, near: { size: [26, 36], dur: [4.2, 5.4], sway: [26, 44] } }[depth];
    var k = { far: 3, mid: 7, near: 11 }[depth], out = '';
    for (var i = 0; i < n; i++) {
      var r = function (j) { return seed(i + k * 31, j + k); };
      var dur = D.dur[0] + r(2) * (D.dur[1] - D.dur[0]);
      var size = Math.round(D.size[0] + r(4) * (D.size[1] - D.size[0]));
      out += '<span class="fx-fall" style="left:' + (r(1) * 100).toFixed(1) + '%;animation-duration:' + dur.toFixed(2) + 's;animation-delay:' + (-r(6) * dur).toFixed(2) + 's">' +
        '<span class="fx-sway" style="--sway:' + (D.sway[0] + r(3) * (D.sway[1] - D.sway[0])).toFixed(0) + 'px;--spin:' + ((r(5) - 0.5) * 300).toFixed(0) + 'deg;animation-duration:' + (dur / 2.4).toFixed(2) + 's">' +
        '<span class="fx-flip" style="animation-duration:' + (1.4 + r(7) * 1.4).toFixed(2) + 's;animation-delay:' + (-r(8) * 2).toFixed(2) + 's">' + make(i + k, size) + '</span></span></span>';
    }
    return '<div class="fx-layer fx-' + depth + '">' + out + '</div>';
  }
  /** A gradient per colour, shared by every piece (light at the top left, deep at the bottom right). */
  function tints(name, pairs) {
    return '<svg class="fx-defs" width="0" height="0" aria-hidden="true"><defs>' + pairs.map(function (c, i) {
      return '<linearGradient id="' + name + i + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient>';
    }).join('') + '</defs></svg>';
  }
  /** A ridge line across a 400-wide box: gentle overlapping waves. */
  function ridge(base, a, f, ph) {
    return function (x) { return base + a * Math.sin(x * f + ph) + a * 0.45 * Math.sin(x * f * 2.3 + ph * 1.7); };
  }
  function ridgePath(y, W) {
    var d = 'M-10 ' + y(-10).toFixed(1);
    for (var x = 0; x <= W + 10; x += 10) d += ' L' + x + ' ' + y(x).toFixed(1);
    return d + ' L' + (W + 10) + ' 140 L-10 140Z';
  }
  /** The landscape's width in its own units: 140 tall, as wide as the screen's shape asks (never under 400). */
  function landWidth() {
    var w = 390, h = 844;
    try { w = window.innerWidth || w; h = window.innerHeight || h; } catch (err) { /* defaults */ }
    var px = Math.min(220, Math.max(110, h * 0.21));
    return Math.max(400, Math.round(140 * w / px));
  }

  var LEAF_SHAPES = {
    maple: 'M12 1.2l1.7 3.9 2.7-1.3-.6 4.3 3.7-1.8-1 2.9 3.4.8-2.8 2.6 1 1.8-4.4-.3.4 2.6-3.2-1.7L12 19l-.9-3.9-3.2 1.7.4-2.6-4.4.3 1-1.8-2.8-2.6 3.4-.8-1-2.9 3.7 1.8-.6-4.3 2.7 1.3Z',
    oak: 'M12 1.6c1.7.9 1 2.7 2.5 3.2 1.6.5 2.3-.9 3.1.4.8 1.3-1 2.3-.2 3.3.9 1.1 2.5.1 2.7 1.6.2 1.6-1.9 1.9-1.5 3.1.4 1.3 2.1.9 1.6 2.4-.5 1.6-3.1.6-4.3 1.6-1 .9-.6 2.6-1.9 2.8h-4c-1.3-.2-.9-1.9-1.9-2.8-1.2-1-3.8 0-4.3-1.6-.5-1.5 1.2-1.1 1.6-2.4.4-1.2-1.7-1.5-1.5-3.1.2-1.5 1.8-.5 2.7-1.6.8-1-1-2-.2-3.3.8-1.3 1.5.1 3.1-.4C11 4.3 10.3 2.5 12 1.6Z',
    beech: 'M12 1.5C7 5.5 5.4 10.6 6.8 15.4c1 3.2 2.9 5.3 5.2 6.4 2.3-1.1 4.2-3.2 5.2-6.4 1.4-4.8-.2-9.9-5.2-13.9Z'
  };
  var LEAF_VEINS = {
    maple: 'M12 19v4M12 18.5V5.5M12 13l-5-4M12 13l5-4M12 15.5l-4.5 1M12 15.5l4.5 1',
    oak: 'M12 22V3.5M12 8l-3-1.5M12 8l3-1.5M12 12l-4-1.5M12 12l4-1.5M12 16l-4 0M12 16l4 0',
    beech: 'M12 22.5V3.5M12 9l-3-2M12 9l3-2M12 13l-3.6-2.2M12 13l3.6-2.2M12 17l-3.4-2M12 17l3.4-2'
  };
  var AUTUMN = [['#FDE68A', '#F59E0B'], ['#FDBA74', '#EA580C'], ['#FCA5A5', '#DC2626'], ['#FCD34D', '#B45309'], ['#FB923C', '#9A3412'], ['#FEF08A', '#CA8A04'], ['#F87171', '#991B1B']];
  function leafPiece(i, size) {
    var shape = ['maple', 'oak', 'maple', 'beech'][i % 4];
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><path d="' + LEAF_SHAPES[shape] + '" fill="url(#fx-al' + (i * 3 % AUTUMN.length) + ')"/>' +
      '<path d="' + LEAF_VEINS[shape] + '" stroke="#7C2D12" stroke-opacity=".45" stroke-width=".8" fill="none" stroke-linecap="round"/></svg>';
  }
  /** Trees along a ridge: each crown a cluster of soft blobs, deep underneath and lit on top, in turning colours. */
  function trees(y, from, step, size, colors, trunk, k, W) {
    var out = '';
    for (var x = from, i = 0; x < W + 20; x += step * (0.7 + seed(i, k) * 0.6), i++) {
      var r = size * (0.7 + seed(i, k + 1) * 0.6), base = y(x) + 2, c = colors[Math.floor(seed(i, k + 2) * colors.length)];
      var cy = base - r * 1.25, tall = 0.9 + seed(i, k + 5) * 0.5;
      var g = '<path d="M' + x.toFixed(1) + ' ' + (base + 3).toFixed(1) + 'V' + (cy + r * 0.2).toFixed(1) + 'M' + x.toFixed(1) + ' ' + (cy + r * 0.55).toFixed(1) + 'l' + (r * 0.35).toFixed(1) + ' ' + (-r * 0.4).toFixed(1) + '" stroke="' + trunk + '" stroke-width="' + (r * 0.13).toFixed(2) + '" stroke-linecap="round"/>';
      // three passes: the shaded underside, the body, the sunlit top
      [[c[2], 0.25, 9], [c[1], 0, 11], [c[0], -0.3, 7]].forEach(function (pass, j) {
        for (var n = 0; n < pass[2]; n++) {
          var a = seed(i * 13 + n, k + 7 + j) * Math.PI * 2, d = Math.sqrt(seed(i * 13 + n, k + 9 + j));
          var bx = x + Math.cos(a) * r * 0.62 * d, by = cy + Math.sin(a) * r * 0.55 * tall * d + pass[1] * r;
          g += '<circle cx="' + bx.toFixed(1) + '" cy="' + by.toFixed(1) + '" r="' + (r * (0.26 + seed(i * 13 + n, k + 11 + j) * 0.2)).toFixed(1) + '" fill="' + pass[0] + '"/>';
        }
      });
      out += g;
    }
    return out;
  }
  function autumn() {
    var W = landWidth(), back = ridge(66, 6, 0.014, 2.6), far = ridge(84, 7, 0.018, 0.6), near = ridge(108, 6, 0.024, 2.1);
    var litter = '';
    for (var i = 0, n = Math.round(60 * W / 400); i < n; i++) {
      var c = AUTUMN[i % AUTUMN.length][1], lx = (seed(i, 21) * W).toFixed(1), ly = (127 + seed(i, 22) * 13).toFixed(1);
      litter += '<ellipse cx="' + lx + '" cy="' + ly + '" rx="' + (1.6 + seed(i, 23) * 2.2).toFixed(1) + '" ry="1.1" fill="' + c + '" opacity="' + (0.7 + seed(i, 25) * 0.3).toFixed(2) + '" transform="rotate(' + ((seed(i, 24) - 0.5) * 60).toFixed(0) + ' ' + lx + ' ' + ly + ')"/>';
    }
    var FAR = [['#E7A35A', '#C97A35', '#9C5A2A'], ['#E58A55', '#C4643A', '#93452B'], ['#D9B25A', '#B38A3A', '#86662A'], ['#C9705A', '#A2513F', '#7A3A2E'], ['#9DB05A', '#7C8F3F', '#5C6B2E']];
    var NEAR = [['#FCD34D', '#F59E0B', '#B45309'], ['#FDBA74', '#F97316', '#C2410C'], ['#FCA5A5', '#EF4444', '#991B1B'], ['#FDE68A', '#EAB308', '#A16207'], ['#FB923C', '#EA580C', '#9A3412']];
    return tints('fx-al', AUTUMN) +
      '<span class="fx-sunglow"></span><span class="fx-sun-disc"></span>' + layer('far', 18, leafPiece) +
      '<svg class="fx-land" viewBox="0 0 ' + W + ' 140" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>' +
        '<linearGradient id="fx-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDE7C7" stop-opacity="0"/><stop offset="1" stop-color="#FDE7C7" stop-opacity=".28"/></linearGradient>' +
        '<linearGradient id="fx-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A5A41"/><stop offset="1" stop-color="#04382A"/></linearGradient></defs>' +
        '<g opacity=".6"><path d="' + ridgePath(back, W) + '" fill="#2E8A62"/>' + trees(back, -4, 16, 5, [['#E9C08A', '#D9A066', '#B9855A'], ['#E3A684', '#CC8A6A', '#A86E58']], '#6B5A4A', 20, W) + '</g>' +
        '<rect x="-10" y="44" width="' + (W + 20) + '" height="44" fill="url(#fx-mist)"/>' +
        '<path d="' + ridgePath(far, W) + '" fill="#0E6A4C"/>' + trees(far, -6, 13, 7, FAR, '#3F2A1D', 30, W) +
        '<rect x="-10" y="70" width="' + (W + 20) + '" height="44" fill="url(#fx-mist)"/>' +
        '<path d="' + ridgePath(near, W) + '" fill="url(#fx-ground)"/>' + trees(near, 6, 40, 13.5, NEAR, '#3B2618', 40, W) +
        litter + '</svg>' +
      layer('mid', 16, leafPiece) + layer('near', 8, leafPiece);
  }

  var JAC = [['#C4B5FD', '#8B5CF6'], ['#DDD6FE', '#A78BFA'], ['#A78BFA', '#7C3AED'], ['#E9D5FF', '#9F7AEA']];
  function floretPiece(i, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><path d="M10.6 22c-.4-3 .1-6.2 1-9.3" stroke="#6D28D9" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M11.6 13.2C9.8 11.4 7.6 8.6 7.4 5.6 6.6 4.8 6.8 3.3 8 3c.7-1 2.2-1.2 3-.4.9-.8 2.4-.7 3.1.2 1.2-.1 2.2 1 1.8 2.2.5 1.1-.2 2.4-1.3 2.6-.6 2.3-1.6 4.1-3 5.6Z" fill="url(#fx-jl' + (i % JAC.length) + ')"/>' +
      '<path d="M9 4.4c.9.7 2 .9 3 .9s2.2-.3 3-.9" stroke="#F5F3FF" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".85"/><circle cx="12" cy="6.2" r=".8" fill="#FDE68A"/></svg>';
  }
  /** A jacaranda: a dark leaning trunk, branches fanning out, and an airy dome of purple blooms. */
  function jacTree(side) {
    var out = '<path d="M62 98 C70 82 86 70 104 62 M62 98 C56 80 44 66 30 58 M84 74 C96 56 114 46 132 42 M70 86 C72 64 78 46 88 34" stroke="#3B2618" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<path d="M46 172 C44 140 52 118 62 98" stroke="#3B2618" stroke-width="11" stroke-linecap="round" fill="none"/>';
    var tones = ['#4C1D95', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD'];
    // clumps: the canopy is a few rounded masses, each filled with small blooms
    var clumps = [[40, 62, 30, 20], [78, 44, 38, 26], [120, 52, 36, 22], [150, 70, 24, 15], [96, 72, 40, 16], [22, 78, 20, 12]];
    clumps.forEach(function (c, ci) {
      for (var i = 0; i < 95; i++) {
        var a = seed(i + ci * 101, 51) * Math.PI * 2, rr = Math.sqrt(seed(i + ci * 101, 52));
        var x = c[0] + Math.cos(a) * c[2] * rr, y = c[1] + Math.sin(a) * c[3] * rr;
        var lit = (c[1] - y) / c[3]; // -1 underneath .. 1 on top
        var tone = Math.min(tones.length - 1, Math.max(0, Math.round(2.4 + lit * 2.2 + (seed(i + ci * 101, 53) - 0.5) * 1.6)));
        out += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (2.2 + seed(i + ci * 101, 54) * 3.6).toFixed(1) + '" fill="' + tones[tone] + '" opacity="' + (0.82 + seed(i + ci * 101, 55) * 0.18).toFixed(2) + '"/>';
      }
    });
    // a few fresh green fronds showing through, as on a real jacaranda
    for (var j = 0; j < 14; j++) {
      var fx = 20 + seed(j, 61) * 140, fy = 50 + seed(j, 62) * 34;
      out += '<path d="M' + fx.toFixed(1) + ' ' + fy.toFixed(1) + 'q4 -3 9 -2" stroke="#2F9E5E" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".7"/>';
    }
    return '<svg class="fx-jac fx-jac-' + side + '" viewBox="0 0 170 172" aria-hidden="true"><g class="fx-canopy">' + out + '</g></svg>';
  }
  function jacaranda() {
    var carpet = '';
    for (var i = 0; i < 140; i++) {
      carpet += '<ellipse cx="' + (seed(i, 71) * 400).toFixed(1) + '" cy="' + (21 + seed(i, 72) * 18).toFixed(1) + '" rx="' + (1.6 + seed(i, 73) * 2.2).toFixed(1) + '" ry="1.2" fill="' + JAC[i % JAC.length][1] + '" opacity="' + (0.6 + seed(i, 74) * 0.4).toFixed(2) + '"/>';
    }
    return tints('fx-jl', JAC) + '<span class="fx-haze fx-haze-lilac"></span>' + layer('far', 22, floretPiece) +
      '<svg class="fx-carpet" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fx-lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A5A41"/><stop offset="1" stop-color="#05382A"/></linearGradient></defs><path d="M-10 24 Q200 12 410 24 L410 40 L-10 40Z" fill="url(#fx-lawn)"/>' + carpet + '</svg>' +
      jacTree('l') + jacTree('r') + layer('mid', 20, floretPiece) + layer('near', 10, floretPiece);
  }

  /** The backdrop's HTML for `season` (snow, leaves, petals, bats, fireworks, sun or the outback). */
  function ambient(season) {
    switch (season.id) {
      case 'festive': return season.southern ? falling('stars', 18) : falling('snow', 40);
      case 'winter': return falling('snow', 40);
      case 'autumn': return autumn();
      case 'jacaranda': return jacaranda();
      case 'spring': return falling('petals', 22);
      case 'halloween': return bats();
      case 'new-year': return fireworks();
      case 'summer': return sun();
      case 'aussie-summer': return outback();
    }
    return '';
  }

  window.MSSeason = {
    detect: detect, signs: signs, signState: signState, hat: hat, palette: palette, rider: rider, ambient: ambient,
    /** The visitor's country from the time zone, then the language: 'GB', 'US', 'CA' or 'AU' (the calculator uses it too). */
    country: country,
    /** Exposed for tests: the app's date rules, and the calendar picker. */
    seasonId: seasonId, pick: pick, covers: covers
  };
})();
