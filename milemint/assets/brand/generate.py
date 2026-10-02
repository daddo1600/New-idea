"""Generate the app icons, splash and brand images from the sprout mark.

The mark is a sprout whose stem is a road, with the gold dot (the car) at the
top where the leaves open: the miles you drive grow into money you can claim.
Its paths live in src/brand/sprout.ts, which the app draws from too;
sprout-svgs.ts prints them as SVG and this script rasterises them.

Usage (from milemint/):  pip install cairosvg pillow && python3 assets/brand/generate.py
Pass --icons to also write the app icons (otherwise only the mark and splash).
"""
import io
import json
import subprocess
import sys
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "assets" / "brand"
IMAGES = ROOT / "assets" / "images"


def png(svg_text, path, px, opaque=False):
    data = cairosvg.svg2png(bytestring=svg_text.encode(), output_width=px, output_height=px)
    img = Image.open(io.BytesIO(data))
    if opaque:  # App Store icons must not have an alpha channel
        img = img.convert("RGB")
    img.save(path, optimize=True)


def main():
    svgs = json.loads(
        subprocess.run(
            ["npx", "tsx", str(BRAND / "sprout-svgs.ts")], cwd=ROOT, check=True, capture_output=True, text=True
        ).stdout
    )
    (BRAND / "mark.svg").write_text(svgs["mark"])
    (BRAND / "mark-small.svg").write_text(svgs["small"])
    # The splash shows the launch animation's first frame: the seed in its soil,
    # where it sits in the mark's box, so the animation grows out of it.
    png(svgs["seed"], IMAGES / "splash-seed.png", 512)

    if "--icons" not in sys.argv:
        return
    (BRAND / "icon.svg").write_text(svgs["icon"])
    png(svgs["icon"], IMAGES / "icon.png", 1024, opaque=True)
    png(svgs["smallIcon"], IMAGES / "favicon.png", 48, opaque=True)
    png(svgs["androidForeground"], IMAGES / "android-icon-foreground.png", 1024)
    png(svgs["androidMonochrome"], IMAGES / "android-icon-monochrome.png", 1024)
    png(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">'
        '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#0E9F6E"/><stop offset="1" stop-color="#053D2E"/></linearGradient></defs>'
        '<rect width="1024" height="1024" fill="url(#bg)"/></svg>',
        IMAGES / "android-icon-background.png",
        1024,
        opaque=True,
    )


if __name__ == "__main__":
    main()
