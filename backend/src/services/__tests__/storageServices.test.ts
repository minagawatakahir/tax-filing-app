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
});
