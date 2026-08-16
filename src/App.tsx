import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Import from "./components/Import";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
          <h1 className="text-2xl font-bold text-blue-900">Money Manager</h1>
          <nav className="flex gap-4">
            <Link to="/" className="hover:text-gray-500">
              ホーム
            </Link>
            <Link to="/transactions" className="hover:text-gray-500">
              取引一覧
            </Link>
            <Link to="/import" className="hover:text-gray-500">
              インポート
            </Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/import" element={<Import />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
