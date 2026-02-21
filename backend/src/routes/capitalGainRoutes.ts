import express from 'express';
import { 
  calculateCapitalGainHandler,
  exportCapitalGainListPDF,
  getSoldPropertiesHandler,
} from '../controllers/capitalGainController';

const router = express.Router();

/**
 * POST /api/capital-gain/calculate
 * 譲渡所得を計算
 */
router.post('/calculate', calculateCapitalGainHandler);

/**
 * GET /api/capital-gain/export-pdf?year=2026
 * TX-35: 譲渡所得一覧をPDF出力
 */
router.get('/export-pdf', exportCapitalGainListPDF);

/**
 * GET /api/capital-gain/sold-properties
 * TX-39: 売却済み物件の一覧を取得（譲渡所得計算の候補）
 */
router.get('/sold-properties', getSoldPropertiesHandler);

export default router;
