import { Router } from 'express';
import {
  simulate30MExemptionVsMortgageDeductionHandler,
  getOptimalStrategyHandler,
} from '../controllers/taxExemptionController';

const router = Router();

/**
 * POST /api/tax-exemption/simulate
 * 3,000万円控除 vs 住宅ローン控除シミュレーション
 */
router.post('/simulate', simulate30MExemptionVsMortgageDeductionHandler);

/**
 * POST /api/tax-exemption/optimal-strategy
 * 最適戦略提案
 */
router.post('/optimal-strategy', getOptimalStrategyHandler);

export default router;
