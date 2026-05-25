import sys
import os
import asyncio
from datetime import date
from decimal import Decimal

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from schemas.all_schemas import TripPlanRequest
from services.ai_service import AIService
from services.budget_validator import BudgetValidator

async def test():
    req = TripPlanRequest(
        source_city="Mumbai",
        destination="Goa",
        start_date=date(2026, 6, 1),
        end_date=date(2026, 6, 4),
        travellers_count=2,
        budget_total=Decimal("20000"),
        currency="INR",
        trip_type="leisure",
        hotel_preference="mid-range",
        transport_preference="flight",
        food_preference="mid-range",
        pace="balanced",
        interests=["beaches", "cafes"],
        hotel_rating_min=3,
        safety_preference="safe",
        local_transport_preference="public"
    )
    print("Testing budget validator...")
    validator = BudgetValidator()
    budget_check = validator.validate_budget(
        source_city=req.source_city,
        destination=req.destination,
        num_days=(req.end_date - req.start_date).days,
        num_travellers=req.travellers_count,
        hotel_preference=req.hotel_preference,
        transport_preference=req.transport_preference,
        budget=req.budget_total,
        currency=req.currency
    )
    print("Budget check result:", budget_check)
    
    print("\nTesting AI Service components...")
    ai_service = AIService()
    try:
        print("Calling _fetch_flight_data...")
        flights = await ai_service._fetch_flight_data(req)
        print(f"Flights fetched: {len(flights)}")
        
        print("Calling _fetch_hotel_data...")
        hotels = await ai_service._fetch_hotel_data(req)
        print(f"Hotels fetched: {len(hotels)}")
        
        print("Calling _fetch_places_data...")
        places = await ai_service._fetch_places_data(req)
        print(f"Places fetched: {len(places)}")
        
        print("Calling _fetch_weather_data...")
        weather = await ai_service._fetch_weather_data(req)
        print(f"Weather fetched: {len(weather)}")

        print("Calling _call_llm_for_trip_plan...")
        res = await ai_service._call_llm_for_trip_plan(
            request=req,
            flights=flights,
            hotels=hotels,
            places=places,
            weather=weather
        )
        print("Success! Result title:", res.trip_title)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
