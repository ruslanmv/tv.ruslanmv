#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "📰 Fetching news..."
python3 "$ROOT_DIR/scripts/fetch_news.py"

echo "📦 Analyzing packages..."
python3 "$ROOT_DIR/scripts/analyze_packages.py"

echo "✍️ Generating script..."
python3 "$ROOT_DIR/scripts/generate_script.py"

echo "🎤 Generating audio..."
python3 "$ROOT_DIR/scripts/generate_audio.py"

echo "🎬 Generating video..."
python3 "$ROOT_DIR/scripts/generate_video.py"

echo "🚀 Publishing episode to frontend/public/episodes..."
python3 "$ROOT_DIR/scripts/publish_episode.py"

echo "✅ Pipeline finished."
