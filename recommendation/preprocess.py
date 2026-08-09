import ast
import re
from pathlib import Path
from typing import Any

import pandas as pd

REQUIRED_COLUMNS = {
    "product_id",
    "product_name",
    "brand_name",
    "ingredients",
    "highlights",
    "primary_category",
    "secondary_category",
    "tertiary_category",
}

TEXT_COLUMNS = [
    "product_name",
    "brand_name",
    "ingredients",
    "highlights",
    "primary_category",
    "secondary_category",
    "tertiary_category",
]

NUMERIC_COLUMNS = ["price_usd", "value_price_usd", "sale_price_usd", "rating", "reviews", "loves_count"]


def _clean_text_value(value: Any) -> str:
    """Convert list-like or missing values into a normalized string."""
    if pd.isna(value):
        return ""

    if isinstance(value, str):
        stripped_value = value.strip()
        if not stripped_value or stripped_value.lower() in {"nan", "none", "null"}:
            return ""

        try:
            parsed_value = ast.literal_eval(stripped_value)
        except (ValueError, SyntaxError):
            parsed_value = stripped_value

        if isinstance(parsed_value, (list, tuple, set)):
            parts = [str(item).strip() for item in parsed_value if str(item).strip()]
            return " ".join(parts)
        if isinstance(parsed_value, dict):
            parts = [str(item).strip() for item in parsed_value.values() if str(item).strip()]
            return " ".join(parts)
        return str(parsed_value).strip()

    if isinstance(value, (list, tuple, set)):
        parts = [str(item).strip() for item in value if str(item).strip()]
        return " ".join(parts)

    return str(value).strip()


def load_product_dataset(dataset_path: Path | str) -> pd.DataFrame:
    """Load the primary product dataset from disk as a pandas DataFrame."""
    dataset_path = Path(dataset_path)
    if not dataset_path.exists():
        raise FileNotFoundError(f"Product dataset not found: {dataset_path}")

    data_frame = pd.read_csv(dataset_path)
    missing_columns = sorted(REQUIRED_COLUMNS.difference(data_frame.columns))
    if missing_columns:
        raise ValueError(f"Missing required product columns: {', '.join(missing_columns)}")

    return data_frame


def clean_missing_values(data_frame: pd.DataFrame) -> pd.DataFrame:
    """Prepare skincare product rows while keeping optional fields usable."""
    cleaned_frame = data_frame.copy()

    if "primary_category" not in cleaned_frame.columns:
        raise ValueError("The dataset is missing the primary_category column.")

    cleaned_frame = cleaned_frame.loc[
        cleaned_frame["primary_category"].fillna("").astype(str).str.strip().str.lower() == "skincare"
    ].copy()

    for column in TEXT_COLUMNS:
        if column in cleaned_frame.columns:
            cleaned_frame[column] = cleaned_frame[column].fillna("")

    for column in NUMERIC_COLUMNS:
        if column in cleaned_frame.columns:
            cleaned_frame[column] = pd.to_numeric(cleaned_frame[column], errors="coerce")

    cleaned_frame = cleaned_frame.loc[
        cleaned_frame["product_name"].fillna("").astype(str).str.strip() != ""
    ].copy()
    cleaned_frame = cleaned_frame.loc[
        cleaned_frame["product_id"].fillna("").astype(str).str.strip() != ""
    ].copy()

    return cleaned_frame.reset_index(drop=True)


def parse_list_columns(data_frame: pd.DataFrame) -> pd.DataFrame:
    """Parse string-encoded list fields into clean text suitable for NLP."""
    parsed_frame = data_frame.copy()

    for column in ["ingredients", "highlights"]:
        if column in parsed_frame.columns:
            parsed_frame[column] = parsed_frame[column].apply(_clean_text_value)

    return parsed_frame


def create_search_text(data_frame: pd.DataFrame) -> pd.DataFrame:
    """Create a consolidated search-ready text column for recommendation features."""
    search_frame = data_frame.copy()

    text_fields = [
        "product_name",
        "brand_name",
        "ingredients",
        "highlights",
        "primary_category",
        "secondary_category",
        "tertiary_category",
    ]

    for column in text_fields:
        if column in search_frame.columns:
            search_frame[column] = search_frame[column].apply(_clean_text_value)
        else:
            search_frame[column] = ""

    search_frame["search_text"] = search_frame[text_fields].apply(
        lambda row: " ".join(str(value).strip() for value in row if str(value).strip()),
        axis=1,
    )
    search_frame["search_text"] = search_frame["search_text"].apply(
        lambda value: re.sub(r"\s+", " ", value).strip().lower()
    )

    return search_frame


def save_processed_dataset(data_frame: pd.DataFrame, output_path: Path | str) -> None:
    """Persist the cleaned and transformed dataset for downstream training."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    data_frame.to_parquet(output_path, index=False)
