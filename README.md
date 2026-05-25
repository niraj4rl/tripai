# Tripperz: AI Travel Planning and PWA Experience

Tripperz is a modern, full-stack travel planning platform designed to help travelers build realistic itineraries using live data and AI. It combines FastAPI, multiple travel data providers, and a mobile-first React PWA to deliver actionable trip plans for individuals and groups.

## Project Overview

Tripperz analyzes trip preferences (budget, pace, dates, interests) and combines live travel data to:

- Generate structured day-by-day itineraries with AI
- Validate budgets with real-world pricing signals
- Surface flights, hotels, and attractions from live providers
- Visualize trips in a clean, installable PWA experience

The platform is built for extensibility and supports multiple providers with graceful fallbacks.

## Features

- AI-assisted trip planning with structured itineraries
- Real flight, hotel, place, and weather integrations
- Budget validation and trip cost breakdowns
- JWT-based authentication with saved trips and profiles
- Mobile-first PWA with offline shell and install support
- Search, compare, and export trip plans

## Tech Stack

**Backend**
- FastAPI (Python)
- Uvicorn
- SQLAlchemy + Pydantic

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- TanStack Query, Zustand

**AI**
- OpenAI or Gemini

## APIs Used

- OpenAI API (AI itinerary generation)
- Gemini API (AI itinerary generation)
- TravelPayouts API (flights)
- Hotelbeds API (hotels)
- Foursquare Places API (places)
- OpenWeather API (weather + geocoding)
- OpenStreetMap Nominatim (geocoding fallback, keyless)
- MapTiler API (frontend maps + geocoding)
- Skyscanner API (optional)

## Architecture

```
┌────────────┐      REST API     ┌──────────────┐      ┌──────────────┐
│  Frontend  │ <───────────────> │   FastAPI    │ <───>│  Travel APIs │
│  (React)   │                   │   Backend    │      │  + AI APIs   │
└────────────┘                   └──────────────┘      └──────────────┘
```

## Repository Structure

```
tripperz/
├── frontend/            # React PWA
├── backend/             # FastAPI app
├── docs/                # Project docs
└── README.md
```

## UI
<img width="230" height="400" alt="Screenshot 2026-05-25 124810" src="https://github.com/user-attachments/assets/c32bf540-7415-4250-991f-8ab4539cb300" />

<img width="230" height="400" alt="Screenshot 2026-05-25 124852" src="https://github.com/user-attachments/assets/910aa5f0-9326-40f5-aadc-4492365e83dd" />

<img width="230" height="400" alt="Screenshot 2026-05-25 124911" src="https://github.com/user-attachments/assets/9922f255-3e85-46dd-8337-419ed3090ce7" />

<img width="230" height="400" alt="Screenshot 2026-05-25 124923" src="https://github.com/user-attachments/assets/de8813c3-0116-44b3-a61b-82547531c509" />

<img width="230" height="400" alt="Screenshot 2026-05-25 124935" src="https://github.com/user-attachments/assets/7225f5e9-f50b-4edc-b766-71ec52beb68f" />

<img width="230" height="400" alt="Screenshot 2026-05-25 124951" src="https://github.com/user-attachments/assets/b4368661-5662-49cb-8a5a-4f2dc2c6577b" />



## Getting Started (Local Development)

1. Clone the repository
2. Create and activate a Python virtual environment
3. Install backend dependencies:

```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and add your API keys (see docs)
5. Build the frontend:

```bash
npm install
npm run build
```

6. Start the backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

7. Start the frontend (for development):

```bash
npm run dev
```

8. Open http://localhost:5173 in your browser

## Core API Endpoints

- `POST /api/ai/trip-plan` - Generate itinerary
- `POST /api/ai/budget-check` - Validate budget
- `GET /api/flights/search` - Search flights
- `GET /api/hotels/search` - Search hotels
- `GET /api/places/search` - Search places
- `GET /api/weather/forecast` - Weather forecast

## Docs

- [docs/00_START_HERE.md](docs/00_START_HERE.md)
- [docs/SETUP.md](docs/SETUP.md)
- [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

## Deployment

This project is currently in local development. For deployment steps, see the docs folder.

## License

MIT License
