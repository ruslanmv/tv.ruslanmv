#!/usr/bin/env python3
import os
import json
from pathlib import Path
from datetime import datetime, timezone

import boto3

OUTPUT_DIR = Path("output")
DATA_DIR = Path("data/episodes")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_r2_client():
    account_id = os.getenv("R2_ACCOUNT_ID")
    access_key_id = os.getenv("R2_ACCESS_KEY_ID")
    secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")

    if not all([account_id, access_key_id, secret_access_key]):
        raise RuntimeError("Missing R2 credentials (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)")

    endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name="auto",
    )


def s3_put_json(client, bucket: str, key: str, obj: dict):
    body = json.dumps(obj, indent=2).encode("utf-8")
    client.put_object(
        Bucket=bucket,
        Key=key,
        Body=body,
        ContentType="application/json; charset=utf-8",
        CacheControl="public, max-age=60",
    )


def s3_get_json(client, bucket: str, key: str):
    try:
        res = client.get_object(Bucket=bucket, Key=key)
        return json.loads(res["Body"].read().decode("utf-8"))
    except client.exceptions.NoSuchKey:
        return None
    except Exception:
        return None


def main():
    bucket = os.getenv("R2_BUCKET_NAME", "tv-ruslanmv-videos")
    public_base = (os.getenv("R2_PUBLIC_URL") or "https://videos.ruslanmv.com").rstrip("/")

    today = datetime.now().strftime("%Y-%m-%d")

    # Inputs produced by your pipeline
    video_file = OUTPUT_DIR / "episode_video.mp4"
    if not video_file.exists():
        raise FileNotFoundError(f"Missing {video_file}")

    # This file is created by scripts/save_episode.py
    episode_file = DATA_DIR / f"{today}_episode.json"
    if not episode_file.exists():
        raise FileNotFoundError(f"Missing {episode_file} (run scripts/save_episode.py first)")

    episode_raw = json.loads(episode_file.read_text(encoding="utf-8"))

    # Build a public-friendly episode manifest
    title = episode_raw.get("title") or f"Daily AI News — {today}"
    description = episode_raw.get("description") or "Daily AI/tech news episode generated automatically."

    episode_key_prefix = f"episodes/{today}"
    mp4_key = f"{episode_key_prefix}/episode.mp4"
    json_key = f"{episode_key_prefix}/episode.json"

    mp4_url = f"{public_base}/{mp4_key}"
    json_url = f"{public_base}/{json_key}"

    manifest = {
        "date": today,
        "title": title,
        "description": description,
        "video_url": mp4_url,
        "episode_url": json_url,
        "created_at": utc_now_iso(),
        "duration_seconds": episode_raw.get("duration_seconds"),
        "youtube_url": (episode_raw.get("youtube") or {}).get("url"),
        "r2_key": (episode_raw.get("r2") or {}).get("key") or mp4_key,
        "source": "github-actions",
    }

    client = get_r2_client()

    # Upload MP4 (cache longer)
    print(f"📤 Uploading video to R2: {mp4_key}")
    with video_file.open("rb") as f:
        client.put_object(
            Bucket=bucket,
            Key=mp4_key,
            Body=f,
            ContentType="video/mp4",
            CacheControl="public, max-age=31536000, immutable",
        )

    # Upload episode.json (manifest)
    print(f"📝 Uploading episode metadata: {json_key}")
    s3_put_json(client, bucket, json_key, manifest)

    # Update latest.json
    print("🔄 Updating latest.json")
    s3_put_json(client, bucket, "episodes/latest.json", manifest)

    # Update index.json (prepend new episode, keep last 60)
    index_key = "episodes/index.json"
    print("📑 Updating episode index")
    index = s3_get_json(client, bucket, index_key) or {"updated_at": utc_now_iso(), "episodes": []}

    # remove existing same date
    episodes = [e for e in index.get("episodes", []) if e.get("date") != today]
    episodes.insert(0, manifest)

    index = {
        "updated_at": utc_now_iso(),
        "episodes": episodes[:60],
    }

    s3_put_json(client, bucket, index_key, index)

    print("\n✅ Published to R2:")
    print(f"   MP4:   {mp4_url}")
    print(f"   JSON:  {json_url}")
    print(f"   Index: {public_base}/{index_key}")
    print(f"   Latest:{public_base}/episodes/latest.json")


if __name__ == "__main__":
    main()
