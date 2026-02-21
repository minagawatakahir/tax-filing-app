/**
 * 不動産所得データストレージサービス
 * MongoDB対応版
 */

import { RealEstateIncome, RealEstateIncomeRecord, IRealEstateIncome } from '../models/RealEstateIncome';

/**
 * 年度別に不動産所得一覧を取得
 */
export const getRealEstateIncomeByFiscalYear = async (fiscalYear: number): Promise<RealEstateIncomeRecord[]> => {
  try {
    const records = await RealEstateIncome.find({ fiscalYear }).sort({ createdAt: -1 });
    return records.map(doc => ({
      _id: doc._id.toString(),
      fiscalYear: doc.fiscalYear,
      propertyId: doc.propertyId,
      propertyName: doc.propertyName,
      monthlyRent: doc.monthlyRent,
      months: doc.months,
      otherIncome: doc.otherIncome,
      totalIncome: doc.totalIncome,
      managementFee: doc.managementFee,
      repairCost: doc.repairCost,
      propertyTax: doc.propertyTax,
      loanInterest: doc.loanInterest,
      insurance: doc.insurance,
      utilities: doc.utilities,
      otherExpenses: doc.otherExpenses,
      depreciationExpense: doc.depreciationExpense,
      totalExpenses: doc.totalExpenses,
      realEstateIncome: doc.realEstateIncome,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching real estate income records:', error);
    return [];
  }
};

/**
 * 不動産所得を新規保存
 */
export const saveRealEstateIncome = async (data: Omit<RealEstateIncomeRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<RealEstateIncomeRecord> => {
  try {
    const newRecord = new RealEstateIncome({
      userId: 'demo-user',
      ...data,
    });
    
    const savedDoc = await newRecord.save();
    return {
      _id: savedDoc._id.toString(),
      fiscalYear: savedDoc.fiscalYear,
      propertyId: savedDoc.propertyId,
      propertyName: savedDoc.propertyName,
      monthlyRent: savedDoc.monthlyRent,
      months: savedDoc.months,
      otherIncome: savedDoc.otherIncome,
      totalIncome: savedDoc.totalIncome,
      managementFee: savedDoc.managementFee,
      repairCost: savedDoc.repairCost,
      propertyTax: savedDoc.propertyTax,
      loanInterest: savedDoc.loanInterest,
      insurance: savedDoc.insurance,
      utilities: savedDoc.utilities,
      otherExpenses: savedDoc.otherExpenses,
      depreciationExpense: savedDoc.depreciationExpense,
      totalExpenses: savedDoc.totalExpenses,
      realEstateIncome: savedDoc.realEstateIncome,
      createdAt: savedDoc.createdAt,
      updatedAt: savedDoc.updatedAt,
    };
  } catch (error) {
    console.error('Error saving real estate income record:', error);
    throw error;
  }
};

/**
 * 不動産所得を更新
 */
export const updateRealEstateIncome = async (id: string, data: Partial<RealEstateIncomeRecord>): Promise<RealEstateIncomeRecord | null> => {
  try {
    const updated = await RealEstateIncome.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return null;
    
    return {
      _id: updated._id.toString(),
      fiscalYear: updated.fiscalYear,
      propertyId: updated.propertyId,
      propertyName: updated.propertyName,
      monthlyRent: updated.monthlyRent,
      months: updated.months,
      otherIncome: updated.otherIncome,
      totalIncome: updated.totalIncome,
      managementFee: updated.managementFee,
      repairCost: updated.repairCost,
      propertyTax: updated.propertyTax,
      loanInterest: updated.loanInterest,
      insurance: updated.insurance,
      utilities: updated.utilities,
      otherExpenses: updated.otherExpenses,
      depreciationExpense: updated.depreciationExpense,
      totalExpenses: updated.totalExpenses,
      realEstateIncome: updated.realEstateIncome,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  } catch (error) {
    console.error('Error updating real estate income record:', error);
    return null;
  }
};

/**
 * 不動産所得を削除
 */
export const deleteRealEstateIncome = async (id: string): Promise<boolean> => {
  try {
    const result = await RealEstateIncome.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error('Error deleting real estate income record:', error);
    return false;
  }
};

/**
 * 不動産所得を取得（ID指定）
 */
export const getRealEstateIncomeById = async (id: string): Promise<RealEstateIncomeRecord | null> => {
  try {
    const doc = await RealEstateIncome.findById(id);
    if (!doc) return null;
    
    return {
      _id: doc._id.toString(),
      fiscalYear: doc.fiscalYear,
      propertyId: doc.propertyId,
      propertyName: doc.propertyName,
      monthlyRent: doc.monthlyRent,
      months: doc.months,
      otherIncome: doc.otherIncome,
      totalIncome: doc.totalIncome,
      managementFee: doc.managementFee,
      repairCost: doc.repairCost,
      propertyTax: doc.propertyTax,
      loanInterest: doc.loanInterest,
      insurance: doc.insurance,
      utilities: doc.utilities,
      otherExpenses: doc.otherExpenses,
      depreciationExpense: doc.depreciationExpense,
      totalExpenses: doc.totalExpenses,
      realEstateIncome: doc.realEstateIncome,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching real estate income record:', error);
    return null;
  }
};

/**
 * 年度合計を計算
 */
export const calculateFiscalYearTotal = async (fiscalYear: number) => {
  try {
    const records = await getRealEstateIncomeByFiscalYear(fiscalYear);
    
    return {
      totalIncome: records.reduce((sum, r) => sum + r.totalIncome, 0),
      totalExpenses: records.reduce((sum, r) => sum + r.totalExpenses, 0),
      totalRealEstateIncome: records.reduce((sum, r) => sum + r.realEstateIncome, 0),
      recordCount: records.length,
    };
  } catch (error) {
    console.error('Error calculating fiscal year total:', error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      totalRealEstateIncome: 0,
      recordCount: 0,
    };
  }
};
