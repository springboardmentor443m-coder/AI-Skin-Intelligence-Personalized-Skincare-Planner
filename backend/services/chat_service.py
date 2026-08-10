import os
from typing import List, Optional, Dict, Any
from groq import Groq

# Retrieve API key from environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client
client = None
try:
    if GROQ_API_KEY:
        client = Groq(api_key=GROQ_API_KEY)
except Exception as err:
    print(f"Warning: Failed to initialize Groq client: {err}")


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
) -> str:
    prompt = SYSTEM_BASE_PROMPT

    if user_name:
        prompt += f"\n\nUSER CONTEXT:\n- User's Name: {user_name}"

    if skin_profile:
        concerns_str = ", ".join(skin_profile.get("skin_concerns", [])) if isinstance(skin_profile.get("skin_concerns"), list) else str(skin_profile.get("skin_concerns", ""))
        prompt += (
            f"\n\nUSER PERSONALIZED SKIN PROFILE (MySQL Record):\n"
            f"- Age: {skin_profile.get('age', 25)}\n"
            f"- Gender: {skin_profile.get('gender', 'Unspecified')}\n"
            f"- Skin Type: {skin_profile.get('skin_type', 'Combination')}\n"
            f"- Primary Concerns: {concerns_str or 'None reported'}\n"
            f"- Known Allergies: {skin_profile.get('allergies', 'None')}\n"
            f"- Skin Sensitivity: {skin_profile.get('skin_sensitivity', 'Moderate')}\n"
            f"- Average Sleep: {skin_profile.get('sleep_hours', 7.5)} hours/night\n"
            f"- Daily Water Intake: {skin_profile.get('water_intake', 2.5)} Liters/day\n"
            f"- Lifestyle Activity: {skin_profile.get('lifestyle', 'Moderate')}\n"
            f"- Environmental Exposure: {skin_profile.get('environmental_exposure', 'Medium')}\n"
            "Use this personalized profile data whenever the user asks questions about their skin health (e.g. 'How is my skin?', 'What product works best for me?'), ensuring your recommendations take their specific skin type, allergies, and lifestyle into account."
        )

    if current_prediction and current_prediction.get("disease"):
        disease = current_prediction.get("disease")
        confidence = current_prediction.get("confidence", "N/A")
        recommendation = current_prediction.get("recommendation")

        prompt += (
            f"\n\nCURRENT LATEST SKIN SCAN CONTEXT:\n"
            f"- Detected Condition: {disease}\n"
            f"- Confidence Score: {confidence}\n"
        )
        if isinstance(recommendation, dict):
            desc = recommendation.get("description", "")
            prompt += f"- Analysis Guidance: {desc}\n"
        elif isinstance(recommendation, str):
            prompt += f"- Analysis Guidance: {recommendation}\n"

        prompt += (
            "Naturally incorporate this current analysis context when relevant to the user's question, "
            "answering specific concerns about what the condition means, severity, suitable ingredients/products, "
            "diet/foods to eat or avoid, and expected recovery or precautions."
        )

    if past_predictions and len(past_predictions) > 0:
        condition_counts = {}
        for p in past_predictions:
            d = p.get("disease")
            if d:
                condition_counts[d] = condition_counts.get(d, 0) + 1

        history_summary = ", ".join(
            [f"{count}x {disease}" for disease, count in condition_counts.items()]
        )
        prompt += (
            f"\n\nUSER PREVIOUS SKIN ANALYSIS HISTORY (MySQL Records):\n"
            f"- Past recorded conditions: {history_summary}\n"
            "Use this historical context to offer personalized long-term skincare advice (e.g. recurring acne care or barrier repair)."
        )

    return prompt


def generate_chat_response(
    question: str,
    user_name: Optional[str] = None,
    current_prediction: Optional[Dict[str, Any]] = None,
    past_predictions: Optional[List[Dict[str, Any]]] = None,
    skin_profile: Optional[Dict[str, Any]] = None,
    chat_history: Optional[List[Dict[str, str]]] = None,
) -> str:
    global client
    if not client:
        api_key = os.getenv("GROQ_API_KEY", GROQ_API_KEY)
        if api_key:
            client = Groq(api_key=api_key)

    if not client:
        return (
            "I am currently unable to process your request because the AI chat service is unavailable. "
            "Please check back shortly or verify your system configuration."
        )

    system_prompt = build_system_prompt(
        user_name=user_name,
        current_prediction=current_prediction,
        past_predictions=past_predictions,
        skin_profile=skin_profile,
    )

    messages = [{"role": "system", "content": system_prompt}]

    if chat_history:
        recent_history = chat_history[-6:]
        for msg in recent_history:
            if msg.get("question"):
                messages.append({"role": "user", "content": msg["question"]})
            if msg.get("answer"):
                messages.append({"role": "assistant", "content": msg["answer"]})

    messages.append({"role": "user", "content": question})

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as err:
        print(f"Error during Groq API completion call: {err}")
        return (
            "I encountered a temporary issue generating a response from the AI model. "
            "Please try asking your skincare question again."
        )


def generate_chat_stream(
    question: str,
    user_name: Optional[str] = None,
    current_prediction: Optional[Dict[str, Any]] = None,
    past_predictions: Optional[List[Dict[str, Any]]] = None,
    skin_profile: Optional[Dict[str, Any]] = None,
    chat_history: Optional[List[Dict[str, str]]] = None,
):
    global client
    if not client:
        api_key = os.getenv("GROQ_API_KEY", GROQ_API_KEY)
        if api_key:
            client = Groq(api_key=api_key)

    if not client:
        yield "I am currently unable to process your request because the AI chat service is unavailable. Please check your API key configuration."
        return

    system_prompt = build_system_prompt(
        user_name=user_name,
        current_prediction=current_prediction,
        past_predictions=past_predictions,
        skin_profile=skin_profile,
    )

    messages = [{"role": "system", "content": system_prompt}]

    if chat_history:
        recent_history = chat_history[-6:]
        for msg in recent_history:
            if msg.get("question"):
                messages.append({"role": "user", "content": msg["question"]})
            if msg.get("answer"):
                messages.append({"role": "assistant", "content": msg["answer"]})

    messages.append({"role": "user", "content": question})

    try:
        response_stream = client.chat.completions.create(
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
        print(f"Error during Groq API stream completion: {err}")
        yield "\n\n[System Notice: The AI service encountered a connection issue. Please try again.]"
