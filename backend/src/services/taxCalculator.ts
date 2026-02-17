/**
 * 税務計算サービス
 * 個人事業主向けの所得税、控除額などを計算
 */

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
  totalIncome: number; // 総所得
  totalExpense: number; // 総経費
  netIncome: number; // 所得（経費を差し引いた）
  basicDeduction: number; // 基礎控除
  taxableIncome: number; // 課税対象所得
  incomeTax: number; // 所得税
  inhabTax: number; // 住民税（概算）
  totalTax: number; // 合計税額
}

/**
 * 2024年の税率テーブル（日本の所得税）
 * 参考: 国税庁の所得税税率
 */
const TAX_BRACKETS = [
  { max: 1950000, rate: 0.05, deduction: 0 },
  { max: 3300000, rate: 0.1, deduction: 97500 },
  { max: 6950000, rate: 0.2, deduction: 427500 },
  { max: 9000000, rate: 0.23, deduction: 636000 },
  { max: 18000000, rate: 0.33, deduction: 1536000 },
  { max: 40000000, rate: 0.35, deduction: 2796000 },
  { max: Infinity, rate: 0.45, deduction: 4796000 },
];

// 基礎控除（2024年）
const BASIC_DEDUCTION = 480000;

// 社会保険料控除の概算（最大）
const MAX_SOCIAL_INSURANCE_DEDUCTION = 1220000;

/**
 * 所得税を計算
 */
function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  const bracket = TAX_BRACKETS.find((b) => taxableIncome <= b.max);
  if (!bracket) return 0;

  const tax = taxableIncome * bracket.rate - bracket.deduction;
  return Math.max(0, Math.round(tax));
}

/**
 * 住民税を概算計算（全国一律）
 * 基本: 所得税課税対象額 × 10% + 5000円
 */
function calculateInhabitationTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  return Math.round(taxableIncome * 0.1) + 5000;
}

/**
 * 総合的な税務計算
 */
export function calculateTax(income: IncomeData, expense: ExpenseData): TaxCalculationResult {
  // 総所得を計算
  const totalIncome = income.businessIncome + (income.otherIncome || 0);

  // 総経費を計算
  const totalExpense =
    expense.rentExpense +
    expense.utilityExpense +
    expense.suppliesExpense +
    expense.travelExpense +
    expense.communicationExpense +
    (expense.otherExpense || 0);

  // 事業所得（所得金額）
  const netIncome = Math.max(0, totalIncome - totalExpense);

  // 基礎控除を適用
  const taxableIncome = Math.max(0, netIncome - BASIC_DEDUCTION);

  // 所得税を計算
  const incomeTax = calculateIncomeTax(taxableIncome);

  // 住民税を計算
  const inhabTax = calculateInhabitationTax(Math.max(0, netIncome - 430000)); // 住民税基礎控除 43万円

  const totalTax = incomeTax + inhabTax;

  return {
    totalIncome,
    totalExpense,
    netIncome,
    basicDeduction: BASIC_DEDUCTION,
    taxableIncome,
    incomeTax,
    inhabTax,
    totalTax,
  };
}

/**
 * 節税提案を生成
 */
export function generateTaxSavingsSuggestions(
  income: IncomeData,
  expense: ExpenseData
): string[] {
  const suggestions: string[] = [];
  const totalExpense =
    expense.rentExpense +
    expense.utilityExpense +
    expense.suppliesExpense +
    expense.travelExpense +
    expense.communicationExpense +
    (expense.otherExpense || 0);

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
