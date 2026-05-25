from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from sqlalchemy.exc import SQLAlchemyError

from core.database import Base, engine, SessionLocal
from core.config import settings
from routes import auth, users, trips, flights, hotels, places, weather, ai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
    except SQLAlchemyError as exc:
        logger.warning(f"Skipping database initialization: {exc}")
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="AI Trip Planner API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
# Ensure common local dev origins are allowed even if .env parsing differs
allow_origins = list(dict.fromkeys(list(settings.CORS_ORIGINS) + [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("Configured CORS origins: %s", allow_origins)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(flights.router, prefix="/api/flights", tags=["flights"])
app.include_router(hotels.router, prefix="/api/hotels", tags=["hotels"])
app.include_router(places.router, prefix="/api/places", tags=["places"])
app.include_router(weather.router, prefix="/api/weather", tags=["weather"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {
        "message": "AI Trip Planner API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
