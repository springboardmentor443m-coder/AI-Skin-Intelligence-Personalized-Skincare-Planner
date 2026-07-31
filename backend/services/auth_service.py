import sys
import os
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson.objectid import ObjectId
from config.database import get_database

SECRET_KEY = os.getenv("JWT_SECRET", "super_secret_skin_intelligence_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

security_scheme = HTTPBearer(auto_error=False)

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        # Truncate password to 72 bytes if needed (bcrypt limit)
        pwd_bytes = password.encode('utf-8')[:72]
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)

    @staticmethod
    def create_access_token(user_id: str, email: str, expires_delta: Optional[timedelta] = None) -> str:
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
            
        payload = {
            "sub": user_id,
            "email": email,
            "exp": expire,
            "iat": datetime.utcnow()
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_access_token(token: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token.")

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Optional[Dict[str, Any]]:
    """
    FastAPI dependency to extract and verify the current authenticated user from Bearer Token.
    Returns None if no token provided (allows anonymous endpoints).
    """
    if not credentials or not credentials.credentials:
        return None

    token = credentials.credentials
    payload = AuthService.decode_access_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims.")

    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found.")

    user["id"] = str(user["_id"])
    return user

async def require_current_user(user: Optional[Dict[str, Any]] = Depends(get_current_user)) -> Dict[str, Any]:
    """Dependency that strictly enforces authentication."""
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required. Please provide a valid Bearer token.")
    return user

auth_service = AuthService()
