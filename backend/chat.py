import json
from typing import Optional, Dict, Any, List
# pyrefly: ignore [missing-import]
import jwt
from fastapi import APIRouter, Depends, HTTPException, Header, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

if __package__:
    from .database import get_db
    from .models.user import User
    from .models.chat import ChatHistory
    from .models.prediction import PredictionHistory
    from .models.skin_profile import SkinProfile
    from .services.chat_service import generate_chat_response, generate_chat_stream
else:
    from database import get_db
    from models.user import User
    from models.chat import ChatHistory
    from models.prediction import PredictionHistory
    from models.skin_profile import SkinProfile
    from services.chat_service import generate_chat_response, generate_chat_stream


router = APIRouter(prefix="/chat", tags=["chat"])

SECRET_KEY = "ai_skin_intelligence_super_secret_jwt_key_2026"
ALGORITHM = "HS256"


def get_current_user(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required.",
        )

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid or expired.",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    return user


class ChatRequest(BaseModel):
    question: str
    context: Optional[Dict[str, Any]] = None


@router.post("")
def chat_with_assistant(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = request.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty.",
        )

    if len(question) > 2000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is too long (maximum 2000 characters).",
        )

    # 1. Fetch user's past predictions from MySQL
    past_prediction_records = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == current_user.id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(10)
        .all()
    )
    past_predictions = [p.to_dict() for p in past_prediction_records]

    # 2. Fetch user's skin profile from MySQL
    skin_profile_record = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    skin_profile_dict = skin_profile_record.to_dict() if skin_profile_record else None

    # 3. Fetch user's recent chat history from MySQL for conversation memory
    past_chat_records = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(6)
        .all()
    )
    past_chat_records.reverse()  # Chronological order
    chat_history_list = [c.to_dict() for c in past_chat_records]

    # 4. Call AI Chat Service with skin profile context
    answer = generate_chat_response(
        question=question,
        user_name=current_user.full_name,
        current_prediction=request.context,
        past_predictions=past_predictions,
        skin_profile=skin_profile_dict,
        chat_history=chat_history_list,
    )

    # 5. Save conversation entry in MySQL chat_history table
    prediction_ref = None
    if request.context and isinstance(request.context, dict):
        prediction_ref = request.context.get("disease") or request.context.get(
            "prediction"
        )

    chat_entry = ChatHistory(
        user_id=current_user.id,
        question=question,
        answer=answer,
        prediction_reference=prediction_ref,
    )

    db.add(chat_entry)
    db.commit()
    db.refresh(chat_entry)

    return chat_entry.to_dict()


@router.post("/stream")
def stream_chat_endpoint(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = request.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty.",
        )

    if len(question) > 2000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is too long (maximum 2000 characters).",
        )

    # 1. Fetch user's past predictions from MySQL
    past_prediction_records = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == current_user.id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(10)
        .all()
    )
    past_predictions = [p.to_dict() for p in past_prediction_records]

    # 2. Fetch user's skin profile from MySQL
    skin_profile_record = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    skin_profile_dict = skin_profile_record.to_dict() if skin_profile_record else None

    # 3. Fetch user's recent chat history from MySQL for conversation memory
    past_chat_records = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(6)
        .all()
    )
    past_chat_records.reverse()
    chat_history_list = [c.to_dict() for c in past_chat_records]

    def sse_event_generator():
        full_answer_chunks = []
        stream_gen = generate_chat_stream(
            question=question,
            user_name=current_user.full_name,
            current_prediction=request.context,
            past_predictions=past_predictions,
            skin_profile=skin_profile_dict,
            chat_history=chat_history_list,
        )

        for chunk in stream_gen:
            full_answer_chunks.append(chunk)
            data_str = json.dumps({"chunk": chunk})
            yield f"data: {data_str}\n\n"

        full_answer = "".join(full_answer_chunks).strip()

        prediction_ref = None
        if request.context and isinstance(request.context, dict):
            prediction_ref = request.context.get("disease") or request.context.get(
                "prediction"
            )

        chat_entry = ChatHistory(
            user_id=current_user.id,
            question=question,
            answer=full_answer,
            prediction_reference=prediction_ref,
        )
        db.add(chat_entry)
        db.commit()
        db.refresh(chat_entry)

        done_payload = json.dumps({
            "done": True,
            "id": chat_entry.id,
            "created_at": (
                chat_entry.created_at.isoformat() if chat_entry.created_at else None
            ),
        })
        yield f"data: {done_payload}\n\n"

    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")


@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chats = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.asc())
        .all()
    )

    return {"history": [c.to_dict() for c in chats]}


@router.delete("/history")
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted_count = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .delete(synchronize_session=False)
    )
    db.commit()

    return {"message": "Chat history cleared successfully.", "deleted_count": deleted_count}


@router.delete("/{chat_id}")
def delete_chat_item(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat_item = (
        db.query(ChatHistory)
        .filter(ChatHistory.id == chat_id, ChatHistory.user_id == current_user.id)
        .first()
    )

    if not chat_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat message not found.",
        )

    db.delete(chat_item)
    db.commit()

    return {"message": f"Chat message {chat_id} deleted successfully."}
