import { useEffect, useRef, useState } from "react";

type ImportHistoryEntry = {
  date: string;
  filename: string;
  saved: number;
  imported: number;
};

type ImportResult = {
  imported: number;
  saved: number;
};

const HISTORY_KEY = "money-manager:import-history";
const MAX_HISTORY = 10;

function loadHistory(): ImportHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ImportHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: ImportHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // localStorageが使えない環境では履歴保存を諦める
  }
}

export default function Import() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    filename: string;
    result: ImportResult;
  } | null>(null);
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${day}`;
  };

  const uploadFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("CSVファイルを選択してください。");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/import`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }

      const result: ImportResult = await res.json();
      setLastResult({ filename: file.name, result });

      const entry: ImportHistoryEntry = {
        date: formatDate(new Date()),
        filename: file.name,
        saved: result.saved,
        imported: result.imported,
      };
      const updated = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(updated);
      saveHistory(updated);
    } catch {
      setError(
        "インポートに失敗しました。バックエンドが起動しているか確認してください。",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-lg font-bold mb-4 text-gray-800">CSVインポート</h1>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`bg-white shadow-sm rounded-lg border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-colors ${
          isDragging ? "border-[#1a73e8] bg-blue-50" : "border-gray-200"
        }`}
      >
        <p className="text-gray-500 mb-2">
          CSVファイルをここにドラッグ&ドロップ
        </p>
        <p className="text-gray-400 text-sm mb-4">または</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded bg-blue-900 text-white text-sm disabled:opacity-50"
        >
          {uploading ? "アップロード中..." : "ファイルを選択"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="CSVファイルを選択"
        />
      </div>

      {error && (
        <div className="mt-4 bg-white shadow-sm rounded-lg p-4 border border-gray-100 text-sm text-[#ea4335]">
          {error}
        </div>
      )}

      {lastResult && !error && (
        <div className="mt-4 bg-white shadow-sm rounded-lg p-4 border border-gray-100 text-sm text-gray-800">
          {lastResult.filename} を読み込み、{lastResult.result.saved}
          件を保存しました （{lastResult.result.imported}件中）。
        </div>
      )}

      <div className="mt-8 bg-white shadow-sm rounded-lg p-6 border border-gray-100">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          前回のインポート
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">
            インポート履歴はまだありません。
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th scope="col" className="py-2 font-medium">
                  日付
                </th>
                <th scope="col" className="py-2 font-medium">
                  ファイル名
                </th>
                <th scope="col" className="py-2 font-medium text-right">
                  件数
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 text-sm text-gray-500">{h.date}</td>
                  <td className="py-2 text-sm">{h.filename}</td>
                  <td className="py-2 text-sm text-right">{h.saved}件</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
