/* Home page only, loaded before the page paints: keeps the page at the top on load, and decides whether the sprout intro plays
   (once per browser session; with reduced motion it's a still, see site.js) and, if so, puts up a plain green
   cover so the hero doesn't flash first. site.js swaps the cover for the animation. If
   site.js never runs, the cover fades away by itself (CSS failsafe in site.css).
   ?season=<id> (a preview of a season, see season.js) or ?intro=1 plays it again. */
(function () {
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
