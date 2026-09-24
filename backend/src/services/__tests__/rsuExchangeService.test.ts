/**
 * rsuExchangeService のユニットテスト
 *
 * サービスはモジュールスコープに TTM レートのキャッシュ（Map）を持つため、
 * テストごとに jest.resetModules() でモジュールを読み込み直し、テスト間の独立性を保つ。
 */
type RSUModule = typeof import('../rsuExchangeService');

jest.mock('axios');
jest.mock('fs');

let rsu: RSUModule;
let axiosGet: jest.Mock;
let fsMock: {
  existsSync: jest.Mock;
  readFileSync: jest.Mock;
  writeFileSync: jest.Mock;
  mkdirSync: jest.Mock;
};

const ENV_KEYS = ['OPEN_EXCHANGE_RATES_API_KEY', 'FIXER_API_KEY', 'USE_SIMULATED_TTM'] as const;
const originalEnv: Record<string, string | undefined> = {};

const jpy = (rate: number) => ({ data: { rates: { JPY: rate } } });

beforeAll(() => {
  ENV_KEYS.forEach((k) => (originalEnv[k] = process.env[k]));
});

afterAll(() => {
  ENV_KEYS.forEach((k) => {
    if (originalEnv[k] === undefined) delete process.env[k];
    else process.env[k] = originalEnv[k];
  });
});

beforeEach(() => {
  jest.resetModules();
  ENV_KEYS.forEach((k) => delete process.env[k]);

  // resetModules 後に取得し直した mock を、テスト対象と同じインスタンスとして使う
  const axios = require('axios');
  axiosGet = axios.get as jest.Mock;
  axiosGet.mockReset();

  fsMock = require('fs');
  fsMock.existsSync.mockReset().mockReturnValue(false);
  fsMock.readFileSync.mockReset().mockReturnValue('{}');
  fsMock.writeFileSync.mockReset();
  fsMock.mkdirSync.mockReset();

  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'log').mockImplementation(() => undefined);

  rsu = require('../rsuExchangeService');
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getTTMRate - 為替レート取得とフォールバック', () => {
  test('Open Exchange Rates のキーがあればそのレートを使う', async () => {
    process.env.OPEN_EXCHANGE_RATES_API_KEY = 'oer-key';
    axiosGet.mockResolvedValueOnce(jpy(140.5));

    const result = await rsu.getTTMRate(new Date(2025, 0, 15));

    expect(result.rate).toBe(140.5);
    expect(result.source).toBe('Open Exchange Rates');
    expect(axiosGet).toHaveBeenCalledTimes(1);
    expect(axiosGet.mock.calls[0][0]).toContain('/historical/2025-01-15.json');
    expect(axiosGet.mock.calls[0][1].params).toMatchObject({ app_id: 'oer-key', symbols: 'JPY', base: 'USD' });
  });

  test('Open Exchange Rates が失敗したら Fixer にフォールバックする', async () => {
    process.env.OPEN_EXCHANGE_RATES_API_KEY = 'oer-key';
    process.env.FIXER_API_KEY = 'fixer-key';
    axiosGet.mockRejectedValueOnce(new Error('OER down')).mockResolvedValueOnce(jpy(141.2));

    const result = await rsu.getTTMRate(new Date(2025, 1, 3));

    expect(result.rate).toBe(141.2);
    expect(result.source).toBe('Fixer');
    expect(axiosGet).toHaveBeenCalledTimes(2);
    expect(axiosGet.mock.calls[1][0]).toContain('2025-02-03');
  });

  test('APIキーが無い場合は現在レートAPIにフォールバックする', async () => {
    axiosGet.mockResolvedValueOnce(jpy(149.8));

    const result = await rsu.getTTMRate(new Date(2025, 2, 10));

    expect(result.rate).toBe(149.8);
    expect(result.source).toBe('Current Rate (Fallback)');
    expect(axiosGet).toHaveBeenCalledTimes(1);
    expect(axiosGet.mock.calls[0][0]).toBe('https://api.exchangerate-api.com/v4/latest/USD');
  });

  test('すべてのAPIが失敗した場合はデフォルト150円を返す', async () => {
    process.env.OPEN_EXCHANGE_RATES_API_KEY = 'oer-key';
    process.env.FIXER_API_KEY = 'fixer-key';
    axiosGet.mockRejectedValue(new Error('network error'));

    const result = await rsu.getTTMRate(new Date(2025, 9, 15));

    expect(result.rate).toBe(150);
    expect(result.source).toBe('Current Rate (Fallback)');
    expect(axiosGet).toHaveBeenCalledTimes(3);
  });

  test('APIレスポンスにJPYが無い場合は次の手段へ進む', async () => {
    process.env.OPEN_EXCHANGE_RATES_API_KEY = 'oer-key';
    axiosGet.mockResolvedValueOnce({ data: { rates: {} } }).mockResolvedValueOnce(jpy(151));

    const result = await rsu.getTTMRate(new Date(2025, 3, 1));

    expect(result.rate).toBe(151);
    expect(result.source).toBe('Current Rate (Fallback)');
  });

  test('同じ日付の2回目はキャッシュから返し、APIを呼ばない', async () => {
    process.env.OPEN_EXCHANGE_RATES_API_KEY = 'oer-key';
    axiosGet.mockResolvedValueOnce(jpy(142.3));
    const date = new Date(2025, 3, 15);

    await rsu.getTTMRate(date);
    const second = await rsu.getTTMRate(new Date(2025, 3, 15));

    expect(second.rate).toBe(142.3);
    expect(second.source).toBe('Cache');
    expect(axiosGet).toHaveBeenCalledTimes(1);
  });

  test('取得したレートはファイルキャッシュに保存される', async () => {
    axiosGet.mockResolvedValueOnce(jpy(147.25));

    await rsu.getTTMRate(new Date(2025, 4, 20));

    expect(fsMock.writeFileSync).toHaveBeenCalled();
    const calls = fsMock.writeFileSync.mock.calls;
    const written = JSON.parse(calls[calls.length - 1][1]);
    expect(written).toEqual({ '2025-05-20': 147.25 });
  });
});

