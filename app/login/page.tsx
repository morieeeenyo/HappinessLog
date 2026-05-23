import { LoginForm } from "@/components/LoginForm";
import { normalizeInternalPath } from "@/lib/auth";

type Props = {
  searchParams?: {
    error?: string;
    line_user_id?: string;
    next?: string;
  };
};

const errorMessages: Record<string, string> = {
  line_failed: "LINEログインに失敗しました。",
  not_allowed: "このLINEアカウントは許可されていません。",
  not_configured: "ログイン設定がまだ完了していません。"
};

export default function LoginPage({ searchParams }: Props) {
  const initialMessage = searchParams?.error ? errorMessages[searchParams.error] ?? "ログインできませんでした。" : null;
  const nextPath = normalizeInternalPath(searchParams?.next);

  return <LoginForm initialMessage={initialMessage} lineUserId={searchParams?.line_user_id ?? null} nextPath={nextPath} />;
}
