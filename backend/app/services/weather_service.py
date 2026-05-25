from datetime import date
import logging
from core.config import settings

logger = logging.getLogger(__name__)

from integrations.weather_client import WeatherClient

class WeatherService:
    """
    Weather forecast service
    Integrates with OpenWeatherMap API
    """
    
    def __init__(self):
        self.weather_client = WeatherClient()
    
    async def get_forecast(
        self,
        destination: str,
        start_date: date,
        end_date: date
    ) -> list:
        """
        Get weather forecast for date range using real API.
        """
        try:
            if not settings.OPENWEATHER_API_KEY:
                logger.warning("OpenWeather API Key is missing. Returning empty weather forecast.")
                return []
            
            start_date_str = start_date.isoformat()
            end_date_str = end_date.isoformat()
            
            return await self.weather_client.get_forecast(
                destination=destination,
                start_date=start_date_str,
                end_date=end_date_str
            )
            
        except Exception as e:
            logger.error(f"Weather forecast service error: {str(e)}")
            return []
    
    async def get_current_weather(self, destination: str) -> dict:
        """Get current weather for destination using real API"""
        try:
            if not settings.OPENWEATHER_API_KEY:
                logger.warning("OpenWeather API Key is missing. Returning empty current weather.")
                return {}
            
            return await self.weather_client.get_current_weather(destination)
        except Exception as e:
            logger.error(f"Current weather service error: {str(e)}")
            return {}
