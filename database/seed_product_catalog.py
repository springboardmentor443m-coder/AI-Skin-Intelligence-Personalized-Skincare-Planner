"""
Seeds the `product_catalog` collection used by the product matching and
suitability scoring engine (backend/app/api/v1/products.py).

Usage:
    python seed_product_catalog.py [--wipe]

Environment variables:
    MONGO_URI / MONGO_HOST / MONGO_PORT / MONGO_USER / MONGO_PASSWORD / MONGO_DB
"""

import argparse
import json
import sys
from pathlib import Path

from _connection import get_database, get_mongo_client

COLLECTION_NAME = "product_catalog"
DATA_FILE = Path(__file__).parent / "data" / "product_catalog.sample.json"


def load_seed_data() -> list[dict]:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def seed(wipe: bool = False) -> None:
    client = get_mongo_client()
    db = get_database(client)
    collection = db[COLLECTION_NAME]

    if wipe:
        result = collection.delete_many({})
        print(f"[product_catalog] Wiped {result.deleted_count} existing documents.")

    documents = load_seed_data()

    inserted, updated = 0, 0
    for doc in documents:
        result = collection.update_one(
            {"sku": doc["sku"]},
            {"$set": doc},
            upsert=True,
        )
        if result.upserted_id is not None:
            inserted += 1
        elif result.modified_count:
            updated += 1

    collection.create_index("sku", unique=True)
    collection.create_index("category")
    collection.create_index("skin_types")
    collection.create_index("key_ingredients")

    print(f"[product_catalog] Seed complete. Inserted: {inserted}, Updated: {updated}, Total: {len(documents)}")
    client.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the product_catalog collection.")
    parser.add_argument("--wipe", action="store_true", help="Delete existing documents before seeding.")
    args = parser.parse_args()

    try:
        seed(wipe=args.wipe)
    except Exception as exc:  # noqa: BLE001
        print(f"[product_catalog] Seeding failed: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
