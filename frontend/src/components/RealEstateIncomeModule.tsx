import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFiscalYear } from '../contexts/FiscalYearContext';
import { formatInputCurrency, parseCurrency } from '../utils/formatters';

interface RentalIncomeData {
  propertyId: string;
  year: number;
  monthlyRent: number;
  months: number;
  otherIncome: number;
  rentalEndMonth?: number; // TX-33: 賃貸終了月（1-12、未指定 or 12 = 売却なし）
}

interface RealEstateExpense {
  propertyId: string;
  year: number;
  managementFee: number;
  repairCost: number;
  propertyTax: number;
  loanInterest: number;
  insurance: number;
  utilities: number;
  otherExpenses: number;
  expenseEndMonth?: number; // TX-33: 経費計上終了月（1-12、未指定 or 12 = 全年度）
  acquisitionTax?: number; // TX-29: 不動産取得税
  annualInsuranceExpense?: number; // TX-32: その年度の保険料経費（按分計算済み）
  annualLoanGuaranteeExpense?: number; // TX-32: その年度のローン保証料経費（按分計算済み）
  renovationExpense?: number; // TX-32: その年度のリフォーム費用
  loanProcessingFee?: number; // TX-32: ローン手数料（取得年度のみ）
}

interface RealEstateIncomeCalculation {
  propertyId: string;
  year: number;
  totalRentalIncome: number;
  otherIncome: number;
  totalIncome: number;
  operatingExpenses: number;
  propertyTax: number;
  loanInterest: number;
  depreciationExpense: number;
  totalExpenses: number;
  realEstateIncome: number;
  expenseBreakdown: {
    managementFee: number;
    repairCost: number;
    insurance: number;
    utilities: number;
    otherExpenses: number;
    depreciationExpense: number;
    propertyTax: number;
    loanInterest: number;
    acquisitionTax?: number; // TX-29
    annualInsuranceExpense?: number; // TX-32
    annualLoanGuaranteeExpense?: number; // TX-32
    renovationExpense?: number; // TX-32
    loanProcessingFee?: number; // TX-32
  };
}

interface RealEstateIncomeModuleProps {
  propertyId?: string | null;
}

