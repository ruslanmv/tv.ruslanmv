#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# TV.RUSLANMV - AI Video Blog Pipeline (Patch Installer)
# ------------------------------------------------------------------------------
# Creates/updates:
#  - scripts/* pipeline files (news fetch, script gen, audio gen, video gen, etc.)
#  - scripts/requirements.txt
#  - frontend/public/episodes demo publishing structure
#  - .github/workflows/daily-ai-news-video-generation.yml
#  - a local runner that generates TWO demo episodes
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$ROOT_DIR/scripts"
OUTPUT_DIR="$ROOT_DIR/output"
FRONTEND_DIR="$ROOT_DIR/frontend"
FRONTEND_PUBLIC="$FRONTEND_DIR/public"
EPISODES_PUBLIC="$FRONTEND_PUBLIC/episodes"
WORKFLOW_DIR="$ROOT_DIR/.github/workflows"

mkdir -p "$SCRIPTS_DIR" "$OUTPUT_DIR" "$EPISODES_PUBLIC" "$WORKFLOW_DIR"

echo "✅ Creating/updating AI Video Blog pipeline files..."

# ------------------------------------------------------------------------------
# scripts/requirements.txt
# ------------------------------------------------------------------------------
cat > "$SCRIPTS_DIR/requirements.txt" <<'EOF'
# Core
python-dotenv>=1.0.1
requests>=2.32.0
feedparser>=6.0.11
beautifulsoup4>=4.12.3

# LLM routing (Ollama/OpenAI/Anthropic/etc.)
litellm>=1.43.0

# Audio / TTS (fallback included)
gTTS>=2.5.3
pydub>=0.25.1

# Optional providers (only needed if you actually use them)
openai>=1.40.0
anthropic>=0.34.0

# If you use ElevenLabs:
elevenlabs>=1.6.0
EOF

# ------------------------------------------------------------------------------
# scripts/_common.py
# ------------------------------------------------------------------------------
cat > "$SCRIPTS_DIR/_common.py" <<'EOF'
from __future__ import annotations
import os
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def read_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))

def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def env(name: str, default: str | None = None) -> str | None:
    return os.getenv(name, default)
EOF

# ------------------------------------------------------------------------------
# scripts/fetch_news.py  (RSS -> output/news.json)
# ------------------------------------------------------------------------------
cat > "$SCRIPTS_DIR/fetch_news.py" <<'EOF'
#!/usr/bin/env python3
from __future__ import annotations
import os
import re
import time
import feedparser
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from scripts._common import OUTPUT_DIR, write_json, utc_now_iso

DEFAULT_FEEDS = [
    "https://openai.com/blog/rss.xml",
    "https://www.anthropic.com/news/rss.xml",
    "https://ai.googleblog.com/atom.xml",
    "https://huggingface.co/blog/feed.xml",
    "https://www.microsoft.com/en-us/research/feed/",
    "https://www.ibm.com/blogs/research/feed/",
]

def clean_text(html: str) -> str:
    soup = BeautifulSoup(html or "", "html.parser")
    text = soup.get_text(" ", strip=True)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def fetch_url(url: str, timeout: int = 20) -> str:
    r = requests.get(url, timeout=timeout, headers={"User-Agent": "tv.ruslanmv bot"})
    r.raise_for_status()
    return r.text

def main() -> None:
    feeds = os.getenv("NEWS_RSS_FEEDS")
    feed_list = DEFAULT_FEEDS if not feeds else [f.strip() for f in feeds.split(",") if f.strip()]

    items = []
    for feed_url in feed_list:
        try:
            parsed = feedparser.parse(feed_url)
            for e in parsed.entries[:10]:
                title = (e.get("title") or "").strip()
                link = (e.get("link") or "").strip()
                summary = clean_text(e.get("summary") or e.get("description") or "")
                published = (e.get("published") or e.get("updated") or "").strip()

                if not title or not link:
                    continue

                items.append({
                    "title": title,
                    "link": link,
                    "summary": summary[:400],
                    "published": published,
                    "source": parsed.feed.get("title", "") or feed_url,
                })
        except Exception as ex:
            items.append({
                "title": f"[WARN] Failed feed: {feed_url}",
                "link": feed_url,
                "summary": str(ex),
                "published": "",
                "source": "pipeline",
            })
        time.sleep(0.2)

    out = {
        "generated_at": utc_now_iso(),
        "count": len(items),
        "feeds": feed_list,
        "items": items[:50],
    }
    write_json(OUTPUT_DIR / "news.json", out)
    print(f"✅ Wrote {len(out['items'])} news items -> output/news.json")

