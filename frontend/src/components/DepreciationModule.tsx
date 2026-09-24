import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFiscalYear } from '../contexts/FiscalYearContext';

interface DepreciationScheduleItem {
  year: number;
  bookValue: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  undepreciatedBalance: number;
}

interface DepreciationResult {
  assetId: string;
  assetName: string;
  schedule: DepreciationScheduleItem[];
}

export default function DepreciationModule() {
  const { currentFiscalYear } = useFiscalYear();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    assetId: 'asset-001',
    assetName: 'オフィスビル',
    acquisitionDate: '2020-01-01',
    acquisitionCost: 50000000,
    category: 'concrete_building',
    usefulLife: 47,
    depreciationMethod: 'straight',
  });
  const [result, setResult] = useState<DepreciationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 物件マスターを読み込む useEffect を追加
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/properties');
        if (response.data) {
          setProperties(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      }
    };

    fetchProperties();
  }, []);

  // 物件が選択されたときに減価償却データを読み込む useEffect
  useEffect(() => {
    const loadPropertyDepreciation = async () => {
      if (!selectedPropertyId) return;

      try {
        setLoading(true);
        const selectedProperty = properties.find(p => p._id === selectedPropertyId || p.propertyId === selectedPropertyId);
        
        if (selectedProperty) {
          // 物件データからフォームを自動入力
          setFormData({
            assetId: selectedProperty.propertyId,
            assetName: selectedProperty.propertyName,
            acquisitionDate: selectedProperty.acquisitionDate ? selectedProperty.acquisitionDate.split('T')[0] : '2020-01-01',
            acquisitionCost: selectedProperty.acquisitionCost || 0,
            category: selectedProperty.buildingStructure === 'rc' ? 'concrete_building' : 'building',
            usefulLife: selectedProperty.usefulLife || 47,
            depreciationMethod: selectedProperty.depreciationMethod === 'declining-balance' ? 'declining' : 'straight',
          });

          // 減価償却スケジュールを計算・読み込み
          const response = await axios.post(
            `http://localhost:5000/api/depreciation/schedule`,
            {
              assetId: selectedProperty.propertyId,
              assetName: selectedProperty.propertyName,
              acquisitionDate: selectedProperty.acquisitionDate,
              acquisitionCost: selectedProperty.acquisitionCost,
              category: selectedProperty.buildingStructure === 'rc' ? 'concrete_building' : 'building',
              usefulLife: selectedProperty.usefulLife || 47,
              depreciationMethod: selectedProperty.depreciationMethod || 'straight-line',
            }
          );

          if (response.data) {
            setResult({
              assetId: selectedProperty.propertyId,
              assetName: selectedProperty.propertyName,
              schedule: response.data.data || [],
            });
          }
        }
      } catch (err) {
        console.error('Failed to load depreciation data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPropertyDepreciation();
  }, [selectedPropertyId, properties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/depreciation/schedule', {
        assetId: formData.assetId,
        assetName: formData.assetName,
        acquisitionDate: formData.acquisitionDate,
        acquisitionCost: parseInt(formData.acquisitionCost.toString()),
        category: formData.category,
        usefulLife: parseInt(formData.usefulLife.toString()),
        depreciationMethod: formData.depreciationMethod,
      });
      setResult(response.data.data[0] ? { ...response.data.data[0], schedule: response.data.data } : null);
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
      <h2 className="text-2xl font-bold mb-4 text-purple-600">📉 減価償却ライフサイクル</h2>
      <p className="text-gray-600 mb-6">資産の耐用年数管理と減価償却予測を行います</p>

      {/* 物件選択セクション */}
      {properties.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            物件を選択（既存データから自動入力）
          </label>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- 物件を選択してください --</option>
            {properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.propertyName} ({property.propertyId})
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              資産ID
            </label>
            <input
              type="text"
              name="assetId"
              value={formData.assetId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              資産名
            </label>
            <input
              type="text"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              取得費用（円）
            </label>
            <input
              type="number"
              name="acquisitionCost"
              value={formData.acquisitionCost}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              資産種別
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="concrete_building">コンクリート造建物（47年）</option>
              <option value="wood_building">木造建物（22年）</option>
              <option value="equipment">器具備品（5年）</option>
              <option value="vehicle">車両運搬具（4年）</option>
              <option value="machinery">機械装置（9年）</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              耐用年数
            </label>
            <input
              type="number"
              name="usefulLife"
              value={formData.usefulLife}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            償却方法
          </label>
          <select
            name="depreciationMethod"
            value={formData.depreciationMethod}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="straight">定額法</option>
            <option value="declining">定率法</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? '計算中...' : 'スケジュール生成'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-purple-50 border border-purple-400 rounded">
          <h3 className="font-bold text-lg mb-3 text-purple-800">減価償却スケジュール</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-200">
                <tr>
                  <th className="px-2 py-1 text-left">年度</th>
                  <th className="px-2 py-1 text-right">償却額</th>
                  <th className="px-2 py-1 text-right">累計償却額</th>
                  <th className="px-2 py-1 text-right">帳簿価額</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                    <td className="px-2 py-1">{item.year}</td>
                    <td className="px-2 py-1 text-right">¥{item.annualDepreciation.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}</td>
                    <td className="px-2 py-1 text-right">¥{item.accumulatedDepreciation.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}</td>
                    <td className="px-2 py-1 text-right font-bold">¥{item.bookValue.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.schedule.length > 10 && (
            <p className="text-xs text-gray-600 mt-2">※ 最初の10年を表示しています</p>
          )}
        </div>
      )}
    </div>
  );
}
