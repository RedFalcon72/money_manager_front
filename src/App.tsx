import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Import from "./components/Import";
import Settings from "./components/Settings";

function App() {
  useEffect(() => {
    const theme = localStorage.getItem("money-manager:theme");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <header className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Money Manager
          </h1>
          <nav className="flex gap-4">
            <Link
              to="/"
              className="hover:text-gray-500 dark:hover:text-gray-400"
            >
              ホーム
            </Link>
            <Link
              to="/transactions"
              className="hover:text-gray-500 dark:hover:text-gray-400"
            >
              取引一覧
            </Link>
            <Link
              to="/import"
              className="hover:text-gray-500 dark:hover:text-gray-400"
            >
              インポート
            </Link>
            <Link
              to="/settings"
              className="hover:text-gray-500 dark:hover:text-gray-400"
            >
              設定
            </Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/import" element={<Import />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