if __name__ == "__main__":
    main()
EOF
chmod +x "$SCRIPTS_DIR/fetch_news.py"

# ------------------------------------------------------------------------------
# scripts/analyze_packages.py  (simple curated/trending list -> output/packages.json)
# ------------------------------------------------------------------------------
cat > "$SCRIPTS_DIR/analyze_packages.py" <<'EOF'
#!/usr/bin/env python3
from __future__ import annotations
from scripts._common import OUTPUT_DIR, write_json, utc_now_iso

# NOTE: "Trending packages" is non-trivial without an external source.
# This script provides a stable curated list + placeholder metrics
# so your pipeline always works in CI.

DEFAULT_PACKAGES = [
    {"name": "litellm", "reason": "Unified interface across OpenAI/Anthropic/Ollama/etc."},
    {"name": "llama-index", "reason": "RAG orchestration and data connectors"},
    {"name": "langchain", "reason": "LLM tooling and agent patterns"},
    {"name": "vllm", "reason": "Fast local model inference"},
    {"name": "transformers", "reason": "HF ecosystem for models"},
    {"name": "fastapi", "reason": "Backends and APIs"},
]

def main() -> None:
    out = {
        "generated_at": utc_now_iso(),
        "packages": [
            {**p, "score": 80 + i, "notes": "placeholder scoring"} for i, p in enumerate(DEFAULT_PACKAGES)
        ]
    }
    write_json(OUTPUT_DIR / "packages.json", out)
    print("✅ Wrote package analysis -> output/packages.json")

if __name__ == "__main__":
    main()
EOF
chmod +x "$SCRIPTS_DIR/analyze_packages.py"

# ------------------------------------------------------------------------------
# scripts/generate_script.py  (LLM -> output/episode_script.txt + output/episode_meta.json)
# ------------------------------------------------------------------------------
cat > "$SCRIPTS_DIR/generate_script.py" <<'EOF'
#!/usr/bin/env python3
from __future__ import annotations

import os
from pathlib import Path
from scripts._common import OUTPUT_DIR, read_json, write_json, utc_now_iso
from dotenv import load_dotenv

def llm_generate(prompt: str) -> str:
    """
    Uses LiteLLM to call:
      - Ollama: NEWS_LLM_MODEL="ollama/gemma:2b" (default)
      - OpenAI:  NEWS_LLM_MODEL="gpt-4o-mini" + OPENAI_API_KEY
      - Anthropic: NEWS_LLM_MODEL="claude-3-5-sonnet-20240620" + ANTHROPIC_API_KEY
      - Watsonx.ai: can be routed via LiteLLM, but setup varies by account.
    """
    from litellm import completion

    model = os.getenv("NEWS_LLM_MODEL", "ollama/gemma:2b")
    temperature = float(os.getenv("NEWS_LLM_TEMPERATURE", "0.7"))

    # For Ollama in CI: set OLLAMA_HOST (e.g., http://127.0.0.1:11434)
    # LiteLLM respects OLLAMA_API_BASE / OLLAMA_HOST depending on version.
    # We'll pass base_url explicitly when set.
    extra = {}
    ollama_host = os.getenv("OLLAMA_HOST")
    if model.startswith("ollama/") and ollama_host:
        extra["api_base"] = ollama_host

    resp = completion(
        model=model,
        messages=[
            {"role": "system", "content": "You are a professional tech news anchor and script writer."},
            {"role": "user", "content": prompt},
        ],
        temperature=temperature,
        **extra,
    )
    return resp["choices"][0]["message"]["content"]

