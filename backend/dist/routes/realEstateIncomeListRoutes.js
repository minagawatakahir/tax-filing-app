"use strict";
/**
 * 不動産所得一覧・管理API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const realEstateIncomeStorageService_1 = require("../services/realEstateIncomeStorageService");
const router = express_1.default.Router();
/**
 * GET /api/real-estate-income-list/:fiscalYear
 * 指定年度の不動産所得一覧を取得
 */
router.get('/:fiscalYear', (req, res) => {
    try {
        const fiscalYearStr = Array.isArray(req.params.fiscalYear) ? req.params.fiscalYear[0] : req.params.fiscalYear;
        const fiscalYear = parseInt(fiscalYearStr);
        const records = (0, realEstateIncomeStorageService_1.getRealEstateIncomeByFiscalYear)(fiscalYear);
        const summary = (0, realEstateIncomeStorageService_1.calculateFiscalYearTotal)(fiscalYear);
        res.json({
            success: true,
            fiscalYear,
            records,
            summary,
        });
    }
    catch (error) {
        console.error('Error fetching real estate income list:', error);
        res.status(500).json({
            success: false,
            error: error.message || '一覧取得に失敗しました',
        });
    }
});
/**
 * POST /api/real-estate-income-list
 * 新規不動産所得を保存
 */
router.post('/', (req, res) => {
    try {
        const incomeData = req.body;
        // バリデーション
        if (!incomeData.fiscalYear || !incomeData.propertyId) {
            res.status(400).json({
                success: false,
                error: '年度とpropertyIdは必須です',
            });
            return;
        }
        const saved = (0, realEstateIncomeStorageService_1.saveRealEstateIncome)(incomeData);
        res.json({
            success: true,
            data: saved,
        });
    }
    catch (error) {
        console.error('Error saving real estate income:', error);
        res.status(500).json({
            success: false,
            error: error.message || '保存に失敗しました',
        });
    }
});
/**
 * PUT /api/real-estate-income-list/:id
 * 不動産所得を更新
 */
router.put('/:id', (req, res) => {
    try {
        const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = idStr;
        const incomeData = req.body;
        const updated = (0, realEstateIncomeStorageService_1.updateRealEstateIncome)(id, incomeData);
        if (!updated) {
            res.status(404).json({
                success: false,
                error: '指定されたレコードが見つかりません',
            });
            return;
        }
        res.json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        console.error('Error updating real estate income:', error);
        res.status(500).json({
            success: false,
            error: error.message || '更新に失敗しました',
        });
    }
});
/**
 * DELETE /api/real-estate-income-list/:id
 * 不動産所得を削除
 */
router.delete('/:id', (req, res) => {
    try {
        const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = idStr;
        const deleted = (0, realEstateIncomeStorageService_1.deleteRealEstateIncome)(id);
        if (!deleted) {
            res.status(404).json({
                success: false,
                error: '指定されたレコードが見つかりません',
            });
            return;
        }
        res.json({
            success: true,
            message: '削除しました',
        });
    }
    catch (error) {
        console.error('Error deleting real estate income:', error);
        res.status(500).json({
            success: false,
            error: error.message || '削除に失敗しました',
        });
    }
});
exports.default = router;
