"""Build App Store screenshots (1320x2868, iPhone 6.9") from raw app captures.

Raw captures in raw/ come from the web preview in demo mode, as a UK courier
(`?demo=courier&region=GB`): run capture.js first (see its header).
Usage (from milemint/): python3 assets/store/make_screenshots.py  (needs Pillow and the Inter font)
Writes ios/ (6.9"), ios-6.5/ (1284x2778, the 6.5" size) and overview.png (a contact sheet for review).
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
W, H = 1320, 2868
FONT_DIRS = [Path.home() / ".fonts", Path("/usr/local/share/fonts")]

# (raw capture, headline, subline). Plain words, nothing the app can't show:
# exports, quarterly figures and the set-aside are Pro, and say so.
SHOTS = [
    ("home", "Every work mile\nadds up.", "Your claim grows with every shift,\nworked out at HMRC rates."),
    ("drives", "Drives log\nthemselves.", "Free, unlimited automatic logging.\nOne row per shift. No buttons."),
    ("trip", "Work or personal?\nOne tap.", "See the route of every drive,\nthen sort it in a tap."),
    ("money", "Know what to put\naside for tax.", "With Pro: quarterly figures for MTD\nand a weekly tax set-aside."),
    ("export", "Your mileage log,\nready for HMRC.", "With Pro: PDF report, spreadsheet\nand accounting exports."),
    ("privacy", "Your trips stay\non your phone.", "Encrypted on your phone.\nNo account. Never sold."),
    ("compare", "Logging is free.\nNo monthly limit.", "Pro adds your report, exports,\nquarterly figures and tax set-aside."),
]

# Brand palette (research_notes/launch-2026/milesprout-brand-brief.md): the icon's 135° gradient.
GRADIENT = ((14, 159, 110), (5, 61, 46))
MINT = (209, 250, 229)


def font(name, size):
    for d in FONT_DIRS:
        if (d / name).exists():
            return ImageFont.truetype(str(d / name), size)
    raise FileNotFoundError(name)


def gradient():
    """The icon's gradient, top left to bottom right (135°)."""
    small = Image.new("RGB", (W // 4, H // 4))
    px = small.load()
    span = small.width + small.height
    for y in range(small.height):
        for x in range(small.width):
            t = (x + y) / span
            px[x, y] = tuple(int(a + (b - a) * t) for a, b in zip(*GRADIENT))
    return small.resize((W, H), Image.BICUBIC)


def status_bar(width, background):
    """An iPhone status bar over the capture's own header colour (light or dark mode)."""
    ink = "black" if sum(background) > 384 else "white"
    bar = Image.new("RGB", (width, 150), background)
    d = ImageDraw.Draw(bar)
    d.text((110, 52), "9:41", font=font("Inter-SemiBold.ttf", 50), fill=ink)
    x = width - 110
    d.rounded_rectangle((x - 78, 60, x, 100), 10, outline=ink, width=4)
    d.rounded_rectangle((x - 70, 67, x - 16, 93), 5, fill=ink)
    d.rectangle((x + 4, 72, x + 9, 88), fill=ink)
    for i, h in enumerate((14, 22, 30, 38)):
        bx = x - 190 + i * 16
        d.rounded_rectangle((bx, 98 - h, bx + 10, 98), 3, fill=ink)
    return bar


def phone(capture):
    screen_w = 1000
    shot = Image.open(capture).convert("RGB")
    bar = status_bar(shot.width, shot.getpixel((shot.width // 2, 4)))
    full = Image.new("RGB", (shot.width, shot.height + bar.height), "white")
    full.paste(bar, (0, 0))
    full.paste(shot, (0, bar.height))
    screen = full.resize((screen_w, int(full.height * screen_w / full.width)), Image.LANCZOS)
    bezel = 26
    body = Image.new("RGBA", (screen_w + 2 * bezel, screen.height + 2 * bezel), (0, 0, 0, 0))
    ImageDraw.Draw(body).rounded_rectangle((0, 0, body.width - 1, body.height - 1), 150, fill=(17, 24, 21, 255))
    mask = Image.new("L", screen.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, screen_w - 1, screen.height - 1), 126, fill=255)
    body.paste(screen, (bezel, bezel), mask)
    # Dynamic Island
    ImageDraw.Draw(body).rounded_rectangle(
        (body.width // 2 - 125, bezel + 30, body.width // 2 + 125, bezel + 102), 36, fill=(0, 0, 0, 255)
    )
    return body


def compose(key, headline, sub):
    canvas = gradient().convert("RGBA")
    d = ImageDraw.Draw(canvas)
    y = 190
    lines = headline.split("\n")
    size = 118  # shrink until the widest line leaves a comfortable margin
    while max(d.textlength(line, font=font("Inter-ExtraBold.ttf", size)) for line in lines) > 1140:
        size -= 2
    for line in lines:
        f = font("Inter-ExtraBold.ttf", size)
        w = d.textlength(line, font=f)
        d.text(((W - w) / 2, y), line, font=f, fill="white")
        y += 140
    y += 30
    for line in sub.split("\n"):
        f = font("Inter-Medium.ttf", 52)
        w = d.textlength(line, font=f)
        d.text(((W - w) / 2, y), line, font=f, fill=MINT)
        y += 70
    device = phone(HERE / "raw" / f"{key}.png")
    top = y + 90
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        ((W - device.width) // 2, top + 30, (W + device.width) // 2, top + 30 + device.height), 150, fill=(0, 20, 12, 120)
    )
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(40)))
    canvas.alpha_composite(device, ((W - device.width) // 2, top))
    return canvas.convert("RGB")


def main():
    out = HERE / "ios"
    out_65 = HERE / "ios-6.5"
    out.mkdir(exist_ok=True)
    out_65.mkdir(exist_ok=True)
    for old in [*out.glob("*.png"), *out_65.glob("*.png")]:
        old.unlink()
    shots = []
    for i, (key, headline, sub) in enumerate(SHOTS, 1):
        shot = compose(key, headline, sub)
        shot.save(out / f"{i:02d}-{key}.png", optimize=True)
        # App Store Connect also asks for the 6.5" size (1284x2778).
        shot.resize((1284, 2778), Image.LANCZOS).save(out_65 / f"{i:02d}-{key}.png", optimize=True)
        shots.append(shot)
    overview(shots).save(HERE / "overview.png", optimize=True)


def overview(shots):
    """Small thumbnails side by side, in display order, for review."""
    tw, th, gap = 330, 717, 24
    sheet = Image.new("RGB", (len(shots) * (tw + gap) + gap, th + 2 * gap), (245, 245, 240))
    for i, shot in enumerate(shots):
        sheet.paste(shot.resize((tw, th), Image.LANCZOS), (gap + i * (tw + gap), gap))
    return sheet


if __name__ == "__main__":
    main()
