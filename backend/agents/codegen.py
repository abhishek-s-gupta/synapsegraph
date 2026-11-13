"""Code-Gen Agent — generates Python scripts from paper methodology.

Uses template-based code generation with method / dataset placeholders.
No external LLM calls.
"""

from __future__ import annotations

import logging
import random
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
from services.graph_service import create_edge_raw, create_node_raw, get_node
from services.paper_parser import DEMO_CODE_TEMPLATE
from utils.helpers import utcnow_iso

logger = logging.getLogger(__name__)

AGENT_ID = AgentRole.CODEGEN.value


class CodeGenAgent:
    """Generate executable Python code from a paper node's methodology."""

    async def execute(
        self,
        db: aiosqlite.Connection,
        workspace_id: str,
        source_node_id: str,
    ) -> dict[str, Any]:
        """Generate a code node linked to *source_node_id*.

        Returns ``{"code_node": NodeResponse, "code": str}``
        """
        await set_agent_status(db, AGENT_ID, AgentStatus.RUNNING)
        await event_bus.publish_simple(EventType.AGENT_STARTED, workspace_id, {"agent": AGENT_ID})
        await log_agent_action(db, AGENT_ID, "start", f"source={source_node_id}", workspace_id)

        try:
            source_node = await get_node(db, source_node_id)
            if source_node is None:
                raise ValueError(f"Source node {source_node_id} not found")

            code = self._generate_code(source_node)

            code_node = await create_node_raw(
                db, workspace_id,
                node_type="code",
                title=f"Experiment: {source_node.title[:60]}",
                content=code,
                metadata={
                    "source_node": source_node_id,
                    "language": "python",
                    "auto_generated": True,
                },
                pos_x=source_node.position.x + 300,
                pos_y=source_node.position.y,
            )

            await create_edge_raw(
                db, workspace_id,
                source=source_node_id,
                target=code_node.id,
                relation="generates_code",
            )

            await adjust_score(db, AGENT_ID, REWARD_SUCCESS, "code generated")
            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            await event_bus.publish_simple(EventType.AGENT_COMPLETED, workspace_id, {"agent": AGENT_ID})
            await log_agent_action(db, AGENT_ID, "complete", f"code_node={code_node.id}", workspace_id)

            return {"code_node": code_node, "code": code}

        except Exception as exc:
            logger.exception("CodeGenAgent failed")
            await adjust_score(db, AGENT_ID, PENALTY_CRASH, str(exc))
            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            await event_bus.publish_simple(EventType.AGENT_FAILED, workspace_id, {"agent": AGENT_ID, "error": str(exc)})
            raise

    def _generate_code(self, source_node: NodeResponse) -> str:
        """Template-based code generation."""
        meta = source_node.metadata
        methods = meta.get("methods", ["Default Method"])
        datasets = meta.get("datasets", ["Synthetic Data"])
        title = source_node.title

        method = methods[0] if methods else "Default Method"
        dataset = datasets[0] if datasets else "Synthetic Data"
        data_size = random.choice([100, 500, 1000, 2000])

        return DEMO_CODE_TEMPLATE.format(
            title=title,
            dataset=dataset,
            data_size=data_size,
            method=method,
        )


# Module-level singleton
codegen_agent = CodeGenAgent()