const RealEstateIncomeModule: React.FC<RealEstateIncomeModuleProps> = ({ propertyId }) => {
  const { currentFiscalYear } = useFiscalYear();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [propertyInfo, setPropertyInfo] = useState<any>(null);
  const [income, setIncome] = useState<RentalIncomeData>({
    propertyId: '',
    year: currentFiscalYear.year,
    monthlyRent: 0,
    months: 12,
    otherIncome: 0,
  });

  const [expenses, setExpenses] = useState<RealEstateExpense>({
    propertyId: '',
    year: currentFiscalYear.year,
    managementFee: 0,
    repairCost: 0,
    propertyTax: 0,
    loanInterest: 0,
    insurance: 0,
    utilities: 0,
    otherExpenses: 0,
  });

  // TX-48: 複数年払い保険料の入力データ
  const [multiYearInsurance, setMultiYearInsurance] = useState({
    totalAmount: 0,
    startMonth: '',
    endMonth: '',
  });

  // TX-48: ローン保証料の入力データ
  const [loanGuarantee, setLoanGuarantee] = useState({
    totalAmount: 0,
    loanYears: 0,
    paymentMonth: '',
  });

  // TX-48: その他経費
  const [additionalExpenses, setAdditionalExpenses] = useState({
    renovationExpense: 0,
    loanProcessingFee: 0,
  });

  const [result, setResult] = useState<RealEstateIncomeCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // TX-48: 複数年払い保険料の按分計算
  const calculateProportionalInsurance = () => {
    if (!multiYearInsurance.startMonth || !multiYearInsurance.endMonth || multiYearInsurance.totalAmount === 0) {
      return 0;
    }

    const startDate = new Date(multiYearInsurance.startMonth);
    const endDate = new Date(multiYearInsurance.endMonth);
    
    // 総月数を計算
    const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                        (endDate.getMonth() - startDate.getMonth()) + 1;

    // 当年度利用月数を計算（会計年度: 4月-3月）
    const fiscalYearStart = new Date(currentFiscalYear.year, 3, 1); // 4月1日
    const fiscalYearEnd = new Date(currentFiscalYear.year + 1, 2, 31); // 3月31日

    const overlapStart = new Date(Math.max(startDate.getTime(), fiscalYearStart.getTime()));
    const overlapEnd = new Date(Math.min(endDate.getTime(), fiscalYearEnd.getTime()));

    if (overlapStart > overlapEnd) {
      return 0; // 対象期間外
    }

    const fiscalYearMonths = (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12 +
                             (overlapEnd.getMonth() - overlapStart.getMonth()) + 1;

    return Math.round(multiYearInsurance.totalAmount * (fiscalYearMonths / totalMonths));
  };

  // TX-48: ローン保証料の按分計算
  const calculateProportionalLoanGuarantee = () => {
    if (!loanGuarantee.paymentMonth || loanGuarantee.loanYears === 0 || loanGuarantee.totalAmount === 0) {
      return 0;
    }

    const paymentDate = new Date(loanGuarantee.paymentMonth);
    const annualAmount = loanGuarantee.totalAmount / loanGuarantee.loanYears;

    // 当年度利用月数を計算
    const fiscalYearStart = new Date(currentFiscalYear.year, 3, 1); // 4月1日
    const fiscalYearEnd = new Date(currentFiscalYear.year + 1, 2, 31); // 3月31日

    const loanEndDate = new Date(
      paymentDate.getFullYear() + loanGuarantee.loanYears,
      paymentDate.getMonth(),
      paymentDate.getDate()
    );

    const overlapStart = new Date(Math.max(paymentDate.getTime(), fiscalYearStart.getTime()));
    const overlapEnd = new Date(Math.min(loanEndDate.getTime(), fiscalYearEnd.getTime()));

    if (overlapStart > overlapEnd) {
      return 0;
    }

    const fiscalYearMonths = (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12 +
                             (overlapEnd.getMonth() - overlapStart.getMonth()) + 1;

    return Math.round(annualAmount * (fiscalYearMonths / 12));
  };

  // 減価償却費を計算
  useEffect(() => {
    if (propertyId) {
      setSelectedPropertyId(propertyId);
      fetchPropertyData(propertyId);
    }
  }, [propertyId]);

  // 年度が変更されたら、incomeとexpensesのyearを更新
  useEffect(() => {
    setIncome(prev => ({ ...prev, year: currentFiscalYear.year }));
    setExpenses(prev => ({ ...prev, year: currentFiscalYear.year }));
  }, [currentFiscalYear]);

  // 物件データを取得
  const fetchPropertyData = async (propertyId: string) => {
    try {
      // 全物件を取得してIDで検索
      const response = await axios.get('http://localhost:5000/api/properties');
      const properties = response.data.data || [];
      const property = properties.find((p: any) => p.propertyId === propertyId);
      
      if (property) {
        setPropertyInfo(property);
        
        // フォームに物件IDを自動入力
        setIncome(prev => ({
          ...prev,
          propertyId: property.propertyId,
        }));
        
        setExpenses(prev => ({
          ...prev,
          propertyId: property.propertyId,
          loanInterest: property.annualInterest || 0,
        }));
      }
    } catch (err) {
      console.error('物件データの取得に失敗:', err);
    }
  };

  /**
   * 減価償却費を計算（物件情報から）
   */
  const calculateDepreciationExpense = (property: any, year: number): number => {
    if (!property.buildingValue || property.buildingValue === 0) {
      return 0;
    }

    const buildingValue = property.buildingValue;
    const acquisitionDate = new Date(property.acquisitionDate);
    const usefulLife = property.usefulLife || getDefaultUsefulLife(property.buildingStructure, property.category);
    const depreciationMethod = property.depreciationMethod || 'straight-line';

    // 取得年度を計算
    const acquisitionYear = acquisitionDate.getFullYear();
    const acquisitionMonth = acquisitionDate.getMonth() + 1;
    const yearsHeld = year - acquisitionYear;

    if (yearsHeld < 0) {
      return 0; // 未取得の物件
    }

    // 定額法での計算
    if (depreciationMethod === 'straight-line') {
      const annualDepreciation = buildingValue / usefulLife;

      // 取得年と取得月を考慮
      if (yearsHeld === 0) {
        // 取得年: 月数按分
        const monthsHeld = 12 - acquisitionMonth + 1;
        return Math.floor(annualDepreciation * monthsHeld / 12);
      } else {
        return Math.floor(annualDepreciation);
      }
    }

    return 0;
  };

  /**
   * 建物構造とカテゴリーからデフォルト耐用年数を取得
   */
  const getDefaultUsefulLife = (structure: string, category: string): number => {
    if (category === 'residential') {
      switch (structure) {
        case 'wood':
          return 22;
        case 'steel':
          return 27;
        case 'rc':
        case 'src':
          return 47;
        default:
          return 22;
      }
    }

    if (category === 'commercial') {
      switch (structure) {
        case 'wood':
          return 22;
        case 'steel':
          return 38;
        case 'rc':
        case 'src':
          return 50;
        default:
          return 22;
      }
    }

    return 22;
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/real-estate-income/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          income,
          expenses,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || '計算エラーが発生しました');
      }
    } catch (err: any) {
      setError('サーバーエラー: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 計算結果を保存
  const handleSave = async () => {
    if (!result) {
      alert('先に計算を実行してください');
      return;
    }

    try {
      const saveData = {
        fiscalYear: currentFiscalYear.year,
        propertyId: income.propertyId,
        propertyName: propertyInfo?.propertyName || income.propertyId,
        monthlyRent: income.monthlyRent,
        months: income.months,
        otherIncome: income.otherIncome,
        totalIncome: result.totalIncome,
        managementFee: expenses.managementFee,
        repairCost: expenses.repairCost,
        propertyTax: expenses.propertyTax,
        loanInterest: expenses.loanInterest,
        insurance: expenses.insurance,
        utilities: expenses.utilities,
        otherExpenses: expenses.otherExpenses,
        depreciationExpense: result.depreciationExpense,
        totalExpenses: result.totalExpenses,
        realEstateIncome: result.realEstateIncome,
      };

      await axios.post('http://localhost:5000/api/real-estate-income-list', saveData);
      alert('保存しました！不動産所得一覧で確認できます。');
      
      // 一覧画面に遷移
      window.location.href = '/?module=real-estate-income-list';
    } catch (err: any) {
      console.error('保存エラー:', err);
      alert('保存に失敗しました: ' + (err.response?.data?.error || '不明なエラー'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">不動産所得計算モジュール (TX-20)</h1>

      {/* 物件情報パネル */}
      {propertyInfo && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">📍 物件情報</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">物件ID</p>
              <p className="font-semibold">{propertyInfo.propertyId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">物件名</p>
              <p className="font-semibold">{propertyInfo.propertyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">物件価値</p>
              <p className="font-semibold">¥{propertyInfo.totalValue?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ローン残高</p>
              <p className="font-semibold">¥{propertyInfo.outstandingLoan?.toLocaleString() || '0'}</p>
            </div>
          </div>
          
          {/* 減価償却情報 */}
          {propertyInfo.buildingValue && propertyInfo.buildingValue > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h4 className="text-md font-semibold mb-2 text-blue-700">🏗️ 減価償却情報</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-gray-600">建物価値</p>
                  <p className="font-semibold">¥{propertyInfo.buildingValue?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">建物構造</p>
                  <p className="font-semibold">
                    {propertyInfo.buildingStructure === 'wood' && '木造'}
                    {propertyInfo.buildingStructure === 'steel' && '鉄骨造'}
                    {propertyInfo.buildingStructure === 'rc' && 'RC造'}
                    {propertyInfo.buildingStructure === 'src' && 'SRC造'}
                    {!propertyInfo.buildingStructure && '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">耐用年数</p>
                  <p className="font-semibold">
                    {propertyInfo.usefulLife || getDefaultUsefulLife(propertyInfo.buildingStructure, propertyInfo.category)}年
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">償却方法</p>
                  <p className="font-semibold">
                    {propertyInfo.depreciationMethod === 'declining-balance' ? '定率法' : '定額法'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{currentFiscalYear.year}年度 減価償却費</p>
                  <p className="font-semibold text-blue-700">
                    ¥{calculateDepreciationExpense(propertyInfo, currentFiscalYear.year).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ℹ️ 減価償却費は物件情報から自動計算されます
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 収入入力セクション */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-700">📈 収入情報</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                物件ID
              </label>
              <input
                type="text"
                value={income.propertyId}
                onChange={(e) => setIncome({ ...income, propertyId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                対象年度
              </label>
              <input
                type="number"
                value={income.year}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                title="年度は画面上部のセレクタで変更できます"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                月額家賃（円）
              </label>
              <input
                type="text"
                value={formatInputCurrency(income.monthlyRent)}
                onChange={(e) => setIncome({ ...income, monthlyRent: parseCurrency(e.target.value) })}
                placeholder="150000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                家賃収入月数
              </label>
              <input
                type="number"
                value={income.months}
                onChange={(e) => setIncome({ ...income, months: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
                max="12"
              />
            </div>

            {/* TX-33: 年度途中売却対応 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={income.rentalEndMonth !== undefined && income.rentalEndMonth < 12}
                  onChange={(e) => setIncome({
                    ...income,
                    rentalEndMonth: e.target.checked ? 12 : undefined
                  })}
                  className="mr-2"
                />
                年度途中で売却した
              </label>
              
              {(income.rentalEndMonth !== undefined && income.rentalEndMonth < 12) && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    賃貸終了月
                  </label>
                  <select
                    value={income.rentalEndMonth || 12}
                    onChange={(e) => setIncome({ ...income, rentalEndMonth: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}月</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                その他収入（共益費など）（円）
              </label>
              <input
                type="text"
                value={formatInputCurrency(income.otherIncome)}
                onChange={(e) => setIncome({ ...income, otherIncome: parseCurrency(e.target.value) })}
                placeholder="24000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* 経費入力セクション */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-700">📉 経費情報</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                管理費（円）
              </label>
              <input
                type="text"
                value={formatInputCurrency(expenses.managementFee)}
                onChange={(e) => setExpenses({ ...expenses, managementFee: parseCurrency(e.target.value) })}
                placeholder="180,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                修繕費（円）
              </label>
              <input
                type="text"
                value={formatInputCurrency(expenses.repairCost)}
                onChange={(e) => setExpenses({ ...expenses, repairCost: parseCurrency(e.target.value) })}
                placeholder="50,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                固定資産税（円）
              </label>
              <input
                type="text"
                value={formatInputCurrency(expenses.propertyTax)}
                onChange={(e) => setExpenses({ ...expenses, propertyTax: parseCurrency(e.target.value) })}
                placeholder="120,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ローン利息（円）
              </label>
              <input
                type="text"
                value={formatInputCurrency(expenses.loanInterest)}
                onChange={(e) => setExpenses({ ...expenses, loanInterest: parseCurrency(e.target.value) })}
                placeholder="300,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                保険料（円）
              </label>
              <input
                type="text"
                value={formatInputCurrency(expenses.insurance)}
                onChange={(e) => setExpenses({ ...expenses, insurance: parseCurrency(e.target.value) })}
                placeholder="30,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                水道光熱費（円）
              </label>
              <input
                type="text"
                value={formatInputCurrency(expenses.utilities)}
                onChange={(e) => setExpenses({ ...expenses, utilities: parseCurrency(e.target.value) })}
                placeholder="20,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                その他経費（円）
              </label>
              <input
                type="text"
                value={formatInputCurrency(expenses.otherExpenses)}
                onChange={(e) => setExpenses({ ...expenses, otherExpenses: parseCurrency(e.target.value) })}
                placeholder="10,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* TX-29: 不動産取得税（取得年度のみ）*/}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                不動産取得税（円） ※取得年度のみ計上
              </label>
              <input
                type="text"
                value={formatInputCurrency(expenses.acquisitionTax || 0)}
                onChange={(e) => setExpenses({ ...expenses, acquisitionTax: parseCurrency(e.target.value) })}
                placeholder="500,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* TX-33: 経費終了月 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={expenses.expenseEndMonth !== undefined && expenses.expenseEndMonth < 12}
                  onChange={(e) => setExpenses({
                    ...expenses,
                    expenseEndMonth: e.target.checked ? 12 : undefined
                  })}
                  className="mr-2"
                />
                経費計上を年度途中で終了
              </label>
              
              {(expenses.expenseEndMonth !== undefined && expenses.expenseEndMonth < 12) && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    経費計上終了月
                  </label>
                  <select
                    value={expenses.expenseEndMonth || 12}
                    onChange={(e) => setExpenses({ ...expenses, expenseEndMonth: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}月</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TX-48: 詳細経費・按分計算セクション */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">🔄 詳細経費・按分計算（TX-48）</h2>
          
          <div className="space-y-6">
            {/* TX-48: 複数年払い保険料 */}
            <div className="bg-white rounded-lg p-4 border border-yellow-100">
              <h3 className="font-semibold text-gray-800 mb-3">💳 複数年払い保険料（按分計算）</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    総支払額（円）
                  </label>
                  <input
                    type="text"
                    value={formatInputCurrency(multiYearInsurance.totalAmount)}
                    onChange={(e) => setMultiYearInsurance({ ...multiYearInsurance, totalAmount: parseCurrency(e.target.value) })}
                    placeholder="600,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    開始年月
                  </label>
                  <input
                    type="month"
                    value={multiYearInsurance.startMonth}
                    onChange={(e) => setMultiYearInsurance({ ...multiYearInsurance, startMonth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    終了年月
                  </label>
                  <input
                    type="month"
                    value={multiYearInsurance.endMonth}
                    onChange={(e) => setMultiYearInsurance({ ...multiYearInsurance, endMonth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="mt-3 bg-blue-100 p-3 rounded text-blue-900">
                <p className="text-sm">
                  ✅ 当年度按分額: <span className="font-semibold">¥{calculateProportionalInsurance().toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* TX-48: ローン保証料 */}
            <div className="bg-white rounded-lg p-4 border border-yellow-100">
              <h3 className="font-semibold text-gray-800 mb-3">🏦 ローン保証料（按分計算）</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    総支払額（円）
                  </label>
                  <input
                    type="text"
                    value={formatInputCurrency(loanGuarantee.totalAmount)}
                    onChange={(e) => setLoanGuarantee({ ...loanGuarantee, totalAmount: parseCurrency(e.target.value) })}
                    placeholder="800,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ローン期間（年）
                  </label>
                  <input
                    type="number"
                    value={loanGuarantee.loanYears}
                    onChange={(e) => setLoanGuarantee({ ...loanGuarantee, loanYears: parseInt(e.target.value) || 0 })}
                    placeholder="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    支払開始年月
                  </label>
                  <input
                    type="month"
                    value={loanGuarantee.paymentMonth}
                    onChange={(e) => setLoanGuarantee({ ...loanGuarantee, paymentMonth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="mt-3 bg-blue-100 p-3 rounded text-blue-900">
                <p className="text-sm">
                  ✅ 当年度按分額: <span className="font-semibold">¥{calculateProportionalLoanGuarantee().toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* TX-48: その他経費 */}
            <div className="bg-white rounded-lg p-4 border border-yellow-100">
              <h3 className="font-semibold text-gray-800 mb-3">💰 その他経費</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    リフォーム費用（当年度）（円）
                  </label>
                  <input
                    type="text"
                    value={formatInputCurrency(additionalExpenses.renovationExpense)}
                    onChange={(e) => setAdditionalExpenses({ ...additionalExpenses, renovationExpense: parseCurrency(e.target.value) })}
                    placeholder="500,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ローン手数料（取得年度のみ）（円）
                  </label>
                  <input
                    type="text"
                    value={formatInputCurrency(additionalExpenses.loanProcessingFee)}
                    onChange={(e) => setAdditionalExpenses({ ...additionalExpenses, loanProcessingFee: parseCurrency(e.target.value) })}
                    placeholder="100,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4 justify-center">
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-400"
        >
          {loading ? '計算中...' : '💰 不動産所得を計算'}
        </button>
        {result && (
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            💾 計算結果を保存
          </button>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 計算結果表示 */}
      {result && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 計算結果</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">総収入</p>
              <p className="text-2xl font-bold text-green-700">
                ¥{result.totalIncome.toLocaleString()}
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">総経費</p>
              <p className="text-2xl font-bold text-red-700">
                ¥{result.totalExpenses.toLocaleString()}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${result.realEstateIncome >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <p className="text-sm text-gray-600 mb-1">不動産所得</p>
              <p className={`text-2xl font-bold ${result.realEstateIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                ¥{result.realEstateIncome.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 経費内訳 */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">経費内訳</h3>
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 text-gray-600">管理費</td>
                  <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.managementFee.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">修繕費</td>
                  <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.repairCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">固定資産税</td>
                  <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.propertyTax.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">ローン利息</td>
                  <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.loanInterest.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">保険料</td>
                  <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.insurance.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">水道光熱費</td>
                  <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.utilities.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">その他経費</td>
                  <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.otherExpenses.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">減価償却費</td>
                  <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.depreciationExpense.toLocaleString()}</td>
                </tr>
                {/* TX-29: 不動産取得税 */}
                {result.expenseBreakdown.acquisitionTax !== undefined && result.expenseBreakdown.acquisitionTax > 0 && (
                  <tr className="bg-yellow-50">
                    <td className="py-2 text-gray-600">不動産取得税（取得年度）</td>
                    <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.acquisitionTax.toLocaleString()}</td>
                  </tr>
                )}
                {/* TX-32: 複数年払い保険料 */}
                {result.expenseBreakdown.annualInsuranceExpense !== undefined && result.expenseBreakdown.annualInsuranceExpense > 0 && (
                  <tr className="bg-blue-50">
                    <td className="py-2 text-gray-600">保険料（複数年払い按分）</td>
                    <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.annualInsuranceExpense.toLocaleString()}</td>
                  </tr>
                )}
                {/* TX-32: 複数年払いローン保証料 */}
                {result.expenseBreakdown.annualLoanGuaranteeExpense !== undefined && result.expenseBreakdown.annualLoanGuaranteeExpense > 0 && (
                  <tr className="bg-blue-50">
                    <td className="py-2 text-gray-600">ローン保証料（複数年払い按分）</td>
                    <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.annualLoanGuaranteeExpense.toLocaleString()}</td>
                  </tr>
                )}
                {/* TX-32: リフォーム費用 */}
                {result.expenseBreakdown.renovationExpense !== undefined && result.expenseBreakdown.renovationExpense > 0 && (
                  <tr className="bg-green-50">
                    <td className="py-2 text-gray-600">リフォーム・改修費用</td>
                    <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.renovationExpense.toLocaleString()}</td>
                  </tr>
                )}
                {/* TX-32: ローン手数料 */}
                {result.expenseBreakdown.loanProcessingFee !== undefined && result.expenseBreakdown.loanProcessingFee > 0 && (
                  <tr className="bg-purple-50">
                    <td className="py-2 text-gray-600">ローン手数料（取得年度）</td>
                    <td className="py-2 text-right font-semibold">¥{result.expenseBreakdown.loanProcessingFee.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateIncomeModule;
