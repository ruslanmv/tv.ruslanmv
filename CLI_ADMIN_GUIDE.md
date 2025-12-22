# TV Admin CLI - User Guide

A powerful command-line tool to manage episodes, series, and sync with Cloudflare R2 for the TV.RuslanMV video platform.

## Features

✅ **Episode Management**
- Add episodes (from pipeline output or manual files)
- Edit episode metadata
- Delete episodes
- List all episodes

✅ **Series Management**
- Create and manage series
- Assign episodes to series
- List series with episode counts

✅ **Auto-Sync**
- Automatically updates `index.json` and `latest.json`
- Maintains consistency across all episodes

✅ **R2 Integration** (Optional)
- Upload all episodes to Cloudflare R2
- Download episodes from R2
- Supports custom prefixes and endpoints

## Installation

### Prerequisites

```bash
# Python 3.8+ required
python3 --version

# Optional: For R2 sync
pip install boto3
```

### Setup

The CLI tool is ready to use. No installation needed - just run it directly:

```bash
python tv_admin_cli.py --help
```

## Quick Start

### 1. List Episodes

```bash
python tv_admin_cli.py list
```

Output:
```
📺 Total Episodes: 3

ID                                       Date         Series               Title
========================================================================================================================
2025-12-22-daily-ai-news                2025-12-22   daily-ai-news        Daily AI News - Dec 22
2025-12-21-weekly-recap                 2025-12-21   weekly-recap         Weekly AI Recap
2025-12-20-tutorial                     2025-12-20   tutorials            Building RAG Apps
```

### 2. Add Episode from Pipeline

After running your generation pipeline:

```bash
python tv_admin_cli.py add \
  --id "2025-12-22-daily-ai-news" \
  --title "Daily AI News - December 22" \
  --date "2025-12-22" \
  --video output/episode_video.mp4 \
  --audio output/episode_audio.mp3 \
  --script output/episode_script.txt \
  --description "Today's top AI news and developments" \
  --series "daily-ai-news"
```

Output:
```
➕ Adding episode: 2025-12-22-daily-ai-news
  ✅ Copied video: 45.2 MB
  ✅ Copied audio: 3.8 MB
  ✅ Copied script: 842 words

✅ Episode added: 2025-12-22-daily-ai-news
   Title: Daily AI News - December 22
   Date: 2025-12-22
   Series: daily-ai-news
   Location: frontend/public/episodes/2025-12-22-daily-ai-news/
```

### 3. Edit Episode

```bash
python tv_admin_cli.py edit \
  --id "2025-12-22-daily-ai-news" \
  --title "Daily AI News - Updated Title" \
  --description "Updated description with more details"
```

### 4. Delete Episode

```bash
# With confirmation
python tv_admin_cli.py delete --id "2025-12-22-daily-ai-news"

# Skip confirmation
python tv_admin_cli.py delete --id "2025-12-22-daily-ai-news" -y
```

## Advanced Usage

### Series Management

#### Create a Series

```bash
python tv_admin_cli.py series-add \
  --slug "daily-ai-news" \
  --title "Daily AI News" \
  --description "Daily updates on AI developments" \
  --cover "https://example.com/cover.jpg"
```

#### List Series

```bash
python tv_admin_cli.py series-list
```

Output:
```
📚 Total Series: 2

  Daily AI News
    Slug: daily-ai-news
    Episodes: 45
    Description: Daily updates on AI developments

  Weekly Recap
    Slug: weekly-recap
    Episodes: 12
    Description: Weekly summary of AI news
```

#### Delete Series

```bash
python tv_admin_cli.py series-delete --slug "daily-ai-news"
```

**Note:** Deleting a series does NOT delete the episodes in that series.

### R2 Cloud Sync

#### Upload to R2

```bash
python tv_admin_cli.py r2-upload \
  --bucket tv-ruslanmv \
  --endpoint https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com \
  --access-key YOUR_R2_ACCESS_KEY \
  --secret-key YOUR_R2_SECRET_KEY \
  --prefix "episodes/"
```

