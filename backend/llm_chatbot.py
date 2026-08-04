import os
import json
from typing import Optional, Dict, Any

try:
    from google import genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

class LLMChatbot:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.client = None
        if GENAI_AVAILABLE and self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Gemini Client Init Warning: {e}")

    def generate_response(self, user_message: str, history: list = None, assessment_data: Optional[Dict[str, Any]] = None) -> str:
        # Build context from assessment metrics if available
        context_str = ""
        if assessment_data:
            age = assessment_data.get("estimated_age", "N/A")
            stype = assessment_data.get("skin_type", "N/A")
            score = assessment_data.get("overall_score", "N/A")
            metrics = assessment_data.get("metrics", {})

            context_str = f"\n[USER SKIN SCAN CONTEXT: Est. Age {age}y, Skin Type: {stype}, Overall Health Score: {score}/100.\n"
            if isinstance(metrics, dict):
                for k, v in metrics.items():
                    if isinstance(v, dict):
                        context_str += f" - {k}: {v.get('score', '')}/100 ({v.get('status', '')})\n"
            context_str += "]"

        system_instruction = (
            "You are SkinIntellect AI, a board-certified clinical dermatology consultant and skincare formulator. "
            "You provide empathetic, evidence-based, age-tailored, and ingredient-focused skincare recommendations. "
            "Always include active ingredients (e.g. Niacinamide, Hyaluronic Acid, Retinoids, Vitamin C, Centella) "
            "and suggest morning/evening routine steps. Avoid making medical diagnoses, but give expert guidance."
        )

        # Attempt Gemini API call if configured
        if self.client:
            try:
                contents = []
                if history:
                    for msg in history[-6:]: # Include last 6 messages
                        contents.append(f"{msg['role'].capitalize()}: {msg['content']}")
                
                full_prompt = f"{system_instruction}\n{context_str}\nUser Question: {user_message}"
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=full_prompt,
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"Gemini API call error (falling back to domain LLM engine): {e}")

        # Intelligent Fallback Skincare LLM Engine
        msg_lower = user_message.lower()

        if "routine" in msg_lower or "morning" in msg_lower or "night" in msg_lower or "evening" in msg_lower:
            reply = (
                "🌿 **Personalized Skincare Routine Plan**\n\n"
                "**Morning Routine (Protect & Hydrate):**\n"
                "1. **Gentle Cleanser**: pH-balanced hydrating cleanser with Centella Asiatica.\n"
                "2. **Antioxidant Serum**: 10% Vitamin C + Ferulic Acid to brighten tone and shield against pollution.\n"
                "3. **Barrier Moisturizer**: Light gel-cream with Ceramides & Hyaluronic Acid.\n"
                "4. **Broad-Spectrum Sunscreen**: SPF 50+ PA++++ non-comedogenic physical/chemical sunscreen.\n\n"
                "**Evening Routine (Repair & Renew):**\n"
                "1. **Double Cleanse**: Micellar water / cleansing oil followed by gentle foam cleanser.\n"
                "2. **Active Treatment**: 2% BHA (Salicylic Acid) or Encapsulated Retinol 0.2% (alternate nights).\n"
                "3. **Nourishing Cream**: Peptide & Niacinamide rich repair cream to strengthen stratum corneum barrier."
            )
        elif "spot" in msg_lower or "pigment" in msg_lower or "dark" in msg_lower or "sun" in msg_lower:
            reply = (
                "✨ **Targeting Dark Spots & Hyperpigmentation**\n\n"
                "Based on dermatological formulation science, key active ingredients to fade stubborn pigmentation include:\n"
                "- **Tranexamic Acid (3-5%)**: Inhibits UV-induced melanin synthesis.\n"
                "- **Alpha Arbutin (2%)**: Safely targets hyperpigmentation without skin irritation.\n"
                "- **Niacinamide (5%)**: Prevents melanosome transfer to upper epidermal cells.\n"
                "- **Strict Sun Protection**: Apply broad-spectrum SPF 50+ daily to prevent spot darkening."
            )
        elif "acne" in msg_lower or "blemish" in msg_lower or "pimple" in msg_lower or "pylons" in msg_lower:
            reply = (
                "💧 **Blemish & Inflammation Defense Plan**\n\n"
                "To calm active breakouts and unclog pores:\n"
                "1. **Salicylic Acid (BHA 2%)**: Penetrates deep into lipid pores to dissolve sebum buildup.\n"
                "2. **Azelaic Acid (10%)**: Powerful anti-inflammatory ingredient that reduces redness and post-acne marks.\n"
                "3. **Zinc PCA + Centella**: Soothes irritation and regulates excessive oil production.\n"
                "4. *Pro-Tip*: Avoid harsh scrub exfoliants which spread bacteria. Opt for gentle chemical exfoliation 2-3x weekly."
            )
        elif "wrinkle" in msg_lower or "age" in msg_lower or "aging" in msg_lower or "firm" in msg_lower:
            reply = (
                "🌸 **Pro-Aging & Collagen Renewal Strategy**\n\n"
                "To enhance skin elasticity and smooth fine lines:\n"
                "- **Retinoid / Tretinoin**: The gold standard for boosting cell turnover and dermal collagen synthesis.\n"
                "- **Copper Tripeptide-1**: Stimulates elastin production and repairs tissue matrix.\n"
                "- **Polyglutamic Acid**: Holds 4x more moisture than Hyaluronic Acid, plumping surface lines instantly.\n"
                "- **Daily Broad-Spectrum Sunscreen**: Prevents 80% of premature photoaging."
            )
        else:
            reply = (
                f"Hello! I am your AI Skincare Consultant.{context_str}\n\n"
                "How can I assist your skin journey today? I can help customize routines, analyze ingredient safety, "
                "address specific concerns like hydration or texture, or explain your recent digital scan results!"
            )

        return reply

chatbot_engine = LLMChatbot()
