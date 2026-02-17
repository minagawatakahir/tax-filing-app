import mongoose, { Schema, Document } from 'mongoose';

export interface IRealEstateProperty extends Document {
  userId: mongoose.Types.ObjectId;
  propertyName: string;
  address: string;
  landArea: number; // 平方メートル
  landValue: number;
  buildingArea: number;
  buildingValue: number;
  acquisitionDate: Date;
  acquisitionCost: number;
  mortgageBalance: number;
  annualInterest: number;
  createdAt: Date;
  updatedAt: Date;
}

const realEstatePropertySchema = new Schema<IRealEstateProperty>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    landArea: {
      type: Number,
      required: true,
    },
    landValue: {
      type: Number,
      required: true,
    },
    buildingArea: {
      type: Number,
      required: true,
    },
    buildingValue: {
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
    mortgageBalance: {
      type: Number,
      default: 0,
    },
    annualInterest: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const RealEstateProperty = mongoose.model<IRealEstateProperty>(
  'RealEstateProperty',
  realEstatePropertySchema
);
