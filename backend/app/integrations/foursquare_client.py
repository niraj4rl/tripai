import httpx
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class FoursquareClient:
    """Minimal Foursquare Places client used when FOURSQUARE_API_KEY is present."""

    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://api.foursquare.com"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": self.api_key or "",
            "Accept": "application/json",
        }

    def _format_address(self, location: dict) -> str:
        formatted_address = location.get("formatted_address")
        if isinstance(formatted_address, str):
            return formatted_address
        if isinstance(formatted_address, list):
            return ", ".join(str(item) for item in formatted_address if item)
        address = location.get("address")
        if isinstance(address, str):
            return address
        return ""

    async def search_places(self, query: str, location: str, radius: int = 5000) -> List[Dict]:
        """Search places using Foursquare Places Search endpoint.

        `location` is a free-text city or area; we pass it as `near` parameter.
        """
        url = f"{self.base_url}/v3/places/search"
        params = {"query": query, "near": location, "radius": radius, "limit": 10}
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, params=params, timeout=12.0)
            if response.status_code != 200:
                logger.error(f"Foursquare search failed: {response.status_code} {response.text}")
                return []

            data = response.json()
            results = []
            for idx, item in enumerate(data.get("results", [])):
                geocodes = item.get("geocodes", {})
                main_geo = geocodes.get("main", {})
                lat = main_geo.get("latitude") or 0.0
                lng = main_geo.get("longitude") or 0.0

                categories = item.get("categories") or []
                category = categories[0].get("name") if categories else query

                results.append({
                    "place_id": item.get("fsq_id"),
                    "name": item.get("name"),
                    "address": self._format_address(item.get("location", {}) or {}),
                    "rating": item.get("rating") or 4.0,
                    "reviews": item.get("stats", {}).get("total_ratings") if item.get("stats") else 0,
                    "category": category,
                    "photo_url": "",
                    "lat": lat,
                    "lng": lng,
                    "map_url": item.get("location", {}).get("formatted_address", "") or f"https://www.openstreetmap.org/?mlat={lat}&mlon={lng}"
                })
            return results
        except Exception as e:
            logger.error(f"Foursquare client search error: {str(e)}")
            return []

    async def get_place_details(self, place_id: str) -> Dict:
        url = f"{self.base_url}/v3/places/{place_id}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=12.0)
            if response.status_code != 200:
                logger.error(f"Foursquare details failed: {response.status_code} {response.text}")
                return {}

            item = response.json()
            geocodes = item.get("geocodes", {})
            main_geo = geocodes.get("main", {})
            lat = main_geo.get("latitude") or 0.0
            lng = main_geo.get("longitude") or 0.0

            return {
                "place_id": item.get("fsq_id"),
                "name": item.get("name"),
                "address": self._format_address(item.get("location", {}) or {}),
                "rating": item.get("rating") or 4.0,
                "reviews_count": item.get("stats", {}).get("total_ratings") if item.get("stats") else 0,
                "description": item.get("description", ""),
                "photos": [],
                "photo_url": "",
                "opening_hours": {},
                "phone": item.get("tel"),
                "website": item.get("website"),
                "map_url": item.get("location", {}).get("formatted_address", "") or f"https://www.openstreetmap.org/?mlat={lat}&mlon={lng}",
                "lat": lat,
                "lng": lng,
                "user_ratings_total": item.get("stats", {}).get("total_ratings") if item.get("stats") else 0,
            }

        except Exception as e:
            logger.error(f"Foursquare details error: {str(e)}")
            return {}

    async def get_nearby_places(self, latitude: float, longitude: float, place_type: str = "restaurant", radius: int = 1000) -> List[Dict]:
        url = f"{self.base_url}/v3/places/search"
        params = {"ll": f"{latitude},{longitude}", "query": place_type, "radius": radius, "limit": 10}
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, params=params, timeout=12.0)
            if response.status_code != 200:
                logger.error(f"Foursquare nearby failed: {response.status_code} {response.text}")
                return []

            data = response.json()
            results = []
            for idx, item in enumerate(data.get("results", [])[:10]):
                geocodes = item.get("geocodes", {})
                main_geo = geocodes.get("main", {})
                lat = main_geo.get("latitude") or latitude
                lng = main_geo.get("longitude") or longitude

                results.append({
                    "place_id": item.get("fsq_id"),
                    "name": item.get("name"),
                    "rating": item.get("rating") or 4.0,
                    "address": self._format_address(item.get("location", {}) or {}),
                    "photo_url": "",
                    "lat": lat,
                    "lng": lng,
                    "map_url": item.get("location", {}).get("formatted_address", "") or f"https://www.openstreetmap.org/?mlat={lat}&mlon={lng}"
                })
            return results
        except Exception as e:
            logger.error(f"Foursquare nearby error: {str(e)}")
            return []
