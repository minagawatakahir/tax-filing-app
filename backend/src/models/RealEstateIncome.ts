/**
 * 不動産所得データモデル
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IRealEstateIncome extends Document {
  userId: string;
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

const RealEstateIncomeSchema = new Schema<IRealEstateIncome>(
  {
    userId: { type: String, required: false, default: 'demo-user' },
    fiscalYear: { type: Number, required: true, index: true },
    propertyId: { type: String, required: true },
    propertyName: { type: String, required: true },
    
    // 収入
    monthlyRent: { type: Number, required: true, default: 0 },
    months: { type: Number, required: true, default: 12 },
    otherIncome: { type: Number, required: true, default: 0 },
    totalIncome: { type: Number, required: true, default: 0 },
    
    // 経費
    managementFee: { type: Number, required: true, default: 0 },
    repairCost: { type: Number, required: true, default: 0 },
    propertyTax: { type: Number, required: true, default: 0 },
    loanInterest: { type: Number, required: true, default: 0 },
    insurance: { type: Number, required: true, default: 0 },
    utilities: { type: Number, required: true, default: 0 },
    otherExpenses: { type: Number, required: true, default: 0 },
    depreciationExpense: { type: Number, required: true, default: 0 },
    totalExpenses: { type: Number, required: true, default: 0 },
    
    // 所得
    realEstateIncome: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const RealEstateIncome = mongoose.model<IRealEstateIncome>('RealEstateIncome', RealEstateIncomeSchema);

// 後方互換性のため、旧型も保持
export interface RealEstateIncomeRecord {
  _id?: string;
  fiscalYear: number;
  propertyId: string;
  propertyName: string;
  monthlyRent: number;
  months: number;
  otherIncome: number;
  totalIncome: number;
  managementFee: number;
  repairCost: number;
  propertyTax: number;
  loanInterest: number;
  insurance: number;
  utilities: number;
  otherExpenses: number;
  depreciationExpense: number;
  totalExpenses: number;
  realEstateIncome: number;
  createdAt: Date;
  updatedAt: Date;
}
