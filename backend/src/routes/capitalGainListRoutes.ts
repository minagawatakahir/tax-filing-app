/**
 * 譲渡所得一覧・管理API
 */

import express, { Request, Response } from 'express';
import {
  getCapitalGainByFiscalYear,
  saveCapitalGain,
  updateCapitalGain,
  deleteCapitalGain,
  getCapitalGainById,
  calculateFiscalYearTotal,
} from '../services/capitalGainStorageService';
import { CapitalGainRecord } from '../models/CapitalGain';

const router = express.Router();

/**
 * GET /api/capital-gain-list/:fiscalYear
 * 指定年度の譲渡所得一覧を取得
 */
router.get('/:fiscalYear', (req: Request, res: Response): void => {
  try {
    const fiscalYearStr = Array.isArray(req.params.fiscalYear) ? req.params.fiscalYear[0] : req.params.fiscalYear;
    const fiscalYear = parseInt(fiscalYearStr as string);
    const records = getCapitalGainByFiscalYear(fiscalYear);
    const summary = calculateFiscalYearTotal(fiscalYear);

    res.json({
      success: true,
      fiscalYear,
      records,
      summary,
    });
  } catch (error: any) {
    console.error('Error fetching capital gain list:', error);
    res.status(500).json({
      success: false,
      error: error.message || '一覧取得に失敗しました',
    });
  }
});

/**
 * POST /api/capital-gain-list
 * 新規譲渡所得を保存
 */
router.post('/', (req: Request, res: Response): void => {
  try {
    const capitalGainData = req.body;

    // バリデーション
    if (!capitalGainData.fiscalYear || !capitalGainData.propertyId) {
      res.status(400).json({
        success: false,
        error: '年度とpropertyIdは必須です',
      });
      return;
    }

    const saved = saveCapitalGain(capitalGainData);

    res.json({
      success: true,
      data: saved,
    });
  } catch (error: any) {
    console.error('Error saving capital gain:', error);
    res.status(500).json({
      success: false,
      error: error.message || '保存に失敗しました',
    });
  }
});

/**
 * PUT /api/capital-gain-list/:id
 * 譲渡所得を更新
 */
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idStr as string;
    const capitalGainData = req.body;

    const updated = updateCapitalGain(id, capitalGainData);

    if (!updated) {
      res.status(404).json({
        success: false,
        error: '指定されたレコードが見つかりません',
      });
      return;
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating capital gain:', error);
    res.status(500).json({
      success: false,
      error: error.message || '更新に失敗しました',
    });
  }
});

/**
 * DELETE /api/capital-gain-list/:id
 * 譲渡所得を削除
 */
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idStr as string;

    const deleted = deleteCapitalGain(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: '指定されたレコードが見つかりません',
      });
      return;
    }

    res.json({
      success: true,
      message: '削除しました',
    });
  } catch (error: any) {
    console.error('Error deleting capital gain:', error);
    res.status(500).json({
      success: false,
      error: error.message || '削除に失敗しました',
    });
  }
});

export default router;
