import request from 'supertest';
import express, { Express } from 'express';
import realEstateIncomeListRoutes from '../realEstateIncomeListRoutes';
import { RealEstateIncome } from '../../models/RealEstateIncome';
import { createProperty, updateProperty } from '../../services/propertyService';
import { adjustIncomeForSale } from '../../services/realEstateIncomeStorageService';

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/real-estate-income-list', realEstateIncomeListRoutes);
});

const baseProperty = (propertyId: string, overrides: Record<string, unknown> = {}) => ({
  propertyId,
  propertyName: `物件 ${propertyId}`,
  address: '東京都テスト区1-1',
  landValue: 10000000,
  buildingValue: 20000000,
  totalValue: 30000000,
  acquisitionDate: '2020-04-01',
  acquisitionCost: 30000000,
  category: 'residential' as const,
  ...overrides,
});

const income = (propertyId: string, fiscalYear: number, overrides: Record<string, unknown> = {}) => {
  const monthlyRent = (overrides.monthlyRent as number) ?? 100000;
  const months = (overrides.months as number) ?? 12;
  const totalExpenses = (overrides.totalExpenses as number) ?? 300000;
  const totalIncome = monthlyRent * months;
  return {
    fiscalYear,
    propertyId,
    propertyName: `物件 ${propertyId}`,
    monthlyRent,
    months,
    otherIncome: 0,
    totalIncome,
    managementFee: 0,
    repairCost: 0,
    propertyTax: 0,
    loanInterest: 0,
    insurance: 0,
    utilities: 0,
    otherExpenses: 0,
    depreciationExpense: totalExpenses,
    totalExpenses,
    realEstateIncome: totalIncome - totalExpenses,
  };
};

describe('GET /api/real-estate-income-list/:year', () => {
  it('指定年度のレコードと合計を返す', async () => {
    await createProperty(baseProperty('p-1'));
    await RealEstateIncome.create(income('p-1', 2025));
    await RealEstateIncome.create(income('p-1', 2024));

    const res = await request(app).get('/api/real-estate-income-list/2025').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.records).toHaveLength(1);
    expect(res.body.records[0]).toMatchObject({ fiscalYear: 2025, propertyId: 'p-1', totalIncome: 1200000 });
    expect(res.body.summary).toEqual({
      totalIncome: 1200000,
      totalExpenses: 300000,
      totalRealEstateIncome: 900000,
      recordCount: 1,
    });
  });

  it('売却済み物件のレコードがあっても一覧が空にならない（売却年は売却月までに調整）', async () => {
    await createProperty(baseProperty('p-active'));
    await createProperty(baseProperty('p-sold', { saleStatus: 'sold', saleDate: '2025-08-31' }));
    await RealEstateIncome.create(income('p-active', 2025));
    await RealEstateIncome.create(income('p-sold', 2025, { monthlyRent: 80000, months: 12, totalExpenses: 100000 }));

    const res = await request(app).get('/api/real-estate-income-list/2025').expect(200);

    expect(res.body.records).toHaveLength(2);
    const sold = res.body.records.find((r: any) => r.propertyId === 'p-sold');
    expect(sold).toMatchObject({ months: 8, totalIncome: 640000, realEstateIncome: 540000, propertyName: '物件 p-sold' });
    expect(typeof sold._id).toBe('string');
    expect(res.body.summary.totalIncome).toBe(1200000 + 640000);
  });

  it('売却した年より前の年度は調整しない', async () => {
    await createProperty(baseProperty('p-sold', { saleStatus: 'sold', saleDate: '2025-08-31' }));
    await RealEstateIncome.create(income('p-sold', 2024));

    const res = await request(app).get('/api/real-estate-income-list/2024').expect(200);

    expect(res.body.records[0]).toMatchObject({ months: 12, totalIncome: 1200000 });
  });

  it('データがなければ空の一覧と0の合計', async () => {
    const res = await request(app).get('/api/real-estate-income-list/2025').expect(200);

    expect(res.body.records).toEqual([]);
    expect(res.body.summary).toEqual({ totalIncome: 0, totalExpenses: 0, totalRealEstateIncome: 0, recordCount: 0 });
  });

  it('年度が4桁の数字でなければ400', async () => {
    await request(app).get('/api/real-estate-income-list/abc').expect(400);
  });
});

