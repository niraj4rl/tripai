# AI Trip Planner PWA - Setup & Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+ (frontend)
- Python 3.10+ (backend)
- PostgreSQL 12+ (database)
- Git

### Frontend Setup (5 minutes)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup (5 minutes)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
cp .env.example .env
pip install -r requirements.txt
python app/main.py
```

The API will run on `http://localhost:8000`

## Environment Variables

### Backend `.env`

```
DATABASE_URL=postgresql://user:password@localhost:5432/travel_ai_pwa
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
OPENAI_API_KEY=sk-...
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
GOOGLE_MAPS_API_KEY=...
GOOGLE_PLACES_API_KEY=...
OPENWEATHER_API_KEY=...
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend `.env`

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_PUBLIC_KEY=...
```

## Database Setup

### Using PostgreSQL locally

```bash
# Create database
createdb travel_ai_pwa

# Connect and create user
psql travel_ai_pwa
CREATE USER travel_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE travel_ai_pwa TO travel_user;
```

### Using Supabase (Recommended for MVP)

1. Create account at https://supabase.com
2. Create a new project
3. Copy the connection string from Project Settings > Database
4. Paste into `DATABASE_URL` in `.env`

## API Integration Setup

### Google APIs

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable APIs:
   - Google Maps JavaScript API
   - Google Places API
   - Google Directions API
4. Create API keys:
   - Public key (for frontend): VITE_GOOGLE_MAPS_PUBLIC_KEY
   - Server key (for backend): GOOGLE_MAPS_API_KEY, GOOGLE_PLACES_API_KEY
   - Server key (for backend): GOOGLE_MAPS_API_KEY (maps only). Places: Foursquare or OpenStreetMap (no key required)
5. Set up API restrictions

### Amadeus API (Flights & Hotels)

1. Register at https://developers.amadeus.com
2. Create an application
3. Copy Client ID and Client Secret
4. Add to `.env`: AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET

### OpenWeather API

1. Go to https://openweathermap.org/api
2. Sign up for free tier
3. Generate API key
4. Add to `.env`: OPENWEATHER_API_KEY

### OpenAI / Gemini (For AI Trip Planning)

1. Get API key from https://platform.openai.com or https://makersuite.google.com
2. Add to `.env`: OPENAI_API_KEY or GEMINI_API_KEY

## Development

### Frontend
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run linter
```

### Backend
```bash
cd backend
# Start development server
python app/main.py

# Or with auto-reload
pip install uvicorn[standard]
uvicorn app.main:app --reload

# Run database migrations (when available)
alembic upgrade head
```

## Deployment

### Frontend - Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Connect your GitHub repository
4. Set environment variables:
   - VITE_API_BASE_URL=https://api.yourdomain.com
   - VITE_GOOGLE_MAPS_PUBLIC_KEY=...
5. Deploy

### Frontend - Netlify

```bash
npm run build
# Drag & drop dist folder to Netlify
```

### Backend - Render

1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect your GitHub repository
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
7. Add environment variables
8. Deploy

### Database - Supabase

Already covered in Database Setup section. Supabase handles everything automatically.

## Testing

### API Testing with cURL

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get current user (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Create trip
curl -X POST http://localhost:8000/api/trips/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source_city":"Mumbai",
    "destination":"Goa",
    "start_date":"2024-12-20",
    "end_date":"2024-12-23",
    "travellers_count":2,
    "budget_total":50000,
    "currency":"INR",
    "trip_type":"couple"
  }'
```

### Testing Budget Validator

```bash
curl -X POST http://localhost:8000/api/ai/budget-check \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source_city":"Mumbai",
    "destination":"Goa",
    "start_date":"2024-12-20",
    "end_date":"2024-12-23",
    "travellers_count":2,
    "budget_total":5000,
    "currency":"INR",
    "trip_type":"couple",
    "hotel_preference":"budget",
    "transport_preference":"flight",
    "pace":"balanced"
  }'
```

## Troubleshooting

### Frontend won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend connection refused
- Ensure backend is running: `python app/main.py`
- Check CORS_ORIGINS in `.env` includes frontend URL
- Check firewall allows 8000 port

### Database connection error
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Verify user credentials
- Try connecting with psql: `psql travel_ai_pwa -U travel_user`

### API calls return 401
- Check token is being sent in Authorization header
- Verify JWT_SECRET matches between requests
- Check token hasn't expired

## Project Structure

```
travel-ai-pwa/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── stores/          # Zustand state management
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── core/           # Config, database, security
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── integrations/   # External API clients
│   │   ├── utils/          # Utilities
│   │   └── main.py         # FastAPI app entry
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                    # Documentation
└── .gitignore
```

## Next Steps

1. Set up all API keys
2. Test authentication flow
3. Implement remaining integration services
4. Add UI components for trip planning
5. Deploy to production
6. Gather user feedback
7. Iterate and improve

## Support

For issues or questions:
- Check API documentation: http://localhost:8000/docs
- Review code comments
- Check error logs in console

---

Happy trip planning! 🚀✈️
