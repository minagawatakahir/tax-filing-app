"use strict";
/**
 * TX-32: 複数年払い経費の按分計算ヘルパー関数
 * 火災・地震保険、ローン保証料などの複数年払い費用を年度別に按分計算
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTotalMultiYearExpenseForYear = exports.generateMultiYearExpenseSchedule = exports.calculateRenovationExpenseForYear = exports.calculateAnnualExpenseFromMultiYearPayment = void 0;
/**
 * 複数年払いの保険料・保証料を年度別に按分計算
 *
 * @param totalAmount - 支払総額
 * @param coveragePeriodYears - カバー期間（年数）
 * @param startDate - 開始日
 * @param targetYear - 計算対象年度
 * @returns その年度に計上すべき経費額
 */
const calculateAnnualExpenseFromMultiYearPayment = (totalAmount, coveragePeriodYears, startDate, targetYear) => {
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1; // 1-12
    const endYear = startYear + coveragePeriodYears - 1;
    // 年間当たりの基本額
    const annualAmount = totalAmount / coveragePeriodYears;
    // 対象年度が期間外の場合
    if (targetYear < startYear || targetYear > endYear) {
        return 0;
    }
    // 初年度（取得年）
    if (targetYear === startYear) {
        // 取得月から12月までの月数
        const monthsInFirstYear = 13 - startMonth;
        return Math.round(annualAmount * monthsInFirstYear / 12);
    }
    // 最終年度
    if (targetYear === endYear) {
        // 1月から取得月の前月までの月数
        const monthsInLastYear = startMonth - 1;
        return Math.round(annualAmount * monthsInLastYear / 12);
    }
    // 中間年度（取得月～翌年の取得月の前月）
    return Math.round(annualAmount);
};
exports.calculateAnnualExpenseFromMultiYearPayment = calculateAnnualExpenseFromMultiYearPayment;
/**
 * リフォーム費用を年度別に集計
 *
 * @param renovationExpenses - リフォーム費用配列
 * @param targetYear - 計算対象年度
 * @returns その年度のリフォーム費用合計
 */
const calculateRenovationExpenseForYear = (renovationExpenses, targetYear) => {
    if (!renovationExpenses || renovationExpenses.length === 0) {
        return 0;
    }
    return renovationExpenses
        .filter(expense => expense.date.getFullYear() === targetYear)
        .reduce((sum, expense) => sum + expense.amount, 0);
};
exports.calculateRenovationExpenseForYear = calculateRenovationExpenseForYear;
const generateMultiYearExpenseSchedule = (totalAmount, coveragePeriodYears, startDate) => {
    const schedule = [];
    const startYear = startDate.getFullYear();
    const endYear = startYear + coveragePeriodYears - 1;
    for (let year = startYear; year <= endYear; year++) {
        const expenseAmount = (0, exports.calculateAnnualExpenseFromMultiYearPayment)(totalAmount, coveragePeriodYears, startDate, year);
        let description = '';
        if (year === startYear) {
            description = `初年度（${startDate.getMonth() + 1}月～12月）`;
        }
        else if (year === endYear) {
            description = `最終年度（1月～${startDate.getMonth()}月）`;
        }
        else {
            description = `${year}年度`;
        }
        schedule.push({
            year,
            expenseAmount,
            description,
        });
    }
    return schedule;
};
exports.generateMultiYearExpenseSchedule = generateMultiYearExpenseSchedule;
const calculateTotalMultiYearExpenseForYear = (expenses, targetYear) => {
    const breakdown = {};
    let total = 0;
    for (const expense of expenses) {
        const amount = (0, exports.calculateAnnualExpenseFromMultiYearPayment)(expense.totalAmount, expense.coveragePeriodYears, expense.startDate, targetYear);
        if (amount > 0) {
            breakdown[expense.name] = amount;
            total += amount;
        }
    }
    return {
        total,
        breakdown,
    };
};
exports.calculateTotalMultiYearExpenseForYear = calculateTotalMultiYearExpenseForYear;
