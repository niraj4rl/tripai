# 🔌 API Reference - All Endpoints

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Get access_token from login/register response.

---

## 🔐 AUTH Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAi...",
  "refresh_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAi...",
  "refresh_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

### Refresh Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAi..."
}

Response: 200 OK
{
  "access_token": "new_token...",
  "refresh_token": "new_refresh...",
  "token_type": "bearer"
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "john@example.com",
  "full_name": "John Doe",
  "phone": null,
  "home_city": null,
  "preferred_currency": "INR",
  "created_at": "2024-01-01T00:00:00"
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

---

## 👤 USER Endpoints

### Get Profile
```
GET /users/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "john@example.com",
  "full_name": "John Doe",
  "phone": "+91 9876543210",
  "home_city": "Mumbai",
  "preferred_currency": "INR"
}
```

### Update Profile
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone": "+91 9876543210",
  "home_city": "Mumbai",
  "preferred_currency": "INR",
  "profile_image_url": "https://..."
}

Response: 200 OK (updated profile)
```

### Update Preferences
```
PUT /users/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "travel_style": "luxury",
  "hotel_preference": "premium",
  "food_preference": "vegetarian",
  "pace": "relaxed",
  "budget_level": "premium"
}

Response: 200 OK
{
  "message": "Preferences updated",
  "user": {...}
}
```

### Delete Account
```
DELETE /users/account
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Account deleted"
}
```

---

## ✈️ TRIP Endpoints

### Create Trip
```
POST /trips/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_city": "Mumbai",
  "destination": "Goa",
  "start_date": "2024-12-20",
  "end_date": "2024-12-23",
  "travellers_count": 2,
  "budget_total": 50000,
  "currency": "INR",
  "trip_type": "couple",
  "hotel_preference": "mid-range",
  "transport_preference": "flight",
  "food_preference": "mixed",
  "pace": "balanced",
  "interests": ["beaches", "nightlife"],
  "hotel_rating_min": 3,
  "safety_preference": "safe",
  "accessibility_needs": null,
  "local_transport_preference": "public"
}

Response: 200 OK
{
  "id": "trip-uuid",
  "title": "Goa Trip",
  "source_city": "Mumbai",
  "destination": "Goa",
  "start_date": "2024-12-20",
  "end_date": "2024-12-23",
  "travellers_count": 2,
  "budget_total": "50000.00",
  "status": "draft",
  "created_at": "2024-01-01T00:00:00"
}
```

### List Trips
```
GET /trips
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "trip-uuid",
    "title": "Goa Trip",
    "destination": "Goa",
    "budget_total": "50000.00",
    "status": "draft",
    ...
  }
]
```

### Get Trip Details
```
GET /trips/{trip_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "trip-uuid",
  "title": "Goa Trip",
  "source_city": "Mumbai",
  "destination": "Goa",
  "start_date": "2024-12-20",
  "end_date": "2024-12-23",
  "travellers_count": 2,
  "budget_total": "50000.00",
  "status": "draft",
  "created_at": "2024-01-01T00:00:00"
}
```

### Update Trip
```
PUT /trips/{trip_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_city": "Mumbai",
  "destination": "Goa",
  "start_date": "2024-12-20",
  "end_date": "2024-12-24",
  "travellers_count": 3,
  "budget_total": 60000,
  ...
}

Response: 200 OK (updated trip)
```

### Delete Trip
```
DELETE /trips/{trip_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Trip deleted"
}
```

### Save Trip
```
POST /trips/{trip_id}/save
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Trip saved"
}
```

### Export Trip
```
POST /trips/{trip_id}/export
Authorization: Bearer <token>

Response: 200 OK
{
  "trip_id": "uuid",
  "title": "Goa Trip",
  "source": "Mumbai",
  "destination": "Goa",
  "dates": "2024-12-20 to 2024-12-23",
  "budget": "50000",
  "itinerary": {...}
}
```

---

## ✈️ FLIGHT Endpoints

### Search Flights
```
GET /flights/search?origin=BOM&destination=DEL&departure_date=2024-12-20&travellers=2
Authorization: Bearer <token>

Query Parameters:
- origin (required): IATA code or city (BOM, DEL, etc.)
- destination (required): IATA code or city
- departure_date (required): YYYY-MM-DD
- return_date (optional): YYYY-MM-DD
- travellers (optional, default=1): 1-9

