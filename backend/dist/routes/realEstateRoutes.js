"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const realEstateController_1 = require("../controllers/realEstateController");
const router = (0, express_1.Router)();
/**
 * POST /api/real-estate/ltv
 * LTV計算
 */
router.post('/ltv', realEstateController_1.calculateLTVHandler);
/**
 * POST /api/real-estate/interest-deduction
 * 利子控除判定計算
 */
router.post('/interest-deduction', realEstateController_1.calculateInterestDeductionHandler);
/**
 * GET /api/real-estate/analysis/:propertyId
 * 物件分析取得
 */
router.get('/analysis/:propertyId', realEstateController_1.getPropertyAnalysisHandler);
exports.default = router;
