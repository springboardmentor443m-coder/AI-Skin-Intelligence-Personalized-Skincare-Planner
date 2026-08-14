"""
Dynamic 7-Day Skincare Routine Generator
Generates customized Natural Remedies & Clinical Remedies routines based on
exact skin concern (Redness, Acne, Dark Spots, Wrinkles, Pores, Dryness, etc.)
and skin type (Oily, Dry, Sensitive, Combination, Normal).
"""

from typing import Dict, List, Optional


def generate_dynamic_weekly_plan(
    concern: Optional[str],
    skin_type: Optional[str],
    water_intake_liters: Optional[float] = None,
    sleep_quality: Optional[str] = None,
    allergies: Optional[List[str]] = None,
) -> Dict:
    c_clean = (concern or "acne").lower().strip()
    s_type = (skin_type or "Normal").capitalize()

    # Determine primary category
    if "redness" in c_clean or "sensitive" in c_clean or "rosacea" in c_clean:
        plan = _build_redness_plan(s_type)
    elif "dark" in c_clean or "spot" in c_clean or "pigment" in c_clean:
        plan = _build_dark_spots_plan(s_type)
    elif "wrinkle" in c_clean or "aging" in c_clean or "line" in c_clean:
        plan = _build_wrinkles_plan(s_type)
    elif "blackhead" in c_clean or "whitehead" in c_clean or "pore" in c_clean or "non_inflammatory" in c_clean:
        plan = _build_pores_blackheads_plan(s_type)
    elif "dry" in c_clean or "dehydrat" in c_clean or "flak" in c_clean:
        plan = _build_dryness_plan(s_type)
    elif "oil" in c_clean or "sebum" in c_clean or "shine" in c_clean:
        plan = _build_oiliness_plan(s_type)
    else:
        plan = _build_acne_plan(s_type)

    import copy
    plan = copy.deepcopy(plan)

    # 💧 WATER INTAKE CUSTOMIZATION (< 3.0 Litres)
    if water_intake_liters is not None and water_intake_liters < 3.0:
        deficit = round(3.0 - float(water_intake_liters), 1)
        plan["hydration_alert"] = (
            f"Your recorded water intake is {water_intake_liters}L/day, which is {deficit}L below the recommended 3.0L daily target! "
            f"Dehydration slows down skin cell turnover, increases sebum viscosity (clogging pores), and weakens your moisture barrier. "
            f"Specialized internal & external hydration steps have been added below."
        )

        for d in plan.get("natural_days", []):
            d["tip"] = f"💧 Hydration Note: You logged {water_intake_liters}L water. Drink an extra {deficit}L today to hit 3.0L! " + d.get("tip", "")
            d["am"].append(f"Step 4 (Hydration Boost): Drink 500ml of fresh room-temperature water immediately upon waking.")

        for d in plan.get("clinical_days", []):
            d["tip"] = f"💧 Hydration Note: You logged {water_intake_liters}L water. Drink an extra {deficit}L today to hit 3.0L! " + d.get("tip", "")
            d["am"].append(f"Step 5 (Hydration Boost): Drink 500ml water to flush out cellular toxins and replenish skin moisture.")

    # 😴 SLEEP QUALITY CUSTOMIZATION
    if sleep_quality and any(term in sleep_quality.lower() for term in ["poor", "bad", "less", "5", "6", "insomnia"]):
        plan["sleep_alert"] = (
            f"Poor sleep quality ({sleep_quality}) increases stress hormones (cortisol), leading to skin inflammation and dark circles. "
            f"Overnight Cica recovery steps and soothing remedies have been reinforced."
        )

    # 🚫 ALLERGIES FILTERING
    if allergies:
        alg_set = {a.lower().strip() for a in allergies if a.strip()}
        if alg_set:
            for list_name in ["natural_days", "clinical_days"]:
                for day in plan.get(list_name, []):
                    for time_of_day in ["am", "pm"]:
                        filtered_steps = []
                        for step in day[time_of_day]:
                            subbed = False
                            for alg in alg_set:
                                if alg in step.lower():
                                    step = step.replace(alg.capitalize(), "Aloe Vera").replace(alg, "aloe vera")
                                    subbed = True
                            if subbed:
                                step += " ⚠️ (Ingredient substituted due to allergy preference)"
                            filtered_steps.append(step)
                        day[time_of_day] = filtered_steps

    return plan


