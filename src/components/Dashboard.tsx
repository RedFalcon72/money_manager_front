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

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );

  useEffect(() => {
    const start = "2026-06-01";
    const end = "2026-06-30";

    fetch(`http://127.0.0.1:8000/summary?start_date=${start}&end_date=${end}`)
      .then((res) => res.json())
      .then((data) => setSummary(data));

    fetch(
      `http://127.0.0.1:8000/summary/category?start_date=${start}&end_date=${end}`,
    )
      .then((res) => res.json())
      .then((data) => setCategoryData(data));

    fetch(
      `http://127.0.0.1:8000/transactions?start_date=${start}&end_date=${end}`,
    )
      .then((res) => res.json())
      .then((data) => setRecentTransactions(data.slice(-5).reverse()));
  }, []);

  const pieData = categoryData.map((d) => ({
    name: d.category,
    value: Math.abs(d.total),
  }));

  if (!summary) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
        <h2 className="text-lg font-bold mb-4 text-gray-800">カテゴリ別支出</h2>
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
          <tbody>
            {recentTransactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 last:border-0">
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
    </div>
  );
}
