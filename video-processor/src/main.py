#!/usr/bin/env python3
"""
Video Processor - Main Orchestrator
Coordinates TTS, video generation, and YouTube upload
"""
import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

# Add scripts to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'scripts'))

from generate_audio import generate_audio
from generate_video import generate_video
from upload_youtube import upload_to_youtube


def process_episode(mode='complete'):
    """
    Process complete episode pipeline
    mode: 'complete', 'audio', 'video', 'upload'
    """
    print("=" * 70)
    print("🎬 Video Processor - TV.RUSLANMV.COM")
    print("=" * 70)
    print(f"🗓️  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Mode: {mode}")
    print("=" * 70)
    
    try:
        if mode in ['complete', 'audio']:
            print("\n" + "=" * 70)
            print("STEP 1: AUDIO GENERATION")
            print("=" * 70)
            audio_file = generate_audio()
            print(f"✅ Audio complete: {audio_file}")
        
        if mode in ['complete', 'video']:
            print("\n" + "=" * 70)
            print("STEP 2: VIDEO GENERATION")
            print("=" * 70)
            video_file = generate_video()
            print(f"✅ Video complete: {video_file}")
        
        if mode in ['complete', 'upload']:
            print("\n" + "=" * 70)
            print("STEP 3: YOUTUBE UPLOAD")
            print("=" * 70)
            video_url = upload_to_youtube()
            print(f"✅ Upload complete: {video_url}")
        
        print("\n" + "=" * 70)
        print("🎉 VIDEO PROCESSING COMPLETE!")
        print("=" * 70)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error in video processing: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Video Processor for TV.RUSLANMV.COM")
    parser.add_argument(
        "--mode",
        choices=['complete', 'audio', 'video', 'upload', 'daemon'],
        default='complete',
        help="Processing mode"
    )
    
    args = parser.parse_args()
    
    if args.mode == 'daemon':
        print("🔄 Running in daemon mode...")
        print("Waiting for processing tasks...")
        # TODO: Implement queue-based processing
        sys.exit(0)
    else:
        success = process_episode(mode=args.mode)
        sys.exit(0 if success else 1)
