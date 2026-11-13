"""Shared utility helpers."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def new_id() -> str:
    """Generate a new UUID4 string."""
    return uuid.uuid4().hex


def utcnow_iso() -> str:
    """Return the current UTC time as ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()


def safe_float(value: str | float | int | None, default: float = 0.0) -> float:
    """Parse a value to float, returning *default* on failure."""
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def truncate(text: str, max_len: int = 500) -> str:
    """Truncate text to *max_len* characters with an ellipsis."""
    if len(text) <= max_len:
        return text
    return text[: max_len - 3] + "..."


def extract_keywords(text: str, top_n: int = 15) -> list[str]:
    """Extract simple keywords from text via frequency counting.

    Filters out common English stop words and returns the top-N most frequent
    words (lowercased, deduplicated, alphabetically ordered on ties).
    """
    import re

    stop_words = {
        "a", "an", "the", "and", "or", "but", "is", "in", "it", "of", "to",
        "for", "on", "with", "as", "at", "by", "from", "that", "this",
        "was", "are", "were", "be", "been", "being", "have", "has", "had",
        "do", "does", "did", "will", "would", "shall", "should", "may",
        "might", "must", "can", "could", "not", "no", "nor", "so", "yet",
        "if", "then", "than", "too", "very", "just", "about", "above",
        "after", "again", "all", "also", "am", "any", "because", "before",
        "between", "both", "each", "few", "further", "get", "got", "here",
        "how", "into", "its", "let", "more", "most", "much", "my", "new",
        "now", "off", "only", "other", "our", "out", "over", "own", "re",
        "same", "she", "he", "her", "him", "his", "some", "such", "there",
        "these", "they", "those", "through", "under", "until", "up", "us",
        "we", "what", "when", "where", "which", "while", "who", "whom",
        "why", "you", "your", "i", "me",
    }

    words = re.findall(r"[a-z]{3,}", text.lower())
    freq: dict[str, int] = {}
    for w in words:
        if w not in stop_words:
            freq[w] = freq.get(w, 0) + 1

    ranked = sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))
    return [w for w, _ in ranked[:top_n]]