Output:
```
📤 Uploading episodes to R2 bucket: tv-ruslanmv
   Prefix: episodes/

  📁 2025-12-22-daily-ai-news
    ✅ episode.mp4 (45.2 MB)
    ✅ episode.mp3 (3.8 MB)
    ✅ episode.txt (12.4 KB)
    ✅ episode.json (2.1 KB)

  ✅ index.json
  ✅ latest.json

✅ Uploaded 38 files to R2
```

#### Download from R2

```bash
python tv_admin_cli.py r2-download \
  --bucket tv-ruslanmv \
  --endpoint https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com \
  --access-key YOUR_R2_ACCESS_KEY \
  --secret-key YOUR_R2_SECRET_KEY
```

### Advanced Metadata

Add custom metadata as JSON:

```bash
python tv_admin_cli.py add \
  --id "2025-12-22-tutorial" \
  --title "Advanced Tutorial" \
  --date "2025-12-22" \
  --video output/video.mp4 \
  --meta '{"author":"Ruslan Magana","category":"tutorial","level":"advanced","tags":["AI","RAG","LLM"]}'
```

## Integration with Automation Pipeline

### Automated Daily News Script

Create a script `automated_daily_news.sh`:

```bash
#!/bin/bash
set -e

echo "🎬 Starting Daily AI News Pipeline"
echo "===================================="

# 1. Fetch news
echo "📰 Fetching news..."
python scripts/fetch_news.py

# 2. Generate script
echo "✍️  Generating script..."
python scripts/generate_script.py

# 3. Generate audio
echo "🎙️  Generating audio..."
python scripts/generate_audio.py

# 4. Generate video
echo "🎥 Generating video..."
python scripts/generate_video.py

# 5. Publish using CLI
DATE=$(date +%Y-%m-%d)
EPISODE_ID="$DATE-daily-ai-news"

echo "📤 Publishing episode..."
python tv_admin_cli.py add \
  --id "$EPISODE_ID" \
  --title "Daily AI News - $DATE" \
  --date "$DATE" \
  --video output/episode_video.mp4 \
  --audio output/episode_audio.mp3 \
  --script output/episode_script.txt \
  --series "daily-ai-news" \
  --description "Today's AI news highlights and analysis" \
  --meta '{"source":"automated","pipeline":"daily-news","lang":"en"}'

# 6. Upload to R2 (optional)
if [ -n "$R2_BUCKET" ]; then
  echo "☁️  Uploading to R2..."
  python tv_admin_cli.py r2-upload \
    --bucket "$R2_BUCKET" \
    --endpoint "$R2_ENDPOINT" \
    --access-key "$R2_ACCESS_KEY" \
    --secret-key "$R2_SECRET_KEY"
fi

echo "✅ Pipeline complete!"
```

Make it executable and run:

```bash
chmod +x automated_daily_news.sh
./automated_daily_news.sh
```

### Cron Job Setup

Run daily at 8 AM:

```bash
# Edit crontab
crontab -e

# Add line:
0 8 * * * cd /path/to/tv.ruslanmv && ./automated_daily_news.sh >> logs/daily_news.log 2>&1
```

## File Structure

The CLI manages episodes in this structure:

```
frontend/public/episodes/
├── index.json                    # Global episode index
├── latest.json                   # Latest episode
├── series.json                   # Series metadata
├── 2025-12-22-daily-ai-news/
│   ├── episode.json              # Episode metadata
│   ├── episode.mp4               # Video file
│   ├── episode.mp3               # Audio file
│   └── episode.txt               # Script/transcript
├── 2025-12-21-weekly-recap/
│   ├── episode.json
│   ├── episode.mp4
│   ├── episode.mp3
│   └── episode.txt
└── ...
```

### Episode JSON Format

```json
{
  "id": "2025-12-22-daily-ai-news",
  "date": "2025-12-22",
  "title": "Daily AI News - December 22",
  "description": "Today's top AI news",
  "created_at": "2025-12-22T08:00:00Z",
  "video_url": "/episodes/2025-12-22-daily-ai-news/episode.mp4",
  "audio_url": "/episodes/2025-12-22-daily-ai-news/episode.mp3",
  "script_url": "/episodes/2025-12-22-daily-ai-news/episode.txt",
  "thumbnail_url": "",
  "series": "daily-ai-news",
  "meta": {
    "author": "Ruslan Magana",
    "category": "news"
  },
  "files_info": {
    "video": "45.2 MB",
    "audio": "3.8 MB",
    "script": "842 words"
  }
}
```

