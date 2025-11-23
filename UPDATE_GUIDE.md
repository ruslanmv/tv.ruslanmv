# 🔄 Upgrade Guide: V1 → V2 (Ollama Edition)

Guide for upgrading from TV.RUSLANMV.COM V1 to V2 with Ollama support.

---

## 🎯 What's New in V2

### Major Changes

1. **✅ Ollama as Default LLM** (Free, local inference)
2. **✅ Optional watsonx.ai** (Better quality when needed)
3. **✅ GitHub Actions Automation** (Daily videos at 6 AM CET)
4. **✅ Improved LLM Client** (Multi-provider support)
5. **✅ Enhanced Scripts** (News fetching, package analysis)

---

## 📦 New Files in V2

### Core Scripts
- `scripts/llm_client.py` - Universal LLM client
- `scripts/generate_script.py` - CrewAI script generation
- `scripts/fetch_news.py` - News aggregation
- `scripts/analyze_packages.py` - Package trending
- `scripts/setup-ollama.sh` - Ollama setup

### Configuration
- `.github/workflows/daily-video.yml` - GitHub Actions
- Updated `docker-compose.yml` - Ollama service
- Updated `.env.example` - Ollama variables

---

## 🚀 Migration Steps

### Step 1: Backup Current Setup

```bash
# Backup your .env file
cp .env .env.backup

# Backup database (if running)
docker-compose exec postgres pg_dump -U tvuser tvruslanmv > backup.sql

# Backup custom configurations
cp -r custom/ custom_backup/
```

### Step 2: Pull V2 Code

```bash
# If you have a git repository
git pull origin main

# Or download V2 zip and extract
unzip tv-ruslanmv-v2.zip
```

### Step 3: Update Environment Variables

Add these new variables to your `.env`:

```bash
# Ollama (DEFAULT - FREE)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma:2b
NEWS_LLM_MODEL=ollama/gemma:2b
NEWS_LLM_TEMPERATURE=0.7

# Optional: Keep watsonx.ai settings for better quality
# NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2
# WATSONX_APIKEY=your_existing_key
# WATSONX_PROJECT_ID=your_existing_project
# WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### Step 4: Update Docker Compose

The new `docker-compose.yml` includes Ollama service:

```bash
# Stop existing services
docker-compose down

# Start with new configuration
docker-compose up -d

# Setup Ollama models
docker-compose --profile setup up ollama-setup
```

### Step 5: Install New Dependencies

```bash
# Update Python dependencies
pip install -r scripts/requirements.txt

# Or with Docker
docker-compose build content-generator
```

### Step 6: Test Ollama

```bash
# Test Ollama is working
curl http://localhost:11434/api/tags

# Test LLM client
docker-compose run --rm content-generator \
  python scripts/llm_client.py
```

### Step 7: Test Script Generation

```bash
# Generate test episode
docker-compose run --rm content-generator \
  python scripts/generate_script.py

# Check output
cat output/episode_script.txt
```

### Step 8: Setup GitHub Actions (Optional)

If you want automated daily videos:

1. **Fork repository on GitHub**

2. **Add GitHub Secrets:**
   - Go to Settings → Secrets and variables → Actions
   - Add secrets:
     ```
     YOUTUBE_CLIENT_ID
     YOUTUBE_CLIENT_SECRET
     YOUTUBE_REFRESH_TOKEN
     ELEVENLABS_API_KEY (or OPENAI_API_KEY)
     
     # Optional for better quality:
     WATSONX_APIKEY
     WATSONX_PROJECT_ID
     ```

3. **Enable workflows:**
   - Go to Actions tab
   - Enable workflows

4. **Test manual run:**
   - Actions → "📺 Daily AI News Video Generation"
   - Click "Run workflow"

---

## 🔀 Switching Between LLMs

### Use Ollama (Free, Local)

```bash
# In .env
NEWS_LLM_MODEL=ollama/gemma:2b

# Or set environment variable
export NEWS_LLM_MODEL=ollama/gemma:2b
```

### Use watsonx.ai (Better Quality)

```bash
# In .env
NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2
WATSONX_APIKEY=your_key
WATSONX_PROJECT_ID=your_project

