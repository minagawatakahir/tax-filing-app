"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rsuIncomeController_1 = require("../controllers/rsuIncomeController");
const router = express_1.default.Router();
/**
 * RSU所得の保存・取得・削除API
 */
// POST /api/rsu-income/save - RSU所得計算結果を保存
router.post('/save', rsuIncomeController_1.saveRSUIncome);
// GET /api/rsu-income/list?year=2026 - RSU所得記録を取得
router.get('/list', rsuIncomeController_1.getRSUIncomeList);
// GET /api/rsu-income/summary?year=2026 - 年度別合計RSU所得を取得
router.get('/summary', rsuIncomeController_1.getRSUIncomeSummary);
// GET /api/rsu-income/export-pdf?year=2026 - RSU所得一覧をPDF出力
router.get('/export-pdf', rsuIncomeController_1.exportRSUIncomePDF);
// GET /api/rsu-income/:id - RSU所得記録を1件取得
router.get('/:id', rsuIncomeController_1.getRSUIncomeById);
// PUT /api/rsu-income/:id - RSU所得記録を更新
router.put('/:id', rsuIncomeController_1.updateRSUIncome);
// DELETE /api/rsu-income/:id - RSU所得記録を削除
router.delete('/:id', rsuIncomeController_1.deleteRSUIncome);
exports.default = router;
