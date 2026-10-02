/* MileSprout website: hero phone tilt, the feature deck and the waitlist form.
   Vanilla JS, no libraries, no requests except the waitlist form posting to /api/waitlist.
   The page works without it: the phone sits still and every feature is listed. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function still() { return reduce.matches; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

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
