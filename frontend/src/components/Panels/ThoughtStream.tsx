import React, { useState } from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import { Check, Pause, X, CornerDownRight, Cpu, Activity, Clock, ShieldAlert } from 'lucide-react';

export default function ThoughtStream() {
  const thoughts = useSynapseStore((s) => s.thoughts);
  const addThought = useSynapseStore((s) => s.addThought);
  const updateAgentScore = useSynapseStore((s) => s.updateAgentScore);
  const addToast = useSynapseStore((s) => s.addToast);

  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('codegen');
  const [redirectInstruction, setRedirectInstruction] = useState('');

  const handleGovernance = async (agentId: string, action: 'approve' | 'pause' | 'reject' | 'redirect') => {
    if (action === 'redirect') {
      setSelectedAgentId(agentId);
      setRedirectModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/agents/${agentId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.new_score !== undefined) {
        updateAgentScore(agentId, data.new_score, data.delta);
        addToast({
          title: `Governance: ${action.toUpperCase()}`,
          message: `Agent score updated to ${data.new_score} (${data.delta > 0 ? `+${data.delta}` : data.delta}).`,
          type: action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'info',
        });
      }
    } catch {
      // Offline fallback governance
      const delta = action === 'approve' ? 2 : action === 'reject' ? -5 : 0;
      addToast({
        title: `Offline Governance: ${action.toUpperCase()}`,
        message: `Applied ${delta > 0 ? `+${delta}` : delta} score delta.`,
        type: 'agent',
      });
    }
  };

  const submitRedirect = async () => {
    setRedirectModalOpen(false);
    addToast({
      title: 'Prompt Injection Dispatched',
      message: `Instruction injected into ${selectedAgentId}: "${redirectInstruction}"`,
      type: 'agent',
    });
    setRedirectInstruction('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0e14] text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-violet-400 animate-pulse" />
          <h3 className="text-sm font-semibold">Live Thought Stream</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time SSE</span>
        </div>
      </div>

      {/* Stream List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {thoughts.map((t) => (
          <div
            key={t.id}
            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="text-xs font-semibold text-violet-300">{t.agent_name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                  {t.phase}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                <Clock size={10} />
                <span>{t.latency_ms}ms</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-black/30 p-2.5 rounded-lg border border-white/5 mb-2.5 whitespace-pre-wrap">
              {t.reasoning}
            </p>

            {/* Governance Toolbar */}
            <div className="flex items-center justify-between pt-1 text-[10px]">
              <span className="text-zinc-500 font-mono">{t.timestamp}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleGovernance(t.agent_id, 'approve')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 font-medium border border-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                  title="Approve step (+2 Agent Score)"
                >
                  <Check size={10} />
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => handleGovernance(t.agent_id, 'pause')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-all"
                  title="Pause agent step"
                >
                  <Pause size={10} />
                </button>

                <button
                  onClick={() => handleGovernance(t.agent_id, 'reject')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 font-medium border border-rose-500/20 transition-all hover:scale-105 active:scale-95"
                  title="Reject step (-5 Agent Score)"
                >
                  <X size={10} />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => handleGovernance(t.agent_id, 'redirect')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 font-medium border border-cyan-500/20 transition-all hover:scale-105 active:scale-95"
                  title="Redirect step with custom instruction"
                >
                  <CornerDownRight size={10} />
                  <span>Redirect</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Redirect Instruction Modal */}
      {redirectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0c0e14] border border-cyan-500/30 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <CornerDownRight size={16} className="text-cyan-400" />
              <span>Redirect Agent Instruction</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Inject custom steering guidance directly into {selectedAgentId}'s active reasoning context.
            </p>
            <textarea
              value={redirectInstruction}
              onChange={(e) => setRedirectInstruction(e.target.value)}
              placeholder="e.g. Enforce INT4 tensor alignment guard or test batch_size=64..."
              className="w-full h-24 p-3 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 mb-4 font-mono resize-none"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setRedirectModalOpen(false)}
                className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={submitRedirect}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-md transition-all"
              >
                Inject Instruction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
