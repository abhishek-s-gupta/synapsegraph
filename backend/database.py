"""
SQLite database setup with standard sqlite3.
Ultra-fast, thread-safe, and robust on all platforms.
"""

from __future__ import annotations

import json
import logging
import sqlite3
from contextlib import contextmanager
from typing import Any, Generator

from config import settings

logger = logging.getLogger(__name__)

_db_path: str = settings.db_path


def get_db() -> Generator[sqlite3.Connection, None, None]:
    """FastAPI dependency yielding a sqlite3 connection."""
    conn = sqlite3.connect(_db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def get_db_ctx() -> Generator[sqlite3.Connection, None, None]:
    """Context manager yielding a sqlite3 connection."""
    conn = sqlite3.connect(_db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
    finally:
        conn.close()


_CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS workspaces (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    metadata    TEXT NOT NULL DEFAULT '{}',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS nodes (
    id           TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type         TEXT NOT NULL CHECK(type IN ('paper','question','dataset','code','failure','result')),
    title        TEXT NOT NULL,
    content      TEXT NOT NULL DEFAULT '',
    metadata     TEXT NOT NULL DEFAULT '{}',
    position_x   REAL NOT NULL DEFAULT 0,
    position_y   REAL NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS edges (
    id           TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    source       TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target       TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    relation     TEXT NOT NULL CHECK(relation IN (
        'cites','supports','contradicts','answers',
        'generates_code','failed_with','patched_to','what_if_branch'
    )),
    metadata     TEXT NOT NULL DEFAULT '{}',
    created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_registry (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    role         TEXT NOT NULL,
    generation   INTEGER NOT NULL DEFAULT 1,
    status       TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','idle','running','paused','retired')),
    score        INTEGER NOT NULL DEFAULT 80,
    runs         INTEGER NOT NULL DEFAULT 0,
    metadata     TEXT NOT NULL DEFAULT '{}',
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_logs (
    id           TEXT PRIMARY KEY,
    agent_id     TEXT NOT NULL REFERENCES agent_registry(id) ON DELETE CASCADE,
    workspace_id TEXT,
    action       TEXT NOT NULL,
    detail       TEXT NOT NULL DEFAULT '',
    created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS failure_memories (
    id              TEXT PRIMARY KEY,
    workspace_id    TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    error_pattern   TEXT NOT NULL,
    fix_applied     TEXT NOT NULL,
    success         INTEGER NOT NULL DEFAULT 0,
    metadata        TEXT NOT NULL DEFAULT '{}',
    created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_nodes_workspace ON nodes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_edges_workspace ON edges(workspace_id);
CREATE INDEX IF NOT EXISTS idx_edges_source    ON edges(source);
CREATE INDEX IF NOT EXISTS idx_edges_target    ON edges(target);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_failure_memories_workspace ON failure_memories(workspace_id);
"""


def init_db(conn: sqlite3.Connection | None = None) -> None:
    """Create all tables if they don't exist."""
    if conn is not None:
        conn.executescript(_CREATE_TABLES_SQL)
        conn.commit()
    else:
        with get_db_ctx() as db:
            db.executescript(_CREATE_TABLES_SQL)
            db.commit()
    logger.info("Database tables initialised at %s", _db_path)


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    """Convert a sqlite3.Row to a plain dict, parsing JSON columns."""
    d = dict(row)
    for key in ("metadata", "tags", "metrics"):
        if key in d and isinstance(d[key], str):
            try:
                d[key] = json.loads(d[key])
            except (json.JSONDecodeError, TypeError):
                pass
    return d
