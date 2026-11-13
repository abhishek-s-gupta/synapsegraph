import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';

export type NodeKind = 'paper' | 'question' | 'dataset' | 'code' | 'failure' | 'result';
export type EdgeRelation =
  | 'cites'
  | 'supports'
  | 'contradicts'
  | 'answers'
  | 'generates_code'
  | 'failed_with'
  | 'patched_to'
  | 'what_if_branch';

export interface NodeMetadata {
  tags?: string[];
  arxiv_id?: string;
  authors?: string;
  year?: number;
  reproducibility_target?: number;
  target_metric?: string;
  metrics?: {
    accuracy?: number;
    f1?: number;
    latency_ms?: number;
    memory_kb?: number;
    claimed_accuracy?: number;
    claimed_latency_ms?: number;
    reproducibility_score?: number;
    baseline_delta?: number;
    speedup?: number;
    claimed_speedup?: number;
    memory_reduction?: number;
  };
  language?: string;
  patch_diff?: string;
  error_pattern?: string;
  recovery_time_s?: number;
  memory_reuse?: boolean;
  params?: Record<string, any>;
  [key: string]: any;
}

export interface NodeData extends Record<string, any> {
  id: string;
  workspace_id?: string;
  type: NodeKind;
  title: string;
  content: string;
  metadata?: NodeMetadata;
  audit_status?: 'VERIFIED' | 'CONTESTED' | 'FAILED' | 'HEALED';
  audit_data?: {
    vulnerability?: string;
    counter_hypothesis?: string;
    test_spec?: string;
  };
  timeline_step?: number;
  position?: { x: number; y: number };
}

export interface EdgeData extends Record<string, any> {
  id: string;
  source: string;
  target: string;
  relation: EdgeRelation;
  metadata?: Record<string, any>;
}

export interface AgentData {
  id: string;
  name: string;
  role: string;
  generation: number;
  status: 'active' | 'idle' | 'running' | 'paused' | 'retired';
  score: number;
  runs: number;
  metadata?: {
    success_rate?: number;
    avg_latency_ms?: number;
    score_history?: number[];
    prompt_version?: string;
    [key: string]: any;
  };
}

export interface ThoughtStep {
  id: string;
  timestamp: string;
  agent_id: string;
  agent_name: string;
  phase: string;
  reasoning: string;
  status: 'pending' | 'in_progress' | 'approved' | 'paused' | 'rejected' | 'completed';
  latency_ms: number;
  delta?: number;
}

export interface ResearchGap {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  affected_node_ids: string[];
  suggested_hypothesis: string;
}

export interface SystemMetrics {
  cpu_percent: number;
  ram_percent: number;
  ram_used_mb: number;
  ram_total_mb: number;
  per_agent_latency: Record<string, number>;
  total_tokens: number;
  estimated_cost: number;
  is_cpu_only: boolean;
  resilient_mode: boolean;
  timestamp: string;
}

interface SynapseStore {
  // Navigation
  activePage: 'landing' | 'workspace';
  setActivePage: (page: 'landing' | 'workspace') => void;

  // Workspace
  currentWorkspaceId: string;
  workspaces: Array<{ id: string; name: string; description: string; node_count?: number; edge_count?: number }>;
  setCurrentWorkspaceId: (id: string) => void;
  setWorkspaces: (ws: any[]) => void;

