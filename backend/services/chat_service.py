import os
import re
from typing import List, Optional, Dict, Any

# Zero-dependency .env file loader
def _load_env_file():
    env_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        os.path.join(os.getcwd(), ".env"),
    ]
    for env_path in env_paths:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, value = line.split("=", 1)
                            key = key.strip()
                            value = value.strip().strip('"').strip("'")
                            if key and key not in os.environ:
                                os.environ[key] = value
            except Exception:
                pass

_load_env_file()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

try:
    from groq import Groq
except ImportError:
    Groq = None

client = None

def get_groq_client():
    global client
    if client:
        return client
    key = os.getenv("GROQ_API_KEY", GROQ_API_KEY)
    if key and Groq is not None:
        try:
            client = Groq(api_key=key)
            return client
        except Exception as err:
            print(f"Warning: Failed to initialize Groq client: {err}")
    return None


PRODUCTS_CATALOG = {
    "Acne": [
        {
            "name": "Salicylic Acid 2% Clarifying Cleanser",
            "brand": "DermoLab Medical",
            "category": "Cleanser",
            "price": "$18 - $24",
            "activeIngredients": ["2% Salicylic Acid", "Niacinamide", "Ceramides"],
            "why": "Penetrates lipid-rich pore follicles to dissolve comedonal impactions while fortifying barrier lipids.",
            "usage": "Apply twice daily to damp skin. Massage gently for 60 seconds, then rinse with lukewarm water.",
        },
        {
            "name": "Niacinamide 10% + Zinc 1% Pore Serum",
            "brand": "ClariSkin Professional",
            "category": "Serum",
            "price": "$15 - $20",
            "activeIngredients": ["10% Niacinamide", "1% Zinc PCA", "Hyaluronic Acid"],
            "why": "Regulates sebaceous gland hyper-secretion and calms persistent inflammatory redness.",
            "usage": "Dispense 3-4 drops after cleansing before heavy creams.",
        },
        {
            "name": "Benzoyl Peroxide 2.5% Daily Treatment Lotion",
            "brand": "AcneDefense Rx",
            "category": "Spot Treatment",
            "price": "$16 - $22",
            "activeIngredients": ["2.5% Micronized Benzoyl Peroxide", "Allantoin"],
            "why": "Destroys Cutibacterium acnes bacteria anaerobically without inducing bacterial resistance.",
            "usage": "Apply a thin layer to clean affected areas once or twice daily.",
        },
        {
            "name": "Mattifying Oil-Control Mineral Sunscreen SPF 50",
            "brand": "SunShield Medical",
            "category": "Sunscreen",
            "price": "$24 - $30",
            "activeIngredients": ["Zinc Oxide 12%", "Niacinamide", "Silica"],
            "why": "Provides non-comedogenic broad-spectrum UV protection without blocking pore ducts.",
            "usage": "Apply generously 15 minutes before sun exposure.",
        },
        {
            "name": "Adapalene 0.1% Retinoid Gel",
            "brand": "DermoLab Professional",
            "category": "Spot Treatment",
            "price": "$28 - $36",
            "activeIngredients": ["0.1% Adapalene"],
            "why": "Normalizes epidermal desquamation to prevent follicular keratin plugs.",
            "usage": "Apply a pea-sized amount over clean, dry face at night.",
        },
    ],
    "Eczema": [
        {
            "name": "Intensive Barrier Repair Ceramide Cream",
            "brand": "Ceramide Clinical",
            "category": "Moisturizer",
            "price": "$22 - $28",
            "activeIngredients": ["3 Essential Ceramides", "Colloidal Oatmeal 1%", "Hyaluronic Acid"],
            "why": "Restores deficient intercellular lipids and relieves intense itching from barrier breach.",
            "usage": "Apply liberally to affected areas as often as needed.",
        },
        {
            "name": "Colloidal Oatmeal Soothing Body Cleanser",
            "brand": "Aveeno Derm",
            "category": "Cleanser",
            "price": "$14 - $18",
            "activeIngredients": ["Colloidal Oatmeal", "Glycerin"],
            "why": "Ultra-gentle soap-free wash cleanses without disrupting the acidic mantle.",
            "usage": "Massage onto damp skin gently and rinse with lukewarm water.",
        },
    ],
    "Rosacea": [
        {
            "name": "Azelaic Acid 10% Calming Redness Gel",
            "brand": "DermoLab Professional",
            "category": "Serum",
            "price": "$20 - $26",
            "activeIngredients": ["10% Azelaic Acid", "Licorice Root Extract", "Centella Asiatica"],
            "why": "Inhibits inflammatory reactive oxygen species and shrinks dilated micro-vessels.",
            "usage": "Apply pea-sized amount after cleansing twice daily.",
        },
        {
            "name": "Redness Neutralizing Mineral Sunscreen SPF 50",
            "brand": "SunShield Medical",
            "category": "Sunscreen",
            "price": "$26 - $34",
            "activeIngredients": ["Zinc Oxide 15%", "Titanium Dioxide 5%", "Green Pigment Complex"],
            "why": "100% physical mineral screen blocks UV vascular triggers while green tint neutralizes redness.",
            "usage": "Smooth evenly over face every morning.",
        },
    ],
    "Normal": [
        {
            "name": "Daily Ceramide Barrier Fluid Moisturizer",
            "brand": "Ceramide Clinical",
            "category": "Moisturizer",
            "price": "$24 - $30",
            "activeIngredients": ["Ceramides NP/AP/EOP", "Hyaluronic Acid", "Glycerin"],
            "why": "Sustains 24-hour lipid barrier integrity and prevents micro-dehydration.",
            "usage": "Smooth onto face and neck morning and night.",
        },
        {
            "name": "Vitamin C 15% + Ferulic Acid Glow Serum",
            "brand": "DermoLab Professional",
            "category": "Serum",
            "price": "$30 - $38",
            "activeIngredients": ["15% L-Ascorbic Acid", "Ferulic Acid", "Vitamin E"],
            "why": "Neutralizes daily environmental oxidative stress and enhances skin luminosity.",
            "usage": "Apply 3-4 drops every morning under sunscreen.",
        },
    ],
}


