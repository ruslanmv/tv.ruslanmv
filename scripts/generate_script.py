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
