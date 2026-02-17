import { Request, Response } from 'express';
import {
  generateDepreciationSchedule,
  predictFutureUndepreciatedBalance,
  analyzeDepreciation,
  DepreciableAsset,
} from '../services/depreciationService';

/**
 * 減価償却スケジュール計算ハンドラー
 */
export const calculateDepreciationScheduleHandler = async (req: Request, res: Response) => {
  try {
    const asset: DepreciableAsset = {
      assetId: req.body.assetId,
      assetName: req.body.assetName,
      acquisitionDate: new Date(req.body.acquisitionDate),
      acquisitionCost: req.body.acquisitionCost,
      category: req.body.category,
      usefulLife: req.body.usefulLife,
      depreciationMethod: req.body.depreciationMethod || 'straight',
    };

    const schedule = generateDepreciationSchedule(asset);
    res.json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 将来の未償却残高予測ハンドラー
 */
export const predictFutureUndepreciatedBalanceHandler = async (req: Request, res: Response) => {
  try {
    const asset: DepreciableAsset = {
      assetId: req.body.assetId,
      assetName: req.body.assetName,
      acquisitionDate: new Date(req.body.acquisitionDate),
      acquisitionCost: req.body.acquisitionCost,
      category: req.body.category,
      usefulLife: req.body.usefulLife,
      depreciationMethod: req.body.depreciationMethod || 'straight',
    };

    const projectionYears = req.body.projectionYears || 10;
    const projection = predictFutureUndepreciatedBalance(asset, projectionYears);
    res.json({ success: true, data: projection });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 減価償却レポート取得ハンドラー
 */
export const getDepreciationReportHandler = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Depreciation report feature coming soon',
      assetId: req.params.assetId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
