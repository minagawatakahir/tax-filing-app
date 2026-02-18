/**
 * 譲渡所得データモデル
 */

export interface CapitalGainRecord {
  _id?: string;
  fiscalYear: number; // 年度
  propertyId: string;
  propertyName: string;
  
  // 売却情報
  saleDate: string;
  salePrice: number;
  
  // 譲渡費用
  brokerageFee: number;
  surveyCost: number;
  registrationCost: number;
  otherExpenses: number;
  totalTransferExpenses: number;
  
  // 取得情報
  acquisitionDate: string;
  acquisitionCost: number;
  acquisitionExpenses: number;
  totalAcquisitionCost: number;
  
  // 計算結果
  transferIncome: number;
  specialDeduction: number;
  taxableTransferIncome: number;
  ownershipYears: number;
  ownershipMonths: number;
  transferType: 'long' | 'short'; // 長期/短期
  
  // 税額
  incomeTax: number;
  residenceTax: number;
  reconstructionTax: number;
  totalTax: number;
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
}
