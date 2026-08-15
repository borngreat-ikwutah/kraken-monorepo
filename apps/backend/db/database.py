import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Default to SQLite for zero-config local development, or MySQL via DATABASE_URL
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    # Use SQLite as local fallback
    db_path = os.path.join(os.path.dirname(__file__), "..", "threat_detection.db")
    DATABASE_URL = f"sqlite:///{os.path.abspath(db_path)}"

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

try:
    engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
except Exception as e:
    print(f"⚠️ Failed to connect using DATABASE_URL. Falling back to local SQLite: {e}")
    db_path = os.path.join(os.path.dirname(__file__), "..", "threat_detection.db")
    DATABASE_URL = f"sqlite:///{os.path.abspath(db_path)}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    print(f"✅ Database initialized using: {DATABASE_URL}")
