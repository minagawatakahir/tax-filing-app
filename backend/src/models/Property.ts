import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  propertyId: string;
  propertyName: string;
  address: string;
  landValue: number;
  buildingValue: number;
  totalValue: number;
  acquisitionDate: Date;
  acquisitionCost: number;
  category: 'residential' | 'commercial' | 'land';
  // ローン関連情報
  outstandingLoan?: number; // 現在のローン残高
  annualInterest?: number; // 年間利息
  loanStartDate?: Date; // ローン開始日
  purpose?: 'residential' | 'investment' | 'business'; // ローン用途
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
  {
    propertyId: {
      type: String,
      unique: true,
      required: true,
    },
    propertyName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    landValue: {
      type: Number,
      default: 0,
    },
    buildingValue: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
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
    category: {
      type: String,
      enum: ['residential', 'commercial', 'land'],
      required: true,
    },
    // ローン関連情報
    outstandingLoan: {
      type: Number,
      default: 0,
    },
    annualInterest: {
      type: Number,
      default: 0,
    },
    loanStartDate: {
      type: Date,
    },
    purpose: {
      type: String,
      enum: ['residential', 'investment', 'business'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProperty>('Property', PropertySchema);
