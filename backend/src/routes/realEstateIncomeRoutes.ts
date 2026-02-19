import express from 'express';
import {
  calculateSinglePropertyIncomeHandler,
  calculatePortfolioIncomeHandler,
  exportRealEstateIncomePDF,
} from '../controllers/realEstateIncomeController';

const router = express.Router();

/**
 * POST /api/real-estate-income/calculate
 * 単一物件の不動産所得を計算
 */
router.post('/calculate', calculateSinglePropertyIncomeHandler);

/**
 * POST /api/real-estate-income/portfolio
 * 複数物件の不動産所得を一括計算
 */
router.post('/portfolio', calculatePortfolioIncomeHandler);

/**
 * GET /api/real-estate-income/export-pdf?year=2026
 * TX-35: 不動産所得一覧をPDF出力
 */
router.get('/export-pdf', exportRealEstateIncomePDF);

export default router;
