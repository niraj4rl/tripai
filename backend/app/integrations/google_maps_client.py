import httpx
import logging
from typing import Optional
from core.config import settings

logger = logging.getLogger(__name__)

class GoogleMapsClient:
    """
    Client for Maps Routing.
    Uses open-source OpenStreetMap (Nominatim) for geocoding and OSRM for keyless routing.
    """
    
    def __init__(self):
        self.nominatim_url = "https://nominatim.openstreetmap.org/search"
        self.osrm_url = "http://router.project-osrm.org/route/v1/driving"

    async def _geocode(self, city_name: str) -> Optional[tuple]:
        """Geocode city name using free OpenStreetMap Nominatim API"""
        params = {
            "q": city_name,
            "format": "json",
            "limit": 1
        }
        headers = {
            "User-Agent": "TravelAIPWA/1.0 (sanga@users.noreferrer.github.com)"
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.nominatim_url, params=params, headers=headers, timeout=6.0)
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        return float(data[0]["lat"]), float(data[0]["lon"])
            return None
        except Exception as e:
            logger.error(f"OSM Geocoding failed for '{city_name}': {str(e)}")
            return None

    async def get_distance_and_time(self, origin: str, destination: str) -> dict:
        """
        Query OSRM (Open Source Routing Machine) API.
        Returns real distance and travel time estimates keylessly.
        """
        try:
            # Geocode origin and destination
            origin_coords = await self._geocode(origin)
            dest_coords = await self._geocode(destination)

            if not origin_coords or not dest_coords:
                logger.error(f"Could not resolve geocodes for routing: {origin} -> {destination}")
                return {"distance": "Estimation unavailable", "duration": "Estimation unavailable"}

            origin_lat, origin_lon = origin_coords
            dest_lat, dest_lon = dest_coords

            # OSRM coordinate format: {lon},{lat};{lon},{lat}
            url = f"{self.osrm_url}/{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
            params = {
                "overview": "false"
            }

            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=6.0)
                if response.status_code != 200:
                    logger.error(f"OSRM Routing failed: {response.text}")
                    return {"distance": "Routing unavailable", "duration": "Routing unavailable"}

                data = response.json()
                routes = data.get("routes", [])
                if routes:
                    primary_route = routes[0]
                    # OSRM returns distance in meters, duration in seconds
                    distance_m = primary_route.get("distance", 0.0)
                    duration_s = primary_route.get("duration", 0.0)

                    distance_km = round(distance_m / 1000.0, 1)
                    duration_mins = int(duration_s / 60.0)

                    # Format travel time
                    if duration_mins > 60:
                        hrs = duration_mins // 60
                        mins = duration_mins % 60
                        duration_str = f"{hrs}h {mins}m"
                    else:
                        duration_str = f"{duration_mins} mins"

                    return {
                        "distance": f"{distance_km} km",
                        "duration": duration_str
                    }

            return {"distance": "Route not found", "duration": "Route not found"}

        except Exception as e:
            logger.error(f"Error in OSRM Routing: {str(e)}")
            return {"distance": "Estimation error", "duration": "Estimation error"}

    async def get_directions(self, origin: str, destination: str) -> dict:
        """
        Return open-source OSRM directions path.
        """
        try:
            origin_coords = await self._geocode(origin)
            dest_coords = await self._geocode(destination)

            if not origin_coords or not dest_coords:
                return {}

            origin_lat, origin_lon = origin_coords
            dest_lat, dest_lon = dest_coords

            url = f"{self.osrm_url}/{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
            params = {
                "overview": "full",
                "geometries": "geojson"
            }

            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=6.0)
                if response.status_code == 200:
                    return response.json()
            return {}
        except Exception as e:
            logger.error(f"OSM Directions failed: {str(e)}")
            return {}