### Index JSON Format

```json
{
  "updated_at": "2025-12-22T08:00:00Z",
  "episodes": [
    {
      "id": "2025-12-22-daily-ai-news",
      "date": "2025-12-22",
      "title": "Daily AI News - December 22",
      "description": "Today's top AI news",
      "video_url": "/episodes/2025-12-22-daily-ai-news/episode.mp4",
      "series": "daily-ai-news",
      "thumbnail_url": ""
    }
  ]
}
```

## Command Reference

### Episode Commands

| Command | Description | Required Args | Optional Args |
|---------|-------------|---------------|---------------|
| `list` | List all episodes | None | None |
| `add` | Add new episode | `--id`, `--title`, `--date` | `--video`, `--audio`, `--script`, `--description`, `--series`, `--thumbnail`, `--meta` |
| `edit` | Edit episode metadata | `--id` | `--title`, `--description`, `--date`, `--series`, `--thumbnail`, `--meta` |
| `delete` | Delete episode | `--id` | `-y/--yes` |

### Series Commands

| Command | Description | Required Args | Optional Args |
|---------|-------------|---------------|---------------|
| `series-list` | List all series | None | None |
| `series-add` | Add new series | `--slug`, `--title` | `--description`, `--cover`, `--meta` |
| `series-delete` | Delete series | `--slug` | `-y/--yes` |

### R2 Commands

| Command | Description | Required Args | Optional Args |
|---------|-------------|---------------|---------------|
| `r2-upload` | Upload to R2 | `--bucket`, `--endpoint`, `--access-key`, `--secret-key` | `--prefix` |
| `r2-download` | Download from R2 | `--bucket`, `--endpoint`, `--access-key`, `--secret-key` | `--prefix` |

## Environment Variables (for R2)

Instead of passing R2 credentials on command line, you can use environment variables:

```bash
export R2_BUCKET="tv-ruslanmv"
export R2_ENDPOINT="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
export R2_ACCESS_KEY="your-access-key"
export R2_SECRET_KEY="your-secret-key"
```

Then modify the script to read from environment or pass them as needed.

## Troubleshooting

### Common Issues

**1. "No module named 'boto3'"**

Install boto3 for R2 functionality:
```bash
pip install boto3
```

**2. "Episode not found"**

Check episode ID matches exactly:
```bash
python tv_admin_cli.py list  # See all episode IDs
```

**3. "Permission denied"**

Make script executable:
```bash
chmod +x tv_admin_cli.py
```

**4. Files not copying**

Verify file paths are correct and files exist:
```bash
ls -lh output/episode_video.mp4
```

## Best Practices

1. **Use consistent episode IDs**: Format as `YYYY-MM-DD-slug`
   - ✅ `2025-12-22-daily-ai-news`
   - ❌ `episode_123`

2. **Always specify series**: Helps organize content
   ```bash
   --series "daily-ai-news"
   ```

3. **Backup before bulk operations**:
   ```bash
   cp -r frontend/public/episodes frontend/public/episodes.backup
   ```

4. **Use metadata for automation**: Add pipeline info
   ```bash
   --meta '{"source":"automated","version":"1.0"}'
   ```

5. **Sync to R2 regularly**: Keep cloud backup updated
   ```bash
   # Add to cron or automation script
   python tv_admin_cli.py r2-upload ...
   ```

## Next Steps

- [ ] Integrate CLI into your automation pipeline
- [ ] Set up cron jobs for daily publishing
- [ ] Configure R2 sync for cloud backup
- [ ] Create series for different content types
- [ ] Build admin API endpoints (future enhancement)

## Support

For issues or questions:
- Check the [ADMIN_ANALYSIS.md](ADMIN_ANALYSIS.md) for architecture details
- Review the script source code for advanced customization
- Open an issue on GitHub

---

**Happy Publishing! 🎬📺**
