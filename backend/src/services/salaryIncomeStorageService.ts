/**
 * 給与所得計算結果の保存サービス
 */

import { SalaryIncomeRecord, ISalaryIncomeRecord } from '../models/SalaryIncomeRecord';
import { SalaryIncomeInput, SalaryIncomeResult } from './salaryIncomeService';

export interface SaveSalaryIncomeInput {
  userId: string;
  year: number;
  input: SalaryIncomeInput;
  result: SalaryIncomeResult;
}

/**
 * 給与所得計算結果を保存
 */
export const saveSalaryIncomeRecord = async (
  data: SaveSalaryIncomeInput
): Promise<ISalaryIncomeRecord> => {
  const record = new SalaryIncomeRecord({
    userId: data.userId,
    year: data.year,
    input: data.input,
    result: data.result,
  });

  await record.save();
  return record;
};

/**
 * ユーザーの給与所得計算履歴を取得
 */
export const getSalaryIncomeRecords = async (
  userId: string,
  filters?: {
    year?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<ISalaryIncomeRecord[]> => {
  const query: any = { userId };

  if (filters?.year) {
    query.year = filters.year;
  }

  if (filters?.startDate || filters?.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.createdAt.$lte = filters.endDate;
    }
  }

  const records = await SalaryIncomeRecord.find(query).sort({ createdAt: -1 });
  return records;
};

/**
 * 給与所得計算履歴を削除
 */
export const deleteSalaryIncomeRecord = async (
  recordId: string,
  userId: string
): Promise<boolean> => {
  const result = await SalaryIncomeRecord.deleteOne({
    _id: recordId,
    userId,
  });

  return result.deletedCount > 0;
};

/**
 * 給与所得計算履歴を1件取得
 */
export const getSalaryIncomeRecordById = async (
  recordId: string,
  userId: string
): Promise<ISalaryIncomeRecord | null> => {
  const record = await SalaryIncomeRecord.findOne({
    _id: recordId,
    userId,
  });

  return record;
};
