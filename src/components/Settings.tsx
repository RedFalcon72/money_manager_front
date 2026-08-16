import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type ColorScheme = "red-green" | "green-red";

const THEME_KEY = "money-manager:theme";
const COLOR_SCHEME_KEY = "money-manager:color-scheme";

export function loadTheme(): Theme {
  const v = localStorage.getItem(THEME_KEY);
  return v === "dark" ? "dark" : "light";
}

export function loadColorScheme(): ColorScheme {
  const v = localStorage.getItem(COLOR_SCHEME_KEY);
  return v === "green-red" ? "green-red" : "red-green";
}

export function getExpenseColor(scheme: ColorScheme): string {
  return scheme === "green-red" ? "#ea4335" : "#34a853";
}

export function getIncomeColor(scheme: ColorScheme): string {
  return scheme === "green-red" ? "#34a853" : "#ea4335";
}

export default function Settings() {
  const [theme, setTheme] = useState<Theme>(loadTheme());
  const [colorScheme, setColorScheme] =
    useState<ColorScheme>(loadColorScheme());

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(COLOR_SCHEME_KEY, colorScheme);
  }, [colorScheme]);

  const expenseColor = getExpenseColor(colorScheme);
  const incomeColor = getIncomeColor(colorScheme);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
        設定
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-700 mb-4">
        <h2 className="text-sm font-bold mb-3 text-gray-800 dark:text-gray-100">
          テーマ
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`px-3 py-1 rounded text-sm ${
              theme === "light"
                ? "bg-blue-900 text-white"
                : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100"
            }`}
          >
            ライト
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`px-3 py-1 rounded text-sm ${
              theme === "dark"
                ? "bg-blue-900 text-white"
                : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100"
            }`}
          >
            ダーク
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-sm font-bold mb-3 text-gray-800 dark:text-gray-100">
          収支の色設定
        </h2>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
            <input
              type="radio"
              name="colorScheme"
              checked={colorScheme === "red-green"}
              onChange={() => setColorScheme("red-green")}
            />
            収入 <span style={{ color: "#ea4335" }}>■</span> ／ 支出{" "}
            <span style={{ color: "#34a853" }}>■</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
            <input
              type="radio"
              name="colorScheme"
              checked={colorScheme === "green-red"}
              onChange={() => setColorScheme("green-red")}
            />
            収入 <span style={{ color: "#34a853" }}>■</span> ／ 支出{" "}
            <span style={{ color: "#ea4335" }}>■</span>
          </label>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            プレビュー
          </p>
          <div className="flex gap-6 text-sm">
            <span style={{ color: incomeColor }}>収入 ¥250,000</span>
            <span style={{ color: expenseColor }}>支出 ¥70,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
