import os
import json
from typing import Optional, List, Dict
import groq

MODELS_TO_TRY = [
    "openai/gpt-oss-20b",
    "allam-2-7b",
    "openai/gpt-oss-120b",
    "groq/compound",
    "qwen/qwen3.6-27b"
]
DEFAULT_GROQ_KEY = "enter your groq api key"


class LLMEngine:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", DEFAULT_GROQ_KEY)

    def _strip_think_chain(self, text: str) -> str:
        if not text:
            return ""
        clean = text.strip()

        # 1. Handle explicit <think>...</think> tags
        if "</think>" in clean:
            clean = clean.split("</think>")[-1].strip()
        if "<think>" in clean:
            clean = clean.replace("<think>", "").strip()

        # 2. Strip unformatted internal chain-of-thought steps (e.g. "1. Analyze User Input", "2. Identify Key Information Needed")
        planning_phrases = [
            "analyze user input",
            "identify key information needed",
            "cross-reference with clinical context",
            "formulate clinical response",
            "thinking process:"
        ]

        if any(phrase in clean.lower() for phrase in planning_phrases):
            lines = clean.split("\n")
            filtered = []
            skipping = True
            for line in lines:
                l_lower = line.lower().strip()
                if skipping:
                    if (
                        line.startswith("#")
                        or l_lower.startswith("hello")
                        or l_lower.startswith("hi ")
                        or l_lower.startswith("dear")
                        or (
                            line.strip()
                            and not any(p in l_lower for p in planning_phrases)
                            and not (l_lower[0].isdigit() and "." in l_lower[:4] and ("identify" in l_lower or "analyze" in l_lower or "cross-reference" in l_lower or "formulate" in l_lower))
                        )
                    ):
                        skipping = False
                        filtered.append(line)
                else:
                    filtered.append(line)

            if filtered:
                clean = "\n".join(filtered).strip()

        return clean

    def _clean_csv_placeholders(self, text: str, products: Optional[List[Dict]]) -> str:
        if not text:
            return text

        prods = []
        if products:
            for p_item in products:
                p = p_item.get("product", {})
                fullname = f"{p.get('brand_name', '')} {p.get('product_name', '')}".strip()
                if fullname:
                    prods.append(fullname)

        p1 = prods[0] if len(prods) > 0 else "matched gentle cleanser"
        p2 = prods[1] if len(prods) > 1 else "matched treatment serum"
        p3 = prods[2] if len(prods) > 2 else "matched repair cream"
        p4 = prods[3] if len(prods) > 3 else "matched SPF sunscreen"
        p5 = prods[4] if len(prods) > 4 else "matched barrier lock"

        replacements = {
            "[CSV Cleanser Name]": p1,
            "[CSV Cleanser]": p1,
            "[CSV Serum Name]": p2,
            "[CSV Treatment Product]": p2,
            "[CSV Sunscreen Name]": p4,
            "[CSV Product Name]": p3,
            "[CSV Product]": p3,
        }

        for placeholder, real_name in replacements.items():
            text = text.replace(placeholder, real_name)

        return text

    def _clean_parsed_routine(self, parsed: Dict, products: Optional[List[Dict]]) -> Dict:
        cleaned = {}
        for day_k, day_v in parsed.items():
            if isinstance(day_v, dict):
                cleaned[day_k] = {}
                for period_k in ["Morning", "Evening"]:
                    steps = day_v.get(period_k, [])
                    if isinstance(steps, list):
                        cleaned[day_k][period_k] = [self._clean_csv_placeholders(str(step), products) for step in steps]
                    else:
                        cleaned[day_k][period_k] = [self._clean_csv_placeholders(str(steps), products)]
            else:
                cleaned[day_k] = day_v
        return cleaned

    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        user_context: Dict,
        custom_api_key: Optional[str] = None
    ) -> str:
        """
        Executes real live Groq API call with full multi-turn conversation history and deep clinical patient context.
        """
        effective_api_key = custom_api_key or self.api_key or os.getenv("GROQ_API_KEY", DEFAULT_GROQ_KEY)

        user_profile = user_context.get("user_profile", {})
        skin_type = user_context.get("skin_type", "Normal")
        primary_concern = user_context.get("primary_concern", "General Care")
        scores = user_context.get("scores", {})
        products = user_context.get("products", [])

        age = user_profile.get("age", 25)
        gender = user_profile.get("gender", "Unspecified")
        country = user_profile.get("country", "")
        budget = user_profile.get("budget", 50.0)
        water = user_profile.get("water_intake", 2.0)
        sleep = user_profile.get("sleep_hours", 7.0)

        prod_items = []
        if products:
            for p_item in products:
                p = p_item.get("product", {})
                brand = p.get("brand_name", "")
                name = p.get("product_name", "")
                price = p.get("price", 0.0)
                ptype = p.get("product_type", "")
                ing = p.get("ingredients", "")[:150]
                prod_items.append(f"- {brand} {name} (${price:.2f}, Category: {ptype}, Actives: {ing})")
        prod_list_str = "\n".join(prod_items) if prod_items else "No matched products in context."

        system_prompt = (
            "You are Dr. Twacha, an Elite Board-Certified Dermatologist AI and Skincare Scientist. "
            "Deep-think and analyze the user's question against their specific clinical context. "
            "Provide authentic, medically sound, and highly personalized answers. Never use generic templates or show internal reasoning steps.\n\n"
            "PATIENT CLINICAL CONTEXT & REAL-TIME DIAGNOSTIC DATA:\n"
            f"- Patient Demographics: Age {age} | Gender: {gender} | Location: {country}\n"
            f"- Skincare Budget Limit: ${budget:.2f}\n"
            f"- Current Daily Water Habits: {water} Liters\n"
            f"- Current Daily Sleep Habits: {sleep} Hours/night\n"
            f"- Identified Skin Type: {skin_type}\n"
            f"- Primary Focus Area: {primary_concern}\n"
            f"- Full 7-Concern Diagnostic Probabilities (%): {scores}\n\n"
            "PATIENT'S MATCHED CSV PRODUCTS & DUPES:\n"
            f"{prod_list_str}\n\n"
            "CLINICAL INSTRUCTIONS:\n"
            "1. Output ONLY your direct, warm, professional dermatological response to the user. Do NOT include internal planning steps like '1. Analyze User Query' or '2. Identify Key Information Needed'.\n"
            "2. Seamlessly incorporate references to their skin type, diagnostic concern scores, habit targets, and specific matched products.\n"
            "3. Output clean Markdown formatting with clear bullet points where appropriate."
        )

        api_messages = [{"role": "system", "content": system_prompt}]
        for m in messages:
            r = m.get("role", "user")
            c = m.get("content", "")
            if r in ["user", "assistant"] and c:
                api_messages.append({"role": r, "content": c})

        if effective_api_key:
            client = groq.Groq(api_key=effective_api_key, timeout=12.0)
            for model_name in MODELS_TO_TRY:
                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=api_messages,
                        temperature=0.7,
                        max_tokens=1500
                    )
                    content = response.choices[0].message.content
                    if content and len(content.strip()) > 0:
                        clean_content = self._strip_think_chain(content)
                        if clean_content:
                            return self._clean_csv_placeholders(clean_content, products)
                except Exception as err:
                    print(f"Groq Model {model_name} error: {err}")
                    continue

        last_msg = messages[-1].get("content", "") if messages else "your skincare concerns"
        fallback_reply = (
            f"Hello! As your dermatologist AI, I am analyzing your request regarding '{last_msg}'. "
            f"Given your **{skin_type}** skin type and **{primary_concern}** focus area (Score: {scores.get(primary_concern, 0)}%), "
            f"I recommend maintaining a steady application of your matched active treatments within your ${budget:.2f} budget limit "
            f"and adhering to your prescribed hydration target of {round(max(2.5, water + 0.5), 1)}L daily."
        )
        return self._clean_csv_placeholders(fallback_reply, products)

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
        messages = []
        if chat_history:
            for turn in chat_history:
                messages.append(turn)
        if user_message:
            messages.append({"role": "user", "content": user_message})

        user_context = {
            "user_profile": user_profile,
            "skin_type": skin_type,
            "primary_concern": primary_concern,
            "scores": scores,
            "products": products
        }

        return self.chat_completion(messages=messages, user_context=user_context, custom_api_key=custom_api_key)

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
            fallback = self._generate_dynamic_routine_json(user_profile, skin_type, primary_concern, scores, products, is_maintenance)
            return json.dumps(self._clean_parsed_routine(fallback, products))

        client = groq.Groq(api_key=effective_api_key, timeout=12.0)
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
        sample_p1 = prod_names[0] if len(prod_names) > 0 else "gentle cleanser"
        sample_p2 = prod_names[1] if len(prod_names) > 1 else f"targeted {primary_concern} serum"
        sample_p3 = prod_names[2] if len(prod_names) > 2 else "night repair cream"

        system_prompt = (
            "You are an elite Board-Certified Dermatologist AI. "
            "You MUST output ONLY a valid JSON object representing a deeply descriptive, 100% personalized 7-Day AM/PM Skincare Plan.\n\n"
            "STRICT JSON SCHEMA REQUIREMENT:\n"
            "{\n"
            '  "Day 1": {\n'
            '    "Morning": [\n'
            '      "**Gentle AM Purification:** Cleanse face with ' + sample_p1 + ' tailored for ' + str(skin_type) + ' skin.",\n'
            '      "**Targeted Active Treatment:** Apply ' + sample_p2 + ' targeting ' + str(primary_concern) + '.",\n'
            '      "**Broad-Spectrum Shield:** Apply SPF 50 sunscreen generously.",\n'
            '      "**Prescribed Hydration Target:** Your CURRENT water intake is ' + str(water) + 'L. We prescribe a NEW OPTIMIZED TARGET of ' + str(round(max(2.5, water + 0.5), 1)) + 'L daily.",\n'
            '      "**Cellular Hydration Milestone:** Consume 0.8L of electrolyte-rich water before 11:00 AM.",\n'
            '      "**Epidermal Defense:** Avoid intense UV daylight exposure during peak hours."\n'
            '    ],\n'
            '    "Evening": [\n'
            '      "**Double Cleansing Protocol:** Wash face with ' + sample_p1 + ' to dissolve daily impurities.",\n'
            '      "**Overnight Regenerative Care:** Apply ' + sample_p3 + ' to accelerate cell renewal.",\n'
            '      "**Moisture Barrier Lock:** Massage ceramide repair cream to prevent transepidermal water loss.",\n'
            '      "**Prescribed Sleep Target:** Your CURRENT sleep is ' + str(sleep) + 'h. We prescribe a NEW OPTIMIZED TARGET of ' + str(max(8.0, sleep)) + ' hours tonight.",\n'
            '      "**Periorbital Hydration:** Apply peptide eye balm along the orbital bone.",\n'
            '      "**Circadian Rest Protocol:** Power down screens 30 minutes before sleep."\n'
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
            "2. DYNAMIC & NON-REPETITIVE: Do NOT use formulaic step names like 'Step 1: Gentle Cleansing'. Every single day (Day 1 to Day 7) MUST feature completely unique, descriptive step titles and distinct dermatological focuses.\n"
            "3. REAL PRODUCT NAMES ONLY: NEVER use literal placeholder strings like '[CSV Cleanser Name]' or '[CSV Serum Name]'. Always use the actual product names provided above."
        )

        for model_name in MODELS_TO_TRY:
            try:
                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={"type": "json_object"},
                        temperature=0.6,
                        max_tokens=2500
                    )
                except Exception:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.6,
                        max_tokens=2500
                    )

                raw_json = response.choices[0].message.content
                if "</think>" in raw_json:
                    raw_json = raw_json.split("</think>")[-1].strip()

                parsed = json.loads(raw_json)

                # Validate parsing completeness
                if isinstance(parsed, dict):
                    fallback = self._generate_dynamic_routine_json(user_profile, skin_type, primary_concern, scores, products, is_maintenance)
                    for d in range(1, 8):
                        day_key = f"Day {d}"
                        if day_key not in parsed or not isinstance(parsed[day_key], dict):
                            parsed[day_key] = fallback[day_key]
                        else:
                            if "Morning" not in parsed[day_key] or not parsed[day_key]["Morning"]:
                                parsed[day_key]["Morning"] = fallback[day_key]["Morning"]
                            if "Evening" not in parsed[day_key] or not parsed[day_key]["Evening"]:
                                parsed[day_key]["Evening"] = fallback[day_key]["Evening"]
                    
                    cleaned_parsed = self._clean_parsed_routine(parsed, products)
                    return json.dumps(cleaned_parsed)

            except Exception as model_err:
                print(f"Model {model_name} warning: {model_err}")
                continue

        fallback = self._generate_dynamic_routine_json(user_profile, skin_type, primary_concern, scores, products, is_maintenance)
        return json.dumps(self._clean_parsed_routine(fallback, products))

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

    def _generate_dynamic_routine_json(
        self, user_profile: Dict, skin_type: str, primary_concern: str, scores: Dict, products: Optional[List[Dict]], is_maintenance: bool
    ) -> Dict:
        water = user_profile.get("water_intake", 2.0)
        sleep = user_profile.get("sleep_hours", 7.0)
        age = user_profile.get("age", 25)
        country = user_profile.get("country", "")

        rec_water = round(max(2.5, water + 0.5), 1)
        rec_sleep = round(max(8.0, sleep), 1)

        prods = []
        if products:
            for p_item in products:
                p = p_item.get("product", {})
                fullname = f"{p.get('brand_name', '')} {p.get('product_name', '')}".strip()
                if fullname:
                    prods.append(fullname)

        p1 = prods[0] if len(prods) > 0 else "gentle hydrating cleanser"
        p2 = prods[1] if len(prods) > 1 else f"targeted {primary_concern} active serum"
        p3 = prods[2] if len(prods) > 2 else "overnight barrier repair cream"
        p4 = prods[3] if len(prods) > 3 else "epidermal booster lotion"
        p5 = prods[4] if len(prods) > 4 else "ceramide moisture lock balm"

        days = {}
        day_focuses = [
            ("Hydration & Cellular Intake", "Double Cleanse & Lipid Barrier Lock"),
            ("Active Micro-Exfoliation & Shield", "Overnight Epidermal Turnover"),
            ("Circadian Rhythm & Moisture Infusion", "Deep Tissue Cellular Mitosis"),
            ("Free Radical Protection & SPF Defense", "Lipid Matrix & Collagen Support"),
            ("Sebum Balance & Barrier Defense", "Lymphatic Drainage & Sleep Target"),
            ("Radiance Optimization & Hydration Pacing", "Overnight Fatty Acid Recovery"),
            ("Weekly Clinical Review & Skin Rest", "Complete Circadian Recovery Reset")
        ]

        for d in range(1, 8):
            am_focus, pm_focus = day_focuses[d-1]
            day_key = f"Day {d}"
            days[day_key] = {
                "Morning": [
                    f"**{am_focus}:** Cleanse face with {p1} tailored for age {age} and {skin_type} skin.",
                    f"**Target Active Treatment:** Smooth {p2} targeting identified {primary_concern} (Diagnostic score: {scores.get(primary_concern, 0)}%).",
                    f"**Moisture Barrier Protection:** Layer {p4} evenly across face and neck.",
                    "**Broad-Spectrum Shield:** Apply SPF 50 sunscreen generously before daylight exposure.",
                    f"**Prescribed Hydration Target:** Your CURRENT water intake is {water}L. We prescribe a NEW OPTIMIZED TARGET of {rec_water}L daily for optimal cellular turgor.",
                    f"**Environmental Defense:** Avoid direct sunlight during peak hours in {country}."
                ],
                "Evening": [
                    f"**{pm_focus}:** Wash face thoroughly with {p1} to dissolve sunscreen and environmental pollutants.",
                    f"**Overnight Regenerative Care:** Massage {p3} into skin to accelerate cellular turnover for {primary_concern}.",
                    f"**Lipid Matrix Strengthening:** Apply {p5} to lock in active moisture and prevent water loss.",
                    f"**Prescribed Sleep Target:** Your CURRENT sleep is {sleep}h. We prescribe a NEW OPTIMIZED TARGET of {rec_sleep} hours tonight to stimulate Stage 3 NREM repair.",
                    "**Periorbital Hydration:** Apply peptide eye balm along the orbital bone.",
                    "**Circadian Rest Protocol:** Power down all screens 30 minutes before sleep."
                ]
            }

        return days


llm_engine = LLMEngine()
