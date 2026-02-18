"use strict";
/**
 * 不動産所得計算サービス (TX-20)
 * 家賃収入、経費管理、減価償却費を統合して不動産所得を計算
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRealEstateIncomePortfolio = exports.calculateRealEstateIncome = exports.calculateTotalExpenses = exports.calculateRentalIncome = void 0;
const depreciationService_1 = require("./depreciationService");
/**
 * 家賃収入を計算
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
        expenses.propertyTax +
        expenses.loanInterest +
        expenses.insurance +
        expenses.utilities +
        expenses.otherExpenses);
};
exports.calculateTotalExpenses = calculateTotalExpenses;
/**
 * 不動産所得を計算
 */
const calculateRealEstateIncome = (income, expenses, depreciationAsset) => {
    // 収入計算
    const totalRentalIncome = (0, exports.calculateRentalIncome)(income.monthlyRent, income.months, income.otherIncome);
    const totalIncome = totalRentalIncome;
    // 経費計算
    const operatingExpenses = expenses.managementFee +
        expenses.repairCost +
        expenses.insurance +
        expenses.utilities +
        expenses.otherExpenses;
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
            depreciationExpense = currentYearSchedule.annualDepreciation;
        }
    }
    // 総経費
    const totalExpenses = operatingExpenses +
        expenses.propertyTax +
        expenses.loanInterest +
        depreciationExpense;
    // 不動産所得
    const realEstateIncome = totalIncome - totalExpenses;
    return {
        propertyId: income.propertyId,
        year: income.year,
        totalRentalIncome,
        otherIncome: income.otherIncome,
        totalIncome,
        operatingExpenses,
        propertyTax: expenses.propertyTax,
        loanInterest: expenses.loanInterest,
        depreciationExpense,
        totalExpenses,
        realEstateIncome,
        expenseBreakdown: {
            managementFee: expenses.managementFee,
            repairCost: expenses.repairCost,
            insurance: expenses.insurance,
            utilities: expenses.utilities,
            otherExpenses: expenses.otherExpenses,
            depreciationExpense,
            propertyTax: expenses.propertyTax,
            loanInterest: expenses.loanInterest,
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
