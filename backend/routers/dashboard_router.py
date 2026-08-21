import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from deps import get_current_user, require_roles

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/user")
def user_dashboard(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    latest_score = db.query(models.SkinHealthScore).filter(
        models.SkinHealthScore.user_id == user.id
    ).order_by(models.SkinHealthScore.created_at.desc()).first()
    routines = db.query(models.Routine).filter(
        models.Routine.user_id == user.id, models.Routine.is_active == True
    ).all()
    unread_notifications = db.query(models.Notification).filter(
        models.Notification.user_id == user.id, models.Notification.is_read == False
    ).count()

    return {
        "full_name": user.full_name,
        "skin_type": profile.skin_type if profile else None,
        "latest_score": latest_score.overall_score if latest_score else None,
        "score_breakdown": {
            "condition": latest_score.condition_score,
            "lifestyle": latest_score.lifestyle_score,
            "sleep": latest_score.sleep_score,
            "routine": latest_score.routine_score,
            "hydration": latest_score.hydration_score,
        } if latest_score else None,
        "active_routines": len(routines),
        "unread_notifications": unread_notifications,
    }


@router.get("/consultant/clients")
def consultant_clients(user: models.User = Depends(require_roles("consultant", "dermatologist", "admin")),
                        db: Session = Depends(get_db)):
    clients = db.query(models.User).filter(models.User.role == "user").all()
    result = []
    for c in clients:
        latest_score = db.query(models.SkinHealthScore).filter(
            models.SkinHealthScore.user_id == c.id
        ).order_by(models.SkinHealthScore.created_at.desc()).first()
        profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == c.id).first()
        result.append({
            "id": c.id,
            "full_name": c.full_name,
            "email": c.email,
            "skin_type": profile.skin_type if profile else None,
            "concerns": json.loads(profile.concerns_json) if profile else [],
            "latest_score": latest_score.overall_score if latest_score else None,
        })
    return result


@router.get("/consultant/client/{client_id}")
def client_detail(client_id: int, user: models.User = Depends(require_roles("consultant", "dermatologist", "admin")),
                   db: Session = Depends(get_db)):
    client = db.query(models.User).filter(models.User.id == client_id).first()
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == client_id).first()
    assessments = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.user_id == client_id
    ).order_by(models.SkinAssessment.created_at.desc()).all()
    scores = db.query(models.SkinHealthScore).filter(
        models.SkinHealthScore.user_id == client_id
    ).order_by(models.SkinHealthScore.created_at.asc()).all()

    return {
        "id": client.id,
        "full_name": client.full_name,
        "email": client.email,
        "profile": {
            "skin_type": profile.skin_type if profile else None,
            "concerns": json.loads(profile.concerns_json) if profile else [],
            "allergies": json.loads(profile.allergies_json) if profile else [],
        },
        "assessments": [
            {"id": a.id, "condition_score": a.condition_score, "created_at": a.created_at,
             "concerns": json.loads(a.concerns_detected_json)} for a in assessments
        ],
        "score_history": [{"date": s.created_at, "score": s.overall_score} for s in scores],
    }


@router.get("/admin")
def admin_dashboard(user: models.User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    total_users = db.query(models.User).filter(models.User.role == "user").count()
    total_consultants = db.query(models.User).filter(models.User.role == "consultant").count()
    total_dermatologists = db.query(models.User).filter(models.User.role == "dermatologist").count()
    total_assessments = db.query(models.SkinAssessment).count()
    total_routines = db.query(models.Routine).count()

    return {
        "total_users": total_users,
        "total_consultants": total_consultants,
        "total_dermatologists": total_dermatologists,
        "total_assessments": total_assessments,
        "total_routines_generated": total_routines,
    }


@router.get("/admin/users")
def admin_all_users(user: models.User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [
        {"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "created_at": u.created_at}
        for u in users
    ]
