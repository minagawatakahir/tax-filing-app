import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Property {
  _id: string;
  propertyId: string;
  propertyName: string;
  address: string;
  landValue?: number;
  buildingValue?: number;
  totalValue?: number;
  acquisitionDate: string;
  acquisitionCost?: number;
  category: 'residential' | 'commercial' | 'land';
  // 取得関連費用（TX-29, TX-30, TX-31対応）
  acquisitionTax?: number;
  registrationTax?: number;
  brokerFee?: number;
  otherAcquisitionCosts?: number;
  // ローン関連情報
  outstandingLoan?: number;
  annualInterest?: number;
  loanStartDate?: string;
  purpose?: 'residential' | 'investment' | 'business';
  // 減価償却関連情報
  buildingStructure?: 'wood' | 'steel' | 'rc' | 'src';
  constructionDate?: string;
  usefulLife?: number;
  depreciationMethod?: 'straight-line' | 'declining-balance';
  isNewProperty?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  propertyId: string;
  propertyName: string;
  address: string;
  landValue?: number;
  buildingValue?: number;
  totalValue?: number;
  acquisitionDate: string;
  acquisitionCost?: number;
  category: 'residential' | 'commercial' | 'land';
  // 取得関連費用
  acquisitionTax?: number;
  registrationTax?: number;
  brokerFee?: number;
  otherAcquisitionCosts?: number;
  // ローン関連情報
  outstandingLoan?: number;
  annualInterest?: number;
  loanStartDate?: string;
  purpose?: 'residential' | 'investment' | 'business';
  // 減価償却関連情報
  buildingStructure?: 'wood' | 'steel' | 'rc' | 'src';
  constructionDate?: string;
  usefulLife?: number;
  depreciationMethod?: 'straight-line' | 'declining-balance';
  isNewProperty?: boolean;
}

