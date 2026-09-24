/**
 * 税務計算サービス
 * 個人事業主向けの所得税、控除額などを計算（法定の数値は taxRules に集約）
 */
import {
  calculateIncomeTaxBreakdown,
  calculateResidentTax,
  getBasicDeduction,
  getResidentBasicDeduction,
  isProvisionalTaxYear,
  provisionalNotice,
  resolveTaxYear,
} from './taxRules';

export interface IncomeData {
  businessIncome: number; // 事業所得
  otherIncome?: number; // その他所得
}

export interface ExpenseData {
  rentExpense: number; // 家賃
  utilityExpense: number; // 光熱費
  suppliesExpense: number; // 消耗品費
  travelExpense: number; // 旅費交通費
  communicationExpense: number; // 通信費
  otherExpense?: number; // その他経費
}

export interface TaxCalculationResult {
  taxYear: number; // 計算に使った年分
  isProvisional: boolean; // 暫定ルールで計算したか
  notice?: string; // 注意事項
  totalIncome: number; // 総収入
  totalExpense: number; // 総経費
  netIncome: number; // 所得（経費を差し引いた）
  basicDeduction: number; // 基礎控除（所得税）
  taxableIncome: number; // 課税総所得金額（1,000円未満切捨て）
  baseIncomeTax: number; // 基準所得税額
  reconstructionTax: number; // 復興特別所得税額
  incomeTax: number; // 所得税及び復興特別所得税の額
  residentBasicDeduction: number; // 基礎控除（住民税）
  inhabTax: number; // 住民税（概算。調整控除等は考慮しない）
  totalTax: number; // 合計税額
}

/**
 * 総合的な税務計算
 * @param fiscalYear 年分（未指定時は前年分）
 */
export function calculateTax(
  income: IncomeData,
  expense: ExpenseData,
  fiscalYear?: number
): TaxCalculationResult {
  const year = resolveTaxYear(fiscalYear);

  // 総収入を計算
  const totalIncome = income.businessIncome + (income.otherIncome || 0);

  // 総経費を計算
  const totalExpense = sumExpenses(expense);

  // 所得金額（= 合計所得金額）
  const netIncome = Math.max(0, totalIncome - totalExpense);

  // 所得税及び復興特別所得税
  const basicDeduction = getBasicDeduction(netIncome, year);
  const tax = calculateIncomeTaxBreakdown(netIncome - basicDeduction, year);

  // 住民税（概算）
  const residentBasicDeduction = getResidentBasicDeduction(netIncome);
  const inhabTax = calculateResidentTax(netIncome - residentBasicDeduction);

  return {
    taxYear: year,
    isProvisional: isProvisionalTaxYear(year),
    notice: provisionalNotice(year),
    totalIncome,
    totalExpense,
    netIncome,
    basicDeduction,
    taxableIncome: tax.taxableIncome,
    baseIncomeTax: tax.baseIncomeTax,
    reconstructionTax: tax.reconstructionTax,
    incomeTax: tax.totalIncomeTax,
    residentBasicDeduction,
    inhabTax,
    totalTax: tax.totalIncomeTax + inhabTax,
  };
}

const sumExpenses = (expense: ExpenseData): number =>
  expense.rentExpense +
  expense.utilityExpense +
  expense.suppliesExpense +
  expense.travelExpense +
  expense.communicationExpense +
  (expense.otherExpense || 0);

/**
 * 節税提案を生成
 */
export function generateTaxSavingsSuggestions(
  income: IncomeData,
  expense: ExpenseData
): string[] {
  const suggestions: string[] = [];
  const totalExpense = sumExpenses(expense);

  const expenseRatio = totalExpense / (income.businessIncome + (income.otherIncome || 0));

  if (expenseRatio < 0.3) {
    suggestions.push(
      '経費率が低い傾向です。家賃や通信費など、事業に関連する経費を適切に計上できていないか確認してみましょう。'
    );
  }

  if (expense.rentExpense === 0) {
    suggestions.push(
      '自宅で仕事をされている場合は、家賃の一部を経費として計上できる可能性があります。'
    );
  }

  if (expense.suppliesExpense === 0) {
    suggestions.push(
      '事務用品や書籍などの消耗品費を忘れずに計上しましょう。'
    );
  }

  return suggestions;
}
