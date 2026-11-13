import React from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import {
  FileText,
  Terminal,
  HelpCircle,
  Database,
  AlertOctagon,
  Award,
  Play,
  GitFork,
  Copy,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function NodeDetailPanel() {
  const selectedNodeId = useSynapseStore((s) => s.selectedNodeId);
  const nodes = useSynapseStore((s) => s.nodes);
  const setIsWhatIfOpen = useSynapseStore((s) => s.setIsWhatIfOpen);
  const addToast = useSynapseStore((s) => s.addToast);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-500 bg-[#0c0e14]">
        <FileText size={40} className="mb-3 opacity-30" />
        <h4 className="text-sm font-semibold text-zinc-300 mb-1">No Node Selected</h4>
        <p className="text-xs text-zinc-500 max-w-[220px]">
          Click any paper, code, failure, or result node on the canvas to inspect evidence details.
        </p>
      </div>
    );
  }

  const d = selectedNode.data;
  const meta = d.metadata || {};

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(d, null, 2));
    addToast({
      title: 'Copied to Clipboard',
      message: 'Node metadata & citation manifest copied.',
      type: 'info',
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0e14] text-white overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold">
              {d.type}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Node #{d.id}</span>
          </div>
          <h2 className="text-sm font-bold text-white leading-snug">{d.title}</h2>
        </div>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          title="Copy node JSON"
        >
          <Copy size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Red-Team Audit Popover Card if Contested */}
        {d.audit_status === 'CONTESTED' && d.audit_data && (
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 text-amber-200 shadow-lg">
            <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-amber-300">
              <AlertTriangle size={15} />
              <span>Red-Team Critic Audit Report</span>
            </div>
            <div className="space-y-2 text-[11px] leading-relaxed">
              <div>
                <span className="text-amber-400 font-semibold block">Identified Vulnerability:</span>
                <span className="text-zinc-300">{d.audit_data.vulnerability}</span>
              </div>
              <div>
                <span className="text-amber-400 font-semibold block">Counter-Hypothesis:</span>
                <span className="text-zinc-300">{d.audit_data.counter_hypothesis}</span>
              </div>
              <div>
                <span className="text-amber-400 font-semibold block">Prescribed Verification Test:</span>
                <span className="font-mono text-amber-300/90 bg-black/40 p-1.5 rounded block">
                  {d.audit_data.test_spec}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content / Abstract */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 mb-1.5 uppercase font-mono tracking-wider">
            Content & Synthesis
          </h3>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
            {d.content}
          </div>
        </div>

        {/* Code Snippet Viewer */}
        {d.type === 'code' && (
          <div>
            <h3 className="text-xs font-semibold text-cyan-400 mb-1.5 uppercase font-mono tracking-wider flex items-center justify-between">
              <span>Synthesized CPU Benchmark</span>
              <span className="text-[10px] text-zinc-500">Python 3.13</span>
            </h3>
            <div className="p-3 rounded-xl bg-black/70 border border-cyan-500/20 font-mono text-xs text-cyan-300/90 overflow-x-auto max-h-64">
              <pre>{d.content}</pre>
            </div>
          </div>
        )}

        {/* Patch Diff Viewer */}
        {meta.patch_diff && (
          <div>
            <h3 className="text-xs font-semibold text-emerald-400 mb-1.5 uppercase font-mono tracking-wider">
              Self-Healed Patch Diff
            </h3>
            <div className="p-3 rounded-xl bg-black/70 border border-emerald-500/20 font-mono text-xs text-emerald-300/90 overflow-x-auto">
              <pre>{meta.patch_diff}</pre>
            </div>
          </div>
        )}

        {/* Empirical Metrics Matrix */}
        {meta.metrics && (
          <div>
            <h3 className="text-xs font-semibold text-purple-400 mb-1.5 uppercase font-mono tracking-wider">
              Empirical Metrics Matrix
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(meta.metrics).map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-zinc-500 block text-[10px] capitalize">
                    {k.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-white text-sm">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {meta.tags && meta.tags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-1.5 uppercase font-mono tracking-wider">
              Lineage Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {meta.tags.map((t: string) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {d.type === 'result' && (
          <button
            onClick={() => setIsWhatIfOpen(true)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <GitFork size={14} />
            <span>Fork What-If Parameter Branch</span>
          </button>
        )}
      </div>
    </div>
  );
}
