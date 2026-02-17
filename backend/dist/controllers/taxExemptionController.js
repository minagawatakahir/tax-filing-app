"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptimalStrategyHandler = exports.simulate30MExemptionVsMortgageDeductionHandler = void 0;
const taxExemptionSimulatorService_1 = require("../services/taxExemptionSimulatorService");
/**
 * 3,000万円控除 vs 住宅ローン控除シミュレーションハンドラー
 */
const simulate30MExemptionVsMortgageDeductionHandler = async (req, res) => {
    try {
        const scenario = {
            propertyId: req.body.propertyId,
            sellingPrice: req.body.sellingPrice,
            acquisitionCost: req.body.acquisitionCost,
            acquisitionDate: new Date(req.body.acquisitionDate),
            sellingDate: new Date(req.body.sellingDate),
            ownershipYears: req.body.ownershipYears,
            mortgageBalance: req.body.mortgageBalance || 0,
            annualMortgagePayment: req.body.annualMortgagePayment || 0,
            remainingMortgageYears: req.body.remainingMortgageYears || 0,
        };
        const comparison = (0, taxExemptionSimulatorService_1.compareExemptions)(scenario);
        res.json({ success: true, data: comparison });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.simulate30MExemptionVsMortgageDeductionHandler = simulate30MExemptionVsMortgageDeductionHandler;
/**
 * 最適戦略提案ハンドラー
 */
const getOptimalStrategyHandler = async (req, res) => {
    try {
        const scenario = {
            propertyId: req.body.propertyId,
            sellingPrice: req.body.sellingPrice,
            acquisitionCost: req.body.acquisitionCost,
            acquisitionDate: new Date(req.body.acquisitionDate),
            sellingDate: new Date(req.body.sellingDate),
            ownershipYears: req.body.ownershipYears,
            mortgageBalance: req.body.mortgageBalance || 0,
            annualMortgagePayment: req.body.annualMortgagePayment || 0,
            remainingMortgageYears: req.body.remainingMortgageYears || 0,
        };
        const comparison = (0, taxExemptionSimulatorService_1.compareExemptions)(scenario);
        res.json({
            success: true,
            data: {
                optimalStrategy: comparison.optimalChoice,
                recommendation: comparison.recommendation,
                scenarios: {
                    exemption30M: comparison.scenario30M,
                    mortgageDeduction: comparison.scenarioMortgage,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getOptimalStrategyHandler = getOptimalStrategyHandler;
