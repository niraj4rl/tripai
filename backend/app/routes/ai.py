from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from decimal import Decimal

from core.database import get_db
from core.security import get_current_user, decode_token
from services.ai_service import AIService
from services.budget_validator import BudgetValidator
from models.trip import Trip
from schemas.all_schemas import TripPlanRequest, TripPlanResponse

router = APIRouter()


def _optional_current_user(authorization: str | None) -> dict | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        return None

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        return {"user_id": user_id}
    except HTTPException:
        return None

@router.post("/trip-plan", response_model=TripPlanResponse)
async def generate_trip_plan(
    request: TripPlanRequest,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
):
    """
    Generate a full AI-powered trip plan
    
    This endpoint:
    1. Validates the budget is realistic
    2. Fetches real API data (flights, hotels, places, weather)
    3. Uses AI to create a detailed itinerary
    4. Saves the trip to database
    """
    try:
        # Validate budget
        validator = BudgetValidator()
        budget_check = validator.validate_budget(
            source_city=request.source_city,
            destination=request.destination,
            num_days=(request.end_date - request.start_date).days,
            num_travellers=request.travellers_count,
            hotel_preference=request.hotel_preference,
            transport_preference=request.transport_preference,
            budget=request.budget_total,
            currency=request.currency
        )
        
        # Generate trip plan
        ai_service = AIService()
        trip_plan = await ai_service.generate_trip_plan(request)
        
        # Inject budget status and warning details directly in the response rather than throwing a hard 400 error
        if not budget_check["is_realistic"]:
            trip_plan.budget_status = "unrealistic"
            if not trip_plan.warnings:
                trip_plan.warnings = []
            if budget_check["message"] not in trip_plan.warnings:
                trip_plan.warnings.append(budget_check["message"])
        
        import json
        
        # Save to database
        current_user = _optional_current_user(authorization)
        if current_user:
            trip = Trip(
                user_id=current_user["user_id"],
                title=trip_plan.trip_title,
                source_city=request.source_city,
                destination=request.destination,
                start_date=request.start_date,
                end_date=request.end_date,
                travellers_count=request.travellers_count,
                budget_total=request.budget_total,
                currency=request.currency,
                trip_type=request.trip_type,
                ai_summary=trip_plan.summary,
                total_estimated_cost=trip_plan.estimated_total_cost,
                itinerary_data=json.loads(trip_plan.json() if hasattr(trip_plan, 'json') else trip_plan.model_dump_json()),
                status="planned"
            )
            db.add(trip)
            db.commit()
            db.refresh(trip)
        
        return trip_plan
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Trip planning failed: {str(e)}"
        )

@router.post("/refine-trip/{trip_id}")
async def refine_trip(
    trip_id: str,
    refinement_request: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refine an existing trip plan
    
    Accepts: {"change": "add more adventure activities", "days": [2, 3]}
    """
    try:
        trip = db.query(Trip).filter(
            Trip.id == trip_id,
            Trip.user_id == current_user["user_id"]
        ).first()
        
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        ai_service = AIService()
        refined_plan = await ai_service.refine_trip_plan(
            current_itinerary=trip.itinerary_data,
            refinement_request=refinement_request
        )
        
        import json
        trip.itinerary_data = json.loads(refined_plan.json() if hasattr(refined_plan, 'json') else refined_plan.model_dump_json())
        trip.ai_summary = refined_plan.summary
        db.commit()
        
        return refined_plan
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Trip refinement failed: {str(e)}"
        )

@router.post("/chat/{trip_id}")
async def chat_with_ai(
    trip_id: str,
    message: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with AI assistant about trip
    
    Accepts: {"message": "Can you add more beaches to day 2?"}
    """
    try:
        trip = db.query(Trip).filter(
            Trip.id == trip_id,
            Trip.user_id == current_user["user_id"]
        ).first()
        
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        ai_service = AIService()
        response = await ai_service.chat_about_trip(
            trip_itinerary=trip.itinerary_data,
            user_message=message.get("message", "")
        )
        
        return {
            "status": "success",
            "response": response,
            "trip_id": trip_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {str(e)}"
        )

@router.post("/budget-check")
async def check_budget(
    request: TripPlanRequest,
):
    """Check if budget is realistic for given trip parameters"""
    try:
        validator = BudgetValidator()
        result = validator.validate_budget(
            source_city=request.source_city,
            destination=request.destination,
            num_days=(request.end_date - request.start_date).days,
            num_travellers=request.travellers_count,
            hotel_preference=request.hotel_preference,
            transport_preference=request.transport_preference,
            budget=request.budget_total,
            currency=request.currency
        )
        
        return {
            "is_realistic": result["is_realistic"],
            "message": result["message"],
            "minimum_budget": result.get("minimum_budget"),
            "suggested_adjustments": result.get("suggested_adjustments", [])
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Budget check failed: {str(e)}"
        )
