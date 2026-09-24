import mongoose, { Schema, Document } from 'mongoose';
import { StoredSalaryIncomeResult } from '../services/salaryIncomeService';

export interface ISalaryIncomeRecord extends Document {
  userId: string;
  year: number;
  input: {
    annualSalary: number;
    withheldTax: number;
    socialInsurance: number;
    lifeInsurance?: number;
    dependents?: number;
    spouseDeduction?: boolean;
  };
  result: StoredSalaryIncomeResult;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryIncomeRecordSchema = new Schema<ISalaryIncomeRecord>(
  {
    userId: { type: String, required: false, default: 'demo-user' },
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
      // v2（年分別税制ルール対応）以降の計算結果に含まれる項目
      taxYear: { type: Number },
      isProvisional: { type: Boolean },
      notice: { type: String },
      baseIncomeTax: { type: Number },
      reconstructionTax: { type: Number },
      withheldTax: { type: Number },
      taxPayable: { type: Number },
      taxRefund: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

// 複合ユニークインデックス: userId + year の組み合わせは一意
SalaryIncomeRecordSchema.index({ userId: 1, year: 1 }, { unique: true });

export const SalaryIncomeRecord = mongoose.model<ISalaryIncomeRecord>(
  'SalaryIncomeRecord',
  SalaryIncomeRecordSchema
);

// 一意インデックス {userId, year} の作成に失敗した場合（既存データの重複など）に原因と対処を知らせる。
// 失敗したままだと「年度ごとに1件」の保証が効かない（TX-61）。
SalaryIncomeRecord.on('index', (error?: Error) => {
  if (error) {
    console.error(
      '⚠️ salaryincomerecords の一意インデックス {userId, year} を作成できませんでした。' +
        '既存データに同じ年度の重複がある可能性があります。' +
        '`npm run db:dedupe-salary` で確認してください。',
      error.message
    );
  }
});
