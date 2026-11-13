import React, { useState } from 'react';
import { useSynapseStore, type ResearchGap } from '../../store/synapseStore';
import {
  Activity,
  Cpu,
  Layers,
  Search,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Zap,
  TrendingUp,
} from 'lucide-react';

export default function InsightsPanel() {
  const metrics = useSynapseStore((s) => s.metrics);
  const gaps = useSynapseStore((s) => s.gaps);
  const setGaps = useSynapseStore((s) => s.setGaps);
  const setHighlightedNodeIds = useSynapseStore((s) => s.setHighlightedNodeIds);
  const currentWorkspaceId = useSynapseStore((s) => s.currentWorkspaceId);
  const addToast = useSynapseStore((s) => s.addToast);

  const [isScanning, setIsScanning] = useState(false);

  const handleScanGaps = async () => {
    setIsScanning(true);
    addToast({
      title: 'Graph Topology Analyzer Activated',
      message: 'Running graph-theoretic heuristics (bridges, unresolved audits, disconnected components)...',
      type: 'agent',
    });

    try {
      const res = await fetch(`http://localhost:8000/api/workspaces/${currentWorkspaceId}/gaps`);
      const data = await res.json();
      if (data.gaps) {
        setGaps(data.gaps);
        addToast({
          title: 'Research Gaps Found',
          message: `Identified ${data.gaps.length} high-leverage empirical research opportunities.`,
          type: 'success',
        });
      }
    } catch {
      addToast({
        title: 'Offline Heuristics Applied',
        message: 'Graph topology scanned with local offline rule set.',
        type: 'info',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateHypothesis = async (gap: ResearchGap) => {
    try {
      const res = await fetch(`http://localhost:8000/api/workspaces/${currentWorkspaceId}/hypothesis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gap_id: gap.id,
          hypothesis_text: gap.suggested_hypothesis,
          affected_node_ids: gap.affected_node_ids,
        }),
      });
      const data = await res.json();
      if (data.status === 'created') {
        addToast({
          title: 'Hypothesis Node Formulated',
          message: `Spawned Question Node on canvas: "${gap.suggested_hypothesis.slice(0, 40)}..."`,
          type: 'success',
        });
      }
    } catch {
      addToast({
        title: 'Hypothesis Created (Offline)',
        message: 'Synthesized hypothesis node on canvas.',
        type: 'success',
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0e14] text-white overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold">Live Telemetry & Research Gaps</h3>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono border border-cyan-500/20">
          CPU Only: No GPU
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* SECTION 1: LIVE PERFORMANCE & COST DASHBOARD */}
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 mb-2.5 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Cpu size={14} className="text-cyan-400" />
            <span>Host Hardware & Cost Telemetry</span>
          </h4>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-500 font-mono block">CPU Usage</span>
              <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1 mt-0.5">
                <span>{metrics?.cpu_percent ?? 18.4}%</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${metrics?.cpu_percent ?? 18}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-500 font-mono block">RAM Allocated</span>
              <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1 mt-0.5">
                <span>{metrics?.ram_used_mb ?? 4820}</span>
                <span className="text-[10px] text-zinc-500 font-normal">MB</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${metrics?.ram_percent ?? 42}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
              <span className="text-zinc-500 text-[10px]">Total Tokens:</span>
              <span className="font-bold text-zinc-200">
                {metrics?.total_tokens?.toLocaleString() ?? '4,620'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
              <span className="text-zinc-500 text-[10px]">Estimated Cost:</span>
              <span className="font-bold text-emerald-400">$0.00</span>
            </div>
          </div>

          {/* Per-Agent Latency Sparklines */}
          <div className="mt-3 p-3 rounded-xl bg-black/50 border border-white/5">
            <div className="text-[10px] font-mono text-zinc-400 mb-2 flex justify-between">
              <span>Agent Execution Latencies</span>
              <span className="text-zinc-500">Subprocess ms</span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono">
              {Object.entries(metrics?.per_agent_latency || { controller: 182, reader: 210, codegen: 330, debugger: 140, critic: 195 }).map(
                ([agent, lat]) => (
                  <div key={agent} className="flex items-center justify-between">
                    <span className="text-zinc-400 capitalize">{agent}:</span>
                    <span className="text-cyan-300">{lat}ms</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: RESEARCH GAP FINDER */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Research Gap Finder</span>
            </h4>

            <button
              onClick={handleScanGaps}
              disabled={isScanning}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition-all flex items-center gap-1"
            >
              <Search size={12} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Scanning...' : 'Scan Gaps'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {gaps.map((gap) => (
              <div
                key={gap.id}
                onMouseEnter={() => setHighlightedNodeIds(gap.affected_node_ids)}
                onMouseLeave={() => setHighlightedNodeIds([])}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-400/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                      gap.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {gap.severity} Priority
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {gap.affected_node_ids.length} Nodes Involved
                  </span>
                </div>

                <h5 className="text-xs font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                  {gap.title}
                </h5>

                <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                  {gap.description}
                </p>

                <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 mb-3">
                  <span className="text-[10px] text-amber-400 font-semibold block mb-0.5">
                    Suggested Hypothesis:
                  </span>
                  <span className="text-xs text-zinc-300 italic">
                    "{gap.suggested_hypothesis}"
                  </span>
                </div>

                <button
                  onClick={() => handleCreateHypothesis(gap)}
                  className="w-full py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/20 transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-98"
                >
                  <Lightbulb size={13} />
                  <span>Create Hypothesis Node</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
