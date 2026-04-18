<div align="center">

# 🎯 AutoAlign — Dynamic Resume Tailoring Engine

### *Beat the ATS. Keep the Truth.*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

> Applicant Tracking Systems reject **70% of resumes** because they don't contain exact keywords from the job description. AutoAlign fixes that — algorithmically.

[Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [How It Works](#-how-it-works)

</div>

---

## 🧩 Problem Statement

Candidates spend hours manually rewriting resumes for every job application. AutoAlign automates this:

1. Upload your **Master Resume** (PDF)
2. Paste the **Job Description**
3. Get an **ATS-optimized resume** — with matched keywords, improved bullet points, and a downloadable PDF

### The Critical Constraint: Truth Preservation

> The AI **rephrases** your existing skills to match JD vocabulary. It never **invents** fake experience.
>
> If your resume says *"built web apps"* and the JD says *"developed scalable applications"*, the AI outputs: *"Developed scalable web applications"* — same experience, JD vocabulary.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **PDF Parsing** | Extracts text from uploaded PDFs using PyMuPDF |
| 🤖 **AI Resume Rewriting** | GPT-3.5 via OpenRouter with truth-preservation constraints |
| 📊 **Hybrid ATS Scoring** | 60% heuristic keyword matching + 40% LLM judge evaluation |
| 📋 **Before vs After Comparison** | Side-by-side score display with animated ring charts |
| 🔍 **Keyword Analysis Report** | Matched keywords (green), missing keywords (red), section coverage |
| 📥 **PDF Generation** | ATS-compliant PDF with keyword highlighting via ReportLab |
| 🛡️ **Domain Compatibility Check** | Prevents cross-domain tailoring (e.g., chef → software) |
| 🎨 **Premium UI** | Framer Motion animations, Lenis smooth scrolling, glassmorphism cards |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │ Home.jsx │→ │ api.js       │→ │ Result.jsx                │  │
│  │ Upload   │  │ POST /tailor │  │ ScoreDisplay + Preview +  │  │
│  │ + JD     │  │ POST /upload │  │ AnalysisReport + Download │  │
│  └──────────┘  └──────┬───────┘  └───────────────────────────┘  │
│                       │ Zustand Store (useResumeStore)           │
└───────────────────────┼─────────────────────────────────────────┘
                        │ HTTP (localhost:8000)
┌───────────────────────┼─────────────────────────────────────────┐
│                    BACKEND (FastAPI)                             │
│  ┌────────────────────▼──────────────────────────────────────┐  │
│  │                     Routes                                │  │
│  │  POST /api/upload  →  parser.py (PyMuPDF)                 │  │
│  │  POST /api/tailor  →  rewriter → scorer → JSON response   │  │
│  │  POST /api/generate-pdf → pdf_generator.py (ReportLab)    │  │
│  │  POST /api/score   →  scorer.py (hybrid ATS + LLM)        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   AI Engine                               │  │
│  │  agentic_pipeline.py  →  OpenRouter GPT-3.5               │  │
│  │  truth_guard.py       →  Hallucination detection           │  │
│  │  llm_judge.py         →  Quality evaluation (0-100)        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Code-of-Duty/
├── ai_engine/                  # AI/ML pipeline
│   ├── agentic_pipeline.py     # Main GPT-3.5 resume rewriter
│   ├── truth_guard.py          # Hallucination detection
│   ├── llm_judge.py            # LLM-based quality scorer
│   ├── keyword_matcher.py      # JD keyword extraction
│   └── prompts/                # Prompt templates
│       └── agentic_prompt.txt
│
├── backend/                    # FastAPI server
│   ├── app.py                  # Entry point + CORS config
│   ├── routes/
│   │   ├── upload.py           # POST /api/upload
│   │   ├── tailor.py           # POST /api/tailor + /api/generate-pdf
│   │   └── score.py            # POST /api/score
│   ├── services/
│   │   ├── parser.py           # PDF text extraction (PyMuPDF)
│   │   ├── rewriter.py         # AI pipeline orchestrator
│   │   ├── scorer.py           # Hybrid ATS scoring engine
│   │   ├── pdf_generator.py    # ReportLab PDF generation
│   │   └── compatability.py    # Domain mismatch detection
│   └── utils/
│       ├── keyword_extractor.py # Stopword-filtered keyword extraction
│       └── text_cleaner.py     # Text normalization
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Upload + JD input
│   │   │   └── Result.jsx      # Scores + Preview + Report + Download
│   │   ├── components/
│   │   │   ├── PreviewResume.jsx   # Side-by-side resume comparison
│   │   │   ├── ScoreDisplay.jsx    # Animated score ring charts
│   │   │   ├── UploadResume.jsx    # Drag-and-drop PDF upload
│   │   │   ├── CinematicLoader.jsx # Full-screen loading animation
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js          # API client with mock fallback
│   │   └── store/
│   │       └── useResumeStore.js # Zustand global state
│   └── package.json
│
├── docker-compose.yml          # Docker deployment config
├── .env                        # API keys (git-ignored)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **OpenRouter API Key** — [Get one here](https://openrouter.ai/keys)

### 1. Clone the Repository

```bash
git clone https://github.com/bhavyashukla510-cloud/Code-of-Duty.git
cd Code-of-Duty
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=sk-or-v1-your_openrouter_api_key_here
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE=http://localhost:8000
```

### 3. Install Backend Dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 5. Run the Application

Open **two terminals**:

```bash
# Terminal 1 — Backend (FastAPI)
uvicorn backend.app:app --reload --port 8000

# Terminal 2 — Frontend (React + Vite)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### Docker (Alternative)

```bash
docker-compose up --build
```

---

## 📡 API Reference

### `POST /api/upload`

Upload a PDF resume and extract text.

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | `File` | PDF file (multipart/form-data) |

**Response:**
```json
{
  "message": "PDF uploaded successfully",
  "resume_text": "Extracted text content...",
  "filename": "resume.pdf"
}
```

---

### `POST /api/tailor`

Tailor a resume to a job description. Returns JSON with optimized text, scores, and keyword analysis.

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | `File` | PDF resume (multipart/form-data) |
| `job_description` | `string` | Job description text |

**Response:**
```json
{
  "tailored_text": "Optimized resume content...",
  "original_text": "Original resume content...",
  "before_score": 38.24,
  "after_score": 52.18,
  "improvement": 13.94,
  "before_ats": 23.73,
  "after_ats": 41.04,
  "before_llm": 60,
  "after_llm": 65,
  "matched_keywords": ["react", "mongodb", "develop", "applications"],
  "missing_keywords": ["typescript", "graphql", "docker"],
  "report": {
    "keyword_match_rate": "54.2%",
    "total_jd_keywords": 24,
    "matched_count": 13,
    "missing_count": 11,
    "present_sections": ["summary", "skills", "experience", "projects", "education"],
    "missing_sections": [],
    "suggestions": ["Strong keyword match!"]
  }
}
```

---

### `POST /api/generate-pdf`

Generate a downloadable ATS-friendly PDF with keyword highlighting.

| Parameter | Type | Description |
|-----------|------|-------------|
| `tailored_text` | `string` | Optimized resume text |
| `job_description` | `string` | Job description (for keyword highlighting) |

**Response:** PDF file (application/pdf)

---

### `POST /api/score`

Get ATS match scores for a resume against a job description.

| Parameter | Type | Description |
|-----------|------|-------------|
| `original_resume` | `string` | Original resume text |
| `rewritten_resume` | `string` | Tailored resume text |
| `jd_text` | `string` | Job description text |

**Response:**
```json
{
  "before_score": 38.24,
  "after_score": 52.18,
  "improvement": 13.94
}
```

---

## ⚙ How It Works

### 1. PDF Parsing
Uses **PyMuPDF** (`fitz`) to extract raw text from uploaded PDF resumes while preserving structure.

### 2. Domain Compatibility Check
Before AI processing, the system checks if the resume domain matches the job domain. A chef's resume won't be "tailored" to a software engineering role — it will return an error with guidance.

### 3. AI Rewriting (Truth-Preserved)
The AI pipeline uses **GPT-3.5 via OpenRouter** with a carefully crafted prompt that enforces:
- ✅ Rephrase existing skills using JD vocabulary
- ✅ Reorder sections to prioritize relevant experience
- ✅ Use strong action verbs (Developed, Implemented, Optimized)
- ❌ Never invent new skills, certifications, or experiences
- ❌ Never add technologies not present in the original resume

### 4. Hybrid ATS Scoring
The scoring engine combines four heuristic factors with an LLM judge:

| Factor | Weight | What It Measures |
|--------|--------|-----------------|
| Keyword Match | 40% | % of JD keywords found in resume |
| Keyword Frequency | 20% | How often JD keywords appear |
| Resume Structure | 20% | Presence of key sections (Summary, Skills, Experience, etc.) |
| Action Verbs | 20% | Use of strong action verbs |

**Final Score** = `(ATS Score × 0.6) + (LLM Judge Score × 0.4)`

### 5. PDF Generation
Uses **ReportLab** to programmatically generate an ATS-compliant PDF:
- Clean, structured layout matching professional LaTeX templates
- Centered name header with contact info
- Section dividers with horizontal rules
- JD keywords highlighted in **bold dark blue**
- Proper bullet point formatting

---

## 🧰 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | REST API framework |
| PyMuPDF (fitz) | PDF text extraction |
| ReportLab | Programmatic PDF generation |
| OpenRouter | GPT-3.5 API gateway |
| Python-dotenv | Environment variable management |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Zustand | Lightweight state management |
| Framer Motion | Animations & transitions |
| Lenis | Smooth scrolling |
| React-Dropzone | Drag-and-drop file upload |

---

## 👥 Team — Code of Duty

Built for **Kriyeta 5.0 Hackathon**.

---

<div align="center">

**Made with ❤️ by Team Code of Duty**

</div>
