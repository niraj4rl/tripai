from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date

from core.database import get_db
from services.weather_service import WeatherService

router = APIRouter()

@router.get("/forecast")
async def get_weather_forecast(
    destination: str = Query(..., description="City name"),
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get weather forecast for a destination
    
    Example: /api/weather/forecast?destination=Mumbai&start_date=2024-12-15&end_date=2024-12-18
    """
    try:
        service = WeatherService()
        forecast = await service.get_forecast(
            destination=destination,
            start_date=start_date,
            end_date=end_date
        )
        return {
            "status": "success",
            "destination": destination,
            "period": f"{start_date} to {end_date}",
            "forecast": forecast
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Weather forecast failed: {str(e)}"
        )

@router.get("/current")
async def get_current_weather(
    destination: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get current weather for a destination"""
    try:
        service = WeatherService()
        weather = await service.get_current_weather(destination)
        return {
            "status": "success",
            "destination": destination,
            "weather": weather
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch weather: {str(e)}"
        )
