"""Cuts the two takes from clip-record.js into the hero's looping clip (MP4 + WebM + posters).

python3 tools/website/clip-encode.py website/assets/video   (REC=dir if recorded elsewhere)
Uses the ffmpeg in imageio_ffmpeg. The clip: driving (0-2.4 s), parked, the drive appears
(2.8 s), swiped to Work (4.4 s), the total goes up (6.8 s), back to the start (9.2-9.6 s).
site.js times the road from these, so keep them if you re-cut.
"""
import glob, os, subprocess, sys
import imageio_ffmpeg

F = imageio_ffmpeg.get_ffmpeg_exe()
D = os.path.dirname(os.path.abspath(__file__))
REC = os.environ.get('REC', D + '/rec')
A = glob.glob(REC + '/demo_driving_clip_region_GB/*.webm')[0]
B = glob.glob(REC + '/demo_1_clip_region_GB/*.webm')[0]
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

# Cut points in each take's video time (find them from frames: the swipe should start 1.6 s into B).
A_IN = float(os.environ.get('A_IN', 50.5)); A_LEN = 2.8   # driving: "Recording a drive"
B_IN = float(os.environ.get('B_IN', 28.7)); B_LEN = 7.2   # parked: drive to sort, swipe, total up
XF = 0.4
W, H, CH = 390, 908, 844    # output; the recording's app content (390×844 CSS px, top left of the frame)
TOP = 48                    # room for the site's CSS status bar

fit = f'fps=30,crop={W}:{CH}:0:0,pad={W}:{H}:0:{TOP}:white,setsar=1,format=yuv420p'
graph = (
    f'[0:v]trim=start={A_IN}:duration={A_LEN},setpts=PTS-STARTPTS,{fit}[a];'
    f'[1:v]trim=start={B_IN}:duration={B_LEN},setpts=PTS-STARTPTS,{fit}[b];'
    f'[0:v]trim=start={A_IN}:duration={XF},setpts=PTS-STARTPTS,{fit}[h];'
    f'[a][b]xfade=transition=fade:duration={XF}:offset={A_LEN - XF}[ab];'
    f'[ab][h]xfade=transition=fade:duration={XF}:offset={A_LEN + B_LEN - 2 * XF}[v]'
)
total = A_LEN + B_LEN - XF
print('duration', total)
master = f'{REC}/master.mkv'
subprocess.run([F, '-v', 'error', '-y', '-i', A, '-i', B, '-filter_complex', graph, '-map', '[v]', '-an',
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
subprocess.run([F, '-v', 'error', '-y', '-ss', str(total - XF - 0.3), '-i', master, '-frames:v', '1', '-c:v', 'libwebp',
                '-quality', '82', f'{OUT}/drive-logged-saved.webp'], check=True)
for f in sorted(os.listdir(OUT)):
    print(f, os.path.getsize(f'{OUT}/{f}'))
