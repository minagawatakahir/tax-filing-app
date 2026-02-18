"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const salaryIncomeController_1 = require("../controllers/salaryIncomeController");
const router = (0, express_1.Router)();
// 給与所得計算結果を保存
router.post('/save', salaryIncomeController_1.saveSalaryIncomeHandler);
// 給与所得計算履歴を取得
router.get('/records', salaryIncomeController_1.getSalaryIncomeRecordsHandler);
// 給与所得計算履歴を削除
router.delete('/records/:id', salaryIncomeController_1.deleteSalaryIncomeRecordHandler);
exports.default = router;
