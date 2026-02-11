"use client";

import React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailySeriesPoint, MonthlySummary } from "@/lib/pointAggregator";

type Props = {
  summary: MonthlySummary;
  series: DailySeriesPoint[];
};

export function DashboardView({ summary, series }: Props) {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="今月の合計ポイント" value={String(summary.totalPoints)} />
        <StatCard label="目標ポイント" value={String(summary.targetPoints)} />
        <StatCard label="達成率" value={`${summary.progressPercent}%`} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">日別推移</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={series}>
              <XAxis dataKey="date" minTickGap={20} />
              <YAxis />
              <Tooltip />
              <Line dataKey="cumulative" stroke="#2EC4B6" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </article>
  );
}