def main() -> None:
    load_dotenv()

    news = read_json(OUTPUT_DIR / "news.json", default={"items": []})
    pkgs = read_json(OUTPUT_DIR / "packages.json", default={"packages": []})

    # episode controls
    duration_sec = int(os.getenv("VIDEO_DURATION", "600"))
    target_minutes = max(3, duration_sec // 60)

    items = news.get("items", [])[:10]
    packages = pkgs.get("packages", [])[:6]

    # Build a deterministic fallback prompt even if sources are empty
    news_block = "\n".join([f"- {it.get('title')} ({it.get('source')}): {it.get('summary')} | {it.get('link')}" for it in items]) or "- No news items available."
    pkg_block = "\n".join([f"- {p['name']}: {p.get('reason','')}" for p in packages]) or "- No package items available."

    prompt = f"""
Create a video-blog episode script for TV.RuslanMV.

Constraints:
- Length: about {target_minutes} minutes spoken.
- Tone: clear, minimal hype, professional, friendly.
- Structure:
  1) Cold open (10-15 seconds)
  2) Headlines (3-5 bullet headlines, then expand each)
  3) "Tool of the day" from packages list
  4) Practical takeaway (2-3 tips)
  5) Closing (subscribe/follow)
- Output plain text only (no markdown).
- Do not invent quotes. If unsure, speak generally.
- Add short section breaks like: "=== HEADLINES ==="

Inputs:
AI/Tech News:
{news_block}

Trending/Useful packages:
{pkg_block}
""".strip()

    script_text = llm_generate(prompt).strip()

    # Save
    (OUTPUT_DIR / "episode_script.txt").write_text(script_text + "\n", encoding="utf-8")
    meta = {
        "generated_at": utc_now_iso(),
        "duration_seconds": duration_sec,
        "model": os.getenv("NEWS_LLM_MODEL", "ollama/gemma:2b"),
        "temperature": os.getenv("NEWS_LLM_TEMPERATURE", "0.7"),
        "news_count": len(items),
        "packages_count": len(packages),
    }
    write_json(OUTPUT_DIR / "episode_meta.json", meta)

    print("✅ Script generated -> output/episode_script.txt")

if __name__ == "__main__":
    main()
EOF
chmod +x "$SCRIPTS_DIR/generate_script.py"

# ------------------------------------------------------------------------------
# scripts/generate_audio.py  (episode_script.txt -> episode_audio.mp3)
# ------------------------------------------------------------------------------
cat > "$SCRIPTS_DIR/generate_audio.py" <<'EOF'
#!/usr/bin/env python3
"""
Generate audio from episode script using TTS
Priority:
  1) ElevenLabs (ELEVENLABS_API_KEY)
  2) OpenAI TTS (OPENAI_API_KEY)
  3) Google gTTS (free fallback)
"""
from __future__ import annotations
import os
import sys
from pathlib import Path
from scripts._common import OUTPUT_DIR
from dotenv import load_dotenv

def generate_audio_elevenlabs(script_text: str, output_file: str) -> bool:
    try:
        from elevenlabs import VoiceSettings
        from elevenlabs.client import ElevenLabs

        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            return False

        voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Rachel
        model_id = os.getenv("ELEVENLABS_MODEL", "eleven_multilingual_v2")

        print("🎤 Generating audio with ElevenLabs...")
        client = ElevenLabs(api_key=api_key)

        audio = client.text_to_speech.convert(
            voice_id=voice_id,
            model_id=model_id,
            text=script_text,
            voice_settings=VoiceSettings(stability=0.4, similarity_boost=0.75),
        )

        with open(output_file, "wb") as f:
            for chunk in audio:
                f.write(chunk)

        print(f"✅ Audio saved: {output_file}")
        return True
    except Exception as e:
        print(f"❌ ElevenLabs error: {e}")
        return False

def generate_audio_openai(script_text: str, output_file: str) -> bool:
    try:
        from openai import OpenAI
        if not os.getenv("OPENAI_API_KEY"):
            return False

        client = OpenAI()
        model = os.getenv("OPENAI_TTS_MODEL", "tts-1-hd")
        voice = os.getenv("OPENAI_TTS_VOICE", "onyx")

        print(f"🎤 Generating audio with OpenAI TTS ({voice})...")
        response = client.audio.speech.create(model=model, voice=voice, input=script_text)
        response.stream_to_file(output_file)

        print(f"✅ Audio saved: {output_file}")
        return True
    except Exception as e:
        print(f"❌ OpenAI TTS error: {e}")
        return False

def generate_audio_gtts(script_text: str, output_file: str) -> bool:
    try:
        from gtts import gTTS
        print("🎤 Generating audio with Google gTTS (fallback)...")
        tts = gTTS(text=script_text, lang="en", slow=False)
        tts.save(output_file)
        print(f"✅ Audio saved: {output_file}")
        return True
    except Exception as e:
        print(f"❌ gTTS error: {e}")
        return False

def main() -> None:
    load_dotenv()

    script_file = OUTPUT_DIR / "episode_script.txt"
    if not script_file.exists():
        print(f"❌ Missing: {script_file}")
        sys.exit(1)

    script_text = script_file.read_text(encoding="utf-8").strip()
    if not script_text:
        print("❌ Script is empty.")
        sys.exit(1)

    out_file = OUTPUT_DIR / "episode_audio.mp3"

    providers = [
        ("ElevenLabs", generate_audio_elevenlabs),
        ("OpenAI", generate_audio_openai),
        ("gTTS", generate_audio_gtts),
    ]

    for name, fn in providers:
        print(f"➡️  Trying {name}...")
        if fn(script_text, str(out_file)):
            return

    print("❌ All TTS providers failed. Configure ELEVENLABS_API_KEY or OPENAI_API_KEY, or use gTTS.")
    sys.exit(1)

if __name__ == "__main__":
    main()
EOF
chmod +x "$SCRIPTS_DIR/generate_audio.py"

# ------------------------------------------------------------------------------
# scripts/generate_video.py  (episode_audio.mp3 + subtitles -> episode_video.mp4)
# ------------------------------------------------------------------------------
cat > "$SCRIPTS_DIR/generate_video.py" <<'EOF'
#!/usr/bin/env python3
"""
Generate a simple "news studio" style video:
- solid background
- header text
- burned-in subtitles (SRT)
- audio narration

Requires: ffmpeg + ffprobe installed in runner.
"""
from __future__ import annotations
import os
import sys
import json
import subprocess
from pathlib import Path
from scripts._common import OUTPUT_DIR
from dotenv import load_dotenv

def get_audio_duration(audio_file: Path) -> float:
    cmd = ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(audio_file)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr)
    data = json.loads(r.stdout)
    return float(data["format"]["duration"])

