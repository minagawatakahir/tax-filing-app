"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const realEstateIncomeStorageService_1 = require("../services/realEstateIncomeStorageService");
const pdfGenerationService_1 = require("../services/pdfGenerationService");
const router = (0, express_1.Router)();
/**
 * POST /api/real-estate-income-list
 * 不動産所得データを保存
 */
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const savedRecord = await (0, realEstateIncomeStorageService_1.saveRealEstateIncome)(data);
        res.status(201).json({
            success: true,
            data: savedRecord,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
/**
 * GET /api/real-estate-income-list/export-pdf/:year
 * 不動産所得一覧をPDF形式で出力
 */
router.get('/export-pdf/:year', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        if (isNaN(year)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid year parameter',
            });
        }
        const records = await (0, realEstateIncomeStorageService_1.getRealEstateIncomeByFiscalYear)(year);
        const summary = await (0, realEstateIncomeStorageService_1.calculateFiscalYearTotal)(year);
        // PDF生成用のデータ構造を作成
        const pdfData = {
            year,
            properties: records.map(record => ({
                propertyId: record.propertyId,
                propertyName: record.propertyName || `Property ${record.propertyId}`,
                rentalIncome: record.totalIncome || 0,
                expenses: record.totalExpenses || 0,
                netIncome: record.realEstateIncome || 0,
            })),
            totalIncome: summary.totalIncome || 0,
            totalExpenses: summary.totalExpenses || 0,
            totalNetIncome: summary.totalRealEstateIncome || 0,
        };
        const pdfDoc = (0, pdfGenerationService_1.generateRealEstateIncomeListPDF)(pdfData);
        // PDFレスポンスヘッダーを設定
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="real-estate-income-${year}.pdf"`);
        // PDFストリームをレスポンスにパイプ
        pdfDoc.pipe(res);
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'PDF generation failed',
        });
    }
});
/**
 * TX-27: GET /api/real-estate-income-list/export-csv/:year
 * 不動産所得一覧をCSV形式で出力
 */
router.get('/export-csv/:year', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        if (isNaN(year)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid year parameter',
            });
        }
        const records = await (0, realEstateIncomeStorageService_1.getRealEstateIncomeByFiscalYear)(year);
        const summary = await (0, realEstateIncomeStorageService_1.calculateFiscalYearTotal)(year);
        // CSV生成
        const csvLines = [];
        // ヘッダー行
        csvLines.push('物件ID,物件名,月額家賃,契約月数,その他収入,収入合計,管理費,修繕費,固定資産税,ローン利息,保険料,光熱費,その他経費,減価償却費,経費合計,不動産所得');
        // データ行
        records.forEach(record => {
            const line = [
                record.propertyId,
                `"${record.propertyName || ''}"`,
                record.monthlyRent || 0,
                record.months || 0,
                record.otherIncome || 0,
                record.totalIncome || 0,
                record.managementFee || 0,
                record.repairCost || 0,
                record.propertyTax || 0,
                record.loanInterest || 0,
                record.insurance || 0,
                record.utilities || 0,
                record.otherExpenses || 0,
                record.depreciationExpense || 0,
                record.totalExpenses || 0,
                record.realEstateIncome || 0,
            ].join(',');
            csvLines.push(line);
        });
        // 集計行
        csvLines.push(''); // 空行
        csvLines.push(`合計,${records.length}件,,,${summary.totalIncome || 0},,,,,,,,${summary.totalExpenses || 0},${summary.totalRealEstateIncome || 0}`);
        const csv = csvLines.join('\n');
        // CSVレスポンスヘッダーを設定
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="real-estate-income-${year}.csv"`);
        // BOM（Byte Order Mark）を追加してExcelで正しく表示
        res.send('\uFEFF' + csv);
    }
    catch (error) {
        console.error('Error generating CSV:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'CSV generation failed',
        });
    }
});
exports.default = router;
