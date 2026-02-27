"use strict";
/**
 * 不動産所得データストレージサービス
 * MongoDB対応版
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFiscalYearTotal = exports.getRealEstateIncomeById = exports.deleteRealEstateIncome = exports.updateRealEstateIncome = exports.saveRealEstateIncome = exports.getRealEstateIncomeByFiscalYear = void 0;
const RealEstateIncome_1 = require("../models/RealEstateIncome");
/**
 * 年度別に不動産所得一覧を取得
 * TX-36との連携: 売却済み物件を自動的に除外
 */
const getRealEstateIncomeByFiscalYear = async (fiscalYear) => {
    try {
        const Property = require('../models/Property').default;
        // 指定年度の不動産所得データを取得
        const records = await RealEstateIncome_1.RealEstateIncome.find({ fiscalYear }).sort({ createdAt: -1 });
        // TX-36: 売却済み物件を除外するロジック
        const filteredRecords = await Promise.all(records.map(async (doc) => {
            const property = await Property.findOne({ propertyId: doc.propertyId });
            // 売却済み物件の場合、売却日以降の期間は除外
            if (property && property.saleStatus === 'sold' && property.saleDate) {
                const saleDate = new Date(property.saleDate);
                const saleMonth = saleDate.getMonth() + 1; // 1-12
                // 売却日以降の月は計上対象外
                if (saleMonth < 12) {
                    // 売却月までのデータのみを計上
                    const adjustedMonths = Math.min(doc.months || 12, saleMonth);
                    return {
                        ...doc,
                        months: adjustedMonths,
                        monthlyRent: doc.monthlyRent,
                        totalIncome: (doc.monthlyRent * adjustedMonths) + (doc.otherIncome || 0),
                        realEstateIncome: ((doc.monthlyRent * adjustedMonths) + (doc.otherIncome || 0)) - (doc.totalExpenses || 0),
                    };
                }
            }
            return doc;
        }));
        return filteredRecords.map(doc => ({
            _id: doc._id.toString(),
            fiscalYear: doc.fiscalYear,
            propertyId: doc.propertyId,
            propertyName: doc.propertyName,
            monthlyRent: doc.monthlyRent,
            months: doc.months,
            otherIncome: doc.otherIncome,
            totalIncome: doc.totalIncome,
            managementFee: doc.managementFee,
            repairCost: doc.repairCost,
            propertyTax: doc.propertyTax,
            loanInterest: doc.loanInterest,
            insurance: doc.insurance,
            utilities: doc.utilities,
            otherExpenses: doc.otherExpenses,
            depreciationExpense: doc.depreciationExpense,
            totalExpenses: doc.totalExpenses,
            realEstateIncome: doc.realEstateIncome,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }));
    }
    catch (error) {
        console.error('Error fetching real estate income records:', error);
        return [];
    }
};
exports.getRealEstateIncomeByFiscalYear = getRealEstateIncomeByFiscalYear;
/**
 * 不動産所得を新規保存
 */
const saveRealEstateIncome = async (data) => {
    try {
        const newRecord = new RealEstateIncome_1.RealEstateIncome({
            userId: 'demo-user',
            ...data,
        });
        const savedDoc = await newRecord.save();
        return {
            _id: savedDoc._id.toString(),
            fiscalYear: savedDoc.fiscalYear,
            propertyId: savedDoc.propertyId,
            propertyName: savedDoc.propertyName,
            monthlyRent: savedDoc.monthlyRent,
            months: savedDoc.months,
            otherIncome: savedDoc.otherIncome,
            totalIncome: savedDoc.totalIncome,
            managementFee: savedDoc.managementFee,
            repairCost: savedDoc.repairCost,
            propertyTax: savedDoc.propertyTax,
            loanInterest: savedDoc.loanInterest,
            insurance: savedDoc.insurance,
            utilities: savedDoc.utilities,
            otherExpenses: savedDoc.otherExpenses,
            depreciationExpense: savedDoc.depreciationExpense,
            totalExpenses: savedDoc.totalExpenses,
            realEstateIncome: savedDoc.realEstateIncome,
            createdAt: savedDoc.createdAt,
            updatedAt: savedDoc.updatedAt,
        };
    }
    catch (error) {
        console.error('Error saving real estate income record:', error);
        throw error;
    }
};
exports.saveRealEstateIncome = saveRealEstateIncome;
/**
 * 不動産所得を更新
 */
