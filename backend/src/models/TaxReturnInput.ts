import mongoose, { Document, Schema } from 'mongoose';

/**
 * 確定申告（総合）の追加入力（年度ごとに1件）
 *
 * 給与所得・不動産所得は、それぞれ保存済みのレコードから集計する。
 * ここには、それ以外に申告書で必要になる項目だけを保存する。
 */
export const DONATION_KINDS = ['deduction', 'npo-credit', 'public-interest-credit', 'political-credit'] as const;

export interface ITaxReturnDonation {
  kind: (typeof DONATION_KINDS)[number];
  amount: number;
  name?: string;
}

export interface ITaxReturnInput extends Document {
  userId: string;
  fiscalYear: number;
  donations: ITaxReturnDonation[];
  estimatedTaxPrepaid: number; // 予定納税額（第1期分・第2期分）
  landLoanInterest: number; // 土地等を取得するために要した負債の利子
  earthquakeInsurance: number; // 地震保険料控除（控除額）
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<ITaxReturnDonation>(
  {
    kind: { type: String, enum: DONATION_KINDS, required: true },
    amount: { type: Number, required: true, min: 0 },
    name: { type: String },
  },
  { _id: false }
);

const TaxReturnInputSchema = new Schema<ITaxReturnInput>(
  {
    userId: { type: String, required: true, default: 'demo-user' },
    fiscalYear: { type: Number, required: true },
    donations: { type: [DonationSchema], default: [] },
    estimatedTaxPrepaid: { type: Number, default: 0, min: 0 },
    landLoanInterest: { type: Number, default: 0, min: 0 },
    earthquakeInsurance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

TaxReturnInputSchema.index({ userId: 1, fiscalYear: 1 }, { unique: true });

export const TaxReturnInput = mongoose.model<ITaxReturnInput>('TaxReturnInput', TaxReturnInputSchema);
