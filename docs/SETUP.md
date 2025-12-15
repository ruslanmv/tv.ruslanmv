# 📺 TV.RUSLANMV.COM - Complete Setup Guide

**Production-Ready Setup Instructions for Automated AI Video Generation**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Installation Methods](#installation-methods)
5. [Environment Configuration](#environment-configuration)
6. [Using the Makefile](#using-the-makefile)
7. [Using UV Package Manager](#using-uv-package-manager)
8. [Docker Setup](#docker-setup)
9. [GitHub Actions Setup](#github-actions-setup)
10. [Production Deployment](#production-deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

TV.RUSLANMV.COM is an automated AI-powered video generation platform that creates daily tech news episodes using:

- **Ollama** (default) - Free local LLM
- **watsonx.ai** (optional) - Premium AI quality
- **CrewAI** - Multi-agent orchestration
- **FFmpeg** - Video processing
- **YouTube API** - Automated publishing

### Key Features

✅ **100% Free** local development with Ollama
✅ **Automated** daily video generation via GitHub Actions
✅ **Production-ready** with Docker and UV
✅ **Flexible** LLM providers (Ollama, watsonx.ai, OpenAI, Anthropic)
✅ **Easy setup** with Makefile commands

---

## 📦 Prerequisites

### Required Software

| Software | Version | Purpose | Install URL |
|----------|---------|---------|-------------|
| **Python** | 3.11+ | Runtime | https://python.org |
| **UV** | Latest | Package manager | https://github.com/astral-sh/uv |
| **Docker** | 20.10+ | Containerization | https://docker.com |
| **Docker Compose** | 2.0+ | Multi-container | Included with Docker Desktop |
| **Git** | 2.0+ | Version control | https://git-scm.com |
| **FFmpeg** | 4.4+ | Video processing | https://ffmpeg.org |
| **Ollama** | Latest | Local LLM (optional) | https://ollama.com |

### Optional Software

- **Make** - For using Makefile commands (pre-installed on Linux/Mac)
- **Node.js 18+** - For frontend development
- **PostgreSQL 15+** - For local database (or use Docker)

### System Requirements

**Minimum:**
- CPU: 4 cores
- RAM: 8 GB
- Disk: 20 GB free space

**Recommended:**
- CPU: 8+ cores
- RAM: 16+ GB
- Disk: 50+ GB free space
- GPU: NVIDIA GPU for faster Ollama inference (optional)

---

## 🚀 Quick Start

### Method 1: One-Command Setup (Recommended)

```bash
# Clone repository
git clone https://github.com/ruslanmv/tv.ruslanmv.git
cd tv.ruslanmv

# Quick start everything
make quick-start
```

This single command will:
1. Install all dependencies with UV
2. Create `.env` from template
3. Pull Ollama models
4. Start all Docker services
5. Set up the database

### Method 2: Manual Step-by-Step

```bash
# 1. Clone repository
git clone https://github.com/ruslanmv/tv.ruslanmv.git
cd tv.ruslanmv

# 2. Install UV package manager
curl -LsSf https://astral.sh/uv/install.sh | sh

# 3. Install dependencies
uv sync

# 4. Create environment file
cp .env.example .env

# 5. Edit .env with your configuration
nano .env  # or use your favorite editor

# 6. Start Docker services
docker-compose up -d

# 7. Pull Ollama model
ollama pull gemma:2b

# 8. Generate your first video
make run-video
```

---

## 🔧 Installation Methods

### Option 1: Using UV (Recommended)

UV is a fast Python package manager that replaces pip and virtualenv.

```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install project dependencies
uv sync

# Install with development tools
uv sync --all-extras

# Run a script
uv run python scripts/generate_script.py
```

**Benefits of UV:**
- ⚡ 10-100x faster than pip
- 🔒 Automatic virtual environment management
- 📦 Lock file for reproducible builds
- 🎯 Better dependency resolution

### Option 2: Using pip + venv

Traditional Python setup:

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows

# Install dependencies
pip install -r scripts/requirements.txt

# Run scripts
python scripts/generate_script.py
```

### Option 3: Using Docker Only

No local Python installation needed:

```bash
# Build and start all services
docker-compose up -d

# Run commands inside container
docker-compose run --rm content-generator python scripts/generate_script.py

# View logs
docker-compose logs -f
```

---

## ⚙️ Environment Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Minimum Configuration (Local Development)

Edit `.env` with these minimum settings:

```env
# Database (use Docker defaults)
DATABASE_URL=postgresql://tvuser:changeme123@localhost:5432/tvruslanmv

# Ollama (free local LLM)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma:2b
NEWS_LLM_MODEL=ollama/gemma:2b
```

**That's it!** No API keys needed for local development.

### 3. Full Configuration (Production)

For YouTube uploads and better quality, add:

```env
# YouTube Upload
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REFRESH_TOKEN=your_refresh_token
YOUTUBE_API_KEY=your_api_key

# Text-to-Speech (choose one)
ELEVENLABS_API_KEY=your_elevenlabs_key
# OR
OPENAI_API_KEY=your_openai_key

# Better Quality LLM (optional)
NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2
WATSONX_APIKEY=your_watsonx_key
WATSONX_PROJECT_ID=your_project_id
```

### 4. Get API Keys

| Service | Purpose | Get Keys | Free Tier |
|---------|---------|----------|-----------|
| **Ollama** | Local LLM | https://ollama.com | ✅ Unlimited |
| **YouTube API** | Video upload | https://console.cloud.google.com | ✅ Yes |
| **ElevenLabs** | Premium TTS | https://elevenlabs.io | ⚠️ Limited |
| **OpenAI** | Alternative TTS/LLM | https://platform.openai.com | ⚠️ Limited |
| **watsonx.ai** | Premium LLM | https://cloud.ibm.com | ⚠️ Trial |

---

## 🛠️ Using the Makefile

The Makefile provides convenient commands for all common tasks.

### Setup Commands

```bash
make install          # Install dependencies with UV
make install-dev      # Install with dev dependencies
make setup            # Complete setup (install + env + ollama)
make env-setup        # Create .env file
make ollama-setup     # Pull Ollama models
```

### Docker Commands

```bash
make docker-build     # Build Docker containers
make docker-up        # Start all services
make docker-down      # Stop all services
make docker-logs      # View logs
make docker-restart   # Restart services
make docker-clean     # Remove all containers/volumes
```

### Development Commands

```bash
make dev             # Start dev environment (DB, Redis, Ollama)
make run-script      # Generate episode script
make run-video       # Generate complete video
make shell           # Open Python shell
```

### Code Quality Commands

```bash
make lint            # Run linters (black, isort, flake8)
make format          # Auto-format code
make type-check      # Run mypy type checking
make check           # Run all checks
```

### Testing Commands

```bash
make test            # Run all tests
make test-cov        # Run tests with coverage report
make workflow-test   # Simulate GitHub Actions workflow
```

### Database Commands

```bash
make db-migrate      # Run database migrations
make db-reset        # Reset database (WARNING: deletes data)
```

### Production Commands

```bash
make prod-build      # Build for production
make prod-deploy     # Deploy to production
```

### Cleanup Commands

```bash
make clean           # Clean temp files and caches
make clean-all       # Clean everything (files + Docker)
```

### Quick Commands

```bash
make quick-start     # Quick start everything
make help            # Show all available commands
make version         # Show version info
```

---

## 📦 Using UV Package Manager

### Installation

```bash
# Linux/Mac
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with pip
pip install uv
```

### Basic Usage

```bash
# Sync dependencies from pyproject.toml
uv sync

# Install with all extras (dev, test, monitoring)
uv sync --all-extras

# Add a new dependency
uv add requests

# Add a dev dependency
uv add --dev pytest

# Remove a dependency
uv remove requests

# Update dependencies
uv sync --upgrade

# Run a script
uv run python scripts/generate_script.py

# Run a command
uv run pytest

# Create lock file
uv lock
```

### Understanding pyproject.toml

Our `pyproject.toml` defines the project structure:

```toml
[project]
name = "tv-ruslanmv"
version = "2.0.0"
requires-python = ">=3.11"
dependencies = [
    "crewai>=0.28.0",
    "langchain>=0.1.0",
    # ... all core dependencies
]

[project.optional-dependencies]
dev = ["pytest>=7.4.0", "black>=24.1.0", ...]
test = ["pytest>=7.4.0", ...]
monitoring = ["prometheus-client>=0.19.0", ...]

[tool.black]
line-length = 100

[tool.pytest.ini_options]
testpaths = ["tests"]
```

### Benefits

✅ **Fast** - 10-100x faster than pip
✅ **Deterministic** - Lock file ensures reproducibility
✅ **Modern** - Uses latest Python packaging standards
✅ **Integrated** - Virtual env management built-in
✅ **Compatible** - Works with existing pip projects

---

## 🐳 Docker Setup

### Architecture

```
┌─────────────────────────────────────────┐
│          Docker Compose Stack           │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │ Frontend │  │ Backend  │            │
│  │ Next.js  │  │ FastAPI  │            │
│  └────┬─────┘  └────┬─────┘            │
│       │             │                   │
│  ┌────┴─────────────┴─────┐            │
│  │   Content Generator     │            │
│  │   (Python Scripts)      │            │
│  └────┬────────────────────┘            │
│       │                                 │
│  ┌────┴────┐  ┌─────────┐  ┌────────┐ │
│  │ Ollama  │  │ Postgres│  │ Redis  │ │
│  │  (LLM)  │  │   (DB)  │  │(Cache) │ │
│  └─────────┘  └─────────┘  └────────┘ │
└─────────────────────────────────────────┘
```

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis ollama

# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3001 | Web interface |
| Backend API | http://localhost:8000 | REST API |
| API Docs | http://localhost:8000/docs | Swagger UI |
| Ollama | http://localhost:11434 | LLM inference |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |

### Run Commands in Container

```bash
# Generate script
docker-compose run --rm content-generator \
  python scripts/generate_script.py

# Run tests
docker-compose run --rm content-generator \
  pytest tests/

# Open shell
docker-compose exec content-generator bash

# View Ollama models
docker-compose exec ollama ollama list
```

### GPU Support (Optional)

For faster Ollama inference with NVIDIA GPU:

```yaml
# docker-compose.yml
services:
  ollama:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

---

## 🤖 GitHub Actions Setup

### Overview

The GitHub Actions workflow automatically generates and uploads videos daily at **6 AM CET**.

### Workflow Steps

1. ✅ Setup (Python, FFmpeg, Ollama)
2. 📰 Fetch AI news from RSS feeds
3. 📦 Analyze trending packages
4. ✍️ Generate script with CrewAI
5. 🎤 Create audio with TTS
6. 🎨 Generate video with visuals
7. 📤 Upload to YouTube (if credentials configured)
8. 💾 Update database and website
9. 🚀 Deploy to GitHub Pages

### Configuration

#### 1. Fork Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/tv.ruslanmv.git
cd tv.ruslanmv
```

#### 2. Add GitHub Secrets

Go to: `Settings → Secrets and variables → Actions`

**Required Secrets (for YouTube upload):**

```
YOUTUBE_CLIENT_ID          # Your YouTube OAuth client ID
YOUTUBE_CLIENT_SECRET      # Your YouTube OAuth client secret
YOUTUBE_REFRESH_TOKEN      # Your YouTube OAuth refresh token
YOUTUBE_API_KEY            # Your YouTube API key
```

**Required Secrets (for TTS):**

```
ELEVENLABS_API_KEY         # ElevenLabs API key
# OR
OPENAI_API_KEY             # OpenAI API key (alternative)
```

**Optional Secrets (for better quality):**

```
WATSONX_APIKEY             # IBM watsonx.ai API key
WATSONX_PROJECT_ID         # IBM watsonx.ai project ID
WATSONX_URL                # IBM watsonx.ai URL
```

**Optional Secrets (database):**

```
DATABASE_URL               # PostgreSQL connection string
```

#### 3. Enable GitHub Actions

1. Go to `Actions` tab
2. Click "I understand my workflows, go ahead and enable them"
3. Workflow will run daily at 6 AM CET

#### 4. Manual Trigger

1. Go to `Actions` tab
2. Select "📺 Daily AI News Video Generation"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### Workflow File

Location: `.github/workflows/daily-video.yml`

Key configuration:

```yaml
on:
  schedule:
    - cron: "0 4 * * *"  # 04:00 UTC = 06:00 CET
  workflow_dispatch:      # Manual trigger

env:
  OLLAMA_HOST: "http://127.0.0.1:11434"
  OLLAMA_MODEL: "gemma:2b"
  NEWS_LLM_MODEL: "ollama/gemma:2b"
```

### Credentials Check Feature

The workflow automatically checks if YouTube credentials are configured:

- ✅ **With credentials**: Uploads video to YouTube
- ⚠️ **Without credentials**: Skips upload, generates video locally

This prevents workflow failures when credentials are not set.

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] API keys rotated

### Production Environment Variables

```env
# Environment
ENVIRONMENT=production
NODE_ENV=production
LOG_LEVEL=warning

# Security
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/tv.ruslanmv.com.crt
SSL_KEY_PATH=/etc/ssl/private/tv.ruslanmv.com.key

# Database
DATABASE_URL=postgresql://user:pass@prod-db:5432/tvruslanmv

# LLM (use watsonx.ai for production)
NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Monitoring
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=production
```

### Deploy with Docker Compose

```bash
# Build for production
make prod-build

# Deploy to production
make prod-deploy

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Deploy to Cloud Platforms

#### AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin
docker-compose build
docker-compose push
```

#### Google Cloud Run

```bash
# Deploy backend
gcloud run deploy tv-ruslanmv-api \
  --source . \
  --region us-central1

# Deploy frontend
gcloud run deploy tv-ruslanmv-web \
  --source ./frontend \
  --region us-central1
```

#### Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n tvruslanmv
```

### Monitoring

Set up monitoring with:

- **Prometheus** - Metrics collection
- **Grafana** - Dashboards
- **Sentry** - Error tracking
- **Logs** - Centralized logging

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Ollama Not Responding

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama service
ollama serve

# Pull model if missing
ollama pull gemma:2b

# Check logs
docker-compose logs ollama
```

#### 2. YouTube Upload Fails

```bash
# Check credentials are set
make workflow-test

# Verify credentials in .env
cat .env | grep YOUTUBE

# Test OAuth token
python scripts/test_youtube_auth.py
```

#### 3. Video Generation Fails

```bash
# Check FFmpeg installation
ffmpeg -version

# Install FFmpeg
sudo apt-get install ffmpeg  # Ubuntu/Debian
brew install ffmpeg          # macOS

# Check logs
docker-compose logs content-generator
```

#### 4. Database Connection Fails

```bash
# Check database is running
docker-compose ps postgres

# Test connection
psql $DATABASE_URL

# Reset database
make db-reset
```

#### 5. UV Installation Issues

```bash
# Reinstall UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or use pip
pip install uv

# Verify installation
uv --version
```

### Debug Mode

Enable debug logging:

```env
# .env
LOG_LEVEL=debug
CREWAI_VERBOSE=true
```

View detailed logs:

```bash
# Application logs
docker-compose logs -f

# Specific service
docker-compose logs -f content-generator

# Follow logs
tail -f logs/app.log
```

### Get Help

- **Documentation**: This file
- **Issues**: https://github.com/ruslanmv/tv.ruslanmv/issues
- **Email**: support@ruslanmv.com

---

## 📚 Additional Resources

### Documentation

- [Complete Features](../COMPLETE_FEATURES.md)
- [Production Deploy Guide](../PRODUCTION-DEPLOY.md)
- [Update Guide](../UPDATE_GUIDE.md)
- [Main README](../README.md)

### External Links

- [UV Documentation](https://github.com/astral-sh/uv)
- [Ollama Models](https://ollama.com/library)
- [watsonx.ai Docs](https://www.ibm.com/docs/en/watsonx-as-a-service)
- [CrewAI Documentation](https://docs.crewai.com)
- [YouTube API Guide](https://developers.google.com/youtube/v3)
- [Docker Compose Docs](https://docs.docker.com/compose/)

### Video Tutorials

- Setting up Ollama
- Configuring YouTube API
- Deploying to production
- Creating custom agents

---

## 🎯 Next Steps

After setup is complete:

1. **Test the system**: `make workflow-test`
2. **Generate your first video**: `make run-video`
3. **Customize the content**: Edit `scripts/generate_script.py`
4. **Set up GitHub Actions**: Add secrets and enable workflow
5. **Deploy to production**: Follow production deployment guide

---

## 📝 Summary

### Quick Reference

```bash
# Setup
make quick-start

# Development
make dev
make run-video

# Testing
make test
make workflow-test

# Production
make prod-build
make prod-deploy

# Cleanup
make clean
```

### Key Files

- `Makefile` - All automation commands
- `pyproject.toml` - Project configuration and dependencies
- `.env` - Environment configuration (copy from `.env.example`)
- `docker-compose.yml` - Docker services configuration
- `.github/workflows/daily-video.yml` - GitHub Actions workflow

### Support

Need help?

1. Check this documentation
2. Review troubleshooting section
3. Search existing issues
4. Open a new issue with:
   - System info (`make version`)
   - Error logs
   - Steps to reproduce

---

**🎬 Happy Video Generation!**

*TV.RUSLANMV.COM - The First TV Channel Where AI Learns and Humans Watch*
