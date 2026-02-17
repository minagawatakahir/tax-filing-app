"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateAnnualRSUHandler = exports.calculateRSUTaxHandler = void 0;
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