def _build_redness_plan(skin_type: str) -> Dict:
    return {
        "plan_key": "redness",
        "concern_label": "Redness & Sensitive Skin Flushing",
        "goal": f"Soothe Vascular Flushing · Repair Skin Barrier · Reduce Facial Redness (Tailored for {skin_type} Skin)",
        "key_actives": [
            "Azelaic Acid 10%",
            "Centella Asiatica (Cica)",
            "Panthenol & Allantoin",
            "Mineral Zinc Oxide SPF 50"
        ],
        "natural_days": [
            {
                "day": "Monday",
                "focus": "Barrier Cooling & Aloe Leaf Relief",
                "am": [
                    "Step 1: Warm Water & Raw Honey Wash — Rinse face with warm water mixed with raw honey (anti-inflammatory).",
                    "Step 2: Fresh Aloe Vera Gel — Apply pure aloe leaf pulp to cool vascular redness.",
                    "Step 3: Natural Rose Water Spray — Mist rose water for soothing hydration."
                ],
                "pm": [
                    "Step 1: Cold Milk Wash — Gently cleanse with cold raw milk (natural lactic acid & soothing lipids).",
                    "Step 2: Sandalwood (Chandan) & Rosewater Paste — Apply for 15 mins to absorb skin heat, then rinse.",
                    "Step 3: Pure Aloe Vera Gel — Lock in natural moisture."
                ],
                "tip": "🍵 Drink cooling spearmint or chamomile tea today. Avoid hot water on your face!"
            },
            {
                "day": "Tuesday",
                "focus": "Cucumber & Oat Anti-Flushing Care",
                "am": [
                    "Step 1: Gram Flour (Besan) Wash — Gentle soap-free cleanser mixed with rose water.",
                    "Step 2: Fresh Cucumber Juice Splash — Apply cold cucumber juice as a cooling toner.",
                    "Step 3: Aloe Vera Moisture — Hydrate gently."
                ],
                "pm": [
                    "Step 1: Finely Ground Oat Rinse — Soak oats in water, massage gently to relieve redness.",
                    "Step 2: Cucumber & Plain Yogurt Mask — Mix 2 tbsp cucumber juice + 1 tbsp yogurt, leave for 15 mins.",
                    "Step 3: Jojoba Oil Finish — Pat 2 drops of jojoba oil to seal hydration."
                ],
                "tip": "🌱 Cucumber contains natural flavonoids that constrict dilated capillaries."
            },
            {
                "day": "Wednesday",
                "focus": "Centella (Gotu Kola) Deep Repair",
                "am": [
                    "Step 1: Honey Wash — Gentle morning cleanse.",
                    "Step 2: Centella / Gotu Kola Water Splash — Rinse with cooled boiled centella leaf tea.",
                    "Step 3: Rose Water Mist — Hydrate skin."
                ],
                "pm": [
                    "Step 1: Neem Water Wash — Cleanse face with mild neem water.",
                    "Step 2: Sandalwood & Honey Paste — Mix 1 tsp sandalwood powder + 1 tsp honey, leave for 15 mins.",
                    "Step 3: Aloe Vera Moisture — Calm skin overnight."
                ],
                "tip": "🌸 Sandalwood naturally lowers skin surface temperature and calms red patches."
            },
            {
                "day": "Thursday",
                "focus": "Green Tea Antioxidant Steam",
                "am": [
                    "Step 1: Besan Cleanser — Wash skin smoothly.",
                    "Step 2: Green Tea Water Splash — Cold green tea rinse to reduce inflammation.",
                    "Step 3: Aloe Vera Gel — Apply pure gel."
                ],
                "pm": [
                    "Step 1: Cool Green Tea Steam — Lean over warm green tea steam for 3 mins.",
                    "Step 2: Raw Organic Honey Mask — Spread raw honey for 15 mins then rinse with lukewarm water.",
                    "Step 3: Aloe & Rosehip Oil — Pat aloe vera with 1 drop rosehip oil."
                ],
                "tip": "♨️ Green Tea polyphenols suppress inflammatory histamine release in skin."
            },
            {
                "day": "Friday",
                "focus": "Cold Press Rosewater & Aloe Reset",
                "am": [
                    "Step 1: Honey Wash — Gentle cleansing.",
                    "Step 2: Rose Water Mist — Spray generously.",
                    "Step 3: Pure Aloe Leaf Gel — Hydrate smoothly."
                ],
                "pm": [
                    "Step 1: Cold Water Rinse — Refresh face.",
                    "Step 2: Turmeric Pinch & Aloe Mask — Mix 1 tbsp aloe gel + 1 pinch wild turmeric, leave for 10 mins.",
                    "Step 3: Jojoba Oil Finish — Nourish skin."
                ],
                "tip": "🧊 Keep your aloe vera gel in the fridge for an instant ice-cooling effect."
            },
            {
                "day": "Saturday",
                "focus": "Papaya Fruit Enzyme Soothing",
                "am": [
                    "Step 1: Besan Wash — Soap-free cleanser.",
                    "Step 2: Cucumber Juice Toner — Refresh face.",
                    "Step 3: Rose Water Spray — Hydrate."
                ],
                "pm": [
                    "Step 1: Warm Water Wash — Cleanse smoothly.",
                    "Step 2: Ripe Papaya Pulp Mask — Mash ripe papaya, apply for 10 mins to gently soften texture.",
                    "Step 3: Aloe Vera Moisture — Soothe skin."
                ],
                "tip": "🥭 Papaya enzymes gently dissolve flakiness without irritating sensitive red skin."
            },
            {
                "day": "Sunday",
                "focus": "Fermented Rice Water & Barrier Recovery",
                "am": [
                    "Step 1: Fermented Rice Water Splash — Rinse face for natural mineral hydration.",
                    "Step 2: Aloe Vera Gel — Apply pure gel.",
                    "Step 3: Rose Water Spray — Complete morning prep."
                ],
                "pm": [
                    "Step 1: Honey Wash — Wash face gently.",
                    "Step 2: Cold Chamomile Tea Compress — Lay soaked cotton pads on red areas for 15 mins.",
                    "Step 3: Aloe & Jojoba Finish — Lock in skin barrier moisture."
                ],
                "tip": "🌾 Chamomile compress relaxes facial capillary flushing naturally!"
            }
        ],
        "clinical_days": [
            {
                "day": "Monday",
                "focus": "Azelaic Acid 10% & Cica Barrier Repair",
                "am": [
                    "Step 1: Gentle Fragrance-Free pH 5.5 Cleanser — Wash face gently for 45 seconds.",
                    "Step 2: Azelaic Acid 10% Soothing Serum — Smooth 3 drops over face to reduce vascular redness.",
                    "Step 3: Lightweight Soothing Gel Moisturizer — Keep skin hydrated.",
                    "Step 4: Mineral Zinc Oxide Sunscreen SPF 50 — Physical barrier against sun heat."
                ],
                "pm": [
                    "Step 1: Non-Foaming Cleanser — Wash off daily dust and pollution.",
                    "Step 2: Centella / Cica Repair Serum — Calm skin irritation.",
                    "Step 3: Cicaplast Baume B5 Cream — Deeply repair skin moisture barrier overnight."
                ],
                "tip": "🛡️ Mineral Sunscreen (Zinc Oxide) physically reflects UV rays without causing skin warmth."
            },
            {
                "day": "Tuesday",
                "focus": "Neurosensine & Barrier Building",
                "am": [
                    "Step 1: Mild Hydrating Wash — Gentle morning cleanse.",
                    "Step 2: Neurosensine Soothing Serum — Calms nerve endings associated with skin redness.",
                    "Step 3: Light Cream Moisturizer — Soften dry skin patches.",
                    "Step 4: Mineral Sunscreen SPF 50 — Sun barrier protection."
                ],
                "pm": [
                    "Step 1: Mild Cleanser — Cleanse face thoroughly.",
                    "Step 2: Panthenol 5% Repair Lotion — Soothe redness and repair skin barrier.",
                    "Step 3: Soothing Night Cream — Lock in hydration."
                ],
                "tip": "💧 Apply moisturizer while skin is still damp to trap maximum water inside skin cells."
            },
            {
                "day": "Wednesday",
                "focus": "Niacinamide 2% Anti-Redness",
                "am": [
                    "Step 1: Gentle Cleanser — Refresh face.",
                    "Step 2: Low-Dose Niacinamide (2%) Serum — Calms inflammation and strengthens barrier.",
                    "Step 3: Gel Moisturizer — Hydrate softly.",
                    "Step 4: Mineral Sunscreen SPF 50 — Essential daily SPF."
                ],
                "pm": [
                    "Step 1: Mild Cleanser — Wash face with warm water.",
                    "Step 2: Azelaic Acid 10% Spot Gel — Apply onto specific red patches.",
                    "Step 3: Barrier Recovery Cream — Deep overnight repair."
                ],
                "tip": "🚫 Avoid physical scrub particles, alcohol, or heavy synthetic fragrances."
            },
            {
                "day": "Thursday",
                "focus": "Allantoin & Sensitive Skin Relief",
                "am": [
                    "Step 1: Gentle Cleanser — Wash skin smoothly.",
                    "Step 2: Allantoin Soothing Serum — Reduce redness and itching.",
                    "Step 3: Light Cream Moisturizer — Hydrate skin.",
                    "Step 4: Mineral Sunscreen SPF 50 — Complete sun protection."
                ],
                "pm": [
                    "Step 1: Non-Foaming Cleanser — Wash face gently.",
                    "Step 2: Centella Cica Serum — Repair active skin redness.",
                    "Step 3: Cicaplast Baume B5 — Lock in overnight recovery."
                ],
                "tip": "🌙 Give your skin a rest night without aggressive exfoliants or retinoids."
            },
            {
                "day": "Friday",
                "focus": "Redness Fading & Capillary Care",
                "am": [
                    "Step 1: Mild Wash — Cleanse morning oil.",
                    "Step 2: Azelaic Acid 10% Serum — Smooth over face.",
                    "Step 3: Soothing Gel Cream — Hydrate smoothly.",
                    "Step 4: Mineral Sunscreen SPF 50 — Shield skin from UV."
                ],
                "pm": [
                    "Step 1: Mild Cleanser — Cleanse face.",
                    "Step 2: Panthenol Soothing Lotion — Calm flushing.",
                    "Step 3: Barrier Night Mask — Hydrate overnight."
                ],
                "tip": "🥗 Eat anti-inflammatory foods (walnuts, green tea, berries, chia seeds)."
            },
            {
                "day": "Saturday",
                "focus": "Hydro-Barrier Sheet Mask Reset",
                "am": [
                    "Step 1: Gentle Cleanser — Refresh skin.",
                    "Step 2: Hyaluronic Acid Serum — Hydrate deeply.",
                    "Step 3: Light Cream — Soften skin.",
                    "Step 4: Mineral Sunscreen SPF 50 — Sun protection."
                ],
                "pm": [
                    "Step 1: Mild Wash — Cleanse face.",
                    "Step 2: Soothing Cica Sheet Mask — Leave for 15 mins to drench skin in hydration.",
                    "Step 3: Rich Barrier Cream — Seal in serum."
                ],
                "tip": "🧢 Wear a wide-brim hat outdoors to block direct sun heat on your face."
            },
            {
                "day": "Sunday",
                "focus": "Dermatological Recovery & Deep Sleep",
                "am": [
                    "Step 1: Gentle Wash — Cleanse smoothly.",
                    "Step 2: Centella Cica Serum — Soothe skin.",
                    "Step 3: Barrier Cream — Moisturize.",
                    "Step 4: Mineral Sunscreen SPF 50 — Daily protection."
                ],
                "pm": [
                    "Step 1: Mild Wash — Cleanse gently.",
                    "Step 2: Cicaplast Baume B5 Overnight Mask — Apply a generous layer before sleep."
                ],
                "tip": "🛌 8 hours of sleep allows your body to suppress inflammatory histamine release naturally."
            }
        ]
    }


