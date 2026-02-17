"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepreciationReportHandler = exports.predictFutureUndepreciatedBalanceHandler = exports.calculateDepreciationScheduleHandler = void 0;
const depreciationService_1 = require("../services/depreciationService");
/**
 * 減価償却スケジュール計算ハンドラー
 */
const calculateDepreciationScheduleHandler = async (req, res) => {
    try {
        const asset = {
            assetId: req.body.assetId,
            assetName: req.body.assetName,
            acquisitionDate: new Date(req.body.acquisitionDate),
            acquisitionCost: req.body.acquisitionCost,
            category: req.body.category,
            usefulLife: req.body.usefulLife,
            depreciationMethod: req.body.depreciationMethod || 'straight',
        };
        const schedule = (0, depreciationService_1.generateDepreciationSchedule)(asset);
        res.json({ success: true, data: schedule });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.calculateDepreciationScheduleHandler = calculateDepreciationScheduleHandler;
/**
 * 将来の未償却残高予測ハンドラー
 */
const predictFutureUndepreciatedBalanceHandler = async (req, res) => {
    try {
        const asset = {
            assetId: req.body.assetId,
            assetName: req.body.assetName,
            acquisitionDate: new Date(req.body.acquisitionDate),
            acquisitionCost: req.body.acquisitionCost,
            category: req.body.category,
            usefulLife: req.body.usefulLife,
            depreciationMethod: req.body.depreciationMethod || 'straight',
        };
        const projectionYears = req.body.projectionYears || 10;
        const projection = (0, depreciationService_1.predictFutureUndepreciatedBalance)(asset, projectionYears);
        res.json({ success: true, data: projection });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.predictFutureUndepreciatedBalanceHandler = predictFutureUndepreciatedBalanceHandler;
/**
 * 減価償却レポート取得ハンドラー
 */
const getDepreciationReportHandler = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Depreciation report feature coming soon',
            assetId: req.params.assetId,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getDepreciationReportHandler = getDepreciationReportHandler;
