import { useEffect, useMemo, useState } from "react";
import { loadColorScheme, getIncomeColor, getExpenseColor } from "./Settings";

type Transaction = {
  id: number;
  date: string;
  amount: number;
  description: string;
  category: string;
  source: string;
};

function getMonthRange(offset: number) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const start = new Date(target.getFullYear(), target.getMonth(), 1);
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0);
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return { start: fmt(start), end: fmt(end) };
}

export default function Transactions() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

  const [colorScheme] = useState(loadColorScheme());
  const incomeColor = getIncomeColor(colorScheme);
  const expenseColor = getExpenseColor(colorScheme);

  const defaultRange = getMonthRange(0);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [categoryFilter, setCategoryFilter] = useState("すべて");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(
      `${API_BASE}/transactions?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`,
      { signal: controller.signal },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: Transaction[]) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((e) => {
        if ((e as { name?: string }).name !== "AbortError") {
          setError(
            "取引の取得に失敗しました。バックエンドが起動しているか確認してください。",
          );
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [API_BASE, startDate, endDate]);

  const categories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category));
    return ["すべて", ...Array.from(set).sort()];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const list =
      categoryFilter === "すべて"
        ? transactions
        : transactions.filter((t) => t.category === categoryFilter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, categoryFilter]);

  const handleCategoryChange = async (id: number, newCategory: string) => {
    setSavingId(id);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/transactions/${id}/category?category=${encodeURIComponent(newCategory)}`,
        { method: "PUT" },
      );
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }
      // バックエンド側で同じdescriptionの取引がまとめて更新されるため、
      // フロント側も同じdescriptionの行をまとめて反映する
      setTransactions((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target) return prev;
        return prev.map((t) =>
          t.description === target.description
            ? { ...t, category: newCategory }
            : t,
        );
      });
    } catch {
      setError("カテゴリの更新に失敗しました。");
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
        取引一覧
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-100 dark:border-gray-700 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="開始日"
            className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">〜</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            aria-label="終了日"
            className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="category-filter"
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            カテゴリ
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-100 dark:border-gray-700 mb-4 text-sm text-[#ea4335]">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-700">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            該当する取引がありません。
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-left text-xs text-gray-500 dark:text-gray-400">
                <th scope="col" className="py-2 font-medium">
                  日付
                </th>
                <th scope="col" className="py-2 font-medium">
                  内容
                </th>
                <th scope="col" className="py-2 font-medium">
                  カテゴリ
                </th>
                <th scope="col" className="py-2 font-medium text-right">
                  金額
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-100 dark:border-gray-700 last:border-0 text-gray-900 dark:text-gray-100"
                >
                  <td className="py-2 text-sm text-gray-500 dark:text-gray-400">
                    {t.date}
                  </td>
                  <td className="py-2 text-sm">{t.description}</td>
                  <td className="py-2 text-sm text-gray-500 dark:text-gray-400">
                    {editingId === t.id ? (
                      <select
                        autoFocus
                        defaultValue={t.category}
                        disabled={savingId === t.id}
                        onBlur={() => setEditingId(null)}
                        onChange={(e) =>
                          handleCategoryChange(t.id, e.target.value)
                        }
                        className="border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {categories
                          .filter((c) => c !== "すべて")
                          .concat(t.category)
                          .filter((c, i, arr) => arr.indexOf(c) === i)
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingId(t.id)}
                        className="underline decoration-dotted text-left"
                      >
                        {savingId === t.id ? "更新中..." : t.category}
                      </button>
                    )}
                  </td>
                  <td
                    className="py-2 text-sm text-right font-bold"
                    style={{ color: t.amount > 0 ? incomeColor : expenseColor }}
                  >
                    ¥{Math.abs(t.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
