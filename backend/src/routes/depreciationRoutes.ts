import { Router } from 'express';
import {
  calculateDepreciationScheduleHandler,
  predictFutureUndepreciatedBalanceHandler,
  getDepreciationReportHandler,
} from '../controllers/depreciationController';

const router = Router();

/**
 * POST /api/depreciation/schedule
 * 減価償却スケジュール計算
 */
router.post('/schedule', calculateDepreciationScheduleHandler);

/**
 * POST /api/depreciation/future-balance
 * 将来の未償却残高予測
 */
router.post('/future-balance', predictFutureUndepreciatedBalanceHandler);

/**
 * GET /api/depreciation/report/:assetId
 * 減価償却レポート取得
 */
router.get('/report/:assetId', getDepreciationReportHandler);

export default router;
