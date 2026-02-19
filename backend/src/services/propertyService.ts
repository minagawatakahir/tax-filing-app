import Property, { IProperty } from '../models/Property';

export interface IPropertyData {
  propertyName: string;
  address: string;
  landValue: number;
  buildingValue: number;
  totalValue: number;
  acquisitionDate: string | Date;
  acquisitionCost: number;
  category: 'residential' | 'commercial' | 'land';
  propertyId?: string; // オプション（指定されない場合は自動生成）
  // 取得関連費用
  acquisitionTax?: number;
  registrationTax?: number;
  brokerFee?: number;
  otherAcquisitionCosts?: number;
  // ローン関連情報
  outstandingLoan?: number;
  annualInterest?: number;
  loanStartDate?: string | Date;
  purpose?: 'residential' | 'investment' | 'business';
  // 減価償却関連情報
  buildingStructure?: 'wood' | 'steel' | 'rc' | 'src';
  constructionDate?: string | Date;
  usefulLife?: number;
  depreciationMethod?: 'straight-line' | 'declining-balance';
  isNewProperty?: boolean;
  // TX-32: 火災・地震保険
  insurancePaidAmount?: number;
  insuranceCoveragePeriodYears?: number;
  insurancePaymentStartDate?: string | Date;
  // TX-32: ローン保証料
  loanGuaranteePaidAmount?: number;
  loanGuaranteePeriodYears?: number;
  loanGuaranteeStartDate?: string | Date;
  // TX-32: リフォーム・改修費用
  renovationExpenses?: Array<{
    date: Date | string;
    amount: number;
    description?: string;
    year: number;
  }>;
  // TX-32: ローン手数料
  loanProcessingFee?: number;
}

/**
 * 自動採番されたpropertyIdを生成
 */
const generatePropertyId = async (): Promise<string> => {
  const count = await Property.countDocuments();
  return `property-${String(count + 1).padStart(3, '0')}`;
};

/**
 * 不動産物件を作成（MongoDB保存）
 */
export const createProperty = async (propertyData: IPropertyData): Promise<IProperty> => {
  try {
    // propertyIdが指定されていない場合は自動採番
    const propertyId = propertyData.propertyId || (await generatePropertyId());

    const property = new Property({
      propertyId,
      propertyName: propertyData.propertyName,
      address: propertyData.address,
      landValue: propertyData.landValue,
      buildingValue: propertyData.buildingValue,
      totalValue: propertyData.totalValue,
      acquisitionDate: new Date(propertyData.acquisitionDate),
      acquisitionCost: propertyData.acquisitionCost,
      category: propertyData.category,
      // 取得関連費用
      acquisitionTax: propertyData.acquisitionTax,
      registrationTax: propertyData.registrationTax,
      brokerFee: propertyData.brokerFee,
      otherAcquisitionCosts: propertyData.otherAcquisitionCosts,
      // ローン関連情報
      outstandingLoan: propertyData.outstandingLoan,
      annualInterest: propertyData.annualInterest,
      loanStartDate: propertyData.loanStartDate ? new Date(propertyData.loanStartDate) : undefined,
      purpose: propertyData.purpose,
      // 減価償却関連情報
      buildingStructure: propertyData.buildingStructure,
      constructionDate: propertyData.constructionDate ? new Date(propertyData.constructionDate) : undefined,
      usefulLife: propertyData.usefulLife,
      depreciationMethod: propertyData.depreciationMethod,
      isNewProperty: propertyData.isNewProperty,
      // TX-32: 火災・地震保険
      insurancePaidAmount: propertyData.insurancePaidAmount,
      insuranceCoveragePeriodYears: propertyData.insuranceCoveragePeriodYears,
      insurancePaymentStartDate: propertyData.insurancePaymentStartDate ? new Date(propertyData.insurancePaymentStartDate) : undefined,
      // TX-32: ローン保証料
      loanGuaranteePaidAmount: propertyData.loanGuaranteePaidAmount,
      loanGuaranteePeriodYears: propertyData.loanGuaranteePeriodYears,
      loanGuaranteeStartDate: propertyData.loanGuaranteeStartDate ? new Date(propertyData.loanGuaranteeStartDate) : undefined,
      // TX-32: リフォーム・改修費用
      renovationExpenses: propertyData.renovationExpenses?.map(exp => ({
        date: new Date(exp.date),
        amount: exp.amount,
        description: exp.description,
        year: exp.year,
      })),
      // TX-32: ローン手数料
      loanProcessingFee: propertyData.loanProcessingFee,
    });

    return await property.save();
  } catch (error: any) {
    throw new Error(`物件の作成に失敗しました: ${error.message}`);
  }
};

