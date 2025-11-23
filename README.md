# 📺 TV.RUSLANMV.COM

**The First TV Channel Designed for Both AI Agents and Humans**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![MCP](https://img.shields.io/badge/MCP-enabled-purple.svg)](mcp-server/)

---

## 🎬 Overview

TV.RUSLANMV.COM is a revolutionary daily AI/tech news platform that delivers 10-minute episodes covering the latest in artificial intelligence, technology breakthroughs, and trending developer tools. What makes it unique? It's designed to be consumed by **both humans and AI agents**.

### Key Features

- 📰 **Daily AI News Episodes** - Fresh content every day at 10 AM
- 🎥 **Professional Video Production** - AI-generated, YouTube-hosted
- 🤖 **AI-Readable Content** - MCP (Model Context Protocol) server for AI agents
- 📦 **Package Spotlight** - Daily featured trending tools
- 🔍 **Searchable Archive** - Full-text search across all episodes
- 🎨 **Retro TV Interface** - Engaging, auto-playing web experience

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
│                    Humans & AI Agents                        │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
           │ Web Browser                      │ MCP Protocol
           ▼                                  ▼
┌──────────────────────┐          ┌──────────────────────┐
│   Next.js Frontend   │          │     MCP Server       │
│   (Port 3001)        │◄─────────┤    (Port 3000)       │
│   - TV Player UI     │          │   - AI Tools         │
│   - Episode Browser  │          │   - Resources        │
└──────────┬───────────┘          └──────────┬───────────┘
           │                                  │
           │ REST API                         │ REST API
           ▼                                  ▼
┌──────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)              │
│              - Episode Management                     │
│              - Section CRUD                           │
│              - Package Tracking                       │
│              - Search & Analytics                     │
└─────────┬────────────────────────────────────────────┘
          │
          ├─────────────┬─────────────┬──────────────┐
          ▼             ▼             ▼              ▼
┌──────────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐
│  PostgreSQL  │ │  Redis   │ │  YouTube   │ │ watsonx  │
│  Database    │ │  Cache   │ │    API     │ │   .ai    │
└──────────────┘ └──────────┘ └────────────┘ └──────────┘

┌─────────────────────────────────────────────────────────────┐
│                     CONTENT PIPELINE                         │
│                     (Daily Execution)                        │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Content Generator   │          │  Video Processor     │
│  (CrewAI + watsonx)  │─────────►│  (FFmpeg + TTS)      │
│  - News Research     │          │  - Video Generation  │
│  - Script Writing    │          │  - YouTube Upload    │
│  - Package Analysis  │          │                      │
└──────────────────────┘          └──────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- IBM watsonx.ai API Key
- YouTube API credentials

### 1. Clone Repository

```bash
git clone https://github.com/ruslanmv/tv.ruslanmv.com.git
cd tv.ruslanmv.com
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://tvuser:changeme123@postgres:5432/tvruslanmv

# watsonx.ai
WATSONX_API_KEY=your_watsonx_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# YouTube
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REFRESH_TOKEN=your_refresh_token

# Optional: Text-to-Speech
ELEVENLABS_API_KEY=your_elevenlabs_key
OPENAI_API_KEY=your_openai_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MCP_WS_URL=ws://localhost:3000
```

### 3. Start Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or use Makefile
make up

# View logs
docker-compose logs -f
```

### 4. Access the Platform

- **Web Interface**: http://localhost:3001
- **API Documentation**: http://localhost:8000/docs
- **MCP Server**: stdio://localhost:3000

### 5. Generate First Episode

```bash
# Run content generator
docker-compose run --rm content-generator python src/main.py --generate-episode

