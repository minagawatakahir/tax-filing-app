"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDepreciableBasisHandler = exports.calculateDepreciationFromPropertyHandler = exports.getDepreciationReportHandler = exports.predictFutureUndepreciatedBalanceHandler = exports.calculateDepreciationScheduleHandler = void 0;
const depreciationService_1 = require("../services/depreciationService");
// TX-31: 取得関連費用を含む減価償却基礎額計算
const depreciationHelpers_1 = require("../services/depreciationHelpers");
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
/**
 * TX-31: Propertyから減価償却資産を生成し、スケジュール計算
 * 取得関連費用（登録免許税、仲介手数料）を建物取得価額に含める
 */
const calculateDepreciationFromPropertyHandler = async (req, res) => {
    try {
        const { propertyId, usefulLife } = req.body;
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                error: 'propertyId は必須です',
            });
        }
        // TX-31: Propertyモデルから減価償却資産を生成
        const asset = await (0, depreciationHelpers_1.createDepreciableAssetFromProperty)(propertyId, usefulLife);
        // スケジュール計算
        const schedule = (0, depreciationService_1.generateDepreciationSchedule)(asset);
        res.json({
            success: true,
            data: {
                asset,
                schedule,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.calculateDepreciationFromPropertyHandler = calculateDepreciationFromPropertyHandler;
/**
 * TX-31: 建物の減価償却基礎額を計算（取得関連費用の按分を含む）
 */
const calculateDepreciableBasisHandler = async (req, res) => {
    try {
        const { propertyId } = req.body;
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                error: 'propertyId は必須です',
            });
        }
        // TX-31: 建物の減価償却基礎額を計算
        const depreciableBasis = await (0, depreciationHelpers_1.calculateDepreciableBasis)(propertyId);
        res.json({
            success: true,
            data: {
                propertyId,
                depreciableBasis,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.calculateDepreciableBasisHandler = calculateDepreciableBasisHandler;
