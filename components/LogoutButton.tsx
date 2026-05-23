export function LogoutButton() {
  return (
    <a
      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
      href="/auth/logout"
    >
      ログアウト
    </a>
  );
}
