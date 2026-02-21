"use strict";
/**
 * 譲渡所得計算コントローラー
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCapitalGainListPDF = exports.deleteCapitalGainRecordHandler = exports.getCapitalGainRecordsHandler = exports.saveCapitalGainHandler = exports.calculateCapitalGainHandler = void 0;
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
        const { fiscalYear, propertyId, input, result } = req.body;
        const userId = req.userId || 'demo-user';
        // バリデーション
        if (!fiscalYear || !input || !result) {
            return res.status(400).json({
                success: false,
                error: '年度、入力値と計算結果は必須です',
            });
        }
        const savedRecord = await (0, capitalGainStorageService_1.saveCapitalGainRecord)({
            userId,
            fiscalYear,
            propertyId,
            input,
            result,
        });
        res.json({
            success: true,
            data: {
                id: savedRecord._id,
                fiscalYear: savedRecord.fiscalYear,
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
        const { fiscalYear, propertyId, startDate, endDate } = req.query;
        const filters = {};
        if (fiscalYear)
            filters.fiscalYear = parseInt(fiscalYear);
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
/**
 * TX-35: 譲渡所得一覧PDF出力
 */
const exportCapitalGainListPDF = async (req, res) => {
    try {
        const year = parseInt(req.query.year);
        if (!year) {
            return res.status(400).json({
                success: false,
                error: 'year parameter is required',
            });
        }
        // データ取得
        const { getCapitalGainRecords } = await Promise.resolve().then(() => __importStar(require('../services/capitalGainStorageService')));
        const records = await getCapitalGainRecords({ fiscalYear: year });
        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No capital gain records found for the specified year',
            });
        }
        // 合計計算
        const totalGain = records.reduce((sum, r) => sum + (r.result?.capitalGain || 0), 0);
        // PDF生成
        const { generateCapitalGainListPDF } = await Promise.resolve().then(() => __importStar(require('../services/pdfGenerationService')));
        const pdfStream = generateCapitalGainListPDF({
            year,
            properties: records.map((r) => ({
                propertyId: r.propertyId,
                propertyName: `Property ${r.propertyId}`,
                salePrice: r.input?.salePrice || 0,
                acquisitionCost: r.input?.acquisitionCost || 0,
                transferCost: r.input?.sellingExpenses || 0,
                gain: r.result?.capitalGain || 0,
            })),
            totalGain,
        });
        // レスポンスヘッダー設定
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CapitalGain_${year}.pdf`);
        // PDFをストリーム出力
        pdfStream.pipe(res);
    }
    catch (error) {
        console.error('Error exporting capital gain PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export capital gain PDF: ' + error.message,
        });
    }
};
exports.exportCapitalGainListPDF = exportCapitalGainListPDF;
