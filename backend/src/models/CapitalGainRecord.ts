import mongoose, { Schema, Document } from 'mongoose';
import { CapitalGainCalculation } from '../services/capitalGainService';

export interface ICapitalGainRecord extends Document {
  userId: string;
  fiscalYear: number; // 追加: 確定申告年度
  propertyId: string;
  input: {
    propertyId: string;
    saleDate: Date;
    salePrice: number;
    acquisitionCost: number;
    improvementCost: number;
    sellingExpenses: number;
    ownershipPeriod: number;
  };
  result: CapitalGainCalculation;
  createdAt: Date;
}

const CapitalGainRecordSchema = new Schema<ICapitalGainRecord>(
  {
    userId: { type: String, required: false, default: 'demo-user' },
    fiscalYear: { type: Number, required: true }, // 追加: 確定申告年度
    propertyId: { type: String, required: true },
    input: {
      propertyId: { type: String, required: true },
      saleDate: { type: Date, required: true },
      salePrice: { type: Number, required: true },
      acquisitionCost: { type: Number, required: true },
      improvementCost: { type: Number, required: true },
      sellingExpenses: { type: Number, required: true },
      ownershipPeriod: { type: Number, required: true },
    },
    result: {
      salePrice: { type: Number, required: true },
      totalCost: { type: Number, required: true },
      capitalGain: { type: Number, required: true },
      taxRate: { type: Number, required: true },
      estimatedTax: { type: Number, required: true },
      taxType: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

// 年度とuserIdの複合インデックスで高速検索
CapitalGainRecordSchema.index({ userId: 1, fiscalYear: 1 });

export const CapitalGainRecord = mongoose.model<ICapitalGainRecord>(
  'CapitalGainRecord',
  CapitalGainRecordSchema
);
