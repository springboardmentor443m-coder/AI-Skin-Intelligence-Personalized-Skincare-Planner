import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime

from database import get_db
from models import ChatMessage, SkinAssessment, User
from schemas import ChatRequest, ChatResponse, ChatMessageSchema
from auth import get_optional_current_user
from llm_chatbot import chatbot_engine

router = APIRouter(prefix="/api/chat", tags=["LLM Chatbot"])

@router.post("", response_model=ChatResponse)
def chat_with_bot(
    chat_in: ChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    session_id = chat_in.session_id or "default-session"
    user_id = current_user.id if current_user else None

    # Load session history from SQLite database
    history_records = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp.asc()).all()
    history = [{"role": msg.role, "content": msg.content} for msg in history_records]

    # Load assessment metrics context if assessment_id provided or get latest for user
    assessment_data = None
    if chat_in.assessment_id:
        asm = db.query(SkinAssessment).filter(SkinAssessment.id == chat_in.assessment_id).first()
        if asm:
            assessment_data = {
                "estimated_age": asm.estimated_age,
                "skin_type": asm.skin_type,
                "overall_score": asm.overall_score,
                "metrics": json.loads(asm.metrics_json)
            }
    elif user_id:
        asm = db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).order_by(SkinAssessment.created_at.desc()).first()
        if asm:
            assessment_data = {
                "estimated_age": asm.estimated_age,
                "skin_type": asm.skin_type,
                "overall_score": asm.overall_score,
                "metrics": json.loads(asm.metrics_json)
            }

    # Save User message to Database
    user_msg_record = ChatMessage(
        user_id=user_id,
        session_id=session_id,
        role="user",
        content=chat_in.message,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(user_msg_record)
    db.commit()

    # Generate response from Gemini LLM Engine
    bot_reply = chatbot_engine.generate_response(
        user_message=chat_in.message,
        history=history,
        assessment_data=assessment_data
    )

    # Save Assistant response to Database
    bot_msg_record = ChatMessage(
        user_id=user_id,
        session_id=session_id,
        role="assistant",
        content=bot_reply,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(bot_msg_record)
    db.commit()

    return ChatResponse(
        response=bot_reply,
        session_id=session_id,
        timestamp=bot_msg_record.timestamp
    )

@router.get("/history", response_model=List[ChatMessageSchema])
def get_chat_history(
    session_id: str = "default-session",
    db: Session = Depends(get_db)
):
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp.asc()).all()
    return messages
