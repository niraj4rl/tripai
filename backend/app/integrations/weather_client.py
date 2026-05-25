import httpx
import logging
from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Optional
from core.config import settings

logger = logging.getLogger(__name__)

class WeatherClient:
    """
    Client for OpenWeatherMap API.
    Resolves city coordinates and returns detailed forecasts & daily aggregates.
    """
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org"

    async def get_coordinates(self, city_name: str) -> Optional[tuple]:
        """Resolve city name to (latitude, longitude) using OpenWeather Geocoding API"""
        if not self.api_key:
            logger.warning("OpenWeather API Key is missing. Geocoding skipped.")
            return None

        url = f"{self.base_url}/geo/1.0/direct"
        params = {
            "q": city_name,
            "limit": 1,
            "appid": self.api_key
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        return float(data[0]["lat"]), float(data[0]["lon"])
            return None
        except Exception as e:
            logger.error(f"Failed to geocode '{city_name}' with OpenWeather: {str(e)}")
            return None

    async def get_forecast(
        self,
        destination: str,
        start_date: str,
        end_date: str
    ) -> List[dict]:
        """
        Fetch 5-day forecast and aggregate daily weather profiles for date range.
        """
        if not self.api_key:
            logger.warning("OpenWeather API Key is missing. Forecast fetch skipped.")
            return []

        coords = await self.get_coordinates(destination)
        if not coords:
            logger.error(f"Could not resolve coordinates for weather: {destination}")
            return []

        lat, lon = coords
        url = f"{self.base_url}/data/2.5/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "units": "metric",
            "appid": self.api_key
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                if response.status_code != 200:
                    logger.error(f"OpenWeather Forecast failed: {response.text}")
                    return []

                res_data = response.json()
                forecast_list = res_data.get("list", [])
                
                # Group 3-hour forecasts by date YYYY-MM-DD
                daily_raw = defaultdict(list)
                for entry in forecast_list:
                    dt_txt = entry.get("dt_txt", "") # "2026-05-24 12:00:00"
                    if dt_txt:
                        date_str = dt_txt.split(" ")[0]
                        daily_raw[date_str].append(entry)

                aggregated_forecasts = []
                for date_str, entries in sorted(daily_raw.items()):
                    # Only return weather within the requested trip range if specified
                    if start_date <= date_str <= end_date:
                        temps = [e["main"]["temp"] for e in entries if "main" in e]
                        humidities = [e["main"]["humidity"] for e in entries if "main" in e]
                        wind_speeds = [e["wind"]["speed"] for e in entries if "wind" in e]
                        rain_probs = [e.get("pop", 0) for e in entries] # Probability of precipitation (0 to 1)

                        # Find dominant weather condition
                        conditions = []
                        for e in entries:
                            weather = e.get("weather", [])
                            if weather:
                                conditions.append(weather[0].get("main", "Clear"))
                        
                        dominant_condition = max(set(conditions), key=conditions.count) if conditions else "Clear"

                        aggregated_forecasts.append({
                            "date": date_str,
                            "temperature_max": round(max(temps), 1) if temps else 25.0,
                            "temperature_min": round(min(temps), 1) if temps else 20.0,
                            "condition": dominant_condition,
                            "rain_probability": int(max(rain_probs) * 100) if rain_probs else 0,
                            "humidity": int(sum(humidities) / len(humidities)) if humidities else 60,
                            "wind_speed": round(sum(wind_speeds) / len(wind_speeds), 1) if wind_speeds else 10.0,
                            "warning": "High UV index" if dominant_condition == "Clear" else None
                        })
                
                return aggregated_forecasts

        except Exception as e:
            logger.error(f"Error fetching OpenWeather forecast: {str(e)}")
            return []

    async def get_current_weather(self, destination: str) -> dict:
        """
        Fetch current weather conditions.
        """
        if not self.api_key:
            logger.warning("OpenWeather API Key is missing. Current weather skipped.")
            return {}

        coords = await self.get_coordinates(destination)
        if not coords:
            return {}

        lat, lon = coords
        url = f"{self.base_url}/data/2.5/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "units": "metric",
            "appid": self.api_key
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                if response.status_code != 200:
                    logger.error(f"OpenWeather Current failed: {response.text}")
                    return {}

                data = response.json()
                main = data.get("main", {})
                wind = data.get("wind", {})
                weather = data.get("weather", [])
                condition = weather[0].get("main", "Clear") if weather else "Clear"

                return {
                    "destination": destination,
                    "temperature": round(main.get("temp", 25.0), 1),
                    "condition": condition,
                    "humidity": int(main.get("humidity", 60)),
                    "wind_speed": round(wind.get("speed", 10.0), 1),
                    "rain_probability": 0, # Current doesn't directly offer probability of precipitation
                    "feels_like": round(main.get("feels_like", 25.0), 1),
                    "uv_index": 5, # Standard forecast fallback
                    "visibility": "Good" if data.get("visibility", 10000) >= 8000 else "Moderate",
                    "last_updated": "Just now"
                }
        except Exception as e:
            logger.error(f"Error getting OpenWeather current: {str(e)}")
            return {}
