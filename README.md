# NextStep AI

**Know Your Skills. Find Your Path. Take the Next Step.**

An AI-Powered Career Development & Personalized Learning Platform.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, Redux Toolkit |
| Backend | Node.js, Express, MongoDB, Mongoose |
| AI Service | Python, FastAPI, LangChain |

## Project Structure

```
nextstep-ai/
├── frontend/     # React SPA
├── backend/      # Express REST API
├── ai-service/   # FastAPI AI microservice
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (or local MongoDB)

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit with your MongoDB URI and JWT secret
npm run dev
```

### 2. AI Service

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Environment Variables

See `.env.example` in each service folder.

## Current Phase

Phases 1–3 complete:
- Project setup & health checks
- Authentication (register, login, JWT)
- Student profile management & dashboard

## License

MIT
