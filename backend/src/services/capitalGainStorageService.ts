import { CapitalGainRecord, ICapitalGainRecord } from '../models/CapitalGainRecord';
import { CapitalGainCalculation } from './capitalGainService';

export interface SaveCapitalGainRecordParams {
  userId?: string;
  propertyId: string;
  input: {
    propertyId: string;
    saleDate: Date;
    salePrice: number;
    acquisitionCost: number;
    improvementCost: number;
    sellingExpenses: number;
    ownershipPeriod: number;
  };
  result: CapitalGainCalculation;
}

export const saveCapitalGainRecord = async (
  params: SaveCapitalGainRecordParams
): Promise<ICapitalGainRecord> => {
  const record = new CapitalGainRecord(params);
  return await record.save();
};

export const getCapitalGainRecords = async (filters: {
  userId?: string;
  propertyId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<ICapitalGainRecord[]> => {
  const query: any = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }

  if (filters.propertyId) {
    query.propertyId = filters.propertyId;
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

  return await CapitalGainRecord.find(query).sort({ createdAt: -1 });
};

export const deleteCapitalGainRecord = async (id: string): Promise<void> => {
  await CapitalGainRecord.findByIdAndDelete(id);
};
