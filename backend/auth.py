"""
auth.py — Password Hashing & JWT Token Utilities
==================================================
Phase 5: Database Integration & Authentication

What this module does:
  Provides three security utilities used by the authentication routes:

  1. hash_password(plain_password)
       Converts a plain-text password into a bcrypt hash for safe storage.

  2. verify_password(plain_password, hashed_password)
       Checks whether a plain-text password matches a stored bcrypt hash.
       Returns True if they match, False otherwise.

  3. create_access_token(data, expires_delta)
       Creates a signed JWT (JSON Web Token) that encodes user data
       (e.g. their email) and an expiration time.

  4. get_current_user(token, db) — FastAPI dependency
       Decodes a JWT from the Authorization: Bearer <token> header,
       looks up the user in the database, and returns their User record.
       Raises HTTP 401 if the token is missing, invalid, or expired.

Why bcrypt?
  bcrypt is a one-way hashing function designed specifically for passwords.
  It includes a built-in "salt" (random data) to prevent rainbow-table attacks,
  and its "work factor" makes brute-force attacks computationally expensive.

Why JWT?
  JWTs are self-contained tokens. The server doesn't need to store sessions;
  it just signs the token with a secret key, and any later request can be
  verified by re-checking the signature — no database lookup required.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import TokenData

# ── Load configuration ────────────────────────────────────────────────────────
load_dotenv()

SECRET_KEY                = os.getenv("SECRET_KEY", "change-this-in-production")
ALGORITHM                 = "HS256"           # HMAC-SHA256 — industry standard
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

# Bearer token extractor — reads the "Authorization: Bearer <token>" header
bearer_scheme = HTTPBearer()


# ── Password utilities ────────────────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """
    Hash a plain-text password with bcrypt.

    Steps:
      1. Encode the string to bytes (bcrypt requires bytes input).
      2. Generate a bcrypt salt and compute the hash.
      3. Return the hash as a UTF-8 string for storage in PostgreSQL.

    The resulting hash looks like:
      $2b$12$abcdefghijklmnop...  (60 characters)
    """
    password_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()                       # Random salt, work factor 12
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")                 # Store as string in PostgreSQL


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Check whether a plain-text password matches a bcrypt hash.

    bcrypt.checkpw re-hashes the plain password using the salt embedded
    in hashed_password and compares the two hashes in constant time
    (preventing timing attacks).

    Returns True if they match, False otherwise.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


# ── JWT token creation ────────────────────────────────────────────────────────

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a signed JWT access token.

    Args:
        data:          A dict with the claims to encode.
                       Typically {"sub": user.email}.
        expires_delta: How long until the token expires.
                       Defaults to ACCESS_TOKEN_EXPIRE_MINUTES from .env.

    The token payload (claims) looks like:
      {
        "sub": "jane@example.com",
        "exp": 1700000000   ← Unix timestamp for expiry
      }

    The token is signed with SECRET_KEY using the HS256 algorithm.
    Only the server (which knows the secret key) can verify the signature.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── JWT token verification / current-user dependency ─────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency: decode the JWT and return the authenticated User.

    Used in protected routes:
      @router.get("/me")
      def me(current_user: User = Depends(get_current_user)):
          ...

    Steps:
      1. Extract the raw token string from the Authorization header.
      2. Decode and verify the JWT signature + expiry.
      3. Read the "sub" (subject) claim — the user's email.
      4. Look up the user in the database.
      5. Return the User ORM object or raise HTTP 401.

    Raises:
      HTTP 401 Unauthorized — if the token is missing, tampered with,
                              expired, or the user no longer exists.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode verifies the signature and checks the "exp" claim automatically
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(sub=email)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise credentials_exception

    # Look up the user in the database
    user = db.query(User).filter(User.email == token_data.sub).first()
    if user is None:
        raise credentials_exception

    # Reject deactivated accounts
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )

    return user