Response: 200 OK
{
  "status": "success",
  "origin": "BOM",
  "destination": "DEL",
  "departure_date": "2024-12-20",
  "count": 3,
  "flights": [
    {
      "id": "flight_1",
      "airline": "Air India",
      "departure": "14:30",
      "arrival": "16:45",
      "duration": "2h 15m",
      "stops": 0,
      "price": 4500,
      "currency": "INR",
      "external_url": "https://www.airindia.in"
    }
  ]
}
```

---

## 🏨 HOTEL Endpoints

### Search Hotels
```
GET /hotels/search?destination=Mumbai&check_in=2024-12-20&check_out=2024-12-23&guests=2&min_rating=3.0
Authorization: Bearer <token>

Query Parameters:
- destination (required): City name
- check_in (required): YYYY-MM-DD
- check_out (required): YYYY-MM-DD
- guests (optional, default=1): 1-10
- min_rating (optional, default=3.0): 1.0-5.0

Response: 200 OK
{
  "status": "success",
  "destination": "Mumbai",
  "check_in": "2024-12-20",
  "check_out": "2024-12-23",
  "count": 5,
  "hotels": [
    {
      "id": "hotel_1",
      "name": "Hotel Paradise",
      "address": "Central Mumbai",
      "rating": 4.5,
      "price_per_night": 3500,
      "total_price": 10500,
      "currency": "INR",
      "amenities": ["WiFi", "AC", "Breakfast"],
      "photo_url": "https://...",
      "external_url": "https://www.booking.com/..."
    }
  ]
}
```

---

## 📍 PLACES Endpoints

### Search Places
```
GET /places/search?query=restaurants&location=Mumbai&radius=5000
Authorization: Bearer <token>

Query Parameters:
- query (required): restaurant, beach, temple, etc.
- location (required): City name
- radius (optional, default=5000): meters

Response: 200 OK
{
  "status": "success",
  "query": "restaurants",
  "location": "Mumbai",
  "count": 10,
  "places": [
    {
      "place_id": "ChIJ...",
      "name": "Restaurant Name",
      "address": "Address, Mumbai",
      "rating": 4.5,
      "reviews": 250,
      "category": "restaurant",
      "photo_url": "https://...",
      "lat": 19.0760,
      "lng": 72.8777,
      "google_maps_url": "https://maps.google.com/..."
    }
  ]
}
```

### Get Place Details
```
GET /places/details/{place_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "place_id": "ChIJ...",
  "name": "Restaurant Name",
  "address": "Full Address",
  "rating": 4.5,
  "reviews_count": 250,
  "description": "Description from reviews",
  "photos": ["url1", "url2"],
  "opening_hours": {...},
  "phone": "+91 XXXX XXXX",
  "website": "https://example.com",
  "google_maps_url": "https://maps.google.com"
}
```

### Get Nearby Places
```
GET /places/nearby?lat=19.0760&lng=72.8777&place_type=restaurant&radius=1000
Authorization: Bearer <token>

Query Parameters:
- lat (required): latitude
- lng (required): longitude
- place_type (optional, default=restaurant): restaurant, cafe, temple, etc.
- radius (optional, default=1000): meters

Response: 200 OK
{
  "status": "success",
  "location": {"lat": 19.0760, "lng": 72.8777},
  "count": 5,
  "places": [...]
}
```

---

## 🌤️ WEATHER Endpoints

### Get Weather Forecast
```
GET /weather/forecast?destination=Mumbai&start_date=2024-12-20&end_date=2024-12-23
Authorization: Bearer <token>

Query Parameters:
- destination (required): City name
- start_date (required): YYYY-MM-DD
- end_date (required): YYYY-MM-DD

Response: 200 OK
{
  "status": "success",
  "destination": "Mumbai",
  "period": "2024-12-20 to 2024-12-23",
  "forecast": [
    {
      "date": "2024-12-20",
      "temperature_max": 32,
      "temperature_min": 24,
      "condition": "Partly Cloudy",
      "rain_probability": 30,
      "humidity": 70,
      "wind_speed": 12,
      "warning": null
    }
  ]
}
```

### Get Current Weather
```
GET /weather/current?destination=Mumbai
Authorization: Bearer <token>

