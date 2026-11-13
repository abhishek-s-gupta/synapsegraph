import React from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import { Dna, ShieldAlert, Sparkles, X, CheckCircle2 } from 'lucide-react';

export default function PromptDiffModal() {
  const isOpen = useSynapseStore((s) => s.isPromptDiffOpen);
  const setIsOpen = useSynapseStore((s) => s.setIsPromptDiffOpen);
  const activePromptDiff = useSynapseStore((s) => s.activePromptDiff);

  if (!isOpen || !activePromptDiff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c0e14] border border-purple-500/30 p-7 shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Dna size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Agent Genetic Mutation & Succession</h2>
              <p className="text-xs text-zinc-400">
                Reward dropped below threshold (&lt;60) • Mutated system prompt diff
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Retirement Banner */}
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 mb-5 flex items-start gap-2.5 text-xs text-rose-300">
          <ShieldAlert size={16} className="shrink-0 mt-0.5 text-rose-400" />
          <div>
            <span className="font-bold block mb-0.5">Retirement Triggered:</span>
            <span>{activePromptDiff.reason}</span>
          </div>
        </div>

        {/* Prompt Diff Box */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-zinc-300">
              System Prompt Mutation Diff (v1 → v2 Gen 2)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={11} /> +Asserts Injected
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black/80 border border-white/10 font-mono text-xs overflow-x-auto max-h-56">
            <pre className="whitespace-pre-wrap leading-relaxed text-zinc-300">
              {activePromptDiff.diff}
            </pre>
          </div>
        </div>

        {/* Mutation Parameters Summary */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-zinc-500 block">Retired Version:</span>
            <span className="text-rose-400 font-bold">CodeGen v1.0</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-zinc-500 block">Spawned Successor:</span>
            <span className="text-emerald-400 font-bold">CodeGen v2.0 (Gen 2)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-zinc-500 block">Re-initialized Score:</span>
            <span className="text-purple-300 font-bold">82 / 100</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => setIsOpen(false)}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg transition-all"
          >
            Accept Gen-2 Successor
          </button>
        </div>
      </div>
    </div>
  );
}
