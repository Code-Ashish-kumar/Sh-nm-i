# Deployment Guide — sh·nm·i

All services on free tiers. Total cost: $0.

---

## Architecture (Production)

```
Vercel (Frontend)  →  Render (Backend API)  →  Neon (PostgreSQL + pgvector)
                                            →  Cloudinary (file storage)
                                            →  Groq (LLM chat)
                                            →  Voyage AI (embeddings)
                                            →  Tavily (web search)
```

---

## Services & API Keys

| Service | Purpose | Signup URL | Free Tier |
|---------|---------|-----------|-----------|
| **Neon** | PostgreSQL + pgvector | [neon.tech](https://neon.tech) | 0.5 GB storage |
| **Groq** | LLM inference | [console.groq.com](https://console.groq.com) | 30 req/min |
| **Voyage AI** | Embeddings | [dashboard.voyageai.com](https://dashboard.voyageai.com) | 200M tokens |
| **Tavily** | Web search | [app.tavily.com](https://app.tavily.com) | 1000 req/month |
| **Cloudinary** | File storage | Already configured | 25 GB |
| **Vercel** | Frontend hosting | [vercel.com](https://vercel.com) | Unlimited |
| **Render** | Backend hosting | [render.com](https://render.com) | 750 hrs/month |

---

## Step 1: Database (Neon)

1. Create project at [neon.tech](https://neon.tech)
2. In the SQL editor, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Copy connection string from Dashboard → Connection Details

---

## Step 2: Backend (Render)

1. New → Web Service → connect GitHub repo
2. Settings:
   - **Root Directory:** `Server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance Type:** Free

3. Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<neon connection string>
   PORT=5000
   CORS_ORIGIN=https://your-app.vercel.app
   JWT_SECRET=<openssl rand -hex 32>
   LLM_PROVIDER=groq
   GROQ_API_KEY=gsk_...
   VOYAGE_API_KEY=pa-...
   TAVILY_API_KEY=tvly-...
   CLOUDINARY_URL=cloudinary://key:secret@cloud_name
   ```

---

## Step 3: Frontend (Vercel)

1. New Project → import GitHub repo
2. Settings:
   - **Framework:** Vite
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. Environment Variable:
   ```
   VITE_API_URL=https://your-render-url.onrender.com/api/v1
   ```

4. After deploy: update `CORS_ORIGIN` on Render with your Vercel URL.

---

## Notes

- Render free tier sleeps after 15 min inactivity. Open backend URL before demos to wake it.
- Voyage AI has a 3 RPM limit without payment method. Add one to unlock higher limits (200M tokens still free).
- The `vercel.json` in Frontend handles SPA routing (refresh on any page works).
- `.npmrc` with `legacy-peer-deps=true` handles the multer-storage-cloudinary peer dep conflict.

---

## Pre-Interview Checklist

- [ ] Open Render URL 5 min before demo (wake it up)
- [ ] Register a fresh account
- [ ] Upload a small PDF (<5MB)
- [ ] Wait for processing to complete (check My Documents for "completed" badge)
- [ ] Ask a question about the PDF content
- [ ] Show the My Documents page
- [ ] Show analytics (complete a short Pomodoro first)
