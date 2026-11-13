import { BASE_URL } from './client';

export type SSEHandler = (event: MessageEvent) => void;

export interface SSEConnection {
  close: () => void;
}

export function connectSSE(
  workspaceId: string,
  onMessage: SSEHandler,
  onError?: (err: Event) => void,
  onOpen?: () => void
): SSEConnection {
  const url = `${BASE_URL}/api/workspaces/${workspaceId}/stream`;
  const source = new EventSource(url);

  source.onopen = () => {
    onOpen?.();
  };

  source.onmessage = (event) => {
    onMessage(event);
  };

  source.addEventListener('node_added', onMessage);
  source.addEventListener('node_updated', onMessage);
  source.addEventListener('edge_added', onMessage);
  source.addEventListener('agent_update', onMessage);
  source.addEventListener('thought', onMessage);

  source.onerror = (err) => {
    onError?.(err);
    if (source.readyState === EventSource.CLOSED) {
      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        connectSSE(workspaceId, onMessage, onError, onOpen);
      }, 3000);
    }
  };

  return {
    close: () => source.close(),
  };
}
