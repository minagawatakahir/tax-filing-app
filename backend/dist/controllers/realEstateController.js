"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyAnalysisHandler = exports.calculateInterestDeductionHandler = exports.calculateLTVHandler = void 0;
const realEstateLTVService_1 = require("../services/realEstateLTVService");
/**
 * LTV計算ハンドラー
 */
const calculateLTVHandler = async (req, res) => {
    try {
        const { property, loans } = req.body;
        const result = (0, realEstateLTVService_1.calculateLTV)(property, loans);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.calculateLTVHandler = calculateLTVHandler;
/**
 * 利子控除判定ハンドラー
 */
const calculateInterestDeductionHandler = async (req, res) => {
    try {
        const { property, loans } = req.body;
        const result = (0, realEstateLTVService_1.calculateInterestDeduction)(property, loans);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.calculateInterestDeductionHandler = calculateInterestDeductionHandler;
/**
 * 物件分析取得ハンドラー
 */
const getPropertyAnalysisHandler = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Property analysis feature coming soon',
            propertyId: req.params.propertyId
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getPropertyAnalysisHandler = getPropertyAnalysisHandler;
