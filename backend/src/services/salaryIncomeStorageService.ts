import { SalaryIncomeRecord, ISalaryIncomeRecord } from '../models/SalaryIncomeRecord';
import { StoredSalaryIncomeResult } from './salaryIncomeService';

export interface SaveSalaryIncomeRecordParams {
  userId?: string;
  year: number;
  input: {
    annualSalary: number;
    withheldTax: number;
    socialInsurance: number;
    lifeInsurance?: number;
    dependents?: number;
    spouseDeduction?: boolean;
  };
  result: StoredSalaryIncomeResult;
}

export const saveSalaryIncomeRecord = async (
  params: SaveSalaryIncomeRecordParams,
  options?: { upsert?: boolean }
): Promise<ISalaryIncomeRecord> => {
  // upsertオプションがある場合は、既存レコードを上書き
  if (options?.upsert) {
    const result = await SalaryIncomeRecord.findOneAndUpdate(
      { userId: params.userId || 'demo-user', year: params.year },
      { $set: params },
      { upsert: true, new: true, runValidators: true }
    );
    return result as ISalaryIncomeRecord;
  }

  // 通常の保存
  const record = new SalaryIncomeRecord(params);
  return await record.save();
};

export const getSalaryIncomeRecords = async (filters: {
  userId?: string;
  year?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<ISalaryIncomeRecord[]> => {
  const query: any = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }

  if (filters.year) {
    query.year = filters.year;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.createdAt.$lte = filters.endDate;
    }
  }

  return await SalaryIncomeRecord.find(query).sort({ createdAt: -1 });
};

export const deleteSalaryIncomeRecord = async (id: string): Promise<void> => {
  await SalaryIncomeRecord.findByIdAndDelete(id);
};
