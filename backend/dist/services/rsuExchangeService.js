"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateAnnualRSUIncome = exports.calculateBatchRSUTax = exports.calculateRSUTax = exports.getBatchTTMRates = exports.getTTMRate = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * RSU為替自動連携サービス
 * 証券会社APIとの連携、権利確定日TTMの自動取得
 */
// 為替レートAPI（実際には証券会社のAPIを使用）
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
/**
 * TTM（電信仲値）レートを取得
 * @param date 取得日
 * @returns 為替レート
 */
const getTTMRate = async (date) => {
    try {
        // 実際の実装では、日本銀行や証券会社のAPIを使用
        // ここではデモ用の簡易実装
        const response = await axios_1.default.get(EXCHANGE_RATE_API);
        // JPYレートを計算（USD基準から変換）
        const usdToJpy = response.data.rates.JPY || 150;
        return {
            date: date,
            rate: usdToJpy,
            source: 'ExchangeRate-API (Demo)',
        };
    }
    catch (error) {
        console.error('Error fetching exchange rate:', error);
        // フォールバック：固定レート
        return {
            date: date,
            rate: 150.0,
            source: 'Fallback Rate',
        };
    }
};
exports.getTTMRate = getTTMRate;
/**
 * 複数日のTTMレートを一括取得
 * @param dates 日付配列
 * @returns 為替レートの配列
 */
const getBatchTTMRates = async (dates) => {
    const ratePromises = dates.map(date => (0, exports.getTTMRate)(date));
    return Promise.all(ratePromises);
};
exports.getBatchTTMRates = getBatchTTMRates;
/**
 * RSU権利確定時の税務計算
 * @param vestingData RSU権利確定データ
 * @returns 税務計算結果
 */
const calculateRSUTax = async (vestingData) => {
    // 権利確定日のTTMレートを取得
    const exchangeRateData = await (0, exports.getTTMRate)(vestingData.vestingDate);
    // 円貨換算
    const pricePerShareJPY = vestingData.pricePerShare * exchangeRateData.rate;
    const totalValueJPY = pricePerShareJPY * vestingData.shares;
    // 課税所得（給与所得として計算）
    const taxableIncomeJPY = totalValueJPY;
    return {
        vestingDate: vestingData.vestingDate,
        shares: vestingData.shares,
        pricePerShareUSD: vestingData.pricePerShare,
        exchangeRate: exchangeRateData.rate,
        pricePerShareJPY: pricePerShareJPY,
        totalValueJPY: totalValueJPY,
        taxableIncomeJPY: taxableIncomeJPY,
    };
};
exports.calculateRSUTax = calculateRSUTax;
/**
 * 複数のRSU権利確定の一括計算
 * @param vestingDataList RSU権利確定データの配列
 * @returns 税務計算結果の配列
 */
const calculateBatchRSUTax = async (vestingDataList) => {
    const calculations = vestingDataList.map(data => (0, exports.calculateRSUTax)(data));
    return Promise.all(calculations);
};
exports.calculateBatchRSUTax = calculateBatchRSUTax;
/**
 * 年間のRSU収入集計
 * @param vestingDataList RSU権利確定データの配列
 * @param year 対象年度
 * @returns 年間集計結果
 */
const aggregateAnnualRSUIncome = async (vestingDataList, year) => {
    // 対象年度のデータのみフィルタ
    const yearData = vestingDataList.filter(data => data.vestingDate.getFullYear() === year);
    // 一括計算
    const calculations = await (0, exports.calculateBatchRSUTax)(yearData);
    // 集計
    const totalShares = calculations.reduce((sum, calc) => sum + calc.shares, 0);
    const totalIncomeJPY = calculations.reduce((sum, calc) => sum + calc.totalValueJPY, 0);
    return {
        year,
        totalShares,
        totalIncomeJPY,
        vestingCount: calculations.length,
        calculations,
    };
};
exports.aggregateAnnualRSUIncome = aggregateAnnualRSUIncome;
