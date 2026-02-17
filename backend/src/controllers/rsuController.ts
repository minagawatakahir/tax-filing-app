import { Request, Response } from 'express';
import {
  calculateRSUTax,
  aggregateAnnualRSUIncome,
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