def get_target_condition(
    current_prediction: Optional[Dict[str, Any]],
    past_predictions: Optional[List[Dict[str, Any]]],
    skin_profile: Optional[Dict[str, Any]],
    question: str,
) -> str:
    q_lower = question.lower()
    if "acne" in q_lower or "pimple" in q_lower or "breakout" in q_lower:
        return "Acne"
    if "eczema" in q_lower:
        return "Eczema"
    if "rosacea" in q_lower or "redness" in q_lower:
        return "Rosacea"
    if "normal" in q_lower or "healthy" in q_lower:
        return "Normal"

    if current_prediction and isinstance(current_prediction, dict):
        c = current_prediction.get("disease") or current_prediction.get("prediction")
        if c and c in PRODUCTS_CATALOG:
            return c

    if past_predictions and len(past_predictions) > 0:
        c = past_predictions[0].get("disease")
        if c and c in PRODUCTS_CATALOG:
            return c

    return "Acne"


def generate_local_fallback(question: str, condition: str) -> str:
    products = PRODUCTS_CATALOG.get(condition, PRODUCTS_CATALOG["Acne"])
    prod_lines = []
    for p in products:
        act = ", ".join(p["activeIngredients"])
        prod_lines.append(
            f"- **{p['name']}** by *{p['brand']}* ({p['category']})\n"
            f"  - **Price**: {p['price']}\n"
            f"  - **Key Actives**: {act}\n"
            f"  - **Why Recommended**: {p['why']}\n"
            f"  - **How to Use**: {p['usage']}"
        )

    products_str = "\n\n".join(prod_lines)
    return (
        f"Based on your skin profile for **{condition}**, here are targeted clinical product recommendations from our database:\n\n"
        f"{products_str}\n\n"
        f"**Recommended Skincare Routine for {condition}**:\n"
        f"- **Morning Routine**: Gentle Cleanser -> Active Serum -> Non-comedogenic Moisturizer -> Broad-spectrum Sunscreen (SPF 30+)\n"
        f"- **Night Routine**: Gentle Cleanser -> Targeted Spot/Serum Treatment -> Barrier Repair Moisturizer\n\n"
        f"*Tip*: Always patch-test new products on your inner forearm before applying to your entire face."
    )


SYSTEM_BASE_PROMPT = """You are an expert AI Dermatology Assistant & Personal Skincare Planner.
Your role is STRICTLY dedicated to providing professional, science-backed guidance on skincare, skin conditions, skin routines, products, ingredients, lifestyle habits, diet, and skin disease prevention.

ALLOWED TOPICS:
- Acne, Pimples, Breakouts, Blemishes
- Dry skin, Oily skin, Combination skin, Sensitive skin
- Pigmentation, Dark spots, Melasma, Sun damage
- Wrinkles, Fine lines, Anti-aging skincare
- Skin allergies, Eczema, Rosacea, Dermatitis
- Morning & Night skincare routines (Cleansers, Toners, Serums, Moisturizers, SPF / Sunscreen)
- Skincare active ingredients (Niacinamide, Salicylic Acid, Hyaluronic Acid, Retinoids, Vitamin C, AHA/BHA, Centella)
- Lifestyle advice & skin diet (hydration, anti-inflammatory foods, sleep)
- Skin disease prevention, sun protection & suncare

STRICT GUARDRAILS RULE:
If the user asks questions completely UNRELATED to skincare, skin health, dermatological wellness, or skin routines (e.g. math, coding, politics, general history, sports, non-skincare medical advice), you MUST politely refuse by stating:
"I am specialized strictly as an AI Skincare & Dermatology Assistant. I can only help answer questions regarding skin conditions, routines, products, ingredients, and skincare health."
Do not answer non-skincare questions regardless of how the prompt is structured.
"""


