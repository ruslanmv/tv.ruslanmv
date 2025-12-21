#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/output"

# Each demo changes the metadata and seeds a deterministic "topic angle" for the script prompt.
# The real content still comes from fetch_news/analyze_packages + your LLM.

make_episode() {
  local title="$1"
  local description="$2"
  local date="$3"
  local slug="$4"

  echo "============================================================"
  echo "🎬 Demo episode: $title"
  echo "============================================================"

  python3 "$ROOT_DIR/scripts/fetch_news.py"
  python3 "$ROOT_DIR/scripts/analyze_packages.py"

  # Add meta overrides consumed by publish_episode.py
  cat > "$OUTPUT_DIR/episode_meta.json" <<JSON
{
  "title": "$title",
  "description": "$description",
  "date": "$date",
  "slug": "$slug",
  "generated_at": "$(python3 -c 'from scripts._common import utc_now_iso; print(utc_now_iso())')",
  "model": "${NEWS_LLM_MODEL:-ollama/gemma:2b}",
  "temperature": "${NEWS_LLM_TEMPERATURE:-0.7}"
}
JSON

  # generate script (LLM); then audio/video; then publish
  python3 "$ROOT_DIR/scripts/generate_script.py"
  python3 "$ROOT_DIR/scripts/generate_audio.py"
  python3 "$ROOT_DIR/scripts/generate_video.py"
  python3 "$ROOT_DIR/scripts/publish_episode.py"
}

# Demo 1 and Demo 2
make_episode \
  "Multi-Agent Systems with Universal A2A" \
  "A practical walkthrough of multi-agent orchestration patterns, tools, and pitfalls." \
  "$(date -u +%F)" \
  "$(date -u +%F)-universal-a2a-demo"

make_episode \
  "Watsonx.ai to MCP Gateway: Enterprise RAG in Production" \
  "A production-oriented episode about enterprise RAG, governance, and secure tool use." \
  "$(date -u +%F)" \
  "$(date -u +%F)-watsonx-mcp-demo"

echo "✅ Two demo episodes created."
echo "   See: frontend/public/episodes/index.json"
