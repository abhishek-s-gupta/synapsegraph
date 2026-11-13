import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { Workspace, Agent, TimelineEvent, KnowledgeNodeData, KnowledgeEdgeData } from '../types';

/* ── State shape ── */
export interface AppState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  nodes: Node<KnowledgeNodeData>[];
  edges: Edge<KnowledgeEdgeData>[];
  selectedNodeId: string | null;
  agents: Agent[];
  events: TimelineEvent[];
  timelinePosition: number;
  sseConnected: boolean;
  rightPanel: 'details' | 'agents' | 'thoughts';
  rightPanelOpen: boolean;
  viewMode: 'graph' | 'cluster' | 'list';
  searchQuery: string;
}

const initialState: AppState = {
  workspaces: [],
  currentWorkspace: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  agents: [],
  events: [],
  timelinePosition: 0,
  sseConnected: false,
  rightPanel: 'details',
  rightPanelOpen: true,
  viewMode: 'graph',
  searchQuery: '',
};

/* ── Actions ── */
type Action =
  | { type: 'SET_WORKSPACES'; payload: Workspace[] }
  | { type: 'SET_CURRENT_WORKSPACE'; payload: Workspace | null }
  | { type: 'SET_NODES'; payload: Node<KnowledgeNodeData>[] }
  | { type: 'ADD_NODE'; payload: Node<KnowledgeNodeData> }
  | { type: 'UPDATE_NODE'; payload: { id: string; data: Partial<KnowledgeNodeData> } }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'SET_EDGES'; payload: Edge<KnowledgeEdgeData>[] }
  | { type: 'ADD_EDGE'; payload: Edge<KnowledgeEdgeData> }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'SET_AGENTS'; payload: Agent[] }
  | { type: 'UPDATE_AGENT'; payload: Agent }
  | { type: 'ADD_EVENT'; payload: TimelineEvent }
  | { type: 'SET_EVENTS'; payload: TimelineEvent[] }
  | { type: 'SET_TIMELINE_POSITION'; payload: number }
  | { type: 'SET_SSE_CONNECTED'; payload: boolean }
  | { type: 'SET_RIGHT_PANEL'; payload: 'details' | 'agents' | 'thoughts' }
  | { type: 'TOGGLE_RIGHT_PANEL' }
  | { type: 'SET_VIEW_MODE'; payload: 'graph' | 'cluster' | 'list' }
  | { type: 'SET_SEARCH_QUERY'; payload: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_WORKSPACES':
      return { ...state, workspaces: action.payload };
    case 'SET_CURRENT_WORKSPACE':
      return { ...state, currentWorkspace: action.payload, selectedNodeId: null };
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.payload] };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.payload.id
            ? { ...n, data: { ...n.data, ...action.payload.data } }
            : n
        ),
      };
    case 'REMOVE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter((n) => n.id !== action.payload),
        edges: state.edges.filter(
          (e) => e.source !== action.payload && e.target !== action.payload
        ),
        selectedNodeId: state.selectedNodeId === action.payload ? null : state.selectedNodeId,
      };
    case 'SET_EDGES':
      return { ...state, edges: action.payload };
    case 'ADD_EDGE':
      return { ...state, edges: [...state.edges, action.payload] };
    case 'SELECT_NODE':
      return {
        ...state,
        selectedNodeId: action.payload,
        rightPanel: action.payload ? 'details' : state.rightPanel,
        rightPanelOpen: action.payload ? true : state.rightPanelOpen,
      };
    case 'SET_AGENTS':
      return { ...state, agents: action.payload };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'SET_TIMELINE_POSITION':
      return { ...state, timelinePosition: action.payload };
    case 'SET_SSE_CONNECTED':
      return { ...state, sseConnected: action.payload };
    case 'SET_RIGHT_PANEL':
      return { ...state, rightPanel: action.payload, rightPanelOpen: true };
    case 'TOGGLE_RIGHT_PANEL':
      return { ...state, rightPanelOpen: !state.rightPanelOpen };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
}

/* ── Context ── */
interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return React.createElement(StoreContext.Provider, { value: { state, dispatch } }, children);
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

/* ── Convenience selector hooks ── */
export function useSelectedNode() {
  const { state } = useStore();
  if (!state.selectedNodeId) return null;
  return state.nodes.find((n) => n.id === state.selectedNodeId) ?? null;
}

export function useActions() {
  const { dispatch } = useStore();

  return {
    setWorkspaces: useCallback((w: Workspace[]) => dispatch({ type: 'SET_WORKSPACES', payload: w }), [dispatch]),
    setCurrentWorkspace: useCallback((w: Workspace | null) => dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: w }), [dispatch]),
    setNodes: useCallback((n: Node<KnowledgeNodeData>[]) => dispatch({ type: 'SET_NODES', payload: n }), [dispatch]),
    addNode: useCallback((n: Node<KnowledgeNodeData>) => dispatch({ type: 'ADD_NODE', payload: n }), [dispatch]),
    updateNode: useCallback((id: string, data: Partial<KnowledgeNodeData>) => dispatch({ type: 'UPDATE_NODE', payload: { id, data } }), [dispatch]),
    removeNode: useCallback((id: string) => dispatch({ type: 'REMOVE_NODE', payload: id }), [dispatch]),
    setEdges: useCallback((e: Edge<KnowledgeEdgeData>[]) => dispatch({ type: 'SET_EDGES', payload: e }), [dispatch]),
    addEdge: useCallback((e: Edge<KnowledgeEdgeData>) => dispatch({ type: 'ADD_EDGE', payload: e }), [dispatch]),
    selectNode: useCallback((id: string | null) => dispatch({ type: 'SELECT_NODE', payload: id }), [dispatch]),
    setAgents: useCallback((a: Agent[]) => dispatch({ type: 'SET_AGENTS', payload: a }), [dispatch]),
    updateAgent: useCallback((a: Agent) => dispatch({ type: 'UPDATE_AGENT', payload: a }), [dispatch]),
    addEvent: useCallback((e: TimelineEvent) => dispatch({ type: 'ADD_EVENT', payload: e }), [dispatch]),
    setEvents: useCallback((e: TimelineEvent[]) => dispatch({ type: 'SET_EVENTS', payload: e }), [dispatch]),
    setTimelinePosition: useCallback((p: number) => dispatch({ type: 'SET_TIMELINE_POSITION', payload: p }), [dispatch]),
    setSSEConnected: useCallback((c: boolean) => dispatch({ type: 'SET_SSE_CONNECTED', payload: c }), [dispatch]),
    setRightPanel: useCallback((p: 'details' | 'agents' | 'thoughts') => dispatch({ type: 'SET_RIGHT_PANEL', payload: p }), [dispatch]),
    toggleRightPanel: useCallback(() => dispatch({ type: 'TOGGLE_RIGHT_PANEL' }), [dispatch]),
    setViewMode: useCallback((m: 'graph' | 'cluster' | 'list') => dispatch({ type: 'SET_VIEW_MODE', payload: m }), [dispatch]),
    setSearchQuery: useCallback((q: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: q }), [dispatch]),
  };
}
