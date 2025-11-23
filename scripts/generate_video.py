
#!/usr/bin/env python3

"""

TV.RUSLANMV.COM - Futuristic Video Generator



This script turns the daily AI news script + TTS audio into a

high-quality, CNN-style video with:



- Branded background (TV.RUSLANMV.COM)

- Logo bug using assets/logo.png

- Animated ticker text at the bottom

- Burned-in subtitles generated from the script



Designed to work in CI (GitHub Actions) with only:

- Python 3

- FFmpeg

"""



import os

import sys

import json

import re

import subprocess

from datetime import datetime

from pathlib import Path

from typing import List



OUTPUT_DIR = Path("output")

ASSETS_DIR = Path("assets")

OUTPUT_DIR.mkdir(exist_ok=True)

ASSETS_DIR.mkdir(exist_ok=True)



BRAND_NAME = "TV.RUSLANMV.COM"

BRAND_PRIMARY = "#2A7AE2"

BRAND_ACCENT = "#14F4FF"





def _split_sentences(text: str) -> List[str]:

    """Very small helper to split script text into subtitle-sized chunks."""

    cleaned = re.sub(r"\s+", " ", text).strip()

    if not cleaned:

        return []



    parts = re.split(r"(?<=[.!?])\s+", cleaned)

    sentences = [p.strip() for p in parts if p.strip()]



    if len(sentences) == 1 and len(sentences[0]) > 140:

        sentences = []

        chunk: List[str] = []

        for word in cleaned.split():

            chunk.append(word)

            if len(" ".join(chunk)) > 120:

                sentences.append(" ".join(chunk))

                chunk = []

        if chunk:

            sentences.append(" ".join(chunk))

    return sentences





def _format_timestamp(seconds: float) -> str:

    """Return SRT timestamp string."""

    if seconds < 0:

        seconds = 0.0

    ms = int(round(seconds * 1000))

    h, rem = divmod(ms, 3600 * 1000)

    m, rem = divmod(rem, 60 * 1000)

    s, ms = divmod(rem, 1000)

    return f"{h:02}:{m:02}:{s:02},{ms:03}"





def create_subtitle_file(script_text: str, duration: float) -> Path:

    """

    Create a very simple SRT subtitle file that spans the full duration,

    distributing lines evenly across the audio length.

    """

    sentences = _split_sentences(script_text)

    if not sentences:

        sentences = [BRAND_NAME]



    n = len(sentences)

    per_segment = duration / max(n, 1)



    srt_path = OUTPUT_DIR / "episode_subtitles.srt"

    with srt_path.open("w", encoding="utf-8") as f:

        for idx, sentence in enumerate(sentences, start=1):

            start_t = per_segment * (idx - 1)

            end_t = per_segment * idx

            end_t = min(duration, end_t + 0.25)



            f.write(f"{idx}\n")

            f.write(f"{_format_timestamp(start_t)} --> {_format_timestamp(end_t)}\n")

            f.write(sentence + "\n\n")



    return srt_path





def get_audio_duration(audio_file: Path) -> float:

    """Use ffprobe to get the audio duration in seconds."""

    result = subprocess.run(

        [

            "ffprobe",

            "-v",

            "quiet",

            "-print_format",

            "json",

            "-show_format",

            str(audio_file),

        ],

        capture_output=True,

        text=True,

        check=True,

    )

    data = json.loads(result.stdout)

    return float(data["format"]["duration"])





