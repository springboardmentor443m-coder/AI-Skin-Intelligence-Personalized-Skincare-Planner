"""
Simple auth: register/login with hashed passwords.
No JWT / OAuth2 - the frontend just stores the user's id + role
(from the login response) in localStorage and sends the user_id
on subsequent requests. Good enough for an internship demo;
swap in JWT later without touching the DB layer if needed.
"""
import bcrypt

VALID_ROLES = {"user", "consultant", "dermatologist", "admin"}


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
