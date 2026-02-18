import { SalaryIncomeRecord, ISalaryIncomeRecord } from '../models/SalaryIncomeRecord';
import { SalaryIncomeResult } from './salaryIncomeService';

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
  result: SalaryIncomeResult;
}

export const saveSalaryIncomeRecord = async (
  params: SaveSalaryIncomeRecordParams
): Promise<ISalaryIncomeRecord> => {
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