  // Graph
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  selectedNodeId: string | null;
  highlightedNodeIds: string[];
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge<EdgeData>[]) => void;
  selectNode: (id: string | null) => void;
  setHighlightedNodeIds: (ids: string[]) => void;
  addNode: (node: Node<NodeData>) => void;
  addEdge: (edge: Edge<EdgeData>) => void;

  // View Mode
  viewMode: 'graph' | 'clusters' | 'list' | 'grid';
  setViewMode: (mode: 'graph' | 'clusters' | 'list' | 'grid') => void;

  // Right Panel Tabs
  activeRightTab: 'thoughts' | 'arena' | 'inspector' | 'insights';
  setActiveRightTab: (tab: 'thoughts' | 'arena' | 'inspector' | 'insights') => void;
  rightPanelOpen: boolean;
  toggleRightPanel: () => void;

  // Timeline
  timelineStep: number;
  maxTimelineStep: number;
  isPlayingTimeline: boolean;
  timelineSpeed: 1 | 2 | 4;
  setTimelineStep: (step: number) => void;
  setIsPlayingTimeline: (playing: boolean) => void;
  setTimelineSpeed: (speed: 1 | 2 | 4) => void;

  // Agents & Governance
  agents: AgentData[];
  setAgents: (agents: AgentData[]) => void;
  updateAgentScore: (agentId: string, newScore: number, delta: number) => void;
  thoughts: ThoughtStep[];
  addThought: (thought: ThoughtStep) => void;

  // Telemetry Metrics
  metrics: SystemMetrics | null;
  setMetrics: (m: SystemMetrics) => void;

  // Research Gaps
  gaps: ResearchGap[];
  setGaps: (gaps: ResearchGap[]) => void;

  // Modals & Overlays
  isAutoDemoOpen: boolean;
  setIsAutoDemoOpen: (open: boolean) => void;
  isBreakItModalOpen: boolean;
  setIsBreakItModalOpen: (open: boolean) => void;
  isWhatIfOpen: boolean;
  setIsWhatIfOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  isPromptDiffOpen: boolean;
  setIsPromptDiffOpen: (open: boolean) => void;
  activePromptDiff: { agent: string; v1: string; v2: string; diff: string; reason: string } | null;
  setActivePromptDiff: (diff: any) => void;

  // Voice Command State
  isListeningVoice: boolean;
  voiceTranscript: string;
  setIsListeningVoice: (listening: boolean) => void;
  setVoiceTranscript: (transcript: string) => void;

  // Toast Notifications
  toasts: Array<{ id: string; title: string; message: string; type: 'success' | 'error' | 'info' | 'agent' }>;
  addToast: (toast: { title: string; message: string; type: 'success' | 'error' | 'info' | 'agent' }) => void;
  removeToast: (id: string) => void;

  // Filter & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;

  // Auto Layout trigger
  layoutTrigger: number;
  triggerLayout: () => void;
}

