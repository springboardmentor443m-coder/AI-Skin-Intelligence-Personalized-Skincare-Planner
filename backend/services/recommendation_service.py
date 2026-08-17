"""
services/recommendation_service.py — Skin-care Recommendation Service
=======================================================================
Pure functions that map a predicted HAM10000 skin-lesion class to:
  1. Product recommendations (from backend/data/products.json)
  2. Personalised daily skin-care routine
  3. Dermatologist consultation guidance

Design principles:
  - No database access. All data is static / computed in Python.
  - Products are loaded ONCE from JSON at import time.
  - Safe by design: any loading error returns empty lists / defaults.
  - Medical safety: HIGH-risk conditions return fewer products and
    much stronger disclaimers. Products are NEVER presented as treatments.

IMPORTANT — Medical safety statement:
  Products are presented as GENERAL SKIN-CARE SUPPORT only.
  They are NOT treatments for any skin condition.
  High-risk conditions (mel, bcc, akiec) prioritise dermatologist
  consultation above any product recommendation.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ── Load products catalogue ONCE at import time ───────────────────────────────
_DATA_DIR       = Path(__file__).resolve().parent.parent / "data"
_PRODUCTS_FILE  = _DATA_DIR / "products.json"

try:
    with open(_PRODUCTS_FILE, "r", encoding="utf-8") as _f:
        _PRODUCTS_CATALOGUE: Dict[str, List[Dict]] = json.load(_f).get("products", {})
    logger.info(
        "[recommendation_service] Loaded %d condition entries from products.json",
        len(_PRODUCTS_CATALOGUE),
    )
except Exception as _exc:
    logger.warning(
        "[recommendation_service] Could not load products.json — "
        "product recommendations will be empty. Error: %s", _exc
    )
    _PRODUCTS_CATALOGUE = {}


# ── Constants ─────────────────────────────────────────────────────────────────

HIGH_RISK_CLASSES = {"akiec", "bcc", "mel"}
LOW_RISK_CLASSES  = {"bkl", "df", "nv", "vasc"}

SAFETY_DISCLAIMER = (
    "⚠️ EDUCATIONAL GUIDANCE ONLY — These product suggestions are for general "
    "skin-care information. They are NOT medical treatments and are NOT recommended "
    "as substitutes for professional medical evaluation or prescribed therapy. "
    "Always consult a qualified dermatologist or healthcare professional before "
    "starting or changing any skin-care regimen."
)

HIGH_RISK_SAFETY_NOTE = (
    "⚠️ IMPORTANT: The AI result for this image falls into a HIGH-RISK category. "
    "Product suggestions below are for GENERAL SKIN CARE ONLY and must NOT be used "
    "to self-treat this condition. Please consult a qualified dermatologist or "
    "healthcare professional as soon as possible."
)


# ── Public API ────────────────────────────────────────────────────────────────

def get_products_for_condition(
    predicted_class: str,
    risk_level: str,
) -> List[Dict]:
    """
    Return product recommendations for the given predicted class.

    - High-risk conditions are capped at 2 products so the UI prioritises
      the dermatologist guidance section over product browsing.
    - Returns an empty list (not an error) if no products are catalogued.
    """
    products = _PRODUCTS_CATALOGUE.get(predicted_class, [])
    if predicted_class in HIGH_RISK_CLASSES:
        return products[:2]
    return products


def get_routine_for_condition(
    predicted_class: str,
    risk_level: str,
    skin_type: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Return a structured daily skin-care routine for the given condition.

    High-risk conditions produce a conservative routine that strongly
    emphasises professional consultation over product steps.
    """
    if predicted_class in HIGH_RISK_CLASSES:
        return _high_risk_routine(predicted_class)
    return _low_risk_routine(predicted_class, skin_type)


