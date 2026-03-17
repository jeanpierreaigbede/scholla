"""
Test Supabase (Session Pooler) connection using psycopg2.
Run from backend: python scripts/connect_db.py
Ensure backend/.env has: user, password, host, port, dbname (Supabase pooler).
"""
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

# Load .env from backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        print("Connection successful!")
except Exception as e:
    print(f"Failed to connect: {e}")
