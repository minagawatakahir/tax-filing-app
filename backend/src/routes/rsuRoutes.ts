import { Router } from 'express';
import { calculateRSUTaxHandler, aggregateAnnualRSUHandler } from '../controllers/rsuController';

const router = Router();

/**
 * POST /api/rsu/calculate
 * RSU税務計算
 */
router.post('/calculate', calculateRSUTaxHandler);

/**
 * POST /api/rsu/annual-aggregate
 * 年間RSU収入集計
 */
router.post('/annual-aggregate', aggregateAnnualRSUHandler);

export default router;
