# 🚀 AI Study Buddy & Pomodoro Productivity Hub (SH-NM-I)

An end-to-end, full-stack AI-assisted learning platform that combines a **Pomodoro Focus Timer**, **Task Management**, **PostgreSQL Vector RAG (Retrieval-Augmented Generation)**, **AI Flashcard Generator**, and an **Agentic Study Buddy AI** capable of searching student notes and live web sources with exact page citations.

---

## ✨ Features

### ⏱️ **Pomodoro Focus Workspace**
- **Customizable Timer**: Work, short break, and long break sessions with automatic phase switching.
- **Ambient Soundscapes**: Built-in white noise, rain, and focus audio presets.
- **Task Integration**: Manage daily study tasks alongside the focus timer.
- **Spotify Player Integration**: Seamless background music player directly in the dashboard.

### 📚 **Subject & Study Material Hub**
- **Subject Management**: Categorize study items by subject with customizable color tokens and target goals.
- **Document Management**: Upload PDF textbooks, class slides, and lecture notes stored securely on Cloudinary.
- **Processing Status**: Asynchronous document text extraction, chunking, and embedding creation status tracking.

### 🧠 **AI Document Intelligence & RAG**
- **Vector Search Engine**: Text extraction via `pdf-parse`, chunking with page range tracking, and vector indexing using PostgreSQL's `pgvector` with HNSW cosine distance indexes.
- **Flexible Embedding Providers**: Powered by **Voyage AI**, **Google Gemini** (`gemini-embedding-2`), or **Ollama** (`nomic-embed-text`) local fallbacks.
- **Document Q&A**: Interactive chat drawer per document with persistent chat histories.

### 🤖 **Agentic AI Study Buddy**
- **Autonomous Tool-Use Loop**: Powered by Groq LLM agent capability:
  1. `searchLocalNotes`: Intelligently rewrites user context and searches indexed student notes using vector embeddings.
  2. `searchWeb`: Automatically falls back to live web search via **Tavily API** if student notes don't cover the query.
- **Exact Citations**: Returns clear explanations with verifiable source names and page numbers (e.g., *Reference: "Physics_Ch3.pdf" — Page 14–16*).

### 🎴 **AI Flashcard Generator & Mastery Deck**
- **Automated Deck Generation**: AI extracts key concepts from study documents and generates structured flashcards.
- **Interactive 3D Flip UI**: Interactive card viewer built with Framer Motion.
- **Spaced Mastery Tracking**: Mark cards as *Mastered*, *Review*, or *Hard* to optimize study sessions.

### 📊 **Productivity Analytics & Streak Visuals**
- **Heatmap Visualization**: GitHub-style activity contribution calendar using `react-calendar-heatmap`.
- **Subject Time Distribution**: Visual graphs powered by `recharts` showing time spent per subject and completion trends.

