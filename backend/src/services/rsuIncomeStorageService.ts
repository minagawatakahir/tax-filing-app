import { RSUIncomeRecord, IRSUIncomeRecord } from '../models/RSUIncomeRecord';

/**
 * RSU所得の保存・取得サービス
 */

/**
 * RSU所得計算結果を保存
 */
export const saveRSUIncomeRecord = async (
  userId: string,
  year: number,
  input: Array<{
    companyName: string;
    grantDate: Date;
    vestingDate: Date;
    shares: number;
    pricePerShareUSD: number;
    ttmRate?: number;
  }>,
  result: Array<{
    companyName: string;
    vestingDate: Date;
    shares: number;
    pricePerShareUSD: number;
    ttmRate: number;
    totalValueJPY: number;
    taxableIncome: number;
  }>,
  totalRSUIncome: number
): Promise<IRSUIncomeRecord> => {
  // 既存のレコードがあれば更新、なければ新規作成
  const existingRecord = await RSUIncomeRecord.findOne({ userId, year });

  if (existingRecord) {
    // 更新
    existingRecord.input = input;
    existingRecord.result = result;
    existingRecord.totalRSUIncome = totalRSUIncome;
    return await existingRecord.save();
  } else {
    // 新規作成
    const record = new RSUIncomeRecord({
      userId,
      year,
      input,
      result,
      totalRSUIncome,
    });
    return await record.save();
  }
};

/**
 * 年度別RSU所得記録を取得
 */
export const getRSUIncomeRecords = async (
  userId: string,
  year?: number
): Promise<IRSUIncomeRecord[]> => {
  const query: any = { userId };
  
  if (year) {
    query.year = year;
  }

  return await RSUIncomeRecord.find(query).sort({ year: -1, createdAt: -1 });
};

/**
 * RSU所得記録を1件取得
 */
export const getRSUIncomeRecordById = async (
  recordId: string
): Promise<IRSUIncomeRecord | null> => {
  return await RSUIncomeRecord.findById(recordId);
};

/**
 * RSU所得記録を削除
 */
export const deleteRSUIncomeRecord = async (
  recordId: string
): Promise<boolean> => {
  const result = await RSUIncomeRecord.findByIdAndDelete(recordId);
  return result !== null;
};

/**
 * RSU所得記録を更新
 */
export const updateRSUIncomeRecord = async (
  recordId: string,
  updateData: Partial<{
    input: Array<any>;
    result: Array<any>;
    totalRSUIncome: number;
  }>
): Promise<IRSUIncomeRecord | null> => {
  return await RSUIncomeRecord.findByIdAndUpdate(
    recordId,
    updateData,
    { new: true }
  );
};

/**
 * 年度別の合計RSU所得を取得
 */
export const getTotalRSUIncomeByYear = async (
  userId: string,
  year: number
): Promise<number> => {
  const records = await RSUIncomeRecord.find({ userId, year });
  return records.reduce((sum, record) => sum + record.totalRSUIncome, 0);
};
