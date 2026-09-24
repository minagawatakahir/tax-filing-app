import React, { useState } from 'react';
import axios from 'axios';

interface LTVResult {
  propertyId: string;
  totalValue: number;
  totalLoan: number;
  loanToValue: number;
  landLoanAmount: number;
  buildingLoanAmount: number;
  landLTV: number;
  buildingLTV: number;
}

export default function RealEstateLTVModule() {
  const [formData, setFormData] = useState({
    propertyId: 'prop-001',
    landValue: 50000000,
    buildingValue: 30000000,
    loanAmount: 40000000,
    outstandingBalance: 35000000,
    annualInterest: 700000,
    purpose: 'building',
  });
  const [result, setResult] = useState<LTVResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/real-estate/ltv', {
        property: {
          propertyId: formData.propertyId,
          landValue: parseInt(formData.landValue.toString()),
          buildingValue: parseInt(formData.buildingValue.toString()),
          totalValue: parseInt(formData.landValue.toString()) + parseInt(formData.buildingValue.toString()),
          acquisitionDate: '2020-01-15',
        },
        loans: [{
          loanId: 'loan-001',
          propertyId: formData.propertyId,
          totalAmount: parseInt(formData.loanAmount.toString()),
          outstandingBalance: parseInt(formData.outstandingBalance.toString()),
          annualInterest: parseInt(formData.annualInterest.toString()),
          purpose: formData.purpose,
        }],
      });
      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-600">🏠 不動産LTV・利子判定</h2>
      <p className="text-gray-600 mb-6">不動産投資の税務分析とLTVを計算します</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              物件ID
            </label>
            <input
              type="text"
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              土地価値（円）
            </label>
            <input
              type="number"
              name="landValue"
              value={formData.landValue}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              建物価値（円）
            </label>
            <input
              type="number"
              name="buildingValue"
              value={formData.buildingValue}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ローン金額（円）
            </label>
            <input
              type="number"
              name="loanAmount"
              value={formData.loanAmount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              未返済残高（円）
            </label>
            <input
              type="number"
              name="outstandingBalance"
              value={formData.outstandingBalance}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年間利息（円）
            </label>
            <input
              type="number"
              name="annualInterest"
              value={formData.annualInterest}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ローン目的
          </label>
          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="land">土地</option>
            <option value="building">建物</option>
            <option value="mixed">混合</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? '計算中...' : '計算する'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-400 rounded">
          <h3 className="font-bold text-lg mb-3 text-green-800">計算結果</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">物件ID</p>
              <p className="font-bold text-lg">{result.propertyId}</p>
            </div>
            <div>
              <p className="text-gray-600">総不動産価値</p>
              <p className="font-bold text-lg">¥{result.totalValue.toLocaleString('ja-JP')}</p>
            </div>
            <div>
              <p className="text-gray-600">ローン金額</p>
              <p className="font-bold text-lg">¥{result.totalLoan.toLocaleString('ja-JP')}</p>
            </div>
            <div>
              <p className="text-gray-600">LTV</p>
              <p className="font-bold text-lg text-red-600">{result.loanToValue.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-300">
            <p className="font-semibold text-blue-900 mb-2">詳細分析</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">土地分ローン</p>
                <p className="font-bold">¥{result.landLoanAmount.toLocaleString('ja-JP')}</p>
              </div>
              <div>
                <p className="text-gray-600">建物分ローン</p>
                <p className="font-bold">¥{result.buildingLoanAmount.toLocaleString('ja-JP')}</p>
              </div>
              <div>
                <p className="text-gray-600">土地LTV</p>
                <p className="font-bold">{result.landLTV.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-600">建物LTV</p>
                <p className="font-bold">{result.buildingLTV.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
