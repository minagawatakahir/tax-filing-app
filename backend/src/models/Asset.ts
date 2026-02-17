import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  userId: mongoose.Types.ObjectId;
  assetType: 'real_estate' | 'stock' | 'rsu' | 'cryptocurrency' | 'other';
  name: string;
  value: number;
  currency: string;
  acquisitionDate: Date;
  acquisitionCost: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assetType: {
      type: String,
      enum: ['real_estate', 'stock', 'rsu', 'cryptocurrency', 'other'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'JPY',
    },
    acquisitionDate: {
      type: Date,
      required: true,
    },
    acquisitionCost: {
      type: Number,
      required: true,
    },
    description: String,
  },
  { timestamps: true }
);

export const Asset = mongoose.model<IAsset>('Asset', assetSchema);
