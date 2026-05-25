# 🚀 AI Trip Planner PWA - Quick Start (30 Minutes)

## What You Got

- ✅ Complete FastAPI backend with database models
- ✅ Complete React + TypeScript frontend
- ✅ Authentication system (JWT)
- ✅ Budget validation logic
- ✅ PWA configuration
- ✅ Environment templates
- ✅ API integration stubs ready for real APIs

## Step-by-Step Setup

### 1️⃣ Extract Files

```bash
unzip travel-ai-pwa-backend.zip
unzip travel-ai-pwa-frontend.zip
cd travel-ai-pwa
```

### 2️⃣ Start Backend (Terminal 1)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run server
python app/main.py
```

✅ Backend running at: **http://localhost:8000**
📖 API docs at: **http://localhost:8000/docs**

### 3️⃣ Start Frontend (Terminal 2)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run dev server
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

## 🧪 Test It

1. Open http://localhost:5173
2. Click "Sign Up"
3. Create an account (any email/password)
4. Login
5. See the dashboard

**That's it! You have a working MVP!**

## 📚 What's Working

### Backend APIs
- ✅ User registration & login
- ✅ JWT token management
- ✅ User profiles
- ✅ Trip CRUD operations
- ✅ Budget validation (shows warnings)
- ✅ Placeholder flight/hotel/places/weather endpoints

### Frontend Features
- ✅ Register/login forms
- ✅ Protected routes
- ✅ Navigation
- ✅ Auth state persistence
- ✅ API integration
- ✅ Responsive design
- ✅ PWA ready

## 🔧 Next Steps

### Get Real Data (Optional)

1. **Google APIs**: Get from https://console.cloud.google.com
2. **Amadeus API**: Register at https://developers.amadeus.com
3. **OpenWeather**: Sign up at https://openweathermap.org
4. **OpenAI/Gemini**: For AI trip planning

Add keys to `backend/.env` and implement the service stubs in:
- `backend/app/services/flight_service.py`
- `backend/app/services/hotel_service.py`
- `backend/app/services/places_service.py`
- `backend/app/services/weather_service.py`
- `backend/app/services/ai_service.py`

### Build UI Components

Start with trip search form in:
- `frontend/src/pages/TripSearch.tsx`
- `frontend/src/components/TripForm.tsx`

### Test API Endpoints

Open http://localhost:8000/docs and try endpoints!

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Check Python version (need 3.10+)
python --version

# Try reinstalling
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app/main.py
```

### Frontend won't start?
```bash
# Check Node version (need 18+)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### CORS error?
The backend is configured for http://localhost:5173
Make sure both are running on these ports

### "Port already in use"?
```bash
# Find and kill process
lsof -i :8000  # for port 8000
kill -9 <PID>
```

## 📁 Key Files

```
Backend:
- backend/app/main.py           ← FastAPI entry point
- backend/app/core/security.py  ← Auth logic
- backend/app/routes/ai.py      ← AI endpoint
- backend/app/services/         ← API integrations

Frontend:
- frontend/src/App.tsx          ← Routes & layout
- frontend/src/pages/           ← Page components
- frontend/src/services/api.ts  ← API client
- frontend/src/stores/          ← State management
```

## ✨ Features Overview

### Authentication
- Register with email/password
- Login with JWT tokens
- Refresh tokens
- Protected routes
- Logout

### Trip Planning
- Create trips with source/destination
- Date range selection
- Budget specification
- Travel preferences
- Budget validation (shows if unrealistic)

### Database
- User accounts
- Trips and itineraries
- Search history
- Saved places

### API Integration Ready
- Flights (Amadeus)
- Hotels (Booking.com/Amadeus)
- Attractions (Google Places)
- Weather (OpenWeather)
- AI (OpenAI/Gemini)

## 🚀 Deployment

When ready to deploy:

**Frontend** → Vercel (git push to GitHub, auto-deploys)
**Backend** → Render (git push, configure env vars)
**Database** → Supabase (free PostgreSQL)

See docs/SETUP.md for detailed deployment guide

## 💬 Questions?

- API docs: http://localhost:8000/docs
- Code comments throughout codebase
- Check error messages in terminal
- Review README.md for full overview

---

## Summary

You now have:
✅ Working authentication system
✅ Database with all models
✅ Frontend and backend connected
✅ Ready for API integration
✅ PWA capable
✅ Production structure

**Start building! 🎉**
