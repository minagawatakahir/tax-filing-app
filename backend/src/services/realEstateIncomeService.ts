/**
 * 不動産所得計算サービス (TX-20 & TX-29)
 * 家賃収入、経費管理、減価償却費を統合して不動産所得を計算
 * TX-29: 取得関連費用（不動産取得税）を取得年度に計上
 */

import { DepreciableAsset, generateDepreciationSchedule } from './depreciationService';
import Property from '../models/Property';
// TX-32: 複数年払い経費計算
import {
  calculateAnnualExpenseFromMultiYearPayment,
  calculateRenovationExpenseForYear,
} from './multiYearExpenseHelpers';

/**
 * 家賃収入データ
 */
export interface RentalIncomeData {
  propertyId: string;
  year: number;
  monthlyRent: number; // 月額家賃
  months: number; // 家賃収入月数
  rentalEndMonth?: number; // TX-33対応: 売却月（1-12、未指定 or 12 = 売却なし）
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
  // TX-29: 取得関連費用
  acquisitionTax?: number; // 不動産取得税（取得年度のみ計上）
  expenseEndMonth?: number; // TX-33対応: 経費計上終了月（1-12、未指定 or 12 = 全年度）
  // TX-32: 複数年払い経費（自動計算）
  annualInsuranceExpense?: number; // その年度の保険料経費（按分計算済み）
  annualLoanGuaranteeExpense?: number; // その年度のローン保証料経費（按分計算済み）
  renovationExpense?: number; // その年度のリフォーム費用
  loanProcessingFee?: number; // ローン手数料（取得年度のみ）
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
  acquisitionTaxExpense: number; // TX-29: 不動産取得税（取得年度のみ）
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
    acquisitionTax: number; // TX-29: 追加
    annualInsuranceExpense: number; // TX-32: 追加
    annualLoanGuaranteeExpense: number; // TX-32: 追加
    renovationExpense: number; // TX-32: 追加
    loanProcessingFee: number; // TX-32: 追加
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
 * 月別按分計算（TX-33対応）
 * @param annualAmount - 年間金額
 * @param endMonth - 終了月（1-12、未指定 or 12 = 全年度）
 * @returns 按分計算後の金額
 */
export const calculateProportionalAmount = (
  annualAmount: number,
  endMonth?: number
): number => {
  if (!endMonth || endMonth >= 12) {
    return annualAmount;
  }
  
  if (endMonth < 1 || endMonth > 12) {
    throw new Error('終了月は1-12の範囲で指定してください');
  }
  
  return Math.round(annualAmount * endMonth / 12);
};

/**
 * TX-48: 複数年払い保険料の按分計算
 * @param totalAmount - 総支払額
 * @param startMonth - 開始年月（YYYY-MM形式）
 * @param endMonth - 終了年月（YYYY-MM形式）
 * @param fiscalYear - 会計年度（開始年）
 * @returns 当年度按分額
 */
export const calculateProportionalInsurance = (
  totalAmount: number,
  startMonth: string,
  endMonth: string,
  fiscalYear: number
): number => {
  if (!startMonth || !endMonth || totalAmount === 0) {
    return 0;
  }

  const startDate = new Date(startMonth);
  const endDate = new Date(endMonth);
  
  // 総月数を計算
  const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                      (endDate.getMonth() - startDate.getMonth()) + 1;

  // 当年度利用月数を計算（会計年度: 4月-3月）
  const fiscalYearStart = new Date(fiscalYear, 3, 1); // 4月1日
  const fiscalYearEnd = new Date(fiscalYear + 1, 2, 31); // 3月31日

  const overlapStart = new Date(Math.max(startDate.getTime(), fiscalYearStart.getTime()));
  const overlapEnd = new Date(Math.min(endDate.getTime(), fiscalYearEnd.getTime()));

  if (overlapStart > overlapEnd) {
    return 0; // 対象期間外
  }

  const fiscalYearMonths = (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12 +
                           (overlapEnd.getMonth() - overlapStart.getMonth()) + 1;

  return Math.round(totalAmount * (fiscalYearMonths / totalMonths));
};

/**
 * TX-48: ローン保証料の按分計算
 * @param totalAmount - 総支払額
 * @param loanYears - ローン期間（年）
 * @param paymentMonth - 支払開始年月（YYYY-MM形式）
 * @param fiscalYear - 会計年度（開始年）
 * @returns 当年度按分額
 */
export const calculateProportionalLoanGuarantee = (
  totalAmount: number,
  loanYears: number,
  paymentMonth: string,
  fiscalYear: number
): number => {
  if (!paymentMonth || loanYears === 0 || totalAmount === 0) {
    return 0;
  }

  const paymentDate = new Date(paymentMonth);
  const annualAmount = totalAmount / loanYears;

  // 当年度利用月数を計算
  const fiscalYearStart = new Date(fiscalYear, 3, 1); // 4月1日
  const fiscalYearEnd = new Date(fiscalYear + 1, 2, 31); // 3月31日

  const loanEndDate = new Date(
    paymentDate.getFullYear() + loanYears,
    paymentDate.getMonth(),
    paymentDate.getDate()
  );

  const overlapStart = new Date(Math.max(paymentDate.getTime(), fiscalYearStart.getTime()));
  const overlapEnd = new Date(Math.min(loanEndDate.getTime(), fiscalYearEnd.getTime()));

  if (overlapStart > overlapEnd) {
    return 0;
  }

  const fiscalYearMonths = (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12 +
                           (overlapEnd.getMonth() - overlapStart.getMonth()) + 1;

  return Math.round(annualAmount * (fiscalYearMonths / 12));
};

/**
 * 家賃収入を計算（TX-33対応）
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
    expenses.insurance +
    expenses.utilities +
    expenses.otherExpenses +
    expenses.propertyTax +
    expenses.loanInterest
  );
};

/**
 * 不動産所得を計算（TX-29: 取得年度に不動産取得税を計上）
 */
export const calculateRealEstateIncome = async (
  income: RentalIncomeData,
  expenses: RealEstateExpense,
  depreciationAsset?: DepreciableAsset
): Promise<RealEstateIncomeCalculation> => {
  // TX-29: propertyId から物件情報を取得（取得年度の判定）
  let isAcquisitionYear = false;
  let acquisitionTaxAmount = 0;

  if (expenses.propertyId && expenses.acquisitionTax !== undefined) {
    try {
      const property = await Property.findOne({ propertyId: expenses.propertyId });
      
      if (property) {
        // 取得年度かどうかを判定
        const acquisitionYear = property.acquisitionDate.getFullYear();
        isAcquisitionYear = (acquisitionYear === expenses.year);
        
        // 取得年度の場合のみ不動産取得税を計上
        if (isAcquisitionYear) {
          acquisitionTaxAmount = expenses.acquisitionTax || 0;
        }
      }
    } catch (error) {
      console.warn(`Property lookup failed for ${expenses.propertyId}:`, error);
      // エラーが発生した場合は入力値を信頼する
      isAcquisitionYear = expenses.acquisitionTax ? true : false;
      acquisitionTaxAmount = isAcquisitionYear ? (expenses.acquisitionTax || 0) : 0;
    }
  } else {
    // propertyId がない場合は、acquisitionTax があれば計上
    acquisitionTaxAmount = expenses.acquisitionTax || 0;
  }

  // TX-33: 月別按分計算
  const rentalMonths = income.rentalEndMonth || 12;
  const totalRentalIncome = calculateRentalIncome(
    income.monthlyRent,
    rentalMonths,
    income.otherIncome
  );
  const totalIncome = totalRentalIncome;

  // 経費計算（TX-33対応で按分）
  const expenseEndMonth = expenses.expenseEndMonth || 12;
  
  const operatingExpenses = calculateProportionalAmount(
    expenses.managementFee +
    expenses.repairCost +
    expenses.insurance +
    expenses.utilities +
    expenses.otherExpenses,
    expenseEndMonth
  );

  const propertyTaxExpense = calculateProportionalAmount(expenses.propertyTax, expenseEndMonth);
  const loanInterestExpense = calculateProportionalAmount(expenses.loanInterest, expenseEndMonth);

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
      // TX-33対応: 減価償却費も按分
      depreciationExpense = calculateProportionalAmount(
        currentYearSchedule.annualDepreciation,
        expenseEndMonth
      );
    }
  }

  // TX-32: 複数年払い経費を計算
  let annualInsuranceExpense = 0;
  let annualLoanGuaranteeExpense = 0;
  let renovationExpense = 0;
  let loanProcessingFeeExpense = 0;

  if (expenses.propertyId) {
    try {
      const property = await Property.findOne({ propertyId: expenses.propertyId });
      
      if (property) {
        // 火災・地震保険の按分計算
        if (
          property.insurancePaidAmount &&
          property.insuranceCoveragePeriodYears &&
          property.insurancePaymentStartDate
        ) {
          annualInsuranceExpense = calculateAnnualExpenseFromMultiYearPayment(
            property.insurancePaidAmount,
            property.insuranceCoveragePeriodYears,
            property.insurancePaymentStartDate,
            expenses.year
          );
        }
        
        // ローン保証料の按分計算
        if (
          property.loanGuaranteePaidAmount &&
          property.loanGuaranteePeriodYears &&
          property.loanGuaranteeStartDate
        ) {
          annualLoanGuaranteeExpense = calculateAnnualExpenseFromMultiYearPayment(
            property.loanGuaranteePaidAmount,
            property.loanGuaranteePeriodYears,
            property.loanGuaranteeStartDate,
            expenses.year
          );
        }
        
        // リフォーム費用の集計
        renovationExpense = calculateRenovationExpenseForYear(
          property.renovationExpenses,
          expenses.year
        );
        
        // ローン手数料（取得年度のみ）
        const acquisitionYear = property.acquisitionDate.getFullYear();
        if (property.loanProcessingFee && acquisitionYear === expenses.year) {
          loanProcessingFeeExpense = property.loanProcessingFee;
        }
      }
    } catch (error) {
      console.warn(`Property lookup failed for TX-32 calculation:`, error);
    }
  }

  // 総経費（TX-29: 不動産取得税を追加、TX-32: 複数年払い経費を追加）
  const totalExpenses =
    operatingExpenses +
    propertyTaxExpense +
    loanInterestExpense +
    depreciationExpense +
    acquisitionTaxAmount +
    annualInsuranceExpense +
    annualLoanGuaranteeExpense +
    renovationExpense +
    loanProcessingFeeExpense;

  // 不動産所得
  const realEstateIncome = totalIncome - totalExpenses;

  return {
    propertyId: income.propertyId,
    year: income.year,
    totalRentalIncome,
    otherIncome: income.otherIncome,
    totalIncome,
    operatingExpenses,
    propertyTax: propertyTaxExpense,
    loanInterest: loanInterestExpense,
    depreciationExpense,
    acquisitionTaxExpense: acquisitionTaxAmount, // TX-29: 追加
    totalExpenses,
    realEstateIncome,
    expenseBreakdown: {
      managementFee: expenses.managementFee,
      repairCost: expenses.repairCost,
      insurance: expenses.insurance,
      utilities: expenses.utilities,
      otherExpenses: expenses.otherExpenses,
      depreciationExpense,
      propertyTax: propertyTaxExpense,
      loanInterest: loanInterestExpense,
      acquisitionTax: acquisitionTaxAmount, // TX-29: 追加
      annualInsuranceExpense, // TX-32: 追加
      annualLoanGuaranteeExpense, // TX-32: 追加
      renovationExpense, // TX-32: 追加
      loanProcessingFee: loanProcessingFeeExpense, // TX-32: 追加
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
