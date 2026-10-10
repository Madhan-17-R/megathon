'use client';

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface ScoreGaugeProps {
  score: number | null;       // 0-100 or null if unavailable
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZE_CONFIG = {
  sm: { radius: 40, stroke: 7, textSize: 'text-2xl', labelSize: 'text-xs', containerSize: 100 },
  md: { radius: 60, stroke: 9, textSize: 'text-4xl', labelSize: 'text-sm', containerSize: 150 },
  lg: { radius: 80, stroke: 11, textSize: 'text-5xl', labelSize: 'text-base', containerSize: 200 },
};

function getScoreGradient(score: number) {
  if (score >= 80) return { from: '#10b981', to: '#059669', label: 'Excellent', ring: '#10b981' };
  if (score >= 65) return { from: '#22c55e', to: '#16a34a', label: 'Good', ring: '#22c55e' };
  if (score >= 50) return { from: '#f59e0b', to: '#d97706', label: 'Fair', ring: '#f59e0b' };
  if (score >= 35) return { from: '#f97316', to: '#ea580c', label: 'Poor', ring: '#f97316' };
  return { from: '#ef4444', to: '#dc2626', label: 'Very Poor', ring: '#ef4444' };
}

export default function ScoreGauge({ score, size = 'md', showLabel = true }: ScoreGaugeProps) {
  const { radius, stroke, textSize, labelSize, containerSize } = SIZE_CONFIG[size];
  
  const displayScore = score ?? 0;
  const { from, to, label, ring } = score === null 
    ? { from: '#4b5563', to: '#374151', label: 'Unavailable', ring: '#6b7280' } 
    : getScoreGradient(score);

  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const dashOffset = useMemo(
    () => circumference - (displayScore / 100) * circumference,
    [circumference, displayScore]
  );

  const center = containerSize / 2;
  const gradientId = `score-gradient-${size}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: containerSize, height: containerSize }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl transition-all duration-1000"
          style={{ background: ring }}
        />
        <svg
          width={containerSize}
          height={containerSize}
          viewBox={`0 0 ${containerSize} ${containerSize}`}
          className="relative"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        {/* Score text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${textSize} font-black text-white leading-none`}>
            {score === null ? '--' : score}
          </span>
          {size !== 'sm' && (
            <span className={`${labelSize} font-medium mt-0.5`} style={{ color: ring }}>
              / 100
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" style={{ color: ring }} />
          <span className="text-sm font-semibold" style={{ color: ring }}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
