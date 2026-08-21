"""
Run once to create one demo account per role, so you can log in and
demo every dashboard immediately: `python seed_data.py`
"""
from database import SessionLocal, Base, engine
import models
from auth import hash_password

Base.metadata.create_all(bind=engine)

DEMO_ACCOUNTS = [
    {"email": "user@demo.com", "password": "password123", "full_name": "Asha Rao", "role": "user"},
    {"email": "consultant@demo.com", "password": "password123", "full_name": "Meera Iyer", "role": "consultant"},
    {"email": "dermatologist@demo.com", "password": "password123", "full_name": "Dr. Kapoor", "role": "dermatologist"},
    {"email": "admin@demo.com", "password": "password123", "full_name": "Admin", "role": "admin"},
]


def seed():
    db = SessionLocal()
    try:
        for acc in DEMO_ACCOUNTS:
            existing = db.query(models.User).filter(models.User.email == acc["email"]).first()
            if existing:
                print(f"Skip (exists): {acc['email']}")
                continue
            user = models.User(
                email=acc["email"],
                hashed_password=hash_password(acc["password"]),
                full_name=acc["full_name"],
                role=acc["role"],
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            db.add(models.SkinProfile(
                user_id=user.id,
                skin_type="combination" if acc["role"] == "user" else None,
                age_group="20s" if acc["role"] == "user" else None,
                concerns_json='["acne", "uneven_skin_tone"]' if acc["role"] == "user" else "[]",
                sleep_hours=6.5, water_intake_liters=1.8,
            ))
            db.commit()
            print(f"Created: {acc['email']} / {acc['password']} (role={acc['role']})")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
