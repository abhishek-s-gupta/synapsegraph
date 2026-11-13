import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'emerald' | 'slate';
  size?: 'sm' | 'md';
}

const variantClasses: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function Badge({ children, variant = 'slate', size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClasses[variant]} ${sizeClass}`}
    >
      {children}
    </span>
  );
}
