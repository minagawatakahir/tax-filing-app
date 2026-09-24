import React, { useState } from 'react';
import { IncomeData, ExpenseData } from '../services/api';

interface IncomeExpenseFormProps {
  onSubmit: (income: IncomeData, expense: ExpenseData) => void;
  loading?: boolean;
}

const IncomeExpenseForm: React.FC<IncomeExpenseFormProps> = ({ onSubmit, loading = false }) => {
  const [income, setIncome] = useState<IncomeData>({
    businessIncome: 0,
    otherIncome: 0,
  });

  const [expense, setExpense] = useState<ExpenseData>({
    rentExpense: 0,
    utilityExpense: 0,
    suppliesExpense: 0,
    travelExpense: 0,
    communicationExpense: 0,
    otherExpense: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(income, expense);
  };

  const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const sectionStyle = "bg-white p-6 rounded-lg shadow-md mb-6";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* 収入セクション */}
      <div className={sectionStyle}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 収入</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>事業所得（円）</label>
            <input
              type="number"
              className={inputStyle}
              value={income.businessIncome || ''}
              onChange={(e) => setIncome({ ...income, businessIncome: Number(e.target.value) })}
              placeholder="例: 5000000"
              required
            />
          </div>
          <div>
            <label className={labelStyle}>その他所得（円）</label>
            <input
              type="number"
              className={inputStyle}
              value={income.otherIncome || ''}
              onChange={(e) => setIncome({ ...income, otherIncome: Number(e.target.value) })}
              placeholder="例: 0"
            />
          </div>
        </div>
      </div>

      {/* 経費セクション */}
      <div className={sectionStyle}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">💰 経費</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>家賃（円）</label>
            <input
              type="number"
              className={inputStyle}
              value={expense.rentExpense || ''}
              onChange={(e) => setExpense({ ...expense, rentExpense: Number(e.target.value) })}
              placeholder="例: 600000"
            />
          </div>
          <div>
            <label className={labelStyle}>光熱費（円）</label>
            <input
              type="number"
              className={inputStyle}
              value={expense.utilityExpense || ''}
              onChange={(e) => setExpense({ ...expense, utilityExpense: Number(e.target.value) })}
              placeholder="例: 120000"
            />
          </div>
          <div>
            <label className={labelStyle}>消耗品費（円）</label>
            <input
              type="number"
              className={inputStyle}
              value={expense.suppliesExpense || ''}
              onChange={(e) => setExpense({ ...expense, suppliesExpense: Number(e.target.value) })}
              placeholder="例: 200000"
            />
          </div>
          <div>
            <label className={labelStyle}>旅費交通費（円）</label>
            <input
              type="number"
              className={inputStyle}
              value={expense.travelExpense || ''}
              onChange={(e) => setExpense({ ...expense, travelExpense: Number(e.target.value) })}
              placeholder="例: 300000"
            />
          </div>
          <div>
            <label className={labelStyle}>通信費（円）</label>
            <input
              type="number"
              className={inputStyle}
              value={expense.communicationExpense || ''}
              onChange={(e) => setExpense({ ...expense, communicationExpense: Number(e.target.value) })}
              placeholder="例: 150000"
            />
          </div>
          <div>
            <label className={labelStyle}>その他経費（円）</label>
            <input
              type="number"
              className={inputStyle}
              value={expense.otherExpense || ''}
              onChange={(e) => setExpense({ ...expense, otherExpense: Number(e.target.value) })}
              placeholder="例: 100000"
            />
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="text-center">
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-3 text-white font-semibold rounded-lg shadow-lg transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
          }`}
        >
          {loading ? '計算中...' : '税額を計算する'}
        </button>
      </div>
    </form>
  );
};

export default IncomeExpenseForm;
