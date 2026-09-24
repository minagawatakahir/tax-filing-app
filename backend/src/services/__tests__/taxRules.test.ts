/**
 * taxRules のユニットテスト
 * 期待値は国税庁の速算表・所得税法別表第五・令和7年度税制改正の内容から手計算したもの
 */
import {
  calculateBaseIncomeTax,
  calculateIncomeTaxBreakdown,
  calculateReconstructionTax,
  calculateResidentTax,
  calculateSalaryIncomeAmount,
  calculateSalaryIncomeDeductionAmount,
  defaultTaxYear,
  getBasicDeduction,
  getResidentBasicDeduction,
  getSpouseDeduction,
  isProvisionalTaxYear,
  provisionalNotice,
  resolveTaxYear,
  settleIncomeTax,
  toTaxableIncome,
} from '../taxRules';

describe('resolveTaxYear / 暫定判定', () => {
  test('未指定なら前年分（確定申告の対象年分）', () => {
    expect(resolveTaxYear()).toBe(defaultTaxYear());
    expect(defaultTaxYear(new Date(2026, 8, 24))).toBe(2025);
    expect(defaultTaxYear(new Date(2027, 1, 16))).toBe(2026);
    // ルールが確定している年分を超えない
    expect(defaultTaxYear(new Date(2035, 0, 1))).toBe(2027);
  });

  test('令和元年分以前は対応外としてエラー', () => {
    expect(() => resolveTaxYear(2019)).toThrow('2019年分');
    expect(() => resolveTaxYear(2024.5)).toThrow();
  });

  test('令和9年分までは確定、令和10年分以後は暫定扱いで注意書きが付く', () => {
    expect(isProvisionalTaxYear(2026)).toBe(false);
    expect(isProvisionalTaxYear(2027)).toBe(false);
    expect(isProvisionalTaxYear(2028)).toBe(true);
    expect(provisionalNotice(2027)).toBeUndefined();
    expect(provisionalNotice(2028)).toContain('暫定');
  });
});

describe('getBasicDeduction - 所得税の基礎控除', () => {
  test.each([
    [0, 480000],
    [24000000, 480000],
    [24000001, 320000],
    [24500000, 320000],
    [24500001, 160000],
    [25000000, 160000],
    [25000001, 0],
  ])('令和6年分: 合計所得 %p 円 → %p 円', (income, expected) => {
    expect(getBasicDeduction(income, 2024)).toBe(expected);
  });

  test.each([
    [0, 950000],
    [1320000, 950000],
    [1320001, 880000],
    [3360000, 880000],
    [3360001, 680000],
    [4890000, 680000],
    [4890001, 630000],
    [6550000, 630000],
    [6550001, 580000],
    [23500000, 580000],
    [23500001, 480000],
    [24000001, 320000],
    [25000001, 0],
  ])('令和7年分: 合計所得 %p 円 → %p 円', (income, expected) => {
    expect(getBasicDeduction(income, 2025)).toBe(expected);
  });

  test.each([
    [0, 1040000],
    [1320001, 1040000],
    [4890000, 1040000],
    [4890001, 670000],
    [6550000, 670000],
    [6550001, 620000],
    [23500000, 620000],
    [23500001, 480000],
    [24000001, 320000],
    [25000001, 0],
  ])('令和8年分・令和9年分: 合計所得 %p 円 → %p 円', (income, expected) => {
    expect(getBasicDeduction(income, 2026)).toBe(expected);
    expect(getBasicDeduction(income, 2027)).toBe(expected);
  });

  test.each([
    [1320000, 990000],
    [1320001, 620000],
    [23500000, 620000],
    [23500001, 480000],
    [25000001, 0],
  ])('令和10年分以後: 合計所得 %p 円 → %p 円', (income, expected) => {
    expect(getBasicDeduction(income, 2028)).toBe(expected);
  });
});

describe('getResidentBasicDeduction - 住民税の基礎控除', () => {
  test.each([
    [24000000, 430000],
    [24000001, 290000],
    [24500001, 150000],
    [25000001, 0],
  ])('合計所得 %p 円 → %p 円', (income, expected) => {
    expect(getResidentBasicDeduction(income)).toBe(expected);
  });
});

