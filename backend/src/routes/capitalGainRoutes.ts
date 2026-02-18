import express from 'express';
import { calculateCapitalGainHandler } from '../controllers/capitalGainController';

const router = express.Router();

/**
 * POST /api/capital-gain/calculate
 * 譲渡所得を計算
 */
router.post('/calculate', calculateCapitalGainHandler);

export default router;
