import { get, post } from './client';
import type { Agent } from '../types';

export function listAgents(workspaceId: string): Promise<Agent[]> {
  return get<Agent[]>(`/api/workspaces/${workspaceId}/agents`);
}

export function pauseAgent(workspaceId: string, agentId: string): Promise<Agent> {
  return post<Agent>(`/api/workspaces/${workspaceId}/agents/${agentId}/pause`);
}

export function resumeAgent(workspaceId: string, agentId: string): Promise<Agent> {
  return post<Agent>(`/api/workspaces/${workspaceId}/agents/${agentId}/resume`);
}

export function approveAgent(workspaceId: string, agentId: string): Promise<Agent> {
  return post<Agent>(`/api/workspaces/${workspaceId}/agents/${agentId}/approve`);
}

export function rejectAgent(workspaceId: string, agentId: string): Promise<Agent> {
  return post<Agent>(`/api/workspaces/${workspaceId}/agents/${agentId}/reject`);
}
