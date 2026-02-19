import express from 'express';
import {
  saveRSUIncome,
  getRSUIncomeList,
  getRSUIncomeById,
  deleteRSUIncome,
  updateRSUIncome,
  getRSUIncomeSummary,
  exportRSUIncomePDF,
} from '../controllers/rsuIncomeController';

const router = express.Router();

/**
 * RSU所得の保存・取得・削除API
 */

// POST /api/rsu-income/save - RSU所得計算結果を保存
router.post('/save', saveRSUIncome);

// GET /api/rsu-income/list?year=2026 - RSU所得記録を取得
router.get('/list', getRSUIncomeList);

// GET /api/rsu-income/summary?year=2026 - 年度別合計RSU所得を取得
router.get('/summary', getRSUIncomeSummary);

// GET /api/rsu-income/export-pdf?year=2026 - RSU所得一覧をPDF出力
router.get('/export-pdf', exportRSUIncomePDF);

// GET /api/rsu-income/:id - RSU所得記録を1件取得
router.get('/:id', getRSUIncomeById);

// PUT /api/rsu-income/:id - RSU所得記録を更新
router.put('/:id', updateRSUIncome);

// DELETE /api/rsu-income/:id - RSU所得記録を削除
router.delete('/:id', deleteRSUIncome);

export default router;