def _build_dark_spots_plan(skin_type: str) -> Dict:
    return {
        "plan_key": "dark_spots",
        "concern_label": "Dark Spots & Hyperpigmentation",
        "goal": f"Fade Sun Spots & Post-Acne Marks · Inhibit Melanin · Restore Skin Luminosity (Tailored for {skin_type} Skin)",
        "key_actives": [
            "Vitamin C (L-Ascorbic Acid 15%)",
            "Alpha Arbutin 2%",
            "Niacinamide 10%",
            "Glycolic / Lactic Acid (AHA)"
        ],
        "natural_days": [
            {
                "day": "Monday",
                "focus": "Raw Potato Juice Melanin Inhibitor",
                "am": [
                    "Step 1: Cold Raw Milk Rinse — Wash face with cold milk (contains natural Lactic Acid).",
                    "Step 2: Potato Juice Swipe — Grate raw potato, dab fresh juice on dark spots with cotton for 15 mins.",
                    "Step 3: Aloe Vera Gel — Rinse cool and apply pure aloe vera."
                ],
                "pm": [
                    "Step 1: Rose Water Wash — Cleanse face softly.",
                    "Step 2: Honey & Lemon Spot Pack — Mix 1 tbsp raw honey + 2 drops lemon, dab on spots for 10 mins.",
                    "Step 3: Almond Oil Moisture — Massage 3 drops of pure sweet almond oil."
                ],
                "tip": "🥔 Raw Potato contains Catecholase, a natural enzyme proven to fade hyperpigmentation."
            },
            {
                "day": "Tuesday",
                "focus": "Tomato Pulp & Yogurt Natural AHA",
                "am": [
                    "Step 1: Gram Flour (Besan) Wash — Wash face with besan paste.",
                    "Step 2: Fresh Tomato Pulp — Apply fresh tomato pulp for 10 mins (rich in Vitamin C & Lycopene).",
                    "Step 3: Aloe Vera Moisture — Hydrate with aloe gel."
                ],
                "pm": [
                    "Step 1: Warm Water Wash — Cleanse face.",
                    "Step 2: Yogurt & Turmeric Mask — Mix 1 tbsp plain yogurt + 1/4 tsp turmeric, leave for 15 mins then rinse.",
                    "Step 3: Sweet Almond Oil — Pat dry and nourish."
                ],
                "tip": "🍅 Lycopene in tomatoes acts as an internal shield against sun-induced spot darkening."
            },
            {
                "day": "Wednesday",
                "focus": "Fermented Rice Water Brightening Ritual",
                "am": [
                    "Step 1: Rice Water Splash — Rinse face with soaked rice water for natural radiance.",
                    "Step 2: Aloe Vera Gel — Apply pure aloe gel."
                ],
                "pm": [
                    "Step 1: Rice Water Compression — Soak cotton pads in cold rice water, lay on dark spots for 15 mins.",
                    "Step 2: Rosehip Seed Oil — Pat 2 drops of rosehip oil (rich in Vitamin A & C) to repair skin tone."
                ],
                "tip": "🌾 Fermented Rice Water contains Kojic and Ferulic acids that brighten complexion naturally."
            },
            {
                "day": "Thursday",
                "focus": "Licorice Root (Mulethi) Melanin Inhibitor",
                "am": [
                    "Step 1: Rose Water Wash — Gentle morning splash.",
                    "Step 2: Aloe Vera Gel — Hydrate smoothly."
                ],
                "pm": [
                    "Step 1: Licorice & Milk Pack — Mix 1 tsp Mulethi powder with raw milk into paste, apply for 15 mins.",
                    "Step 2: Warm Water Rinse — Wash off gently."
                ],
                "tip": "🌿 Licorice root contains Glabridin, a natural compound proven to inhibit melanin synthesis!"
            },
            {
                "day": "Friday",
                "focus": "Saffron (Kesar) Radiance Infusion",
                "am": [
                    "Step 1: Besan Cleanser — Wash skin smoothly.",
                    "Step 2: Aloe Vera Gel — Hydrate."
                ],
                "pm": [
                    "Step 1: Saffron Milk Pack — Soak 3 strands of Saffron in 1 tbsp milk for 1 hour, apply over face for 20 mins.",
                    "Step 2: Cool Water Rinse — Wash off and pat dry."
                ],
                "tip": "✨ Saffron has been prized for centuries for imparting a radiant golden skin tone."
            },
            {
                "day": "Saturday",
                "focus": "Papaya Papain Fruit Enzyme Mask",
                "am": [
                    "Step 1: Rice Water Rinse — Refresh face.",
                    "Step 2: Aloe Vera Gel — Hydrate smoothly."
                ],
                "pm": [
                    "Step 1: Papaya Pack — Mash 2 ripe papaya cubes with 1 tsp honey, apply for 15 mins then rinse with lukewarm water.",
                    "Step 2: Aloe Vera Moisture — Lock in moisture."
                ],
                "tip": "🥭 Papaya enzymes gently dissolve hyperpigmented skin cells without irritation."
            },
            {
                "day": "Sunday",
                "focus": "Almond & Vitamin E Skin Repair",
                "am": [
                    "Step 1: Honey Wash — Cleanse skin.",
                    "Step 2: Aloe Vera Gel — Apply pure gel."
                ],
                "pm": [
                    "Step 1: Almond Paste Pack — Grind soaked peeled almonds with rose water into fine paste, leave for 15 mins then wash.",
                    "Step 2: Aloe Vera Finish — Moisturize skin smoothly."
                ],
                "tip": "🥜 Almonds are packed with natural Vitamin E, which repairs sun-damaged skin cells."
            }
        ],
        "clinical_days": [
            {
                "day": "Monday",
                "focus": "Morning Vitamin C 15% & Broad-Spectrum Sun Protection",
                "am": [
                    "Step 1: Brightening Face Wash — Cleanse morning oil and dullness.",
                    "Step 2: Vitamin C 15% Glow Serum — Apply 3-4 drops to neutralize free radicals and inhibit spot formation.",
                    "Step 3: Lightweight Gel Moisturizer — Keep skin soft and hydrated.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Essential to stop spots from darkening."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash away daily dirt and pollution.",
                    "Step 2: Alpha Arbutin 2% Serum — Apply onto dark spots to fade excess melanin.",
                    "Step 3: Niacinamide 10% Serum — Smooth out uneven skin tone.",
                    "Step 4: Nourishing Night Cream — Repair skin overnight."
                ],
                "tip": "☀️ Always wear SPF 50! Sunlight causes existing dark spots to become darker and more stubborn."
            },
            {
                "day": "Tuesday",
                "focus": "Retinol Night Renewal & Cell Turnover",
                "am": [
                    "Step 1: Mild Cleanser — Wash face smoothly.",
                    "Step 2: Niacinamide 10% Serum — Even out skin patchiness.",
                    "Step 3: Daily Moisturizer — Hydrate.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Protect from sun."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Cleanse face.",
                    "Step 2: Retinol 0.3% Night Serum — Apply a pea-sized amount to dry face to speed up cell turnover.",
                    "Step 3: Barrier Recovery Cream — Restore skin barrier overnight."
                ],
                "tip": "💧 Retinol sheds dark pigmented surface cells faster so clear new skin can emerge."
            },
            {
                "day": "Wednesday",
                "focus": "Gentle Chemical Exfoliation (AHA Glycolic Acid)",
                "am": [
                    "Step 1: Gentle Wash — Cleanse skin.",
                    "Step 2: Vitamin C Serum — Antioxidant protection.",
                    "Step 3: Hydrating Cream — Soften skin.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Daily SPF."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash face well.",
                    "Step 2: Glycolic Acid / AHA Exfoliating Toner — Swipe gently with cotton pad to loosen dead skin cells.",
                    "Step 3: Soothing Night Cream — Deeply hydrate skin."
                ],
                "tip": "🚫 Alternate Exfoliant and Retinol on different nights to keep skin comfortable."
            },
            {
                "day": "Thursday",
                "focus": "Tranexamic & Kojic Acid Targeted Fading",
                "am": [
                    "Step 1: Brightening Face Wash — Refresh skin.",
                    "Step 2: Tranexamic Acid 3% Serum — Target stubborn hyperpigmentation spots directly.",
                    "Step 3: Daily Moisturizer — Keep skin supple.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Shield skin from UV rays."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash face gently.",
                    "Step 2: Retinol 0.3% Serum — Smooth over face to speed skin turnover.",
                    "Step 3: Hydrating Barrier Cream — Moisturize deeply."
                ],
                "tip": "🍏 Eat fresh fruits rich in Vitamin C (oranges, kiwi, berries, bell peppers) to support internal skin health."
            },
            {
                "day": "Friday",
                "focus": "Botanical Licorice & Niacinamide Care",
                "am": [
                    "Step 1: Mild Face Wash — Cleanse skin.",
                    "Step 2: Niacinamide 10% Serum — Reduce uneven skin patches.",
                    "Step 3: Daily Moisturizer — Hydrate softly.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Sun barrier protection."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Cleanse thoroughly.",
                    "Step 2: Alpha Arbutin 2% Serum — Dab gently on dark spots.",
                    "Step 3: Night Cream — Repair skin overnight."
                ],
                "tip": "⏱️ Fading dark spots requires 4 to 6 weeks of consistent daily sun protection!"
            },
            {
                "day": "Saturday",
                "focus": "Weekly Radiance Enzyme Glow",
                "am": [
                    "Step 1: Gentle Wash — Refresh face.",
                    "Step 2: Vitamin C Glow Serum — Brighten skin tone.",
                    "Step 3: Daily Moisturizer — Soften skin.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Shield from sun."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash off daily grime.",
                    "Step 2: Radiance Enzyme Mask — Apply for 15 minutes to reveal fresh glow, then rinse.",
                    "Step 3: Alpha Arbutin Spot Serum — Apply on dark areas.",
                    "Step 4: Night Cream — Deeply nourish skin."
                ],
                "tip": "🧢 Wear a wide hat or sunglasses when outdoors to protect face from direct sunlight."
            },
            {
                "day": "Sunday",
                "focus": "Deep Barrier Hydration & Overnight Recovery",
                "am": [
                    "Step 1: Hydrating Face Wash — Gentle morning wash.",
                    "Step 2: Hyaluronic Acid Serum — Plump skin with moisture.",
                    "Step 3: Daily Moisturizer — Soften skin.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Complete sun protection."
                ],
                "pm": [
                    "Step 1: Gentle Wash — Cleanse smoothly.",
                    "Step 2: Hydrating Sheet Mask — Relax with a hydrating sheet mask for 15 minutes.",
                    "Step 3: Rich Night Cream — Lock in moisture for overnight repair."
                ],
                "tip": "🛌 Get 8 hours of sleep tonight! Deep sleep is when skin cells naturally repair sun discoloration."
            }
        ]
    }


