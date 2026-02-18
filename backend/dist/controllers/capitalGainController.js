"use strict";
/**
 * 譲渡所得計算コントローラー
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCapitalGainHandler = void 0;
const capitalGainService_1 = require("../services/capitalGainService");
/**
 * 譲渡所得計算ハンドラー
 */
const calculateCapitalGainHandler = async (req, res) => {
    try {
        const input = req.body;
        // バリデーション
        if (!input.propertyId || !input.saleDate || !input.salePrice) {
            return res.status(400).json({
                success: false,
                error: '必須項目が入力されていません',
            });
        }
        // 計算実行
        const result = (0, capitalGainService_1.calculateCapitalGain)(input);
        return res.json({
            success: true,
            result,
        });
    }
    catch (error) {
        console.error('Error calculating capital gain:', error);
        return res.status(500).json({
            success: false,
            error: error.message || '計算に失敗しました',
        });
    }
};
exports.calculateCapitalGainHandler = calculateCapitalGainHandler;
