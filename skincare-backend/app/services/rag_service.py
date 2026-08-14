import ast
import csv
import math
import os
import re
from typing import Dict, List, Optional, Tuple

import requests

# Path to the skincare dataset CSV
DATASET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "skin_product_recommendations.csv"
)

# Ingredient to concern mapping for dataset indexing
INGREDIENT_CONCERN_MAP = {
    "salicylic acid": ["acne", "inflammatory acne", "blackheads", "whiteheads", "pores", "oiliness"],
    "benzoyl peroxide": ["acne", "inflammatory acne", "pimples"],
    "tea tree": ["acne", "pimples", "oiliness"],
    "niacinamide": ["acne", "dark_spots", "pigmentation", "pores", "oiliness", "redness"],
    "vitamin c": ["dark_spots", "pigmentation", "wrinkles", "dullness"],
    "ascorbic acid": ["dark_spots", "pigmentation", "wrinkles"],
    "alpha arbutin": ["dark_spots", "pigmentation"],
    "azelaic acid": ["redness", "dark_spots", "acne"],
    "retinol": ["wrinkles", "aging", "acne", "texture"],
    "retinal": ["wrinkles", "aging"],
    "bakuchiol": ["wrinkles", "aging", "sensitivity"],
    "hyaluronic acid": ["dryness", "dehydration"],
    "sodium hyaluronate": ["dryness", "dehydration"],
    "ceramide": ["dryness", "redness", "sensitivity", "barrier_repair"],
    "centella": ["redness", "sensitivity", "acne"],
    "cica": ["redness", "sensitivity"],
    "aloe": ["redness", "sensitivity", "dryness"],
    "clay": ["oiliness", "pores", "blackheads"],
    "charcoal": ["oiliness", "pores", "blackheads"],
    "licorice": ["dark_spots", "pigmentation", "redness"],
}

# Image fallback map for categories
CATEGORY_IMAGES = {
    "Moisturizer": "https://images.unsplash.com/photo-1608248597263-00079e96447c?auto=format&fit=crop&w=600&q=80",
    "Moisturiser": "https://images.unsplash.com/photo-1608248597263-00079e96447c?auto=format&fit=crop&w=600&q=80",
    "Serum": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
    "Face Wash": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    "Cleanser": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    "Toner": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
    "Eye Cream": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
    "Eye Care": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
    "Exfoliator": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
    "Face Mask": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
    "Mask": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
    "Balm": "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80",
    "Sunscreen": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
    "Default": "https://images.unsplash.com/photo-1608248597263-00079e96447c?auto=format&fit=crop&w=600&q=80",
}