def srt_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def create_subtitles(script_text: str, duration: float, max_lines: int = 120) -> Path:
    # naive sentence split that works reliably in CI
    parts = [p.strip() for p in script_text.replace("\n", " ").split(".") if p.strip()]
    if not parts:
        parts = [script_text.strip()]

    # limit to avoid giant SRT
    parts = parts[:max_lines]

    per = max(1.0, duration / len(parts))
    srt_path = OUTPUT_DIR / "episode_subtitles.srt"

    with srt_path.open("w", encoding="utf-8") as f:
        t = 0.0
        for i, line in enumerate(parts, start=1):
            start = t
            end = min(duration, t + per)
            f.write(f"{i}\n{srt_time(start)} --> {srt_time(end)}\n{line}\n\n")
            t = end

    return srt_path

def find_font() -> str:
    # ubuntu runners
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return "Arial"

def main() -> None:
    load_dotenv()

    audio = OUTPUT_DIR / "episode_audio.mp3"
    script = OUTPUT_DIR / "episode_script.txt"
    if not audio.exists():
        print("❌ Missing audio: output/episode_audio.mp3")
        sys.exit(1)
    if not script.exists():
        print("❌ Missing script: output/episode_script.txt")
        sys.exit(1)

    script_text = script.read_text(encoding="utf-8").strip()
    duration = get_audio_duration(audio)

    # Config
    resolution = os.getenv("VIDEO_RESOLUTION", "1920x1080")
    fps = os.getenv("VIDEO_FPS", "30")
    brand = os.getenv("VIDEO_BRAND", "TV.RUSLANMV")
    bg = os.getenv("VIDEO_BG", "0x0b1220")  # deep navy

    subtitles = create_subtitles(script_text, duration)
    font = find_font()

    out = OUTPUT_DIR / "episode_video.mp4"

    vf = (
        f"drawtext=fontfile='{font}':"
        f"text='{brand} - Daily AI News':"
        f"fontcolor=white:fontsize=56:x=(w-text_w)/2:y=70,"
        f"drawtext=fontfile='{font}':"
        f"text='Generated Episode':"
        f"fontcolor=white:fontsize=28:x=(w-text_w)/2:y=150,"
        f"subtitles='{subtitles}':force_style='FontSize=28,PrimaryColour=&HFFFFFF&,Outline=1,Shadow=0,Alignment=2,MarginV=60'"
    )

    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"color=c={bg}:s={resolution}:d={duration}:r={fps}",
        "-i", str(audio),
        "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        str(out),
    ]

    print("🎬 Rendering video via FFmpeg...")
    r = subprocess.run(cmd, text=True)
    if r.returncode != 0:
        print("❌ FFmpeg failed.")
        sys.exit(r.returncode)

    print(f"✅ Video generated -> {out}")

