/**
 * 不動産LTV・利子判定サービス
 * 借入金配分計算、土地負債利子の自動不算入計算
 */

export interface PropertyLoan {
  loanId: string;
  propertyId: string;
  totalAmount: number;
  outstandingBalance: number;
  annualInterest: number;
  purpose: 'land' | 'building' | 'both';
}

export interface PropertyValuation {
  propertyId: string;
  landValue: number;
  buildingValue: number;
  totalValue: number;
  acquisitionDate: Date;
}

export interface LTVCalculationResult {
  propertyId: string;
  loanToValue: number; // LTV比率
  landLoanAmount: number;
  buildingLoanAmount: number;
  landLTV: number;
  buildingLTV: number;
  totalLoan: number;
  totalValue: number;
}

export interface InterestDeductionResult {
  propertyId: string;
  totalInterest: number;
  deductibleInterest: number; // 損金算入可能な利子
  nonDeductibleInterest: number; // 土地負債利子（損金不算入）
  landInterest: number;
  buildingInterest: number;
  deductionRate: number;
}

/**
 * LTV（Loan to Value）を計算
 * @param property 不動産評価額
 * @param loans ローン情報
 * @returns LTV計算結果
 */
export const calculateLTV = (
  property: PropertyValuation,
  loans: PropertyLoan[]
): LTVCalculationResult => {
  // 物件に紐づくローンの合計
  const propertyLoans = loans.filter(loan => loan.propertyId === property.propertyId);
  const totalLoan = propertyLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  
  // LTV計算
  const ltv = property.totalValue > 0 ? (totalLoan / property.totalValue) * 100 : 0;
  
  // 土地・建物の按分比率
  const landRatio = property.landValue / property.totalValue;
  const buildingRatio = property.buildingValue / property.totalValue;
  
  // 土地・建物それぞれのローン額を按分
  const landLoanAmount = totalLoan * landRatio;
  const buildingLoanAmount = totalLoan * buildingRatio;
  
  // それぞれのLTV
  const landLTV = property.landValue > 0 ? (landLoanAmount / property.landValue) * 100 : 0;
  const buildingLTV = property.buildingValue > 0 ? (buildingLoanAmount / property.buildingValue) * 100 : 0;
  
  return {
    propertyId: property.propertyId,
    loanToValue: ltv,
    landLoanAmount,
    buildingLoanAmount,
    landLTV,
    buildingLTV,
    totalLoan,
    totalValue: property.totalValue,
  };
};

/**
 * 利子の損金算入可否を判定
 * 土地負債利子は損金不算入のため、建物部分のみ控除可能
 * @param property 不動産評価額
 * @param loans ローン情報
 * @returns 利子控除判定結果
 */
export const calculateInterestDeduction = (
  property: PropertyValuation,
  loans: PropertyLoan[]
): InterestDeductionResult => {
  // 物件に紐づくローン
  const propertyLoans = loans.filter(loan => loan.propertyId === property.propertyId);
  
  // 総利子額
  const totalInterest = propertyLoans.reduce((sum, loan) => sum + loan.annualInterest, 0);
  
  // 土地・建物の按分比率
  const landRatio = property.landValue / property.totalValue;
  const buildingRatio = property.buildingValue / property.totalValue;
  
  // 利子を按分
  const landInterest = totalInterest * landRatio;
  const buildingInterest = totalInterest * buildingRatio;
  
  // 損金算入可能額（建物部分のみ）
  const deductibleInterest = buildingInterest;
  
  // 損金不算入額（土地部分）
  const nonDeductibleInterest = landInterest;
  
  // 控除率
  const deductionRate = totalInterest > 0 ? (deductibleInterest / totalInterest) * 100 : 0;
  
  return {
    propertyId: property.propertyId,
    totalInterest,
    deductibleInterest,
    nonDeductibleInterest,
    landInterest,
    buildingInterest,
    deductionRate,
  };
};

/**
 * 複数物件のLTV・利子分析
 * @param properties 不動産評価額の配列
 * @param loans ローン情報の配列
 * @returns 分析結果
 */
export const analyzePortfolio = (
  properties: PropertyValuation[],
  loans: PropertyLoan[]
): {
  totalValue: number;
  totalLoan: number;
  portfolioLTV: number;
  totalInterest: number;
  totalDeductibleInterest: number;
  totalNonDeductibleInterest: number;
  propertyAnalyses: Array<{
    property: PropertyValuation;
    ltv: LTVCalculationResult;
    interestDeduction: InterestDeductionResult;
  }>;
} => {
  const propertyAnalyses = properties.map(property => ({
    property,
    ltv: calculateLTV(property, loans),
    interestDeduction: calculateInterestDeduction(property, loans),
  }));
  
  const totalValue = properties.reduce((sum, p) => sum + p.totalValue, 0);
  const totalLoan = propertyAnalyses.reduce((sum, a) => sum + a.ltv.totalLoan, 0);
  const portfolioLTV = totalValue > 0 ? (totalLoan / totalValue) * 100 : 0;
  
  const totalInterest = propertyAnalyses.reduce((sum, a) => sum + a.interestDeduction.totalInterest, 0);
  const totalDeductibleInterest = propertyAnalyses.reduce((sum, a) => sum + a.interestDeduction.deductibleInterest, 0);
  const totalNonDeductibleInterest = propertyAnalyses.reduce((sum, a) => sum + a.interestDeduction.nonDeductibleInterest, 0);
  
  return {
    totalValue,
    totalLoan,
    portfolioLTV,
    totalInterest,
    totalDeductibleInterest,
    totalNonDeductibleInterest,
    propertyAnalyses,
  };
};
