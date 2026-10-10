'use client';

import { RetrofitRecommendation } from '@/lib/types';
import { DollarSign, Leaf, Zap, Clock, ToggleLeft, ToggleRight, TrendingUp } from 'lucide-react';

const PRIORITY_STYLES = {
  high: 'bg-red-500/15 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  low: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

interface RecommendationCardProps {
  rec: RetrofitRecommendation;
  onToggle?: (id: string) => void;
  showToggle?: boolean;
  index?: number;
}

export default function RecommendationCard({
  rec,
  onToggle,
  showToggle = false,
  index = 0,
}: RecommendationCardProps) {
  return (
    <div
      className={`group relative rounded-xl border p-5 transition-all duration-200
        ${rec.enabled
          ? 'border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/40'
          : 'border-white/8 bg-white/3 opacity-60 hover:opacity-80'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-xs font-bold text-slate-400">
            #{index + 1}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white leading-snug">{rec.title}</h3>
            <span className="text-[11px] text-slate-500">{rec.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[rec.priority]}`}
          >
            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} priority
          </span>
          {showToggle && onToggle && (
            <button
              onClick={() => onToggle(rec.id)}
              aria-label={rec.enabled ? 'Disable retrofit' : 'Enable retrofit'}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              {rec.enabled ? (
                <ToggleRight className="h-6 w-6 text-emerald-400" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-slate-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{rec.description}</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatPill
          icon={<DollarSign className="h-3.5 w-3.5" />}
          label="Est. cost"
          value={`£${rec.estimatedCost.toLocaleString()}`}
          color="text-slate-300"
        />
        <StatPill
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Annual saving"
          value={`£${rec.annualSaving}/yr`}
          color="text-emerald-400"
        />
        <StatPill
          icon={<Leaf className="h-3.5 w-3.5" />}
          label="CO₂ saving"
          value={`${(rec.carbonSavingKg / 1000).toFixed(1)} t/yr`}
          color="text-green-400"
        />
        <StatPill
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Payback"
          value={rec.paybackYears < 10 ? `${rec.paybackYears} yr` : `${rec.paybackYears} yr`}
          color={rec.paybackYears <= 5 ? 'text-emerald-400' : rec.paybackYears <= 15 ? 'text-amber-400' : 'text-slate-400'}
        />
      </div>

      {/* Score improvement pill */}
      <div className="mt-3 flex items-center gap-1.5">
        <Zap className="h-3 w-3 text-emerald-400" />
        <span className="text-[11px] text-emerald-400 font-medium">
          +{rec.scoreImprovement} point{rec.scoreImprovement !== 1 ? 's' : ''} to Green Score
        </span>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-white/5 px-2.5 py-2">
      <div className={`flex items-center gap-1 mb-0.5 ${color}`}>{icon}</div>
      <p className="text-[10px] text-slate-500 leading-none mb-0.5">{label}</p>
      <p className={`text-xs font-semibold ${color}`}>{value}</p>
    </div>
  );
}
