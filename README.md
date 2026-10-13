# AI Resume Analyzer

An intelligent, full-stack resume diagnostic and ATS optimization platform powered by **FastAPI**, **React**, and **OpenAI GPT-4o** with a heuristic NLP fallback engine.

---

## 🚀 Features

- **Document Ingestion**: Parses `.pdf` and `.docx` resumes in-memory without saving sensitive files to disk.
- **ATS & Match Scoring**: Evaluates resume content against target Job Descriptions or industry standards.
- **Skill Extraction & Gap Analysis**: Highlights technical capabilities and identifies deficiencies.
- **Actionable Feedback**: Generates prioritized, structured improvement recommendations.
- **Dual AI Engine**: OpenAI GPT-4o with seamless rule-based heuristic fallback if API keys are not supplied.
- **Secure Authentication**: Bcrypt password hashing + stateless JWT bearer tokens + Google OAuth 2.0.
- **Audit History**: Review, compare, or delete past resume diagnostic reports.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Axios
- **Backend**: FastAPI (Python 3.11), Uvicorn, SQLAlchemy, Pydantic v2
- **Document Processing**: `pdfplumber`, `python-docx`
- **AI/NLP**: OpenAI API (GPT-4o), RegEx NLP Pattern Matcher

---

## 🏃 Local Development

### 1. Start Both Servers with One Script
```bash
chmod +x run.sh
./run.sh
```
- Frontend UI: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`

---

## ☁️ Deployment Guide

### Backend (Render / Railway / Fly.io / Docker)
1. **Render (1-Click Blueprint)**:
   - Link your GitHub repo (`Abhinand23/AI-Resume-Analyzer`) to [Render](https://render.com).
   - Render will automatically detect [`render.yaml`](./render.yaml).
   - Alternatively, create a **Web Service**, set Root Directory to `backend`, Build Command: `pip install -r requirements.txt`, and Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
2. **Docker**:
   - Build and run using [`backend/Dockerfile`](./backend/Dockerfile).

### Frontend (Vercel / Netlify)
1. Import your GitHub repository into [Vercel](https://vercel.com/new).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://ai-resume-analyzer-backend.onrender.com`).
5. Click **Deploy**.
