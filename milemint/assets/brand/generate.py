"""Generate MileMint app icons and brand images from one source.

Usage (from milemint/):  pip install cairosvg pillow && python3 assets/brand/generate.py
"""
import io
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "assets" / "brand"
IMAGES = ROOT / "assets" / "images"

MINT = "#34D399"
EMERALD = "#0B7A55"
DEEP = "#065F46"
GOLD = "#FACC15"

# The mark: an "M" drawn as a road, ending at a gold destination coin.
ROAD = "M232 770 L372 290 L512 600 L652 290 L792 770"


def mark(road="#FFFFFF", line=EMERALD, shadow=True, coin=True):
    shadow_def = (
        '<filter id="s" x="-20%" y="-20%" width="140%" height="140%">'
        '<feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#022C22" flood-opacity="0.35"/>'
        "</filter>"
        if shadow
        else ""
    )
    group_filter = ' filter="url(#s)"' if shadow else ""
    center_line = (
        f'<path d="{ROAD}" stroke="{line}" stroke-width="18" stroke-dasharray="44 40" stroke-linecap="butt"/>'
        if line
        else ""
    )
    coin_el = (
        f'<circle cx="792" cy="770" r="46" fill="{GOLD}" stroke="{road}" stroke-width="16"/>'
        if coin
        else ""
    )
    return (
        f"<defs>{shadow_def}</defs>"
        f'<g{group_filter} fill="none" stroke-linecap="round" stroke-linejoin="round">'
        f'<path d="{ROAD}" stroke="{road}" stroke-width="140"/>{center_line}</g>{coin_el}'
    )


def svg(body, background=None, scale=1.0, size=1024):
    bg = ""
    if background == "gradient":
        bg = (
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="{MINT}"/><stop offset="1" stop-color="{DEEP}"/>'
            f'</linearGradient></defs><rect width="{size}" height="{size}" fill="url(#g)"/>'
        )
    elif background:
        bg = f'<rect width="{size}" height="{size}" fill="{background}"/>'
    offset = size * (1 - scale) / 2
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">{bg}'
        f'<g transform="translate({offset} {offset}) scale({scale * size / 1024})">{body}</g></svg>'
    )


def png(svg_text, path, px, opaque=False):
    data = cairosvg.svg2png(bytestring=svg_text.encode(), output_width=px, output_height=px)
    img = Image.open(io.BytesIO(data))
    if opaque:  # App Store icons must not have an alpha channel
        img = img.convert("RGB")
    img.save(path, optimize=True)


def main():
    icon = svg(mark(), background="gradient", scale=0.9)
    (BRAND / "icon.svg").write_text(icon)
    (BRAND / "mark.svg").write_text(svg(mark(road=EMERALD, line="#FFFFFF", shadow=False)))

    png(icon, IMAGES / "icon.png", 1024, opaque=True)
    png(icon, IMAGES / "favicon.png", 48, opaque=True)
    # Splash: white mark on the emerald splash background.
    png(svg(mark(line=EMERALD)), IMAGES / "splash-icon.png", 512)
    # Android adaptive icon: art must sit inside the central 66% safe zone.
    png(svg(mark(), scale=0.62), IMAGES / "android-icon-foreground.png", 1024)
    png(svg("", background="gradient"), IMAGES / "android-icon-background.png", 1024, opaque=True)
    png(svg(mark(road="#FFFFFF", line=None, shadow=False, coin=False), scale=0.62),
        IMAGES / "android-icon-monochrome.png", 1024)


if __name__ == "__main__":
    main()
