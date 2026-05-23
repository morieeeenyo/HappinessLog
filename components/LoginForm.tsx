"use client";

import { useState } from "react";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type Props = {
  initialMessage: string | null;
  lineUserId: string | null;
  nextPath: string;
};

export function LoginForm({ initialMessage, lineUserId, nextPath }: Props) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [isSending, setIsSending] = useState(false);
  const loginHref = `/auth/line?next=${encodeURIComponent(nextPath)}`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured()) {
      setMessage("メールログイン設定がまだ完了していません。");
      return;
    }

    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", nextPath);

    setIsSending(true);
    setMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo.toString()
        }
      });

      if (error) {
        throw error;
      }

      setMessage("ログイン用リンクをメールで送りました。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ログインメールの送信に失敗しました。");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-16">
      <div>
        <p className="text-sm font-semibold text-aqua">Futari List</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">ログイン</h1>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <a className="block rounded-xl bg-[#06C755] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#05b64e]" href={loginHref}>
          LINEでログイン
        </a>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          または
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            メールアドレス
            <input
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <button className="w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60" disabled={isSending} type="submit">
            {isSending ? "送信中" : "メールでログイン"}
          </button>
        </form>
      </div>

      {message && <p className="rounded-xl bg-white p-4 text-sm text-slate-700 shadow-sm">{message}</p>}
      {lineUserId && (
        <p className="rounded-xl bg-white p-4 text-xs leading-6 text-slate-600 shadow-sm">
          許可リストに追加するLINEユーザーID: <span className="font-mono">{lineUserId}</span>
        </p>
      )}
    </div>
  );
}
