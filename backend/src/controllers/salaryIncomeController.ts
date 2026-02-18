import { Request, Response } from 'express';
import { calculateSalaryIncome, SalaryIncomeInput } from '../services/salaryIncomeService';
import {
  saveSalaryIncomeRecord,
  getSalaryIncomeRecords,
  deleteSalaryIncomeRecord,
  getSalaryIncomeRecordById,
} from '../services/salaryIncomeStorageService';

/**
 * 給与所得計算ハンドラー
 */
export const calculateSalaryIncomeHandler = async (req: Request, res: Response) => {
  try {
    const {
      annualSalary,
      withheldTax,
      socialInsurance,
      lifeInsurance,
      dependents,
      spouseDeduction,
    } = req.body;

    // バリデーション
    if (!annualSalary || annualSalary < 0) {
      return res.status(400).json({
        success: false,
        error: '給与収入は0以上の数値を指定してください',
      });
    }

    const input: SalaryIncomeInput = {
      annualSalary: parseFloat(annualSalary),
      withheldTax: parseFloat(withheldTax) || 0,
      socialInsurance: parseFloat(socialInsurance) || 0,
      lifeInsurance: parseFloat(lifeInsurance),
      dependents: parseInt(dependents) || 0,
      spouseDeduction: spouseDeduction || false,
    };

    const result = calculateSalaryIncome(input);

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
 * 給与所得計算結果を保存
 */
export const saveSalaryIncomeHandler = async (req: Request, res: Response) => {
  try {
    const { year, input, result } = req.body;
    const userId = (req as any).userId || 'demo-user'; // ミドルウェアで設定されるユーザーID

    // バリデーション
    if (!year || !input || !result) {
      return res.status(400).json({
        success: false,
        error: '年度、入力値、計算結果は必須です',
      });
    }

    const savedRecord = await saveSalaryIncomeRecord({
      userId,
      year,
      input,
      result,
    });

    res.json({
      success: true,
      data: {
        id: savedRecord._id,
        year: savedRecord.year,
        createdAt: savedRecord.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error saving salary income record:', error);
    res.status(500).json({
      success: false,
      error: error.message || '保存に失敗しました',
    });
  }
};

/**
 * 給与所得計算履歴を取得
 */
export const getSalaryIncomeRecordsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 'demo-user';
    const { year, startDate, endDate } = req.query;

    const filters: any = {};
    if (year) filters.year = parseInt(year as string);
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const records = await getSalaryIncomeRecords(userId, filters);

    res.json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    console.error('Error fetching salary income records:', error);
    res.status(500).json({
      success: false,
      error: error.message || '取得に失敗しました',
    });
  }
};

/**
 * 給与所得計算履歴を削除
 */
export const deleteSalaryIncomeRecordHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 'demo-user';
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'IDは必須です',
      });
    }

    const deleted = await deleteSalaryIncomeRecord(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '計算結果が見つかりません',
      });
    }

    res.json({
      success: true,
      message: '計算結果を削除しました',
    });
  } catch (error: any) {
    console.error('Error deleting salary income record:', error);
    res.status(500).json({
      success: false,
      error: error.message || '削除に失敗しました',
    });
  }
};
