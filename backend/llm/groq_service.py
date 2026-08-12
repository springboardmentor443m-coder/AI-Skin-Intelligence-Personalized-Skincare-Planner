import os
import json
from pathlib import Path

from groq import Groq
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)


def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY not found. Check backend/.env"
        )

    return Groq(api_key=api_key)


def generate_weekly_plan(skin_type, products, user_profile=None):
    """
    Generate a personalized 7-day skincare plan using only
    products supplied by the ML recommendation pipeline.

    The LLM creates the plan, but the backend validates all
    product names before returning the result.
    """

    user_profile = user_profile or {}

    age = user_profile.get("age")
    gender = user_profile.get("gender")
    profile_skin_type = user_profile.get("skin_type")
    budget = user_profile.get("budget")
    skin_goals = user_profile.get("skin_goals")
    additional_details = user_profile.get("additional_details")

    # ---------------------------------------------------------
    # Prepare ML-ranked product candidates
    # ---------------------------------------------------------

    product_context = []

    for rank, product in enumerate(products or [], start=1):
        product_name = str(product.get("product_name") or "").strip()

        if not product_name:
            continue

        product_context.append(
            f"""
Product #{rank}
Product Name: {product_name}
Brand: {product.get("brand_name") or "Unknown"}
Category: {product.get("category") or "Unknown"}
Subcategory: {product.get("subcategory") or "Unknown"}
Rating: {product.get("rating") or "Not available"}
Reviews: {product.get("reviews") or "Not available"}
Price: ${product.get("price_usd") or "Not available"}
ML Recommendation Score: {product.get("recommendation_score") or "Not available"}
"""
        )

    products_text = "\n".join(product_context)

    # Exact product names allowed by the ML pipeline.
    allowed_products = [
        str(product.get("product_name")).strip()
        for product in (products or [])
        if product.get("product_name")
    ]

    # ---------------------------------------------------------
    # User profile
    # ---------------------------------------------------------

    profile_context = f"""
Age: {age or "Not provided"}
Gender: {gender or "Not provided"}
Self-reported Skin Type: {profile_skin_type or "Not provided"}
Monthly Budget: {budget or "Not provided"}
Skin Goals: {skin_goals or "Not provided"}
Additional Details: {additional_details or "Not provided"}
"""

    # ---------------------------------------------------------
    # LLM prompt
    # ---------------------------------------------------------

    prompt = f"""
You are the weekly skincare planning engine of an
AI-powered personalized skincare application.

Your job is to create a realistic, conservative and personalized
7-day skincare routine.

The plan MUST be based on:

1. The image-detected skin concern.
2. The user's self-reported profile.
3. The ML-ranked product candidates.

============================================================
PRIMARY IMAGE ANALYSIS
============================================================

Detected skin concern:
{skin_type}

============================================================
USER PROFILE
============================================================

{profile_context}

============================================================
ML-RANKED PRODUCT CANDIDATES
============================================================

{products_text}

============================================================
PERSONALIZATION RULES
============================================================

1. The image-detected concern is the primary analysis result.

2. Use the user's self-reported skin type as supporting context.

3. Prioritize the user's stated skin goals.

4. Respect the user's stated budget.

5. Consider age and additional details when useful.

6. The routine should be practical for a normal user.

7. Prefer a simple routine over a complicated routine.

8. Do not overload the user with many products.

9. Prefer higher-ranked ML recommendations when multiple
   suitable candidates are available.

10. Do not randomly introduce products simply to create variety.

11. A product can appear on multiple days if it is appropriate.

12. Recovery / simpler days are allowed and encouraged.

13. Do not invent medical diagnoses.

14. Do not claim that a product medically treats or cures
    a condition.

15. Do not recommend prescription medicines.

============================================================
STRICT PRODUCT GROUNDING
============================================================

This is extremely important.

You may ONLY use product names that appear EXACTLY in the
ML-ranked product candidates above.

Never:

- invent a product
- invent a brand
- invent an ingredient
- invent a serum
- invent a cleanser
- invent a moisturizer
- invent a sunscreen
- invent a treatment
- modify a product name
- create a product by combining names

If an appropriate product is unavailable, return exactly:

"No additional product selected"

Morning and night MUST contain either:

A) an exact Product Name from the candidate list

OR

B) "No additional product selected"

Do NOT place explanations inside morning or night.

============================================================
WEEKLY STRUCTURE
============================================================

Create exactly these seven days:

Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday

The week should feel like ONE coherent routine.

Do not make every day identical.

Possible day purposes include:

- Foundation
- Targeted care
- Maintenance
- Gentle/recovery day
- Barrier-support day
- Targeted care
- Weekly review/recovery

Only use these concepts when appropriate to the
available products and detected concern.

============================================================
DAILY FIELDS
============================================================

Every day MUST contain:

morning
night
tip
focus
reason
avoid

morning:
Exact product name OR "No additional product selected"

night:
Exact product name OR "No additional product selected"

tip:
Short, general skincare-care advice.

focus:
Short description of the day's main purpose.

reason:
One concise explanation of why the day fits the user's
profile, detected concern, goals or routine progression.

avoid:
One short general caution about avoiding excessive skincare,
overuse or unnecessary product switching.

Do not provide medical treatment instructions.

============================================================
OUTPUT REQUIREMENTS
============================================================

Return ONLY valid JSON.

Do not use Markdown.

Do not use code fences.

Do not add explanations outside the JSON.

Return exactly this structure:

{{
  "Monday": {{
    "morning": "exact product name or No additional product selected",
    "night": "exact product name or No additional product selected",
    "tip": "short skincare tip",
    "focus": "main purpose of the day",
    "reason": "why this day fits the user",
    "avoid": "short general caution"
  }},
  "Tuesday": {{
    "morning": "exact product name or No additional product selected",
    "night": "exact product name or No additional product selected",
    "tip": "short skincare tip",
    "focus": "main purpose of the day",
    "reason": "why this day fits the user",
    "avoid": "short general caution"
  }},
  "Wednesday": {{
    "morning": "exact product name or No additional product selected",
    "night": "exact product name or No additional product selected",
    "tip": "short skincare tip",
    "focus": "main purpose of the day",
    "reason": "why this day fits the user",
    "avoid": "short general caution"
  }},
  "Thursday": {{
    "morning": "exact product name or No additional product selected",
    "night": "exact product name or No additional product selected",
    "tip": "short skincare tip",
    "focus": "main purpose of the day",
    "reason": "why this day fits the user",
    "avoid": "short general caution"
  }},
  "Friday": {{
    "morning": "exact product name or No additional product selected",
    "night": "exact product name or No additional product selected",
    "tip": "short skincare tip",
    "focus": "main purpose of the day",
    "reason": "why this day fits the user",
    "avoid": "short general caution"
  }},
  "Saturday": {{
    "morning": "exact product name or No additional product selected",
    "night": "exact product name or No additional product selected",
    "tip": "short skincare tip",
    "focus": "main purpose of the day",
    "reason": "why this day fits the user",
    "avoid": "short general caution"
  }},
  "Sunday": {{
    "morning": "exact product name or No additional product selected",
    "night": "exact product name or No additional product selected",
    "tip": "short skincare tip",
    "focus": "main purpose of the day",
    "reason": "why this day fits the user",
    "avoid": "short general caution"
  }}
}}
"""

    # ---------------------------------------------------------
    # Call Groq
    # ---------------------------------------------------------

    client = get_groq_client()

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        max_completion_tokens=2200,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a careful skincare planning engine. "
                    "You must strictly ground every product name "
                    "in the supplied ML-ranked product candidates. "
                    "Never invent products, ingredients, diagnoses "
                    "or medical treatments. "
                    "Return valid JSON only."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        response_format={
            "type": "json_object"
        },
    )

    content = response.choices[0].message.content

    if not content:
        return {
            "error": "Weekly plan generation returned an empty response"
        }

    # ---------------------------------------------------------
    # Parse JSON
    # ---------------------------------------------------------

    try:
        plan = json.loads(content)
    except json.JSONDecodeError:
        return {
            "error": "Weekly plan generation returned invalid JSON",
            "raw": content,
        }

    # ---------------------------------------------------------
    # Backend validation
    # ---------------------------------------------------------

    required_days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]

    required_fields = [
        "morning",
        "night",
        "tip",
        "focus",
        "reason",
        "avoid",
    ]

    fallback_product = "No additional product selected"

    for day in required_days:

        # Missing day
        if not isinstance(plan.get(day), dict):
            plan[day] = {}

        day_plan = plan[day]

        # Ensure every required field exists
        for field in required_fields:
            value = day_plan.get(field)

            if not isinstance(value, str) or not value.strip():
                day_plan[field] = (
                    fallback_product
                    if field in ["morning", "night"]
                    else "Keep the routine simple and consistent."
                )

        # -----------------------------------------------------
        # Validate morning product
        # -----------------------------------------------------

        if day_plan["morning"] not in allowed_products:
            day_plan["morning"] = fallback_product

        # -----------------------------------------------------
        # Validate night product
        # -----------------------------------------------------

        if day_plan["night"] not in allowed_products:
            day_plan["night"] = fallback_product

    # ---------------------------------------------------------
    # Return only the seven expected days
    # ---------------------------------------------------------

    return {
        day: plan[day]
        for day in required_days
    }