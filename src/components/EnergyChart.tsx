'use client';

import { EnergyBreakdown } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface EnergyChartProps {
  data: EnergyBreakdown[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-800/95 backdrop-blur px-4 py-3 shadow-2xl">
      <p className="text-xs font-semibold text-slate-300 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-8 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.fill }} />
            <span className="text-slate-400">{entry.name}</span>
          </span>
          <span className="font-semibold text-white">{entry.value.toLocaleString()} kWh</span>
        </div>
      ))}
    </div>
  );
};

export default function EnergyChart({ data }: EnergyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        barGap={4}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          tickFormatter={(v: string) =>
            v.length > 10 ? v.split(' ')[0] : v
          }
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="baseline" name="Baseline" radius={[4, 4, 0, 0]} fill="#64748b" />
        <Bar dataKey="improved" name="After Retrofits" radius={[4, 4, 0, 0]} fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}