def get_dermatologist_guidance(
    predicted_class: str,
    risk_level: str,
) -> Dict[str, Any]:
    """
    Return dermatologist consultation guidance scaled to the condition risk.

    Returns:
        Dict with keys: urgency, urgency_message, warning_signs, general_advice
    """
    if predicted_class == "mel":
        return {
            "urgency": "urgent",
            "urgency_message": (
                "The AI result suggests a melanoma-class finding. "
                "Please consult a qualified dermatologist or oncologist AS SOON AS POSSIBLE. "
                "Do not delay — early professional evaluation is critically important for high-risk lesions. "
                "This AI result is for educational purposes only and is NOT a confirmed diagnosis."
            ),
            "warning_signs": [
                "Asymmetry — one half of the lesion does not match the other",
                "Irregular, notched, or scalloped borders",
                "Uneven colour — multiple shades of brown, black, red, or white in one lesion",
                "Diameter larger than 6 mm (roughly the size of a pencil eraser)",
                "Evolution — any recent change in size, shape, colour, or new symptoms",
                "Bleeding, crusting, or oozing without injury",
                "Persistent itching or pain that does not resolve",
                "New satellite spots appearing near the lesion",
            ],
            "general_advice": (
                "The ABCDE rule (Asymmetry, Border, Colour, Diameter, Evolution) is a widely used "
                "guide for monitoring pigmented lesion changes. If you observe any of the warning "
                "signs above, seek medical evaluation without delay. This AI result is educational "
                "context only — only a qualified clinician with appropriate diagnostic tools can "
                "confirm or rule out a diagnosis."
            ),
        }

    elif predicted_class in {"bcc", "akiec"}:
        return {
            "urgency": "soon",
            "urgency_message": (
                "The AI result suggests a potentially high-risk skin finding. "
                "We strongly encourage you to consult a qualified dermatologist for an "
                "in-person evaluation at your earliest convenience. "
                "This AI result is for educational purposes only and is NOT a confirmed diagnosis."
            ),
            "warning_signs": [
                "Any change in size, shape, or colour of the lesion",
                "Bleeding or oozing without injury",
                "Persistent itching, tenderness, or burning sensation",
                "A wound or sore that does not heal after several weeks",
                "Redness or swelling spreading beyond the lesion border",
                "New lesions appearing nearby",
                "Shiny, pearly, or translucent appearance in the lesion",
            ],
            "general_advice": (
                "Do not attempt to self-treat high-risk lesions. Avoid applying home remedies, "
                "caustic substances, or aggressive products to the area. Only a qualified clinician "
                "using appropriate diagnostic tools (dermoscopy, biopsy) can determine the "
                "true nature of the lesion."
            ),
        }

    else:
        # Low / Medium risk — nv, bkl, df, vasc
        return {
            "urgency": "routine",
            "urgency_message": (
                "The AI result is within a lower-risk category. A routine skin check with a "
                "dermatologist is still recommended — especially if you notice any changes in "
                "the lesion over time, or if anything concerns you."
            ),
            "warning_signs": [
                "Rapid increase in the size of the lesion",
                "Change in shape or the borders becoming irregular",
                "Colour changes or multiple new colours appearing",
                "New symptoms: itching, pain, bleeding, or crusting",
                "A lesion that looks noticeably different from your other moles or skin marks",
                "Any change that concerns you — trust your instincts and seek advice",
            ],
            "general_advice": (
                "Monitor the area regularly using the ABCDE rule (Asymmetry, Border, Colour, "
                "Diameter, Evolution). If you notice any of the warning signs above, or if the "
                "lesion concerns you in any way, book an appointment with a dermatologist. "
                "Annual skin checks are recommended for anyone with multiple moles or a family "
                "history of skin conditions."
            ),
        }


# ── Private routine builders ──────────────────────────────────────────────────

