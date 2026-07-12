# Deployment Guide — sh·nm·i

All services on free tiers. Total cost: $0.

---

## Architecture (Production)

```
Vercel (Frontend)  →  Render (Backend API)  →  Neon (PostgreSQL + pgvector)
                                            →  Upstash (Redis for BullMQ)
                                            →  Cloudinary (file storage)
                                            →  Groq (LLM chat)
                                            →  HuggingFace (embeddings)
```

---

## Step 1: Database — Neon (Free PostgreSQL with pgvector)

1. Go to [neon.tech](https://neon.tech) → Sign up
2. Create a project (select closest region)
3. In the SQL editor, enable pgvector:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Copy the connection string (Dashboard → Connection Details → Connection String)
   - Format: `postgresql://user:pass@ep-xyz.region.aws.neon.tech/dbname?sslmode=require`
5. Save this as your `DATABASE_URL`

**Free tier:** 0.5 GB storage, 190 compute hours/month — plenty for a demo.

---

## Step 2: Backend — Render (Free Node.js)

1. Push your code to GitHub (if not already)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Name:** `shnmi-api`
   - **Root Directory:** `Server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance Type:** Free

5. Add Environment Variables (Settings → Environment):
   ```
   NODE_ENV=production
   DATABASE_URL=<your Neon connection string>
   PORT=5000
   CORS_ORIGIN=https://your-app.vercel.app
   JWT_SECRET=<generate: openssl rand -hex 32>
   LLM_PROVIDER=groq
   GROQ_API_KEY=<from console.groq.com>
   HF_API_KEY=<from huggingface.co/settings/tokens>
   TAVILY_API_KEY=<your tavily key>
   CLOUDINARY_URL=<your cloudinary url>
   REDIS_URL=<your upstash redis url>
   ```

6. Deploy! Render gives you a URL like `https://shnmi-api.onrender.com`

**Note:** Free tier sleeps after 15 min of inactivity. First request after sleep takes ~30s. Fine for a demo — just open the backend URL before your interview to "wake it up".

---

## Step 3: Frontend — Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://shnmi-api.onrender.com/api/v1
   ```

5. Deploy!

6. **After deploy:** Copy your Vercel URL (e.g., `https://shnmi.vercel.app`) and update the `CORS_ORIGIN` on Render to match.

---

## Step 4: Get API Keys (All Free)

| Service | URL | What you need |
|---------|-----|---------------|
| **Groq** | [console.groq.com](https://console.groq.com) | API key (`gsk_...`) — 30 req/min free |
| **HuggingFace** | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | Access token (`hf_...`) — unlimited embeddings |
| **Tavily** | [app.tavily.com](https://app.tavily.com) | API key — 1000 searches/month free |
| **Cloudinary** | Already configured | Your existing `CLOUDINARY_URL` works |
| **Upstash Redis** | Already configured | Your existing `REDIS_URL` works |

---

## Step 5: Update CORS After Deploy

Once you have both URLs:
- Render backend: `https://shnmi-api.onrender.com`  
- Vercel frontend: `https://shnmi.vercel.app`

Go to Render → Environment → update:
```
CORS_ORIGIN=https://shnmi.vercel.app
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors in browser | Check `CORS_ORIGIN` on Render matches your Vercel URL exactly |
| Login works but cookies don't stick | Verify `NODE_ENV=production` is set (enables `secure` + `sameSite=none`) |
| "Cannot connect to database" | Check `DATABASE_URL` has `?sslmode=require` at the end |
| Backend sleeping (slow first load) | Open the Render URL directly before your demo to wake it |
| Embeddings fail | Verify `HF_API_KEY` is set — model cold-starts take ~10s first time |

---

## Pre-Interview Checklist

- [ ] Open `https://your-render-url.onrender.com` 5 min before demo (wake it up)
- [ ] Register a fresh account on the live site
- [ ] Upload a small PDF (<5MB) to test the RAG flow
- [ ] Ask a question to verify the study buddy works
- [ ] Show the My Documents page
- [ ] Show the analytics page (complete a Pomodoro first)
- [ ] Have your architecture diagram ready (see `docs/RAG-Study-Buddy.md`)
