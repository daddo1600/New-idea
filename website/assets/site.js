/* MileSprout website: hero phone tilt, the feature deck and the waitlist (and founding testers) form.
   Vanilla JS, no libraries, no requests except the waitlist form posting to /api/waitlist.
   The page works without it: the phone sits still and every feature is listed. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function still() { return reduce.matches; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- Home intro: the sprout grows, as in the app's opening, then becomes the header logo ----------
     Only when intro-gate.js has put up its cover (first visit this session, motion allowed).
     Road signs pop up beside the road; in a season (season.js) the sprout dresses up: a backdrop,
     a hat on the gold dot, autumn leaves, the sleigh or the pumpkin, and a greeting.
     Everything is drawn from one clock in requestAnimationFrame, so a skip or an error just ends it. */
  var SEASON = null;
  try { SEASON = window.MSSeason ? window.MSSeason.detect() : null; } catch (err) { SEASON = null; }

  (function intro() {
    var root = document.documentElement;
    if (!root.classList.contains('ms-intro')) return;
    var overlay = null;
    function cleanup() {
      root.classList.remove('ms-intro');
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
    }
    try {
      try { window.sessionStorage.setItem('ms-intro-seen', '1'); } catch (err) { /* fine */ }
      var S = window.MSSeason, season = S ? SEASON : null;
      var ROAD = 'M50 87 C50 78 38 74 40 64 C42 55 54 54 54 44 C54 37 50 35 51 30';
      var LOW = 'M47 54 C37 55 20 48 14 34 C27 32 41 39 47 54Z';
      var UP = 'M52 31 C56 19 70 11 86 11 C85 25 70 34 52 31Z';
      var pal = S ? S.palette(season && season.id) : { light: '#77E8A0', deep: '#24B359', shadow: '#085E42' };
      var rider = season && S ? S.rider(season.id) : null;
      overlay = document.createElement('div');
      overlay.className = 'sprout-intro' + (season ? ' season-' + season.id : '');
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
          (season && S ? '<g class="i-hat-wrap" opacity="0">' + S.hat(season.id, false) + '</g>' : '') +
          (rider ? rider.svg : '') +
        '</svg>' +
        (season ? '<p class="intro-greeting">' + season.greeting + '</p>' : '') +
        '<p class="intro-word"><span class="wm-mile">Mile</span><span class="wm-sprout">Sprout</span></p></div>' +
        '<button type="button" class="intro-skip" tabindex="-1">Skip intro</button>';
      document.body.appendChild(overlay);
      root.classList.remove('ms-intro'); // the overlay takes over from the plain cover

      var q = function (s) { return overlay.querySelector(s); };
      var bg = q('.intro-bg'), fx = q('.season-fx'), art = q('.intro-art'), word = q('.intro-word'), skip = q('.intro-skip');
      var greet = q('.intro-greeting'), hatWrap = q('.i-hat-wrap'), riderEl = q('.i-rider');
      var road = q('.i-road'), mask = q('.i-mask'), dot = q('.i-dot'), ring = q('.i-ring');
      var low = q('.i-low'), up = q('.i-up');
      var L = road.getTotalLength();
      road.style.strokeDasharray = mask.style.strokeDasharray = L + ' ' + (L + 1);
      var roadAt = function (f) { return road.getPointAtLength(L * clamp(f, 0, 1)); };

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

      // a season gets a little longer, to enjoy the touches
      var EXTRA = season ? 700 : 0;
      var T_DRIVE = 250, DRIVE = 1400, T_LOW = 1050, T_UP = 1400, LEAF = 300, T_RING = 1650, T_WORD = 1700,
          T_MORPH = 2450 + EXTRA, MORPH = 600, END = 3200 + EXTRA;
      var inOut = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
      var back = function (x, k) { var c3 = k + 1; return 1 + c3 * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
      var leaf = function (el, t0, ox, oy, k) {
        var x = clamp((t - t0) / LEAF, 0, 1);
        var s = x === 0 ? 0.001 : back(x, k);
        el.setAttribute('transform', 'translate(' + ox + ' ' + oy + ') rotate(' + (-25 * (1 - x)).toFixed(2) + ') scale(' + s.toFixed(3) + ') translate(' + -ox + ' ' + -oy + ')');
      };
      var t = 0, start = null, target = null, ending = false, raf = 0;

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
          // the pumpkin stays under the witch hat; after the sleigh has gone, the dot pops in at the top
          dot.setAttribute('opacity', season.id === 'festive' ? ringIn.toFixed(3) : '0');
        }
        if (hatWrap) {
          var h = clamp((t - T_RING) / 260, 0, 1);
          hatWrap.setAttribute('opacity', h.toFixed(3));
          hatWrap.setAttribute('transform', 'translate(0 ' + (-6 * (1 - back(h, 1.2))).toFixed(2) + ')');
        }

        var w = clamp((t - T_WORD) / 400, 0, 1);
        word.style.opacity = w;
        word.style.transform = 'translateY(' + (12 * (1 - w)).toFixed(1) + 'px)';
        if (greet) {
          greet.style.opacity = w;
          greet.style.transform = word.style.transform;
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
          word.style.opacity = Math.max(0, 1 - m * 2.5);
          if (greet) greet.style.opacity = word.style.opacity;
          if (hatWrap) hatWrap.setAttribute('opacity', Math.max(0, 1 - m * 2).toFixed(3));
          skip.style.opacity = 1 - m;
          if (m === 1) art.style.opacity = 1 - clamp((t - T_MORPH - MORPH) / (END - T_MORPH - MORPH), 0, 1);
        }
        if (t >= END) return cleanup();
        raf = requestAnimationFrame(frame);
      }

      function finish() {
        if (ending || !overlay) return;
        ending = true;
        cancelAnimationFrame(raf);
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
        mark.setAttribute('viewBox', '12 2 77 91'); // room for the hat
        mark.classList.add('has-hat');
      }
      var p = document.createElement('p');
      p.className = 'season-greeting';
      p.textContent = SEASON.greeting;
      mark.insertAdjacentElement('afterend', p);
    } catch (err) { /* the plain mark stays */ }
  })();

  /* ---------- Home: links to the sign-up (and a floating "Get early access" pill) ----------
     Every link to #early-access scrolls to the hero form and puts the cursor in the email box.
     The pill is made here (no JS, no pill) and shows only further down the page while
     scrolling down. */
  (function joinLinks() {
    var form = document.querySelector('.hero form[data-waitlist]');
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

    // Shows once the visitor is well past the hero and scrolling down; scrolling back up hides it.
    // Never shown while another way to sign up is on screen (the hero form, the Pro card's
    // button, the closing section's button), so the page never asks twice at once.
    var others = [form].concat(Array.prototype.filter.call(document.querySelectorAll('a[href="#early-access"]'), function (a) { return a !== pill; }));
    var seen = others.map(function () { return false; });
    var lastY = window.scrollY || window.pageYOffset, down = false, shown = null;
    function update() {
      var y = window.scrollY || window.pageYOffset;
      if (Math.abs(y - lastY) > 8) { down = y > lastY; lastY = y; } // ignore tiny jitters
      var deep = y > window.innerHeight * 1.5;
      var on = deep && down && seen.indexOf(true) < 0;
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

  /* ---------- Hero: the phone turns to face you as you scroll; the sprout drifts ---------- */
  (function hero() {
    var section = document.querySelector('.hero');
    var phone = document.getElementById('hero-phone');
    var mark = document.querySelector('.hero-mark');
    if (!section || !phone) return;
    var visible = true, queued = false;
    var wide = window.matchMedia('(min-width: 900px)');

    function frame() {
      queued = false;
      if (still()) { phone.style.transform = 'none'; if (mark) mark.style.transform = ''; return; }
      var y = window.scrollY || window.pageYOffset;
      var p;
      if (wide.matches) {
        p = y / 320;
      } else {
        // phone sits under the copy on small screens: straighten as it comes up the screen
        var r = phone.getBoundingClientRect(), vh = window.innerHeight;
        p = Math.max(y / 320, (vh * 0.95 - r.top) / (vh * 0.55));
      }
      p = clamp(p, 0, 1);
      var e = 1 - p * p * (3 - 2 * p) ; // smoothstep, inverted: 1 = fully turned
      phone.style.transform = 'rotateY(' + (-22 * e).toFixed(2) + 'deg) rotateX(' + (8 * e).toFixed(2) +
        'deg) rotateZ(' + (1.5 * e).toFixed(2) + 'deg)';
      if (mark) mark.style.transform = 'translate3d(0,' + (y * 0.3).toFixed(1) + 'px,0)';
    }
    function queue() { if (visible && !queued) { queued = true; requestAnimationFrame(frame); } }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) queue(); }).observe(section);
    }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    if (reduce.addEventListener) reduce.addEventListener('change', queue);
    frame();
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
      function check() { if (FULL_EMAIL.test(email.value.trim())) reveal(true); }
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
        var data = {};
        new FormData(f).forEach(function (v, k) { data[k] = typeof v === 'string' ? v : ''; });
        btn.disabled = true;
        say('Adding you…');
        fetch(f.getAttribute('action'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'same-origin'
        }).then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) { return { r: r, j: j }; });
        }).then(function (x) {
          if (x.r.ok && x.j.ok) { say(''); done(f); }
          else if (x.r.status === 400 && x.j.error === 'email') say(MSG_EMAIL, true);
          else if (x.r.status === 400 && x.j.error === 'consent') say('Please tick the box so we can email you.', true);
          else say(MSG_FAIL, true);
        }).catch(function () {
          say(MSG_FAIL, true);
        }).then(function () { btn.disabled = false; });
      });
    });

    // /waitlist?joined=1 (after a no-JS post) shows the success state; with #joined the CSS already does
    if (/[?&]joined=1\b/.test(location.search) && location.hash !== '#joined' && forms[0]) done(forms[0]);
  })();
})();