if __name__ == "__main__":
    main()
EOF
chmod +x "$SCRIPTS_DIR/generate_video.py"

# ------------------------------------------------------------------------------
# scripts/publish_episode.py  (copies output -> frontend/public/episodes/<slug>/...)
# ------------------------------------------------------------------------------
cat > "$SCRIPTS_DIR/publish_episode.py" <<'EOF'
#!/usr/bin/env python3
from __future__ import annotations
import re
import json
from pathlib import Path
from scripts._common import ROOT, OUTPUT_DIR, write_json, utc_now_iso

def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "episode"

def main() -> None:
    episodes_public = ROOT / "frontend" / "public" / "episodes"
    episodes_public.mkdir(parents=True, exist_ok=True)

    script_path = OUTPUT_DIR / "episode_script.txt"
    audio_path = OUTPUT_DIR / "episode_audio.mp3"
    video_path = OUTPUT_DIR / "episode_video.mp4"
    meta_path = OUTPUT_DIR / "episode_meta.json"

    if not (script_path.exists() and audio_path.exists() and video_path.exists()):
        raise SystemExit("Missing episode output files (script/audio/video). Run generation first.")

    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
    title = meta.get("title") or "Daily AI News"
    date = meta.get("date") or utc_now_iso()[:10]
    slug = meta.get("slug") or f"{date}-{slugify(title)}"

    ep_dir = episodes_public / slug
    ep_dir.mkdir(parents=True, exist_ok=True)

    # copy files
    (ep_dir / "episode.txt").write_text(script_path.read_text(encoding="utf-8"), encoding="utf-8")
    (ep_dir / "episode.mp3").write_bytes(audio_path.read_bytes())
    (ep_dir / "episode.mp4").write_bytes(video_path.read_bytes())

    episode_json = {
        "id": slug,
        "date": date,
        "title": title,
        "description": meta.get("description") or "Generated by TV.RUSLANMV AI Pipeline",
        "created_at": utc_now_iso(),
        "video_url": f"/episodes/{slug}/episode.mp4",
        "audio_url": f"/episodes/{slug}/episode.mp3",
        "script_url": f"/episodes/{slug}/episode.txt",
        "meta": meta,
    }
    write_json(ep_dir / "episode.json", episode_json)

    # update latest.json and index.json
    write_json(episodes_public / "latest.json", episode_json)

    # append to index
    index_path = episodes_public / "index.json"
    index = {"updated_at": utc_now_iso(), "episodes": []}
    if index_path.exists():
        try:
            index = json.loads(index_path.read_text(encoding="utf-8"))
        except Exception:
            index = {"updated_at": utc_now_iso(), "episodes": []}

    eps = index.get("episodes", [])
    eps = [e for e in eps if e.get("id") != slug]
    eps.insert(0, {"id": slug, "date": date, "title": title, "video_url": episode_json["video_url"]})
    index["episodes"] = eps[:50]
    index["updated_at"] = utc_now_iso()
    write_json(index_path, index)

    print(f"✅ Published episode -> frontend/public/episodes/{slug}")

