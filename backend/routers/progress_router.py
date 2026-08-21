from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from deps import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/scores", response_model=list[schemas.ScoreOut])
def score_history(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.SkinHealthScore).filter(
        models.SkinHealthScore.user_id == user.id
    ).order_by(models.SkinHealthScore.created_at.asc()).all()
    return rows


@router.get("/trend")
def trend(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.SkinHealthScore).filter(
        models.SkinHealthScore.user_id == user.id
    ).order_by(models.SkinHealthScore.created_at.asc()).all()

    if len(rows) < 2:
        return {"trend": "not_enough_data", "change": 0, "first_score": rows[0].overall_score if rows else None,
                "latest_score": rows[-1].overall_score if rows else None}

    change = round(rows[-1].overall_score - rows[0].overall_score, 1)
    direction = "improving" if change > 0 else ("declining" if change < 0 else "stable")
    return {
        "trend": direction,
        "change": change,
        "first_score": rows[0].overall_score,
        "latest_score": rows[-1].overall_score,
        "history": [{"date": r.created_at, "score": r.overall_score} for r in rows],
    }


@router.post("/notes", response_model=schemas.ProgressEntryOut)
def add_note(payload: schemas.ProgressEntryIn, user: models.User = Depends(get_current_user),
             db: Session = Depends(get_db)):
    latest_score = db.query(models.SkinHealthScore).filter(
        models.SkinHealthScore.user_id == user.id
    ).order_by(models.SkinHealthScore.created_at.desc()).first()

    entry = models.ProgressEntry(
        user_id=user.id,
        score_id=latest_score.id if latest_score else None,
        note=payload.note,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {
        "id": entry.id, "note": entry.note, "created_at": entry.created_at,
        "overall_score": latest_score.overall_score if latest_score else None,
    }
