import { get, post, del } from './client';
import type { Workspace, IngestRequest } from '../types';

export function listWorkspaces(): Promise<Workspace[]> {
  return get<Workspace[]>('/api/workspaces');
}

export function getWorkspace(id: string): Promise<Workspace> {
  return get<Workspace>(`/api/workspaces/${id}`);
}

export function createWorkspace(name: string, description?: string): Promise<Workspace> {
  return post<Workspace>('/api/workspaces', { name, description });
}

export function deleteWorkspace(id: string): Promise<void> {
  return del<void>(`/api/workspaces/${id}`);
}

export function ingestToWorkspace(
  workspaceId: string,
  req: IngestRequest
): Promise<{ nodeId: string }> {
  return post<{ nodeId: string }>(`/api/workspaces/${workspaceId}/ingest`, req);
}

export function getWorkspaceNodes(workspaceId: string): Promise<unknown[]> {
  return get<unknown[]>(`/api/workspaces/${workspaceId}/nodes`);
}

export function getWorkspaceEdges(workspaceId: string): Promise<unknown[]> {
  return get<unknown[]>(`/api/workspaces/${workspaceId}/edges`);
}
