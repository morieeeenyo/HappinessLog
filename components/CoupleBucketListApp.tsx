"use client";

import { useEffect, useMemo, useState } from "react";

type WishStatus = "planning" | "booked" | "done";

type WishItem = {
  id: number;
  title: string;
  status: WishStatus;
  note: string;
};

const initialItems: WishItem[] = [
  {
    id: 1,
    title: "海が見える宿に一泊する",
    status: "planning",
    note: "移動時間は片道2時間くらいまで"
  },
  {
    id: 2,
    title: "金曜の夜に手巻き寿司を作る",
    status: "booked",
    note: "好きな具材をそれぞれ3つ買う"
  },
  {
    id: 3,
    title: "二人の写真をアルバムにする",
    status: "planning",
    note: "旅行と記念日の写真から選ぶ"
  },
  {
    id: 4,
    title: "朝の散歩コースを開拓する",
    status: "done",
    note: "帰りにコーヒーを買う"
  }
];

const statusLabels: Record<WishStatus, string> = {
  planning: "相談中",
  booked: "予定あり",
  done: "達成"
};

const storageKey = "futari-list-items";

function normalizeItem(item: Partial<WishItem>): WishItem | null {
  if (!item.title) {
    return null;
  }

  const status = item.status === "booked" || item.status === "done" ? item.status : "planning";

  return {
    id: typeof item.id === "number" ? item.id : Date.now(),
    title: item.title,
    status,
    note: item.note || "まだメモはありません"
  };
}

export function CoupleBucketListApp() {
  const [items, setItems] = useState(initialItems);
  const [isHydrated, setIsHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    title: "",
    note: ""
  });

  useEffect(() => {
    const savedItems = window.localStorage.getItem(storageKey);
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems) as Array<Partial<WishItem>>;
        setItems(parsedItems.map(normalizeItem).filter((item): item is WishItem => Boolean(item)));
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [isHydrated, items]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const searchable = `${item.title} ${item.note}`.toLowerCase();
      return !normalizedQuery || searchable.includes(normalizedQuery);
    });
  }, [items, query]);

  const completedCount = items.filter((item) => item.status === "done").length;
  const activeCount = items.length - completedCount;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) {
      return;
    }

    setItems((current) => [
      {
        id: Date.now(),
        title,
        status: "planning",
        note: form.note.trim() || "まだメモはありません"
      },
      ...current
    ]);

    setForm((current) => ({
      ...current,
      title: "",
      note: ""
    }));
  };

  const cycleStatus = (id: number) => {
    const nextStatus: Record<WishStatus, WishStatus> = {
      planning: "booked",
      booked: "done",
      done: "planning"
    };

    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status: nextStatus[item.status] } : item))
    );
  };

  const removeItem = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] bg-ink px-6 py-7 text-white shadow-sm md:px-8 md:py-9">
          <p className="text-sm font-semibold text-aqua">Wishlist for Two</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric label="登録数" value={`${items.length}件`} />
            <Metric label="達成率" value={`${progressPercent}%`} />
            <Metric label="進行中" value={`${activeCount}件`} />
          </div>
        </div>

        <form className="rounded-[1.5rem] bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold text-ink">やりたいことを追加</h2>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              タイトル
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="例: 温泉でゆっくり過ごす"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              メモ
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20"
                rows={3}
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
                placeholder="条件や楽しみにしていること"
              />
            </label>

            <button className="w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-slate-800" type="submit">
              追加する
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink">やりたいことリスト</h2>
            <p className="mt-1 text-sm text-slate-600">相談中、予定あり、達成を押すたびに切り替えられます。</p>
          </div>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20 md:w-72"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="検索"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {visibleItems.map((item) => (
            <article className="rounded-2xl bg-white p-5 shadow-sm" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-ink">{item.title}</h3>
                </div>
                <button
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    item.status === "done"
                      ? "bg-emerald-100 text-emerald-700"
                      : item.status === "booked"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-amber-100 text-amber-800"
                  }`}
                  onClick={() => cycleStatus(item.id)}
                  type="button"
                >
                  {statusLabels[item.status]}
                </button>
              </div>

              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{item.note}</p>

              <div className="mt-4 flex justify-end">
                <button className="text-sm font-semibold text-slate-500 hover:text-red-600" onClick={() => removeItem(item.id)} type="button">
                  削除
                </button>
              </div>
            </article>
          ))}
        </div>

        {visibleItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            条件に合うやりたいことがありません。
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
