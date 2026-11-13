"""Agent reward scoring, lifecycle, and persistence."""

from __future__ import annotations

import json
import logging
from typing import Any

import aiosqlite

from config import settings
from models.agent import AgentInfo, AgentRole, AgentStatus
from utils.helpers import new_id, utcnow_iso

logger = logging.getLogger(__name__)

# Reward deltas
REWARD_SUCCESS = 3
REWARD_AUTOFIX = 5
REWARD_USER_APPROVE = 2
PENALTY_CRASH = -3
PENALTY_REJECTION = -5

# Default agent definitions
_DEFAULT_AGENTS: list[dict[str, Any]] = [
    {"name": "Controller", "role": AgentRole.CONTROLLER},
    {"name": "Reader", "role": AgentRole.READER},
    {"name": "CodeGen", "role": AgentRole.CODEGEN},
    {"name": "Debugger", "role": AgentRole.DEBUGGER},
    {"name": "Critic", "role": AgentRole.CRITIC},
]


async def ensure_default_agents(db: aiosqlite.Connection) -> None:
    """Insert the five default agents if they don't exist yet."""
    cursor = await db.execute("SELECT COUNT(*) as cnt FROM agent_registry")
    row = await cursor.fetchone()
    if row and dict(row)["cnt"] > 0:
        return
    now = utcnow_iso()
    for agent_def in _DEFAULT_AGENTS:
        agent_id = agent_def["role"].value  # use role as stable id
        await db.execute(
            """
            INSERT OR IGNORE INTO agent_registry (id, name, role, status, score, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                agent_id,
                agent_def["name"],
                agent_def["role"].value,
                AgentStatus.IDLE.value,
                settings.agent_initial_score,
                "{}",
                now,
                now,
            ),
        )
    await db.commit()
    logger.info("Default agents seeded into registry")


async def get_all_agents(db: aiosqlite.Connection) -> list[AgentInfo]:
    """Return all registered agents."""
    cursor = await db.execute("SELECT * FROM agent_registry ORDER BY name")
    rows = await cursor.fetchall()
    return [_row_to_agent(r) for r in rows]


async def get_agent(db: aiosqlite.Connection, agent_id: str) -> AgentInfo | None:
    """Return one agent by id."""
    cursor = await db.execute("SELECT * FROM agent_registry WHERE id = ?", (agent_id,))
    row = await cursor.fetchone()
    if row is None:
        return None
    return _row_to_agent(row)


async def set_agent_status(
    db: aiosqlite.Connection, agent_id: str, status: AgentStatus
) -> AgentInfo | None:
    """Update agent status and return updated info."""
    now = utcnow_iso()
    await db.execute(
        "UPDATE agent_registry SET status = ?, updated_at = ? WHERE id = ?",
        (status.value, now, agent_id),
    )
    await db.commit()
    return await get_agent(db, agent_id)


async def adjust_score(
    db: aiosqlite.Connection,
    agent_id: str,
    delta: int,
    reason: str = "",
) -> AgentInfo | None:
    """Adjust an agent's reward score by *delta*.

    If the score drops below the retire threshold the agent is retired.
    """
    agent = await get_agent(db, agent_id)
    if agent is None:
        return None

    new_score = max(0, min(100, agent.score + delta))
    new_status = agent.status
    if new_score < settings.agent_retire_threshold:
        new_status = AgentStatus.RETIRED
        logger.warning("Agent %s retired (score=%d)", agent_id, new_score)

    now = utcnow_iso()
    await db.execute(
        "UPDATE agent_registry SET score = ?, status = ?, updated_at = ? WHERE id = ?",
        (new_score, new_status.value, now, agent_id),
    )
    await db.commit()

    # Log
    log_id = new_id()
    await db.execute(
        "INSERT INTO agent_logs (id, agent_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?)",
        (log_id, agent_id, f"score_adjust({delta:+d})", reason, now),
    )
    await db.commit()

    return await get_agent(db, agent_id)


async def log_agent_action(
    db: aiosqlite.Connection,
    agent_id: str,
    action: str,
    detail: str = "",
    workspace_id: str | None = None,
) -> None:
    """Persist an agent action log."""
    await db.execute(
        "INSERT INTO agent_logs (id, agent_id, workspace_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (new_id(), agent_id, workspace_id, action, detail, utcnow_iso()),
    )
    await db.commit()


# ---- internal ----

def _row_to_agent(row: aiosqlite.Row) -> AgentInfo:
    d = dict(row)
    meta = d.get("metadata", "{}")
    if isinstance(meta, str):
        try:
            meta = json.loads(meta)
        except json.JSONDecodeError:
            meta = {}
    return AgentInfo(
        id=d["id"],
        name=d["name"],
        role=d["role"],
        status=d["status"],
        score=d["score"],
        metadata=meta,
        created_at=d["created_at"],
        updated_at=d["updated_at"],
    )
