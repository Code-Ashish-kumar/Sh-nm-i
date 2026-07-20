# Retrieval-Augmented Generation (RAG) System Architecture & Usage Guide

This document provides a comprehensive guide to the **Retrieval-Augmented Generation (RAG)** system implemented in this application. The RAG system allows students to upload notes or textbook materials (PDF/TXT/Images) associated with specific study subjects and interact with an AI Study Buddy that retrieves answers directly from their uploaded files.

---

## 1. High-Level Concept

The RAG system is fully integrated with the application's study subject model. Each subject (e.g., Physics, History, Chemistry) acts as an **isolated knowledge base**:
- Uploaded notes are stored and indexed within the context of a specific `subject_id`.
- The AI Study Buddy drawer contextually binds to the active subject.
- Vector searches are scoped exclusively to the documents belonging to the current subject, preventing cross-subject data pollution.

---

## 2. System Architecture & Data Flow

Below is the architectural blueprint illustrating the ingestion (processing) and chat (query/retrieval) pipelines:

```mermaid
graph TD
    %% User Interactions
    User((User)) -->|Uploads PDF/TXT| Client[Frontend React App]
    User -->|Asks Question| Client
    
    %% API Requests
    Client -->|POST /subjects/:id/documents| API[Express API Server]
    Client -->|POST /subjects/:id/chat| API
    
    %% Ingestion Pipeline
    subgraph Ingestion Pipeline (Asynchronous)
        API -->|Upload Stream| Cloudinary[Cloudinary Storage]
        API -->|Fire-and-Forget| PQueue[P-Queue In-Memory Queue]
        PQueue -->|Concurrency: 2| PDFParse[pdf-parse / plain text extraction]
        PDFParse -->|Page-Aware Chunks| Chunking[chunkPages Utility]
        Chunking -->|Batch Requests| EmbeddingService[Voyage AI / Ollama Embeddings]
        EmbeddingService -->|512-dim Vectors| Postgres[(PostgreSQL + pgvector)]
    end
    
    %% Chat Pipeline
    subgraph Chat Agent Loop (agentService)
        API -->|runStudyBuddyAgent| Agent[AI Chat Agent]
        Agent -->|1. Rewrite Query| QueryRewriter[Query Rewriter LLM]
        Agent -->|2. Function Call: searchLocalNotes| VectorSearch[pgvector Cosine Search]
        VectorSearch -->|similarity > 0.25| Agent
        Agent -.->|3. Fallback Tool: searchWeb| Tavily[Tavily Search API]
        Tavily -.-> Agent
        Agent -->|4. Generate Response + Citations| LLM[Groq / Ollama Chat LLM]
        LLM -->|Final Output| API
    end
```

---

## 3. The Ingestion Pipeline (File Upload $\rightarrow$ Vector DB)

When a document is uploaded, the backend immediately responds with `202 Accepted` to keep the user experience responsive, and processes the file asynchronously in the background.

### Step 1: Upload & Cloudinary Storage
1. The **Frontend** makes a multipart form request to `POST /api/v1/subjects/:subject_id/documents`.
2. **Multer** parses the incoming file into memory buffers.
3. The server inserts a record into the `documents` table with status `'processing'`.
4. The server pipes the buffer to **Cloudinary** using a secure upload stream (storing it under `/study-buddy-assets`) and fires the asynchronous `processDocument` promise in the background.

### Step 2: Rate-Limited Background Queue
Document processing is throttled using `p-queue` with a concurrency limit of **2** parallel processes. This safeguards the host server's memory and CPU from spikes when handling large textbooks.

### Step 3: Text Parsing
- **PDFs (`application/pdf`)**: Parsed using `pdf-parse`. The system preserves page metadata, returning an array of `{ page, text }`.
- **Text Files (`text/plain`)**: Treated as a single page (Page 1) content.
- **Images (`image/*`)**: Setup for future OCR integration (currently stubbed).

