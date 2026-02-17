import { Request, Response } from 'express';
import { calculateTax, generateTaxSavingsSuggestions, IncomeData, ExpenseData } from '../services/taxCalculator';

/**
 * 税務計算を実行
 */
export const calculateTaxHandler = (req: Request, res: Response) => {
  try {
    const { income, expense } = req.body;

    // バリデーション
    if (!income || !expense) {
      return res.status(400).json({ error: '収入と経費のデータが必要です' });
    }

    // 税務計算を実行
    const result = calculateTax(income as IncomeData, expense as ExpenseData);

    // 節税提案を生成
    const suggestions = generateTaxSavingsSuggestions(income as IncomeData, expense as ExpenseData);

    res.json({
      success: true,
      data: {
        calculation: result,
        suggestions,
      },
    });
  } catch (error) {
    console.error('Tax calculation error:', error);
    res.status(500).json({ error: '税務計算中にエラーが発生しました' });
  }
};

/**
 * 簡易シミュレーション（クイック計算）
 */
export const quickSimulationHandler = (req: Request, res: Response) => {
  try {
    const { annualIncome } = req.body;

    if (!annualIncome || annualIncome <= 0) {
      return res.status(400).json({ error: '年間収入を入力してください' });
    }

    // 標準的な経費率を使用（30%）
    const estimatedExpense = annualIncome * 0.3;
    const netIncome = annualIncome - estimatedExpense;

    const income: IncomeData = {
      businessIncome: annualIncome,
    };

    const expense: ExpenseData = {
      rentExpense: estimatedExpense * 0.4,
      utilityExpense: estimatedExpense * 0.1,
      suppliesExpense: estimatedExpense * 0.1,
      travelExpense: estimatedExpense * 0.2,
      communicationExpense: estimatedExpense * 0.1,
      otherExpense: estimatedExpense * 0.1,
    };

    const result = calculateTax(income, expense);

    res.json({
      success: true,
      data: {
        note: 'これは概算です。正確な計算には詳細な経費入力が必要です。',
        calculation: result,
      },
    });
  } catch (error) {
    console.error('Quick simulation error:', error);
    res.status(500).json({ error: 'シミュレーション中にエラーが発生しました' });
  }
};
