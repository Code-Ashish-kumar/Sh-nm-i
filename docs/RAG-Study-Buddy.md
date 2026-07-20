# AI Study Buddy — RAG Architecture Guide

> This doc explains the Retrieval-Augmented Generation (RAG) feature. It lets users upload PDFs/notes per subject and ask questions that get answered from those documents with page-level citations.

---

## High-Level Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + Vite)                                             │
│                                                                      │
│  AIStudyBuddyDrawer.jsx                                              │
│    ├── Upload file → POST /subjects/:id/documents                    │
│    ├── Ask question → POST /subjects/:id/chat (with history)         │
│    └── Renders markdown-formatted AI responses                       │
│                                                                      │
│  MyDocuments.jsx                                                     │
│    └── View/delete all uploads → GET/DELETE /subjects/documents      │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│  BACKEND (Express 5, Node.js ESM)                                    │
│                                                                      │
│  routes/Subject.js                                                   │
│    ├── POST /:id/documents  →  Document controller (upload)          │
│    ├── POST /:id/chat       →  Document controller (chat)            │
│    ├── GET /documents       →  List all user docs                    │
│    └── DELETE /documents/:id → Delete a document                     │
│                                                                      │
│  UPLOAD PATH (fire-and-forget):                                      │
│    Multer memoryStorage → Insert DB row → Respond 202                │
│    └── Background: processDocument()                                 │
│        ├── Upload buffer to Cloudinary                               │
│        ├── pdf-parse v2: extract text per page                       │
│        ├── Sentence-boundary chunking (~300 words, 2-sentence overlap)│
│        ├── Voyage AI voyage-3-lite: 512-dim embeddings (batched)     │
│        └── INSERT into document_chunks (pgvector)                    │
│                                                                      │
│  CHAT PATH (agentic):                                                │
│    agentService.js → runStudyBuddyAgent()                            │
│      ├── Query rewriter (resolves pronouns from chat history)        │
│      ├── Groq llama-3.1-8b-instant with tool calling                 │
│      ├── Tool: searchLocalNotes → Voyage embed query → pgvector search│
│      ├── Tool: searchWeb → Tavily API (auto-fallback)                │
│      └── Returns cited, markdown-formatted explanation               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## File Map

| File | Role |
|------|------|
| `Frontend/src/components/AIStudyBuddyDrawer.jsx` | Chat UI, file upload, markdown rendering, sends history |
| `Frontend/src/pages/MyDocuments.jsx` | Document browser (files grouped by subject) |
| `Frontend/src/services/Operations/documentAPI.js` | `uploadDocument()`, `chatWithStudyBuddy()`, `getUserDocuments()`, `deleteDocumentById()` |
| `Frontend/src/services/api.js` | Endpoint URLs (`documentEndpoints`) |
| `Server/src/routes/Subject.js` | Routes for upload, chat, list, delete |
| `Server/src/controllers/Document.js` | Request handlers (upload, chat, list, delete) |
| `Server/src/services/documentService.js` | PDF parsing, chunking, embedding, vector search |
| `Server/src/services/agentService.js` | Agentic RAG loop (tool calling, query rewriting, citations) |
| `Server/src/services/llmProvider.js` | Provider abstraction (Groq/Ollama for chat, Voyage/Ollama for embeddings) |
| `Server/src/middlewares/upload.js` | Multer memory storage (10MB limit, PDF/TXT/images) |
| `Server/src/models/document.js` | DB schema: `documents` + `document_chunks` (pgvector 512-dim) |

---

## How Each Piece Works

### 1. Upload Flow (PDF → Vectors)

When a user uploads a PDF:

1. **Frontend** sends the file as `FormData` to `POST /subjects/:id/documents` with Bearer token auth.
2. **Multer** stores the file in memory (`file.buffer`).
3. **Controller** inserts a DB row (status = `'processing'`), responds with 202 immediately, then fires `processDocument()` in the background.
4. **processDocument()** (concurrency-limited via `p-queue`):
   - Uploads the buffer to Cloudinary → stores the URL in the DB
   - `pdf-parse` v2 extracts text per page (returns `[{ text, num }]`)
   - `chunkPages()` splits into sentence-boundary chunks (~300 words, 2-sentence overlap), tracking `pageStart` and `pageEnd` for each chunk
   - Batches of chunks sent to **Voyage AI** (`voyage-3-lite`, 512 dimensions) with built-in retry logic for rate limits
   - Each chunk + embedding stored in `document_chunks` (pgvector)
   - Status updated to `'completed'`

### 2. Chat Flow (Question → Cited Answer)

When a user asks a question:

1. **Frontend** sends `{ message, history }` to `POST /subjects/:id/chat`. History includes the last 6 messages for conversational context.
2. **Controller** delegates to `runStudyBuddyAgent(subjectId, message, history)`.
3. **Agent Service**:
   - Builds message array: system prompt + recent history + current question
   - Calls **Groq** (`llama-3.1-8b-instant`) with two function-calling tools declared
   - Model decides which tool to call

