#!/usr/bin/env python3
"""
Save episode metadata to database or file
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime


OUTPUT_DIR = Path("output")
DATA_DIR = Path("data/episodes")


def save_episode():
    """Save episode metadata"""
    print("=" * 70)
    print("💾 Saving Episode Metadata")
    print("=" * 70)

    # Create data directory
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Load metadata from output files
    metadata = {
        'timestamp': datetime.now().isoformat(),
        'date': datetime.now().strftime('%Y-%m-%d')
    }

    # Load YouTube info if available
    youtube_file = OUTPUT_DIR / "youtube_info.json"
    if youtube_file.exists():
        with open(youtube_file, 'r') as f:
            youtube_data = json.load(f)
            metadata['youtube'] = youtube_data
            print(f"✅ YouTube URL: {youtube_data.get('url', 'N/A')}")

    # Load R2 info if available
    r2_file = OUTPUT_DIR / "r2_info.json"
    if r2_file.exists():
        with open(r2_file, 'r') as f:
            r2_data = json.load(f)
            metadata['r2'] = r2_data
            print(f"✅ R2 URL: {r2_data.get('url', 'N/A')}")

    # Load episode metadata if available
    episode_metadata_file = OUTPUT_DIR / "episode_metadata.json"
    if episode_metadata_file.exists():
        with open(episode_metadata_file, 'r') as f:
            episode_data = json.load(f)
            metadata.update(episode_data)

    # Check if database URL is configured
    database_url = os.getenv('DATABASE_URL')

    if database_url:
        print(f"\n📊 Database URL configured: {database_url[:20]}...")
        print("⚠️  Database integration not implemented in this version")
        print("   (Skipping database save - using file storage)")

    # Save to file
    today = datetime.now().strftime('%Y-%m-%d')
    output_file = DATA_DIR / f"{today}_episode.json"

    with open(output_file, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\n✅ Episode metadata saved: {output_file}")

    # Also save as latest
    latest_file = DATA_DIR / "latest_episode.json"
    with open(latest_file, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"✅ Latest episode link updated: {latest_file}")

    # Summary
    print("\n📊 Episode Summary:")
    print(f"   Date: {metadata.get('date', 'N/A')}")
    if 'youtube' in metadata:
        print(f"   YouTube: ✅ {metadata['youtube'].get('video_id', 'N/A')}")
    if 'r2' in metadata:
        print(f"   R2 Backup: ✅ {metadata['r2'].get('key', 'N/A')}")

    print("\n✅ SUCCESS: Episode metadata saved!")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(save_episode())
    except Exception as e:
        print(f"\n❌ Error saving episode: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
