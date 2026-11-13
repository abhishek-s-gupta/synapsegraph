import React, { useEffect } from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import { Keyboard, X } from 'lucide-react';

const shortcuts = [
  { key: 'Ctrl + K', desc: 'Open Command Palette & Global Search' },
  { key: '?', desc: 'Toggle Keyboard Shortcuts Cheat Sheet' },
  { key: 'Space', desc: 'Play / Pause Historical Replay Timeline' },
  { key: 'D', desc: 'Launch 90-sec Guided Auto Demo' },
  { key: 'B', desc: 'Trigger Live Self-Healing (Break It)' },
  { key: 'W', desc: 'Open What-If Hyperparameter Branching' },
  { key: 'L', desc: 'Auto-Organize Graph Layout (Dagre)' },
  { key: 'G', desc: 'Scan Graph for Research Gaps' },
  { key: 'E', desc: 'Export Literature Review Report' },
  { key: '1 - 4', desc: 'Switch Right Panel Tabs (Thoughts/Arena/Inspector/Insights)' },
  { key: 'Esc', desc: 'Close any active modal or clear selection' },
];

export default function ShortcutsModal() {
  const isOpen = useSynapseStore((s) => s.isShortcutsOpen);
  const setIsOpen = useSynapseStore((s) => s.setIsShortcutsOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c0e14] border border-white/10 p-7 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <Keyboard size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-zinc-400">Power user keybindings for research operations</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <span className="text-xs text-zinc-300">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-black/60 border border-white/10 text-[11px] font-mono font-semibold text-violet-300 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-5 border-t border-white/10 text-xs text-zinc-500 font-mono">
          <span>Press ESC or ? to exit</span>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
