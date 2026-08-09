from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
class ChatRequest(BaseModel):
    message: str
    skin_type: str
    recommendations: list

@router.post("/assistant")
async def assistant(request: ChatRequest):

    return {
        "reply":
        f"You asked: {request.message}. "
        f"Your skin type is {request.skin_type}."
    }