describe('initializeTTMRateCache - ファイルキャッシュ読込', () => {
  test('キャッシュファイルのレートを読み込み、APIを呼ばずに返す', async () => {
    fsMock.existsSync.mockReturnValue(true);
    fsMock.readFileSync.mockReturnValue(JSON.stringify({ '2025-06-02': 144.44 }));

    rsu.initializeTTMRateCache();
    const result = await rsu.getTTMRate(new Date(2025, 5, 2));

    expect(result).toMatchObject({ rate: 144.44, source: 'Cache' });
    expect(axiosGet).not.toHaveBeenCalled();
  });

  test('キャッシュファイルが壊れていても例外を投げない', () => {
    fsMock.existsSync.mockReturnValue(true);
    fsMock.readFileSync.mockReturnValue('{not json');

    expect(() => rsu.initializeTTMRateCache()).not.toThrow();
  });
});

describe('getBatchTTMRates - 一括取得', () => {
  test('入力した日付の順序を保って返す', async () => {
    axiosGet.mockResolvedValueOnce(jpy(145)).mockResolvedValueOnce(jpy(146)).mockResolvedValueOnce(jpy(147));
    const dates = [new Date(2025, 6, 1), new Date(2025, 6, 2), new Date(2025, 6, 3)];

    const results = await rsu.getBatchTTMRates(dates);

    expect(results.map((r) => r.date)).toEqual(dates);
    expect(results.map((r) => r.rate)).toEqual([145, 146, 147]);
  });

  test('キャッシュ済みの日付はAPIを呼ばない', async () => {
    axiosGet.mockResolvedValueOnce(jpy(145));
    await rsu.getTTMRate(new Date(2025, 6, 1));
    axiosGet.mockClear();
    axiosGet.mockResolvedValueOnce(jpy(146));

    const results = await rsu.getBatchTTMRates([new Date(2025, 6, 1), new Date(2025, 6, 2)]);

    expect(results[0]).toMatchObject({ rate: 145, source: 'Cache' });
    expect(results[1].rate).toBe(146);
    expect(axiosGet).toHaveBeenCalledTimes(1);
  });

  test('シミュレーションモードでは同じ日付に同じレート（140〜160円）を返し、APIを呼ばない', async () => {
    process.env.USE_SIMULATED_TTM = 'true';
    const dates = [new Date(2025, 0, 15), new Date(2025, 3, 15), new Date(2025, 0, 15)];

    const first = await rsu.getBatchTTMRates(dates);
    const second = await rsu.getBatchTTMRates(dates);

    expect(axiosGet).not.toHaveBeenCalled();
    expect(first.map((r) => r.rate)).toEqual(second.map((r) => r.rate));
    expect(first[0].rate).toBe(first[2].rate);
    first.forEach((r) => {
      expect(r.source).toBe('Simulated (Demo)');
      expect(r.rate).toBeGreaterThanOrEqual(140);
      expect(r.rate).toBeLessThan(160);
    });
  });
});

