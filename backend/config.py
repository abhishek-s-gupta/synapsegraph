"""Application configuration using Pydantic BaseModel and environment variables."""

from __future__ import annotations

import os
from pathlib import Path
from pydantic import BaseModel, Field


class Settings(BaseModel):
    """Global application settings."""

    # Database
    db_path: str = Field(
        default_factory=lambda: os.getenv(
            "SYNAPSE_DB_PATH",
            str(Path(__file__).resolve().parent / "data" / "synapsegraph.db"),
        )
    )

    # Sandbox
    sandbox_base_dir: str = Field(
        default_factory=lambda: os.getenv(
            "SYNAPSE_SANDBOX_BASE_DIR",
            str(Path(__file__).resolve().parent / "sandbox_workdir"),
        )
    )
    sandbox_timeout_seconds: int = Field(
        default_factory=lambda: int(os.getenv("SYNAPSE_SANDBOX_TIMEOUT_SECONDS", "10"))
    )

    # Agent defaults
    agent_initial_score: int = Field(
        default_factory=lambda: int(os.getenv("SYNAPSE_AGENT_INITIAL_SCORE", "80"))
    )
    agent_retire_threshold: int = Field(
        default_factory=lambda: int(os.getenv("SYNAPSE_AGENT_RETIRE_THRESHOLD", "60"))
    )
    agent_max_retries: int = Field(
        default_factory=lambda: int(os.getenv("SYNAPSE_AGENT_MAX_RETRIES", "3"))
    )

    # Server
    host: str = Field(default_factory=lambda: os.getenv("SYNAPSE_HOST", "0.0.0.0"))
    port: int = Field(default_factory=lambda: int(os.getenv("SYNAPSE_PORT", "8000")))
    debug: bool = Field(
        default_factory=lambda: os.getenv("SYNAPSE_DEBUG", "True").lower() == "true"
    )


settings = Settings()

# Ensure directories exist
os.makedirs(Path(settings.db_path).parent, exist_ok=True)
os.makedirs(settings.sandbox_base_dir, exist_ok=True)
