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
