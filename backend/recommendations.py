RECOMMENDATIONS = {

    "wrinkles": {
        "morning": [
            "Vitamin C Serum",
            "SPF 50 Sunscreen"
        ],

        "night": [
            "Retinol Cream",
            "Moisturizer"
        ],

        "ingredients": [
            "Retinol",
            "Peptides",
            "Hyaluronic Acid"
        ],

        "tips": [
            "Drink plenty of water",
            "Sleep 7-8 hours",
            "Avoid smoking",
            "Wear sunscreen daily"
        ]
    },

    "darkspots": {
        "morning": [
            "Vitamin C Serum",
            "Niacinamide Serum",
            "SPF 50 Sunscreen"
        ],

        "night": [
            "Alpha Arbutin",
            "Moisturizer"
        ],

        "ingredients": [
            "Vitamin C",
            "Niacinamide",
            "Alpha Arbutin"
        ],

        "tips": [
            "Avoid direct sun exposure",
            "Use sunscreen daily",
            "Do not pick at pimples"
        ]
    },

    "puffy eyes": {
        "morning": [
            "Caffeine Eye Cream",
            "Cold Compress"
        ],

        "night": [
            "Eye Gel",
            "Hydrating Cream"
        ],

        "ingredients": [
            "Caffeine",
            "Hyaluronic Acid"
        ],

        "tips": [
            "Sleep 7-8 hours",
            "Reduce salt intake",
            "Stay hydrated"
        ]
    },

    "clear face": {
        "morning": [
            "Gentle Cleanser",
            "Moisturizer",
            "SPF 50 Sunscreen"
        ],

        "night": [
            "Gentle Cleanser",
            "Moisturizer"
        ],

        "ingredients": [
            "Ceramides",
            "Hyaluronic Acid"
        ],

        "tips": [
            "Maintain your skincare routine",
            "Stay hydrated",
            "Eat a balanced diet"
        ]
    }

}

def get_recommendation(predicted_class):

    return RECOMMENDATIONS.get(
        predicted_class.lower(),
        {
            "morning": [],
            "night": [],
            "ingredients": [],
            "tips": [
                "No recommendations available."
            ]
        }
    )