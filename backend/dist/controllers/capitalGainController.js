"use strict";
/**
 * 譲渡所得計算コントローラー
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCapitalGainRecordHandler = exports.getCapitalGainRecordsHandler = exports.saveCapitalGainHandler = exports.calculateCapitalGainHandler = void 0;
const capitalGainService_1 = require("../services/capitalGainService");
const capitalGainStorageService_1 = require("../services/capitalGainStorageService");
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
        // 計算実行（TX-30: async/await対応）
        const result = await (0, capitalGainService_1.calculateCapitalGain)(input);
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
/**
 * 譲渡所得計算結果を保存
 */
const saveCapitalGainHandler = async (req, res) => {
    try {
        const { propertyId, input, result } = req.body;
        const userId = req.userId || 'demo-user';
        // バリデーション
        if (!input || !result) {
            return res.status(400).json({
                success: false,
                error: '入力値と計算結果は必須です',
            });
        }
        const savedRecord = await (0, capitalGainStorageService_1.saveCapitalGainRecord)({
            userId,
            propertyId,
            input,
            result,
        });
        res.json({
            success: true,
            data: {
                id: savedRecord._id,
                propertyId: savedRecord.propertyId,
                createdAt: savedRecord.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error saving capital gain record:', error);
        res.status(500).json({
            success: false,
            error: error.message || '保存に失敗しました',
        });
    }
};
exports.saveCapitalGainHandler = saveCapitalGainHandler;
/**
 * 譲渡所得計算履歴を取得
 */
const getCapitalGainRecordsHandler = async (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { propertyId, startDate, endDate } = req.query;
        const filters = {};
        if (propertyId)
            filters.propertyId = propertyId;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        const records = await (0, capitalGainStorageService_1.getCapitalGainRecords)(filters);
        res.json({
            success: true,
            data: records,
        });
    }
    catch (error) {
        console.error('Error fetching capital gain records:', error);
        res.status(500).json({
            success: false,
            error: error.message || '取得に失敗しました',
        });
    }
};
exports.getCapitalGainRecordsHandler = getCapitalGainRecordsHandler;
/**
 * 譲渡所得計算履歴を削除
 */
const deleteCapitalGainRecordHandler = async (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'IDは必須です',
            });
        }
        await (0, capitalGainStorageService_1.deleteCapitalGainRecord)(id);
        res.json({
            success: true,
            message: '計算結果を削除しました',
        });
    }
    catch (error) {
        console.error('Error deleting capital gain record:', error);
        res.status(500).json({
            success: false,
            error: error.message || '削除に失敗しました',
        });
    }
};
exports.deleteCapitalGainRecordHandler = deleteCapitalGainRecordHandler;
