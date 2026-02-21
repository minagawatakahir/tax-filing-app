"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rsuController_1 = require("../controllers/rsuController");
const rsuExchangeService_1 = require("../services/rsuExchangeService");
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
/**
 * POST /api/rsu/calculate
 * RSU税務計算（単一件）
 */
router.post('/calculate', rsuController_1.calculateRSUTaxHandler);
/**
 * POST /api/rsu/calculate-batch
 * RSU複数行一括計算
 */
router.post('/calculate-batch', rsuController_1.calculateBatchRSUHandler);
/**
 * POST /api/rsu/annual-aggregate
 * 年間RSU収入集計
 */
router.post('/annual-aggregate', rsuController_1.aggregateAnnualRSUHandler);
/**
 * TX-22-1b: GET /api/rsu/ttm-rate
 * 指定日付の TTM レートを取得
 */
router.get('/ttm-rate', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
            return res.status(400).json({
                error: 'date parameter is required (format: YYYY-MM-DD)',
            });
        }
        const parsedDate = (0, date_fns_1.parse)(date, 'yyyy-MM-dd', new Date());
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                error: 'Invalid date format. Use YYYY-MM-DD',
            });
        }
        const result = await (0, rsuExchangeService_1.getTTMRate)(parsedDate);
        res.json({
            date: (0, date_fns_1.format)(parsedDate, 'yyyy-MM-dd'),
            rate: result.rate,
            source: result.source,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch TTM rate' });
    }
});
/**
 * TX-22-1b: POST /api/rsu/ttm-rates
 * 複数日付の TTM レートを一括取得
 */
router.post('/ttm-rates', async (req, res) => {
    try {
        const { dates } = req.body;
        if (!Array.isArray(dates) || dates.length === 0) {
            return res.status(400).json({
                error: 'dates array is required',
            });
        }
        if (dates.length > 365) {
            return res.status(400).json({
                error: 'Maximum 365 dates allowed',
            });
        }
        // 日付の解析
        const parsedDates = dates.map((d) => {
            const parsed = (0, date_fns_1.parse)(d, 'yyyy-MM-dd', new Date());
            if (isNaN(parsed.getTime())) {
                throw new Error(`Invalid date format: ${d}`);
            }
            return parsed;
        });
        // 並列でレート取得
        const results = await Promise.all(parsedDates.map(async (date) => {
            const result = await (0, rsuExchangeService_1.getTTMRate)(date);
            return {
                date: (0, date_fns_1.format)(date, 'yyyy-MM-dd'),
                rate: result.rate,
                source: result.source,
            };
        }));
        res.json({
            count: results.length,
            rates: results,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch TTM rates' });
    }
});
exports.default = router;