if __name__ == "__main__":
    main()
EOF
chmod +x "$SCRIPTS_DIR/publish_episode.py"

# ------------------------------------------------------------------------------
# scripts/run_pipeline_once.sh  (one episode end-to-end)
# ------------------------------------------------------------------------------
cat > "$SCRIPTS_DIR/run_pipeline_once.sh" <<'EOF'
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
EOF
chmod +x "$SCRIPTS_DIR/run_pipeline_once.sh"

# ------------------------------------------------------------------------------
# scripts/generate_two_demo_episodes.sh  (creates TWO demo episodes like your HTML demo needs)
# ------------------------------------------------------------------------------
cat > "$SCRIPTS_DIR/generate_two_demo_episodes.sh" <<'EOF'
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
EOF
chmod +x "$SCRIPTS_DIR/generate_two_demo_episodes.sh"

# ------------------------------------------------------------------------------
# .github/workflows/daily-ai-news-video-generation.yml
# (Your workflow, preserved and slightly adjusted to match created files/paths)
# ------------------------------------------------------------------------------
cat > "$WORKFLOW_DIR/daily-ai-news-video-generation.yml" <<'EOF'
name: "📺 Daily AI News Video Generation"

on:
  schedule:
    - cron: "0 4 * * *"
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

env:
  # Ollama configuration (DEFAULT)
  OLLAMA_HOST: "http://127.0.0.1:11434"
  OLLAMA_MODEL: "gemma:2b"
  NEWS_LLM_MODEL: "ollama/gemma:2b"
  NEWS_LLM_TEMPERATURE: "0.7"

  # Video configuration
  VIDEO_DURATION: "600"
  VIDEO_RESOLUTION: "1920x1080"
  VIDEO_FPS: "30"

