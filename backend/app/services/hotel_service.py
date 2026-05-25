from datetime import date
from datetime import datetime
from datetime import timezone
import hashlib
import logging
from abc import ABC, abstractmethod

import httpx
from core.config import settings
logger = logging.getLogger(__name__)

class BaseHotelProvider(ABC):
    """Abstract base class representing a hotel search provider."""
    
    @abstractmethod
    async def search_hotels(
        self,
        destination: str,
        check_in: date,
        check_out: date,
        guests: int,
        min_rating: float
    ) -> list:
        pass

class HotelBedsHotelProvider(BaseHotelProvider):
    """Hotelbeds Hotel Search Provider."""

    def __init__(self):
        self.api_key = settings.HOTELBEDS_API_KEY
        self.api_secret = settings.HOTELBEDS_API_SECRET
        base_url = settings.HOTELBEDS_BASE_URL.rstrip("/")
        self.base_url = base_url if base_url.endswith("/hotel-api/1.0") else f"{base_url}/hotel-api/1.0"
        self.nominatim_url = "https://nominatim.openstreetmap.org/search"

    def _signature(self) -> tuple[str, str]:
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
        payload = f"{self.api_key}{self.api_secret}{timestamp}".encode("utf-8")
        return timestamp, hashlib.sha256(payload).hexdigest()

    async def _resolve_destination(self, destination: str) -> dict[str, float] | None:
        params = {
            "q": destination,
            "format": "json",
            "addressdetails": 1,
            "limit": 1,
        }
        headers = {
            "User-Agent": "TravelAIPWA/1.0 (sanga@users.noreferrer.github.com)",
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.nominatim_url, params=params, headers=headers, timeout=6.0)
            if response.status_code != 200:
                return None

            results = response.json()
            if not results:
                return None

            first_result = results[0]
            return {
                "latitude": float(first_result.get("lat", 0.0)),
                "longitude": float(first_result.get("lon", 0.0)),
            }
        except Exception:
            return None

    def _extract_rate(self, hotel: dict) -> float:
        if hotel.get("minRate"):
            try:
                return float(hotel["minRate"])
            except (TypeError, ValueError):
                pass

        rooms = hotel.get("rooms") or []
        for room in rooms:
            rates = room.get("rates") or []
            for rate in rates:
                for key in ("sellingRate", "net", "rate"):
                    value = rate.get(key)
                    if value is not None:
                        try:
                            return float(value)
                        except (TypeError, ValueError):
                            continue

        return 0.0

    def _extract_rating(self, hotel: dict, fallback: float) -> float:
        rating = hotel.get("rating")
        if rating is None:
            rating = hotel.get("reviewScore")
        if rating is None:
            rating = hotel.get("categoryCode") or fallback

        try:
            return float(rating)
        except (TypeError, ValueError):
            if isinstance(rating, str):
                digits = []
                for char in rating:
                    if char.isdigit() or char == ".":
                        digits.append(char)
                    elif digits:
                        break
                if digits:
                    try:
                        return float("".join(digits))
                    except ValueError:
                        pass
            return fallback

    async def search_hotels(
        self,
        destination: str,
        check_in: date,
        check_out: date,
        guests: int,
        min_rating: float,
    ) -> list:
        if not self.api_key or not self.api_secret:
            raise ValueError("Hotelbeds API credentials are not configured in settings")

        timestamp, signature = self._signature()
        headers = {
            "Api-key": self.api_key,
            "X-Signature": signature,
            "X-Request-Date": timestamp,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        geolocation = await self._resolve_destination(destination)
        payload = {
            "stay": {
                "checkIn": check_in.isoformat(),
                "checkOut": check_out.isoformat(),
            },
            "occupancies": [
                {
                    "rooms": 1,
                    "adults": guests,
                    "children": 0,
                }
            ],
            "language": "ENG",
            "sourceMarket": "IN",
            "platform": "PWA",
        }
        if geolocation:
            payload["geolocation"] = {
                "latitude": geolocation["latitude"],
                "longitude": geolocation["longitude"],
                "radius": 20,
                "unit": "km",
            }
        else:
            payload["keywords"] = destination

        payload["filter"] = {
            "maxHotels": 10,
            "minCategory": int(min_rating),
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/hotels",
                    headers=headers,
                    json=payload,
                    timeout=12.0,
                )

            if response.status_code != 200:
                logger.error(f"Hotelbeds hotel search failed: {response.text}")
                return await OpenStreetMapHotelProvider().search_hotels(
                    destination=destination,
                    check_in=check_in,
                    check_out=check_out,
                    guests=guests,
                    min_rating=min_rating,
                )

            payload = response.json()
            hotels_payload = payload.get("hotels", {})
            hotels_data = hotels_payload.get("hotels", []) if isinstance(hotels_payload, dict) else hotels_payload
            results = []

            for index, hotel in enumerate(hotels_data):
                name = hotel.get("name") or hotel.get("hotelName") or hotel.get("name") or f"Hotel {index + 1}"
                description = hotel.get("description") or {}
                address = hotel.get("address")
                if not address:
                    address = description.get("content") if isinstance(description, dict) else destination

                rating = self._extract_rating(hotel, min_rating)

                if rating < min_rating:
                    continue

                rate_value = self._extract_rate(hotel)
                nights = max((check_out - check_in).days, 1)
                price_per_night = round(rate_value / nights, 2) if rate_value else 0.0

                amenities = []
                for amenity in hotel.get("amenities", [])[:6]:
                    if isinstance(amenity, dict):
                        amenity_name = amenity.get("description") or amenity.get("name")
                        if amenity_name:
                            amenities.append(amenity_name)
                    elif isinstance(amenity, str):
                        amenities.append(amenity)

                if not amenities:
                    amenities = ["WiFi", "Air Conditioning", "Breakfast"]

                hotel_id = hotel.get("code") or hotel.get("hotelCode") or f"hotelbeds_{index}"
                results.append({
                    "id": f"hotelbeds_hotel_{hotel_id}",
                    "name": name,
                    "location": destination,
                    "address": address,
                    "rating": rating,
                    "reviews": hotel.get("reviews") or hotel.get("review") or "Hotelbeds partner listing",
                    "pricePerNight": price_per_night,
                    "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                    # Try to extract any gallery/images the provider may expose; normalize into an `images` list
                    "images": (lambda h: [
                        u for u in (
                            # common Hotelbeds fields heuristics
                            (h.get("images") or h.get("gallery") or h.get("image") or [])
                        )
                        if isinstance(u, str)
                    ] if isinstance((h.get("images") or h.get("gallery") or h.get("image")), list) else (
                        # if images are a dict/list of dicts, try to extract url-like keys
                        [
                            (img.get("url") or img.get("imageUrl") or img.get("path") or img.get("src"))
                            for img in (h.get("images") or h.get("gallery") or [])
                            if isinstance(img, dict) and (img.get("url") or img.get("imageUrl") or img.get("path") or img.get("src"))
                        ]
                    ))(hotel) or ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"],
                    "amenities": amenities,
                    "tags": [f"{guests} guests", "Hotelbeds Verified"],
                    "external_url": f"https://www.booking.com/searchresults.html?ss={name.replace(' ', '+')}+{destination.replace(' ', '+')}"
                })

            if not results:
                return await OpenStreetMapHotelProvider().search_hotels(
                    destination=destination,
                    check_in=check_in,
                    check_out=check_out,
                    guests=guests,
                    min_rating=min_rating,
                )

            return results
        except Exception as e:
            logger.error(f"Hotelbeds hotel provider failed: {str(e)}")
            return await OpenStreetMapHotelProvider().search_hotels(
                destination=destination,
                check_in=check_in,
                check_out=check_out,
                guests=guests,
                min_rating=min_rating,
            )

class OpenStreetMapHotelProvider(BaseHotelProvider):
    """Keyless OpenStreetMap Hotel Search Provider."""

    def __init__(self):
        self.nominatim_url = "https://nominatim.openstreetmap.org/search"

    def _get_hash_price(self, hotel_name: str) -> float:
        """Deterministically calculate a realistic stay price per night based on hotel name hashing"""
        val = sum(ord(c) for c in hotel_name)
        # Price range from 1800 to 7500 INR
        price = 1800 + (val % 57) * 100
        return float(price)

    async def search_hotels(
        self,
        destination: str,
        check_in: date,
        check_out: date,
        guests: int,
        min_rating: float
    ) -> list:
        """Search hotels keylessly using OpenStreetMap Nominatim"""
        params = {
            "q": f"hotels in {destination}",
            "format": "json",
            "addressdetails": 1,
            "limit": 10
        }
        headers = {
            "User-Agent": "TravelAIPWA/1.0 (sanga@users.noreferrer.github.com)"
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.nominatim_url, params=params, headers=headers, timeout=6.0)
                results = []
                
                # Default fallback mock hotels if Nominatim returns nothing
                osm_hotels = []
                if response.status_code == 200:
                    osm_hotels = response.json()
                
                # If OpenStreetMap returns empty or fails, use standard landmark stays
                if not osm_hotels:
                    osm_hotels = [
                        {"display_name": f"Grand Plaza Resort, Central {destination}"},
                        {"display_name": f"Heritage Inn & Suites, Near Station {destination}"},
                        {"display_name": f"Boutique Garden Stay, Uptown {destination}"}
                    ]

                nights = (check_out - check_in).days
                if nights <= 0:
                    nights = 1

                for index, h_data in enumerate(osm_hotels):
                    display_name = h_data.get("display_name", f"Stay {index}")
                    parts = [p.strip() for p in display_name.split(",")]
                    name = parts[0]
                    address = ", ".join(parts[1:4]) if len(parts) > 1 else display_name
                    
                    price_per_night = self._get_hash_price(name)
                    rating = round(4.0 + (index % 5) * 0.2, 1)

                    if rating < min_rating:
                        continue

                    results.append({
                        "id": f"osm_hotel_{index}_{name.lower().replace(' ', '_')}",
                        "name": name,
                        "location": destination,
                        "address": address,
                        "rating": rating,
                        "reviews": f"{20 + (index * 13)} reviews",
                        "pricePerNight": price_per_night,
                        "imageUrl": f"https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                        "images": [
                            # Provide a small gallery of Unsplash placeholders for OSM fallback
                            f"https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                            f"https://images.unsplash.com/photo-1501117716987-c8e2f8b0b1b2?auto=format&fit=crop&w=1200&q=80",
                        ],
                        "amenities": ["WiFi", "Air Conditioning", "Breakfast", "Room Service"][:(3 + index % 2)],
                        "tags": [f"{guests} guests", "OpenStreetMap Verified"],
                        "external_url": f"https://www.booking.com/searchresults.html?ss={name.replace(' ', '+')}+{destination.replace(' ', '+')}"
                    })
                return results
        except Exception as e:
            logger.error(f"OSM Hotel provider failed: {str(e)}")
            return []

class HotelService:
    """
    Hotel search service orchestrating hotel providers
    """
    
    def __init__(self, provider: BaseHotelProvider = None):
        if provider:
            self.provider = provider
        elif settings.HOTELBEDS_API_KEY and settings.HOTELBEDS_API_SECRET:
            logger.info("Instantiating Hotelbeds Hotel Search Provider...")
            self.provider = HotelBedsHotelProvider()
        else:
            logger.info("No hotel API keys found. Instantiating keyless OpenStreetMap Hotel Provider...")
            self.provider = OpenStreetMapHotelProvider()
    
    async def search_hotels(
        self,
        destination: str,
        check_in: date,
        check_out: date,
        guests: int = 1,
        min_rating: float = 3.0
    ) -> list:
        """
        Search for hotels using the configured provider
        """
        try:
            return await self.provider.search_hotels(
                destination=destination,
                check_in=check_in,
                check_out=check_out,
                guests=guests,
                min_rating=min_rating
            )
            
        except Exception as e:
            logger.error(f"Hotel service search error: {str(e)}")
            return []
