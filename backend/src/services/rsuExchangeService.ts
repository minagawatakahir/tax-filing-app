import axios from 'axios';
import { addDays, format } from 'date-fns';

/**
 * RSU為替自動連携サービス
 * 証券会社APIとの連携、権利確定日TTMの自動取得
 */

// 為替レートAPI（実際には証券会社のAPIを使用）
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

export interface RSUVestingData {
  vestingDate: Date;
  shares: number;
  pricePerShare: number; // USD
  currency: string;
}

export interface ExchangeRateData {
  date: Date;
  rate: number; // JPY per USD
  source: string;
}

export interface RSUTaxCalculation {
  vestingDate: Date;
  shares: number;
  pricePerShareUSD: number;
  exchangeRate: number;
  pricePerShareJPY: number;
  totalValueJPY: number;
  taxableIncomeJPY: number;
}

/**
 * TTM（電信仲値）レートを取得
 * @param date 取得日
 * @returns 為替レート
 */
export const getTTMRate = async (date: Date): Promise<ExchangeRateData> => {
  try {
    // 実際の実装では、日本銀行や証券会社のAPIを使用
    // ここではデモ用の簡易実装
    const response = await axios.get(EXCHANGE_RATE_API);
    
    // JPYレートを計算（USD基準から変換）
    const usdToJpy = response.data.rates.JPY || 150;
    
    return {
      date: date,
      rate: usdToJpy,
      source: 'ExchangeRate-API (Demo)',
    };
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // フォールバック：固定レート
    return {
      date: date,
      rate: 150.0,
      source: 'Fallback Rate',
    };
  }
};

/**
 * 複数日のTTMレートを一括取得
 * @param dates 日付配列
 * @returns 為替レートの配列
 */
export const getBatchTTMRates = async (dates: Date[]): Promise<ExchangeRateData[]> => {
  const ratePromises = dates.map(date => getTTMRate(date));
  return Promise.all(ratePromises);
};

/**
 * RSU権利確定時の税務計算
 * @param vestingData RSU権利確定データ
 * @returns 税務計算結果
 */
export const calculateRSUTax = async (
  vestingData: RSUVestingData
): Promise<RSUTaxCalculation> => {
  // 権利確定日のTTMレートを取得
  const exchangeRateData = await getTTMRate(vestingData.vestingDate);
  
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

/**
 * 複数のRSU権利確定の一括計算
 * @param vestingDataList RSU権利確定データの配列
 * @returns 税務計算結果の配列
 */
export const calculateBatchRSUTax = async (
  vestingDataList: RSUVestingData[]
): Promise<RSUTaxCalculation[]> => {
  const calculations = vestingDataList.map(data => calculateRSUTax(data));
  return Promise.all(calculations);
};

/**
 * 年間のRSU収入集計
 * @param vestingDataList RSU権利確定データの配列
 * @param year 対象年度
 * @returns 年間集計結果
 */
export const aggregateAnnualRSUIncome = async (
  vestingDataList: RSUVestingData[],
  year: number
): Promise<{
  year: number;
  totalShares: number;
  totalIncomeJPY: number;
  vestingCount: number;
  calculations: RSUTaxCalculation[];
}> => {
  // 対象年度のデータのみフィルタ
  const yearData = vestingDataList.filter(
    data => data.vestingDate.getFullYear() === year
  );
  
  // 一括計算
  const calculations = await calculateBatchRSUTax(yearData);
  
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