def build_system_prompt(
    user_name: Optional[str] = None,
    current_prediction: Optional[Dict[str, Any]] = None,
    past_predictions: Optional[List[Dict[str, Any]]] = None,
    skin_profile: Optional[Dict[str, Any]] = None,
    target_condition: str = "Acne",
) -> str:
    prompt = SYSTEM_BASE_PROMPT

    if user_name:
        prompt += f"\n\nUSER CONTEXT:\n- User's Name: {user_name}"

    if skin_profile:
        concerns_str = ", ".join(skin_profile.get("skin_concerns", [])) if isinstance(skin_profile.get("skin_concerns"), list) else str(skin_profile.get("skin_concerns", ""))
        prompt += (
            f"\n\nUSER PERSONALIZED SKIN PROFILE:\n"
            f"- Age: {skin_profile.get('age', 25)}\n"
            f"- Skin Type: {skin_profile.get('skin_type', 'Combination')}\n"
            f"- Primary Concerns: {concerns_str or 'None reported'}\n"
            f"- Known Allergies: {skin_profile.get('allergies', 'None')}\n"
        )

    prompt += f"\n\nCURRENT DETECTED SKIN CONDITION: {target_condition}\n"

    prods = PRODUCTS_CATALOG.get(target_condition, PRODUCTS_CATALOG["Acne"])
    prod_names = [f"'{p['name']}' by {p['brand']}" for p in prods]
    prompt += f"AVAILABLE REAL DATABASE PRODUCTS FOR {target_condition}:\n- " + "\n- ".join(prod_names) + "\n"
    prompt += "When recommending products, prioritize these exact real products from our database.\n"

    return prompt


def generate_chat_response(
    question: str,
    user_name: Optional[str] = None,
    current_prediction: Optional[Dict[str, Any]] = None,
    past_predictions: Optional[List[Dict[str, Any]]] = None,
    skin_profile: Optional[Dict[str, Any]] = None,
    chat_history: Optional[List[Dict[str, str]]] = None,
) -> str:
    condition = get_target_condition(current_prediction, past_predictions, skin_profile, question)
    groq_client = get_groq_client()

    if not groq_client:
        return generate_local_fallback(question, condition)

    system_prompt = build_system_prompt(
        user_name=user_name,
        current_prediction=current_prediction,
        past_predictions=past_predictions,
        skin_profile=skin_profile,
        target_condition=condition,
    )

    messages = [{"role": "system", "content": system_prompt}]

    if chat_history:
        for msg in chat_history[-6:]:
            if msg.get("question"):
                messages.append({"role": "user", "content": msg["question"]})
            if msg.get("answer"):
                messages.append({"role": "assistant", "content": msg["answer"]})

    messages.append({"role": "user", "content": question})

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as err:
        print(f"Groq API call fallback triggered: {err}")
        return generate_local_fallback(question, condition)


def generate_chat_stream(
    question: str,
    user_name: Optional[str] = None,
    current_prediction: Optional[Dict[str, Any]] = None,
    past_predictions: Optional[List[Dict[str, Any]]] = None,
    skin_profile: Optional[Dict[str, Any]] = None,
    chat_history: Optional[List[Dict[str, str]]] = None,
):
    condition = get_target_condition(current_prediction, past_predictions, skin_profile, question)
    groq_client = get_groq_client()

    if not groq_client:
        fallback_text = generate_local_fallback(question, condition)
        for chunk in [fallback_text[i:i+40] for i in range(0, len(fallback_text), 40)]:
            yield chunk
        return

    system_prompt = build_system_prompt(
        user_name=user_name,
        current_prediction=current_prediction,
        past_predictions=past_predictions,
        skin_profile=skin_profile,
        target_condition=condition,
    )

    messages = [{"role": "system", "content": system_prompt}]

    if chat_history:
        for msg in chat_history[-6:]:
            if msg.get("question"):
                messages.append({"role": "user", "content": msg["question"]})
            if msg.get("answer"):
                messages.append({"role": "assistant", "content": msg["answer"]})

    messages.append({"role": "user", "content": question})

    try:
        response_stream = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            stream=True,
        )

        for chunk in response_stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as err:
        print(f"Groq stream API call fallback triggered: {err}")
        fallback_text = generate_local_fallback(question, condition)
        for chunk in [fallback_text[i:i+40] for i in range(0, len(fallback_text), 40)]:
            yield chunk