def _build_wrinkles_plan(skin_type: str) -> Dict:
    return {
        "plan_key": "wrinkles",
        "concern_label": "Wrinkles & Fine Lines (Anti-Aging)",
        "goal": f"Boost Collagen Production · Smooth Fine Lines · Firm Skin Elasticity (Tailored for {skin_type} Skin)",
        "key_actives": [
            "Retinol / Retinaldehyde 0.3%",
            "Multi-Peptide Complex",
            "Hyaluronic Acid & Ceramides",
            "Antioxidant Vitamin C & E"
        ],
        "natural_days": [
            {
                "day": "Monday",
                "focus": "Raw Honey & Raw Milk Collagen Boost",
                "am": [
                    "Step 1: Warm Water & Raw Milk Wash — Rinse face gently with raw milk.",
                    "Step 2: Pure Aloe Vera Gel — Apply pure gel to firm skin moisture.",
                    "Step 3: Rose Water Spray — Hydrate face."
                ],
                "pm": [
                    "Step 1: Honey Cleanser — Massage raw honey over face for 2 minutes then rinse.",
                    "Step 2: Rosehip Seed Oil Massage — Gently massage 3 drops of rosehip oil (rich in natural Retinoic acid) upwards.",
                    "Step 3: Aloe Vera Seal — Lock in moisture."
                ],
                "tip": "💆 Always massage face in upward circular strokes to promote lymphatic drainage and skin firmness."
            },
            {
                "day": "Tuesday",
                "focus": "Papaya Fruit Enzyme Collagen Mask",
                "am": [
                    "Step 1: Besan Wash — Gentle natural cleansing.",
                    "Step 2: Cucumber Juice Splash — Tone and cool skin.",
                    "Step 3: Aloe Moisture — Hydrate."
                ],
                "pm": [
                    "Step 1: Warm Rinse — Wash face.",
                    "Step 2: Ripe Papaya & Honey Mask — Mash 2 cubes ripe papaya + 1 tsp honey, apply for 15 mins.",
                    "Step 3: Almond Oil Moisture — Massage 3 drops of pure almond oil (rich in Vitamin E)."
                ],
                "tip": "🥭 Papaya contains Papain enzymes that smooth fine surface lines naturally."
            },
            {
                "day": "Wednesday",
                "focus": "Avocado & Honey Lipid Nourishment",
                "am": [
                    "Step 1: Milk Cleanser — Wash skin smoothly.",
                    "Step 2: Aloe Vera Gel — Apply pure gel."
                ],
                "pm": [
                    "Step 1: Avocado & Honey Pack — Mash 1 tbsp ripe avocado + 1 tsp honey, apply for 15 mins for deep fatty acid hydration.",
                    "Step 2: Rose Water Rinse — Rinse with cool water."
                ],
                "tip": "🥑 Avocado healthy fats deeply nourish skin barrier to plump out fine dehydrated lines."
            },
            {
                "day": "Thursday",
                "focus": "Green Tea Anti-Aging Steam",
                "am": [
                    "Step 1: Honey Wash — Cleanse face.",
                    "Step 2: Green Tea Water Splash — Antioxidant rinse."
                ],
                "pm": [
                    "Step 1: Green Tea Steam — Steam face over brewed green tea for 4 mins.",
                    "Step 2: Aloe & Rosehip Oil — Apply aloe gel blended with 2 drops rosehip oil."
                ],
                "tip": "♨️ Green Tea EGCG antioxidants prevent collagen breakdown caused by daily pollution."
            },
            {
                "day": "Friday",
                "focus": "Saffron & Milk Collagen Infusion",
                "am": [
                    "Step 1: Besan Wash — Wash smoothly.",
                    "Step 2: Aloe Vera Gel — Hydrate."
                ],
                "pm": [
                    "Step 1: Saffron & Milk Pack — Apply saffron-soaked milk for 20 mins to revive dull mature skin.",
                    "Step 2: Cool Water Rinse — Wash off gently."
                ],
                "tip": "✨ Saffron enhances micro-circulation, bringing fresh blood flow and glow to skin cells."
            },
            {
                "day": "Saturday",
                "focus": "Almond & Flaxseed Tightening Mask",
                "am": [
                    "Step 1: Rice Water Splash — Brighten skin.",
                    "Step 2: Aloe Vera Gel — Hydrate."
                ],
                "pm": [
                    "Step 1: Flaxseed Gel Mask — Boiled flaxseed gel applied for 15 mins until dry & firm, then rinse.",
                    "Step 2: Almond Oil Finish — Nourish deeply."
                ],
                "tip": "🌱 Flaxseed gel creates a natural lifting effect and drenches skin in Omega-3 fatty acids!"
            },
            {
                "day": "Sunday",
                "focus": "Fermented Rice Water & Deep Sleep Recovery",
                "am": [
                    "Step 1: Rice Water Splash — Rinse face.",
                    "Step 2: Aloe Vera Gel — Apply pure gel."
                ],
                "pm": [
                    "Step 1: Honey Wash — Gentle wash.",
                    "Step 2: Coconut Milk Pack — Apply fresh coconut milk for 15 mins for deep lipid repair."
                ],
                "tip": "🛌 Deep REM sleep is when human growth hormone surges to repair facial collagen fibers."
            }
        ],
        "clinical_days": [
            {
                "day": "Monday",
                "focus": "Morning Vitamin C + Ferulic & SPF 50 Defense",
                "am": [
                    "Step 1: Gentle Hydrating Cleanser — Wash skin smoothly.",
                    "Step 2: Vitamin C 15% + Ferulic Acid Serum — Apply 4 drops to stimulate collagen & shield against free radicals.",
                    "Step 3: Multi-Peptide Firming Cream — Moisturize deeply.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Essential daily UV shield."
                ],
                "pm": [
                    "Step 1: Mild Cleanser — Cleanse evening dirt.",
                    "Step 2: Retinol 0.3% Night Serum — Apply a pea-sized amount to clean dry face.",
                    "Step 3: Ceramide & Hyaluronic Repair Cream — Deeply nourish skin barrier overnight."
                ],
                "tip": "☀️ 80% of skin aging is caused by UV rays! Sunscreen is the #1 anti-aging cream."
            },
            {
                "day": "Tuesday",
                "focus": "Peptide Firming & Hydration Locks",
                "am": [
                    "Step 1: Gentle Cleanser — Refresh face.",
                    "Step 2: Multi-Peptide Complex Serum — Boost elastin and skin firmness.",
                    "Step 3: Hyaluronic Cream — Plump skin lines.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Complete sun protection."
                ],
                "pm": [
                    "Step 1: Mild Cleanser — Wash face gently.",
                    "Step 2: Niacinamide 5% Serum — Smooth texture.",
                    "Step 3: Rich Night Recovery Balm — Lock in moisture."
                ],
                "tip": "💧 Peptides signal skin cells to produce new structural collagen proteins."
            },
            {
                "day": "Wednesday",
                "focus": "Retinol 0.3% Cell Turnover Night",
                "am": [
                    "Step 1: Gentle Wash — Cleanse skin.",
                    "Step 2: Vitamin C Serum — Antioxidant shield.",
                    "Step 3: Peptide Cream — Moisturize.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Sun barrier."
                ],
                "pm": [
                    "Step 1: Mild Cleanser — Cleanse face.",
                    "Step 2: Retinol 0.3% Serum — Speed cellular renewal to diminish fine line depth.",
                    "Step 3: Barrier Recovery Cream — Nourish deeply."
                ],
                "tip": "🌙 Always apply Retinol to completely dry skin to prevent deep irritation."
            },
            {
                "day": "Thursday",
                "focus": "Gentle AHA Exfoliation (Lactic Acid)",
                "am": [
                    "Step 1: Hydrating Cleanser — Refresh morning skin.",
                    "Step 2: Peptide Serum — Smooth elasticity.",
                    "Step 3: Daily Cream — Hydrate.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Daily protection."
                ],
                "pm": [
                    "Step 1: Mild Wash — Cleanse thoroughly.",
                    "Step 2: Lactic Acid 5% Serum — Gently dissolve dead surface texture.",
                    "Step 3: Soothing Ceramide Night Cream — Restore barrier."
                ],
                "tip": "🚫 Do not mix Retinol and AHA Exfoliants on the exact same night."
            },
            {
                "day": "Friday",
                "focus": "Multi-Peptide & Copper Peptide Renewal",
                "am": [
                    "Step 1: Gentle Cleanser — Wash smoothly.",
                    "Step 2: Vitamin C Serum — Brighten & protect.",
                    "Step 3: Peptide Moisturizer — Firm skin elasticity.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — UV barrier."
                ],
                "pm": [
                    "Step 1: Mild Cleanser — Cleanse face.",
                    "Step 2: Copper Peptide Serum — Support skin tissue regeneration.",
                    "Step 3: Night Cream — Nourish overnight."
                ],
                "tip": "🥗 Eat foods rich in Omega-3 fatty acids (flaxseeds, walnuts, salmon) for plump skin cell membranes."
            },
            {
                "day": "Saturday",
                "focus": "Retinol Collagen Speed Boost",
                "am": [
                    "Step 1: Gentle Wash — Refresh face.",
                    "Step 2: Peptide Serum — Firm skin.",
                    "Step 3: Hydrating Cream — Soften skin.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Protection."
                ],
                "pm": [
                    "Step 1: Mild Wash — Cleanse evening dirt.",
                    "Step 2: Retinol 0.3% Serum — Smooth over face to boost collagen synthesis.",
                    "Step 3: Rich Ceramide Cream — Lock in hydration."
                ],
                "tip": "🧢 Wear sunglasses outdoors to avoid squinting, which forms crow's feet wrinkles."
            },
            {
                "day": "Sunday",
                "focus": "Hydro-Plumping Mask & Sleep Recovery",
                "am": [
                    "Step 1: Hydrating Cleanser — Wash skin smoothly.",
                    "Step 2: Hyaluronic Acid Serum — Plump fine dehydrated lines.",
                    "Step 3: Peptide Cream — Soften skin.",
                    "Step 4: Broad-Spectrum Sunscreen SPF 50 — Sun barrier."
                ],
                "pm": [
                    "Step 1: Mild Wash — Cleanse gently.",
                    "Step 2: Collagen & Peptide Sheet Mask — Leave for 15 mins to deeply drench skin.",
                    "Step 3: Barrier Recovery Night Balm — Seal in moisture for overnight healing."
                ],
                "tip": "🛌 8 hours of sleep allows facial muscles to relax and skin repair mechanisms to operate at peak efficiency!"
            }
        ]
    }


