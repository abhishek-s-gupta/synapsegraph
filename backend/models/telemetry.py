"""Pydantic models for Server-Sent Events (SSE) telemetry."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EventType(str, Enum):
    NODE_CREATED = "node_created"
    EDGE_CREATED = "edge_created"
    AGENT_STARTED = "agent_started"
    AGENT_COMPLETED = "agent_completed"
    AGENT_FAILED = "agent_failed"
    EXPERIMENT_STARTED = "experiment_started"
    EXPERIMENT_COMPLETED = "experiment_completed"


class SSEEvent(BaseModel):
    """A single event to be broadcast over the SSE channel."""
    event_type: EventType
    workspace_id: str
    payload: dict[str, Any] = Field(default_factory=dict)
    timestamp: str = ""
