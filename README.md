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

## Running with Docker

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running on your machine.

```bash
# Build and start all services (Frontend, Backend, AI Service, and MongoDB)
docker compose up --build

# To run in detached mode (background)
docker compose up -d --build

# To view logs
docker compose logs -f

# To stop all containers
docker compose down
```

Services will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **AI Microservice**: `http://localhost:8000`
- **MongoDB**: `localhost:27017`

## Environment Variables

See `.env.example` in each service folder.

## Current Phase

Phases 1–3 complete:
- Project setup & health checks
- Authentication (register, login, JWT)
- Student profile management & dashboard

## License

MIT
