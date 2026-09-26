/**
 * 確定申告（総合）の計算のテスト
 * 数値はすべて架空。期待値は申告書 第一表と計算明細書の手順どおりに手計算したもの。
 */
import { calculateNpoDonationCredit, calculateTaxReturn, TaxReturnInput } from '../taxReturnService';

// 令和7年分: 給与1,200万円 + 不動産所得の赤字85万円 + 寄附（所得控除12万円・認定NPO 3万円）
const baseInput: TaxReturnInput = {
  fiscalYear: 2025,
  salaryRevenue: 12000000,
  withheldTax: 1000000,
  realEstateIncome: -850000,
  socialInsurance: 1500000,
  lifeInsurance: 40000,
  donations: [
    { kind: 'deduction', amount: 120000 },
    { kind: 'npo-credit', amount: 30000 },
  ],
};

describe('calculateTaxReturn: 所得金額等と損益通算', () => {
  test('給与所得と不動産所得の赤字を損益通算する', () => {
    const r = calculateTaxReturn(baseInput);
    expect(r.salaryIncome).toBe(10050000); // 12,000,000 − 1,950,000
    expect(r.realEstateIncomeForTotal).toBe(-850000);
    expect(r.realEstateLossNotOffset).toBe(0);
    expect(r.totalIncome).toBe(9200000);
  });

  test('土地等を取得するための負債利子に相当する損失は通算しない', () => {
    const r = calculateTaxReturn({ ...baseInput, landLoanInterest: 300000 });
    expect(r.realEstateLossNotOffset).toBe(300000);
    expect(r.realEstateIncomeForTotal).toBe(-550000);
    expect(r.totalIncome).toBe(9500000);
  });

  test('負債利子が損失より大きいときは、損失の全額が通算できない（0になる）', () => {
    const r = calculateTaxReturn({ ...baseInput, landLoanInterest: 1000000 });
    expect(r.realEstateLossNotOffset).toBe(850000);
    expect(r.realEstateIncomeForTotal).toBe(0);
    expect(r.totalIncome).toBe(10050000);
  });

  test('不動産所得が黒字なら負債利子の制限は関係しない', () => {
    const r = calculateTaxReturn({ ...baseInput, realEstateIncome: 400000, landLoanInterest: 300000 });
    expect(r.realEstateLossNotOffset).toBe(0);
    expect(r.totalIncome).toBe(10450000);
  });

  test('所得の合計が赤字なら0として扱い、注意を出す', () => {
    const r = calculateTaxReturn({ ...baseInput, salaryRevenue: 0, realEstateIncome: -500000, donations: [] });
    expect(r.totalIncome).toBe(0);
    expect(r.taxableIncome).toBe(0);
    expect(r.notices.join()).toContain('赤字');
  });
});

