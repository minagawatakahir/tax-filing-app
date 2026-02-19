import { Router } from 'express';
import {
  saveRealEstateIncome,
  getRealEstateIncomeByFiscalYear,
  deleteRealEstateIncome,
  calculateFiscalYearTotal,
} from '../services/realEstateIncomeStorageService';
import { Request, Response } from 'express';

const router = Router();

/**
 * POST /api/real-estate-income-list
 * 不動産所得データを保存
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const savedRecord = saveRealEstateIncome(data);
    res.status(201).json({
      success: true,
      data: savedRecord,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/real-estate-income-list/:year
 * 年度別不動産所得一覧を取得
 */
router.get('/:year', async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year as string);
    const records = getRealEstateIncomeByFiscalYear(year);
    const summary = calculateFiscalYearTotal(year);
    
    res.json({
      success: true,
      records,
      summary,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/real-estate-income-list/:id
 * 不動産所得データを削除
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = deleteRealEstateIncome(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
