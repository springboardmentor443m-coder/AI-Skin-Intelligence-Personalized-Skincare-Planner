import pickle
import re
from pathlib import Path
from typing import Any, Dict, List, Optional


def load_dataset(file_path: Path) -> List[Dict[str, Any]]:
    """Load a CSV dataset and return a list of row dictionaries.

    This helper is intended for dataset ingestion and does not perform text
    processing or recommendation-specific transformations.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"Dataset file not found: {file_path}")

    rows: List[Dict[str, Any]] = []
    with file_path.open("r", encoding="utf-8", newline="") as handle:
        import csv

        reader = csv.DictReader(handle)
        for row in reader:
            rows.append(row)

    return rows


def save_pickle(data: Any, file_path: Path) -> None:
    """Serialize Python objects to a pickle file."""
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with file_path.open("wb") as handle:
        pickle.dump(data, handle)


def load_pickle(file_path: Path) -> Any:
    """Load a Python object from a pickle file."""
    if not file_path.exists():
        raise FileNotFoundError(f"Pickle file not found: {file_path}")

    with file_path.open("rb") as handle:
        return pickle.load(handle)


def clean_text(text: Optional[str]) -> str:
    """Normalize and clean raw text for later vectorization.

    This should remove or normalize punctuation, whitespace, and other
    artifacts without applying recommendation logic.
    """
    if text is None:
        return ""

    cleaned = text.strip().lower()
    cleaned = re.sub(r"\s+", " ", cleaned)
    cleaned = re.sub(r"[^a-z0-9\s]", "", cleaned)
    return cleaned
