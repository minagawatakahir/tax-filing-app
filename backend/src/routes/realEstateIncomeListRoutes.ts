/**
 * 不動産所得一覧・管理API
 */

import express, { Request, Response } from 'express';
import {
  getRealEstateIncomeByFiscalYear,
  saveRealEstateIncome,
  updateRealEstateIncome,
  deleteRealEstateIncome,
  getRealEstateIncomeById,
  calculateFiscalYearTotal,
} from '../services/realEstateIncomeStorageService';
import { RealEstateIncomeRecord } from '../models/RealEstateIncome';

const router = express.Router();

/**
 * GET /api/real-estate-income-list/:fiscalYear
 * 指定年度の不動産所得一覧を取得
 */
router.get('/:fiscalYear', (req: Request, res: Response): void => {
  try {
    const fiscalYearStr = Array.isArray(req.params.fiscalYear) ? req.params.fiscalYear[0] : req.params.fiscalYear;
    const fiscalYear = parseInt(fiscalYearStr as string);
    const records = getRealEstateIncomeByFiscalYear(fiscalYear);
    const summary = calculateFiscalYearTotal(fiscalYear);

    res.json({
      success: true,
      fiscalYear,
      records,
      summary,
    });
  } catch (error: any) {
    console.error('Error fetching real estate income list:', error);
    res.status(500).json({
      success: false,
      error: error.message || '一覧取得に失敗しました',
    });
  }
});


/**
 * POST /api/real-estate-income-list
 * 新規不動産所得を保存
 */
router.post('/', (req: Request, res: Response): void => {
  try {
    const incomeData = req.body;

    // バリデーション
    if (!incomeData.fiscalYear || !incomeData.propertyId) {
      res.status(400).json({
        success: false,
        error: '年度とpropertyIdは必須です',
      });
      return;
    }

    const saved = saveRealEstateIncome(incomeData);

    res.json({
      success: true,
      data: saved,
    });
  } catch (error: any) {
    console.error('Error saving real estate income:', error);
    res.status(500).json({
      success: false,
      error: error.message || '保存に失敗しました',
    });
  }
});

/**
 * PUT /api/real-estate-income-list/:id
 * 不動産所得を更新
 */
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idStr as string;
    const incomeData = req.body;

    const updated = updateRealEstateIncome(id, incomeData);

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
    console.error('Error updating real estate income:', error);
    res.status(500).json({
      success: false,
      error: error.message || '更新に失敗しました',
    });
  }
});

/**
 * DELETE /api/real-estate-income-list/:id
 * 不動産所得を削除
 */
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idStr as string;

    const deleted = deleteRealEstateIncome(id);

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
    console.error('Error deleting real estate income:', error);
    res.status(500).json({
      success: false,
      error: error.message || '削除に失敗しました',
    });
  }
});

export default router;
