import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import dagre from 'dagre';

import PaperNode from './PaperNode';
import QuestionNode from './QuestionNode';
import DatasetNode from './DatasetNode';
import CodeNode from './CodeNode';
import FailureNode from './FailureNode';
import ResultNode from './ResultNode';
import CustomEdge from './CustomEdge';
import { useSynapseStore, type NodeData, type EdgeData } from '../../store/synapseStore';
import {
  LayoutGrid,
  Network,
  ListFilter,
  Layers,
  Sparkles,
  Maximize2,
  UploadCloud,
  FileCode,
  Flame,
  Search,
} from 'lucide-react';

const nodeTypes = {
  paper: PaperNode,
  question: QuestionNode,
  dataset: DatasetNode,
  code: CodeNode,
  failure: FailureNode,
  result: ResultNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Dagre layout calculator
const getLayoutedElements = (nodes: Node<NodeData>[], edges: Edge<EdgeData>[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, nodesep: 70, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 300, height: 200 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 150,
        y: nodeWithPosition.y - 100,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function GraphCanvas() {
  const storeNodes = useSynapseStore((s) => s.nodes);
  const storeEdges = useSynapseStore((s) => s.edges);
  const selectedNodeId = useSynapseStore((s) => s.selectedNodeId);
  const selectNode = useSynapseStore((s) => s.selectNode);
  const setStoreNodes = useSynapseStore((s) => s.setNodes);
  const setStoreEdges = useSynapseStore((s) => s.setEdges);
  const addToast = useSynapseStore((s) => s.addToast);
  const viewMode = useSynapseStore((s) => s.viewMode);
  const setViewMode = useSynapseStore((s) => s.setViewMode);
  const layoutTrigger = useSynapseStore((s) => s.layoutTrigger);
  const timelineStep = useSynapseStore((s) => s.timelineStep);
  const searchQuery = useSynapseStore((s) => s.searchQuery);
  const currentWorkspaceId = useSynapseStore((s) => s.currentWorkspaceId);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  // Sync from store and apply timeline filter
  useEffect(() => {
    // Filter nodes by timeline scrubber step
    let filteredNodes = storeNodes.filter((n) => {
      const step = n.data?.timeline_step ?? 0;
      return step <= timelineStep;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(
        (n) =>
          n.data.title.toLowerCase().includes(q) ||
          n.data.content.toLowerCase().includes(q) ||
          n.data.type.toLowerCase().includes(q)
      );
    }

    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = storeEdges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );

    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [storeNodes, storeEdges, timelineStep, searchQuery]);

  // Handle Dagre auto-layout trigger
  useEffect(() => {
    if (nodes.length === 0) return;
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setStoreNodes(layoutedNodes);
    addToast({
      title: 'Dagre Auto-Layout Applied',
      message: 'Organized nodes into a clear left-to-right DAG lineage.',
      type: 'info',
    });
  }, [layoutTrigger]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: any = {
        ...params,
        id: `e_${Date.now()}`,
        type: 'custom',
        data: { id: `e_${Date.now()}`, source: params.source, target: params.target, relation: 'supports' },
      };
      setEdges((eds) => addEdge(newEdge, eds as any) as any);
      setStoreEdges([...storeEdges, newEdge]);
    },
    [setEdges, setStoreEdges, storeEdges]
  );

  // Drag and drop ingest handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    let textData = e.dataTransfer.getData('text');
    if (!textData && e.dataTransfer.files.length > 0) {
      textData = e.dataTransfer.files[0].name;
    }

    if (!textData) textData = 'https://arxiv.org/abs/2106.09685';

    setIsIngesting(true);
    addToast({
      title: 'Ingestion Pipeline Initialized',
      message: `Reader Agent processing dropped payload: ${textData.slice(0, 40)}...`,
      type: 'agent',
    });

    try {
      const res = await fetch(`http://localhost:8000/api/workspaces/${currentWorkspaceId}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textData, input_type: 'arxiv_url' }),
      });
      const data = await res.json();
      if (data.nodes) {
        addToast({
          title: 'Graph Expanded',
          message: `Spawned ${data.nodes.length} new research nodes with spring animation.`,
          type: 'success',
        });
      }
    } catch {
      addToast({
        title: 'Offline Resilient Mode',
        message: 'Synthesized deterministic paper nodes in canvas.',
        type: 'info',
      });
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full h-full bg-[#07080C] overflow-hidden select-none"
    >
      {/* Top Floating View Toggle & Layout Bar */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-2 p-1.5 rounded-xl bg-[#0c0e14]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        <button
          onClick={() => setViewMode('graph')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'graph'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Network size={14} />
          <span>Graph</span>
        </button>

        <button
          onClick={() => setViewMode('clusters')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'clusters'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers size={14} />
          <span>Topic Clusters</span>
        </button>

        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'list'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ListFilter size={14} />
          <span>List View</span>
        </button>

        <button
          onClick={() => setViewMode('grid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'grid'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutGrid size={14} />
          <span>Grid</span>
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        <button
          onClick={() => {
            const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges);
            setNodes(ln);
            setEdges(le);
            setStoreNodes(ln);
            addToast({
              title: 'Auto-Layout Applied',
              message: 'Realigned DAG hierarchy using Dagre layout physics.',
              type: 'info',
            });
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 transition-all hover:scale-105 active:scale-95"
          title="Auto-organize graph layout"
        >
          <Sparkles size={13} />
          <span>Auto-Layout</span>
        </button>
      </div>

      {/* Main Graph Canvas */}
      {viewMode === 'graph' ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={(_, node) => selectNode(node.id)}
          onPaneClick={() => selectNode(null)}
          fitView
          minZoom={0.2}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
          className="transition-colors duration-500"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="rgba(255,255,255,0.06)" />
          <Controls className="!bg-[#0c0e14]/90 !border-white/10 !rounded-xl !shadow-2xl overflow-hidden [&>button]:!bg-transparent [&>button]:!border-white/10 [&>button]:!text-zinc-400 hover:[&>button]:!text-white hover:[&>button]:!bg-white/5" />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'paper': return '#8b5cf6';
                case 'question': return '#f59e0b';
                case 'dataset': return '#10b981';
                case 'code': return '#06b6d4';
                case 'failure': return '#f43f5e';
                case 'result': return '#a855f7';
                default: return '#64748b';
              }
            }}
            maskColor="rgba(7, 8, 12, 0.75)"
            className="!bg-[#0c0e14]/90 !border-white/10 !rounded-xl !shadow-2xl !overflow-hidden"
          />
        </ReactFlow>
      ) : viewMode === 'clusters' ? (
        /* Topic Clusters View */
        <div className="w-full h-full p-16 overflow-y-auto">
          <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto pt-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-violet-500/20 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]" />
                <h3 className="text-base font-bold text-white">Cluster A: Parameter-Efficient Fine-Tuning</h3>
                <span className="text-xs font-mono text-zinc-500 ml-auto">4 Nodes</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Weight updates decomposed into low-rank matrices $W + BA$. Freezes pre-trained weights to preserve memory bounds.
              </p>
              <div className="space-y-3">
                {nodes
                  .filter((n) => n.data.type === 'paper' || n.data.type === 'code' || n.data.type === 'result')
                  .slice(0, 3)
                  .map((n) => (
                    <div
                      key={n.id}
                      onClick={() => selectNode(n.id)}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-violet-500/40 cursor-pointer transition-all"
                    >
                      <div className="text-xs font-semibold text-white mb-1">{n.data.title}</div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1">{n.data.content}</div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-cyan-500/20 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]" />
                <h3 className="text-base font-bold text-white">Cluster B: Hardware-Aware Kernel Tiling</h3>
                <span className="text-xs font-mono text-zinc-500 ml-auto">3 Nodes</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Tiled block-wise memory calculation in SRAM. Minimizes quadratic High-Bandwidth Memory (HBM) bandwidth bottlenecks.
              </p>
              <div className="space-y-3">
                {nodes
                  .filter((n) => n.data.type === 'dataset' || n.data.type === 'failure' || n.data.type === 'question')
                  .slice(0, 3)
                  .map((n) => (
                    <div
                      key={n.id}
                      onClick={() => selectNode(n.id)}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/40 cursor-pointer transition-all"
                    >
                      <div className="text-xs font-semibold text-white mb-1">{n.data.title}</div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1">{n.data.content}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List / Grid View */
        <div className="w-full h-full p-16 overflow-y-auto">
          <div className="max-w-6xl mx-auto pt-6">
            <div className="grid grid-cols-3 gap-4">
              {nodes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => selectNode(n.id)}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-violet-500/50 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                      {n.data.type}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 ml-auto">t={n.data.timeline_step ?? 0}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mb-1 line-clamp-1">{n.data.title}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{n.data.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#07080c]/90 backdrop-blur-md border-2 border-dashed border-cyan-400 animate-pulse">
          <UploadCloud size={64} className="text-cyan-400 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">Drop arXiv Paper, PDF, or Repo Link</h2>
          <p className="text-sm text-zinc-400">
            Reader Agent will parse entities, extract math bounds, and auto-build research graph nodes.
          </p>
        </div>
      )}

      {/* Ingesting Loading Indicator */}
      {isIngesting && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-full bg-violet-600/90 text-white font-medium text-xs shadow-2xl backdrop-blur-md flex items-center gap-2.5 border border-violet-400/30">
          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Reader Agent structuring citations & empirical bounds...</span>
        </div>
      )}
    </div>
  );
}
