"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

function toMonthStart(monthValue: string): string {
  return `${monthValue}-01`;
}

export default function GoalPage() {
  const thisMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [month, setMonth] = useState(thisMonth);
  const [targetPoints, setTargetPoints] = useState(100);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured()) {
      setMessage("Supabase環境変数が未設定です");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.from("monthly_goals").upsert(
        {
          month_start: toMonthStart(month),
          target_points: targetPoints
        },
        {
          onConflict: "couple_id,month_start"
        }
      );

      if (error) {
        throw error;
      }

      setMessage("目標を保存しました");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">月間目標</h1>
        <Link className="text-sm underline" href="/">
          ダッシュボードへ戻る
        </Link>
      </header>

      <form className="space-y-4 rounded-2xl bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium">
          対象月
          <input className="mt-1 w-full rounded-lg border p-2" type="month" value={month} onChange={(event) => setMonth(event.target.value)} required />
        </label>

        <label className="block text-sm font-medium">
          目標ポイント
          <input
            className="mt-1 w-full rounded-lg border p-2"
            type="number"
            min={1}
            value={targetPoints}
            onChange={(event) => setTargetPoints(Number(event.target.value))}
            required
          />
        </label>

        <button className="rounded-lg bg-ink px-4 py-2 font-semibold text-white disabled:opacity-60" type="submit" disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </button>
      </form>

      {message && <p className="rounded-lg bg-slate-100 p-3">{message}</p>}
    </div>
  );
}
