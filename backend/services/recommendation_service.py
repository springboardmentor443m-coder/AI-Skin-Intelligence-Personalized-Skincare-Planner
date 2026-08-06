import os
import json
import logging
from typing import Dict, Any, List
from groq import Groq

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Popular, highly-rated world-class skincare products repository
POPULAR_PRODUCTS = {
    "cleansers": {
        "Oily": [
            {
                "name": "CeraVe Foaming Facial Cleanser",
                "brand": "CeraVe",
                "actives": ["Ceramides", "Niacinamide", "Hyaluronic Acid"],
                "why": "Deeply cleanses and removes excess oil without disrupting the protective skin barrier.",
                "rating": 4.8,
                "price": "$15.99"
            },
            {
                "name": "La Roche-Posay Effaclar Purifying Foaming Gel",
                "brand": "La Roche-Posay",
                "actives": ["Zinc PCA", "Thermal Spring Water"],
                "why": "Eliminates impurities and excess sebum while leaving skin clean and fresh.",
                "rating": 4.7,
                "price": "$22.99"
            }
        ],
        "Dry": [
            {
                "name": "CeraVe Hydrating Facial Cleanser",
                "brand": "CeraVe",
                "actives": ["Ceramides 1, 3, 6-II", "Hyaluronic Acid"],
                "why": "Non-foaming lotion cleanser that hydrates while restoring barrier function.",
                "rating": 4.8,
                "price": "$15.99"
            },
            {
                "name": "La Roche-Posay Toleriane Hydrating Gentle Cleanser",
                "brand": "La Roche-Posay",
                "actives": ["Prebiotic Thermal Water", "Ceramide-3", "Niacinamide"],
                "why": "Gentle cream formula maintains essential moisture for dry, delicate skin.",
                "rating": 4.7,
                "price": "$17.99"
            }
        ],
        "Combination": [
            {
                "name": "COSRX Low pH Good Morning Gel Cleanser",
                "brand": "COSRX",
                "actives": ["Tea Tree Oil", "BHA (Betaine Salicylate)"],
                "why": "Mildly acidic gel cleanser that balances T-zone oiliness while keeping cheeks hydrated.",
                "rating": 4.7,
                "price": "$14.00"
            },
            {
                "name": "Youth To The People Superfood Gentle Antioxidant Cleanser",
                "brand": "Youth To The People",
                "actives": ["Kale", "Spinach", "Green Tea"],
                "why": "Rich gel cleanser packed with phytonutrients that balances combination skin types.",
                "rating": 4.6,
                "price": "$39.00"
            }
        ],
        "Sensitive": [
            {
                "name": "Cetaphil Gentle Skin Cleanser",
                "brand": "Cetaphil",
                "actives": ["Glycerin", "Niacinamide", "Panthenol"],
                "why": "Ultra-mild, non-irritating formula clinically tested for sensitive skin.",
                "rating": 4.7,
                "price": "$13.99"
            },
            {
                "name": "Anua Heartleaf 77% Soothing Gentle Cleansing Foam",
                "brand": "Anua",
                "actives": ["Heartleaf Extract (Houttuynia Cordata)", "Centella"],
                "why": "K-Beauty holy grail for calming redness and irritation during cleansing.",
                "rating": 4.8,
                "price": "$18.00"
            }
        ],
        "Normal": [
            {
                "name": "Kiehl's Ultra Facial Cleanser",
                "brand": "Kiehl's",
                "actives": ["Squalane", "Avocado Oil", "Vitamin E"],
                "why": "Thoroughly cleanses without stripping natural oils, keeping normal skin perfectly balanced.",
                "rating": 4.6,
                "price": "$25.00"
            },
            {
                "name": "CeraVe Hydrating Facial Cleanser",
                "brand": "CeraVe",
                "actives": ["Ceramides", "Hyaluronic Acid"],
                "why": "Maintains optimal moisture balance and healthy skin barrier.",
                "rating": 4.8,
                "price": "$15.99"
            }
        ]
    },
    "treatments_serums": {
        "inflammatory acne": [
            {
                "name": "Paula's Choice 2% BHA Liquid Exfoliant",
                "brand": "Paula's Choice",
                "actives": ["2% Salicylic Acid", "Green Tea Extract"],
                "why": "Global bestseller that unclogs pores, clears breakout-causing bacteria, and reduces inflammation.",
                "rating": 4.8,
                "price": "$35.00"
            },
            {
                "name": "La Roche-Posay Effaclar Duo Dual Action Acne Treatment",
                "brand": "La Roche-Posay",
                "actives": ["5% Benzoyl Peroxide", "Micro-Exfoliating LHA"],
                "why": "Targets active acne pimples and blemishes rapidly within 3 days.",
                "rating": 4.6,
                "price": "$24.99"
            }
        ],
        "non inflammatory acne black heads": [
            {
                "name": "Paula's Choice 2% BHA Liquid Exfoliant",
                "brand": "Paula's Choice",
                "actives": ["2% Salicylic Acid"],
                "why": "Oil-soluble acid penetrates deep inside pores to dissolve stubborn blackheads and sebum build-up.",
                "rating": 4.8,
                "price": "$35.00"
            },
            {
                "name": "The Ordinary Niacinamide 10% + Zinc 1%",
                "brand": "The Ordinary",
                "actives": ["10% Niacinamide", "1% Zinc PCA"],
                "why": "Regulates sebum activity and visibly minimizes blackhead recurrence.",
                "rating": 4.5,
                "price": "$6.00"
            }
        ],
        "non inflammatory acne white heads": [
            {
                "name": "COSRX AHA 7 Whitehead Power Liquid",
                "brand": "COSRX",
                "actives": ["7% Glycolic Acid (AHA)", "Pyrus Malus Fruit Water"],
                "why": "Gently exfoliates the surface of the skin to unclog trapped keratin and clear whiteheads.",
                "rating": 4.7,
                "price": "$19.00"
            },
            {
                "name": "The Ordinary Lactic Acid 10% + HA",
                "brand": "The Ordinary",
                "actives": ["10% Lactic Acid", "Tasmanian Pepperberry"],
                "why": "Milder AHA exfoliation suitable for revealing smooth skin texture.",
                "rating": 4.6,
                "price": "$8.90"
            }
        ],
        "dark spots": [
            {
                "name": "SkinCeuticals C E Ferulic",
                "brand": "SkinCeuticals",
                "actives": ["15% L-Ascorbic Acid", "1% Alpha Tocopherol", "0.5% Ferulic Acid"],
                "why": "Gold standard vitamin C serum that fades hyperpigmentation and protects against free radicals.",
                "rating": 4.9,
                "price": "$182.00"
            },
            {
                "name": "The Ordinary Alpha Arbutin 2% + HA",
                "brand": "The Ordinary",
                "actives": ["2% Alpha Arbutin", "Hyaluronic Acid"],
                "why": "Inhibits melanin synthesis to fade stubborn dark spots and sun damage.",
                "rating": 4.6,
                "price": "$11.10"
            }
        ],
        "pigmentation": [
            {
                "name": "Topicals Faded Serum for Dark Spots & Discoloration",
                "brand": "Topicals",
                "actives": ["Tranexamic Acid", "Niacinamide", "Azelaic Acid", "Kojic Acid"],
                "why": "Multi-active hyperpigmentation treatment clinically proven to even out skin tone.",
                "rating": 4.7,
                "price": "$38.00"
            },
            {
                "name": "Numbuzin No.5 Goodbye Blemish Serum",
                "brand": "Numbuzin",
                "actives": ["75% Vitamin Tree Extract", "Niacinamide", "Alpha Arbutin"],
                "why": "Popular K-Beauty serum for targeted spot brightening and tone correction.",
                "rating": 4.8,
                "price": "$21.00"
            }
        ],
        "wrinkles": [
            {
                "name": "The Ordinary Retinol 0.5% in Squalane",
                "brand": "The Ordinary",
                "actives": ["0.5% Pure Retinol", "Squalane"],
                "why": "Stimulates cell turnover and collagen synthesis to smooth fine lines and wrinkles.",
                "rating": 4.6,
                "price": "$9.80"
            },
            {
                "name": "RoC Retinol Correxion Deep Wrinkle Serum",
                "brand": "RoC",
                "actives": ["Pure RoC Retinol", "Mineral Complex"],
                "why": "Clinically proven to visibly reduce deep wrinkles and firm aging skin.",
                "rating": 4.7,
                "price": "$29.99"
            }
        ],
        "Redness": [
            {
                "name": "Paula's Choice 10% Azelaic Acid Booster",
                "brand": "Paula's Choice",
                "actives": ["10% Azelaic Acid", "Salicylic Acid", "Licorice Root"],
                "why": "Calms redness, reduces rosacea-prone irritation, and evens skin discolouration.",
                "rating": 4.8,
                "price": "$39.00"
            },
            {
                "name": "Skin1004 Madagascar Centella Ampoule",
                "brand": "Skin1004",
                "actives": ["100% Centella Asiatica Extract"],
                "why": "Pure soothing ampoule that instantly calms redness and repairs compromised skin.",
                "rating": 4.9,
                "price": "$17.00"
            }
        ],
        "pores": [
            {
                "name": "Niacinamide 10% + Zinc 1%",
                "brand": "The Ordinary",
                "actives": ["Niacinamide", "Zinc"],
                "why": "Visibly tightens enlarged pores and regulates sebum production.",
                "rating": 4.6,
                "price": "$6.00"
            },
            {
                "name": "Paula's Choice Niacinamide 20% Treatment",
                "brand": "Paula's Choice",
                "actives": ["20% Niacinamide", "Vitamin C", "Licorice Extract"],
                "why": "High-strength treatment targeted at stretched, sagging, or clogged pores.",
                "rating": 4.7,
                "price": "$52.00"
            }
        ],
        "Normal": [
            {
                "name": "Beauty of Joseon Glow Serum",
                "brand": "Beauty of Joseon",
                "actives": ["60% Propolis Extract", "2% Niacinamide"],
                "why": "Provides luminous glow and hydration for healthy, balanced skin.",
                "rating": 4.8,
                "price": "$17.00"
            },
            {
                "name": "The Ordinary Hyaluronic Acid 2% + B5",
                "brand": "The Ordinary",
                "actives": ["Multi-Molecular Hyaluronic Acid", "Pro-Vitamin B5"],
                "why": "Delivers multi-depth hydration to maintain plumping and radiance.",
                "rating": 4.6,
                "price": "$8.90"
            }
        ]
    },
    "moisturizers": {
        "Oily": [
            {
                "name": "Neutrogena Hydro Boost Water Gel",
                "brand": "Neutrogena",
                "actives": ["Hyaluronic Acid", "Amino Acids", "Electrolytes"],
                "why": "Oil-free, non-comedogenic gel moisturizer that hydrates deeply without grease.",
                "rating": 4.7,
                "price": "$19.99"
            },
            {
                "name": "La Roche-Posay Toleriane Double Repair Matte Face Moisturizer",
                "brand": "La Roche-Posay",
                "actives": ["Ceramide-3", "Niacinamide", "Perlite + Silica"],
                "why": "Provides all-day hydration while absorbing excess shine for a matte finish.",
                "rating": 4.6,
                "price": "$21.99"
            }
        ],
        "Dry": [
            {
                "name": "CeraVe Moisturizing Cream",
                "brand": "CeraVe",
                "actives": ["3 Essential Ceramides", "Hyaluronic Acid"],
                "why": "Rich, non-greasy cream that provides 48-hour hydration for dry and compromised skin.",
                "rating": 4.9,
                "price": "$17.99"
            },
            {
                "name": "Illiyoon Ceramide Ato Concentrate Cream",
                "brand": "Illiyoon",
                "actives": ["Ceramide Skin Complex Capsule", "Panax Ginseng"],
                "why": "Famous K-beauty deep moisture cream that locks in hydration all day.",
                "rating": 4.9,
                "price": "$19.00"
            }
        ],
        "Combination": [
            {
                "name": "COSRX Oil-Free Ultra-Moisturizing Lotion with Birch Sap",
                "brand": "COSRX",
                "actives": ["70% Birch Sap", "Hyaluronic Acid"],
                "why": "Weightless lotion that balances dry cheeks and oily T-zone naturally.",
                "rating": 4.7,
                "price": "$18.00"
            },
            {
                "name": "CeraVe PM Facial Moisturizing Lotion",
                "brand": "CeraVe",
                "actives": ["Niacinamide", "Ceramides", "Hyaluronic Acid"],
                "why": "Lightweight night lotion that calms and repairs combination skin.",
                "rating": 4.8,
                "price": "$15.99"
            }
        ],
        "Sensitive": [
            {
                "name": "La Roche-Posay Cicaplast Baume B5+ Soothing Cream",
                "brand": "La Roche-Posay",
                "actives": ["5% Panthenol (Vitamin B5)", "Madecassoside", "Tribioma"],
                "why": "Emergency skin barrier balm that rapidly soothes redness, peeling, and sensitivity.",
                "rating": 4.9,
                "price": "$16.99"
            },
            {
                "name": "SoonJung 2x Barrier Intensive Cream",
                "brand": "Etude",
                "actives": ["Panthenol", "Madecassoside", "Shea Butter"],
                "why": "Hypoallergenic cream formulated with low pH to strengthen sensitive skin.",
                "rating": 4.8,
                "price": "$17.00"
            }
        ],
        "Normal": [
            {
                "name": "CeraVe Daily Moisturizing Lotion",
                "brand": "CeraVe",
                "actives": ["Ceramides", "Hyaluronic Acid"],
                "why": "Smooth, lightweight hydration that keeps normal skin soft and nourished.",
                "rating": 4.8,
                "price": "$14.99"
            },
            {
                "name": "La Roche-Posay Toleriane Double Repair Face Moisturizer",
                "brand": "La Roche-Posay",
                "actives": ["Ceramide-3", "Niacinamide", "Glycerin"],
                "why": "Restores natural skin barrier after 1 hour of application.",
                "rating": 4.7,
                "price": "$21.99"
            }
        ]
    },
    "sunscreens": {
        "All": [
            {
                "name": "Beauty of Joseon Relief Sun : Rice + Probiotics SPF50+ PA++++",
                "brand": "Beauty of Joseon",
                "actives": ["30% Rice Extract", "Grain Probiotics Complex"],
                "why": "World's most popular daily sunscreen. Lightweight, zero white-cast, non-greasy finish.",
                "rating": 4.9,
                "price": "$18.00"
            },
            {
                "name": "La Roche-Posay Anthelios Melt-in Milk Sunscreen SPF 60",
                "brand": "La Roche-Posay",
                "actives": ["Cell-Ox Shield Antioxidant Technology", "Avobenzone"],
                "why": "Dermatologist-recommended broad spectrum UVA/UVB protection for face & body.",
                "rating": 4.8,
                "price": "$25.99"
            },
            {
                "name": "EltaMD UV Clear Broad-Spectrum SPF 46",
                "brand": "EltaMD",
                "actives": ["Zinc Oxide", "Niacinamide", "Hyaluronic Acid"],
                "why": "Top choice for acne-prone, sensitive, and hyperpigmentation-prone skin.",
                "rating": 4.8,
                "price": "$43.00"
            }
        ]
    }
}

