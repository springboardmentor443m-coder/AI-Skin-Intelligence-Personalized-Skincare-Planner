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

import pandas as pd

class RecommendationService:
    _df_cache = None

    @classmethod
    def get_dataset_df(cls):
        if cls._df_cache is None:
            csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'final.csv'))
            if os.path.exists(csv_path):
                try:
                    cls._df_cache = pd.read_csv(csv_path, encoding='utf-8')
                except Exception as e:
                    logger.error(f"Error loading final.csv dataset: {e}")
        return cls._df_cache

    @staticmethod
    def query_csv_product(label: str, skin_type: str, skin_concern: str, gender: str = "Unisex"):
        """Queries 960+ real products in data/final.csv for matching label, skin type, concern, and gender preference."""
        df = RecommendationService.get_dataset_df()
        if df is None:
            return None
            
        stype_lower = skin_type.lower() if skin_type else "normal"
        sconcern_lower = skin_concern.lower() if skin_concern else "general care"
        gender_lower = gender.lower() if gender else "unisex"
        
        # Filter by label
        filtered = df[df['label'].str.lower() == label.lower()]
        if len(filtered) == 0:
            return None
            
        # Match skin_type
        type_matches = filtered[filtered['skin type'].astype(str).str.lower().str.contains(f"{stype_lower}|all", regex=True)]
        if len(type_matches) > 0:
            filtered = type_matches
            
        # Match concern
        concern_matches = filtered[filtered['concern'].astype(str).str.lower().str.contains(sconcern_lower, regex=True)]
        if len(concern_matches) > 0:
            filtered = concern_matches

        # Filter by Gender Preference (Male -> Men/Unisex, Female -> Women/Unisex)
        if gender_lower in ["male", "men"]:
            gender_matches = filtered[filtered['name'].astype(str).str.lower().str.contains(r"men|unisex|male", regex=True)]
            if len(gender_matches) > 0:
                filtered = gender_matches
        elif gender_lower in ["female", "women"]:
            gender_matches = filtered[filtered['name'].astype(str).str.lower().str.contains(r"women|unisex|female", regex=True)]
            if len(gender_matches) > 0:
                filtered = gender_matches
            
        if len(filtered) > 0:
            row = filtered.iloc[0]
            actives_list = [c.strip().title() for c in str(row['concern']).split(',') if c.strip()]
            return {
                "name": str(row['name']).title(),
                "brand": str(row['brand']).title(),
                "actives": actives_list if actives_list else ["Gentle Formulation"],
                "why": f"Matched from 960+ product dataset specifically for {gender.capitalize()} {skin_type.capitalize()} skin treating {skin_concern}.",
                "rating": 4.8,
                "price": str(row['price']),
                "url": str(row['url']),
                "img": str(row['img'])
            }
        return None

    @staticmethod
    def get_product_recommendations(skin_type: str, skin_concern: str, gender: str = "Unisex") -> Dict[str, Any]:
        """Returns products matched to skin type, concern & gender from dataset with popular fallback and product images."""
        
        stype = skin_type.capitalize() if skin_type else "Normal"
        sconcern = skin_concern if skin_concern in POPULAR_PRODUCTS["treatments_serums"] else "Normal"
        gender_cap = gender.capitalize() if gender else "Unisex"
        
        # Query 960+ product dataset (final.csv) with gender filter
        csv_cleanser = RecommendationService.query_csv_product("cleanser", stype, sconcern, gender_cap)
        csv_moisturizer = RecommendationService.query_csv_product("face-moisturisers", stype, sconcern, gender_cap)
        csv_treatment = RecommendationService.query_csv_product("mask-and-peel", stype, sconcern, gender_cap)
        
        cleansers = POPULAR_PRODUCTS["cleansers"].get(stype, POPULAR_PRODUCTS["cleansers"]["Normal"])
        treatments = POPULAR_PRODUCTS["treatments_serums"].get(sconcern, POPULAR_PRODUCTS["treatments_serums"]["Normal"])
        moisturizers = POPULAR_PRODUCTS["moisturizers"].get(stype, POPULAR_PRODUCTS["moisturizers"]["Normal"])
        sunscreens = POPULAR_PRODUCTS["sunscreens"]["All"]
        
        # Helper to guarantee image thumbnail and search link on every product card
        def ensure_images(product: dict, default_img: str):
            if not product:
                return product
            p = dict(product)
            if "img" not in p or not p["img"] or p["img"] == "nan":
                p["img"] = default_img
            if "url" not in p or not p["url"] or p["url"] == "nan":
                p["url"] = "https://www.google.com/search?q=" + str(p.get("name", "")).replace(" ", "+")
            return p

        cleanser_item = ensure_images(csv_cleanser if csv_cleanser else cleansers[0], "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80")
        treatment_item = ensure_images(csv_treatment if csv_treatment else treatments[0], "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80")
        moisturizer_item = ensure_images(csv_moisturizer if csv_moisturizer else moisturizers[0], "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80")
        sunscreen_item = ensure_images(sunscreens[0], "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&q=80")

        def parse_price_val(price_str: str) -> float:
            if not price_str or str(price_str) == 'nan':
                return 250.0
            import re
            nums = re.findall(r'\d+', str(price_str))
            if nums:
                val = float(nums[0])
                if '$' in str(price_str):
                    val = val * 83.0
                return val
            return 300.0

        total_cost = (
            parse_price_val(cleanser_item.get("price")) +
            parse_price_val(treatment_item.get("price")) +
            parse_price_val(moisturizer_item.get("price")) +
            parse_price_val(sunscreen_item.get("price"))
        )

        # Collect names of primary 4 prescribed items to prevent duplicate display in bottom list
        prescribed_names = set(
            item.get("name", "").lower() for item in [cleanser_item, treatment_item, moisturizer_item, sunscreen_item] if item and item.get("name")
        )

        all_raw_matches = RecommendationService.query_all_csv_products(stype, sconcern, gender_cap, max_items=80)
        
        # Exclude top 4 items so bottom list contains 100% unique additional alternatives
        all_dataset_matches = [
            prod for prod in all_raw_matches
            if prod.get("name", "").lower() not in prescribed_names
        ]

        return {
            "target_profile": {
                "skin_type": stype,
                "primary_concern": sconcern,
                "gender": gender_cap
            },
            "total_monthly_routine_cost": f"₹{int(total_cost):,}",
            "recommended_products": {
                "cleanser": cleanser_item,
                "treatment_serum": treatment_item,
                "moisturizer": moisturizer_item,
                "sunscreen": sunscreen_item
            },
            "all_matching_products": all_dataset_matches,
            "alternative_options": {
                "cleanser_alt": ensure_images(cleansers[0], "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80"),
                "treatment_serum_alt": ensure_images(treatments[0], "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"),
                "moisturizer_alt": ensure_images(moisturizers[0], "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80")
            }
        }

    @staticmethod
    def query_all_csv_products(skin_type: str, skin_concern: str, gender: str = "Unisex", max_items: int = 60) -> List[Dict[str, Any]]:
        """Queries and returns ALL matching products from data/final.csv dataset for skin type and concern."""
        df = RecommendationService.get_dataset_df()
        if df is None or len(df) == 0:
            return []

        stype_lower = skin_type.lower() if skin_type else "normal"
        sconcern_lower = skin_concern.lower() if skin_concern else "general care"
        gender_lower = gender.lower() if gender else "unisex"

        # Match skin type or all
        type_matches = df[df['skin type'].astype(str).str.lower().str.contains(f"{stype_lower}|all", regex=True)]
        filtered = type_matches if len(type_matches) > 0 else df

        # Clean concern keyword (e.g. 'inflammatory acne' -> 'acne')
        concern_keywords = [k for k in sconcern_lower.split() if len(k) > 2 and k not in ['skin', 'care', 'type', 'general']]
        if concern_keywords:
            regex_pattern = "|".join(concern_keywords)
            concern_matches = filtered[filtered['concern'].astype(str).str.lower().str.contains(regex_pattern, regex=True)]
            if len(concern_matches) >= 5:
                filtered = concern_matches

        # Gender matching
        if gender_lower in ["male", "men"]:
            g_matches = filtered[filtered['name'].astype(str).str.lower().str.contains(r"men|unisex|male", regex=True)]
            if len(g_matches) >= 5:
                filtered = g_matches
        elif gender_lower in ["female", "women"]:
            g_matches = filtered[filtered['name'].astype(str).str.lower().str.contains(r"women|unisex|female", regex=True)]
            if len(g_matches) >= 5:
                filtered = g_matches

        results = []
        for idx, row in filtered.head(max_items).iterrows():
            actives_list = [c.strip().title() for c in str(row['concern']).split(',') if c.strip()]
            img_val = str(row['img'])
            if not img_val or img_val == 'nan':
                img_val = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80"
            url_val = str(row['url'])
            if not url_val or url_val == 'nan':
                url_val = "https://www.google.com/search?q=" + str(row['name']).replace(" ", "+")

            results.append({
                "name": str(row['name']).title(),
                "brand": str(row['brand']).title(),
                "label": str(row['label']).title(),
                "actives": actives_list if actives_list else ["Gentle Formulation"],
                "price": str(row['price']),
                "rating": 4.7,
                "url": url_val,
                "img": img_val
            })
        return results

    @staticmethod
    def generate_7_day_routine(skin_type: str, skin_concern: str, gender: str = "Unisex") -> Dict[str, Any]:
        """Generates a 7-day AM/PM Dermatologist-approved Skin Cycling Routine using exact recommended products."""
        
        stype = skin_type.capitalize() if skin_type else "Normal"
        sconcern = skin_concern if skin_concern in POPULAR_PRODUCTS["treatments_serums"] else "Normal"
        gender_cap = gender.capitalize() if gender else "Unisex"
        
        recs = RecommendationService.get_product_recommendations(stype, sconcern, gender_cap)
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
                    "step_1_cleanse": f"Cleanse gently with {cleanser_name}",
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
            "routine_title": f"7-Day Personalized {gender_cap} Skincare Routine for {stype} Skin & {sconcern.capitalize()}",
            "engine": "Dermatologist-Approved Skin Cycling Engine",
            "weekly_calendar": weekly_schedule
        }

    @staticmethod
    def generate_llm_routine(skin_type: str, skin_concern: str, gender: str = "Unisex") -> Dict[str, Any]:
        """
        Uses Groq LLM (llama-3.3-70b-versatile) to dynamically generate an expert, 
        dermatologist-level 7-Day Skincare Routine tailored to gender specifications.
        """
        stype = skin_type.capitalize() if skin_type else "Normal"
        sconcern = skin_concern if skin_concern else "Normal"
        gender_cap = gender.capitalize() if gender else "Unisex"
        
        recs = RecommendationService.get_product_recommendations(stype, sconcern, gender_cap)
        rec_prods = recs["recommended_products"]
        
        cleanser_name = rec_prods["cleanser"]["name"]
        treatment_name = rec_prods["treatment_serum"]["name"]
        moisturizer_name = rec_prods["moisturizer"]["name"]
        sunscreen_name = rec_prods["sunscreen"]["name"]

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.info("GROQ_API_KEY not found. Using fallback rule-based Skin Cycling engine.")
            return RecommendationService.generate_7_day_routine(skin_type, skin_concern, gender_cap)
            
        try:
            client = Groq(api_key=api_key)
            
            prompt = f"""
You are a Board-Certified Senior Dermatologist AI specializing in personalized skincare planning.
Generate a comprehensive, scientific, 7-day personalized skincare routine for a patient with:
- Patient Gender: {gender_cap}
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
  "routine_title": "7-Day AI Dermatologist Routine for {gender_cap} {stype} Skin ({sconcern})",
  "engine": "Groq LLM Llama-3.3-70B Dermatologist Engine",
  "dermatologist_assessment": "Short 2-sentence clinical assessment prescribing {cleanser_name}, {treatment_name}, {moisturizer_name}, and {sunscreen_name} tailored for {gender_cap} skin physiology.",
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
            return RecommendationService.generate_7_day_routine(skin_type, skin_concern, gender_cap)

recommendation_service = RecommendationService()
