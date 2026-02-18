import { Request, Response } from 'express';
import {
  generateDepreciationSchedule,
  predictFutureUndepreciatedBalance,
  analyzeDepreciation,
  DepreciableAsset,
} from '../services/depreciationService';
// TX-31: 取得関連費用を含む減価償却基礎額計算
import {
  createDepreciableAssetFromProperty,
  calculateDepreciableBasis,
  allocateAcquisitionCosts,
} from '../services/depreciationHelpers';

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

/**
 * TX-31: Propertyから減価償却資産を生成し、スケジュール計算
 * 取得関連費用（登録免許税、仲介手数料）を建物取得価額に含める
 */
export const calculateDepreciationFromPropertyHandler = async (req: Request, res: Response) => {
  try {
    const { propertyId, usefulLife } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        error: 'propertyId は必須です',
      });
    }

    // TX-31: Propertyモデルから減価償却資産を生成
    const asset = await createDepreciableAssetFromProperty(propertyId, usefulLife);

    // スケジュール計算
    const schedule = generateDepreciationSchedule(asset);

    res.json({
      success: true,
      data: {
        asset,
        schedule,
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
 * TX-31: 建物の減価償却基礎額を計算（取得関連費用の按分を含む）
 */
export const calculateDepreciableBasisHandler = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        error: 'propertyId は必須です',
      });
    }

    // TX-31: 建物の減価償却基礎額を計算
    const depreciableBasis = await calculateDepreciableBasis(propertyId);

    res.json({
      success: true,
      data: {
        propertyId,
        depreciableBasis,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
