import Link from "next/link";
import { CoupleBucketListApp } from "@/components/CoupleBucketListApp";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link className="text-xl font-bold text-ink" href="/">
          Futari List
        </Link>
        <nav className="flex gap-2 text-sm font-semibold">
          <Link className="rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:bg-slate-100" href="/log">
            幸せ記録
          </Link>
          <Link className="rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:bg-slate-100" href="/goal">
            月間目標
          </Link>
        </nav>
      </header>

      <CoupleBucketListApp />
    </div>
  );
}
