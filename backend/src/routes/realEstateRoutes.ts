import { Router } from 'express';
import {
  calculateLTVHandler,
  calculateInterestDeductionHandler,
  getPropertyAnalysisHandler,
} from '../controllers/realEstateController';

const router = Router();

/**
 * POST /api/real-estate/ltv
 * LTV計算
 */
router.post('/ltv', calculateLTVHandler);

/**
 * POST /api/real-estate/interest-deduction
 * 利子控除判定計算
 */
router.post('/interest-deduction', calculateInterestDeductionHandler);

/**
 * GET /api/real-estate/analysis/:propertyId
 * 物件分析取得
 */
router.get('/analysis/:propertyId', getPropertyAnalysisHandler);

export default router;
