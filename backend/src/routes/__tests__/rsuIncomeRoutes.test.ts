/**
 * RSU の保存・PDF出力のテスト（為替レートの出どころの扱い。数値はすべて架空）
 */
import request from 'supertest';
import express, { Express } from 'express';
import PDFDocument from 'pdfkit';
import rsuIncomeRoutes from '../rsuIncomeRoutes';
import { OFFICIAL_TTM_SOURCE, SIMULATED_TTM_SOURCE } from '../../services/ttmRateService';
import { RSUIncomeRecord } from '../../models/RSUIncomeRecord';

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/rsu-income', rsuIncomeRoutes);
});

beforeEach(() => {
  delete process.env.USE_SIMULATED_TTM;
});

afterEach(() => {
  delete process.env.USE_SIMULATED_TTM;
  jest.restoreAllMocks();
});

const input = [
  { companyName: 'Example Inc.', grantDate: '2024-01-01', vestingDate: '2025-02-13', shares: 10, pricePerShareUSD: 100 },
  { companyName: 'Example Inc.', grantDate: '2024-01-01', vestingDate: '2025-05-18', shares: 5, pricePerShareUSD: 120 },
];

type RateFields = { ttmSource?: string; ttmRateDate?: string; isSimulated?: boolean };

const row = (vestingDate: string, shares: number, price: number, rate: number, extra: RateFields) => ({
  companyName: 'Example Inc.',
  vestingDate,
  shares,
  pricePerShareUSD: price,
  ttmRate: rate,
  totalValueJPY: shares * price * rate,
  taxableIncome: shares * price * rate,
  ...extra,
});

const official = [
  row('2025-02-13', 10, 100, 150.5, { ttmSource: OFFICIAL_TTM_SOURCE, ttmRateDate: '2025-02-13', isSimulated: false }),
  row('2025-05-18', 5, 120, 145.25, { ttmSource: OFFICIAL_TTM_SOURCE, ttmRateDate: '2025-05-16', isSimulated: false }),
];

const save = (result: any[]) =>
  request(app)
    .post('/api/rsu-income/save')
    .send({ year: 2025, input, result, totalRSUIncome: result.reduce((s, r) => s + r.totalValueJPY, 0) });

describe('POST /api/rsu-income/save', () => {
  it('為替レートの出どころ・公示日を保存する', async () => {
    await save(official).expect((res) => expect([200, 201]).toContain(res.status));
    const saved = await RSUIncomeRecord.findOne({ year: 2025 }).lean();
    expect(saved!.result.map((r: any) => [r.ttmSource, r.ttmRateDate, r.isSimulated])).toEqual([
      [OFFICIAL_TTM_SOURCE, '2025-02-13', false],
      [OFFICIAL_TTM_SOURCE, '2025-05-16', false],
    ]);
  });

  it('サーバーがシミュレーションで動いているときは、送られた値に関係なくシミュレーションとして保存する', async () => {
    process.env.USE_SIMULATED_TTM = 'true';
    await save(official).expect((res) => expect([200, 201]).toContain(res.status));
    const saved = await RSUIncomeRecord.findOne({ year: 2025 }).lean();
    expect(saved!.result.every((r: any) => r.isSimulated === true && r.ttmSource === SIMULATED_TTM_SOURCE)).toBe(true);
  });
});

describe('GET /api/rsu-income/export-pdf', () => {
  it('すべて公示TTMなら PDF を出力し、公示日と1円未満切捨ての金額を載せる', async () => {
    await save(official);
    const texts: string[] = [];
    const original = PDFDocument.prototype.text;
    jest.spyOn(PDFDocument.prototype, 'text').mockImplementation(function (this: any, ...args: any[]) {
      if (typeof args[0] === 'string') texts.push(args[0]);
      return (original as any).apply(this, args);
    });

    const res = await request(app).get('/api/rsu-income/export-pdf?year=2025').buffer(true).expect(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(texts).toEqual(expect.arrayContaining(['RSU所得一覧', 'レートの公示日', '2025-02-13', '2025-05-16']));
    expect(texts).toContain('¥150,500'); // 10 × 100 × 150.5
    expect(texts).toContain('¥87,150'); // 5 × 120 × 145.25
  });

  it('シミュレーションのレートが含まれていれば 409（PDF を出さない）', async () => {
    await save([official[0], row('2025-05-18', 5, 120, 143.7, { ttmSource: SIMULATED_TTM_SOURCE, ttmRateDate: '2025-05-18', isSimulated: true })]);
    const res = await request(app).get('/api/rsu-income/export-pdf?year=2025').expect(409);
    expect(res.body.error).toContain('シミュレーション 1件');
    expect(res.body.provenance).toMatchObject({ official: 1, simulated: 1, unknown: 0, usableForFiling: false });
  });

  it('出どころの記録がない古い記録が含まれていれば 409', async () => {
    await save([official[0], row('2025-05-18', 5, 120, 145.25, {})]);
    const res = await request(app).get('/api/rsu-income/export-pdf?year=2025').expect(409);
    expect(res.body.error).toContain('出どころ不明 1件');
    expect(res.body.error).toContain('計算し直して保存');
  });
});
