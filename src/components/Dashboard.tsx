import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = [
  "#ea4335",
  "#1a73e8",
  "#fbbc04",
  "#34a853",
  "#8b5cf6",
  "#ec4899",
];

type Summary = {
  income: number;
  expense: number;
  balance: number;
};

type CategoryData = {
  category: string;
  total: number;
};

type Transaction = {
  id: number;
  date: string;
  amount: number;
  description: string;
  category: string;
  source: string;
};

type RangeMode = "thisMonth" | "lastMonth" | "custom";

function getMonthRange(offset: number) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const start = new Date(target.getFullYear(), target.getMonth(), 1);
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );

  const [mode, setMode] = useState<RangeMode>("thisMonth");
  const [customStart, setCustomStart] = useState(getMonthRange(0).start);
  const [customEnd, setCustomEnd] = useState(getMonthRange(0).end);

  const range =
    mode === "thisMonth"
      ? getMonthRange(0)
      : mode === "lastMonth"
        ? getMonthRange(-1)
        : { start: customStart, end: customEnd };

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

  useEffect(() => {
    const { start, end } = range;
    const controller = new AbortController();

    // Reset UI while new range data is loading.
    setSummary(null);
    setCategoryData([]);
    setRecentTransactions([]);

    const fetchJson = async <T,>(url: string): Promise<T> => {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }
      return (await res.json()) as T;
    };

    (async () => {
      try {
        const [summaryRes, categoryRes, txRes] = await Promise.all([
          fetchJson<Summary>(
            `${API_BASE}/summary?start_date=${start}&end_date=${end}`,
          ),
          fetchJson<CategoryData[]>(
            `${API_BASE}/summary/category?start_date=${start}&end_date=${end}`,
          ),
          fetchJson<Transaction[]>(
            `${API_BASE}/transactions?start_date=${start}&end_date=${end}`,
          ),
        ]);

        setSummary(summaryRes);
        setCategoryData(categoryRes);
        setRecentTransactions(txRes.slice(-5).reverse());
      } catch (e) {
        if ((e as { name?: string }).name !== "AbortError") {
          console.error(e);
        }
      }
    })();

    return () => controller.abort();
  }, [range.start, range.end]);

  const pieData = categoryData.map((d) => ({
    name: d.category,
    value: Math.abs(d.total),
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex gap-2 mb-6 items-center">
        <button
          onClick={() => setMode("thisMonth")}
          className={`px-3 py-1 rounded text-sm ${
            mode === "thisMonth"
              ? "bg-blue-900 text-white"
              : "bg-white border border-gray-200"
          }`}
        >
          今月
        </button>
        <button
          onClick={() => setMode("lastMonth")}
          className={`px-3 py-1 rounded text-sm ${
            mode === "lastMonth"
              ? "bg-blue-900 text-white"
              : "bg-white border border-gray-200"
          }`}
        >
          先月
        </button>
        <button
          onClick={() => setMode("custom")}
          className={`px-3 py-1 rounded text-sm ${
            mode === "custom"
              ? "bg-blue-900 text-white"
              : "bg-white border border-gray-200"
          }`}
        >
          カスタム
        </button>
        {mode === "custom" && (
          <>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              aria-label="開始日"
              className="border border-gray-200 rounded px-2 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">〜</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              aria-label="終了日"
              className="border border-gray-200 rounded px-2 py-1 text-sm"
            />
          </>
        )}
      </div>

      {!summary ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
              <p className="text-sm text-gray-500">収入</p>
              <p className="text-2xl font-bold" style={{ color: "#ea4335" }}>
                ¥{summary.income.toLocaleString()}
              </p>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
              <p className="text-sm text-gray-500">支出</p>
              <p className="text-2xl font-bold" style={{ color: "#1a73e8" }}>
                ¥{Math.abs(summary.expense).toLocaleString()}
              </p>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
              <p className="text-sm text-gray-500">収支</p>
              <p className="text-2xl font-bold text-gray-800">
                ¥{summary.balance.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              カテゴリ別支出
            </h2>
            <PieChart width={400} height={300}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const numericValue = Array.isArray(value)
                    ? Number(value[0] ?? 0)
                    : Number(value ?? 0);
                  return `¥${numericValue.toLocaleString()}`;
                }}
              />
              <Legend />
            </PieChart>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100 mt-4">
            <h2 className="text-lg font-bold mb-4 text-gray-800">最近の取引</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
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
                {recentTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-2 text-sm text-gray-500">{t.date}</td>
                    <td className="py-2 text-sm">{t.description}</td>
                    <td className="py-2 text-sm text-gray-500">{t.category}</td>
                    <td
                      className="py-2 text-sm text-right font-bold"
                      style={{ color: t.amount > 0 ? "#ea4335" : "#1a73e8" }}
                    >
                      ¥{Math.abs(t.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
