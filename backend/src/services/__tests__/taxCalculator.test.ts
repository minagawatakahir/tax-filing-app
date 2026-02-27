import {
  calculateIncomeTax,
  calculateResidentTax,
  calculateSocialInsurance,
  calculateTotalTaxAndInsurance,
  getTaxBracket,
} from '../taxCalculator';

describe('taxCalculator - TX-45 Backend Services Tests', () => {
  describe('getTaxBracket', () => {
    test('195万円以下の所得の税率を取得できる', () => {
      const bracket = getTaxBracket(1000000);

      expect(bracket.rate).toBe(0.05);
      expect(bracket.deduction).toBeDefined();
    });

    test('195万円超330万円以下の所得の税率を取得できる', () => {
      const bracket = getTaxBracket(2500000);

      expect(bracket.rate).toBe(0.1);
      expect(bracket.deduction).toBeDefined();
    });

    test('330万円超695万円以下の所得の税率を取得できる', () => {
      const bracket = getTaxBracket(5000000);

      expect(bracket.rate).toBe(0.2);
      expect(bracket.deduction).toBeDefined();
    });

    test('695万円超900万円以下の所得の税率を取得できる', () => {
      const bracket = getTaxBracket(8000000);

      expect(bracket.rate).toBe(0.23);
      expect(bracket.deduction).toBeDefined();
    });

    test('900万円超1800万円以下の所得の税率を取得できる', () => {
      const bracket = getTaxBracket(15000000);

      expect(bracket.rate).toBe(0.33);
      expect(bracket.deduction).toBeDefined();
    });

    test('1800万円超4000万円以下の所得の税率を取得できる', () => {
      const bracket = getTaxBracket(30000000);

      expect(bracket.rate).toBe(0.4);
      expect(bracket.deduction).toBeDefined();
    });

    test('4000万円超の所得の税率を取得できる', () => {
      const bracket = getTaxBracket(50000000);

      expect(bracket.rate).toBe(0.45);
      expect(bracket.deduction).toBeDefined();
    });
  });

  describe('calculateIncomeTax', () => {
    test('給与所得のみの所得税が計算される', () => {
      const salary = 5000000;
      const result = calculateIncomeTax(salary);

      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    test('給与所得と配当所得を合算した所得税が計算される', () => {
      const salary = 5000000;
      const dividend = 1000000;
      const result = calculateIncomeTax(salary + dividend);

      expect(result).toBeGreaterThan(calculateIncomeTax(salary));
    });

    test('0円の所得に対して0円の所得税が計算される', () => {
      const result = calculateIncomeTax(0);

      expect(result).toBe(0);
    });

    test('基礎控除が適用される', () => {
      const smallIncome = 480000;
      const result = calculateIncomeTax(smallIncome);

      expect(result).toBeLessThanOrEqual(0);
    });

    test('高額所得の所得税が正しく計算される', () => {
      const largeIncome = 50000000;
      const result = calculateIncomeTax(largeIncome);

      expect(result).toBeGreaterThan(0);
      // 最高税率45%が適用される
      expect(result / largeIncome).toBeLessThan(0.45);
    });

    test('複数年度の所得に対応できる', () => {
      const income2024 = 5000000;
      const income2025 = 6000000;

      const tax2024 = calculateIncomeTax(income2024);
      const tax2025 = calculateIncomeTax(income2025);

      expect(tax2025).toBeGreaterThan(tax2024);
    });
  });

  describe('calculateResidentTax', () => {
    test('住民税が計算される', () => {
      const salary = 5000000;
      const result = calculateResidentTax(salary);

      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    test('住民税の税率は約10%である', () => {
      const salary = 5000000;
      const result = calculateResidentTax(salary);

      // 基礎控除を考慮した計算
      expect(result / salary).toBeLessThan(0.15);
      expect(result / salary).toBeGreaterThan(0.05);
    });

    test('0円の所得に対して0円の住民税が計算される', () => {
      const result = calculateResidentTax(0);

      expect(result).toBe(0);
    });

    test('高額所得の住民税が計算される', () => {
      const largeIncome = 50000000;
      const result = calculateResidentTax(largeIncome);

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calculateSocialInsurance', () => {
    test('社会保険料が計算される', () => {
      const salary = 5000000;
      const result = calculateSocialInsurance(salary);

      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    test('給与に対する社会保険料率が約15%である', () => {
      const salary = 5000000;
      const result = calculateSocialInsurance(salary);

      expect(result / salary).toBeGreaterThan(0.1);
      expect(result / salary).toBeLessThan(0.2);
    });

    test('0円の給与に対して0円の社会保険料が計算される', () => {
      const result = calculateSocialInsurance(0);

      expect(result).toBe(0);
    });

    test('高額給与の社会保険料が計算される', () => {
      const largeIncome = 50000000;
      const result = calculateSocialInsurance(largeIncome);

      expect(result).toBeGreaterThan(0);
    });

    test('上限額が適用される場合がある', () => {
      const veryLargeIncome = 200000000;
      const normalIncome = 50000000;

      const resultLarge = calculateSocialInsurance(veryLargeIncome);
      const resultNormal = calculateSocialInsurance(normalIncome);

      // 社会保険料に上限がある場合、比率が小さくなるはず
      expect(resultLarge / veryLargeIncome).toBeLessThan(resultNormal / normalIncome);
    });
  });

  describe('calculateTotalTaxAndInsurance', () => {
    test('所得税、住民税、社会保険料の合計が計算される', () => {
      const salary = 5000000;
      const result = calculateTotalTaxAndInsurance(salary);

      expect(result).toHaveProperty('incomeTax');
      expect(result).toHaveProperty('residentTax');
      expect(result).toHaveProperty('socialInsurance');
      expect(result).toHaveProperty('total');
    });

    test('合計額が各税の合算と一致する', () => {
      const salary = 5000000;
      const result = calculateTotalTaxAndInsurance(salary);

      const expectedTotal = 
        result.incomeTax + 
        result.residentTax + 
        result.socialInsurance;

      expect(result.total).toBe(expectedTotal);
    });

    test('0円の所得に対して全て0になる', () => {
      const result = calculateTotalTaxAndInsurance(0);

      expect(result.incomeTax).toBe(0);
      expect(result.residentTax).toBe(0);
      expect(result.socialInsurance).toBe(0);
      expect(result.total).toBe(0);
    });

    test('高額所得の税負担が計算される', () => {
      const largeIncome = 50000000;
      const result = calculateTotalTaxAndInsurance(largeIncome);

      expect(result.total).toBeGreaterThan(0);
      // 税負担率は50%未満であるべき
      expect(result.total / largeIncome).toBeLessThan(0.5);
    });

    test('異なる所得レベルで比較できる', () => {
      const income1 = 3000000;
      const income2 = 5000000;
      const income3 = 10000000;

      const result1 = calculateTotalTaxAndInsurance(income1);
      const result2 = calculateTotalTaxAndInsurance(income2);
      const result3 = calculateTotalTaxAndInsurance(income3);

      expect(result1.total).toBeLessThan(result2.total);
      expect(result2.total).toBeLessThan(result3.total);
    });

    test('複数の所得源がある場合を計算できる', () => {
      const salary = 3000000;
      const dividend = 1000000;
      const rentalIncome = 1500000;
      const totalIncome = salary + dividend + rentalIncome;

      const result = calculateTotalTaxAndInsurance(totalIncome);

      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('税計算のエッジケース', () => {
    test('最低税率が適用される所得', () => {
      const income = 100000;
      const result = calculateIncomeTax(income);

      expect(result).toBeGreaterThanOrEqual(0);
    });

    test('税率区分の境界値での計算', () => {
      // 195万円（第1段階と第2段階の境界）
      const boundaryIncome = 1950000;
      const result = calculateIncomeTax(boundaryIncome);

      expect(result).toBeGreaterThan(0);
    });

    test('基礎控除との相互作用', () => {
      const incomeAboveBasicDeduction = 1000000;
      const result = calculateIncomeTax(incomeAboveBasicDeduction);

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('実務的なシナリオ', () => {
    test('サラリーマンの税負担を計算できる', () => {
      const salary = 5000000;
      const result = calculateTotalTaxAndInsurance(salary);

      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.residentTax).toBeGreaterThan(0);
      expect(result.socialInsurance).toBeGreaterThan(0);

      // 手取り額を計算
      const netIncome = salary - result.total;
      expect(netIncome).toBeGreaterThan(0);
      expect(netIncome).toBeLessThan(salary);
    });

    test('フリーランスの税負担を計算できる', () => {
      const businessIncome = 5000000;
      const businessExpense = 1500000;
      const taxableIncome = businessIncome - businessExpense;

      const result = calculateTotalTaxAndInsurance(taxableIncome);

      expect(result.total).toBeGreaterThan(0);
    });

    test('複合所得者の税負担を計算できる', () => {
      const salary = 4000000;
      const rentalIncome = 2000000;
      const totalIncome = salary + rentalIncome;

      const result = calculateTotalTaxAndInsurance(totalIncome);

      expect(result.incomeTax).toBeGreaterThan(calculateIncomeTax(salary));
    });
  });
});