jobs:
  generate-and-publish:
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 🐍 Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: 'pip'

      - name: 📦 Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r scripts/requirements.txt

      - name: 🎬 Install FFmpeg
        run: |
          sudo apt-get update
          sudo apt-get install -y ffmpeg
          ffmpeg -version
          ffprobe -version

      # ============================================
      # 2. SETUP OLLAMA (DEFAULT LLM)
      # ============================================
      - name: ⚙️ Install Ollama
        run: |
          curl -fsSL https://ollama.com/install.sh | sh
          echo "✅ Ollama installed"

      - name: 🧠 Start Ollama service & pull model
        run: |
          ollama serve > ollama.log 2>&1 &
          echo "Waiting for Ollama..."
          for i in {1..30}; do
            if curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
              echo "✅ Ollama is ready!"
              break
            fi
            sleep 2
          done
          echo "Pulling model: $OLLAMA_MODEL"
          ollama pull $OLLAMA_MODEL
          ollama list

      - name: 🧪 Test Ollama connection
        run: |
          curl -X POST http://127.0.0.1:11434/api/generate \
            -H "Content-Type: application/json" \
            -d '{
              "model": "'$OLLAMA_MODEL'",
              "prompt": "Say hello in one short sentence.",
              "stream": false
            }' || echo "Warning: Ollama test failed"

      # ============================================
      # 3. GENERATE CONTENT
      # ============================================
      - name: 📰 Fetch AI news data
        env:
          WATSONX_APIKEY: ${{ secrets.WATSONX_APIKEY }}
          WATSONX_URL: ${{ secrets.WATSONX_URL }}
          WATSONX_PROJECT_ID: ${{ secrets.WATSONX_PROJECT_ID }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python scripts/fetch_news.py

      - name: 🔍 Analyze trending packages
        run: |
          python scripts/analyze_packages.py

      - name: ✍️ Generate episode script
        run: |
          python scripts/generate_script.py
          test -f output/episode_script.txt
          echo "Script lines: $(wc -l < output/episode_script.txt)"

      # ============================================
      # 4. GENERATE VIDEO
      # ============================================
      - name: 🎤 Generate audio (TTS)
        env:
          ELEVENLABS_API_KEY: ${{ secrets.ELEVENLABS_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          python scripts/generate_audio.py
          test -f output/episode_audio.mp3
          ls -lh output/episode_audio.mp3

      - name: 🎨 Generate video with subtitles
        run: |
          python scripts/generate_video.py
          test -f output/episode_video.mp4
          ls -lh output/episode_video.mp4

      # ============================================
      # 5. PUBLISH TO FRONTEND (STATIC)
      # ============================================
      - name: 🚀 Publish episode to frontend/public/episodes
        run: |
          python scripts/publish_episode.py
          test -f frontend/public/episodes/index.json
          test -f frontend/public/episodes/latest.json

      # ============================================
      # 6. COMMIT GENERATED CONTENT
      # ============================================
      - name: 💾 Commit generated content
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "📺 Daily AI News Episode - $(date +'%Y-%m-%d')"
          file_pattern: |
            frontend/public/episodes/**/*
            output/*.json
          commit_user_name: "TVRuslanmvBot"
          commit_user_email: "actions@github.com"

      # ============================================
      # 7. DEBUG ARTIFACTS
      # ============================================
      - name: 🧹 Upload artifacts for debugging
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: episode-artifacts-${{ github.run_number }}
          path: |
            output/
            frontend/public/episodes/
            ollama.log
          retention-days: 7
EOF

# ------------------------------------------------------------------------------
# Minimal README snippet (optional helper)
# ------------------------------------------------------------------------------
if [ ! -f "$ROOT_DIR/README_VIDEO_PIPELINE.md" ]; then
cat > "$ROOT_DIR/README_VIDEO_PIPELINE.md" <<'EOF'
# AI Video Blog Pipeline (TV.RuslanMV)

This patch adds a working pipeline that can run locally and in GitHub Actions:

- Fetch RSS news → `output/news.json`
- Create package highlights → `output/packages.json`
- Generate narration script with LLM (Ollama default) → `output/episode_script.txt`
- TTS to audio (ElevenLabs/OpenAI/gTTS fallback) → `output/episode_audio.mp3`
- FFmpeg render with subtitles → `output/episode_video.mp4`
- Publish to `frontend/public/episodes/<episode-id>/...` and update `index.json` / `latest.json`

## Local usage

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt

# install ffmpeg (mac: brew install ffmpeg | ubuntu: apt-get install ffmpeg)
./scripts/run_pipeline_once.sh
```

## Generate two demo episodes

```bash
./scripts/generate_two_demo_episodes.sh
```

## LLM selection

Default (Ollama):

* `NEWS_LLM_MODEL=ollama/gemma:2b`
* `OLLAMA_HOST=http://127.0.0.1:11434`

OpenAI:

* `NEWS_LLM_MODEL=gpt-4o-mini`
* `OPENAI_API_KEY=...`

Anthropic:

* `NEWS_LLM_MODEL=claude-3-5-sonnet-20240620`
* `ANTHROPIC_API_KEY=...`
EOF
fi

echo
echo "✅ Patch installed."
echo
echo "Next steps:"
echo "  1) Install deps:   pip install -r scripts/requirements.txt"
echo "  2) Ensure ffmpeg:  ffmpeg -version"
echo "  3) Run 2 demos:    ./scripts/generate_two_demo_episodes.sh"
echo
echo "GitHub Actions workflow created at:"
echo "  .github/workflows/daily-ai-news-video-generation.yml"
