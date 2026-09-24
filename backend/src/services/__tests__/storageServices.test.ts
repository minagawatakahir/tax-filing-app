import {
  saveSalaryIncomeRecord,
  getSalaryIncomeRecords,
  deleteSalaryIncomeRecord,
} from '../salaryIncomeStorageService';
import {
  saveRSUIncomeRecord,
  getRSUIncomeRecords,
  getRSUIncomeRecordById,
  deleteRSUIncomeRecord,
  updateRSUIncomeRecord,
  getTotalRSUIncomeByYear,
} from '../rsuIncomeStorageService';
import {
  saveCapitalGainRecord,
  getCapitalGainRecords,
  deleteCapitalGainRecord,
} from '../capitalGainStorageService';
import { SalaryIncomeRecord } from '../../models/SalaryIncomeRecord';
import { RSUIncomeRecord } from '../../models/RSUIncomeRecord';
import { CapitalGainRecord } from '../../models/CapitalGainRecord';

jest.mock('../../models/SalaryIncomeRecord');
jest.mock('../../models/RSUIncomeRecord');
jest.mock('../../models/CapitalGainRecord');

describe('Storage Services - TX-45 Backend Services Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Salary Income Storage Service', () => {
    test('給与所得データを保存できる (upsert)', async () => {
      const mockRecord = {
        _id: 'record-1',
        userId: 'demo-user',
        year: 2025,
        input: {
          annualSalary: 5000000,
          withheldTax: 500000,
          socialInsurance: 100000,
        },
        result: {
          annualSalary: 5000000,
          salaryIncomeDeduction: 1950000,
          salaryIncome: 3050000,
          socialInsurance: 100000,
          lifeInsurance: 0,
          basicDeduction: 480000,
          dependentDeduction: 0,
          spouseDeduction: 0,
          totalDeduction: 480000,
          taxableIncome: 2570000,
          estimatedTax: 514000,
        },
      };

      (SalaryIncomeRecord.findOneAndUpdate as jest.Mock).mockResolvedValue(mockRecord);

      const result = await saveSalaryIncomeRecord(
        {
          userId: 'demo-user',
          year: 2025,
          input: mockRecord.input,
          result: mockRecord.result,
        },
        { upsert: true }
      );

      expect(result).toBeDefined();
      expect(result?.year).toBe(2025);
    });

    test('給与所得データを取得できる (フィルタ付き)', async () => {
      const mockRecords = [
        {
          _id: 'record-1',
          userId: 'demo-user',
          year: 2025,
          input: { annualSalary: 5000000, withheldTax: 500000, socialInsurance: 100000 },
          result: {} as any,
        },
      ];

      (SalaryIncomeRecord.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await getSalaryIncomeRecords({ year: 2025 });

      expect(result).toHaveLength(1);
      expect(result[0].year).toBe(2025);
    });

    test('給与所得記録を削除できる', async () => {
      (SalaryIncomeRecord.findByIdAndDelete as jest.Mock).mockResolvedValue({});

      await deleteSalaryIncomeRecord('record-1');

      expect(SalaryIncomeRecord.findByIdAndDelete).toHaveBeenCalledWith('record-1');
    });

    test('複数年度のデータを管理できる', async () => {
      const mockRecords2024 = [{ _id: 'r1', year: 2024, input: {}, result: {} }];
      const mockRecords2025 = [{ _id: 'r2', year: 2025, input: {}, result: {} }];

      (SalaryIncomeRecord.find as jest.Mock)
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(mockRecords2024) })
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(mockRecords2025) });

      const result2024 = await getSalaryIncomeRecords({ year: 2024 });
      const result2025 = await getSalaryIncomeRecords({ year: 2025 });

      expect(result2024).toHaveLength(1);
      expect(result2025).toHaveLength(1);
      expect(result2024[0].year).toBe(2024);
      expect(result2025[0].year).toBe(2025);
    });
  });

  describe('RSU Income Storage Service', () => {
    test('RSU所得記録を保存できる', async () => {
      const mockRecord = {
        _id: 'rsu-1',
        userId: 'demo-user',
        year: 2025,
        input: [
          {
            companyName: 'TechCorp',
            grantDate: new Date('2025-01-01'),
            vestingDate: new Date('2025-01-15'),
            shares: 100,
            pricePerShareUSD: 150,
          },
        ],
        result: [
          {
            companyName: 'TechCorp',
            vestingDate: new Date('2025-01-15'),
            shares: 100,
            pricePerShareUSD: 150,
            ttmRate: 0.01,
            totalValueJPY: 2100000,
            taxableIncome: 2100000,
          },
        ],
        totalRSUIncome: 2100000,
      };

      (RSUIncomeRecord.findOne as jest.Mock).mockResolvedValue(null);
      (RSUIncomeRecord.prototype.save as jest.Mock).mockResolvedValue(mockRecord);

      const result = await saveRSUIncomeRecord(
        'demo-user',
        2025,
        mockRecord.input,
        mockRecord.result,
        2100000
      );

      expect(result).toBeDefined();
      expect(result?.totalRSUIncome).toBe(2100000);
    });

    test('保存したRSU記録を取得できる', async () => {
      const mockRecords = [
        {
          _id: 'rsu-1',
          userId: 'demo-user',
          year: 2025,
          input: [],
          result: [],
          totalRSUIncome: 2100000,
        },
      ];

      (RSUIncomeRecord.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await getRSUIncomeRecords('demo-user', 2025);

      expect(result).toHaveLength(1);
      expect(result[0].year).toBe(2025);
    });

    test('複数のRSU記録を保存・取得できる', async () => {
      const mockRecords = [
        {
          _id: 'rsu-1',
          userId: 'demo-user',
          year: 2025,
          input: [],
          result: [],
          totalRSUIncome: 2100000,
        },
        {
          _id: 'rsu-2',
          userId: 'demo-user',
          year: 2025,
          input: [],
          result: [],
          totalRSUIncome: 1500000,
        },
      ];

      (RSUIncomeRecord.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await getRSUIncomeRecords('demo-user', 2025);

      expect(result).toHaveLength(2);
    });

    test('RSU記録を削除できる', async () => {
      (RSUIncomeRecord.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'rsu-1' });

      const result = await deleteRSUIncomeRecord('rsu-1');

      expect(result).toBe(true);
    });

    test('RSU記録をIDで取得できる', async () => {
      const mockRecord = {
        _id: 'rsu-1',
        userId: 'demo-user',
        year: 2025,
        totalRSUIncome: 2100000,
      };

      (RSUIncomeRecord.findById as jest.Mock).mockResolvedValue(mockRecord);

      const result = await getRSUIncomeRecordById('rsu-1');

      expect(result).toBeDefined();
      expect(result?._id).toBe('rsu-1');
    });

    test('RSU記録を更新できる', async () => {
      const mockRecord = {
        _id: 'rsu-1',
        totalRSUIncome: 2500000,
      };

      (RSUIncomeRecord.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockRecord);

      const result = await updateRSUIncomeRecord('rsu-1', { totalRSUIncome: 2500000 });

      expect(result).toBeDefined();
      expect(result?.totalRSUIncome).toBe(2500000);
    });

    test('年度別にRSU記録を取得できる', async () => {
      const mockRecords2024 = [{ _id: 'rsu-2024', year: 2024, totalRSUIncome: 1000000 }];
      const mockRecords2025 = [{ _id: 'rsu-2025', year: 2025, totalRSUIncome: 2100000 }];

      (RSUIncomeRecord.find as jest.Mock)
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(mockRecords2024) })
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(mockRecords2025) });

      const result2024 = await getRSUIncomeRecords('demo-user', 2024);
      const result2025 = await getRSUIncomeRecords('demo-user', 2025);

      expect(result2024).toHaveLength(1);
      expect(result2025).toHaveLength(1);
    });

    test('年度別の合計RSU所得を取得できる', async () => {
      const mockRecords = [
        { totalRSUIncome: 1000000 },
        { totalRSUIncome: 1500000 },
      ];

      (RSUIncomeRecord.find as jest.Mock).mockResolvedValue(mockRecords);

      const result = await getTotalRSUIncomeByYear('demo-user', 2025);

      expect(result).toBe(2500000);
    });
  });

  describe('Capital Gain Storage Service', () => {
    test('譲渡所得記録を保存できる', async () => {
      const mockRecord = {
        _id: 'cg-1',
        userId: 'demo-user',
        fiscalYear: 2025,
        propertyId: 'property-001',
        input: {
          propertyId: 'property-001',
          saleDate: new Date('2025-06-01'),
          salePrice: 50000000,
          acquisitionCost: 30000000,
          improvementCost: 2000000,
          sellingExpenses: 1500000,
          ownershipPeriod: 5,
        },
        result: {
          saleAmount: 50000000,
          acquisitionCost: 30000000,
          transferExpenses: 1500000,
          capitalGain: 16500000,
          specialDeduction: 0,
          taxableCapitalGain: 16500000,
          ownershipPeriod: { years: 5, months: 0 },
          transferType: 'long-term' as const,
          taxRate: 0.20,
          incomeTax: 3300000,
          residentTax: 0,
          reconstructionTax: 0,
          totalTax: 3300000,
        },
      };

      (CapitalGainRecord.prototype.save as jest.Mock).mockResolvedValue(mockRecord);

      const result = await saveCapitalGainRecord({
        userId: 'demo-user',
        fiscalYear: 2025,
        propertyId: 'property-001',
        input: mockRecord.input,
        result: mockRecord.result,
      });

      expect(result).toBeDefined();
      expect(result?.fiscalYear).toBe(2025);
    });

    test('譲渡所得記録を取得できる', async () => {
      const mockRecords = [
        {
          _id: 'cg-1',
          fiscalYear: 2025,
          propertyId: 'property-001',
          input: {},
          result: {},
        },
      ];

      (CapitalGainRecord.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await getCapitalGainRecords({ fiscalYear: 2025 });

      expect(result).toHaveLength(1);
      expect(result[0].fiscalYear).toBe(2025);
    });

    test('複数の譲渡所得記録を保存・取得できる', async () => {
      const mockRecords = [
        { _id: 'cg-1', fiscalYear: 2025, propertyId: 'property-001', input: {}, result: {} },
        { _id: 'cg-2', fiscalYear: 2025, propertyId: 'property-002', input: {}, result: {} },
      ];

      (CapitalGainRecord.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await getCapitalGainRecords({ fiscalYear: 2025 });

      expect(result).toHaveLength(2);
    });

    test('譲渡所得記録を削除できる', async () => {
      (CapitalGainRecord.findByIdAndDelete as jest.Mock).mockResolvedValue({});

      await deleteCapitalGainRecord('cg-1');

      expect(CapitalGainRecord.findByIdAndDelete).toHaveBeenCalledWith('cg-1');
    });

    test('年度別に譲渡所得記録を取得できる', async () => {
      const mockRecords2024 = [{ _id: 'cg-2024', fiscalYear: 2024, input: {}, result: {} }];
      const mockRecords2025 = [{ _id: 'cg-2025', fiscalYear: 2025, input: {}, result: {} }];

      (CapitalGainRecord.find as jest.Mock)
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(mockRecords2024) })
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(mockRecords2025) });

      const result2024 = await getCapitalGainRecords({ fiscalYear: 2024 });
      const result2025 = await getCapitalGainRecords({ fiscalYear: 2025 });

      expect(result2024).toHaveLength(1);
      expect(result2025).toHaveLength(1);
    });

    test('propertyIdでフィルタできる', async () => {
      const mockRecords = [{ _id: 'cg-1', propertyId: 'property-001', input: {}, result: {} }];

      (CapitalGainRecord.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await getCapitalGainRecords({ propertyId: 'property-001' });

      expect(result).toHaveLength(1);
    });
  });

  describe('クエリの組み立て（モックへの呼び出し内容を検証）', () => {
    const chain = (value: unknown) => ({ sort: jest.fn().mockResolvedValue(value) });

    test('給与: upsert は userId・年度で検索し、上書き・新規作成・バリデーションを指定する', async () => {
      (SalaryIncomeRecord.findOneAndUpdate as jest.Mock).mockResolvedValue({ year: 2025 });
      const params = { userId: 'user-1', year: 2025, input: {} as any, result: {} as any };

      await saveSalaryIncomeRecord(params, { upsert: true });

      expect(SalaryIncomeRecord.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user-1', year: 2025 },
        { $set: params },
        { upsert: true, new: true, runValidators: true }
      );
    });

    test('給与: upsert で userId が無い場合は demo-user で検索する', async () => {
      (SalaryIncomeRecord.findOneAndUpdate as jest.Mock).mockResolvedValue({});

      await saveSalaryIncomeRecord({ year: 2024, input: {} as any, result: {} as any } as any, { upsert: true });

      expect((SalaryIncomeRecord.findOneAndUpdate as jest.Mock).mock.calls[0][0]).toEqual({
        userId: 'demo-user',
        year: 2024,
      });
    });

    test('給与: upsert を指定しない場合は新規ドキュメントとして save する', async () => {
      const save = jest.fn().mockResolvedValue({ _id: 'new' });
      (SalaryIncomeRecord as unknown as jest.Mock).mockImplementation(() => ({ save }));

      await saveSalaryIncomeRecord({ userId: 'u', year: 2025, input: {} as any, result: {} as any });

      expect(SalaryIncomeRecord).toHaveBeenCalledWith(expect.objectContaining({ userId: 'u', year: 2025 }));
      expect(save).toHaveBeenCalledTimes(1);
      expect(SalaryIncomeRecord.findOneAndUpdate).not.toHaveBeenCalled();
    });

    test('給与: フィルタから検索条件を作り、作成日時の新しい順に並べる', async () => {
      const sorted = chain([]);
      (SalaryIncomeRecord.find as jest.Mock).mockReturnValue(sorted);
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 11, 31);

      await getSalaryIncomeRecords({ userId: 'u', year: 2025, startDate, endDate });

      expect(SalaryIncomeRecord.find).toHaveBeenCalledWith({
        userId: 'u',
        year: 2025,
        createdAt: { $gte: startDate, $lte: endDate },
      });
      expect(sorted.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    test('給与: フィルタが空なら全件を検索する', async () => {
      (SalaryIncomeRecord.find as jest.Mock).mockReturnValue(chain([]));

      await getSalaryIncomeRecords({});

      expect(SalaryIncomeRecord.find).toHaveBeenCalledWith({});
    });

    test('RSU: userId と年度で検索し、年度・作成日時の新しい順に並べる', async () => {
      const sorted = chain([]);
      (RSUIncomeRecord.find as jest.Mock).mockReturnValue(sorted);

      await getRSUIncomeRecords('u', 2025);

      expect(RSUIncomeRecord.find).toHaveBeenCalledWith({ userId: 'u', year: 2025 });
      expect(sorted.sort).toHaveBeenCalledWith({ year: -1, createdAt: -1 });
    });

    test('RSU: 年度を省略すると userId のみで検索する', async () => {
      (RSUIncomeRecord.find as jest.Mock).mockReturnValue(chain([]));

      await getRSUIncomeRecords('u');

      expect(RSUIncomeRecord.find).toHaveBeenCalledWith({ userId: 'u' });
    });

    test('RSU: 更新は更新後のドキュメントを返すよう指定する', async () => {
      (RSUIncomeRecord.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      await updateRSUIncomeRecord('id-1', { totalRSUIncome: 100 });

      expect(RSUIncomeRecord.findByIdAndUpdate).toHaveBeenCalledWith('id-1', { totalRSUIncome: 100 }, { new: true });
    });

    test('RSU: 削除対象が無ければ false を返す', async () => {
      (RSUIncomeRecord.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(deleteRSUIncomeRecord('missing')).resolves.toBe(false);
      expect(RSUIncomeRecord.findByIdAndDelete).toHaveBeenCalledWith('missing');
    });

    test('RSU: 年度別合計は userId・年度で検索して合算する', async () => {
      (RSUIncomeRecord.find as jest.Mock).mockResolvedValue([{ totalRSUIncome: 1000 }, { totalRSUIncome: 2500 }]);

      await expect(getTotalRSUIncomeByYear('u', 2025)).resolves.toBe(3500);
      expect(RSUIncomeRecord.find).toHaveBeenCalledWith({ userId: 'u', year: 2025 });
    });

    test('譲渡所得: 年度・物件IDのフィルタから検索条件を作る', async () => {
      const sorted = chain([]);
      (CapitalGainRecord.find as jest.Mock).mockReturnValue(sorted);

      await getCapitalGainRecords({ userId: 'u', fiscalYear: 2025, propertyId: 'p-1' });

      expect(CapitalGainRecord.find).toHaveBeenCalledWith({ userId: 'u', fiscalYear: 2025, propertyId: 'p-1' });
      expect(sorted.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    test('譲渡所得: 削除は指定したIDで行う', async () => {
      (CapitalGainRecord.findByIdAndDelete as jest.Mock).mockResolvedValue({});

      await deleteCapitalGainRecord('cg-1');

      expect(CapitalGainRecord.findByIdAndDelete).toHaveBeenCalledWith('cg-1');
    });
  });
});
