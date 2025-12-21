#!/usr/bin/env python3
"""
Update static GitHub Pages assets (web/) from latest output/.

- copies output/youtube_info.json -> web/output/youtube_info.json
- maintains web/output/videos.json list with one entry per episode
"""

from __future__ import annotations

import json
import shutil
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # project root
OUTPUT_DIR = ROOT / "output"
WEB_DIR = ROOT / "web"
WEB_OUTPUT_DIR = WEB_DIR / "output"

WEB_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

info_path = OUTPUT_DIR / "youtube_info.json"
if not info_path.exists():
    raise SystemExit("output/youtube_info.json not found – did upload_youtube.py run?")

with info_path.open("r", encoding="utf-8") as f:
    info = json.load(f)

video_id = info.get("video_id") or info.get("id")
if not video_id:
    raise SystemExit("youtube_info.json missing video_id/id field")

url = info.get("url") or f"https://www.youtube.com/watch?v={video_id}"
title = info.get("title") or "Daily AI News"
published_at = info.get("published_at") or (
    datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
)

# optional richer metadata from another step
episode_meta_path = OUTPUT_DIR / "episode_metadata.json"
episode_meta = {}
if episode_meta_path.exists():
    with episode_meta_path.open("r", encoding="utf-8") as f:
        try:
            episode_meta = json.load(f)
        except json.JSONDecodeError:
            episode_meta = {}

episode_number = episode_meta.get("episode_number")
description = episode_meta.get("description")

entry = {
    "video_id": video_id,
    "url": url,
    "title": title,
    "description": description,
    "published_at": published_at,
    "episode_number": episode_number,
}

# 1) copy latest info for the hero player
dest_info_path = WEB_OUTPUT_DIR / "youtube_info.json"
shutil.copy2(info_path, dest_info_path)

# 2) update videos.json catalog
catalog_path = WEB_OUTPUT_DIR / "videos.json"
if catalog_path.exists():
    with catalog_path.open("r", encoding="utf-8") as f:
        try:
            catalog = json.load(f)
        except json.JSONDecodeError:
            catalog = []
else:
    catalog = []

# remove old entry with same video_id if present
catalog = [v for v in catalog if v.get("video_id") != video_id]

# prepend new entry
catalog.insert(0, entry)

with catalog_path.open("w", encoding="utf-8") as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print(f"✅ Updated {catalog_path} with latest video {video_id}")
print(f"✅ Copied latest youtube_info.json -> {dest_info_path}")
