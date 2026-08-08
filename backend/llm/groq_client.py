# ==============================================================================
# backend/llm/groq_client.py
# ==============================================================================

from typing import AsyncIterator

from groq import AsyncGroq

from backend.config import GROQ_API_KEY, GROQ_MODEL


# ==============================================================================
# GROQ CLIENT
# ==============================================================================

class GroqClient:

    def __init__(self):

        if not GROQ_API_KEY:
            raise ValueError(
                "GROQ_API_KEY is not configured."
            )

        self.client = AsyncGroq(
            api_key=GROQ_API_KEY
        )

        self.model = GROQ_MODEL

    # ==========================================================================
    # NON-STREAMING GENERATION
    # ==========================================================================

    async def generate(
        self,
        messages: list[dict[str, str]]
    ) -> str:

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.5,
            max_completion_tokens=1024,
        )

        return response.choices[0].message.content or ""

    # ==========================================================================
    # STREAMING GENERATION
    # ==========================================================================

    async def stream(
        self,
        messages: list[dict[str, str]]
    ) -> AsyncIterator[str]:

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.5,
            max_completion_tokens=1024,
            stream=True,
        )

        async for chunk in response:

            content = chunk.choices[0].delta.content

            if content:
                yield content