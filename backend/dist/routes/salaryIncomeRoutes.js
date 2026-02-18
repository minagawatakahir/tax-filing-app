"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const salaryIncomeController_1 = require("../controllers/salaryIncomeController");
const router = (0, express_1.Router)();
/**
 * POST /api/salary-income/calculate
 * 給与所得を計算
 */
router.post('/calculate', salaryIncomeController_1.calculateSalaryIncomeHandler);
exports.default = router;
