/**
 * 譲渡所得計算モジュール (TX-21)
 * 不動産の売却時に発生する譲渡所得を計算
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFiscalYear } from '../contexts/FiscalYearContext';
import { formatInputCurrency, parseCurrency } from '../utils/formatters';
import { saveCapitalGainRecord, getCapitalGainRecords, deleteCapitalGainRecord } from '../services/api';

interface CapitalGainInput {
  propertyId: string;
  saleDate: string;
  salePrice: number;
  brokerageFee: number;
  surveyCost: number;
  registrationCost: number;
  otherExpenses: number;
  specialDeduction: number;
  acquisitionDate: string;
  acquisitionCost: number;
  acquisitionExpenses: number;
}

interface CapitalGainResult {
  salePrice: number;
  totalExpenses: number;
  grossGain: number;
  ownershipPeriod: {
    years: number;
    months: number;
    type: 'long-term' | 'short-term';
  };
  specialDeduction: number;
  taxableIncome: number;
  taxRate: number;
  incomeTax: number;
  residentialTax: number;
  totalTax: number;
}

interface CapitalGainModuleProps {
  propertyId?: string | null;
}

const CapitalGainModule: React.FC<CapitalGainModuleProps> = ({ propertyId }) => {
  const [propertyInfo, setPropertyInfo] = useState<any>(null);
  
  const [input, setInput] = useState<CapitalGainInput>({
    propertyId: propertyId || '',
    saleDate: new Date().toISOString().split('T')[0],
    salePrice: 0,
    brokerageFee: 0,
    surveyCost: 0,
    registrationCost: 0,
    otherExpenses: 0,
    specialDeduction: 0,
    acquisitionDate: '',
    acquisitionCost: 0,
    acquisitionExpenses: 0,
  });

  const [result, setResult] = useState<CapitalGainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // propertyIdが指定されている場合、物件情報を取得
  useEffect(() => {
    if (propertyId) {
      fetchPropertyData(propertyId);
    }
  }, [propertyId]);

  const fetchPropertyData = async (propertyId: string) => {
    try {
      // まず全物件を取得して、propertyIdで検索
      const response = await axios.get(`http://localhost:5000/api/properties`);
      const property = response.data.data.find((p: any) => p.propertyId === propertyId);
      
      if (!property) {
        setError('指定された物件が見つかりません');
        return;
      }
      
      setPropertyInfo(property);
      
      // 物件情報からフォームを初期化
      setInput(prev => ({
        ...prev,
        propertyId: propertyId,
        acquisitionDate: property.acquisitionDate?.split('T')[0] || '',
        acquisitionCost: property.acquisitionCost || 0,
      }));
    } catch (err: any) {
      console.error('物件データ取得エラー:', err);
      setError('物件情報の取得に失敗しました');
    }
  };

  useEffect(() => {
    if (showHistory) {
      loadRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHistory]);

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/capital-gain/calculate', input);
      
      if (response.data.success) {
        setResult(response.data.result);
      } else {
        setError(response.data.error || '計算に失敗しました');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '計算処理中にエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!result) return;

    try {
      setSaveMessage(null);
      await saveCapitalGainRecord(input.propertyId, input, result);
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
      const response = await getCapitalGainRecords({ propertyId: propertyId || '' });
      setRecords(response.data || []);
    } catch (err: any) {
      console.error('Failed to load records:', err);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('この計算結果を削除しますか？')) {
      try {
        await deleteCapitalGainRecord(id);
        loadRecords();
      } catch (err: any) {
        console.error('Failed to delete record:', err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">譲渡所得計算モジュール (TX-21)</h1>

      {propertyInfo && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900">{propertyInfo.propertyName}</h2>
          <p className="text-sm text-blue-800">{propertyInfo.address}</p>
          <p className="text-sm text-blue-700">取得日: {propertyInfo.acquisitionDate?.split('T')[0]} | 取得費: ¥{propertyInfo.acquisitionCost?.toLocaleString()}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 売却情報 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">売却情報</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">売却日</label>
              <input
                type="date"
                value={input.saleDate}
                onChange={(e) => setInput({ ...input, saleDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">売却価格（円）</label>
              <input
                type="text"
                value={formatInputCurrency(input.salePrice)}
                onChange={(e) => setInput({ ...input, salePrice: parseCurrency(e.target.value) })}
                placeholder="50,000,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">仲介手数料（円）</label>
              <input
                type="text"
                value={formatInputCurrency(input.brokerageFee)}
                onChange={(e) => setInput({ ...input, brokerageFee: parseCurrency(e.target.value) })}
                placeholder="1,560,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">測量費（円）</label>
              <input
                type="text"
                value={formatInputCurrency(input.surveyCost)}
                onChange={(e) => setInput({ ...input, surveyCost: parseCurrency(e.target.value) })}
                placeholder="100,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">登記費用（円）</label>
              <input
                type="text"
                value={formatInputCurrency(input.registrationCost)}
                onChange={(e) => setInput({ ...input, registrationCost: parseCurrency(e.target.value) })}
                placeholder="50,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">その他費用（円）</label>
              <input
                type="text"
                value={formatInputCurrency(input.otherExpenses)}
                onChange={(e) => setInput({ ...input, otherExpenses: parseCurrency(e.target.value) })}
                placeholder="50,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">3,000万円特別控除額（円）</label>
              <input
                type="text"
                value={formatInputCurrency(input.specialDeduction)}
                onChange={(e) => setInput({ ...input, specialDeduction: parseCurrency(e.target.value) })}
                placeholder="30,000,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">住宅用家屋の売却時は最大3,000万円を控除できます</p>
            </div>
          </div>
        </div>

        {/* 取得情報 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">取得情報</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">取得日</label>
              <input
                type="date"
                value={input.acquisitionDate}
                onChange={(e) => setInput({ ...input, acquisitionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">取得費（円）</label>
              <input
                type="text"
                value={formatInputCurrency(input.acquisitionCost)}
                onChange={(e) => setInput({ ...input, acquisitionCost: parseCurrency(e.target.value) })}
                placeholder="40,000,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">取得時費用（仲介手数料など）（円）</label>
              <input
                type="text"
                value={formatInputCurrency(input.acquisitionExpenses)}
                onChange={(e) => setInput({ ...input, acquisitionExpenses: parseCurrency(e.target.value) })}
                placeholder="1,200,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400 mt-6"
            >
              {loading ? '計算中...' : '💰 譲渡所得を計算'}
            </button>
          </div>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 保存メッセージ */}
      {saveMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-300 text-green-800 rounded">
          {saveMessage}
        </div>
      )}

      {/* 計算結果 */}
      {result && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📊 計算結果</h2>
            <button
              onClick={handleSaveResult}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-sm"
            >
              💾 この結果を保存
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">売却価格</p>
              <p className="text-2xl font-bold text-gray-900">¥{result.salePrice.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">譲渡費用</p>
              <p className="text-2xl font-bold text-gray-900">¥{result.totalExpenses.toLocaleString()}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">譲渡益</p>
              <p className="text-2xl font-bold text-blue-900">¥{result.grossGain.toLocaleString()}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">所有期間</p>
              <p className="text-xl font-bold text-purple-900">
                {result.ownershipPeriod.years}年{result.ownershipPeriod.months}ヶ月
                <br/>
                <span className="text-sm">{result.ownershipPeriod.type === 'long-term' ? '長期' : '短期'}</span>
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600">特別控除額</p>
              <p className="text-2xl font-bold text-orange-900">¥{result.specialDeduction.toLocaleString()}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">課税譲渡所得</p>
              <p className="text-2xl font-bold text-green-900">¥{result.taxableIncome.toLocaleString()}</p>
            </div>

            <div className="md:col-span-2 bg-red-50 border-l-4 border-red-500 p-4">
              <h3 className="text-lg font-bold text-red-900 mb-3">税額計算</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>所得税 ({result.taxRate * 100}%)</span>
                  <span className="font-semibold">¥{result.incomeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>住民税 (5%)</span>
                  <span className="font-semibold">¥{result.residentialTax.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-red-300 pt-2 flex justify-between text-xl">
                  <span className="font-bold">合計税額</span>
                  <span className="font-bold text-red-700">¥{result.totalTax.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              計算履歴 ({records.length}件)
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
                        売却価格: ¥{record.input.salePrice.toLocaleString('ja-JP')}
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
                      <span className="text-gray-600">課税譲渡所得:</span>
                      <span className="font-semibold ml-2">
                        ¥{record.result.taxableIncome.toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">税額:</span>
                      <span className="font-semibold ml-2 text-red-600">
                        ¥{record.result.totalTax.toLocaleString('ja-JP')}
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
};

export default CapitalGainModule;
