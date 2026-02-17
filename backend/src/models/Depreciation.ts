import mongoose, { Schema, Document } from 'mongoose';

export interface IDepreciation extends Document {
  userId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
  assetName: string;
  acquisitionDate: Date;
  acquisitionCost: number;
  usefulLife: number;
  depreciationMethod: 'straight' | 'declining';
  currentBookValue: number;
  accumulatedDepreciation: number;
  createdAt: Date;
  updatedAt: Date;
}

const depreciationSchema = new Schema<IDepreciation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    assetName: {
      type: String,
      required: true,
    },
    acquisitionDate: {
      type: Date,
      required: true,
    },
    acquisitionCost: {
      type: Number,
      required: true,
    },
    usefulLife: {
      type: Number,
      required: true,
    },
    depreciationMethod: {
      type: String,
      enum: ['straight', 'declining'],
      default: 'straight',
    },
    currentBookValue: {
      type: Number,
      required: true,
    },
    accumulatedDepreciation: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Depreciation = mongoose.model<IDepreciation>('Depreciation', depreciationSchema);
