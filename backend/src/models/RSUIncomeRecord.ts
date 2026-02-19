import mongoose, { Schema, Document } from 'mongoose';

/**
 * RSU権利確定時の所得計算結果を保存するモデル
 * 年度別にRSU所得を管理
 */
export interface IRSUIncomeRecord extends Document {
  userId: string;
  year: number;
  // 入力データ（複数回の権利確定）
  input: Array<{
    companyName: string;
    grantDate: Date;
    vestingDate: Date;
    shares: number;
    pricePerShareUSD: number;
    ttmRate?: number;
  }>;
  // 計算結果（複数回の権利確定）
  result: Array<{
    companyName: string;
    vestingDate: Date;
    shares: number;
    pricePerShareUSD: number;
    ttmRate: number;
    totalValueJPY: number;
    taxableIncome: number;
  }>;
  // 年間合計
  totalRSUIncome: number;
  createdAt: Date;
  updatedAt: Date;
}

const RSUIncomeRecordSchema = new Schema<IRSUIncomeRecord>(
  {
    userId: { type: String, required: false, default: 'demo-user' },
    year: { type: Number, required: true },
    input: [
      {
        companyName: { type: String, required: true },
        grantDate: { type: Date, required: true },
        vestingDate: { type: Date, required: true },
        shares: { type: Number, required: true },
        pricePerShareUSD: { type: Number, required: true },
        ttmRate: { type: Number },
      },
    ],
    result: [
      {
        companyName: { type: String, required: true },
        vestingDate: { type: Date, required: true },
        shares: { type: Number, required: true },
        pricePerShareUSD: { type: Number, required: true },
        ttmRate: { type: Number, required: true },
        totalValueJPY: { type: Number, required: true },
        taxableIncome: { type: Number, required: true },
      },
    ],
    totalRSUIncome: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

// 年度とuserIdの複合インデックスで高速検索
RSUIncomeRecordSchema.index({ userId: 1, year: 1 });

export const RSUIncomeRecord = mongoose.model<IRSUIncomeRecord>(
  'RSUIncomeRecord',
  RSUIncomeRecordSchema
);
