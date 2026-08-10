from app.models.user import User, Profile

def calculate_skin_health(user: User) -> dict:
    profile = user.profile
    if not profile:
        # Fallback profile defaults
        profile = Profile(skin_type="normal", age=25, concerns=[], allergy_details=None)

    skin_type = profile.skin_type or "normal"
    age = profile.age or 25
    concerns = profile.concerns or []
    allergies = profile.allergy_details

    # 1. Determine Base Score
    base_scores = {
        "normal": 95,
        "dry": 85,
        "oily": 80,
        "combination": 82,
        "sensitive": 78
    }
    score = base_scores.get(skin_type, 90)

    # 2. Track deductions and concern levels
    deductions = 0
    levels = {
        "acne": "none",
        "dryness": "none",
        "oiliness": "none",
        "pigmentation": "none",
        "sensitivity": "none",
        "wrinkles": "none"
    }

    # --- ACNE ---
    if "acne" in concerns:
        if skin_type == "oily":
            levels["acne"] = "severe"
            deductions += 18
        elif skin_type == "combination":
            levels["acne"] = "moderate"
            deductions += 12
        else:
            levels["acne"] = "mild"
            deductions += 8
    elif skin_type == "oily":
        # Base oiliness can create a mild acne risk even if not checked
        levels["acne"] = "none"

    # --- DRYNESS ---
    if "dry_skin" in concerns or skin_type == "dry":
        if skin_type == "dry":
            levels["dryness"] = "severe" if "dry_skin" in concerns else "moderate"
            deductions += 15 if "dry_skin" in concerns else 8
        else:
            levels["dryness"] = "mild"
            deductions += 6

    # --- OILINESS ---
    if "oily_skin" in concerns or skin_type == "oily":
        if skin_type == "oily":
            levels["oiliness"] = "severe" if "oily_skin" in concerns else "moderate"
            deductions += 15 if "oily_skin" in concerns else 8
        else:
            levels["oiliness"] = "mild"
            deductions += 6

    # --- PIGMENTATION ---
    if "pigmentation" in concerns:
        if age > 40:
            levels["pigmentation"] = "moderate"
            deductions += 10
        else:
            levels["pigmentation"] = "mild"
            deductions += 6

    # --- SENSITIVITY ---
    if "sensitive_skin" in concerns or skin_type == "sensitive":
        if skin_type == "sensitive":
            levels["sensitivity"] = "severe" if "sensitive_skin" in concerns else "moderate"
            deductions += 18 if "sensitive_skin" in concerns else 10
        else:
            levels["sensitivity"] = "mild"
            deductions += 8

    # --- WRINKLES / AGING ---
    if "wrinkles" in concerns or "fine_lines" in concerns:
        if age > 50:
            levels["wrinkles"] = "severe"
            deductions += 16
        elif age > 35:
            levels["wrinkles"] = "moderate"
            deductions += 10
        else:
            levels["wrinkles"] = "mild"
            deductions += 6

    # 3. Calculate Final Score
    health_score = max(30, min(100, score - deductions))

    # 4. Generate Risk Factors list
    risk_factors = []
    if skin_type == "oily":
        risk_factors.append("Hyperactive Sebum: High risk of clogged pores and breakouts.")
    if skin_type == "dry":
        risk_factors.append("Barrier Lipid Deficit: Susceptible to severe dehydration and peeling.")
    if skin_type == "sensitive" or levels["sensitivity"] in ["moderate", "severe"]:
        risk_factors.append("Impaired Moisture Barrier: Vulnerable to contact dermatitis and redness.")
    if age > 40:
        risk_factors.append("Natural Collagen Decline: Susceptible to structural elasticity loss.")
    if allergies:
        risk_factors.append(f"Topical Reactivity: High risk of allergic flare-up due to: {allergies}")

    # 5. Generate recommendations list
    recommendations = []
    if "acne" in concerns:
        recommendations.append("Incorporate Salicylic Acid (BHA 2%) to clean sebum out of pores.")
    if "dry_skin" in concerns or skin_type == "dry":
        recommendations.append("Use Ceramide-rich moisturizers to restore skin barrier lipids.")
    if "sensitive_skin" in concerns or skin_type == "sensitive":
        recommendations.append("Avoid physical scrubs and alcohols. Use Centella Asiatica or Panthenol.")
    if "wrinkles" in concerns or "fine_lines" in concerns:
        recommendations.append("Apply Retinoids (Retinol or Bakuchiol) at night to boost cell turnover.")
    if "pigmentation" in concerns:
        recommendations.append("Utilize Vitamin C (L-Ascorbic Acid) or Niacinamide to fade discoloration.")
    if skin_type == "oily":
        recommendations.append("Use oil-free, non-comedogenic gel moisturizers to maintain hydration.")
        
    if not recommendations:
        recommendations.append("Maintain skin health with a broad-spectrum sunscreen and gentle basic daily humectant.")

    return {
        "health_score": health_score,
        "levels": levels,
        "risk_factors": risk_factors,
        "recommendations": recommendations
    }
