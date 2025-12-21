#!/usr/bin/env python3
"""
Upload video to Cloudflare R2 storage
R2 is S3-compatible, using boto3
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError


OUTPUT_DIR = Path("output")


def get_r2_client():
    """Create R2 S3-compatible client"""
    account_id = os.getenv("R2_ACCOUNT_ID")
    access_key_id = os.getenv("R2_ACCESS_KEY_ID")
    secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")

    if not all([account_id, access_key_id, secret_access_key]):
        print("⚠️  R2 credentials not configured - skipping R2 upload")
        return None

    # R2 endpoint format: https://{account_id}.r2.cloudflarestorage.com
    endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

    return boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name='auto'  # R2 uses 'auto' for region
    )


def upload_to_r2():
    """Upload video to Cloudflare R2"""
    print("=" * 70)
    print("📤 Cloudflare R2 Upload for TV.RUSLANMV.COM")
    print("=" * 70)

    # Get R2 client
    r2_client = get_r2_client()
    if not r2_client:
        print("ℹ️  R2 upload skipped (optional feature)")
        return None

    # Configuration
    bucket_name = os.getenv("R2_BUCKET_NAME", "tv-ruslanmv-videos")
    public_url_base = os.getenv("R2_PUBLIC_URL", f"https://videos.ruslanmv.com")

    # Check video file
    video_file = OUTPUT_DIR / "episode_video.mp4"
    if not video_file.exists():
        print(f"❌ Video file not found: {video_file}")
        sys.exit(1)

    # Generate unique filename
    today = datetime.now().strftime("%Y-%m-%d")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    video_key = f"episodes/{today}/{timestamp}_episode.mp4"

    print(f"\n📹 Video: {video_file}")
    print(f"🪣 Bucket: {bucket_name}")
    print(f"🔑 Key: {video_key}")

    try:
        print("\n🚀 Starting upload to R2...")

        # Upload file with public-read ACL
        with open(video_file, 'rb') as f:
            r2_client.put_object(
                Bucket=bucket_name,
                Key=video_key,
                Body=f,
                ContentType='video/mp4',
                Metadata={
                    'uploaded_at': datetime.now().isoformat(),
                    'source': 'tv.ruslanmv.com',
                    'episode_date': today
                }
            )

        # Construct public URL
        public_url = f"{public_url_base}/{video_key}"

        print(f"\n✅ Upload successful!")
        print(f"   Key: {video_key}")
        print(f"   URL: {public_url}")

        # Save R2 info
        r2_info = {
            'bucket': bucket_name,
            'key': video_key,
            'url': public_url,
            'uploaded_at': datetime.now().isoformat(),
            'size_bytes': video_file.stat().st_size
        }

        info_file = OUTPUT_DIR / "r2_info.json"
        with open(info_file, 'w') as f:
            json.dump(r2_info, f, indent=2)

        print(f"   Info saved: {info_file}")
        print("\n✅ SUCCESS: R2 upload complete!")

        return public_url

    except ClientError as e:
        error_code = e.response['Error']['Code']
        print(f"\n❌ R2 upload error: {error_code}")
        print(f"   Message: {e.response['Error']['Message']}")

        # Don't fail the entire workflow for optional R2 upload
        print("\n⚠️  Continuing without R2 backup (optional feature)")
        return None

    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        print("\n⚠️  Continuing without R2 backup (optional feature)")
        return None


if __name__ == "__main__":
    upload_to_r2()
