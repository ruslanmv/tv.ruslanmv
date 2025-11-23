# 📺 TV.RUSLANMV.COM V2 - Complete Project Package

**The First TV Channel for AI Agents and Humans - With Free Local LLM!**

---

## 📦 What's Included

This package contains the **complete upgraded V2** of TV.RUSLANMV.COM with:

### ✨ New Features
- **FREE Ollama LLM** (no API costs)
- **Optional watsonx.ai** (better quality when needed)
- **GitHub Actions** (automated daily videos at 6 AM CET)
- **Enhanced Scripts** (news, packages, video generation)

### 📁 Project Files

```
tv-ruslanmv-v2/
├── README.md                         # Complete documentation
├── UPDATE_GUIDE.md                   # V1 → V2 migration guide
├── docker-compose.yml                # Includes Ollama service
├── .env.example                      # Updated with Ollama config
├── .github/
│   └── workflows/
│       └── daily-video.yml          # Automated daily workflow
└── scripts/
    ├── llm_client.py                # Multi-provider LLM client
    ├── generate_script.py           # CrewAI script generation
    ├── fetch_news.py                # News aggregation
    ├── analyze_packages.py          # Package trending
    ├── setup-ollama.sh              # Ollama setup script
    └── requirements.txt             # All dependencies
```

---

## 🚀 Quick Start (3 Commands)

```bash
# 1. Setup environment
cp .env.example .env

# 2. Start all services (includes Ollama)
docker-compose up -d

# 3. Setup Ollama models
docker-compose --profile setup up ollama-setup
```

**That's it!** 🎉 No API keys needed for local development!

---

## 💡 Key Improvements Over V1

### 1. **FREE Local LLM** 
- No API costs during development
- Works offline
- Perfect for CI/CD

### 2. **Flexible LLM Selection**
```bash
# Default: Free Ollama
NEWS_LLM_MODEL=ollama/gemma:2b

# Better quality: watsonx.ai
NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2

# Alternative: OpenAI or Claude
NEWS_LLM_MODEL=openai/gpt-4o-mini
```

### 3. **Automated Daily Videos**
- GitHub Actions workflow included
- Runs daily at 6 AM CET
- Uploads to YouTube automatically
- Uses free Ollama in CI

### 4. **Enhanced Content Pipeline**
- Smart news aggregation
- Package trend analysis
- Multi-agent script generation
- Professional video assembly

---

## 📖 Documentation

### For New Users
→ **[README.md](README.md)** - Complete setup guide

### For V1 Users
→ **[UPDATE_GUIDE.md](UPDATE_GUIDE.md)** - Migration instructions

### For GitHub Actions
→ **[.github/workflows/daily-video.yml](.github/workflows/daily-video.yml)** - Workflow details

---

## 🎯 Use Cases

### Local Development (Free)
```bash
# Use Ollama (no API keys needed)
NEWS_LLM_MODEL=ollama/gemma:2b
docker-compose up -d
```

### Production (Better Quality)
```bash
# Use watsonx.ai
NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2
WATSONX_APIKEY=your_key
WATSONX_PROJECT_ID=your_project
```

### GitHub Actions (Automated)
- Fork repository
- Add YouTube secrets
- Enable Actions
- Videos generated daily at 6 AM CET

---

## 🆓 Cost Comparison

| Provider | Cost/Episode | Quality | Speed | Use Case |
|----------|-------------|---------|-------|----------|
| **Ollama** | **$0.00** | Good | Fast | Development, CI/CD |
| watsonx.ai | ~$0.10 | Excellent | Medium | Production |
| OpenAI | ~$0.20 | Excellent | Fast | Alternative |

---

## 🔧 System Requirements

### Minimum
- Docker & Docker Compose
- 8 GB RAM
- 10 GB disk space

### Recommended
- 16 GB RAM
- GPU (optional, for faster Ollama)
- 50 GB disk space

### For GitHub Actions
- GitHub account
- YouTube API credentials (for upload)
- Optional: ElevenLabs or OpenAI API (for TTS)

---

## 📊 What Gets Generated

Each day at 6 AM CET:

1. **📰 News Research** - Top AI/tech stories
2. **📦 Package Analysis** - Trending tools
3. **✍️ Script Generation** - 10-minute TV script
4. **🎤 Audio Creation** - Professional narration
5. **🎥 Video Assembly** - Visuals + subtitles
6. **📤 YouTube Upload** - Automatic publishing
7. **🌐 Website Update** - Episode page
8. **💾 Database Storage** - Metadata

All **100% automated** via GitHub Actions!

---

## 🎓 Learning Resources

- **Ollama**: https://ollama.com/
- **CrewAI**: https://docs.crewai.com/
- **watsonx.ai**: https://www.ibm.com/watsonx
- **GitHub Actions**: https://docs.github.com/actions

---

## 🤝 Getting Help

- **Documentation**: All included in this package
- **Issues**: https://github.com/ruslanmv/tv.ruslanmv.com/issues
- **Email**: support@ruslanmv.com

---

## 📝 Next Steps

1. **Read [README.md](README.md)** for complete setup
2. **Follow Quick Start** above
3. **Test locally** with Ollama
4. **Optional: Setup GitHub Actions** for automation
5. **Optional: Enable watsonx.ai** for better quality

---

## ✨ What Makes V2 Special

- **🆓 FREE** to run locally (Ollama)
- **🚀 Fast** setup (3 commands)
- **🤖 Automated** (GitHub Actions)
- **🔄 Flexible** (multiple LLM providers)
- **📦 Complete** (everything included)
- **📖 Documented** (comprehensive guides)

---

**"The First TV Channel Where AI Learns and Humans Watch - Now 100% Free!"**

**🤖 Powered by Ollama | ✨ Enhanced by watsonx.ai | 🎬 Automated by GitHub Actions**

---

Created by **Ruslanmv** | Data Scientist & AI Engineer at IBM
