import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

load_dotenv()

host     = os.getenv("DB_HOST", "localhost")
port     = os.getenv("DB_PORT", "3306")
user     = os.getenv("DB_USER", "root")
password = os.getenv("DB_PASSWORD", "")
db_name  = os.getenv("DB_NAME", "pintartani_db")

url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}"

try:
    engine = create_engine(url, pool_pre_ping=True)
except Exception as e:
    logger.error(f"Failed to create DB engine: {e}")
    engine = None

if engine:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    SessionLocal = None

Base = declarative_base()

def get_db():
    if not SessionLocal:
        raise Exception("Database not connected")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
