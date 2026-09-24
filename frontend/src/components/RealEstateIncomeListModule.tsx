import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFiscalYear } from '../contexts/FiscalYearContext';
import { formatCurrency } from '../utils/formatters';

interface RealEstateIncomeRecord {
  _id: string;
  fiscalYear: number;
  propertyId: string;
  propertyName: string;
  totalIncome: number;
  totalExpenses: number;
  realEstateIncome: number;
  monthlyRent: number;
  months: number;
  otherIncome: number;
  managementFee: number;
  repairCost: number;
  propertyTax: number;
  loanInterest: number;
  insurance: number;
  utilities: number;
  otherExpenses: number;
  depreciationExpense: number;
}

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  totalRealEstateIncome: number;
  recordCount: number;
}

const RealEstateIncomeListModule: React.FC = () => {
  const { currentFiscalYear } = useFiscalYear();
  const [records, setRecords] = useState<RealEstateIncomeRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // データ取得
  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://localhost:5000/api/real-estate-income-list/${currentFiscalYear.year}`
      );
      setRecords(response.data.records);
      setSummary(response.data.summary);
    } catch (err: any) {
      console.error('Error fetching records:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 年度変更時にデータ再取得
  useEffect(() => {
    fetchRecords();
  }, [currentFiscalYear]);

  // 削除処理
  const handleDelete = async (id: string) => {
    if (!window.confirm('この不動産所得データを削除しますか？')) return;

    try {
      await axios.delete(`http://localhost:5000/api/real-estate-income-list/${id}`);
      fetchRecords(); // 再取得
    } catch (err: any) {
      console.error('Error deleting record:', err);
      alert('削除に失敗しました');
    }
  };

  // 新規追加（不動産所得タブに遷移）
  const handleAddNew = () => {
    window.location.href = '/?module=real-estate-income';
  };

  // TX-35: PDF出力処理
  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/real-estate-income/export-pdf?year=${currentFiscalYear.year}`,
        { responseType: 'blob' }
      );
      
      // PDFをダウンロード
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `不動産所得一覧_${currentFiscalYear.year}年度.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error exporting PDF:', err);
      setError('PDF出力に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // TX-27: CSV出力処理
  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/real-estate-income-list/export-csv/${currentFiscalYear.year}`,
        { responseType: 'blob' }
      );
      
      // CSVをダウンロード
      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `不動産所得一覧_${currentFiscalYear.year}年度.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error exporting CSV:', err);
      setError('CSV出力に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📊 {currentFiscalYear.year}年 不動産所得一覧
      </h1>

      {/* アクションボタン */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <button
          onClick={handleAddNew}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-medium"
        >
          + 新規追加
        </button>
        <button
          onClick={fetchRecords}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-medium"
        >
          🔄 更新
        </button>
        <button
          onClick={handleExportCSV}
          disabled={loading || records.length === 0}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          📊 CSV出力
        </button>
        <button
          onClick={handleExportPDF}
          disabled={records.length === 0 || loading}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          📄 PDF出力
        </button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      )}

      {/* データテーブル */}
      {!loading && records.length === 0 && (
        <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-600">
          {currentFiscalYear.year}年の不動産所得データがありません。<br />
          「+ 新規追加」ボタンから追加してください。
        </div>
      )}

      {!loading && records.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">物件名</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">収入</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">経費</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">不動産所得</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr
                    key={record._id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 text-sm">{record.propertyName}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      ¥{formatCurrency(record.totalIncome)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      ¥{formatCurrency(record.totalExpenses)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right font-semibold ${
                        record.realEstateIncome >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      ¥{formatCurrency(record.realEstateIncome)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {summary && (
                <tfoot className="bg-blue-100 font-bold">
                  <tr>
                    <td className="px-4 py-3 text-sm">合計 ({summary.recordCount}件)</td>
                    <td className="px-4 py-3 text-sm text-right">
                      ¥{formatCurrency(summary.totalIncome)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      ¥{formatCurrency(summary.totalExpenses)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600">
                      ¥{formatCurrency(summary.totalRealEstateIncome)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default RealEstateIncomeListModule;
