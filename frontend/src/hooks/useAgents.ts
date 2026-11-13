import { useEffect, useState, useCallback } from 'react';
import { listAgents, pauseAgent, resumeAgent, approveAgent, rejectAgent } from '../api/agents';
import { useStore, useActions } from '../store/useStore';

export function useAgents() {
  const { state } = useStore();
  const actions = useActions();
  const [loading, setLoading] = useState(false);

  const fetchAgents = useCallback(async () => {
    if (!state.currentWorkspace) return;
    setLoading(true);
    try {
      const agents = await listAgents(state.currentWorkspace.id);
      actions.setAgents(agents);
    } catch {
      // Silently fail - agents panel will show empty
    } finally {
      setLoading(false);
    }
  }, [state.currentWorkspace?.id, actions]);

  const pause = useCallback(
    async (agentId: string) => {
      if (!state.currentWorkspace) return;
      const agent = await pauseAgent(state.currentWorkspace.id, agentId);
      actions.updateAgent(agent);
    },
    [state.currentWorkspace?.id, actions]
  );

  const resume = useCallback(
    async (agentId: string) => {
      if (!state.currentWorkspace) return;
      const agent = await resumeAgent(state.currentWorkspace.id, agentId);
      actions.updateAgent(agent);
    },
    [state.currentWorkspace?.id, actions]
  );

  const approve = useCallback(
    async (agentId: string) => {
      if (!state.currentWorkspace) return;
      const agent = await approveAgent(state.currentWorkspace.id, agentId);
      actions.updateAgent(agent);
    },
    [state.currentWorkspace?.id, actions]
  );

  const reject = useCallback(
    async (agentId: string) => {
      if (!state.currentWorkspace) return;
      const agent = await rejectAgent(state.currentWorkspace.id, agentId);
      actions.updateAgent(agent);
    },
    [state.currentWorkspace?.id, actions]
  );

  return {
    agents: state.agents,
    loading,
    fetchAgents,
    pause,
    resume,
    approve,
    reject,
  };
}
