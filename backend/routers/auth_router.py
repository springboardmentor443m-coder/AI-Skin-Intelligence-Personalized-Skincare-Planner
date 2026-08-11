"""
routers/auth_router.py — Authentication Endpoints
====================================================
Phase 5: Database Integration & Authentication

Endpoints defined here:
  POST /api/auth/register  — Create a new user account
  POST /api/auth/login     — Authenticate and receive a JWT access token
  GET  /api/auth/me        — Return the current authenticated user's profile

All routes are grouped under the "Authentication" tag in Swagger UI.

This module is imported and registered in main.py:
  app.include_router(auth_router, prefix="/api")
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user, hash_password, verify_password
from database import get_db
from models import User
from schemas import LoginRequest, Token, UserCreate, UserResponse

# ── Router definition ─────────────────────────────────────────────────────────
#
# prefix="/auth" → all routes in this file are accessible at /api/auth/...
# tags=["Authentication"] → groups these endpoints in Swagger UI
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ── POST /api/auth/register ───────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description=(
        "Creates a new user with the provided full name, email, password, and role. "
        "The password is hashed with bcrypt before storage — it is never saved in plain text. "
        "Returns the new user's profile (without any password data)."
    ),
)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """
    Register a new user.

    Steps:
      1. Check whether the email is already taken.
      2. Hash the password with bcrypt.
      3. Create a new User row in the database.
      4. Return the safe UserResponse (no password).

    Raises:
      HTTP 409 Conflict — if the email is already registered.
    """
    # Step 1: Check for duplicate email
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # Step 2: Hash the password
    hashed = hash_password(payload.password)

    # Step 3: Insert the new user into the database
    new_user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hashed,
        role=payload.role,
    )
    db.add(new_user)
    db.commit()              # Write to the database
    db.refresh(new_user)     # Reload the record to get the auto-generated id / created_at

    # Step 4: Return the safe user profile
    return new_user


# ── POST /api/auth/login ──────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=Token,
    summary="Log in and receive a JWT access token",
    description=(
        "Authenticates the user with their email and password. "
        "On success, returns a signed JWT access token and the user's profile. "
        "Include the token in the `Authorization: Bearer <token>` header for "
        "all protected endpoints."
    ),
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    """
    Authenticate a user and issue a JWT.

    Steps:
      1. Look up the user by email.
      2. Verify the password against the stored bcrypt hash.
      3. Create and return a signed JWT access token.

    Raises:
      HTTP 401 Unauthorized — if the email doesn't exist or the password is wrong.
      (We intentionally use the same error message for both to prevent email enumeration.)
    """
    # Steps 1 + 2: Find the user and verify credentials
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )

    # Step 3: Create the JWT
    access_token = create_access_token(data={"sub": user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


# ── GET /api/auth/me ──────────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
    description=(
        "Returns the profile of the currently authenticated user. "
        "Requires a valid `Authorization: Bearer <token>` header."
    ),
)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """
    Return the currently authenticated user's profile.

    The heavy lifting (token decoding + user lookup) is done by the
    get_current_user dependency in auth.py. This route simply returns
    the result as a safe UserResponse.
    """
    return current_user
