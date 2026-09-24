import React, { useState, useEffect } from 'react';
import { useFiscalYear } from '../contexts/FiscalYearContext';
import axios from 'axios';
import { saveSalaryIncomeRecord, getSalaryIncomeRecords, deleteSalaryIncomeRecord } from '../services/api';
import { Button, Card, Input, Alert } from './ui';

interface SalaryIncomeInput {
  annualSalary: number;
  withheldTax: number;
  socialInsurance: number;
  lifeInsurance?: number;
  dependents?: number;
  spouseDeduction?: boolean;
}

interface SalaryIncomeResult {
  annualSalary: number;
  salaryIncomeDeduction: number;
  salaryIncome: number;
  socialInsurance: number;
  lifeInsurance: number;
  basicDeduction: number;
  dependentDeduction: number;
  spouseDeduction: number;
  totalDeduction: number;
  taxableIncome: number;
  estimatedTax: number;
}

interface SavedRecord {
  _id: string;
  year: number;
  input: SalaryIncomeInput;
  result: SalaryIncomeResult;
  createdAt: string;
}

export default function SalaryIncomeModule() {
  const { currentFiscalYear } = useFiscalYear();
  const [formData, setFormData] = useState<SalaryIncomeInput>({
    annualSalary: 5000000,
    withheldTax: 600000,
    socialInsurance: 750000,
    lifeInsurance: 100000,
    dependents: 0,
    spouseDeduction: false,
  });

  const [result, setResult] = useState<SalaryIncomeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0,
    }));
  };

  useEffect(() => {
    if (showHistory) {
      loadRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/salary-income/calculate', formData);
      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!result) return;

    try {
      setSaveMessage(null);
      await saveSalaryIncomeRecord(currentFiscalYear.year, formData, result);
      setSaveMessage('✅ 計算結果を保存しました');
      setTimeout(() => setSaveMessage(null), 3000);
      if (showHistory) {
        loadRecords();
      }
    } catch (err: any) {
      setSaveMessage('❌ 保存に失敗しました');
    }
  };

  const loadRecords = async () => {
    try {
      const response = await getSalaryIncomeRecords({ year: currentFiscalYear.year });
      setRecords(response.data || []);
    } catch (err: any) {
      console.error('Failed to load records:', err);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('この計算結果を削除しますか？')) {
      try {
        await deleteSalaryIncomeRecord(id);
        loadRecords();
      } catch (err: any) {
        console.error('Failed to delete record:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card color="income" variant="default">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-600">💼 給与所得</h2>
          <p className="text-gray-600">給与収入と各種控除を入力して、課税所得を計算します</p>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報セクション */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">基本情報</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="年間給与収入 (円)"
              type="number"
              name="annualSalary"
              value={formData.annualSalary}
              onChange={handleChange}
              placeholder="例: 5000000"
              required
              helperText="源泉徴収票の支払金額"
            />

            <Input
              label="源泉徴収税額 (円)"
              type="number"
              name="withheldTax"
              value={formData.withheldTax}
              onChange={handleChange}
              placeholder="例: 600000"
              helperText="源泉徴収票の源泉徴収税額"
            />
          </div>
        </div>

        {/* 控除セクション */}
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">控除額</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="社会保険料控除 (円)"
              type="number"
              name="socialInsurance"
              value={formData.socialInsurance}
              onChange={handleChange}
              placeholder="例: 750000"
              helperText="健康保険料、厚生年金保険料など"
            />

            <div>
              <Input
                label="生命保険料控除 (円)"
                type="number"
                name="lifeInsurance"
                value={formData.lifeInsurance}
                onChange={handleChange}
                placeholder="例: 100000"
                helperText="上限12万円"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                扶養親族数
              </label>
              <input
                type="number"
                name="dependents"
                value={formData.dependents}
                onChange={handleChange}
                placeholder="例: 2"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                1人38万円の控除
              </p>
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="spouseDeduction"
                  checked={formData.spouseDeduction}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  配偶者控除あり (38万円)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <Button
          type="submit"
          variant="primary"
          color="income"
          size="lg"
          fullWidth
          loading={loading}
          data-testid="salary-calculate-button"
        >
          計算する
        </Button>
      </form>

      {/* エラー表示 */}
      {error && (
        <Alert
          variant="error"
          title="エラーが発生しました"
          message={error}
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* 保存メッセージ */}
      {saveMessage && (
        <Alert
          variant="success"
          message={saveMessage}
          closable
          onClose={() => setSaveMessage(null)}
        />
      )}

      {/* 結果表示 */}
      {result && (
        <Card
          color="income"
          variant="bordered"
          title="計算結果"
          footer={
            <Button
              onClick={handleSaveResult}
              variant="primary"
              color="property"
              leftIcon={<span>💾</span>}
              data-testid="salary-save-button"
            >
              この結果を保存
            </Button>
          }
        >
          <div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600">給与所得控除</p>
              <p className="font-bold text-lg">
                ¥{result.salaryIncomeDeduction.toLocaleString('ja-JP')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">給与所得</p>
              <p className="font-bold text-lg text-blue-700">
                ¥{result.salaryIncome.toLocaleString('ja-JP')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">控除額合計</p>
              <p className="font-bold text-lg">
                ¥{result.totalDeduction.toLocaleString('ja-JP')}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
            <p className="text-xs text-gray-600">課税所得</p>
            <p className="font-bold text-2xl text-blue-700 mb-2">
              ¥{result.taxableIncome.toLocaleString('ja-JP')}
            </p>
            <p className="text-xs text-gray-600">推定所得税</p>
            <p className="font-bold text-xl text-red-600">
              ¥{result.estimatedTax.toLocaleString('ja-JP')}
            </p>
          </div>

          {/* 詳細内訳 */}
          <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
            <p className="font-semibold text-sm mb-2 text-gray-800">控除の内訳</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>社会保険料控除:</span>
                <span>¥{result.socialInsurance.toLocaleString('ja-JP')}</span>
              </div>
              <div className="flex justify-between">
                <span>生命保険料控除:</span>
                <span>¥{result.lifeInsurance.toLocaleString('ja-JP')}</span>
              </div>
              <div className="flex justify-between">
                <span>基礎控除:</span>
                <span>¥{result.basicDeduction.toLocaleString('ja-JP')}</span>
              </div>
              <div className="flex justify-between">
                <span>扶養控除:</span>
                <span>¥{result.dependentDeduction.toLocaleString('ja-JP')}</span>
              </div>
              <div className="flex justify-between">
                <span>配偶者控除:</span>
                <span>¥{result.spouseDeduction.toLocaleString('ja-JP')}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 計算履歴タブ */}
      <div className="mt-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition"
        >
          {showHistory ? '📊 履歴を閉じる' : '📊 計算履歴を表示'}
        </button>

        {showHistory && (
          <div className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {currentFiscalYear.year}年度の計算履歴 ({records.length}件)
            </h3>
            {records.length === 0 ? (
              <p className="text-gray-500 text-center py-4">保存された計算結果はありません</p>
            ) : (
              records.map((record) => (
                <div key={record._id} className="p-4 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(record.createdAt).toLocaleString('ja-JP')}
                      </p>
                      <p className="text-xs text-gray-500">
                        給与収入: ¥{record.input.annualSalary.toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteRecord(record._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ 削除
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">課税所得:</span>
                      <span className="font-semibold ml-2">
                        ¥{record.result.taxableIncome.toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">推定税額:</span>
                      <span className="font-semibold ml-2 text-red-600">
                        ¥{record.result.estimatedTax.toLocaleString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