/**
 * すべての不動産物件を取得（MongoDB）
 */
export const getAllProperties = async (): Promise<IProperty[]> => {
  try {
    return await Property.find().sort({ createdAt: -1 }).lean();
  } catch (error: any) {
    throw new Error(`物件の取得に失敗しました: ${error.message}`);
  }
};

/**
 * IDで不動産物件を取得（MongoDB）
 */
export const getPropertyById = async (id: string): Promise<IProperty | null> => {
  try {
    return await Property.findById(id).lean();
  } catch (error: any) {
    throw new Error(`物件の取得に失敗しました: ${error.message}`);
  }
};

/**
 * 不動産物件を更新（MongoDB）
 */
export const updateProperty = async (id: string, propertyData: Partial<IPropertyData>): Promise<IProperty | null> => {
  try {
    const updateData: any = {
      propertyName: propertyData.propertyName,
      address: propertyData.address,
      landValue: propertyData.landValue,
      buildingValue: propertyData.buildingValue,
      totalValue: propertyData.totalValue,
      acquisitionDate: propertyData.acquisitionDate ? new Date(propertyData.acquisitionDate) : undefined,
      acquisitionCost: propertyData.acquisitionCost,
      category: propertyData.category,
      // 取得関連費用
      acquisitionTax: propertyData.acquisitionTax,
      registrationTax: propertyData.registrationTax,
      brokerFee: propertyData.brokerFee,
      otherAcquisitionCosts: propertyData.otherAcquisitionCosts,
      // ローン関連情報
      outstandingLoan: propertyData.outstandingLoan,
      annualInterest: propertyData.annualInterest,
      loanStartDate: propertyData.loanStartDate ? new Date(propertyData.loanStartDate) : undefined,
      purpose: propertyData.purpose,
      // 減価償却関連情報
      buildingStructure: propertyData.buildingStructure,
      constructionDate: propertyData.constructionDate ? new Date(propertyData.constructionDate) : undefined,
      usefulLife: propertyData.usefulLife,
      depreciationMethod: propertyData.depreciationMethod,
      isNewProperty: propertyData.isNewProperty,
      // TX-32: 火災・地震保険
      insurancePaidAmount: propertyData.insurancePaidAmount,
      insuranceCoveragePeriodYears: propertyData.insuranceCoveragePeriodYears,
      insurancePaymentStartDate: propertyData.insurancePaymentStartDate ? new Date(propertyData.insurancePaymentStartDate) : undefined,
      // TX-32: ローン保証料
      loanGuaranteePaidAmount: propertyData.loanGuaranteePaidAmount,
      loanGuaranteePeriodYears: propertyData.loanGuaranteePeriodYears,
      loanGuaranteeStartDate: propertyData.loanGuaranteeStartDate ? new Date(propertyData.loanGuaranteeStartDate) : undefined,
      // TX-32: リフォーム・改修費用
      renovationExpenses: propertyData.renovationExpenses?.map(exp => ({
        date: new Date(exp.date),
        amount: exp.amount,
        description: exp.description,
        year: exp.year,
      })),
      // TX-32: ローン手数料
      loanProcessingFee: propertyData.loanProcessingFee,
    };

    // undefinedの値を削除
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    return await Property.findByIdAndUpdate(id, updateData, { new: true }).lean();
  } catch (error: any) {
    throw new Error(`物件の更新に失敗しました: ${error.message}`);
  }
};

/**
 * 不動産物件を削除（MongoDB）
 */
export const deleteProperty = async (id: string): Promise<IProperty | null> => {
  try {
    return await Property.findByIdAndDelete(id).lean();
  } catch (error: any) {
    throw new Error(`物件の削除に失敗しました: ${error.message}`);
  }
};
