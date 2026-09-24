import React, { useState } from 'react';
import axios from 'axios';

interface SimulationResult {
  propertyId: string;
  capitalGain: number;
  use3000Exemption: {
    exemptionAmount: number;
    taxableGain: number;
    estimatedTax: number;
  };
  useMortgageDeduction: {
    deductionAmount: number;
    estimatedTaxSavings: number;
  };
  recommendation: string;
  netBenefit: number;
}

export default function TaxExemptionModule() {
  const [formData, setFormData] = useState({
    propertyId: 'prop-001',
    sellingPrice: 50000000,
    acquisitionCost: 30000000,
    acquisitionDate: '2015-01-01',
    sellingDate: '2024-12-31',
    ownershipYears: 9,
    mortgageBalance: 15000000,
    annualMortgagePayment: 1500000,
    remainingMortgageYears: 10,
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/tax-exemption/simulate', {
        propertyId: formData.propertyId,
        sellingPrice: parseInt(formData.sellingPrice.toString()),
        acquisitionCost: parseInt(formData.acquisitionCost.toString()),
        acquisitionDate: formData.acquisitionDate,
        sellingDate: formData.sellingDate,
        ownershipYears: parseInt(formData.ownershipYears.toString()),
        mortgageBalance: parseInt(formData.mortgageBalance.toString()),
        annualMortgagePayment: parseInt(formData.annualMortgagePayment.toString()),
        remainingMortgageYears: parseInt(formData.remainingMortgageYears.toString()),
      });
      setResult(response.data.data);
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
      <h2 className="text-2xl font-bold mb-4 text-orange-600">🔄 特例併用シミュレーター</h2>
      <p className="text-gray-600 mb-6">3,000万円控除と住宅ローン控除の最適な選択を提案します</p>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              売却価格（円）
            </label>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              取得費（円）
            </label>
            <input
              type="number"
              name="acquisitionCost"
              value={formData.acquisitionCost}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所有年数
            </label>
            <input
              type="number"
              name="ownershipYears"
              value={formData.ownershipYears}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              取得日
            </label>
            <input
              type="date"
              name="acquisitionDate"
              value={formData.acquisitionDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              売却日
            </label>
            <input
              type="date"
              name="sellingDate"
              value={formData.sellingDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              住宅ローン残高（円）
            </label>
            <input
              type="number"
              name="mortgageBalance"
              value={formData.mortgageBalance}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年間返済額（円）
            </label>
            <input
              type="number"
              name="annualMortgagePayment"
              value={formData.annualMortgagePayment}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            残存ローン年数
          </label>
          <input
            type="number"
            name="remainingMortgageYears"
            value={formData.remainingMortgageYears}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? 'シミュレーション中...' : 'シミュレーション実行'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-400 rounded">
            <h3 className="font-bold text-lg mb-3 text-orange-800">シミュレーション結果</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">譲渡益</p>
                <p className="font-bold text-lg">¥{result.capitalGain.toLocaleString('ja-JP')}</p>
              </div>
              <div>
                <p className="text-gray-600">純便益（節税効果）</p>
                <p className="font-bold text-lg text-green-600">¥{result.netBenefit.toLocaleString('ja-JP')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-300 rounded">
              <h4 className="font-bold text-blue-900 mb-2">💰 3,000万円控除</h4>
              <p className="text-xs text-gray-600">控除額</p>
              <p className="font-bold text-lg">¥{result.use3000Exemption.exemptionAmount.toLocaleString('ja-JP')}</p>
              <p className="text-xs text-gray-600 mt-2">課税譲渡所得</p>
              <p className="font-bold">¥{result.use3000Exemption.taxableGain.toLocaleString('ja-JP')}</p>
              <p className="text-xs text-gray-600 mt-2">推定税額</p>
              <p className="font-bold text-red-600">¥{result.use3000Exemption.estimatedTax.toLocaleString('ja-JP')}</p>
            </div>

            <div className="p-4 bg-green-50 border border-green-300 rounded">
              <h4 className="font-bold text-green-900 mb-2">🏠 住宅ローン控除</h4>
              <p className="text-xs text-gray-600">控除額</p>
              <p className="font-bold text-lg">¥{result.useMortgageDeduction.deductionAmount.toLocaleString('ja-JP')}</p>
              <p className="text-xs text-gray-600 mt-2">推定節税額</p>
              <p className="font-bold text-green-600">¥{result.useMortgageDeduction.estimatedTaxSavings.toLocaleString('ja-JP')}</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-400 rounded">
            <p className="font-bold text-yellow-900 mb-2">💡 推奨</p>
            <p className="text-sm">{result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
