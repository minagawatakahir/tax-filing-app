import { Router } from 'express';
import {
  calculateSalaryIncomeHandler,
  saveSalaryIncomeHandler,
  getSalaryIncomeRecordsHandler,
  deleteSalaryIncomeRecordHandler,
  exportSalaryIncomeCSVHandler,
} from '../controllers/salaryIncomeController';

const router = Router();

/**
 * POST /api/salary-income/calculate
 * 給与所得を計算
 */
router.post('/calculate', calculateSalaryIncomeHandler);

/**
 * POST /api/salary-income/save
 * 給与所得計算結果を保存
 */
router.post('/save', saveSalaryIncomeHandler);

/**
 * GET /api/salary-income/records
 * 給与所得計算履歴を取得
 */
router.get('/records', getSalaryIncomeRecordsHandler);

/**
 * DELETE /api/salary-income/:id
 * 給与所得計算履歴を削除
 */
router.delete('/:id', deleteSalaryIncomeRecordHandler);

/**
 * GET /api/salary-income/export-csv/:year
 * 給与所得をCSV形式でエクスポート
 */
router.get('/export-csv/:year', exportSalaryIncomeCSVHandler);

export default router;