export default function PropertyManagementPanel() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormData>({
    propertyId: '',
    propertyName: '',
    address: '',
    landValue: 0,
    buildingValue: 0,
    totalValue: 0,
    acquisitionDate: '',
    acquisitionCost: 0,
    category: 'residential',
    // 取得関連費用
    acquisitionTax: 0,
    registrationTax: 0,
    brokerFee: 0,
    otherAcquisitionCosts: 0,
    // ローン関連情報
    outstandingLoan: 0,
    annualInterest: 0,
    loanStartDate: '',
    purpose: 'residential',
    // 減価償却関連情報
    buildingStructure: 'rc',
    constructionDate: '',
    usefulLife: 47,
    depreciationMethod: 'straight-line',
    isNewProperty: false,
  });

  // プロパティ一覧を取得
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/properties');
      setProperties(response.data.data || []);
      setError(null);
    } catch (err: any) {
      setError('プロパティの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Value') || name.includes('Cost') ? parseFloat(value) || 0 : value,
    }));
  };

  const calculateTotal = () => {
    setFormData((prev) => ({
      ...prev,
      totalValue: (prev.landValue || 0) + (prev.buildingValue || 0),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/properties/${editingId}`, formData);
        setError(null);
      } else {
        await axios.post('http://localhost:5000/api/properties', formData);
        setError(null);
      }
      setFormData({
        propertyId: '',
        propertyName: '',
        address: '',
        landValue: 0,
        buildingValue: 0,
        totalValue: 0,
        acquisitionDate: '',
        acquisitionCost: 0,
        category: 'residential',
        acquisitionTax: 0,
        registrationTax: 0,
        brokerFee: 0,
        otherAcquisitionCosts: 0,
        outstandingLoan: 0,
        annualInterest: 0,
        loanStartDate: '',
        purpose: 'residential',
        buildingStructure: 'rc',
        constructionDate: '',
        usefulLife: 47,
        depreciationMethod: 'straight-line',
        isNewProperty: false,
      });
      setShowForm(false);
      setEditingId(null);
      await fetchProperties();
    } catch (err: any) {
      setError(err.response?.data?.error || 'エラーが発生しました');
    }
  };

  const handleEdit = (property: Property) => {
    setFormData({
      propertyId: property.propertyId,
      propertyName: property.propertyName,
      address: property.address,
      landValue: property.landValue,
      buildingValue: property.buildingValue,
      totalValue: property.totalValue,
      acquisitionDate: property.acquisitionDate.split('T')[0],
      acquisitionCost: property.acquisitionCost,
      category: property.category,
      // 取得関連費用
      acquisitionTax: property.acquisitionTax || 0,
      registrationTax: property.registrationTax || 0,
      brokerFee: property.brokerFee || 0,
      otherAcquisitionCosts: property.otherAcquisitionCosts || 0,
      // ローン関連情報
      outstandingLoan: property.outstandingLoan || 0,
      annualInterest: property.annualInterest || 0,
      loanStartDate: property.loanStartDate ? property.loanStartDate.split('T')[0] : '',
      purpose: property.purpose || 'residential',
      // 減価償却関連情報
      buildingStructure: property.buildingStructure || 'rc',
      constructionDate: property.constructionDate ? property.constructionDate.split('T')[0] : '',
      usefulLife: property.usefulLife || 47,
      depreciationMethod: property.depreciationMethod || 'straight-line',
      isNewProperty: property.isNewProperty || false,
    });
    setEditingId(property._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      try {
        await axios.delete(`http://localhost:5000/api/properties/${id}`);
        await fetchProperties();
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || '削除に失敗しました');
      }
    }
  };

  const handleCalculateIncome = (propertyId: string) => {
    // 不動産所得計算画面に遷移
    window.location.href = `/real-estate-income?propertyId=${propertyId}`;
  };

  const handleSellProperty = (propertyId: string) => {
    // 譲渡所得計算画面に遷移
    window.location.href = `/?propertyId=${propertyId}&module=capital-gain`;
  };

  const filteredProperties = properties.filter(
    (prop) =>
      prop.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.propertyId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">🏢 不動産物件管理</h2>
      <p className="text-gray-600 mb-6">複数の不動産物件を一元管理し、各税務モジュールで再利用できます</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 検索バー */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="物件ID または 物件名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* 新規作成ボタン */}
      <button
        onClick={() => {
          setShowForm(true);
          setEditingId(null);
          setFormData({
            propertyId: '',
            propertyName: '',
            address: '',
            landValue: 0,
            buildingValue: 0,
            totalValue: 0,
            acquisitionDate: '',
            acquisitionCost: 0,
            category: 'residential',
            acquisitionTax: 0,
            registrationTax: 0,
            brokerFee: 0,
            otherAcquisitionCosts: 0,
            outstandingLoan: 0,
            annualInterest: 0,
            loanStartDate: '',
            purpose: 'residential',
            buildingStructure: 'rc',
            constructionDate: '',
            usefulLife: 47,
            depreciationMethod: 'straight-line',
            isNewProperty: false,
          });
        }}
        className="mb-6 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
      >
        + 新規物件を追加
      </button>

      {/* フォーム */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 space-y-6">
          {/* 基本情報セクション */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">📋 基本情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物件ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="propertyId"
                  placeholder="例: PROP-001"
                  value={formData.propertyId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="propertyName"
                  placeholder="例: 東京渋谷マンション"
                  value={formData.propertyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="例: 東京都渋谷区道玄坂1-1-1"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  取得日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="acquisitionDate"
                  value={formData.acquisitionDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用途
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="residential">住宅用</option>
                  <option value="commercial">事業用</option>
                  <option value="land">土地</option>
                </select>
              </div>
            </div>
          </div>

          {/* 資産情報セクション */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">💰 資産情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  土地価値 (円) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="landValue"
                  placeholder="例: 30000000"
                  value={formData.landValue}
                  onChange={(e) => {
                    handleInputChange(e);
                    calculateTotal();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">固定資産税評価額の参考値</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  建物価値 (円) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="buildingValue"
                  placeholder="例: 50000000"
                  value={formData.buildingValue}
                  onChange={(e) => {
                    handleInputChange(e);
                    calculateTotal();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">固定資産税評価額の参考値</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  取得費用 (円)
                </label>
                <input
                  type="number"
                  name="acquisitionCost"
                  placeholder="例: 80000000"
                  value={formData.acquisitionCost}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">実際の購入額 (譲渡損益計算用)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物件評価額 (円)
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 font-semibold">
                  ¥{(formData.totalValue || 0).toLocaleString('ja-JP')}
                </div>
                <p className="text-xs text-gray-500 mt-1">土地価値 + 建物価値</p>
              </div>
            </div>
          </div>

          {/* 取得費用情報セクション */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">🏷️ 取得費用情報 (譲渡時の取得費計算用)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  不動産取得税 (円)
                </label>
                <input
                  type="number"
                  name="acquisitionTax"
                  placeholder="例: 1000000"
                  value={formData.acquisitionTax}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">取得時のみ発生</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  登録免許税 (円)
                </label>
                <input
                  type="number"
                  name="registrationTax"
                  placeholder="例: 150000"
                  value={formData.registrationTax}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">登記時に発生</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  仲介手数料 (円)
                </label>
                <input
                  type="number"
                  name="brokerFee"
                  placeholder="例: 200000"
                  value={formData.brokerFee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">不動産仲介手数料</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  その他取得費用 (円)
                </label>
                <input
                  type="number"
                  name="otherAcquisitionCosts"
                  placeholder="例: 100000"
                  value={formData.otherAcquisitionCosts}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">その他の取得関連費用</p>
              </div>
            </div>
          </div>

          {/* ローン情報セクション */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">🏦 ローン情報 (オプション)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ローン残高 (円)
                </label>
                <input
                  type="number"
                  name="outstandingLoan"
                  placeholder="例: 40000000"
                  value={formData.outstandingLoan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">現在のローン残高 (LTV計算用)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年間利息 (円)
                </label>
                <input
                  type="number"
                  name="annualInterest"
                  placeholder="例: 800000"
                  value={formData.annualInterest}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">年間支払い利息額</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ローン開始日
                </label>
                <input
                  type="date"
                  name="loanStartDate"
                  value={formData.loanStartDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ローン用途
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="residential">住宅ローン</option>
                  <option value="investment">投資用ローン</option>
                  <option value="business">事業用ローン</option>
                </select>
              </div>
            </div>
          </div>

          {/* 減価償却セクション */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">🏗️ 減価償却情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新築 or 中古
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isNewProperty"
                      checked={formData.isNewProperty === true}
                      onChange={() => setFormData({ ...formData, isNewProperty: true })}
                      className="mr-2"
                    />
                    <span className="text-sm">新築</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isNewProperty"
                      checked={formData.isNewProperty === false}
                      onChange={() => setFormData({ ...formData, isNewProperty: false })}
                      className="mr-2"
                    />
                    <span className="text-sm">中古</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">新築/中古を選択</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.isNewProperty ? '竣工年月' : '建築年月'}
                </label>
                <input
                  type="date"
                  name="constructionDate"
                  value={formData.constructionDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.isNewProperty ? '竣工年月' : '建築年月'}を入力</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  建物構造
                </label>
                <select
                  name="buildingStructure"
                  value={formData.buildingStructure}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="wood">木造（22年）</option>
                  <option value="steel">鉄骨造（27年/38年）</option>
                  <option value="rc">RC造（47年/50年）</option>
                  <option value="src">SRC造（47年/50年）</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">建物の構造を選択</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  耐用年数（年）
                </label>
                <input
                  type="number"
                  name="usefulLife"
                  placeholder="例: 47"
                  value={formData.usefulLife}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">建物の耐用年数（自動計算可）</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  償却方法
                </label>
                <select
                  name="depreciationMethod"
                  value={formData.depreciationMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="straight-line">定額法</option>
                  <option value="declining-balance">定率法</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">償却方法を選択</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              {editingId ? '更新' : '作成'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* プロパティ一覧テーブル */}
      {loading ? (
        <p className="text-center text-gray-500">読み込み中...</p>
      ) : filteredProperties.length === 0 ? (
        <p className="text-center text-gray-500">物件がまだ登録されていません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-indigo-100">
                <th className="border border-gray-300 p-3 text-left">物件ID</th>
                <th className="border border-gray-300 p-3 text-left">物件名</th>
                <th className="border border-gray-300 p-3 text-left">住所</th>
                <th className="border border-gray-300 p-3 text-right">物件価値</th>
                <th className="border border-gray-300 p-3 text-center">カテゴリ</th>
                <th className="border border-gray-300 p-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property._id} className="hover:bg-indigo-50">
                  <td className="border border-gray-300 p-3">{property.propertyId}</td>
                  <td className="border border-gray-300 p-3">{property.propertyName}</td>
                  <td className="border border-gray-300 p-3">{property.address}</td>
                  <td className="border border-gray-300 p-3 text-right">
                    ¥{(property.totalValue || 0).toLocaleString('ja-JP')}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {property.category === 'residential' && '住宅用'}
                    {property.category === 'commercial' && '事業用'}
                    {property.category === 'land' && '土地'}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <button
                      onClick={() => handleCalculateIncome(property.propertyId)}
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                      title="この物件の不動産所得を計算"
                    >
                      💰 所得計算
                    </button>
                    <button
                      onClick={() => handleSellProperty(property.propertyId)}
                      className="bg-orange-500 text-white px-3 py-1 rounded mr-2 hover:bg-orange-600"
                      title="この物件を売却して譲渡所得を計算"
                    >
                      🏷️ 売却
                    </button>
                    <button
                      onClick={() => handleEdit(property)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(property._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
