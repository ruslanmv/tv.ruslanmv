# TV.RUSLANMV.COM - Project Repository Structure

## 🎬 Project Overview
**The First TV Channel Designed for Both Humans and AI**

A daily AI/tech news platform delivering 10-minute episodes covering:
- Latest AI developments
- Technology breakthroughs
- Trending packages and tools
- AI-readable content via MCP protocol

---

## 📁 Complete Repository Structure

```
tv.ruslanmv.com/
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── docker-compose.yml
├── Makefile
│
├── frontend/                          # Next.js TV Interface
│   ├── public/
│   │   ├── logo.svg
│   │   ├── tv-frame.svg
│   │   └── assets/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Main TV player page
│   │   │   ├── episodes/
│   │   │   │   └── [id]/page.tsx
│   │   │   └── api/
│   │   ├── components/
│   │   │   ├── TVPlayer/
│   │   │   │   ├── TVPlayer.tsx
│   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   ├── TVFrame.tsx
│   │   │   │   └── AutoPlayOverlay.tsx
│   │   │   ├── EpisodeList/
│   │   │   │   ├── EpisodeCard.tsx
│   │   │   │   └── EpisodeGrid.tsx
│   │   │   ├── Navigation/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── Sections/
│   │   │       ├── NewsSection.tsx
│   │   │       ├── PackageSection.tsx
│   │   │       └── TimestampNav.tsx
│   │   ├── hooks/
│   │   │   ├── useEpisodes.ts
│   │   │   ├── useAutoPlay.ts
│   │   │   └── useVideoPlayer.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── youtube.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── types/
│   │       └── episode.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── tailwind.config.js
│
├── backend/                           # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── episodes.py
│   │   │   │   ├── sections.py
│   │   │   │   └── packages.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── episode.py
│   │   │   ├── section.py
│   │   │   └── package.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── episode.py
│   │   │   └── section.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── episode_service.py
│   │       └── youtube_service.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
│
├── mcp-server/                        # MCP Server for AI Agents
│   ├── src/
│   │   ├── index.ts
│   │   ├── server.ts
│   │   ├── tools/
│   │   │   ├── get-episode.ts
│   │   │   ├── get-section.ts
│   │   │   ├── search-episodes.ts
│   │   │   └── get-trending-packages.ts
│   │   ├── resources/
│   │   │   ├── episode-resource.ts
│   │   │   └── transcript-resource.ts
│   │   └── types/
│   │       └── episode.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── content-generator/                 # AI Content Generation Pipeline
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── news_researcher.py
│   │   │   ├── script_writer.py
│   │   │   ├── package_analyzer.py
│   │   │   └── video_coordinator.py
│   │   ├── crews/
│   │   │   ├── __init__.py
│   │   │   └── episode_crew.py
│   │   ├── tasks/
│   │   │   ├── __init__.py
│   │   │   ├── research_tasks.py
│   │   │   ├── writing_tasks.py
│   │   │   └── analysis_tasks.py
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── news_scraper.py
│   │   │   ├── package_tracker.py
│   │   │   └── trend_analyzer.py
│   │   ├── templates/
│   │   │   ├── script_template.txt
│   │   │   └── section_template.txt
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── watsonx_client.py
│   ├── config/
│   │   └── agents.yaml
│   ├── requirements.txt
│   └── README.md
│
├── video-processor/                   # Video Generation & Processing
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── generators/
│   │   │   ├── __init__.py
│   │   │   ├── tts_generator.py
│   │   │   ├── video_generator.py
│   │   │   └── subtitle_generator.py
│   │   ├── editors/
│   │   │   ├── __init__.py
│   │   │   ├── scene_editor.py
│   │   │   └── transition_editor.py
│   │   ├── uploader/
│   │   │   ├── __init__.py
│   │   │   └── youtube_uploader.py
│   │   └── assets/
│   │       ├── templates/
│   │       ├── music/
│   │       └── graphics/
│   ├── requirements.txt
│   └── README.md
│
├── database/
│   ├── migrations/
│   │   └── versions/
│   ├── seeds/
│   │   └── sample_episodes.sql
│   └── schema.sql
│
├── scripts/
│   ├── generate_daily_episode.sh
│   ├── deploy.sh
│   ├── backup_db.sh
│   └── test_mcp_server.py
│
├── docs/
│   ├── API.md
│   ├── MCP_PROTOCOL.md
│   ├── CONTENT_GUIDELINES.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
│
├── tests/
│   ├── frontend/
│   ├── backend/
│   ├── mcp-server/
│   └── integration/
│
└── .github/
    ├── workflows/
    │   ├── daily-episode.yml
    │   ├── frontend-deploy.yml
    │   ├── backend-deploy.yml
    │   └── tests.yml
    └── ISSUE_TEMPLATE/
```

---

## 🎯 Key Components

### 1. Frontend (Next.js + React)
- **TV-like Interface**: Auto-playing video player with TV frame design
- **Episode Browser**: Grid view of all episodes
- **Section Navigation**: Jump to specific sections within episodes
- **Responsive Design**: Works on all devices

### 2. Backend (FastAPI)
- **REST API**: Episode management and metadata
- **Database**: PostgreSQL for structured data
- **YouTube Integration**: Video metadata and links
- **Search**: Full-text search for episodes and sections

