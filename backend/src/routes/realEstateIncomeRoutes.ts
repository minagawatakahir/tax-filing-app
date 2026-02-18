import express from 'express';
import {
  calculateSinglePropertyIncomeHandler,
  calculatePortfolioIncomeHandler,
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

export default router;
