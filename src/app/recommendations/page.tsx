'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  TrendingUp,
  Leaf,
  PoundSterling,
  Filter,
  Zap,
  ClipboardList,
  ToggleRight,
  Info,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import ScoreGauge from '@/components/ScoreGauge';
import RecommendationCard from '@/components/RecommendationCard';
import { RetrofitRecommendation } from '@/lib/types';

type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export default function RecommendationsPage() {
  const { assessment, toggleRetrofit } = useApp();
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  const filtered = useMemo<RetrofitRecommendation[]>(() => {
    const recs = assessment?.recommendations ?? [];
    if (priorityFilter === 'all') return recs;
    return recs.filter((r) => r.priority === priorityFilter);
  }, [assessment?.recommendations, priorityFilter]);

  // Simulated improved score (add score improvement of enabled recs)
  const baseScore = assessment?.greenScore ?? 0;
  const improvedScore = useMemo(() => {
    const recs = assessment?.recommendations ?? [];
    const gain = recs
      .filter((r) => r.enabled)
      .reduce((a, r) => a + r.scoreImprovement, 0);
    return Math.min(100, baseScore + gain);
  }, [assessment?.recommendations, baseScore]);

  const enabledCount = (assessment?.recommendations ?? []).filter((r) => r.enabled).length;
  const totalSaving = (assessment?.recommendations ?? []).filter((r) => r.enabled).reduce((a, r) => a + r.annualSaving, 0);
  const totalCarbon = (assessment?.recommendations ?? []).filter((r) => r.enabled).reduce((a, r) => a + r.carbonSavingKg, 0);
  const totalCost = (assessment?.recommendations ?? []).filter((r) => r.enabled).reduce((a, r) => a + r.estimatedCost, 0);

  if (!assessment) {
    return (
      <div className="mesh-bg flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
        <Lightbulb className="h-16 w-16 text-emerald-400 opacity-50" />
        <h1 className="text-2xl font-bold text-white">No assessment yet</h1>
        <p className="text-slate-400 max-w-sm">Assess your property first to see personalised retrofit recommendations.</p>
        <Link
          href="/assess"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.03] transition-all"
        >
          <ClipboardList className="h-5 w-5" />
          Assess My Property
        </Link>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white sm:text-3xl flex items-center gap-3">
            <Lightbulb className="h-7 w-7 text-emerald-400" />
            Retrofit Recommendations
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Toggle retrofits on/off to explore what-if scenarios and see how your score and savings change.
          </p>
        </div>

        {/* Info banner */}
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-300/80 leading-relaxed">
            <span className="font-semibold text-blue-300">Demo estimates — </span>
            costs and savings are indicative. Use the toggle switches to experiment with different retrofit combinations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: What-if panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4">
              {/* Score comparison */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-sm font-bold text-white mb-5">Score Comparison</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <ScoreGauge score={baseScore} size="sm" />
                    <p className="text-xs text-slate-500 text-center">Baseline</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ScoreGauge score={improvedScore} size="sm" />
                    <p className="text-xs text-emerald-400 text-center font-medium">
                      After selected retrofits
                    </p>
                  </div>
                </div>
                {improvedScore > baseScore && (
                  <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 text-center">
                    <p className="text-xs text-slate-400">Score improvement</p>
                    <p className="text-2xl font-black text-emerald-400">+{improvedScore - baseScore} pts</p>
                  </div>
                )}
              </div>

              {/* Summary stats */}
              <div className="glass-card rounded-2xl p-5">
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <ToggleRight className="h-4 w-4 text-emerald-400" />
                  Selected retrofits ({enabledCount}/{(assessment?.recommendations ?? []).length})
                </h2>
                <div className="flex flex-col gap-3">
                  <StatRow
                    icon={<PoundSterling className="h-3.5 w-3.5 text-emerald-400" />}
                    label="Total upfront cost"
                    value={`£${totalCost.toLocaleString()}`}
                    sub="Estimated"
                    color="text-white"
                  />
                  <StatRow
                    icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
                    label="Annual bill saving"
                    value={`£${totalSaving.toLocaleString()}/yr`}
                    color="text-emerald-400"
                  />
                  <StatRow
                    icon={<Leaf className="h-3.5 w-3.5 text-green-400" />}
                    label="CO₂ saving"
                    value={`${(totalCarbon / 1000).toFixed(1)} t CO₂/yr`}
                    color="text-green-400"
                  />
                  {totalSaving > 0 && (
                    <StatRow
                      icon={<Zap className="h-3.5 w-3.5 text-amber-400" />}
                      label="Average payback"
                      value={`${(totalCost / totalSaving).toFixed(1)} yrs`}
                      color="text-amber-400"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Recommendations list */}
          <div className="lg:col-span-2">
            {/* Filter */}
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-xs text-slate-500">Filter:</span>
              {(['all', 'high', 'medium', 'low'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setPriorityFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    priorityFilter === f
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/8 hover:bg-white/10'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)} priority
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {filtered.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center text-slate-500">
                  No recommendations match the selected filter.
                </div>
              ) : (
                filtered.map((rec, i) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    index={i}
                    onToggle={toggleRetrofit}
                    showToggle
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-600">{sub}</p>}
      </div>
    </div>
  );
}
