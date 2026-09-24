import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import IncomeExpenseForm from './components/IncomeExpenseForm';
import TaxResultDisplay from './components/TaxResultDisplay';
import SavedCalculations from './components/SavedCalculations';
import SalaryIncomeModule from './components/SalaryIncomeModule';
import RSUExchangeModule from './components/RSUExchangeModule';
import RSUIncomeListModule from './components/RSUIncomeListModule';
import PropertyManagementPanel from './components/PropertyManagementPanel';
import RealEstateIncomeModule from './components/RealEstateIncomeModule';
import RealEstateIncomeListModule from './components/RealEstateIncomeListModule';
import TaxReturnModule from './components/TaxReturnModule';
import CapitalGainModule from './components/CapitalGainModule';
import CapitalGainListModule from './components/CapitalGainListModule';
import DepreciationModule from './components/DepreciationModule';
import SidebarLayout from './components/SidebarLayout';
import OnboardingModal from './components/OnboardingModal';
import WorkflowGuide from './components/WorkflowGuide';
import { FiscalYearProvider, useFiscalYear } from './contexts/FiscalYearContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { calculateTax, IncomeData, ExpenseData, TaxCalculationResult, CalculationResponse } from './services/api';
import { saveCalculation } from './services/storage';
import { TabGroup, TabType } from './types/TabGroup';