const updateRealEstateIncome = async (id, data) => {
    try {
        const updated = await RealEstateIncome_1.RealEstateIncome.findByIdAndUpdate(id, data, { new: true });
        if (!updated)
            return null;
        return {
            _id: updated._id.toString(),
            fiscalYear: updated.fiscalYear,
            propertyId: updated.propertyId,
            propertyName: updated.propertyName,
            monthlyRent: updated.monthlyRent,
            months: updated.months,
            otherIncome: updated.otherIncome,
            totalIncome: updated.totalIncome,
            managementFee: updated.managementFee,
            repairCost: updated.repairCost,
            propertyTax: updated.propertyTax,
            loanInterest: updated.loanInterest,
            insurance: updated.insurance,
            utilities: updated.utilities,
            otherExpenses: updated.otherExpenses,
            depreciationExpense: updated.depreciationExpense,
            totalExpenses: updated.totalExpenses,
            realEstateIncome: updated.realEstateIncome,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
    }
    catch (error) {
        console.error('Error updating real estate income record:', error);
        return null;
    }
};
exports.updateRealEstateIncome = updateRealEstateIncome;
/**
 * 不動産所得を削除
 */
const deleteRealEstateIncome = async (id) => {
    try {
        const result = await RealEstateIncome_1.RealEstateIncome.findByIdAndDelete(id);
        return !!result;
    }
    catch (error) {
        console.error('Error deleting real estate income record:', error);
        return false;
    }
};
exports.deleteRealEstateIncome = deleteRealEstateIncome;
/**
 * 不動産所得を取得（ID指定）
 */
const getRealEstateIncomeById = async (id) => {
    try {
        const doc = await RealEstateIncome_1.RealEstateIncome.findById(id);
        if (!doc)
            return null;
        return {
            _id: doc._id.toString(),
            fiscalYear: doc.fiscalYear,
            propertyId: doc.propertyId,
            propertyName: doc.propertyName,
            monthlyRent: doc.monthlyRent,
            months: doc.months,
            otherIncome: doc.otherIncome,
            totalIncome: doc.totalIncome,
            managementFee: doc.managementFee,
            repairCost: doc.repairCost,
            propertyTax: doc.propertyTax,
            loanInterest: doc.loanInterest,
            insurance: doc.insurance,
            utilities: doc.utilities,
            otherExpenses: doc.otherExpenses,
            depreciationExpense: doc.depreciationExpense,
            totalExpenses: doc.totalExpenses,
            realEstateIncome: doc.realEstateIncome,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
    catch (error) {
        console.error('Error fetching real estate income record:', error);
        return null;
    }
};
exports.getRealEstateIncomeById = getRealEstateIncomeById;
/**
 * 年度合計を計算
 */
const calculateFiscalYearTotal = async (fiscalYear) => {
    try {
        const records = await (0, exports.getRealEstateIncomeByFiscalYear)(fiscalYear);
        return {
            totalIncome: records.reduce((sum, r) => sum + r.totalIncome, 0),
            totalExpenses: records.reduce((sum, r) => sum + r.totalExpenses, 0),
            totalRealEstateIncome: records.reduce((sum, r) => sum + r.realEstateIncome, 0),
            recordCount: records.length,
        };
    }
    catch (error) {
        console.error('Error calculating fiscal year total:', error);
        return {
            totalIncome: 0,
            totalExpenses: 0,
            totalRealEstateIncome: 0,
            recordCount: 0,
        };
    }
};
exports.calculateFiscalYearTotal = calculateFiscalYearTotal;