def _build_pores_blackheads_plan(skin_type: str) -> Dict:
    return {
        "plan_key": "pores_blackheads",
        "concern_label": "Blackheads, Whiteheads & Large Pores",
        "goal": f"Dissolve Sebum Plugs · Tighten Pores · Prevent Whiteheads & Blackheads (Tailored for {skin_type} Skin)",
        "key_actives": [
            "Salicylic Acid 2% (BHA)",
            "Niacinamide 10% + Zinc PCA",
            "Charcoal & Kaolin Clay",
            "Retinol 0.3%"
        ],
        "natural_days": [
            {
                "day": "Monday",
                "focus": "Multani Mitti (Fuller's Earth) & Rosewater Pore Cleanse",
                "am": [
                    "Step 1: Honey & Warm Water Wash — Rinse face gently.",
                    "Step 2: Fresh Aloe Vera Gel — Apply pure gel to balance oil.",
                    "Step 3: Rose Water Spray — Hydrate face."
                ],
                "pm": [
                    "Step 1: Besan Wash — Gentle soap-free cleanser.",
                    "Step 2: Multani Mitti Mask — Mix 1 tbsp Multani Mitti + rose water, apply for 10 mins until semi-dry then rinse.",
                    "Step 3: Aloe Vera Moisture — Lock in light hydration."
                ],
                "tip": "🍃 Multani Mitti acts like a natural magnet to draw out deep pore oil and blackheads."
            },
            {
                "day": "Tuesday",
                "focus": "Green Tea Facial Steam & Honey Pack",
                "am": [
                    "Step 1: Besan Cleanser — Wash skin smoothly.",
                    "Step 2: Cucumber Juice Splash — Refresh t-zone.",
                    "Step 3: Aloe Gel — Hydrate."
                ],
                "pm": [
                    "Step 1: Green Tea Steam — Steam face over hot brewed green tea for 4 mins to loosen blackhead plugs.",
                    "Step 2: Raw Organic Honey Mask — Spread raw honey for 15 mins to kill trapped bacteria.",
                    "Step 3: Aloe Vera Finish — Apply pure gel."
                ],
                "tip": "♨️ Facial steam softens hardened sebum plugs inside blackheads for easy natural clearing."
            },
            {
                "day": "Wednesday",
                "focus": "Activated Charcoal & Kaolin Pore Purifier",
                "am": [
                    "Step 1: Honey Wash — Cleanse morning skin.",
                    "Step 2: Rose Water Spray — Refresh pores."
                ],
                "pm": [
                    "Step 1: Warm Water Wash — Cleanse face.",
                    "Step 2: Charcoal Clay Pack — Mix activated charcoal powder + kaolin clay + rose water, apply on t-zone for 10 mins.",
                    "Step 3: Aloe Vera Gel — Hydrate skin."
                ],
                "tip": "🖤 Activated Charcoal absorbs up to 200x its weight in pore impurities and excess oil."
            },
            {
                "day": "Thursday",
                "focus": "Cucumber Juice Pore Tightening",
                "am": [
                    "Step 1: Besan Cleanser — Wash face.",
                    "Step 2: Cold Cucumber Juice Swipe — Swipe cold cucumber juice across nose and forehead."
                ],
                "pm": [
                    "Step 1: Warm Water Rinse — Wash face.",
                    "Step 2: Egg White or Flaxseed Gel Pack — Apply flaxseed gel or egg white for 12 mins until firm for pore tightening.",
                    "Step 3: Aloe Moisture — Hydrate."
                ],
                "tip": "🥒 Cold cucumber juice acts as a natural astringent to visibly tighten expanded pore openings."
            },
            {
                "day": "Friday",
                "focus": "Neem Water Anti-Bacterial Rinse",
                "am": [
                    "Step 1: Honey Wash — Gentle morning cleanse.",
                    "Step 2: Aloe Gel — Apply pure gel."
                ],
                "pm": [
                    "Step 1: Neem Water Wash — Rinse face with cooled boiled neem leaf water.",
                    "Step 2: Sandalwood & Rosewater Paste — Apply for 15 mins to cool skin heat.",
                    "Step 3: Aloe Vera Gel — Hydrate."
                ],
                "tip": "🍃 Neem leaves contain natural antibacterial compounds that prevent blackheads from turning into red pimples."
            },
            {
                "day": "Saturday",
                "focus": "Papaya Fruit Enzyme Exfoliation",
                "am": [
                    "Step 1: Besan Wash — Soap-free cleanser.",
                    "Step 2: Rose Water Mist — Refresh."
                ],
                "pm": [
                    "Step 1: Papaya Pack — Mash ripe papaya pulp, apply over nose and chin for 12 mins.",
                    "Step 2: Lukewarm Water Rinse — Rinse gently."
                ],
                "tip": "🥭 Papaya enzymes break down keratin proteins that trap dead skin inside whiteheads."
            },
            {
                "day": "Sunday",
                "focus": "Fermented Rice Water & Aloe Hydration",
                "am": [
                    "Step 1: Rice Water Splash — Rinse face.",
                    "Step 2: Aloe Gel — Apply pure gel."
                ],
                "pm": [
                    "Step 1: Honey Wash — Wash face gently.",
                    "Step 2: Cold Rosewater & Aloe Finish — Pat dry and hydrate."
                ],
                "tip": "🌾 Balanced skin hydration stops your oil glands from over-producing excess pore-clogging sebum!"
            }
        ],
        "clinical_days": [
            {
                "day": "Monday",
                "focus": "Salicylic Acid 2% (BHA) Pore Dissolving",
                "am": [
                    "Step 1: Salicylic Acid 2% Face Wash — Wash face for 60 seconds to penetrate oil inside pores.",
                    "Step 2: Niacinamide 10% + Zinc PCA Serum — Apply 3 drops to tighten pores and regulate oil.",
                    "Step 3: Oil-Free Mattifying Gel Moisturizer — Keep skin hydrated without shine.",
                    "Step 4: Dry-Touch Sunscreen SPF 50 — Protect skin from sun damage."
                ],
                "pm": [
                    "Step 1: Gentle Cleanser — Wash off daily oil and grime.",
                    "Step 2: BHA 2% Liquid Exfoliant — Swipe gently over nose, forehead, and chin with cotton pad.",
                    "Step 3: Lightweight Gel Moisture — Hydrate skin overnight."
                ],
                "tip": "🧪 Salicylic Acid (BHA) is oil-soluble, allowing it to dive deep inside pores to dissolve blackhead plugs."
            },
            {
                "day": "Tuesday",
                "focus": "Niacinamide Sebum Control & Retinol Renewal",
                "am": [
                    "Step 1: Mild Gel Cleanser — Wash morning skin.",
                    "Step 2: Niacinamide 10% Serum — Tighten enlarged pore walls.",
                    "Step 3: Light Gel Cream — Hydrate.",
                    "Step 4: Dry-Touch Sunscreen SPF 50 — Sun barrier."
                ],
                "pm": [
                    "Step 1: Mild Cleanser — Cleanse face.",
                    "Step 2: Retinol 0.3% Night Serum — Apply a small pea-sized amount to prevent pore clogging.",
                    "Step 3: Barrier Recovery Lotion — Hydrate."
                ],
                "tip": "💧 Niacinamide shrinks enlarged pore openings by preventing oil buildup from stretching pore walls."
            },
            {
                "day": "Wednesday",
                "focus": "Charcoal & Kaolin Deep Clay Detox",
                "am": [
                    "Step 1: Salicylic Acid Cleanser — Clear morning oil.",
                    "Step 2: Niacinamide Serum — Balance skin sebum.",
                    "Step 3: Gel Moisturizer — Hydrate.",
                    "Step 4: Dry-Touch Sunscreen SPF 50 — Sun protection."
                ],
                "pm": [
                    "Step 1: Mild Wash — Cleanse face.",
                    "Step 2: Purifying Charcoal Clay Mask — Apply to t-zone for 10 minutes to draw out deep pore dirt, then rinse.",
                    "Step 3: Light Night Lotion — Soothe skin."
                ],
                "tip": "🖤 Use clay mask 1-2 times weekly to keep nose and chin pore openings clear."
            },
            {
                "day": "Thursday",
                "focus": "Pore Refining & Retinol Cell Turnover",
                "am": [
                    "Step 1: Gentle Cleanser — Refresh skin.",
                    "Step 2: Niacinamide 10% Serum — Smooth pore texture.",
                    "Step 3: Gel Moisturizer — Hydrate.",
                    "Step 4: Dry-Touch Sunscreen SPF 50 — Protection."
                ],
                "pm": [
                    "Step 1: Mild Cleanser — Wash face.",
                    "Step 2: Retinol 0.3% Serum — Smooth skin texture and unclog whitehead plugs.",
                    "Step 3: Barrier Lotion — Hydrate."
                ],
                "tip": "🌙 Retinol keeps skin cells shedding evenly so they don't get trapped inside pore openings."
            },
            {
                "day": "Friday",
                "focus": "BHA Liquid Exfoliation & Sebum Balance",
                "am": [
                    "Step 1: Salicylic Acid Wash — Cleanse t-zone.",
                    "Step 2: Niacinamide Serum — Oil control.",
                    "Step 3: Gel Moisturizer — Soften skin.",
                    "Step 4: Dry-Touch Sunscreen SPF 50 — UV barrier."
                ],
                "pm": [
                    "Step 1: Gentle Cleanser — Wash face.",
                    "Step 2: BHA 2% Liquid Exfoliant — Swipe over blackhead-prone areas.",
                    "Step 3: Soothing Gel Cream — Hydrate overnight."
                ],
                "tip": "🥗 Limit high-glycemic sugars and dairy to prevent insulin spikes that trigger sebum production."
            },
            {
                "day": "Saturday",
                "focus": "Gentle AHA Surface Smoothing",
                "am": [
                    "Step 1: Gentle Wash — Cleanse face.",
                    "Step 2: Niacinamide Serum — Tighten pores.",
                    "Step 3: Light Moisturizer — Hydrate.",
                    "Step 4: Dry-Touch Sunscreen SPF 50 — Sun protection."
                ],
                "pm": [
                    "Step 1: Mild Cleanser — Wash face.",
                    "Step 2: AHA Glycolic 5% Exfoliating Serum — Remove surface dead skin cells.",
                    "Step 3: Barrier Cream — Restore moisture."
                ],
                "tip": "🚫 Never squeeze or pop whiteheads with dirty fingers to prevent permanent scarring."
            },
            {
                "day": "Sunday",
                "focus": "Hydro-Balance Sheet Mask & Barrier Recovery",
                "am": [
                    "Step 1: Gentle Cleanser — Refresh morning skin.",
                    "Step 2: Hyaluronic Acid Serum — Hydrate.",
                    "Step 3: Light Gel Cream — Soften skin.",
                    "Step 4: Dry-Touch Sunscreen SPF 50 — Complete SPF."
                ],
                "pm": [
                    "Step 1: Mild Wash — Cleanse gently.",
                    "Step 2: Hydrating Oil-Free Sheet Mask — Relax for 15 minutes to replenish skin water content.",
                    "Step 3: Barrier Night Lotion — Lock in moisture."
                ],
                "tip": "🛌 8 hours of sleep regulates cortisol hormones that cause oily skin overproduction!"
            }
        ]
    }


