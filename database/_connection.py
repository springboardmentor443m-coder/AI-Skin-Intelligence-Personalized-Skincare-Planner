"""
Shared MongoDB connection helper used by all seed scripts.

Connection details are pulled from environment variables so credentials
never need to be hardcoded or committed to source control.
"""

import os

from pymongo import MongoClient
from pymongo.database import Database


def get_mongo_client() -> MongoClient:
    """
    Build a MongoClient from environment variables.

    Recognized variables:
      MONGO_URI       - full connection string (takes precedence if set)
      MONGO_HOST      - default: localhost
      MONGO_PORT      - default: 27017
      MONGO_USER      - optional
      MONGO_PASSWORD  - optional
    """
    uri = os.getenv("MONGO_URI")
    if uri:
        return MongoClient(uri)

    host = os.getenv("MONGO_HOST", "localhost")
    port = int(os.getenv("MONGO_PORT", "27017"))
    user = os.getenv("MONGO_USER")
    password = os.getenv("MONGO_PASSWORD")

    if user and password:
        return MongoClient(host=host, port=port, username=user, password=password)

    return MongoClient(host=host, port=port)


def get_database(client: MongoClient) -> Database:
    """Return the application database, defaulting to 'ai_skin_intelligence'."""
    db_name = os.getenv("MONGO_DB", "ai_skin_intelligence")
    return client[db_name]
