/* Home page only, loaded before the page paints: decides whether the sprout intro plays
   (once per browser session, never with reduced motion) and, if so, puts up a plain green
   cover so the hero doesn't flash first. site.js swaps the cover for the animation. If
   site.js never runs, the cover fades away by itself (CSS failsafe in site.css). */
(function () {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.sessionStorage.getItem('ms-intro-seen')) return;
    document.documentElement.classList.add('ms-intro');
  } catch (err) { /* storage blocked: no intro */ }
})();
