import re
from typing import Any


SKIN_TYPES = {
    "oily": [
        "oily",
        "oily skin",
        "greasy skin",
    ],
    "dry": [
        "dry",
        "dry skin",
    ],
    "combination": [
        "combination",
        "combination skin",
        "combo skin",
    ],
    "sensitive": [
        "sensitive",
        "sensitive skin",
    ],
    "normal": [
        "normal",
        "normal skin",
    ],
}


SKIN_CONCERNS = {
    "acne": [
        "acne",
        "pimples",
        "pimple",
        "breakouts",
        "breakout",
        "blemishes",
    ],
    "dark_spots": [
        "dark spots",
        "dark spot",
        "hyperpigmentation",
        "pigmentation",
    ],
    "hydration": [
        "hydration",
        "dehydrated",
        "dehydration",
        "dryness",
    ],
    "anti_aging": [
        "anti aging",
        "anti-aging",
        "wrinkles",
        "fine lines",
        "aging",
    ],
    "pores": [
        "pores",
        "large pores",
        "visible pores",
    ],
    "redness": [
        "redness",
        "red skin",
        "irritation",
    ],
    "dullness": [
        "dull",
        "dullness",
        "brightening",
    ],
}


PRODUCT_TYPES = {
    "moisturizer": [
        "moisturizer",
        "moisturiser",
        "moisturizing cream",
        "hydrating cream",
        "face cream",
    ],
    "serum": [
        "serum",
        "face serum",
    ],
    "cleanser": [
        "cleanser",
        "face wash",
        "facial cleanser",
    ],
    "sunscreen": [
        "sunscreen",
        "sun screen",
        "spf",
        "sun protection",
    ],
    "mask": [
        "mask",
        "face mask",
    ],
    "toner": [
        "toner",
        "face toner",
    ],
    "face_oil": [
        "face oil",
        "facial oil",
    ],
    "eye_care": [
        "eye cream",
        "eye care",
        "eye treatment",
    ],
}


INGREDIENTS = {
    "vitamin_c": [
        "vitamin c",
        "ascorbic acid",
    ],
    "niacinamide": [
        "niacinamide",
        "vitamin b3",
    ],
    "hyaluronic_acid": [
        "hyaluronic acid",
        "hyaluronic",
    ],
    "salicylic_acid": [
        "salicylic acid",
        "bha",
    ],
    "retinol": [
        "retinol",
        "retinoid",
    ],
}


def _normalize_text(text: str) -> str:
    """Normalize user query text for reliable matching."""

    text = str(text).strip().lower()

    text = re.sub(r"[^a-z0-9\s-]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def _find_matches(
    text: str,
    vocabulary: dict[str, list[str]],
) -> list[str]:
    """Find known concepts present in the normalized query."""

    matches: list[str] = []

    for label, phrases in vocabulary.items():

        for phrase in phrases:

            phrase = _normalize_text(phrase)

            pattern = rf"(?<!\w){re.escape(phrase)}(?!\w)"

            if re.search(pattern, text):
                matches.append(label)
                break

    return matches


def parse_query(query_text: str) -> dict[str, Any]:
    """
    Convert a natural-language skincare query into structured features.

    Example:
        "acne oily skin moisturizer with niacinamide"

    becomes:

        {
            "original_query": "...",
            "normalized_query": "...",
            "skin_types": ["oily"],
            "concerns": ["acne"],
            "product_types": ["moisturizer"],
            "ingredients": ["niacinamide"],
        }
    """

    if not str(query_text).strip():
        raise ValueError("Query text cannot be empty.")

    normalized_query = _normalize_text(query_text)

    return {
        "original_query": str(query_text).strip(),
        "normalized_query": normalized_query,
        "skin_types": _find_matches(
            normalized_query,
            SKIN_TYPES,
        ),
        "concerns": _find_matches(
            normalized_query,
            SKIN_CONCERNS,
        ),
        "product_types": _find_matches(
            normalized_query,
            PRODUCT_TYPES,
        ),
        "ingredients": _find_matches(
            normalized_query,
            INGREDIENTS,
        ),
    }


def main() -> None:
    """Run a small command-line test for the query parser."""

    print("=" * 60)
    print("SKINCARE QUERY PARSER TEST")
    print("=" * 60)

    query = input(
        "Enter skincare requirement "
        "(example: acne oily skin moisturizer): "
    ).strip()

    parsed_query = parse_query(query)

    print()
    print("Parsed Query")
    print("-" * 60)

    for key, value in parsed_query.items():
        print(f"{key:20}: {value}")


if __name__ == "__main__":
    main()