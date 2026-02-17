import { Request, Response } from 'express';
import { calculateSalaryIncome, SalaryIncomeInput } from '../services/salaryIncomeService';

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