function AppContent() {
  const { currentFiscalYear, setCurrentFiscalYear, availableFiscalYears } = useFiscalYear();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has seen onboarding before
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('tx18-onboarding-completed');
    if (!hasSeenOnboarding) {
      // Show onboarding on first visit after a short delay
      setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
    }
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('tx18-onboarding-completed', 'true');
  };

  // URLパラメータに基づいてタブを切り替える
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('propertyId');
    const module = params.get('module');
    
    if (module) {
      // moduleパラメータで遷移先を判定
      // 他モジュールから ?module= で遷移してくる先（例: 不動産所得の保存後は一覧へ）
      const navigableModules: TabType[] = ['capital-gain', 'real-estate-income', 'real-estate-income-list', 'tax-return'];
      if ((navigableModules as string[]).includes(module)) {
        setActiveTab(module as TabType);
      }
      
      // propertyIdがあれば保存
      if (propertyId) {
        setSelectedPropertyId(propertyId);
      }
      
      // URLをクリーンアップ
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (propertyId) {
      // propertyIdのみの場合（後方互換性）
      setSelectedPropertyId(propertyId);
      setActiveTab('real-estate-income');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleFormSubmit = async (income: IncomeData, expense: ExpenseData) => {
    setLoading(true);
    setError(null);

    try {
      const response: CalculationResponse = await calculateTax(income, expense, currentFiscalYear.year);
      setResult(response.data.calculation);
      setSuggestions(response.data.suggestions);
      
      // 結果を自動保存
      saveCalculation({
        income,
        expense,
        result: response.data.calculation,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'エラーが発生しました。サーバーが起動しているか確認してください。';
      setError(errorMessage);
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tab groups for improved UX (TX-18 Phase 1)
  const tabGroups: TabGroup[] = [
    {
      group: '所得入力',
      description: '収入を入力して税額を計算',
      color: 'blue',
      tabs: [
        { id: 'basic', name: '基本計算', icon: '🧮', help: '簡単に税額を計算' },
        { id: 'salary', name: '給与所得', icon: '💼', help: '給与収入を管理' },
        { id: 'rsu', name: 'RSU所得', icon: '💱', help: '権利確定の計算' },
      ]
    },
    {
      group: '不動産・資産管理',
      description: '物件を管理・計算',
      color: 'green',
      tabs: [
        { id: 'properties', name: '物件管理', icon: '🏢', help: '物件の情報を登録・管理' },
        { id: 'real-estate-income', name: '不動産所得', icon: '🏠', help: '物件の所得を計算' },
        { id: 'capital-gain', name: '物件売却', icon: '💰', help: '売却時の譲渡所得を計算' },
      ]
    },
    {
      group: 'レポート・一覧',
      description: '結果を確認・出力',
      color: 'purple',
      tabs: [
        { id: 'tax-return', name: '確定申告書（総合）', icon: '🧾', help: '損益通算・控除・還付額をまとめて計算' },
        { id: 'rsu-income-list', name: 'RSU所得管理', icon: '📋', help: '複数年度の管理・保存' },
        { id: 'real-estate-income-list', name: '不動産所得一覧', icon: '📊', help: '年度全体のレポート' },
        { id: 'capital-gain-list', name: '売却所得一覧', icon: '📈', help: '売却結果の一覧・CSV出力' },
      ]
    }
  ];

  const fiscalYearSelectorContent = (
    <>
      <label className="font-semibold">📅 確定申告年度:</label>
      <select
        value={currentFiscalYear.year}
        onChange={(e) => {
          const selectedYear = parseInt(e.target.value);
          const fiscalYear = availableFiscalYears.find(fy => fy.year === selectedYear);
          if (fiscalYear) {
            setCurrentFiscalYear(fiscalYear);
          }
        }}
        className="px-3 py-1 border-2 border-blue-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 bg-blue-700 text-white"
      >
        {availableFiscalYears.map((fy) => (
          <option key={fy.year} value={fy.year}>
            {fy.label}
          </option>
        ))}
      </select>
      <span className="text-sm font-medium">
        選択中: {currentFiscalYear.label}
      </span>
    </>
  );

  const mainContent = (
    <>
      {/* エラーメッセージ */}
      {error && activeTab === 'basic' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded-lg mb-6">
          <p className="font-bold">⚠️ エラー</p>
          <p>{error}</p>
        </div>
      )}

      {/* タブコンテンツ */}
      {activeTab === 'dashboard' && <Dashboard />}

      {activeTab === 'basic' && (
        <>
          <IncomeExpenseForm onSubmit={handleFormSubmit} loading={loading} />
          {result && (
            <TaxResultDisplay result={result} suggestions={suggestions} />
          )}
          {!result && !loading && (
            <div className="mt-12 text-center">
              <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <p className="text-xl text-gray-700 mb-4">
                  👋 収入と経費を入力すると、自動で税額を計算します
                </p>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="p-4 bg-blue-50 rounded">
                    <div className="text-2xl mb-2">⚡</div>
                    <p className="text-sm text-gray-600">簡単入力</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded">
                    <div className="text-2xl mb-2">🧮</div>
                    <p className="text-sm text-gray-600">自動計算</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded">
                    <div className="text-2xl mb-2">💡</div>
                    <p className="text-sm text-gray-600">節税提案</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <SavedCalculations />
        </>
      )}

      {activeTab === 'salary' && <SalaryIncomeModule />}
      {activeTab === 'rsu' && <RSUExchangeModule />}
      {activeTab === 'rsu-income-list' && <RSUIncomeListModule />}
      {activeTab === 'properties' && <PropertyManagementPanel />}
      {activeTab === 'real-estate-income' && <RealEstateIncomeModule propertyId={selectedPropertyId} />}
      {activeTab === 'real-estate-income-list' && <RealEstateIncomeListModule />}
      {activeTab === 'capital-gain' && <CapitalGainModule propertyId={selectedPropertyId} />}
      {activeTab === 'capital-gain-list' && <CapitalGainListModule />}
      {activeTab === 'depreciation' && <DepreciationModule />}
      {activeTab === 'tax-return' && <TaxReturnModule />}

      {/* Onboarding Modal - TX-18 Phase 1 */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={handleOnboardingClose} 
      />

      {/* Workflow Guide - TX-18 Phase 1 */}
      <WorkflowGuide currentTab={activeTab} />
    </>
  );

  return (
    <SidebarLayout
      tabGroups={tabGroups}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      header={null}
      fiscalYearSelector={fiscalYearSelectorContent}
    >
      {mainContent}
    </SidebarLayout>
  );
}

function App() {
  return (
    <FiscalYearProvider>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </FiscalYearProvider>
  );
}

export default App;
