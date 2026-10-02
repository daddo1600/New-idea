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
     Everything is drawn from one clock in requestAnimationFrame, so a skip or an error just ends it. */
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
      var ROAD = 'M50 87 C50 78 38 74 40 64 C42 55 54 54 54 44 C54 37 50 35 51 30';
      var LOW = 'M47 54 C37 55 20 48 14 34 C27 32 41 39 47 54Z';
      var UP = 'M52 31 C56 19 70 11 86 11 C85 25 70 34 52 31Z';
      overlay = document.createElement('div');
      overlay.className = 'sprout-intro';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML =
        '<div class="intro-bg"></div>' +
        '<div class="intro-stage"><svg class="intro-art" viewBox="12 9 77 84" fill="none">' +
          '<defs><linearGradient id="ms-intro-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#77E8A0"/><stop offset="1" stop-color="#24B359"/></linearGradient>' +
          '<mask id="ms-intro-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><path class="i-mask" d="' + ROAD + '" stroke="#FFF" stroke-width="10" stroke-linecap="round" fill="none"/></mask></defs>' +
          '<path class="i-soil" d="M30 88 Q50 84 70 88" stroke="#064E3B" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>' +
          '<g class="i-leaf i-low"><path d="' + LOW + '" fill="#085E42" opacity=".5" transform="translate(1.2 1.6)"/><path d="' + LOW + '" fill="url(#ms-intro-leaf)"/></g>' +
          '<g class="i-leaf i-up"><path d="' + UP + '" fill="#085E42" opacity=".5" transform="translate(1.2 1.6)"/><path d="' + UP + '" fill="url(#ms-intro-leaf)"/></g>' +
          '<path class="i-road" d="' + ROAD + '" stroke="#064E3B" stroke-width="8" stroke-linecap="round"/>' +
          '<path class="i-dash" d="' + ROAD + '" stroke="#FBF7EE" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="2.6 3.2" stroke-dashoffset="-3" mask="url(#ms-intro-mask)"/>' +
          '<g class="i-dot"><circle class="i-ring" r="7.6" fill="#FFFFFF"/><circle r="5.6" fill="#FACC15"/></g>' +
        '</svg>' +
        '<p class="intro-word"><span class="wm-mile">Mile</span><span class="wm-sprout">Sprout</span></p></div>' +
        '<button type="button" class="intro-skip" tabindex="-1">Skip intro</button>';
      document.body.appendChild(overlay);
      root.classList.remove('ms-intro'); // the overlay takes over from the plain cover

      var q = function (s) { return overlay.querySelector(s); };
      var bg = q('.intro-bg'), stage = q('.intro-stage'), art = q('.intro-art'), word = q('.intro-word'), skip = q('.intro-skip');
      var road = q('.i-road'), mask = q('.i-mask'), dot = q('.i-dot'), ring = q('.i-ring');
      var low = q('.i-low'), up = q('.i-up');
      var L = road.getTotalLength();
      road.style.strokeDasharray = mask.style.strokeDasharray = L + ' ' + (L + 1);

      var T_DRIVE = 250, DRIVE = 1400, T_LOW = 1050, T_UP = 1400, LEAF = 300, T_RING = 1650, T_WORD = 1700,
          T_MORPH = 2450, MORPH = 600, END = 3200;
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
        dot.setAttribute('transform', 'translate(' + pt.x.toFixed(2) + ' ' + (pt.y + lift - (p === 1 ? 2 : 2 * p)).toFixed(2) + ') scale(' + (pop * glint).toFixed(3) + ')');
        ring.setAttribute('r', (5.6 + 2 * clamp((t - T_RING) / 150, 0, 1)).toFixed(2));
        leaf(low, T_LOW, 47, 54, 1.0);
        leaf(up, T_UP, 52, 31, 1.3);
        var w = clamp((t - T_WORD) / 400, 0, 1);
        word.style.opacity = w;
        word.style.transform = 'translateY(' + (12 * (1 - w)).toFixed(1) + 'px)';

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
          word.style.opacity = Math.max(0, 1 - m * 2.5);
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
