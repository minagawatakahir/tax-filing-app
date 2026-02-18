/**
 * 不動産所得データストレージサービス
 * メモリベースのデータ管理（本番環境ではMongoDBに変更）
 */

import { RealEstateIncomeRecord } from '../models/RealEstateIncome';

// メモリベースのストレージ
const realEstateIncomeData = new Map<string, RealEstateIncomeRecord>();
let idCounter = 1;

/**
 * 年度別に不動産所得一覧を取得
 */
export const getRealEstateIncomeByFiscalYear = (fiscalYear: number): RealEstateIncomeRecord[] => {
  const records = Array.from(realEstateIncomeData.values());
  return records.filter(r => r.fiscalYear === fiscalYear);
};

/**
 * 不動産所得を新規保存
 */
export const saveRealEstateIncome = (data: Omit<RealEstateIncomeRecord, '_id' | 'createdAt' | 'updatedAt'>): RealEstateIncomeRecord => {
  const id = `income-${idCounter++}`;
  const now = new Date();
  
  const record: RealEstateIncomeRecord = {
    ...data,
    _id: id,
    createdAt: now,
    updatedAt: now,
  };
  
  realEstateIncomeData.set(id, record);
  return record;
};

/**
 * 不動産所得を更新
 */
export const updateRealEstateIncome = (id: string, data: Partial<RealEstateIncomeRecord>): RealEstateIncomeRecord | null => {
  const existing = realEstateIncomeData.get(id);
  if (!existing) return null;
  
  const updated: RealEstateIncomeRecord = {
    ...existing,
    ...data,
    _id: existing._id, // IDは変更しない
    createdAt: existing.createdAt, // 作成日時は変更しない
    updatedAt: new Date(),
  };
  
  realEstateIncomeData.set(id, updated);
  return updated;
};

/**
 * 不動産所得を削除
 */
export const deleteRealEstateIncome = (id: string): boolean => {
  return realEstateIncomeData.delete(id);
};

/**
 * 不動産所得を取得（ID指定）
 */
export const getRealEstateIncomeById = (id: string): RealEstateIncomeRecord | null => {
  return realEstateIncomeData.get(id) || null;
};

/**
 * 年度合計を計算
 */
export const calculateFiscalYearTotal = (fiscalYear: number) => {
  const records = getRealEstateIncomeByFiscalYear(fiscalYear);
  
  return {
    totalIncome: records.reduce((sum, r) => sum + r.totalIncome, 0),
    totalExpenses: records.reduce((sum, r) => sum + r.totalExpenses, 0),
    totalRealEstateIncome: records.reduce((sum, r) => sum + r.realEstateIncome, 0),
    recordCount: records.length,
  };
};
