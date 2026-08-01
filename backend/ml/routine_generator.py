def generate_routine(profile):
    routine = {
        "morning": [
            "Gentle Cleanser",
            "Moisturizer",
            "Sunscreen SPF 50"
        ],
        "night": [
            "Gentle Cleanser",
            "Moisturizer"
        ]
    }

    concerns = profile.skin_concerns.lower()

    if "acne" in concerns:
        routine["morning"].insert(1, "Niacinamide Serum")
        routine["night"].insert(1, "Salicylic Acid Serum")

    if "dark spots" in concerns:
        routine["morning"].insert(1, "Vitamin C Serum")
        routine["night"].insert(1, "Alpha Arbutin Serum")

    if "wrinkles" in concerns:
        routine["night"].insert(1, "Retinol Serum")

    if profile.skin_type.lower() == "dry":
        routine["night"].append("Sleeping Cream")

    return routine