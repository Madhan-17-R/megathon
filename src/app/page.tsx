'use client';

import Link from 'next/link';
import {
  Zap,
  PoundSterling,
  Leaf,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BarChart3,
  ClipboardList,
  Sparkles,
  Clock,
  Home,
  Info,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import ScoreGauge from '@/components/ScoreGauge';
import ComponentBreakdown from '@/components/ComponentBreakdown';
import EnergyChart from '@/components/EnergyChart';
import RecommendationCard from '@/components/RecommendationCard';

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay?: number;
}) {
  return (
    <div
      className="glass-card rounded-xl p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { assessment } = useApp();

  if (!assessment) {
    return (
      <div className="mesh-bg flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <Sparkles className="h-16 w-16 text-emerald-400 opacity-50" />
        <h1 className="text-3xl font-bold text-white">Welcome to GreenScore</h1>
        <p className="text-slate-400 max-w-md">
          Assess your property to generate your personalised Green Home Score and retrofit recommendations.
        </p>
        <Link
          href="/assess"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] transition-all duration-200"
        >
          <ClipboardList className="h-5 w-5" />
          Assess My Property
        </Link>
      </div>
    );
  }

  const {
    propertyName,
    propertyType,
    postcode,
    createdAt,
    greenScore,
    provisionalPoints,
    scoreCategory,
    scoreExplanation,
    components,
    annualEnergyKwh,
    annualCostGbp,
    annualCarbonKg,
    inefficiencyCount,
    potentialScoreGain,
    potentialCostSaving,
    potentialCarbonSaving,
    recommendations,
    energyBreakdown,
  } = assessment;

  const topRecs = recommendations.slice(0, 3);

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Demo banner ── */}
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
          <Info className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300/80">
            <span className="font-semibold text-amber-300">Demo mode — </span>
            all values are illustrative estimates. Assess your property for personalised results.
          </p>
        </div>

        {/* ── Page header ── */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              Energy Dashboard
            </h1>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <Home className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-sm text-slate-400">{propertyName}</span>
              <span className="text-slate-600">·</span>
              <span className="capitalize text-sm text-slate-400">{propertyType.replace('-', '\u2011')}</span>
              {postcode && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-sm text-slate-400">{postcode}</span>
                </>
              )}
              <span className="text-slate-600">·</span>
              <Clock className="h-3 w-3 text-slate-600" />
              <span className="text-xs text-slate-600">
                {new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          <Link
            href="/assess"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/15 transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            Re-assess Property
          </Link>
        </div>

        {/* ── Score hero ── */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Score card */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-4 lg:col-span-1 pulse-glow">
            <ScoreGauge score={greenScore} size="lg" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{scoreCategory}</p>
              {greenScore === null && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                  {provisionalPoints} Provisional Points
                </div>
              )}
              <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-xs">
                {scoreExplanation}
              </p>
            </div>
            <Link
              href="/recommendations"
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.02] transition-all duration-200"
            >
              View All Recommendations
            </Link>
          </div>

          {/* Metrics grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:grid-cols-2 content-start">
            <StatCard
              icon={<Zap className="h-5 w-5 text-blue-400" />}
              label="Annual energy use"
              value={`${annualEnergyKwh.toLocaleString()} kWh`}
              sub="Estimated — demo data"
              color="bg-blue-500/15"
              delay={50}
            />
            <StatCard
              icon={<PoundSterling className="h-5 w-5 text-amber-400" />}
              label="Annual energy cost"
              value={`£${annualCostGbp.toLocaleString()}`}
              sub="Based on avg. UK tariffs"
              color="bg-amber-500/15"
              delay={100}
            />
            <StatCard
              icon={<Leaf className="h-5 w-5 text-green-400" />}
              label="Annual CO₂ emissions"
              value={`${(annualCarbonKg / 1000).toFixed(1)} t`}
              sub={`${annualCarbonKg.toLocaleString()} kg CO₂e`}
              color="bg-green-500/15"
              delay={150}
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
              label="Inefficiencies found"
              value={String(inefficiencyCount)}
              sub="Areas with Poor or Fair rating"
              color="bg-red-500/15"
              delay={200}
            />

            {/* Potential uplift */}
            <div className="col-span-2 glass-card rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Retrofit potential</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] text-slate-500">Score gain</p>
                  <p className="text-xl font-black text-white">+{potentialScoreGain} pts</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Bill saving</p>
                  <p className="text-xl font-black text-emerald-400">£{potentialCostSaving}/yr</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Carbon saving</p>
                  <p className="text-xl font-black text-green-400">{(potentialCarbonSaving / 1000).toFixed(1)} t/yr</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Energy breakdown chart ── */}
        <section className="mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                  Energy Consumption Breakdown
                </h2>
                <p className="text-xs text-slate-500 mt-1">Baseline vs. projected after recommended retrofits (kWh/yr)</p>
              </div>
            </div>
            <EnergyChart data={energyBreakdown} />
          </div>
        </section>

        {/* ── Score component breakdown ── */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Score Breakdown</h2>
            <span className="text-xs text-slate-500">7 components assessed</span>
          </div>
          <ComponentBreakdown components={components} />
        </section>

        {/* ── Top retrofit recommendations ── */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Top Recommendations</h2>
            <Link
              href="/recommendations"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topRecs.map((rec, i) => (
              <RecommendationCard key={rec.id} rec={rec} index={i} />
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-600/5 p-8 text-center">
          <Sparkles className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Ready to improve your score?</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Assess your property to get a personalised Green Home Score and discover which retrofits will make the biggest difference.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/assess"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] transition-all duration-200"
            >
              <ClipboardList className="h-5 w-5" />
              Assess My Property
            </Link>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-all duration-200"
            >
              Ask the AI Assistant
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
