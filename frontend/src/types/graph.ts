/* ── Graph-related types ── */

export type NodeKind =
  | 'paper'
  | 'question'
  | 'dataset'
  | 'code'
  | 'failure'
  | 'result';

export type EdgeRelation =
  | 'cites'
  | 'derived_from'
  | 'tests'
  | 'produces'
  | 'fixes'
  | 'contradicts'
  | 'supports'
  | 'uses';

export interface KnowledgeNodeData extends Record<string, unknown> {
  id: string;
  kind: NodeKind;
  title: string;
  summary?: string;
  content?: string;
  sourceUrl?: string;
  authors?: string[];
  tags?: string[];
  metrics?: Record<string, number | string>;
  codeLanguage?: string;
  errorTrace?: string;
  fixDiff?: string;
  retryCount?: number;
  confidence?: number;
  extractionStatus?: 'pending' | 'extracting' | 'done' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeEdgeData extends Record<string, unknown> {
  relation: EdgeRelation;
  weight?: number;
  label?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  nodeCount: number;
  edgeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'paused' | 'error';
  rewardScore: number;
  runCount: number;
  scoreHistory: number[];
  currentAction?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  agentName: string;
  agentColor: string;
  action: string;
  nodeId?: string;
  duration?: number;
  kind: NodeKind | 'system';
}

export interface IngestRequest {
  type: 'paper_url' | 'code_repo' | 'research_question' | 'raw_text';
  content: string;
}
