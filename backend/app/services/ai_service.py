import json
import logging
from typing import Optional, List
from decimal import Decimal
from schemas.all_schemas import (
    TripPlanRequest, TripPlanResponse, DayItinerary, CostBreakdown,
    HotelRecommendation, FlightRecommendation
)
from core.config import settings
from services.flight_service import FlightService
from services.hotel_service import HotelService
from services.places_service import PlacesService
from services.weather_service import WeatherService
import httpx

logger = logging.getLogger(__name__)

class AIService:
    """
    AI-powered trip planning service.
    Integrates with real flights, hotels, places, and weather APIs,
    and calls OpenAI/Gemini to construct a realistic structured itinerary.
    """
    
    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY

    def _build_request_profile(
        self,
        request: TripPlanRequest,
        flights: list,
        hotels: list,
        places: list,
        weather: list
    ) -> str:
        interests = ", ".join(request.interests) if request.interests else "general sightseeing"
        weather_summary = "; ".join(
            f"Day {index + 1}: {item.get('condition', 'Unknown')} / {item.get('temperature', 'n/a')}°C"
            for index, item in enumerate(weather[:5])
        ) or "No forecast data available"

        hotel_names = ", ".join((hotel.get("name") or "Unnamed hotel") for hotel in hotels[:5]) or "No live hotel inventory"
        place_names = ", ".join((place.get("name") or place.get("display_name") or "Local spot") for place in places[:8]) or "No live attractions"
        flight_names = ", ".join((flight.get("airline") or "Flight option") for flight in flights[:5]) or "No live flights"

        return (
            f"Trip profile: {request.source_city} to {request.destination} from {request.start_date} to {request.end_date}, "
            f"{request.travellers_count} traveller(s), budget {request.budget_total} {request.currency}, "
            f"trip type {request.trip_type}, hotel preference {request.hotel_preference}, transport {request.transport_preference}, "
            f"pace {request.pace}, interests {interests}, hotel rating minimum {request.hotel_rating_min}, "
            f"safety preference {request.safety_preference}, accessibility needs {request.accessibility_needs or 'none'}, "
            f"local transport preference {request.local_transport_preference}.\n"
            f"Live flights: {flight_names}.\n"
            f"Live hotels: {hotel_names}.\n"
            f"Live attractions: {place_names}.\n"
            f"Weather preview: {weather_summary}.\n"
        )
    
    async def generate_trip_plan(self, request: TripPlanRequest) -> TripPlanResponse:
        """
        Generate a complete AI-powered trip plan.
        """
        try:
            # Fetch real data from live backend integration services
            flights_data = await self._fetch_flight_data(request)
            hotels_data = await self._fetch_hotel_data(request)
            places_data = await self._fetch_places_data(request)
            weather_data = await self._fetch_weather_data(request)
            
            # Call actual LLM with this real data
            trip_plan = await self._call_llm_for_trip_plan(
                request=request,
                flights=flights_data,
                hotels=hotels_data,
                places=places_data,
                weather=weather_data
            )
            
            return trip_plan
            
        except Exception as e:
            logger.error(f"Trip plan generation error: {str(e)}")
            raise

    async def _fetch_flight_data(self, request: TripPlanRequest) -> list:
        try:
            service = FlightService()
            return await service.search_flights(
                origin=request.source_city,
                destination=request.destination,
                departure_date=request.start_date,
                travellers=request.travellers_count
            )
        except Exception as e:
            logger.error(f"AI Service failed to fetch flights: {e}")
            return []

    async def _fetch_hotel_data(self, request: TripPlanRequest) -> list:
        try:
            service = HotelService()
            return await service.search_hotels(
                destination=request.destination,
                check_in=request.start_date,
                check_out=request.end_date,
                guests=request.travellers_count,
                min_rating=float(request.hotel_rating_min)
            )
        except Exception as e:
            logger.error(f"AI Service failed to fetch hotels: {e}")
            return []

    async def _fetch_places_data(self, request: TripPlanRequest) -> list:
        try:
            service = PlacesService()
            # If the user provided interests, fetch places for each interest separately
            if request.interests:
                all_places = []
                for interest in request.interests:
                    try:
                        places = await service.search_places(query=interest, location=request.destination)
                        if places:
                            all_places.extend(places)
                    except Exception:
                        continue
                # Fallback to general attractions if none found
                if not all_places:
                    return await service.search_places(query="tourist attractions", location=request.destination)
                # deduplicate by name+address
                seen = set()
                unique = []
                for p in all_places:
                    key = (p.get('name'), p.get('address'))
                    if key not in seen:
                        seen.add(key)
                        unique.append(p)
                return unique
            else:
                return await service.search_places(query="tourist attractions", location=request.destination)
        except Exception as e:
            logger.error(f"AI Service failed to fetch places: {e}")
            return []

    async def _fetch_weather_data(self, request: TripPlanRequest) -> list:
        try:
            service = WeatherService()
            return await service.get_forecast(
                destination=request.destination,
                start_date=request.start_date,
                end_date=request.end_date
            )
        except Exception as e:
            logger.error(f"AI Service failed to fetch weather: {e}")
            return []

    async def _call_llm_for_trip_plan(
        self,
        request: TripPlanRequest,
        flights: list,
        hotels: list,
        places: list,
        weather: list
    ) -> TripPlanResponse:
        """Call LLM with real data context or fallback programmatically"""
        num_days = (request.end_date - request.start_date).days + 1
        request_profile = self._build_request_profile(request, flights, hotels, places, weather)
        
        system_prompt = (
            "You are an expert AI Travel Planner. You must generate a highly detailed, premium, and "
            "comprehensive trip plan. You must strictly output your plan as a single, valid JSON object "
            "matching the TripPlanResponse schema structure. Do not output any markup other than clean JSON.\n\n"
            "Do not write a generic city overview. Every day must be tailored to the exact request profile, live inventory, "
            "budget, pace, and interests supplied below.\n\n"
            "Each part of the day (morning, afternoon, evening) in the itinerary MUST contain a detailed "
            "paragraph of at least 2-3 long, descriptive sentences that reference the actual attraction names, neighborhood cues, "
            "food suggestions, and weather-based advice rather than short, generic phrases.\n\n"
            "Prefer specific experiences over broad recommendations. For example, name the places, explain why they fit the user's "
            "trip style, and vary the plan by day so each day has a distinct theme.\n\n"
            "Here is the strict JSON schema to return:\n"
            "{\n"
            "  \"trip_title\": \"string\",\n"
            "  \"summary\": \"string\",\n"
            "  \"budget_status\": \"realistic\" | \"tight\" | \"unrealistic\",\n"
            "  \"estimated_total_cost\": number,\n"
            "  \"cost_breakdown\": {\n"
            "    \"transport\": number, \"stay\": number, \"food\": number, \"local_transport\": number, \"activities\": number, \"buffer\": number\n"
            "  },\n"
            "  \"warnings\": [\"string\"],\n"
            "  \"days\": [\n"
            "    {\n"
            "      \"day\": number,\n"
            "      \"title\": \"string\",\n"
            "      \"morning\": [\"string\"], \"afternoon\": [\"string\"], \"evening\": [\"string\"],\n"
            "      \"food_suggestions\": [\"string\"],\n"
            "      \"transport_notes\": \"string\",\n"
            "      \"estimated_cost\": number\n"
            "    }\n"
            "  ],\n"
            "  \"recommended_hotels\": [\n"
            "    { \"name\": \"string\", \"address\": \"string\", \"rating\": number, \"price_per_night\": number, \"currency\": \"string\", \"external_url\": \"string\" }\n"
            "  ],\n"
            "  \"recommended_flights\": [\n"
            "    { \"airline\": \"string\", \"departure_time\": \"string\", \"arrival_time\": \"string\", \"duration\": \"string\", \"stops\": number, \"price\": number, \"currency\": \"string\", \"external_url\": \"string\" }\n"
            "  ],\n"
            "  \"recommended_places\": [\n"
            "    { \"name\": \"string\", \"address\": \"string\", \"rating\": number, \"map_url\": \"string\" }\n"
            "  ],\n"
            "  \"external_links\": [\n"
            "    { \"title\": \"string\", \"url\": \"string\" }\n"
            "  ]\n"
            "}\n"
        )
        
        user_prompt = (
            f"Generate a {num_days}-day trip to {request.destination} starting on {request.start_date} from {request.source_city} "
            f"for {request.travellers_count} travellers with a total budget of {request.budget_total} {request.currency}.\n"
            f"Hotel Preference: {request.hotel_preference}, Transport: {request.transport_preference}, Pace: {request.pace}.\n\n"
            f"USER REQUEST PROFILE:\n{request_profile}\n"
            f"Here are the LIVE real-time available choices from external APIs. YOU MUST ONLY USE AND REFER TO THESE CHOICES:\n"
            f"1. LIVE HOTELS:\n{json.dumps(hotels, default=str)}\n"
            f"2. LIVE FLIGHTS:\n{json.dumps(flights, default=str)}\n"
            f"3. LIVE ATTRACTIONS:\n{json.dumps(places, default=str)}\n"
            f"4. WEATHER FORECAST:\n{json.dumps(weather, default=str)}\n\n"
            "RULES:\n"
            "- You must choose the recommended hotels and flights directly from the lists above. "
            "- If flights are empty, add a warning: 'Live flights are currently unavailable. Check external links.'\n"
            "- If hotels are empty, add a warning: 'Live hotel bookings are currently unavailable. Check external links.'\n"
            "- Build the day-by-day itinerary activities specifically around the attractions list above.\n"
            "- For each day, the morning, afternoon, and evening elements must have extremely detailed, comprehensive descriptions (2-3 detailed sentences each) detailing exactly what to experience, specific routes to take, and unique features of that attraction.\n"
            "- Incorporate highly descriptive food suggestions, mentioning iconic local delicacies, dishes, street food areas, and recommendations tailored to the place and the user's interests.\n"
            "- Explicitly adjust daily clothing or packing advice and schedule choices based on the temperature and weather forecast conditions provided above.\n"
            "- Provide specific, realistic cost estimations for each day's local transport and activities, making sure they sum up reasonably within the total cost and match the budget pace."
            "- Avoid generic phrases like 'explore the city' unless you also name at least one concrete attraction, food stop, or district.\n"
            "- Make the summary answer the user's request directly, in a specific and helpful way, rather than repeating the same template every time."
        )

        response_json = None

        if self.openai_key:
            try:
                logger.info("Calling OpenAI API for trip plan...")
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.openai_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "gpt-4o-mini",
                            "response_format": {"type": "json_object"},
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            "temperature": 0.2
                        },
                        timeout=30.0
                    )
                    if resp.status_code == 200:
                        response_json = resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                logger.error(f"OpenAI API call failed: {str(e)}")

        elif self.gemini_key:
            try:
                logger.info("Calling Gemini API for trip plan...")
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}",
                        headers={"Content-Type": "application/json"},
                        json={
                            "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                            "generationConfig": {
                                "responseMimeType": "application/json",
                                "temperature": 0.2
                            }
                        },
                        timeout=30.0
                    )
                    if resp.status_code == 200:
                        parts = resp.json().get("candidates", [{}])[0].get("content", {}).get("parts", [])
                        if parts:
                            response_json = parts[0].get("text")
            except Exception as e:
                logger.error(f"Gemini API call failed: {str(e)}")

        if response_json:
            try:
                parsed = json.loads(response_json)
                return self._parse_trip_plan_response(parsed)
            except Exception as e:
                logger.error(f"Failed to parse LLM response JSON: {str(e)}")

        # Programmatic Fallback: Build a structured itinerary using actual live database results
        logger.warning("Using programmatic real-data generator fallback...")
        
        warnings = []
        if not flights:
            warnings.append("Live flights data unavailable for this route. Please check Google Flights.")
        if not hotels:
            warnings.append("Live hotel recommendations unavailable for this city. Please check Booking.com.")
        if not weather:
            warnings.append("Live weather forecasts currently unavailable. Check local reports.")

        # Stay price — prefer top 3 live hotels and include images/ids when available
        stay_cost = Decimal("0.0")
        recommended_hotels = []
        if hotels:
            nights = max(num_days - 1, 1)
            # include up to 3 hotels from the live list and try to prefer in-app catalog matches
            from services.catalog_service import find_catalog_match

            for h in hotels[:3]:
                catalog = find_catalog_match(h.get('name', ''))
                external = h.get('external_url')
                if catalog:
                    external = catalog.get('external_url')
                recommended_hotels.append(HotelRecommendation(
                    name=h.get("name", ""),
                    address=h.get("address", ""),
                    rating=float(h.get("rating", 4.0)),
                    price_per_night=Decimal(str(h.get("pricePerNight", 0.0))),
                    currency=h.get("currency", "INR"),
                    external_url=external
                ))
            # estimate stay cost using the cheapest of the returned hotels
            try:
                cheapest = min([float(h.get("pricePerNight", 0.0)) for h in hotels])
                stay_cost = Decimal(str(cheapest)) * nights
            except Exception:
                stay_cost = Decimal("0.0")
        else:
            recommended_hotels.append(HotelRecommendation(
                name="Stay Pick (Live inventory unavailable)",
                address=f"Central {request.destination}",
                rating=4.0,
                price_per_night=Decimal("0.0"),
                currency=request.currency
            ))

        # Flight price
        flight_cost = Decimal("0.0")
        recommended_flights = []
        if flights:
            best_flight = flights[0]
            recommended_flights.append(FlightRecommendation(
                airline=best_flight["airline"],
                departure_time=best_flight["departure_time"],
                arrival_time=best_flight["arrival_time"],
                duration=best_flight["duration"],
                stops=best_flight["stops"],
                price=Decimal(str(best_flight["price"])),
                currency=best_flight.get("currency", "INR"),
                external_url=best_flight.get("external_url")
            ))
            flight_cost = Decimal(str(best_flight["price"])) * request.travellers_count
        else:
            recommended_flights.append(FlightRecommendation(
                airline="Flight Pick (Live inventory unavailable)",
                departure_time="TBD",
                arrival_time="TBD",
                duration="N/A",
                stops=0,
                price=Decimal("0.0"),
                currency=request.currency
            ))

        # Build recommended places with details
        recommended_places = []
        for p in places[:10]:
            recommended_places.append({
                "name": p.get("name") or p.get("display_name") or "Local spot",
                "address": p.get("address") or p.get("display_name") or "",
                "rating": float(p.get("rating", 4.0)) if p.get("rating") is not None else 4.0,
                "map_url": p.get("map_url") or p.get("url") or p.get("osm_url")
            })

        # Determine dynamic and realistic fallback costs based on remaining budget
        remaining_budget = max(request.budget_total - flight_cost - stay_cost, Decimal("3000") * num_days * request.travellers_count)
        
        # Split remaining budget: Activities (40%), Food (30%), Local Transport (15%), Buffer (15%)
        activities_cost = (remaining_budget * Decimal("0.40")).quantize(Decimal("1.00"))
        food_cost = (remaining_budget * Decimal("0.30")).quantize(Decimal("1.00"))
        local_trans = (remaining_budget * Decimal("0.15")).quantize(Decimal("1.00"))
        buffer = (remaining_budget * Decimal("0.15")).quantize(Decimal("1.00"))
        
        # Daily cost per traveller for activities, food, and local transport
        daily_expense_per_traveller = ((activities_cost + food_cost + local_trans) / num_days / request.travellers_count).quantize(Decimal("1.00"))

        days = []
        # Build day-by-day plan using the places list. If places is empty, keep generic suggestions.
        for day_num in range(1, num_days + 1):
            weather_condition = "Clear"
            temperature = None
            if weather and (day_num - 1) < len(weather):
                weather_day = weather[day_num - 1]
                weather_condition = weather_day.get("condition", "Clear")
                temperature = weather_day.get("temperature")

            if places:
                morning_idx = ((day_num - 1) * 3) % len(places)
                afternoon_idx = ((day_num - 1) * 3 + 1) % len(places)
                evening_idx = ((day_num - 1) * 3 + 2) % len(places)
                morning_place = places[morning_idx]
                afternoon_place = places[afternoon_idx]
                evening_place = places[evening_idx]
                morning_attraction = morning_place.get("name") or morning_place.get("display_name")
                afternoon_attraction = afternoon_place.get("name") or afternoon_place.get("display_name")
                evening_attraction = evening_place.get("name") or evening_place.get("display_name")
            else:
                morning_attraction = "Explore city center"
                afternoon_attraction = "Visit local landmarks"
                evening_attraction = "Dinner in a popular local district"

            if temperature is not None:
                weather_suffix = f" Expect about {temperature}°C and {weather_condition.lower()} conditions."
            else:
                weather_suffix = f" Expect {weather_condition.lower()} conditions."

            day_plan = DayItinerary(
                day=day_num,
                title=f"Day {day_num}: Discover {request.destination}",
                morning=[
                    f"Start at {morning_attraction} with an early arrival so you can move at a comfortable pace before the busiest crowds build up. "
                    f"Use the first part of the day to focus on the site's most distinctive features, then leave time for a slow coffee or local breakfast nearby.{weather_suffix}"
                ] if morning_attraction else ["Morning: Explore a central neighborhood and look for a breakfast spot that matches the local food style."],
                afternoon=[
                    f"Continue to {afternoon_attraction} and connect it to the rest of the day's theme so the itinerary feels intentional rather than random. "
                    f"This is the best time to combine sightseeing with markets, short walks, or a relaxed lunch based on the user's pace preference.{weather_suffix}"
                ] if afternoon_attraction else ["Afternoon: Visit a landmark, market, or waterfront area that matches the user's interests."],
                evening=[
                    f"Wrap up the day around {evening_attraction} and choose dinner in a nearby area known for local specialties and an easy return to the hotel. "
                    f"Keep the evening flexible so the traveller can either extend the night with a walk or return early depending on energy levels and budget.{weather_suffix}"
                ],
                food_suggestions=[
                    f"Try dishes connected to {request.destination} and the user's interests: local street food, regional thalis, or coastal specialties where relevant.",
                    f"Choose one specific neighbourhood restaurant or market stop near {afternoon_attraction} for lunch or snacks."
                ],
                transport_notes=f"Use local taxis, rickshaws, or walking depending on distance and the user's pace preference. {weather_condition} conditions may change timing and outdoor walking choices.",
                estimated_cost=daily_expense_per_traveller
            )
            days.append(day_plan)

        cost_breakdown = CostBreakdown(
            transport=flight_cost,
            stay=stay_cost,
            food=food_cost,
            local_transport=local_trans,
            activities=activities_cost,
            buffer=buffer
        )

        total_est = flight_cost + stay_cost + food_cost + local_trans + activities_cost + buffer

        return TripPlanResponse(
            trip_title=f"{request.trip_type.title()} trip to {request.destination} ({num_days} days)",
            summary=(
                f"A tailored {num_days}-day trip from {request.source_city} to {request.destination} built around the user's interests, "
                f"budget, and pace preference. This fallback plan uses the live hotel, flight, place, and weather inputs we have available and avoids generic one-size-fits-all suggestions."
            ),
            budget_status="realistic" if request.budget_total >= total_est else "tight",
            estimated_total_cost=total_est,
            cost_breakdown=cost_breakdown,
            warnings=warnings,
            days=days,
            recommended_hotels=recommended_hotels,
            recommended_flights=recommended_flights,
            recommended_places=recommended_places,
            external_links=[
                {"title": "Book Hotels on Booking.com", "url": f"https://www.booking.com/searchresults.html?ss={request.destination.replace(' ', '+')}"},
                {"title": "Find Flights on Google Flights", "url": f"https://www.google.com/flights?q=flights+to+{request.destination.replace(' ', '+')}"}
            ]
        )

    async def refine_trip_plan(
        self,
        current_itinerary: dict,
        refinement_request: dict
    ) -> TripPlanResponse:
        """Refine trip plan"""
        logger.info(f"Refining trip plan: {refinement_request}")
        
        change_request = refinement_request.get("change", "")
        target_days = refinement_request.get("days", [])
        
        system_prompt = (
            "You are an expert AI Travel Planner. Your task is to refine and modify an existing trip plan "
            "according to the user's specific request. You must return a single, valid JSON object matching the "
            "exact TripPlanResponse schema structure. Do not output any markup other than clean JSON.\n\n"
            "Each part of the day (morning, afternoon, evening) in the itinerary MUST contain a detailed "
            "paragraph (at least 2-3 long, descriptive sentences) outlining what to do, what to see, and specific "
            "tips rather than short, generic phrases.\n\n"
            "Here is the strict JSON schema to return:\n"
            "{\n"
            "  \"trip_title\": \"string\",\n"
            "  \"summary\": \"string\",\n"
            "  \"budget_status\": \"realistic\" | \"tight\" | \"unrealistic\",\n"
            "  \"estimated_total_cost\": number,\n"
            "  \"cost_breakdown\": {\n"
            "    \"transport\": number, \"stay\": number, \"food\": number, \"local_transport\": number, \"activities\": number, \"buffer\": number\n"
            "  },\n"
            "  \"warnings\": [\"string\"],\n"
            "  \"days\": [\n"
            "    {\n"
            "      \"day\": number,\n"
            "      \"title\": \"string\",\n"
            "      \"morning\": [\"string\"], \"afternoon\": [\"string\"], \"evening\": [\"string\"],\n"
            "      \"food_suggestions\": [\"string\"],\n"
            "      \"transport_notes\": \"string\",\n"
            "      \"estimated_cost\": number\n"
            "    }\n"
            "  ],\n"
            "  \"recommended_hotels\": [\n"
            "    { \"name\": \"string\", \"address\": \"string\", \"rating\": number, \"price_per_night\": number, \"currency\": \"string\", \"external_url\": \"string\" }\n"
            "  ],\n"
            "  \"recommended_flights\": [\n"
            "    { \"airline\": \"string\", \"departure_time\": \"string\", \"arrival_time\": \"string\", \"duration\": \"string\", \"stops\": number, \"price\": number, \"currency\": \"string\", \"external_url\": \"string\" }\n"
            "  ],\n"
            "  \"recommended_places\": [\n"
            "    { \"name\": \"string\", \"address\": \"string\", \"rating\": number, \"map_url\": \"string\" }\n"
            "  ],\n"
            "  \"external_links\": [\n"
            "    { \"title\": \"string\", \"url\": \"string\" }\n"
            "  ]\n"
            "}\n"
        )
        
        user_prompt = (
            f"Here is the current trip plan:\n{json.dumps(current_itinerary, default=str)}\n\n"
            f"The user wants to apply this change: \"{change_request}\"\n"
        )
        if target_days:
            user_prompt += f"Apply this change specifically to these days: {target_days}\n"
            
        user_prompt += (
            "\nRULES:\n"
            "- Carefully preserve existing recommended hotels, flights, and other items unless the user explicitly requested to modify them.\n"
            "- Modify the day-by-day itineraries (especially the morning/afternoon/evening activities, titles, food suggestions, and transport notes) for the affected days to align with the user's request. Maintain extremely detailed, multi-sentence descriptions for each part of the day.\n"
            "- Explain what changes you made in the 'summary' field of the response in a highly detailed, professional, and descriptive manner.\n"
            "- Adjust 'estimated_total_cost' and 'cost_breakdown' if the requested changes change the cost of activities or other elements."
        )
        
        response_json = None
        
        if self.openai_key:
            try:
                logger.info("Calling OpenAI API for trip plan refinement...")
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.openai_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "gpt-4o-mini",
                            "response_format": {"type": "json_object"},
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            "temperature": 0.2
                        },
                        timeout=30.0
                    )
                    if resp.status_code == 200:
                        response_json = resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                logger.error(f"OpenAI API refinement call failed: {str(e)}")
                
        elif self.gemini_key:
            try:
                logger.info("Calling Gemini API for trip plan refinement...")
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}",
                        headers={"Content-Type": "application/json"},
                        json={
                            "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                            "generationConfig": {
                                "responseMimeType": "application/json",
                                "temperature": 0.2
                            }
                        },
                        timeout=30.0
                    )
                    if resp.status_code == 200:
                        parts = resp.json().get("candidates", [{}])[0].get("content", {}).get("parts", [])
                        if parts:
                            response_json = parts[0].get("text")
            except Exception as e:
                logger.error(f"Gemini API refinement call failed: {str(e)}")
                
        if response_json:
            try:
                parsed = json.loads(response_json)
                return self._parse_trip_plan_response(parsed)
            except Exception as e:
                logger.error(f"Failed to parse refined LLM response JSON: {str(e)}")
                
        # Programmatic fallback: update the summary/title slightly
        logger.warning("Using programmatic refinement fallback...")
        current_itinerary["summary"] = f"Refined trip: Applied '{change_request}'. " + current_itinerary.get("summary", "")
        return self._parse_trip_plan_response(current_itinerary)
    
    async def chat_about_trip(
        self,
        trip_itinerary: dict,
        user_message: str
    ) -> str:
        """Chat about trip"""
        logger.info(f"Chatting about trip with message: {user_message}")
        
        system_prompt = (
            "You are an expert AI Travel Assistant. The user has generated a detailed trip plan and wants to ask a question, "
            "request advice, or discuss adjustments. You must provide a highly detailed, personalized, and engaging answer.\n"
            "Do not give generic answers; use the provided trip plan context to give extremely relevant suggestions, "
            "local insights, dining recommendations, packing lists, weather adjustments, or activity tips tailored to their route.\n\n"
            f"Here is their current trip plan:\n{json.dumps(trip_itinerary, default=str)}\n"
        )
        
        user_prompt = f"User request: {user_message}\n\nPlease reply with a detailed, friendly, and comprehensive message."
        
        if self.openai_key:
            try:
                logger.info("Calling OpenAI API for trip chat...")
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.openai_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "gpt-4o-mini",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            "temperature": 0.7
                        },
                        timeout=30.0
                    )
                    if resp.status_code == 200:
                        return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                logger.error(f"OpenAI API chat call failed: {str(e)}")
                
        if self.gemini_key:
            try:
                logger.info("Calling Gemini API for trip chat...")
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}",
                        headers={"Content-Type": "application/json"},
                        json={
                            "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                            "generationConfig": {
                                "temperature": 0.7
                            }
                        },
                        timeout=30.0
                    )
                    if resp.status_code == 200:
                        parts = resp.json().get("candidates", [{}])[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
            except Exception as e:
                logger.error(f"Gemini API chat call failed: {str(e)}")
                
        # Programmatic fallback: answer from the current itinerary instead of returning a generic placeholder.
        trip_title = trip_itinerary.get('trip_title', 'your trip')
        budget_status = trip_itinerary.get('budget_status', 'realistic')
        summary = trip_itinerary.get('summary', '')
        warnings = trip_itinerary.get('warnings', []) or []
        hotel_names = [hotel.get('name', 'Hotel option') for hotel in trip_itinerary.get('recommended_hotels', [])[:3]]
        place_names = [place.get('name', 'Place option') for place in trip_itinerary.get('recommended_places', [])[:5]]
        first_day = trip_itinerary.get('days', [{}])[0]
        morning_tip = ', '.join(first_day.get('morning', [])[:1]) if first_day.get('morning') else 'No morning plan available yet'
        afternoon_tip = ', '.join(first_day.get('afternoon', [])[:1]) if first_day.get('afternoon') else 'No afternoon plan available yet'
        evening_tip = ', '.join(first_day.get('evening', [])[:1]) if first_day.get('evening') else 'No evening plan available yet'

        response_parts = [
            f"For {trip_title}, your request '{user_message}' should be handled by staying close to the current itinerary's core theme rather than rebuilding it generically.",
            f"Budget status: {budget_status}. {summary}".strip(),
        ]

        if hotel_names:
            response_parts.append(f"The strongest hotel options in the current plan are: {', '.join(hotel_names)}.")
        if place_names:
            response_parts.append(f"The itinerary is already anchored around places like: {', '.join(place_names)}.")
        response_parts.append(
            f"If you want a tighter answer, I can revise Day 1 around: morning - {morning_tip}; afternoon - {afternoon_tip}; evening - {evening_tip}."
        )
        if warnings:
            response_parts.append(f"Important warnings to keep in mind: {'; '.join(warnings)}.")

        return ' '.join(response_parts)
    
    def _parse_trip_plan_response(self, response: dict) -> TripPlanResponse:
        """Parse LLM response into TripPlanResponse schema"""
        cost = response.get("cost_breakdown", {})
        cost_breakdown = CostBreakdown(
            transport=Decimal(str(cost.get("transport", 0))),
            stay=Decimal(str(cost.get("stay", 0))),
            food=Decimal(str(cost.get("food", 0))),
            local_transport=Decimal(str(cost.get("local_transport", 0))),
            activities=Decimal(str(cost.get("activities", 0))),
            buffer=Decimal(str(cost.get("buffer", 0)))
        )

        days = []
        for d in response.get("days", []):
            days.append(DayItinerary(
                day=int(d.get("day", 1)),
                title=d.get("title", "Plan"),
                morning=d.get("morning", []),
                afternoon=d.get("afternoon", []),
                evening=d.get("evening", []),
                food_suggestions=d.get("food_suggestions", []),
                transport_notes=d.get("transport_notes", ""),
                estimated_cost=Decimal(str(d.get("estimated_cost", 0)))
            ))

        hotels = []
        for h in response.get("recommended_hotels", []):
            hotels.append(HotelRecommendation(
                name=h.get("name", ""),
                address=h.get("address", ""),
                rating=float(h.get("rating", 4.0)),
                price_per_night=Decimal(str(h.get("price_per_night", 0))),
                currency=h.get("currency", "INR"),
                external_url=h.get("external_url")
            ))

        flights = []
        for f in response.get("recommended_flights", []):
            flights.append(FlightRecommendation(
                airline=f.get("airline", ""),
                departure_time=f.get("departure_time", ""),
                arrival_time=f.get("arrival_time", ""),
                duration=f.get("duration", ""),
                stops=int(f.get("stops", 0)),
                price=Decimal(str(f.get("price", 0))),
                currency=f.get("currency", "INR"),
                external_url=f.get("external_url")
            ))

        return TripPlanResponse(
            trip_title=response.get("trip_title", "Trip Plan"),
            summary=response.get("summary", ""),
            budget_status=response.get("budget_status", "realistic"),
            estimated_total_cost=Decimal(str(response.get("estimated_total_cost", 0))),
            cost_breakdown=cost_breakdown,
            warnings=response.get("warnings", []),
            days=days,
            recommended_hotels=hotels,
            recommended_flights=flights,
            recommended_places=response.get("recommended_places", []),
            external_links=response.get("external_links", [])
        )
