"use client";

import Link from "next/link";
import { useState } from "react";
import { getPointsForCategory, isValidCategory } from "@/lib/pointPolicy";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export default function LogPage() {
  const [category, setCategory] = useState("gratitude");
  const [note, setNote] = useState("");
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16));
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidCategory(category)) {
      setMessage("カテゴリが不正です");
      return;
    }

    if (!isSupabaseConfigured()) {
      setMessage("Supabase環境変数が未設定です");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const points = getPointsForCategory(category);
      const { error } = await supabase.from("happy_logs").insert({
        category,
        note: note.trim() || null,
        points,
        occurred_at: new Date(occurredAt).toISOString()
      });

      if (error) {
        throw error;
      }

      setNote("");
      setMessage("記録しました");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">幸せの記録</h1>
        <Link className="text-sm underline" href="/">
          ダッシュボードへ戻る
        </Link>
      </header>

      <form className="space-y-4 rounded-2xl bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium">
          カテゴリ
          <select className="mt-1 w-full rounded-lg border p-2" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="gratitude">感謝</option>
            <option value="kindness">優しさ</option>
            <option value="teamwork">協力</option>
            <option value="celebration">お祝い</option>
            <option value="support">支え合い</option>
          </select>
        </label>

        <label className="block text-sm font-medium">
          メモ
          <textarea className="mt-1 w-full rounded-lg border p-2" rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
        </label>

        <label className="block text-sm font-medium">
          日時
          <input
            className="mt-1 w-full rounded-lg border p-2"
            type="datetime-local"
            value={occurredAt}
            onChange={(event) => setOccurredAt(event.target.value)}
            required
          />
        </label>

        <button className="rounded-lg bg-ink px-4 py-2 font-semibold text-white disabled:opacity-60" type="submit" disabled={isSaving}>
          {isSaving ? "保存中..." : "保存"}
        </button>
      </form>

      {message && <p className="rounded-lg bg-slate-100 p-3">{message}</p>}
    </div>
  );
}
