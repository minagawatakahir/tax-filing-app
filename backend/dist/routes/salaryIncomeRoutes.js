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
/**
 * POST /api/salary-income/save
 * 給与所得計算結果を保存
 */
router.post('/save', salaryIncomeController_1.saveSalaryIncomeHandler);
/**
 * GET /api/salary-income/records
 * 給与所得計算履歴を取得
 */
router.get('/records', salaryIncomeController_1.getSalaryIncomeRecordsHandler);
/**
 * DELETE /api/salary-income/:id
 * 給与所得計算履歴を削除
 */
router.delete('/:id', salaryIncomeController_1.deleteSalaryIncomeRecordHandler);
/**
 * GET /api/salary-income/export-csv/:year
 * 給与所得をCSV形式でエクスポート
 */
router.get('/export-csv/:year', salaryIncomeController_1.exportSalaryIncomeCSVHandler);
exports.default = router;