def _build_dryness_plan(skin_type: str) -> Dict:
    return {
        "plan_key": "dryness",
        "concern_label": "Dry, Flaky & Dehydrated Skin",
        "goal": f"Deep Lipid Hydration · Restore Skin Barrier · Lock in Moisture (Tailored for {skin_type} Skin)",
        "key_actives": [
            "Ceramides NP/AP/EOP",
            "Hyaluronic Acid (Multi-Molecular)",
            "Squalane & Shea Butter",
            "Glycerin & Urea"
        ],
        "natural_days": [
            {
                "day": "Monday",
                "focus": "Raw Honey & Cold Milk Deep Hydration",
                "am": [
                    "Step 1: Raw Milk Rinse — Wash face with cold raw milk (rich in natural lactic acid and moisturizing lipids).",
                    "Step 2: Pure Aloe Vera Gel — Apply pure gel to damp skin.",
                    "Step 3: Jojoba Oil — Massage 3 drops of pure jojoba oil."
                ],
                "pm": [
                    "Step 1: Honey Wash — Massage raw organic honey over face for 2 mins, rinse with lukewarm water.",
                    "Step 2: Avocado & Honey Pack — Mash 1 tbsp avocado + 1 tsp honey, leave for 15 mins then rinse.",
                    "Step 3: Sweet Almond Oil — Massage 4 drops to nourish skin overnight."
                ],
                "tip": "🍯 Raw honey is a natural humectant that draws water from air directly into dry skin cells."
            },
            {
                "day": "Tuesday",
                "focus": "Malai (Milk Cream) & Turmeric Lipid Repair",
                "am": [
                    "Step 1: Milk Wash — Cleanse face with cold milk.",
                    "Step 2: Aloe Gel — Apply pure gel.",
                    "Step 3: Rose Water Spray — Hydrate."
                ],
                "pm": [
                    "Step 1: Gentle Wash — Rinse face.",
                    "Step 2: Malai & Turmeric Mask — Mix 1 tbsp fresh milk cream (malai) + 1 pinch wild turmeric, leave for 15 mins then wipe.",
                    "Step 3: Jojoba Oil Finish — Lock in moisture."
                ],
                "tip": "🥛 Milk cream (Malai) contains natural essential fatty acids that repair dry, cracked skin barriers."
            },
            {
                "day": "Wednesday",
                "focus": "Coconut Milk & Oat Soothing Rinse",
                "am": [
                    "Step 1: Honey Wash — Cleanse skin.",
                    "Step 2: Aloe Gel — Hydrate."
                ],
                "pm": [
                    "Step 1: Oat Rinse — Wash face with soaked ground oat water.",
                    "Step 2: Fresh Coconut Milk Pack — Apply fresh coconut milk for 15 mins to drench skin in lipids.",
                    "Step 3: Rosehip Oil Finish — Massage 3 drops."
                ],
                "tip": "🥥 Coconut milk is packed with Vitamin E and lauric acid that soften dry skin texture."
            },
            {
                "day": "Thursday",
                "focus": "Banana & Honey Moisture Mask",
                "am": [
                    "Step 1: Milk Cleanser — Wash skin smoothly.",
                    "Step 2: Aloe Vera Gel — Hydrate."
                ],
                "pm": [
                    "Step 1: Warm Water Rinse — Wash face.",
                    "Step 2: Ripe Banana Pack — Mash half ripe banana + 1 tsp honey, leave for 15 mins then rinse.",
                    "Step 3: Almond Oil Moisture — Massage 3 drops."
                ],
                "tip": "🍌 Bananas are rich in potassium and natural oils that restore supple elasticity to dry skin."
            },
            {
                "day": "Friday",
                "focus": "Aloe Vera & Glycerin Hydration Lock",
                "am": [
                    "Step 1: Honey Wash — Cleanse morning skin.",
                    "Step 2: Aloe Vera & Glycerin Mix — Blend 1 tsp aloe gel + 2 drops vegetable glycerin on damp face."
                ],
                "pm": [
                    "Step 1: Milk Wash — Rinse face gently.",
                    "Step 2: Curd & Honey Pack — Mix 1 tbsp fresh curd + 1 tsp honey, leave for 15 mins then rinse.",
                    "Step 3: Jojoba Oil — Lock in moisture."
                ],
                "tip": "💧 Always apply glycerin or aloe onto damp skin for maximum moisture retention!"
            },
            {
                "day": "Saturday",
                "focus": "Flaxseed Gel Deep Lipid Mask",
                "am": [
                    "Step 1: Rice Water Rinse — Refresh skin.",
                    "Step 2: Aloe Gel — Hydrate."
                ],
                "pm": [
                    "Step 1: Warm Rinse — Wash face.",
                    "Step 2: Flaxseed Gel Mask — Apply fresh boiled flaxseed gel for 15 mins for Omega-3 hydration.",
                    "Step 3: Almond Oil Finish — Nourish skin."
                ],
                "tip": "🌱 Flaxseed gel coats dry skin in a rich layer of protective Omega-3 fatty acids."
            },
            {
                "day": "Sunday",
                "focus": "Fermented Rice Water & Almond Repair",
                "am": [
                    "Step 1: Rice Water Splash — Rinse face.",
                    "Step 2: Aloe Vera Gel — Hydrate."
                ],
                "pm": [
                    "Step 1: Almond Paste Pack — Grind soaked almonds with rose water, leave for 15 mins then rinse.",
                    "Step 2: Rosehip & Jojoba Oil Blend — Massage 3 drops."
                ],
                "tip": "🌾 Rice water and almond paste deeply nourish dry, flaky skin patches."
            }
        ],
        "clinical_days": [
            {
                "day": "Monday",
                "focus": "Ceramide & Hyaluronic Acid Barrier Restoration",
                "am": [
                    "Step 1: Non-Foaming Hydrating Cream Cleanser — Wash face gently for 30 seconds.",
                    "Step 2: Hyaluronic Acid 2% + B5 Serum — Apply to damp skin for deep moisture plumping.",
                    "Step 3: Rich Ceramide & Squalane Moisturizer — Lock in skin barrier hydration.",
                    "Step 4: Hydrating Sunscreen SPF 50 — Protect skin from UV dehydration."
                ],
                "pm": [
                    "Step 1: Gentle Cleanser — Wash off daily dust.",
                    "Step 2: Hyaluronic Acid Serum — Apply onto damp skin.",
                    "Step 3: Ultra-Nourishing Ceramide Night Cream — Deeply restore dry skin barrier overnight."
                ],
                "tip": "🛡️ Ceramides replace missing lipids in dry skin, stopping moisture from evaporating."
            },
            {
                "day": "Tuesday",
                "focus": "Squalane Lipid & Barrier Repair",
                "am": [
                    "Step 1: Hydrating Cleanser — Refresh face.",
                    "Step 2: Squalane Facial Oil / Serum — Mimics natural skin sebum to soften flakiness.",
                    "Step 3: Ceramide Moisturizer — Soften skin.",
                    "Step 4: Hydrating Sunscreen SPF 50 — Sun barrier."
                ],
                "pm": [
                    "Step 1: Gentle Cleanser — Cleanse face.",
                    "Step 2: Panthenol 5% Soothing Serum — Repair dry cracked barrier.",
                    "Step 3: Rich Night Balm — Lock in moisture."
                ],
                "tip": "💧 Apply moisturizer within 60 seconds of washing face to seal in water."
            },
            {
                "day": "Wednesday",
                "focus": "Glycerin & Urea Moisture Lock",
                "am": [
                    "Step 1: Hydrating Cleanser — Wash skin smoothly.",
                    "Step 2: Glycerin & Hyaluronic Serum — Deep moisture retention.",
                    "Step 3: Ceramide Cream — Soften dry skin.",
                    "Step 4: Hydrating Sunscreen SPF 50 — Daily protection."
                ],
                "pm": [
                    "Step 1: Gentle Cleanser — Wash face.",
                    "Step 2: Urea 5% Hydrating Lotion — Smooth dry rough texture.",
                    "Step 3: Rich Ceramide Cream — Deep hydration."
                ],
                "tip": "🧪 Urea is a natural moisturizing factor (NMF) that softens rough flaky dry patches."
            },
            {
                "day": "Thursday",
                "focus": "Gentle Lactic Acid AHA Hydrating Exfoliation",
                "am": [
                    "Step 1: Hydrating Cleanser — Refresh skin.",
                    "Step 2: Hyaluronic Acid Serum — Plump skin.",
                    "Step 3: Squalane Moisturizer — Soften skin.",
                    "Step 4: Hydrating Sunscreen SPF 50 — Protection."
                ],
                "pm": [
                    "Step 1: Gentle Cleanser — Wash face.",
                    "Step 2: Lactic Acid 5% Serum — Gently dissolve dead flaky skin while boosting moisture.",
                    "Step 3: Rich Ceramide Night Cream — Restore barrier."
                ],
                "tip": "🚫 Lactic Acid is the gentlest AHA and actually hydrates dry skin while removing flakes."
            },
            {
                "day": "Friday",
                "focus": "Multi-Ceramide Barrier Defense",
                "am": [
                    "Step 1: Hydrating Cleanser — Wash smoothly.",
                    "Step 2: Hyaluronic Acid Serum — Drench skin in moisture.",
                    "Step 3: Ceramide Cream — Soften skin.",
                    "Step 4: Hydrating Sunscreen SPF 50 — UV barrier."
                ],
                "pm": [
                    "Step 1: Gentle Cleanser — Wash face.",
                    "Step 2: Panthenol Soothing Serum — Calm dry tightness.",
                    "Step 3: Ultra-Rich Night Balm — Deep overnight repair."
                ],
                "tip": "🥗 Drink 3L of water daily and include healthy fats (avocados, olive oil, almonds) in your diet."
            },
            {
                "day": "Saturday",
                "focus": "Deep Moisture Sheet Mask Reset",
                "am": [
                    "Step 1: Hydrating Cleanser — Wash smoothly.",
                    "Step 2: Hyaluronic Acid Serum — Hydrate.",
                    "Step 3: Ceramide Cream — Soften skin.",
                    "Step 4: Hydrating Sunscreen SPF 50 — Protection."
                ],
                "pm": [
                    "Step 1: Gentle Cleanser — Cleanse face.",
                    "Step 2: Ceramide & Hyaluronic Sheet Mask — Leave for 15 mins to deeply drench skin.",
                    "Step 3: Squalane Night Cream — Lock in hydration."
                ],
                "tip": "🧢 Avoid long hot showers — hot water strips natural protective skin oils."
            },
            {
                "day": "Sunday",
                "focus": "Dermatological Moisture Overhaul & Sleep",
                "am": [
                    "Step 1: Hydrating Cleanser — Cleanse smoothly.",
                    "Step 2: Hyaluronic Acid Serum — Plump skin.",
                    "Step 3: Rich Ceramide Cream — Moisturize.",
                    "Step 4: Hydrating Sunscreen SPF 50 — Daily protection."
                ],
                "pm": [
                    "Step 1: Gentle Wash — Cleanse smoothly.",
                    "Step 2: Squalane & Ceramide Overnight Mask — Apply generous layer for overnight deep repair."
                ],
                "tip": "🛌 8 hours of sleep allows skin cells to regenerate missing lipid barrier proteins!"
            }
        ]
    }


