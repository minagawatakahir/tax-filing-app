import mongoose, { Schema, Document } from 'mongoose';

export interface IRSUGrant extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  grantDate: Date;
  vestingDate: Date;
  shares: number;
  pricePerShareUSD: number;
  currency: string;
  ttmRate?: number;
  totalValueJPY?: number;
  taxableIncome?: number;
  createdAt: Date;
  updatedAt: Date;
}

const rsuGrantSchema = new Schema<IRSUGrant>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    grantDate: {
      type: Date,
      required: true,
    },
    vestingDate: {
      type: Date,
      required: true,
    },
    shares: {
      type: Number,
      required: true,
    },
    pricePerShareUSD: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    ttmRate: Number,
    totalValueJPY: Number,
    taxableIncome: Number,
  },
  { timestamps: true }
);

export const RSUGrant = mongoose.model<IRSUGrant>('RSUGrant', rsuGrantSchema);