describe('calculateSalaryIncomeAmount - 給与所得（別表第五）', () => {
  test.each([
    [0, 0],
    [550999, 0],
    [551000, 1000],
    [1618999, 1068999],
    [1619500, 1069000],
    [1621000, 1070000],
    [1623000, 1072000],
    [1625000, 1074000],
    [1628000, 1076800],
    [1799999, 1177600],
    [1800000, 1180000],
    [3600000, 2440000],
    [5000000, 3560000],
    [5002000, 3560000], // 4,000円単位の切捨て
    [6599999, 4836800],
    [6600000, 4840000],
    [8500000, 6550000],
    [10000000, 8050000],
  ])('令和6年分: 収入 %p 円 → 給与所得 %p 円', (salary, expected) => {
    expect(calculateSalaryIncomeAmount(salary, 2024)).toBe(expected);
  });

  test.each([
    [650999, 0],
    [651000, 1000],
    [1600000, 950000],
    [1899999, 1249999],
    [1900000, 1250000],
    [3000000, 2020000],
    [5000000, 3560000],
    [10000000, 8050000],
  ])('令和7年分: 収入 %p 円 → 給与所得 %p 円', (salary, expected) => {
    expect(calculateSalaryIncomeAmount(salary, 2025)).toBe(expected);
  });

  test.each([
    [740999, 0],
    [741000, 1000],
    [2000000, 1260000],
    [2190999, 1450999],
    [2191000, 1451000],
    [2192999, 1451000],
    [2193000, 1453000],
    [2196000, 1456000],
    [2199999, 1456000],
    [2200000, 1460000],
    [3000000, 2020000],
    [5000000, 3560000],
    [10000000, 8050000],
  ])('令和8年分: 収入 %p 円 → 給与所得 %p 円', (salary, expected) => {
    expect(calculateSalaryIncomeAmount(salary, 2026)).toBe(expected);
  });

  test('給与所得控除額 = 収入 − 給与所得（年分ごとの最低保障額）', () => {
    expect(calculateSalaryIncomeDeductionAmount(1000000, 2026)).toBe(740000);
    expect(calculateSalaryIncomeDeductionAmount(1000000, 2025)).toBe(650000);
    expect(calculateSalaryIncomeDeductionAmount(1000000, 2024)).toBe(550000);
    expect(calculateSalaryIncomeDeductionAmount(20000000, 2025)).toBe(1950000);
  });

  test('結果は常に整数（浮動小数点誤差がない）', () => {
    for (let salary = 1628000; salary < 6600000; salary += 7919) {
      expect(Number.isInteger(calculateSalaryIncomeAmount(salary, 2024))).toBe(true);
      expect(Number.isInteger(calculateSalaryIncomeAmount(salary, 2025))).toBe(true);
    }
  });
});

describe('getSpouseDeduction - 配偶者控除（納税者の所得制限）', () => {
  test.each([
    [9000000, 380000],
    [9000001, 260000],
    [9500000, 260000],
    [9500001, 130000],
    [10000000, 130000],
    [10000001, 0],
  ])('納税者の合計所得 %p 円 → %p 円', (income, expected) => {
    expect(getSpouseDeduction(income)).toBe(expected);
  });
});

describe('所得税（速算表）と端数処理', () => {
  test('適用税率は「下限以上」で判定（1,950,000円から10%）', () => {
    const { marginalRate: at1949 } = calculateIncomeTaxBreakdown(1949999, 2025);
    const { marginalRate: at1950 } = calculateIncomeTaxBreakdown(1950000, 2025);
    expect(at1949).toBe(0.05);
    expect(at1950).toBe(0.1);
  });

  test('課税総所得金額は1,000円未満切捨て', () => {
    expect(toTaxableIncome(1234567)).toBe(1234000);
    expect(toTaxableIncome(999)).toBe(0);
    expect(toTaxableIncome(-100)).toBe(0);
  });

  test.each([
    [0, 0],
    [1000, 50],
    [1949000, 97450],
    [1950000, 97500],
    [3300000, 232500],
    [6950000, 962500],
    [9000000, 1434000],
    [18000000, 4404000],
    [20000000, 5204000], // 40%区分（旧実装は35%で誤り）
    [40000000, 13204000],
    [40001000, 13204450],
  ])('課税所得 %p 円 → 基準所得税額 %p 円', (taxable, expected) => {
    expect(calculateBaseIncomeTax(taxable)).toBe(expected);
  });

  test('復興特別所得税は2.1%（1円未満切捨て）、2037年分まで', () => {
    expect(calculateReconstructionTax(135500, 2024)).toBe(2845);
    expect(calculateReconstructionTax(100, 2025)).toBe(2);
    expect(calculateReconstructionTax(135500, 2037)).toBe(2845);
    expect(calculateReconstructionTax(135500, 2038)).toBe(0);
  });

  test('calculateIncomeTaxBreakdown は切捨て・復興特別所得税・合計をまとめて返す', () => {
    expect(calculateIncomeTaxBreakdown(2330999, 2024)).toEqual({
      taxableIncome: 2330000,
      baseIncomeTax: 135500,
      reconstructionTax: 2845,
      totalIncomeTax: 138345,
      marginalRate: 0.1,
    });
  });
});

describe('settleIncomeTax - 源泉徴収税額との差引', () => {
  test('納付の場合は100円未満切捨て', () => {
    expect(settleIncomeTax(117925, 100000)).toEqual({ taxPayable: 17900, taxRefund: 0 });
  });

  test('還付の場合は差額をそのまま還付', () => {
    expect(settleIncomeTax(138345, 150000)).toEqual({ taxPayable: 0, taxRefund: 11655 });
  });

  test('同額なら納付も還付も0', () => {
    expect(settleIncomeTax(50000, 50000)).toEqual({ taxPayable: 0, taxRefund: 0 });
  });
});

describe('calculateResidentTax - 住民税（概算）', () => {
  test('所得割10%（課税標準1,000円未満・税額100円未満切捨て）+ 均等割5,000円', () => {
    // 課税標準 2,561,999 → 2,561,000 → 所得割 256,100
    expect(calculateResidentTax(2561999)).toBe(256100 + 5000);
  });

  test('課税標準が0以下なら0', () => {
    expect(calculateResidentTax(0)).toBe(0);
    expect(calculateResidentTax(-1)).toBe(0);
  });
});
