import React, { useState, useEffect } from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  RotateCw,
  Award,
  GitFork,
  Download,
  X,
  FastForward,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const demoStages = [
  {
    title: '1. Autonomous Ingestion',
    agent: 'Reader Agent',
    desc: 'Ingests arXiv:2106.09685 (LoRA), extracts low-rank matrix decomposition W + BA, and parses target baseline claims.',
    icon: Terminal,
    color: '#8b5cf6',
  },
  {
    title: '2. Adversarial Red-Team Audit',
    agent: 'Red-Team Critic',
    desc: 'Audits numerical claim bounds. Flags high-risk SRAM buffer overflow vulnerability under INT4 quantization.',
    icon: AlertTriangle,
    color: '#f59e0b',
  },
  {
    title: '3. Python CPU Kernel Synthesis',
    agent: 'Code-Gen Agent',
    desc: 'Synthesizes runnable PyTorch CPU forward/backward layer with tensor assertions.',
    icon: Terminal,
    color: '#06b6d4',
  },
  {
    title: '4. Deliberate Fault Injection & Sandbox Crash',
    agent: 'Subprocess Sandbox',
    desc: 'Simulates unaligned tensor contraction (128, 512) @ (256, 512), producing a real ValueError crash.',
    icon: RotateCw,
    color: '#f43f5e',
  },
  {
    title: '5. Autonomous Self-Healing in 0.4s',
    agent: 'Debugger Agent',
    desc: 'Parses traceback, retrieves failure memory, patches transpose alignment (B.T), and validates fix without humans.',
    icon: CheckCircle2,
    color: '#10b981',
  },
  {
    title: '6. Empirical Verification & Reproducibility Gauge',
    agent: 'Critic Agent',
    desc: 'Measures 94.2% accuracy vs 94.8% claimed baseline (delta -0.6%). Awards 94/100 Reproducibility Score.',
    icon: Award,
    color: '#a855f7',
  },
  {
    title: '7. What-If Parameter Ablation Branching',
    agent: 'Hypothesis Engine',
    desc: 'Forks rank r=16 ablation branch: +0.9% accuracy gain, +92% memory footprint.',
    icon: GitFork,
    color: '#f59e0b',
  },
  {
    title: '8. 1-Click Citation-Backed Literature Review',
    agent: 'Synthesis Publisher',
    desc: 'Compiles full literature review report with inline citation tags [Node #100] ready for Markdown/PDF export.',
    icon: Download,
    color: '#38bdf8',
  },
];

export default function AutoDemoModal() {
  const isOpen = useSynapseStore((s) => s.isAutoDemoOpen);
  const setIsOpen = useSynapseStore((s) => s.setIsAutoDemoOpen);
  const setTimelineStep = useSynapseStore((s) => s.setTimelineStep);
  const addToast = useSynapseStore((s) => s.addToast);

  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStage(0);
    setIsPlaying(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    // Advance stages automatically every 4.5 seconds
    const timer = setTimeout(() => {
      if (currentStage < demoStages.length - 1) {
        const next = currentStage + 1;
        setCurrentStage(next);
        setTimelineStep(Math.min(7, next));
      } else {
        setIsPlaying(false);
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {}
        addToast({
          title: '90-Sec Auto Demo Complete',
          message: 'All 8 stages reproduced and verified autonomously on CPU sandbox!',
          type: 'success',
        });
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentStage, setTimelineStep, addToast]);

  if (!isOpen) return null;

  const stage = demoStages[currentStage];
  const Icon = stage.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c0e14] border border-violet-500/30 p-8 shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: stage.color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <Play size={18} className="fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">90-Second Guided Auto Demo</h2>
              <p className="text-xs text-zinc-400">Zero typing needed • Autonomous empirical reproduction loop</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stage Card */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full border"
              style={{
                backgroundColor: `${stage.color}15`,
                color: stage.color,
                borderColor: `${stage.color}30`,
              }}
            >
              Stage {currentStage + 1} of {demoStages.length}
            </span>
            <span className="text-xs font-mono text-zinc-400">{stage.agent}</span>
          </div>

          <div className="flex items-start gap-4 mb-3">
            <div
              className="p-3 rounded-2xl border shrink-0"
              style={{
                backgroundColor: `${stage.color}15`,
                borderColor: `${stage.color}30`,
                color: stage.color,
              }}
            >
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{stage.title}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{stage.desc}</p>
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-between mb-6">
          {demoStages.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStage(idx);
                setTimelineStep(Math.min(7, idx));
              }}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentStage
                    ? 'scale-125 ring-4 ring-violet-500/30'
                    : idx < currentStage
                    ? 'bg-violet-600'
                    : 'bg-zinc-800'
                }`}
                style={{ backgroundColor: idx === currentStage ? s.color : undefined }}
              />
              <span className="text-[9px] font-mono mt-1 text-zinc-500 group-hover:text-zinc-300">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5"
          >
            {isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
            >
              Close Demo
            </button>
            <button
              onClick={() => {
                if (currentStage < demoStages.length - 1) {
                  const next = currentStage + 1;
                  setCurrentStage(next);
                  setTimelineStep(Math.min(7, next));
                } else {
                  setIsOpen(false);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>{currentStage < demoStages.length - 1 ? 'Next Step' : 'Finish & Explore Canvas'}</span>
              <FastForward size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
