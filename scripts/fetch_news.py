#!/usr/bin/env python3
"""
Fetch latest AI/Tech news from various RSS feeds and APIs
"""
import os
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
import requests
import feedparser
from bs4 import BeautifulSoup

# Output directories
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)


# News sources configuration
NEWS_SOURCES = [
    {
        "name": "Hacker News - AI",
        "url": "https://hn.algolia.com/api/v1/search?tags=story&query=AI&hitsPerPage=20",
        "type": "api"
    },
    {
        "name": "arXiv AI Papers",
        "url": "http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=10",
        "type": "arxiv"
    },
    {
        "name": "AI Weekly",
        "url": "https://www.artificialintelligence-news.com/feed/",
        "type": "rss"
    },
    {
        "name": "Tech Crunch AI",
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
        "type": "rss"
    },
]


def fetch_hackernews():
    """Fetch stories from Hacker News API"""
    print("📰 Fetching from Hacker News...")
    try:
        response = requests.get(
            "https://hn.algolia.com/api/v1/search?tags=story&query=AI&hitsPerPage=20",
            timeout=10
        )
        data = response.json()
        
        articles = []
        for hit in data.get('hits', [])[:10]:
            articles.append({
                'title': hit.get('title', ''),
                'url': hit.get('url', ''),
                'summary': hit.get('story_text', '')[:200] if hit.get('story_text') else '',
                'source': 'Hacker News',
                'published_at': hit.get('created_at', ''),
                'points': hit.get('points', 0)
            })
        
        print(f"   ✅ Found {len(articles)} articles from Hacker News")
        return articles
    except Exception as e:
        print(f"   ❌ Error fetching Hacker News: {e}")
        return []


def fetch_arxiv():
    """Fetch papers from arXiv API"""
    print("🔬 Fetching from arXiv...")
    try:
        response = requests.get(
            "http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=10",
            timeout=10
        )
        
        from xml.etree import ElementTree as ET
        root = ET.fromstring(response.content)
        
        articles = []
        for entry in root.findall('{http://www.w3.org/2005/Atom}entry')[:5]:
            title = entry.find('{http://www.w3.org/2005/Atom}title').text.strip()
            summary = entry.find('{http://www.w3.org/2005/Atom}summary').text.strip()[:200]
            link = entry.find('{http://www.w3.org/2005/Atom}id').text
            published = entry.find('{http://www.w3.org/2005/Atom}published').text
            
            articles.append({
                'title': title,
                'url': link,
                'summary': summary,
                'source': 'arXiv',
                'published_at': published,
                'type': 'research_paper'
            })
        
        print(f"   ✅ Found {len(articles)} papers from arXiv")
        return articles
    except Exception as e:
        print(f"   ❌ Error fetching arXiv: {e}")
        return []


def fetch_rss(url, source_name):
    """Fetch articles from RSS feed"""
    print(f"📡 Fetching from {source_name}...")
    try:
        feed = feedparser.parse(url)
        
        articles = []
        for entry in feed.entries[:10]:
            # Extract text from HTML summary if present
            summary = entry.get('summary', '')
            if summary:
                soup = BeautifulSoup(summary, 'html.parser')
                summary = soup.get_text()[:200]
            
            articles.append({
                'title': entry.get('title', ''),
                'url': entry.get('link', ''),
                'summary': summary,
                'source': source_name,
                'published_at': entry.get('published', ''),
            })
        
        print(f"   ✅ Found {len(articles)} articles from {source_name}")
        return articles
    except Exception as e:
        print(f"   ❌ Error fetching {source_name}: {e}")
        return []


def fetch_all_news():
    """Fetch news from all sources"""
    print("=" * 70)
    print("📰 Fetching Latest AI/Tech News")
    print("=" * 70)
    
    all_articles = []
    
    # Fetch from each source
    all_articles.extend(fetch_hackernews())
    all_articles.extend(fetch_arxiv())
    all_articles.extend(fetch_rss(
        "https://www.artificialintelligence-news.com/feed/",
        "AI Weekly"
    ))
    all_articles.extend(fetch_rss(
        "https://techcrunch.com/category/artificial-intelligence/feed/",
        "TechCrunch AI"
    ))
    
    # Sort by recency (if possible)
    all_articles = sorted(
        all_articles,
        key=lambda x: x.get('points', 0) if 'points' in x else 0,
        reverse=True
    )
    
    print("\n" + "=" * 70)
    print(f"✅ Total articles fetched: {len(all_articles)}")
    print("=" * 70)
    
    return all_articles


def save_news(articles):
    """Save news articles to JSON file"""
    output_file = DATA_DIR / "latest_news.json"
    
    data = {
        'fetched_at': datetime.now().isoformat(),
        'count': len(articles),
        'articles': articles
    }
    
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n💾 News saved to: {output_file}")
    
    # Print top 5
    print("\n📊 Top 5 Articles:")
    print("-" * 70)
    for i, article in enumerate(articles[:5], 1):
        print(f"{i}. {article['title']}")
        print(f"   Source: {article['source']}")
        print(f"   URL: {article['url'][:60]}...")
        print()


if __name__ == "__main__":
    try:
        articles = fetch_all_news()
        save_news(articles)
        print("\n✅ SUCCESS: News fetching complete!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
