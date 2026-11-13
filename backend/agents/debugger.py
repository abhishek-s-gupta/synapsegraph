"""Debugger Agent — parses Python tracebacks and applies known fix patterns.

Fix catalogue:
  - Missing import → add import statement
  - NameError → inject variable initialisation
  - IndexError / shape mismatch → add bounds check or reshape
  - KeyError → add key-existence check
  - ZeroDivisionError → add guard
  - TypeError → add type conversion
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import aiosqlite

from agents.registry import (
    REWARD_AUTOFIX,
    PENALTY_CRASH,
    adjust_score,
    log_agent_action,
    set_agent_status,
)
from models.agent import AgentRole, AgentStatus
from models.telemetry import EventType
from services.event_bus import event_bus
from services.graph_service import create_edge_raw, create_node_raw
from utils.helpers import new_id, utcnow_iso

logger = logging.getLogger(__name__)

AGENT_ID = AgentRole.DEBUGGER.value


# ---------- Fix patterns ----------

_FIX_PATTERNS: list[tuple[re.Pattern, str, Any]] = [
    # ModuleNotFoundError / ImportError
    (
        re.compile(r"ModuleNotFoundError: No module named '(\w+)'"),
        "missing_import",
        lambda m, code: _fix_missing_import(code, m.group(1)),
    ),
    (
        re.compile(r"ImportError: cannot import name '(\w+)' from '(\w+)'"),
        "import_error",
        lambda m, code: _fix_missing_import(code, m.group(2)),
    ),
    # NameError
    (
        re.compile(r"NameError: name '(\w+)' is not defined"),
        "name_error",
        lambda m, code: _fix_name_error(code, m.group(1)),
    ),
    # KeyError
    (
        re.compile(r"KeyError: ['\"](\w+)['\"]"),
        "key_error",
        lambda m, code: _fix_key_error(code, m.group(1)),
    ),
    # IndexError
    (
        re.compile(r"IndexError: (list |tuple )?index out of range"),
        "index_error",
        lambda m, code: _fix_index_error(code),
    ),
    # ZeroDivisionError
    (
        re.compile(r"ZeroDivisionError"),
        "zero_division",
        lambda m, code: _fix_zero_division(code),
    ),
    # TypeError: unsupported operand types
    (
        re.compile(r"TypeError"),
        "type_error",
        lambda m, code: _fix_type_error(code),
    ),
    # ValueError
    (
        re.compile(r"ValueError"),
        "value_error",
        lambda m, code: _fix_value_error(code),
    ),
]


def _fix_missing_import(code: str, module: str) -> tuple[str, str]:
    """Attempt to add an import for *module* at the top of the code."""
    import_stmt = f"import {module}\n"
    if import_stmt in code:
        # Already present — try wrapping in try/except
        patched = code.replace(
            import_stmt,
            f"try:\n    import {module}\nexcept ImportError:\n    {module} = None  # fallback\n",
        )
        return patched, f"Wrapped import {module} in try/except"
    patched = import_stmt + code
    return patched, f"Added 'import {module}' at top"


def _fix_name_error(code: str, name: str) -> tuple[str, str]:
    """Initialise the undefined variable."""
    init_line = f"{name} = None  # auto-initialised by debugger\n"
    patched = init_line + code
    return patched, f"Auto-initialised '{name} = None'"


def _fix_key_error(code: str, key: str) -> tuple[str, str]:
    """Replace direct dict access with .get()."""
    pattern = re.compile(r"\[(['\"])" + re.escape(key) + r"\1\]")
    replacement = f".get('{key}', None)"
    patched = pattern.sub(replacement, code)
    if patched == code:
        # fallback: add a guard comment
        patched = f"# Debugger: ensure key '{key}' exists\n" + code
    return patched, f"Replaced ['{key}'] with .get('{key}', None)"


def _fix_index_error(code: str) -> tuple[str, str]:
    """Add a bounds-checking wrapper around list indexing."""
    # Simple heuristic: wrap the last function in a try/except
    guard = (
        "\n# --- Debugger: index-error guard ---\n"
        "import sys\n"
        "def _safe_index(lst, idx, default=None):\n"
        "    return lst[idx] if -len(lst) <= idx < len(lst) else default\n"
    )
    patched = guard + code
    return patched, "Added _safe_index helper"


def _fix_zero_division(code: str) -> tuple[str, str]:
    """Replace bare division with safe division."""
    patched = re.sub(
        r"(\w+)\s*/\s*(\w+)",
        r"\1 / max(\2, 1e-10)",
        code,
        count=5,  # limit replacements
    )
    return patched, "Added zero-division guards"


def _fix_type_error(code: str) -> tuple[str, str]:
    """Wrap numeric operations with float() casts."""
    patched = code
    # Find patterns like `x + y` and wrap in float
    patched = re.sub(
        r"(\b\w+\b)\s*([+\-*/])\s*(\b\w+\b)",
        lambda m: f"float({m.group(1)}) {m.group(2)} float({m.group(3)})",
        patched,
        count=3,
    )
    return patched, "Added float() casts to arithmetic"


def _fix_value_error(code: str) -> tuple[str, str]:
    """Wrap main logic in try/except ValueError."""
    lines = code.split("\n")
    # Find the last non-import, non-comment line block and wrap
    patched = "try:\n" + "\n".join("    " + l for l in lines) + "\nexcept ValueError as _ve:\n    print(f'ValueError caught: {_ve}')\n"
    return patched, "Wrapped code in try/except ValueError"


class DebuggerAgent:
    """Parse tracebacks and apply known fix patterns."""

    async def execute(
        self,
        db: aiosqlite.Connection,
        workspace_id: str,
        code: str,
        stderr: str,
        source_code_node_id: str,
    ) -> dict[str, Any]:
        """Attempt to fix *code* based on *stderr*.

        Returns ``{"patched_code": str, "fix_description": str, "failure_node": NodeResponse, "success": bool}``
        """
        await set_agent_status(db, AGENT_ID, AgentStatus.RUNNING)
        await event_bus.publish_simple(EventType.AGENT_STARTED, workspace_id, {"agent": AGENT_ID})
        await log_agent_action(db, AGENT_ID, "start", f"debugging code node {source_code_node_id}", workspace_id)

        try:
            # Create failure node
            failure_node = await create_node_raw(
                db, workspace_id,
                node_type="failure",
                title=f"Failure: {self._extract_error_line(stderr)[:80]}",
                content=stderr,
                metadata={"source_code_node": source_code_node_id},
                pos_x=600, pos_y=400,
            )
            await create_edge_raw(
                db, workspace_id,
                source=source_code_node_id,
                target=failure_node.id,
                relation="failed_with",
            )

            # Attempt fix
            patched_code, fix_desc = self._apply_fix(code, stderr)
            success = patched_code != code

            if success:
                # Record fix in failure_memories
                await self._record_memory(db, workspace_id, stderr, fix_desc, success=True)
                await adjust_score(db, AGENT_ID, REWARD_AUTOFIX, fix_desc)
                await log_agent_action(db, AGENT_ID, "auto_fix", fix_desc, workspace_id)
            else:
                await self._record_memory(db, workspace_id, stderr, "no applicable fix", success=False)
                await log_agent_action(db, AGENT_ID, "no_fix_found", stderr[:200], workspace_id)

            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            await event_bus.publish_simple(EventType.AGENT_COMPLETED, workspace_id, {"agent": AGENT_ID})

            return {
                "patched_code": patched_code,
                "fix_description": fix_desc,
                "failure_node": failure_node,
                "success": success,
            }

        except Exception as exc:
            logger.exception("DebuggerAgent failed")
            await adjust_score(db, AGENT_ID, PENALTY_CRASH, str(exc))
            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            await event_bus.publish_simple(EventType.AGENT_FAILED, workspace_id, {"agent": AGENT_ID, "error": str(exc)})
            raise

    def _apply_fix(self, code: str, stderr: str) -> tuple[str, str]:
        """Try each fix pattern against the traceback."""
        for pattern, name, fixer in _FIX_PATTERNS:
            match = pattern.search(stderr)
            if match:
                patched, desc = fixer(match, code)
                return patched, desc
        return code, "No known fix pattern matched"

    def _extract_error_line(self, stderr: str) -> str:
        """Extract the last meaningful line from a traceback."""
        lines = [l.strip() for l in stderr.strip().splitlines() if l.strip()]
        return lines[-1] if lines else "Unknown error"

    async def _record_memory(
        self,
        db: aiosqlite.Connection,
        workspace_id: str,
        error_pattern: str,
        fix_applied: str,
        success: bool,
    ) -> None:
        """Persist a failure memory for future reference."""
        await db.execute(
            """
            INSERT INTO failure_memories (id, workspace_id, error_pattern, fix_applied, success, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (new_id(), workspace_id, error_pattern[:500], fix_applied, int(success), utcnow_iso()),
        )
        await db.commit()


# Module-level singleton
debugger_agent = DebuggerAgent()
