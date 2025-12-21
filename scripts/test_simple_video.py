#!/usr/bin/env python3
"""
Generate a simple test video (5 seconds) for testing upload functionality
"""
import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

# Output directories
OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)


def generate_simple_test_video():
    """Generate a simple 5-second test video"""
    print("=" * 70)
    print("🧪 Test Video Generation for TV.RUSLANMV.COM")
    print("=" * 70)

    # Configuration
    duration = 5  # 5 seconds
    resolution = "1920x1080"
    fps = 30

    # Create simple text script
    script_file = OUTPUT_DIR / "episode_script.txt"
    with open(script_file, 'w') as f:
        f.write("This is a test video for TV dot Ruslanmv dot com. Testing upload functionality.")

    print(f"\n📝 Created test script: {script_file}")

    # Generate simple audio using FFmpeg text-to-speech (sine wave as placeholder)
    audio_file = OUTPUT_DIR / "episode_audio.mp3"
    print(f"\n🎤 Generating test audio (sine wave placeholder)...")

    audio_cmd = [
        'ffmpeg', '-y',
        '-f', 'lavfi',
        '-i', f'sine=frequency=1000:duration={duration}',
        '-c:a', 'libmp3lame',
        '-b:a', '192k',
        str(audio_file)
    ]

    subprocess.run(audio_cmd, check=True, capture_output=True)
    print(f"   ✅ Audio created: {audio_file}")

    # Create simple subtitles
    srt_file = OUTPUT_DIR / "episode_subtitles.srt"
    with open(srt_file, 'w') as f:
        f.write("1\n")
        f.write("00:00:00,000 --> 00:00:02,500\n")
        f.write("Test video for\n\n")
        f.write("2\n")
        f.write("00:00:02,500 --> 00:00:05,000\n")
        f.write("TV.RUSLANMV.COM\n\n")

    print(f"\n📝 Created subtitles: {srt_file}")

    # Generate video
    output_file = OUTPUT_DIR / "episode_video.mp4"

    print(f"\n🎬 Generating test video ({resolution} @ {fps}fps, {duration}s)...")

    video_cmd = [
        'ffmpeg', '-y',
        '-f', 'lavfi',
        '-i', f'color=c=0x1a1a2e:s={resolution}:d={duration}:r={fps}',  # Dark background
        '-i', str(audio_file),
        '-vf', f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='TV.RUSLANMV TEST':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2,subtitles={srt_file}:force_style='FontSize=24,PrimaryColour=&HFFFFFF&'",
        '-c:v', 'libx264',
        '-preset', 'ultrafast',  # Fast encoding for tests
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        str(output_file)
    ]

    try:
        result = subprocess.run(video_cmd, check=True, capture_output=True, text=True)

        # Verify file exists
        if output_file.exists():
            size_mb = output_file.stat().st_size / (1024 * 1024)
            print(f"\n✅ Test video generated: {output_file}")
            print(f"   Size: {size_mb:.2f} MB")
            print(f"   Duration: {duration} seconds")

            # Create metadata
            metadata = {
                "date": datetime.now().isoformat(),
                "duration": duration,
                "resolution": resolution,
                "fps": fps,
                "size_mb": size_mb,
                "test": True,
                "generated_by": "test_simple_video.py"
            }

            metadata_file = OUTPUT_DIR / "episode_metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)

            print(f"   ✅ Metadata saved: {metadata_file}")
            print("\n✅ SUCCESS: Test video ready for upload!")
            return str(output_file)
        else:
            print(f"\n❌ Video file not created: {output_file}")
            sys.exit(1)

    except subprocess.CalledProcessError as e:
        print(f"\n❌ FFmpeg error:")
        print(f"   stdout: {e.stdout}")
        print(f"   stderr: {e.stderr}")
        sys.exit(1)


if __name__ == "__main__":
    generate_simple_test_video()
