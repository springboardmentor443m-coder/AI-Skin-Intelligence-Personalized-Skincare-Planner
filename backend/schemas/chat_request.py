# ==============================================================================
# backend/schemas/chat_request.py
# ==============================================================================

from pydantic import BaseModel, Field

from backend.schemas.recommendation_response import RecommendationResponse


# ==============================================================================
# CHAT REQUEST
# ==============================================================================

class ChatRequest(BaseModel):

    recommendation: RecommendationResponse

    question: str = Field(
        ...,
        min_length=1,
        description="User's question about the skincare recommendation."
    )