def _low_risk_routine(
    predicted_class: str,
    skin_type: Optional[str],
) -> Dict[str, Any]:
    """Build a comprehensive daily routine for low-risk conditions."""

    # Condition-specific contextual note added to daily habits
    condition_notes: Dict[str, str] = {
        "nv":   "Avoid picking or scratching moles. Monitor for changes using the ABCDE rule monthly.",
        "bkl":  "Gentle exfoliation may support skin texture — always patch-test new products first.",
        "df":   "Avoid traumatising (scratching, picking) the dermatofibroma area.",
        "vasc": "Avoid very hot water on affected areas, as heat can worsen vascular redness.",
    }
    specific_note = condition_notes.get(
        predicted_class,
        "Maintain a consistent, gentle routine suited to your skin type.",
    )

    # Tailor moisturiser step to skin type if known
    if skin_type in {"oily", "combination"}:
        moisturiser_desc = (
            "Apply a lightweight, oil-free gel moisturiser suited to oily or combination skin. "
            "Avoid heavy creams that may clog pores."
        )
    elif skin_type == "dry":
        moisturiser_desc = (
            "Apply a rich ceramide or hyaluronic acid moisturiser to support a dry skin barrier. "
            "Reapply as needed throughout the day."
        )
    else:
        moisturiser_desc = (
            "Apply a moisturiser suited to your skin type to hydrate and support your skin barrier."
        )

    return {
        "morning": [
            {
                "step": 1,
                "title": "Gentle Cleansing",
                "description": (
                    "Use a mild, fragrance-free cleanser with lukewarm water. "
                    "Avoid scrubbing or applying pressure to any lesion areas. "
                    "Pat the skin gently dry with a clean towel."
                ),
            },
            {
                "step": 2,
                "title": "Serum (Optional)",
                "description": (
                    "If you use a serum (antioxidant, hydrating, or niacinamide), apply 2–4 drops "
                    "to clean, dry skin. Avoid applying directly on or around any lesion area. "
                    "Wait 30 seconds before the next step."
                ),
            },
            {
                "step": 3,
                "title": "Moisturise",
                "description": moisturiser_desc,
            },
            {
                "step": 4,
                "title": "Sunscreen — SPF 50+",
                "description": (
                    "Apply a broad-spectrum SPF 50+ sunscreen generously to all exposed areas. "
                    "This is the most important step in any skin-protection routine. "
                    "Apply even on cloudy days or when indoors near windows."
                ),
            },
        ],
        "daytime": {
            "do": [
                "Reapply sunscreen every 2 hours when outdoors",
                "Seek shade, especially between 10 am and 4 pm when UV is strongest",
                "Wear protective clothing, sunglasses, and a wide-brimmed hat",
                "Stay well-hydrated — aim for 6–8 glasses of water daily",
                "Photograph the lesion periodically to detect any gradual changes",
            ],
            "avoid": [
                "Scratching, picking, or rubbing any lesion area",
                "Applying unverified home remedies or caustic substances",
                "Excessive or unprotected sun exposure and tanning beds",
                "Using harsh physical scrubs or exfoliants directly on lesion areas",
                "Sharing personal skin-care tools or items that touch the lesion",
            ],
        },
        "night": [
            {
                "step": 1,
                "title": "Thorough Cleansing",
                "description": (
                    "Remove sunscreen, makeup, and daily impurities with your gentle cleanser. "
                    "Double cleansing (oil cleanser first, then water-based) is optional. "
                    "Rinse thoroughly with lukewarm water."
                ),
            },
            {
                "step": 2,
                "title": "Prescribed Treatment (if applicable)",
                "description": (
                    "Apply any clinician-prescribed topical product as directed. "
                    "If no prescription applies, skip this step. Do not self-medicate."
                ),
            },
            {
                "step": 3,
                "title": "Moisturise",
                "description": (
                    "Apply a nourishing moisturiser to support overnight skin repair. "
                    "A ceramide-rich cream is excellent for barrier support during sleep."
                ),
            },
        ],
        "daily_habits": [
            f"Condition tip: {specific_note}",
            "Drink 6–8 glasses of water daily to support skin hydration from within",
            "Eat a balanced diet rich in antioxidants — berries, leafy greens, nuts, and fish",
            "Get 7–9 hours of quality sleep to support skin cell regeneration",
            "Avoid smoking — it accelerates skin ageing and impairs wound healing",
            "Exercise moderately — good circulation benefits skin health",
            "Check all moles and skin marks monthly using the ABCDE rule",
            "Schedule an annual skin check with a qualified dermatologist",
            "Keep a photo diary of your lesion to detect gradual changes over time",
        ],
    }


