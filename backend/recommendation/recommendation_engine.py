# ==============================================================================
# backend/recommendation/recommendation_engine.py
# ==============================================================================

from backend.schemas.recommendation_context import RecommendationContext
from backend.schemas.recommendation_response import RecommendationResponse
from backend.recommendation.prompt_builder import build_prompt
from backend.llm.gemini_client import GeminiClient


class RecommendationEngine:
    """
    Generates personalized skincare recommendations
    using gemini-3.5-flash.
    """

    def __init__(self):
        self.llm = GeminiClient()

    def generate(
        self,
        context: RecommendationContext
    ) -> RecommendationResponse:
        """
        Generate a recommendation from the supplied context.
        """

        # --------------------------------------------------------------
        # Build LLM prompt
        # --------------------------------------------------------------

        prompt = build_prompt(context)

        # --------------------------------------------------------------
        # Send image + prompt to Gemini
        # --------------------------------------------------------------

        response = self.llm.generate_recommendation(
            prompt=prompt,
            image_path=context.image_path
        )

        # --------------------------------------------------------------
        # Convert Gemini JSON response into our schema
        # --------------------------------------------------------------

        recommendation = RecommendationResponse.model_validate_json(
            response
        )

        return recommendation