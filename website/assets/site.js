/* MileSprout website: the hero scene, the money line and calculator, the feature deck and the
   waitlist (and founding testers) form. Vanilla JS, no libraries. Its only requests: the hero clip,
   the form posting to /api/waitlist, and Cloudflare Turnstile once a whole email is typed.
   The page works without it: the hero is a still picture and every feature is listed. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function still() { return reduce.matches; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- Home intro: the app's first-run opening (milemint/src/components/launch-intro.tsx, FullIntro) ----------
     Only when intro-gate.js has put up its cover (first visit this session). The seed wakes, the road
     grows up as the stem past the road signs, the leaves unfold, and, as in the app, an example month's
     money and miles count up with the drive; then "A year of this is worth …" counts up and lands.
     In a season (season.js) the sprout dresses up and the backdrop changes. About 3.5 s (the year holds ~0.9 s), then the
     sprout flies to the header logo. Tap, click, a key or scrolling ends it. With Reduce Motion it's a
     still: the grown sprout and the final figures, faded away after 2 s. The overlay is aria-hidden;
     the figures are read out once through a polite status line.
     Everything is drawn from one clock in requestAnimationFrame, so a skip or an error just ends it. */
  var SEASON = null;
  try { SEASON = window.MSSeason ? window.MSSeason.detect() : null; } catch (err) { SEASON = null; }

  /* The app's own rates (milemint/src/domain/regions.ts, the current rate periods; rates in tenths of a
     penny or cent, as there). The example is the page's one example, shared with the hero's money line and
     the calculator's starting point: 100 miles (160 km) a week for 48 weeks, so a month is 400 miles or
     640 km. (The app's intro uses 650 km; on the page a second Canadian figure would show beside the
     calculator's, so the page keeps one.) A year of it: £2,640, US $3,648, CA $5,446 (allowance rate,
     "about"), AU $4,550; rates checked in research_notes/launch-2026/website-claims-check.md. */
  var APP_REGIONS = {
    GB: { cur: 'GBP', locale: 'en-GB', unit: 'mi', tiers: [[10000, 550], [null, 250]], authority: 'HMRC' },
    US: { cur: 'USD', locale: 'en-US', unit: 'mi', tiers: [[null, 760]], authority: 'the IRS' },
    CA: { cur: 'CAD', locale: 'en-CA', unit: 'km', tiers: [[5000, 730], [null, 670]], authority: 'the CRA' },
    AU: { cur: 'AUD', locale: 'en-AU', unit: 'km', tiers: [[5000, 910], [null, 0]], authority: 'the ATO' }
  };
  var WEEKS = 48, EXAMPLE_WEEK = { mi: 100, km: 160 };
  var DEMO_MONTH = { mi: EXAMPLE_WEEK.mi * WEEKS / 12, km: EXAMPLE_WEEK.km * WEEKS / 12 };
  /** The visitor's country: ?country=CA previews one, else season.js (time zone, then language). */
  function visitorCountry() {
    var c = 'GB';
    try { c = window.MSCountry ? window.MSCountry.country() : 'GB'; } catch (err) { c = 'GB'; } // intro-gate.js: ?country=, time zone, language
    return c === 'UK' ? 'GB' : APP_REGIONS[c] ? c : 'GB';
  }
  /** wholeMoney() in the app: minor units to a whole amount ("£220", "$5,446"). */
  function wholeMoney(minor, r) {
    var n = Math.round(minor / 100);
    try { return new Intl.NumberFormat(r.locale, { style: 'currency', currency: r.cur, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(n); }
    catch (err) { return (r.cur === 'GBP' ? '£' : '$') + n.toLocaleString('en'); }
  }
  /** exampleYearOf() in the app: twelve example months, each tier at its rate, in minor units. */
  function exampleYear(r) {
    var left = DEMO_MONTH[r.unit] * 12, total = 0;
    for (var i = 0; i < r.tiers.length && left > 0; i++) {
      var room = r.tiers[i][0] === null ? left : Math.min(left, r.tiers[i][0]);
      total += room * r.tiers[i][1] / 10;
      left -= room;
    }
    return Math.round(total);
  }
  /** The intro's lines, word for word from the app (English). */
  function introLines(r) {
    var year = wholeMoney(exampleYear(r), r);
    return {
      unitWord: r.unit === 'mi' ? 'miles' : 'km',
      month: ' · an example month of part-time work driving',
      year: r.authority === 'the CRA'
        ? ['A year of this is worth about ', year, '\u00a0at ' + r.authority + '’s allowance rate.']
        : ['A year of this is worth ', year, '\u00a0at ' + r.authority + '’s rate.']
    };
  }

  (function intro() {
    var root = document.documentElement;
    if (!root.classList.contains('ms-intro')) return;
    var overlay = null, live = null;
    function cleanup() {
      var was = root.classList.contains('ms-intro') || !!overlay;
      root.classList.remove('ms-intro');
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
      // the hero clip waits for this (it doesn't play under the intro)
      if (was) { try { window.dispatchEvent(new Event('ms-intro-end')); } catch (err) { /* old browser */ } }
    }
    try {
      try { window.sessionStorage.setItem('ms-intro-seen', '1'); } catch (err) { /* fine */ }
      var calm = still();
      var S = window.MSSeason, season = S ? SEASON : null;
      var R = APP_REGIONS[visitorCountry()], lines = introLines(R);
      var monthUnits = DEMO_MONTH[R.unit], perUnit = R.tiers[0][1] / 10;
      var fmtUnits = function (n) { try { return new Intl.NumberFormat(R.locale).format(n); } catch (err) { return String(n); } };
      var monthMoney = function (f) { return wholeMoney(Math.round(f * monthUnits) * perUnit, R); };
      var yearMinor = exampleYear(R);
      // a number that counts in a box sized to its final value, so nothing around it moves
      var counter = function (cls, finalText, startText) {
        return '<span class="ct ' + cls + '"><span class="ct-ghost">' + finalText + '</span><span class="ct-live">' + (calm ? finalText : startText) + '</span></span>';
      };

      var ROAD = 'M50 87 C50 78 38 74 40 64 C42 55 54 54 54 44 C54 37 50 35 51 30';
      var LOW = 'M47 54 C37 55 20 48 14 34 C27 32 41 39 47 54Z';
      var UP = 'M52 31 C56 19 70 11 86 11 C85 25 70 34 52 31Z';
      var pal = S ? S.palette(season && season.id) : { light: '#77E8A0', deep: '#24B359', shadow: '#085E42' };
      var rider = season && S && !calm ? S.rider(season.id) : null;
      overlay = document.createElement('div');
      overlay.className = 'sprout-intro' + (season ? ' season-' + season.id : '') + (calm ? ' is-still' : '');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML =
        '<div class="intro-bg"></div>' +
        (season ? '<div class="season-fx">' + S.ambient(season) + '</div>' : '') +
        '<div class="intro-stage"><svg class="intro-art" viewBox="12 9 77 84" fill="none">' +
          '<defs><linearGradient id="ms-intro-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal.light + '"/><stop offset="1" stop-color="' + pal.deep + '"/></linearGradient>' +
          '<mask id="ms-intro-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><path class="i-mask" d="' + ROAD + '" stroke="#FFF" stroke-width="10" stroke-linecap="round" fill="none"/></mask></defs>' +
          '<path class="i-soil" d="M30 88 Q50 84 70 88" stroke="#064E3B" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>' +
          '<g class="i-signs"></g>' +
          '<g class="i-leaf i-low"><path d="' + LOW + '" fill="' + pal.shadow + '" opacity=".5" transform="translate(1.2 1.6)"/><path d="' + LOW + '" fill="url(#ms-intro-leaf)"/></g>' +
          '<g class="i-leaf i-up"><path d="' + UP + '" fill="' + pal.shadow + '" opacity=".5" transform="translate(1.2 1.6)"/><path d="' + UP + '" fill="url(#ms-intro-leaf)"/></g>' +
          '<path class="i-road" d="' + ROAD + '" stroke="#064E3B" stroke-width="8" stroke-linecap="round"/>' +
          '<path class="i-dash" d="' + ROAD + '" stroke="#FBF7EE" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="2.6 3.2" stroke-dashoffset="-3" mask="url(#ms-intro-mask)"/>' +
          '<g class="i-dot"><circle class="i-ring" r="7.6" fill="#FFFFFF"/><circle r="5.6" fill="#FACC15"/></g>' +
          (season && S ? '<g class="i-hat-wrap" opacity="0">' + S.hat(season.id, calm) + '</g>' : '') +
          (rider ? rider.svg : '') +
        '</svg>' +
        '<div class="intro-count">' +
          (season ? '<p class="intro-greeting">' + season.greeting + '</p>' : '') +
          '<p class="ic-money">' + counter('ct-mid', monthMoney(1), monthMoney(0)) + '</p>' +
          '<p class="ic-month">' + counter('ct-end', fmtUnits(monthUnits), '0') + ' ' + lines.unitWord + lines.month + '</p>' +
          '<p class="ic-year">' + lines.year[0] + '<strong>' + counter('ct-end', lines.year[1], wholeMoney(0, R)) + '</strong>' + lines.year[2] + '</p>' +
        '</div></div>' +
        '<button type="button" class="intro-skip" tabindex="-1">Skip intro</button>';
      document.body.appendChild(overlay);
      root.classList.remove('ms-intro'); // the overlay takes over from the plain cover

      // the figures, read out once (the overlay itself is hidden from screen readers)
      live = document.createElement('p');
      live.className = 'sr-only intro-live';
      live.setAttribute('role', 'status');
      document.body.appendChild(live);
      var said = false;
      function announce() {
        if (said || !live) return;
        said = true;
        var el = live;
        el.textContent = monthMoney(1) + ', ' + fmtUnits(monthUnits) + ' ' + lines.unitWord + lines.month + '. ' + lines.year.join('');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 8000);
      }

      var q = function (s) { return overlay.querySelector(s); };
      var bg = q('.intro-bg'), fx = q('.season-fx'), art = q('.intro-art'), count = q('.intro-count'), skip = q('.intro-skip');
      var hatWrap = q('.i-hat-wrap'), riderEl = q('.i-rider');
      var road = q('.i-road'), mask = q('.i-mask'), dot = q('.i-dot'), ring = q('.i-ring');
      var low = q('.i-low'), up = q('.i-up'), yearLine = q('.ic-year'), yearAmount = q('.ic-year strong');
      var liveMoney = q('.ic-money .ct-live'), liveUnits = q('.ic-month .ct-live'), liveYear = q('.ic-year .ct-live');
      var L = road.getTotalLength();
      road.style.strokeDasharray = mask.style.strokeDasharray = L + ' ' + (L + 1);
      var roadAt = function (f) { return road.getPointAtLength(L * clamp(f, 0, 1)); };

      var ending = false, raf = 0;
      function finish() {
        if (ending || !overlay) return;
        ending = true;
        cancelAnimationFrame(raf);
        announce();
        overlay.classList.add('intro-out');
        setTimeout(cleanup, 260);
        unlisten();
      }
      var evs = ['keydown', 'wheel', 'touchmove', 'scroll'];
      function unlisten() {
        evs.forEach(function (e) { window.removeEventListener(e, finish, true); });
      }
      evs.forEach(function (e) { window.addEventListener(e, finish, { capture: true, passive: true }); });
      overlay.addEventListener('pointerdown', finish);
      skip.addEventListener('click', finish);

      if (calm) {
        // Reduce Motion: the finished sprout and the final figures, still; then a fade (as the app's cross-fade)
        var top = roadAt(1);
        road.style.strokeDashoffset = mask.style.strokeDashoffset = '0';
        dot.setAttribute('transform', 'translate(' + top.x.toFixed(2) + ' ' + (top.y - 2).toFixed(2) + ')');
        if (hatWrap) hatWrap.setAttribute('opacity', '1');
        setTimeout(announce, 300);
        setTimeout(finish, 2200);
        return;
      }

      // the signs beside the road (the app's petrol station, shops and café; gifts or Halloween treats in season)
      var signs = [];
      if (S) {
        var holder = q('.i-signs'), html = '';
        var list = S.signs(season, roadAt);
        list.forEach(function (s) { html += s.svg; });
        holder.innerHTML = html;
        Array.prototype.forEach.call(holder.children, function (el, i) { signs.push({ el: el, at: list[i].at, x: list[i].x, y: list[i].y }); });
      }
      var drop = !!(season && season.id === 'festive');

      var T_DRIVE = 200, DRIVE = 1250, T_LOW = 900, T_UP = 1150, LEAF = 300, T_RING = 1450,
          T_YEAR = 1500, YEAR = 550, T_MORPH = 3000, MORPH = 500, END = 3550; // the year lands at ~2.1 s and holds before the flight
      var inOut = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
      var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
      var back = function (x, k) { var c3 = k + 1; return 1 + c3 * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
      var t = 0, start = null, target = null, step = -1, yearStep = -1, landed = false;
      var leaf = function (el, t0, ox, oy, k) {
        var x = clamp((t - t0) / LEAF, 0, 1);
        var s = x === 0 ? 0.001 : back(x, k);
        el.setAttribute('transform', 'translate(' + ox + ' ' + oy + ') rotate(' + (-25 * (1 - x)).toFixed(2) + ') scale(' + s.toFixed(3) + ') translate(' + -ox + ' ' + -oy + ')');
      };

      function frame(now) {
        if (!overlay) return;
        if (start === null) start = now;
        t = now - start;
        var p = inOut(clamp((t - T_DRIVE) / DRIVE, 0, 1));
        road.style.strokeDashoffset = (L * (1 - p)).toFixed(2);
        mask.style.strokeDashoffset = (L * (1 - clamp(p - 0.035, 0, 1))).toFixed(2);
        // the seed wakes: rises out of the soil with a small pop, then drives up the road
        var wake = clamp(t / T_DRIVE, 0, 1);
        var pt = road.getPointAtLength(L * p);
        var lift = -2 * Math.sin(wake * Math.PI / 2) * (1 - p);
        var pop = 1 + 0.08 * Math.sin(wake * Math.PI) * (1 - p);
        var glint = t > T_RING + 150 ? 1 + 0.12 * Math.sin(clamp((t - T_RING - 150) / 240, 0, 1) * Math.PI) : 1;
        var ringIn = clamp((t - T_RING) / 150, 0, 1);
        dot.setAttribute('transform', 'translate(' + pt.x.toFixed(2) + ' ' + (pt.y + lift - (p === 1 ? 2 : 2 * p)).toFixed(2) + ') scale(' + (pop * glint).toFixed(3) + ')');
        ring.setAttribute('r', (5.6 + 2 * ringIn).toFixed(2));
        leaf(low, T_LOW, 47, 54, 1.0);
        leaf(up, T_UP, 52, 31, 1.3);

        signs.forEach(function (s) {
          var st = S.signState(s.at, p, drop);
          s.el.setAttribute('opacity', st.opacity.toFixed(3));
          s.el.setAttribute('transform', 'translate(' + s.x.toFixed(2) + ' ' + (s.y + st.dy).toFixed(2) + ') scale(' + st.scale.toFixed(3) + ')');
        });

        if (rider) {
          // the sleigh or the pumpkin drives instead of the dot; the sleigh then takes off over the leaves
          var rp = road.getPointAtLength(L * Math.min(1, p * rider.reach)), so = rider.soar(p);
          riderEl.setAttribute('transform', 'translate(' + (rp.x + so.x).toFixed(2) + ' ' + (rp.y + so.y).toFixed(2) + ')');
          riderEl.setAttribute('opacity', season.id === 'festive' ? (1 - clamp((p - 0.85) / 0.15, 0, 1)).toFixed(3) : '1');
          dot.setAttribute('opacity', season.id === 'festive' ? ringIn.toFixed(3) : '0');
        }
        if (hatWrap) {
          var h = clamp((t - T_RING) / 260, 0, 1);
          hatWrap.setAttribute('opacity', h.toFixed(3));
          hatWrap.setAttribute('transform', 'translate(0 ' + (-6 * (1 - back(h, 1.2))).toFixed(2) + ')');
        }

        // the money and the miles climb with the drive, in 1% steps (as the app)
        var c = clamp((p - 0.1) / 0.3, 0, 1);
        count.style.opacity = c;
        count.style.transform = 'translateY(' + (12 * (1 - c)).toFixed(1) + 'px)';
        var s100 = Math.round(p * 100);
        if (s100 !== step) {
          step = s100;
          liveMoney.textContent = monthMoney(step / 100);
          liveUnits.textContent = fmtUnits(Math.round(step / 100 * monthUnits));
        }
        // then what a year of it is worth counts up and lands with a small gold pop
        yearLine.style.opacity = clamp((t - T_YEAR) / 220, 0, 1);
        var y = easeOut(clamp((t - T_YEAR - 80) / YEAR, 0, 1)), ys = Math.round(y * 200);
        if (ys !== yearStep) {
          yearStep = ys;
          liveYear.textContent = wholeMoney(Math.round(yearMinor * ys / 200), R);
        }
        if (y === 1 && !landed) {
          landed = true;
          yearAmount.classList.add('is-landed');
          announce();
        }

        // the sprout flies to the header logo while the green lifts away
        if (t >= T_MORPH) {
          if (!target) {
            var logo = document.querySelector('.site-header .brand svg');
            var a = art.getBoundingClientRect(), b = logo ? logo.getBoundingClientRect() : null;
            target = b && b.width ? { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), s: b.height / a.height } : { x: 0, y: 0, s: 1 };
          }
          var m = inOut(clamp((t - T_MORPH) / MORPH, 0, 1));
          art.style.transform = 'translate(' + (target.x * m).toFixed(1) + 'px,' + (target.y * m).toFixed(1) + 'px) scale(' + (1 + (target.s - 1) * m).toFixed(4) + ')';
          bg.style.opacity = 1 - m;
          if (fx) fx.style.opacity = 1 - m;
          count.style.opacity = Math.max(0, 1 - m * 1.6);
          if (hatWrap) hatWrap.setAttribute('opacity', Math.max(0, 1 - m * 2).toFixed(3));
          skip.style.opacity = 1 - m;
          if (m === 1) art.style.opacity = 1 - clamp((t - T_MORPH - MORPH) / (END - T_MORPH - MORPH), 0, 1);
        }
        if (t >= END) { announce(); unlisten(); return cleanup(); }
        raf = requestAnimationFrame(frame);
      }

      setTimeout(function () { if (overlay) finish(); }, END + 2000); // never get stuck
      raf = requestAnimationFrame(frame);
    } catch (err) {
      cleanup();
    }
  })();

  /* ---------- Home hero: the sprout mark in its seasonal end state (the hat, autumn's leaves) and the greeting ----------
     This is all that shows with Reduce Motion, and what's left after the intro. */
  (function heroSeason() {
    var mark = document.querySelector('.hero-sprout');
    var S = window.MSSeason;
    if (!mark || !S || !SEASON) return;
    try {
      var pal = S.palette(SEASON.id);
      var stops = mark.querySelectorAll('linearGradient stop');
      if (stops.length === 2) { stops[0].setAttribute('stop-color', pal.light); stops[1].setAttribute('stop-color', pal.deep); }
      var shadow = mark.querySelector('g[opacity]');
      if (shadow) shadow.setAttribute('fill', pal.shadow);
      var hat = S.hat(SEASON.id, still());
      if (hat) {
        mark.insertAdjacentHTML('beforeend', hat);
        // the box keeps its size (no layout shift): the hat draws above it (overflow: visible)
        mark.classList.add('has-hat');
      }
      var p = document.createElement('p');
      p.className = 'season-greeting';
      p.textContent = SEASON.greeting;
      mark.insertAdjacentElement('afterend', p);
    } catch (err) { /* the plain mark stays */ }
  })();

  /* ---------- Home: links to the sign-up (and a floating "Get early access ↑" pill) ----------
     Every link to #early-access scrolls to the sign-up form and puts the cursor in the email box.
     The pill is made here (no JS, no pill) and shows only once the sign-up section is above
     the visitor (so its arrow points the right way), while scrolling down. */
  (function joinLinks() {
    var form = document.querySelector('form[data-waitlist]');
    var heading = document.getElementById('early-access');
    if (!form || !heading) return;
    var email = form.querySelector('input[type="email"]');

    function go(e) {
      if (e) e.preventDefault();
      heading.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
      if (email && !form.classList.contains('is-done')) {
        try { email.focus({ preventScroll: true }); } catch (err) { email.focus(); }
      }
    }
    Array.prototype.forEach.call(document.querySelectorAll('a[href="#early-access"]'), function (a) {
      a.addEventListener('click', go);
    });

    if (!('IntersectionObserver' in window)) return;
    var pill = document.createElement('a');
    pill.className = 'float-join';
    pill.href = '#early-access';
    pill.innerHTML = '<span>Get early access</span><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 15.5V5M5 9.5l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    pill.addEventListener('click', go);
    document.body.appendChild(pill);

    // Shows once the visitor has scrolled past the sign-up section and is scrolling down;
    // scrolling back up hides it. Never shown while another way to sign up is on screen (the
    // form, the Pro card's button, the closing section's button), so the page never asks twice at once.
    var section = heading.closest('section') || form;
    var others = [form].concat(Array.prototype.filter.call(document.querySelectorAll('a[href="#early-access"]'), function (a) { return a !== pill; }));
    var seen = others.map(function () { return false; });
    var lastY = window.scrollY || window.pageYOffset, down = false, shown = null;
    function update() {
      var y = window.scrollY || window.pageYOffset;
      if (Math.abs(y - lastY) > 8) { down = y > lastY; lastY = y; } // ignore tiny jitters
      var past = section.getBoundingClientRect().bottom < 0; // the form is above: the ↑ is right
      var on = past && down && seen.indexOf(true) < 0;
      if (on === shown) return;
      shown = on;
      pill.classList.toggle('on', on);
      document.body.classList.toggle('has-float', on);
      // hidden: out of the tab order and the accessibility tree
      if (on) { pill.removeAttribute('aria-hidden'); pill.removeAttribute('tabindex'); pill.inert = false; }
      else { pill.setAttribute('aria-hidden', 'true'); pill.setAttribute('tabindex', '-1'); pill.inert = true; }
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { seen[others.indexOf(e.target)] = e.isIntersecting; });
      update();
    });
    others.forEach(function (el) { io.observe(el); });
    window.addEventListener('scroll', update, { passive: true }); // cheap: depth and direction only
    update();
  })();

  /* ---------- Hero: the big faint sprout drifts slower than the page ---------- */
  (function heroMark() {
    var section = document.querySelector('.hero');
    var mark = document.querySelector('.hero-mark');
    if (!section || !mark) return;
    var visible = true, queued = false;
    function frame() {
      queued = false;
      var y = window.scrollY || window.pageYOffset;
      mark.style.transform = still() ? '' : 'translate3d(0,' + (y * 0.3).toFixed(1) + 'px,0)';
    }
    function queue() { if (visible && !queued) { queued = true; requestAnimationFrame(frame); } }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) queue(); }).observe(section);
    }
    window.addEventListener('scroll', queue, { passive: true });
    if (reduce.addEventListener) reduce.addEventListener('change', queue);
    frame();
  })();

  /* ---------- The hero scene's road, in perspective (viewBox 0 0 400 300, horizon at y 150) ----------
     Ground items sit at a lateral X (road units, the left kerb at -1) and a depth z; they're
     projected as x = vx + (X - c) * F / z, y = 150 + (1 - height) * F / z, where c is how far the
     car has pulled in to the left (UK) kerb. One shared draw(), so the no-JS markup in index.html
     is this same picture, parked (made with node; see website/README.md). */
  var ROAD = (function () {
    var NS = 'http://www.w3.org/2000/svg';
    var HZ = 150, F = 150, ZMIN = 0.5, ZMAX = 48;
    var KERB = -1, CENTRE = 1.1, FAR = 3.2;
    // [kind, X, spacing, first z, count]
    var ROWS = [['tree', -3.4, 7, 3, 7], ['tree', 5.4, 6, 4.5, 8], ['post', -1.5, 5, 1.5, 10], ['post', 3.7, 5, 4, 10], ['dash', CENTRE, 2.6, 0.8, 18]];
    function f(n) { return Math.round(n * 10) / 10; }
    function quad(vx, c, x1, x2, z1, z2) {
      var a = F / z1, b = F / z2;
      return f(vx + (x1 - c) * a) + ',' + f(HZ + a) + ' ' + f(vx + (x2 - c) * a) + ',' + f(HZ + a) + ' ' +
        f(vx + (x2 - c) * b) + ',' + f(HZ + b) + ' ' + f(vx + (x1 - c) * b) + ',' + f(HZ + b);
    }
    // make(name, class, parent) creates an element; the no-JS markup is made with a make() that writes text
    function build(g, make) {
      if (!make) {
        while (g.firstChild) g.removeChild(g.firstChild);
        make = function (name, cls, parent) { var e = document.createElementNS(NS, name); e.setAttribute('class', cls); (parent || g).appendChild(e); return e; };
      }
      var out = { surface: make('polygon', 'rd-surface'), kerb: make('polygon', 'rd-line'), edge: make('polygon', 'rd-line'), items: [] };
      ROWS.forEach(function (r) {
        var row = make('g', 'rd-row');
        for (var i = r[4] - 1; i >= 0; i--) { // far ones first, so nearer ones paint over them
          var it = { kind: r[0], X: r[1], z0: r[3] + i * r[2], span: r[2] * r[4], row: row, z: null };
          if (it.kind === 'tree') { it.g = make('g', 'rd-tree', row); it.trunk = make('rect', 'rd-trunk', it.g); it.crown = make('circle', 'rd-crown', it.g); }
          else it.g = it.el = make('polygon', 'rd-' + it.kind, row);
          out.items.push(it);
        }
      });
      return out;
    }
    function draw(sh, s, c, shift) {
      var vx = 200 + (shift || 0);
      sh.surface.setAttribute('points', quad(vx, c, KERB, FAR, ZMIN, ZMAX));
      sh.kerb.setAttribute('points', quad(vx, c, KERB + 0.05, KERB + 0.11, ZMIN, ZMAX));
      sh.edge.setAttribute('points', quad(vx, c, FAR - 0.11, FAR - 0.05, ZMIN, ZMAX));
      sh.items.forEach(function (it) {
        var z = ZMIN + (((it.z0 - s) % it.span) + it.span) % it.span;
        // went past the car and came round again, far away: paint it behind the rest of its row
        if (it.z !== null && z > it.z + 1 && it.row.insertBefore) it.row.insertBefore(it.g, it.row.firstChild);
        it.z = z;
        var k = F / z, x = vx + (it.X - c) * k, fog = f(clamp(1.3 - z / ZMAX * 1.4, 0, 1) * 100) / 100;
        if (it.kind === 'dash') { it.el.setAttribute('points', quad(vx, c, it.X - 0.05, it.X + 0.05, z, z + 1)); it.el.setAttribute('opacity', fog); return; }
        if (it.kind === 'post') {
          var w = 0.035 * k, h = 0.32 * k, y = HZ + k;
          it.el.setAttribute('points', f(x - w) + ',' + f(y) + ' ' + f(x + w) + ',' + f(y) + ' ' + f(x + w) + ',' + f(y - h) + ' ' + f(x - w) + ',' + f(y - h));
          it.el.setAttribute('opacity', fog);
          return;
        }
        var tw = 0.08 * k;
        it.trunk.setAttribute('x', f(x - tw)); it.trunk.setAttribute('y', f(HZ + k - 0.8 * k));
        it.trunk.setAttribute('width', f(tw * 2)); it.trunk.setAttribute('height', f(0.8 * k));
        it.crown.setAttribute('cx', f(x)); it.crown.setAttribute('cy', f(HZ + k - 1.3 * k)); it.crown.setAttribute('r', f(0.6 * k));
        it.trunk.setAttribute('opacity', fog); it.crown.setAttribute('opacity', fog);
      });
    }
    return { build: build, draw: draw, PARKED: -0.55 };
  })();

  /* ---------- Hero scene: the phone in a car mount, the road going by ----------
     The phone's screen is a recording of the real app (assets/video/drive-logged.*, 9.6 s, looping):
     driving ("Recording a drive"), parked, the new drive on Home (Meanwood Rd → Home, 2.2 mi),
     swiped to Work, the total up by £1.21. The road runs on its own clock (requestAnimationFrame),
     so it drives, slows, pulls in to the kerb and stops, then sets off again every 9.6 s, whether or
     not the video plays. When the video plays, the clock follows it, so the two stay in step. When it
     can't (iOS Low Power Mode blocks autoplay; play() is refused), the phone shows the posters as
     stills in step with the road (driving, then the saved drive), and the video is tried again on the
     first touch, click or scroll. Runs only while on screen and never under the sprout intro.
     Reduce Motion (and no JS): the saved state on the screen and a still road, parked. */
  (function scene() {
    var root = document.getElementById('scene');
    if (!root) return;
    var svg = root.querySelector('.scene-road');
    var live = svg && svg.querySelector('.rd-live');
    var hills = svg && svg.querySelector('.rd-hills');
    var video = root.querySelector('video');
    if (!live || !video) return;

    var road = ROAD;
    var shapes = road.build(live);
    var PARKED = road.PARKED;
    var D = 9.6;                       // the clip's length
    var smooth = function (x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
    // On the clip's clock: driving to 1.8 s, slowing and pulling in to 2.7 s, parked, setting off from 9 s.
    function pace(t) {
      if (t < 1.8) return 0;
      if (t < 2.7) return smooth((t - 1.8) / 0.9);
      if (t < 9.0) return 1;
      return 1 - smooth((t - 9.0) / 0.6);
    }
    var posters = { drive: video.getAttribute('data-poster-drive'), saved: video.getAttribute('data-poster-saved') };

    var s = 0, steer = 0, steerTo = 0, last = 0, raf = 0;
    var clock = 0;                     // seconds into the loop
    var inView = false, videoOk = false, blocked = false, poster = '';

    function introShowing() { return document.documentElement.classList.contains('ms-intro') || !!document.querySelector('.sprout-intro'); }
    function running() { return inView && !still() && !introShowing(); }

    function showPoster(which) {
      if (poster === which) return;
      poster = which;
      video.poster = posters[which];
    }
    function tick(now) {
      raf = 0;
      if (!running()) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (videoOk && !video.paused && video.readyState >= 2) clock = video.currentTime % D; // follow the clip
      else {
        clock = (clock + dt) % D;                                                         // the road's own clock
        if (blocked) showPoster(clock < 2.7 ? 'drive' : 'saved');                         // stills in step
      }
      var k = pace(clock);
      s += (1 - k) * 9 * dt;                   // road units per second
      steer += (steerTo - steer) * Math.min(1, dt * 3);
      road.draw(shapes, s, PARKED * smooth(k), steer * 14);
      if (hills) hills.setAttribute('transform', 'translate(' + (-steer * 6).toFixed(2) + ' 0)');
      raf = requestAnimationFrame(tick);
    }
    function start() {
      if (!running()) return;
      if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
      playVideo();
    }
    function stop() {
      video.pause();
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    // iOS: muted + playsinline (also in the HTML) let it autoplay, except in Low Power Mode
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('playsinline', '');
    function playVideo() {
      if (!running()) return;
      if (video.getAttribute('preload') === 'none') video.setAttribute('preload', 'auto');
      try { video.currentTime = clock; } catch (err) { /* not loaded yet */ }
      var p;
      try { p = video.play(); } catch (err) { refused(); return; }
      if (p && p.then) p.then(function () { videoOk = true; blocked = false; }, refused);
    }
    function refused() {
      // the road keeps driving on its own clock; the phone shows the posters until a touch lets it play
      videoOk = false;
      blocked = true;
      retryOnGesture();
    }
    var waiting = false;
    function retryOnGesture() {
      if (waiting) return;
      waiting = true;
      var evs = ['touchstart', 'pointerdown', 'keydown', 'scroll'];
      function retry() {
        evs.forEach(function (e) { window.removeEventListener(e, retry, true); });
        waiting = false;
        playVideo();
      }
      evs.forEach(function (e) { window.addEventListener(e, retry, { capture: true, passive: true }); });
    }
    video.addEventListener('playing', function () { videoOk = true; blocked = false; });

    function rest() {
      // Reduce Motion: the saved state, parked; nothing moves
      stop();
      try { video.currentTime = 0; } catch (err) {}
      video.removeAttribute('autoplay');
      showPoster('saved');
      road.draw(shapes, 0, PARKED, 0);
      root.classList.add('is-still');
    }
    // the HTML poster is the clip's first frame (driving); Reduce Motion swaps in the saved state
    poster = 'drive';
    if (still()) rest();
    else road.draw(shapes, 0, 0, 0);

    // First visit: the sprout intro covers the page; start from the top once it's gone
    window.addEventListener('ms-intro-end', function () {
      clock = 0;
      try { video.currentTime = 0; } catch (err) {}
      start();
    });

    // Desktop: the road leans gently with the pointer (as if steering a little)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      root.closest('.hero').addEventListener('pointermove', function (e) {
        steerTo = clamp(e.clientX / window.innerWidth * 2 - 1, -1, 1);
      }, { passive: true });
    }

    // Watch for it on screen only after the page has loaded and settled (a link to /#early-access
    // jumps past the hero first), so the clip is never fetched or played off screen.
    function watch() {
      if (!('IntersectionObserver' in window)) { inView = true; start(); return; }
      var skipFirst = !!location.hash && location.hash !== '#main';
      new IntersectionObserver(function (es) {
        if (skipFirst) { skipFirst = false; if (es[0].isIntersecting) return; }
        inView = es[0].isIntersecting;
        if (inView) start(); else stop();
      }, { threshold: 0.25 }).observe(root);
    }
    function afterLoad() { requestAnimationFrame(function () { requestAnimationFrame(watch); }); }
    if (document.readyState === 'complete') afterLoad(); else window.addEventListener('load', afterLoad);

    if (reduce.addEventListener) {
      reduce.addEventListener('change', function () {
        if (still()) rest();
        else { root.classList.remove('is-still'); showPoster('drive'); start(); }
      });
    }
  })();

  /* ---------- Money: the hero's money line and the "What are your work miles worth?" calculator ----------
     Each country's real rules, as in the app (milemint/src/domain/regions.ts; checked in
     research_notes/launch-2026/website-claims-check.md): UK 55p for the first 10,000 miles a year
     then 25p; US 76¢ (from 1 Jul 2026); Canada 73¢ for the first 5,000 km then 67¢ (the CRA's
     allowance rate, provinces); Australia 91c a km, capped at 5,000 km a year. 48 working weeks.
     Figures are what the miles are worth at that rate: never "money back" or "tax saved".
     The country comes from season.js (time zone, then language; ?country=CA previews one);
     without JS the UK text shows. */
  var RATES = {
    UK: { unit: 'mi', cur: 'GBP', locale: 'en-GB', at: "HMRC's rate",
      tiers: [[10000, 0.55], [Infinity, 0.25]],
      note: "HMRC's rate for cars and vans in 2026/27: 55p a mile for the first 10,000 miles, then 25p.",
      source: 'https://www.gov.uk/government/publications/increase-to-approved-mileage-allowance-payments-amaps-and-self-employed-simplified-mileage-rates/increasing-mileage-rates' },
    US: { unit: 'mi', cur: 'USD', locale: 'en-US', at: "the IRS's rate",
      tiers: [[Infinity, 0.76]],
      note: "The IRS's standard mileage rate from 1 July 2026: 76¢ a mile.",
      source: 'https://www.irs.gov/forms-pubs/the-standard-mileage-rates-and-maximum-automobile-fair-market-values-have-been-updated-for-2026' },
    CA: { unit: 'km', cur: 'CAD', locale: 'en-CA', at: "the CRA's allowance rate",
      tiers: [[5000, 0.73], [Infinity, 0.67]],
      note: "The CRA's allowance rate for 2026 (provinces): 73¢ a km for the first 5,000 km, then 67¢. It's the most an employer can pay tax-free; self-employed drivers claim their actual costs.",
      source: 'https://www.canada.ca/en/department-finance/news/2026/01/government-announces-the-2026-automobile-deduction-limits-and-expense-benefit-rates-for-businesses.html' },
    AU: { unit: 'km', cur: 'AUD', locale: 'en-AU', at: "the ATO's rate",
      tiers: [[5000, 0.91]], // capped: nothing above 5,000 km a year
      note: "The ATO's cents per km rate for 2026–27: 91c a km, for up to 5,000 km a year per car.",
      source: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/work-related-deductions/cars-transport-and-travel/motor-vehicle-and-car-expenses/expenses-for-a-car-you-own-or-lease/cents-per-kilometre-method' }
  };
  // WEEKS (48) is set with the intro's example, above.
  /** What a year of `perWeek` work miles (or km) is worth: each band at its rate, anything past the last band at nothing. */
  function yearWorth(r, perWeek) {
    var left = perWeek * WEEKS, total = 0;
    for (var i = 0; i < r.tiers.length && left > 0; i++) {
      var band = Math.min(left, r.tiers[i][0]);
      total += band * r.tiers[i][1];
      left -= band;
    }
    return total;
  }
  function money(r, n) {
    try { return new Intl.NumberFormat(r.locale, { style: 'currency', currency: r.cur, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(n)); }
    catch (err) { return (r.cur === 'GBP' ? '£' : '$') + Math.round(n).toLocaleString('en'); }
  }
  var COUNTRY = (function () {
    var c = visitorCountry(); // the same as the intro's
    return c === 'GB' ? 'UK' : RATES[c] ? c : 'UK';
  })();

  // The calculator's starting point (100 miles or 160 km a week); the hero's example year is the same sum, so they always agree.
  function defaultWeek(r) { return EXAMPLE_WEEK[r.unit]; }

  (function moneyLine() {
    // index.html carries each country's line and site.css shows the visitor's (no jump); this keeps each one's figure
    // in step with RATES (it rewrites only a figure that differs, so normally nothing changes)
    Array.prototype.forEach.call(document.querySelectorAll('[data-money] [data-for]'), function (span) {
      var r = RATES[span.getAttribute('data-for')], strong = span.querySelector('strong');
      if (!r || !strong) return;
      var amount = money(r, yearWorth(r, defaultWeek(r)));
      if (strong.textContent !== amount) strong.textContent = amount;
    });
  })();

  (function calculator() {
    var root = document.getElementById('calc');
    if (!root) return;
    var radios = root.querySelectorAll('input[name="calc-country"]');
    var range = root.querySelector('#calc-range');
    var q = function (k) { return root.querySelector('[data-calc="' + k + '"]'); };
    var label = q('label'), dist = q('dist'), unitEl = q('unit'), amountEl = q('amount'), atEl = q('at'),
      live = q('live'), note = q('note'), source = q('source');
    if (!radios.length || !range || !amountEl) return;
    var strong = amountEl.parentNode;
    var r = RATES[COUNTRY];
    Array.prototype.forEach.call(root.querySelectorAll('[data-calc-js]'), function (el) { el.hidden = false; });
    var eg = root.querySelector('.calc-eg');
    if (eg) eg.hidden = true; // "An example:" is for the still, no-JS version

    // The yearly amount rolls to its new value (about half a second, easing out), then shimmers once
    // if it crossed a milestone (every 1,000 of the currency). Reduce Motion: it just changes.
    var shown = null, onScreen = 0, target = 0, rollFrom = 0, rollStart = 0, raf = 0;
    function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
    function roll(now) {
      var k = Math.min(1, (now - rollStart) / 520);
      onScreen = k < 1 ? rollFrom + (target - rollFrom) * easeOut(k) : target;
      amountEl.textContent = money(r, onScreen);
      raf = k < 1 ? requestAnimationFrame(roll) : 0;
    }
    function shimmer() {
      strong.classList.remove('is-shimmer');
      void strong.offsetWidth; // restart the animation
      strong.classList.add('is-shimmer');
    }
    function setAmount(value, instant) {
      // roll from the number on screen (mid-roll during a drag), not the last target, so it never skips
      var from = shown === null ? value : raf ? onScreen : shown;
      target = value;
      shown = value;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (instant || still() || from === value) { onScreen = value; amountEl.textContent = money(r, value); return; }
      rollFrom = from; rollStart = performance.now();
      raf = requestAnimationFrame(roll);
      if (Math.floor(from / 1000) !== Math.floor(value / 1000)) shimmer();
    }
    strong.addEventListener('animationend', function () { strong.classList.remove('is-shimmer'); });

    var say = 0;
    function units(n) { return r.unit === 'mi' ? (n === 1 ? 'mile' : 'miles') : 'km'; }
    function fill() {
      var p = (Number(range.value) - Number(range.min)) / (Number(range.max) - Number(range.min)) * 100;
      range.style.setProperty('--fill', p.toFixed(2) + '%');
    }
    function show(announce, instant) {
      var n = Number(range.value);
      var worth = Math.round(yearWorth(r, n));
      dist.textContent = n.toLocaleString('en');
      unitEl.textContent = units(n) + ' a week';
      range.setAttribute('aria-valuetext', n.toLocaleString('en') + ' ' + units(n) + ' a week');
      atEl.textContent = r.at;
      fill();
      setAmount(worth, instant);
      if (announce) {
        // the final value only, and once the arrow keys have been still for a moment
        clearTimeout(say);
        var text = 'About ' + money(r, worth) + ' a year at ' + r.at + '.';
        say = setTimeout(function () { live.textContent = text; }, 400);
      }
    }
    function setCountry(c, fromUser, instant) {
      var was = r;
      r = RATES[c];
      if (was.unit !== r.unit) {
        // the same driving in the other unit, to the slider's step of 5
        var v = Number(range.value) * (r.unit === 'km' ? 1.609344 : 1 / 1.609344);
        range.min = r.unit === 'km' ? 15 : 10;
        range.max = r.unit === 'km' ? 1000 : 600;
        range.value = Math.round(v / 5) * 5;
      }
      label.textContent = r.unit === 'km' ? 'Work km a week' : 'Work miles a week';
      note.textContent = r.note;
      source.href = r.source;
      if (was.cur !== r.cur && !instant) shown = 0; // a new currency counts up from 0 (never a £ → $ roll)
      show(fromUser, instant);
      if (fromUser) {
        // one fewer tap in the form below
        var chip = document.querySelector('form[data-waitlist] input[name="country"][value="' + c + '"]');
        if (chip) chip.checked = true;
      }
    }
    Array.prototype.forEach.call(radios, function (input) {
      input.checked = input.value === COUNTRY;
      input.addEventListener('change', function () {
        if (!input.checked) return;
        var chip = input.parentNode;
        chip.classList.remove('is-pop');
        void chip.offsetWidth;
        chip.classList.add('is-pop');
        setCountry(input.value, true, false);
      });
      input.parentNode.addEventListener('animationend', function () { input.parentNode.classList.remove('is-pop'); });
    });
    if (r.unit === 'km') { range.min = 15; range.max = 1000; }
    range.value = defaultWeek(r);
    setCountry(COUNTRY, false, true);
    // The whole slider band takes the finger: anywhere on it sets the value there and follows the drag
    // (iOS only moves a range by its thumb, so a near miss used to drag the page instead).
    var band = root.querySelector('.calc-slide'), dragId = null;
    function valueAt(x) {
      var box = range.getBoundingClientRect();
      var thumb = parseFloat(getComputedStyle(range).getPropertyValue('--thumb')) || 26;
      var k = clamp((x - box.left - thumb / 2) / Math.max(1, box.width - thumb), 0, 1);
      var min = Number(range.min), max = Number(range.max), step = Number(range.step) || 1;
      return Math.round((min + k * (max - min)) / step) * step;
    }
    function setFrom(e) {
      var v = valueAt(e.clientX);
      if (String(v) !== range.value) { range.value = v; range.dispatchEvent(new Event('input', { bubbles: true })); }
    }
    if (band && window.PointerEvent) {
      band.classList.add('is-live');
      band.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || e.target.closest('label')) return;
        dragId = e.pointerId;
        try { band.setPointerCapture(dragId); } catch (err) { /* fine */ }
        try { range.focus({ preventScroll: true }); } catch (err) { range.focus(); }
        e.preventDefault();
        moved = false; downX = e.clientX; downY = e.clientY;
        // a mouse sets the value at once; a finger waits to see if it's a tap or a sideways drag, so a
        // scroll that happens to start on the slider (pointercancel) leaves the value alone
        if (e.pointerType === 'mouse') { setFrom(e); moved = true; }
      });
      var moved = false, downX = 0, downY = 0;
      band.addEventListener('pointermove', function (e) {
        if (e.pointerId !== dragId) return;
        var dx = Math.abs(e.clientX - downX), dy = Math.abs(e.clientY - downY);
        if (!moved && e.pointerType !== 'mouse' && (dx < 6 || dy > dx)) return; // not (yet) a sideways drag
        setFrom(e);
        moved = true;
      });
      band.addEventListener('pointerup', function (e) {
        if (e.pointerId !== dragId) return;
        dragId = null;
        if (moved || Math.abs(e.clientY - downY) < 10) setFrom(e); // a tap on the track jumps there
        range.dispatchEvent(new Event('change', { bubbles: true }));
      });
      band.addEventListener('pointercancel', function (e) {
        if (e.pointerId !== dragId) return;
        dragId = null;
        if (moved) range.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
    range.addEventListener('input', function () { show(false); });
    range.addEventListener('change', function () { show(true); }); // the slider stopped: read the result out once
  })();

  /* ---------- Feature deck ---------- */
  (function deck() {
    var root = document.getElementById('deck');
    if (!root) return;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.dcard'));
    var feats = Array.prototype.slice.call(document.querySelectorAll('.feat'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.dots button'));
    var live = document.getElementById('deck-live');
    var counter = document.getElementById('deck-n');
    var n = cards.length, active = 0;

    function depth(i) { var k = (i - active + n) % n; return k <= 3 ? String(k) : 'far'; }

    function layout(announce) {
      cards.forEach(function (c, i) {
        c.setAttribute('data-depth', depth(i));
        c.setAttribute('aria-hidden', i === active ? 'false' : 'true');
      });
      feats.forEach(function (f, i) { f.classList.toggle('on', i === active); });
      dots.forEach(function (d, i) {
        if (i === active) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      if (counter) counter.textContent = String(active + 1);
      if (announce && live) {
        var h = feats[active] && feats[active].querySelector('h3');
        live.textContent = (active + 1) + ' of ' + n + ': ' + (h ? h.textContent : '');
      }
    }

    // send card c off to one side; after a moment it tucks in at the back of the deck
    function flyOff(c, dir) {
      clearTimeout(c._t);
      c.classList.remove('fly-l', 'fly-r');
      if (still()) return;
      c.classList.add(dir < 0 ? 'fly-l' : 'fly-r');
      c._t = setTimeout(function () { c.classList.remove('fly-l', 'fly-r'); }, 330);
    }

    function next(dir) {
      var c = cards[active];
      active = (active + 1) % n;
      flyOff(c, dir || -1);
      layout(true);
    }

    function prev() {
      active = (active - 1 + n) % n;
      var c = cards[active];
      clearTimeout(c._t);
      if (!still()) {
        // appear at the side, then slide onto the top of the deck
        c.classList.add('no-anim', 'fly-l');
        c.style.opacity = '0';
        void c.offsetWidth;
        c.classList.remove('no-anim');
        c.style.opacity = '';
        c.classList.remove('fly-l');
      }
      layout(true);
    }

    function goTo(i) {
      if (i === active) return;
      if (i === (active + 1) % n) return next(-1);
      if (i === (active - 1 + n) % n) return prev();
      var c = cards[active];
      active = i;
      flyOff(c, -1);
      layout(true);
    }

    dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });
    Array.prototype.forEach.call(document.querySelectorAll('.deck-btn'), function (b) {
      b.addEventListener('click', function () { if (b.getAttribute('data-step') === '1') next(-1); else prev(); });
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(-1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(n - 1); }
    });

    // Trackpad: a horizontal swipe arrives as a burst of wheel events (with momentum).
    // One swipe = one card: fire once, then wait for the burst to die down.
    var acc = 0, locked = false, quiet = null, lockedAt = 0, lastMag = 0;
    root.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); // stop the browser's back/forward swipe while over the deck
      var mag = Math.abs(e.deltaX);
      clearTimeout(quiet);
      quiet = setTimeout(function () { locked = false; acc = 0; }, 180);
      if (locked) {
        // a fresh swipe during the momentum tail: deltas jump back up
        if (Date.now() - lockedAt > 450 && mag > lastMag * 2 && mag > 12) locked = false; else { lastMag = mag; return; }
      }
      lastMag = mag;
      acc += e.deltaX;
      if (Math.abs(acc) > 36) {
        if (acc > 0) next(-1); else prev();
        acc = 0; locked = true; lockedAt = Date.now();
      }
    }, { passive: false });

    // Mouse drag / touch swipe with a throw: drag the top card, let go fast or far to flick it.
    var drag = null;
    root.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('button, a')) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, on: false, pts: [[e.clientX, performance.now()]] };
    });
    root.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; } // a scroll, not a drag
        if (Math.abs(dx) < 8) return;
        drag.on = true;
        try { root.setPointerCapture(e.pointerId); } catch (err) { /* not supported */ }
        root.classList.add('is-dragging');
        cards[active].classList.add('dragging');
      }
      drag.dx = dx;
      drag.pts.push([e.clientX, performance.now()]);
      if (drag.pts.length > 6) drag.pts.shift();
      if (!still()) {
        cards[active].style.transform = 'translate3d(' + dx + 'px,' + (-Math.abs(dx) * 0.04) + 'px,0) rotate(' + (dx * 0.05) + 'deg)';
      }
    });
    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      root.classList.remove('is-dragging');
      var c = cards[active];
      c.classList.remove('dragging');
      if (!d.on) {
        // a plain click or tap on the top card turns to the next one
        if (e.type === 'pointerup' && e.target.closest && e.target.closest('.dcard') === c) next(-1);
        return;
      }
      var a = d.pts[0], b = d.pts[d.pts.length - 1];
      var v = (b[0] - a[0]) / Math.max(1, b[1] - a[1]); // px per ms
      c.style.transform = '';
      if (Math.abs(d.dx) > 90 || (Math.abs(v) > 0.45 && Math.abs(d.dx) > 24)) next(d.dx < 0 ? -1 : 1);
    }
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);
    root.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // deal the cards in when the deck first comes into view
    if ('IntersectionObserver' in window && !still()) {
      var r = root.getBoundingClientRect();
      if (r.top > window.innerHeight) {
        root.classList.add('pre');
        var io = new IntersectionObserver(function (es) {
          if (!es[0].isIntersecting) return;
          io.disconnect();
          root.classList.add('in');
          requestAnimationFrame(function () { root.classList.remove('pre'); });
          setTimeout(function () { root.classList.remove('in'); }, 1200);
        }, { threshold: 0.25 });
        io.observe(root);
      }
    }

    layout(false);
  })();

  /* ---------- Waitlist form ---------- */
  (function waitlist() {
    var forms = document.querySelectorAll('form[data-waitlist]');
    var MSG_EMAIL = "That email doesn't look right. Check it and try again.";
    var MSG_FAIL = "Sorry, that didn't go through. Please try again in a moment, or email hello@milesprout.app.";

    function done(f) {
      f.classList.add('is-done');
      var ok = f.querySelector('.wl-done');
      if (ok) { ok.hidden = false; ok.focus(); }
    }

    // Founding testers links carry the group they were posted in (/testers?g=fb-leeds-couriers).
    // Same clean-up as the server: lowercase a-z, 0-9 and hyphens, at most 40 characters.
    var g = /[?&]g=([^&#]*)/.exec(location.search);
    if (g) {
      try { g = decodeURIComponent(g[1].replace(/\+/g, ' ')); } catch (err) { g = ''; }
      g = g.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').slice(0, 40).replace(/^-+|-+$/g, '');
      Array.prototype.forEach.call(document.querySelectorAll('form[data-waitlist] input[name="group"]'), function (i) { i.value = g; });
    }

    // Choice chips are optional radios: tapping the chosen one again clears it.
    Array.prototype.forEach.call(document.querySelectorAll('[data-chips]'), function (fs) {
      var was = null;
      fs.addEventListener('pointerdown', function (e) {
        var input = e.target.closest('.chip') && e.target.closest('.chip').querySelector('input');
        was = input && input.checked ? input : null;
      });
      fs.addEventListener('keydown', function (e) {
        was = (e.key === ' ' && e.target.checked) ? e.target : null;
      });
      fs.addEventListener('click', function (e) {
        if (e.target.type !== 'radio') return;
        if (was === e.target) e.target.checked = false;
        was = null;
      });
    });

    // Cleaner forms: until a whole email is typed, only the email box and the button show.
    // The optional chips and the consent box then slide in, and stay. Pressing the button
    // early reveals them and moves to the consent box (still required). No JS: all visible.
    var FULL_EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

    /* Cloudflare Turnstile (bot check), loaded only once a whole email is typed, never before:
       the form's data-turnstile-sitekey, managed mode, shown only if it needs the visitor
       ('interaction-only'). Its token goes in the hidden cf-turnstile-response field it adds to
       the form; the server checks it once TURNSTILE_SECRET_KEY is set there. If the script can't
       load, the form still posts and the server decides. */
    var TS_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=msTurnstileReady';
    var tsState = 'idle', tsQueue = [];
    function withTurnstile(fn) {
      if (tsState === 'ready') { fn(window.turnstile); return; }
      tsQueue.push(fn);
      if (tsState !== 'idle') return;
      tsState = 'loading';
      window.msTurnstileReady = function () {
        tsState = 'ready';
        tsQueue.splice(0).forEach(function (f) { try { f(window.turnstile); } catch (err) { /* the form still posts */ } });
      };
      var s = document.createElement('script');
      s.src = TS_SRC;
      s.async = true;
      s.onerror = function () {
        // blocked or offline: send any sign-up that was waiting for a token (the server decides)
        tsState = 'failed';
        tsQueue.length = 0;
        Array.prototype.forEach.call(forms, function (f) { if (f._ts) f._ts.waiting.splice(0).forEach(function (go) { go(); }); });
      };
      document.head.appendChild(s);
    }
    function botCheck(f, where) {
      var key = f.getAttribute('data-turnstile-sitekey');
      if (!key || f._ts) return;
      var box = document.createElement('div');
      box.className = 'wl-turnstile';
      where.appendChild(box);
      f._ts = { id: null, waiting: [] };
      withTurnstile(function (ts) {
        f._ts.id = ts.render(box, {
          sitekey: key,
          action: 'waitlist',
          appearance: 'interaction-only',
          callback: function () { f._ts.waiting.splice(0).forEach(function (go) { go(); }); },
          'expired-callback': function () { ts.reset(f._ts.id); },
          'error-callback': function () { f._ts.waiting.splice(0).forEach(function (go) { go(); }); }
        });
      });
    }
    // Calls go() once the form has a token (or straight away if there's no check, or after 5 s).
    function whenChecked(f, go) {
      var field = f.querySelector('input[name="cf-turnstile-response"]');
      if (!f._ts || tsState === 'failed' || (field && field.value)) { go(); return; }
      var done = false;
      var once = function () { if (!done) { done = true; go(); } };
      f._ts.waiting.push(once);
      setTimeout(once, 5000);
    }
    function resetCheck(f) {
      if (f._ts && f._ts.id !== null && window.turnstile) { try { window.turnstile.reset(f._ts.id); } catch (err) {} }
    }
    Array.prototype.forEach.call(forms, function (f, n) {
      var email = f.querySelector('input[type="email"]');
      var btn = f.querySelector('button[type="submit"]');
      var opts = f.querySelector('.wl-opts'), consent = f.querySelector('.wl-consent');
      if (!email || !btn || !consent) return;
      var more = document.createElement('div');
      more.className = 'wl-more';
      more.id = 'wl-more-' + n;
      var inner = document.createElement('div');
      inner.className = 'wl-more-inner';
      more.appendChild(inner);
      (opts || consent).parentNode.insertBefore(more, opts || consent);
      if (opts) inner.appendChild(opts);
      inner.appendChild(consent);
      // screen readers hear once that more fields appeared (sighted users see them slide in)
      var live = document.createElement('p');
      live.className = 'sr-only';
      live.setAttribute('aria-live', 'polite');
      f.appendChild(live);
      f.classList.add('wl-compact');
      more.inert = true;
      btn.setAttribute('aria-controls', more.id);
      btn.setAttribute('aria-expanded', 'false');
      var open = false;
      function reveal(announce) {
        if (open) return;
        open = true;
        f.classList.add('wl-open');
        more.inert = false;
        btn.setAttribute('aria-expanded', 'true');
        if (announce) live.textContent = 'A few optional questions and the consent box have appeared after the button.';
      }
      function check() { if (FULL_EMAIL.test(email.value.trim())) { reveal(true); botCheck(f, inner); } }
      email.addEventListener('input', check);
      email.addEventListener('change', check);
      email.addEventListener('paste', function () { setTimeout(check, 0); });
      check(); // autofilled
      // the button (or Enter in the email box, which "clicks" it) before the extras show
      btn.addEventListener('click', function (e) {
        if (open) return;
        e.preventDefault();
        reveal(false);
        var box = consent.querySelector('input');
        setTimeout(function () { if (box) box.focus(); }, still() ? 0 : 220);
      });
    });

    Array.prototype.forEach.call(forms, function (f) {
      var status = f.querySelector('.wl-status');
      var btn = f.querySelector('button[type="submit"]');
      function say(msg, isErr) { status.textContent = msg; status.classList.toggle('err', !!isErr); }

      f.addEventListener('submit', function (e) {
        e.preventDefault();
        btn.disabled = true;
        say('Adding you…');
        whenChecked(f, send);
      });
      function send() {
        var data = {};
        new FormData(f).forEach(function (v, k) { data[k] = typeof v === 'string' ? v : ''; });
        fetch(f.getAttribute('action'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'same-origin'
        }).then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) { return { r: r, j: j }; });
        }).then(function (x) {
          if (x.r.ok && x.j.ok) { say(''); done(f); return; }
          resetCheck(f); // a token works once
          if (x.r.status === 400 && x.j.error === 'email') say(MSG_EMAIL, true);
          else if (x.r.status === 400 && x.j.error === 'consent') say('Please tick the box so we can email you.', true);
          else if ((x.j.error === 'rate' || x.j.error === 'bot') && x.j.message) say(x.j.message, true);
          else say(MSG_FAIL, true);
        }).catch(function () {
          resetCheck(f);
          say(MSG_FAIL, true);
        }).then(function () { btn.disabled = false; });
      }
    });

    // /waitlist?joined=1 (after a no-JS post) shows the success state; with #joined the CSS already does
    if (/[?&]joined=1\b/.test(location.search) && location.hash !== '#joined' && forms[0]) done(forms[0]);
  })();
})();
