"""In-memory asyncio event bus for SSE broadcasting."""

from __future__ import annotations

import asyncio
import logging
from typing import AsyncGenerator

from models.telemetry import EventType, SSEEvent
from utils.helpers import utcnow_iso

logger = logging.getLogger(__name__)


class EventBus:
    """Simple publish / subscribe event bus backed by asyncio.Queue.

    Each SSE client gets its own queue.  ``publish`` pushes to every
    active subscriber queue.
    """

    def __init__(self) -> None:
        self._subscribers: dict[str, asyncio.Queue[SSEEvent]] = {}

    def subscribe(self, subscriber_id: str) -> asyncio.Queue[SSEEvent]:
        """Register a new subscriber and return its queue."""
        q: asyncio.Queue[SSEEvent] = asyncio.Queue()
        self._subscribers[subscriber_id] = q
        logger.debug("Subscriber %s connected (total=%d)", subscriber_id, len(self._subscribers))
        return q

    def unsubscribe(self, subscriber_id: str) -> None:
        """Remove a subscriber."""
        self._subscribers.pop(subscriber_id, None)
        logger.debug("Subscriber %s disconnected (total=%d)", subscriber_id, len(self._subscribers))

    async def publish(self, event: SSEEvent) -> None:
        """Broadcast an event to all subscribers."""
        if not event.timestamp:
            event.timestamp = utcnow_iso()
        for sid, q in list(self._subscribers.items()):
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                logger.warning("Queue full for subscriber %s — dropping event", sid)

    async def publish_simple(
        self,
        event_type: EventType,
        workspace_id: str,
        payload: dict | None = None,
    ) -> None:
        """Convenience wrapper to publish a simple event."""
        await self.publish(
            SSEEvent(
                event_type=event_type,
                workspace_id=workspace_id,
                payload=payload or {},
                timestamp=utcnow_iso(),
            )
        )

    async def iter_events(
        self, subscriber_id: str
    ) -> AsyncGenerator[SSEEvent, None]:
        """Async generator that yields events for a subscriber."""
        q = self._subscribers.get(subscriber_id)
        if q is None:
            return
        try:
            while True:
                event = await q.get()
                yield event
        except asyncio.CancelledError:
            return
        finally:
            self.unsubscribe(subscriber_id)


# Global singleton
event_bus = EventBus()
