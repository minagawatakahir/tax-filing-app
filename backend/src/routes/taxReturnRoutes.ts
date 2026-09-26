/**
 * 確定申告（総合）API
 *   GET  /api/tax-return/:year      保存済みの給与所得・不動産所得・追加入力を集めて計算する
 *   PUT  /api/tax-return/:year      追加入力（寄附金・予定納税など）を保存する（年度ごとに1件）
 *   POST /api/tax-return/calculate  保存せずに計算する
 */
import { Request, Response, Router } from 'express';
import { DONATION_KINDS, TaxReturnInput } from '../models/TaxReturnInput';
import { getSalaryIncomeRecords } from '../services/salaryIncomeStorageService';
import { calculateFiscalYearTotal } from '../services/realEstateIncomeStorageService';
import { calculateTaxReturn, DonationInput, TaxReturnInput as CalcInput } from '../services/taxReturnService';

const router = Router();
const DEFAULT_USER = 'demo-user';

const parseYear = (value: unknown): number | null =>
  typeof value === 'string' && /^\d{4}$/.test(value) ? parseInt(value, 10) : null;

const toAmount = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

/** 追加入力を検証して正規化する（不正な寄附の種類はエラー） */
const normalizeExtras = (body: any) => {
  const donations: DonationInput[] = [];
  for (const d of Array.isArray(body?.donations) ? body.donations : []) {
    if (!DONATION_KINDS.includes(d?.kind)) {
      throw new Error(`寄附の種類が不正です: ${d?.kind}`);
    }
    const amount = toAmount(d.amount);
    if (amount > 0) donations.push({ kind: d.kind, amount, ...(d.name ? { name: String(d.name) } : {}) });
  }
  return {
    donations,
    estimatedTaxPrepaid: toAmount(body?.estimatedTaxPrepaid),
    landLoanInterest: toAmount(body?.landLoanInterest),
    earthquakeInsurance: toAmount(body?.earthquakeInsurance),
  };
};

/** 年度の申告データを集めて計算する */
const buildTaxReturn = async (fiscalYear: number, userId: string) => {
  const [salaryRecords, realEstate, saved] = await Promise.all([
    getSalaryIncomeRecords({ userId, year: fiscalYear }),
    calculateFiscalYearTotal(fiscalYear),
    TaxReturnInput.findOne({ userId, fiscalYear }).lean(),
  ]);
  const salary = salaryRecords[0]?.input ?? null;
  const extras = {
    donations: (saved?.donations ?? []).map(({ kind, amount, name }) => ({ kind, amount, ...(name ? { name } : {}) })),
    estimatedTaxPrepaid: saved?.estimatedTaxPrepaid ?? 0,
    landLoanInterest: saved?.landLoanInterest ?? 0,
    earthquakeInsurance: saved?.earthquakeInsurance ?? 0,
  };

  const missing: string[] = [];
  if (!salary) missing.push('給与所得');

  const input: CalcInput = {
    fiscalYear,
    salaryRevenue: salary?.annualSalary ?? 0,
    withheldTax: salary?.withheldTax ?? 0,
    socialInsurance: salary?.socialInsurance ?? 0,
    lifeInsurance: salary?.lifeInsurance ?? 0,
    dependents: salary?.dependents ?? 0,
    spouseDeduction: salary?.spouseDeduction ?? false,
    realEstateIncome: realEstate.totalRealEstateIncome,
    ...extras,
  };

  return {
    fiscalYear,
    sources: {
      salary,
      realEstate: {
        recordCount: realEstate.recordCount,
        totalIncome: realEstate.totalIncome,
        totalExpenses: realEstate.totalExpenses,
        totalRealEstateIncome: realEstate.totalRealEstateIncome,
      },
    },
    extras,
    saved: Boolean(saved),
    missing,
    result: salary ? calculateTaxReturn(input) : null,
  };
};

router.post('/calculate', (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const extras = normalizeExtras(body);
    const result = calculateTaxReturn({
      fiscalYear: body.fiscalYear,
      salaryRevenue: toAmount(body.salaryRevenue),
      withheldTax: toAmount(body.withheldTax),
      realEstateIncome: Number(body.realEstateIncome) || 0,
      socialInsurance: toAmount(body.socialInsurance),
      lifeInsurance: toAmount(body.lifeInsurance),
      dependents: toAmount(body.dependents),
      spouseDeduction: Boolean(body.spouseDeduction),
      ...extras,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/:year', async (req: Request, res: Response) => {
  const year = parseYear(req.params.year);
  if (year === null) {
    return res.status(400).json({ success: false, error: '年度は4桁の数字で指定してください' });
  }
  try {
    res.json({ success: true, data: await buildTaxReturn(year, DEFAULT_USER) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:year', async (req: Request, res: Response) => {
  const year = parseYear(req.params.year);
  if (year === null) {
    return res.status(400).json({ success: false, error: '年度は4桁の数字で指定してください' });
  }
  let extras;
  try {
    extras = normalizeExtras(req.body);
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
  try {
    await TaxReturnInput.findOneAndUpdate(
      { userId: DEFAULT_USER, fiscalYear: year },
      { $set: extras },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: await buildTaxReturn(year, DEFAULT_USER) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
