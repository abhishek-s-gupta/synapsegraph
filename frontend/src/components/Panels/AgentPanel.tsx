import React, { useState } from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import { Dna, Award, Zap, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';

export default function AgentPanel() {
  const agents = useSynapseStore((s) => s.agents);
  const setActivePromptDiff = useSynapseStore((s) => s.setActivePromptDiff);
  const updateAgentScore = useSynapseStore((s) => s.updateAgentScore);
  const addToast = useSynapseStore((s) => s.addToast);

  const [isMutating, setIsMutating] = useState(false);

  const handleTriggerEvolution = async () => {
    setIsMutating(true);
    addToast({
      title: 'Simulating Consecutive Failures',
      message: 'Code-Gen Agent dropping below retirement threshold (<60)...',
      type: 'agent',
    });

    try {
      const res = await fetch(`http://localhost:8000/api/agents/codegen/evolve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.prompt_diff) {
        updateAgentScore('codegen', data.evolved_score, data.evolved_score - 54);
        setActivePromptDiff({
          agent: 'Code-Gen Agent',
          v1: 'v1.0 (Retired at Score 54)',
          v2: 'v2.0 (Gen 2 Evolved at Score 82)',
          diff: data.prompt_diff,
          reason: data.reason,
        });
        addToast({
          title: '🧬 Agent Succession Triggered',
          message: 'Code-Gen Agent v1 retired and replaced by mutated Gen 2 with tensor shape assertions!',
          type: 'success',
        });
      }
    } catch {
      // Offline fallback evolution demonstration
      updateAgentScore('codegen', 82, 28);
      setActivePromptDiff({
        agent: 'Code-Gen Agent',
        v1: 'v1.0 (Retired at Score 54)',
        v2: 'v2.0 (Gen 2 Evolved at Score 82)',
        diff: `--- CodeGen Agent v1.0 System Prompt
+++ CodeGen Agent v2.0 (Gen 2 Evolved)
@@ -12,6 +12,12 @@
- Generate raw matrix multiplication for linear layers.
+ CRITICAL: Enforce explicit tensor transpose alignment:
+ assert matrix_a.shape[-1] == matrix_b.shape[0], f"Inner dim mismatch"
+ Use .T on weight matrices when contracting row-major tensors.
+ Insert CPU SRAM allocation budget assertion (<16KB peak).`,
        reason: 'Consecutive shape mismatch errors under INT4 tensor constraints (Score: 54 < 60).',
      });
      addToast({
        title: '🧬 Agent Evolution (Offline)',
        message: 'Replaced v1 with Gen 2 successor with updated tensor assertions.',
        type: 'success',
      });
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0e14] text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Award size={16} className="text-purple-400" />
            <h3 className="text-sm font-semibold">Agent Leaderboard & Evolution Arena</h3>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Baseline 80 • Verify +3 • Autofix +5 • Crash -3 • Retire &lt;60
          </p>
        </div>

        <button
          onClick={handleTriggerEvolution}
          disabled={isMutating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          title="Demonstrate retirement and successor spawn"
        >
          <Dna size={14} className={isMutating ? 'animate-spin' : ''} />
          <span>Trigger Mutation</span>
        </button>
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {agents.map((agent) => {
          const score = agent.score;
          const isHigh = score >= 85;
          const isWarning = score < 70;
          const isRetired = agent.status === 'retired';

          return (
            <div
              key={agent.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isRetired
                  ? 'bg-rose-950/20 border-rose-500/30 opacity-70'
                  : 'bg-white/[0.02] border-white/10 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {/* SVG Circular Score Ring */}
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-10 h-10 -rotate-90">
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="#1e293b"
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke={isRetired ? '#f43f5e' : isHigh ? '#a855f7' : isWarning ? '#f59e0b' : '#38bdf8'}
                        strokeWidth="3.5"
                        strokeDasharray={100}
                        strokeDashoffset={100 - score}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute font-mono text-xs font-bold text-white">
                      {score}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{agent.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-400">
                        Gen {agent.generation ?? 1}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 capitalize">{agent.role} Agent</div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      isRetired
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span className="capitalize">{agent.status}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-1">
                    {agent.runs ?? 12} runs
                  </div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-400">
                <div>
                  <span className="text-zinc-600 block">Success:</span>
                  <span className="text-zinc-300">
                    {Math.round((agent.metadata?.success_rate ?? 0.9) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-zinc-600 block">Avg Latency:</span>
                  <span className="text-zinc-300">{agent.metadata?.avg_latency_ms ?? 180}ms</span>
                </div>
                <div>
                  <span className="text-zinc-600 block">Prompt:</span>
                  <span className="text-purple-300 truncate block">
                    {agent.metadata?.prompt_version ?? 'v1.0-ind'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
