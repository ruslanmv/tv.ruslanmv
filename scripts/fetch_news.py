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