Query Parameters:
- destination (required): City name

Response: 200 OK
{
  "status": "success",
  "destination": "Mumbai",
  "weather": {
    "temperature": 28,
    "condition": "Partly Cloudy",
    "humidity": 70,
    "wind_speed": 12,
    "feels_like": 30,
    "uv_index": 6,
    "visibility": "Good"
  }
}
```

---

## 🤖 AI Endpoints

### Generate Trip Plan
```
POST /ai/trip-plan
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_city": "Mumbai",
  "destination": "Goa",
  "start_date": "2024-12-20",
  "end_date": "2024-12-23",
  "travellers_count": 2,
  "budget_total": 50000,
  "currency": "INR",
  "trip_type": "couple",
  "hotel_preference": "mid-range",
  "transport_preference": "flight",
  "food_preference": "mixed",
  "pace": "balanced",
  "interests": ["beaches", "nightlife"],
  "hotel_rating_min": 3,
  "safety_preference": "safe",
  "accessibility_needs": null,
  "local_transport_preference": "public"
}

Response: 200 OK
{
  "trip_title": "Goa Adventure",
  "summary": "A 3-day trip to Goa from Mumbai",
  "budget_status": "realistic",
  "estimated_total_cost": 48500,
  "cost_breakdown": {
    "transport": 5000,
    "stay": 6000,
    "food": 4000,
    "local_transport": 1000,
    "activities": 3000,
    "buffer": 1900
  },
  "warnings": [],
  "days": [
    {
      "day": 1,
      "title": "Arrival & Relaxation",
      "morning": ["Arrive in Goa"],
      "afternoon": ["Check into hotel", "Relax at beach"],
      "evening": ["Dinner at beachside restaurant"],
      "food_suggestions": ["Local seafood", "Goan cuisine"],
      "transport_notes": "Use taxi or local bus",
      "estimated_cost": 2000
    }
  ],
  "recommended_hotels": [...],
  "recommended_flights": [...],
  "recommended_places": [...],
  "external_links": [
    {
      "title": "Book Hotels",
      "url": "https://www.booking.com"
    }
  ]
}
```

### Check Budget
```
POST /ai/budget-check
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_city": "Mumbai",
  "destination": "Goa",
  "start_date": "2024-12-20",
  "end_date": "2024-12-23",
  "travellers_count": 2,
  "budget_total": 5000,
  "currency": "INR",
  "trip_type": "couple",
  "hotel_preference": "budget",
  "transport_preference": "bus",
  "pace": "balanced"
}

Response: 200 OK
{
  "is_realistic": false,
  "message": "Budget appears low. Estimated minimum: ₹25000 (shortfall: ₹20000)",
  "minimum_budget": "25000",
  "cost_breakdown": {
    "transport": 2000,
    "stay": 6000,
    "food": 4000,
    "local_transport": 1000,
    "activities": 1500,
    "buffer": 2500
  },
  "suggested_adjustments": [
    "Reduce trip to 2 days",
    "Consider budget hotels instead of mid-range",
    "Consider train or bus instead of flight",
    "Increase budget by ₹20000 to be comfortable"
  ]
}
```

### Refine Trip
```
POST /ai/refine-trip/{trip_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "change": "Add more adventure activities",
  "days": [2, 3]
}

Response: 200 OK
(Updated trip plan)
```

### Chat About Trip
```
POST /ai/chat/{trip_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Can you add more beaches to day 2?"
}

Response: 200 OK
{
  "status": "success",
  "response": "I can help you modify your trip...",
  "trip_id": "trip-uuid"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input data",
  "code": "VALIDATION_ERROR"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid credentials or expired token",
  "code": "AUTH_ERROR"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found",
  "code": "NOT_FOUND"
}
```

### 500 Server Error
```json
{
  "detail": "Internal server error",
  "code": "SERVER_ERROR"
}
```

---

## Testing in Browser

Open http://localhost:8000/docs to use interactive API documentation!

- Try endpoints directly
- See request/response formats
- Get real-time error messages
- Download OpenAPI spec

---

## Rate Limiting

Not yet implemented. Add in production.

## Caching

GET endpoints can be cached. POST/PUT/DELETE should not be cached.

