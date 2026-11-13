"""Reader Agent — parses papers, extracts entities, creates graph nodes/edges.

Uses heuristic NLP (regex, keyword extraction, sentence splitting) — no external
LLM calls.
"""

from __future__ import annotations

import logging
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
from models.workspace import EdgeResponse, NodeResponse
from services.event_bus import event_bus
from services.graph_service import create_edge_raw, create_node_raw
from services.paper_parser import ParsedPaper, parse_input
from utils.helpers import utcnow_iso

logger = logging.getLogger(__name__)

AGENT_ID = AgentRole.READER.value


class ReaderAgent:
    """Parse input text and populate the knowledge graph."""

    async def execute(
        self,
        db: aiosqlite.Connection,
        workspace_id: str,
        input_type: str,
        content: str,
    ) -> dict[str, Any]:
        """Main entry-point.

        Returns ``{"nodes": [...], "edges": [...], "message": str}``
        """
        await set_agent_status(db, AGENT_ID, AgentStatus.RUNNING)
        await event_bus.publish_simple(EventType.AGENT_STARTED, workspace_id, {"agent": AGENT_ID})
        await log_agent_action(db, AGENT_ID, "start", f"input_type={input_type}", workspace_id)

        try:
            parsed = parse_input(input_type, content)
            nodes, edges = await self._build_graph(db, workspace_id, parsed, input_type)

            await adjust_score(db, AGENT_ID, REWARD_SUCCESS, "successful parse")
            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            await event_bus.publish_simple(EventType.AGENT_COMPLETED, workspace_id, {"agent": AGENT_ID})
            await log_agent_action(db, AGENT_ID, "complete", f"nodes={len(nodes)} edges={len(edges)}", workspace_id)

            return {
                "nodes": nodes,
                "edges": edges,
                "message": f"Created {len(nodes)} nodes and {len(edges)} edges",
            }
        except Exception as exc:
            logger.exception("ReaderAgent failed")
            await adjust_score(db, AGENT_ID, PENALTY_CRASH, str(exc))
            await set_agent_status(db, AGENT_ID, AgentStatus.IDLE)
            await event_bus.publish_simple(EventType.AGENT_FAILED, workspace_id, {"agent": AGENT_ID, "error": str(exc)})
            raise

    async def _build_graph(
        self,
        db: aiosqlite.Connection,
        workspace_id: str,
        parsed: ParsedPaper,
        input_type: str,
    ) -> tuple[list[NodeResponse], list[EdgeResponse]]:
        nodes: list[NodeResponse] = []
        edges: list[EdgeResponse] = []
        y_offset = 0.0

        # 1. Primary node (paper or question)
        if input_type == "question":
            primary = await create_node_raw(
                db, workspace_id,
                node_type="question",
                title=parsed.title,
                content=parsed.abstract,
                metadata={"keywords": parsed.keywords},
                pos_x=400, pos_y=y_offset,
            )
        else:
            primary = await create_node_raw(
                db, workspace_id,
                node_type="paper",
                title=parsed.title,
                content=parsed.abstract,
                metadata={
                    "authors": parsed.authors,
                    "keywords": parsed.keywords,
                    "key_claims": parsed.key_claims,
                    "methods": parsed.methods,
                },
                pos_x=400, pos_y=y_offset,
            )
        nodes.append(primary)
        y_offset += 150

        # 2. Dataset nodes
        for i, ds_name in enumerate(parsed.datasets):
            ds_node = await create_node_raw(
                db, workspace_id,
                node_type="dataset",
                title=ds_name,
                content=f"Dataset referenced in: {parsed.title}",
                metadata={"source_paper": primary.id},
                pos_x=200 + i * 200, pos_y=y_offset,
            )
            nodes.append(ds_node)
            edge = await create_edge_raw(
                db, workspace_id,
                source=primary.id,
                target=ds_node.id,
                relation="cites",
            )
            edges.append(edge)

        y_offset += 150

        # 3. Key-claim nodes (each claim becomes a support/contradict link)
        for i, claim in enumerate(parsed.key_claims):
            claim_node = await create_node_raw(
                db, workspace_id,
                node_type="result",
                title=f"Claim: {claim[:80]}",
                content=claim,
                metadata={"claim_index": i},
                pos_x=100 + i * 220, pos_y=y_offset,
            )
            nodes.append(claim_node)
            edge = await create_edge_raw(
                db, workspace_id,
                source=primary.id,
                target=claim_node.id,
                relation="supports",
            )
            edges.append(edge)

        y_offset += 150

        # 4. Auto-generate edges between dataset nodes and claim nodes
        # based on keyword overlap
        dataset_nodes = [n for n in nodes if n.type == "dataset"]
        claim_nodes = [n for n in nodes if n.type == "result"]
        for dn in dataset_nodes:
            dn_words = set(dn.title.lower().split())
            for cn in claim_nodes:
                cn_words = set(cn.content.lower().split())
                if dn_words & cn_words:
                    edge = await create_edge_raw(
                        db, workspace_id,
                        source=dn.id,
                        target=cn.id,
                        relation="supports",
                        metadata={"auto_linked": True},
                    )
                    edges.append(edge)

        return nodes, edges


# Module-level singleton
reader_agent = ReaderAgent()
