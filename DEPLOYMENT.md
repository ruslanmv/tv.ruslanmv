# Vercel Deployment Guide

## 🚀 Quick Fix for 404 Error

The 404 error occurs because Vercel doesn't know your Next.js app is in the `frontend/` subdirectory.

### **Solution: Configure Root Directory in Vercel Dashboard**

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project (`tv.ruslanmv`)
3. Go to **Settings** → **General**
4. Under **Build & Development Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend` ← **CRITICAL**
   - **Build Command**: `npm run build` (default is fine)
   - **Output Directory**: `.next` (default is fine)
   - **Install Command**: `npm install` (default is fine)

5. Click **Save**
6. Go to **Deployments** tab
7. Click **Redeploy** on the latest deployment

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
