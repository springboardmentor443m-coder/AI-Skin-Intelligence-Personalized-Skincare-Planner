import os
import json
from typing import Optional, List, Dict
import groq

MODELS_TO_TRY = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama-3.2-3b-preview",
    "llama-3.2-11b-vision-preview"
]
DEFAULT_GROQ_KEY = "enter your groq key"


class LLMEngine:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", DEFAULT_GROQ_KEY)

    def chat_dermatologist(
        self,
        user_profile: Dict,
        skin_type: str,
        primary_concern: str,
        scores: Dict[str, float],
        products: Optional[List[Dict]] = None,
        chat_history: Optional[List[Dict]] = None,
        user_message: str = "",
        custom_api_key: Optional[str] = None
    ) -> str:
        """
        Real-time conversational dermatologist AI.
        Incorporate active patient context: demographics, water/sleep habits, ML vision diagnostics, and matched CSV products.
        """
        effective_api_key = custom_api_key or self.api_key or os.getenv("GROQ_API_KEY", DEFAULT_GROQ_KEY)

        age = user_profile.get("age", 25)
        gender = user_profile.get("gender", "Unspecified")
        country = user_profile.get("country", "")
        budget = user_profile.get("budget", 50.0)
        water = user_profile.get("water_intake", 2.0)
        sleep = user_profile.get("sleep_hours", 7.0)

        prod_list_str = "No specific products recommended yet."
        if products:
            items = []
            for p_item in products:
                p = p_item.get("product", {})
                brand = p.get("brand_name", "")
                name = p.get("product_name", "")
                price = p.get("price", 0.0)
                ptype = p.get("product_type", "")
                ing = p.get("ingredients", "")[:120]
                items.append(f"- {brand} {name} (${price}, Category: {ptype}, Ingredients: {ing})")
            prod_list_str = "\n".join(items)

        system_prompt = (
            "You are Dr. Twacha, an elite Board-Certified Clinical Dermatologist and Skincare Scientist AI. "
            "Provide empathetic, scientifically rigorous, highly personalized skincare guidance.\n\n"
            "PATIENT PROFILE & REAL-TIME DIAGNOSTIC DATA:\n"
            f"- Age: {age} | Gender: {gender} | Location: {country}\n"
            f"- Skincare Budget Limit: ${budget:.2f}\n"
            f"- Current Daily Water Habits: {water} Liters\n"
            f"- Current Daily Sleep Habits: {sleep} Hours/night\n"
            f"- Identified Skin Type: {skin_type}\n"
            f"- Primary Focus Area: {primary_concern}\n"
            f"- Full 7-Concern Score Breakdown (%): {scores}\n\n"
            "PATIENT'S MATCHED CSV PRODUCTS & DUPES:\n"
            f"{prod_list_str}\n\n"
            "CLINICAL INSTRUCTIONS:\n"
            "1. Address the user's question directly as an expert dermatologist.\n"
            "2. Seamlessly reference their specific skin type, concern scores, habits, and recommended products when relevant.\n"
            "3. Keep tone warm, professional, encouraging, and clear (no unnecessary jargon).\n"
            "4. Do NOT output JSON. Output clear, well-formatted Markdown paragraphs and bullet points."
        )

        messages = [{"role": "system", "content": system_prompt}]
        if chat_history:
            for turn in chat_history:
                role = turn.get("role", "user")
                content = turn.get("content", "")
                if role in ["user", "assistant"] and content:
                    messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_message})

        if effective_api_key:
            client = groq.Groq(api_key=effective_api_key)
            for model_name in MODELS_TO_TRY:
                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        temperature=0.7,
                        max_tokens=1500
                    )
                    return response.choices[0].message.content
                except Exception as model_err:
                    print(f"Chat model {model_name} warning: {model_err}")
                    continue

        # Fallback response if API limit reached or offline
        return (
            f"Hello! As your personal dermatologist AI, I can see that your identified skin type is **{skin_type}** "
            f"with a primary focus on **{primary_concern}** (Diagnostic Score: {scores.get(primary_concern, 0)}%).\n\n"
            f"Regarding your query ('*{user_message}*'), I recommend prioritizing consistent morning SPF protection, "
            f"maintaining your prescribed water intake of {round(max(2.5, water + 0.5), 1)}L daily, and applying your matched active treatments "
            f"specifically formulated for your budget of ${budget:.2f}."
        )

    def generate_routine(
        self,
        user_profile: Dict,
        skin_type: str,
        scores: Dict[str, float],
        primary_concern: str,
        products: Optional[List[Dict]] = None,
        is_maintenance: bool = False,
        delta_scores: Optional[Dict[str, float]] = None,
        custom_api_key: Optional[str] = None
    ) -> str:
        """
        Generates a hyper-personalized 7-Day AM/PM Skincare Plan in JSON format using Groq LLM.
        Synthesizes user profile queries, ML vision diagnostics, and ALL recommended CSV products.
        Analyzes CURRENT habits and prescribes NEW OPTIMIZED TARGETS for water and sleep.
        """
        effective_api_key = custom_api_key or self.api_key or os.getenv("GROQ_API_KEY", DEFAULT_GROQ_KEY)

        if not effective_api_key:
            return json.dumps(self._generate_fallback_json(user_profile, skin_type, primary_concern, scores, products, is_maintenance))

        client = groq.Groq(api_key=effective_api_key)
        prompt = self._build_prompt(
            user_profile, skin_type, scores, primary_concern, products, is_maintenance, delta_scores
        )

        age = user_profile.get("age", 25)
        gender = user_profile.get("gender", "Unspecified")
        water = user_profile.get("water_intake", 2.0)
        sleep = user_profile.get("sleep_hours", 7.0)

        # Build explicit list of all matched product names for prompt instructions
        prod_names = []
        if products:
            for p_item in products:
                p = p_item.get("product", {})
                p_fullname = f"{p.get('brand_name', '')} {p.get('product_name', '')}".strip()
                if p_fullname:
                    prod_names.append(p_fullname)

        prod_list_str = ", ".join(prod_names) if prod_names else "recommended targeted products"

        system_prompt = (
            "You are an elite Board-Certified Dermatologist AI. "
            "You MUST output ONLY a valid JSON object representing a deeply descriptive, highly structured 7-Day AM/PM Skincare Plan.\n\n"
            "STRICT JSON SCHEMA REQUIREMENT:\n"
            "{\n"
            '  "Day 1": {\n'
            '    "Morning": [\n'
            '      "**Step 1: Gentle Cleansing:** Wash face with a hydrating cleanser for ' + str(skin_type) + ' skin.",\n'
            '      "**Step 2: Targeted Active Application:** Apply [CSV Product Name 1] targeting ' + str(primary_concern) + '.",\n'
            '      "**Step 3: Sun & Environmental Shield:** Apply broad-spectrum SPF 50 sunscreen.",\n'
            '      "**Step 4: Prescribed Hydration Goal:** Your CURRENT water intake is ' + str(water) + 'L. We prescribe a NEW OPTIMIZED TARGET of ' + str(round(max(2.5, water + 0.5), 1)) + 'L daily.",\n'
            '      "**Step 5: Daily Lifestyle Advice:** ...",\n'
            '      "**Step 6: Barrier Protection:** ..."\n'
            '    ],\n'
            '    "Evening": [\n'
            '      "**Step 1: Double Cleanse:** Wash face thoroughly to remove pollutants and sunscreen.",\n'
            '      "**Step 2: Night Active Repair:** Apply [CSV Product Name 2 or 3] to promote overnight skin turnover.",\n'
            '      "**Step 3: Lipid Barrier Lock:** Apply rich ceramide cream to prevent water loss.",\n'
            '      "**Step 4: Prescribed Sleep Target:** Your CURRENT sleep is ' + str(sleep) + 'h. We prescribe a NEW OPTIMIZED TARGET of ' + str(max(8.0, sleep)) + ' hours tonight.",\n'
            '      "**Step 5: Overnight Recovery:** ...",\n'
            '      "**Step 6: Circadian Rest:** ..."\n'
            '    ]\n'
            '  },\n'
            '  "Day 2": { "Morning": [...], "Evening": [...] },\n'
            '  "Day 3": { "Morning": [...], "Evening": [...] },\n'
            '  "Day 4": { "Morning": [...], "Evening": [...] },\n'
            '  "Day 5": { "Morning": [...], "Evening": [...] },\n'
            '  "Day 6": { "Morning": [...], "Evening": [...] },\n'
            '  "Day 7": { "Morning": [...], "Evening": [...] }\n'
            "}\n\n"
            "CRITICAL CLINICAL INSTRUCTIONS:\n"
            f"1. ALL RECOMMENDED PRODUCTS USAGE IN 7 DAYS PLAN: You MUST explicitly schedule and instruct the usage of ALL of the following matched CSV products across the 7-Day AM/PM plan: {prod_list_str}.\n"
            "2. CLINICAL EVALUATION: Analyze the user's CURRENT water and sleep habits. You must PRESCRIBE NEW OPTIMIZED TARGETS based on their primary concern (e.g., if they currently sleep 5h, prescribe 8h). Do not repeat their current habits as goals.\n"
            "3. NEVER REPEAT ROUTINES. Day 1 through Day 7 Evening routines MUST feature completely different dermatological focuses.\n"
            "4. LENGTH: Generate exactly 5 to 6 highly descriptive steps per Morning and Evening."
        )

        for model_name in MODELS_TO_TRY:
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.6,
                    max_tokens=4000
                )
                raw_json = response.choices[0].message.content
                parsed = json.loads(raw_json)

                # Validate parsing completeness
                if isinstance(parsed, dict):
                    fallback = self._generate_fallback_json(user_profile, skin_type, primary_concern, scores, products, is_maintenance)
                    for d in range(1, 8):
                        day_key = f"Day {d}"
                        if day_key not in parsed or not isinstance(parsed[day_key], dict):
                            parsed[day_key] = fallback[day_key]
                        else:
                            if "Morning" not in parsed[day_key] or not parsed[day_key]["Morning"]:
                                parsed[day_key]["Morning"] = fallback[day_key]["Morning"]
                            if "Evening" not in parsed[day_key] or not parsed[day_key]["Evening"]:
                                parsed[day_key]["Evening"] = fallback[day_key]["Evening"]
                    return json.dumps(parsed)

            except Exception as model_err:
                print(f"Model {model_name} warning: {model_err}")
                continue

        # Fallback JSON
        return json.dumps(self._generate_fallback_json(user_profile, skin_type, primary_concern, scores, products, is_maintenance))

    def _build_prompt(
        self,
        user_profile: Dict,
        skin_type: str,
        scores: Dict[str, float],
        primary_concern: str,
        products: Optional[List[Dict]],
        is_maintenance: bool,
        delta_scores: Optional[Dict[str, float]]
    ) -> str:
        age = user_profile.get("age", 25)
        gender = user_profile.get("gender", "Unspecified")
        country = user_profile.get("country", "")
        budget = user_profile.get("budget", 50.0)
        water = user_profile.get("water_intake", 2.0)
        sleep = user_profile.get("sleep_hours", 7.0)

        prompt = f"""
REAL-TIME INDIVIDUAL PROFILE INTAKE:
- Age: {age} years old | Gender: {gender} | Location: {country}
- Skincare Budget Limit: ${budget}
- CURRENT Daily Water Intake: {water} Liters
- CURRENT Sleep Schedule: {sleep} Hours/night

ML VISION DIAGNOSTIC ANALYTICS:
- Identified Skin Type: {skin_type}
- Primary Focus Concern: {primary_concern}
- Full 7-Concern Score Breakdown (%): {scores}
"""
        if delta_scores:
            prompt += f"- Clinical Progress Net Changes (%): {delta_scores}\n"

        if is_maintenance:
            prompt += f"""
STATUS: OPTIMAL CLEAR SKIN (Score >= 85%)
Focus on gentle maintenance, skin barrier preservation, hydration ({water}L water), and daily SPF 50 protection. No harsh treatments.
"""
        else:
            product_str = ""
            if products:
                for idx, p_item in enumerate(products, 1):
                    p = p_item.get("product", {})
                    product_str += f"- Product #{idx}: {p.get('brand_name')} - {p.get('product_name')} (${p.get('price')}, Category: {p.get('product_type')}, Active Ingredients: {p.get('ingredients')[:150]})\n"

            prompt += f"""
RECOMMENDED MATCHED CSV PRODUCTS TO INCORPORATE:
{product_str}

TASK:
1. INCORPORATE ALL RECOMMENDED PRODUCTS: You MUST explicitly schedule every single one of the recommended CSV products listed above into the 7-Day AM/PM plan!
2. CLINICAL EVALUATION: Analyze the user's CURRENT water intake ({water}L) and CURRENT sleep schedule ({sleep}h) against their skin type ({skin_type}) and concern scores ({scores}). PRESCRIBE NEW OPTIMIZED TARGETS based on their primary concern.
3. NEVER REPEAT ROUTINES: Day 1 through Day 7 Evening routines MUST feature completely different dermatological focuses.
4. LENGTH: Generate exactly 5 to 6 highly descriptive steps per Morning and Evening.
"""
        return prompt

    def _generate_fallback_json(
        self, user_profile: Dict, skin_type: str, primary_concern: str, scores: Dict, products: Optional[List[Dict]], is_maintenance: bool
    ) -> Dict:
        water = user_profile.get("water_intake", 2.0)
        sleep = user_profile.get("sleep_hours", 7.0)
        age = user_profile.get("age", 25)

        rec_water = round(max(2.5, water + 0.5), 1)
        rec_sleep = round(max(8.0, sleep), 1)

        prods = []
        if products:
            for p_item in products:
                p = p_item.get("product", {})
                fullname = f"{p.get('brand_name', '')} {p.get('product_name', '')}".strip()
                if fullname:
                    prods.append(fullname)

        p1 = prods[0] if len(prods) > 0 else "matched cleanser"
        p2 = prods[1] if len(prods) > 1 else "matched treatment serum"
        p3 = prods[2] if len(prods) > 2 else "matched active repair cream"
        p4 = prods[3] if len(prods) > 3 else "matched targeted booster"
        p5 = prods[4] if len(prods) > 4 else "matched barrier lock"

        days = {}
        day_plans = [
            # Day 1
            {
                "Morning": [
                    f"**Step 1: Cleanse & Refresh:** Wash face gently with lukewarm water and {p1} for {skin_type} skin.",
                    f"**Step 2: Patch Test Treatment:** Apply a small test amount of {p2} targeting {primary_concern}.",
                    f"**Step 3: Target Active Prep:** Smooth a thin layer of {p4} over key focus zones.",
                    "**Step 4: Broad-Spectrum Protection:** Apply SPF 50 sunscreen generously before outdoor exposure.",
                    f"**Step 5: Prescribed Hydration Target:** Your CURRENT water intake is {water}L. Based on your {skin_type} skin and {primary_concern} severity, we prescribe a NEW OPTIMIZED TARGET of {rec_water}L daily to improve cellular hydric balance.",
                    "**Step 6: Morning Tissue Turgor:** Drink 0.8L of water upon waking to kickstart lymphatic drainage."
                ],
                "Evening": [
                    f"**Step 1: Double Cleanse:** Wash face with {p1} to dissolve oil, sunscreen, and daily airborne pollutants.",
                    f"**Step 2: Night Active Care:** Apply {p3} to promote overnight skin cellular turnover.",
                    f"**Step 3: Lipid Barrier Lock:** Apply {p5} to prevent transepidermal water loss.",
                    f"**Step 4: Prescribed Sleep Target:** Your CURRENT sleep schedule is {sleep}h. To maximize Stage 3 NREM cellular mitosis for {primary_concern} recovery, we prescribe a NEW OPTIMIZED TARGET of {rec_sleep} hours tonight.",
                    "**Step 5: Lip & Eye Care:** Apply a soothing peptide eye cream and lip hydration mask.",
                    "**Step 6: Circadian Night Rest:** Turn off digital screens 30 minutes before sleep to optimize melatonin synthesis."
                ]
            },
            # Day 2
            {
                "Morning": [
                    f"**Step 1: Gentle Cleansing:** Wash face with {p1} tailored for age {age}.",
                    f"**Step 2: Target Active Application:** Apply {p2} to key areas showing {primary_concern}.",
                    f"**Step 3: Moisture Barrier Shield:** Apply {p4} to lock in morning active hydration.",
                    f"**Step 4: Water Intake Pacing:** Drink {round(rec_water/3, 1)}L water during the morning to progress toward your prescribed {rec_water}L goal.",
                    "**Step 5: Sun Protection Refresh:** Reapply broad-spectrum SPF 50 after 3 hours of daylight exposure.",
                    "**Step 6: Intracellular Hydration:** Consume water rich in natural electrolytes."
                ],
                "Evening": [
                    f"**Step 1: Purifying Cleanse:** Use micellar water followed by {p1} to clear accumulated pore debris.",
                    f"**Step 2: Soothing Recovery:** Apply {p3} to reduce localized redness and irritation.",
                    f"**Step 3: Lipid Barrier Repair:** Massage {p5} into face and neck.",
                    f"**Step 4: Sleep Optimization:** Maintain a consistent bed time to reach your prescribed target of {rec_sleep}h rest to reduce skin cortisol stress.",
                    "**Step 5: Deep Epidermal Hydration:** Layer squalane oil over moisturizer to seal active ingredients.",
                    "**Step 6: Nocturnal Skin Rest:** Maintain cooler room temperature (68°F) to support natural body temperature drops during sleep."
                ]
            },
            # Day 3
            {
                "Morning": [
                    f"**Step 1: Morning Splash:** Wash face with {p1} to preserve natural skin lipid layers.",
                    f"**Step 2: Focus Area Care:** Apply {p2} specifically targeting {primary_concern}.",
                    f"**Step 3: Active Booster Layer:** Smooth {p4} evenly across face and neck.",
                    f"**Step 4: Hydration Milestone:** Consume {round(rec_water/2, 1)}L of water by 1:00 PM toward your {rec_water}L target.",
                    "**Step 5: SPF Application:** Ensure full coverage of neck and ears with broad-spectrum SPF 50.",
                    "**Step 6: Micro-Circulation Boost:** Perform gentle facial tapotement to enhance cutaneous capillary blood flow."
                ],
                "Evening": [
                    f"**Step 1: Deep Cleansing:** Wash face thoroughly with {p1} to remove sebum buildup.",
                    f"**Step 2: Mild Exfoliation & Repair:** Apply {p3} to clear clogged pores and accelerate turnover.",
                    f"**Step 3: Overnight Hydration:** Apply {p5} for intensive night moisture barrier lock.",
                    f"**Step 4: Sleep Protocol:** Avoid blue light exposure 30 mins before sleep to achieve {rec_sleep}h quality rest.",
                    "**Step 5: Neck & Decollete Repair:** Apply ceramide neck cream using upward massage strokes.",
                    "**Step 6: Barrier Strengthening:** Allow active treatment to settle for 5 minutes before applying night cream."
                ]
            },
            # Day 4
            {
                "Morning": [
                    f"**Step 1: Hydrating Cleanse:** Wash face with {p1} formulated for {skin_type} skin.",
                    f"**Step 2: Hydration Infusion:** Apply {p2} on damp skin for deep moisture retention.",
                    f"**Step 3: Targeted Care:** Apply {p4} to protect areas vulnerable to {primary_concern}.",
                    f"**Step 4: Daily Water Intake:** Reach {round(rec_water*0.6, 1)}L water by mid-afternoon toward your {rec_water}L target.",
                    "**Step 5: Free Radical Defense:** Layer broad-spectrum SPF 50 for synergistic protection.",
                    "**Step 6: Dermal Elasticity Support:** Drink herbal tea to boost polyphenol intake."
                ],
                "Evening": [
                    f"**Step 1: Evening Cleanse:** Wash face with {p1} to dissolve oil and sunscreen.",
                    f"**Step 2: Active Treatment:** Apply {p3} to support skin turnover for {primary_concern}.",
                    f"**Step 3: Soothing Barrier Repair:** Massage {p5} into skin.",
                    f"**Step 4: Restorative Sleep:** Rest for {rec_sleep}h tonight to stimulate skin cell turnover.",
                    "**Step 5: Pore Clearing Recovery:** Apply centella asiatica to soothe post-treatment skin.",
                    "**Step 6: Epidermal Moisture Lock:** Apply a thin layer of rosehip oil to reinforce lipid matrix."
                ]
            },
            # Day 5
            {
                "Morning": [
                    f"**Step 1: Refreshing Cleanse:** Cleanse face with {p1} and lukewarm water.",
                    f"**Step 2: Active Prep:** Apply {p2} for continued target progress on {primary_concern}.",
                    f"**Step 3: Moisture Shield:** Apply {p4} followed by broad-spectrum SPF 50.",
                    f"**Step 4: Morning Hydration Goal:** Drink {round(rec_water/3, 1)}L water in your morning routine.",
                    "**Step 5: Skin Barrier Defense:** Apply zinc PCA lotion to balance sebum production.",
                    "**Step 6: Daytime Protection:** Avoid direct peak UV sunlight exposure between 11 AM and 3 PM."
                ],
                "Evening": [
                    f"**Step 1: Purifying Cleanse:** Wash face with {p1} to clear environmental pollutants.",
                    f"**Step 2: Pore Care & Active Repair:** Apply {p3} targeting localized skin concerns.",
                    f"**Step 3: Deep Moisture Lock:** Seal in hydration with {p5}.",
                    f"**Step 4: Sleep Optimization:** Sleep for {rec_sleep}h to promote epidermal healing.",
                    "**Step 5: Calming Prep:** Apply soothing aloe gel to buffer active treatment application.",
                    "**Step 6: Overnight Lipid Synthesis:** Rest in elevated pillow position to prevent fluid retention."
                ]
            },
            # Day 6
            {
                "Morning": [
                    f"**Step 1: Gentle Morning Wash:** Cleanse face with {p1}.",
                    f"**Step 2: Calming Serum:** Apply {p2} to calm and hydrate skin.",
                    f"**Step 3: Sun Protection:** Apply {p4} and broad-spectrum SPF 50 sunscreen.",
                    f"**Step 4: Hydration Pacing:** Drink {rec_water}L water spaced evenly throughout the day.",
                    "**Step 5: Skin Tone Brightening:** Apply alpha-arbutin serum to target uneven pigmentation.",
                    "**Step 6: Tissue Oxygenation:** Perform 5 minutes of deep diaphragmatic breathing."
                ],
                "Evening": [
                    f"**Step 1: Double Cleanse:** Wash face thoroughly with {p1}.",
                    f"**Step 2: Target Focus Application:** Apply {p3} to focus areas.",
                    f"**Step 3: Overnight Mask:** Apply {p5} for intensive night repair.",
                    f"**Step 4: Sleep Recovery:** Sleep for {rec_sleep}h to complete cell regeneration.",
                    "**Step 5: Skin Barrier Nourishment:** Apply marula oil for intense night fatty acid replenishing.",
                    "**Step 6: Cellular Mitosis Support:** Keep bedroom completely dark to boost growth hormone release."
                ]
            },
            # Day 7
            {
                "Morning": [
                    f"**Step 1: Weekly Progress Review:** Wash face with {p1} and assess skin health improvements.",
                    f"**Step 2: Lightweight Hydration:** Apply {p2} for {skin_type} skin.",
                    f"**Step 3: Daily SPF Shield:** Apply {p4} and broad-spectrum SPF 50 sunscreen.",
                    f"**Step 4: Hydration Target:** Complete your recommended full {rec_water}L water target.",
                    "**Step 5: Radiant Glow Prep:** Apply lightweight botanical radiance oil.",
                    "**Step 6: Skincare Phase Evaluation:** Note changes in redness, texture, and pore clarity."
                ],
                "Evening": [
                    f"**Step 1: Restorative Cleanse:** Wash face with gentle pH-balanced {p1}.",
                    f"**Step 2: Barrier Repair:** Apply {p3} to restore nighttime skin barrier.",
                    f"**Step 3: Skin Rest:** Apply {p5} to allow skin barrier to rest and absorb nutrients.",
                    f"**Step 4: Sleep Protocol:** Rest for {rec_sleep}h to finish your 7-day care phase.",
                    "**Step 5: Deep Hydration Seal:** Apply hyaluronic night balm for complete water lock.",
                    "**Step 6: Weekly Recovery Reset:** Congratulate yourself on completing your 7-day skincare phase."
                ]
            }
        ]

        for d in range(1, 8):
            day_key = f"Day {d}"
            days[day_key] = day_plans[d-1]

        return days


llm_engine = LLMEngine()
