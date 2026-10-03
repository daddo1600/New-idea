/* Hero scene S0, the standard scene: "the brand road" (local-scenes-art-direction.md §1.3 S0, §3.5).
   Shown whenever we can't tell where a visitor is, or shouldn't (EU, VPN-like, privacy tools), and without
   JavaScript. Its landscape is the inline markup in index.html (so it paints at once); this file adds
   what moves: the brand signs (ours, not any country's style) and the birds while the car is parked. */
(window.MSScenes = window.MSScenes || { queue: [] }).queue.push(['scene', 'standard', (function () {
  var BRAND = '#0B7A55', CREAM = '#FBF7EE', GOLD = '#FACC15';
  function sprout(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-3 4C-7 4-11 1-12-3-8-3-4-1-3 4Z" fill="#77E8A0"/><path d="M0-1C1-5 5-8 10-8 10-4 5-1 0-1Z" fill="#77E8A0"/><path d="M-1 9C-1 6-3 5-2 2S1-1 1-3" stroke="' + CREAM + '" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="1.2" cy="-4" r="1.8" fill="' + GOLD + '"/></g>';
  }
  function up(x, y, h) {
    var w = h * .62, st = h * .18;
    return '<path d="M' + x + ' ' + (y - h) + 'L' + (x + w / 2) + ' ' + (y - h + w * .62) + 'H' + (x + st / 2) + 'V' + y + 'H' + (x - st / 2) + 'V' + (y - h + w * .62) + 'H' + (x - w / 2) + 'Z" fill="' + CREAM + '"/>';
  }
  function signs(ctx) {
    var T = ctx.text;
    // a rounded brand-green board with a gold top rule and the sprout; one or two lines of cream text
    function board(lines, arrow) {
      var c = 15, pad = 14, gap = 8;
      var tw = Math.max.apply(null, lines.map(function (l) { return T.width(l, 'brand.bold', c); }));
      var w = Math.round(pad * 2 + 22 + tw + (arrow ? 26 : 0)), h = Math.round(pad + 6 + lines.length * c + (lines.length - 1) * gap + pad);
      var s = '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="9" fill="' + BRAND + '"/><rect x="9" y="0" width="' + (w - 18) + '" height="4" rx="2" fill="' + GOLD + '"/>';
      s += sprout(pad + 6, h / 2 + 1, 0.95);
      lines.forEach(function (l, i) { s += T(l, 'brand.bold', c, pad + 22, pad + 6 + c + i * (c + gap), CREAM); });
      if (arrow) s += up(w - pad - 8, h - pad + 2, 22);
      return { w: w, h: h, face: s, world: w / 78, posts: 1, post: '#E7EFEA' };
    }
    var parked = (function () {
      // the app's own round sign: a white badge with the fuel glyph
      var w = 46, h = 46, INK = '#14261F';
      var s = '<circle cx="23" cy="23" r="22" fill="#FFFFFF" stroke="' + BRAND + '" stroke-width="2.5"/>' +
        '<g transform="translate(9 8) scale(1.25)"><rect x="4" y="4" width="10" height="16" rx="1.5" fill="' + INK + '"/><rect x="6" y="6.5" width="6" height="4" rx=".8" fill="' + GOLD + '"/><path d="M14 8h1.5a2 2 0 0 1 2 2v5.5a1.5 1.5 0 0 0 3 0V9l-2-2" stroke="' + INK + '" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>';
      return { w: w, h: h, face: s, world: 0.5, posts: 1, post: '#E7EFEA' };
    })();
    return {
      passing: [board(['Every work mile', 'adds up'], true), board(['Logged by itself'], true), board(['Stays on your phone'], false)],
      parked: parked
    };
  }
  // two birds, wings beating, crossing the sky while the car is parked
  function birds() {
    var b = function (x, y) { return '<path class="sc-wing" transform="translate(' + x + ' ' + y + ')" d="M-3 0Q-1.5-1.6 0 0Q1.5-1.6 3 0" fill="none" stroke="#0A3D2C" stroke-width=".7" stroke-linecap="round"/>'; };
    return '<g class="sc-birds">' + b(0, 0) + b(6, 2.4) + '</g>';
  }
  return {
    side: 'left',
    signs: signs,
    glyphs: 'brand',
    signX: 3.6,
    ambient: {
      markup: birds,
      at: function (t, still) {
        if (still) return null;
        if (t < 3.0 || t > 8.4) return null;
        var k = (t - 3.0) / 5.4;
        return { x: 380 - 230 * k, y: 100 - 14 * Math.sin(k * Math.PI), o: 1, flap: (t * 6) % 1 > .5 };
      }
    }
  };
})()]);
