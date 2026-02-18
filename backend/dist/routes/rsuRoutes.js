"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rsuController_1 = require("../controllers/rsuController");
const router = (0, express_1.Router)();
/**
 * POST /api/rsu/calculate
 * RSU税務計算（単一件）
 */
router.post('/calculate', rsuController_1.calculateRSUTaxHandler);
/**
 * POST /api/rsu/calculate-batch
 * RSU複数行一括計算
 */
router.post('/calculate-batch', rsuController_1.calculateBatchRSUHandler);
/**
 * POST /api/rsu/annual-aggregate
 * 年間RSU収入集計
 */
router.post('/annual-aggregate', rsuController_1.aggregateAnnualRSUHandler);
exports.default = router;
