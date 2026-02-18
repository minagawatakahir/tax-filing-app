import { Request, Response } from 'express';
import {
  calculateRSUTax,
  aggregateAnnualRSUIncome,
  calculateBatchRSUTax,
  RSUVestingData,
} from '../services/rsuExchangeService';

/**
 * RSU税務計算ハンドラー
 */
export const calculateRSUTaxHandler = async (req: Request, res: Response) => {
  try {
    const vestingData: RSUVestingData = {
      vestingDate: new Date(req.body.vestingDate),
      shares: req.body.shares,
      pricePerShare: req.body.pricePerShare,
      currency: req.body.currency || 'USD',
    };

    const result = await calculateRSUTax(vestingData);

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
 * RSU複数行一括計算ハンドラー
 */
export const calculateBatchRSUHandler = async (req: Request, res: Response) => {
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
    const vestingData: RSUVestingData[] = grants.map((item: any) => ({
      vestingDate: new Date(item.vestingDate),
      shares: parseInt(item.shares),
      pricePerShare: parseFloat(item.pricePerShare),
      currency: item.currency || 'USD',
    }));

    // 一括計算
    const calculations = await calculateBatchRSUTax(vestingData);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 年間RSU収入集計ハンドラー
 */
export const aggregateAnnualRSUHandler = async (req: Request, res: Response) => {
  try {
    const { vestingDataList, year } = req.body;

    const vestingData: RSUVestingData[] = vestingDataList.map((item: any) => ({
      vestingDate: new Date(item.vestingDate),
      shares: item.shares,
      pricePerShare: item.pricePerShare,
      currency: item.currency || 'USD',
    }));

    const result = await aggregateAnnualRSUIncome(vestingData, year);

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
