#!/usr/bin/env python3
"""
Generate a simple "news studio" style video:
- solid background
- header text
- burned-in subtitles (SRT)
- audio narration

Requires: ffmpeg + ffprobe installed in runner.
"""
from __future__ import annotations
import os
import sys
import json
import subprocess
from pathlib import Path
from scripts._common import OUTPUT_DIR
from dotenv import load_dotenv

def get_audio_duration(audio_file: Path) -> float:
    cmd = ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(audio_file)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr)
    data = json.loads(r.stdout)
    return float(data["format"]["duration"])

def srt_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def create_subtitles(script_text: str, duration: float, max_lines: int = 120) -> Path:
    # naive sentence split that works reliably in CI
    parts = [p.strip() for p in script_text.replace("\n", " ").split(".") if p.strip()]
    if not parts:
        parts = [script_text.strip()]

    # limit to avoid giant SRT
    parts = parts[:max_lines]

    per = max(1.0, duration / len(parts))
    srt_path = OUTPUT_DIR / "episode_subtitles.srt"

    with srt_path.open("w", encoding="utf-8") as f:
        t = 0.0
        for i, line in enumerate(parts, start=1):
            start = t
            end = min(duration, t + per)
            f.write(f"{i}\n{srt_time(start)} --> {srt_time(end)}\n{line}\n\n")
            t = end

    return srt_path

def find_font() -> str:
    # ubuntu runners
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return "Arial"

def main() -> None:
    load_dotenv()

    audio = OUTPUT_DIR / "episode_audio.mp3"
    script = OUTPUT_DIR / "episode_script.txt"
    if not audio.exists():
        print("❌ Missing audio: output/episode_audio.mp3")
        sys.exit(1)
    if not script.exists():
        print("❌ Missing script: output/episode_script.txt")
        sys.exit(1)

    script_text = script.read_text(encoding="utf-8").strip()
    duration = get_audio_duration(audio)

    # Config
    resolution = os.getenv("VIDEO_RESOLUTION", "1920x1080")
    fps = os.getenv("VIDEO_FPS", "30")
    brand = os.getenv("VIDEO_BRAND", "TV.RUSLANMV")
    bg = os.getenv("VIDEO_BG", "0x0b1220")  # deep navy

    subtitles = create_subtitles(script_text, duration)
    font = find_font()

    out = OUTPUT_DIR / "episode_video.mp4"

    vf = (
        f"drawtext=fontfile='{font}':"
        f"text='{brand} - Daily AI News':"
        f"fontcolor=white:fontsize=56:x=(w-text_w)/2:y=70,"
        f"drawtext=fontfile='{font}':"
        f"text='Generated Episode':"
        f"fontcolor=white:fontsize=28:x=(w-text_w)/2:y=150,"
        f"subtitles='{subtitles}':force_style='FontSize=28,PrimaryColour=&HFFFFFF&,Outline=1,Shadow=0,Alignment=2,MarginV=60'"
    )

    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"color=c={bg}:s={resolution}:d={duration}:r={fps}",
        "-i", str(audio),
        "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        str(out),
    ]

    print("🎬 Rendering video via FFmpeg...")
    r = subprocess.run(cmd, text=True)
    if r.returncode != 0:
        print("❌ FFmpeg failed.")
        sys.exit(r.returncode)

    print(f"✅ Video generated -> {out}")

if __name__ == "__main__":
    main()
