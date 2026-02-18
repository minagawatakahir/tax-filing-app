/**
 * 譲渡所得計算結果の保存サービス
 */

import { CapitalGainRecord, ICapitalGainRecord } from '../models/CapitalGainRecord';
import { CapitalGainInput, CapitalGainCalculation } from './capitalGainService';

export interface SaveCapitalGainInput {
  userId: string;
  propertyId?: string;
  input: CapitalGainInput;
  result: CapitalGainCalculation;
}

/**
 * 譲渡所得計算結果を保存
 */
export const saveCapitalGainRecord = async (
  data: SaveCapitalGainInput
): Promise<ICapitalGainRecord> => {
  const record = new CapitalGainRecord({
    userId: data.userId,
    propertyId: data.propertyId,
    input: data.input,
    result: data.result,
  });

  await record.save();
  return record;
};

/**
 * ユーザーの譲渡所得計算履歴を取得
 */
export const getCapitalGainRecords = async (
  userId: string,
  filters?: {
    propertyId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<ICapitalGainRecord[]> => {
  const query: any = { userId };

  if (filters?.propertyId) {
    query.propertyId = filters.propertyId;
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

  const records = await CapitalGainRecord.find(query).sort({ createdAt: -1 });
  return records;
};

/**
 * 譲渡所得計算履歴を削除
 */
export const deleteCapitalGainRecord = async (
  recordId: string,
  userId: string
): Promise<boolean> => {
  const result = await CapitalGainRecord.deleteOne({
    _id: recordId,
    userId,
  });

  return result.deletedCount > 0;
};

/**
 * 譲渡所得計算履歴を1件取得
 */
export const getCapitalGainRecordById = async (
  recordId: string,
  userId: string
): Promise<ICapitalGainRecord | null> => {
  const record = await CapitalGainRecord.findOne({
    _id: recordId,
    userId,
  });

  return record;
};
