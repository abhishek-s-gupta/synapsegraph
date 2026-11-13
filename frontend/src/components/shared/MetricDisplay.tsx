interface MetricDisplayProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export default function MetricDisplay({
  label,
  value,
  subtitle,
  trend,
  color = 'text-white',
}: MetricDisplayProps) {
  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold tabular-nums ${color}`}>{value}</span>
        {trend && (
          <span className={`text-xs ${trendColors[trend]}`}>{trendIcons[trend]}</span>
        )}
      </div>
      {subtitle && <span className="text-[10px] text-slate-500">{subtitle}</span>}
    </div>
  );
}