describe('DELETE /api/real-estate-income-list/:id', () => {
  it('指定したレコードを削除する', async () => {
    const doc = await RealEstateIncome.create(income('p-1', 2025));

    await request(app).delete(`/api/real-estate-income-list/${doc._id}`).expect(200);

    expect(await RealEstateIncome.countDocuments()).toBe(0);
  });

  it('存在しないIDなら404', async () => {
    await request(app).delete('/api/real-estate-income-list/64b7f0000000000000000000').expect(404);
  });
});

describe('adjustIncomeForSale', () => {
  const rec = { monthlyRent: 100000, months: 12, otherIncome: 5000, totalIncome: 1205000, totalExpenses: 200000, realEstateIncome: 1005000 };

  it('未売却なら変更しない', () => {
    expect(adjustIncomeForSale(rec, { saleStatus: 'active' }, 2025)).toBe(rec);
    expect(adjustIncomeForSale(rec, null, 2025)).toBe(rec);
  });

  it('売却年は売却月までに切り詰める', () => {
    expect(adjustIncomeForSale(rec, { saleStatus: 'sold', saleDate: new Date(2025, 2, 10) }, 2025)).toMatchObject({
      months: 3,
      totalIncome: 305000,
      realEstateIncome: 105000,
    });
  });

  it('売却月までの月数しか入力されていなければ変更しない', () => {
    const short = { ...rec, months: 2, totalIncome: 205000, realEstateIncome: 5000 };
    expect(adjustIncomeForSale(short, { saleStatus: 'sold', saleDate: new Date(2025, 2, 10) }, 2025)).toBe(short);
  });

  it('12月売却なら変更しない', () => {
    expect(adjustIncomeForSale(rec, { saleStatus: 'sold', saleDate: new Date(2025, 11, 20) }, 2025)).toBe(rec);
  });

  it('売却した年より後の年度は賃料0か月（その他の収入のみ）', () => {
    expect(adjustIncomeForSale(rec, { saleStatus: 'sold', saleDate: new Date(2024, 5, 1) }, 2025)).toMatchObject({
      months: 0,
      totalIncome: 5000,
      realEstateIncome: -195000,
    });
  });

  it('売却した年より前の年度は変更しない', () => {
    expect(adjustIncomeForSale(rec, { saleStatus: 'sold', saleDate: new Date(2026, 5, 1) }, 2025)).toBe(rec);
  });
});

describe('物件API: 売却情報', () => {
  it('作成時に売却状態・売却日・売却価格を保存する', async () => {
    const created = await createProperty(
      baseProperty('p-sold', { saleStatus: 'sold', saleDate: '2025-08-31', salePrice: 25000000 })
    );

    expect(created.saleStatus).toBe('sold');
    expect(new Date(created.saleDate as Date).getFullYear()).toBe(2025);
    expect(created.salePrice).toBe(25000000);
  });

  it('更新で売却済みにでき、他の項目は保たれる', async () => {
    const created = await createProperty(baseProperty('p-1', { outstandingLoan: 15000000 }));

    const updated = await updateProperty(String(created._id), { saleStatus: 'sold', saleDate: '2025-08-31' } as any);

    expect(updated?.saleStatus).toBe('sold');
    expect(updated?.outstandingLoan).toBe(15000000);
    expect(updated?.propertyName).toBe('物件 p-1');
  });

  it('不正な売却状態は更新時にも拒否する', async () => {
    const created = await createProperty(baseProperty('p-1'));

    await expect(updateProperty(String(created._id), { saleStatus: 'unknown' } as any)).rejects.toThrow();
  });
});