# Or using Makefile
make generate-episode
```

---

## 📦 Project Structure

```
tv.ruslanmv.com/
├── frontend/              # Next.js TV interface
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   │   ├── TVPlayer/  # Main TV player
│   │   │   ├── EpisodeList/
│   │   │   └── Sections/
│   │   └── lib/           # Utilities
│   └── package.json
│
├── backend/               # FastAPI REST API
│   ├── app/
│   │   ├── api/v1/        # API endpoints
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   └── requirements.txt
│
├── mcp-server/            # MCP server for AI agents
│   ├── src/
│   │   ├── tools/         # MCP tools
│   │   └── resources/     # MCP resources
│   └── package.json
│
├── content-generator/     # AI content generation
│   ├── src/
│   │   ├── agents/        # CrewAI agents
│   │   ├── crews/         # Crew definitions
│   │   ├── tasks/         # Task definitions
│   │   └── tools/         # Custom tools
│   └── requirements.txt
│
├── video-processor/       # Video generation & upload
│   ├── src/
│   │   ├── generators/    # TTS, video generation
│   │   ├── editors/       # Video editing
│   │   └── uploader/      # YouTube uploader
│   └── requirements.txt
│
├── database/              # Database files
│   ├── schema.sql         # Database schema
│   └── migrations/        # Alembic migrations
│
└── docker-compose.yml     # Docker orchestration
```

---

## 🎯 Episode Structure

Each 10-minute episode follows this structure:

| Section | Duration | Content |
|---------|----------|---------|
| **Opening** | 30s | Channel intro, date, episode number |
| **AI News** | 3min | Top 3-5 AI stories of the day |
| **Tech Breakthroughs** | 2min | Latest technology developments |
| **Deep Dive** | 2.5min | Featured story analysis |
| **Research Papers** | 1min | Notable AI research |
| **Package of the Day** | 1min | Trending tool spotlight |
| **Closing** | 30s | Summary and call-to-action |

---

## 🤖 MCP Integration for AI Agents

### Available Tools

1. **`get_today_episode`**
   - Fetches today's episode with all sections
   - Returns structured JSON

2. **`get_episode`**
   - Retrieves specific episode by ID
   - Optional transcript inclusion

3. **`get_section`**
   - Gets specific section (news, tech, deepdive, research, packages)
   - Returns section content and metadata

4. **`search_episodes`**
   - Full-text search across episodes
   - Date range filtering

5. **`get_trending_packages`**
   - Lists current trending tools
   - Includes GitHub stars, PyPI downloads

6. **`get_package_of_day`**
   - Featured package with usage examples

### Usage Example

```json
// Claude Desktop config.json
{
  "mcpServers": {
    "tv-ruslanmv": {
      "command": "node",
      "args": ["/path/to/tv.ruslanmv.com/mcp-server/dist/index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

### AI Agent Example

```python
# Using MCP in Python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def get_ai_news():
    server_params = StdioServerParameters(
        command="node",
        args=["./mcp-server/dist/index.js"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Get today's episode
            result = await session.call_tool(
                "get_today_episode",
                {"include_transcript": True}
            )
            return result
```

---

## 🛠️ Development

### Local Development Setup

```bash
# Install dependencies
make install

# Start development servers
make dev

# Run tests
make test

# Lint code
make lint
```

### Database Management

```bash
# Create migration
make migrate-create name="add_new_table"

# Run migrations
make migrate

# Seed database
make seed

# Backup database
make backup
```

### Content Generation

```bash
# Generate episode manually
python content-generator/src/main.py --generate-episode

# Test news scraper
python content-generator/src/tools/news_scraper.py

# Test package tracker
python content-generator/src/tools/package_tracker.py
```

### Video Processing

```bash
# Generate video from script
python video-processor/src/main.py --script output/episode_2025-01-15_script.txt

# Upload to YouTube
python video-processor/src/uploader/youtube_uploader.py --video output/episode.mp4
```

---

## 📊 Daily Automation

The platform runs automatically via GitHub Actions:

**Daily Workflow** (`.github/workflows/daily-episode.yml`):

1. **6:00 AM UTC** - Content generator starts
2. **7:00 AM UTC** - Script generation complete
3. **8:00 AM UTC** - Video processing begins
4. **9:00 AM UTC** - YouTube upload
5. **10:00 AM UTC** - Episode goes live

---

## 🎨 Frontend Customization

### TV Frame Styling

Edit `frontend/src/components/TVPlayer/TVFrame.tsx`:

```tsx
// Customize TV bezel colors
const bezelGradient = 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';

// Adjust screen aspect ratio
const aspectRatio = '16:9'; // or '4:3' for retro look
```

### Auto-Play Behavior

```tsx
// Disable auto-play
<TVPlayer episode={episode} autoPlay={false} />

// Custom overlay duration
const overlayDuration = 5000; // 5 seconds
```

---

## 🔐 Security

- API keys stored in environment variables
- Database credentials never committed
- CORS properly configured
- Rate limiting on API endpoints
- MCP server requires authentication (production)
- YouTube OAuth with refresh tokens

---

## 📈 Analytics

The platform tracks:

- Episode views
- Completion rates
- Section engagement
- MCP API usage
- AI agent interactions

Access analytics:

```bash
# View dashboard
http://localhost:8000/analytics

# Export metrics
make export-analytics
```

---

## 🚢 Deployment

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/

# Check status
kubectl get pods -n tvruslanmv
```

### Environment Variables (Production)

Ensure these are set:

- `ENVIRONMENT=production`
- `DATABASE_URL=` (production database)
- `REDIS_URL=` (production Redis)
- Enable SSL/TLS
- Set proper CORS origins

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- **IBM watsonx.ai** - LLM platform
- **CrewAI** - Multi-agent orchestration
- **Model Context Protocol** - AI agent integration
- **Next.js** - Frontend framework
- **FastAPI** - Backend framework

---

## 📞 Support

- **Documentation**: [docs.tv.ruslanmv.com](https://docs.tv.ruslanmv.com)
- **Issues**: [GitHub Issues](https://github.com/ruslanmv/tv.ruslanmv.com/issues)
- **Email**: support@ruslanmv.com

---

**"Where AI Learns and Humans Watch"** 🤖📺👨‍💻
