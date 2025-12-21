#!/usr/bin/env python3
"""
Upload video to all platforms (YouTube + Cloudflare R2)
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Add scripts directory to path for imports
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

OUTPUT_DIR = Path("output")


def main():
    """Upload to all configured platforms"""
    print("=" * 70)
    print("🚀 TV.RUSLANMV.COM - Multi-Platform Upload")
    print("=" * 70)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    results = {
        'timestamp': datetime.now().isoformat(),
        'platforms': {}
    }

    # 1. Upload to YouTube (Primary)
    youtube_url = None
    print("\n" + "=" * 70)
    print("1️⃣  YOUTUBE UPLOAD (Primary)")
    print("=" * 70)

    try:
        from upload_youtube import upload_to_youtube
        youtube_url = upload_to_youtube()
        results['platforms']['youtube'] = {
            'status': 'success',
            'url': youtube_url
        }
    except ImportError:
        print("❌ upload_youtube.py not found")
        results['platforms']['youtube'] = {
            'status': 'error',
            'message': 'Module not found'
        }
    except Exception as e:
        print(f"❌ YouTube upload failed: {e}")
        results['platforms']['youtube'] = {
            'status': 'error',
            'message': str(e)
        }

    # 2. Upload to Cloudflare R2 (Optional Backup)
    r2_url = None
    print("\n" + "=" * 70)
    print("2️⃣  CLOUDFLARE R2 UPLOAD (Optional Backup)")
    print("=" * 70)

    try:
        from upload_r2 import upload_to_r2
        r2_url = upload_to_r2()

        if r2_url:
            results['platforms']['r2'] = {
                'status': 'success',
                'url': r2_url
            }
        else:
            results['platforms']['r2'] = {
                'status': 'skipped',
                'message': 'R2 credentials not configured (optional)'
            }
    except ImportError:
        print("❌ upload_r2.py not found")
        results['platforms']['r2'] = {
            'status': 'error',
            'message': 'Module not found'
        }
    except Exception as e:
        print(f"⚠️  R2 upload failed: {e}")
        print("   (Continuing - R2 is optional)")
        results['platforms']['r2'] = {
            'status': 'error',
            'message': str(e)
        }

    # Save combined results
    results_file = OUTPUT_DIR / "upload_results.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)

    # Summary
    print("\n" + "=" * 70)
    print("📊 UPLOAD SUMMARY")
    print("=" * 70)

    for platform, info in results['platforms'].items():
        status_emoji = {
            'success': '✅',
            'error': '❌',
            'skipped': '⏭️'
        }.get(info['status'], '❓')

        print(f"{status_emoji} {platform.upper()}: {info['status']}")
        if 'url' in info:
            print(f"   URL: {info['url']}")
        elif 'message' in info:
            print(f"   {info['message']}")

    print(f"\n📄 Results saved: {results_file}")

    # Determine overall success
    youtube_success = results['platforms'].get('youtube', {}).get('status') == 'success'

    if youtube_success:
        print("\n✅ SUCCESS: Video uploaded successfully!")
        print(f"   Primary: {youtube_url}")
        if r2_url:
            print(f"   Backup: {r2_url}")
        return 0
    else:
        print("\n❌ FAILED: YouTube upload is required")
        return 1


if __name__ == "__main__":
    sys.exit(main())
