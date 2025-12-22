#!/bin/bash
#
# Automated Episode Publishing Script using CLI Admin Tool
#
# This script publishes generated episodes using the tv_admin_cli.py tool.
# It can be used as an alternative to publish_episode.py with more features.
#
# Usage:
#   ./scripts/automated_publish_cli.sh
#
# Requirements:
#   - Run the generation pipeline first (generate_script.py, generate_audio.py, generate_video.py)
#   - Set R2 credentials as environment variables (optional)
#

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TV.RuslanMV - Automated Publishing${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if output files exist
OUTPUT_DIR="output"
VIDEO_FILE="$OUTPUT_DIR/episode_video.mp4"
AUDIO_FILE="$OUTPUT_DIR/episode_audio.mp3"
SCRIPT_FILE="$OUTPUT_DIR/episode_script.txt"
META_FILE="$OUTPUT_DIR/episode_meta.json"

if [ ! -f "$VIDEO_FILE" ]; then
    echo -e "${RED}❌ Error: Video file not found: $VIDEO_FILE${NC}"
    echo "   Run the generation pipeline first:"
    echo "   python scripts/generate_video.py"
    exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
    echo -e "${RED}❌ Error: Audio file not found: $AUDIO_FILE${NC}"
    echo "   Run the generation pipeline first:"
    echo "   python scripts/generate_audio.py"
    exit 1
fi

if [ ! -f "$SCRIPT_FILE" ]; then
    echo -e "${RED}❌ Error: Script file not found: $SCRIPT_FILE${NC}"
    echo "   Run the generation pipeline first:"
    echo "   python scripts/generate_script.py"
    exit 1
fi

# Read metadata from episode_meta.json if it exists
if [ -f "$META_FILE" ]; then
    TITLE=$(python3 -c "import json; print(json.load(open('$META_FILE')).get('title', 'Daily AI News'))" 2>/dev/null || echo "Daily AI News")
    DATE=$(python3 -c "import json; print(json.load(open('$META_FILE')).get('date', ''))" 2>/dev/null || echo "")
    SERIES=$(python3 -c "import json; print(json.load(open('$META_FILE')).get('series', 'daily-ai-news'))" 2>/dev/null || echo "daily-ai-news")
    DESCRIPTION=$(python3 -c "import json; print(json.load(open('$META_FILE')).get('description', ''))" 2>/dev/null || echo "")
else
    TITLE="Daily AI News"
    DATE=""
    SERIES="daily-ai-news"
    DESCRIPTION=""
fi

# Use current date if not specified
if [ -z "$DATE" ]; then
    DATE=$(date +%Y-%m-%d)
fi

# Generate episode ID
EPISODE_ID="$DATE-$SERIES"

echo -e "${GREEN}📝 Publishing Episode${NC}"
echo "   ID: $EPISODE_ID"
echo "   Title: $TITLE"
echo "   Date: $DATE"
echo "   Series: $SERIES"
echo ""

# Build the CLI command
CMD="python tv_admin_cli.py add \
  --id \"$EPISODE_ID\" \
  --title \"$TITLE\" \
  --date \"$DATE\" \
  --video \"$VIDEO_FILE\" \
  --audio \"$AUDIO_FILE\" \
  --script \"$SCRIPT_FILE\""

# Add optional parameters
if [ -n "$DESCRIPTION" ]; then
    CMD="$CMD --description \"$DESCRIPTION\""
fi

if [ -n "$SERIES" ]; then
    CMD="$CMD --series \"$SERIES\""
fi

# Add metadata
METADATA="{\"source\":\"automated\",\"pipeline\":\"daily-news\",\"lang\":\"en\",\"published_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
CMD="$CMD --meta '$METADATA'"

# Execute the command
echo -e "${YELLOW}📤 Publishing to local storage...${NC}"
eval $CMD

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Episode published successfully!${NC}"
else
    echo -e "${RED}❌ Error publishing episode${NC}"
    exit 1
fi

# Upload to R2 if credentials are set
if [ -n "$R2_BUCKET" ] && [ -n "$R2_ENDPOINT" ] && [ -n "$R2_ACCESS_KEY" ] && [ -n "$R2_SECRET_KEY" ]; then
    echo ""
    echo -e "${YELLOW}☁️  Uploading to Cloudflare R2...${NC}"

    python tv_admin_cli.py r2-upload \
        --bucket "$R2_BUCKET" \
        --endpoint "$R2_ENDPOINT" \
        --access-key "$R2_ACCESS_KEY" \
        --secret-key "$R2_SECRET_KEY" \
        --prefix "${R2_PREFIX:-episodes/}"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Uploaded to R2 successfully!${NC}"
    else
        echo -e "${RED}⚠️  Warning: R2 upload failed${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}⚠️  R2 credentials not set, skipping cloud upload${NC}"
    echo "   Set these environment variables to enable R2 upload:"
    echo "   - R2_BUCKET"
    echo "   - R2_ENDPOINT"
    echo "   - R2_ACCESS_KEY"
    echo "   - R2_SECRET_KEY"
    echo "   - R2_PREFIX (optional, defaults to 'episodes/')"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Publishing Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Episode Details:"
echo "  ID: $EPISODE_ID"
echo "  Location: frontend/public/episodes/$EPISODE_ID/"
echo "  View: http://localhost:3000/episodes/$EPISODE_ID (after starting frontend)"
echo ""
