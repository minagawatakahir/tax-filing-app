/**
 * 不動産所得計算サービス (TX-20)
 * 家賃収入、経費管理、減価償却費を統合して不動産所得を計算
 */

import { DepreciableAsset, generateDepreciationSchedule } from './depreciationService';

/**
 * 家賃収入データ
 */
export interface RentalIncomeData {
  propertyId: string;
  year: number;
  monthlyRent: number; // 月額家賃
  months: number; // 家賃収入月数
  otherIncome: number; // その他の収入（共益費など）
}

/**
 * 経費データ
 */
export interface RealEstateExpense {
  propertyId: string;
  year: number;
  managementFee: number; // 管理費
  repairCost: number; // 修繕費
  propertyTax: number; // 固定資産税
  loanInterest: number; // ローン利息（不動産所得対象分）
  insurance: number; // 火災保険料など
  utilities: number; // 水道光熱費
  otherExpenses: number; // その他経費
}

/**
 * 不動産所得計算結果
 */
export interface RealEstateIncomeCalculation {
  propertyId: string;
  year: number;
  
  // 収入
  totalRentalIncome: number;
  otherIncome: number;
  totalIncome: number;
  
  // 経費
  operatingExpenses: number; // 管理費、修繕費、保険など
  propertyTax: number; // 固定資産税
  loanInterest: number; // ローン利息（建物部分のみ）
  depreciationExpense: number; // 減価償却費
  totalExpenses: number;
  
  // 計算結果
  realEstateIncome: number; // 総収入 - 総経費
  
  // 詳細
  expenseBreakdown: {
    managementFee: number;
    repairCost: number;
    insurance: number;
    utilities: number;
    otherExpenses: number;
    depreciationExpense: number;
    propertyTax: number;
    loanInterest: number;
  };
}

/**
 * 複数物件の不動産所得統計
 */
export interface RealEstateIncomePortfolio {
  year: number;
  properties: RealEstateIncomeCalculation[];
  
  // ポートフォリオ集計
  totalIncome: number;
  totalExpenses: number;
  totalRealEstateIncome: number;
  
  // 物件別詳細
  propertyCount: number;
  positiveIncomeCount: number;
  negativeIncomeCount: number;
}

/**
 * 家賃収入を計算
 */
export const calculateRentalIncome = (
  monthlyRent: number,
  months: number,
  otherIncome: number = 0
): number => {
  return monthlyRent * months + otherIncome;
};

/**
 * 経費合計を計算
 */
export const calculateTotalExpenses = (expenses: RealEstateExpense): number => {
  return (
    expenses.managementFee +
    expenses.repairCost +
    expenses.propertyTax +
    expenses.loanInterest +
    expenses.insurance +
    expenses.utilities +
    expenses.otherExpenses
  );
};

/**
 * 不動産所得を計算
 */
export const calculateRealEstateIncome = (
  income: RentalIncomeData,
  expenses: RealEstateExpense,
  depreciationAsset?: DepreciableAsset
): RealEstateIncomeCalculation => {
  // 収入計算
  const totalRentalIncome = calculateRentalIncome(
    income.monthlyRent,
    income.months,
    income.otherIncome
  );
  const totalIncome = totalRentalIncome;

  // 経費計算
  const operatingExpenses =
    expenses.managementFee +
    expenses.repairCost +
    expenses.insurance +
    expenses.utilities +
    expenses.otherExpenses;

  // 減価償却費の計算
  let depreciationExpense = 0;
  if (depreciationAsset) {
    // 日付を確実にDateオブジェクトに変換
    const asset = {
      ...depreciationAsset,
      acquisitionDate: new Date(depreciationAsset.acquisitionDate),
    };
    const schedule = generateDepreciationSchedule(asset);
    const currentYear = income.year; // 指定された年度を使用
    const currentYearSchedule = schedule.find(s => s.year === currentYear);
    if (currentYearSchedule) {
      depreciationExpense = currentYearSchedule.annualDepreciation;
    }
  }

  // 総経費
  const totalExpenses =
    operatingExpenses +
    expenses.propertyTax +
    expenses.loanInterest +
    depreciationExpense;

  // 不動産所得
  const realEstateIncome = totalIncome - totalExpenses;

  return {
    propertyId: income.propertyId,
    year: income.year,
    totalRentalIncome,
    otherIncome: income.otherIncome,
    totalIncome,
    operatingExpenses,
    propertyTax: expenses.propertyTax,
    loanInterest: expenses.loanInterest,
    depreciationExpense,
    totalExpenses,
    realEstateIncome,
    expenseBreakdown: {
      managementFee: expenses.managementFee,
      repairCost: expenses.repairCost,
      insurance: expenses.insurance,
      utilities: expenses.utilities,
      otherExpenses: expenses.otherExpenses,
      depreciationExpense,
      propertyTax: expenses.propertyTax,
      loanInterest: expenses.loanInterest,
    },
  };
};

/**
 * 複数物件の不動産所得を計算
 */
export const calculateRealEstateIncomePortfolio = (
  year: number,
  calculations: RealEstateIncomeCalculation[]
): RealEstateIncomePortfolio => {
  const totalIncome = calculations.reduce((sum, c) => sum + c.totalIncome, 0);
  const totalExpenses = calculations.reduce((sum, c) => sum + c.totalExpenses, 0);
  const totalRealEstateIncome = calculations.reduce((sum, c) => sum + c.realEstateIncome, 0);

  const positiveIncomeCount = calculations.filter(c => c.realEstateIncome > 0).length;
  const negativeIncomeCount = calculations.filter(c => c.realEstateIncome < 0).length;

  return {
    year,
    properties: calculations,
    totalIncome,
    totalExpenses,
    totalRealEstateIncome,
    propertyCount: calculations.length,
    positiveIncomeCount,
    negativeIncomeCount,
  };
};
