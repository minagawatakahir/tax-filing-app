import {
  createProperty,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getAllProperties,
  searchProperties,
} from '../propertyService';
import Property from '../../models/Property';

// Mock Property model
jest.mock('../../models/Property');
const MockedProperty = Property as jest.Mocked<typeof Property>;

describe('propertyService - TX-45 Backend Services Tests', () => {
  const mockPropertyData = {
    propertyName: 'マンション渋谷',
    address: '東京都渋谷区',
    landValue: 30000000,
    buildingValue: 20000000,
    totalValue: 50000000,
    acquisitionDate: new Date('2020-01-15'),
    acquisitionCost: 50000000,
    category: 'residential' as const,
    acquisitionTax: 1500000,
    registrationTax: 500000,
    brokerFee: 1000000,
    otherAcquisitionCosts: 200000,
    outstandingLoan: 40000000,
    annualInterest: 800000,
    loanStartDate: new Date('2020-01-15'),
    purpose: 'investment' as const,
  };

  const mockProperty = {
    _id: '507f1f77bcf86cd799439011',
    propertyId: 'property-001',
    ...mockPropertyData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProperty', () => {
    test('物件を作成できる', async () => {
      MockedProperty.countDocuments = jest.fn().mockResolvedValue(0);
      MockedProperty.prototype.save = jest.fn().mockResolvedValue(mockProperty);

      const result = await createProperty(mockPropertyData);

      expect(result).toBeDefined();
      expect(result.propertyName).toBe(mockPropertyData.propertyName);
      expect(result.address).toBe(mockPropertyData.address);
    });

    test('propertyIdが自動採番される', async () => {
      MockedProperty.countDocuments = jest.fn().mockResolvedValue(5);
      MockedProperty.prototype.save = jest.fn().mockResolvedValue({
        ...mockProperty,
        propertyId: 'property-006',
      });

      const result = await createProperty(mockPropertyData);

      expect(result.propertyId).toBe('property-006');
    });

    test('カスタムpropertyIdを指定できる', async () => {
      const customData = {
        ...mockPropertyData,
        propertyId: 'CUSTOM-001',
      };

      MockedProperty.prototype.save = jest.fn().mockResolvedValue({
        ...mockProperty,
        propertyId: 'CUSTOM-001',
      });

      const result = await createProperty(customData);

      expect(result.propertyId).toBe('CUSTOM-001');
    });

    test('必須フィールドが保存される', async () => {
      MockedProperty.prototype.save = jest.fn().mockResolvedValue(mockProperty);

      const result = await createProperty(mockPropertyData);

      expect(result.propertyName).toBe(mockPropertyData.propertyName);
      expect(result.address).toBe(mockPropertyData.address);
      expect(result.category).toBe(mockPropertyData.category);
      expect(result.totalValue).toBe(mockPropertyData.totalValue);
    });

    test('エラー時に例外を投げる', async () => {
      MockedProperty.prototype.save = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await expect(createProperty(mockPropertyData)).rejects.toThrow();
    });
  });

  describe('getPropertyById', () => {
    test('IDで物件を取得できる', async () => {
      MockedProperty.findById = jest.fn().mockResolvedValue(mockProperty);

      const result = await getPropertyById('507f1f77bcf86cd799439011');

      expect(result).toBeDefined();
      expect(result._id).toBe(mockProperty._id);
      expect(result.propertyName).toBe(mockProperty.propertyName);
    });

    test('存在しない物件はnullを返す', async () => {
      MockedProperty.findById = jest.fn().mockResolvedValue(null);

      const result = await getPropertyById('invalid-id');

      expect(result).toBeNull();
    });

    test('エラー時に例外を投げる', async () => {
      MockedProperty.findById = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await expect(getPropertyById('507f1f77bcf86cd799439011')).rejects.toThrow();
    });
  });

  describe('updateProperty', () => {
    test('物件を更新できる', async () => {
      const updatedData = {
        ...mockPropertyData,
        propertyName: '新しい物件名',
      };

      MockedProperty.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...mockProperty,
        propertyName: '新しい物件名',
      });

      const result = await updateProperty('507f1f77bcf86cd799439011', updatedData);

      expect(result.propertyName).toBe('新しい物件名');
    });

    test('部分更新ができる', async () => {
      MockedProperty.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...mockProperty,
        outstandingLoan: 35000000,
      });

      const result = await updateProperty('507f1f77bcf86cd799439011', {
        outstandingLoan: 35000000,
      });

      expect(result.outstandingLoan).toBe(35000000);
    });

    test('存在しない物件の更新はnullを返す', async () => {
      MockedProperty.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const result = await updateProperty('invalid-id', mockPropertyData);

      expect(result).toBeNull();
    });

    test('エラー時に例外を投げる', async () => {
      MockedProperty.findByIdAndUpdate = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        updateProperty('507f1f77bcf86cd799439011', mockPropertyData)
      ).rejects.toThrow();
    });
  });

  describe('deleteProperty', () => {
    test('物件を削除できる', async () => {
      MockedProperty.findByIdAndDelete = jest.fn().mockResolvedValue(mockProperty);

      const result = await deleteProperty('507f1f77bcf86cd799439011');

      expect(result).toBeDefined();
      expect(result._id).toBe(mockProperty._id);
    });

    test('存在しない物件の削除はnullを返す', async () => {
      MockedProperty.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const result = await deleteProperty('invalid-id');

      expect(result).toBeNull();
    });

    test('エラー時に例外を投げる', async () => {
      MockedProperty.findByIdAndDelete = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await expect(deleteProperty('507f1f77bcf86cd799439011')).rejects.toThrow();
    });
  });

  describe('getAllProperties', () => {
    test('すべての物件を取得できる', async () => {
      const mockProperties = [mockProperty, { ...mockProperty, _id: '507f1f77bcf86cd799439012' }];
      MockedProperty.find = jest.fn().mockResolvedValue(mockProperties);

      const result = await getAllProperties();

      expect(result).toHaveLength(2);
      expect(result[0].propertyName).toBe(mockPropertyData.propertyName);
    });

    test('物件がない場合は空配列を返す', async () => {
      MockedProperty.find = jest.fn().mockResolvedValue([]);

      const result = await getAllProperties();

      expect(result).toEqual([]);
    });

    test('エラー時に例外を投げる', async () => {
      MockedProperty.find = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await expect(getAllProperties()).rejects.toThrow();
    });
  });

  describe('searchProperties', () => {
    test('物件名で検索できる', async () => {
      MockedProperty.find = jest.fn().mockResolvedValue([mockProperty]);

      const result = await searchProperties({ propertyName: 'マンション' });

      expect(result).toHaveLength(1);
      expect(result[0].propertyName).toContain('マンション');
    });

    test('住所で検索できる', async () => {
      MockedProperty.find = jest.fn().mockResolvedValue([mockProperty]);

      const result = await searchProperties({ address: '渋谷区' });

      expect(result).toHaveLength(1);
      expect(result[0].address).toContain('渋谷区');
    });

    test('カテゴリで検索できる', async () => {
      MockedProperty.find = jest.fn().mockResolvedValue([mockProperty]);

      const result = await searchProperties({ category: 'residential' });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('residential');
    });

    test('複数条件で検索できる', async () => {
      MockedProperty.find = jest.fn().mockResolvedValue([mockProperty]);

      const result = await searchProperties({
        propertyName: 'マンション',
        category: 'residential',
      });

      expect(result).toHaveLength(1);
    });

    test('検索結果がない場合は空配列を返す', async () => {
      MockedProperty.find = jest.fn().mockResolvedValue([]);

      const result = await searchProperties({ propertyName: '存在しない物件' });

      expect(result).toEqual([]);
    });

    test('エラー時に例外を投げる', async () => {
      MockedProperty.find = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await expect(searchProperties({ propertyName: 'test' })).rejects.toThrow();
    });
  });

  describe('バリデーション', () => {
    test('必須フィールドが空の場合はエラーを投げる', async () => {
      const invalidData = {
        ...mockPropertyData,
        propertyName: '',
      };

      MockedProperty.prototype.save = jest.fn().mockRejectedValue(
        new Error('Validation error')
      );

      await expect(createProperty(invalidData)).rejects.toThrow();
    });

    test('負の値のフィールドはエラーを投げる', async () => {
      const invalidData = {
        ...mockPropertyData,
        totalValue: -1,
      };

      MockedProperty.prototype.save = jest.fn().mockRejectedValue(
        new Error('Validation error')
      );

      await expect(createProperty(invalidData)).rejects.toThrow();
    });

    test('無効なカテゴリはエラーを投げる', async () => {
      const invalidData = {
        ...mockPropertyData,
        category: 'invalid' as any,
      };

      MockedProperty.prototype.save = jest.fn().mockRejectedValue(
        new Error('Validation error')
      );

      await expect(createProperty(invalidData)).rejects.toThrow();
    });
  });

  describe('データ型の検証', () => {
    test('日付フィールドが正しく変換される', async () => {
      const dataWithStringDate = {
        ...mockPropertyData,
        acquisitionDate: '2020-01-15',
        loanStartDate: '2020-01-15',
      };

      MockedProperty.prototype.save = jest.fn().mockResolvedValue({
        ...mockProperty,
        acquisitionDate: new Date('2020-01-15'),
        loanStartDate: new Date('2020-01-15'),
      });

      const result = await createProperty(dataWithStringDate as any);

      expect(result.acquisitionDate instanceof Date).toBe(true);
    });

    test('数値フィールドが正しく処理される', async () => {
      MockedProperty.prototype.save = jest.fn().mockResolvedValue(mockProperty);

      const result = await createProperty(mockPropertyData);

      expect(typeof result.totalValue).toBe('number');
      expect(typeof result.landValue).toBe('number');
      expect(typeof result.buildingValue).toBe('number');
    });
  });
});
