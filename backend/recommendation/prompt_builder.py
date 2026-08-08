# ==============================================================================
# backend/recommendation/prompt_builder.py
# ==============================================================================

from backend.schemas.recommendation_context import RecommendationContext


# ==============================================================================
# BUILD PROMPT
# ==============================================================================

def build_prompt(context: RecommendationContext) -> str:
    """
    Builds the prompt that will be sent to the LLM.
    """

    prediction_text = "\n".join(
        [
            f"- {prediction.label}: {prediction.confidence:.2f}%"
            for prediction in context.predictions
        ]
    )

    profile = context.user_profile

    prompt = f"""
You are an experienced dermatologist and skincare consultant.

Your task is to generate personalized skincare recommendations.

==============================
MODEL PREDICTIONS
==============================

{prediction_text}

==============================
USER PROFILE
==============================

Age: {profile.age}
Gender: {profile.gender}
Country: {profile.country}
Skin Type: {profile.skin_type}
Budget: {profile.budget}

==============================
ADDITIONAL DETAILS
==============================

{profile.additional_details}

==============================
TASK
==============================

Based on the model predictions, the uploaded image, and the user's
profile, generate personalized skincare recommendations.

1. Skin Summary
   - Explain the main skin concerns identified from the model predictions
     and visual information.
   - Do not claim a medical diagnosis.

2. Morning Skincare Routine
   - Provide 3-5 practical steps.
   - Each step must contain an action and a reason.

3. Night Skincare Routine
   - Provide 3-5 practical steps.
   - Each step must contain an action and a reason.

4. Recommended Products
   - Provide 3-5 product TYPES appropriate for the user's concerns,
     skin type, country, and budget.
   - Explain why each product type is recommended.
   - Do not invent specific product names, prices, ratings, or product links.

5. Diet Recommendations
   - Provide practical dietary recommendations relevant to the user's
     context.
   - Do not claim that diet can cure a skin condition.

6. Lifestyle Recommendations
   - Provide practical lifestyle recommendations relevant to the user's
     context.

7. Warnings
   - Mention potential irritation, contraindications, or situations
     where professional dermatological advice would be appropriate.
   - If no specific warning is necessary, return an empty list.

==============================
IMPORTANT OUTPUT FORMAT
==============================

Return ONLY valid JSON.

Use EXACTLY these top-level field names:

- skin_summary
- morning_routine
- night_routine
- recommended_products
- diet_recommendations
- lifestyle_recommendations
- warnings

Each morning_routine and night_routine item MUST have exactly:

{{
    "step": 1,
    "action": "...",
    "reason": "..."
}}

Each recommended_products item MUST have exactly:

{{
    "product_type": "...",
    "reason": "..."
}}

Use "product_type" exactly.
Do NOT use "type".
Do NOT use "product_name".

Do not omit required fields.
"""

    return prompt.strip()