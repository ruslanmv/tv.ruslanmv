#!/usr/bin/env python3
"""
Generate HTML page for the latest episode
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime


OUTPUT_DIR = Path("output")
DATA_DIR = Path("data/episodes")
DOCS_DIR = Path("docs/episodes")


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TV.RUSLANMV.COM - Episode {date}</title>
    <meta name="description" content="{description}">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: system-ui, -apple-system, sans-serif;
            background: #000;
            color: #fff;
            line-height: 1.6;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }}
        header {{
            text-align: center;
            padding: 2rem 0;
            border-bottom: 1px solid #333;
        }}
        h1 {{
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }}
        .highlight {{
            color: #a855f7;
        }}
        .video-container {{
            margin: 2rem 0;
            aspect-ratio: 16/9;
            background: #111;
            border-radius: 8px;
            overflow: hidden;
        }}
        .video-container iframe {{
            width: 100%;
            height: 100%;
        }}
        .info {{
            background: #111;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 2rem 0;
        }}
        .info h2 {{
            margin-bottom: 1rem;
        }}
        .links {{
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }}
        .btn {{
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #a855f7;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            transition: background 0.3s;
        }}
        .btn:hover {{
            background: #9333ea;
        }}
        .btn-secondary {{
            background: #374151;
        }}
        .btn-secondary:hover {{
            background: #4b5563;
        }}
        footer {{
            text-align: center;
            padding: 2rem 0;
            margin-top: 4rem;
            border-top: 1px solid #333;
            color: #888;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📺 TV.<span class="highlight">RUSLANMV</span></h1>
            <p>AI-Powered Entertainment Channel</p>
        </header>

        <main>
            <div class="info">
                <h2>Episode - {date}</h2>
                <p>{description}</p>
            </div>

            <div class="video-container">
                {video_embed}
            </div>

            <div class="links">
                {links}
            </div>
        </main>

        <footer>
            <p>&copy; {year} TV.RUSLANMV.COM - Powered by AI</p>
        </footer>
    </div>
</body>
</html>
"""


def generate_episode_page():
    """Generate HTML page for latest episode"""
    print("=" * 70)
    print("📝 Generating Episode Page")
    print("=" * 70)

    # Create docs directory
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    # Load latest episode metadata
    latest_file = DATA_DIR / "latest_episode.json"

    if not latest_file.exists():
        print("⚠️  No episode metadata found - creating placeholder page")
        metadata = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'youtube': None,
            'r2': None
        }
    else:
        with open(latest_file, 'r') as f:
            metadata = json.load(f)

    # Extract data
    date = metadata.get('date', datetime.now().strftime('%Y-%m-%d'))
    description = f"Daily AI & Tech News - {date}"

    # Generate video embed
    video_embed = ""
    if metadata.get('youtube') and metadata['youtube'].get('video_id'):
        video_id = metadata['youtube']['video_id']
        video_embed = f'<iframe src="https://www.youtube.com/embed/{video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
        print(f"✅ YouTube embed: {video_id}")
    else:
        video_embed = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">📺 Video processing...</div>'
        print("⚠️  No YouTube video available yet")

    # Generate links
    links = []
    if metadata.get('youtube') and metadata['youtube'].get('url'):
        links.append(f'<a href="{metadata["youtube"]["url"]}" class="btn" target="_blank">▶️ Watch on YouTube</a>')

    if metadata.get('r2') and metadata['r2'].get('url'):
        links.append(f'<a href="{metadata["r2"]["url"]}" class="btn btn-secondary" target="_blank">💾 Direct Download (R2)</a>')

    links.append('<a href="/" class="btn btn-secondary">🏠 Home</a>')

    links_html = '\n                '.join(links)

    # Generate HTML
    html = HTML_TEMPLATE.format(
        date=date,
        description=description,
        video_embed=video_embed,
        links=links_html,
        year=datetime.now().year
    )

    # Save to docs directory
    output_file = DOCS_DIR / "latest.html"
    with open(output_file, 'w') as f:
        f.write(html)

    print(f"✅ Episode page generated: {output_file}")

    # Also save with date
    dated_file = DOCS_DIR / f"{date}.html"
    with open(dated_file, 'w') as f:
        f.write(html)

    print(f"✅ Dated page generated: {dated_file}")

    print("\n✅ SUCCESS: Episode pages generated!")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(generate_episode_page())
    except Exception as e:
        print(f"\n❌ Error generating page: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
