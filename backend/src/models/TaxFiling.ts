import mongoose, { Schema, Document } from 'mongoose';

export interface ITaxFiling extends Document {
  userId: mongoose.Types.ObjectId;
  year: number;
  status: 'draft' | 'submitted' | 'confirmed';
  income: number;
  deductions: number;
  taxableIncome: number;
  incomeTax: number;
  submittedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taxFilingSchema = new Schema<ITaxFiling>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'confirmed'],
      default: 'draft',
    },
    income: {
      type: Number,
      required: true,
    },
    deductions: {
      type: Number,
      required: true,
    },
    taxableIncome: {
      type: Number,
      required: true,
    },
    incomeTax: {
      type: Number,
      required: true,
    },
    submittedDate: Date,
  },
  { timestamps: true }
);

export const TaxFiling = mongoose.model<ITaxFiling>('TaxFiling', taxFilingSchema);
