from sqlalchemy import Column, String, Text, DateTime
import uuid
from datetime import datetime
from core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    phone = Column(String(20), nullable=True)
    home_city = Column(String(255), nullable=True)
    preferred_currency = Column(String(3), default="INR")
    profile_image_url = Column(Text, nullable=True)
    travel_style = Column(String(50), nullable=True)
    hotel_preference = Column(String(50), nullable=True)
    food_preference = Column(String(255), nullable=True)
    pace = Column(String(50), nullable=True)
    budget_level = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<User {self.email}>"
