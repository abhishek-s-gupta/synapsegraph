"""Pydantic models for agents."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class AgentStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    RETIRED = "retired"


class AgentRole(str, Enum):
    CONTROLLER = "controller"
    READER = "reader"
    CODEGEN = "codegen"
    DEBUGGER = "debugger"
    CRITIC = "critic"


class AgentInfo(BaseModel):
    id: str
    name: str
    role: AgentRole
    status: AgentStatus
    score: int
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str


class AgentControlAction(str, Enum):
    PAUSE = "pause"
    RESUME = "resume"
    APPROVE = "approve"
    REJECT = "reject"
    REDIRECT = "redirect"


class AgentControlRequest(BaseModel):
    action: AgentControlAction
    detail: str = ""


class AgentControlResponse(BaseModel):
    agent: AgentInfo
    message: str


class RewardUpdate(BaseModel):
    agent_id: str
    delta: int
    reason: str


class AgentLogEntry(BaseModel):
    id: str
    agent_id: str
    workspace_id: str | None = None
    action: str
    detail: str
    created_at: str
