from datetime import date, datetime, timedelta
import logging
import httpx
import math
from typing import Optional
from core.config import settings

logger = logging.getLogger(__name__)

class TravelPayoutsFlightProvider:
    """TravelPayouts flight search provider."""

    def __init__(self):
        self.api_token = settings.TRAVELPAYOUTS_API_TOKEN
        self.base_url = settings.TRAVELPAYOUTS_BASE_URL.rstrip("/")
        self._city_code_cache: dict[str, Optional[str]] = {}

    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    async def _geocode_city(self, city_name: str) -> Optional[tuple]:
        url = "https://nominatim.openstreetmap.org/search"
        params = {"q": city_name, "format": "json", "limit": 1}
        headers = {"User-Agent": "TravelAIPWA/1.0 (sanga@users.noreferrer.github.com)"}
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, headers=headers, timeout=6.0)
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        return float(data[0]["lat"]), float(data[0]["lon"])
            return None
        except Exception:
            return None

    def _estimate_duration(self, origin: str, destination: str) -> str:
        origin_coords = None
        dest_coords = None
        try:
            origin_coords = self._geocode_city_sync(origin)
            dest_coords = self._geocode_city_sync(destination)
        except Exception:
            origin_coords = None
            dest_coords = None

        lat1, lon1 = origin_coords if origin_coords else (19.0760, 72.8777)
        lat2, lon2 = dest_coords if dest_coords else (28.6139, 77.2090)
        distance_km = self._haversine_distance(lat1, lon1, lat2, lon2)
        duration_hours = (distance_km / 800.0) + 0.5
        duration_mins = int(duration_hours * 60)
        hrs = duration_mins // 60
        mins = duration_mins % 60
        return f"{hrs}h {mins}m" if hrs > 0 else f"{mins}m"

    def _geocode_city_sync(self, city_name: str) -> Optional[tuple]:
        return None

    def _extract_time(self, iso_value: str | None) -> str:
        if not iso_value:
            return "00:00"
        try:
            normalized = iso_value.replace("Z", "+00:00")
            return datetime.fromisoformat(normalized).strftime("%H:%M")
        except Exception:
            if "T" in iso_value:
                return iso_value.split("T", 1)[1][:5]
            return "00:00"

    def _iter_city_records(self, payload):
        if isinstance(payload, list):
            return payload
        if isinstance(payload, dict):
            if isinstance(payload.get("data"), list):
                return payload["data"]
            if isinstance(payload.get("cities"), list):
                return payload["cities"]
        return []

    async def _resolve_iata_code(self, city_name: str) -> Optional[str]:
        clean_name = city_name.strip()
        if len(clean_name) == 3 and clean_name.isalpha() and clean_name.isupper():
            return clean_name

        cache_key = clean_name.lower()
        if cache_key in self._city_code_cache:
            return self._city_code_cache[cache_key]

        if not self.api_token:
            return None

        headers = {"x-access-token": self.api_token}
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/data/cities.json", headers=headers, timeout=12.0)
            if response.status_code != 200:
                return None

            for record in self._iter_city_records(response.json()):
                name = str(record.get("name") or record.get("city_name") or record.get("city") or "")
                code = record.get("code") or record.get("iata") or record.get("city_code") or record.get("cityCode")
                translations = record.get("name_translations") or {}
                if isinstance(translations, dict):
                    translated_values = [str(value).lower() for value in translations.values() if value]
                else:
                    translated_values = []

                haystack = [name.lower()] + translated_values
                if clean_name.lower() == name.lower() or any(clean_name.lower() in item for item in haystack):
                    if code:
                        resolved = str(code).upper()
                        self._city_code_cache[cache_key] = resolved
                        return resolved

            self._city_code_cache[cache_key] = None
            return None
        except Exception:
            return None

    def _normalize_result_items(self, payload):
        if isinstance(payload, list):
            return payload
        if isinstance(payload, dict):
            if isinstance(payload.get("data"), list):
                return payload["data"]
            if isinstance(payload.get("prices"), dict):
                return list(payload["prices"].values())
            if isinstance(payload.get("prices"), list):
                return payload["prices"]
        return []

    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: date,
        return_date: date = None,
        travellers: int = 1,
    ) -> list:
        if not self.api_token:
            return []

        origin_code = await self._resolve_iata_code(origin)
        destination_code = await self._resolve_iata_code(destination)

        if not origin_code or not destination_code:
            return []

        params = {
            "origin": origin_code,
            "destination": destination_code,
            # Use full date (YYYY-MM-DD) — TravelPayouts expects full departure dates
            "depart_date": departure_date.strftime("%Y-%m-%d"),
            "token": self.api_token,
        }
        if return_date:
            params["return_date"] = return_date.strftime("%Y-%m-%d")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/v1/prices/direct", params=params, timeout=15.0)

            if response.status_code != 200:
                logger.error(f"TravelPayouts flight search failed: {response.text}")
                return []
            # Compute a simple distance-based base price to sanity-check returned fares
            origin_coords = await self._geocode_city(origin)
            dest_coords = await self._geocode_city(destination)
            lat1, lon1 = origin_coords if origin_coords else (19.0760, 72.8777)
            lat2, lon2 = dest_coords if dest_coords else (28.6139, 77.2090)
            distance_km = self._haversine_distance(lat1, lon1, lat2, lon2)
            base_price_estimate = 2500 + int(distance_km * 4.5)

            results = []
            duration_str = self._estimate_duration(origin, destination)
            for index, item in enumerate(self._normalize_result_items(response.json())):
                if not isinstance(item, dict):
                    continue

                price_value = item.get("price")
                try:
                    try:
                        price = float(price_value)
                    except Exception:
                        # Skip invalid price entries
                        continue
                except (TypeError, ValueError):
                    continue

                airline = item.get("airline_name") or item.get("airline") or "TravelPayouts"
                flight_number = item.get("flight_number")
                departure_at = item.get("departure_at")
                return_at = item.get("return_at")
                transfers = item.get("transfers")

                # Sanity check: if provider price is unrealistically high compared to distance-based estimate,
                # fall back to a conservative estimate. This avoids outrageous values for short domestic routes.
                if price > max(1, base_price_estimate) * 8:
                    # fallback price per traveller
                    safe_price = int(max(base_price_estimate * 1.1, 2000) * max(travellers, 1))
                else:
                    safe_price = round(price * max(travellers, 1), 2)

                results.append({
                    "id": f"travelpayouts_flight_{index}_{origin_code}_{destination_code}",
                    "airline": airline,
                    "origin": origin_code,
                    "destination": destination_code,
                    "departure_time": self._extract_time(departure_at),
                    "arrival_time": self._extract_time(return_at) if return_at else self._extract_time(departure_at),
                    "duration": duration_str,
                    "stops": int(transfers) if isinstance(transfers, (int, float)) else 0,
                    "price": safe_price,
                    "currency": item.get("currency") or "USD",
                    "external_url": f"https://www.google.com/flights?q=flights+from+{origin}+to+{destination}+on+{departure_date}"
                    if flight_number is None else f"https://www.aviasales.com/search/{origin_code}{departure_date.strftime('%Y%m%d')}{destination_code}1",
                })

            return results
        except Exception as e:
            logger.error(f"TravelPayouts flight provider failed: {str(e)}")
            return []

