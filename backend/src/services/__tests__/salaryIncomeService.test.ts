import {
  calculateSalaryIncome,
  calculateSalaryIncomeDeduction,
  calculateDependentDeduction,
  SalaryIncomeInput,
} from '../salaryIncomeService';
import { defaultTaxYear } from '../taxRules';

const baseInput = (overrides: Partial<SalaryIncomeInput> = {}): SalaryIncomeInput => ({
  annualSalary: 5000000,
  withheldTax: 0,
  socialInsurance: 0,
  ...overrides,
});

describe('Salary Income Service', () => {
  describe('calculateSalaryIncomeDeduction - 給与所得控除', () => {
    test('令和6年分: 最低保障額55万円', () => {
      expect(calculateSalaryIncomeDeduction(1000000, 2024)).toBe(550000);
    });

    test('令和7年分: 最低保障額65万円', () => {
      expect(calculateSalaryIncomeDeduction(1000000, 2025)).toBe(650000);
      expect(calculateSalaryIncomeDeduction(1900000, 2025)).toBe(650000);
    });

    test.each([
      [1700000, 580000],
      [2500000, 830000],
      [5000000, 1440000],
      [7000000, 1800000],
      [10000000, 1950000],
      [20000000, 1950000],
    ])('令和6年分: 収入 %p 円 → 控除 %p 円', (salary, expected) => {
      expect(calculateSalaryIncomeDeduction(salary, 2024)).toBe(expected);
    });

    test('660万円未満は4,000円単位の表（別表第五）で計算', () => {
      // 5,002,000円 → 5,000,000円として計算（給与所得 3,560,000円）→ 控除 1,442,000円
      expect(calculateSalaryIncomeDeduction(5002000, 2024)).toBe(1442000);
    });
  });

  describe('calculateDependentDeduction - 扶養控除', () => {
    test('一般の扶養親族は1人38万円', () => {
      expect(calculateDependentDeduction(0)).toBe(0);
      expect(calculateDependentDeduction(1)).toBe(380000);
      expect(calculateDependentDeduction(3)).toBe(1140000);
    });
  });

  describe('calculateSalaryIncome - 令和6年分', () => {
    test('年収500万円・扶養1人・配偶者あり: 所得税及び復興特別所得税と還付額', () => {
      const result = calculateSalaryIncome(
        baseInput({
          fiscalYear: 2024,
          withheldTax: 500000,
          socialInsurance: 600000,
          lifeInsurance: 80000,
          dependents: 1,
          spouseDeduction: true,
        })
      );

      expect(result.taxYear).toBe(2024);
      expect(result.isProvisional).toBe(false);
      expect(result.salaryIncomeDeduction).toBe(1440000);
      expect(result.salaryIncome).toBe(3560000);
      expect(result.basicDeduction).toBe(480000);
      expect(result.dependentDeduction).toBe(380000);
      expect(result.spouseDeduction).toBe(380000);
      expect(result.lifeInsurance).toBe(80000);
      expect(result.totalDeduction).toBe(1920000);
      expect(result.taxableIncome).toBe(1640000);
      expect(result.baseIncomeTax).toBe(82000);
      expect(result.reconstructionTax).toBe(1722);
      expect(result.estimatedTax).toBe(83722);
      expect(result.withheldTax).toBe(500000);
      expect(result.taxPayable).toBe(0);
      expect(result.taxRefund).toBe(416278);
    });
  });

  describe('calculateSalaryIncome - 令和7年分（税制改正後）', () => {
    test('同じ条件でも基礎控除68万円が適用され税額が下がる', () => {
      const result = calculateSalaryIncome(
        baseInput({
          fiscalYear: 2025,
          withheldTax: 500000,
          socialInsurance: 600000,
          lifeInsurance: 80000,
          dependents: 1,
          spouseDeduction: true,
        })
      );

      expect(result.basicDeduction).toBe(680000);
      expect(result.taxableIncome).toBe(1440000);
      expect(result.baseIncomeTax).toBe(72000);
      expect(result.reconstructionTax).toBe(1512);
      expect(result.estimatedTax).toBe(73512);
      expect(result.taxRefund).toBe(426488);
    });

    test('年収160万円は所得税がかからず、源泉徴収税額は全額還付', () => {
      const result = calculateSalaryIncome(
        baseInput({ fiscalYear: 2025, annualSalary: 1600000, withheldTax: 10000 })
      );

      expect(result.salaryIncome).toBe(950000);
      expect(result.basicDeduction).toBe(950000);
      expect(result.taxableIncome).toBe(0);
      expect(result.estimatedTax).toBe(0);
      expect(result.taxRefund).toBe(10000);
    });

    test('源泉徴収税額が不足する場合は納付（100円未満切捨て）', () => {
      const result = calculateSalaryIncome(
        baseInput({ fiscalYear: 2025, annualSalary: 6000000, socialInsurance: 900000, withheldTax: 150000 })
      );

      expect(result.salaryIncome).toBe(4360000);
      expect(result.basicDeduction).toBe(680000);
      expect(result.taxableIncome).toBe(2780000);
      expect(result.baseIncomeTax).toBe(180500);
      expect(result.reconstructionTax).toBe(3790);
      expect(result.estimatedTax).toBe(184290);
      expect(result.taxPayable).toBe(34200);
      expect(result.taxRefund).toBe(0);
    });
  });

  describe('calculateSalaryIncome - 令和8年分（令和8年度税制改正後）', () => {
    test('年収500万円: 基礎控除104万円・給与所得控除は同額', () => {
      const result = calculateSalaryIncome(
        baseInput({
          fiscalYear: 2026,
          withheldTax: 500000,
          socialInsurance: 600000,
          lifeInsurance: 80000,
          dependents: 1,
          spouseDeduction: true,
        })
      );

      expect(result.isProvisional).toBe(false);
      expect(result.notice).toBeUndefined();
      expect(result.salaryIncome).toBe(3560000);
      expect(result.basicDeduction).toBe(1040000);
      expect(result.totalDeduction).toBe(2480000);
      expect(result.taxableIncome).toBe(1080000);
      expect(result.baseIncomeTax).toBe(54000);
      expect(result.reconstructionTax).toBe(1134);
      expect(result.estimatedTax).toBe(55134);
      expect(result.taxRefund).toBe(444866);
    });

    test('年収178万円までは所得税がかからない（給与所得控除74万円 + 基礎控除104万円）', () => {
      const at178 = calculateSalaryIncome(baseInput({ fiscalYear: 2026, annualSalary: 1780000 }));
      const at179 = calculateSalaryIncome(baseInput({ fiscalYear: 2026, annualSalary: 1790000 }));

      expect(at178.salaryIncome).toBe(1040000);
      expect(at178.estimatedTax).toBe(0);
      expect(at179.taxableIncome).toBe(10000);
      expect(at179.estimatedTax).toBe(510);
    });
  });

  describe('calculateSalaryIncome - 配偶者控除の所得制限', () => {
    test.each([
      [10000000, 380000], // 給与所得 8,050,000円
      [11000000, 260000], // 給与所得 9,050,000円
      [11500000, 130000], // 給与所得 9,550,000円
      [12000000, 0], // 給与所得 10,050,000円
    ])('年収 %p 円 → 配偶者控除 %p 円', (annualSalary, expected) => {
      const result = calculateSalaryIncome(baseInput({ fiscalYear: 2025, annualSalary, spouseDeduction: true }));
      expect(result.spouseDeduction).toBe(expected);
    });

    test('配偶者控除を選択しない場合は0', () => {
      const result = calculateSalaryIncome(baseInput({ fiscalYear: 2025, spouseDeduction: false }));
      expect(result.spouseDeduction).toBe(0);
    });
  });

  describe('calculateSalaryIncome - 入力値の扱い', () => {
    test('生命保険料控除は12万円が上限', () => {
      const result = calculateSalaryIncome(baseInput({ lifeInsurance: 200000 }));
      expect(result.lifeInsurance).toBe(120000);
    });

    test('収入0円でも計算でき、税額は0', () => {
      const result = calculateSalaryIncome(baseInput({ annualSalary: 0 }));
      expect(result.salaryIncome).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.estimatedTax).toBe(0);
      expect(result.taxPayable).toBe(0);
      expect(result.taxRefund).toBe(0);
    });

    test('控除が所得を上回っても課税所得は0', () => {
      const result = calculateSalaryIncome(baseInput({ annualSalary: 3000000, socialInsurance: 5000000 }));
      expect(result.taxableIncome).toBe(0);
    });

    test('年分省略時は前年分として計算', () => {
      expect(calculateSalaryIncome(baseInput()).taxYear).toBe(defaultTaxYear());
    });

    test('2028年分以後は暫定ルールで計算し注意書きを返す', () => {
      const result = calculateSalaryIncome(baseInput({ fiscalYear: 2028 }));
      expect(result.isProvisional).toBe(true);
      expect(result.notice).toContain('2028年分');
    });

    test('対応外の年分はエラー', () => {
      expect(() => calculateSalaryIncome(baseInput({ fiscalYear: 2019 }))).toThrow('2019年分');
    });
  });
});
