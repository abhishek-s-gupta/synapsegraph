import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { useSynapseStore, type NodeData } from '../../store/synapseStore';

export default function QuestionNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as NodeData;
  const selectNode = useSynapseStore((s) => s.selectNode);
  const isHighlighted = useSynapseStore((s) => s.highlightedNodeIds.includes(id));

  return (
    <div
      onClick={() => selectNode(id)}
      className={`relative group rounded-xl p-3.5 min-w-[260px] max-w-[290px] bg-[#0c0e14]/90 backdrop-blur-xl border transition-all duration-300 cursor-pointer ${
        selected
          ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-[1.02]'
          : isHighlighted
          ? 'border-amber-400 ring-4 ring-amber-400/30 animate-pulse shadow-[0_0_25px_rgba(245,158,11,0.5)]'
          : 'border-amber-500/30 hover:border-amber-500/70 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-2.5 !h-2.5 !border-none" />
      <Handle type="target" position={Position.Left} className="!bg-amber-400 !w-2.5 !h-2.5 !border-none" />

      <div className="flex items-start gap-2.5 mb-2">
        <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
          <HelpCircle size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider">
              Hypothesis
            </span>
          </div>
          <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
            {d.title}
          </h3>
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3 mb-2.5">
        {d.content}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1 text-amber-400/80">
          <Sparkles size={11} /> Open Frontier
        </span>
        <span className="font-mono">t={d.timeline_step ?? 1}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-amber-400 !w-2.5 !h-2.5 !border-none" />
      <Handle type="source" position={Position.Right} className="!bg-amber-400 !w-2.5 !h-2.5 !border-none" />
    </div>
  );
}
