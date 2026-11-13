import React from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import { CheckCircle2, AlertOctagon, Info, Bot, X } from 'lucide-react';

export default function ToastContainer() {
  const toasts = useSynapseStore((s) => s.toasts);
  const removeToast = useSynapseStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isAgent = t.type === 'agent';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-2xl bg-[#0c0e14]/95 backdrop-blur-xl border shadow-2xl flex items-start gap-3 transition-all animate-slide-in-right ${
              isSuccess
                ? 'border-emerald-500/40 text-emerald-200'
                : isError
                ? 'border-rose-500/40 text-rose-200'
                : isAgent
                ? 'border-violet-500/40 text-violet-200'
                : 'border-white/10 text-zinc-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 size={16} className="text-emerald-400" />}
              {isError && <AlertOctagon size={16} className="text-rose-400" />}
              {isAgent && <Bot size={16} className="text-violet-400" />}
              {!isSuccess && !isError && !isAgent && <Info size={16} className="text-cyan-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-white leading-tight">{t.title}</h5>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-md text-zinc-500 hover:text-white shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
