"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalRSUIncomeByYear = exports.updateRSUIncomeRecord = exports.deleteRSUIncomeRecord = exports.getRSUIncomeRecordById = exports.getRSUIncomeRecords = exports.saveRSUIncomeRecord = void 0;
const RSUIncomeRecord_1 = require("../models/RSUIncomeRecord");
/**
 * RSU所得の保存・取得サービス
 */
/**
 * RSU所得計算結果を保存
 */
const saveRSUIncomeRecord = async (userId, year, input, result, totalRSUIncome) => {
    // 既存のレコードがあれば更新、なければ新規作成
    const existingRecord = await RSUIncomeRecord_1.RSUIncomeRecord.findOne({ userId, year });
    if (existingRecord) {
        // 更新
        existingRecord.input = input;
        existingRecord.result = result;
        existingRecord.totalRSUIncome = totalRSUIncome;
        return await existingRecord.save();
    }
    else {
        // 新規作成
        const record = new RSUIncomeRecord_1.RSUIncomeRecord({
            userId,
            year,
            input,
            result,
            totalRSUIncome,
        });
        return await record.save();
    }
};
exports.saveRSUIncomeRecord = saveRSUIncomeRecord;
/**
 * 年度別RSU所得記録を取得
 */
const getRSUIncomeRecords = async (userId, year) => {
    const query = { userId };
    if (year) {
        query.year = year;
    }
    return await RSUIncomeRecord_1.RSUIncomeRecord.find(query).sort({ year: -1, createdAt: -1 });
};
exports.getRSUIncomeRecords = getRSUIncomeRecords;
/**
 * RSU所得記録を1件取得
 */
const getRSUIncomeRecordById = async (recordId) => {
    return await RSUIncomeRecord_1.RSUIncomeRecord.findById(recordId);
};
exports.getRSUIncomeRecordById = getRSUIncomeRecordById;
/**
 * RSU所得記録を削除
 */
const deleteRSUIncomeRecord = async (recordId) => {
    const result = await RSUIncomeRecord_1.RSUIncomeRecord.findByIdAndDelete(recordId);
    return result !== null;
};
exports.deleteRSUIncomeRecord = deleteRSUIncomeRecord;
/**
 * RSU所得記録を更新
 */
const updateRSUIncomeRecord = async (recordId, updateData) => {
    return await RSUIncomeRecord_1.RSUIncomeRecord.findByIdAndUpdate(recordId, updateData, { new: true });
};
exports.updateRSUIncomeRecord = updateRSUIncomeRecord;
/**
 * 年度別の合計RSU所得を取得
 */
const getTotalRSUIncomeByYear = async (userId, year) => {
    const records = await RSUIncomeRecord_1.RSUIncomeRecord.find({ userId, year });
    return records.reduce((sum, record) => sum + record.totalRSUIncome, 0);
};
exports.getTotalRSUIncomeByYear = getTotalRSUIncomeByYear;
