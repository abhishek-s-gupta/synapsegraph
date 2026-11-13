"""Critic Agent — validates experiment results against expected ranges.

Compares numeric outputs from sandboxed execution against baseline ranges.
No external LLM calls.
"""

from __future__ import annotations

import logging
import re
from typing import Any

import aiosqlite

from agents.registry import (
    REWARD_SUCCESS,
    PENALTY_CRASH,
    adjust_score,
    log_agent_action,
    set_agent_status,
)
from models.agent import AgentRole, AgentStatus
from models.telemetry import EventType
from models.workspace import NodeResponse
from services.event_bus import event_bus
from services.graph_service import create_edge_raw, create_node_raw
from utils.helpers import safe_float

logger = logging.getLogger(__name__)

AGENT_ID = AgentRole.CRITIC.value

# Expected ranges for common metrics (name -> (low, high))
_EXPECTED_RANGES: dict[str, tuple[float, float]] = {
    "accuracy": (0.0, 1.0),
    "simulated_accuracy": (0.0, 1.0),
    "loss": (0.0, 10.0),
    "simulated_loss": (0.0, 10.0),
    "f1": (0.0, 1.0),
    "precision": (0.0, 1.0),
    "recall": (0.0, 1.0),
    "bleu": (0.0, 100.0),
    "rouge": (0.0, 1.0),
    "mean": (-100.0, 100.0),
    "std_dev": (0.0, 100.0),
    "mse": (0.0, 1000.0),
    "rmse": (0.0, 100.0),
    "r2": (-1.0, 1.0),
}


class CriticAgent:
    """Validate experiment outputs against expected metric ranges."""

    async def execute(
        self,
        db: aiosqlite.Connection,
        workspace_id: str,
        stdout: str,
        source_code_node_id: str,
    ) -> dict[str, Any]:
        """Validate *stdout* from a sandbox run.

        Returns ``{"result_node": NodeResponse, "validation": dict, "passed": bool}``
        """
        await set_agent_status(db, AGENT_ID, AgentStatus.RUNNING)
        await event_bus.publish_simple(EventType.AGENT_STARTED, workspace_id, {"agent": AGENT_ID})
        await log_agent_action(db, AGENT_ID, "start", f"validating output of {source_code_node_id}", workspace_id)

        try:
            metrics = self._parse_metrics(stdout)
            validation = self._validate_metrics(metrics)
            passed = all(v["in_range"] for v in validation.values()) and len(validation) > 0

            result_node = await create_node_raw(
                db, workspace_id,
                node_type="result",
                title=f"Result: {'PASS' if passed else 'FAIL'}",
                content=stdout,
                metadata={
                    "metrics": metrics,
                    "validation": validation,
                    "passed": passed,
                    "source_code_node": source_code_node_id,
                },
                pos_x=600, pos_y=600,
            )

            relation = "supports" if passed else "contradicts"
            await create_edge_raw(
                db, workspace_id,
                source=source_code_node_id,
                target=result_node.id,
                relation=relation,
            )

            await adjust_score(db, AGENT_ID, REWARD_SUCCESS, f"validation {'passed' if passed else 'failed'}")
            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            await event_bus.publish_simple(EventType.AGENT_COMPLETED, workspace_id, {"agent": AGENT_ID})
            await log_agent_action(db, AGENT_ID, "complete", f"passed={passed}", workspace_id)

            return {
                "result_node": result_node,
                "validation": validation,
                "passed": passed,
            }

        except Exception as exc:
            logger.exception("CriticAgent failed")
            await adjust_score(db, AGENT_ID, PENALTY_CRASH, str(exc))
            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            await event_bus.publish_simple(EventType.AGENT_FAILED, workspace_id, {"agent": AGENT_ID, "error": str(exc)})
            raise

    def _parse_metrics(self, stdout: str) -> dict[str, float]:
        """Extract key: value pairs from stdout."""
        metrics: dict[str, float] = {}
        for line in stdout.strip().splitlines():
            # Match patterns like "accuracy: 0.95" or "loss = 0.12"
            m = re.match(r"^\s*([a-zA-Z_][\w]*)\s*[:=]\s*([0-9eE.+\-]+)\s*$", line)
            if m:
                key = m.group(1).lower()
                val = safe_float(m.group(2))
                metrics[key] = val
        return metrics

    def _validate_metrics(self, metrics: dict[str, float]) -> dict[str, dict[str, Any]]:
        """Check each metric against expected ranges."""
        results: dict[str, dict[str, Any]] = {}
        for name, value in metrics.items():
            expected = _EXPECTED_RANGES.get(name)
            if expected:
                low, high = expected
                in_range = low <= value <= high
                results[name] = {
                    "value": value,
                    "expected_low": low,
                    "expected_high": high,
                    "in_range": in_range,
                }
            else:
                # Unknown metric — accept by default
                results[name] = {
                    "value": value,
                    "expected_low": None,
                    "expected_high": None,
                    "in_range": True,
                }
        return results


# Module-level singleton
critic_agent = CriticAgent()
