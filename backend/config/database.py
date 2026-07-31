import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "AI-SKin-Intelligence")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB Atlas...")
    try:
        db_instance.client = AsyncIOMotorClient(MONGODB_URL)
        db_instance.db = db_instance.client[DB_NAME]
        logger.info(f"Connected to MongoDB database: {DB_NAME}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    if db_instance.db is None:
        # Fallback for sync or direct reference before startup hook
        db_instance.client = AsyncIOMotorClient(MONGODB_URL)
        db_instance.db = db_instance.client[DB_NAME]
    return db_instance.db
