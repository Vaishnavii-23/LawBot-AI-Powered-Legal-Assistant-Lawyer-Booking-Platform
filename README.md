# LawBot – AI Legal Assistant & Lawyer Booking Platform

FastAPI + React application that helps Indian citizens research legal questions, chat with an AI trained on Indian law PDFs, discover specialised advocates, and coordinate consultations—all backed by a retrieval-augmented generation (RAG) pipeline, Groq LLM, and PostgreSQL.

---
## Homepage
![homepage](https://github.com/Vaishnavii-23/LawBot-AI-Powered-Legal-Assistant-Lawyer-Booking-Platform/blob/main/demo-images/Screenshot%202025-11-28%20232636.png)

---
> other demo pages in the  demo-images folder
## Features

- **Conversational AI chatbot** with chat history, session titles, and structured replies tuned for Indian legal guidance.
- **Retrieval-Augmented Generation (RAG)** that loads Indian law PDFs, chunks them, embeds with SentenceTransformers, stores in FAISS, and prompts Groq’s Llama‑3.1 8B model.
- **Category detection & routing** using keyword heuristics to map user questions to practice areas (family, criminal, cyber, etc.).
- **Dynamic lawyer suggestions** sourced from the PostgreSQL database, ranked by practice area, experience, and average review score.
- **Lawyer discovery experience**: profile management, reviews, dashboards for both lawyers and citizens, and booking flows requiring lawyer approval.
- **Bookings & approvals**: users raise booking requests, lawyers accept or reject them, and accepted requests automatically spawn confirmed bookings.
- **Voice integrations** (optional): upload audio for transcription via Whisper or synthesize answers to speech via pyttsx3 + FFmpeg.
- **Document uploads**: persist user-uploaded case files for future processing.
- **React front-end** with GPT-style chat layout, dashboard pages, protected routes, and Axios client targeting the FastAPI backend.

---

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2, Alembic, Uvicorn.
- **Frontend:** React 18, Vite, React Router, Tailwind CSS utilities, Axios.
- **Database & Storage:** PostgreSQL, SQLAlchemy ORM models, Alembic migrations, local file storage for uploads and FAISS index.
- **AI & Retrieval:** SentenceTransformers (`all-MiniLM-L6-v2`), FAISS, Groq LLM (`llama-3.1-8b-instant`), optional OpenAI Whisper, pyttsx3 TTS.
- **Tooling:** python-dotenv, pypdf, build scripts for FAISS, npm scripts for SPA.

---

## Architecture Overview

```
┌────────────┐    HTTPS/JSON     ┌───────────────────────────┐
│ React SPA  │ ───────────────▶  │ FastAPI (app/main.py)     │
│ (Vite)     │ ◀───────────────  │  • REST endpoints         │
└────────────┘   Axios client    │  • SQLAlchemy ORM         │
				     │  • RAG controller         │
				     └──────┬────────────┬───────┘
					     │            │
			     PostgreSQL ◀──┘            │
			     (app/db/models.py)         │
							    │
					     RAGChatbot (app/chat/rag.py)
					     ├─ FAISS index & metadata (data/index)
					     ├─ SentenceTransformers embeddings
					     └─ Groq LLM API (GROQ_API_KEY)
```

---

## Folder Structure

```
.
├── app/
│   ├── api/routes/        # FastAPI routers (auth, chat, lawyers, bookings, etc.)
│   ├── chat/              # RAG pipeline and category logic
│   ├── db/                # SQLAlchemy models and session factory
│   └── schemas/           # Pydantic request/response models
├── alembic/               # Database migrations
│   └── versions/          # Incremental migration scripts
├── data/
│   ├── index/             # FAISS index + metadata (generated)
│   ├── pdfs/              # Source PDFs for RAG ingestion
│   └── uploads/           # User-uploaded documents (runtime)
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── lib/           # Axios API client
│       └── pages/         # Chat UI, dashboards, auth, directory
├── build_index.py         # Script to build FAISS index from PDFs
├── create_tables.py       # Utility to create tables without Alembic
├── requirements.txt
├── package.json           # Root (backend) npm metadata if needed
└── README.md
```

---

## Setup Instructions

### 1. Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL instance (local or remote)
- Groq account + API key
- (Optional) FFmpeg, `openai-whisper`, `pyttsx3` for voice endpoints
- Git

### 2. Clone the repository

```bash
git clone https://github.com/Vaishnavii-23/lawpal.git
cd lawpal
```

### 3. Backend environment

```bash
python -m venv .venv
.\.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```ini
# AI
GROQ_API_KEY=your_groq_key
HF_TOKEN=optional_huggingface_token
WHISPER_MODEL_NAME=base  # optional override

# Frontend dev (optional overrides)
VITE_API_BASE_URL=http://127.0.0.1:8001
VITE_API_PORT=8001
```

Adjust PostgreSQL credentials in `app/db/database.py` (defaults assume `postgres:root@localhost:5432/lawbot`). Update those constants or refactor to read from environment variables if desired.

### 5. Prepare the database

```bash
alembic upgrade head   # applies migrations under alembic/versions
#   or, for a one-off bootstrap:
python create_tables.py
```

### 6. Build the FAISS index

Place Indian law PDFs in `data/pdfs/`, then run:

```bash
python build_index.py
```

This generates `data/index/faiss_index.bin` and `data/index/chunks_metadata.json`.

### 7. Start the backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Docs live at `http://localhost:8001/docs`.

### 8. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

---

## How the RAG Pipeline Works

1. **PDF ingestion:** `build_index.py` scans `data/pdfs`, extracts text via `pypdf`.
2. **Chunking:** Sliding window (500 chars, 100 overlap) produces manageable snippets with metadata.
3. **Embedding:** SentenceTransformers (`all-MiniLM-L6-v2`) encodes each chunk; vectors are stored in a FAISS L2 index while metadata is serialized to JSON.
4. **Runtime retrieval:** `RAGChatbot._search()` embeds user queries, retrieves top‑k FAISS matches, and re-ranks with keyword overlap.
5. **LLM prompt:** Retrieved snippets feed into a structured Groq prompt that enforces tone, safety rules, and category labelling.
6. **Response parsing:** The bot extracts the “Detected Legal Category” marker and returns the answer, source chunks, and category to the FastAPI layer.

---

## API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Root status message |
| GET | `/health` | Health check |
| POST | `/auth/signup` | Register a user or lawyer (creates lawyer profile when role=lawyer) |
| POST | `/auth/login` | Lightweight login by email + role |
| POST | `/users/register` | Create a user without lawyer profile |
| GET | `/users` | List all users |
| DELETE | `/users/{user_id}` | Delete user and cascade related data |
| POST | `/lawyers/profile` | Create or update a lawyer’s profile |
| GET | `/lawyers` | Filterable list of lawyers with stats |
| GET | `/lawyers/{lawyer_id}` | Retrieve single lawyer profile with ratings |
| POST | `/booking-requests` | Users submit booking requests for lawyers |
| GET | `/booking-requests/lawyer/{lawyer_id}` | List requests for a lawyer |
| GET | `/booking-requests/user/{user_id}` | List requests created by a user |
| PUT | `/booking-requests/{request_id}/status` | Accept/reject a request; acceptance spawns/updates a booking |
| POST | `/bookings` | Create a booking (optionally linked to a request) |
| GET | `/bookings/user/{user_id}` | List bookings for a user |
| GET | `/bookings/lawyer/{lawyer_id}` | List bookings for a lawyer |
| PUT | `/bookings/{booking_id}/status` | Update booking status (pending/accepted/rejected/completed/cancelled) |
| POST | `/reviews` | Create a review tied to a booking |
| GET | `/reviews/lawyer/{lawyer_id}` | Reviews received by a lawyer |
| GET | `/reviews/user/{user_id}` | Reviews submitted by a user |
| POST | `/chat` | Main chat endpoint with RAG, session persistence, lawyer suggestions |
| GET | `/chat/sessions/{user_id}` | List chat sessions for a user |
| GET | `/chat/session/{session_id}` | Fetch messages within a session |
| GET | `/chat/history/{user_id}` | Recent messages (no sessions) |
| POST | `/chat/upload` | Upload supporting documents |
| POST | `/chat/voice-to-text` | Optional Whisper transcription for audio files |
| POST | `/chat/text-to-voice` | Optional pyttsx3 + FFmpeg text-to-speech |

---

## Database Models Overview

| Model | Key Fields | Relationships |
| --- | --- | --- |
| `User` | `id`, `email`, `full_name`, `role` | One-to-one `LawyerProfile`; one-to-many `Booking`, `BookingRequest`, `Review`, `ChatSession`, `ChatMessage`, `UploadedDocument` |
| `LawyerProfile` | `user_id`, `city`, `specialization`, `experience_years`, `hourly_rate`, `bio` | Belongs to `User`; has many `Booking`, `BookingRequest`, `Review` |
| `BookingRequest` | `user_id`, `lawyer_id`, `preferred_date/time`, `notes`, `status` | Links `User` and `LawyerProfile`; optional one-to-one `Booking` |
| `Booking` | `user_id`, `lawyer_id`, `booking_request_id`, `date`, `time`, `status` | Belongs to `User`, `LawyerProfile`, optional `BookingRequest`; has many `Review` |
| `Review` | `booking_id`, `user_id`, `lawyer_id`, `rating`, `comment` | Belongs to `Booking`, `User`, `LawyerProfile` |
| `ChatSession` | `user_id`, `title`, timestamps | Has many `ChatMessage` |
| `ChatMessage` | `user_id`, `session_id`, `role`, `message` | Belongs to `User`, `ChatSession` |
| `UploadedDocument` | `user_id`, `original_filename`, `stored_path` | Belongs to `User` |

---

## How Lawyer Suggestion Works

- **Category inference:** `chat.py` maintains `CATEGORY_KEYWORDS` for major practice areas. Each chat message is scanned for these keywords (or uses the category produced by the RAG answer).
- **Database query:** `get_suggested_lawyers()` filters `LawyerProfile` rows via `ILIKE` on specialization keywords, joins `User` for names, and aggregates `Review` for average ratings.
- **Ranking:** Results are ordered by average rating (defaulting to zero), limited to five suggestions, and returned alongside the chatbot response.
- **Frontend display:** The React chat interface renders the suggestion cards with quick links to lawyer detail pages.

---

## Screenshots

_Add screenshots or GIFs showcasing the chat experience, dashboards, and booking flows._

---

## Future Improvements

- Add secure authentication with hashed passwords, JWTs, and role-based authorisation.
- Stream token-by-token responses from Groq for faster perceived latency.
- Enrich RAG pipeline with citation metadata and PDF page references in UI.
- Build availability calendars and automated reminder emails/SMS for bookings.
- Support multilingual queries and translation for regional language documents.
- Deploy infrastructure as IaC (Terraform/Bicep) and add CI/CD pipelines.

---

## License

Licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to reuse and adapt—just retain attribution and the original license notice.



