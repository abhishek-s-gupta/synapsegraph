import React, { useEffect, useRef } from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import {
  ArrowRight,
  Play,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  RotateCw,
  GitFork,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Github,
  Zap,
} from 'lucide-react';

const loopStages = [
  {
    step: '01',
    title: 'Collect',
    desc: 'Ingests multi-modal research artifacts: arXiv links, LaTeX tarballs, GitHub repos, and raw checkpoints into a unified graph schema.',
    icon: FileText,
    badge: 'Multi-Modal Ingestion',
    color: '#8b5cf6',
  },
  {
    step: '02',
    title: 'Organize',
    desc: 'Autonomous DAG structuring decomposes monolithic papers into interconnected nodes: Mathematical Claims, Hypotheses, Datasets, and Kernels.',
    icon: Layers,
    badge: 'Dynamic DAG Synthesis',
    color: '#38bdf8',
  },
  {
    step: '03',
    title: 'Understand',
    desc: 'Adversarial Red-Team Critic agent scans mathematical proofs, hyperparameter bounds, and dataset distributions for silent vulnerabilities.',
    icon: AlertTriangle,
    badge: 'Red-Team Audit',
    color: '#f59e0b',
  },
  {
    step: '04',
    title: 'Experiment',
    desc: 'Code-Gen Agent synthesizes clean Python/PyTorch harnesses. Executes in an isolated CPU sandbox container with zero GPU requirements.',
    icon: Terminal,
    badge: 'Subprocess CPU Sandbox',
    color: '#06b6d4',
  },
  {
    step: '05',
    title: 'Learn & Self-Heal',
    desc: 'When execution crashes, Debugger Agent reads tracebacks, queries persistent failure memory, patches tensor dimensions, and heals code in 0.4s.',
    icon: RotateCw,
    badge: 'Self-Healing Memory',
    color: '#10b981',
  },
  {
    step: '06',
    title: 'Share & Branch',
    desc: '1-click citation-backed literature review export (Markdown/PDF) and git-style what-if hyperparameter branching.',
    icon: GitFork,
    badge: 'Citation Review Export',
    color: '#a855f7',
  },
];

const agentCards = [
  {
    name: 'Reader Agent',
    role: 'Entity & Bound Parser',
    score: 84,
    status: 'Active',
    gen: 'v1.0',
    desc: 'Parses empirical claims, dataset schemas, and mathematical constraints directly from arXiv PDFs and repositories.',
    color: '#8b5cf6',
    metric: '18 Papers Ingested',
  },
  {
    name: 'Code-Gen Agent',
    role: 'CPU Benchmark Synthesizer',
    score: 82,
    status: 'Gen-2 Evolved',
    gen: 'v2.0',
    desc: 'Synthesizes clean CPU benchmark scripts with INT4 tensor allocations and memory overflow assertions.',
    color: '#06b6d4',
    metric: '15 Kernels Generated',
  },
  {
    name: 'Debugger Agent',
    role: 'Autonomous Crash Doctor',
    score: 97,
    status: 'Active',
    gen: 'v1.0',
    desc: 'Extracts Python tracebacks, retrieves persistent failure memories, and patches dimension mismatches in 0.4s.',
    color: '#10b981',
    metric: '9 Faults Auto-Patched',
  },
  {
    name: 'Red-Team Critic',
    role: 'Hallucination & Claim Auditor',
    score: 86,
    status: 'Active',
    gen: 'v1.0',
    desc: 'Verifies reproduced accuracy vs claimed baselines, flags SRAM buffer spills, and prevents optimistic bias.',
    color: '#f59e0b',
    metric: '14 Claims Audited',
  },
];

