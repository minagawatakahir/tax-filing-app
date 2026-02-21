"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const capitalGainController_1 = require("../controllers/capitalGainController");
const CapitalGainRecord_1 = require("../models/CapitalGainRecord");
const router = (0, express_1.Router)();
// 譲渡所得計算結果を保存
router.post('/save', capitalGainController_1.saveCapitalGainHandler);
// 譲渡所得計算履歴を取得
router.get('/records', capitalGainController_1.getCapitalGainRecordsHandler);
// 譲渡所得計算履歴を削除
router.delete('/records/:id', capitalGainController_1.deleteCapitalGainRecordHandler);
/**
 * TX-27: GET /api/capital-gain/export-csv/:year
 * 譲渡所得一覧をCSV形式で出力
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
        const records = await CapitalGainRecord_1.CapitalGainRecord.find({ fiscalYear: year });
        // CSV生成
        const csvLines = [];
        // ヘッダー行
        csvLines.push('物件ID,売却価格,取得費用,改良費,売却費用,譲渡所得,課税譲渡所得,税額,保有期間,譲渡の種類');
        // データ行
        records.forEach(record => {
            const line = [
                record.propertyId,
                record.input?.salePrice || 0,
                record.input?.acquisitionCost || 0,
                record.input?.improvementCost || 0,
                record.input?.sellingExpenses || 0,
                record.result?.capitalGain || 0,
                record.result?.taxableCapitalGain || 0,
                record.result?.incomeTax || 0,
                record.input?.ownershipPeriod || 0,
                record.result?.transferType || '',
            ].join(',');
            csvLines.push(line);
        });
        // 集計行
        if (records.length > 0) {
            const totalCapitalGain = records.reduce((sum, r) => sum + (r.result?.capitalGain || 0), 0);
            const totalTax = records.reduce((sum, r) => sum + (r.result?.incomeTax || 0), 0);
            csvLines.push(''); // 空行
            csvLines.push(`合計,${records.length}件,,,${totalCapitalGain},,${totalTax}`);
        }
        const csv = csvLines.join('\n');
        // CSVレスポンスヘッダーを設定
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="capital-gain-${year}.csv"`);
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
