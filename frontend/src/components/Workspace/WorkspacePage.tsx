import React, { useEffect, useState } from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import GraphCanvas from '../Canvas/GraphCanvas';
import ThoughtStream from '../Panels/ThoughtStream';
import AgentPanel from '../Panels/AgentPanel';
import NodeDetailPanel from '../Panels/NodeDetailPanel';
import InsightsPanel from '../Panels/InsightsPanel';
import TimelineSlider from '../Panels/TimelineSlider';
import VoiceButton from '../shared/VoiceButton';
import {
  Activity,
  Flame,
  Play,
  Search,
  Download,
  HelpCircle,
  FolderGit2,
  ChevronRight,
  ChevronLeft,
  Tag,
  Sparkles,
  Bot,
  Terminal,
  Layers,
  ArrowLeft,
  Users,
  Plus,
} from 'lucide-react';

export default function WorkspacePage() {
  const setActivePage = useSynapseStore((s) => s.setActivePage);
  const currentWorkspaceId = useSynapseStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspaceId = useSynapseStore((s) => s.setCurrentWorkspaceId);
  const workspaces = useSynapseStore((s) => s.workspaces);
  const setWorkspaces = useSynapseStore((s) => s.setWorkspaces);
  const setNodes = useSynapseStore((s) => s.setNodes);
  const setEdges = useSynapseStore((s) => s.setEdges);
  const setAgents = useSynapseStore((s) => s.setAgents);
  const nodes = useSynapseStore((s) => s.nodes);
  const edges = useSynapseStore((s) => s.edges);

  const activeRightTab = useSynapseStore((s) => s.activeRightTab);
  const setActiveRightTab = useSynapseStore((s) => s.setActiveRightTab);
  const rightPanelOpen = useSynapseStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useSynapseStore((s) => s.toggleRightPanel);

  const setIsAutoDemoOpen = useSynapseStore((s) => s.setIsAutoDemoOpen);
  const setIsBreakItModalOpen = useSynapseStore((s) => s.setIsBreakItModalOpen);
  const setIsExportModalOpen = useSynapseStore((s) => s.setIsExportModalOpen);
  const setIsCommandPaletteOpen = useSynapseStore((s) => s.setIsCommandPaletteOpen);
  const setIsShortcutsOpen = useSynapseStore((s) => s.setIsShortcutsOpen);
  const selectedTagFilter = useSynapseStore((s) => s.selectedTagFilter);
  const setSelectedTagFilter = useSynapseStore((s) => s.setSelectedTagFilter);
  const addToast = useSynapseStore((s) => s.addToast);

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  // Fetch workspaces & active workspace details on mount / id change
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const wsRes = await fetch('http://localhost:8000/api/workspaces');
        const wsList = await wsRes.json();
        setWorkspaces(wsList);

        const detailRes = await fetch(`http://localhost:8000/api/workspaces/${currentWorkspaceId}`);
        const detail = await detailRes.json();

        if (detail.nodes) {
          const reactFlowNodes = detail.nodes.map((n: any) => ({
            id: n.id,
            type: n.type,
            position: n.position || { x: 100, y: 100 },
            data: n,
          }));
          setNodes(reactFlowNodes);
        }

        if (detail.edges) {
          const reactFlowEdges = detail.edges.map((e: any) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: 'custom',
            data: e,
          }));
          setEdges(reactFlowEdges);
        }

        if (detail.agents) {
          setAgents(detail.agents);
        }
      } catch (err) {
        console.warn('Backend offline or unreachable, running in resilient fallback mode');
      }
    };

    fetchWorkspaceData();
  }, [currentWorkspaceId, setWorkspaces, setNodes, setEdges, setAgents]);

  const allTags = Array.from(
    new Set(
      nodes
        .flatMap((n) => n.data.metadata?.tags || [])
        .filter(Boolean)
    )
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07080C] text-white overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-14 px-4 bg-[#0c0e14] border-b border-white/10 flex items-center justify-between z-20 shrink-0">
        {/* Left: Brand + Workspace Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('landing')}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-all group"
            title="Return to Landing Page"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#0c0e14] rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white">
                SG
              </div>
            </div>
            <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
              SynapseGraph
            </span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Workspace Switcher */}
          <div className="flex items-center gap-2">
            <FolderGit2 size={15} className="text-violet-400" />
            <select
              value={currentWorkspaceId}
              onChange={(e) => setCurrentWorkspaceId(e.target.value)}
              className="bg-black/50 border border-white/10 text-xs text-zinc-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-violet-500 font-sans cursor-pointer"
            >
              <option value="ws_lora">LoRA: Low-Rank Adaptation (arXiv:2106.09685)</option>
              <option value="ws_flash">FlashAttention: IO-Aware Attention (arXiv:2205.14135)</option>
            </select>
          </div>

          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono border border-cyan-500/20">
            branch: main
          </span>
        </div>

        {/* Center: System Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[11px] font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Offline Resilient Mode</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">CPU Subprocess Sandbox</span>
        </div>

        {/* Right: Actions, Collaborator Avatars & Controls */}
        <div className="flex items-center gap-2.5">
          {/* 90-sec Demo CTA */}
          <button
            onClick={() => setIsAutoDemoOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <Play size={12} className="fill-current" />
            <span className="hidden sm:inline">Auto Demo</span>
          </button>

          {/* Break It Self-Healing CTA */}
          <button
            onClick={() => setIsBreakItModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all hover:scale-105 active:scale-95"
            title="Inject real fault to showcase autonomous healing"
          >
            <Flame size={13} className="text-rose-400" />
            <span className="hidden sm:inline">Break It</span>
          </button>

          {/* Export CTA */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all flex items-center gap-1"
            title="Command Palette (Ctrl+K)"
          >
            <Search size={14} />
            <span className="hidden xl:inline text-[10px] font-mono text-zinc-500">⌘K</span>
          </button>

          {/* Collaborator Avatars */}
          <div className="hidden xl:flex items-center -space-x-1.5 ml-1">
            <div
              className="w-6 h-6 rounded-full bg-violet-600 border border-[#0c0e14] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
              title="Alex K. (Active)"
            >
              AK
            </div>
            <div
              className="w-6 h-6 rounded-full bg-cyan-600 border border-[#0c0e14] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
              title="Dr. Chen (Active)"
            >
              DC
            </div>
            <div
              className="w-6 h-6 rounded-full bg-purple-600 border border-[#0c0e14] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
              title="Maya S. (Active)"
            >
              MS
            </div>
          </div>

          {/* Keyboard Shortcuts '?' */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition-all"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <div
          className={`${
            leftSidebarOpen ? 'w-64' : 'w-0'
          } bg-[#0c0e14] border-r border-white/10 transition-all duration-300 flex flex-col shrink-0 overflow-hidden z-10`}
        >
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider">
              Research Workspaces
            </span>
            <button
              onClick={() => {
                addToast({
                  title: 'New Canvas Initialized',
                  message: 'Created clean research canvas in SQLite.',
                  type: 'info',
                });
              }}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              title="New Workspace"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Workspaces List */}
            <div className="space-y-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => setCurrentWorkspaceId(ws.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all ${
                    currentWorkspaceId === ws.id
                      ? 'bg-violet-600/20 text-white border border-violet-500/40 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="truncate font-medium">{ws.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {ws.node_count ?? 8} nodes • {ws.edge_count ?? 8} edges
                  </div>
                </button>
              ))}
            </div>

            {/* Tag Filter Pills */}
            <div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Tag size={11} />
                <span>Filter by Tag</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {allTags.slice(0, 8).map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setSelectedTagFilter(selectedTagFilter === t ? null : t)
                    }
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all ${
                      selectedTagFilter === t
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingestion Drop Zone Reminder */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 text-center">
              <span className="text-[11px] font-bold text-zinc-300 block mb-1">
                Drag & Drop Papers
              </span>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Drop arXiv URLs, PDF files, or research questions onto the canvas.
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Left Sidebar Button */}
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="absolute top-4 left-0 z-20 p-1.5 rounded-r-xl bg-[#0c0e14] border border-l-0 border-white/10 text-zinc-400 hover:text-white shadow-lg"
          title="Toggle Sidebar"
        >
          {leftSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Center: Interactive React Flow Canvas */}
        <div className="flex-1 relative h-full">
          <GraphCanvas />
        </div>

        {/* Right Panel */}
        <div
          className={`${
            rightPanelOpen ? 'w-96' : 'w-0'
          } bg-[#0c0e14] border-l border-white/10 transition-all duration-300 flex flex-col shrink-0 overflow-hidden z-10`}
        >
          {/* Tab Navigation Header */}
          <div className="flex items-center border-b border-white/10 bg-[#0c0e14] text-xs font-medium">
            <button
              onClick={() => setActiveRightTab('thoughts')}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                activeRightTab === 'thoughts'
                  ? 'border-violet-500 text-white font-bold bg-white/[0.02]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Thoughts
            </button>
            <button
              onClick={() => setActiveRightTab('arena')}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                activeRightTab === 'arena'
                  ? 'border-purple-500 text-white font-bold bg-white/[0.02]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Arena
            </button>
            <button
              onClick={() => setActiveRightTab('inspector')}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                activeRightTab === 'inspector'
                  ? 'border-cyan-500 text-white font-bold bg-white/[0.02]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Inspector
            </button>
            <button
              onClick={() => setActiveRightTab('insights')}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                activeRightTab === 'insights'
                  ? 'border-amber-500 text-white font-bold bg-white/[0.02]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Insights
            </button>
          </div>

          {/* Active Tab Component */}
          <div className="flex-1 overflow-hidden">
            {activeRightTab === 'thoughts' && <ThoughtStream />}
            {activeRightTab === 'arena' && <AgentPanel />}
            {activeRightTab === 'inspector' && <NodeDetailPanel />}
            {activeRightTab === 'insights' && <InsightsPanel />}
          </div>
        </div>

        {/* Floating Voice Mic Button */}
        <VoiceButton />
      </div>

      {/* Bottom Historical Replay Timeline Scrubber */}
      <footer className="shrink-0 z-20">
        <TimelineSlider />
      </footer>
    </div>
  );
}