def build_ffmpeg_command(

    audio_file: Path,

    subtitle_file: Path,

    output_file: Path,

    duration: float,

) -> list:

    """

    Build the FFmpeg command that:

    - Creates a synthetic futuristic background.

    - Overlays the TV.RUSLANMV.COM logo.

    - Adds a moving ticker at the bottom.

    - Burns subtitles into the video.

    """

    resolution = os.getenv("VIDEO_RESOLUTION", "1920x1080")

    fps = int(os.getenv("VIDEO_FPS", "30"))



    logo_path = ASSETS_DIR / "logo.png"

    has_logo = logo_path.exists()



    # Ticker text: compressed version of script for bottom bar

    script_file = OUTPUT_DIR / "episode_script.txt"

    if script_file.exists():

        with script_file.open("r", encoding="utf-8") as f:

            script_text = f.read()

    else:

        script_text = ""



    ticker_source = re.sub(r"\s+", " ", script_text).strip()

    ticker_source = ticker_source[:400]

    ticker_text = ticker_source.replace("'", " ").replace(":", " ")



    cmd: list = [

        "ffmpeg",

        "-y",

        # Synthetic dark gradient background

        "-f",

        "lavfi",

        "-i",

        f"color=c=0x050816:size={resolution}:rate={fps}",

        "-i",

        str(audio_file),

    ]



    if has_logo:

        cmd.extend(["-i", str(logo_path)])



    filter_lines: list = []



    # 1) Base background with subtle blur & vignette

    filter_lines.append(

        "[0:v]format=yuv420p,"

        "boxblur=2,"

        "vignette=PI/2:0.5,"

        "eq=contrast=1.05:saturation=1.15[bg];"

    )

    current_label = "bg"



    # 2) Optional logo overlay (top-left)

    if has_logo:

        filter_lines.append(

            "[2:v]scale=180:-1[logo];"

            f"[{current_label}][logo]overlay=60:40:format=auto[bg_logo];"

        )

        current_label = "bg_logo"



    # 3) Subtitles

    filter_lines.append(

        f"[{current_label}]subtitles='{subtitle_file.as_posix()}'[subbed];"

    )

    current_label = "subbed"



    # 4) Brand bug (bottom-right)

    fontfile = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

    brand_text = BRAND_NAME.replace(":", " ")

    filter_lines.append(

        f"[{current_label}]drawtext="

        f"fontfile={fontfile}:"

        f"text='{brand_text}':"

        "x=w-tw-80:y=h-th-60:"

        "fontsize=26:"

        "fontcolor=white:"

        "box=1:boxcolor=0x020617@0.8:boxborderw=20[brand];"

    )

    current_label = "brand"



    # 5) Moving ticker (bottom bar)

    if ticker_text:

        safe_ticker = ticker_text.replace("\\", " ").replace(":", " ")

        filter_lines.append(

            f"[{current_label}]drawbox="

            "x=0:y=h-80:w=w:h=80:color=0x020617@0.9:t=fill[tbk];"

            f"[tbk]drawtext=fontfile={fontfile}:"

            f"text='{safe_ticker}   {safe_ticker}':"

            "fontsize=22:"

            "fontcolor=#14F4FF:"

            "x=w-mod(t*140\\, w+tw):"

            "y=h-60:"

            "shadowx=0:shadowy=0:"

            "borderw=0[final]"

        )

        current_label = "final"



    filter_complex = "".join(filter_lines)



    cmd.extend(

        [

            "-filter_complex",

            filter_complex,

            "-map",

            f"[{current_label}]",

            "-map",

            "1:a",

            "-c:v",

            "libx264",

            "-preset",

            os.getenv("VIDEO_PRESET", "medium"),

            "-crf",

            os.getenv("VIDEO_CRF", "19"),

            "-c:a",

            "aac",

            "-b:a",

            "192k",

            "-shortest",

            str(output_file),

        ]

    )



    return cmd





def generate_video() -> str:

    """Main entrypoint called from CLI and CI."""

    print("🎬 Video Generation for TV.RUSLANMV.COM")

    print("=" * 70)



    audio_file = OUTPUT_DIR / "episode_audio.mp3"

    if not audio_file.exists():

        print(f"❌ Audio file not found: {audio_file}")

        sys.exit(1)



    script_file = OUTPUT_DIR / "episode_script.txt"

    if not script_file.exists():

        print(f"❌ Script file not found: {script_file}")

        sys.exit(1)



    with script_file.open("r", encoding="utf-8") as f:

        script_text = f.read()



    print("\n📊 Analyzing audio duration...")

    try:

        duration = get_audio_duration(audio_file)

    except subprocess.CalledProcessError as e:

        print("❌ ffprobe failed while reading audio duration.")

        print(e)

        sys.exit(1)



    print(f"   Duration: {duration:.1f}s ({duration/60:.1f} min)")



    print("\n📝 Generating subtitles (auto-timed)...")

    subtitle_file = create_subtitle_file(script_text, duration)

    print(f"   ✅ Subtitles: {subtitle_file}")



    output_file = OUTPUT_DIR / "episode_video.mp4"

    print("\n🎨 Building FFmpeg pipeline with branding & ticker...")

    ffmpeg_cmd = build_ffmpeg_command(audio_file, subtitle_file, output_file, duration)



    print("\n🚀 Running FFmpeg...")

    print("   " + " ".join(ffmpeg_cmd))



    try:

        subprocess.run(ffmpeg_cmd, check=True)

    except subprocess.CalledProcessError as e:

        print("\n❌ FFmpeg failed while generating video.")

        print(e)

        sys.exit(1)



    metadata = {

        "output_file": str(output_file),

        "duration_seconds": duration,

        "brand": BRAND_NAME,

        "generated_at": datetime.utcnow().isoformat() + "Z",

        "resolution": os.getenv("VIDEO_RESOLUTION", "1920x1080"),

        "fps": int(os.getenv("VIDEO_FPS", "30")),

    }

    meta_path = OUTPUT_DIR / "video_metadata.json"

    with meta_path.open("w", encoding="utf-8") as f:

        json.dump(metadata, f, indent=2)



    print(f"\n✅ SUCCESS: Video generated: {output_file}")

    print(f"   📄 Metadata: {meta_path}")

    return str(output_file)





if __name__ == "__main__":

    generate_video()

