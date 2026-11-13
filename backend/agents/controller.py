"""Controller Agent — DAG decomposition and task dispatch.

Orchestrates the full reproduce pipeline:
  1. CodeGen generates a script
  2. Sandbox executes it
  3. On failure → Debugger patches → re-execute (up to max_retries)
  4. Critic validates the final output
"""

from __future__ import annotations

import logging
from typing import Any

import aiosqlite

from agents.codegen import codegen_agent
from agents.critic import critic_agent
from agents.debugger import debugger_agent
from agents.registry import (
    REWARD_SUCCESS,
    PENALTY_CRASH,
    adjust_score,
    log_agent_action,
    set_agent_status,
)
from config import settings
from models.agent import AgentRole, AgentStatus
from models.telemetry import EventType
from models.workspace import EdgeResponse, NodeResponse
from services.event_bus import event_bus
from services.graph_service import create_edge_raw, create_node_raw, get_node
from services.sandbox import run_in_sandbox

logger = logging.getLogger(__name__)

AGENT_ID = AgentRole.CONTROLLER.value


class ControllerAgent:
    """Top-level orchestrator that decomposes reproduce / what-if tasks into
    a DAG of sub-tasks dispatched to specialist agents.
    """

    async def run_reproduce(
        self,
        db: aiosqlite.Connection,
        workspace_id: str,
        node_id: str,
    ) -> dict[str, Any]:
        """Full reproduce pipeline.

        Returns ``{"nodes": [...], "edges": [...], "success": bool, "message": str, "attempts": int}``
        """
        await set_agent_status(db, AGENT_ID, AgentStatus.RUNNING)
        await event_bus.publish_simple(EventType.EXPERIMENT_STARTED, workspace_id, {"agent": AGENT_ID, "node_id": node_id})
        await log_agent_action(db, AGENT_ID, "reproduce_start", f"node={node_id}", workspace_id)

        all_nodes: list[NodeResponse] = []
        all_edges: list[EdgeResponse] = []
        max_retries = settings.agent_max_retries
        success = False
        attempts = 0

        try:
            source_node = await get_node(db, node_id)
            if source_node is None:
                raise ValueError(f"Node {node_id} not found")

            # Step 1: Code generation
            codegen_result = await codegen_agent.execute(db, workspace_id, node_id)
            code_node: NodeResponse = codegen_result["code_node"]
            code: str = codegen_result["code"]
            all_nodes.append(code_node)

            # Step 2: Execute + debug loop
            current_code = code
            current_code_node_id = code_node.id

            for attempt in range(1, max_retries + 1):
                attempts = attempt
                await log_agent_action(db, AGENT_ID, "sandbox_run", f"attempt {attempt}", workspace_id)

                sandbox_result = await run_in_sandbox(current_code)

                if sandbox_result.return_code == 0 and not sandbox_result.timed_out:
                    # Success — validate with Critic
                    critic_result = await critic_agent.execute(
                        db, workspace_id, sandbox_result.stdout, current_code_node_id
                    )
                    all_nodes.append(critic_result["result_node"])
                    success = critic_result["passed"]
                    break

                # Failure — send to Debugger
                debug_result = await debugger_agent.execute(
                    db, workspace_id,
                    current_code, sandbox_result.stderr,
                    current_code_node_id,
                )
                all_nodes.append(debug_result["failure_node"])

                if not debug_result["success"]:
                    # No fix found
                    break

                # Create patched code node
                patched_node = await create_node_raw(
                    db, workspace_id,
                    node_type="code",
                    title=f"Patched (attempt {attempt}): {source_node.title[:50]}",
                    content=debug_result["patched_code"],
                    metadata={
                        "attempt": attempt,
                        "fix": debug_result["fix_description"],
                        "auto_patched": True,
                    },
                    pos_x=code_node.position.x,
                    pos_y=code_node.position.y + attempt * 120,
                )
                all_nodes.append(patched_node)

                patch_edge = await create_edge_raw(
                    db, workspace_id,
                    source=current_code_node_id,
                    target=patched_node.id,
                    relation="patched_to",
                )
                all_edges.append(patch_edge)

                current_code = debug_result["patched_code"]
                current_code_node_id = patched_node.id

            # Reward / penalise controller
            if success:
                await adjust_score(db, AGENT_ID, REWARD_SUCCESS, "reproduce succeeded")
            else:
                await adjust_score(db, AGENT_ID, PENALTY_CRASH, "reproduce failed after retries")

            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            event_type = EventType.EXPERIMENT_COMPLETED
            await event_bus.publish_simple(event_type, workspace_id, {
                "agent": AGENT_ID, "success": success, "attempts": attempts,
            })
            await log_agent_action(db, AGENT_ID, "reproduce_complete", f"success={success} attempts={attempts}", workspace_id)

            msg = f"Reproduce {'succeeded' if success else 'failed'} after {attempts} attempt(s)"
            return {
                "nodes": all_nodes,
                "edges": all_edges,
                "success": success,
                "message": msg,
                "attempts": attempts,
            }

        except Exception as exc:
            logger.exception("ControllerAgent reproduce failed")
            await adjust_score(db, AGENT_ID, PENALTY_CRASH, str(exc))
            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            await event_bus.publish_simple(EventType.AGENT_FAILED, workspace_id, {"agent": AGENT_ID, "error": str(exc)})
            raise

    async def run_what_if(
        self,
        db: aiosqlite.Connection,
        workspace_id: str,
        node_id: str,
        parameter_mods: dict[str, Any],
    ) -> dict[str, Any]:
        """Fork a result node with modified parameters and re-run.

        Returns ``{"forked_node": NodeResponse, "edges": [...], "message": str}``
        """
        await set_agent_status(db, AGENT_ID, AgentStatus.RUNNING)
        await log_agent_action(db, AGENT_ID, "whatif_start", f"node={node_id} mods={parameter_mods}", workspace_id)

        try:
            source = await get_node(db, node_id)
            if source is None:
                raise ValueError(f"Node {node_id} not found")

            # Build modified code
            original_content = source.content
            modified_content = original_content
            for param, value in parameter_mods.items():
                # Replace variable assignments in code
                pattern = re.compile(rf"^(\s*{re.escape(param)}\s*=\s*)(.+)$", re.MULTILINE)
                import re as _re
                if pattern.search(modified_content):
                    modified_content = pattern.sub(rf"\g<1>{value}", modified_content)
                else:
                    # Prepend as variable
                    modified_content = f"{param} = {value}\n" + modified_content

            # Create forked node
            forked = await create_node_raw(
                db, workspace_id,
                node_type=source.type.value if hasattr(source.type, 'value') else source.type,
                title=f"What-If: {source.title[:60]}",
                content=modified_content,
                metadata={
                    **source.metadata,
                    "what_if_parent": node_id,
                    "parameter_mods": parameter_mods,
                },
                pos_x=source.position.x + 350,
                pos_y=source.position.y,
            )

            edge = await create_edge_raw(
                db, workspace_id,
                source=node_id,
                target=forked.id,
                relation="what_if_branch",
                metadata={"parameter_mods": parameter_mods},
            )

            # If the forked node is code, execute it
            result_nodes: list[NodeResponse] = []
            if source.type in ("code", "result"):
                sandbox_result = await run_in_sandbox(modified_content)
                if sandbox_result.return_code == 0:
                    result_node = await create_node_raw(
                        db, workspace_id,
                        node_type="result",
                        title=f"What-If Result",
                        content=sandbox_result.stdout,
                        metadata={"what_if_parent": node_id, "parameter_mods": parameter_mods},
                        pos_x=forked.position.x,
                        pos_y=forked.position.y + 150,
                    )
                    result_nodes.append(result_node)
                    await create_edge_raw(
                        db, workspace_id,
                        source=forked.id,
                        target=result_node.id,
                        relation="supports",
                    )

            await adjust_score(db, AGENT_ID, REWARD_SUCCESS, "what-if completed")
            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            await log_agent_action(db, AGENT_ID, "whatif_complete", f"forked={forked.id}", workspace_id)

            return {
                "forked_node": forked,
                "edges": [edge],
                "result_nodes": result_nodes,
                "message": f"Created what-if branch from {node_id}",
            }

        except Exception as exc:
            logger.exception("ControllerAgent what-if failed")
            await adjust_score(db, AGENT_ID, PENALTY_CRASH, str(exc))
            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            raise


# Need re for what_if
import re

# Module-level singleton
controller_agent = ControllerAgent()
