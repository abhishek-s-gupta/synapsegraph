import { useEffect, useRef } from 'react';
import { connectSSE, type SSEConnection } from '../api/sse';
import { useStore, useActions } from '../store/useStore';
import type { KnowledgeNodeData, KnowledgeEdgeData, TimelineEvent } from '../types';
import type { Node, Edge } from '@xyflow/react';

export function useSSE() {
  const { state } = useStore();
  const actions = useActions();
  const connectionRef = useRef<SSEConnection | null>(null);

  useEffect(() => {
    if (!state.currentWorkspace) {
      connectionRef.current?.close();
      connectionRef.current = null;
      actions.setSSEConnected(false);
      return;
    }

    const workspaceId = state.currentWorkspace.id;

    connectionRef.current = connectSSE(
      workspaceId,
      (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (event.type) {
            case 'node_added': {
              const node: Node<KnowledgeNodeData> = {
                id: data.id,
                type: data.kind,
                position: data.position ?? { x: Math.random() * 800, y: Math.random() * 600 },
                data: data,
              };
              actions.addNode(node);
              break;
            }
            case 'node_updated':
              actions.updateNode(data.id, data);
              break;
            case 'edge_added': {
              const edge: Edge<KnowledgeEdgeData> = {
                id: data.id ?? `${data.source}-${data.target}`,
                source: data.source,
                target: data.target,
                type: 'custom',
                data: { relation: data.relation, weight: data.weight, label: data.label },
              };
              actions.addEdge(edge);
              break;
            }
            case 'agent_update':
              actions.updateAgent(data);
              break;
            case 'thought': {
              const evt: TimelineEvent = {
                id: data.id ?? crypto.randomUUID(),
                timestamp: data.timestamp ?? new Date().toISOString(),
                agentName: data.agentName ?? 'System',
                agentColor: data.agentColor ?? '#94a3b8',
                action: data.action ?? data.message ?? '',
                nodeId: data.nodeId,
                duration: data.duration,
                kind: data.kind ?? 'system',
              };
              actions.addEvent(evt);
              break;
            }
            default: {
              // generic message event
              if (data.type === 'thought' || data.type === 'event') {
                const evt: TimelineEvent = {
                  id: data.id ?? crypto.randomUUID(),
                  timestamp: data.timestamp ?? new Date().toISOString(),
                  agentName: data.agentName ?? 'System',
                  agentColor: data.agentColor ?? '#94a3b8',
                  action: data.action ?? data.message ?? '',
                  nodeId: data.nodeId,
                  duration: data.duration,
                  kind: data.kind ?? 'system',
                };
                actions.addEvent(evt);
              }
            }
          }
        } catch {
          // Ignore parse errors for non-JSON messages
        }
      },
      () => {
        actions.setSSEConnected(false);
      },
      () => {
        actions.setSSEConnected(true);
      }
    );

    return () => {
      connectionRef.current?.close();
      connectionRef.current = null;
    };
  }, [state.currentWorkspace?.id]);

  return { connected: state.sseConnected };
}
