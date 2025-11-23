# 🚀 TV.RUSLANMV.COM V2 - Production Deployment Guide

Complete guide for deploying the full production system with all features.

---

## 📋 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

External Users ──┐
AI Agents ───────┤
                 ↓
        ┌────────────────┐
        │  Nginx/Cloudflare │
        │  SSL/TLS + CDN    │
        └────────┬───────────┘
                 │
     ┌───────────┴──────────────┬──────────────┐
     ↓                          ↓              ↓
┌──────────┐            ┌──────────────┐  ┌─────────┐
│ Frontend │            │  Backend API │  │   MCP   │
│ Next.js  │◄───────────┤   FastAPI    │  │ Server  │
│ Port 3001│            │  Port 8000   │  │ Port 3000│
└──────────┘            └──────┬───────┘  └─────────┘
                               │
         ┌─────────────────────┼─────────────────┐
         ↓                     ↓                 ↓
   ┌──────────┐         ┌──────────┐      ┌──────────┐
   │PostgreSQL│         │  Redis   │      │  Ollama  │
   │ Port 5432│         │Port 6379 │      │Port 11434│
   └──────────┘         └──────────┘      └──────────┘

                 AUTOMATION (GitHub Actions)
                          ↓
              ┌──────────────────────┐
              │  Daily at 6 AM CET   │
              │  1. Fetch News       │
              │  2. Generate Script  │
              │  3. Create Video     │
              │  4. Upload YouTube   │
              │  5. Deploy Website   │
              └──────────────────────┘
```

---

## 🎯 Production Features

### Core Features (Implemented)
- ✅ Ollama LLM (free, local)
- ✅ watsonx.ai LLM (optional, premium)
- ✅ Multi-provider LLM support
- ✅ GitHub Actions automation
- ✅ Daily video generation (6 AM CET)
- ✅ YouTube auto-upload
- ✅ MCP protocol for AI agents
- ✅ Full-text search
- ✅ Analytics tracking
- ✅ Database with PostgreSQL
- ✅ Redis caching
- ✅ Docker Compose orchestration

### Production Enhancements
- ✅ Load balancing ready
- ✅ Horizontal scaling support
- ✅ Health checks
- ✅ Error handling
- ✅ Logging
- ✅ Monitoring hooks
- ✅ Backup scripts
- ✅ CI/CD pipeline
- ✅ SSL/TLS support
- ✅ CORS configuration

---

## 🔧 Prerequisites

### Required
- **Server**: 4+ CPU cores, 16+ GB RAM, 100+ GB SSD
- **OS**: Ubuntu 22.04 LTS (recommended)
- **Docker**: Version 24+
- **Docker Compose**: Version 2+
- **Domain**: Registered domain (e.g., tv.ruslanmv.com)
- **SSL Certificate**: Let's Encrypt or commercial

### API Keys
- **YouTube**: Client ID, Secret, Refresh Token (required for video upload)
- **TTS**: ElevenLabs or OpenAI API key (required for audio)
- **LLM** (optional): watsonx.ai API key for better quality

---

## 📦 Deployment Methods

### Method 1: Docker Compose (Recommended)

```bash
# 1. Clone and setup
git clone https://github.com/ruslanmv/tv.ruslanmv.com.git
cd tv.ruslanmv.com
cp .env.example .env

# 2. Configure environment
nano .env  # Add your API keys

# 3. Start all services
docker-compose -f docker-compose.prod.yml up -d

# 4. Setup Ollama models
docker-compose --profile setup up ollama-setup

# 5. Initialize database
docker-compose exec backend alembic upgrade head

# 6. Verify
curl http://localhost:8000/health
curl http://localhost:3001

# 7. Setup SSL (production)
sudo certbot --nginx -d tv.ruslanmv.com

# 8. Test episode generation
docker-compose run --rm content-generator \
  python scripts/generate_script.py
```

### Method 2: Kubernetes

```bash
# 1. Create namespace
kubectl create namespace tvruslanmv

# 2. Create secrets
kubectl create secret generic app-secrets \
  --from-env-file=.env.production \
  -n tvruslanmv

# 3. Deploy
kubectl apply -f k8s/ -n tvruslanmv

# 4. Check status
kubectl get pods -n tvruslanmv
kubectl get services -n tvruslanmv

# 5. Expose service
kubectl port-forward svc/backend 8000:8000 -n tvruslanmv
```

### Method 3: Manual Installation

```bash
# 1. Install dependencies
sudo apt update && sudo apt install -y python3.11 nodejs npm ffmpeg postgresql redis

# 2. Setup Python environment
python3.11 -m venv venv
source venv/bin/activate
pip install -r scripts/requirements.txt

# 3. Setup Node.js projects
cd frontend && npm install && npm run build
cd ../mcp-server && npm install && npm run build

# 4. Setup Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama serve &
ollama pull gemma:2b

# 5. Configure database
sudo -u postgres psql -c "CREATE DATABASE tvruslanmv;"
sudo -u postgres psql -c "CREATE USER tvuser WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tvruslanmv TO tvuser;"
psql -U tvuser -d tvruslanmv -f database/schema.sql

# 6. Start services
# Backend
cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Frontend
cd frontend && npm start &

