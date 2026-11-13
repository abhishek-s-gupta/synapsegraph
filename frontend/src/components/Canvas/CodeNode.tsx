import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Terminal, Play, Wrench, ShieldCheck } from 'lucide-react';
import { useSynapseStore, type NodeData } from '../../store/synapseStore';

export default function CodeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as NodeData;
  const selectNode = useSynapseStore((s) => s.selectNode);
  const isHighlighted = useSynapseStore((s) => s.highlightedNodeIds.includes(id));
  const addToast = useSynapseStore((s) => s.addToast);

  const isHealed = d.audit_status === 'HEALED' || d.metadata?.patch_diff;

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToast({
      title: 'CPU Sandbox Benchmark Execution',
      message: `Executing code node ${id} inside sandboxed subprocess (Python 3.13, 10s timeout)...`,
      type: 'info',
    });
  };

  return (
    <div
      onClick={() => selectNode(id)}
      className={`relative group rounded-xl p-3.5 min-w-[280px] max-w-[320px] bg-[#0c0e14]/90 backdrop-blur-xl border transition-all duration-300 cursor-pointer ${
        selected
          ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-[1.02]'
          : isHighlighted
          ? 'border-cyan-400 ring-4 ring-cyan-400/30 animate-pulse shadow-[0_0_25px_rgba(6,182,212,0.5)]'
          : isHealed
          ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
          : 'border-cyan-500/30 hover:border-cyan-500/70 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-cyan-400 !w-2.5 !h-2.5 !border-none" />
      <Handle type="target" position={Position.Left} className="!bg-cyan-400 !w-2.5 !h-2.5 !border-none" />

      <div className="flex items-start gap-2.5 mb-2.5">
        <div
          className={`p-2 rounded-lg border shrink-0 ${
            isHealed
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
              : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20'
          }`}
        >
          {isHealed ? <Wrench size={16} /> : <Terminal size={16} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                isHealed
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-cyan-500/20 text-cyan-300'
              }`}
            >
              {isHealed ? 'Patched Code' : 'Kernel Code'}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Python CPU</span>
          </div>
          <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
            {d.title}
          </h3>
        </div>
      </div>

      {/* Monospace Code Preview */}
      <div className="p-2 rounded-lg bg-black/60 border border-white/5 font-mono text-[10px] text-cyan-300/80 mb-2.5 overflow-hidden max-h-[64px]">
        <pre className="line-clamp-3 whitespace-pre-wrap">{d.content}</pre>
      </div>

      {isHealed && d.metadata?.recovery_time_s && (
        <div className="mb-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono flex items-center gap-1 border border-emerald-500/20">
          <ShieldCheck size={11} />
          <span>Recovered from memory in {d.metadata.recovery_time_s}s</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
        <span className="text-zinc-500 font-mono">INT4 Budget Guard</span>
        <button
          onClick={handleRun}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/60 text-cyan-300 font-medium transition-all hover:scale-105 active:scale-95"
        >
          <Play size={10} />
          <span>Run CPU</span>
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-2.5 !h-2.5 !border-none" />
      <Handle type="source" position={Position.Right} className="!bg-cyan-400 !w-2.5 !h-2.5 !border-none" />
    </div>
  );
}
