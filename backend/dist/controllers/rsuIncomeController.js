"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRSUIncomePDF = exports.getRSUIncomeSummary = exports.updateRSUIncome = exports.deleteRSUIncome = exports.getRSUIncomeById = exports.getRSUIncomeList = exports.saveRSUIncome = void 0;
const rsuIncomeStorageService_1 = require("../services/rsuIncomeStorageService");
const pdfGenerationService_1 = require("../services/pdfGenerationService");
/**
 * RSU所得の保存・取得・削除を行うコントローラー
 */
/**
 * RSU所得計算結果を保存
 * POST /api/rsu-income/save
 */
const saveRSUIncome = async (req, res) => {
    try {
        const { year, input, result, totalRSUIncome } = req.body;
        const userId = req.query.userId || 'demo-user';
        // バリデーション
        if (!year || !input || !result || totalRSUIncome === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: year, input, result, totalRSUIncome',
            });
        }
        if (!Array.isArray(input) || !Array.isArray(result)) {
            return res.status(400).json({
                success: false,
                error: 'input and result must be arrays',
            });
        }
        const savedRecord = await (0, rsuIncomeStorageService_1.saveRSUIncomeRecord)(userId, year, input, result, totalRSUIncome);
        res.status(201).json({
            success: true,
            data: {
                id: savedRecord._id,
                userId: savedRecord.userId,
                year: savedRecord.year,
                totalRSUIncome: savedRecord.totalRSUIncome,
                createdAt: savedRecord.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error saving RSU income record:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save RSU income record: ' + error.message,
        });
    }
};
exports.saveRSUIncome = saveRSUIncome;
/**
 * RSU所得記録を取得
 * GET /api/rsu-income/list?year=2026
 */
const getRSUIncomeList = async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        const year = req.query.year ? parseInt(req.query.year) : undefined;
        const records = await (0, rsuIncomeStorageService_1.getRSUIncomeRecords)(userId, year);
        res.status(200).json({
            success: true,
            data: records.map((record) => ({
                id: record._id,
                userId: record.userId,
                year: record.year,
                input: record.input,
                result: record.result,
                totalRSUIncome: record.totalRSUIncome,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            })),
        });
    }
    catch (error) {
        console.error('Error fetching RSU income records:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch RSU income records: ' + error.message,
        });
    }
};
exports.getRSUIncomeList = getRSUIncomeList;
/**
 * RSU所得記録を1件取得
 * GET /api/rsu-income/:id
 */
const getRSUIncomeById = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await (0, rsuIncomeStorageService_1.getRSUIncomeRecordById)(id);
        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'RSU income record not found',
            });
        }
        res.status(200).json({
            success: true,
            data: {
                id: record._id,
                userId: record.userId,
                year: record.year,
                input: record.input,
                result: record.result,
                totalRSUIncome: record.totalRSUIncome,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            },
        });
    }
    catch (error) {
        console.error('Error fetching RSU income record:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch RSU income record: ' + error.message,
        });
    }
};
exports.getRSUIncomeById = getRSUIncomeById;
/**
 * RSU所得記録を削除
 * DELETE /api/rsu-income/:id
 */
const deleteRSUIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await (0, rsuIncomeStorageService_1.deleteRSUIncomeRecord)(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'RSU income record not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'RSU income record deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting RSU income record:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete RSU income record: ' + error.message,
        });
    }
};
exports.deleteRSUIncome = deleteRSUIncome;
/**
 * RSU所得記録を更新
 * PUT /api/rsu-income/:id
 */
const updateRSUIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedRecord = await (0, rsuIncomeStorageService_1.updateRSUIncomeRecord)(id, updateData);
        if (!updatedRecord) {
            return res.status(404).json({
                success: false,
                error: 'RSU income record not found',
            });
        }
        res.status(200).json({
            success: true,
            data: {
                id: updatedRecord._id,
                userId: updatedRecord.userId,
                year: updatedRecord.year,
                totalRSUIncome: updatedRecord.totalRSUIncome,
                updatedAt: updatedRecord.updatedAt,
            },
        });
    }
    catch (error) {
        console.error('Error updating RSU income record:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update RSU income record: ' + error.message,
        });
    }
};
exports.updateRSUIncome = updateRSUIncome;
/**
 * 年度別合計RSU所得を取得
 * GET /api/rsu-income/summary?year=2026
 */
const getRSUIncomeSummary = async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        const year = parseInt(req.query.year);
        if (!year) {
            return res.status(400).json({
                success: false,
                error: 'year parameter is required',
            });
        }
        const totalIncome = await (0, rsuIncomeStorageService_1.getTotalRSUIncomeByYear)(userId, year);
        res.status(200).json({
            success: true,
            data: {
                userId,
                year,
                totalRSUIncome: totalIncome,
            },
        });
    }
    catch (error) {
        console.error('Error fetching RSU income summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch RSU income summary: ' + error.message,
        });
    }
};
exports.getRSUIncomeSummary = getRSUIncomeSummary;
/**
 * RSU所得一覧をPDF形式で出力
 * GET /api/rsu-income/export-pdf?year=2026
 */
const exportRSUIncomePDF = async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        const year = parseInt(req.query.year);
        if (!year) {
            return res.status(400).json({
                success: false,
                error: 'year parameter is required',
            });
        }
        // データ取得
        const records = await (0, rsuIncomeStorageService_1.getRSUIncomeRecords)(userId, year);
        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No RSU income records found for the specified year',
            });
        }
        // 複数レコードがある場合は統合
        const allResults = records.flatMap(record => record.result);
        const totalRSUIncome = records.reduce((sum, record) => sum + record.totalRSUIncome, 0);
        // PDF生成
        const pdfStream = (0, pdfGenerationService_1.generateRSUIncomeListPDF)({
            year,
            result: allResults,
            totalRSUIncome,
        });
        // レスポンスヘッダー設定
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=RSU_Income_${year}.pdf`);
        // PDFをストリーム出力
        pdfStream.pipe(res);
    }
    catch (error) {
        console.error('Error exporting RSU income PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export RSU income PDF: ' + error.message,
        });
    }
};
exports.exportRSUIncomePDF = exportRSUIncomePDF;
