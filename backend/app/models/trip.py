from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text, ForeignKey, JSON, Date
import uuid
from datetime import datetime
from core.database import Base

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    source_city = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    travellers_count = Column(Integer, default=1)
    budget_total = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="INR")
    trip_type = Column(String(50))
    status = Column(String(50), default="draft")
    ai_summary = Column(Text, nullable=True)
    total_estimated_cost = Column(Numeric(12, 2), nullable=True)
    itinerary_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ItineraryDay(Base):
    __tablename__ = "itinerary_days"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    title = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    estimated_cost = Column(Numeric(12, 2), nullable=True)

class ItineraryItem(Base):
    __tablename__ = "itinerary_items"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    itinerary_day_id = Column(String(36), ForeignKey("itinerary_days.id"), nullable=False, index=True)
    place_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    start_time = Column(String(50), nullable=True)
    end_time = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    lat = Column(Numeric(10, 7), nullable=True)
    lng = Column(Numeric(10, 7), nullable=True)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    external_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

class SavedPlace(Base):
    __tablename__ = "saved_places"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    provider_place_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)
    lat = Column(Numeric(10, 7), nullable=True)
    lng = Column(Numeric(10, 7), nullable=True)
    category = Column(String(100), nullable=True)
    rating = Column(Numeric(3, 1), nullable=True)
    photo_url = Column(Text, nullable=True)

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    query_type = Column(String(50), nullable=False)
    query = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
