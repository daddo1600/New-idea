"""Cuts the two takes from clip-record.js into the hero's looping clip (MP4 + WebM + posters).

python3 tools/website/clip-encode.py website/assets/video   (REC=dir if recorded elsewhere)
Uses the ffmpeg in imageio_ffmpeg. The clip: driving (0-2.5 s), a hard cut to parked with the drive
there, swiped to Work (4.0-5.5 s), the total goes up (about 6.8 s), the end held (9.1-9.6 s), then the
loop cuts back to the start. No cross-fades, so no frame ever shows two states.
site.js times the road from these, so keep them if you re-cut.
"""
import glob, os, subprocess, sys
import imageio_ffmpeg

F = imageio_ffmpeg.get_ffmpeg_exe()
D = os.path.dirname(os.path.abspath(__file__))
REC = os.environ.get('REC', D + '/rec')
TAKE_A = REC + '/demo_driving_clip_region_GB'
TAKE_B = REC + '/demo_1_clip_region_GB'
# each take is frames + timestamps (clip-record.js): play them through the concat demuxer
A = ['-f', 'concat', '-safe', '0', '-i', TAKE_A + '/frames.txt']
B = ['-f', 'concat', '-safe', '0', '-i', TAKE_B + '/frames.txt']
import json
SWIPE = json.load(open(TAKE_B + '/marks.json')).get('swipe', 2.8)
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

# Cut points in each take's video time (find them from frames: the swipe should start 1.6 s into B).
# Hard cuts only (no blended frames, marketing's review of ffd766b): driving 0-2.5 s, cut to parked (the
# swipe starts at 4.0 s, as the hero's touch indicator expects), the end frame held 9.1-9.6 s, then the loop
# cuts back to frame 0.
A_IN = float(os.environ.get('A_IN', 0.3)); A_LEN = 2.5              # driving: "Recording a drive"
B_IN = float(os.environ.get('B_IN', SWIPE - 1.5)); B_LEN = 6.6      # parked: drive to sort, swipe, total up
HOLD = 0.5
S = 2                       # the recording is at 2x (sharp when the hero zooms in)
W, H, CH = 390 * S, 908 * S, 844 * S   # output; the app's screen is 390×844 CSS px
TOP = 48 * S                # room for the site's CSS status bar

fit = f'fps=30,crop={W}:{CH}:0:0,pad={W}:{H}:0:{TOP}:white,setsar=1,format=yuv420p'
graph = (
    f'[0:v]trim=start={A_IN}:duration={A_LEN},setpts=PTS-STARTPTS,{fit}[a];'
    f'[1:v]trim=start={B_IN}:duration={B_LEN},setpts=PTS-STARTPTS,{fit},tpad=stop_mode=clone:stop_duration={HOLD}[b];'
    f'[a][b]concat=n=2:v=1:a=0[v]'
)
XF = 0
total = A_LEN + B_LEN + HOLD
print('duration', total)
master = f'{REC}/master.mkv'
subprocess.run([F, '-v', 'error', '-y'] + A + B + ['-filter_complex', graph, '-map', '[v]', '-an',
                '-c:v', 'libx264', '-crf', '10', '-preset', 'slow', master], check=True)
subprocess.run([F, '-v', 'error', '-y', '-i', master, '-an', '-c:v', 'libx264', '-profile:v', 'high', '-crf', '23',
                '-preset', 'veryslow', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-g', '60', '-movflags', '+faststart',
                f'{OUT}/drive-logged.mp4'], check=True)
subprocess.run([F, '-v', 'error', '-y', '-i', master, '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '33',
                '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-g', '60',
                f'{OUT}/drive-logged.webm'], check=True)
# Posters: the first frame (driving) and the saved state (Reduce Motion, no JS).
subprocess.run([F, '-v', 'error', '-y', '-i', master, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82',
                f'{OUT}/drive-logged-poster.webp'], check=True)
subprocess.run([F, '-v', 'error', '-y', '-ss', str(total - 0.3), '-i', master, '-frames:v', '1', '-c:v', 'libwebp',
                '-quality', '82', f'{OUT}/drive-logged-saved.webp'], check=True)
for f in sorted(os.listdir(OUT)):
    print(f, os.path.getsize(f'{OUT}/{f}'))
