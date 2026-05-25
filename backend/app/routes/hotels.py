from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date

from core.database import get_db
from services.hotel_service import HotelService
from schemas.all_schemas import HotelSearchRequest

router = APIRouter()

@router.get("/search")
async def search_hotels(
    destination: str = Query(..., description="City or location name"),
    check_in: date = Query(...),
    check_out: date = Query(...),
    guests: int = Query(1, ge=1, le=10),
    min_rating: float = Query(3.0, ge=1, le=5),
    db: Session = Depends(get_db)
):
    """
    Search for hotels
    
    Example: /api/hotels/search?destination=Mumbai&check_in=2024-12-15&check_out=2024-12-17&guests=2
    """
    try:
        service = HotelService()
        hotels = await service.search_hotels(
            destination=destination,
            check_in=check_in,
            check_out=check_out,
            guests=guests,
            min_rating=min_rating
        )
        return {
            "status": "success",
            "destination": destination,
            "check_in": check_in,
            "check_out": check_out,
            "hotels": hotels,
            "count": len(hotels) if hotels else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Hotel search failed: {str(e)}"
        )
