"""Graph CRUD operations – create / read / delete nodes and edges."""

from __future__ import annotations

import json
import logging
from typing import Any

import aiosqlite

from models.telemetry import EventType
from models.workspace import (
    EdgeCreate,
    EdgeResponse,
    NodeCreate,
    NodeResponse,
    NodePosition,
)
from services.event_bus import event_bus
from utils.helpers import new_id, utcnow_iso

logger = logging.getLogger(__name__)


# ---------- Nodes ----------

async def create_node(
    db: aiosqlite.Connection,
    workspace_id: str,
    data: NodeCreate,
) -> NodeResponse:
    """Insert a node and broadcast a node_created event."""
    node_id = new_id()
    now = utcnow_iso()
    await db.execute(
        """
        INSERT INTO nodes (id, workspace_id, type, title, content, metadata, position_x, position_y, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            node_id,
            workspace_id,
            data.type.value,
            data.title,
            data.content,
            json.dumps(data.metadata),
            data.position.x,
            data.position.y,
            now,
        ),
    )
    await db.commit()

    node = NodeResponse(
        id=node_id,
        workspace_id=workspace_id,
        type=data.type,
        title=data.title,
        content=data.content,
        metadata=data.metadata,
        position=data.position,
        created_at=now,
    )

    await event_bus.publish_simple(
        EventType.NODE_CREATED,
        workspace_id,
        {"node_id": node_id, "type": data.type.value, "title": data.title},
    )
    return node


async def create_node_raw(
    db: aiosqlite.Connection,
    workspace_id: str,
    *,
    node_type: str,
    title: str,
    content: str = "",
    metadata: dict[str, Any] | None = None,
    pos_x: float = 0.0,
    pos_y: float = 0.0,
) -> NodeResponse:
    """Lower-level helper used by agents (avoids constructing NodeCreate)."""
    return await create_node(
        db,
        workspace_id,
        NodeCreate(
            type=node_type,
            title=title,
            content=content,
            metadata=metadata or {},
            position=NodePosition(x=pos_x, y=pos_y),
        ),
    )


async def get_nodes(db: aiosqlite.Connection, workspace_id: str) -> list[NodeResponse]:
    """Return all nodes in a workspace."""
    cursor = await db.execute(
        "SELECT * FROM nodes WHERE workspace_id = ? ORDER BY created_at",
        (workspace_id,),
    )
    rows = await cursor.fetchall()
    return [_row_to_node(r) for r in rows]


async def get_node(db: aiosqlite.Connection, node_id: str) -> NodeResponse | None:
    """Return a single node by id, or None."""
    cursor = await db.execute("SELECT * FROM nodes WHERE id = ?", (node_id,))
    row = await cursor.fetchone()
    if row is None:
        return None
    return _row_to_node(row)


# ---------- Edges ----------

async def create_edge(
    db: aiosqlite.Connection,
    workspace_id: str,
    data: EdgeCreate,
) -> EdgeResponse:
    """Insert an edge and broadcast an edge_created event."""
    edge_id = new_id()
    now = utcnow_iso()
    await db.execute(
        """
        INSERT INTO edges (id, workspace_id, source, target, relation, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            edge_id,
            workspace_id,
            data.source,
            data.target,
            data.relation.value,
            json.dumps(data.metadata),
            now,
        ),
    )
    await db.commit()

    edge = EdgeResponse(
        id=edge_id,
        workspace_id=workspace_id,
        source=data.source,
        target=data.target,
        relation=data.relation,
        metadata=data.metadata,
        created_at=now,
    )

    await event_bus.publish_simple(
        EventType.EDGE_CREATED,
        workspace_id,
        {"edge_id": edge_id, "relation": data.relation.value},
    )
    return edge


async def create_edge_raw(
    db: aiosqlite.Connection,
    workspace_id: str,
    *,
    source: str,
    target: str,
    relation: str,
    metadata: dict[str, Any] | None = None,
) -> EdgeResponse:
    """Lower-level edge creation helper."""
    return await create_edge(
        db,
        workspace_id,
        EdgeCreate(source=source, target=target, relation=relation, metadata=metadata or {}),
    )


async def get_edges(db: aiosqlite.Connection, workspace_id: str) -> list[EdgeResponse]:
    """Return all edges in a workspace."""
    cursor = await db.execute(
        "SELECT * FROM edges WHERE workspace_id = ? ORDER BY created_at",
        (workspace_id,),
    )
    rows = await cursor.fetchall()
    return [_row_to_edge(r) for r in rows]


# ---------- Conversions ----------

def _row_to_node(row: aiosqlite.Row) -> NodeResponse:
    d = dict(row)
    meta = d.get("metadata", "{}")
    if isinstance(meta, str):
        try:
            meta = json.loads(meta)
        except json.JSONDecodeError:
            meta = {}
    return NodeResponse(
        id=d["id"],
        workspace_id=d["workspace_id"],
        type=d["type"],
        title=d["title"],
        content=d.get("content", ""),
        metadata=meta,
        position=NodePosition(x=d.get("position_x", 0), y=d.get("position_y", 0)),
        created_at=d["created_at"],
    )


def _row_to_edge(row: aiosqlite.Row) -> EdgeResponse:
    d = dict(row)
    meta = d.get("metadata", "{}")
    if isinstance(meta, str):
        try:
            meta = json.loads(meta)
        except json.JSONDecodeError:
            meta = {}
    return EdgeResponse(
        id=d["id"],
        workspace_id=d["workspace_id"],
        source=d["source"],
        target=d["target"],
        relation=d["relation"],
        metadata=meta,
        created_at=d["created_at"],
    )
