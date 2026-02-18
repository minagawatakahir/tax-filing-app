"use strict";
/**
 * 譲渡所得データストレージサービス
 * メモリベースのデータ管理（本番環境ではMongoDBに変更）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFiscalYearTotal = exports.getCapitalGainById = exports.deleteCapitalGain = exports.updateCapitalGain = exports.saveCapitalGain = exports.getCapitalGainByFiscalYear = void 0;
// メモリベースのストレージ
const capitalGainData = new Map();
let idCounter = 1;
/**
 * 年度別に譲渡所得一覧を取得
 */
const getCapitalGainByFiscalYear = (fiscalYear) => {
    const records = Array.from(capitalGainData.values());
    return records.filter(r => r.fiscalYear === fiscalYear);
};
exports.getCapitalGainByFiscalYear = getCapitalGainByFiscalYear;
/**
 * 譲渡所得を新規保存
 */
const saveCapitalGain = (data) => {
    const id = `capital-${idCounter++}`;
    const now = new Date();
    const record = {
        ...data,
        _id: id,
        createdAt: now,
        updatedAt: now,
    };
    capitalGainData.set(id, record);
    return record;
};
exports.saveCapitalGain = saveCapitalGain;
/**
 * 譲渡所得を更新
 */
const updateCapitalGain = (id, data) => {
    const existing = capitalGainData.get(id);
    if (!existing)
        return null;
    const updated = {
        ...existing,
        ...data,
        _id: existing._id,
        createdAt: existing.createdAt,
        updatedAt: new Date(),
    };
    capitalGainData.set(id, updated);
    return updated;
};
exports.updateCapitalGain = updateCapitalGain;
/**
 * 譲渡所得を削除
 */
const deleteCapitalGain = (id) => {
    return capitalGainData.delete(id);
};
exports.deleteCapitalGain = deleteCapitalGain;
/**
 * 譲渡所得を取得（ID指定）
 */
const getCapitalGainById = (id) => {
    return capitalGainData.get(id) || null;
};
exports.getCapitalGainById = getCapitalGainById;
/**
 * 年度合計を計算
 */
const calculateFiscalYearTotal = (fiscalYear) => {
    const records = (0, exports.getCapitalGainByFiscalYear)(fiscalYear);
    const longTermRecords = records.filter(r => r.transferType === 'long');
    const shortTermRecords = records.filter(r => r.transferType === 'short');
    return {
        totalTransferIncome: records.reduce((sum, r) => sum + r.transferIncome, 0),
        totalTaxableIncome: records.reduce((sum, r) => sum + r.taxableTransferIncome, 0),
        totalTax: records.reduce((sum, r) => sum + r.totalTax, 0),
        recordCount: records.length,
        longTermCount: longTermRecords.length,
        shortTermCount: shortTermRecords.length,
        longTermIncome: longTermRecords.reduce((sum, r) => sum + r.taxableTransferIncome, 0),
        shortTermIncome: shortTermRecords.reduce((sum, r) => sum + r.taxableTransferIncome, 0),
    };
};
exports.calculateFiscalYearTotal = calculateFiscalYearTotal;
