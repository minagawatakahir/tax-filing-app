import React, { useState } from 'react';
import axios from 'axios';

interface Asset {
  name: string;
  category: string;
  value: number;
}

interface Liability {
  name: string;
  category: string;
  amount: number;
}

export default function DocumentGenerationModule() {
  const [formData, setFormData] = useState({
    taxpayerId: 'TP-2024-001',
    taxpayerName: '山田太郎',
    fiscalYear: 2024,
    totalAssets: 100000000,
    totalLiabilities: 30000000,
  });
  const [assets] = useState<Asset[]>([
    { name: '不動産A', category: 'real_estate', value: 50000000 },
    { name: '証券口座', category: 'securities', value: 30000000 },
    { name: '預金', category: 'cash', value: 20000000 },
  ]);
  const [liabilities] = useState<Liability[]>([
    { name: '住宅ローン', category: 'mortgage', amount: 20000000 },
    { name: '事業ローン', category: 'business_loan', amount: 10000000 },
  ]);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/documents/tax-filing', {
        taxpayerId: formData.taxpayerId,
        taxpayerName: formData.taxpayerName,
        fiscalYear: parseInt(formData.fiscalYear.toString()),
        assets,
        liabilities,
      });
      // APIレスポンスから最初のドキュメントを取得
      const doc = response.data.data[0] || response.data.data;
      setResult({
        documentId: `DOC-${formData.taxpayerId}`,
        taxpayerName: formData.taxpayerName,
        fiscalYear: formData.fiscalYear,
        totalAssets: formData.totalAssets,
        totalLiabilities: formData.totalLiabilities,
        netWorth: formData.totalAssets - formData.totalLiabilities,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">📄 調書自動生成</h2>
      <p className="text-gray-600 mb-6">財産債務調書を自動生成してPDF出力します</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              納税者ID
            </label>
            <input
              type="text"
              name="taxpayerId"
              value={formData.taxpayerId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              氏名
            </label>
            <input
              type="text"
              name="taxpayerName"
              value={formData.taxpayerName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年度
            </label>
            <input
              type="number"
              name="fiscalYear"
              value={formData.fiscalYear}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              総資産（円）
            </label>
            <input
              type="number"
              name="totalAssets"
              value={formData.totalAssets}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              総負債（円）
            </label>
            <input
              type="number"
              name="totalLiabilities"
              value={formData.totalLiabilities}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-bold text-sm mb-2">資産一覧</h3>
          <ul className="text-sm space-y-1">
            {assets.map((asset, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{asset.name}</span>
                <span className="font-bold">¥{asset.value.toLocaleString('ja-JP')}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-bold text-sm mb-2">負債一覧</h3>
          <ul className="text-sm space-y-1">
            {liabilities.map((liability, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{liability.name}</span>
                <span className="font-bold text-red-600">¥{liability.amount.toLocaleString('ja-JP')}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? '生成中...' : '調書生成'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-400 rounded">
          <h3 className="font-bold text-lg mb-3 text-indigo-800">生成結果</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">文書ID</p>
                <p className="font-bold">{result.documentId}</p>
              </div>
              <div>
                <p className="text-gray-600">納税者</p>
                <p className="font-bold">{result.taxpayerName}</p>
              </div>
              <div>
                <p className="text-gray-600">年度</p>
                <p className="font-bold">{result.fiscalYear}</p>
              </div>
              <div>
                <p className="text-gray-600">生成日時</p>
                <p className="font-bold">{new Date(result.generatedAt).toLocaleString('ja-JP')}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-3 bg-white rounded border border-indigo-200">
              <div>
                <p className="text-xs text-gray-600">総資産</p>
                <p className="font-bold text-lg text-blue-600">¥{result.totalAssets.toLocaleString('ja-JP')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">総負債</p>
                <p className="font-bold text-lg text-red-600">¥{result.totalLiabilities.toLocaleString('ja-JP')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">純資産</p>
                <p className="font-bold text-lg text-green-600">¥{result.netWorth.toLocaleString('ja-JP')}</p>
              </div>
            </div>

            <div className="bg-green-100 border border-green-400 p-3 rounded">
              <p className="font-bold text-green-900 mb-1">✅ 調書が生成されました</p>
              <p className="text-sm text-green-800">
                財産債務調書が正常に生成されました。PDF出力機能は実装予定です。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
