import React from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';

const edgeStyles: Record<
  string,
  { stroke: string; strokeDasharray?: string; animation?: string; label: string; glow: string }
> = {
  cites: { stroke: '#64748b', strokeDasharray: 'none', label: 'cites', glow: 'rgba(100, 116, 139, 0.4)' },
  supports: { stroke: '#10b981', strokeDasharray: 'none', label: 'supports', glow: 'rgba(16, 185, 129, 0.4)' },
  contradicts: { stroke: '#f43f5e', strokeDasharray: '6 4', label: 'contradicts', glow: 'rgba(244, 63, 94, 0.5)' },
  answers: { stroke: '#8b5cf6', strokeDasharray: 'none', label: 'answers', glow: 'rgba(139, 92, 246, 0.4)' },
  generates_code: { stroke: '#06b6d4', strokeDasharray: '4 4', label: 'generates code', glow: 'rgba(6, 182, 212, 0.4)' },
  failed_with: { stroke: '#ef4444', strokeDasharray: '3 3', label: 'crashed with', glow: 'rgba(239, 68, 68, 0.6)' },
  patched_to: { stroke: '#22c55e', strokeDasharray: 'none', label: 'patched to', glow: 'rgba(34, 197, 94, 0.5)' },
  what_if_branch: { stroke: '#f59e0b', strokeDasharray: '6 3', label: 'what-if branch', glow: 'rgba(245, 158, 11, 0.5)' },
};

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const relation = (data as any)?.relation || 'supports';
  const cfg = edgeStyles[relation] || edgeStyles.supports;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Background glow path */}
      <path
        d={edgePath}
        fill="none"
        stroke={cfg.glow}
        strokeWidth={selected ? 6 : 4}
        className="transition-all duration-300 pointer-events-none"
      />

      {/* Main Path */}
      <path
        id={id}
        style={{
          ...style,
          stroke: cfg.stroke,
          strokeWidth: selected ? 2.5 : 1.75,
          strokeDasharray: cfg.strokeDasharray,
          fill: 'none',
        }}
        className="react-flow__edge-path transition-all"
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Animated Flow Particle Travelling Along the Edge */}
      <circle r="3" fill={cfg.stroke} filter="drop-shadow(0 0 4px currentColor)">
        <animateMotion dur={relation === 'generates_code' ? '1.5s' : '3s'} repeatCount="indefinite" path={edgePath} />
      </circle>

      {/* Relational Edge Label */}
      <foreignObject
        width={110}
        height={26}
        x={labelX - 55}
        y={labelY - 13}
        className="pointer-events-none"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex items-center justify-center h-full">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium backdrop-blur-md shadow-sm select-none border transition-all"
            style={{
              backgroundColor: 'rgba(7, 8, 12, 0.85)',
              color: cfg.stroke,
              borderColor: `${cfg.stroke}44`,
            }}
          >
            {cfg.label}
          </span>
        </div>
      </foreignObject>
    </>
  );
}
