# ==============================================================================
# backend/chat/prompt_builder.py
# ==============================================================================

import json

from backend.schemas.recommendation_response import RecommendationResponse


# ==============================================================================
# BUILD CHAT PROMPT
# ==============================================================================

def build_chat_prompt(
    recommendation: RecommendationResponse,
    question: str,
) -> str:
    """
    Builds the user message that will be sent to the chat LLM.

    The recommendation is the context for the conversation.
    The question is the user's current query.
    """

    recommendation_json = json.dumps(
        recommendation.model_dump(),
        indent=2,
    )

    prompt = f"""
Here is the skincare recommendation that was previously
generated for the user:

<recommendation>
{recommendation_json}
</recommendation>

The user now has the following question:

<question>
{question}
</question>

Answer the user's question based on the recommendation provided above.

Rules:

- Use the recommendation as the primary context.
- Do not invent specific products, prices, diagnoses, or treatments.
- Do not contradict the recommendation's warnings.
- If the answer cannot be determined from the recommendation,
  clearly say that the recommendation does not specify it.
- Keep the answer clear and easy to understand.
- This is informational skincare guidance and not a medical diagnosis.
"""

    return prompt.strip()