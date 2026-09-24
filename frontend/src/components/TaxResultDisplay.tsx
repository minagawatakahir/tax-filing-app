import React from 'react';
import { TaxCalculationResult } from '../services/api';

interface TaxResultDisplayProps {
  result: TaxCalculationResult;
  suggestions?: string[];
}

const TaxResultDisplay: React.FC<TaxResultDisplayProps> = ({ result, suggestions = [] }) => {
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ja-JP') + ' 円';
  };

  const resultItemStyle = "flex justify-between py-3 border-b border-gray-200";
  const labelStyle = "text-gray-600 font-medium";
  const valueStyle = "text-gray-900 font-semibold";
  const highlightStyle = "flex justify-between py-4 bg-blue-50 px-4 rounded-lg mt-2";

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* 計算結果 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📋 計算結果{result.taxYear ? `（${result.taxYear}年分）` : ''}
        </h2>
        {result.notice && (
          <p className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-300 text-sm text-yellow-800" role="alert">
            ⚠️ {result.notice}
          </p>
        )}
        
        <div className="space-y-2">
          <div className={resultItemStyle}>
            <span className={labelStyle}>総所得</span>
            <span className={valueStyle}>{formatCurrency(result.totalIncome)}</span>
          </div>
          <div className={resultItemStyle}>
            <span className={labelStyle}>総経費</span>
            <span className={valueStyle}>{formatCurrency(result.totalExpense)}</span>
          </div>
          <div className={resultItemStyle}>
            <span className={labelStyle}>所得金額（所得 - 経費）</span>
            <span className={valueStyle}>{formatCurrency(result.netIncome)}</span>
          </div>
          <div className={resultItemStyle}>
            <span className={labelStyle}>基礎控除</span>
            <span className={valueStyle}>{formatCurrency(result.basicDeduction)}</span>
          </div>
          <div className={resultItemStyle}>
            <span className={labelStyle}>課税対象所得</span>
            <span className={valueStyle}>{formatCurrency(result.taxableIncome)}</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-300">
          <div className={highlightStyle}>
            <span className="text-lg font-bold text-blue-800">所得税及び復興特別所得税</span>
            <span className="text-lg font-bold text-blue-900">{formatCurrency(result.incomeTax)}</span>
          </div>
          {result.baseIncomeTax !== undefined && result.reconstructionTax !== undefined && (
            <div className="flex justify-between px-4 py-1 text-sm text-gray-600">
              <span>内訳: 所得税 {formatCurrency(result.baseIncomeTax)} / 復興特別所得税 {formatCurrency(result.reconstructionTax)}</span>
            </div>
          )}
          <div className={highlightStyle}>
            <span className="text-lg font-bold text-blue-800">住民税（概算）</span>
            <span className="text-lg font-bold text-blue-900">{formatCurrency(result.inhabTax)}</span>
          </div>
          <div className="bg-gradient-to-r from-red-100 to-orange-100 px-4 py-4 rounded-lg mt-4">
            <div className="flex justify-between">
              <span className="text-xl font-bold text-red-800">合計税額</span>
              <span className="text-xl font-bold text-red-900">{formatCurrency(result.totalTax)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 節税提案 */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-green-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-green-800 mb-4">💡 節税アドバイス</h3>
          <ul className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 手取り額の概算 */}
      <div className="bg-purple-50 p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-xl font-bold text-purple-800 mb-4">💵 手取り概算</h3>
        <div className="text-center">
          <p className="text-gray-600 mb-2">税引後の手取り（社会保険料除く）</p>
          <p className="text-3xl font-bold text-purple-900">
            {formatCurrency(result.netIncome - result.totalTax)}
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          ※ 社会保険料は含まれていません。住民税は調整控除等を考慮しない概算です
        </p>
      </div>
    </div>
  );
};

export default TaxResultDisplay;
