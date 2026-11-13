import React, { useEffect } from 'react';
import { useSynapseStore } from './store/synapseStore';
import LandingPage from './components/Landing/LandingPage';
import WorkspacePage from './components/Workspace/WorkspacePage';
import AutoDemoModal from './components/Modals/AutoDemoModal';
import BreakItModal from './components/Modals/BreakItModal';
import WhatIfModal from './components/Modals/WhatIfModal';
import CommandPalette from './components/Modals/CommandPalette';
import ExportModal from './components/Modals/ExportModal';
import ShortcutsModal from './components/Modals/ShortcutsModal';
import PromptDiffModal from './components/Modals/PromptDiffModal';
import ToastContainer from './components/shared/ToastContainer';

export default function App() {
  const activePage = useSynapseStore((s) => s.activePage);
  const currentWorkspaceId = useSynapseStore((s) => s.currentWorkspaceId);
  const addThought = useSynapseStore((s) => s.addThought);
  const setMetrics = useSynapseStore((s) => s.setMetrics);
  const updateAgentScore = useSynapseStore((s) => s.updateAgentScore);
  const isPlayingTimeline = useSynapseStore((s) => s.isPlayingTimeline);
  const setIsPlayingTimeline = useSynapseStore((s) => s.setIsPlayingTimeline);
  const setIsAutoDemoOpen = useSynapseStore((s) => s.setIsAutoDemoOpen);
  const setIsBreakItModalOpen = useSynapseStore((s) => s.setIsBreakItModalOpen);
  const setIsWhatIfOpen = useSynapseStore((s) => s.setIsWhatIfOpen);
  const setIsShortcutsOpen = useSynapseStore((s) => s.setIsShortcutsOpen);
  const setActiveRightTab = useSynapseStore((s) => s.setActiveRightTab);
  const triggerLayout = useSynapseStore((s) => s.triggerLayout);

  // SSE Metrics Connection
  useEffect(() => {
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource('http://localhost:8000/api/metrics/stream');
      evtSource.addEventListener('metrics_tick', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          setMetrics(data);
        } catch {}
      });
    } catch {}

    return () => {
      evtSource?.close();
    };
  }, [setMetrics]);

  // SSE Workspace Events Connection
  useEffect(() => {
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource(`http://localhost:8000/api/workspaces/${currentWorkspaceId}/stream`);

      const handleEvent = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.payload?.message) {
            addThought({
              id: `thought_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toLocaleTimeString(),
              agent_id: data.payload.agent || 'controller',
              agent_name: data.payload.agent ? `${data.payload.agent.toUpperCase()} Agent` : 'System Controller',
              phase: data.payload.phase || 'Execution Step',
              reasoning: data.payload.message,
              status: 'completed',
              latency_ms: 180 + Math.floor(Math.random() * 80),
              delta: data.payload.reward_delta,
            });
          }
          if (data.payload?.new_score !== undefined && data.payload?.agent_id) {
            updateAgentScore(data.payload.agent_id, data.payload.new_score, data.payload.delta || 0);
          }
        } catch {}
      };

      evtSource.addEventListener('agent_started', handleEvent);
      evtSource.addEventListener('agent_completed', handleEvent);
      evtSource.addEventListener('agent_failed', handleEvent);
      evtSource.addEventListener('experiment_started', handleEvent);
      evtSource.addEventListener('experiment_completed', handleEvent);
    } catch {}

    return () => {
      evtSource?.close();
    };
  }, [currentWorkspaceId, addThought, updateAgentScore]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlayingTimeline(!isPlayingTimeline);
      } else if (e.key.toLowerCase() === 'd') {
        setIsAutoDemoOpen(true);
      } else if (e.key.toLowerCase() === 'b') {
        setIsBreakItModalOpen(true);
      } else if (e.key.toLowerCase() === 'w') {
        setIsWhatIfOpen(true);
      } else if (e.key.toLowerCase() === 'l') {
        triggerLayout();
      } else if (e.key === '1') {
        setActiveRightTab('thoughts');
      } else if (e.key === '2') {
        setActiveRightTab('arena');
      } else if (e.key === '3') {
        setActiveRightTab('inspector');
      } else if (e.key === '4') {
        setActiveRightTab('insights');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlayingTimeline,
    setIsPlayingTimeline,
    setIsAutoDemoOpen,
    setIsBreakItModalOpen,
    setIsWhatIfOpen,
    triggerLayout,
    setActiveRightTab,
  ]);

  return (
    <div className="w-full h-full min-h-screen bg-[#07080C] text-white">
      {/* Active Page View */}
      {activePage === 'landing' ? <LandingPage /> : <WorkspacePage />}

      {/* Global Modals & Overlays */}
      <AutoDemoModal />
      <BreakItModal />
      <WhatIfModal />
      <CommandPalette />
      <ExportModal />
      <ShortcutsModal />
      <PromptDiffModal />
      <ToastContainer />
    </div>
  );
}
