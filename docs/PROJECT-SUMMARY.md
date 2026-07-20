# sh·nm·i — Project Summary

## What It Is

A full-stack study productivity web app with an AI-powered Study Buddy that uses Retrieval-Augmented Generation (RAG) to answer questions from your uploaded textbooks and notes, citing specific page numbers.

**Live URL:** https://sh-nm-i.vercel.app  
**Repo:** https://github.com/Yatin-04/Sh-nm-i

---

## Core Features

### 1. Pomodoro Timer with Subject Tracking
- Configurable focus/break durations
- Linked to subjects (DSA, DBMS, OS, etc.)
- Web Worker-based timer (runs accurately even when tab is in background)
- Alarm system with browser notifications
- Tracks total focus time per session and across all sessions

### 2. AI Study Buddy (RAG System)
- Upload PDFs/textbooks per subject
- Ask questions → AI searches your uploaded documents first
- **Page-level citations** — tells you exactly which page to revisit
- Falls back to web search (Tavily) if notes don't have the answer
- Conversational context — follow-up questions work
- Agentic architecture with tool-calling (searchLocalNotes, searchWeb)
- Markdown-formatted responses with proper rendering in the chat UI

### 3. Document Management
- Upload PDFs (up to 10MB) per subject
- Background processing: PDF → page-aware text extraction → sentence-level chunking → vector embeddings → pgvector storage
- "My Documents" page showing all uploads organized by subject folders
- Status tracking (processing/completed/failed)
- Delete documents (cascades to remove embeddings)

### 4. Spotify Integration
- Embedded Spotify player for study music
- Mini player with theme-aware styling
- Curated playlists for focus sessions

### 5. Todo List
- Create/complete tasks
- Linked to daily dates
- Streak tracking (completing todos contributes to streaks)
- Session-aware completion tracking

### 6. Analytics Dashboard
- Daily timeline graph
- Session bar charts
- Subject distribution pie chart
- Todo completion heatmap
- Current streak display

### 7. Theming System
- Multiple color themes (not just dark/light)
- Theme-aware components throughout the app
- Persisted via Redux

---

## Technical Architecture

### Frontend
- **React 18** + Vite
- **Redux Toolkit** for state management (auth, timer, theme, streak)
- **React Router** with protected routes
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- Custom markdown renderer for AI chat responses
- Web Worker for accurate timer in background tabs

### Backend
- **Express 5** (Node.js ESM modules)
- **PostgreSQL** with **pgvector** extension for vector similarity search
- **JWT authentication** (httpOnly cookies local, Bearer tokens in production)
- **Multer** memory storage → Cloudinary upload
- **p-queue** for concurrency-controlled document processing
- RESTful API design

### AI/ML Pipeline
- **Groq API** (llama-3.1-8b-instant) — fast LLM inference with function/tool calling
- **Voyage AI** (voyage-3-lite) — text embeddings (512 dimensions)
- **Tavily API** — web search fallback
- **pdf-parse v2** — page-aware PDF text extraction
- **pgvector** — HNSW-indexed cosine similarity search
- Sentence-boundary chunking with 2-sentence overlap for better retrieval
- **Query rewriting** — resolves pronouns/context from chat history before retrieval
- **Automatic web fallback** — if local notes fail or have no match, agent searches the web without needing a second tool call
- Agentic loop: LLM decides which tools to call, processes results, generates cited answers
- Retry with exponential backoff on embedding rate limits

### Infrastructure (All Free Tier)
- **Vercel** — frontend hosting (auto-deploy from GitHub)
- **Render** — backend hosting (Node.js)
- **Neon** — managed PostgreSQL with pgvector
- **Cloudinary** — file storage (PDFs)
- **Groq** — LLM inference (30 req/min free)
- **Voyage AI** — embeddings (200M tokens free)
- **Tavily** — web search (1000 req/month free)

---

## Key Technical Decisions

