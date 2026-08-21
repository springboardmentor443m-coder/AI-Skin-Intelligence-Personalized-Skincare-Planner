from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from deps import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[schemas.NotificationOut])
def list_notifications(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Notification).filter(
        models.Notification.user_id == user.id
    ).order_by(models.Notification.created_at.desc()).all()


@router.post("/{notification_id}/read")
def mark_read(notification_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(models.Notification).filter(
        models.Notification.id == notification_id, models.Notification.user_id == user.id
    ).first()
    if n:
        n.is_read = True
        db.commit()
    return {"status": "ok"}


@router.post("/generate-reminders")
def generate_reminders(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Simple rule-based reminder generator - called on demand (or by a scheduled job later)."""
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    created = []

    def add(type_, message):
        n = models.Notification(user_id=user.id, type=type_, message=message)
        db.add(n)
        created.append(message)

    add("routine_reminder", "Don't forget your evening skincare routine tonight!")
    if profile and profile.water_intake_liters < 2.0:
        add("hydration", "Your water intake looks low - aim for at least 2L today for skin hydration.")
    if profile and profile.sleep_hours < 6.5:
        add("sleep", "Low sleep can slow skin repair - try to get 7+ hours tonight.")

    db.commit()
    return {"created": created}
