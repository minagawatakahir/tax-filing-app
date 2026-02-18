/**
 * 不動産所得データモデル
 */

export interface RealEstateIncomeRecord {
  _id?: string;
  fiscalYear: number; // 年度
  propertyId: string;
  propertyName: string;
  
  // 収入
  monthlyRent: number;
  months: number;
  otherIncome: number;
  totalIncome: number;
  
  // 経費
  managementFee: number;
  repairCost: number;
  propertyTax: number;
  loanInterest: number;
  insurance: number;
  utilities: number;
  otherExpenses: number;
  depreciationExpense: number;
  totalExpenses: number;
  
  // 所得
  realEstateIncome: number;
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
}