| Decision | Reasoning |
|----------|-----------|
| pgvector over Pinecone/Weaviate | Zero cost, co-located with relational data, single DB |
| Groq over OpenAI | Free tier, fast inference (~200ms), supports tool calling |
| Voyage AI for embeddings | Free 200M tokens, reliable from any server, 512-dim output |
| Sentence-boundary chunking | Better retrieval than fixed-word splits — doesn't cut mid-sentence |
| Page tracking in chunks | Enables "look at page 47" citations — key UX differentiator |
| Query rewriting before retrieval | Resolves "what are they?" into a standalone search query |
| Auto web fallback | If notes fail/empty, agent automatically searches web — no dead ends |
| Fire-and-forget processing | User gets instant upload response, processing happens in background |
| Provider abstraction layer | Single `llmProvider.js` switches between Ollama (dev) and Groq+Voyage (prod) |
| Bearer token auth over cookies | Cross-domain deployment (Vercel ↔ Render) without cookie issues |
| Retry with exponential backoff | Handles Voyage AI rate limits gracefully without crashing |

---

## Metrics & Numbers

- **5 API integrations** (Groq, Voyage, Tavily, Cloudinary, Neon)
- **512-dimensional** vector embeddings with HNSW indexing
- **~300 word** chunks with 2-sentence overlap for optimal retrieval
- **Sub-second** chat responses via Groq (LLM inference)
- **52+ page PDFs** successfully processed and searchable
- **Page-level citation accuracy** in RAG responses
- **6 database tables** (users, subjects, todos, sessions, documents, document_chunks)
- **Zero monthly cost** deployment stack
- **Auto-deploy** CI/CD via GitHub → Vercel + Render

---

## File Structure (Key Files)

```
Frontend/
├── src/
│   ├── components/
│   │   ├── AIStudyBuddyDrawer.jsx    # Chat UI with markdown rendering
│   │   ├── timer/                     # Pomodoro timer components
│   │   ├── todo/TodoPanel.jsx         # Task management
│   │   └── layout/SideNav.jsx         # Navigation + theme menu
│   ├── pages/
│   │   ├── Dashboard.jsx              # Main app view
│   │   ├── Analytics.jsx              # Charts and stats
│   │   └── MyDocuments.jsx            # Document file browser
│   ├── services/
│   │   ├── llmProvider.js             # Abstraction over Groq/Ollama/Voyage
│   │   └── Operations/documentAPI.js  # Upload + chat API calls
│   └── slices/                        # Redux state (auth, timer, theme)

Server/
├── src/
│   ├── services/
│   │   ├── llmProvider.js             # Chat + Embedding provider abstraction
│   │   ├── agentService.js            # Agentic RAG loop with tool calling
│   │   └── documentService.js         # PDF processing + vector search
│   ├── controllers/
│   │   ├── Document.js                # Upload, chat, list, delete
│   │   └── Auth.js                    # JWT auth (register, login, me)
│   ├── models/
│   │   └── document.js                # pgvector schema + migrations
│   └── config/db.js                   # PostgreSQL connection (supports DATABASE_URL)
```

---

## What Makes This Project Interview-Worthy

1. **RAG from scratch** — not using LangChain or any RAG framework. Custom chunking, embedding, vector search, and agentic tool-calling loop.
2. **Production-deployed** — not just localhost. Cross-domain auth, DNS issues solved, rate limiting handled, provider abstraction for dev/prod.
3. **Full-stack ownership** — React frontend, Express backend, PostgreSQL schema design, AI pipeline, DevOps/deployment.
4. **Real engineering trade-offs** — chose pgvector over vector DBs, sentence-chunking over fixed-size, Bearer tokens over cookies for cross-domain, provider abstraction for portability.
5. **Compound feature integration** — the AI isn't bolted on; it's scoped to subjects, linked to Pomodoro sessions, cites page numbers from uploaded docs.