# Clinical Knowledge Chunks for Knowledge Base Retrieval
CLINICAL_KNOWLEDGE_BASE = [
    {
        "id": "kb_acne",
        "topic": "Acne & Pimples Care",
        "tags": ["acne", "pimple", "pimples", "breakout", "breakouts", "salicylic", "benzoyl peroxide", "blackheads", "blackhead", "whiteheads", "zits"],
        "content": "For Acne & Breakouts: Wash twice daily with Salicylic Acid (2%) cleanser to dissolve sebum inside pores. Apply Niacinamide (10%) serum in the morning to calm inflammation and regulate oil production. Spot-treat active red pimples with Benzoyl Peroxide gel (2.5%). Always use lightweight non-comedogenic SPF 50 sunscreen during the day."
    },
    {
        "id": "kb_pigmentation",
        "topic": "Dark Spots & Hyperpigmentation",
        "tags": ["dark spot", "dark spots", "pigmentation", "hyperpigmentation", "marks", "blemishes", "discoloration", "vitamin c", "alpha arbutin", "azelaic acid"],
        "content": "To fade Dark Spots & Hyperpigmentation: Apply Vitamin C serum (10-15% L-Ascorbic Acid) in the morning under broad-spectrum SPF 50 sunscreen to stop UV-induced melanin synthesis. In the evening, use Alpha Arbutin or Azelaic Acid serum to fade existing discoloration and even out skin tone."
    },
    {
        "id": "kb_dryness",
        "topic": "Dry & Dehydrated Skin Care",
        "tags": ["dry", "dryness", "dehydrated", "dehydration", "flaky", "peeling", "tight", "hyaluronic acid", "ceramides", "barrier"],
        "content": "For Dry or Flaky Skin: Use a gentle non-foaming cream cleanser with Ceramides and Glycerin. Apply Hyaluronic Acid serum to damp skin to lock in moisture, followed by a rich cream containing Ceramides and Squalane to repair the moisture barrier."
    },
    {
        "id": "kb_oiliness",
        "topic": "Oily Skin & Excess Sebum Control",
        "tags": ["oily", "oiliness", "sebum", "shine", "greasy", "pores", "niacinamide", "clay mask"],
        "content": "For Oily Skin & Large Pores: Cleanse with a mild pH 5.5 gel cleanser. Use 10% Niacinamide + Zinc PCA to reduce excess sebum secretion. Apply an oil-free gel moisturizer. Use a Kaolin or Multani Mitti clay mask twice weekly to absorb deep pore dirt."
    },
    {
        "id": "kb_redness",
        "topic": "Redness & Sensitive Skin Relief",
        "tags": ["redness", "red", "sensitive", "sensitivity", "rosacea", "cica", "centella", "aloe vera", "azelaic acid"],
        "content": "For Sensitive or Red Skin: Avoid harsh physical scrubs and fragrances. Use soothing ingredients like Centella Asiatica (Cica), Aloe Vera, Allantoin, and Azelaic Acid (10%) to soothe vascular flushing and calm the skin barrier."
    },
    {
        "id": "kb_wrinkles",
        "topic": "Anti-Aging, Skin Age & Wrinkle Prevention",
        "tags": ["age", "my age", "aging", "anti-aging", "anti aging", "skin age", "wrinkles", "wrinkle", "fine lines", "lines", "retinol", "peptides", "collagen", "older", "youth", "sagging", "firmness"],
        "content": "For Anti-Aging & Skin Age Care: Cell turnover and natural collagen production slow down with age. Incorporate Retinol (0.2-0.5%) into your night routine 2-3 times per week to boost cell renewal and smooth fine lines. Combine with Peptide complexes, Hyaluronic Acid for plumping, and mandatory morning SPF 50 sunscreen."
    },
    {
        "id": "kb_eye_care",
        "topic": "Under-Eye Care & Dark Circles",
        "tags": ["eye", "eyes", "dark circle", "dark circles", "under eye", "puffy", "puffiness", "eye cream", "caffeine"],
        "content": "For Dark Circles & Eye Puffiness: The skin under your eyes is 4x thinner than the rest of your face. Use a Lightweight Eye Cream with Caffeine & Niacinamide in the morning to constrict blood vessels and reduce puffiness. Apply Peptide or Hyaluronic Acid eye cream at night."
    },
    {
        "id": "kb_sun",
        "topic": "Sun Protection & UV Defense",
        "tags": ["sun", "sunscreen", "spf", "uv", "tanning", "tan", "photoaging"],
        "content": "For Daily Sun Protection: UV radiation accounts for 80% of premature skin aging, wrinkles, and dark spots. Apply a broad-spectrum SPF 50 PA++++ sunscreen generously as the final step of your morning routine."
    },
    {
        "id": "kb_natural_remedies",
        "topic": "Top Natural & Herbal Home Remedies",
        "tags": ["natural", "home remedy", "remedies", "herbal", "honey", "neem", "turmeric", "rice water", "multani mitti", "diy"],
        "content": "Top Natural Remedies:\n• Acne: Raw Honey dabbed on pimples, or Neem leaf water paste.\n• Dark Spots: Grated raw Potato juice or Licorice (Mulethi) + Milk mask for 15 mins.\n• Oily Pores: Multani Mitti (Fuller's Earth) + Rose Water pack.\n• Skin Glow & Hydration: Fermented Rice Water rinse or Fresh Aloe Vera gel."
    },
    {
        "id": "kb_ingredient_mixing",
        "topic": "Ingredient Layering & Mixing Safety Rules",
        "tags": ["mix", "layer", "combine", "together", "retinol", "niacinamide", "vitamin c", "salicylic", "aha", "bha", "benzoyl peroxide"],
        "content": "Ingredient Synergy & Compatibility Rules:\n• SAFE COMBOS: Niacinamide + Salicylic Acid (Great for acne & pores); Hyaluronic Acid + Retinol (Prevents dryness); Centella/Cica + Any Active (Calms irritation).\n• DO NOT LAYER AT SAME TIME: Vitamin C + Retinol (Use Vit C in AM, Retinol in PM); Retinol + AHA/BHA Salicylic Acid (Causes severe redness & barrier breakdown); Vitamin C + Benzoyl Peroxide (Oxidizes Vitamin C)."
    },
    {
        "id": "kb_purging",
        "topic": "Skin Purging vs Allergic Reaction & Breakouts",
        "tags": ["purge", "purging", "reaction", "allergy", "irritation", "breakout"],
        "content": "Skin Purging vs Reaction:\n• Purging: Temporary increase in small pimples in areas you normally get breakouts when starting cell turnover actives (Retinol, Salicylic Acid, Glycolic Acid). Lasts 2-4 weeks then clears completely.\n• Allergic Reaction / Breakout: Redness, burning, itching, or new pimples in unusual areas where you never break out. Action: Immediately stop the new product and apply Cica or Aloe Vera gel."
    },
    {
        "id": "kb_lifestyle",
        "topic": "Diet, Water Intake & Lifestyle Skincare Factors",
        "tags": ["diet", "lifestyle", "water", "sleep", "sugar", "dairy", "food"],
        "content": "Lifestyle & Internal Skin Health:\n• Water Intake: Drink 2.5L to 3L daily to maintain cellular hydration and flush out metabolic toxins.\n• Diet: High-glycemic sugars and excessive dairy trigger insulin/IGF-1 spikes that increase sebum production and pimples. Increase Antioxidants (Green tea, berries, walnuts).\n• Sleep & Stress: 7-8 hours of sleep allows skin repair. High cortisol stress triggers sudden acne breakouts."
    },
    {
        "id": "kb_patch_test",
        "topic": "Sensitive Skin Protocol & Patch Testing",
        "tags": ["patch test", "sensitive", "safety", "burn", "test"],
        "content": "Patch Testing Protocol:\n1. Apply a pea-sized amount of any new active product behind your ear or on your inner wrist.\n2. Wait 24-48 hours. If no redness, itching, or swelling occurs, it is safe for full facial application."
    }
]