class RecommendationService:
    @staticmethod
    def get_product_recommendations(skin_type: str, skin_concern: str) -> Dict[str, Any]:
        """Returns popular, expert-curated products matched to skin type & concern."""
        
        stype = skin_type.capitalize() if skin_type else "Normal"
        sconcern = skin_concern if skin_concern in POPULAR_PRODUCTS["treatments_serums"] else "Normal"
        
        cleansers = POPULAR_PRODUCTS["cleansers"].get(stype, POPULAR_PRODUCTS["cleansers"]["Normal"])
        treatments = POPULAR_PRODUCTS["treatments_serums"].get(sconcern, POPULAR_PRODUCTS["treatments_serums"]["Normal"])
        moisturizers = POPULAR_PRODUCTS["moisturizers"].get(stype, POPULAR_PRODUCTS["moisturizers"]["Normal"])
        sunscreens = POPULAR_PRODUCTS["sunscreens"]["All"]
        
        return {
            "target_profile": {
                "skin_type": stype,
                "primary_concern": sconcern
            },
            "recommended_products": {
                "cleanser": cleansers[0],
                "treatment_serum": treatments[0],
                "moisturizer": moisturizers[0],
                "sunscreen": sunscreens[0]
            },
            "alternative_options": {
                "cleanser_alt": cleansers[1] if len(cleansers) > 1 else None,
                "treatment_serum_alt": treatments[1] if len(treatments) > 1 else None,
                "moisturizer_alt": moisturizers[1] if len(moisturizers) > 1 else None
            }
        }

    @staticmethod
    def generate_7_day_routine(skin_type: str, skin_concern: str) -> Dict[str, Any]:
        """Generates a 7-day AM/PM Dermatologist-approved Skin Cycling Routine using exact recommended products."""
        
        stype = skin_type.capitalize() if skin_type else "Normal"
        sconcern = skin_concern if skin_concern in POPULAR_PRODUCTS["treatments_serums"] else "Normal"
        
        recs = RecommendationService.get_product_recommendations(stype, sconcern)
        rec_prods = recs["recommended_products"]
        
        cleanser_name = rec_prods["cleanser"]["name"]
        treatment_name = rec_prods["treatment_serum"]["name"]
        moisturizer_name = rec_prods["moisturizer"]["name"]
        sunscreen_name = rec_prods["sunscreen"]["name"]
        
        days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        weekly_schedule = []
        
        for idx, day in enumerate(days_of_week):
            cycle_day = (idx % 4) + 1  # 4-day Skin Cycle
            
            am_routine = {
                "step_1_cleanse": f"Cleanse with {cleanser_name}",
                "step_2_treat": f"Apply {treatment_name}",
                "step_3_moisturize": f"Apply {moisturizer_name}",
                "step_4_protect": f"Protect skin with {sunscreen_name}"
            }
            
            if cycle_day == 1:
                focus = "Exfoliation Night"
                pm_routine = {
                    "step_1_cleanse": f"Double Cleanse with {cleanser_name}",
                    "step_2_exfoliate": f"Exfoliate with {treatment_name}",
                    "step_3_moisturize": f"Apply {moisturizer_name} to lock in hydration"
                }
                notes = f"Apply {treatment_name} gently tonight to exfoliate dead skin cells and unclog pores."
            elif cycle_day == 2:
                focus = "Targeted Active & Renewal Night"
                pm_routine = {
                    "step_1_cleanse": f"Cleanse gently with {cleanser_name}",
                    "step_2_target": f"Target active concerns using {treatment_name}",
                    "step_3_moisturize": f"Moisturize deeply with {moisturizer_name}"
                }
                notes = f"Primary focus on treating {sconcern} using {treatment_name}. Allow to absorb for 3 minutes before moisturizer."
            else:
                focus = "Barrier Recovery & Deep Hydration Night"
                pm_routine = {
                    "step_1_cleanse": f"Cleanse gently with {cleanser_info['name'] if 'cleanser_info' in locals() else cleanser_name}",
                    "step_2_hydrate": f"Soothe skin with hydrating layer of {moisturizer_name}",
                    "step_3_barrier_repair": f"Apply generous barrier layer of {moisturizer_name}"
                }
                notes = "Barrier recovery night! No harsh active acids tonight — let your skin barrier rest and repair."
                
            weekly_schedule.append({
                "day": day,
                "cycle_phase": focus,
                "am_routine": am_routine,
                "pm_routine": pm_routine,
                "dermatologist_tip": notes
            })
            
        return {
            "routine_title": f"7-Day Personalized Skincare Routine for {stype} Skin & {sconcern.capitalize()}",
            "engine": "Dermatologist-Approved Skin Cycling Engine",
            "weekly_calendar": weekly_schedule
        }

    @staticmethod
    def generate_llm_routine(skin_type: str, skin_concern: str) -> Dict[str, Any]:
        """
        Uses Groq LLM (llama-3.3-70b-versatile) to dynamically generate an expert, 
        dermatologist-level 7-Day Skincare Routine using the exact recommended products.
        Falls back to rule-based Skin Cycling engine if Groq API Key is not set or fails.
        """
        stype = skin_type.capitalize() if skin_type else "Normal"
        sconcern = skin_concern if skin_concern else "Normal"
        
        recs = RecommendationService.get_product_recommendations(stype, sconcern)
        rec_prods = recs["recommended_products"]
        
        cleanser_name = rec_prods["cleanser"]["name"]
        treatment_name = rec_prods["treatment_serum"]["name"]
        moisturizer_name = rec_prods["moisturizer"]["name"]
        sunscreen_name = rec_prods["sunscreen"]["name"]

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.info("GROQ_API_KEY not found. Using fallback rule-based Skin Cycling engine.")
            return RecommendationService.generate_7_day_routine(skin_type, skin_concern)
            
        try:
            client = Groq(api_key=api_key)
            
            prompt = f"""
You are a Board-Certified Senior Dermatologist AI specializing in personalized skincare planning.
Generate a comprehensive, scientific, 7-day personalized skincare routine for a patient with:
- Skin Type: {stype}
- Primary Skin Concern: {sconcern}

CRITICAL MANDATE: You MUST explicitly name and use these EXACT 4 recommended products in every day's AM and PM routine:
1. Cleanser: "{cleanser_name}"
2. Treatment/Serum: "{treatment_name}"
3. Moisturizer: "{moisturizer_name}"
4. Sunscreen: "{sunscreen_name}"

Follow the Dermatologist Skin Cycling method (Exfoliation Night -> Active Renewal Night -> Barrier Recovery Nights).
Respond ONLY in valid JSON matching this exact structure:
{{
  "routine_title": "7-Day AI Dermatologist Routine for {stype} Skin ({sconcern})",
  "engine": "Groq LLM Llama-3.3-70B Dermatologist Engine",
  "dermatologist_assessment": "Short 2-sentence clinical assessment prescribing {cleanser_name}, {treatment_name}, {moisturizer_name}, and {sunscreen_name}.",
  "weekly_calendar": [
    {{
      "day": "Monday",
      "cycle_phase": "Exfoliation Night",
      "am_routine": {{
        "step_1_cleanse": "Cleanse with {cleanser_name}",
        "step_2_treat": "Apply {treatment_name}",
        "step_3_moisturize": "Moisturize with {moisturizer_name}",
        "step_4_protect": "Protect with {sunscreen_name}"
      }},
      "pm_routine": {{
        "step_1_cleanse": "Double Cleanse with {cleanser_name}",
        "step_2_target": "Exfoliate using {treatment_name}",
        "step_3_moisturize": "Lock in hydration with {moisturizer_name}"
      }},
      "dermatologist_tip": "..."
    }}
  ],
  "key_active_ingredients_to_use": ["Active 1", "Active 2"],
  "ingredients_to_avoid": ["Ingredient 1"]
}}
Generate all 7 days (Monday through Sunday). Ensure every day explicitly names "{cleanser_name}", "{treatment_name}", "{moisturizer_name}", and "{sunscreen_name}".
"""
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a clinical dermatologist AI assistant that outputs structured JSON routines."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            
            response_json = json.loads(completion.choices[0].message.content)
            return response_json
            
        except Exception as e:
            logger.error(f"Error calling Groq API: {e}. Falling back to rule-based engine.")
            return RecommendationService.generate_7_day_routine(skin_type, skin_concern)

recommendation_service = RecommendationService()
