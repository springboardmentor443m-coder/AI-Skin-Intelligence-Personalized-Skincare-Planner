import os
# pyrefly: ignore [missing-import]
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME", "skincare_db")

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    print(f"Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(MONGODB_URL)
    print("Connected to MongoDB!")

async def close_mongo_connection():
    print("Closing MongoDB connection...")
    if db.client:
        db.client.close()
    print("MongoDB connection closed.")

def get_database():
    return db.client[DB_NAME]
