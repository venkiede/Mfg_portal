"""
Centralized data loading utility.
Single Responsibility: Load JSON data from data directory.
"""

import json
import os
from pathlib import Path
from typing import Any, List

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_json(filename: str) -> Any:
    """Load JSON file from data directory. Raises FileNotFoundError if missing."""
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Data file not found: {filename}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_list(filename: str) -> List[dict]:
    """Load JSON file expecting a list. Returns empty list if file missing."""
    try:
        data = load_json(filename)
        return data if isinstance(data, list) else []
    except FileNotFoundError:
        return []