### 3. MCP Server (TypeScript)
- **AI-Readable API**: MCP protocol implementation
- **Tools for AI Agents**:
  - `get_today_episode`: Fetch today's episode
  - `get_section`: Get specific section content
  - `search_episodes`: Search historical episodes
  - `get_trending_packages`: Latest trending tools
- **Resources**: Transcripts and structured content

### 4. Content Generator (CrewAI + watsonx.ai)
- **Multi-Agent System**:
  - News Researcher: Scrapes AI news sources
  - Script Writer: Creates episode scripts
  - Package Analyzer: Identifies trending tools
  - Video Coordinator: Orchestrates production
- **Daily Automation**: Generates content daily

### 5. Video Processor
- **TTS Generation**: AI voice narration
- **Video Assembly**: Combines visuals, audio, subtitles
- **YouTube Upload**: Automated publishing

---

## 🚀 Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Player

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Redis (caching)

### MCP Server
- TypeScript
- @modelcontextprotocol/sdk
- Express.js

### Content Generation
- CrewAI
- IBM watsonx.ai
- LangChain
- BeautifulSoup4
- PyPI API

### Video Processing
- FFmpeg
- MoviePy
- Google TTS / ElevenLabs
- YouTube API

### DevOps
- Docker & Docker Compose
- GitHub Actions
- Kubernetes (optional)
- Nginx

---

## 🎬 Episode Structure

Each 10-minute episode contains:

1. **Opening** (30s)
   - Channel intro
   - Date and episode number

2. **AI News Highlights** (3min)
   - Top 3-5 AI stories of the day

3. **Technology Breakthroughs** (2min)
   - Latest developments in tech

4. **Deep Dive** (2.5min)
   - Featured story analysis

5. **Research Papers** (1min)
   - Notable AI research

6. **Trending Packages** (1min)
   - Package of the day + trending tools

7. **Closing** (30s)
   - Summary and call-to-action

---

## 🤖 MCP Protocol Example

```json
{
  "tools": [
    {
      "name": "get_today_episode",
      "description": "Retrieves today's TV episode with all sections",
      "inputSchema": {
        "type": "object",
        "properties": {
          "include_transcript": {
            "type": "boolean",
            "description": "Include full transcript"
          }
        }
      }
    },
    {
      "name": "get_section",
      "description": "Get specific section from an episode",
      "inputSchema": {
        "type": "object",
        "properties": {
          "episode_id": { "type": "string" },
          "section_name": {
            "type": "string",
            "enum": ["news", "tech", "deepdive", "research", "packages"]
          }
        },
        "required": ["episode_id", "section_name"]
      }
    }
  ]
}
```

---

## 📝 Daily Workflow

1. **6:00 AM**: Content Generator scrapes news sources
2. **7:00 AM**: AI agents research and write script
3. **8:00 AM**: Video processor generates video
4. **9:00 AM**: YouTube upload and metadata
5. **10:00 AM**: Episode goes live on tv.ruslanmv.com
6. **10:01 AM**: MCP server updates with new episode

---

## 🔐 Environment Variables

```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost/tvruslanmv
REDIS_URL=redis://localhost:6379
YOUTUBE_API_KEY=your_key

# Content Generator
WATSONX_API_KEY=your_key
WATSONX_PROJECT_ID=your_project
OPENAI_API_KEY=your_key  # For TTS

# MCP Server
MCP_SERVER_PORT=3000
API_BASE_URL=http://localhost:8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MCP_WS_URL=ws://localhost:3000
```

---

## 🎨 Design Features

### TV Interface
- Retro TV frame design
- Auto-play on page load
- Channel-style branding
- "Now Playing" indicator
- Section timeline scrubber

### AI-First
- Structured data for AI consumption
- MCP protocol compliance
- Machine-readable transcripts
- Semantic search capabilities

---

## 📊 Database Schema

```sql
-- Episodes table
CREATE TABLE episodes (
    id UUID PRIMARY KEY,
    episode_number INTEGER UNIQUE,
    title VARCHAR(255),
    description TEXT,
    youtube_url VARCHAR(255),
    youtube_id VARCHAR(50),
    duration INTEGER,
    published_at TIMESTAMP,
    transcript TEXT,
    metadata JSONB
);

-- Sections table
CREATE TABLE sections (
    id UUID PRIMARY KEY,
    episode_id UUID REFERENCES episodes(id),
    section_type VARCHAR(50),
    title VARCHAR(255),
    content TEXT,
    start_time INTEGER,
    end_time INTEGER,
    order_index INTEGER
);

-- Packages table
CREATE TABLE packages (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    pypi_url VARCHAR(255),
    github_url VARCHAR(255),
    stars INTEGER,
    featured_date DATE,
    category VARCHAR(100)
);
```

---

## 🚦 Getting Started

```bash
# Clone repository
git clone https://github.com/ruslanmv/tv.ruslanmv.com.git
cd tv.ruslanmv.com

# Setup with Docker Compose
docker-compose up -d

# Or manual setup
make install
make migrate
make dev

# Generate first episode
python content-generator/src/main.py --generate-episode
```

---

## 🎯 Roadmap

- [x] Project structure design
- [ ] Frontend TV interface
- [ ] Backend API implementation
- [ ] MCP server setup
- [ ] Content generation pipeline
- [ ] Video processing automation
- [ ] YouTube integration
- [ ] Daily automation
- [ ] AI agent testing
- [ ] Production deployment

---

**"The First TV Channel Where AI Learns and Humans Watch"**
