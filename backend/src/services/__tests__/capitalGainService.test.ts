import { calculateCapitalGain, CapitalGainInput } from '../capitalGainService';

describe('Capital Gain Service', () => {
  describe('calculateCapitalGain - with acquisitionDate and acquisitionCost', () => {
    it('should calculate long-term capital gain correctly', async () => {
      const input: CapitalGainInput = {
        propertyId: 'PROP001',
        saleDate: '2025-06-15',
        salePrice: 50000000,
        acquisitionDate: '2010-01-15', // 15年以上前
        acquisitionCost: 30000000,
        brokerageFee: 1500000,
        surveyCost: 100000,
        registrationCost: 200000,
        otherExpenses: 50000,
        specialDeduction: 3000000,
      };

      const result = await calculateCapitalGain(input);

      // 転売費用: 1500000 + 100000 + 200000 + 50000 = 1850000
      expect(result.transferExpenses).toBe(1850000);

      // 取得費: 30000000
      expect(result.acquisitionCost).toBe(30000000);

      // 譲渡所得: 50000000 - (30000000 + 1850000) = 18150000
      expect(result.capitalGain).toBe(18150000);

      // 課税譲渡所得: 18150000 - 3000000 = 15150000
      expect(result.taxableCapitalGain).toBe(15150000);

      // 長期譲渡所得
      expect(result.transferType).toBe('long-term');

      // 所得税: 15150000 * 0.15 = 2272500
      expect(result.incomeTax).toBe(2272500);

      // 住民税: 15150000 * 0.05 = 757500
      expect(result.residentTax).toBe(757500);

      // 総税額 > 0
      expect(result.totalTax).toBeGreaterThan(0);
    });

    it('should calculate short-term capital gain correctly', async () => {
      const input: CapitalGainInput = {
        propertyId: 'PROP002',
        saleDate: '2025-06-15',
        salePrice: 50000000,
        acquisitionDate: '2023-06-15', // 2年以内
        acquisitionCost: 40000000,
        brokerageFee: 1500000,
        surveyCost: 100000,
        registrationCost: 200000,
        otherExpenses: 50000,
        specialDeduction: 0,
      };

      const result = await calculateCapitalGain(input);

      // 短期譲渡所得
      expect(result.transferType).toBe('short-term');

      // 短期の税率が高い
      expect(result.incomeTax).toBeGreaterThan(0);

      // 短期の所得税率は30%
      const expectedIncomeTax = Math.round(result.taxableCapitalGain * 0.30);
      expect(result.incomeTax).toBe(expectedIncomeTax);
    });

    it('should handle special deduction correctly', async () => {
      const input: CapitalGainInput = {
        propertyId: 'PROP003',
        saleDate: '2025-06-15',
        salePrice: 20000000,
        acquisitionDate: '2010-01-15',
        acquisitionCost: 10000000,
        brokerageFee: 600000,
        surveyCost: 50000,
        registrationCost: 100000,
        otherExpenses: 0,
        specialDeduction: 3000000, // 居住用財産の特別控除
      };

      const result = await calculateCapitalGain(input);

      // 譲渡所得: 20000000 - (10000000 + 750000) = 9250000
      expect(result.capitalGain).toBe(9250000);

      // 特別控除で負になる場合は0
      const taxableGain = Math.max(0, result.capitalGain - result.specialDeduction);
      expect(result.taxableCapitalGain).toBe(taxableGain);
    });

    it('should return zero or positive taxable capital gain', async () => {
      const input: CapitalGainInput = {
        propertyId: 'PROP004',
        saleDate: '2025-06-15',
        salePrice: 15000000,
        acquisitionDate: '2010-01-15',
        acquisitionCost: 12000000,
        brokerageFee: 500000,
        surveyCost: 50000,
        registrationCost: 100000,
        otherExpenses: 0,
        specialDeduction: 5000000, // 大きな控除額
      };

      const result = await calculateCapitalGain(input);

      // 課税譲渡所得は0以上
      expect(result.taxableCapitalGain).toBeGreaterThanOrEqual(0);

      // 課税所得がゼロなら税額もゼロ
      if (result.taxableCapitalGain === 0) {
        expect(result.totalTax).toBe(0);
      }
    });

    it('should calculate ownership period correctly', async () => {
      const input: CapitalGainInput = {
        propertyId: 'PROP005',
        saleDate: '2025-06-15',
        salePrice: 50000000,
        acquisitionDate: '2015-03-20',
        acquisitionCost: 30000000,
        brokerageFee: 1500000,
        surveyCost: 100000,
        registrationCost: 200000,
        otherExpenses: 50000,
        specialDeduction: 0,
      };

      const result = await calculateCapitalGain(input);

      // 所有期間: 2015年3月20日から2025年6月15日
      // 10年と2ヶ月（6月 - 3月 = 3ヶ月）
      expect(result.ownershipPeriod.years).toBe(10);
      expect(result.ownershipPeriod.months).toBe(3); // 6月 - 3月 = 3ヶ月
    });
  });
});
