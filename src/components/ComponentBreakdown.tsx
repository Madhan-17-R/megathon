'use client';

import { ScoreComponent } from '@/lib/types';
import { Home, Flame, Square, Sun, Zap, Droplets, Wind } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  home: Home,
  flame: Flame,
  square: Square,
  sun: Sun,
  zap: Zap,
  droplets: Droplets,
  wind: Wind,
};

const STATUS_COLORS: Record<string, { bar: string; badge: string; text: string }> = {
  excellent: { bar: 'from-emerald-400 to-green-500', badge: 'bg-emerald-500/15 text-emerald-400', text: 'text-emerald-400' },
  good: { bar: 'from-green-400 to-teal-500', badge: 'bg-green-500/15 text-green-400', text: 'text-green-400' },
  fair: { bar: 'from-amber-400 to-orange-500', badge: 'bg-amber-500/15 text-amber-400', text: 'text-amber-400' },
  poor: { bar: 'from-red-400 to-rose-500', badge: 'bg-red-500/15 text-red-400', text: 'text-red-400' },
  unavailable: { bar: 'from-slate-500 to-slate-400', badge: 'bg-slate-500/15 text-slate-400', text: 'text-slate-400' },
};

interface ComponentBreakdownProps {
  components: ScoreComponent[];
}

export default function ComponentBreakdown({ components }: ComponentBreakdownProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {components.map((comp) => {
        const Icon = ICON_MAP[comp.icon] ?? Home;
        const colors = STATUS_COLORS[comp.status];
        const pct = comp.score !== null ? (comp.score / comp.maxScore) * 100 : 0;

        return (
          <div
            key={comp.id}
            className="group rounded-xl border border-white/8 bg-white/4 p-4 transition-all duration-200 hover:bg-white/7 hover:border-white/15"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8">
                  <Icon className="h-4 w-4 text-slate-300" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{comp.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{Math.round(comp.weight * 100)}% weight</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xl font-black ${colors.text}`}>{comp.score !== null ? comp.score : '--'}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                  {comp.status.charAt(0).toUpperCase() + comp.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3 h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-1000`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
              {comp.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
