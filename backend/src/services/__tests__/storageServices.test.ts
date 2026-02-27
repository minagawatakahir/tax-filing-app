import {
  saveToStorage,
  getFromStorage,
  deleteFromStorage,
  clearStorage,
} from '../salaryIncomeStorageService';
import {
  saveRSUIncomeRecord,
  getRSUIncomeRecords,
  deleteRSUIncomeRecord,
} from '../rsuIncomeStorageService';
import {
  saveCapitalGainRecord,
  getCapitalGainRecords,
  deleteCapitalGainRecord,
} from '../capitalGainStorageService';

describe('Storage Services - TX-45 Backend Services Tests', () => {
  beforeEach(() => {
    // Clear any existing storage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Salary Income Storage Service', () => {
    test('給与所得データを保存できる', () => {
      const data = {
        year: 2025,
        salary: 5000000,
        deductions: 1000000,
      };

      const result = saveToStorage('salary-2025', data);

      expect(result).toBe(true);
    });

    test('保存したデータを取得できる', () => {
      const data = {
        year: 2025,
        salary: 5000000,
        deductions: 1000000,
      };

      saveToStorage('salary-2025', data);
      const retrieved = getFromStorage('salary-2025');

      expect(retrieved).toEqual(data);
    });

    test('存在しないデータはnullを返す', () => {
      const retrieved = getFromStorage('nonexistent');

      expect(retrieved).toBeNull();
    });

    test('データを削除できる', () => {
      const data = { year: 2025, salary: 5000000 };

      saveToStorage('salary-2025', data);
      const deleted = deleteFromStorage('salary-2025');
      const retrieved = getFromStorage('salary-2025');

      expect(deleted).toBe(true);
      expect(retrieved).toBeNull();
    });

    test('すべてのデータをクリアできる', () => {
      saveToStorage('salary-2024', { year: 2024, salary: 4000000 });
      saveToStorage('salary-2025', { year: 2025, salary: 5000000 });

      clearStorage();

      expect(getFromStorage('salary-2024')).toBeNull();
      expect(getFromStorage('salary-2025')).toBeNull();
    });

    test('複数年度のデータを管理できる', () => {
      const data2024 = { year: 2024, salary: 4000000 };
      const data2025 = { year: 2025, salary: 5000000 };

      saveToStorage('salary-2024', data2024);
      saveToStorage('salary-2025', data2025);

      expect(getFromStorage('salary-2024')).toEqual(data2024);
      expect(getFromStorage('salary-2025')).toEqual(data2025);
    });

    test('大きなデータを保存できる', () => {
      const largeData = {
        year: 2025,
        salary: 50000000,
        deductions: Array(100).fill({ type: '控除', amount: 100000 }),
      };

      const result = saveToStorage('large-salary', largeData);

      expect(result).toBe(true);
    });
  });

  describe('RSU Income Storage Service', () => {
    test('RSU所得記録を保存できる', () => {
      const record = {
        year: 2025,
        vestingDate: '2025-01-15',
        shares: 100,
        pricePerShareUSD: 150,
        totalValueJPY: 2100000,
      };

      const result = saveRSUIncomeRecord(record);

      expect(result).toBeDefined();
    });

    test('保存したRSU記録を取得できる', () => {
      const record = {
        year: 2025,
        vestingDate: '2025-01-15',
        shares: 100,
        pricePerShareUSD: 150,
        totalValueJPY: 2100000,
      };

      saveRSUIncomeRecord(record);
      const records = getRSUIncomeRecords(2025);

      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject(record);
    });

    test('複数のRSU記録を保存できる', () => {
      const record1 = {
        year: 2025,
        vestingDate: '2025-01-15',
        shares: 100,
        pricePerShareUSD: 150,
        totalValueJPY: 2100000,
      };
      const record2 = {
        year: 2025,
        vestingDate: '2025-04-15',
        shares: 100,
        pricePerShareUSD: 155,
        totalValueJPY: 2201000,
      };

      saveRSUIncomeRecord(record1);
      saveRSUIncomeRecord(record2);

      const records = getRSUIncomeRecords(2025);

      expect(records).toHaveLength(2);
    });

    test('RSU記録を削除できる', () => {
      const record = {
        year: 2025,
        vestingDate: '2025-01-15',
        shares: 100,
        pricePerShareUSD: 150,
        totalValueJPY: 2100000,
      };

      const saved = saveRSUIncomeRecord(record);
      const deleted = deleteRSUIncomeRecord(saved.id);

      expect(deleted).toBe(true);
    });

    test('年度別にRSU記録を取得できる', () => {
      const record2024 = { year: 2024, vestingDate: '2024-01-15', shares: 100 };
      const record2025 = { year: 2025, vestingDate: '2025-01-15', shares: 100 };

      saveRSUIncomeRecord(record2024);
      saveRSUIncomeRecord(record2025);

      const records2024 = getRSUIncomeRecords(2024);
      const records2025 = getRSUIncomeRecords(2025);

      expect(records2024).toHaveLength(1);
      expect(records2025).toHaveLength(1);
    });
  });

  describe('Capital Gain Storage Service', () => {
    test('譲渡所得記録を保存できる', () => {
      const record = {
        year: 2025,
        propertyId: 'property-001',
        salePrice: 50000000,
        acquisitionCost: 30000000,
        gain: 20000000,
      };

      const result = saveCapitalGainRecord(record);

      expect(result).toBeDefined();
    });

    test('保存した譲渡所得記録を取得できる', () => {
      const record = {
        year: 2025,
        propertyId: 'property-001',
        salePrice: 50000000,
        acquisitionCost: 30000000,
        gain: 20000000,
      };

      saveCapitalGainRecord(record);
      const records = getCapitalGainRecords(2025);

      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject(record);
    });

    test('複数の譲渡所得記録を保存できる', () => {
      const record1 = {
        year: 2025,
        propertyId: 'property-001',
        salePrice: 50000000,
        acquisitionCost: 30000000,
        gain: 20000000,
      };
      const record2 = {
        year: 2025,
        propertyId: 'property-002',
        salePrice: 100000000,
        acquisitionCost: 60000000,
        gain: 40000000,
      };

      saveCapitalGainRecord(record1);
      saveCapitalGainRecord(record2);

      const records = getCapitalGainRecords(2025);

      expect(records).toHaveLength(2);
    });

    test('譲渡所得記録を削除できる', () => {
      const record = {
        year: 2025,
        propertyId: 'property-001',
        salePrice: 50000000,
        acquisitionCost: 30000000,
        gain: 20000000,
      };

      const saved = saveCapitalGainRecord(record);
      const deleted = deleteCapitalGainRecord(saved.id);

      expect(deleted).toBe(true);
    });

    test('年度別に譲渡所得記録を取得できる', () => {
      const record2024 = { year: 2024, propertyId: 'property-001', gain: 10000000 };
      const record2025 = { year: 2025, propertyId: 'property-002', gain: 20000000 };

      saveCapitalGainRecord(record2024);
      saveCapitalGainRecord(record2025);

      const records2024 = getCapitalGainRecords(2024);
      const records2025 = getCapitalGainRecords(2025);

      expect(records2024).toHaveLength(1);
      expect(records2025).toHaveLength(1);
    });
  });

  describe('データ整合性', () => {
    test('JSONシリアライズ/デシリアライズが正しく動作する', () => {
      const data = {
        year: 2025,
        salary: 5000000,
        metadata: {
          updatedAt: new Date().toISOString(),
        },
      };

      saveToStorage('test-data', data);
      const retrieved = getFromStorage('test-data');

      expect(retrieved).toEqual(data);
    });

    test('特殊文字を含むデータを保存できる', () => {
      const data = {
        year: 2025,
        notes: '特別控除: ¥3,000万円',
      };

      saveToStorage('special-chars', data);
      const retrieved = getFromStorage('special-chars');

      expect(retrieved).toEqual(data);
    });

    test('nullや未定義値を適切に処理できる', () => {
      const data = {
        year: 2025,
        optionalField: null,
        anotherField: undefined,
      };

      saveToStorage('null-test', data);
      const retrieved = getFromStorage('null-test');

      expect(retrieved.year).toBe(2025);
    });
  });

  describe('エラーハンドリング', () => {
    test('無効なキーでの取得は安全に処理される', () => {
      expect(() => getFromStorage('')).not.toThrow();
      expect(getFromStorage('')).toBeNull();
    });

    test('無効なデータの保存は安全に処理される', () => {
      const circularData: any = { year: 2025 };
      circularData.self = circularData;

      expect(() => saveToStorage('circular', circularData)).not.toThrow();
    });

    test('存在しないキーの削除は安全に処理される', () => {
      const result = deleteFromStorage('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('パフォーマンス', () => {
    test('大量のデータを保存できる', () => {
      const records = Array(100).fill(null).map((_, i) => ({
        year: 2025,
        id: `record-${i}`,
        value: Math.random() * 10000000,
      }));

      records.forEach((record, i) => {
        saveToStorage(`record-${i}`, record);
      });

      const retrieved = getFromStorage('record-0');
      expect(retrieved).toBeDefined();
    });

    test('高速に読み書きできる', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        saveToStorage(`perf-${i}`, { value: i });
        getFromStorage(`perf-${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 100回の読み書きが1秒以内に完了することを確認
      expect(duration).toBeLessThan(1000);
    });
  });
});