def _build_oiliness_plan(skin_type: str) -> Dict:
    return _build_pores_blackheads_plan(skin_type)


def _build_acne_plan(skin_type: str) -> Dict:
    return {
        "plan_key": "acne",
        "concern_label": "Inflammatory Acne & Active Pimples",
        "goal": f"Kill Pimple Bacteria · Reduce Red Inflammation · Prevent Scars (Tailored for {skin_type} Skin)",
        "key_actives": [
            "Salicylic Acid 2%",
            "Benzoyl Peroxide 2.5%",
            "Niacinamide 10%",
            "Tea Tree Oil & Adapalene"
        ],
        "natural_days": [
            {
                "day": "Monday",
                "focus": "Raw Honey & Neem Cleansing Routine",
                "am": [
                    "Step 1: Raw Honey Face Wash — Rinse face with warm water mixed with raw honey (kills acne bacteria).",
                    "Step 2: Fresh Aloe Vera Gel — Apply pure gel directly from aloe leaf pulp to cool red pimples.",
                    "Step 3: Natural Rose Water Mist — Spray rose water for fresh skin hydration."
                ],
                "pm": [
                    "Step 1: Neem Water Wash — Cleanse face using cooled boiled neem leaf water.",
                    "Step 2: Tea Tree Spot Gel — Dab 1 drop of diluted tea tree oil onto active pimples.",
                    "Step 3: Jojoba Oil Moisture — Gently pat 2 drops of jojoba oil to nourish skin."
                ],
                "tip": "🍵 Drink spearmint tea or warm lemon water to naturally purify skin from within."
            },
            {
                "day": "Tuesday",
                "focus": "Turmeric & Yogurt Anti-Swelling Mask",
                "am": [
                    "Step 1: Gram Flour (Besan) Wash — Mix besan with rose water as a gentle soap-free cleanser.",
                    "Step 2: Cucumber Juice Splash — Apply fresh cucumber juice as a cooling toner.",
                    "Step 3: Aloe Vera Moisture — Hydrate face with aloe gel."
                ],
                "pm": [
                    "Step 1: Mild Oat Cleanser — Rinse face with finely ground oats mixed with water.",
                    "Step 2: Turmeric & Yogurt Mask — Mix 1 tbsp plain yogurt + 1/4 tsp wild turmeric, apply for 15 mins then rinse.",
                    "Step 3: Aloe Gel Finish — Pat dry and apply pure aloe vera."
                ],
                "tip": "🌱 Turmeric naturally reduces redness and pimple swelling within hours."
            },
            {
                "day": "Wednesday",
                "focus": "Multani Mitti (Fuller's Earth) Oil Absorbing",
                "am": [
                    "Step 1: Honey & Warm Water Wash — Rinse gently.",
                    "Step 2: Aloe Vera Gel — Soothe skin tone.",
                    "Step 3: Rose Water Mist — Spray generously."
                ],
                "pm": [
                    "Step 1: Neem Wash — Cleanse face with neem water.",
                    "Step 2: Multani Mitti Mask — Mix 1 tbsp Multani Mitti with rose water, leave for 10 mins and rinse.",
                    "Step 3: Aloe Vera Gel — Lock in natural moisture."
                ],
                "tip": "🍃 Multani Mitti absorbs excess oil and cleanses clogged pores naturally."
            },
            {
                "day": "Thursday",
                "focus": "Green Tea Steam & Honey Mask",
                "am": [
                    "Step 1: Besan & Milk Cleanser — Wash skin smoothly.",
                    "Step 2: Cucumber & Aloe Gel — Refresh skin.",
                    "Step 3: Rose Water Mist — Hydrate skin."
                ],
                "pm": [
                    "Step 1: Green Tea Steam — Lean over a bowl of hot brewed green tea for 4 minutes to open pores.",
                    "Step 2: Raw Honey Mask — Spread raw organic honey over face for 15 minutes, then rinse.",
                    "Step 3: Aloe Vera Moisture — Hydrate face smoothly."
                ],
                "tip": "♨️ Facial steam opens pores so honey can deep-clean bacteria naturally."
            },
            {
                "day": "Friday",
                "focus": "Sandalwood (Chandan) Soothing Care",
                "am": [
                    "Step 1: Honey Wash — Cleanse skin.",
                    "Step 2: Sandalwood Water Mist — Spray cooling sandalwood water.",
                    "Step 3: Aloe Vera Gel — Apply pure gel."
                ],
                "pm": [
                    "Step 1: Neem Water Rinse — Cleanse face gently.",
                    "Step 2: Sandalwood Paste Mask — Mix pure sandalwood powder with rose water, leave for 15 mins then rinse.",
                    "Step 3: Cold-Pressed Oil Moisture — Apply 2 drops of jojoba oil."
                ],
                "tip": "🌸 Sandalwood cools heat in skin and helps fade stubborn red pimple marks."
            },
            {
                "day": "Saturday",
                "focus": "Papaya Fruit Enzyme Glow",
                "am": [
                    "Step 1: Besan Wash — Gentle natural cleansing.",
                    "Step 2: Cucumber Gel — Hydrate skin.",
                    "Step 3: Rose Water Mist — Refresh skin."
                ],
                "pm": [
                    "Step 1: Warm Water Rinse — Wash face.",
                    "Step 2: Ripe Papaya Mask — Mash ripe papaya and apply for 12 minutes for natural gentle exfoliation.",
                    "Step 3: Aloe Vera Moisture — Hydrate skin softly."
                ],
                "tip": "🥭 Papaya contains natural enzymes (papain) that remove dead skin without harsh chemicals."
            },
            {
                "day": "Sunday",
                "focus": "Rice Water & Aloe Hydration Reset",
                "am": [
                    "Step 1: Fermented Rice Water Splash — Rinse face with soaked rice water to brighten skin.",
                    "Step 2: Aloe Vera Gel — Apply pure gel.",
                    "Step 3: Rose Water Mist — Refresh face."
                ],
                "pm": [
                    "Step 1: Honey Wash — Wash face gently.",
                    "Step 2: Coconut Water Splash — Pat fresh coconut water onto face for natural minerals.",
                    "Step 3: Aloe & Jojoba Finish — Massage aloe vera with 1 drop of jojoba oil."
                ],
                "tip": "🌾 Rice water has been used for centuries to boost skin smoothness and natural glow!"
            }
        ],
        "clinical_days": [
            {
                "day": "Monday",
                "focus": "Salicylic Acid 2% & Benzoyl Peroxide Spot Treatment",
                "am": [
                    "Step 1: Gentle Acne Face Wash (Salicylic Acid 2%) — Wash face for 60 seconds to clear oil and unclog pores.",
                    "Step 2: Oil-Control Serum (Niacinamide 10%) — Apply 3-4 drops to calm redness and control oil shine.",
                    "Step 3: Lightweight Gel Moisturizer — Hydrate skin without clogging pores.",
                    "Step 4: Daily Sunscreen SPF 50 — Protect skin from sun damage and prevent acne marks."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash off dirt, sweat, and daily pollution.",
                    "Step 2: Pimple Spot Gel (Benzoyl Peroxide 2.5%) — Apply a small drop directly on active red pimples.",
                    "Step 3: Soothing Night Cream — Lock in moisture and repair skin overnight."
                ],
                "tip": "💧 Drink 3L of water today. Avoid touching your face to prevent acne bacteria from spreading!"
            },
            {
                "day": "Tuesday",
                "focus": "Fading Redness & Acne Marks (Azelaic Acid)",
                "am": [
                    "Step 1: Mild Hydrating Face Wash — Gentle cleansing for sensitive, breakout-prone skin.",
                    "Step 2: Mark-Fading Serum (Azelaic Acid 10%) — Smooth over face to reduce red spots and even skin tone.",
                    "Step 3: Hydrating Gel Moisturizer — Soothe and keep skin soft.",
                    "Step 4: Daily Sunscreen SPF 50 — Protect skin from UV rays."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash face thoroughly with warm water.",
                    "Step 2: Exfoliating Liquid (BHA 2%) — Gently swipe with cotton pad to dissolve blackheads.",
                    "Step 3: Calming Skin Lotion (Centella) — Relieve skin redness and irritation."
                ],
                "tip": "🛏️ Change your pillowcase tonight — clean pillowcases help stop pimple breakouts!"
            },
            {
                "day": "Wednesday",
                "focus": "Deep Clay Pore Purifying",
                "am": [
                    "Step 1: Gentle Acne Face Wash — Wash away morning excess oil.",
                    "Step 2: Oil-Control Serum (Niacinamide 10%) — Balance skin sebum levels.",
                    "Step 3: Light Moisturizer — Hydrate gently.",
                    "Step 4: Sunscreen SPF 50 — Apply generously before stepping outdoors."
                ],
                "pm": [
                    "Step 1: Evening Face Wash — Cleanse face well.",
                    "Step 2: Purifying Clay Mask (Charcoal & Kaolin) — Apply for 10 minutes to draw out deep pore dirt, then rinse.",
                    "Step 3: Pimple Spot Treatment — Dab on active spots.",
                    "Step 4: Night Moisturizer — Soothe skin overnight."
                ],
                "tip": "🧘 Keep stress low and rest well. Lower stress prevents sudden acne flare-ups."
            },
            {
                "day": "Thursday",
                "focus": "Adapalene / Retinol Renewal & Texture Smoothing",
                "am": [
                    "Step 1: Gentle Face Wash — Cleanse skin mildly.",
                    "Step 2: Redness Fading Serum — Even out skin texture.",
                    "Step 3: Light Moisturizer — Hydrate skin.",
                    "Step 4: Sunscreen SPF 50 — Essential daily sun protection."
                ],
                "pm": [
                    "Step 1: Gentle Face Cleanser — Wash face gently.",
                    "Step 2: Night Renewal Gel (Adapalene 0.1% / Retinol) — Apply a pea-sized amount to dry face to speed acne healing.",
                    "Step 3: Barrier Repair Cream — Deeply hydrate and nourish skin."
                ],
                "tip": "🌙 Adapalene / Retinol works best while you sleep! Always use sunscreen the next morning."
            },
            {
                "day": "Friday",
                "focus": "Oil Control & Soothing Care",
                "am": [
                    "Step 1: Acne Face Wash — Clear morning oil.",
                    "Step 2: Green Tea & Niacinamide Serum — Calm skin irritation.",
                    "Step 3: Gel Moisturizer — Keep skin fresh and hydrated.",
                    "Step 4: Sunscreen SPF 50 — Shield skin from sun exposure."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Cleanse thoroughly.",
                    "Step 2: Pore Clarifying Toner — Sweep gently across t-zone.",
                    "Step 3: Soothing Cica Cream — Deeply calm sensitive red skin."
                ],
                "tip": "🥗 Drink fresh green tea and avoid excess fried food over the weekend."
            },
            {
                "day": "Saturday",
                "focus": "Gentle Surface Exfoliation",
                "am": [
                    "Step 1: Hydrating Cleanser — Wash skin gently.",
                    "Step 2: Niacinamide Serum — Protect skin and boost radiance.",
                    "Step 3: Daily Moisturizer — Soften skin.",
                    "Step 4: Sunscreen SPF 50 — Protect from sunlight."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash off daily buildup.",
                    "Step 2: Gentle Surface Exfoliant (AHA) — Remove dull dead skin cells for smooth skin.",
                    "Step 3: Hydrating Night Gel — Lock in moisture."
                ],
                "tip": "🚫 Skip heavy treatments tonight to give your skin barrier a rest."
            },
            {
                "day": "Sunday",
                "focus": "Barrier Recovery & Deep Hydration",
                "am": [
                    "Step 1: Hydrating Cleanser — Refresh skin with a gentle wash.",
                    "Step 2: Hyaluronic Hydration Serum — Deeply moisturize dry areas.",
                    "Step 3: Daily Moisturizer — Keep skin smooth.",
                    "Step 4: Sunscreen SPF 50 — Daily protection."
                ],
                "pm": [
                    "Step 1: Gentle Wash — Cleanse skin smoothly.",
                    "Step 2: Soothing Sheet Mask — Relax with a hydrating sheet mask for 15 minutes.",
                    "Step 3: Barrier Cream — Apply rich cream for overnight recovery."
                ],
                "tip": "💆 Relax and get 8 hours of sleep. Deep sleep is when skin heals and renews itself naturally!"
            }
        ]
    }
