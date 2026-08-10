import re
from app.models.user import Profile

# Ingredient database with properties and alternative suggestions
INGREDIENT_DATABASE = {
    "retinol": {
        "name": "Retinol",
        "description": "Powerful Vitamin A derivative for cell turnover and anti-aging. Highly active.",
        "sensitive_conflict": True,
        "dry_conflict": False,
        "conflict_reason": "Can cause severe dryness, peeling, and redness on sensitive skin.",
        "alternative": "Bakuchiol",
        "alternative_reason": "A plant-based alternative that offers similar anti-aging benefits without the irritation or purging risk."
    },
    "salicylic acid": {
        "name": "Salicylic Acid (BHA)",
        "description": "Oil-soluble chemical exfoliant that penetrates deep into pores to dissolve sebum.",
        "sensitive_conflict": True,
        "dry_conflict": True,
        "conflict_reason": "Can strip skin barrier lipids and trigger irritation or flakiness on sensitive or dry skin.",
        "alternative": "Gluconolactone (PHA) or Lactic Acid",
        "alternative_reason": "PHAs have a larger molecular size that exfoliates gently on the surface while drawing moisture."
    },
    "glycolic acid": {
        "name": "Glycolic Acid (AHA)",
        "description": "Small-molecule alpha hydroxy acid that exfoliates the skin surface to reveal brightness.",
        "sensitive_conflict": True,
        "dry_conflict": False,
        "conflict_reason": "Rapid penetration can cause burning, stinging, and redness on compromised barriers.",
        "alternative": "Mandelic Acid or Lactic Acid",
        "alternative_reason": "Mandelic Acid has a larger structure, absorbing slower and more gently, making it suitable for sensitive skin."
    },
    "benzoyl peroxide": {
        "name": "Benzoyl Peroxide",
        "description": "Powerful antimicrobial active that kills acne-causing bacteria inside pores.",
        "sensitive_conflict": True,
        "dry_conflict": True,
        "conflict_reason": "Highly oxidizing; frequently causes extreme dryness, itching, and flaking.",
        "alternative": "Azelaic Acid or Tea Tree Oil",
        "alternative_reason": "Azelaic Acid clears acne bacteria, fades pigmentation, and calms redness without stripping lipids."
    },
    "alcohol denat": {
        "name": "Denatured Alcohol (SD Alcohol)",
        "description": "Solvent used to make products dry quickly and feel weightless.",
        "sensitive_conflict": True,
        "dry_conflict": True,
        "conflict_reason": "Solubilizes natural skin barrier lipids, causing severe dryness and contact sensitivity.",
        "alternative": "Cetearyl Alcohol or Glycerin-based solvents",
        "alternative_reason": "Cetearyl alcohol is a hydrating fatty alcohol that softens and protects the skin barrier."
    },
    "fragrance": {
        "name": "Synthetic Fragrance (Parfum)",
        "description": "Scent additives used to mask raw chemical odors in skincare formulas.",
        "sensitive_conflict": True,
        "dry_conflict": False,
        "conflict_reason": "One of the leading triggers for contact allergies, redness, and micro-inflammation.",
        "alternative": "Fragrance-Free formulas",
        "alternative_reason": "Fragrance-free options eliminate volatile aromatic compounds, maintaining skin calm."
    },
    "parfum": {
        "name": "Parfum / Scent",
        "description": "Scent additives used to mask raw chemical odors in skincare formulas.",
        "sensitive_conflict": True,
        "dry_conflict": False,
        "conflict_reason": "Leading trigger for volatile aromatic allergies and barrier redness.",
        "alternative": "Fragrance-Free formulas",
        "alternative_reason": "Eliminates contact allergy risks entirely."
    }
}

# Unsafe combinations to check inside a single list of ingredients
UNSAFE_COMBINATIONS = [
    {
        "actives": ["retinol", "salicylic acid"],
        "severity": "high",
        "reason": "Retinol and Salicylic Acid used in the same step can strip the moisture barrier, causing severe redness, burning, and peeling."
    },
    {
        "actives": ["retinol", "glycolic acid"],
        "severity": "high",
        "reason": "Combining Retinol with Glycolic Acid (AHA) creates excessive peeling, structural inflammation, and compromises barrier lipids."
    },
    {
        "actives": ["vitamin c", "glycolic acid"],
        "severity": "medium",
        "reason": "Using Vitamin C (L-Ascorbic Acid) alongside Glycolic Acid can destabilize the Vitamin C due to pH differences and cause skin stinging."
    },
    {
        "actives": ["benzoyl peroxide", "retinol"],
        "severity": "high",
        "reason": "Benzoyl Peroxide oxidizes and degrades Retinol, making both ingredients inactive while multiplying skin irritation."
    }
]