describe('calculateTaxReturn: 所得控除と税額（申告書の順序どおり）', () => {
  test('全体の計算を申告書の手順で再現する（還付）', () => {
    const r = calculateTaxReturn(baseInput);
    expect(r.basicDeduction).toBe(580000); // 合計所得920万円（令和7年分）
    expect(r.deductionsBeforeDonation).toBe(2120000); // 1,500,000 + 40,000 + 580,000
    expect(r.donationDeduction).toBe(118000); // 120,000 − 2,000
    expect(r.totalDeductions).toBe(2238000);
    expect(r.taxableIncome).toBe(6962000);
    expect(r.calculatedTax).toBe(965260); // 6,962,000 × 23% − 636,000
    expect(r.marginalRate).toBe(0.23);
    expect(r.npoDonationCredit).toBe(12000); // 30,000 × 40%
    expect(r.baseIncomeTax).toBe(953260);
    expect(r.reconstructionTax).toBe(20018); // 953,260 × 2.1%（1円未満切捨て）
    expect(r.totalIncomeTax).toBe(973278);
    expect(r.declaredTax).toBe(-26722); // 還付は切り捨てない
    expect(r.taxRefund).toBe(26722);
    expect(r.taxPayable).toBe(0);
  });

  test('申告納税額を100円未満切捨てにしてから予定納税額を差し引く', () => {
    const r = calculateTaxReturn({ ...baseInput, withheldTax: 800000, estimatedTaxPrepaid: 200000 });
    expect(r.declaredTax).toBe(173200); // 173,278 → 173,200
    expect(r.taxRefund).toBe(26800); // 200,000 − 173,200
    expect(r.taxPayable).toBe(0);
  });

  test('予定納税額が申告納税額より少なければ、差額を納める', () => {
    const r = calculateTaxReturn({ ...baseInput, withheldTax: 800000, estimatedTaxPrepaid: 150000 });
    expect(r.taxPayable).toBe(23200); // 173,200 − 150,000
    expect(r.taxRefund).toBe(0);
  });

  test('寄附金控除は総所得金額等の40%が上限', () => {
    const r = calculateTaxReturn({
      fiscalYear: 2025,
      salaryRevenue: 0,
      withheldTax: 0,
      realEstateIncome: 1000000,
      socialInsurance: 0,
      donations: [{ kind: 'deduction', amount: 500000 }],
    });
    expect(r.donationDeduction).toBe(398000); // min(500,000, 400,000) − 2,000
  });

  test('生命保険料控除と地震保険料控除は上限で頭打ちにする', () => {
    const r = calculateTaxReturn({ ...baseInput, lifeInsurance: 200000, earthquakeInsurance: 90000 });
    expect(r.lifeInsurance).toBe(120000);
    expect(r.earthquakeInsurance).toBe(50000);
  });

  test('配偶者控除と扶養控除を所得控除に含める', () => {
    const r = calculateTaxReturn({ ...baseInput, spouseDeduction: true, dependents: 2 });
    expect(r.spouseDeduction).toBe(260000); // 合計所得920万円 → 900万超950万以下
    expect(r.dependentDeduction).toBe(760000);
    expect(r.deductionsBeforeDonation).toBe(2120000 + 260000 + 760000);
  });

  test('未対応の寄附（公益社団法人等・政党等）は計算に含めず、注意を出す', () => {
    const r = calculateTaxReturn({
      ...baseInput,
      donations: [
        ...(baseInput.donations || []),
        { kind: 'public-interest-credit', amount: 50000 },
        { kind: 'political-credit', amount: 50000 },
      ],
    });
    const plain = calculateTaxReturn(baseInput);
    expect(r.totalIncomeTax).toBe(plain.totalIncomeTax);
    expect(r.notices.join()).toContain('公益社団法人等寄附金特別控除');
    expect(r.notices.join()).toContain('政党等寄附金特別控除');
  });

  test('寄附がなければ寄附金控除も税額控除も0', () => {
    const r = calculateTaxReturn({ ...baseInput, donations: [] });
    expect(r.donationDeduction).toBe(0);
    expect(r.npoDonationCredit).toBe(0);
  });

  test('確定していない年分は暫定である旨を知らせる', () => {
    const r = calculateTaxReturn({ ...baseInput, fiscalYear: 2028 });
    expect(r.isProvisional).toBe(true);
    expect(r.notices.length).toBeGreaterThan(0);
  });

  test('確定している年分には注意を出さない', () => {
    const r = calculateTaxReturn(baseInput);
    expect(r.isProvisional).toBe(false);
    expect(r.notices).toEqual([]);
  });
});

describe('calculateNpoDonationCredit: 計算明細書の①〜⑬', () => {
  test('②が2千円以上なら、⑦の40%（100円未満切捨て）', () => {
    expect(calculateNpoDonationCredit(30000, 120000, 9200000, 965260)).toBe(12000);
  });

  test('②が2千円未満なら、残りの足切り額（⑧）を差し引く', () => {
    expect(calculateNpoDonationCredit(10000, 0, 5000000, 500000)).toBe(3200); // (10,000 − 2,000) × 40%
  });

  test('⑨は100円未満切捨て', () => {
    expect(calculateNpoDonationCredit(12345, 5000, 5000000, 500000)).toBe(4900); // 4,938 → 4,900
  });

  test('所得税額の25%（100円未満切捨て）が上限', () => {
    expect(calculateNpoDonationCredit(100000, 0, 5000000, 10000)).toBe(2500);
  });

  test('寄附金の合計は総所得金額等の40%が上限（⑥ = ⑤ − ②）', () => {
    expect(calculateNpoDonationCredit(100000, 350000, 1000000, 1000000)).toBe(20000); // ⑦ = 50,000
  });

  test('認定NPO法人等への寄附がなければ0', () => {
    expect(calculateNpoDonationCredit(0, 120000, 9200000, 965260)).toBe(0);
  });
});
