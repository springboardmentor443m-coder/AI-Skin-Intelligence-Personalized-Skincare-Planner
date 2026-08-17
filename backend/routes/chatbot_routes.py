from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.chatbot_service import chatbot_service

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    context: Optional[Dict[str, Any]] = None

@router.post("/ask", tags=["Dermatologist Chatbot"])
async def ask_dermatologist_chatbot(payload: ChatRequest):
    """
    Ask a question to Dr. DermAI (Groq LLM Llama-3.3-70B) with facial scan context & recommended products.
    """
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    history_dicts = [m.dict() for m in payload.conversation_history] if payload.conversation_history else []
    
    reply = chatbot_service.generate_chat_response(
        user_message=payload.message,
        conversation_history=history_dicts,
        scan_context=payload.context
    )
    
    return {"reply": reply}
