# 📺 TV.RUSLANMV.COM V2 - Ollama Edition

**The First TV Channel for AI Agents and Humans - Now with Free Local LLM!**

[![Ollama](https://img.shields.io/badge/Ollama-Powered-blue.svg)](https://ollama.com)
[![watsonx.ai](https://img.shields.io/badge/watsonx.ai-Optional-purple.svg)](https://www.ibm.com/watsonx)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Daily Episodes](https://img.shields.io/badge/Episodes-Daily%20@%206AM%20CET-red.svg)](https://github.com)

---

## 🎬 What's New in V2

### 🆓 **Ollama as Default LLM**
- **FREE** local AI inference
- No API costs for development
- Perfect for CI/CD workflows
- Fast model: `gemma:2b` (default)
- Better quality: `llama3.1:8b`, `mistral:7b`

### ⭐ **Optional watsonx.ai**
- Premium quality when you need it
- Just set `NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2`
- Seamless switching between providers

### 🤖 **GitHub Actions Automation**
- Fully automated daily video generation
- Runs at **6 AM CET** every day
- Uses free Ollama in CI
- Uploads directly to YouTube
- Zero manual intervention

### 📊 **Smart LLM Selection**
```python
# Default: Free local Ollama
NEWS_LLM_MODEL=ollama/gemma:2b

# Better quality: Optional watsonx.ai
NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2

# Alternative: OpenAI or Anthropic
NEWS_LLM_MODEL=openai/gpt-4o-mini
NEWS_LLM_MODEL=anthropic/claude-3-5-sonnet-latest
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- **That's it!** No API keys needed for local development

### 1. Clone & Setup

```bash
git clone https://github.com/ruslanmv/tv.ruslanmv.com.git
cd tv.ruslanmv.com
cp .env.example .env
```

### 2. Start Everything

```bash
# Start all services (includes Ollama)
docker-compose up -d

# Setup Ollama models
docker-compose --profile setup up ollama-setup

# Wait for Ollama to be ready
curl http://localhost:11434/api/tags
```

### 3. Generate Your First Episode

```bash
# Manual generation
docker-compose run --rm content-generator python scripts/generate_script.py

# View logs
docker-compose logs -f content-generator
```

### 4. Access Your TV Channel
- **Frontend**: http://localhost:3001
- **API Docs**: http://localhost:8000/docs
- **Ollama**: http://localhost:11434

---

## 🎯 LLM Configuration

### Default: Ollama (Free & Local)

```env
# .env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma:2b
NEWS_LLM_MODEL=ollama/gemma:2b
```

**Available Models:**
- `gemma:2b` - Fast, small (DEFAULT)
- `llama3.1:8b` - Better quality
- `mistral:7b` - Alternative

### Optional: watsonx.ai (Better Quality)

```env
# .env
NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2
WATSONX_APIKEY=your_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

Get API key: https://cloud.ibm.com/

**Available Models:**
- `watsonx/ibm/granite-13b-chat-v2` - IBM's model
- `watsonx/meta-llama/llama-3-1-70b-instruct` - Best quality
- `watsonx/ibm/granite-20b-multilingual` - Multilingual

---

## 🤖 GitHub Actions Workflow

### Automated Daily Episodes

The workflow runs **every day at 6 AM CET** and:

1. ✅ **Setup** - Python, FFmpeg, Ollama
2. 📰 **Fetch News** - Latest AI/tech news
3. 📦 **Analyze Packages** - Trending tools
4. ✍️ **Generate Script** - Using CrewAI + LLM
5. 🎤 **Create Audio** - Text-to-speech
6. 🎨 **Generate Video** - Visuals + subtitles
7. 📤 **Upload YouTube** - Automatic publishing
8. 💾 **Update Database** - Episode metadata
9. 🌐 **Deploy Website** - GitHub Pages

### Setup GitHub Actions

1. **Fork the repository**

2. **Add GitHub Secrets:**
   ```
   # Required for YouTube upload
   YOUTUBE_CLIENT_ID
   YOUTUBE_CLIENT_SECRET
   YOUTUBE_REFRESH_TOKEN
   YOUTUBE_API_KEY
   
   # Required for TTS
   ELEVENLABS_API_KEY  # or OPENAI_API_KEY
   
   # Optional: Better quality
   WATSONX_APIKEY
   WATSONX_PROJECT_ID
   WATSONX_URL
   
   # Optional: Database
   DATABASE_URL
   ```

3. **Enable GitHub Actions**
   - Go to Actions tab
   - Enable workflows

4. **Manual Trigger** (optional)
   - Actions → "📺 Daily AI News Video Generation"
   - Click "Run workflow"

---

## 📁 Project Structure

```
tv.ruslanmv.com/
├── .github/
│   └── workflows/
│       └── daily-video.yml          # GitHub Actions workflow
├── scripts/
│   ├── llm_client.py                # LLM abstraction (Ollama/watsonx)
│   ├── generate_script.py           # CrewAI script generation
│   ├── fetch_news.py                # News scraping
│   ├── analyze_packages.py          # Package tracking
│   ├── generate_audio.py            # TTS generation
│   ├── generate_video.py            # Video assembly
│   ├── upload_youtube.py            # YouTube uploader
│   ├── setup-ollama.sh              # Ollama model setup
│   └── requirements.txt             # Python dependencies
├── docker-compose.yml               # Includes Ollama service
├── .env.example                     # Environment template
└── README.md                        # This file
```

---

## 🛠️ Development

### Local Development

```bash
# Start services
docker-compose up -d

# Test Ollama
curl http://localhost:11434/api/generate \
  -d '{
    "model": "gemma:2b",
    "prompt": "Hello, world!",
    "stream": false
  }'

# Generate script
docker-compose run --rm content-generator \
  python scripts/generate_script.py

# View logs
docker-compose logs -f ollama
docker-compose logs -f content-generator
```

### Test LLM Client

```bash
# Test with Ollama (default)
docker-compose run --rm content-generator \
  python scripts/llm_client.py

# Test with watsonx.ai
docker-compose run --rm content-generator \
  sh -c "NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2 python scripts/llm_client.py"
```

### Switch LLM Providers

```bash
# Use Ollama (default)
NEWS_LLM_MODEL=ollama/gemma:2b

# Use watsonx.ai
NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2

# Use OpenAI
NEWS_LLM_MODEL=openai/gpt-4o-mini

# Use Anthropic
NEWS_LLM_MODEL=anthropic/claude-3-5-sonnet-latest
```

---

## 📊 Costs Comparison

### Ollama (Default)
- **Cost**: $0.00 FREE
- **Setup**: Automatic
- **Quality**: Good
- **Speed**: Fast
- **Use case**: Development, CI/CD

### watsonx.ai (Optional)
- **Cost**: ~$0.10 per episode
- **Setup**: API key needed
- **Quality**: Excellent
- **Speed**: Medium
- **Use case**: Production

### OpenAI
- **Cost**: ~$0.20 per episode
- **Setup**: API key needed
- **Quality**: Excellent
- **Speed**: Fast
- **Use case**: Alternative

---

## 🔧 Configuration

### Ollama Configuration

```yaml
# docker-compose.yml
ollama:
  image: ollama/ollama:latest
  ports:
    - "11434:11434"
  volumes:
    - ollama_data:/root/.ollama
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]  # Optional GPU acceleration
```

### GitHub Actions Configuration

```yaml
# .github/workflows/daily-video.yml
on:
  schedule:
    - cron: "0 4 * * *"  # 04:00 UTC = 06:00 CET
  workflow_dispatch:  # Manual trigger

env:
  OLLAMA_HOST: "http://127.0.0.1:11434"
  OLLAMA_MODEL: "gemma:2b"
  NEWS_LLM_MODEL: "ollama/gemma:2b"
```

---

## 📈 Performance

### Episode Generation Times

| LLM Provider | Average Time | Cost | Quality |
|-------------|--------------|------|---------|
| Ollama (gemma:2b) | 2-3 min | Free | Good |
| Ollama (llama3.1:8b) | 5-7 min | Free | Better |
| watsonx.ai (granite-13b) | 3-4 min | ~$0.10 | Excellent |
| OpenAI (gpt-4o-mini) | 2-3 min | ~$0.20 | Excellent |

---

## 🚢 Deployment

### Production Recommendations

1. **Use watsonx.ai** for better quality
2. **Enable caching** for repeated requests
3. **Monitor costs** if using paid providers
4. **Setup alerts** for failed workflows
5. **Backup database** regularly

### GitHub Actions Best Practices

```yaml
# Use secrets for sensitive data
env:
  WATSONX_APIKEY: ${{ secrets.WATSONX_APIKEY }}
  YOUTUBE_CLIENT_SECRET: ${{ secrets.YOUTUBE_CLIENT_SECRET }}

# Add failure notifications
- name: Send failure notification
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -d '{"text":"❌ Episode generation failed"}'
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Test with both Ollama and watsonx.ai
4. Submit a pull request

---

## 📝 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- **Ollama** - Free local LLM inference
- **IBM watsonx.ai** - Enterprise AI platform
- **CrewAI** - Multi-agent orchestration
- **GitHub Actions** - Free CI/CD automation

---

## 📞 Support

- **Documentation**: Included in this repo
- **Issues**: [GitHub Issues](https://github.com/ruslanmv/tv.ruslanmv.com/issues)
- **Email**: support@ruslanmv.com

---

## 🎯 Roadmap

- [x] Ollama integration (default LLM)
- [x] watsonx.ai support (optional)
- [x] GitHub Actions automation
- [x] Daily video generation at 6 AM CET
- [ ] Multi-language support
- [ ] Live streaming
- [ ] Interactive AI chat
- [ ] Mobile app

---

**"The First TV Channel Where AI Learns and Humans Watch - Now 100% Free!"** 🤖📺👨‍💻

**Powered by Ollama | Enhanced by watsonx.ai**