export const useSynapseStore = create<SynapseStore>((set, get) => ({
  activePage: 'landing',
  setActivePage: (page) => set({ activePage: page }),

  currentWorkspaceId: 'ws_lora',
  workspaces: [],
  setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id, selectedNodeId: null }),
  setWorkspaces: (ws) => set({ workspaces: ws }),

  nodes: [],
  edges: [],
  selectedNodeId: null,
  highlightedNodeIds: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id, activeRightTab: id ? 'inspector' : get().activeRightTab, rightPanelOpen: true }),
  setHighlightedNodeIds: (ids) => set({ highlightedNodeIds: ids }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  addEdge: (edge) => set((s) => ({ edges: [...s.edges, edge] })),

  viewMode: 'graph',
  setViewMode: (mode) => set({ viewMode: mode }),

  activeRightTab: 'thoughts',
  setActiveRightTab: (tab) => set({ activeRightTab: tab, rightPanelOpen: true }),
  rightPanelOpen: true,
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),

  timelineStep: 7,
  maxTimelineStep: 7,
  isPlayingTimeline: false,
  timelineSpeed: 1,
  setTimelineStep: (step) => set({ timelineStep: step }),
  setIsPlayingTimeline: (playing) => set({ isPlayingTimeline: playing }),
  setTimelineSpeed: (speed) => set({ timelineSpeed: speed }),

  agents: [],
  setAgents: (agents) => set({ agents }),
  updateAgentScore: (agentId, newScore, delta) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === agentId ? { ...a, score: newScore } : a)),
    })),
  thoughts: [
    {
      id: 't0',
      timestamp: '14:20:01',
      agent_id: 'controller',
      agent_name: 'Controller Agent',
      phase: 'Task Planning',
      reasoning: 'Decomposing LoRA empirical reproduction into 4 parallel evaluation tasks on CPU sandbox.',
      status: 'completed',
      latency_ms: 182,
    },
    {
      id: 't1',
      timestamp: '14:20:02',
      agent_id: 'critic',
      agent_name: 'Red-Team Critic',
      phase: 'Claim Auditing',
      reasoning: 'Auditing numerical claims: Detected potential SRAM allocation overflow under INT4 quant and batch>32.',
      status: 'completed',
      latency_ms: 195,
    },
    {
      id: 't2',
      timestamp: '14:20:04',
      agent_id: 'debugger',
      agent_name: 'Debugger Agent',
      phase: 'Autonomous Healing',
      reasoning: 'Identified ValueError: shapes not aligned in LoRA contraction. Applied transpose fix (x @ A.T @ B.T). Recovered in 0.38s.',
      status: 'completed',
      latency_ms: 140,
      delta: 5,
    },
  ],
  addThought: (thought) => set((s) => ({ thoughts: [thought, ...s.thoughts] })),

  metrics: {
    cpu_percent: 18.4,
    ram_percent: 42.1,
    ram_used_mb: 4820.0,
    ram_total_mb: 16384.0,
    per_agent_latency: {
      controller: 182,
      reader: 210,
      codegen: 330,
      debugger: 140,
      critic: 195,
    },
    total_tokens: 4620,
    estimated_cost: 0.0,
    is_cpu_only: true,
    resilient_mode: true,
    timestamp: new Date().toISOString(),
  },
  setMetrics: (m) => set({ metrics: m }),

  gaps: [
    {
      id: 'gap_lora_sram',
      title: 'Unresolved Red-Team Vulnerability Audit',
      description: 'Critic Agent identified potential SRAM buffer allocation overflow under INT4 quant and heavy batching. No resolving benchmark node validates this claim.',
      severity: 'high',
      type: 'unresolved_contradiction',
      affected_node_ids: ['node_lora_paper'],
      suggested_hypothesis: 'Verify peak SRAM allocation with batch_size=64 and INT4 quantization guard on CPU.',
    },
    {
      id: 'gap_cross_cluster',
      title: 'Structural Gap: Parameter Efficiency vs Memory Bandwidth',
      description: 'Cluster A (LoRA Rank Decomposition) and Cluster B (FlashAttention Tiling) share theoretical memory constraints but lack cross-comparative benchmarks.',
      severity: 'medium',
      type: 'unconnected_clusters',
      affected_node_ids: ['node_lora_paper', 'node_lora_result'],
      suggested_hypothesis: 'Can Low-Rank Projection (LoRA) be computed inside FlashAttention tiled SRAM buffer without HBM round-trips?',
    },
  ],
  setGaps: (gaps) => set({ gaps }),

  isAutoDemoOpen: false,
  setIsAutoDemoOpen: (open) => set({ isAutoDemoOpen: open }),
  isBreakItModalOpen: false,
  setIsBreakItModalOpen: (open) => set({ isBreakItModalOpen: open }),
  isWhatIfOpen: false,
  setIsWhatIfOpen: (open) => set({ isWhatIfOpen: open }),
  isCommandPaletteOpen: false,
  setIsCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  isExportModalOpen: false,
  setIsExportModalOpen: (open) => set({ isExportModalOpen: open }),
  isShortcutsOpen: false,
  setIsShortcutsOpen: (open) => set({ isShortcutsOpen: open }),
  isPromptDiffOpen: false,
  setIsPromptDiffOpen: (open) => set({ isPromptDiffOpen: open }),
  activePromptDiff: null,
  setActivePromptDiff: (diff) => set({ activePromptDiff: diff, isPromptDiffOpen: true }),

  isListeningVoice: false,
  voiceTranscript: '',
  setIsListeningVoice: (listening) => set({ isListeningVoice: listening }),
  setVoiceTranscript: (transcript) => set({ voiceTranscript: transcript }),

  toasts: [],
  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedTagFilter: null,
  setSelectedTagFilter: (tag) => set({ selectedTagFilter: tag }),

  layoutTrigger: 0,
  triggerLayout: () => set((s) => ({ layoutTrigger: s.layoutTrigger + 1 })),
}));