describe('calculateRSUTax - RSU税務計算', () => {
  test('株価(USD)×レート×株数で円換算し、全額を課税所得とする', async () => {
    axiosGet.mockResolvedValueOnce(jpy(140));

    const result = await rsu.calculateRSUTax({
      vestingDate: new Date(2025, 0, 15),
      shares: 100,
      pricePerShare: 150,
      currency: 'USD',
    });

    expect(result.exchangeRate).toBe(140);
    expect(result.pricePerShareUSD).toBe(150);
    expect(result.pricePerShareJPY).toBe(21000);
    expect(result.totalValueJPY).toBe(2100000);
    expect(result.taxableIncomeJPY).toBe(2100000);
  });

  test('小数の株価・端株でも計算できる', async () => {
    axiosGet.mockResolvedValueOnce(jpy(150));

    const result = await rsu.calculateRSUTax({
      vestingDate: new Date(2025, 1, 1),
      shares: 12.5,
      pricePerShare: 99.99,
      currency: 'USD',
    });

    expect(result.pricePerShareJPY).toBeCloseTo(14998.5, 6);
    expect(result.totalValueJPY).toBeCloseTo(187481.25, 6);
  });
});

describe('calculateBatchRSUTax / aggregateAnnualRSUIncome - 一括計算と年間集計', () => {
  test('複数の権利確定をそれぞれのレートで計算する', async () => {
    axiosGet.mockResolvedValueOnce(jpy(140)).mockResolvedValueOnce(jpy(150));

    const results = await rsu.calculateBatchRSUTax([
      { vestingDate: new Date(2025, 0, 15), shares: 10, pricePerShare: 100, currency: 'USD' },
      { vestingDate: new Date(2025, 3, 15), shares: 20, pricePerShare: 200, currency: 'USD' },
    ]);

    expect(results.map((r) => r.totalValueJPY)).toEqual([140000, 600000]);
  });

  test('空配列なら空配列を返す', async () => {
    await expect(rsu.calculateBatchRSUTax([])).resolves.toEqual([]);
    expect(axiosGet).not.toHaveBeenCalled();
  });

  test('対象年度のデータのみを集計する', async () => {
    axiosGet.mockResolvedValueOnce(jpy(140)).mockResolvedValueOnce(jpy(150));

    const summary = await rsu.aggregateAnnualRSUIncome(
      [
        { vestingDate: new Date(2024, 11, 15), shares: 999, pricePerShare: 999, currency: 'USD' },
        { vestingDate: new Date(2025, 0, 15), shares: 10, pricePerShare: 100, currency: 'USD' },
        { vestingDate: new Date(2025, 6, 15), shares: 20, pricePerShare: 200, currency: 'USD' },
      ],
      2025
    );

    expect(summary.year).toBe(2025);
    expect(summary.vestingCount).toBe(2);
    expect(summary.totalShares).toBe(30);
    expect(summary.totalIncomeJPY).toBe(140000 + 600000);
    expect(axiosGet).toHaveBeenCalledTimes(2);
  });

  test('対象年度のデータが無ければ0件・0円', async () => {
    const summary = await rsu.aggregateAnnualRSUIncome(
      [{ vestingDate: new Date(2024, 0, 1), shares: 1, pricePerShare: 1, currency: 'USD' }],
      2025
    );

    expect(summary).toMatchObject({ vestingCount: 0, totalShares: 0, totalIncomeJPY: 0, calculations: [] });
  });
});
