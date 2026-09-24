/**
 * 確定申告（総合）API のテスト（数値はすべて架空）
 */
import request from 'supertest';
import express, { Express } from 'express';
import taxReturnRoutes from '../taxReturnRoutes';
import { RealEstateIncome } from '../../models/RealEstateIncome';
import { TaxReturnInput } from '../../models/TaxReturnInput';
import { saveSalaryIncomeRecord } from '../../services/salaryIncomeStorageService';
import { calculateSalaryIncome } from '../../services/salaryIncomeService';

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/tax-return', taxReturnRoutes);
});

const salaryInput = {
  annualSalary: 12000000,
  withheldTax: 1000000,
  socialInsurance: 1500000,
  lifeInsurance: 40000,
  dependents: 0,
  spouseDeduction: false,
};

const saveSalary = (year: number, input = salaryInput) =>
  saveSalaryIncomeRecord(
    { year, input, result: calculateSalaryIncome({ ...input, fiscalYear: year }) as any },
    { upsert: true }
  );

const income = (propertyId: string, fiscalYear: number, totalIncome: number, totalExpenses: number) => ({
  fiscalYear,
  propertyId,
  propertyName: `物件 ${propertyId}`,
  monthlyRent: 0,
  months: 12,
  otherIncome: totalIncome,
  totalIncome,
  managementFee: 0,
  repairCost: 0,
  propertyTax: 0,
  loanInterest: 0,
  insurance: 0,
  utilities: 0,
  otherExpenses: totalExpenses,
  depreciationExpense: 0,
  totalExpenses,
  realEstateIncome: totalIncome - totalExpenses,
});

/** 2025年度の不動産所得: +900,000 と −1,750,000 で合計 −850,000 */
const seedRealEstate = async () => {
  await RealEstateIncome.create(income('p-1', 2025, 1200000, 300000));
  await RealEstateIncome.create(income('common', 2025, 0, 1750000));
};

const extras = {
  donations: [
    { kind: 'deduction', amount: 120000, name: '自治体への寄附' },
    { kind: 'npo-credit', amount: 30000 },
  ],
  estimatedTaxPrepaid: 0,
};

describe('GET /api/tax-return/:year', () => {
  it('給与所得が未保存なら計算せず、不足している情報を返す', async () => {
    await seedRealEstate();
    const res = await request(app).get('/api/tax-return/2025').expect(200);
    expect(res.body.data.result).toBeNull();
    expect(res.body.data.missing).toEqual(['給与所得']);
    expect(res.body.data.sources.realEstate).toMatchObject({ recordCount: 2, totalRealEstateIncome: -850000 });
  });

  it('保存済みの給与所得と不動産所得を集めて損益通算する', async () => {
    await saveSalary(2025);
    await seedRealEstate();
    const res = await request(app).get('/api/tax-return/2025').expect(200);
    const { data } = res.body;
    expect(data.saved).toBe(false);
    expect(data.missing).toEqual([]);
    expect(data.result).toMatchObject({ salaryIncome: 10050000, realEstateIncome: -850000, totalIncome: 9200000 });
    expect(data.result.donationDeduction).toBe(0);
  });

  it('ほかの年度のデータは使わない', async () => {
    await saveSalary(2024);
    await RealEstateIncome.create(income('p-1', 2024, 1000000, 0));
    const res = await request(app).get('/api/tax-return/2025').expect(200);
    expect(res.body.data.result).toBeNull();
    expect(res.body.data.sources.realEstate.recordCount).toBe(0);
  });

  it('年度の形式が不正なら400', async () => {
    await request(app).get('/api/tax-return/20x5').expect(400);
  });
});

describe('PUT /api/tax-return/:year', () => {
  it('追加入力を保存し、寄附金控除・税額控除を含めて計算する', async () => {
    await saveSalary(2025);
    await seedRealEstate();
    const res = await request(app).put('/api/tax-return/2025').send(extras).expect(200);
    const { data } = res.body;
    expect(data.saved).toBe(true);
    expect(data.extras.donations).toEqual(extras.donations);
    expect(data.result).toMatchObject({
      donationDeduction: 118000,
      taxableIncome: 6962000,
      npoDonationCredit: 12000,
      totalIncomeTax: 973278,
      taxRefund: 26722,
      taxPayable: 0,
    });
  });

  it('同じ年度に保存し直すと上書きする（1件のまま）', async () => {
    await saveSalary(2025);
    await request(app).put('/api/tax-return/2025').send(extras).expect(200);
    const res = await request(app)
      .put('/api/tax-return/2025')
      .send({ donations: [], estimatedTaxPrepaid: 200000 })
      .expect(200);
    expect(await TaxReturnInput.countDocuments({ fiscalYear: 2025 })).toBe(1);
    expect(res.body.data.extras).toMatchObject({ donations: [], estimatedTaxPrepaid: 200000 });
  });

  it('不正な寄附の種類は400で、保存しない', async () => {
    await request(app)
      .put('/api/tax-return/2025')
      .send({ donations: [{ kind: 'unknown', amount: 1000 }] })
      .expect(400);
    expect(await TaxReturnInput.countDocuments({})).toBe(0);
  });

  it('金額が0以下の寄附は保存しない', async () => {
    const res = await request(app)
      .put('/api/tax-return/2025')
      .send({ donations: [{ kind: 'deduction', amount: 0 }, { kind: 'deduction', amount: -5 }] })
      .expect(200);
    expect(res.body.data.extras.donations).toEqual([]);
  });
});

describe('POST /api/tax-return/calculate', () => {
  it('保存せずに計算する', async () => {
    const res = await request(app)
      .post('/api/tax-return/calculate')
      .send({
        fiscalYear: 2025,
        salaryRevenue: 12000000,
        withheldTax: 1000000,
        realEstateIncome: -850000,
        socialInsurance: 1500000,
        lifeInsurance: 40000,
        ...extras,
      })
      .expect(200);
    expect(res.body.data.taxRefund).toBe(26722);
    expect(await TaxReturnInput.countDocuments({})).toBe(0);
  });
});
