import React, { useState, useEffect } from 'react';
import { useFiscalYear } from '../contexts/FiscalYearContext';
import { Card } from './ui';
import { createFiscalYear } from '../contexts/FiscalYearContext';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  estimatedTax: number;
  completedModules: string[];
  pendingModules: string[];
}

/**
 * Dashboard Component
 * Main dashboard view showing fiscal year summary and quick actions
 * Part of TX-40 Phase 2 Sidebar implementation
 */
const Dashboard: React.FC = () => {
  const { currentFiscalYear, setCurrentFiscalYear, availableFiscalYears } = useFiscalYear();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    estimatedTax: 0,
    completedModules: [],
    pendingModules: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFiscalYear.year]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // This is a placeholder - in a real app, you would fetch actual data
      // For now, we'll just simulate loading and show a welcome message
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load data from localStorage if available
      const savedData = localStorage.getItem(`dashboard-data-${currentFiscalYear.year}`);
      if (savedData) {
        setStats(JSON.parse(savedData));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('ダッシュボードデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const allModules = [
    { id: 'salary', name: '給与所得', icon: '💼', category: 'income' },
    { id: 'rsu', name: 'RSU所得', icon: '💱', category: 'income' },
    { id: 'properties', name: '物件管理', icon: '🏢', category: 'assets' },
    { id: 'real-estate-income', name: '不動産所得', icon: '🏠', category: 'assets' },
    { id: 'capital-gain', name: '物件売却', icon: '💰', category: 'assets' },
    { id: 'depreciation', name: '減価償却', icon: '📉', category: 'assets' },
    { id: 'rsu-income-list', name: 'RSU所得管理', icon: '📋', category: 'report' },
    { id: 'real-estate-income-list', name: '不動産所得一覧', icon: '📊', category: 'report' },
    { id: 'capital-gain-list', name: '売却所得一覧', icon: '📈', category: 'report' },
  ];

  const completionPercentage = Math.round(
    (stats.completedModules.length / allModules.length) * 100
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleFiscalYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10);
    setCurrentFiscalYear(createFiscalYear(year));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">📊 ダッシュボード</h1>
            <p className="text-blue-100">
              {currentFiscalYear.label} ({currentFiscalYear.startDate.getFullYear()}/{currentFiscalYear.startDate.getMonth() + 1} 〜 {currentFiscalYear.endDate.getFullYear()}/{currentFiscalYear.endDate.getMonth() + 1})
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <label className="text-blue-100 text-sm font-medium">年度を選択</label>
            <select
              value={currentFiscalYear.year}
              onChange={handleFiscalYearChange}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
            >
              {availableFiscalYears.map((year) => (
                <option key={year.year} value={year.year}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded-lg">
          <p className="font-bold">⚠️ エラー</p>
          <p>{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <Card color="income" variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">総所得</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ¥{(stats.totalIncome / 1000000).toFixed(1)}M
              </p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card color="property" variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">総経費</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ¥{(stats.totalExpenses / 1000000).toFixed(1)}M
              </p>
            </div>
            <span className="text-4xl">📉</span>
          </div>
        </Card>

        {/* Net Income */}
        <Card color="report" variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">純所得</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                ¥{(stats.netIncome / 1000000).toFixed(1)}M
              </p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </Card>

        {/* Estimated Tax */}
        <Card color="dashboard" variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">推定納税額</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                ¥{(stats.estimatedTax / 1000000).toFixed(1)}M
              </p>
            </div>
            <span className="text-4xl">🧮</span>
          </div>
        </Card>
      </div>

      {/* Completion Progress */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">進捗状況</h2>
          <span className="text-3xl font-bold text-indigo-600">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {stats.completedModules.length} / {allModules.length} モジュール完了
        </p>
      </div>

      {/* Module Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Modules */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
            <span>💼</span> 所得入力
          </h3>
          <div className="space-y-2">
            {allModules
              .filter(m => m.category === 'income')
              .map(module => (
                <div key={module.id} className="flex items-center gap-2 p-3 rounded-lg bg-blue-50">
                  <span className="text-xl">{module.icon}</span>
                  <span className="text-sm font-medium text-gray-700 flex-1">{module.name}</span>
                  {stats.completedModules.includes(module.id) && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Asset Modules */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
            <span>🏠</span> 不動産・資産管理
          </h3>
          <div className="space-y-2">
            {allModules
              .filter(m => m.category === 'assets')
              .map(module => (
                <div key={module.id} className="flex items-center gap-2 p-3 rounded-lg bg-green-50">
                  <span className="text-xl">{module.icon}</span>
                  <span className="text-sm font-medium text-gray-700 flex-1">{module.name}</span>
                  {stats.completedModules.includes(module.id) && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Report Modules */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
            <span>📊</span> レポート・一覧
          </h3>
          <div className="space-y-2">
            {allModules
              .filter(m => m.category === 'report')
              .map(module => (
                <div key={module.id} className="flex items-center gap-2 p-3 rounded-lg bg-purple-50">
                  <span className="text-xl">{module.icon}</span>
                  <span className="text-sm font-medium text-gray-700 flex-1">{module.name}</span>
                  {stats.completedModules.includes(module.id) && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 rounded-lg border-2 border-blue-300 text-blue-600 font-semibold hover:bg-blue-50 transition-colors">
            <span className="text-2xl block mb-2">💼</span>
            給与を追加
          </button>
          <button className="p-4 rounded-lg border-2 border-green-300 text-green-600 font-semibold hover:bg-green-50 transition-colors">
            <span className="text-2xl block mb-2">🏢</span>
            物件を管理
          </button>
          <button className="p-4 rounded-lg border-2 border-purple-300 text-purple-600 font-semibold hover:bg-purple-50 transition-colors">
            <span className="text-2xl block mb-2">📊</span>
            レポートを作成
          </button>
          <button className="p-4 rounded-lg border-2 border-orange-300 text-orange-600 font-semibold hover:bg-orange-50 transition-colors">
            <span className="text-2xl block mb-2">📥</span>
            データをインポート
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg border-l-4 border-blue-500 p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">💡 ヒント</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• 左のメニューから各モジュールにアクセスできます</li>
          <li>• 複数の給与や物件に対応しています</li>
          <li>• 計算結果は自動的に保存されます</li>
          <li>• 正確な税務申告については税理士にご相談ください</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
