import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import {
  getTTMExchangeRate,
  calculateRSUTaxableIncome,
  batchCalculateRSU,
  clearTTMCache,
} from '../rsuExchangeService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock fs
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('rsuExchangeService - TX-45 Backend Services Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearTTMCache();
    
    // Mock fs.existsSync to return false (no cache file)
    mockedFs.existsSync = jest.fn().mockReturnValue(false);
    mockedFs.mkdirSync = jest.fn();
    mockedFs.writeFileSync = jest.fn();
    mockedFs.readFileSync = jest.fn();
  });

  describe('getTTMExchangeRate', () => {
    test('TTM為替レートを取得できる', async () => {
      const mockRate = 140.5;
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          rates: { JPY: mockRate }
        }
      });

      const vestingDate = new Date('2025-01-15');
      const rate = await getTTMExchangeRate(vestingDate);

      expect(rate).toBeDefined();
      expect(typeof rate).toBe('number');
      expect(rate).toBeGreaterThan(0);
    });

    test('日付を指定してTTMレートを取得できる', async () => {
      const mockRate = 142.3;
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          rates: { JPY: mockRate }
        }
      });

      const vestingDate = new Date('2025-04-15');
      const rate = await getTTMExchangeRate(vestingDate);

      expect(rate).toBeGreaterThan(0);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    test('過去の日付のTTMレートを取得できる', async () => {
      const mockRate = 138.2;
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          rates: { JPY: mockRate }
        }
      });

      const pastDate = new Date('2024-01-15');
      const rate = await getTTMExchangeRate(pastDate);

      expect(rate).toBeGreaterThan(0);
    });

    test('キャッシュが機能する', async () => {
      const mockRate = 140.5;
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          rates: { JPY: mockRate }
        }
      });

      const vestingDate = new Date('2025-01-15');
      
      // 最初の呼び出し
      const rate1 = await getTTMExchangeRate(vestingDate);
      
      // 2回目の呼び出し（キャッシュから取得されるべき）
      const rate2 = await getTTMExchangeRate(vestingDate);

      expect(rate1).toBe(rate2);
      // APIは1回だけ呼ばれるべき
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test('APIエラー時にデフォルトレートを返す', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const vestingDate = new Date('2025-01-15');
      const rate = await getTTMExchangeRate(vestingDate);

      // デフォルトレート（140円）が返されることを確認
      expect(rate).toBe(140);
    });

    test('無効な日付に対してエラー処理が機能する', async () => {
      const invalidDate = new Date('invalid');
      
      await expect(getTTMExchangeRate(invalidDate)).rejects.toThrow();
    });
  });

  describe('calculateRSUTaxableIncome', () => {
    test('RSU課税所得が正しく計算される', async () => {
      const mockRate = 140.0;
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          rates: { JPY: mockRate }
        }
      });

      const vestingDate = new Date('2025-01-15');
      const shares = 100;
      const pricePerShareUSD = 150;

      const result = await calculateRSUTaxableIncome(vestingDate, shares, pricePerShareUSD);

      expect(result).toBeDefined();
      expect(result.shares).toBe(shares);
      expect(result.pricePerShareUSD).toBe(pricePerShareUSD);
      expect(result.exchangeRate).toBe(mockRate);
      
      // 計算確認: 100株 × $150 × 140円 = 2,100,000円
      const expectedTotal = shares * pricePerShareUSD * mockRate;
      expect(result.totalValueJPY).toBe(expectedTotal);
      expect(result.taxableIncomeJPY).toBe(expectedTotal);
    });

    test('株数が0の場合でも正常に処理される', async () => {
      const mockRate = 140.0;
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          rates: { JPY: mockRate }
        }
      });

      const vestingDate = new Date('2025-01-15');
      const shares = 0;
      const pricePerShareUSD = 150;

      const result = await calculateRSUTaxableIncome(vestingDate, shares, pricePerShareUSD);

      expect(result.totalValueJPY).toBe(0);
      expect(result.taxableIncomeJPY).toBe(0);
    });

    test('株価が0の場合でも正常に処理される', async () => {
      const mockRate = 140.0;
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          rates: { JPY: mockRate }
        }
      });

      const vestingDate = new Date('2025-01-15');
      const shares = 100;
      const pricePerShareUSD = 0;

      const result = await calculateRSUTaxableIncome(vestingDate, shares, pricePerShareUSD);

      expect(result.totalValueJPY).toBe(0);
      expect(result.taxableIncomeJPY).toBe(0);
    });

    test('計算結果のフィールドがすべて設定される', async () => {
      const mockRate = 142.5;
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          rates: { JPY: mockRate }
        }
      });

      const vestingDate = new Date('2025-01-15');
      const shares = 100;
      const pricePerShareUSD = 155;

      const result = await calculateRSUTaxableIncome(vestingDate, shares, pricePerShareUSD);

      expect(result).toHaveProperty('vestingDate');
      expect(result).toHaveProperty('shares');
      expect(result).toHaveProperty('pricePerShareUSD');
      expect(result).toHaveProperty('exchangeRate');
      expect(result).toHaveProperty('pricePerShareJPY');
      expect(result).toHaveProperty('totalValueJPY');
      expect(result).toHaveProperty('taxableIncomeJPY');
    });
  });

  describe('batchCalculateRSU', () => {
    test('複数のRSU記録を一括計算できる', async () => {
      const mockRate1 = 140.0;
      const mockRate2 = 142.0;
      
      mockedAxios.get
        .mockResolvedValueOnce({
          data: { rates: { JPY: mockRate1 } }
        })
        .mockResolvedValueOnce({
          data: { rates: { JPY: mockRate2 } }
        });

      const vestingRecords = [
        {
          vestingDate: new Date('2025-01-15'),
          shares: 100,
          pricePerShareUSD: 150,
        },
        {
          vestingDate: new Date('2025-04-15'),
          shares: 100,
          pricePerShareUSD: 155,
        },
      ];

      const results = await batchCalculateRSU(vestingRecords);

      expect(results).toHaveLength(2);
      expect(results[0].totalValueJPY).toBe(100 * 150 * mockRate1);
      expect(results[1].totalValueJPY).toBe(100 * 155 * mockRate2);
    });

    test('空の配列でも正常に処理される', async () => {
      const results = await batchCalculateRSU([]);

      expect(results).toEqual([]);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    test('単一レコードの一括計算が機能する', async () => {
      const mockRate = 140.0;
      mockedAxios.get.mockResolvedValueOnce({
        data: { rates: { JPY: mockRate } }
      });

      const vestingRecords = [
        {
          vestingDate: new Date('2025-01-15'),
          shares: 100,
          pricePerShareUSD: 150,
        },
      ];

      const results = await batchCalculateRSU(vestingRecords);

      expect(results).toHaveLength(1);
      expect(results[0].totalValueJPY).toBe(100 * 150 * mockRate);
    });

    test('異なる日付のレコードが正しく処理される', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: { rates: { JPY: 138.0 } }
        })
        .mockResolvedValueOnce({
          data: { rates: { JPY: 140.0 } }
        })
        .mockResolvedValueOnce({
          data: { rates: { JPY: 142.0 } }
        });

      const vestingRecords = [
        {
          vestingDate: new Date('2025-01-15'),
          shares: 100,
          pricePerShareUSD: 150,
        },
        {
          vestingDate: new Date('2025-04-15'),
          shares: 100,
          pricePerShareUSD: 155,
        },
        {
          vestingDate: new Date('2025-07-15'),
          shares: 100,
          pricePerShareUSD: 160,
        },
      ];

      const results = await batchCalculateRSU(vestingRecords);

      expect(results).toHaveLength(3);
      expect(results[0].exchangeRate).toBe(138.0);
      expect(results[1].exchangeRate).toBe(140.0);
      expect(results[2].exchangeRate).toBe(142.0);
    });
  });

  describe('キャッシュ機能', () => {
    test('キャッシュがクリアされる', async () => {
      const mockRate = 140.0;
      mockedAxios.get.mockResolvedValue({
        data: { rates: { JPY: mockRate } }
      });

      const vestingDate = new Date('2025-01-15');
      
      // キャッシュに保存
      await getTTMExchangeRate(vestingDate);
      
      // キャッシュクリア
      clearTTMCache();
      
      // 再度取得（APIが呼ばれるべき）
      await getTTMExchangeRate(vestingDate);

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    test('同じ日付の複数回呼び出しがキャッシュを使用する', async () => {
      const mockRate = 140.0;
      mockedAxios.get.mockResolvedValueOnce({
        data: { rates: { JPY: mockRate } }
      });

      const vestingDate = new Date('2025-01-15');
      
      await getTTMExchangeRate(vestingDate);
      await getTTMExchangeRate(vestingDate);
      await getTTMExchangeRate(vestingDate);

      // APIは1回だけ呼ばれるべき
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('エラーハンドリング', () => {
    test('ネットワークエラー時にデフォルト値を返す', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      const vestingDate = new Date('2025-01-15');
      const rate = await getTTMExchangeRate(vestingDate);

      expect(rate).toBe(140); // デフォルトレート
    });

    test('タイムアウトエラー時に適切に処理される', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Timeout'));

      const vestingDate = new Date('2025-01-15');
      const rate = await getTTMExchangeRate(vestingDate);

      expect(rate).toBe(140);
    });

    test('不正なレスポンス時に適切に処理される', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { invalid: 'data' }
      });

      const vestingDate = new Date('2025-01-15');
      const rate = await getTTMExchangeRate(vestingDate);

      expect(rate).toBe(140);
    });
  });

  describe('データ検証', () => {
    test('負の株数でエラーが発生する', async () => {
      const vestingDate = new Date('2025-01-15');
      const shares = -100;
      const pricePerShareUSD = 150;

      await expect(
        calculateRSUTaxableIncome(vestingDate, shares, pricePerShareUSD)
      ).rejects.toThrow();
    });

    test('負の株価でエラーが発生する', async () => {
      const vestingDate = new Date('2025-01-15');
      const shares = 100;
      const pricePerShareUSD = -150;

      await expect(
        calculateRSUTaxableIncome(vestingDate, shares, pricePerShareUSD)
      ).rejects.toThrow();
    });
  });
});
