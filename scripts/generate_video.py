#!/usr/bin/env python3
"""
Generate video from script and audio
Uses FFmpeg for video assembly with visuals and subtitles
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime
import subprocess

# Output directories
OUTPUT_DIR = Path("output")
ASSETS_DIR = Path("assets")
OUTPUT_DIR.mkdir(exist_ok=True)


def create_subtitle_file(script_text: str, duration: float) -> str:
    """Create SRT subtitle file from script"""
    srt_file = OUTPUT_DIR / "episode_subtitles.srt"
    
    # Simple subtitle generation (split by sentences)
    sentences = script_text.replace('\n\n', '. ').split('. ')
    time_per_sentence = duration / len(sentences)
    
    with open(srt_file, 'w') as f:
        for i, sentence in enumerate(sentences, 1):
            start_time = i * time_per_sentence
            end_time = (i + 1) * time_per_sentence
            
            # Format time as HH:MM:SS,mmm
            start = format_srt_time(start_time)
            end = format_srt_time(end_time)
            
            f.write(f"{i}\n")
            f.write(f"{start} --> {end}\n")
            f.write(f"{sentence.strip()}\n\n")
    
    return str(srt_file)


def format_srt_time(seconds: float) -> str:
    """Format seconds as SRT timestamp"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def generate_video():
    """Generate video using FFmpeg"""
    print("=" * 70)
    print("🎬 Video Generation for TV.RUSLANMV.COM")
    print("=" * 70)
    
    # Check inputs
    audio_file = OUTPUT_DIR / "episode_audio.mp3"
    if not audio_file.exists():
        print(f"❌ Audio file not found: {audio_file}")
        sys.exit(1)
    
    script_file = OUTPUT_DIR / "episode_script.txt"
    with open(script_file, 'r') as f:
        script_text = f.read()
    
    # Get audio duration
    print("\n📊 Analyzing audio...")
    result = subprocess.run(
        ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', str(audio_file)],
        capture_output=True,
        text=True
    )
    audio_info = json.loads(result.stdout)
    duration = float(audio_info['format']['duration'])
    print(f"   Duration: {duration:.1f} seconds ({duration/60:.1f} minutes)")
    
    # Create subtitles
    print("\n📝 Generating subtitles...")
    subtitle_file = create_subtitle_file(script_text, duration)
    print(f"   ✅ Subtitles created: {subtitle_file}")
    
    # Video configuration
    resolution = os.getenv("VIDEO_RESOLUTION", "1920x1080")
    fps = int(os.getenv("VIDEO_FPS", "30"))
    
    # Output file
    output_file = OUTPUT_DIR / "episode_video.mp4"
    
    # FFmpeg command for video generation
    # Creates video with:
    # - Solid color background
    # - Audio track
    # - Animated text/logo
    # - Subtitles
    
    print(f"\n🎬 Generating video ({resolution} @ {fps}fps)...")
    
    ffmpeg_cmd = [
        'ffmpeg',
        '-y',  # Overwrite output
        '-f', 'lavfi',
        '-i', f'color=c=0x1a1a2e:s={resolution}:d={duration}:r={fps}',  # Background
        '-i', str(audio_file),  # Audio
        '-vf', f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='TV.RUSLANMV':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=100,subtitles={subtitle_file}:force_style='FontSize=24,PrimaryColour=&HFFFFFF&'",  # Text overlay + subtitles
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        str(output_file)
    ]
    
    try:
        subprocess.run(ffmpeg_cmd, check=True)
        print(f"\n✅ Video generated: {output_file}")
        
        # Get file size
        size_mb = output_file.stat().st_size / (1024 * 1024)
        print(f"   Size: {size_mb:.1f} MB")
        
        # Save metadata
        metadata = {
            "date": datetime.now().isoformat(),
            "duration": duration,
            "resolution": resolution,
            "fps": fps,
            "size_mb": size_mb,
            "audio_file": str(audio_file),
            "video_file": str(output_file)
        }
        
        metadata_file = OUTPUT_DIR / "video_metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print("\n✅ SUCCESS: Video generation complete!")
        return str(output_file)
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ FFmpeg error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    generate_video()
