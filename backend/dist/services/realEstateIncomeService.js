"use strict";
/**
 * 不動産所得計算サービス (TX-20 & TX-29)
 * 家賃収入、経費管理、減価償却費を統合して不動産所得を計算
 * TX-29: 取得関連費用（不動産取得税）を取得年度に計上
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRealEstateIncomePortfolio = exports.calculateRealEstateIncome = exports.calculateTotalExpenses = exports.calculateRentalIncome = exports.calculateProportionalAmount = void 0;
const depreciationService_1 = require("./depreciationService");
const Property_1 = __importDefault(require("../models/Property"));
/**
 * 月別按分計算（TX-33対応）
 * @param annualAmount - 年間金額
 * @param endMonth - 終了月（1-12、未指定 or 12 = 全年度）
 * @returns 按分計算後の金額
 */
const calculateProportionalAmount = (annualAmount, endMonth) => {
    if (!endMonth || endMonth >= 12) {
        return annualAmount;
    }
    if (endMonth < 1 || endMonth > 12) {
        throw new Error('終了月は1-12の範囲で指定してください');
    }
    return Math.round(annualAmount * endMonth / 12);
};
exports.calculateProportionalAmount = calculateProportionalAmount;
/**
 * 家賃収入を計算（TX-33対応）
 */
const calculateRentalIncome = (monthlyRent, months, otherIncome = 0) => {
    return monthlyRent * months + otherIncome;
};
exports.calculateRentalIncome = calculateRentalIncome;
/**
 * 経費合計を計算
 */
const calculateTotalExpenses = (expenses) => {
    return (expenses.managementFee +
        expenses.repairCost +
        expenses.insurance +
        expenses.utilities +
        expenses.otherExpenses +
        expenses.propertyTax +
        expenses.loanInterest);
};
exports.calculateTotalExpenses = calculateTotalExpenses;
/**
 * 不動産所得を計算（TX-29: 取得年度に不動産取得税を計上）
 */
const calculateRealEstateIncome = async (income, expenses, depreciationAsset) => {
    // TX-29: propertyId から物件情報を取得（取得年度の判定）
    let isAcquisitionYear = false;
    let acquisitionTaxAmount = 0;
    if (expenses.propertyId && expenses.acquisitionTax !== undefined) {
        try {
            const property = await Property_1.default.findOne({ propertyId: expenses.propertyId });
            if (property) {
                // 取得年度かどうかを判定
                const acquisitionYear = property.acquisitionDate.getFullYear();
                isAcquisitionYear = (acquisitionYear === expenses.year);
                // 取得年度の場合のみ不動産取得税を計上
                if (isAcquisitionYear) {
                    acquisitionTaxAmount = expenses.acquisitionTax || 0;
                }
            }
        }
        catch (error) {
            console.warn(`Property lookup failed for ${expenses.propertyId}:`, error);
            // エラーが発生した場合は入力値を信頼する
            isAcquisitionYear = expenses.acquisitionTax ? true : false;
            acquisitionTaxAmount = isAcquisitionYear ? (expenses.acquisitionTax || 0) : 0;
        }
    }
    else {
        // propertyId がない場合は、acquisitionTax があれば計上
        acquisitionTaxAmount = expenses.acquisitionTax || 0;
    }
    // TX-33: 月別按分計算
    const rentalMonths = income.rentalEndMonth || 12;
    const totalRentalIncome = (0, exports.calculateRentalIncome)(income.monthlyRent, rentalMonths, income.otherIncome);
    const totalIncome = totalRentalIncome;
    // 経費計算（TX-33対応で按分）
    const expenseEndMonth = expenses.expenseEndMonth || 12;
    const operatingExpenses = (0, exports.calculateProportionalAmount)(expenses.managementFee +
        expenses.repairCost +
        expenses.insurance +
        expenses.utilities +
        expenses.otherExpenses, expenseEndMonth);
    const propertyTaxExpense = (0, exports.calculateProportionalAmount)(expenses.propertyTax, expenseEndMonth);
    const loanInterestExpense = (0, exports.calculateProportionalAmount)(expenses.loanInterest, expenseEndMonth);
    // 減価償却費の計算
    let depreciationExpense = 0;
    if (depreciationAsset) {
        // 日付を確実にDateオブジェクトに変換
        const asset = {
            ...depreciationAsset,
            acquisitionDate: new Date(depreciationAsset.acquisitionDate),
        };
        const schedule = (0, depreciationService_1.generateDepreciationSchedule)(asset);
        const currentYear = income.year; // 指定された年度を使用
        const currentYearSchedule = schedule.find(s => s.year === currentYear);
        if (currentYearSchedule) {
            // TX-33対応: 減価償却費も按分
            depreciationExpense = (0, exports.calculateProportionalAmount)(currentYearSchedule.annualDepreciation, expenseEndMonth);
        }
    }
    // 総経費（TX-29: 不動産取得税を追加）
    const totalExpenses = operatingExpenses +
        propertyTaxExpense +
        loanInterestExpense +
        depreciationExpense +
        acquisitionTaxAmount;
    // 不動産所得
    const realEstateIncome = totalIncome - totalExpenses;
    return {
        propertyId: income.propertyId,
        year: income.year,
        totalRentalIncome,
        otherIncome: income.otherIncome,
        totalIncome,
        operatingExpenses,
        propertyTax: propertyTaxExpense,
        loanInterest: loanInterestExpense,
        depreciationExpense,
        acquisitionTaxExpense: acquisitionTaxAmount, // TX-29: 追加
        totalExpenses,
        realEstateIncome,
        expenseBreakdown: {
            managementFee: expenses.managementFee,
            repairCost: expenses.repairCost,
            insurance: expenses.insurance,
            utilities: expenses.utilities,
            otherExpenses: expenses.otherExpenses,
            depreciationExpense,
            propertyTax: propertyTaxExpense,
            loanInterest: loanInterestExpense,
            acquisitionTax: acquisitionTaxAmount, // TX-29: 追加
        },
    };
};
exports.calculateRealEstateIncome = calculateRealEstateIncome;
/**
 * 複数物件の不動産所得を計算
 */
const calculateRealEstateIncomePortfolio = (year, calculations) => {
    const totalIncome = calculations.reduce((sum, c) => sum + c.totalIncome, 0);
    const totalExpenses = calculations.reduce((sum, c) => sum + c.totalExpenses, 0);
    const totalRealEstateIncome = calculations.reduce((sum, c) => sum + c.realEstateIncome, 0);
    const positiveIncomeCount = calculations.filter(c => c.realEstateIncome > 0).length;
    const negativeIncomeCount = calculations.filter(c => c.realEstateIncome < 0).length;
    return {
        year,
        properties: calculations,
        totalIncome,
        totalExpenses,
        totalRealEstateIncome,
        propertyCount: calculations.length,
        positiveIncomeCount,
        negativeIncomeCount,
    };
};
exports.calculateRealEstateIncomePortfolio = calculateRealEstateIncomePortfolio;