### 🔒 **Authentication & Security**
- **Secure JWT Authentication**: HTTP-only secure cookie session management.
- **Password Protection**: Salting and hashing via `bcrypt`.
- **Input Validation**: Schema validation using `zod`.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons & Charts**: [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/), [Recharts](https://recharts.org/), [React Calendar Heatmap](https://github.com/kevinsqi/react-calendar-heatmap)

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express v5](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [`pgvector`](https://github.com/pgvector/pgvector) extension
- **File Storage**: [Cloudinary](https://cloudinary.com/) + [Multer](https://github.com/expressjs/multer)
- **Document Parsing**: `pdf-parse`

### **AI & Agent Services**
- **LLM Engine**: [Groq API](https://groq.com/) (or configurable OpenAI-compatible providers)
- **Embeddings**: Voyage AI / Google Gemini / Ollama
- **Web Search API**: [Tavily Search API](https://tavily.com/)

---

## 📁 Directory Structure

```text
.
├── Frontend/                 # React 19 Frontend Application
│   ├── src/
│   │   ├── components/      # UI Components (Timer, Flashcards, AI Drawer, Spotify)
│   │   ├── pages/           # Pages (Dashboard, Subjects, Analytics, Documents)
│   │   ├── services/        # API service layers
│   │   ├── slices/          # Redux slices (Auth, UI, Timer, etc.)
│   │   └── store/           # Redux store configuration
│   ├── package.json
│   └── vite.config.js
│
├── Server/                   # Node.js + Express API Server
│   ├── src/
│   │   ├── config/          # DB & Service configurations
│   │   ├── controllers/     # Route handlers (Auth, Subjects, Docs, Flashcards)
│   │   ├── db/              # Database initialization & migrations
│   │   ├── models/          # PostgreSQL schema creators (Users, Sessions, Vector Chunks)
│   │   ├── routes/          # Express route definitions
│   │   └── services/        # LLM, Vector Search, Agentic Tool orchestration
│   ├── index.js             # API Entry Point
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Schema & Vector Indexing

The PostgreSQL database relies on `pgvector` to store vector embeddings for semantic document search.

- **`users`**: User profiles & encrypted passwords.
- **`subjects`**: User created subjects with color coding.
- **`sessions`**: Pomodoro and study timer logs.
- **`todos`**: User tasks and completion statuses.
- **`documents`**: PDF metadata & Cloudinary file URLs.
- **`document_chunks`**: Segmented PDF content with `page_start`, `page_end`, and `embedding vector(512)` indexed using HNSW `vector_cosine_ops`.
- **`document_chats`**: Stored conversation history between user and AI assistant per document.

---

## ⚙️ Environment Configuration

### **Server Environment (`Server/.env`)**

Create a `Server/.env` file based on `Server/.env.example`:

```env
# Server Config
PORT=5000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret_key

# PostgreSQL Connection
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name

# LLM Provider (Groq API)
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key

# Embeddings (Voyage AI or Gemini)
VOYAGE_API_KEY=pa-your_voyage_key
# GEMINI_API_KEY=your_gemini_api_key
# GEMINI_EMBED_MODEL=gemini-embedding-2

# Web Search (Tavily)
TAVILY_API_KEY=tvly-your_tavily_api_key

# File Storage (Cloudinary)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### **Frontend Environment (`Frontend/.env`)**

Create a `Frontend/.env` file:

```env
REACT_APP_BASE_URL=http://localhost:5000/api/v1
```

---

## 🚀 Getting Started

### **Prerequisites**
1. **Node.js**: v18+ installed.
2. **PostgreSQL**: v15+ installed with `pgvector` extension enabled (`CREATE EXTENSION IF NOT EXISTS vector;`).
3. **API Keys**:
   - [Groq API Key](https://console.groq.com/)
   - [Voyage AI](https://dashboard.voyageai.com) or [Google Gemini API Key](https://aistudio.google.com/)
   - [Tavily Search API Key](https://tavily.com/)
   - [Cloudinary Account](https://cloudinary.com/)

---

### **Installation & Setup**

#### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

#### **2. Backend Setup**
```bash
cd Server
npm install
# Copy and configure environment variables
cp .env.example .env
```
Start the backend server:
```bash
npm run dev
```
The API server will automatically connect to PostgreSQL and run schema migrations (`initDB()`), ensuring all tables and vector indexes are created.

#### **3. Frontend Setup**
In a new terminal window:
```bash
cd Frontend
npm install
# Copy and configure environment variables
cp .env.example .env
```
Start the Vite development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🔌 API Endpoints Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Register a new user account |
| `/api/v1/auth/login` | `POST` | Authenticate user & set JWT cookie |
| `/api/v1/auth/me` | `GET` | Verify current user session |
| `/api/v1/auth/logout` | `POST` | Clear session cookie |
| `/api/v1/subjects` | `GET` / `POST` | Fetch or create subjects |
| `/api/v1/subjects/:id` | `GET` / `DELETE` | Manage specific subject |
| `/api/v1/subjects/:id/documents` | `POST` | Upload PDF document & trigger RAG vector indexing |
| `/api/v1/subjects/:id/flashcards/generate` | `POST` | Generate AI flashcards from subject documents |
| `/api/v1/subjects/:id/agent/chat` | `POST` | Send prompt to Agentic Study Buddy (RAG + Web Search) |
| `/api/v1/todos` | `GET` / `POST` / `PATCH` / `DELETE` | Task CRUD operations |
| `/api/v1/sessions` | `GET` / `POST` | Log and retrieve Pomodoro timer sessions |
| `/api/v1/analytics/summary` | `GET` | Retrieve productivity stats, heatmaps, and chart metrics |

---
