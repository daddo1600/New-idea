/* Hero scene UK1, London: the Westminster approach (local-scenes-art-direction.md §1.3, §2, §3.1).
   Elizabeth Tower in the safe box (x 268-282), the Palace roofline and Victoria Tower behind it, the
   Thames with the Embankment wall and its lamps, plane trees, bollards and double yellow lines, UK signs.
   The world is drawn in the brand's greens (lighter with distance); the signs and the bus bring the only
   real colours. No crest, portcullis, flag, TfL roundel or the word "Parliament" (research §3).
   Coordinates: viewBox 400 x 300, horizon y 150. Registered with the engine in site.js. */
(window.MSScenes = window.MSScenes || { queue: [] }).queue.push(['scene', 'uk-london', (function () {
  var FAR = '#4FA884', LIT = '#6DBC98', DEEP = '#3F9A75', PALE = '#86C9A8', MIST = '#A4D8BC', CREAM = '#FBF7EE', GOLD = '#FACC15', SHADE = '#24604A';

  // ---- Elizabeth Tower: shaft, clock stage, belfry, roof and spire; lit right face; about 76 units tall ----
  function tower() {
    var s = '';
    // shaft (y 146 -> 104): left half base tone, right half lit
    s += '<rect x="270.5" y="104" width="4.5" height="42" fill="' + FAR + '"/><rect x="275" y="104" width="4.5" height="42" fill="' + LIT + '"/>';
    // three recessed panels and the horizontal bands every 10 units
    [271.6, 274.4, 277.2].forEach(function (x) { s += '<rect x="' + x + '" y="106" width="1.1" height="38" fill="' + (x > 275 ? '#5FB18D' : DEEP) + '"/>'; });
    [114, 124, 134].forEach(function (y) { s += '<rect x="270.5" y="' + y + '" width="9" height=".7" fill="' + PALE + '" opacity=".7"/>'; });
    // clock stage (y 104 -> 92), overhanging a unit each side, with a pointed gable over the dial
    s += '<rect x="269.5" y="92" width="5.5" height="12" fill="' + FAR + '"/><rect x="275" y="92" width="5.5" height="12" fill="' + LIT + '"/>';
    s += '<path d="M269.5 92.3 275 88.8 280.5 92.3Z" fill="' + DEEP + '"/>';
    // the dial: cream, a thin gold rim, four ticks, hands at about ten to two (a pleasant V)
    s += '<circle cx="275" cy="98" r="4.1" fill="' + CREAM + '" stroke="' + GOLD + '" stroke-width=".6"/>';
    s += '<path d="M275 94.4v.9M275 100.7v.9M271.4 98h.9M277.7 98h.9" stroke="' + SHADE + '" stroke-width=".45"/>';
    s += '<path d="M275 98 276.7 96.9M275 98 272.4 96.4" stroke="' + SHADE + '" stroke-width=".55" stroke-linecap="round"/><circle cx="275" cy="98" r=".45" fill="' + SHADE + '"/>';
    // belfry (y 92 -> 84) with three pointed arches
    s += '<rect x="270.5" y="84" width="4.5" height="8" fill="' + FAR + '"/><rect x="275" y="84" width="4.5" height="8" fill="' + LIT + '"/>';
    [272.3, 275, 277.7].forEach(function (x) { s += '<path d="M' + (x - .8) + ' 91V87.4Q' + x + ' 85.6 ' + (x + .8) + ' 87.4V91Z" fill="' + SHADE + '"/>'; });
    // corner pinnacles on the belfry
    [270.9, 272.7, 277.3, 279.1].forEach(function (x) { s += '<path d="M' + (x - .45) + ' 84 ' + x + ' 80.6 ' + (x + .45) + ' 84Z" fill="' + (x > 275 ? LIT : FAR) + '"/>'; });
    // the roof (a steep pyramid), the lantern and the spire, with a short gold finial
    s += '<path d="M270.8 84 273.6 77.4H275V84Z" fill="' + DEEP + '"/><path d="M275 84V77.4H276.4L279.2 84Z" fill="' + FAR + '"/>';
    s += '<rect x="273.9" y="75.4" width="1.1" height="2.1" fill="' + DEEP + '"/><rect x="275" y="75.4" width="1.1" height="2.1" fill="' + FAR + '"/>';
    s += '<path d="M273.8 75.5 275 71.4 276.2 75.5Z" fill="' + DEEP + '"/><path d="M275 71.4 276.2 75.5H275Z" fill="' + FAR + '"/>';
    s += '<rect x="274.65" y="69.4" width=".7" height="2.2" fill="' + GOLD + '"/>';
    return s;
  }

  // ---- The Palace roofline (low and long, mostly behind the phone) and Victoria Tower further off ----
  function palace() {
    var s = '';
    // Victoria Tower: square, flat-topped, corner turrets (more distant, paler)
    s += '<rect x="233" y="107" width="11" height="39" fill="' + PALE + '"/><rect x="238.5" y="107" width="5.5" height="39" fill="' + MIST + '"/>';
    [233.4, 236.6, 240.4, 243.6].forEach(function (x) { s += '<path d="M' + (x - .6) + ' 107V103.6L' + x + ' 101.4L' + (x + .6) + ' 103.6V107Z" fill="' + PALE + '"/>'; });
    for (var y = 110; y < 144; y += 6) s += '<rect x="234.4" y="' + y + '" width="8.2" height=".6" fill="' + MIST + '" opacity=".8"/>';
    // the long river front: one block, a row of thin pinnacles every 3 units, a few taller bays
    s += '<rect x="138" y="133" width="131" height="13" fill="' + FAR + '"/><rect x="138" y="133" width="131" height="2" fill="' + LIT + '" opacity=".6"/>';
    var p = '';
    for (var x = 139.5; x < 268; x += 3) p += 'M' + (x - .45) + ' 133 ' + x + ' 130.4 ' + (x + .45) + ' 133Z';
    s += '<path d="' + p + '" fill="' + FAR + '"/>';
    [[150, 126], [174, 128], [196, 124], [222, 127], [252, 128]].forEach(function (b) {
      s += '<rect x="' + (b[0] - 3) + '" y="' + b[1] + '" width="6" height="' + (146 - b[1]) + '" fill="' + FAR + '"/><rect x="' + b[0] + '" y="' + b[1] + '" width="3" height="' + (146 - b[1]) + '" fill="' + LIT + '"/>';
      // each bay ends in a pair of slim pinnacled turrets, not a roof
      [b[0] - 2.4, b[0] + 2.4].forEach(function (x) { s += '<path d="M' + (x - .6) + ' ' + b[1] + 'V' + (b[1] - 1.6) + 'L' + x + ' ' + (b[1] - 4.4) + 'L' + (x + .6) + ' ' + (b[1] - 1.6) + 'V' + b[1] + 'Z" fill="' + (x > b[0] ? LIT : FAR) + '"/>'; });
      s += '<rect x="' + (b[0] - 3) + '" y="' + (b[1] + 2) + '" width="6" height=".6" fill="' + DEEP + '"/>';
    });
    // the central tower's slim spire
    s += '<rect x="206" y="119" width="5" height="14" fill="' + PALE + '"/><path d="M206 119 208.5 105.5 211 119Z" fill="' + PALE + '"/>';
    // windows: a sparse line of tall arches on the river front
    var w = '';
    for (x = 142; x < 266; x += 4.5) w += 'M' + x + ' 144.4V139.6Q' + (x + .55) + ' 138.6 ' + (x + 1.1) + ' 139.6V144.4Z';
    s += '<path d="' + w + '" fill="' + DEEP + '" opacity=".75"/>';
    return s;
  }

  // ---- South Bank: a few low generic blocks (right of the safe box: shows on phones) ----
  function southBank() {
    var s = '', blocks = [[296, 134, 10], [305, 128, 8], [312, 136, 12], [324, 131, 9], [333, 138, 14], [347, 133, 10], [357, 139, 16]];
    blocks.forEach(function (b, i) {
      s += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + (146 - b[1]) + '" fill="' + (i % 2 ? MIST : PALE) + '"/>';
      if (i === 1 || i === 4) for (var y = b[1] + 3; y < 144; y += 4) for (var x = b[0] + 1.5; x < b[0] + b[2] - 1; x += 2.5) s += '<rect x="' + x + '" y="' + y + '" width="1" height="1.2" fill="' + CREAM + '" opacity=".7"/>';
    });
    return s;
  }

  // ---- The Thames, the Embankment wall and its lamp standards (mid layer) ----
  function river() {
    var s = '<rect x="-60" y="145.6" width="520" height="6" fill="url(#sc-water)"/>';
    s += '<g class="sc-glints" fill="' + CREAM + '"><rect x="232" y="147.2" width="7" height=".55" rx=".3"/><rect x="290" y="148.4" width="10" height=".55" rx=".3"/><rect x="330" y="147" width="5" height=".5" rx=".3"/><rect x="120" y="148.6" width="8" height=".55" rx=".3"/></g>';
    s += '<rect x="-60" y="151.4" width="520" height="3.4" fill="#9CC8AE"/><rect x="-60" y="151.4" width="520" height=".8" fill="#C4E3CF"/>';
    var l = '';
    for (var x = -50; x < 460; x += 13) l += '<rect x="' + (x - .25) + '" y="146.4" width=".5" height="5.2" fill="' + SHADE + '"/><circle cx="' + x + '" cy="146.2" r=".85" fill="' + CREAM + '"/>';
    return s + l;
  }

  var far = '<g data-depth=".15">' + southBank() + palace() + tower() + '</g>';

  // ---- Signs (UK): Transport-style lettering, real colours (local-scenes-art-direction.md §3.1) ----
  var GREEN = '#00703C', BLUE = '#1D5BAA', BROWN = '#7B3F1E', YELLOW = '#FFD200', WHITE = '#FFFFFF';
  function ahead(x, y, h, fill) {
    // the UK ahead arrow: a stem with a broad open head
    var w = h * 0.62, st = h * 0.17;
    return '<path d="M' + x + ' ' + (y - h) + 'L' + (x + w / 2) + ' ' + (y - h + w * .62) + 'H' + (x + st / 2) + 'V' + y + 'H' + (x - st / 2) + 'V' + (y - h + w * .62) + 'H' + (x - w / 2) + 'Z" fill="' + fill + '"/>';
  }
  function rosette(cx, cy, r, fill) {
    // the white tourist-attraction symbol on brown signs (a simplified rosette)
    var s = '';
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      s += '<ellipse cx="' + (cx + Math.cos(a) * r * .52).toFixed(2) + '" cy="' + (cy + Math.sin(a) * r * .52).toFixed(2) + '" rx="' + (r * .34).toFixed(2) + '" ry="' + (r * .22).toFixed(2) + '" transform="rotate(' + (i * 45) + ' ' + (cx + Math.cos(a) * r * .52).toFixed(2) + ' ' + (cy + Math.sin(a) * r * .52).toFixed(2) + ')" fill="' + fill + '"/>';
    }
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * .28) + '" fill="' + fill + '"/>';
  }

  // Each sign: a face (w x h, in sign px) on posts; world = its width in road units; X = where it stands.
  function signs(ctx) {
    var T = ctx.text; // T(str, face, cap, x, y, fill, anchor) -> markup; T.width(str, face, cap)
    var rate = ctx.rate('UK'); // e.g. { first: '55p', limit: '10,000' } from the calculator's RATES
    var list = [];
    // 1. Primary route, ahead: Westminster / Home 2¼
    (function () {
      var w = 176, h = 74, c = 15;
      var face = '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="5" fill="' + GREEN + '"/><rect x="2.5" y="2.5" width="' + (w - 5) + '" height="' + (h - 5) + '" rx="3.5" fill="none" stroke="' + WHITE + '" stroke-width="2"/>';
      face += ahead(20, 32, 20, WHITE) + T('Westminster', 'uk.medium', c, 36, 30, WHITE);
      face += ahead(20, 62, 20, WHITE) + T('Home', 'uk.medium', c, 36, 60, WHITE) + T('2¼', 'uk.medium', c, w - 12, 60, WHITE, 'end');
      list.push({ w: w, h: h, face: face, world: 3.68, posts: 2 });
    })();
    // 2. The rate, on a green primary sign: 55p a work mile / first 10,000 (from RATES, like the calculator)
    (function () {
      var w = 182, h = 68, c = 16;
      var face = '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="5" fill="' + GREEN + '"/><rect x="2.5" y="2.5" width="' + (w - 5) + '" height="' + (h - 5) + '" rx="3.5" fill="none" stroke="' + WHITE + '" stroke-width="2"/>';
      face += '<rect x="12" y="12" width="' + (T.width(rate.first, 'uk.medium', c) + 10) + '" height="' + (c + 10) + '" rx="2" fill="' + GREEN + '" stroke="' + YELLOW + '" stroke-width="0"/>';
      face += T(rate.first, 'uk.medium', c, 17, 17 + c, YELLOW) + T('a work mile', 'uk.medium', c, 27 + T.width(rate.first, 'uk.medium', c), 17 + c, WHITE);
      face += T('first ' + rate.limit, 'uk.medium', 11, 17, 56, WHITE) + ahead(w - 22, 58, 22, WHITE);
      list.push({ w: w, h: h, face: face, world: 3.68, posts: 2 });
    })();
    // 3. Brown tourist sign: Westminster, with the attraction symbol
    (function () {
      var w = 150, h = 40, c = 15;
      var face = '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="4" fill="' + BROWN + '"/><rect x="2.5" y="2.5" width="' + (w - 5) + '" height="' + (h - 5) + '" rx="3" fill="none" stroke="' + WHITE + '" stroke-width="2"/>';
      face += rosette(22, 20, 11, WHITE) + T('Westminster', 'uk.medium', c, 40, 20 + c / 2, WHITE);
      list.push({ w: w, h: h, face: face, world: 3.02, posts: 2 });
    })();
    // Parked: one blue sign, a P over a two-line plate ("Drive" / "logged", cap height at least 9 CSS px at rest),
    // the same width, inside one white border; on a grey post centred under it, down to the kerb (or verge)
    var parked = (function () {
      var c = 36, sq = 0.68; // the plate's lettering, a little condensed so the P panel stays about 33 CSS px wide
      var w = Math.max(104, Math.ceil(T.width('logged', 'uk.medium', c) * sq) + 20);
      var line = function (str, y) { return '<g transform="translate(' + w / 2 + ' 0) scale(' + sq + ' 1) translate(' + (-w / 2) + ' 0)">' + T(str, 'uk.medium', c, w / 2, y, WHITE, 'middle') + '</g>'; };
      var y1 = w + 2 + c, y2 = y1 + c * 1.42, h = y2 + 14;
      var face = '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="7" fill="' + BLUE + '"/><rect x="3.5" y="3.5" width="' + (w - 7) + '" height="' + (h - 7) + '" rx="5" fill="none" stroke="' + WHITE + '" stroke-width="3"/>';
      face += T('P', 'uk.heavy', w * 0.62, w / 2, w * 0.81, WHITE, 'middle') + line('Drive', y1) + line('logged', y2);
      return { w: w, h: h, face: face, world: 0.8, posts: 1, postH: 0.45 };
    })();
    return { passing: list, parked: parked };
  }

  // ---- The ambient detail: a red double-decker on the Embankment (generic, no TfL, blind "Home") ----
  function bus(ctx) {
    var R = '#D7262E', RD = '#A51C22', DARK = '#1E2B26', G = '';
    G += '<rect x="0" y="0" width="22" height="10.6" rx="1.6" fill="' + R + '"/><rect x="0" y="5.2" width="22" height="5.4" rx="1" fill="' + RD + '" opacity=".35"/>';
    G += '<rect x="1.2" y="1.2" width="19.6" height="2.9" rx=".6" fill="' + DARK + '"/><rect x="5.6" y="5.9" width="15.2" height="2.5" rx=".5" fill="' + DARK + '"/>';
    G += '<rect x=".8" y="5.6" width="3.8" height="4" rx=".4" fill="' + DARK + '" opacity=".85"/>';
    G += '<rect x="1.2" y="1.25" width="5" height="1.1" fill="#111"/>' + ctx.text('Home', 'uk.medium', .75, 1.6, 2.2, YELLOW);
    G += '<circle cx="4.6" cy="10.8" r="1.35" fill="#111"/><circle cx="17.4" cy="10.8" r="1.35" fill="#111"/><circle cx="4.6" cy="10.8" r=".5" fill="#9AA"/><circle cx="17.4" cy="10.8" r=".5" fill="#9AA"/>';
    return '<g class="sc-bus">' + G + '</g>';
  }

  return {
    side: 'left',
    sky: ['#0B7A55', '#4DB98C', '#D3EFDF'],
    ground: ['#3B8F67', '#0E5A3E'],
    water: ['#0E6E62', '#2FA38E'],
    sun: { cx: 308, cy: 109, r: 10 },
    clouds: [[150, 86, 170, 7, .26], [20, 104, 90, 5, .2]],
    far: far,
    mid: '<g data-depth=".4">' + river() + '</g>',
    rows: [['plane', -3.2, 6, 3, 8], ['plane', 5.7, 6.5, 5, 7], ['lamp', 4.05, 4.5, 2.5, 11], ['bollard', 3.55, 3, 1.2, 16], ['dash', 1.1, 2.6, .8, 18]],
    // the double yellows are drawn by the engine with the parking bay (they stop short of it and start again)
    lines: [['rd-line', 3.09, 3.15]],
    bay: { yellow: [[-0.87, -0.83], [-0.78, -0.74]], kerb: -0.95, x: 0.3, zA: 0.6, zB: 3.0 },
    // the P sign by the bay where the car stops (on wide screens across the road, clear of the phone);
    // it comes into view as the car slows (1.8 s)
    parked: { X: -1.05, z: 3.0, wideX: 3.3, wideZ: 6, from: 1.8, fadeOut: [9.1, 9.4] },
    dash: 'rd-dash-w',
    templates: {
      // London plane: an irregular, wider crown in 3-4 lobes with a paler mottled patch; a pale mottled trunk
      plane: '<path class="lt-trunk" d="M-.07 0-.05-.95h.1l.03.95Z"/><path class="lt-bark" d="M-.04-.3h.05v.08h-.05ZM.0-.62h.04v.07h-.04Z"/>' +
        '<ellipse class="rd-crown-d" cx=".06" cy="-1.1" rx=".74" ry=".36"/><ellipse class="rd-crown" cx="-.36" cy="-1.28" rx=".42" ry=".38"/>' +
        '<ellipse class="rd-crown" cx=".16" cy="-1.5" rx=".52" ry=".46"/><ellipse class="rd-crown" cx=".56" cy="-1.2" rx=".34" ry=".31"/>' +
        '<ellipse class="rd-crown-l" cx=".38" cy="-1.66" rx=".22" ry=".15"/><ellipse class="lt-mottle" cx="-.22" cy="-1.36" rx=".13" ry=".08"/><ellipse class="lt-mottle" cx=".1" cy="-1.22" rx=".1" ry=".06"/>',
      // a dolphin-style lamp standard, simplified: a dark post and a cream globe
      lamp: '<path class="lt-iron" d="M-.07 0h.14l-.03-.14h-.08ZM-.022-.14h.044v-1.4h-.044Z"/><path class="lt-iron" d="M-.06-1.52h.12v-.05h-.12Z"/><circle class="lt-globe" cx="0" cy="-1.66" r=".1"/>',
      // a black bollard with a gold band
      bollard: '<rect class="lt-iron" x="-.05" y="-.34" width=".1" height=".34" rx=".04"/><rect class="lt-band" x="-.05" y="-.27" width=".1" height=".035"/>'
    },
    signX: 3.6,
    signs: signs,
    glyphs: 'uk',
    ambient: {
      layer: 'mid', // behind every sign, post, near tree and bollard
      markup: bus,
      // right to left along the Embankment, in front of Elizabeth Tower, while the camera is wide: from
      // 8.6 s (the zoom easing out) to 1.2 s into the next loop; at rest it waits by the tower
      at: function (t, still) {
        if (still) return { x: 248, y: 140.8, o: 1 }; // left of the tower, clear of the P sign at every width
        var k = t >= 8.6 ? (t - 8.6) / 2.2 : t < 1.2 ? (t + 1.0) / 2.2 : -1;
        if (k < 0) return null;
        return { x: 340 - 140 * k, y: 140.8, o: 1 };
      }
    }
  };
})()]);
