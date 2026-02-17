import { Router } from 'express';
import { calculateTaxHandler, quickSimulationHandler } from '../controllers/taxController';

const router = Router();

/**
 * POST /api/tax/calculate
 * 詳細な税務計算を実行
 */
router.post('/calculate', calculateTaxHandler);

/**
 * POST /api/tax/quick-simulation
 * 簡易シミュレーション
 */
router.post('/quick-simulation', quickSimulationHandler);

export default router;
