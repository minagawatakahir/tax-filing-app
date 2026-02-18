import mongoose, { Schema, Document } from 'mongoose';
import { SalaryIncomeResult } from '../services/salaryIncomeService';

export interface ISalaryIncomeRecord extends Document {
  userId: mongoose.Types.ObjectId;
  year: number;
  input: {
    annualSalary: number;
    withheldTax: number;
    socialInsurance: number;
    lifeInsurance?: number;
    dependents?: number;
    spouseDeduction?: boolean;
  };
  result: SalaryIncomeResult;
  createdAt: Date;
}

const SalaryIncomeRecordSchema = new Schema<ISalaryIncomeRecord>(
  {
    userId: { type: Schema.Types.ObjectId, required: false },
    year: { type: Number, required: true },
    input: {
      annualSalary: { type: Number, required: true },
      withheldTax: { type: Number, required: true },
      socialInsurance: { type: Number, required: true },
      lifeInsurance: { type: Number },
      dependents: { type: Number },
      spouseDeduction: { type: Boolean },
    },
    result: {
      annualSalary: { type: Number, required: true },
      salaryIncomeDeduction: { type: Number, required: true },
      salaryIncome: { type: Number, required: true },
      socialInsurance: { type: Number, required: true },
      lifeInsurance: { type: Number, required: true },
      basicDeduction: { type: Number, required: true },
      dependentDeduction: { type: Number, required: true },
      spouseDeduction: { type: Number, required: true },
      totalDeduction: { type: Number, required: true },
      taxableIncome: { type: Number, required: true },
      estimatedTax: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  }
);

export const SalaryIncomeRecord = mongoose.model<ISalaryIncomeRecord>(
  'SalaryIncomeRecord',
  SalaryIncomeRecordSchema
);
