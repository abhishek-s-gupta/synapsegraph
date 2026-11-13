import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { useSynapseStore, type NodeData } from '../../store/synapseStore';

export default function FailureNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as NodeData;
  const selectNode = useSynapseStore((s) => s.selectNode);
  const isHighlighted = useSynapseStore((s) => s.highlightedNodeIds.includes(id));

  return (
    <div
      onClick={() => selectNode(id)}
      className={`relative group rounded-xl p-3.5 min-w-[270px] max-w-[300px] bg-[#0c0e14]/90 backdrop-blur-xl border transition-all duration-300 cursor-pointer ${
        selected
          ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.5)] scale-[1.02]'
          : isHighlighted
          ? 'border-rose-400 ring-4 ring-rose-400/30 animate-pulse shadow-[0_0_25px_rgba(244,63,94,0.5)]'
          : 'border-rose-500/40 hover:border-rose-500/80 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-rose-400 !w-2.5 !h-2.5 !border-none" />
      <Handle type="target" position={Position.Left} className="!bg-rose-400 !w-2.5 !h-2.5 !border-none" />

      <div className="flex items-start gap-2.5 mb-2">
        <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/20 shrink-0">
          <AlertOctagon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold uppercase tracking-wider">
              Crash Captured
            </span>
          </div>
          <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 group-hover:text-rose-300 transition-colors">
            {d.title}
          </h3>
        </div>
      </div>

      {/* Traceback preview */}
      <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/20 font-mono text-[10px] text-rose-300/80 mb-2.5 overflow-hidden max-h-[60px]">
        <pre className="line-clamp-3 whitespace-pre-wrap">{d.content}</pre>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
        <span className="flex items-center gap-1 text-rose-400 font-mono">
          <RefreshCw size={11} className="animate-spin" /> Auto-Heal Loop
        </span>
        <span className="text-zinc-500 font-mono">Traceback #4</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-rose-400 !w-2.5 !h-2.5 !border-none" />
      <Handle type="source" position={Position.Right} className="!bg-rose-400 !w-2.5 !h-2.5 !border-none" />
    </div>
  );
}
