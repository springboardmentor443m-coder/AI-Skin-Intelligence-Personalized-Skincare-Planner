from sqlalchemy.orm import Session
from app import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)

    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password_hash=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)

    if not user:
        return None

    if not pwd_context.verify(password, user.password_hash):
        return None

    return user

def create_skin_profile(db: Session, profile: schemas.SkinProfileCreate):

    db_profile = models.SkinProfile(
        user_id=profile.user_id,
        age=profile.age,
        gender=profile.gender,
        skin_type=profile.skin_type,
        skin_concerns=profile.skin_concerns,
        allergies=profile.allergies,
        sensitive_skin=profile.sensitive_skin
    )

    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    return db_profile

def get_skin_profile(db: Session, user_id: int):
    return (
        db.query(models.SkinProfile)
        .filter(models.SkinProfile.user_id == user_id)
        .first()
    )

def update_skin_profile(
    db: Session,
    user_id: int,
    profile: schemas.SkinProfileCreate
):
    db_profile = get_skin_profile(db, user_id)

    if not db_profile:
        return None

    db_profile.age = profile.age
    db_profile.gender = profile.gender
    db_profile.skin_type = profile.skin_type
    db_profile.skin_concerns = profile.skin_concerns
    db_profile.allergies = profile.allergies
    db_profile.sensitive_skin = profile.sensitive_skin

    db.commit()
    db.refresh(db_profile)

    return db_profile

def create_lifestyle(db: Session, lifestyle: schemas.LifestyleCreate):

    db_lifestyle = models.Lifestyle(
        user_id=lifestyle.user_id,
        sleep_hours=lifestyle.sleep_hours,
        water_intake=lifestyle.water_intake,
        stress_level=lifestyle.stress_level,
        diet=lifestyle.diet
    )

    db.add(db_lifestyle)
    db.commit()
    db.refresh(db_lifestyle)

    return db_lifestyle


def get_lifestyle(db: Session, user_id: int):
    return (
        db.query(models.Lifestyle)
        .filter(models.Lifestyle.user_id == user_id)
        .first()
    )

def update_lifestyle(
    db: Session,
    user_id: int,
    lifestyle: schemas.LifestyleCreate
):
    db_lifestyle = get_lifestyle(db, user_id)

    if not db_lifestyle:
        return None

    db_lifestyle.sleep_hours = lifestyle.sleep_hours
    db_lifestyle.water_intake = lifestyle.water_intake
    db_lifestyle.stress_level = lifestyle.stress_level
    db_lifestyle.diet = lifestyle.diet

    db.commit()
    db.refresh(db_lifestyle)

    return db_lifestyle


def create_progress(db: Session, progress: schemas.ProgressCreate):

    db_progress = models.Progress(
        user_id=progress.user_id,
        image_path=progress.image_path,
        notes=progress.notes
    )

    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)

    return db_progress


def get_user_progress(db: Session, user_id: int):
    return (
        db.query(models.Progress)
        .filter(models.Progress.user_id == user_id)
        .order_by(models.Progress.created_at.asc())
        .all()
    )

def reset_user_password(db: Session, email: str, new_password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    
    hashed_password = pwd_context.hash(new_password)
    user.password_hash = hashed_password
    db.commit()
    return True