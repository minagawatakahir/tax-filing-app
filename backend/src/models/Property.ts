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
  // 取得関連費用
  acquisitionTax?: number; // 不動産取得税
  registrationTax?: number; // 登録免許税
  brokerFee?: number; // 仲介手数料
  otherAcquisitionCosts?: number; // その他取得費用
  // ローン関連情報
  outstandingLoan?: number; // 現在のローン残高
  annualInterest?: number; // 年間利息
  loanStartDate?: Date; // ローン開始日
  purpose?: 'residential' | 'investment' | 'business'; // ローン用途
  // 減価償却関連情報
  buildingStructure?: 'wood' | 'steel' | 'rc' | 'src'; // 建物構造（木造、鉄骨造、RC造、SRC造）
  constructionDate?: Date; // 建築年月
  usefulLife?: number; // 耐用年数（年・自動計算）
  depreciationMethod?: 'straight-line' | 'declining-balance'; // 償却方法（定額法、定率法）
  isNewProperty?: boolean; // 新築物件フラグ
  // TX-32: 火災・地震保険（複数年払い対応）
  insurancePaidAmount?: number; // 支払った保険料総額
  insuranceCoveragePeriodYears?: number; // カバー期間（年数）
  insurancePaymentStartDate?: Date; // 保険開始日
  // TX-32: ローン保証料（複数年払い対応）
  loanGuaranteePaidAmount?: number; // 支払った保証料総額
  loanGuaranteePeriodYears?: number; // 保証期間（年数）
  loanGuaranteeStartDate?: Date; // 保証開始日
  // TX-32: リフォーム・改修費用（配列）
  renovationExpenses?: Array<{
    date: Date;
    amount: number;
    description?: string;
    year: number;
  }>;
  // TX-32: ローン手数料
  loanProcessingFee?: number; // ローン手数料（初年度のみ）
  // TX-36: 売却情報（年度別所得計算のフィルタリング用）
  saleDate?: Date; // 売却日（この日付以降は不動産所得が発生しない）
  salePrice?: number; // 売却価格
  saleStatus?: 'active' | 'sold' | 'archived'; // 物件状態: active=賃貸中, sold=売却済み, archived=アーカイブ
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
    // 取得関連費用
    acquisitionTax: {
      type: Number,
    },
    registrationTax: {
      type: Number,
    },
    brokerFee: {
      type: Number,
    },
    otherAcquisitionCosts: {
      type: Number,
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
    // 減価償却関連情報
    buildingStructure: {
      type: String,
      enum: ['wood', 'steel', 'rc', 'src'],
    },
    constructionDate: {
      type: Date,
    },
    usefulLife: {
      type: Number,
    },
    depreciationMethod: {
      type: String,
      enum: ['straight-line', 'declining-balance'],
      default: 'straight-line',
    },
    isNewProperty: {
      type: Boolean,
      default: false,
    },
    // TX-32: 火災・地震保険（複数年払い対応）
    insurancePaidAmount: {
      type: Number,
    },
    insuranceCoveragePeriodYears: {
      type: Number,
    },
    insurancePaymentStartDate: {
      type: Date,
    },
    // TX-32: ローン保証料（複数年払い対応）
    loanGuaranteePaidAmount: {
      type: Number,
    },
    loanGuaranteePeriodYears: {
      type: Number,
    },
    loanGuaranteeStartDate: {
      type: Date,
    },
    // TX-32: リフォーム・改修費用（配列）
    renovationExpenses: {
      type: [
        {
          date: Date,
          amount: Number,
          description: String,
          year: Number,
        },
      ],
      default: [],
    },
    // TX-32: ローン手数料
    loanProcessingFee: {
      type: Number,
    },
    // TX-36: 売却情報（年度別所得計算のフィルタリング用）
    saleDate: {
      type: Date,
    },
    salePrice: {
      type: Number,
    },
    saleStatus: {
      type: String,
      enum: ['active', 'sold', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProperty>('Property', PropertySchema);
