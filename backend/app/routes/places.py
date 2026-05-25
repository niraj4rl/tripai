from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.database import get_db
from services.places_service import PlacesService
from schemas.all_schemas import PlaceSearchRequest

router = APIRouter()

@router.get("/search")
async def search_places(
    query: str = Query(..., description="Search query (restaurant, beach, etc.)"),
    location: str = Query(..., description="City or location name"),
    radius: int = Query(5000, description="Search radius in meters"),
    db: Session = Depends(get_db)
):
    """
    Search for places and attractions
    
    Example: /api/places/search?query=restaurants&location=Mumbai&radius=5000
    """
    try:
        service = PlacesService()
        places = await service.search_places(
            query=query,
            location=location,
            radius=radius
        )
        return {
            "status": "success",
            "query": query,
            "location": location,
            "places": places,
            "count": len(places) if places else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Place search failed: {str(e)}"
        )

@router.get("/details/{place_id}")
async def get_place_details(
    place_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed information about a place"""
    try:
        service = PlacesService()
        place_details = await service.get_place_details(place_id)
        return place_details
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch place details: {str(e)}"
        )

@router.get("/nearby")
async def get_nearby_places(
    lat: float = Query(...),
    lng: float = Query(...),
    place_type: str = Query("restaurant"),
    radius: int = Query(1000),
    db: Session = Depends(get_db)
):
    """Get nearby places by coordinates"""
    try:
        service = PlacesService()
        places = await service.get_nearby_places(
            latitude=lat,
            longitude=lng,
            place_type=place_type,
            radius=radius
        )
        return {
            "status": "success",
            "location": {"lat": lat, "lng": lng},
            "places": places,
            "count": len(places) if places else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch nearby places: {str(e)}"
        )
