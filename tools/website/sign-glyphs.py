"""Turns the letters used on the hero's road signs into SVG path data (no web font, so the CSP stays clean
and every phone draws the same letters), and writes them as small scripts the scene engine loads:

  python3 tools/website/sign-glyphs.py      -> website/assets/scenes/glyphs-uk.js, glyphs-brand.js

UK signs use Liberation Sans (SIL Open Font Licence) as a stand-in for Transport: the real Transport
outlines are pending the font licence check (local-scenes-art-direction.md §3 [R]). Two touches bring it
closer to Transport: the lower-case l gets Transport's tail at the foot, and the letters are spaced a
little wider. The standard scene's brand signs use Inter (SIL OFL), the site's own look.
Glyphs are scaled so the cap height is 100 units; they sit on y = 0 and caps reach y = -100.
"""
import json, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'website', 'assets', 'scenes')
LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:'’¼½¾-£$¢/&()"
SETS = {
    'uk': {
        'medium': ('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 1.06),  # Transport Medium stand-in
        'heavy': ('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 1.04),      # Transport Heavy stand-in
    },
    'brand': {
        'bold': ('/root/.fonts/Inter-Bold.ttf', 1.0),
    },
}


def face(path, spacing, transport):
    f = TTFont(path)
    cmap = f.getBestCmap()
    gs = f.getGlyphSet()
    cap = f['OS/2'].sCapHeight or int(f['head'].unitsPerEm * 0.7)
    k = 100 / cap
    out = {}
    for ch in LETTERS:
        name = cmap.get(ord(ch))
        if not name:
            continue
        pen = SVGPathPen(gs, ntos=lambda v: '%.0f' % v)
        gs[name].draw(TransformPen(pen, (k, 0, 0, -k, 0, 0)))
        d = pen.getCommands()
        adv = round(gs[name].width * k * spacing)
        if transport and ch == 'l':
            # Transport's l: the stem curves right into a short tail at the baseline
            from fontTools.pens.boundsPen import BoundsPen
            bp = BoundsPen(gs)
            gs[name].draw(bp)
            x0, _, x1, top = [v * k for v in bp.bounds]
            sw = x1 - x0
            d = 'M%.0f %.0fV%.0fQ%.0f 0 %.0f 0H%.0fV%.0fH%.0fQ%.0f %.0f %.0f %.0fV%.0fZ' % (
                x0, -top, -sw * 1.6, x0, x0 + sw * 1.9, x0 + sw * 2.25, -sw * .8, x0 + sw * 1.9,
                x0 + sw, -sw * .8, x0 + sw, -sw * 1.7, -top)
            adv = round(adv + sw * 1.0)
        out[ch] = [adv, d]
    return out


os.makedirs(OUT, exist_ok=True)
for name, faces in SETS.items():
    data = {fname: face(path, sp, name == 'uk') for fname, (path, sp) in faces.items()}
    js = ('/* Road-sign lettering for the hero scenes, as SVG paths (made by tools/website/sign-glyphs.py; do not edit). */\n'
          '(window.MSScenes = window.MSScenes || { queue: [] }).queue.push(["glyphs", "%s", %s]);\n'
          % (name, json.dumps(data, separators=(',', ':'), ensure_ascii=False)))
    p = os.path.join(OUT, 'glyphs-%s.js' % name)
    open(p, 'w').write(js)
    print(p, len(js))
