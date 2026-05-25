from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, List
from decimal import Decimal

# Auth Schemas
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# User Schemas
class UserProfile(BaseModel):
    full_name: str
    phone: Optional[str] = None
    home_city: Optional[str] = None
    preferred_currency: str = "INR"
    profile_image_url: Optional[str] = None

class UserPreferences(BaseModel):
    travel_style: Optional[str] = None
    hotel_preference: Optional[str] = None
    food_preference: Optional[str] = None
    pace: Optional[str] = None
    budget_level: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str]
    home_city: Optional[str]
    preferred_currency: str
    created_at: datetime

    class Config:
        from_attributes = True

# Trip Schemas
class TripCreate(BaseModel):
    source_city: str
    destination: str
    start_date: date
    end_date: date
    travellers_count: int = 1
    budget_total: Decimal
    currency: str = "INR"
    trip_type: str
    hotel_preference: str = "mid-range"
    transport_preference: str = "flight"
    food_preference: Optional[str] = None
    pace: str = "balanced"
    interests: List[str] = []
    hotel_rating_min: int = 3
    safety_preference: str = "safe"
    accessibility_needs: Optional[str] = None
    local_transport_preference: str = "public"

class TripResponse(BaseModel):
    id: str
    title: str
    source_city: str
    destination: str
    start_date: date
    end_date: date
    travellers_count: int
    budget_total: Decimal
    currency: str
    status: str
    ai_summary: Optional[str] = None
    total_estimated_cost: Optional[Decimal] = None
    itinerary_data: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True

# AI Schemas
class TripPlanRequest(BaseModel):
    source_city: str
    destination: str
    start_date: date
    end_date: date
    travellers_count: int = 1
    budget_total: Decimal
    currency: str = "INR"
    trip_type: str
    hotel_preference: str = "mid-range"
    transport_preference: str = "flight"
    food_preference: Optional[str] = None
    pace: str = "balanced"
    interests: List[str] = []
    hotel_rating_min: int = 3
    safety_preference: str = "safe"
    accessibility_needs: Optional[str] = None
    local_transport_preference: str = "public"

class CostBreakdown(BaseModel):
    transport: Decimal = 0
    stay: Decimal = 0
    food: Decimal = 0
    local_transport: Decimal = 0
    activities: Decimal = 0
    buffer: Decimal = 0

class DayItinerary(BaseModel):
    day: int
    title: str
    morning: List[str] = []
    afternoon: List[str] = []
    evening: List[str] = []
    food_suggestions: List[str] = []
    transport_notes: str
    estimated_cost: Decimal

class HotelRecommendation(BaseModel):
    name: str
    address: str
    rating: float
    price_per_night: Decimal
    currency: str
    external_url: Optional[str] = None

class FlightRecommendation(BaseModel):
    airline: str
    departure_time: str
    arrival_time: str
    duration: str
    stops: int
    price: Decimal
    currency: str
    external_url: Optional[str] = None

class TripPlanResponse(BaseModel):
    trip_title: str
    summary: str
    budget_status: str  # realistic | tight | unrealistic
    estimated_total_cost: Decimal
    cost_breakdown: CostBreakdown
    warnings: List[str] = []
    days: List[DayItinerary]
    recommended_hotels: List[HotelRecommendation] = []
    recommended_flights: List[FlightRecommendation] = []
    recommended_places: List[dict] = []
    external_links: List[dict] = []

# Flight Schemas
class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    travellers: int = 1

# Hotel Schemas
class HotelSearchRequest(BaseModel):
    destination: str
    check_in: date
    check_out: date
    guests: int = 1
    min_rating: float = 3.0

# Places Schemas
class PlaceSearchRequest(BaseModel):
    query: str
    location: str
    radius: int = 5000

class PlaceResponse(BaseModel):
    place_id: str
    name: str
    address: str
    rating: float
    category: str
    photo_url: Optional[str] = None
    lat: float
    lng: float
    opening_hours: Optional[dict] = None

# Weather Schemas
class WeatherForecast(BaseModel):
    date: date
    temperature: float
    condition: str
    rain_probability: int
    warning: Optional[str] = None
