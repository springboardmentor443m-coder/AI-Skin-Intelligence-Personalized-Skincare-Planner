from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import PreviousSkinHistory, User
from schemas import PreviousSkinHistoryRequest, PreviousSkinHistoryResponse

router = APIRouter(prefix="/skin-history", tags=["Previous Skin History"])


def _payload_dict(payload: PreviousSkinHistoryRequest) -> dict:
    return payload.model_dump(mode="json", exclude_unset=True)


@router.get("", response_model=PreviousSkinHistoryResponse, responses={204: {"description": "No skin history found for this user"}})
def get_skin_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = db.query(PreviousSkinHistory).filter(PreviousSkinHistory.user_id == current_user.id).first()
    if history is None:
        # Return 204 No Content instead of null — avoids Pydantic v2 Optional[Model]
        # serialization issue where model_validate(None) raises a validation error.
        return Response(status_code=204)
    return history


@router.post("", response_model=PreviousSkinHistoryResponse, status_code=status.HTTP_201_CREATED)
def create_skin_history(
    payload: PreviousSkinHistoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = db.query(PreviousSkinHistory).filter(PreviousSkinHistory.user_id == current_user.id).first()
    if history is None:
        history = PreviousSkinHistory(user_id=current_user.id)
        db.add(history)

    for key, value in _payload_dict(payload).items():
        setattr(history, key, value)

    db.commit()
    db.refresh(history)
    return history


@router.put("/{history_id}", response_model=PreviousSkinHistoryResponse)
def update_skin_history(
    history_id: int,
    payload: PreviousSkinHistoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = (
        db.query(PreviousSkinHistory)
        .filter(PreviousSkinHistory.id == history_id, PreviousSkinHistory.user_id == current_user.id)
        .first()
    )
    if history is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skin history not found.")

    for key, value in _payload_dict(payload).items():
        setattr(history, key, value)

    db.commit()
    db.refresh(history)
    return history


@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skin_history(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = (
        db.query(PreviousSkinHistory)
        .filter(PreviousSkinHistory.id == history_id, PreviousSkinHistory.user_id == current_user.id)
        .first()
    )
    if history is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skin history not found.")
    db.delete(history)
    db.commit()
    return None
