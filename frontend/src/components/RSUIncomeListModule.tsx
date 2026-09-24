import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFiscalYear } from '../contexts/FiscalYearContext';

interface RSUIncomeRecord {
  id: string;
  userId: string;
  year: number;
  input: Array<{
    companyName: string;
    grantDate: string;
    vestingDate: string;
    shares: number;
    pricePerShareUSD: number;
    ttmRate?: number;
  }>;
  result: Array<{
    companyName: string;
    vestingDate: string;
    shares: number;
    pricePerShareUSD: number;
    ttmRate: number;
    totalValueJPY: number;
    taxableIncome: number;
  }>;
  totalRSUIncome: number;
  createdAt: string;
  updatedAt: string;
}

const RSUIncomeListModule: React.FC = () => {
  const { currentFiscalYear } = useFiscalYear();
  const [records, setRecords] = useState<RSUIncomeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // データ取得
  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://localhost:5000/api/rsu-income/list?year=${currentFiscalYear.year}`
      );
      if (response.data.success) {
        setRecords(response.data.data || []);
      } else {
        setError(response.data.error || 'データ取得エラー');
      }
    } catch (err: any) {
      console.error('RSU所得記録取得エラー:', err);
      setError('データ取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [currentFiscalYear]);

  // 削除
  const handleDelete = async (id: string) => {
    if (!window.confirm('この記録を削除しますか？')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/rsu-income/${id}`);
      if (response.data.success) {
        alert('削除しました');
        fetchRecords();
      } else {
        alert('削除失敗: ' + response.data.error);
      }
    } catch (err: any) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    }
  };

  // PDF出力
  const handleExportPDF = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/rsu-income/export-pdf?year=${currentFiscalYear.year}`,
        {
          responseType: 'blob',
        }
      );

      // Blobからダウンロードリンクを作成
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RSU_Income_${currentFiscalYear.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF出力エラー:', err);
      alert('PDF出力に失敗しました');
    }
  };

  // 年間合計を計算
  const totalIncome = records.reduce((sum, record) => sum + record.totalRSUIncome, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        💼 RSU所得一覧 ({currentFiscalYear.year}年度)
      </h1>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">
            {currentFiscalYear.year}年度のRSU所得記録がありません
          </p>
          <p className="text-sm text-gray-600">
            RSU為替計算モジュールで計算後、「保存」ボタンで記録を保存できます
          </p>
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <>
          {/* 年間合計 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-blue-900 mb-2">
                  {currentFiscalYear.year}年度 RSU所得合計
                </h2>
                <p className="text-3xl font-bold text-blue-700">
                  ¥{totalIncome.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleExportPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                📄 PDF出力
              </button>
            </div>
          </div>

          {/* 記録一覧 */}
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {record.year}年度 RSU所得記録
                  </h3>
                  <p className="text-sm text-gray-500">
                    作成日: {new Date(record.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  削除
                </button>
              </div>

              {/* 企業別詳細 */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        企業名
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        権利確定日
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        株数
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        USD単価
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        TTMレート
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        JPY評価額
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        所得額
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.result.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {item.companyName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(item.vestingDate).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-800">
                          {item.shares.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-800">
                          ${item.pricePerShareUSD.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-800">
                          ¥{item.ttmRate.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-800">
                          ¥{item.totalValueJPY.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-semibold text-blue-700">
                          ¥{item.taxableIncome.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={6} className="px-4 py-2 text-right font-semibold text-gray-800">
                        合計所得額:
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-blue-700 text-lg">
                        ¥{record.totalRSUIncome.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default RSUIncomeListModule;
