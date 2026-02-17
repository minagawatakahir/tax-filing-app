import { Request, Response } from 'express';
import {
  simulate30MExemption,
  simulateMortgageDeduction,
  compareExemptions,
  PropertySaleScenario,
} from '../services/taxExemptionSimulatorService';

/**
 * 3,000万円控除 vs 住宅ローン控除シミュレーションハンドラー
 */
export const simulate30MExemptionVsMortgageDeductionHandler = async (req: Request, res: Response) => {
  try {
    const scenario: PropertySaleScenario = {
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

    const comparison = compareExemptions(scenario);
    res.json({ success: true, data: comparison });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 最適戦略提案ハンドラー
 */
export const getOptimalStrategyHandler = async (req: Request, res: Response) => {
  try {
    const scenario: PropertySaleScenario = {
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

    const comparison = compareExemptions(scenario);
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