# Or set environment variables
export NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2
export WATSONX_APIKEY=your_key
export WATSONX_PROJECT_ID=your_project
```

### Use OpenAI (Alternative)

```bash
# In .env
NEWS_LLM_MODEL=openai/gpt-4o-mini
OPENAI_API_KEY=your_key
```

---

## 🔧 Configuration Changes

### Old V1 Configuration (watsonx.ai only)

```python
# content-generator/src/main.py (V1)
from langchain_ibm import WatsonxLLM

llm = WatsonxLLM(
    model_id="ibm/granite-13b-chat-v2",
    url=WATSONX_URL,
    project_id=WATSONX_PROJECT_ID,
    apikey=WATSONX_API_KEY,
)
```

### New V2 Configuration (Multi-provider)

```python
# scripts/llm_client.py (V2)
from crewai import LLM

llm = LLM(
    model="ollama/gemma:2b",  # Or watsonx/..., openai/..., etc.
    temperature=0.7,
)
```

---

## 📊 Feature Comparison

| Feature | V1 | V2 |
|---------|----|----|
| Default LLM | watsonx.ai | Ollama (FREE) |
| API Costs | ~$0.10/episode | $0.00/episode |
| Local Development | Required API key | Works offline |
| CI/CD | Required API key | Works with free Ollama |
| Quality Options | watsonx.ai only | Ollama, watsonx, OpenAI, Claude |
| GitHub Actions | Manual setup | Included workflow |
| Video Generation | Manual | Automated daily |

---

## ⚠️ Breaking Changes

### 1. LLM Client API Changed

**Old (V1):**
```python
from langchain_ibm import WatsonxLLM
llm = WatsonxLLM(model_id="ibm/granite-13b-chat-v2", ...)
```

**New (V2):**
```python
from scripts.llm_client import get_llm
llm = get_llm()  # Automatically uses correct provider
```

### 2. Environment Variables

**New variables:**
- `OLLAMA_HOST`
- `OLLAMA_MODEL`
- `NEWS_LLM_MODEL` (replaces direct watsonx config)

**Still supported:**
- `WATSONX_APIKEY`
- `WATSONX_PROJECT_ID`
- `WATSONX_URL`

### 3. Docker Compose

**New service:**
- `ollama` service added
- GPU support optional
- Automatic model pulling

---

## 🐛 Troubleshooting

### Ollama Not Starting

```bash
# Check Ollama logs
docker-compose logs ollama

# Restart Ollama
docker-compose restart ollama

# Test Ollama manually
curl http://localhost:11434/api/tags
```

### Model Not Found

```bash
# Pull model manually
docker-compose exec ollama ollama pull gemma:2b

# List available models
docker-compose exec ollama ollama list
```

### LLM Client Error

```bash
# Test LLM client
python scripts/llm_client.py

# Check environment variables
env | grep -E "(OLLAMA|NEWS_LLM|WATSONX)"
```

### watsonx.ai Still Wanted

You can continue using watsonx.ai exclusively:

```bash
# Set in .env
NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2
WATSONX_APIKEY=your_key
WATSONX_PROJECT_ID=your_project

# Don't need to start Ollama
docker-compose up -d postgres redis backend frontend mcp-server
```

---

## 📝 Rollback to V1

If you need to rollback:

```bash
# Restore backup
cp .env.backup .env
cp docker-compose.yml.backup docker-compose.yml

# Restore database
docker-compose exec -T postgres psql -U tvuser -d tvruslanmv < backup.sql

# Restart services
docker-compose down
docker-compose up -d
```

---

## 🎓 Learning Resources

### Ollama Documentation
- https://ollama.com/
- https://github.com/ollama/ollama

### CrewAI Documentation
- https://docs.crewai.com/

### watsonx.ai Documentation
- https://www.ibm.com/docs/en/watsonx/saas

---

## 📞 Support

Need help with migration?

- **Issues**: [GitHub Issues](https://github.com/ruslanmv/tv.ruslanmv.com/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ruslanmv/tv.ruslanmv.com/discussions)
- **Email**: support@ruslanmv.com

---

## ✅ Post-Migration Checklist

- [ ] Ollama running and accessible
- [ ] Models pulled (gemma:2b minimum)
- [ ] LLM client test passed
- [ ] News fetching works
- [ ] Package analysis works
- [ ] Script generation works
- [ ] GitHub Actions configured (optional)
- [ ] Database migrated
- [ ] All services running
- [ ] First episode generated successfully

---

**Congratulations on upgrading to V2! 🎉**

You now have a free, local LLM setup with optional premium quality when needed!
