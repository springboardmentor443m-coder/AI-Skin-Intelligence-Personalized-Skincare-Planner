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

def generate_weekly_plan(skin_type, products):
    product_context = []

    for rank, product in enumerate(products, start=1):
        name = product.get("product_name", "")
        brand = product.get("brand_name", "")

        product_context.append(
            f"""
Product #{rank}
Product Name: {name}
Brand: {brand}
Category: {product.get("category")}
Subcategory: {product.get("subcategory")}
Rating: {product.get("rating")}
Reviews: {product.get("reviews")}
Price: ${product.get("price_usd")}
ML Recommendation Score: {product.get("recommendation_score")}
"""
        )

    products_text = "\n".join(product_context)

    prompt = f"""
Create a 7-day skincare plan for the detected concern.

Detected concern:
{skin_type}

ML-ranked product candidates:
{products_text}

STRICT PRODUCT GROUNDING RULES:

1. ONLY mention products whose exact Product Name appears
   in the ML-ranked product candidates.

2. NEVER invent products, ingredients, treatments,
   cleansers, moisturizers, sunscreens, or serums.

3. If the provided products are insufficient for a routine,
   use exactly:
   "No additional product selected"

4. Do not change the ML ranking.

5. Do not claim that any product medically treats a condition.

Create plans for exactly these seven days:

Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday

Each day MUST contain:

- morning
- night
- tip

Morning and night should contain either an exact product
name from the candidates or:
"No additional product selected"

The tip should be a short, general skincare-care tip.

Return ONLY valid JSON in exactly this structure:

{{
  "Monday": {{
    "morning": "product name or No additional product selected",
    "night": "product name or No additional product selected",
    "tip": "short skincare tip"
  }},
  "Tuesday": {{
    "morning": "product name or No additional product selected",
    "night": "product name or No additional product selected",
    "tip": "short skincare tip"
  }},
  "Wednesday": {{
    "morning": "product name or No additional product selected",
    "night": "product name or No additional product selected",
    "tip": "short skincare tip"
  }},
  "Thursday": {{
    "morning": "product name or No additional product selected",
    "night": "product name or No additional product selected",
    "tip": "short skincare tip"
  }},
  "Friday": {{
    "morning": "product name or No additional product selected",
    "night": "product name or No additional product selected",
    "tip": "short skincare tip"
  }},
  "Saturday": {{
    "morning": "product name or No additional product selected",
    "night": "product name or No additional product selected",
    "tip": "short skincare tip"
  }},
  "Sunday": {{
    "morning": "product name or No additional product selected",
    "night": "product name or No additional product selected",
    "tip": "short skincare tip"
  }}
}}
"""

    client = get_groq_client()

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a skincare planning assistant. "
                    "You must strictly ground all product mentions "
                    "in the supplied ML-ranked product list. "
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

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "error": "Weekly plan generation failed",
            "raw": content,
        }
def test_groq():
    client = get_groq_client()

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": "Say hello."
            }
        ]
    )

    return response.choices[0].message.content

def chat_with_skin_assistant(
    message,
    skin_type,
    recommendations
):
    prompt = f"""
You are a skincare planning assistant.

Detected skin concern:
{skin_type}

Recommended products:
{", ".join(recommendations)}

User question:
{message}

Rules:
1. Give safe, general skincare information.
2. Base your response on the detected concern.
3. Only mention products from the supplied recommended products.
4. Do not recommend prescription medicines.
5. Do not claim that a product medically treats a condition.
6. Keep the answer under 150 words.
7. If the question requires medical diagnosis or treatment,
   recommend consulting a qualified dermatologist.

Answer:
"""

    client = get_groq_client()

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a safe skincare assistant. "
                    "Stay grounded in the supplied information."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content