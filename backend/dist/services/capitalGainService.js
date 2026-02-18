"use strict";
/**
 * 譲渡所得計算サービス
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCapitalGain = void 0;
/**
 * 所有期間を計算（年と月）
 */
const calculateOwnershipPeriod = (acquisitionDate, saleDate) => {
    let years = saleDate.getFullYear() - acquisitionDate.getFullYear();
    let months = saleDate.getMonth() - acquisitionDate.getMonth();
    if (months < 0) {
        years--;
        months += 12;
    }
    return { years, months };
};
/**
 * 譲渡所得を計算
 */
const calculateCapitalGain = (input) => {
    const acquisitionDate = new Date(input.acquisitionDate);
    const saleDate = new Date(input.saleDate);
    // 所有期間計算
    const ownershipPeriod = calculateOwnershipPeriod(acquisitionDate, saleDate);
    const isSaleYearEnd = saleDate.getFullYear();
    const acquisitionYearEnd = acquisitionDate.getFullYear();
    // 長期/短期判定：売却年の1月1日時点で取得後5年超
    const transferType = isSaleYearEnd - acquisitionYearEnd > 5 ? 'long-term' : 'short-term';
    // 転売費用
    const transferExpenses = input.brokerageFee +
        input.surveyCost +
        input.registrationCost +
        input.otherExpenses;
    // 譲渡所得 = 売却価格 - (取得費 + 転売費用)
    const capitalGain = input.salePrice - (input.acquisitionCost + input.acquisitionExpenses + transferExpenses);
    // 特別控除後の課税譲渡所得
    const taxableCapitalGain = Math.max(0, capitalGain - input.specialDeduction);
    // 税率
    const taxRate = transferType === 'long-term' ? 0.20315 : 0.3963;
    // 所得税、住民税、復興特別所得税を計算
    const incomeTax = transferType === 'long-term'
        ? taxableCapitalGain * 0.15
        : taxableCapitalGain * 0.30;
    const residentTax = transferType === 'long-term'
        ? taxableCapitalGain * 0.05
        : taxableCapitalGain * 0.09;
    const reconstructionTax = transferType === 'long-term'
        ? taxableCapitalGain * 0.15 * 0.0021
        : taxableCapitalGain * 0.30 * 0.0021;
    const totalTax = incomeTax + residentTax + reconstructionTax;
    return {
        saleAmount: input.salePrice,
        acquisitionCost: input.acquisitionCost + input.acquisitionExpenses,
        transferExpenses,
        capitalGain,
        specialDeduction: input.specialDeduction,
        taxableCapitalGain,
        ownershipPeriod,
        transferType,
        taxRate,
        incomeTax: Math.round(incomeTax),
        residentTax: Math.round(residentTax),
        reconstructionTax: Math.round(reconstructionTax),
        totalTax: Math.round(totalTax),
    };
};
exports.calculateCapitalGain = calculateCapitalGain;