export default function LandingPage() {
  const setActivePage = useSynapseStore((s) => s.setActivePage);
  const setIsAutoDemoOpen = useSynapseStore((s) => s.setIsAutoDemoOpen);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background Interactive Knowledge Graph Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Drifting graph nodes
    const nodeCount = 38;
    const nodes = Array.from({ length: nodeCount }).map((_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.5 + 2,
      color: i % 4 === 0 ? '#8b5cf6' : i % 4 === 1 ? '#06b6d4' : i % 4 === 2 ? '#10b981' : '#f59e0b',
      pulse: Math.random() * Math.PI,
    }));

    // Flowing thought packets along edges
    const packets = Array.from({ length: 8 }).map(() => ({
      source: Math.floor(Math.random() * nodeCount),
      target: Math.floor(Math.random() * nodeCount),
      progress: Math.random(),
      speed: 0.005 + Math.random() * 0.005,
    }));

    const render = () => {
      ctx.fillStyle = '#07080C';
      ctx.fillRect(0, 0, width, height);

      // Draw Edges
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.18 * (1 - dist / 140)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Thought Packets
      packets.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.source = Math.floor(Math.random() * nodeCount);
          p.target = Math.floor(Math.random() * nodeCount);
        }
        const s = nodes[p.source];
        const t = nodes[p.target];
        const px = s.x + (t.x - s.x) * p.progress;
        const py = s.y + (t.y - s.y) * p.progress;

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.pulse += 0.03;

        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + Math.sin(n.pulse) * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#07080C] text-white overflow-x-hidden selection:bg-violet-500 selection:text-white">
      {/* Interactive Background Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />

      {/* Atmospheric Top Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-violet-600/15 via-purple-600/5 to-transparent blur-[120px] pointer-events-none z-0" />

      {/* Top Navbar */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <div className="w-full h-full bg-[#0c0e14] rounded-xl flex items-center justify-center">
              <span className="font-mono font-bold text-sm bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                SG
              </span>
            </div>
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white">SynapseGraph</span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
              v2.0 Beta
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAutoDemoOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Play size={12} className="fill-current text-cyan-400" />
            <span>90-sec Demo</span>
          </button>

          <button
            onClick={() => setActivePage('workspace')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all hover:scale-105 active:scale-95"
          >
            <span>Launch Workspace</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 mb-8 backdrop-blur-md shadow-inner">
          <Sparkles size={13} className="text-violet-400 animate-pulse" />
          <span>Multi-Agent Self-Evolving Research Canvas</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span className="text-cyan-400 font-mono text-[11px]">CPU Sandbox (No GPU)</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.08] text-white mb-6">
          Research that{' '}
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            reproduces itself.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          An animated visual canvas where a self-evolving team of AI agents parses papers, synthesizes benchmarks, heals execution crashes, and lets researchers steer every decision.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => setActivePage('workspace')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_35px_rgba(139,92,246,0.6)] flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 group"
          >
            <span>Launch Research Canvas</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setIsAutoDemoOpen(true)}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-semibold text-sm backdrop-blur-md shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Play size={14} className="fill-current text-cyan-400" />
            <span>Watch 90-sec Auto Demo</span>
          </button>
        </div>

        {/* Live Counters Banner */}
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">1,428</div>
            <div className="text-xs text-zinc-400 mt-1">Papers Auto-Parsed</div>
          </div>
          <div className="border-x border-white/10 px-4">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">892</div>
            <div className="text-xs text-zinc-400 mt-1">Crashes Self-Healed</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">94.6%</div>
            <div className="text-xs text-zinc-400 mt-1">Mean Reproducibility</div>
          </div>
        </div>

        {/* Supported Sources Marquee */}
        <div className="mt-12 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Supported Literature & Repository Formats
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400 font-mono text-xs opacity-70">
            <span>• arXiv Preprints</span>
            <span>• GitHub Repos</span>
            <span>• PyTorch Kernels</span>
            <span>• NeurIPS / ICML</span>
            <span>• HuggingFace Hub</span>
            <span>• PDF & LaTeX</span>
            <span>• CSV Benchmark Splits</span>
          </div>
        </div>
      </section>

      {/* The 6-Stage Loop Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest mb-2">
            The Autonomous Research Loop
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            From raw arXiv paper to verified empirical benchmark in 6 steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loopStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="group p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-violet-500/40 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-zinc-700 group-hover:text-violet-400 transition-colors">
                    {stage.step}
                  </span>
                  <span
                    className="text-[10px] font-mono px-2.5 py-1 rounded-full border font-semibold"
                    style={{
                      backgroundColor: `${stage.color}15`,
                      color: stage.color,
                      borderColor: `${stage.color}30`,
                    }}
                  >
                    {stage.badge}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="p-2.5 rounded-xl border"
                    style={{
                      backgroundColor: `${stage.color}15`,
                      borderColor: `${stage.color}30`,
                      color: stage.color,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{stage.title}</h3>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{stage.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Meet the Agents Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/10 bg-white/[0.01]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-2">
            The Multi-Agent Registry
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            Meet the self-evolving agents behind the canvas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agentCards.map((agent) => (
            <div
              key={agent.name}
              className="p-6 rounded-3xl bg-[#0c0e14] border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="4" fill="none" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke={agent.color}
                      strokeWidth="4"
                      strokeDasharray={125}
                      strokeDashoffset={125 - (agent.score / 100) * 125}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute font-mono text-xs font-bold text-white">
                    {agent.score}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 block">
                    {agent.status}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{agent.gen}</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-0.5">{agent.name}</h4>
              <div className="text-[11px] font-mono text-zinc-400 mb-3">{agent.role}</div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">{agent.desc}</p>

              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Achievement:</span>
                <span className="text-zinc-200 font-semibold">{agent.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem vs Solution Split Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest mb-2">
            Why We Built SynapseGraph
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            The Organization & Execution Gaps in Modern AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <div className="p-8 rounded-3xl bg-rose-950/15 border border-rose-500/20 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-rose-300 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              <span>The Broken Research Status Quo</span>
            </h3>
            <ul className="space-y-3.5 text-xs text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>The Organization Gap:</strong> 60+ open browser tabs, lost hyperparameter configs, untracked ablations, and siloed notes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>The Execution Gap:</strong> Non-reproducible baselines, missing seed definitions, and broken CUDA dependency cascades.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>Silent Hallucinations:</strong> Optimistic benchmark numbers reported without adversarial claim audits or memory bounds.</span>
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="p-8 rounded-3xl bg-violet-950/15 border border-violet-500/20 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-violet-300 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} />
              <span>The SynapseGraph Solution</span>
            </h3>
            <ul className="space-y-3.5 text-xs text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">•</span>
                <span><strong>Autonomous Visual Canvas:</strong> Dynamic DAG structuring connecting papers, hypotheses, code, crashes, and verified results.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">•</span>
                <span><strong>Self-Healing CPU Execution:</strong> Isolated sandbox container where Debugger Agent patches code crashes in 0.4 seconds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">•</span>
                <span><strong>Human-in-the-Loop Governance:</strong> Full control over agent decisions, reward scores, and genetic prompt succession.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#07080C] px-6 py-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">SynapseGraph</span>
            <span>• Pure Software Multi-Agent System on CPU</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>FastAPI</span>
            <span>•</span>
            <span>React Flow</span>
            <span>•</span>
            <span>Framer Motion</span>
            <span>•</span>
            <span>SQLite</span>
            <span>•</span>
            <span>PyTorch-CPU</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
