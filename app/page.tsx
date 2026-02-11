import Link from "next/link";
import { DashboardView } from "@/components/DashboardView";
import {
  aggregateMonthlyPoints,
  buildDailySeries,
  type HappinessLog
} from "@/lib/pointAggregator";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_TARGET = 100;

export default async function DashboardPage() {
  let error: string | null = null;
  let userId: string | null = null;
  let totalPoints = 0;
  let targetPoints = DEFAULT_TARGET;
  let logs: HappinessLog[] = [];

  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const [logsResult, goalResult] = await Promise.all([
        supabase
          .from("happy_logs")
          .select("id,occurred_at,points")
          .gte("occurred_at", monthStart)
          .lte("occurred_at", monthEnd),
        supabase
          .from("monthly_goals")
          .select("target_points")
          .eq("month_start", monthStart.slice(0, 10))
          .maybeSingle()
      ]);

      if (logsResult.error) {
        throw logsResult.error;
      }

      if (goalResult.error) {
        throw goalResult.error;
      }

      logs = (logsResult.data ?? []).map((row) => ({
        id: row.id,
        occurredAt: row.occurred_at,
        points: row.points
      }));

      targetPoints = goalResult.data?.target_points ?? DEFAULT_TARGET;
      totalPoints = logs.reduce((sum, item) => sum + item.points, 0);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "データの読み込みに失敗しました";
  }

  const now = new Date();
  const summary = aggregateMonthlyPoints(logs, targetPoints, now);
  const series = buildDailySeries(logs, now);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-ink p-6 text-white">
        <h1 className="text-3xl font-bold">Happy Couple Points</h1>
        <p className="mt-2 text-sm text-slate-100">幸せを記録して、二人で目標を達成しよう。</p>
        <p className="mt-1 text-xs text-slate-200">{userId ? `Signed in: ${userId}` : "未ログイン"}</p>
        <div className="mt-4 flex gap-3">
          <Link href="/log" className="rounded-lg bg-aqua px-4 py-2 font-semibold text-ink">
            幸せを記録
          </Link>
          <Link href="/goal" className="rounded-lg border border-white px-4 py-2 font-semibold text-white">
            目標を設定
          </Link>
        </div>
      </header>

      {!userId && (
        <p className="rounded-lg bg-amber-100 p-3 text-amber-900">
          Supabase Authでログイン後に、夫婦テナントのデータが表示されます。
        </p>
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      <DashboardView summary={summary} series={series} />
      <p className="text-xs text-slate-600">月間合計: {totalPoints} points（DB集計値）</p>
    </div>
  );
}
