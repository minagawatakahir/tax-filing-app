"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taxController_1 = require("../controllers/taxController");
const router = (0, express_1.Router)();
/**
 * POST /api/tax/calculate
 * 詳細な税務計算を実行
 */
router.post('/calculate', taxController_1.calculateTaxHandler);
/**
 * POST /api/tax/quick-simulation
 * 簡易シミュレーション
 */
router.post('/quick-simulation', taxController_1.quickSimulationHandler);
exports.default = router;
