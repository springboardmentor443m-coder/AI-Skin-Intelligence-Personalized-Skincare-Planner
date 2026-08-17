import os
import json
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
logger = logging.getLogger(__name__)

class ChatbotService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None

    def generate_chat_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        scan_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generates a clinical dermatologist response based on user message and facial scan context.
        """
        if not self.client:
            return (
                "I'm Dr. DermAI! Groq API Key is not configured on the server right now, "
                "so I can't generate dynamic AI responses. However, based on your scan, "
                "please follow your 7-Day Routine and use your 4 prescribed products daily!"
            )

        # Build clinical context prompt
        context_str = "No active skin scan loaded."
        if scan_context:
            analysis = scan_context.get("analysis", {})
            stype = analysis.get("skin_type", {}).get("prediction", "Unknown")
            sconcern = analysis.get("skin_concerns", {}).get("prediction", "Unknown")
            gender = scan_context.get("gender") or scan_context.get("target_profile", {}).get("gender", "Unisex")
            
            product_recs = scan_context.get("product_recommendations", {}).get("recommended_products", {})
            cleanser = product_recs.get("cleanser", {}).get("name", "Prescribed Cleanser")
            treatment = product_recs.get("treatment_serum", {}).get("name", "Prescribed Active Serum")
            moisturizer = product_recs.get("moisturizer", {}).get("name", "Prescribed Moisturizer")
            sunscreen = product_recs.get("sunscreen", {}).get("name", "Prescribed Sunscreen")

            context_str = f"""
PATIENT FACIAL SCAN & DIAGNOSTIC CONTEXT:
- Patient Gender: {gender}
- Diagnosed Skin Type: {stype}
- Primary Skin Concern: {sconcern}
- Prescribed Cleanser: {cleanser}
- Prescribed Treatment/Serum: {treatment}
- Prescribed Moisturizer: {moisturizer}
- Prescribed Sunscreen: {sunscreen}
"""

        system_instruction = f"""
You are Dr. DermAI, a Board-Certified Senior Clinical Dermatologist AI specializing in facial diagnostics, cosmetic chemistry, and skin cycling.

{context_str}

MANDATE & INSTRUCTIONS:
1. Answer the patient's question conversationally, scientifically, and empathetically.
2. Refer explicitly to the patient's diagnosed skin type ({stype if scan_context else 'skin profile'}), primary concern ({sconcern if scan_context else 'concerns'}), and prescribed product regimen where relevant.
3. Keep responses structured, concise, and easy to read (use bullet points or bold text where appropriate).
4. Provide safe clinical advice (e.g. patch testing, sun protection, barrier recovery when exfoliating).
"""

        messages = [{"role": "system", "content": system_instruction}]

        # Append conversation history (max last 6 turns)
        for msg in conversation_history[-6:]:
            role = "assistant" if msg.get("role") in ["assistant", "bot"] else "user"
            messages.append({"role": role, "content": msg.get("content", "")})

        # Append latest user query
        messages.append({"role": "user", "content": user_message})

        try:
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.5,
                max_tokens=600
            )
            return completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Error calling Groq API for Chatbot: {e}")
            return f"I apologize, I encountered a temporary network issue: {str(e)}. Please try asking your question again!"

chatbot_service = ChatbotService()
