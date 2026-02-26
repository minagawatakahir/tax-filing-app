import {
  calculateSalaryIncome,
  calculateSalaryIncomeDeduction,
  calculateDependentDeduction,
  SalaryIncomeInput,
} from '../salaryIncomeService';

describe('Salary Income Service', () => {
  describe('calculateSalaryIncomeDeduction', () => {
    it('should return 550000 for salary <= 1625000', () => {
      expect(calculateSalaryIncomeDeduction(1000000)).toBe(550000);
      expect(calculateSalaryIncomeDeduction(1625000)).toBe(550000);
    });

    it('should calculate correctly for salary between 1625000 and 1800000', () => {
      // (1700000 * 0.4) - 100000 = 580000
      expect(calculateSalaryIncomeDeduction(1700000)).toBe(580000);
    });

    it('should calculate correctly for salary between 1800000 and 3600000', () => {
      // (2500000 * 0.3) + 80000 = 830000
      expect(calculateSalaryIncomeDeduction(2500000)).toBe(830000);
    });

    it('should calculate correctly for salary between 3600000 and 6600000', () => {
      // (5000000 * 0.2) + 440000 = 1440000
      expect(calculateSalaryIncomeDeduction(5000000)).toBe(1440000);
    });

    it('should calculate correctly for salary between 6600000 and 8500000', () => {
      // (7000000 * 0.1) + 1100000 = 1800000
      expect(calculateSalaryIncomeDeduction(7000000)).toBe(1800000);
    });

    it('should return 1950000 (maximum) for salary > 8500000', () => {
      expect(calculateSalaryIncomeDeduction(10000000)).toBe(1950000);
      expect(calculateSalaryIncomeDeduction(20000000)).toBe(1950000);
    });
  });

  describe('calculateDependentDeduction', () => {
    it('should return 0 for no dependents', () => {
      expect(calculateDependentDeduction(0)).toBe(0);
    });

    it('should return 380000 per dependent', () => {
      expect(calculateDependentDeduction(1)).toBe(380000);
      expect(calculateDependentDeduction(2)).toBe(760000);
      expect(calculateDependentDeduction(3)).toBe(1140000);
    });
  });

  describe('calculateSalaryIncome', () => {
    it('should calculate salary income correctly for basic scenario', () => {
      const input: SalaryIncomeInput = {
        annualSalary: 5000000,
        withheldTax: 500000,
        socialInsurance: 600000,
        lifeInsurance: 80000,
        dependents: 1,
        spouseDeduction: true,
      };

      const result = calculateSalaryIncome(input);

      // 給与所得控除: 5000000 * 0.2 + 440000 = 1440000
      expect(result.salaryIncomeDeduction).toBe(1440000);

      // 給与所得: 5000000 - 1440000 = 3560000
      expect(result.salaryIncome).toBe(3560000);

      // 扶養控除: 1 * 380000 = 380000
      expect(result.dependentDeduction).toBe(380000);

      // 配偶者控除: 380000
      expect(result.spouseDeduction).toBe(380000);

      // 生命保険料控除: 80000（上限以下）
      expect(result.lifeInsurance).toBe(80000);

      // 基礎控除: 480000
      expect(result.basicDeduction).toBe(480000);

      // 社会保険料控除: 600000
      expect(result.socialInsurance).toBe(600000);

      // 総控除額: 600000 + 80000 + 480000 + 380000 + 380000 = 1920000
      expect(result.totalDeduction).toBe(1920000);

      // 課税所得: 3560000 - 1920000 = 1640000
      expect(result.taxableIncome).toBe(1640000);

      // 推定税額: 1640000 * 0.05 = 82000
      expect(result.estimatedTax).toBe(82000);
    });

    it('should handle zero values correctly', () => {
      const input: SalaryIncomeInput = {
        annualSalary: 0,
        withheldTax: 0,
        socialInsurance: 0,
      };

      const result = calculateSalaryIncome(input);

      expect(result.salaryIncome).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.estimatedTax).toBe(0);
    });

    it('should cap life insurance deduction at 120000', () => {
      const input: SalaryIncomeInput = {
        annualSalary: 5000000,
        withheldTax: 500000,
        socialInsurance: 600000,
        lifeInsurance: 200000, // 上限を超える
        dependents: 0,
        spouseDeduction: false,
      };

      const result = calculateSalaryIncome(input);

      // 生命保険料控除は120000で上限
      expect(result.lifeInsurance).toBe(120000);
    });

    it('should calculate taxable income as non-negative', () => {
      const input: SalaryIncomeInput = {
        annualSalary: 1000000,
        withheldTax: 0,
        socialInsurance: 800000,
        dependents: 2,
        spouseDeduction: true,
      };

      const result = calculateSalaryIncome(input);

      // 課税所得は負にならない
      expect(result.taxableIncome).toBeGreaterThanOrEqual(0);
    });

    it('should handle high income with multiple deductions', () => {
      const input: SalaryIncomeInput = {
        annualSalary: 15000000,
        withheldTax: 2000000,
        socialInsurance: 1000000,
        lifeInsurance: 120000,
        dependents: 3,
        spouseDeduction: true,
      };

      const result = calculateSalaryIncome(input);

      // 給与所得控除（上限）: 1950000
      expect(result.salaryIncomeDeduction).toBe(1950000);

      // 給与所得: 15000000 - 1950000 = 13050000
      expect(result.salaryIncome).toBe(13050000);

      // 総控除額が合計される
      expect(result.totalDeduction).toBeGreaterThan(0);

      // 推定税額が計算される
      expect(result.estimatedTax).toBeGreaterThan(0);
    });
  });
});
