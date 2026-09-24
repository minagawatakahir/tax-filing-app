import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFiscalYear } from '../contexts/FiscalYearContext';
import { saveRSUIncomeRecord } from '../services/api';
import { Button, Card } from './ui';

interface RSUGrant {
  vestingDate: string;
  shares: string;
  pricePerShare: string;
  currency: string;
}

interface RSUCalculationResult {
  vestingDate: string;
  shares: number;
  pricePerShareUSD: number;
  exchangeRate: number;
  pricePerShareJPY: number;
  totalValueJPY: number;
  taxableIncomeJPY: number;
}

interface BatchResult {
  calculations: RSUCalculationResult[];
  summary: {
    totalGrants: number;
    totalShares: number;
    totalValueJPY: number;
    totalTaxableIncomeJPY: number;
    fiscalYear: number;
    exchangeRateStats?: {
      average: number;
      minimum: number;
      maximum: number;
    };
  };
}

export default function RSUExchangeModule() {
  const { currentFiscalYear } = useFiscalYear();
  const [mode, setMode] = useState<'single' | 'batch'>('batch');
  const [singleFormData, setSingleFormData] = useState({
    vestingDate: '2024-03-15',
    shares: '100',
    pricePerShare: '180.5',
    currency: 'USD',
  });
  const [grants, setGrants] = useState<RSUGrant[]>([
    { vestingDate: '2024-03-15', shares: '100', pricePerShare: '180.50', currency: 'USD' },
    { vestingDate: '2024-06-15', shares: '100', pricePerShare: '175.25', currency: 'USD' },
    { vestingDate: '2024-09-15', shares: '', pricePerShare: '', currency: 'USD' },
  ]);
  const [result, setResult] = useState<RSUCalculationResult | BatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 既存データを読み込む useEffect を追加
  useEffect(() => {
    const fetchRSUData = async () => {
      console.log('🔄 fetchRSUData triggered for year:', currentFiscalYear.year);
      try {
        setLoading(true);
        setResult(null); // 前年度のデータをクリア
        setGrants([]); // フォームもクリア
        
        const response = await axios.get(
          `http://localhost:5000/api/rsu-income/list?year=${currentFiscalYear.year}`
        );
        console.log('📊 RSU data response:', response.data);
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          const rsuRecord = response.data.data[0];
          console.log('✅ Found RSU record:', rsuRecord);
          if (rsuRecord.input && rsuRecord.input.length > 0) {
            // 既存データをフォームに設定
            const formattedGrants: RSUGrant[] = rsuRecord.input.map((item: any) => {
              // vestingDateを正しい形式に変換
              const vestingDate = new Date(item.vestingDate);
              const formattedDate = vestingDate.toISOString().split('T')[0];
              return {
                vestingDate: formattedDate,
                shares: item.shares.toString(),
                pricePerShare: item.pricePerShareUSD.toString(),
                currency: 'USD',
              };
            });
            console.log('📝 Setting grants:', formattedGrants);
            setGrants(formattedGrants);
            
            // 計算結果も設定
            if (rsuRecord.result) {
              // APIのデータ構造に合わせてフォーマット
              const formattedCalculations = rsuRecord.result.map((item: any) => ({
                vestingDate: item.vestingDate,
                shares: item.shares,
                pricePerShareUSD: item.pricePerShareUSD,
                exchangeRate: item.ttmRate, // APIではttmRateというフィールド名
                pricePerShareJPY: item.pricePerShareUSD * item.ttmRate,
                totalValueJPY: item.totalValueJPY,
                taxableIncomeJPY: item.taxableIncome,
              }));
              
              setResult({
                calculations: formattedCalculations,
                summary: {
                  totalGrants: rsuRecord.input.length,
                  totalShares: rsuRecord.input.reduce((sum: number, item: any) => sum + item.shares, 0),
                  totalValueJPY: rsuRecord.totalRSUIncome,
                  totalTaxableIncomeJPY: rsuRecord.totalRSUIncome,
                  fiscalYear: currentFiscalYear.year,
                },
              });
            }
          }
        }
        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to fetch RSU data:', err);
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    if (currentFiscalYear) {
      fetchRSUData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFiscalYear.year]);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/rsu/calculate', {
        vestingDate: singleFormData.vestingDate,
        shares: parseInt(singleFormData.shares),
        pricePerShare: parseFloat(singleFormData.pricePerShare),
        currency: singleFormData.currency,
      });
      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 空行をフィルタアウト
      const validGrants = grants.filter(g => g.vestingDate && g.shares && g.pricePerShare);
      
      if (validGrants.length === 0) {
        setError('最低1行のデータを入力してください');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/rsu/calculate-batch', {
        grants: validGrants.map(g => ({
          vestingDate: g.vestingDate,
          shares: parseInt(g.shares),
          pricePerShare: parseFloat(g.pricePerShare),
          currency: g.currency,
        })),
      });
      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSingleFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGrantChange = (index: number, field: keyof RSUGrant, value: string) => {
    const newGrants = [...grants];
    newGrants[index][field] = value;
    setGrants(newGrants);
  };

  const addRow = () => {
    setGrants([...grants, { vestingDate: '', shares: '', pricePerShare: '', currency: 'USD' }]);
  };

  const removeRow = (index: number) => {
    if (grants.length > 1) {
      setGrants(grants.filter((_, i) => i !== index));
    }
  };

  const isBatchResult = (r: any): r is BatchResult => {
    return r && 'calculations' in r && 'summary' in r;
  };

  const handleSaveResult = async () => {
    if (!result) return;

    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      if (isBatchResult(result)) {
        // 複数行一括計算の結果を保存
        const input = grants
          .filter(g => g.vestingDate && g.shares && g.pricePerShare)
          .map(g => ({
            companyName: 'Default Company', // 企業名がない場合はデフォルト
            grantDate: new Date(g.vestingDate),
            vestingDate: new Date(g.vestingDate),
            shares: parseInt(g.shares),
            pricePerShareUSD: parseFloat(g.pricePerShare),
            ttmRate: undefined,
          }));

        const resultData = result.calculations.map(calc => ({
          companyName: 'Default Company',
          vestingDate: new Date(calc.vestingDate),
          shares: calc.shares,
          pricePerShareUSD: calc.pricePerShareUSD,
          ttmRate: calc.exchangeRate,
          totalValueJPY: calc.totalValueJPY,
          taxableIncome: calc.taxableIncomeJPY,
        }));

        await saveRSUIncomeRecord(
          currentFiscalYear.year,
          input,
          resultData,
          result.summary.totalTaxableIncomeJPY || result.summary.totalValueJPY
        );
      } else {
        // 単一計算の結果を保存
        const input = [{
          companyName: 'Default Company',
          grantDate: new Date(singleFormData.vestingDate),
          vestingDate: new Date(singleFormData.vestingDate),
          shares: parseInt(singleFormData.shares),
          pricePerShareUSD: parseFloat(singleFormData.pricePerShare),
          ttmRate: undefined,
        }];

        const resultData = [{
          companyName: 'Default Company',
          vestingDate: new Date(result.vestingDate),
          shares: result.shares,
          pricePerShareUSD: result.pricePerShareUSD,
          ttmRate: result.exchangeRate,
          totalValueJPY: result.totalValueJPY,
          taxableIncome: result.taxableIncomeJPY,
        }];

        await saveRSUIncomeRecord(
          currentFiscalYear.year,
          input,
          resultData,
          result.taxableIncomeJPY
        );
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError('保存に失敗しました: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card color="income" variant="default">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-600">💱 RSU為替自動連携</h2>
          <p className="text-gray-600">証券会社との自動連携でRSU権利確定時の税務を計算します</p>
        </div>
      </Card>

      {/* モード切替 */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'single' ? 'primary' : 'outline'}
          color="income"
          onClick={() => { setMode('single'); setResult(null); }}
        >
          単一計算
        </Button>
        <Button
          variant={mode === 'batch' ? 'primary' : 'outline'}
          color="income"
          onClick={() => { setMode('batch'); setResult(null); }}
        >
          複数行一括計算
        </Button>
      </div>

      {mode === 'single' ? (
        <form onSubmit={handleSingleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                権利確定日
              </label>
              <input
                type="date"
                name="vestingDate"
                value={singleFormData.vestingDate}
                onChange={handleSingleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                株数
              </label>
              <input
                type="number"
                name="shares"
                value={singleFormData.shares}
                onChange={handleSingleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1株当たり価格
              </label>
              <input
                type="number"
                name="pricePerShare"
                value={singleFormData.pricePerShare}
                onChange={handleSingleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                通貨
              </label>
              <select
                name="currency"
                value={singleFormData.currency}
                onChange={handleSingleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

        <Button
          type="submit"
          variant="primary"
          color="income"
          size="lg"
          fullWidth
          loading={loading}
        >
          計算する
        </Button>
        </form>
      ) : (
        <form onSubmit={handleBatchSubmit} className="space-y-4">
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-3 py-2 text-left">権利確定日</th>
                  <th className="px-3 py-2 text-left">株数</th>
                  <th className="px-3 py-2 text-left">1株価格 (USD)</th>
                  <th className="px-3 py-2 text-left">通貨</th>
                  <th className="px-3 py-2 text-center">削除</th>
                </tr>
              </thead>
              <tbody>
                {grants.map((grant, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={grant.vestingDate}
                        onChange={(e) => handleGrantChange(index, 'vestingDate', e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={grant.shares}
                        onChange={(e) => handleGrantChange(index, 'shares', e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={grant.pricePerShare}
                        onChange={(e) => handleGrantChange(index, 'pricePerShare', e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={grant.currency}
                        onChange={(e) => handleGrantChange(index, 'currency', e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={grants.length === 1}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addRow}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
            >
              + 行を追加
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? '計算中...' : '一括計算'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ 計算結果を保存しました ({currentFiscalYear.year}年度)
        </div>
      )}

      {result && !isBatchResult(result) && (
        <Card
          color="property"
          variant="bordered"
          title="計算結果"
          footer={
            <Button
              onClick={handleSaveResult}
              variant="primary"
              color="property"
              size="lg"
              fullWidth
              loading={saving}
              leftIcon={<span>💾</span>}
            >
              この計算結果を保存 ({currentFiscalYear.year}年度)
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">権利確定日</p>
                <p className="font-bold text-lg">{new Date(result.vestingDate).toLocaleDateString('ja-JP')}</p>
              </div>
              <div>
                <p className="text-gray-600">株数</p>
                <p className="font-bold text-lg">{result.shares.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">USD価格</p>
                <p className="font-bold text-lg">${result.pricePerShareUSD.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">適用為替レート</p>
                <p className="font-bold text-lg">¥{result.exchangeRate.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">JPY価格</p>
                <p className="font-bold text-lg">¥{result.pricePerShareJPY.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-gray-600">課税所得（JPY）</p>
                <p className="font-bold text-lg text-red-600">¥{result.taxableIncomeJPY.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {result && isBatchResult(result) && (
        <div className="mt-6 space-y-4">
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-3 py-2 text-left">権利確定日</th>
                  <th className="px-3 py-2 text-right">株数</th>
                  <th className="px-3 py-2 text-right">USD価格</th>
                  <th className="px-3 py-2 text-right">TTM</th>
                  <th className="px-3 py-2 text-right">JPY価格</th>
                  <th className="px-3 py-2 text-right">総額 (JPY)</th>
                </tr>
              </thead>
              <tbody>
                {result.calculations.map((calc, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2">{new Date(calc.vestingDate).toLocaleDateString('ja-JP')}</td>
                    <td className="px-3 py-2 text-right">{calc.shares.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">${calc.pricePerShareUSD.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-blue-600">¥{calc.exchangeRate.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">¥{calc.pricePerShareJPY.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}</td>
                    <td className="px-3 py-2 text-right font-bold">¥{calc.totalValueJPY.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-400 rounded">
            <h3 className="font-bold text-lg mb-3 text-blue-800">年間集計</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">権利確定回数</p>
                <p className="font-bold text-lg">{result.summary.totalGrants}</p>
              </div>
              <div>
                <p className="text-gray-600">総株数</p>
                <p className="font-bold text-lg">{result.summary.totalShares.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">総課税所得</p>
                <p className="font-bold text-lg text-red-600">¥{result.summary.totalValueJPY.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-gray-600">年度</p>
                <p className="font-bold text-lg">{result.summary.fiscalYear}</p>
              </div>
            </div>

            {result.summary.exchangeRateStats && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">適用為替レート情報</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-2 rounded border border-blue-200">
                    <p className="text-gray-600">平均 TTM</p>
                    <p className="font-bold text-lg text-blue-600">¥{result.summary.exchangeRateStats.average.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-200">
                    <p className="text-gray-600">最小 TTM</p>
                    <p className="font-bold text-lg text-green-600">¥{result.summary.exchangeRateStats.minimum.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-200">
                    <p className="text-gray-600">最大 TTM</p>
                    <p className="font-bold text-lg text-red-600">¥{result.summary.exchangeRateStats.maximum.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSaveResult}
            variant="primary"
            color="property"
            size="lg"
            fullWidth
            loading={saving}
            leftIcon={<span>💾</span>}
            data-testid="rsu-save-button"
          >
            この計算結果を保存 ({currentFiscalYear.year}年度)
          </Button>
        </div>
      )}
    </div>
  );
}
