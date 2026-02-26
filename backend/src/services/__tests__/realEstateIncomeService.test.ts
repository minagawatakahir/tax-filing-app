import {
  calculateRentalIncome,
  calculateProportionalAmount,
  RentalIncomeData,
  RealEstateExpense,
} from '../realEstateIncomeService';

describe('Real Estate Income Service', () => {
  describe('calculateRentalIncome', () => {
    it('should calculate rental income correctly', () => {
      const monthlyRent = 150000;
      const months = 12;
      const otherIncome = 24000; // 共益費など

      const result = calculateRentalIncome(monthlyRent, months, otherIncome);

      // 150000 * 12 + 24000 = 1824000
      expect(result).toBe(1824000);
    });

    it('should calculate partial year rental income', () => {
      const monthlyRent = 150000;
      const months = 6; // 半年間のみ賃貸
      const otherIncome = 12000;

      const result = calculateRentalIncome(monthlyRent, months, otherIncome);

      // 150000 * 6 + 12000 = 912000
      expect(result).toBe(912000);
    });

    it('should handle zero other income', () => {
      const monthlyRent = 150000;
      const months = 12;

      const result = calculateRentalIncome(monthlyRent, months, 0);

      // 150000 * 12 = 1800000
      expect(result).toBe(1800000);
    });

    it('should handle default other income parameter', () => {
      const monthlyRent = 150000;
      const months = 12;

      const result = calculateRentalIncome(monthlyRent, months);

      // 150000 * 12 = 1800000 (otherIncome defaults to 0)
      expect(result).toBe(1800000);
    });
  });

  describe('calculateProportionalAmount', () => {
    it('should return full amount for full year (12 months)', () => {
      const annualAmount = 120000;
      const endMonth = 12;

      const result = calculateProportionalAmount(annualAmount, endMonth);

      expect(result).toBe(120000);
    });

    it('should return full amount when endMonth is undefined', () => {
      const annualAmount = 120000;

      const result = calculateProportionalAmount(annualAmount, undefined);

      expect(result).toBe(120000);
    });

    it('should calculate proportional amount for 6 months', () => {
      const annualAmount = 120000;
      const endMonth = 6;

      const result = calculateProportionalAmount(annualAmount, endMonth);

      // 120000 * 6 / 12 = 60000
      expect(result).toBe(60000);
    });

    it('should calculate proportional amount for 3 months', () => {
      const annualAmount = 120000;
      const endMonth = 3;

      const result = calculateProportionalAmount(annualAmount, endMonth);

      // 120000 * 3 / 12 = 30000
      expect(result).toBe(30000);
    });

    it('should round the result', () => {
      const annualAmount = 100000;
      const endMonth = 7;

      const result = calculateProportionalAmount(annualAmount, endMonth);

      // 100000 * 7 / 12 = 58333.333... → 58333
      expect(result).toBe(58333);
    });

    it('should return full amount for endMonth = 0', () => {
      const annualAmount = 120000;
      const endMonth = 0;

      // endMonth < 1 の場合は全額返す実装のため
      const result = calculateProportionalAmount(annualAmount, endMonth);
      expect(result).toBe(120000);
    });

    it('should return full amount for endMonth > 12', () => {
      const annualAmount = 120000;
      const endMonth = 13;

      // endMonth >= 12 の場合は全額返す実装のため
      const result = calculateProportionalAmount(annualAmount, endMonth);
      expect(result).toBe(120000);
    });
  });

  describe('Real Estate Income Calculation - Integration', () => {
    it('should handle basic income and expense scenario', () => {
      // 基本的な収入・経費シナリオのテスト
      const monthlyRent = 150000;
      const months = 12;
      const otherIncome = 24000;

      const totalIncome = calculateRentalIncome(monthlyRent, months, otherIncome);

      expect(totalIncome).toBe(1824000);
    });

    it('should handle proportional calculations for partial year', () => {
      // 売却年度の按分計算
      const annualInsurance = 50000;
      const saleMonth = 6; // 6月に売却

      const proportionalInsurance = calculateProportionalAmount(annualInsurance, saleMonth);

      // 50000 * 6 / 12 = 25000
      expect(proportionalInsurance).toBe(25000);
    });
  });
});
