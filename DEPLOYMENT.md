# 🚀 Deployment Guide - TV.RUSLANMV.COM

Complete guide to deploy your AI-powered video channel on Vercel with automated video generation.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Vercel Deployment](#vercel-deployment)
- [GitHub Actions Setup](#github-actions-setup)
- [Cloudflare R2 Setup](#cloudflare-r2-setup)
- [Google Colab Alternative](#google-colab-alternative)
- [Environment Variables](#environment-variables)

---

## ⚡ Quick Start

### Prerequisites

- GitHub account
- Vercel account (free tier works)
- YouTube API credentials (optional)
- Cloudflare R2 account (optional)

### 1-Minute Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ruslanmv/tv.ruslanmv)

---

## 🌐 Vercel Deployment

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select **"tv.ruslanmv"** repository

### Step 2: Configure Project

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Step 3: Environment Variables

Add these in Vercel dashboard (Settings → Environment Variables):

```bash
# Required
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app

# Optional
NEXT_PUBLIC_MCP_WS_URL=wss://your-mcp-server.vercel.app
```

### Step 4: Deploy

Click **"Deploy"** and wait ~2 minutes. Your site will be live at:
```
https://tv-ruslanmv.vercel.app
```

### Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add `tv.ruslanmv.com`
3. Follow DNS configuration instructions

---

## ⚙️ GitHub Actions Setup

Automated daily video generation runs on GitHub Actions.

### Step 1: Enable GitHub Actions

1. Go to repository **Settings → Actions**
2. Enable **"Allow all actions and reusable workflows"**

### Step 2: Configure Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### YouTube Credentials (Required for upload)

```
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REFRESH_TOKEN=your_refresh_token
```

[How to get YouTube credentials →](https://developers.google.com/youtube/v3/getting-started)

#### Cloudflare R2 (Optional - Video Backup)

```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=tv-ruslanmv-videos
R2_PUBLIC_URL=https://videos.ruslanmv.com
```

#### Text-to-Speech (Optional - Better Quality)

```
ELEVENLABS_API_KEY=your_elevenlabs_key
```

Or use free gTTS (default).

### Step 3: Test Workflow

1. Go to **Actions** tab
2. Select **"📺 Daily AI News Video Generation"**
3. Click **"Run workflow"**
4. Wait ~20-30 minutes for completion

### Schedule

The workflow runs automatically **every day at 04:00 UTC** (06:00 CET).

Edit schedule in `.github/workflows/daily-video.yml`:

```yaml
on:
  schedule:
    - cron: "0 4 * * *"  # Change time here
```

---

## ☁️ Cloudflare R2 Setup

### Why R2?

- **Cost-effective**: $0.015/GB/month (10x cheaper than S3)
- **Zero egress fees**: Free bandwidth
- **S3-compatible**: Works with boto3

### Step 1: Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage**
3. Click **"Create bucket"**
4. Name: `tv-ruslanmv-videos`
5. Location: Automatic

### Step 2: Generate Access Keys

1. Go to **R2 → Manage R2 API Tokens**
2. Click **"Create API token"**
3. Permissions: **"Object Read & Write"**
4. Copy:
   - Access Key ID
   - Secret Access Key
   - Account ID (from URL)

### Step 3: Configure Public Access (Optional)

For direct video playback:

1. Go to bucket **Settings**
2. Enable **"Public Access"**
3. Add custom domain: `videos.ruslanmv.com`
4. Update DNS:
   ```
   CNAME videos.ruslanmv.com → bucket-url.r2.cloudflarestorage.com
   ```

### Step 4: Add to GitHub Secrets

```
R2_ACCOUNT_ID=abc123...
R2_ACCESS_KEY_ID=xyz789...
R2_SECRET_ACCESS_KEY=secret...
R2_BUCKET_NAME=tv-ruslanmv-videos
R2_PUBLIC_URL=https://videos.ruslanmv.com
```

---

## 🔬 Google Colab Alternative

Generate videos manually using Google Colab (free GPU).

### Option 1: Use Provided Notebook

1. Open [`colab/generate_video.ipynb`](./colab/generate_video.ipynb)
2. Click **"Open in Colab"**
3. Run all cells
4. Video uploads automatically

### Option 2: Schedule Colab Runs

Use [Colab Scheduler](https://stackoverflow.com/questions/62895263/how-to-schedule-a-google-colab-notebook-to-run-daily) or:

1. Create a cron job that triggers Colab
2. Use GitHub Actions to trigger Colab via API
3. Use Zapier/Make.com for scheduling

### Configure Colab Secrets

In Colab:
1. Click **🔑** (Secrets icon)
2. Add:
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `YOUTUBE_REFRESH_TOKEN`
   - `R2_ACCOUNT_ID` (optional)
   - etc.

---

## 🔐 Environment Variables Reference

### Frontend (Vercel)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8000` | Backend API URL |
| `NEXT_PUBLIC_MCP_WS_URL` | No | `ws://localhost:3000` | MCP WebSocket URL |

### GitHub Actions

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| **YouTube** | | | |
| `YOUTUBE_CLIENT_ID` | Yes* | - | YouTube OAuth client ID |
| `YOUTUBE_CLIENT_SECRET` | Yes* | - | YouTube OAuth client secret |
| `YOUTUBE_REFRESH_TOKEN` | Yes* | - | YouTube OAuth refresh token |
| `YOUTUBE_PRIVACY_STATUS` | No | `public` | `public`, `unlisted`, or `private` |
| **Cloudflare R2** | | | |
| `R2_ACCOUNT_ID` | No | - | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | No | - | R2 access key |
| `R2_SECRET_ACCESS_KEY` | No | - | R2 secret key |
| `R2_BUCKET_NAME` | No | `tv-ruslanmv-videos` | R2 bucket name |
| `R2_PUBLIC_URL` | No | - | Public URL for videos |
| **TTS** | | | |
| `ELEVENLABS_API_KEY` | No | - | ElevenLabs API key (premium) |
| `OPENAI_API_KEY` | No | - | OpenAI API key (fallback) |

*Required for YouTube upload

---

## 🧪 Testing

### Test Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

### Test Video Generation Locally

```bash
# Install dependencies
pip install -e .

# Generate test video
python scripts/fetch_news.py
python scripts/analyze_packages.py
python scripts/generate_script.py
python scripts/generate_audio.py
python scripts/generate_video.py
```

### Test Upload Scripts

```bash
# Test YouTube upload
python scripts/upload_youtube.py

# Test R2 upload
python scripts/upload_r2.py

# Test all platforms
python scripts/upload_all.py
```

---

## 📊 Monitoring

### GitHub Actions Logs

- Go to **Actions** tab
- Click on latest workflow run
- View logs for each step

### Vercel Deployment Logs

- Go to Vercel dashboard
- Click on deployment
- View **"Build Logs"** and **"Function Logs"**

### Video Analytics

Check `output/analytics.json` for:
- Generation time
- File sizes
- Upload status
- Errors

---

## 🐛 Troubleshooting

### "YouTube upload failed"

1. Verify credentials in GitHub Secrets
2. Check OAuth token hasn't expired
3. Ensure YouTube API is enabled

### "R2 upload failed"

1. Check R2 credentials
2. Verify bucket exists
3. Check bucket permissions

### "Video generation timeout"

1. Reduce `VIDEO_DURATION` in workflow
2. Use smaller LLM model
3. Optimize script generation

### Frontend not loading

1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify backend is deployed
3. Check browser console for errors

---

## 🚀 Next Steps

- ✅ Deploy frontend to Vercel
- ✅ Configure GitHub Actions
- ✅ Set up YouTube upload
- ✅ Configure R2 backup (optional)
- ✅ Test workflow
- 📊 Add analytics tracking
- 🎨 Customize branding
- 📱 Add mobile app (optional)

---

## 📞 Support

- 📧 Email: support@ruslanmv.com
- 🐛 Issues: [GitHub Issues](https://github.com/ruslanmv/tv.ruslanmv/issues)
- 💬 Discord: [Join our community](https://discord.gg/ruslanmv)

---

**Made with ❤️ by Ruslan Magana Vsevolodovna**
