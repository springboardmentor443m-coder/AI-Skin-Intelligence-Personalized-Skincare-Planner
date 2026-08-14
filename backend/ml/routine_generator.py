def adapt_daily_routine(daily_routine, condition):
    harsh_actives = [
        "Niacinamide Serum", 
        "Vitamin C Serum", 
        "AHA/BHA Exfoliant", 
        "Salicylic Acid Serum", 
        "Alpha Arbutin Serum", 
        "Retinol Serum"
    ]
    
    adapted = {"morning": [], "night": []}
    
    # Filter out harsh actives
    for time_of_day in ["morning", "night"]:
        for product in daily_routine[time_of_day]:
            if product not in harsh_actives:
                adapted[time_of_day].append(product)
                
    condition = condition.lower()
    
    # Inject recovery products
    if condition in ["irritation", "redness"]:
        # Insert after cleanser
        adapted["morning"].insert(1, "Soothing Centella/Aloe Serum")
        adapted["night"].insert(1, "Soothing Centella/Aloe Serum")
    elif condition == "dryness":
        adapted["morning"].insert(1, "Hydrating Toner / Barrier Serum")
        if "Hydrating Toner / Barrier Serum" not in adapted["night"]:
            adapted["night"].insert(1, "Hydrating Toner / Barrier Serum")
        if "Sleeping Mask / Facial Oil" not in adapted["night"]:
            adapted["night"].append("Sleeping Mask / Facial Oil")
            
    return adapted

def generate_routine(profile, adaptations=None):
    if adaptations is None:
        adaptations = {}
        
    weekly_routine = {}
    
    concerns = profile.skin_concerns.lower() if profile.skin_concerns else ""
    skin_type = profile.skin_type.lower() if profile.skin_type else ""
    is_sensitive = getattr(profile, "sensitive_skin", False)

    # Determine frequency of actives
    exfoliation_freq = 1 if is_sensitive else (3 if skin_type == "oily" else 2)
    treatment_freq = 2 if is_sensitive else 4
    
    # Days selection
    exfoliation_days = []
    if exfoliation_freq == 1:
        exfoliation_days = [4]
    elif exfoliation_freq == 2:
        exfoliation_days = [3, 7]
    elif exfoliation_freq == 3:
        exfoliation_days = [2, 4, 6]

    treatment_days = []
    if treatment_freq == 2:
        treatment_days = [2, 6] # Avoid exfoliation day 4
    else:
        # Distribute treatments on non-exfoliation days
        treatment_days = [d for d in range(1, 8) if d not in exfoliation_days][:treatment_freq]

    for day in range(1, 8):
        morning = ["Gentle Cleanser"]
        night = ["Double Cleanse (Oil + Water-based)"]

        # Morning actives (can be daily, maybe every other day for sensitive skin)
        if "acne" in concerns:
            if not is_sensitive or day % 2 != 0:
                morning.append("Niacinamide Serum")
        if "dark spots" in concerns:
            if not is_sensitive or day % 2 == 0:
                morning.append("Vitamin C Serum")

        morning.extend(["Moisturizer", "Sunscreen SPF 50"])

        # Night actives
        if day in exfoliation_days:
            night.append("AHA/BHA Exfoliant")
        elif day in treatment_days:
            if "acne" in concerns:
                night.append("Salicylic Acid Serum")
            if "dark spots" in concerns:
                night.append("Alpha Arbutin Serum")
            if "wrinkles" in concerns:
                night.append("Retinol Serum")
        else:
            # Recovery night
            night.append("Hydrating Toner / Barrier Serum")

        night.append("Moisturizer")
        
        if skin_type == "dry" or (is_sensitive and day not in treatment_days and day not in exfoliation_days):
            night.append("Sleeping Mask / Facial Oil")

        weekly_routine[f"Day {day}"] = {
            "morning": morning,
            "night": night
        }
        
        # Apply adaptation if requested for this day
        if f"Day {day}" in adaptations:
            condition = adaptations[f"Day {day}"]
            if condition and condition.lower() != "normal":
                weekly_routine[f"Day {day}"] = adapt_daily_routine(
                    weekly_routine[f"Day {day}"], 
                    condition
                )

    return weekly_routine