### Step 4: Page-Aware Chunking
The `chunkPages` utility in [documentService.js](file:///d:/megaProject/Sh-nm-i/Server/src/services/documentService.js#L18-L69) splits text using sentence boundaries into overlapping chunks:
- **Max Chunk Size**: 300 words per chunk (to stay within embedding limits and preserve context specificity).
- **Overlap**: 2 sentences between chunks (prevents losing context at chunk boundaries).
- **Page Referencing**: Tracks which pages each chunk spans (`pageStart` and `pageEnd`), which is critical for accurate citations later.

### Step 5: Embedding Generation & Database Storage
The system sends batches of up to 25 chunks to the configured embedding provider (Voyage AI or Ollama). 
Once the vectors are returned:
1. Chunks are stored in the SQL table `document_chunks` along with their text content, start/end page numbers, chunk index, and the vector embedding.
2. The document record status is updated to `'completed'`. If processing fails at any stage, status is marked `'failed'`.

---

## 4. Chat Retrieval & Agentic Orchestration

The AI Study Buddy uses an **Agentic Loop** with Function Calling tools instead of a basic single-shot RAG prompt. This allows the LLM to decide dynamically when to search notes or fallback to the internet.

### Step 1: Query Rewriting
To ensure that conversational context is preserved (e.g., if a user asks "Explain the first theory" after discussing Einstein's theories), the query is rewritten before searching. The system compiles the last 4 chat messages and instructs a helper LLM to rewrite the query into a standalone retrieval search string.

### Step 2: Agent Tool Configuration
The agent is provided with two tools:
1. **`searchLocalNotes(query)`**: Search local documents.
2. **`searchWeb(query)`**: Fallback to Tavily Web Search.

### Step 3: Local Note Search (The Retrieval Step)
When the model invokes `searchLocalNotes`, the system:
1. Generates an embedding vector of the search query.
2. Executes a cosine similarity search against `document_chunks` using pgvector's cosine distance operator (`<=>`):
   ```sql
   SELECT dc.content, dc.page_start, dc.page_end, d.title, 1 - (dc.embedding <=> $1) as similarity
   FROM document_chunks dc
   JOIN documents d ON dc.document_id = d.id
   WHERE d.subject_id = $2 AND d.status = 'completed'
   ORDER BY dc.embedding <=> $1 LIMIT $3
   ```
3. Filters for chunks with a similarity score **$> 0.25$**.
4. Formats the chunks with document titles and page numbers for the agent's context window.

### Step 4: Fallback to Web Search
If `searchLocalNotes` returns no relevant results, the agent automatically falls back to search the web using **Tavily Search API**, allowing it to answer queries even when a student hasn't uploaded notes on that specific topic.

### Step 5: Answer Generation & Citation
The model generates the final text grounded in the retrieved sources. The system enforces strict formatting guidelines:
- Synthesize an educational explanation in the model's own words.
- Append a standard citation block at the end (e.g., `📌 Reference: "Physics_Ch1.pdf" — Page 4-5` or `📌 Reference: General Knowledge` if no source was found).

---

## 5. Flashcard Generation Pipeline

RAG capabilities are also utilized to generate study flashcards dynamically from user documents.

1. **Endpoint**: `GET /api/v1/subjects/:subject_id/flashcards`.
2. **Retrieval**: The system grabs up to 10 random chunks from the completed documents associated with that subject.
3. **Generation**: It prompts the LLM to extract key concepts, definitions, and facts from the context text and structure them as a JSON array of question-answer pairs:
   ```json
   [
     { "question": "What is Coulomb's Law?", "answer": "..." }
   ]
   ```
4. **Validation**: The backend cleans the response string, parses the JSON array, and sends the flashcards back to the React client to render in the interactive flashcard deck UI.

---

## 6. Database Schema Details

The database schemas are defined in [document.js](file:///d:/megaProject/Sh-nm-i/Server/src/models/document.js):

### `documents` Table
Stores metadata for uploaded notes.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key (Default: `gen_random_uuid()`) |
| `user_id` | `UUID` | References `users(user_id)` with cascade deletion |
| `subject_id` | `UUID` | References `subjects(subject_id)` with cascade deletion |
| `title` | `VARCHAR(255)`| Filename of the uploaded file |
| `file_url` | `TEXT` | Public URL pointing to Cloudinary |
| `file_type` | `VARCHAR(50)` | MIME type (e.g., `application/pdf`) |
| `status` | `VARCHAR(50)` | Processing status: `'processing'`, `'completed'`, `'failed'` |
| `created_at` | `TIMESTAMP` | Timestamp when uploaded |

### `document_chunks` Table
Stores split text chunks and vector embeddings.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key |
| `document_id` | `UUID` | References `documents(id)` with cascade deletion |
| `content` | `TEXT` | Raw text segment of the chunk |
| `page_start` | `INTEGER` | Starting page number of the chunk |
| `page_end` | `INTEGER` | Ending page number of the chunk |
| `chunk_index`| `INTEGER` | Positional index of the chunk in the document |
| `embedding` | `vector(512)` | The numerical vector representation |

### Vector Index
To enable efficient vector searches, the database builds an HNSW index on the embeddings column using Cosine operations:
```sql
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);
```

---

## 7. Configuration & Setup (`.env`)

To control how the RAG model and embeddings are loaded, configure the following keys in your Server `.env` file:

```ini
# RAG LLM Settings
LLM_PROVIDER=groq                     # 'groq' for production cloud, 'ollama' for local
GROQ_API_KEY=gsk_xxx                  # Key from console.groq.com
GROQ_CHAT_MODEL=llama-3.1-8b-instant

# Embeddings Settings
VOYAGE_API_KEY=pa-xxx                 # Voyage AI API Key (highly recommended for 512-dim)

# Local Fallbacks (Ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=qwen2.5:3b
OLLAMA_EMBED_MODEL=nomic-embed-text

# Web Search API
TAVILY_API_KEY=tvly-xxx               # Key from tavily.com

# Cloud File Storage
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

---

## 8. Technical Caveats & Troubleshooting

### Vector Dimension Conflict (Ollama vs. Voyage)
- **Problem**: The PostgreSQL database schema sets the vector column size strictly to `vector(512)`.
  - Voyage AI's `voyage-3-lite` outputs **512-dimensional** vectors, which fits perfectly.
  - Ollama's `nomic-embed-text` outputs **768-dimensional** vectors.
- **Consequence**: If `VOYAGE_API_KEY` is empty, the system will fall back to Ollama's `nomic-embed-text`. This will cause insertion queries to throw a database mismatch error because a 768-dimensional array cannot fit in a `vector(512)` column.
- **Workaround/Fix**: If you plan to run Ollama for embeddings locally, you must either:
  1. Use an Ollama embedding model that natively outputs 512 dimensions.
  2. Modify the column size definition in [document.js](file:///d:/megaProject/Sh-nm-i/Server/src/models/document.js#L31) to `vector(768)` and drop/recreate the HNSW index.

### Memory limitations of P-Queue
- Because the system uses `p-queue` in-memory rather than Redis/BullMQ, restarted servers will lose any currently queued processing tasks. The status of those documents will remain stuck as `'processing'`. 
- **Fix**: Re-upload the document to re-trigger the ingestion process.
