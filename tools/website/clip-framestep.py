"""Steps through the hero clip in 0.04 s steps and flags any frame that blends two states (a cross-fade or
ghost), and prints where the hard cuts are.

python3 tools/website/clip-framestep.py website/assets/video/drive-logged.mp4 [strip.png]

A blended frame sits between two different neighbours and is close to their average, rather than equal
to either; a hard cut changes everything in one step. The swipe itself also changes the picture frame to
frame, so "changed" frames inside 3.9-5.6 s (the card moving) are expected; blends are not.
"""
import subprocess, sys
import imageio_ffmpeg
from PIL import Image, ImageChops, ImageStat

F = imageio_ffmpeg.get_ffmpeg_exe()
src = sys.argv[1]
W, H = 195, 454
raw = subprocess.run([F, '-v', 'error', '-i', src, '-vf', 'fps=25,scale=%d:%d' % (W, H), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                     capture_output=True, check=True).stdout
n = len(raw) // (W * H * 3)
frames = [Image.frombytes('RGB', (W, H), raw[i * W * H * 3:(i + 1) * W * H * 3]) for i in range(n)]
diff = lambda a, b: sum(ImageStat.Stat(ImageChops.difference(a, b)).mean) / 3
blends, cuts = [], []
# A cross-fade frame looks like a mix of the frames either side of it (0.16 s away), at some mix; a moving
# card (the swipe) or a hard cut doesn't.
K = 4
for i in range(K, n - K):
    a, b, c = frames[i - K], frames[i], frames[i + K]
    dac = diff(a, c)
    if dac < 3 or diff(a, b) < 1 or diff(b, c) < 1:
        continue
    best = min(diff(b, Image.blend(a, c, t / 10)) for t in range(2, 9))
    if best < 0.2 * dac:
        blends.append(round(i * 0.04, 2))
for i in range(1, n):
    if diff(frames[i - 1], frames[i]) > 8:
        cuts.append(round(i * 0.04, 2))
# the loop seam: last frame -> first frame
seam = diff(frames[-1], frames[0])
print('frames checked: %d (every 0.04 s)' % n)
print('hard changes at (s):', cuts)
print('loop seam: last -> first changes by %.1f (a hard cut)' % seam)
print('blended frames:', blends if blends else 'none')
if len(sys.argv) > 2:
    picks = [i for i in range(n) if any(abs(i * 0.04 - c) < 0.05 for c in cuts)] or [0]
    sel = sorted(set(sum(([max(0, i - 1), i] for i in picks), [])))[:16]
    o = Image.new('RGB', (len(sel) * (W + 6) + 6, H + 12), '#0B3B2C')
    for k, i in enumerate(sel):
        o.paste(frames[i], (6 + k * (W + 6), 6))
    o.save(sys.argv[2])
sys.exit(1 if blends else 0)
