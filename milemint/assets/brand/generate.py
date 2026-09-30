"""Generate MileMint app icons and brand images from one source.

The mark is a serrated mint leaf whose centre vein is a road, starting at a
gold coin: every mile driven turns into money saved.

Usage (from milemint/):  pip install cairosvg pillow && python3 assets/brand/generate.py
"""
import io
import math
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "assets" / "brand"
IMAGES = ROOT / "assets" / "images"

GOLD = "#FACC15"
ROAD = "#064E3B"
VEIN = "#15803D"
SHADOW = "#011C14"

GRADIENTS = (
    '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
    '<stop offset="0" stop-color="#0E9F6E"/><stop offset="1" stop-color="#053D2E"/></linearGradient>'
    '<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">'
    '<stop offset="0" stop-color="#BBF7D0"/><stop offset="0.5" stop-color="#4ADE80"/>'
    '<stop offset="1" stop-color="#16A34A"/></linearGradient>'
)


def _cubic(points, t):
    u = 1 - t
    return tuple(
        u**3 * a + 3 * u * u * t * b + 3 * u * t * t * c + t**3 * d for a, b, c, d in zip(*points)
    )


def leaf_path(teeth=9, depth=24, steps=200):
    """Ovate leaf with saw-tooth edges, base at y=+330 and tip at y=-440."""
    right = [(0, 330), (360, 280), (220, -140), (0, -440)]
    points = []
    for side in (1, -1):
        edge = []
        for i in range(steps + 1):
            t = i / steps
            x, y = _cubic([(side * px, py) for px, py in right], t)
            envelope = math.sin(math.pi * min(1, max(0, (t - 0.15) / 0.7)))
            tooth = 1 - abs(2 * ((teeth * t) % 1) - 1)
            edge.append((x + side * depth * envelope * tooth, y))
        points += edge if side == 1 else edge[::-1]
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in points) + "Z"


LEAF = leaf_path()
ROAD_PATH = "M0,420 C-20,200 25,0 0,-330"


def veins():
    paths = []
    for y in (200, 90, -20, -130, -230):
        for s in (1, -1):
            paths.append(
                f'<path d="M0,{y} Q{s * 117},{y - 52} {s * 286},{y - 150}" stroke="{VEIN}" '
                'stroke-opacity="0.45" stroke-width="13" fill="none" stroke-linecap="round"/>'
            )
    return "".join(paths)


def mark(mono=False):
    """The mark, drawn in a 1024x1024 box."""
    if mono:  # single-colour silhouette for Android themed icons
        body = f'<path d="{LEAF}" fill="#FFFFFF"/><circle cx="0" cy="430" r="58" fill="#FFFFFF"/>'
    else:
        body = (
            f'<path d="{LEAF}" transform="translate(-14 18)" fill="{SHADOW}" fill-opacity="0.3"/>'
            f'<path d="{LEAF}" fill="url(#leaf)"/>'
            f'<g clip-path="url(#leafclip)">{veins()}</g>'
            f'<path d="{ROAD_PATH}" stroke="{ROAD}" stroke-width="62" fill="none" stroke-linecap="round"/>'
            f'<path d="{ROAD_PATH}" stroke="#FFFFFF" stroke-width="10" fill="none" '
            'stroke-dasharray="30 26" stroke-linecap="round"/>'
            f'<circle cx="0" cy="430" r="58" fill="{GOLD}" stroke="#FFFFFF" stroke-width="16"/>'
        )
    return f'<g transform="translate(530 490) rotate(40)">{body}</g>'


def svg(background=False, scale=1.0, mono=False):
    offset = 1024 * (1 - scale) / 2
    bg = '<rect width="1024" height="1024" fill="url(#bg)"/>' if background else ""
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">'
        f'<defs>{GRADIENTS}<clipPath id="leafclip"><path d="{LEAF}"/></clipPath></defs>{bg}'
        f'<g transform="translate({offset} {offset}) scale({scale})">{mark(mono)}</g></svg>'
    )


def png(svg_text, path, px, opaque=False):
    data = cairosvg.svg2png(bytestring=svg_text.encode(), output_width=px, output_height=px)
    img = Image.open(io.BytesIO(data))
    if opaque:  # App Store icons must not have an alpha channel
        img = img.convert("RGB")
    img.save(path, optimize=True)


def main():
    icon = svg(background=True, scale=0.92)
    (BRAND / "icon.svg").write_text(icon)
    (BRAND / "mark.svg").write_text(svg())

    png(icon, IMAGES / "icon.png", 1024, opaque=True)
    png(icon, IMAGES / "favicon.png", 48, opaque=True)
    png(svg(), IMAGES / "splash-icon.png", 512)
    # Android adaptive icon: art must sit inside the central 66% safe zone.
    png(svg(scale=0.62), IMAGES / "android-icon-foreground.png", 1024)
    png(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">'
        f'<defs>{GRADIENTS}</defs><rect width="1024" height="1024" fill="url(#bg)"/></svg>',
        IMAGES / "android-icon-background.png",
        1024,
        opaque=True,
    )
    png(svg(scale=0.62, mono=True), IMAGES / "android-icon-monochrome.png", 1024)


if __name__ == "__main__":
    main()
