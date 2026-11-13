import { useEffect, useState, useCallback } from 'react';
import { listWorkspaces, createWorkspace, getWorkspace } from '../api/workspaces';
import { useStore, useActions } from '../store/useStore';
import type { Workspace } from '../types';

export function useWorkspace() {
  const { state } = useStore();
  const actions = useActions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ws = await listWorkspaces();
      actions.setWorkspaces(ws);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  }, [actions]);

  const selectWorkspace = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const ws = await getWorkspace(id);
        actions.setCurrentWorkspace(ws);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workspace');
      } finally {
        setLoading(false);
      }
    },
    [actions]
  );

  const create = useCallback(
    async (name: string, description?: string) => {
      setLoading(true);
      try {
        const ws = await createWorkspace(name, description);
        actions.setWorkspaces([...state.workspaces, ws]);
        actions.setCurrentWorkspace(ws);
        return ws;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create workspace');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [actions, state.workspaces]
  );

  return {
    workspaces: state.workspaces,
    currentWorkspace: state.currentWorkspace,
    loading,
    error,
    fetchWorkspaces,
    selectWorkspace,
    createWorkspace: create,
  };
}
