from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
from core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    poolclass=StaticPool if "sqlite" in settings.DATABASE_URL else None,
    echo=False,
    future=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
