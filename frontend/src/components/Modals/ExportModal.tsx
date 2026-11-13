import React, { useState } from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import { Download, FileText, CheckCircle2, X, Printer, Code } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExportModal() {
  const isOpen = useSynapseStore((s) => s.isExportModalOpen);
  const setIsOpen = useSynapseStore((s) => s.setIsExportModalOpen);
  const currentWorkspaceId = useSynapseStore((s) => s.currentWorkspaceId);
  const addToast = useSynapseStore((s) => s.addToast);

  const [format, setFormat] = useState<'md' | 'pdf' | 'json'>('md');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(20);

    const timer1 = setTimeout(() => setProgress(60), 400);
    const timer2 = setTimeout(() => setProgress(90), 800);

    setTimeout(async () => {
      setProgress(100);
      setIsExporting(false);

      if (format === 'pdf') {
        window.open(`http://localhost:8000/api/workspaces/${currentWorkspaceId}/export?format=pdf&print=true`, '_blank');
      } else {
        window.location.href = `http://localhost:8000/api/workspaces/${currentWorkspaceId}/export?format=${format}`;
      }

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}

      addToast({
        title: 'Export Ready',
        message: `Compiled citation-backed literature review in ${format.toUpperCase()} format.`,
        type: 'success',
      });
      setIsOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c0e14] border border-white/10 p-7 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Download size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Literature Review Report</h2>
              <p className="text-xs text-zinc-400">Structured synthesis with inline citations & benchmark delta table</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Format Selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setFormat('md')}
            className={`p-3.5 rounded-xl border text-center transition-all ${
              format === 'md'
                ? 'bg-violet-600/20 border-violet-500 text-white shadow-lg'
                : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <FileText size={20} className="mx-auto mb-1.5 text-violet-400" />
            <div className="text-xs font-bold">Markdown (.md)</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">LaTeX & GitHub ready</div>
          </button>

          <button
            onClick={() => setFormat('pdf')}
            className={`p-3.5 rounded-xl border text-center transition-all ${
              format === 'pdf'
                ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Printer size={20} className="mx-auto mb-1.5 text-emerald-400" />
            <div className="text-xs font-bold">Printable PDF</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">High-res vector brief</div>
          </button>

          <button
            onClick={() => setFormat('json')}
            className={`p-3.5 rounded-xl border text-center transition-all ${
              format === 'json'
                ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg'
                : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Code size={20} className="mx-auto mb-1.5 text-cyan-400" />
            <div className="text-xs font-bold">JSON Manifest</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Graph DAG topology</div>
          </button>
        </div>

        {/* Included Sections Preview */}
        <div className="p-4 rounded-2xl bg-black/60 border border-white/5 mb-6 text-xs text-zinc-300 space-y-1.5">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
            Included Report Sections:
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Executive Summary & Mathematical Bounds</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Evidence Graph Taxonomy & Inline Citations [Node #100]</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Empirical Baseline vs Reproduced Delta Matrix</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Self-Healing Memory & Debugger Audit Trail</span>
          </div>
        </div>

        {/* Progress Bar if Exporting */}
        {isExporting && (
          <div className="mb-6">
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>Compiling literature taxonomy...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Generate & Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
