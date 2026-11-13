import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Award, GitFork, ArrowUpRight, ArrowDownRight, CheckCircle } from 'lucide-react';
import { useSynapseStore, type NodeData } from '../../store/synapseStore';

export default function ResultNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as NodeData;
  const selectNode = useSynapseStore((s) => s.selectNode);
  const isHighlighted = useSynapseStore((s) => s.highlightedNodeIds.includes(id));
  const setIsWhatIfOpen = useSynapseStore((s) => s.setIsWhatIfOpen);

  const metrics = d.metadata?.metrics || {};
  const score = metrics.reproducibility_score ?? (metrics.accuracy ? Math.round(metrics.accuracy * 100) : 94);
  const delta = metrics.baseline_delta ?? -0.6;
  const isPositive = delta >= 0;

  const handleOpenWhatIf = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(id);
    setIsWhatIfOpen(true);
  };

  return (
    <div
      onClick={() => selectNode(id)}
      className={`relative group rounded-xl p-3.5 min-w-[280px] max-w-[320px] bg-[#0c0e14]/90 backdrop-blur-xl border transition-all duration-300 cursor-pointer ${
        selected
          ? 'border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)] scale-[1.02]'
          : isHighlighted
          ? 'border-purple-400 ring-4 ring-purple-400/30 animate-pulse shadow-[0_0_25px_rgba(168,85,247,0.5)]'
          : 'border-purple-500/30 hover:border-purple-500/70 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-400 !w-2.5 !h-2.5 !border-none" />
      <Handle type="target" position={Position.Left} className="!bg-purple-400 !w-2.5 !h-2.5 !border-none" />

      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/20 shrink-0">
          <Award size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold uppercase tracking-wider">
              Verified Result
            </span>
            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-0.5">
              <CheckCircle size={10} className="text-emerald-400" /> Critic Audit
            </span>
          </div>
          <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
            {d.title}
          </h3>
        </div>
      </div>

      {/* Metric Gauge & Delta Bar */}
      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 mb-2.5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] text-zinc-400 font-mono">Reproducibility Score</div>
            <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
              <span>{score}</span>
              <span className="text-xs text-zinc-500 font-normal">/ 100</span>
            </div>
          </div>

          <div
            className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold flex items-center gap-0.5 border ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{isPositive ? `+${delta}%` : `${delta}%`} vs Claimed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-2.5">
        <div className="px-2 py-1 rounded bg-black/40 border border-white/5 text-zinc-300 flex justify-between">
          <span className="text-zinc-500">Latency:</span>
          <span>{metrics.latency_ms ?? 14.2}ms</span>
        </div>
        <div className="px-2 py-1 rounded bg-black/40 border border-white/5 text-zinc-300 flex justify-between">
          <span className="text-zinc-500">SRAM:</span>
          <span>{metrics.memory_kb ?? 12.8}KB</span>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
        <span className="text-zinc-500 font-mono">Verified CPU INT4</span>
        <button
          onClick={handleOpenWhatIf}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-medium border border-purple-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <GitFork size={11} />
          <span>What-If Branch</span>
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-purple-400 !w-2.5 !h-2.5 !border-none" />
      <Handle type="source" position={Position.Right} className="!bg-purple-400 !w-2.5 !h-2.5 !border-none" />
    </div>
  );
}
