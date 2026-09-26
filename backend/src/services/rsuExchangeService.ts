/**
 * RSU の円換算（権利確定日の株価 × TTM）
 *
 * TTM は ttmRateService から取得する（三菱UFJ銀行の公示相場。休日は直前の公示日）。
 * 取得できない日付があれば例外にする。代わりの値（固定値・実勢レートなど）は使わない。
 * 計算結果には、使ったレートの出どころ・公示日・シミュレーションかどうかを必ず含める。
 */
import { getTTM, TTMRate, TTMUnavailableError, toDateKey } from './ttmRateService';

export { TTMUnavailableError } from './ttmRateService';

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
  rateDate: string; // 実際に使った公示日（yyyy-MM-dd）
  isSimulated: boolean;
}

export interface RSUTaxCalculation {
  vestingDate: Date;
  shares: number;
  pricePerShareUSD: number;
  exchangeRate: number;
  pricePerShareJPY: number;
  totalValueJPY: number;
  taxableIncomeJPY: number;
  ttmSource: string; // レートの出どころ
  ttmRateDate: string; // 実際に使った公示日（休日なら直前の公示日）
  isSimulated: boolean; // シミュレーションのレートか（true なら申告に使えない）
}

const toExchangeRateData = (date: Date, ttm: TTMRate): ExchangeRateData => ({
  date,
  rate: ttm.rate,
  source: ttm.source,
  rateDate: ttm.rateDate,
  isSimulated: ttm.isSimulated,
});

/**
 * 指定日のTTM
 * @throws TTMUnavailableError 取得できない場合
 */
export const getTTMRate = async (date: Date): Promise<ExchangeRateData> => toExchangeRateData(date, await getTTM(date));

/**
 * 複数の日付のTTM（同じ日付は1回だけ取得する）
 * @throws TTMUnavailableError 1つでも取得できない日付がある場合（どの日付かをまとめて知らせる）
 */
export const getBatchTTMRates = async (dates: Date[]): Promise<ExchangeRateData[]> => {
  const byKey = new Map<string, TTMRate>();
  const failures: string[] = [];
  for (const key of Array.from(new Set(dates.map(toDateKey)))) {
    const date = dates.find((d) => toDateKey(d) === key)!;
    try {
      byKey.set(key, await getTTM(date));
    } catch (error: any) {
      failures.push(error instanceof TTMUnavailableError ? error.message : `${key}: ${error?.message || error}`);
    }
  }
  if (failures.length > 0) {
    throw new TTMUnavailableError(failures.length === 1 ? 'この日付' : `${failures.length}件の日付`, failures.join(' / '));
  }
  return dates.map((date) => toExchangeRateData(date, byKey.get(toDateKey(date))!));
};

const toCalculation = (data: RSUVestingData, rate: ExchangeRateData): RSUTaxCalculation => {
  const pricePerShareJPY = data.pricePerShare * rate.rate;
  const totalValueJPY = pricePerShareJPY * data.shares;
  return {
    vestingDate: data.vestingDate,
    shares: data.shares,
    pricePerShareUSD: data.pricePerShare,
    exchangeRate: rate.rate,
    pricePerShareJPY,
    totalValueJPY,
    taxableIncomeJPY: totalValueJPY,
    ttmSource: rate.source,
    ttmRateDate: rate.rateDate,
    isSimulated: rate.isSimulated,
  };
};

/** 1件の権利確定の円換算 */
export const calculateRSUTax = async (vestingData: RSUVestingData): Promise<RSUTaxCalculation> =>
  toCalculation(vestingData, await getTTMRate(vestingData.vestingDate));

/** 複数の権利確定の円換算 */
export const calculateBatchRSUTax = async (vestingDataList: RSUVestingData[]): Promise<RSUTaxCalculation[]> => {
  const rates = await getBatchTTMRates(vestingDataList.map((d) => d.vestingDate));
  return vestingDataList.map((data, i) => toCalculation(data, rates[i]));
};

/** 年間のRSU収入の集計（対象年の権利確定だけ） */
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
  const yearData = vestingDataList.filter((data) => data.vestingDate.getFullYear() === year);
  const calculations = await calculateBatchRSUTax(yearData);
  return {
    year,
    totalShares: calculations.reduce((sum, c) => sum + c.shares, 0),
    totalIncomeJPY: calculations.reduce((sum, c) => sum + c.totalValueJPY, 0),
    vestingCount: calculations.length,
    calculations,
  };
};

/**
 * サーバー起動時の処理（互換のため残す）
 * キャッシュは必要になったときに ttmRateService が読み込む。シミュレーションが有効なら警告する。
 */
export const initializeTTMRateCache = (): void => {
  if (process.env.USE_SIMULATED_TTM === 'true') {
    console.warn('⚠️  USE_SIMULATED_TTM=true: RSU の為替レートはシミュレーション（架空の値）です。申告には使えません。');
  }
};
