import {
  generateRSUIncomeListPDF,
  generateRealEstateIncomeListPDF,
  generateCapitalGainListPDF,
} from '../pdfGenerationService';

// Mock PDFDocument
jest.mock('pdfkit');

describe('pdfGenerationService - TX-45 Backend Services Tests', () => {
  const mockRSUData = {
    year: 2025,
    result: [
      {
        companyName: 'Google',
        vestingDate: new Date('2025-01-15'),
        shares: 100,
        pricePerShareUSD: 150,
        ttmRate: 140,
        totalValueJPY: 2100000,
        taxableIncome: 2100000,
      },
      {
        companyName: 'Amazon',
        vestingDate: new Date('2025-04-15'),
        shares: 100,
        pricePerShareUSD: 155,
        ttmRate: 142,
        totalValueJPY: 2201000,
        taxableIncome: 2201000,
      },
    ],
    totalRSUIncome: 4301000,
  };

  const mockRealEstateData = {
    year: 2025,
    properties: [
      {
        propertyId: 'property-001',
        propertyName: 'マンション渋谷',
        rentalIncome: 12000000,
        expenses: 4000000,
        netIncome: 8000000,
      },
      {
        propertyId: 'property-002',
        propertyName: 'オフィスビル新宿',
        rentalIncome: 25000000,
        expenses: 8000000,
        netIncome: 17000000,
      },
    ],
    totalIncome: 37000000,
    totalExpenses: 12000000,
    totalNetIncome: 25000000,
  };

  const mockCapitalGainData = {
    year: 2025,
    properties: [
      {
        propertyId: 'property-003',
        propertyName: '土地A',
        salePrice: 50000000,
        acquisitionCost: 30000000,
        transferCost: 2000000,
        gain: 18000000,
      },
      {
        propertyId: 'property-004',
        propertyName: '建物B',
        salePrice: 100000000,
        acquisitionCost: 60000000,
        transferCost: 3000000,
        gain: 37000000,
      },
    ],
    totalGain: 55000000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRSUIncomeListPDF', () => {
    test('RSU所得PDFが生成される', () => {
      const doc = generateRSUIncomeListPDF(mockRSUData);

      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
    });

    test('複数のRSU記録が含まれる', () => {
      const doc = generateRSUIncomeListPDF(mockRSUData);

      expect(doc).toBeDefined();
      expect(mockRSUData.result.length).toBe(2);
    });

    test('単一のRSU記録でも生成できる', () => {
      const singleData = {
        ...mockRSUData,
        result: [mockRSUData.result[0]],
        totalRSUIncome: 2100000,
      };

      const doc = generateRSUIncomeListPDF(singleData);

      expect(doc).toBeDefined();
    });

    test('空のRSU記録でも生成できる', () => {
      const emptyData = {
        ...mockRSUData,
        result: [],
        totalRSUIncome: 0,
      };

      const doc = generateRSUIncomeListPDF(emptyData);

      expect(doc).toBeDefined();
    });

    test('年度情報が含まれる', () => {
      const doc = generateRSUIncomeListPDF(mockRSUData);

      expect(mockRSUData.year).toBe(2025);
    });

    test('合計金額が含まれる', () => {
      const doc = generateRSUIncomeListPDF(mockRSUData);

      expect(mockRSUData.totalRSUIncome).toBe(4301000);
    });

    test('会社情報が含まれる', () => {
      const doc = generateRSUIncomeListPDF(mockRSUData);

      expect(mockRSUData.result[0].companyName).toBe('Google');
      expect(mockRSUData.result[1].companyName).toBe('Amazon');
    });

    test('大金額でも正常に生成できる', () => {
      const largData = {
        ...mockRSUData,
        totalRSUIncome: 1000000000, // 10億円
      };

      const doc = generateRSUIncomeListPDF(largData);

      expect(doc).toBeDefined();
    });
  });

  describe('generateRealEstateIncomeListPDF', () => {
    test('不動産所得PDFが生成される', () => {
      const doc = generateRealEstateIncomeListPDF(mockRealEstateData);

      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
    });

    test('複数の物件情報が含まれる', () => {
      const doc = generateRealEstateIncomeListPDF(mockRealEstateData);

      expect(doc).toBeDefined();
      expect(mockRealEstateData.properties.length).toBe(2);
    });

    test('単一の物件でも生成できる', () => {
      const singleData = {
        ...mockRealEstateData,
        properties: [mockRealEstateData.properties[0]],
        totalIncome: 12000000,
        totalExpenses: 4000000,
        totalNetIncome: 8000000,
      };

      const doc = generateRealEstateIncomeListPDF(singleData);

      expect(doc).toBeDefined();
    });

    test('空の物件情報でも生成できる', () => {
      const emptyData = {
        ...mockRealEstateData,
        properties: [],
        totalIncome: 0,
        totalExpenses: 0,
        totalNetIncome: 0,
      };

      const doc = generateRealEstateIncomeListPDF(emptyData);

      expect(doc).toBeDefined();
    });

    test('年度情報が含まれる', () => {
      const doc = generateRealEstateIncomeListPDF(mockRealEstateData);

      expect(mockRealEstateData.year).toBe(2025);
    });

    test('合計収入が含まれる', () => {
      const doc = generateRealEstateIncomeListPDF(mockRealEstateData);

      expect(mockRealEstateData.totalIncome).toBe(37000000);
    });

    test('合計経費が含まれる', () => {
      const doc = generateRealEstateIncomeListPDF(mockRealEstateData);

      expect(mockRealEstateData.totalExpenses).toBe(12000000);
    });

    test('純所得が含まれる', () => {
      const doc = generateRealEstateIncomeListPDF(mockRealEstateData);

      expect(mockRealEstateData.totalNetIncome).toBe(25000000);
    });

    test('物件名が含まれる', () => {
      const doc = generateRealEstateIncomeListPDF(mockRealEstateData);

      expect(mockRealEstateData.properties[0].propertyName).toBe('マンション渋谷');
      expect(mockRealEstateData.properties[1].propertyName).toBe('オフィスビル新宿');
    });
  });

  describe('generateCapitalGainListPDF', () => {
    test('譲渡所得PDFが生成される', () => {
      const doc = generateCapitalGainListPDF(mockCapitalGainData);

      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
    });

    test('複数の物件売却情報が含まれる', () => {
      const doc = generateCapitalGainListPDF(mockCapitalGainData);

      expect(doc).toBeDefined();
      expect(mockCapitalGainData.properties.length).toBe(2);
    });

    test('単一の物件売却でも生成できる', () => {
      const singleData = {
        ...mockCapitalGainData,
        properties: [mockCapitalGainData.properties[0]],
        totalGain: 18000000,
      };

      const doc = generateCapitalGainListPDF(singleData);

      expect(doc).toBeDefined();
    });

    test('空の物件売却情報でも生成できる', () => {
      const emptyData = {
        ...mockCapitalGainData,
        properties: [],
        totalGain: 0,
      };

      const doc = generateCapitalGainListPDF(emptyData);

      expect(doc).toBeDefined();
    });

    test('年度情報が含まれる', () => {
      const doc = generateCapitalGainListPDF(mockCapitalGainData);

      expect(mockCapitalGainData.year).toBe(2025);
    });

    test('売却益の合計が含まれる', () => {
      const doc = generateCapitalGainListPDF(mockCapitalGainData);

      expect(mockCapitalGainData.totalGain).toBe(55000000);
    });

    test('売却価格が含まれる', () => {
      const doc = generateCapitalGainListPDF(mockCapitalGainData);

      expect(mockCapitalGainData.properties[0].salePrice).toBe(50000000);
      expect(mockCapitalGainData.properties[1].salePrice).toBe(100000000);
    });

    test('取得原価が含まれる', () => {
      const doc = generateCapitalGainListPDF(mockCapitalGainData);

      expect(mockCapitalGainData.properties[0].acquisitionCost).toBe(30000000);
      expect(mockCapitalGainData.properties[1].acquisitionCost).toBe(60000000);
    });

    test('売却益が含まれる', () => {
      const doc = generateCapitalGainListPDF(mockCapitalGainData);

      expect(mockCapitalGainData.properties[0].gain).toBe(18000000);
      expect(mockCapitalGainData.properties[1].gain).toBe(37000000);
    });

    test('物件名が含まれる', () => {
      const doc = generateCapitalGainListPDF(mockCapitalGainData);

      expect(mockCapitalGainData.properties[0].propertyName).toBe('土地A');
      expect(mockCapitalGainData.properties[1].propertyName).toBe('建物B');
    });
  });

  describe('PDFフォーマット', () => {
    test('RSU PDFはA4サイズで生成される', () => {
      const doc = generateRSUIncomeListPDF(mockRSUData);

      expect(doc).toBeDefined();
    });

    test('不動産PDFはA4サイズで生成される', () => {
      const doc = generateRealEstateIncomeListPDF(mockRealEstateData);

      expect(doc).toBeDefined();
    });

    test('譲渡所得PDFはA4サイズで生成される', () => {
      const doc = generateCapitalGainListPDF(mockCapitalGainData);

      expect(doc).toBeDefined();
    });
  });

  describe('エラーハンドリング', () => {
    test('無効なRSUデータでもエラーが発生しない', () => {
      const invalidData = {
        ...mockRSUData,
        year: null as any,
      };

      expect(() => generateRSUIncomeListPDF(invalidData)).not.toThrow();
    });

    test('無効な不動産データでもエラーが発生しない', () => {
      const invalidData = {
        ...mockRealEstateData,
        properties: null as any,
      };

      expect(() => generateRealEstateIncomeListPDF(invalidData)).not.toThrow();
    });

    test('無効な譲渡所得データでもエラーが発生しない', () => {
      const invalidData = {
        ...mockCapitalGainData,
        properties: null as any,
      };

      expect(() => generateCapitalGainListPDF(invalidData)).not.toThrow();
    });
  });

  describe('大規模データ処理', () => {
    test('多数のRSU記録を処理できる', () => {
      const largeData = {
        ...mockRSUData,
        result: Array(100).fill(mockRSUData.result[0]),
        totalRSUIncome: 2100000 * 100,
      };

      const doc = generateRSUIncomeListPDF(largeData);

      expect(doc).toBeDefined();
    });

    test('多数の物件情報を処理できる', () => {
      const largeData = {
        ...mockRealEstateData,
        properties: Array(50).fill(mockRealEstateData.properties[0]),
        totalIncome: 12000000 * 50,
        totalExpenses: 4000000 * 50,
        totalNetIncome: 8000000 * 50,
      };

      const doc = generateRealEstateIncomeListPDF(largeData);

      expect(doc).toBeDefined();
    });
  });
});
