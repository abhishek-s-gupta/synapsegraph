"""PDF / arXiv URL paper parser — fully offline, heuristic-based."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

from utils.helpers import extract_keywords

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Cached demo traces — used as fallback and for out-of-the-box demo
# ---------------------------------------------------------------------------

DEMO_ARXIV_RESULT: dict = {
    "title": "Attention Is All You Need",
    "authors": ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit",
                "Llion Jones", "Aidan N. Gomez", "Lukasz Kaiser", "Illia Polosukhin"],
    "abstract": (
        "The dominant sequence transduction models are based on complex recurrent or "
        "convolutional neural networks that include an encoder and a decoder. The best "
        "performing models also connect the encoder and decoder through an attention "
        "mechanism. We propose a new simple network architecture, the Transformer, "
        "based solely on attention mechanisms, dispensing with recurrence and convolutions "
        "entirely. Experiments on two machine translation tasks show these models to be "
        "superior in quality while being more parallelizable and requiring significantly "
        "less time to train."
    ),
    "key_claims": [
        "Transformer architecture based solely on attention mechanisms outperforms RNN/CNN models",
        "The model is more parallelizable and requires less training time",
        "Achieves new SOTA on WMT 2014 English-to-German and English-to-French translation",
    ],
    "datasets": ["WMT 2014 English-German", "WMT 2014 English-French"],
    "methods": ["Multi-Head Attention", "Positional Encoding", "Scaled Dot-Product Attention",
                "Feed-Forward Network", "Layer Normalization"],
    "keywords": ["transformer", "attention", "self-attention", "encoder", "decoder",
                 "machine translation", "sequence transduction", "parallelizable"],
}

DEMO_CODE_TEMPLATE = '''\
"""Auto-generated experiment script for: {title}"""
import random
import math

# Simulated dataset: {dataset}
data_size = {data_size}
data = [random.gauss(0, 1) for _ in range(data_size)]

# Method: {method}
def run_experiment(data):
    """Run a simplified version of the described method."""
    # Compute basic statistics as a proxy for the method output
    mean_val = sum(data) / len(data)
    variance = sum((x - mean_val) ** 2 for x in data) / len(data)
    std_dev = math.sqrt(variance)
    
    # Simulate a model metric
    accuracy = min(0.95, 0.5 + 0.4 * (1.0 / (1.0 + std_dev)))
    loss = max(0.05, 1.0 - accuracy + random.uniform(-0.02, 0.02))
    
    return {{
        "mean": round(mean_val, 4),
        "std_dev": round(std_dev, 4),
        "simulated_accuracy": round(accuracy, 4),
        "simulated_loss": round(loss, 4),
        "data_size": len(data),
    }}

results = run_experiment(data)
for key, value in results.items():
    print(f"{{key}}: {{value}}")
'''


@dataclass
class ParsedPaper:
    """Result of parsing a paper / input text."""
    title: str = ""
    authors: list[str] = field(default_factory=list)
    abstract: str = ""
    key_claims: list[str] = field(default_factory=list)
    datasets: list[str] = field(default_factory=list)
    methods: list[str] = field(default_factory=list)
    keywords: list[str] = field(default_factory=list)
    raw_text: str = ""


def _is_arxiv_url(text: str) -> bool:
    return bool(re.search(r"arxiv\.org/(abs|pdf)/\d{4}\.\d{4,5}", text))


def parse_arxiv_url(url: str) -> ParsedPaper:
    """Parse an arXiv URL.  Because we are offline we return the demo trace."""
    logger.info("Parsing arXiv URL (offline fallback): %s", url)
    d = DEMO_ARXIV_RESULT
    return ParsedPaper(
        title=d["title"],
        authors=d["authors"],
        abstract=d["abstract"],
        key_claims=d["key_claims"],
        datasets=d["datasets"],
        methods=d["methods"],
        keywords=d["keywords"],
        raw_text=d["abstract"],
    )


def parse_pdf_text(text: str) -> ParsedPaper:
    """Heuristic parser for raw pasted PDF / paper text."""
    lines = text.strip().splitlines()
    title = lines[0].strip() if lines else "Untitled Paper"

    # Try to find author line (line after title, often has commas / "and")
    authors: list[str] = []
    if len(lines) > 1:
        author_line = lines[1].strip()
        if "," in author_line or " and " in author_line.lower():
            parts = re.split(r",\s*|\s+and\s+", author_line)
            authors = [p.strip() for p in parts if p.strip()]

    # Abstract detection
    abstract = ""
    abstract_start = -1
    for i, line in enumerate(lines):
        if re.match(r"^abstract\s*[:.]?\s*$", line.strip(), re.IGNORECASE):
            abstract_start = i + 1
            break
    if abstract_start > 0:
        abstract_lines = []
        for line in lines[abstract_start:]:
            if re.match(r"^(introduction|1\.|keywords)\s*", line.strip(), re.IGNORECASE):
                break
            abstract_lines.append(line.strip())
        abstract = " ".join(abstract_lines)
    else:
        # Use first paragraph-like block
        abstract = " ".join(l.strip() for l in lines[2:7] if l.strip())

    # Claims — sentences with claim-like language
    full_text = " ".join(lines)
    sentences = re.split(r"(?<=[.!?])\s+", full_text)
    claim_patterns = re.compile(
        r"(we (propose|show|demonstrate|prove|achieve|introduce|present)|"
        r"our (method|approach|model|system|framework)|"
        r"outperform|state[- ]of[- ]the[- ]art|sota|novel|superior|significant)",
        re.IGNORECASE,
    )
    key_claims = [s.strip() for s in sentences if claim_patterns.search(s)][:5]

    # Datasets — look for capitalised multi-word names near "dataset", "benchmark", "corpus"
    dataset_pattern = re.compile(
        r"(?:dataset|benchmark|corpus|evaluated on|trained on)\s+([A-Z][\w\s\-]{2,30})",
        re.IGNORECASE,
    )
    datasets = list({m.group(1).strip() for m in dataset_pattern.finditer(full_text)})
    if not datasets:
        datasets = _extract_named_entities(full_text, category="dataset")

    # Methods
    method_pattern = re.compile(
        r"(?:method|approach|algorithm|technique|architecture|model)\s+(?:called|named|dubbed)?\s*"
        r"([A-Z][\w\s\-]{2,30})",
        re.IGNORECASE,
    )
    methods = list({m.group(1).strip() for m in method_pattern.finditer(full_text)})
    if not methods:
        methods = _extract_named_entities(full_text, category="method")

    keywords = extract_keywords(full_text)

    return ParsedPaper(
        title=title,
        authors=authors,
        abstract=abstract,
        key_claims=key_claims,
        datasets=datasets,
        methods=methods,
        keywords=keywords,
        raw_text=text,
    )


def parse_question(text: str) -> ParsedPaper:
    """Parse a plain-text research question."""
    keywords = extract_keywords(text)
    return ParsedPaper(
        title=text[:120].strip(),
        abstract=text,
        keywords=keywords,
        raw_text=text,
    )


def parse_repo_url(url: str) -> ParsedPaper:
    """Parse a code repository URL (offline fallback)."""
    repo_name = url.rstrip("/").split("/")[-1] if "/" in url else url
    return ParsedPaper(
        title=f"Repository: {repo_name}",
        abstract=f"Code repository at {url}",
        methods=[repo_name],
        keywords=extract_keywords(repo_name.replace("-", " ").replace("_", " ")),
        raw_text=url,
    )


def parse_input(input_type: str, content: str) -> ParsedPaper:
    """Dispatch to the correct parser based on *input_type*."""
    if input_type == "arxiv_url" or _is_arxiv_url(content):
        return parse_arxiv_url(content)
    if input_type == "pdf_text":
        return parse_pdf_text(content)
    if input_type == "repo_url":
        return parse_repo_url(content)
    if input_type == "question":
        return parse_question(content)
    # Fallback — treat as plain text
    return parse_pdf_text(content)


# ---- internal helpers ----

def _extract_named_entities(text: str, category: str = "dataset") -> list[str]:
    """Very simple capitalized-phrase extractor as a stand-in for NER."""
    pattern = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b")
    candidates = list({m.group(0) for m in pattern.finditer(text)})
    # Return at most 5
    return candidates[:5]
