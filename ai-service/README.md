# NextStep AI AI Service

FastAPI microservice for AI-powered career guidance.

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Health Check

`GET http://localhost:8000/health`
