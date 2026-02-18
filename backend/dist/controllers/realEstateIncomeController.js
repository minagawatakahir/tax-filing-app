"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePortfolioIncomeHandler = exports.calculateSinglePropertyIncomeHandler = void 0;
const realEstateIncomeService_1 = require("../services/realEstateIncomeService");
/**
 * 単一物件の不動産所得を計算
 */
const calculateSinglePropertyIncomeHandler = async (req, res) => {
    try {
        const { income, expenses, depreciationAsset } = req.body;
        if (!income || !expenses) {
            res.status(400).json({
                success: false,
                error: '収入データと経費データが必要です',
            });
            return;
        }
        const result = (0, realEstateIncomeService_1.calculateRealEstateIncome)(income, expenses, depreciationAsset);
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
exports.calculateSinglePropertyIncomeHandler = calculateSinglePropertyIncomeHandler;
/**
 * 複数物件の不動産所得を一括計算
 */
const calculatePortfolioIncomeHandler = async (req, res) => {
    try {
        const { year, properties } = req.body;
        if (!year || !properties || !Array.isArray(properties)) {
            res.status(400).json({
                success: false,
                error: '年度と物件データ配列が必要です',
            });
            return;
        }
        const calculations = properties.map((property) => {
            return (0, realEstateIncomeService_1.calculateRealEstateIncome)(property.income, property.expenses, property.depreciationAsset);
        });
        const portfolio = (0, realEstateIncomeService_1.calculateRealEstateIncomePortfolio)(year, calculations);
        res.json({
            success: true,
            data: portfolio,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.calculatePortfolioIncomeHandler = calculatePortfolioIncomeHandler;
