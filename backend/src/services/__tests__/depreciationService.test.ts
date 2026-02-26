import {
  calculateStraightLineDepreciation,
  calculateDecliningBalanceDepreciation,
  generateDepreciationSchedule,
  predictFutureUndepreciatedBalance,
  DepreciableAsset,
} from '../depreciationService';

describe('Depreciation Service', () => {
  describe('calculateStraightLineDepreciation', () => {
    it('should calculate straight-line depreciation correctly', () => {
      const acquisitionCost = 30000000; // 3000万円
      const usefulLife = 47; // 47年

      const result = calculateStraightLineDepreciation(acquisitionCost, usefulLife);

      // 30000000 / 47 = 638297.87...
      expect(result).toBeCloseTo(638297.87, 1);
    });

    it('should handle different useful life periods', () => {
      const acquisitionCost = 10000000;
      
      // 10年の場合
      expect(calculateStraightLineDepreciation(acquisitionCost, 10)).toBe(1000000);
      
      // 20年の場合
      expect(calculateStraightLineDepreciation(acquisitionCost, 20)).toBe(500000);
      
      // 5年の場合
      expect(calculateStraightLineDepreciation(acquisitionCost, 5)).toBe(2000000);
    });

    it('should handle zero acquisition cost', () => {
      const result = calculateStraightLineDepreciation(0, 10);
      expect(result).toBe(0);
    });
  });

  describe('calculateDecliningBalanceDepreciation', () => {
    it('should calculate declining balance depreciation correctly', () => {
      const bookValue = 10000000;
      const rate = 10; // 10%

      const result = calculateDecliningBalanceDepreciation(bookValue, rate);

      // 10000000 * (10 / 100) = 1000000
      expect(result).toBe(1000000);
    });

    it('should handle different rates', () => {
      const bookValue = 30000000;
      
      // 5% rate
      expect(calculateDecliningBalanceDepreciation(bookValue, 5)).toBe(1500000);
      
      // 20% rate
      expect(calculateDecliningBalanceDepreciation(bookValue, 20)).toBe(6000000);
    });

    it('should handle diminishing book value', () => {
      let bookValue = 10000000;
      const rate = 10;
      
      // First year
      const depreciation1 = calculateDecliningBalanceDepreciation(bookValue, rate);
      expect(depreciation1).toBe(1000000);
      
      // Second year (reduced book value)
      bookValue = bookValue - depreciation1;
      const depreciation2 = calculateDecliningBalanceDepreciation(bookValue, rate);
      expect(depreciation2).toBe(900000);
      
      // Third year
      bookValue = bookValue - depreciation2;
      const depreciation3 = calculateDecliningBalanceDepreciation(bookValue, rate);
      expect(depreciation3).toBe(810000);
    });

    it('should handle zero book value', () => {
      const result = calculateDecliningBalanceDepreciation(0, 10);
      expect(result).toBe(0);
    });
  });

  describe('generateDepreciationSchedule', () => {
    it('should generate depreciation schedule for building', () => {
      const asset: DepreciableAsset = {
        assetId: 'building-1',
        assetName: '建物',
        acquisitionDate: new Date('2020-01-01'),
        acquisitionCost: 30000000,
        category: 'concrete_building',
        usefulLife: 47,
        depreciationMethod: 'straight',
      };

      const schedule = generateDepreciationSchedule(asset);

      expect(schedule).toBeDefined();
      expect(Array.isArray(schedule)).toBe(true);
      expect(schedule.length).toBeGreaterThan(0);
      
      // First year depreciation
      expect(schedule[0].annualDepreciation).toBeGreaterThan(0);
      expect(schedule[0].accumulatedDepreciation).toBe(schedule[0].annualDepreciation);
    });

    it('should track accumulated depreciation correctly', () => {
      const asset: DepreciableAsset = {
        assetId: 'equipment-1',
        assetName: '機器',
        acquisitionDate: new Date('2020-01-01'),
        acquisitionCost: 5000000,
        category: 'office_equipment',
        usefulLife: 5,
        depreciationMethod: 'straight',
      };

      const schedule = generateDepreciationSchedule(asset);

      // For straight-line depreciation with 5-year life
      // Annual depreciation should be 1000000
      expect(schedule[0].annualDepreciation).toBe(1000000);
      
      // Accumulated depreciation should increase or stay same each year
      for (let i = 1; i < Math.min(schedule.length, 5); i++) {
        expect(schedule[i].accumulatedDepreciation).toBeGreaterThanOrEqual(
          schedule[i - 1].accumulatedDepreciation
        );
      }
    });

    it('should generate schedule for declining balance method', () => {
      const asset: DepreciableAsset = {
        assetId: 'furniture-1',
        assetName: '家具',
        acquisitionDate: new Date('2020-01-01'),
        acquisitionCost: 2000000,
        category: 'furniture',
        usefulLife: 8,
        depreciationMethod: 'declining',
      };

      const schedule = generateDepreciationSchedule(asset);

      expect(schedule).toBeDefined();
      expect(Array.isArray(schedule)).toBe(true);
      expect(schedule.length).toBeGreaterThan(0);
    });
  });

  describe('predictFutureUndepreciatedBalance', () => {
    it('should generate projection for future years', () => {
      const asset: DepreciableAsset = {
        assetId: 'building-proj',
        assetName: '建物',
        acquisitionDate: new Date('2020-01-01'),
        acquisitionCost: 30000000,
        category: 'concrete_building',
        usefulLife: 47,
        depreciationMethod: 'straight',
      };

      const projection = predictFutureUndepreciatedBalance(asset);

      expect(projection).toBeDefined();
      expect(projection.assetId).toBe('building-proj');
      expect(projection.acquisitionCost).toBe(30000000);
      expect(projection.projectionYears).toBeDefined();
      expect(Array.isArray(projection.projectionYears)).toBe(true);
    });

    it('should calculate completion year correctly', () => {
      const asset: DepreciableAsset = {
        assetId: 'equipment-proj',
        assetName: '機器',
        acquisitionDate: new Date('2020-01-01'),
        acquisitionCost: 5000000,
        category: 'office_equipment',
        usefulLife: 5,
        depreciationMethod: 'straight',
      };

      const projection = predictFutureUndepreciatedBalance(asset);

      // Completion year should be around 2024-2025 (2020 + 5 years)
      expect(projection.completionYear).toBeGreaterThanOrEqual(2024);
      expect(projection.completionYear).toBeLessThanOrEqual(2025);
    });

    it('should handle current book value calculation', () => {
      const asset: DepreciableAsset = {
        assetId: 'vehicle-proj',
        assetName: '車両',
        acquisitionDate: new Date('2020-01-01'),
        acquisitionCost: 3000000,
        category: 'vehicle',
        usefulLife: 4,
        depreciationMethod: 'straight',
      };

      const projection = predictFutureUndepreciatedBalance(asset);

      expect(projection.currentBookValue).toBeDefined();
      expect(projection.currentBookValue).toBeGreaterThanOrEqual(0);
      expect(projection.currentBookValue).toBeLessThanOrEqual(asset.acquisitionCost);
    });
  });
});
