"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const depreciationController_1 = require("../controllers/depreciationController");
const router = (0, express_1.Router)();
/**
 * POST /api/depreciation/schedule
 * 減価償却スケジュール計算
 */
router.post('/schedule', depreciationController_1.calculateDepreciationScheduleHandler);
/**
 * POST /api/depreciation/future-balance
 * 将来の未償却残高予測
 */
router.post('/future-balance', depreciationController_1.predictFutureUndepreciatedBalanceHandler);
/**
 * GET /api/depreciation/report/:assetId
 * 減価償却レポート取得
 */
router.get('/report/:assetId', depreciationController_1.getDepreciationReportHandler);
exports.default = router;
