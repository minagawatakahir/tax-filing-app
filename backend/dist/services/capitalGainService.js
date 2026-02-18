"use strict";
/**
 * 譲渡所得計算サービス
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCapitalGain = void 0;
const Property_1 = __importDefault(require("../models/Property"));
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
 * 譲渡所得を計算（TX-30: Property モデルから取得関連費用を取得）
 */
const calculateCapitalGain = async (input) => {
    // TX-30: propertyId から物件情報を取得
    let property = null;
    let acquisitionDate;
    let baseCost;
    let acquisitionTaxAmount = 0;
    let registrationTaxAmount = 0;
    let brokerFeeAmount = 0;
    let otherCostsAmount = 0;
    if (input.propertyId) {
        try {
            property = await Property_1.default.findOne({ propertyId: input.propertyId });
            if (property) {
                acquisitionDate = property.acquisitionDate;
                baseCost = property.acquisitionCost;
                // TX-30: 取得関連費用を取得
                acquisitionTaxAmount = property.acquisitionTax || 0;
                registrationTaxAmount = property.registrationTax || 0;
                brokerFeeAmount = property.brokerFee || 0;
                otherCostsAmount = property.otherAcquisitionCosts || 0;
            }
            else {
                // 物件が見つからない場合は入力値を使用（後方互換性）
                acquisitionDate = input.acquisitionDate ? new Date(input.acquisitionDate) : new Date();
                baseCost = input.acquisitionCost || 0;
            }
        }
        catch (error) {
            console.warn(`Property lookup failed for ${input.propertyId}:`, error);
            // エラーが発生した場合は入力値を使用
            acquisitionDate = input.acquisitionDate ? new Date(input.acquisitionDate) : new Date();
            baseCost = input.acquisitionCost || 0;
        }
    }
    else {
        // propertyId がない場合は入力値を使用（後方互換性）
        acquisitionDate = input.acquisitionDate ? new Date(input.acquisitionDate) : new Date();
        baseCost = input.acquisitionCost || 0;
    }
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
    // TX-30: 取得費 = 基本取得費 + 取得関連費用
    const totalAcquisitionCost = baseCost +
        acquisitionTaxAmount +
        registrationTaxAmount +
        brokerFeeAmount +
        otherCostsAmount;
    // 譲渡所得 = 売却価格 - (取得費 + 転売費用)
    const capitalGain = input.salePrice - (totalAcquisitionCost + transferExpenses);
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
        acquisitionCost: totalAcquisitionCost,
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
        // TX-30: 内訳を追加
        breakdown: {
            baseCost,
            acquisitionTax: acquisitionTaxAmount,
            registrationTax: registrationTaxAmount,
            brokerFee: brokerFeeAmount,
            otherAcquisitionCosts: otherCostsAmount,
        },
    };
};
exports.calculateCapitalGain = calculateCapitalGain;
