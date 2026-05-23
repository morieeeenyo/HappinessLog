"use client";

import { useEffect, useMemo, useState } from "react";

type WishStatus = "planning" | "booked" | "done";
type WishCategory = "date" | "travel" | "home" | "food" | "growth";
type Partner = "二人" | "Aさん" | "Bさん";

type WishItem = {
  id: number;
  title: string;
  category: WishCategory;
  status: WishStatus;
  owner: Partner;
  season: string;
  budget: number;
  note: string;
};

const initialItems: WishItem[] = [
  {
    id: 1,
    title: "海が見える宿に一泊する",
    category: "travel",
    status: "planning",
    owner: "二人",
    season: "夏",
    budget: 42000,
    note: "移動時間は片道2時間くらいまで"
  },
  {
    id: 2,
    title: "金曜の夜に手巻き寿司を作る",
    category: "food",
    status: "booked",
    owner: "Aさん",
    season: "今月",
    budget: 6000,
    note: "好きな具材をそれぞれ3つ買う"
  },
  {
    id: 3,
    title: "二人の写真をアルバムにする",
    category: "home",
    status: "planning",
    owner: "Bさん",
    season: "春",
    budget: 9000,
    note: "旅行と記念日の写真から選ぶ"
  },
  {
    id: 4,
    title: "朝の散歩コースを開拓する",
    category: "date",
    status: "done",
    owner: "二人",
    season: "週末",
    budget: 0,
    note: "帰りにコーヒーを買う"
  }
];

const categories: Array<{ value: WishCategory | "all"; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "date", label: "デート" },
  { value: "travel", label: "旅行" },
  { value: "home", label: "暮らし" },
  { value: "food", label: "食事" },
  { value: "growth", label: "学び" }
];

const statusLabels: Record<WishStatus, string> = {
  planning: "相談中",
  booked: "予定あり",
  done: "達成"
};

const categoryLabels: Record<WishCategory, string> = {
  date: "デート",
  travel: "旅行",
  home: "暮らし",
  food: "食事",
  growth: "学び"
};

const partners: Partner[] = ["二人", "Aさん", "Bさん"];
const storageKey = "futari-list-items";

export function CoupleBucketListApp() {
  const [items, setItems] = useState(initialItems);
  const [isHydrated, setIsHydrated] = useState(false);
  const [category, setCategory] = useState<WishCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "date" as WishCategory,
    owner: "二人" as Partner,
    season: "今月",
    budget: 5000,
    note: ""
  });

  useEffect(() => {
    const savedItems = window.localStorage.getItem(storageKey);
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems) as WishItem[]);
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
      const matchesCategory = category === "all" || item.category === category;
      const searchable = `${item.title} ${item.note} ${item.season} ${item.owner}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, items, query]);

  const completedCount = items.filter((item) => item.status === "done").length;
  const plannedBudget = items
    .filter((item) => item.status !== "done")
    .reduce((sum, item) => sum + item.budget, 0);
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) {
      return;
    }

    const budget = Number.isFinite(form.budget) ? Math.max(0, form.budget) : 0;

    setItems((current) => [
      {
        id: Date.now(),
        title,
        category: form.category,
        status: "planning",
        owner: form.owner,
        season: form.season.trim() || "いつか",
        budget,
        note: form.note.trim() || "まだメモはありません"
      },
      ...current
    ]);

    setForm((current) => ({
      ...current,
      title: "",
      note: "",
      budget: 5000
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
          <p className="text-sm font-semibold text-aqua">Couple Bucket List</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
            二人で叶えたいことを、相談から達成まで一緒に育てる。
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
            デート、旅行、暮らしの小さな願いをまとめて、担当・時期・予算・進み具合を一画面で確認できます。
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <Metric label="登録数" value={`${items.length}件`} />
            <Metric label="達成率" value={`${progressPercent}%`} />
            <Metric label="予定予算" value={`¥${plannedBudget.toLocaleString()}`} />
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

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-slate-700">
                種類
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value as WishCategory })}
                >
                  {categories
                    .filter((item) => item.value !== "all")
                    .map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                担当
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20"
                  value={form.owner}
                  onChange={(event) => setForm({ ...form, owner: event.target.value as Partner })}
                >
                  {partners.map((partner) => (
                    <option key={partner}>{partner}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-slate-700">
                時期
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20"
                  value={form.season}
                  onChange={(event) => setForm({ ...form, season: event.target.value })}
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                予算
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20"
                  min={0}
                  step={1000}
                  type="number"
                  value={form.budget}
                  onChange={(event) => setForm({ ...form, budget: Number(event.target.value) })}
                />
              </label>
            </div>

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
            <h2 className="text-2xl font-bold text-ink">二人のリスト</h2>
            <p className="mt-1 text-sm text-slate-600">相談中、予定あり、達成を押すたびに切り替えられます。</p>
          </div>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20 md:w-72"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="検索"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => {
            const selected = item.value === category;
            return (
              <button
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selected ? "bg-ink text-white" : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
                key={item.value}
                onClick={() => setCategory(item.value)}
                type="button"
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {visibleItems.map((item) => (
            <article className="rounded-2xl bg-white p-5 shadow-sm" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-aqua">{categoryLabels[item.category]}</p>
                  <h3 className="mt-1 text-xl font-bold text-ink">{item.title}</h3>
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

              <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <Info label="担当" value={item.owner} />
                <Info label="時期" value={item.season} />
                <Info label="予算" value={`¥${item.budget.toLocaleString()}`} />
              </dl>

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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <dt className="text-xs font-semibold text-slate-400">{label}</dt>
      <dd className="mt-1 truncate font-semibold text-slate-700">{value}</dd>
    </div>
  );
}
