import os
from dotenv import load_dotenv
from groq import Groq

BASE_DIR = os.path.dirname(__file__)
for env_path in [os.path.join(BASE_DIR, ".env"), os.path.join(BASE_DIR, "..", ".env")]:
    if os.path.exists(env_path):
        load_dotenv(env_path, override=False)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def build_chat_messages(question, context=None):
    system_prompt = "You are an AI skincare assistant. Answer only skincare-related questions."

    if context and context.get("condition"):
        confidence = context.get("confidence")
        if isinstance(confidence, (int, float)):
            confidence_label = f"{round(float(confidence) * 100)}%"
        else:
            confidence_label = confidence if confidence is not None else "unknown"
        recommendation = context.get("recommendation") or "No recommendation available."
        system_prompt += (
            " Use the latest skin analysis context when answering. "
            f"The user’s latest skin analysis shows condition: {context['condition']}. "
            f"Confidence: {confidence_label}. "
            f"Recommendation: {recommendation}. "
            "Mention this context naturally and tailor advice to it."
        )

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": question,
        },
    ]

    return messages


def ask_groq(question, context=None):
    api_key = os.getenv("GROQ_API_KEY") or GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set.")
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=build_chat_messages(question, context),
    )

    return response.choices[0].message.content