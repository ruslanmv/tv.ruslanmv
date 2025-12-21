#!/usr/bin/env python3
"""
Generate analytics report for episodes
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime


DATA_DIR = Path("data/episodes")
OUTPUT_DIR = Path("output")


def generate_analytics():
    """Generate analytics report"""
    print("=" * 70)
    print("📊 Generating Analytics Report")
    print("=" * 70)

    # Create data directory
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Collect all episode files
    episode_files = sorted(DATA_DIR.glob("*_episode.json"))

    analytics = {
        'generated_at': datetime.now().isoformat(),
        'total_episodes': len(episode_files),
        'episodes': [],
        'summary': {
            'youtube_uploads': 0,
            'r2_backups': 0,
            'total_duration': 0
        }
    }

    # Process each episode
    for episode_file in episode_files:
        try:
            with open(episode_file, 'r') as f:
                episode_data = json.load(f)

            episode_summary = {
                'date': episode_data.get('date', 'Unknown'),
                'has_youtube': bool(episode_data.get('youtube')),
                'has_r2': bool(episode_data.get('r2'))
            }

            if episode_data.get('youtube'):
                analytics['summary']['youtube_uploads'] += 1
                episode_summary['youtube_id'] = episode_data['youtube'].get('video_id', 'N/A')

            if episode_data.get('r2'):
                analytics['summary']['r2_backups'] += 1

            analytics['episodes'].append(episode_summary)

        except Exception as e:
            print(f"⚠️  Error processing {episode_file}: {e}")
            continue

    # Calculate success rates
    if analytics['total_episodes'] > 0:
        analytics['summary']['youtube_success_rate'] = (
            analytics['summary']['youtube_uploads'] / analytics['total_episodes'] * 100
        )
        analytics['summary']['r2_success_rate'] = (
            analytics['summary']['r2_backups'] / analytics['total_episodes'] * 100
        )
    else:
        analytics['summary']['youtube_success_rate'] = 0
        analytics['summary']['r2_success_rate'] = 0

    # Save analytics
    analytics_file = OUTPUT_DIR / "analytics.json"
    with open(analytics_file, 'w') as f:
        json.dump(analytics, f, indent=2)

    # Print summary
    print(f"\n📊 Analytics Summary:")
    print(f"   Total Episodes: {analytics['total_episodes']}")
    print(f"   YouTube Uploads: {analytics['summary']['youtube_uploads']} ({analytics['summary']['youtube_success_rate']:.1f}%)")
    print(f"   R2 Backups: {analytics['summary']['r2_backups']} ({analytics['summary']['r2_success_rate']:.1f}%)")

    print(f"\n✅ Analytics saved: {analytics_file}")

    # Also save to data directory
    data_analytics_file = DATA_DIR / "analytics.json"
    with open(data_analytics_file, 'w') as f:
        json.dump(analytics, f, indent=2)

    print(f"✅ Analytics backup: {data_analytics_file}")

    print("\n✅ SUCCESS: Analytics report generated!")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(generate_analytics())
    except Exception as e:
        print(f"\n❌ Error generating analytics: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
