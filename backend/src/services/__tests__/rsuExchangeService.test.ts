/**
 * RSU の円換算のテスト（TTM の取得は ttmRateService をモック）
 */
jest.mock('../ttmRateService', () => {
  const actual = jest.requireActual('../ttmRateService');
  return { ...actual, getTTM: jest.fn() };
});

import { getTTM, OFFICIAL_TTM_SOURCE, SIMULATED_TTM_SOURCE, TTMRate, TTMUnavailableError } from '../ttmRateService';
import {
  aggregateAnnualRSUIncome,
  calculateBatchRSUTax,
  calculateRSUTax,
  getBatchTTMRates,
  getTTMRate,
  initializeTTMRateCache,
} from '../rsuExchangeService';

const mockedGetTTM = getTTM as jest.MockedFunction<typeof getTTM>;

const key = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** 日付ごとのTTM（架空の値）。rateDate が違う日は休日扱い */
const official: Record<string, Partial<TTMRate>> = {
  '2025-02-13': { rate: 150.0, rateDate: '2025-02-13' },
  '2025-05-18': { rate: 145.0, rateDate: '2025-05-16' },
  '2025-08-13': { rate: 148.0, rateDate: '2025-08-13' },
};

beforeEach(() => {
  jest.resetAllMocks();
  delete process.env.USE_SIMULATED_TTM;
  mockedGetTTM.mockImplementation(async (date: Date) => {
    const k = key(date);
    const r = official[k];
    if (!r) throw new TTMUnavailableError(k, 'テスト用: 公示なし');
    return { requestedDate: k, rateDate: r.rateDate!, rate: r.rate!, source: OFFICIAL_TTM_SOURCE, isSimulated: false };
  });
});

const vest = (y: number, m: number, d: number, shares: number, price: number) => ({
  vestingDate: new Date(y, m - 1, d),
  shares,
  pricePerShare: price,
  currency: 'USD',
});

describe('calculateRSUTax', () => {
  test('株価 × TTM × 株数で円換算し、レートの出どころと公示日を含める', async () => {
    const r = await calculateRSUTax(vest(2025, 2, 13, 10, 200));
    expect(r).toMatchObject({
      shares: 10,
      pricePerShareUSD: 200,
      exchangeRate: 150,
      pricePerShareJPY: 30000,
      totalValueJPY: 300000,
      taxableIncomeJPY: 300000,
      ttmSource: OFFICIAL_TTM_SOURCE,
      ttmRateDate: '2025-02-13',
      isSimulated: false,
    });
  });

  test('休日の権利確定は、直前の公示日を記録する', async () => {
    const r = await calculateRSUTax(vest(2025, 5, 18, 5, 100));
    expect(r.exchangeRate).toBe(145);
    expect(r.ttmRateDate).toBe('2025-05-16');
  });

  test('TTMを取得できなければエラー（代わりの値で計算しない）', async () => {
    await expect(calculateRSUTax(vest(2025, 1, 1, 1, 100))).rejects.toThrow(TTMUnavailableError);
  });

  test('シミュレーションのレートなら isSimulated=true が結果に残る', async () => {
    mockedGetTTM.mockResolvedValueOnce({
      requestedDate: '2025-02-13', rateDate: '2025-02-13', rate: 143.746, source: SIMULATED_TTM_SOURCE, isSimulated: true,
    });
    const r = await calculateRSUTax(vest(2025, 2, 13, 1, 100));
    expect(r.isSimulated).toBe(true);
    expect(r.ttmSource).toBe(SIMULATED_TTM_SOURCE);
  });
});

describe('calculateBatchRSUTax / getBatchTTMRates', () => {
  test('複数の権利確定を、入力と同じ順番で円換算する', async () => {
    const r = await calculateBatchRSUTax([vest(2025, 8, 13, 2, 100), vest(2025, 2, 13, 1, 100)]);
    expect(r.map((c) => c.totalValueJPY)).toEqual([29600, 15000]);
    expect(r.map((c) => c.ttmRateDate)).toEqual(['2025-08-13', '2025-02-13']);
  });

  test('同じ日付のレートは1回だけ取得する', async () => {
    await getBatchTTMRates([new Date(2025, 1, 13), new Date(2025, 1, 13), new Date(2025, 7, 13)]);
    expect(mockedGetTTM).toHaveBeenCalledTimes(2);
  });

  test('取得できない日付があれば、どの日付かをまとめてエラーにする', async () => {
    const promise = calculateBatchRSUTax([vest(2025, 1, 1, 1, 1), vest(2025, 2, 13, 1, 1), vest(2025, 3, 3, 1, 1)]);
    await expect(promise).rejects.toThrow(TTMUnavailableError);
    await expect(
      calculateBatchRSUTax([vest(2025, 1, 1, 1, 1), vest(2025, 2, 13, 1, 1), vest(2025, 3, 3, 1, 1)])
    ).rejects.toThrow(/2025-01-01.*2025-03-03/);
  });

  test('getTTMRate は出どころ・公示日・シミュレーションかどうかを返す', async () => {
    expect(await getTTMRate(new Date(2025, 4, 18))).toEqual({
      date: new Date(2025, 4, 18),
      rate: 145,
      source: OFFICIAL_TTM_SOURCE,
      rateDate: '2025-05-16',
      isSimulated: false,
    });
  });
});

describe('aggregateAnnualRSUIncome', () => {
  test('対象年の権利確定だけを集計する', async () => {
    const r = await aggregateAnnualRSUIncome([vest(2025, 2, 13, 10, 200), vest(2025, 8, 13, 5, 100), vest(2024, 12, 1, 99, 99)], 2025);
    expect(r).toMatchObject({ year: 2025, vestingCount: 2, totalShares: 15, totalIncomeJPY: 300000 + 74000 });
    expect(mockedGetTTM).toHaveBeenCalledTimes(2);
  });
});

describe('initializeTTMRateCache', () => {
  test('シミュレーションが有効なら警告を出す', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.USE_SIMULATED_TTM = 'true';
    initializeTTMRateCache();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('申告には使えません'));
    warn.mockRestore();
  });

  test('シミュレーションが無効なら何も出さない', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    initializeTTMRateCache();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