class SkincareRAGEngine:
    def __init__(self):
        self.products: List[Dict] = []
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.product_vectors: List[Dict[str, float]] = []
        self.is_loaded = False
        self._load_dataset()

    def _tokenize(self, text: str) -> List[str]:
        """Convert text into normalized token list."""
        if not text:
            return []
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = [t.strip() for t in cleaned.split() if len(t.strip()) > 2]
        return tokens

    def _load_dataset(self):
        """Loads and indexes the Indian skincare CSV dataset items."""
        if not os.path.exists(DATASET_PATH):
            print(f"[RAG] Warning: Dataset file not found at {DATASET_PATH}")
            return

        doc_count = 0
        doc_freqs: Dict[str, int] = {}

        try:
            raw_products_map: Dict[str, Dict] = {}

            with open(DATASET_PATH, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    p_name = row.get("product_name", "").strip()
                    if not p_name:
                        continue

                    brand = row.get("brand", "").strip() or "SKINCARE"
                    cat_type = row.get("category_type", "").strip()
                    cat_label = row.get("category_label", "").strip()
                    key_ing = row.get("key_ingredient", "").strip()
                    p_type = row.get("product_type", "").strip()
                    p_url = row.get("purchase_link", "").strip()
                    img_url = row.get("image_url", "").strip()

                    try:
                        rating = float(row.get("approx_rating", 4.3))
                    except ValueError:
                        rating = 4.3

                    price_str = row.get("price_inr", "").replace("₹", "").replace(",", "").strip()
                    try:
                        price_inr = int(float(price_str))
                    except ValueError:
                        price_inr = 500

                    price_gbp = round(price_inr / 105.0, 2)

                    if p_name not in raw_products_map:
                        raw_products_map[p_name] = {
                            "name": p_name,
                            "brand": brand,
                            "category": p_type,
                            "price_gbp": price_gbp,
                            "price_inr": price_inr,
                            "purchase_url": p_url or f"https://www.amazon.in/s?k={requests.utils.quote(p_name)}",
                            "image_url": img_url or CATEGORY_IMAGES.get(p_type, CATEGORY_IMAGES["Default"]),
                            "ingredients": [key_ing] if key_ing else [],
                            "target_concerns": set(),
                            "target_skin_types": set(),
                            "rating": rating,
                            "review_count": "(1,250)",
                        }

                    p_doc = raw_products_map[p_name]
                    if cat_type == "skin_concern" and cat_label:
                        p_doc["target_concerns"].add(cat_label)
                    elif cat_type == "skin_type" and cat_label:
                        p_doc["target_skin_types"].add(cat_label)

                    if key_ing:
                        key_ing_lower = key_ing.lower()
                        for k_ing, concerns in INGREDIENT_CONCERN_MAP.items():
                            if k_ing in key_ing_lower:
                                p_doc["target_concerns"].update(concerns)

            for p_name, p_doc in raw_products_map.items():
                category = p_doc["category"]
                concerns_list = list(p_doc["target_concerns"])
                skin_types_list = list(p_doc["target_skin_types"])
                ingreds = p_doc["ingredients"]

                product_doc = {
                    "id": f"csv_{doc_count}",
                    "name": p_name,
                    "brand": p_doc["brand"],
                    "category": category,
                    "price_gbp": p_doc["price_gbp"],
                    "price_inr": p_doc["price_inr"],
                    "purchase_url": p_doc["purchase_url"],
                    "ingredients": ingreds,
                    "target_concerns": concerns_list,
                    "target_skin_types": skin_types_list,
                    "rating": p_doc["rating"],
                    "review_count": p_doc["review_count"],
                    "image_url": p_doc.get("image_url") or CATEGORY_IMAGES.get(category, CATEGORY_IMAGES["Default"])
                }

                combined_text = f"{p_name} {category} {p_doc['brand']} {' '.join(ingreds)} {' '.join(concerns_list)} {' '.join(skin_types_list)}"
                tokens = self._tokenize(combined_text)

                tf: Dict[str, float] = {}
                for t in tokens:
                    tf[t] = tf.get(t, 0.0) + 1.0
                    if t not in doc_freqs:
                        doc_freqs[t] = 0

                for t in set(tokens):
                    doc_freqs[t] += 1

                self.products.append(product_doc)
                self.product_vectors.append(tf)
                doc_count += 1

            # Compute IDF values
            self.idf = {
                term: math.log((doc_count + 1) / (df + 1)) + 1.0
                for term, df in doc_freqs.items()
            }

            self.is_loaded = True
            print(f"[RAG Engine] Loaded & Indexed {doc_count} products from CSV dataset.")

        except Exception as e:
            print(f"[RAG Engine] Error loading CSV dataset: {e}")

    def retrieve_relevant_context(
        self,
        query: str,
        user_concern: Optional[str] = None,
        user_skin_type: Optional[str] = None,
        top_k: int = 5
    ) -> Tuple[List[Dict], List[Dict]]:
        """
        Retrieves top_k matching dataset products & relevant clinical knowledge chunks
        using TF-IDF cosine similarity tailored to the user's specific query.
        """
        if not self.is_loaded:
            return [], []

        query_lower = (query or "").lower().strip()
        q_tokens = set(self._tokenize(query_lower))

        matched_kb = []
        for kb in CLINICAL_KNOWLEDGE_BASE:
            score = 0
            for tag in kb["tags"]:
                tag_lower = tag.lower()
                if tag_lower in query_lower:
                    score += 5
                elif any(tag_lower in qt for qt in q_tokens):
                    score += 3

            if any(term in query_lower for term in kb["topic"].lower().split()):
                score += 2

            if score > 0:
                matched_kb.append((score, kb))

        matched_kb.sort(key=lambda x: x[0], reverse=True)
        top_kb = [item[1] for item in matched_kb[:2]]

        if not top_kb:
            if any(w in query_lower for w in ["natural", "home", "remedy", "diy", "herbal"]):
                top_kb = [kb for kb in CLINICAL_KNOWLEDGE_BASE if kb["id"] == "kb_natural_remedies"]
            elif any(w in query_lower for w in ["mix", "layer", "combine", "together"]):
                top_kb = [kb for kb in CLINICAL_KNOWLEDGE_BASE if kb["id"] == "kb_ingredient_mixing"]
            elif any(w in query_lower for w in ["diet", "lifestyle", "food", "water", "drink", "habit"]):
                top_kb = [kb for kb in CLINICAL_KNOWLEDGE_BASE if kb["id"] == "kb_lifestyle"]
            elif user_concern:
                matched_c = [kb for kb in CLINICAL_KNOWLEDGE_BASE if user_concern.lower() in kb["id"].lower() or any(user_concern.lower() in t for t in kb["tags"])]
                top_kb = matched_c[:2] if matched_c else [CLINICAL_KNOWLEDGE_BASE[0]]
            else:
                top_kb = [CLINICAL_KNOWLEDGE_BASE[0]]

        q_tf: Dict[str, float] = {}
        for token in self._tokenize(query_lower):
            q_tf[token] = q_tf.get(token, 0.0) + 1.0

        scores: List[Tuple[float, int]] = []
        for idx, p_tf in enumerate(self.product_vectors):
            dot_product = 0.0
            q_norm = 0.0
            p_norm = 0.0

            for term, q_freq in q_tf.items():
                if term in p_tf:
                    w_q = q_freq * self.idf.get(term, 1.0)
                    w_p = p_tf[term] * self.idf.get(term, 1.0)
                    dot_product += w_q * w_p

            for term, q_freq in q_tf.items():
                q_norm += (q_freq * self.idf.get(term, 1.0)) ** 2

            for term, p_freq in p_tf.items():
                p_norm += (p_freq * self.idf.get(term, 1.0)) ** 2

            if q_norm > 0 and p_norm > 0:
                similarity = dot_product / (math.sqrt(q_norm) * math.sqrt(p_norm))
            else:
                similarity = 0.0

            p_obj = self.products[idx]
            p_concerns_str = " ".join(p_obj["target_concerns"]).lower()
            if any(qt in p_concerns_str for qt in q_tokens if len(qt) > 3):
                similarity += 0.20
            elif user_concern and user_concern.lower() in p_concerns_str:
                similarity += 0.10

            if similarity > 0.0:
                scores.append((similarity, idx))

        scores.sort(key=lambda x: x[0], reverse=True)

        retrieved_products = []
        seen_names = set()
        for score, idx in scores:
            p = self.products[idx]
            if p["name"] not in seen_names:
                seen_names.add(p["name"])
                matched_reason = "Matched for your skin profile & query"
                p_copy = dict(p)
                p_copy["matched_because"] = matched_reason
                retrieved_products.append(p_copy)

            if len(retrieved_products) >= top_k:
                break

        # Fallback to user concern or dataset top picks if query vector similarity didn't hit specific keywords
        if not retrieved_products and self.products:
            c_target = (user_concern or "acne").lower()
            for p in self.products:
                p_concerns = " ".join(p.get("target_concerns", [])).lower()
                if c_target in p_concerns or any(ct in p_concerns for ct in ["acne", "spots", "wrinkles", "dryness", "pores"]):
                    if p["name"] not in seen_names:
                        seen_names.add(p["name"])
                        p_copy = dict(p)
                        p_copy["matched_because"] = f"Top recommended product for {user_concern or 'your skin profile'}"
                        retrieved_products.append(p_copy)
                if len(retrieved_products) >= top_k:
                    break

            if not retrieved_products:
                for p in self.products[:top_k]:
                    p_copy = dict(p)
                    p_copy["matched_because"] = "Dataset product match"
                    retrieved_products.append(p_copy)

        return retrieved_products, top_kb

    def generate_rag_response(
        self,
        user_query: str,
        user_concern: Optional[str] = None,
        user_skin_type: Optional[str] = None,
        api_key: Optional[str] = None,
        scan_analysis: Optional[Dict] = None,
        lang: Optional[str] = "en"
    ) -> Dict:
        """
        Executes complete RAG pipeline:
        1. Context Retrieval (Dataset Products + Knowledge Base)
        2. Ingestion of Full Photo Scan Analysis Scores & Metrics
        3. Groq LLM / Gemini API LLM Synthesis (if API key available) OR Grounded Synthesis (if offline)
        """
        retrieved_products, top_kb = self.retrieve_relevant_context(
            query=user_query,
            user_concern=user_concern,
            user_skin_type=user_skin_type,
            top_k=4
        )

        dataset_count = len(self.products) if self.products else 91

        # Context assembly for LLM RAG prompt
        kb_text = "\n".join([f"- {item['topic']}: {item['content']}" for item in top_kb])
        product_evidence = "\n".join([
            f"- {p['name']} ({p['brand']}, {p['category']}): Ingredients [{', '.join(p['ingredients'][:6])}] - Price ₹{p['price_inr']}"
            for p in retrieved_products
        ]) if retrieved_products else "No specific product filters applied for this query."

        scan_metrics_text = ""
        if scan_analysis:
            c_scores = scan_analysis.get("concern_scores") or {}
            health_score = scan_analysis.get("skin_health_score")
            scores_str = ", ".join([f"{k}: {v}%" for k, v in c_scores.items() if isinstance(v, (int, float))])
            scan_metrics_text = f"""Ground Truth AI Photo Scan Analysis Data:
- Overall Skin Health Score: {health_score if health_score is not None else 'N/A'}/100
- Priority Concern Severity Scores: [{scores_str}]
- Primary Detected Concern: {scan_analysis.get('detected_concern') or user_concern or 'General Care'} ({int(scan_analysis.get('detected_concern_confidence', 0.85)*100)}% confidence)
- Skin Type: {scan_analysis.get('detected_skin_type') or user_skin_type or 'Combination'}
"""

        system_prompt = f"""You are DermaSense AI, an expert AI Dermatologist & Skincare Specialist powering an end-to-end RAG system for our application.
User Query: "{user_query}"
User Detected Concern: "{user_concern or 'General Care'}"
User Skin Type: "{user_skin_type or 'Combination'}"

{scan_metrics_text}

Ground Truth Context retrieved from knowledge base:
{kb_text}

Ground Truth Dataset Products retrieved from {dataset_count} CSV dataset:
{product_evidence}

Instructions:
1. Provide a direct, professional, friendly, evidence-based answer in English using the retrieved knowledge and scan data.
2. If user asks about their scan or health score, reference their exact scan metrics provided above.
3. Recommend specific products from the retrieved dataset by exact Name and Brand, explaining WHY each product helps their skin.
4. Keep the response concise, clear, and well-structured using Markdown formatting.
"""

        # Check for Groq API key or Gemini API key
        groq_env_key = os.getenv("GROQ_API_KEY", "").strip()
        user_key = (api_key or "").strip()

        groq_key_to_use = None
        if user_key.startswith("gsk_"):
            groq_key_to_use = user_key
        elif groq_env_key:
            groq_key_to_use = groq_env_key

        # 1. Try Groq LLM API
        if groq_key_to_use:
            try:
                res = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {groq_key_to_use}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_query}
                        ],
                        "temperature": 0.5,
                        "max_tokens": 1024
                    },
                    timeout=8
                )
                if res.ok:
                    data = res.json()
                    text = data.get("choices", [{}])[0].get("message", {}).get("content")
                    if text:
                        return {
                            "status": "success",
                            "rag_source": f"Groq LLM (llama-3.3-70b) + Dataset ({dataset_count} Products) RAG",
                            "answer": text,
                            "retrieved_products": retrieved_products,
                            "knowledge_context": [kb["topic"] for kb in top_kb]
                        }
                else:
                    print(f"[RAG Engine] Groq API returned status {res.status_code}: {res.text[:100]}")
            except Exception as g_err:
                print(f"[RAG Engine] Groq API exception: {g_err}")

        # 2. Try Gemini API key generation if provided
        gemini_key = user_key if user_key.startswith("AIza") else os.getenv("GEMINI_API_KEY", "").strip()
        if gemini_key:
            try:
                is_bearer = gemini_key.startswith("AQ.") or gemini_key.startswith("ya29.");
                headers = (
                    {"Content-Type": "application/json", "Authorization": f"Bearer {gemini_key}"}
                    if is_bearer
                    else {"Content-Type": "application/json"}
                )
                key_param = "" if is_bearer else f"?key={gemini_key}"

                for model in ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]:
                    try:
                        res = requests.post(
                            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent{key_param}",
                            headers=headers,
                            json={"contents": [{"parts": [{"text": system_prompt}]}]},
                            timeout=5
                        )
                        if res.ok:
                            data = res.json()
                            text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
                            if text:
                                return {
                                    "status": "success",
                                    "rag_source": f"Gemini API + Dataset ({dataset_count} Products) RAG",
                                    "answer": text,
                                    "retrieved_products": retrieved_products,
                                    "knowledge_context": [kb["topic"] for kb in top_kb]
                                }
                    except Exception as req_err:
                        print(f"[RAG Engine] Gemini model {model} failed: {req_err}")
                        continue
            except Exception as err:
                print(f"[RAG Engine] Gemini API exception: {err}")

        # 3. Fallback RAG synthesis directly from retrieved context
        structured_answer = self._synthesize_grounded_answer(
            user_query=user_query,
            user_concern=user_concern,
            user_skin_type=user_skin_type,
            retrieved_products=retrieved_products,
            top_kb=top_kb,
            scan_analysis=scan_analysis
        )

        return {
            "status": "success",
            "rag_source": f"Dataset RAG Engine ({dataset_count} Products)",
            "answer": structured_answer,
            "retrieved_products": retrieved_products,
            "knowledge_context": [kb["topic"] for kb in top_kb]
        }

    def _synthesize_grounded_answer(
        self,
        user_query: str,
        user_concern: Optional[str],
        user_skin_type: Optional[str],
        retrieved_products: List[Dict],
        top_kb: List[Dict],
        scan_analysis: Optional[Dict] = None
    ) -> str:
        """
        Dynamic Generative Synthesis Engine (English):
        Constructs a fluent, natural conversational response in English tailored dynamically to the user's question and skin profile.
        """
        q_lower = (user_query or "").lower().strip()
        lines = []
        dataset_count = len(self.products) if self.products else 91

        skin_label = user_skin_type.lower() if user_skin_type else "combination"
        concern_label = (user_concern.replace("_", " ") if user_concern else "skin care").title()

        greeting_intros = [
            f"Hello! Regarding your query about **'{user_query}'**, here is a personalized clinical breakdown for your **{skin_label} skin** ({concern_label} focus):",
            f"Hi there! For **'{user_query}'**, here is what you need to know tailored to your **{skin_label} skin**:",
            f"Hello! Great question about **'{user_query}'**. Based on your **{skin_label} skin profile**, here is the evidence-based guidance:"
        ]
        intro = greeting_intros[hash(user_query) % len(greeting_intros)]
        lines.append(intro)
        lines.append("")

        if scan_analysis and any(k in q_lower for k in ["scan", "score", "health", "metrics", "my skin", "analysis", "photo", "routine", "remedy", "recommend", "age"]):
            health = scan_analysis.get("skin_health_score")
            c_scores = scan_analysis.get("concern_scores") or {}
            top_conc = scan_analysis.get("detected_concern") or user_concern
            if health is not None or c_scores:
                lines.append(f"📊 **Your AI Photo Scan Baseline:**")
                if health is not None:
                    lines.append(f"• Overall Health Score: **{health}/100**")
                if top_conc:
                    lines.append(f"• Primary Detected Concern: **{top_conc.replace('_', ' ').title()}**")
                if c_scores:
                    sev_str = ", ".join([f"{k.replace('_', ' ').title()}: {v}%" for k, v in c_scores.items() if isinstance(v, (int, float))])
                    lines.append(f"• Concern Severity Breakdown: {sev_str}")
                lines.append("")

        if any(w in q_lower for w in ["age", "aging", "wrinkle", "wrinkles", "fine lines", "older", "youth", "anti-aging", "anti aging"]):
            lines.append("⏳ **Anti-Aging & Skin Age Care Guidance:**")
            lines.append("• **Cell Renewal & Collagen**: Natural cell turnover slows as skin matures. Using **Retinol (0.2% - 0.5%)** 2-3 nights per week stimulates new collagen production and smoothes fine lines.")
            lines.append("• **Firmness & Hydration**: Pair Retinol with **Peptide complexes** and **Hyaluronic Acid** to restore skin elasticity and plumpness.")
            lines.append("• **Essential Daily Protection**: UV radiation causes 80% of visible skin aging (photo-aging). Mandatory daily **SPF 50 PA++++** sunscreen protects against collagen breakdown.")
            lines.append("")

        elif any(w in q_lower for w in ["eye", "eyes", "dark circle", "dark circles", "under eye", "puffy"]):
            lines.append("👁️ **Under-Eye & Dark Circle Care Guidance:**")
            lines.append("• **Caffeine & Niacinamide**: Use a targeted under-eye serum containing 5% Caffeine in the AM to constrict micro-blood vessels & reduce morning puffiness.")
            lines.append("• **Hydration & Elasticity**: The skin under the eyes is 4x thinner than facial skin. Apply Peptide or Hyaluronic Acid eye cream at night.")
            lines.append("")

        elif any(w in q_lower for w in ["sun", "sunscreen", "spf", "uv", "tanning"]):
            lines.append("☀️ **Sun Protection & UV Shielding Guidance:**")
            lines.append("• **Broad Spectrum Protection**: Use an SPF 50 PA++++ sunscreen daily to shield against UVA (aging) and UVB (burning) rays.")
            lines.append("• **Reapplication**: Reapply every 2-3 hours when outdoors to prevent sunspots and dark spot recurrence.")
            lines.append("")

        elif any(w in q_lower for w in ["mix", "layer", "combine", "together", "retinol", "vitamin c", "niacinamide", "salicylic"]):
            lines.append("🧪 **Active Ingredient Compatibility Guidance:**")
            lines.append("• **Morning (AM)**: Use **Vitamin C** or **Niacinamide** under sunscreen. Vitamin C acts as an antioxidant shield against UV damage.")
            lines.append("• **Evening (PM)**: Use **Retinol** or **Salicylic Acid (BHA)** at night. Retinol speeds up cell renewal while Salicylic Acid unclogs deep pore sebum.")
            lines.append("• 🚫 **Safety Rule**: Never mix Vitamin C & Retinol directly together in the same step. Keep Vitamin C for AM and Retinol for PM to prevent severe redness & skin barrier damage.")
            lines.append("")

        elif any(w in q_lower for w in ["natural", "home", "remedy", "remedies", "herbal", "diy", "neem", "honey"]):
            lines.append("🌿 **Targeted Natural & Home Remedies:**")
            lines.append("• **For Breakouts & Redness**: Raw Organic Honey dabbed on active spots for 15 mins (natural antibacterial), or rinse face with cooled Neem water.")
            lines.append("• **For Dark Marks**: Grated fresh Potato juice or Licorice (Mulethi) powder mixed with cold milk as a 15-minute mask.")
            lines.append("• **For Excess Oil**: Multani Mitti (Fuller's Earth) + Pure Rose Water pack 1-2 times a week.")
            lines.append("")

        elif any(w in q_lower for w in ["routine", "am", "pm", "schedule", "regimen", "morning", "night"]):
            lines.append("☀️🌙 **Custom Daily Routine Structure:**")
            lines.append(f"• **Morning (AM)**: Gentle Foaming Cleanser ➔ Niacinamide Serum ➔ Oil-Free Gel Moisturizer ➔ **Broad-Spectrum Sunscreen (SPF 50)**.")
            lines.append(f"• **Night (PM)**: Gentle Cleanser ➔ Active Treatment (Salicylic Acid / Retinol 2-3 nights/week) ➔ Ceramide Night Repair Cream.")
            lines.append("")

        elif any(w in q_lower for w in ["diet", "food", "water", "lifestyle", "glow", "sugar", "dairy"]):
            lines.append("🥗 **Internal Nutrition & Lifestyle Habits:**")
            lines.append("• **Hydration**: Drink 2.5L to 3L of water daily to maintain skin cellular hydration and flush out toxins.")
            lines.append("• **Dietary Triggers**: Reduce high-sugar foods and excess dairy which cause IGF-1 spikes that trigger sebum overproduction.")
            lines.append("• **Rest & Repair**: Ensure 7-8 hours of sleep. High cortisol stress directly triggers facial redness & sudden breakout flare-ups.")
            lines.append("")

        else:
            for kb in top_kb:
                lines.append(f"💡 **Clinical Insights — {kb['topic']}:**")
                lines.append(f"{kb['content']}")
                lines.append("")

        if retrieved_products:
            lines.append(f"🛍️ **Top Matched Skincare Products (from {dataset_count} CSV Dataset):**")
            for p in retrieved_products[:3]:
                ing_str = ", ".join(p['ingredients'][:3]) if p.get('ingredients') else "Targeted Clinical Actives"
                lines.append(f"• **{p['name']}** ({p['brand']}) — **₹{p['price_inr']}**")
                lines.append(f"  - *Category*: {p['category']} | *Key Actives*: {ing_str}")

        lines.append("")
        lines.append("✨ *Ask me anything else about your skin routine, ingredient pairing, or scan metrics!*")
        return "\n".join(lines)


# Singleton RAG Engine instance
rag_engine = SkincareRAGEngine()


