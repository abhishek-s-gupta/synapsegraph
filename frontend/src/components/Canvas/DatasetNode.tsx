import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Database, CheckCircle2 } from 'lucide-react';
import { useSynapseStore, type NodeData } from '../../store/synapseStore';

export default function DatasetNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as NodeData;
  const selectNode = useSynapseStore((s) => s.selectNode);
  const isHighlighted = useSynapseStore((s) => s.highlightedNodeIds.includes(id));

  return (
    <div
      onClick={() => selectNode(id)}
      className={`relative group rounded-xl p-3.5 min-w-[260px] max-w-[290px] bg-[#0c0e14]/90 backdrop-blur-xl border transition-all duration-300 cursor-pointer ${
        selected
          ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-[1.02]'
          : isHighlighted
          ? 'border-emerald-400 ring-4 ring-emerald-400/30 animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.5)]'
          : 'border-emerald-500/30 hover:border-emerald-500/70 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-400 !w-2.5 !h-2.5 !border-none" />
      <Handle type="target" position={Position.Left} className="!bg-emerald-400 !w-2.5 !h-2.5 !border-none" />

      <div className="flex items-start gap-2.5 mb-2">
        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
          <Database size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider">
              Dataset
            </span>
            {d.metadata?.samples && (
              <span className="text-[10px] font-mono text-emerald-400/90">
                {d.metadata.samples.toLocaleString()} samples
              </span>
            )}
          </div>
          <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 group-hover:text-emerald-300 transition-colors">
            {d.title}
          </h3>
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mb-2.5">
        {d.content}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1 text-emerald-400">
          <CheckCircle2 size={11} /> Normalized Split
        </span>
        <span className="font-mono">d={d.metadata?.features ?? 512}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !w-2.5 !h-2.5 !border-none" />
      <Handle type="source" position={Position.Right} className="!bg-emerald-400 !w-2.5 !h-2.5 !border-none" />
    </div>
  );
}
