from app.models.user import User
from app.services.assessment_engine import calculate_skin_health

def generate_user_routines(user: User) -> list:
    # 1. Fetch latest skin metrics
    results = calculate_skin_health(user)
    skin_type = user.profile.skin_type or "normal"
    concerns = user.profile.concerns or []
    allergies = user.profile.allergy_details
    age = user.profile.age or 25

    # Determine helper variables
    has_acne = "acne" in concerns
    has_pigmentation = "pigmentation" in concerns
    has_wrinkles = "wrinkles" in concerns or "fine_lines" in concerns
    has_sensitivity = "sensitive_skin" in concerns or skin_type == "sensitive"
    has_dryness = "dry_skin" in concerns or skin_type == "dry"
    has_oiliness = "oily_skin" in concerns or skin_type == "oily"

    # --- A. MORNING (AM) ROUTINE ---
    am_steps = []
    
    # 1. Cleanser
    if has_dryness or has_sensitivity:
        am_steps.append({
            "step_order": 1,
            "action": "Cleanse",
            "product_name": "Hydrating Ceramide Milky Cleanser",
            "ingredients": "Ceramides NP/AP, Glycerin, Hyaluronic Acid",
            "instructions": "Apply to damp skin, massage gently in circular motions, and rinse with lukewarm water. Protects the barrier."
        })
    elif has_oiliness or has_acne:
        am_steps.append({
            "step_order": 1,
            "action": "Cleanse",
            "product_name": "Clarifying Foaming Cleanser",
            "ingredients": "Salicylic Acid (BHA 1%), Zinc PCA, Green Tea",
            "instructions": "Massage onto wet skin for 60 seconds focusing on the T-zone, then rinse. Regulates morning oiliness."
        })
    else:
        am_steps.append({
            "step_order": 1,
            "action": "Cleanse",
            "product_name": "Daily pH-Balanced Gel Cleanser",
            "ingredients": "Amino Acids, Chamomile Extract",
            "instructions": "Apply a dime-sized amount to wet face, massage, and rinse. Keeps skin balanced."
        })

    # 2. Toner/Essence (Prep)
    if has_dryness or has_sensitivity:
        am_steps.append({
            "step_order": 2,
            "action": "Prep",
            "product_name": "Soothe & Damp Milky Toner",
            "ingredients": "Panthenol (Vitamin B5) 3%, Beta-Glucan, Licorice Root",
            "instructions": "Pour a few drops into palms and gently pat into face and neck until fully absorbed. Do not rub."
        })
    elif has_oiliness or has_acne:
        am_steps.append({
            "step_order": 2,
            "action": "Prep",
            "product_name": "Pore-Refining Niacinamide Toner",
            "ingredients": "Niacinamide 2%, Witch Hazel (Alcohol-free), Zinc PCA",
            "instructions": "Apply with a cotton pad to sweep away dead skin, or pat in with fingers to tighten pores."
        })
    else:
        am_steps.append({
            "step_order": 2,
            "action": "Prep",
            "product_name": "Hydrating Hyaluronic Tonic",
            "ingredients": "Multi-weight Hyaluronic Acid, Aloe Vera",
            "instructions": "Spray or apply to slightly damp face to lock in hydration."
        })

    # 3. Serum (Target Treatment)
    if has_acne:
        am_steps.append({
            "step_order": 3,
            "action": "Target",
            "product_name": "Anti-Breakout Control Serum",
            "ingredients": "Niacinamide 10%, Zinc PCA 1%",
            "instructions": "Apply 3-4 drops. Niacinamide strengthens the barrier while Zinc regulates sebum and fights acne bacteria."
        })
    elif has_pigmentation:
        am_steps.append({
            "step_order": 3,
            "action": "Target",
            "product_name": "Antioxidant Vitamin C Glow Serum",
            "ingredients": "L-Ascorbic Acid 15%, Ferulic Acid, Vitamin E",
            "instructions": "Pat 4 drops onto dry skin. Brightens hyperpigmentation and shields against UV free radical damage."
        })
    elif has_sensitivity:
        am_steps.append({
            "step_order": 3,
            "action": "Target",
            "product_name": "Centella calming Redness Serum",
            "ingredients": "Centella Asiatica (Cica) 70%, Madecassoside, Allantoin",
            "instructions": "Smooth gently onto irritated areas to calm inflammation and repair broken barrier links."
        })
    elif has_wrinkles:
        am_steps.append({
            "step_order": 3,
            "action": "Target",
            "product_name": "Multi-Peptide Elasticity Serum",
            "ingredients": "Matrixyl 3000, Copper Peptides, Hyaluronic Acid",
            "instructions": "Massage into skin. Peptides boost collagen synthesis, softening fine lines and enhancing bounce."
        })
    else:
        am_steps.append({
            "step_order": 3,
            "action": "Target",
            "product_name": "Daily Shield Antioxidant Serum",
            "ingredients": "Coenzyme Q10, Green Tea Extract, Vitamin E",
            "instructions": "Apply all over face to support general skin longevity and block environmental pollutants."
        })

    # 4. Moisturize
    if has_dryness:
        am_steps.append({
            "step_order": 4,
            "action": "Moisturize",
            "product_name": "Squalane Intense Barrier Cream",
            "ingredients": "Squalane, Shea Butter, Ceramides",
            "instructions": "Massage a pea-sized amount onto face and neck to create a moisture-retaining protective film."
        })
    elif has_oiliness or has_acne:
        am_steps.append({
            "step_order": 4,
            "action": "Moisturize",
            "product_name": "Ultra-Lightweight Oil-Free Water Gel",
            "ingredients": "Hyaluronic Acid, Aloe Juice, Centella",
            "instructions": "Smooth over skin. Absorbs instantly into a matte finish, preventing midday shine."
        })
    else:
        am_steps.append({
            "step_order": 4,
            "action": "Moisturize",
            "product_name": "Daily Balancing Hydration Lotion",
            "ingredients": "Jojoba Esters, Niacinamide, Glycerin",
            "instructions": "Apply evenly over face for balanced moisture all day."
        })

    # 5. Sun Protection
    if has_sensitivity:
        am_steps.append({
            "step_order": 5,
            "action": "Sun Protect",
            "product_name": "Soothe Mineral SPF 50+",
            "ingredients": "Zinc Oxide 20% (Non-Nano), Titanium Dioxide",
            "instructions": "Apply generously. Zinc is highly soothing and blocks UVA/UVB without irritating sensitive skin."
        })
    elif has_oiliness or has_acne:
        am_steps.append({
            "step_order": 5,
            "action": "Sun Protect",
            "product_name": "Seabum Control Matte Fluid SPF 50+",
            "ingredients": "Organic UV Filters, Silica (Mattifying)",
            "instructions": "Apply 2 finger lengths. Controls sebum secretion while providing broad-spectrum coverage."
        })
    else:
        am_steps.append({
            "step_order": 5,
            "action": "Sun Protect",
            "product_name": "Broad-Spectrum Daily Hydrator SPF 50+",
            "ingredients": "Chemical UV Filters, Hyaluronic Acid",
            "instructions": "Apply generously as the final step before makeup. Reapply if outdoors."
        })

    # --- B. EVENING (PM) ROUTINE ---
    pm_steps = []
    
    # 1. Double Cleanse
    pm_steps.append({
        "step_order": 1,
        "action": "Cleanse (Step 1)",
        "product_name": "Centella Nourishing Cleansing Oil",
        "ingredients": "Centella Asiatica Oil, Sunflower Seed Oil",
        "instructions": "Massage onto dry skin to dissolve makeup, sunscreen, and oxidized sebum. Rinse off with warm water."
    })
    
    # Re-use AM cleanser for secondary deep cleanse
    pm_cleanser = am_steps[0]
    pm_steps.append({
        "step_order": 2,
        "action": "Cleanse (Step 2)",
        "product_name": pm_cleanser["product_name"],
        "ingredients": pm_cleanser["ingredients"],
        "instructions": "Follow up on damp skin to clear remaining oil-based cleanser residues. Pat skin dry with a clean towel."
    })

    # 2. Night Treatment (Actives)
    if has_wrinkles:
        pm_steps.append({
            "step_order": 3,
            "action": "Target Treatment",
            "product_name": "Youth Activating Retinol 0.3% Serum",
            "ingredients": "Pure Retinol 0.3%, Bakuchiol, Tocopherol",
            "instructions": "Apply 3 drops to completely dry skin. Retinol stimulates cellular turnover and collagen synthesis. Use 3x weekly to start."
        })
    elif has_acne:
        pm_steps.append({
            "step_order": 3,
            "action": "Target Treatment",
            "product_name": "Pore Clearing Salicylic Liquid",
            "ingredients": "Salicylic Acid (BHA 2%), Green Tea Extract",
            "instructions": "Apply all over face using fingers. Clears out deep-seated blackheads and prevents pustules. Use 3-4 nights a week."
        })
    elif has_pigmentation:
        pm_steps.append({
            "step_order": 3,
            "action": "Target Treatment",
            "product_name": "Spot-Fade Alpha Arbutin 2%",
            "ingredients": "Alpha Arbutin 2%, Kojic Acid, Tranexamic Acid",
            "instructions": "Apply to clean skin, focusing on dark spots or post-inflammatory hyperpigmentation marks."
        })
    elif has_sensitivity:
        pm_steps.append({
            "step_order": 3,
            "action": "Target Treatment",
            "product_name": "Intense Cica Barrier Balm",
            "ingredients": "Madecassoside, Panthenol 5%, Shea Butter",
            "instructions": "Apply a thin layer all over. Soothes itching, burning, and redness while healing structural barrier damage."
        })
    else:
        pm_steps.append({
            "step_order": 3,
            "action": "Target Treatment",
            "product_name": "Multi-Peptide Restorative Serum",
            "ingredients": "Peptides complex, Niacinamide 5%",
            "instructions": "Apply 3-4 drops all over face to aid overnight recovery and cellular health."
        })

    # 3. Moisturize & Seal
    if has_dryness or has_sensitivity:
        pm_steps.append({
            "step_order": 4,
            "action": "Seal Barrier",
            "product_name": "Ceramide Restore Night Cream",
            "ingredients": "Ceramides NP/AP/EOP, Cholesterol, Phytosphingosine",
            "instructions": "Apply generously. Seals in active treatments and mimics skin's natural lipid barrier for overnight repair."
        })
    elif has_oiliness or has_acne:
        pm_steps.append({
            "step_order": 4,
            "action": "Seal Barrier",
            "product_name": "Calming Centella Soothing Gel Cream",
            "ingredients": "Centella Asiatica, Hyaluronic Acid, Aloe Vera",
            "instructions": "Smooth over skin. Cools and hydrates without clogging pores or triggering sebum production."
        })
    else:
        pm_steps.append({
            "step_order": 4,
            "action": "Seal Barrier",
            "product_name": "Overnight Renewal Complex Cream",
            "ingredients": "Squalane, Evening Primrose Oil, Rosehip Seed Oil",
            "instructions": "Smooth over face and neck to deeply nourish and restore skin softness by morning."
        })

    # --- C. WEEKLY TREATMENTS ---
    weekly_steps = []
    
    # 1. Weekly Peeling/Exfoliation
    if has_sensitivity or has_dryness:
        weekly_steps.append({
            "step_order": 1,
            "action": "Weekly Peeling (1-2x/week)",
            "product_name": "Lactic Acid 5% Gentle Resurfacing Serum",
            "ingredients": "Lactic Acid 5%, Hyaluronic Acid, Tasmannia Lanceolata",
            "instructions": "Apply at night after cleansing instead of your regular PM active. Gentle chemical exfoliation that draws moisture."
        })
    else:
        weekly_steps.append({
            "step_order": 1,
            "action": "Weekly Peeling (1x/week)",
            "product_name": "AHA 30% + BHA 2% Peeling Solution",
            "ingredients": "Glycolic Acid, Lactic Acid, Salicylic Acid",
            "instructions": "Apply to clean, completely dry skin. Leave on for 10 minutes max, then rinse off thoroughly with lukewarm water. Night only."
        })
        
    # 2. Weekly Mask
    if has_oiliness or has_acne:
        weekly_steps.append({
            "step_order": 2,
            "action": "Weekly Mask (1-2x/week)",
            "product_name": "Deep Pore Clay Mask",
            "ingredients": "Bentonite Clay, Kaolin, Activated Charcoal",
            "instructions": "Apply to oily areas, let dry for 10 minutes, and rinse. Pulls out impurities and absorbs excess oils."
        })
    elif has_dryness or has_sensitivity:
        weekly_steps.append({
            "step_order": 2,
            "action": "Weekly Mask (1-2x/week)",
            "product_name": "Soothing Colloidal Oatmeal Mask",
            "ingredients": "Colloidal Oatmeal, Honey Extract, Allantoin",
            "instructions": "Apply a thick layer, leave on for 15 minutes, and gently wipe away. Relieves flakiness and itching."
        })
    else:
        weekly_steps.append({
            "step_order": 2,
            "action": "Weekly Mask (1x/week)",
            "product_name": "Overnight Hydration Sleeping Mask",
            "ingredients": "Squalane, Trehalose, Rose Extract",
            "instructions": "Apply as the final step of PM routine. Wash off in the morning for extra radiance."
        })

    # --- D. SEASONAL ADJUSMENTS ---
    # We output Summer (sebum control) and Winter (lipid barrier defense)
    summer_steps = [
        {
            "step_order": 1,
            "action": "Summer Cleanse",
            "product_name": "Sebum Regulating gel Cleanser",
            "ingredients": "Salicylic Acid, Mint extract, Zinc PCA",
            "instructions": "Washes away summer sweat, grease, and sunscreen without drying."
        },
        {
            "step_order": 2,
            "action": "Summer Hydration",
            "product_name": "Hyaluronic Cooling Gel",
            "ingredients": "Hyaluronic Acid, Aloe Vera, Cucumber extract",
            "instructions": "Intense cooling moisture that feels weightless under summer humidity."
        },
        {
            "step_order": 3,
            "action": "Summer Protect",
            "product_name": "Matte Touch Sunscreen SPF 50+",
            "ingredients": "Physical and chemical filters, Silica particles",
            "instructions": "Blocks high UV index rays while keeping skin matte and fresh."
        }
    ]

    winter_steps = [
        {
            "step_order": 1,
            "action": "Winter Cleanse",
            "product_name": "Milky Conditioning Cleanser",
            "ingredients": "Ceramides, Cholesterol, Avocado oil",
            "instructions": "Cleanses without stripping the skin's natural lipids during dry winter winds."
        },
        {
            "step_order": 2,
            "action": "Winter Moisturize",
            "product_name": "Ceramide-Lipid Heavy Repair Cream",
            "ingredients": "Shea Butter, Ceramides 1, 3, 6-II, Glycerin",
            "instructions": "Rich ointment-like cream to prevent windburn and severe cold dehydration."
        },
        {
            "step_order": 3,
            "action": "Winter Barrier Seal",
            "product_name": "Pure Organic Rosehip Seed Face Oil",
            "instructions": "Press 2 drops over moisturizer at night. Forms a microscopic barrier seal trapping moisture."
        }
    ]

    return [
        {"routine_type": "morning", "steps": am_steps},
        {"routine_type": "evening", "steps": pm_steps},
        {"routine_type": "weekly", "steps": weekly_steps},
        {"routine_type": "summer", "steps": summer_steps},
        {"routine_type": "winter", "steps": winter_steps}
    ]
