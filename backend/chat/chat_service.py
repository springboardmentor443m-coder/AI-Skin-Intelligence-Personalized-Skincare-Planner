# ==============================================================================
# backend/chat/chat_service.py
# ==============================================================================

from typing import AsyncIterator

from backend.llm.groq_client import GroqClient
from backend.schemas.chat_request import ChatRequest

from backend.chat.prompt_builder import build_chat_prompt


# ==============================================================================
# CHAT SERVICE
# ==============================================================================

class ChatService:

    def __init__(self):
        self.llm = GroqClient()

    # ==========================================================================
    # STREAM CHAT RESPONSE
    # ==========================================================================

    async def stream_response(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[str]:

        # ----------------------------------------------------------------------
        # Build prompt
        # ----------------------------------------------------------------------

        prompt = build_chat_prompt(
            recommendation=request.recommendation,
            question=request.question,
        )

        # ----------------------------------------------------------------------
        # Build Groq messages
        # ----------------------------------------------------------------------

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful skincare assistant. "
                    "Answer questions about the user's existing "
                    "skincare recommendation."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ]

        # ----------------------------------------------------------------------
        # Stream response from Groq
        # ----------------------------------------------------------------------

        async for chunk in self.llm.stream(messages):
            yield chunk