# MCP Server
cd mcp-server && npm start &
```

---

## 🔐 Security Configuration

### 1. Environment Variables

Never commit these to git! Use secrets management:

```bash
# Production .env
ENVIRONMENT=production
DATABASE_URL=postgresql://tvuser:STRONG_PASSWORD@db.host:5432/tvruslanmv
REDIS_URL=redis://redis.host:6379/0
JWT_SECRET_KEY=GENERATE_RANDOM_64_CHAR_STRING
CORS_ALLOW_ORIGINS=https://tv.ruslanmv.com
```

### 2. SSL/TLS Setup

```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tv.ruslanmv.com -d www.tv.ruslanmv.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 3. Firewall Configuration

```bash
# UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 4. Database Security

```bash
# PostgreSQL hardening
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Change: local all all peer
# To:     local all all scram-sha-256

# Restart
sudo systemctl restart postgresql
```

---

## 📊 Monitoring Setup

### Prometheus + Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
```

### Logging

```python
# Use structured logging
import logging
from pythonjsonlogger import jsonlogger

logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
```

---

## 🎬 GitHub Actions Setup

### 1. Repository Secrets

Add these in GitHub Settings → Secrets:

```
YOUTUBE_CLIENT_ID
YOUTUBE_CLIENT_SECRET
YOUTUBE_REFRESH_TOKEN
YOUTUBE_API_KEY
ELEVENLABS_API_KEY (or OPENAI_API_KEY)
WATSONX_APIKEY (optional)
WATSONX_PROJECT_ID (optional)
DATABASE_URL (for deployment)
```

### 2. Workflow Configuration

The workflow is already configured in `.github/workflows/daily-video.yml`:
- Runs daily at 6 AM CET
- Uses free Ollama in CI
- Uploads to YouTube
- Deploys to GitHub Pages

### 3. Manual Trigger

```bash
# Via GitHub UI
Actions → "📺 Daily AI News Video Generation" → Run workflow

# Via CLI
gh workflow run "daily-video.yml"
```

---

## 🔄 Database Management

### Backups

```bash
# Automated backup script
cat > /opt/tvruslanmv/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U tvuser tvruslanmv | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
find $BACKUP_DIR -mtime +7 -delete  # Keep 7 days
EOF

chmod +x /opt/tvruslanmv/scripts/backup.sh

# Add to crontab
crontab -e
0 2 * * * /opt/tvruslanmv/scripts/backup.sh
```

### Migrations

```bash
# Create migration
docker-compose exec backend alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec backend alembic upgrade head

# Rollback
docker-compose exec backend alembic downgrade -1
```

---

## 📈 Scaling

### Horizontal Scaling

```bash
# Docker Compose
docker-compose up -d --scale backend=3

# Kubernetes
kubectl scale deployment backend --replicas=5 -n tvruslanmv
```

### Database Replication

```yaml
# PostgreSQL read replicas
services:
  postgres-primary:
    image: postgres:16
    environment:
      - POSTGRES_REPLICATION=primary

  postgres-replica:
    image: postgres:16
    environment:
      - POSTGRES_REPLICATION=replica
      - POSTGRES_PRIMARY_HOST=postgres-primary
```

---

## 🧪 Testing

### Unit Tests

```bash
# Backend tests
cd backend && pytest tests/ -v --cov=app

# Frontend tests
cd frontend && npm test

# MCP server tests
cd mcp-server && npm test
```

### Integration Tests

```bash
# Test full workflow
./scripts/test_full_workflow.sh
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/v1/episodes/

# Using Locust
locust -f tests/load/locustfile.py --host http://localhost:8000
```

---

## 🆘 Troubleshooting

### Common Issues

**Ollama not responding:**
```bash
docker-compose logs ollama
docker-compose restart ollama
curl http://localhost:11434/api/tags
```

**Database connection failed:**
```bash
docker-compose exec postgres psql -U tvuser -d tvruslanmv
# Check DATABASE_URL in .env
```

**YouTube upload failed:**
```bash
# Check YouTube quota: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
# Verify OAuth token is valid
python scripts/test_youtube_auth.py
```

**Video generation failed:**
```bash
# Check FFmpeg
ffmpeg -version

# Check disk space
df -h

# Check logs
docker-compose logs video-processor
```

---

## 📞 Support

### Resources
- **Documentation**: https://docs.tv.ruslanmv.com
- **GitHub Issues**: https://github.com/ruslanmv/tv.ruslanmv.com/issues
- **Community**: https://github.com/ruslanmv/tv.ruslanmv.com/discussions

### Enterprise Support
- **Email**: enterprise@ruslanmv.com
- **SLA Options**: Available
- **Custom Deployment**: Contact for pricing

---

## ✅ Production Checklist

- [ ] Domain registered and DNS configured
- [ ] SSL certificate installed
- [ ] All environment variables set
- [ ] Database configured and backed up
- [ ] Redis configured
- [ ] Ollama installed and models pulled
- [ ] YouTube API credentials configured
- [ ] GitHub Actions secrets added
- [ ] Firewall rules configured
- [ ] Monitoring setup (Prometheus/Grafana)
- [ ] Logging configured
- [ ] Backup automation enabled
- [ ] Health checks passing
- [ ] First episode generated successfully
- [ ] MCP server responding
- [ ] Frontend accessible
- [ ] Analytics working

---

**Production Deployment Status: Ready** ✅

**Last Updated**: 2025-11-23
