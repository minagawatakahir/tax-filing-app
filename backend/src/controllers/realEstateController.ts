import { Request, Response } from 'express';
import { calculateLTV, calculateInterestDeduction } from '../services/realEstateLTVService';

/**
 * LTV計算ハンドラー
 */
export const calculateLTVHandler = async (req: Request, res: Response) => {
  try {
    const { property, loans } = req.body;
    const result = calculateLTV(property, loans);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 利子控除判定ハンドラー
 */
export const calculateInterestDeductionHandler = async (req: Request, res: Response) => {
  try {
    const { property, loans } = req.body;
    const result = calculateInterestDeduction(property, loans);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 物件分析取得ハンドラー
 */
export const getPropertyAnalysisHandler = async (req: Request, res: Response) => {
  try {
    res.json({ 
      success: true, 
      message: 'Property analysis feature coming soon',
      propertyId: req.params.propertyId 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
