/* MileMint site: shared behaviour. No tracking, no cookies, no storage. */
(function () {
  'use strict';

  /* App Store buttons: <a class="appstore" data-appstore>…</a> */
  var live = typeof APP_STORE_LIVE !== 'undefined' && APP_STORE_LIVE;
  document.querySelectorAll('[data-appstore]').forEach(function (a) {
    a.setAttribute('data-live', String(live));
    if (live) {
      a.href = APP_STORE_URL;
      a.querySelector('small').textContent = a.getAttribute('data-live-small') || 'Download on the';
      a.querySelector('strong').textContent = a.getAttribute('data-live-strong') || 'App Store';
      a.setAttribute('aria-label', 'Download MileMint on the App Store');
    }
  });

  /* Founding 1,000 counter: reads data/founders.json ({"taken": 0}). */
  var counters = document.querySelectorAll('[data-founders]');
  if (counters.length) {
    var total = typeof FOUNDING_TOTAL !== 'undefined' ? FOUNDING_TOTAL : 1000;
    var render = function (taken) {
      taken = Math.max(0, Math.min(total, Math.round(Number(taken) || 0)));
      var fmt = new Intl.NumberFormat('en-GB');
      counters.forEach(function (el) {
        var n = el.querySelector('[data-founders-taken]');
        var t = el.querySelector('[data-founders-total]');
        var bar = el.querySelector('.counter-bar span');
        var meter = el.querySelector('.counter-bar');
        if (n) n.textContent = fmt.format(taken);
        if (t) t.textContent = fmt.format(total);
        if (bar) bar.style.width = (taken / total * 100) + '%';
        if (meter) meter.setAttribute('aria-valuenow', String(taken));
      });
    };
    fetch('/data/founders.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) render(d.taken); })
      .catch(function () { /* keep the number already in the HTML */ });
  }

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());
})();
