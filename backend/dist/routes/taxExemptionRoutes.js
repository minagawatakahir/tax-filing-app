"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taxExemptionController_1 = require("../controllers/taxExemptionController");
const router = (0, express_1.Router)();
/**
 * POST /api/tax-exemption/simulate
 * 3,000万円控除 vs 住宅ローン控除シミュレーション
 */
router.post('/simulate', taxExemptionController_1.simulate30MExemptionVsMortgageDeductionHandler);
/**
 * POST /api/tax-exemption/optimal-strategy
 * 最適戦略提案
 */
router.post('/optimal-strategy', taxExemptionController_1.getOptimalStrategyHandler);
exports.default = router;
