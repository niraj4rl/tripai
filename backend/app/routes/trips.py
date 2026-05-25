from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal

from core.database import get_db
from core.security import get_current_user
from models.trip import Trip, SearchHistory
from schemas.all_schemas import TripCreate, TripResponse

router = APIRouter()

@router.post("/create")
async def create_trip(
    trip_data: dict = Body(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new trip. Accepts optional `total_estimated_cost` and `itinerary_data` when available."""
    try:
        source_city = trip_data.get("source_city")
        destination = trip_data.get("destination")
        start_date = trip_data.get("start_date")
        end_date = trip_data.get("end_date")
        travellers_count = int(trip_data.get("travellers_count", 1))
        budget_total = Decimal(str(trip_data.get("budget_total", 0)))
        currency = trip_data.get("currency", "INR")
        trip_type = trip_data.get("trip_type")

        if not source_city or not destination or not start_date or not end_date:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Missing required trip fields")

        # parse dates (accept string YYYY-MM-DD)
        try:
            sd = datetime.fromisoformat(start_date).date() if isinstance(start_date, str) else start_date
            ed = datetime.fromisoformat(end_date).date() if isinstance(end_date, str) else end_date
        except Exception:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid date format; expected YYYY-MM-DD")

        trip = Trip(
            user_id=current_user["user_id"],
            title=str(trip_data.get("title") or f"{destination} Trip"),
            source_city=source_city,
            destination=destination,
            start_date=sd,
            end_date=ed,
            travellers_count=travellers_count,
            budget_total=budget_total,
            currency=currency,
            trip_type=trip_type,
            status=str(trip_data.get("status", "draft")),
            ai_summary=trip_data.get("ai_summary")
        )

        # optional estimated cost and itinerary
        if trip_data.get("total_estimated_cost") is not None:
            try:
                trip.total_estimated_cost = Decimal(str(trip_data.get("total_estimated_cost")))
            except Exception:
                pass

        if trip_data.get("itinerary_data") is not None:
            trip.itinerary_data = trip_data.get("itinerary_data")

        db.add(trip)
        db.commit()
        db.refresh(trip)

        # Log search history
        search_log = SearchHistory(
            user_id=current_user["user_id"],
            query_type="trip_create",
            query={
                "source": source_city,
                "destination": destination,
                "dates": f"{sd} to {ed}"
            }
        )
        db.add(search_log)
        db.commit()

        return trip
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/")
async def list_trips(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's trips"""
    trips = db.query(Trip).filter(Trip.user_id == current_user["user_id"]).all()
    return trips

@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get trip details"""
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user["user_id"]
    ).first()
    
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    
    return trip

@router.put("/{trip_id}")
async def update_trip(
    trip_id: str,
    trip_data: TripCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update trip"""
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user["user_id"]
    ).first()
    
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    
    trip.destination = trip_data.destination
    trip.source_city = trip_data.source_city
    trip.start_date = trip_data.start_date
    trip.end_date = trip_data.end_date
    trip.budget_total = trip_data.budget_total
    trip.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(trip)
    
    return trip

@router.delete("/{trip_id}")
async def delete_trip(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete trip"""
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user["user_id"]
    ).first()
    
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    
    db.delete(trip)
    db.commit()
    
    return {"message": "Trip deleted"}

@router.post("/{trip_id}/save")
async def save_trip(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save/bookmark trip"""
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user["user_id"]
    ).first()
    
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    
    trip.status = "saved"
    db.commit()
    
    return {"message": "Trip saved"}

@router.post("/{trip_id}/export")
async def export_trip(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export trip as JSON"""
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user["user_id"]
    ).first()
    
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    
    return {
        "trip_id": trip.id,
        "title": trip.title,
        "source": trip.source_city,
        "destination": trip.destination,
        "dates": f"{trip.start_date} to {trip.end_date}",
        "budget": str(trip.budget_total),
        "itinerary": trip.itinerary_data
    }
