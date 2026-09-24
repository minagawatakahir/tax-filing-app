import React, { useState, useEffect } from 'react';
import { SavedCalculation, getAllCalculations, deleteCalculation, exportCalculations } from '../services/storage';

interface SavedCalculationsProps {
  onLoadCalculation?: (calculation: SavedCalculation) => void;
}

const SavedCalculations: React.FC<SavedCalculationsProps> = ({ onLoadCalculation }) => {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = () => {
    const saved = getAllCalculations();
    setCalculations(saved.reverse()); // 新しい順に表示
  };

  const handleDelete = (id: string) => {
    if (window.confirm('この記録を削除しますか？')) {
      deleteCalculation(id);
      loadCalculations();
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ja-JP') + ' 円';
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
        >
          📁 保存済み計算 ({calculations.length})
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📁 保存済み計算</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {calculations.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-xl">保存された計算がありません</p>
              <p className="mt-2">計算結果が自動的に保存されます</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calculations.map((calc) => (
                <div key={calc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-500">{formatDate(calc.date)}</p>
                      <p className="text-lg font-semibold mt-1">
                        総所得: {formatCurrency(calc.result.totalIncome)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(calc.id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50"
                    >
                      🗑️ 削除
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">総経費: {formatCurrency(calc.result.totalExpense)}</p>
                      <p className="text-gray-600">所得金額: {formatCurrency(calc.result.netIncome)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">所得税: {formatCurrency(calc.result.incomeTax)}</p>
                      <p className="font-semibold text-red-600">合計税額: {formatCurrency(calc.result.totalTax)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {calculations.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={exportCalculations}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
            >
              📥 JSONでエクスポート
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCalculations;
