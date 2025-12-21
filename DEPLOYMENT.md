# Vercel Deployment Guide

## 🚀 Quick Fix for FastAPI Detection / 500 Error

**Problem:** Vercel is detecting this as a FastAPI/Python project and trying to deploy the backend, which causes errors.

**Root Cause:** Even with `.vercelignore`, Vercel can detect Python projects from `pyproject.toml` in the repo root.

**Solution:** Configure Vercel to ONLY deploy the Next.js frontend.

### **CRITICAL: Configure Root Directory in Vercel Dashboard**

⚠️ **This MUST be done manually in Vercel Dashboard** - cannot be set in code

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project (`tv.ruslanmv`)
3. Go to **Settings** → **General**
4. Under **Build & Development Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend` ← **⚠️ CRITICAL - MUST BE SET TO `frontend`**
   - **Build Command**: Leave as default or set to `npm run build`
   - **Output Directory**: Leave as default or set to `.next`
   - **Install Command**: Leave as default or set to `npm install`

5. Click **Save**
6. Go to **Deployments** tab
7. Click **⋯** menu on the latest deployment
8. Click **Redeploy**

**Why this works:** Setting Root Directory to `frontend` prevents Vercel from scanning the repo root (where `pyproject.toml` triggers Python/FastAPI detection). Vercel will only see and build the Next.js app.

---

## 🔧 What the Code Changes Do

The repository includes configuration files to help prevent FastAPI detection:

### `.vercelignore`
```
backend/                    # Excludes FastAPI backend
*.py                        # Excludes all Python files
pyproject.toml             # Excludes Python project config
requirements*.txt          # Excludes Python dependencies
```

### `vercel.json`
```json
{
  "framework": "nextjs",           # Explicitly declares Next.js
  "outputDirectory": "frontend/.next",
  "buildCommand": "cd frontend && npm install && npm run build"
}
```

**Important:** These files help but are NOT sufficient alone. You MUST also set **Root Directory = `frontend`** in the Vercel Dashboard.

---

## 📋 Environment Variables

Set these in **Settings** → **Environment Variables**:

### Required
None (frontend works without backend)

### Optional (for backend integration)
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

**Important:**
- Do NOT use `http://localhost:8000` in production
- The site works without this (shows placeholder data)

---

## ✅ Verify Deployment

After redeploying with Root Directory set to `frontend`:

1. Visit your Vercel URL
2. You should see:
   - ✅ News ticker at top
   - ✅ Professional header
   - ✅ Video player section
   - ✅ Sidebar with schedule
   - ✅ AI-Powered Features section
   - ✅ Recent broadcasts
   - ✅ Stats and footer

---

## 🐛 Troubleshooting

### Still getting 404?

**Check Root Directory is set:**
```
Settings → General → Root Directory = "frontend"
```

### Build fails on Vercel but works locally?

**Try:**
- Deployments → ⋯ Menu → Clear Cache and Redeploy

---

## 🎯 Production Checklist

- [ ] Root Directory set to `frontend`
- [ ] Framework Preset set to `Next.js`
- [ ] Build succeeds (check deployment logs)
- [ ] Site loads at Vercel URL
- [ ] All sections visible
- [ ] No console errors

---

## 📝 Current Project Structure

```
tv.ruslanmv/
├── frontend/              ← Your Next.js app (SET THIS AS ROOT)
│   ├── src/app/          ← Pages
│   ├── package.json
│   └── .next/            ← Build output
├── backend/              ← Python backend
├── scripts/              ← AI video generation
└── vercel.json
```
