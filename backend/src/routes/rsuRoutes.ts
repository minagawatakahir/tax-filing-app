import { Router } from 'express';
import { calculateRSUTaxHandler, aggregateAnnualRSUHandler, calculateBatchRSUHandler } from '../controllers/rsuController';

const router = Router();

/**
 * POST /api/rsu/calculate
 * RSU税務計算（単一件）
 */
router.post('/calculate', calculateRSUTaxHandler);

/**
 * POST /api/rsu/calculate-batch
 * RSU複数行一括計算
 */
router.post('/calculate-batch', calculateBatchRSUHandler);

/**
 * POST /api/rsu/annual-aggregate
 * 年間RSU収入集計
 */
router.post('/annual-aggregate', aggregateAnnualRSUHandler);

export default router;
