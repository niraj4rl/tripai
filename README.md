# TripAI

TripAI is a full-stack travel planning app with an AI-assisted itinerary generator, real data integrations, and a mobile-first PWA experience. This repository is a monorepo with a React frontend and a FastAPI backend.

## Features

- AI-assisted trip planning with structured itineraries
- Real data integrations for flights, hotels, places, and weather
- Budget validation and cost breakdowns
- JWT-based authentication and user profiles
- PWA support with offline fallback and install prompt

## Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router, TanStack Query, Zustand

**Backend**
- FastAPI
- SQLAlchemy
- PostgreSQL (or compatible)
- Pydantic

## Repository Structure

```
tripai/
├── frontend/            # React PWA
├── backend/             # FastAPI app
├── docs/                # Project docs
└── README.md
```

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (optional; can use a hosted DB)

## Quick Start

### 1) Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

### 2) Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

App: http://127.0.0.1:5173

## Environment Variables

Copy `.env.example` to `.env` in both `frontend/` and `backend/` and set the keys you need. Common integrations:

- Google Maps / Places
- Amadeus (flights and hotels)
- OpenWeather
- AI provider (OpenAI/Gemini)

## Docs

- [docs/00_START_HERE.md](docs/00_START_HERE.md)
- [docs/SETUP.md](docs/SETUP.md)
- [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

## Testing (Backend)

```bash
cd backend
pytest
```

## Deployment Notes

- Frontend: build with `npm run build`
- Backend: run with `uvicorn app.main:app --host 0.0.0.0 --port 10000`

## License

MIT