def analyze_ingredients_list(ingredients_text: str, profile: Profile) -> dict:
    """
    Parses a list of ingredients, checks for profile allergies,
    skin-type conflicts, unsafe active pairings, and outputs suggestions.
    """
    # 1. Clean and tokenize text
    cleaned_input = ingredients_text.replace("\n", " ").replace("\r", "")
    # Split by commas
    raw_tokens = [t.strip() for t in cleaned_input.split(",") if t.strip()]
    
    # Standardize list (lowercase, alphanumeric filters)
    standardized_list = []
    for token in raw_tokens:
        clean_token = re.sub(r'\s+', ' ', token.lower())
        standardized_list.append(clean_token)
        
    skin_type = profile.skin_type or "normal"
    allergy_details = (profile.allergy_details or "").lower()
    
    alerts = []
    unsafe_pairings = []
    safe_swaps = []
    safe_ingredients_count = 0
    flagged_ingredients_count = 0

    # 2. Check for Allergies & Skin-Type Conflicts
    for idx, ing in enumerate(standardized_list):
        is_flagged = False
        
        # A. Check against user reported allergies
        if allergy_details and (ing in allergy_details or allergy_details in ing):
            alerts.append({
                "ingredient": raw_tokens[idx],
                "type": "allergy",
                "severity": "severe",
                "message": f"MATCHED ALLERGEN: This ingredient matches your profile allergy details: '{profile.allergy_details}'."
            })
            is_flagged = True
            
        # B. Check against database for known conflicts
        matched_key = None
        for key in INGREDIENT_DATABASE:
            if key in ing:
                matched_key = key
                break
                
        if matched_key:
            db_item = INGREDIENT_DATABASE[matched_key]
            
            # Check Sensitive Skin Conflicts
            if skin_type == "sensitive" and db_item["sensitive_conflict"]:
                alerts.append({
                    "ingredient": raw_tokens[idx],
                    "type": "sensitive_conflict",
                    "severity": "medium",
                    "message": f"SENSITIVE SKIN ALERT: {db_item['conflict_reason']}"
                })
                is_flagged = True
                
            # Check Dry Skin Conflicts
            elif skin_type == "dry" and db_item["dry_conflict"]:
                alerts.append({
                    "ingredient": raw_tokens[idx],
                    "type": "dry_conflict",
                    "severity": "medium",
                    "message": f"DRY SKIN ALERT: {db_item['conflict_reason']}"
                })
                is_flagged = True
                
            # Add safe swaps if flagged
            if is_flagged and db_item["alternative"]:
                # Check if swap is already in list
                if not any(sw["ingredient"] == raw_tokens[idx] for sw in safe_swaps):
                    safe_swaps.append({
                        "ingredient": raw_tokens[idx],
                        "swap_with": db_item["alternative"],
                        "reason": db_item["alternative_reason"]
                    })
                    
        if is_flagged:
            flagged_ingredients_count += 1
        else:
            safe_ingredients_count += 1

    # 3. Check for Unsafe Combinations within the list itself
    # Check if we have active ingredient keywords present in the list
    for combo in UNSAFE_COMBINATIONS:
        actives_found = []
        for active in combo["actives"]:
            # Check if active is present in the standardized list
            if any(active in ing for ing in standardized_list):
                actives_found.append(active)
                
        if len(actives_found) == len(combo["actives"]):
            unsafe_pairings.append({
                "actives": [a.title() for a in actives_found],
                "severity": combo["severity"],
                "message": combo["reason"]
            })
            
            # Suggest swap for one of the incompatible actives (e.g. swap salicylic acid)
            for active in actives_found:
                if active in INGREDIENT_DATABASE:
                    db_item = INGREDIENT_DATABASE[active]
                    if db_item["alternative"] and not any(sw["swap_with"] == db_item["alternative"] for sw in safe_swaps):
                        safe_swaps.append({
                            "ingredient": active.title(),
                            "swap_with": db_item["alternative"],
                            "reason": f"To resolve the compatibility conflict: {db_item['alternative_reason']}"
                        })

    # 4. Determine overall safety status
    if any(a["severity"] == "severe" for a in alerts) or any(p["severity"] == "high" for p in unsafe_pairings):
        safety_status = "unsafe"
    elif alerts or unsafe_pairings:
        safety_status = "caution"
    else:
        safety_status = "safe"

    return {
        "safety_status": safety_status,
        "total_ingredients_analyzed": len(standardized_list),
        "safe_count": safe_ingredients_count,
        "flagged_count": flagged_ingredients_count,
        "alerts": alerts,
        "unsafe_pairings": unsafe_pairings,
        "safe_swaps": safe_swaps
    }
