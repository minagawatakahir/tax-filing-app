import {
  calculateTax,
  generateTaxSavingsSuggestions,
  IncomeData,
  ExpenseData,
  TaxCalculationResult,
} from '../taxCalculator';
import { defaultTaxYear } from '../taxRules';

describe('taxCalculator - TX-45 Backend Services Tests', () => {
  describe('calculateTax - 基本的な計算', () => {
    test('総所得と総経費が正しく計算される', () => {
      const income: IncomeData = {
        businessIncome: 5000000,
        otherIncome: 500000,
      };
      const expense: ExpenseData = {
        rentExpense: 600000,
        utilityExpense: 200000,
        suppliesExpense: 150000,
        travelExpense: 100000,
        communicationExpense: 50000,
        otherExpense: 100000,
      };

      const result = calculateTax(income, expense);

      expect(result.totalIncome).toBe(5500000); // 5000000 + 500000
      expect(result.totalExpense).toBe(1200000); // 600000+200000+150000+100000+50000+100000
    });

    test('optional フィールドがない場合も計算できる', () => {
      const income: IncomeData = {
        businessIncome: 3000000,
      };
      const expense: ExpenseData = {
        rentExpense: 400000,
        utilityExpense: 100000,
        suppliesExpense: 50000,
        travelExpense: 50000,
        communicationExpense: 30000,
      };

      const result = calculateTax(income, expense);

      expect(result.totalIncome).toBe(3000000);
      expect(result.totalExpense).toBe(630000);
      expect(result.netIncome).toBe(2370000);
    });

    test('純所得が負の場合、0にフロアされる', () => {
      const income: IncomeData = {
        businessIncome: 500000,
      };
      const expense: ExpenseData = {
        rentExpense: 600000,
        utilityExpense: 100000,
        suppliesExpense: 50000,
        travelExpense: 0,
        communicationExpense: 0,
      };

      const result = calculateTax(income, expense);

      expect(result.netIncome).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.incomeTax).toBe(0);
    });
  });

  const noExpense: ExpenseData = {
    rentExpense: 0,
    utilityExpense: 0,
    suppliesExpense: 0,
    travelExpense: 0,
    communicationExpense: 0,
  };
  const business = (amount: number): IncomeData => ({ businessIncome: amount });

  describe('calculateTax - 年分別の基礎控除', () => {
    test('令和6年分: 基礎控除48万円', () => {
      const result = calculateTax(business(1000000), noExpense, 2024);

      expect(result.taxYear).toBe(2024);
      expect(result.basicDeduction).toBe(480000);
      expect(result.taxableIncome).toBe(520000);
    });

    test('令和7年分: 合計所得132万円以下は基礎控除95万円', () => {
      const result = calculateTax(business(1000000), noExpense, 2025);

      expect(result.basicDeduction).toBe(950000);
      expect(result.taxableIncome).toBe(50000);
    });

    test('令和7年分: 合計所得300万円は基礎控除88万円', () => {
      const result = calculateTax(business(3000000), noExpense, 2025);

      expect(result.basicDeduction).toBe(880000);
      expect(result.taxableIncome).toBe(2120000);
    });

    test('年分を省略した場合は前年分で計算', () => {
      const result = calculateTax(business(1000000), noExpense);

      expect(result.taxYear).toBe(defaultTaxYear());
      expect(result.isProvisional).toBe(false);
      expect(result.notice).toBeUndefined();
    });

    test('令和8年分: 合計所得489万円以下は基礎控除104万円', () => {
      const result = calculateTax(business(4000000), noExpense, 2026);

      expect(result.basicDeduction).toBe(1040000);
      expect(result.taxableIncome).toBe(2960000);
      // 2,960,000 × 10% − 97,500 = 198,500、復興 = floor(198,500 × 2.1%) = 4,168
      expect(result.baseIncomeTax).toBe(198500);
      expect(result.reconstructionTax).toBe(4168);
    });

    test('合計所得2,500万円超は基礎控除なし', () => {
      const result = calculateTax(business(30000000), noExpense, 2024);

      expect(result.basicDeduction).toBe(0);
      expect(result.taxableIncome).toBe(30000000);
    });

    test('基礎控除により課税所得がゼロになる場合は税額ゼロ', () => {
      const result = calculateTax(business(400000), noExpense, 2024);

      expect(result.taxableIncome).toBe(0);
      expect(result.baseIncomeTax).toBe(0);
      expect(result.reconstructionTax).toBe(0);
      expect(result.incomeTax).toBe(0);
    });

    test('2028年分以後は暫定ルール（注意書き付き）、基礎控除は令和10年分以後の額', () => {
      const result = calculateTax(business(1000000), noExpense, 2028);

      expect(result.isProvisional).toBe(true);
      expect(result.notice).toContain('暫定');
      expect(result.basicDeduction).toBe(990000);
    });

    test('対応外の年分はエラー', () => {
      expect(() => calculateTax(business(1000000), noExpense, 2019)).toThrow('2019年分');
    });
  });

  describe('calculateTax - 所得税及び復興特別所得税', () => {
    test('令和6年分・所得100万円: 所得税26,000円 + 復興特別所得税546円', () => {
      const result = calculateTax(business(1000000), noExpense, 2024);

      expect(result.baseIncomeTax).toBe(26000);
      expect(result.reconstructionTax).toBe(546);
      expect(result.incomeTax).toBe(26546);
    });

    test('令和7年分・所得100万円: 所得税2,500円 + 復興特別所得税52円', () => {
      const result = calculateTax(business(1000000), noExpense, 2025);

      expect(result.baseIncomeTax).toBe(2500);
      expect(result.reconstructionTax).toBe(52);
      expect(result.incomeTax).toBe(2552);
    });

    test('令和7年分・所得300万円: 10%区分', () => {
      const result = calculateTax(business(3000000), noExpense, 2025);

      // 2,120,000 × 10% − 97,500 = 114,500、復興 = floor(114,500 × 2.1%) = 2,404
      expect(result.baseIncomeTax).toBe(114500);
      expect(result.reconstructionTax).toBe(2404);
      expect(result.incomeTax).toBe(116904);
    });

    test('課税所得は1,000円未満切捨て', () => {
      const result = calculateTax(business(1000999), noExpense, 2024);

      expect(result.taxableIncome).toBe(520000);
      expect(result.baseIncomeTax).toBe(26000);
    });

    test('1,800万円超4,000万円以下は40%（控除額2,796,000円）', () => {
      const result = calculateTax(business(20480000), noExpense, 2024);

      expect(result.taxableIncome).toBe(20000000);
      expect(result.baseIncomeTax).toBe(5204000);
      expect(result.reconstructionTax).toBe(109284);
    });

    test('4,000万円超は45%（控除額4,796,000円）', () => {
      const result = calculateTax(business(50000000), noExpense, 2024);

      expect(result.taxableIncome).toBe(50000000);
      expect(result.baseIncomeTax).toBe(17704000);
    });
  });

  describe('calculateTax - 住民税の計算', () => {
    test('住民税の基礎控除が43万円で計算される', () => {
      // 純所得1000000、住民税課税所得 = max(0, 1000000 - 430000) = 570000
      // 住民税 = round(570000 * 0.1) + 5000 = 57000 + 5000 = 62000
      const income: IncomeData = {
        businessIncome: 1000000,
      };
      const expense: ExpenseData = {
        rentExpense: 0,
        utilityExpense: 0,
        suppliesExpense: 0,
        travelExpense: 0,
        communicationExpense: 0,
      };

      const result = calculateTax(income, expense);

      expect(result.netIncome).toBe(1000000);
      expect(result.inhabTax).toBe(62000); // round(570000 * 0.1) + 5000
    });

    test('純所得が43万円以下の場合、住民税はゼロ', () => {
      const income: IncomeData = {
        businessIncome: 400000,
      };
      const expense: ExpenseData = {
        rentExpense: 0,
        utilityExpense: 0,
        suppliesExpense: 0,
        travelExpense: 0,
        communicationExpense: 0,
      };

      const result = calculateTax(income, expense);

      expect(result.netIncome).toBe(400000);
      expect(result.inhabTax).toBe(0);
    });

    test('純所得43万円ちょうどの場合、住民税はゼロ', () => {
      const income: IncomeData = {
        businessIncome: 430000,
      };
      const expense: ExpenseData = {
        rentExpense: 0,
        utilityExpense: 0,
        suppliesExpense: 0,
        travelExpense: 0,
        communicationExpense: 0,
      };

      const result = calculateTax(income, expense);

      expect(result.netIncome).toBe(430000);
      expect(result.inhabTax).toBe(0);
    });

    test('住民税は純所得 - 43万円に10%を乗じて計算される', () => {
      // 純所得 5000000、住民税課税所得 = 5000000 - 430000 = 4570000
      // 住民税 = round(4570000 * 0.1) + 5000 = 457000 + 5000 = 462000
      const income: IncomeData = {
        businessIncome: 5000000,
      };
      const expense: ExpenseData = {
        rentExpense: 0,
        utilityExpense: 0,
        suppliesExpense: 0,
        travelExpense: 0,
        communicationExpense: 0,
      };

      const result = calculateTax(income, expense);

      expect(result.inhabTax).toBe(462000);
    });
  });

  describe('calculateTax - 合計税額', () => {
    test('合計税額 = 所得税 + 住民税', () => {
      const income: IncomeData = {
        businessIncome: 5000000,
      };
      const expense: ExpenseData = {
        rentExpense: 500000,
        utilityExpense: 100000,
        suppliesExpense: 50000,
        travelExpense: 50000,
        communicationExpense: 30000,
        otherExpense: 50000,
      };

      const result = calculateTax(income, expense);

      expect(result.totalTax).toBe(result.incomeTax + result.inhabTax);
    });

    test('ゼロ収入の場合、合計税額はゼロ', () => {
      const income: IncomeData = {
        businessIncome: 0,
      };
      const expense: ExpenseData = {
        rentExpense: 0,
        utilityExpense: 0,
        suppliesExpense: 0,
        travelExpense: 0,
        communicationExpense: 0,
      };

      const result = calculateTax(income, expense);

      expect(result.totalTax).toBe(0);
      expect(result.incomeTax).toBe(0);
      expect(result.inhabTax).toBe(0);
    });
  });

  describe('generateTaxSavingsSuggestions - 節税提案', () => {
    test('経費率が30%未満の場合、提案が生成される', () => {
      const income: IncomeData = {
        businessIncome: 5000000,
      };
      const expense: ExpenseData = {
        rentExpense: 0,
        utilityExpense: 50000,
        suppliesExpense: 50000,
        travelExpense: 30000,
        communicationExpense: 20000,
      };

      const suggestions = generateTaxSavingsSuggestions(income, expense);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('経費率'))).toBe(true);
    });

    test('家賃がゼロの場合、家賃計上の提案が生成される', () => {
      const income: IncomeData = {
        businessIncome: 5000000,
      };
      const expense: ExpenseData = {
        rentExpense: 0,
        utilityExpense: 500000,
        suppliesExpense: 500000,
        travelExpense: 500000,
        communicationExpense: 500000,
      };

      const suggestions = generateTaxSavingsSuggestions(income, expense);

      expect(suggestions.some(s => s.includes('家賃'))).toBe(true);
    });

    test('消耗品費がゼロの場合、消耗品費計上の提案が生成される', () => {
      const income: IncomeData = {
        businessIncome: 5000000,
      };
      const expense: ExpenseData = {
        rentExpense: 500000,
        utilityExpense: 200000,
        suppliesExpense: 0,
        travelExpense: 200000,
        communicationExpense: 200000,
      };

      const suggestions = generateTaxSavingsSuggestions(income, expense);

      expect(suggestions.some(s => s.includes('消耗品'))).toBe(true);
    });

    test('経費率が30%以上で、家賃と消耗品費がある場合、提案はない', () => {
      const income: IncomeData = {
        businessIncome: 5000000,
      };
      const expense: ExpenseData = {
        rentExpense: 1000000,
        utilityExpense: 200000,
        suppliesExpense: 200000,
        travelExpense: 100000,
        communicationExpense: 100000,
      };

      const suggestions = generateTaxSavingsSuggestions(income, expense);

      expect(suggestions.length).toBe(0);
    });

    test('全ての経費がゼロで経費率0%の場合、複数の提案が生成される', () => {
      const income: IncomeData = {
        businessIncome: 5000000,
      };
      const expense: ExpenseData = {
        rentExpense: 0,
        utilityExpense: 0,
        suppliesExpense: 0,
        travelExpense: 0,
        communicationExpense: 0,
      };

      const suggestions = generateTaxSavingsSuggestions(income, expense);

      expect(suggestions.length).toBe(3); // 経費率低い、家賃なし、消耗品費なし
    });

    test('経費率が正確に計算される', () => {
      const income: IncomeData = {
        businessIncome: 10000000,
      };
      const expense: ExpenseData = {
        rentExpense: 500000,
        utilityExpense: 500000,
        suppliesExpense: 500000,
        travelExpense: 500000,
        communicationExpense: 500000,
      };

      const suggestions = generateTaxSavingsSuggestions(income, expense);

      // 総経費2500000 / 総所得10000000 = 0.25 (25%) < 30%
      expect(suggestions.some(s => s.includes('経費率'))).toBe(true);
    });

    test('otherIncome と otherExpense がある場合も正しく計算される', () => {
      const income: IncomeData = {
        businessIncome: 5000000,
        otherIncome: 1000000,
      };
      const expense: ExpenseData = {
        rentExpense: 0,
        utilityExpense: 200000,
        suppliesExpense: 200000,
        travelExpense: 100000,
        communicationExpense: 100000,
        otherExpense: 100000,
      };

      const suggestions = generateTaxSavingsSuggestions(income, expense);

      // 総経費700000 / 総所得6000000 = 0.1167 (11.67%) < 30%
      expect(suggestions.some(s => s.includes('経費率'))).toBe(true);
      expect(suggestions.some(s => s.includes('家賃'))).toBe(true);
    });
  });
});
