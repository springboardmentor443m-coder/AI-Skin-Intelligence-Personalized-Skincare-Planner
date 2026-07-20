"""
Runs all MongoDB seed scripts in sequence.

Usage:
    python run_seeds.py [--wipe]
"""

import argparse
import sys

import seed_ingredient_rules
import seed_product_catalog


def main() -> None:
    parser = argparse.ArgumentParser(description="Run all database seed scripts.")
    parser.add_argument("--wipe", action="store_true", help="Delete existing documents before seeding each collection.")
    args = parser.parse_args()

    print("=== Seeding MongoDB collections ===")
    try:
        seed_ingredient_rules.seed(wipe=args.wipe)
        seed_product_catalog.seed(wipe=args.wipe)
    except Exception as exc:  # noqa: BLE001
        print(f"Seeding aborted: {exc}", file=sys.stderr)
        sys.exit(1)

    print("=== All seeds completed successfully ===")


if __name__ == "__main__":
    main()