4. **Tool: searchLocalNotes**:
   - **Query rewriter** first resolves pronouns/context (e.g., "what are they?" → "what are Common Table Expressions in SQL")
   - Embeds the rewritten query via Voyage AI
   - Runs cosine similarity search on `document_chunks` (pgvector `<=>` operator)
   - Returns top 8 chunks with document title, page numbers, and similarity scores
   - If nothing found (similarity < 0.25), **automatically falls back to web search**

5. **Tool: searchWeb** (Tavily):
   - Used as fallback when notes don't have the answer
   - Returns 3 web results with titles and URLs

6. **Response generation**:
   - Model synthesizes a clear explanation from the tool results
   - Cites sources: `📌 Reference: "Book Title" — Pages X–Y`
   - If answering from web: indicates it's not from their notes
   - Response is markdown-formatted and rendered properly in the chat UI

### 3. Vector Search (The "R" in RAG)

```sql
SELECT dc.content, dc.page_start, dc.page_end, dc.chunk_index,
       d.title as document_title, d.file_url,
       1 - (dc.embedding <=> $1) as similarity
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE d.subject_id = $2 AND d.status = 'completed'
ORDER BY dc.embedding <=> $1
LIMIT $3
```

- `<=>` is pgvector's cosine distance operator
- HNSW index for fast approximate nearest neighbor search
- Only searches within the current subject's documents
- Similarity threshold of 0.25 filters out irrelevant noise

### 4. My Documents Page (File Browser)

Accessible from the profile dropdown in the sidebar.

- Calls `GET /api/v1/subjects/documents` → returns all user documents grouped by subject
- Expandable/collapsible subject folders
- Each document shows: filename, upload date, status badge (processing/completed/failed), open link, delete button
- Deleting cascades to remove chunks/embeddings (`ON DELETE CASCADE`)

---

## Provider Abstraction (`llmProvider.js`)

Single file that switches between local dev and production:

| Function | Local (Ollama) | Production |
|----------|---------------|------------|
| `chatCompletion()` | `qwen2.5:3b` on localhost:11434 | Groq `llama-3.1-8b-instant` |
| `generateEmbedding()` | `nomic-embed-text` (768 dims) | Voyage AI `voyage-3-lite` (512 dims) |
| `generateEmbeddingBatch()` | Ollama batch API | Voyage AI batch (with retry on 429) |
| `buildToolResponseMessage()` | Ollama format | Groq/OpenAI format (with `tool_call_id`) |

Switching is controlled by:
- `LLM_PROVIDER=groq` → uses Groq for chat
- `VOYAGE_API_KEY` set → uses Voyage for embeddings
- Neither set → falls back to Ollama

---

## Infrastructure

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Neon** | PostgreSQL + pgvector | 0.5 GB, 190 compute hours/month |
| **Groq** | LLM chat (llama-3.1-8b-instant) | 30 req/min, 14,400 req/day |
| **Voyage AI** | Embeddings (voyage-3-lite, 512 dims) | 200M tokens |
| **Cloudinary** | PDF file storage | 25 GB |
| **Tavily** | Web search fallback | 1000 req/month |
| **Vercel** | Frontend hosting | Unlimited |
| **Render** | Backend hosting | 750 hours/month |

---

## Key Design Decisions

| Decision | Why |
|----------|-----|
| Sentence-boundary chunking | Doesn't cut mid-sentence → better retrieval quality |
| Page tracking per chunk | Enables "look at page 47" citations |
| 512-dim embeddings | Matches Voyage AI's `voyage-3-lite` output; fast search |
| Query rewriting | Resolves "what are they?" → proper standalone query for retrieval |
| Auto web fallback | If notes fail or have no match, agent still answers from the internet |
| Fire-and-forget upload | User gets instant 202 response; processing is async |
| p-queue concurrency:2 | Prevents overwhelming Voyage rate limits |
| Retry with exponential backoff | Handles Voyage 429s gracefully (5s → 10s → 20s → 30s) |
| Bearer token auth | Works across Vercel (frontend) ↔ Render (backend) domains |

---

## How It Connects to Your Existing App

The Study Buddy is scoped by **subject** — the same subjects used for Pomodoro sessions:

- Start a Pomodoro → Redux stores `subjectId` in `state.timer.subjectId`
- Open Study Buddy drawer → reads `subjectId` from Redux
- Upload notes → associated with that subject
- Ask questions → only searches documents for that subject
- View all documents → Profile menu → "My documents" page (`/my-documents`)

Each subject has its own isolated knowledge base.

---

## Troubleshooting

| Symptom | Likely Cause |
|---------|--------------|
| "No active subject" warning | No Pomodoro session running — start one first |
| Document shows "failed" | Check Render logs — usually a Voyage rate limit (wait and re-upload) |
| "I had trouble searching your notes" | Embedding failed (rate limit) — wait 30s and retry |
| AI gives generic answers without citations | Document still processing, or similarity too low |
| Upload succeeds but stays "processing" | Render free tier may have cold-started — check logs |
| Slow first response | Groq/Voyage cold start — subsequent calls are fast |
| Follow-up questions lose context | History is sent with each request (last 6 messages) |
