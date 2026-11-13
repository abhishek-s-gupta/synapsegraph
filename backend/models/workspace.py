"""Pydantic models for workspaces, nodes, and edges."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ---------- Enums ----------

class NodeType(str, Enum):
    PAPER = "paper"
    QUESTION = "question"
    DATASET = "dataset"
    CODE = "code"
    FAILURE = "failure"
    RESULT = "result"


class EdgeRelation(str, Enum):
    CITES = "cites"
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    ANSWERS = "answers"
    GENERATES_CODE = "generates_code"
    FAILED_WITH = "failed_with"
    PATCHED_TO = "patched_to"
    WHAT_IF_BRANCH = "what_if_branch"


# ---------- Node ----------

class NodePosition(BaseModel):
    x: float = 0.0
    y: float = 0.0


class NodeCreate(BaseModel):
    type: NodeType
    title: str = Field(..., min_length=1, max_length=500)
    content: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)
    position: NodePosition = Field(default_factory=NodePosition)


class NodeResponse(BaseModel):
    id: str
    workspace_id: str
    type: NodeType
    title: str
    content: str
    metadata: dict[str, Any]
    position: NodePosition
    created_at: str


# ---------- Edge ----------

class EdgeCreate(BaseModel):
    source: str
    target: str
    relation: EdgeRelation
    metadata: dict[str, Any] = Field(default_factory=dict)


class EdgeResponse(BaseModel):
    id: str
    workspace_id: str
    source: str
    target: str
    relation: EdgeRelation
    metadata: dict[str, Any]
    created_at: str


# ---------- Workspace ----------

class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: str
    metadata: dict[str, Any]
    created_at: str
    updated_at: str


class WorkspaceDetail(WorkspaceResponse):
    nodes: list[NodeResponse] = Field(default_factory=list)
    edges: list[EdgeResponse] = Field(default_factory=list)
    agents: list[Any] = Field(default_factory=list)


# ---------- Ingest ----------

class IngestRequest(BaseModel):
    """Payload for the ingest endpoint."""
    input_type: str = Field(
        ...,
        description="One of: arxiv_url, pdf_text, repo_url, question",
    )
    content: str = Field(..., min_length=1)


class IngestResponse(BaseModel):
    nodes: list[NodeResponse]
    edges: list[EdgeResponse]
    message: str = ""


# ---------- Reproduce ----------

class ReproduceRequest(BaseModel):
    node_id: str


class ReproduceResponse(BaseModel):
    nodes: list[NodeResponse]
    edges: list[EdgeResponse]
    success: bool
    message: str = ""
    attempts: int = 0


# ---------- What-If ----------

class WhatIfRequest(BaseModel):
    node_id: str
    parameter_mods: dict[str, Any] = Field(
        ..., description="Parameter name → new value"
    )


class WhatIfResponse(BaseModel):
    forked_node: NodeResponse
    edges: list[EdgeResponse]
    message: str = ""
