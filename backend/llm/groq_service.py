import os
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

def generate_weekly_plan(
    skin_type,
    products
):
    product_context = []

    allowed_product_names = []

    for rank, product in enumerate(products, start=1):
        name = product.get("product_name", "")
        brand = product.get("brand_name", "")

        allowed_product_names.append(name)

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

1. You may ONLY mention products whose exact Product Name
   appears in the ML-ranked product candidates above.

2. NEVER invent a cleanser, sunscreen, moisturizer, serum,
   ingredient, treatment, or any other product that is not
   explicitly present in the candidates.

3. Do not write phrases such as:
   "not provided", "use a gentle cleanser", or
   "wear sunscreen" as product recommendations.

4. If the provided products are insufficient for a particular
   routine, write "No additional product selected" instead
   of inventing one.

5. The ML recommendation score represents the ranking produced
   by the recommendation engine. Do not change the ranking.

6. Use the actual product names, not "Product #1", etc.

Generate Monday through Sunday.

For each day provide:

Morning:
- One selected product or "No additional product selected"

Night:
- One selected product or "No additional product selected"

Tip:
- One short general skincare tip.

Do not claim that any product medically treats a condition.

Return only the 7-day plan.
"""

    client = get_groq_client()

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a skincare planning assistant. "
                    "You must strictly ground product mentions "
                    "in the supplied ML-ranked product list."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={
            "type": "json_object"
        }
    )

    return response.choices[0].message.content