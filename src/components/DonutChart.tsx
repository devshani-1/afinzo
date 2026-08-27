import React, { useState } from 'react';
import { ExpenseCategoryBreakdown } from '../types/financial';

interface DonutChartProps {
  data: ExpenseCategoryBreakdown[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  centerLabel = 'Monthly Outflows',
  centerValue,
  size = 240,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 p-8 text-center"
        style={{ width: size, height: size }}
      >
        <p className="text-xs font-medium">No expense data available</p>
      </div>
    );
  }

  const radius = size * 0.4;
  const strokeWidth = size * 0.16;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  let cumulativePercent = 0;

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={normalizedRadius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {data.map((item, index) => {
          const itemPercent = item.amount / total;
          const strokeDashoffset = circumference - itemPercent * circumference;
          const rotation = cumulativePercent * 360;
          cumulativePercent += itemPercent;

          const isHovered = hoveredIndex === index;

          return (
            <circle
              key={item.id}
              cx={size / 2}
              cy={size / 2}
              r={normalizedRadius}
              stroke={item.color}
              strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{
                strokeDashoffset,
                transformOrigin: '50% 50%',
                transform: `rotate(${rotation}deg)`,
                transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
              }}
              fill="none"
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-200 hover:opacity-90"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
        {activeItem ? (
          <>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate max-w-[130px]">
              {activeItem.name}
            </span>
            <span className="text-lg font-bold text-slate-900">
              ${Math.round(activeItem.amount).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {((activeItem.amount / total) * 100).toFixed(1)}% of total
            </span>
          </>
        ) : (
          <>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {centerLabel}
            </span>
            <span className="text-xl font-bold text-slate-900">
              {centerValue || `$${Math.round(total).toLocaleString()}`}
            </span>
            <span className="text-[10px] text-slate-400">Hover for details</span>
          </>
        )}
      </div>
    </div>
  );
};