def _high_risk_routine(predicted_class: str) -> Dict[str, Any]:
    """
    Build a conservative daily routine for high-risk conditions.
    Prioritises safety and professional consultation over product steps.
    """
    urgency_map: Dict[str, str] = {
        "mel":   "Please prioritise arranging a dermatologist appointment above all other steps.",
        "bcc":   "A dermatologist evaluation is strongly recommended at your earliest convenience.",
        "akiec": "Professional evaluation is important. Do not self-treat the lesion area.",
    }
    urgency_note = urgency_map.get(predicted_class, "Please consult a dermatologist promptly.")

    return {
        "morning": [
            {
                "step": 1,
                "title": "Ultra-Gentle Cleansing",
                "description": (
                    "Use a very gentle, fragrance-free cleanser with cool or lukewarm water. "
                    "Do NOT scrub, rub, or apply any pressure to the lesion area. "
                    "Pat dry very carefully with a clean towel."
                ),
            },
            {
                "step": 2,
                "title": "Sunscreen — SPF 50+ (Highest Priority)",
                "description": (
                    "Apply a broad-spectrum SPF 50+ sunscreen to ALL exposed skin. "
                    "For high-risk conditions, minimising UV exposure is especially important. "
                    "Apply liberally and reapply every 2 hours when outdoors."
                ),
            },
        ],
        "daytime": {
            "do": [
                "Seek shade as much as possible — minimise all unnecessary UV exposure",
                "Wear full-coverage protective clothing, a wide-brimmed hat, and UV-protective sunglasses",
                "Reapply SPF 50+ sunscreen every 2 hours when outdoors",
                f"⚕️ Priority action: {urgency_note}",
                "Keep the area clean and dry unless otherwise directed by a clinician",
                "Document the lesion with clear, well-lit photographs for your medical appointment",
            ],
            "avoid": [
                "Do NOT self-treat, apply home remedies, or use any unverified products on the lesion",
                "Avoid ALL scratching, picking, rubbing, or applying pressure to the lesion",
                "Avoid harsh skincare ingredients (retinoids, AHAs, BHAs) near the lesion unless prescribed",
                "Do not delay seeking professional medical evaluation",
                "Avoid tanning beds and any deliberate UV exposure",
                "Avoid applying cosmetics or makeup directly on or around the lesion",
            ],
        },
        "night": [
            {
                "step": 1,
                "title": "Gentle Cleansing",
                "description": (
                    "Gently remove sunscreen and any cosmetics with a mild, fragrance-free cleanser. "
                    "Use cool or lukewarm water only. Avoid rubbing the lesion area."
                ),
            },
            {
                "step": 2,
                "title": "Clinician-Prescribed Treatment Only",
                "description": (
                    "Apply ONLY products or topical treatments prescribed by your dermatologist. "
                    "Do NOT use any over-the-counter treatment on the lesion without medical advice. "
                    "Skip this step if no prescription is currently in place."
                ),
            },
            {
                "step": 3,
                "title": "Gentle Moisturiser (Unaffected Areas)",
                "description": (
                    "Apply a fragrance-free, gentle moisturiser to unaffected areas of the face/body "
                    "to maintain overall skin health and comfort. "
                    "Avoid the lesion area unless your clinician advises otherwise."
                ),
            },
        ],
        "daily_habits": [
            f"⚕️ Priority: {urgency_note}",
            "Document any changes in the lesion (size, shape, colour, symptoms) daily with photographs",
            "Avoid all unnecessary sun exposure — wear protective clothing at all times when outdoors",
            "Keep the area clean and do NOT attempt to self-treat with any home remedies",
            "Stay well-hydrated and eat a healthy, balanced diet to support overall immune health",
            "Avoid smoking and excessive alcohol — both negatively impact skin health and healing",
            "Share the AI result printout or screenshot with your dermatologist as background context (NOT as a diagnosis)",
            "Prepare a list of questions and a timeline of changes to discuss at your appointment",
        ],
    }
