import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { useSynapseStore } from '../../store/synapseStore';
import {
  Search,
  Play,
  Flame,
  GitFork,
  FileText,
  Terminal,
  HelpCircle,
  Download,
  Dna,
  Layers,
  Network,
  X,
} from 'lucide-react';

export default function CommandPalette() {
  const isOpen = useSynapseStore((s) => s.isCommandPaletteOpen);
  const setIsOpen = useSynapseStore((s) => s.setIsCommandPaletteOpen);
  const nodes = useSynapseStore((s) => s.nodes);
  const selectNode = useSynapseStore((s) => s.selectNode);
  const setViewMode = useSynapseStore((s) => s.setViewMode);
  const setIsAutoDemoOpen = useSynapseStore((s) => s.setIsAutoDemoOpen);
  const setIsBreakItModalOpen = useSynapseStore((s) => s.setIsBreakItModalOpen);
  const setIsWhatIfOpen = useSynapseStore((s) => s.setIsWhatIfOpen);
  const setIsExportModalOpen = useSynapseStore((s) => s.setIsExportModalOpen);
  const triggerLayout = useSynapseStore((s) => s.triggerLayout);

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0c0e14] border border-white/10 shadow-2xl overflow-hidden">
        <Command className="w-full text-white bg-transparent">
          {/* Input Header */}
          <div className="flex items-center px-4 py-3 border-b border-white/10">
            <Search size={16} className="text-zinc-500 mr-2.5 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search nodes (e.g. 'reproduce', 'break it', 'LoRA')..."
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-zinc-500 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-xs space-y-1">
            <Command.Empty className="p-4 text-center text-zinc-500 font-mono text-xs">
              No matching actions or nodes found.
            </Command.Empty>

            {/* Quick Actions Group */}
            <Command.Group heading="Actions & Tools" className="text-[10px] uppercase font-mono text-zinc-500 px-2 py-1">
              <Command.Item
                onSelect={() => {
                  setIsOpen(false);
                  setIsAutoDemoOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-zinc-200 hover:bg-violet-600 hover:text-white transition-colors"
              >
                <Play size={14} className="text-violet-400" />
                <span className="font-medium text-xs">Launch 90-sec Auto Demo</span>
                <span className="ml-auto text-[10px] font-mono text-zinc-500">Guided Tour</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setIsOpen(false);
                  setIsBreakItModalOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-zinc-200 hover:bg-rose-600 hover:text-white transition-colors"
              >
                <Flame size={14} className="text-rose-400" />
                <span className="font-medium text-xs">Live Self-Healing: Break It</span>
                <span className="ml-auto text-[10px] font-mono text-zinc-500">Fault Injection</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setIsOpen(false);
                  setIsWhatIfOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-zinc-200 hover:bg-purple-600 hover:text-white transition-colors"
              >
                <GitFork size={14} className="text-purple-400" />
                <span className="font-medium text-xs">Fork What-If Parameter Branch</span>
                <span className="ml-auto text-[10px] font-mono text-zinc-500">Ablation</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setIsOpen(false);
                  triggerLayout();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-zinc-200 hover:bg-cyan-600 hover:text-white transition-colors"
              >
                <Network size={14} className="text-cyan-400" />
                <span className="font-medium text-xs">Apply Dagre Auto-Layout</span>
                <span className="ml-auto text-[10px] font-mono text-zinc-500">DAG Align</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setIsOpen(false);
                  setIsExportModalOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-zinc-200 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                <Download size={14} className="text-emerald-400" />
                <span className="font-medium text-xs">Export Literature Review Report</span>
                <span className="ml-auto text-[10px] font-mono text-zinc-500">PDF / MD</span>
              </Command.Item>
            </Command.Group>

            {/* Nodes Group */}
            <Command.Group heading="Canvas Nodes" className="text-[10px] uppercase font-mono text-zinc-500 px-2 py-1 mt-2">
              {nodes.map((n) => (
                <Command.Item
                  key={n.id}
                  onSelect={() => {
                    setIsOpen(false);
                    selectNode(n.id);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-zinc-200 hover:bg-white/10 transition-colors"
                >
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                    {n.data.type}
                  </span>
                  <span className="font-medium text-xs truncate max-w-sm">{n.data.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] text-zinc-500 font-mono">
            <span>Navigation: ↑ ↓ • Select: ↵</span>
            <span>ESC to close</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