class FlightService:
    """
    Flight search service.
    Integrates with TravelPayouts when configured, and falls back to a high-fidelity
    real-distance mathematical scheduler engine if the token is blank.
    """
    
    def __init__(self):
        self.travelpayouts_provider = TravelPayoutsFlightProvider()
        self.skyscanner_key = settings.SKYSCANNER_API_KEY
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate direct distance in km between two coordinates"""
        R = 6371.0  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    async def _geocode_city(self, city_name: str) -> Optional[tuple]:
        """Geocode city using Nominatim keylessly"""
        url = "https://nominatim.openstreetmap.org/search"
        params = {"q": city_name, "format": "json", "limit": 1}
        headers = {"User-Agent": "TravelAIPWA/1.0 (sanga@users.noreferrer.github.com)"}
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, headers=headers, timeout=6.0)
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        return float(data[0]["lat"]), float(data[0]["lon"])
            return None
        except Exception:
            return None

    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: date,
        return_date: date = None,
        travellers: int = 1
    ) -> list:
        """
        Search flights. Uses Amadeus if keys are present, otherwise uses keyless distance-based simulator.
        """
        try:
            if settings.TRAVELPAYOUTS_API_TOKEN:
                logger.info("Using live TravelPayouts flight search...")
                flights = await self.travelpayouts_provider.search_flights(
                    origin=origin,
                    destination=destination,
                    departure_date=departure_date,
                    return_date=return_date,
                    travellers=travellers,
                )
                if flights:
                    return flights

            # ========================================================
            # HIGH-FIDELITY KEYLESS HAversine FLIGHT SCHEDULER ENGINE
            # ========================================================
            logger.info("No TravelPayouts token found or no live flights returned. Generating real-distance keyless flight schedules...")
            
            origin_coords = await self._geocode_city(origin)
            dest_coords = await self._geocode_city(destination)
            
            lat1, lon1 = origin_coords if origin_coords else (19.0760, 72.8777)  # default Bombay
            lat2, lon2 = dest_coords if dest_coords else (28.6139, 77.2090)    # default Delhi
            
            distance_km = self._haversine_distance(lat1, lon1, lat2, lon2)
            
            # Flight duration estimation: commercial jet speed (800 km/h) + 30 mins taxi buffer
            duration_hours = (distance_km / 800.0) + 0.5
            duration_mins = int(duration_hours * 60)
            
            hrs = duration_mins // 60
            mins = duration_mins % 60
            duration_str = f"{hrs}h {mins}m" if hrs > 0 else f"{mins}m"
            
            # Realistic price based on distance (base 2500 INR + 4.5 INR per km)
            base_price = 2500 + int(distance_km * 4.5)
            
            # Schedule 3 daily flights (morning, afternoon, evening)
            airlines = ["IndiGo", "Air India", "Vistara"]
            schedules = [
                {"dept": "07:15", "arr": "09:30", "airline": "IndiGo", "price_mod": 0.95},
                {"dept": "13:30", "arr": "15:45", "airline": "Air India", "price_mod": 1.05},
                {"dept": "19:00", "arr": "21:15", "airline": "Vistara", "price_mod": 1.15}
            ]
            
            simulated_flights = []
            for i, sched in enumerate(schedules):
                # Calculate arrival time dynamically
                dept_dt = datetime.strptime(sched["dept"], "%H:%M")
                arr_dt = dept_dt + timedelta(minutes=duration_mins)
                arr_str = arr_dt.strftime("%H:%M")
                
                final_price = int(base_price * sched["price_mod"] * travellers)
                
                simulated_flights.append({
                    "id": f"sim_flight_{origin.lower()}_{destination.lower()}_{i}",
                    "airline": sched["airline"],
                    "origin": origin.upper()[:3],
                    "destination": destination.upper()[:3],
                    "departure_time": sched["dept"],
                    "arrival_time": arr_str,
                    "duration": duration_str,
                    "stops": 0 if distance_km < 3000 else 1,
                    "price": final_price,
                    "currency": "INR",
                    "external_url": f"https://www.google.com/flights?q=flights+from+{origin}+to+{destination}+on+{departure_date}"
                })
            
            return simulated_flights
            
        except Exception as e:
            logger.error(f"Flight search service error: {str(e)}")
            return []
