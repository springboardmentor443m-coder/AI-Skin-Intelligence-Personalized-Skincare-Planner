"""
Seeds the `ingredient_rules` collection with interaction, hazard, and
allergy-trigger data used by the ingredient compatibility engine
(backend/app/api/v1/ingredients.py).

Usage:
    python seed_ingredient_rules.py [--wipe]

Environment variables:
    MONGO_URI / MONGO_HOST / MONGO_PORT / MONGO_USER / MONGO_PASSWORD / MONGO_DB
"""

import argparse
import json
import sys
from pathlib import Path

from _connection import get_database, get_mongo_client

COLLECTION_NAME = "ingredient_rules"
DATA_FILE = Path(__file__).parent / "data" / "ingredient_rules.sample.json"


def load_seed_data() -> list[dict]:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def seed(wipe: bool = False) -> None:
    client = get_mongo_client()
    db = get_database(client)
    collection = db[COLLECTION_NAME]

    if wipe:
        result = collection.delete_many({})
        print(f"[ingredient_rules] Wiped {result.deleted_count} existing documents.")

    documents = load_seed_data()

    inserted, updated = 0, 0
    for doc in documents:
        result = collection.update_one(
            {"ingredient": doc["ingredient"]},
            {"$set": doc},
            upsert=True,
        )
        if result.upserted_id is not None:
            inserted += 1
        elif result.modified_count:
            updated += 1

    collection.create_index("ingredient", unique=True)
    collection.create_index("category")

    print(f"[ingredient_rules] Seed complete. Inserted: {inserted}, Updated: {updated}, Total: {len(documents)}")
    client.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the ingredient_rules collection.")
    parser.add_argument("--wipe", action="store_true", help="Delete existing documents before seeding.")
    args = parser.parse_args()

    try:
        seed(wipe=args.wipe)
    except Exception as exc:  # noqa: BLE001
        print(f"[ingredient_rules] Seeding failed: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
