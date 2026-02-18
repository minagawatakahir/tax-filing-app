import { Request, Response } from 'express';
import {
  calculateRealEstateIncome,
  calculateRealEstateIncomePortfolio,
  RentalIncomeData,
  RealEstateExpense,
} from '../services/realEstateIncomeService';
import { DepreciableAsset } from '../services/depreciationService';

/**
 * 単一物件の不動産所得を計算
 */
export const calculateSinglePropertyIncomeHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { income, expenses, depreciationAsset } = req.body;

    if (!income || !expenses) {
      res.status(400).json({
        success: false,
        error: '収入データと経費データが必要です',
      });
      return;
    }

    const result = calculateRealEstateIncome(
      income as RentalIncomeData,
      expenses as RealEstateExpense,
      depreciationAsset as DepreciableAsset | undefined
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 複数物件の不動産所得を一括計算
 */
export const calculatePortfolioIncomeHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { year, properties } = req.body;

    if (!year || !properties || !Array.isArray(properties)) {
      res.status(400).json({
        success: false,
        error: '年度と物件データ配列が必要です',
      });
      return;
    }

    const calculations = properties.map((property: any) => {
      return calculateRealEstateIncome(
        property.income as RentalIncomeData,
        property.expenses as RealEstateExpense,
        property.depreciationAsset as DepreciableAsset | undefined
      );
    });

    const portfolio = calculateRealEstateIncomePortfolio(year, calculations);

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
