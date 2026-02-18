"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateAnnualRSUHandler = exports.calculateBatchRSUHandler = exports.calculateRSUTaxHandler = void 0;
const rsuExchangeService_1 = require("../services/rsuExchangeService");
/**
 * RSU税務計算ハンドラー
 */
const calculateRSUTaxHandler = async (req, res) => {
    try {
        const vestingData = {
            vestingDate: new Date(req.body.vestingDate),
            shares: req.body.shares,
            pricePerShare: req.body.pricePerShare,
            currency: req.body.currency || 'USD',
        };
        const result = await (0, rsuExchangeService_1.calculateRSUTax)(vestingData);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.calculateRSUTaxHandler = calculateRSUTaxHandler;
/**
 * RSU複数行一括計算ハンドラー
 */
const calculateBatchRSUHandler = async (req, res) => {
    try {
        const { grants } = req.body;
        // バリデーション
        if (!Array.isArray(grants) || grants.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'grants must be a non-empty array',
            });
        }
        if (grants.length > 20) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 20 grants allowed per request',
            });
        }
        // データ変換
        const vestingData = grants.map((item) => ({
            vestingDate: new Date(item.vestingDate),
            shares: parseInt(item.shares),
            pricePerShare: parseFloat(item.pricePerShare),
            currency: item.currency || 'USD',
        }));
        // 一括計算
        const calculations = await (0, rsuExchangeService_1.calculateBatchRSUTax)(vestingData);
        // 日付ごとの為替レート情報を追加
        const calculationsWithRateInfo = calculations.map(calc => ({
            ...calc,
            vestingDateFormatted: new Date(calc.vestingDate).toLocaleDateString('ja-JP'),
        }));
        // 年間集計を自動計算
        const currentYear = new Date().getFullYear();
        const totalShares = calculations.reduce((sum, calc) => sum + calc.shares, 0);
        const totalValueJPY = calculations.reduce((sum, calc) => sum + calc.totalValueJPY, 0);
        const totalTaxableIncomeJPY = calculations.reduce((sum, calc) => sum + calc.taxableIncomeJPY, 0);
        // 為替レートの統計情報
        const exchangeRates = calculations.map(calc => calc.exchangeRate);
        const avgExchangeRate = exchangeRates.reduce((a, b) => a + b, 0) / exchangeRates.length;
        const minExchangeRate = Math.min(...exchangeRates);
        const maxExchangeRate = Math.max(...exchangeRates);
        res.json({
            success: true,
            data: {
                calculations: calculationsWithRateInfo,
                summary: {
                    totalGrants: calculations.length,
                    totalShares: totalShares,
                    totalValueJPY: totalValueJPY,
                    totalTaxableIncomeJPY: totalTaxableIncomeJPY,
                    fiscalYear: currentYear,
                    exchangeRateStats: {
                        average: parseFloat(avgExchangeRate.toFixed(2)),
                        minimum: minExchangeRate,
                        maximum: maxExchangeRate,
                    },
                },
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
exports.calculateBatchRSUHandler = calculateBatchRSUHandler;
/**
 * 年間RSU収入集計ハンドラー
 */
const aggregateAnnualRSUHandler = async (req, res) => {
    try {
        const { vestingDataList, year } = req.body;
        const vestingData = vestingDataList.map((item) => ({
            vestingDate: new Date(item.vestingDate),
            shares: item.shares,
            pricePerShare: item.pricePerShare,
            currency: item.currency || 'USD',
        }));
        const result = await (0, rsuExchangeService_1.aggregateAnnualRSUIncome)(vestingData, year);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.aggregateAnnualRSUHandler = aggregateAnnualRSUHandler;
