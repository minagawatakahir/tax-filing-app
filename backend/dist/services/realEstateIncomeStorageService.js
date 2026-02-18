"use strict";
/**
 * 不動産所得データストレージサービス
 * メモリベースのデータ管理（本番環境ではMongoDBに変更）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFiscalYearTotal = exports.getRealEstateIncomeById = exports.deleteRealEstateIncome = exports.updateRealEstateIncome = exports.saveRealEstateIncome = exports.getRealEstateIncomeByFiscalYear = void 0;
// メモリベースのストレージ
const realEstateIncomeData = new Map();
let idCounter = 1;
/**
 * 年度別に不動産所得一覧を取得
 */
const getRealEstateIncomeByFiscalYear = (fiscalYear) => {
    const records = Array.from(realEstateIncomeData.values());
    return records.filter(r => r.fiscalYear === fiscalYear);
};
exports.getRealEstateIncomeByFiscalYear = getRealEstateIncomeByFiscalYear;
/**
 * 不動産所得を新規保存
 */
const saveRealEstateIncome = (data) => {
    const id = `income-${idCounter++}`;
    const now = new Date();
    const record = {
        ...data,
        _id: id,
        createdAt: now,
        updatedAt: now,
    };
    realEstateIncomeData.set(id, record);
    return record;
};
exports.saveRealEstateIncome = saveRealEstateIncome;
/**
 * 不動産所得を更新
 */
const updateRealEstateIncome = (id, data) => {
    const existing = realEstateIncomeData.get(id);
    if (!existing)
        return null;
    const updated = {
        ...existing,
        ...data,
        _id: existing._id, // IDは変更しない
        createdAt: existing.createdAt, // 作成日時は変更しない
        updatedAt: new Date(),
    };
    realEstateIncomeData.set(id, updated);
    return updated;
};
exports.updateRealEstateIncome = updateRealEstateIncome;
/**
 * 不動産所得を削除
 */
const deleteRealEstateIncome = (id) => {
    return realEstateIncomeData.delete(id);
};
exports.deleteRealEstateIncome = deleteRealEstateIncome;
/**
 * 不動産所得を取得（ID指定）
 */
const getRealEstateIncomeById = (id) => {
    return realEstateIncomeData.get(id) || null;
};
exports.getRealEstateIncomeById = getRealEstateIncomeById;
/**
 * 年度合計を計算
 */
const calculateFiscalYearTotal = (fiscalYear) => {
    const records = (0, exports.getRealEstateIncomeByFiscalYear)(fiscalYear);
    return {
        totalIncome: records.reduce((sum, r) => sum + r.totalIncome, 0),
        totalExpenses: records.reduce((sum, r) => sum + r.totalExpenses, 0),
        totalRealEstateIncome: records.reduce((sum, r) => sum + r.realEstateIncome, 0),
        recordCount: records.length,
    };
};
exports.calculateFiscalYearTotal = calculateFiscalYearTotal;
