from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.user import User
from schemas.all_schemas import UserProfile, UserPreferences, UserResponse

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user profile"""
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/profile")
async def update_profile(
    profile: UserProfile,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.full_name = profile.full_name
    user.phone = profile.phone
    user.home_city = profile.home_city
    user.preferred_currency = profile.preferred_currency
    user.profile_image_url = profile.profile_image_url
    
    db.commit()
    db.refresh(user)
    return user

@router.put("/preferences")
async def update_preferences(
    preferences: UserPreferences,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user travel preferences"""
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.travel_style = preferences.travel_style
    user.hotel_preference = preferences.hotel_preference
    user.food_preference = preferences.food_preference
    user.pace = preferences.pace
    user.budget_level = preferences.budget_level
    
    db.commit()
    db.refresh(user)
    return {"message": "Preferences updated", "user": user}

@router.delete("/account")
async def delete_account(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account (placeholder - implement with caution)"""
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # TODO: Implement cascade deletion of trips, saved places, etc.
    db.delete(user)
    db.commit()
    
    return {"message": "Account deleted"}
