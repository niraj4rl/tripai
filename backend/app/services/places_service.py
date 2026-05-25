import logging
from core.config import settings

logger = logging.getLogger(__name__)

from integrations.osm_places_client import OSMPlacesClient
from integrations.foursquare_client import FoursquareClient

class PlacesService:
    """
    Places and attractions service
    Integrates with Google Places API
    """
    
    def __init__(self):
        # Prefer Foursquare when configured, otherwise fall back to OpenStreetMap (no API key required)
        if settings.FOURSQUARE_API_KEY:
            self.places_client = FoursquareClient(api_key=settings.FOURSQUARE_API_KEY, base_url=settings.FOURSQUARE_BASE_URL)
        else:
            self.places_client = OSMPlacesClient()
    
    async def search_places(
        self,
        query: str,
        location: str,
        radius: int = 5000
    ) -> list:
        """
        Search for places by query and location using real API.
        """
        try:
            # If using Foursquare, its client will handle missing key checks. If not, OSM fallback is keyless.
            if not settings.FOURSQUARE_API_KEY and hasattr(self.places_client, 'geocode_location'):
                # Try geocoding the location and performing nearby searches per interest/query
                coords = await self.places_client.geocode_location(location)
                if coords:
                    # If query looks like comma-separated interests, split and search nearby
                    queries = [q.strip() for q in query.split(',')] if ',' in query else [query]
                    all_places = []
                    for q in queries:
                        try:
                            nearby = await self.places_client.get_nearby_places(latitude=coords['lat'], longitude=coords['lon'], place_type=q.strip(), radius=radius)
                            if nearby:
                                all_places.extend(nearby)
                        except Exception:
                            continue
                    if all_places:
                        # dedupe
                        seen = set()
                        unique = []
                        for p in all_places:
                            key = (p.get('name'), p.get('address'))
                            if key not in seen:
                                seen.add(key)
                                unique.append(p)
                        return unique

            return await self.places_client.search_places(
                query=query,
                location=location,
                radius=radius
            )
            
        except Exception as e:
            logger.error(f"Places search service error: {str(e)}")
            return []
    
    async def get_place_details(self, place_id: str) -> dict:
        """Get detailed information about a place"""
        try:
            # OSM fallback requires no API key; proceed to fetch details from the chosen client
            pass
            
            return await self.places_client.get_place_details(place_id)
        except Exception as e:
            logger.error(f"Failed to get place details in service: {str(e)}")
            return {}
    
    async def get_nearby_places(
        self,
        latitude: float,
        longitude: float,
        place_type: str = "restaurant",
        radius: int = 1000
    ) -> list:
        """Get nearby places by coordinates using Google Places Nearby Search"""
        try:
            # OSM fallback requires no API key; proceed to fetch nearby places from the chosen client
            pass
            
            return await self.places_client.get_nearby_places(
                latitude=latitude,
                longitude=longitude,
                place_type=place_type,
                radius=radius
            )
        except Exception as e:
            logger.error(f"Nearby places search error in service: {str(e)}")
            return []
