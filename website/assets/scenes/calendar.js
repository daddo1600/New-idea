/* Seasonal and celebration overlays for the hero scenes, keyed by date windows.
   The engine in site.js reads this list on every page view: when today (the visitor's own date) falls in
   a window, and the scene and country match, it loads assets/scenes/overlays/<id>.js, which registers an
   overlay with draw(layer, ctx) (snow on the hills, bunting, a pumpkin by the sign…). Dates come from
   research_notes/launch-2026/scene-calendar.md (research agent). Nothing is live until an overlay passes
   marketing and QA; add it here then.

   Entry: { id: 'us-july4', from: '07-04', to: '07-04', countries: ['US'], scenes: ['*'] }
     from / to: MM-DD, inclusive; a window may wrap the year end (from '12-20', to '01-02').
     year: optional, for dates that move (Easter): { year: 2027, from: '03-26', to: '03-29' }.
     countries: the visitor's country by time zone ('GB', 'US', 'CA', 'AU'), or ['*'].
     scenes: scene ids, or ['*'].
   The seasonal overlays stay off until each scene's season art passes review (as SEASONS_LIVE in season.js). */
(window.MSScenes = window.MSScenes || { queue: [] }).queue.push(['calendar', [
]]);
