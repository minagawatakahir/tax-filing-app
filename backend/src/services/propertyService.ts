// 一時的なメモリストレージ（本来はMongoDBを使用）
const properties: Map<string, any> = new Map();
let idCounter = 1;

export interface IPropertyData {
  propertyId: string;
  propertyName: string;
  address: string;
  landValue: number;
  buildingValue: number;
  totalValue: number;
  acquisitionDate: string | Date;
  acquisitionCost: number;
  category: 'residential' | 'commercial' | 'land';
}

/**
 * 不動産物件を作成
 */
export const createProperty = async (propertyData: IPropertyData): Promise<any> => {
  const id = `${idCounter++}`;
  const now = new Date();
  const property = {
    _id: id,
    ...propertyData,
    acquisitionDate: new Date(propertyData.acquisitionDate),
    createdAt: now,
    updatedAt: now,
  };
  properties.set(id, property);
  return property;
};

/**
 * すべての不動産物件を取得
 */
export const getAllProperties = async (): Promise<any[]> => {
  return Array.from(properties.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * IDで不動産物件を取得
 */
export const getPropertyById = async (id: string): Promise<any | null> => {
  return properties.get(id) || null;
};

/**
 * 不動産物件を更新
 */
export const updateProperty = async (id: string, propertyData: Partial<IPropertyData>): Promise<any | null> => {
  const property = properties.get(id);
  if (!property) return null;
  
  const updated = {
    ...property,
    ...propertyData,
    _id: property._id,
    createdAt: property.createdAt,
    updatedAt: new Date(),
  };
  properties.set(id, updated);
  return updated;
};

/**
 * 不動産物件を削除
 */
export const deleteProperty = async (id: string): Promise<any | null> => {
  const property = properties.get(id);
  if (!property) return null;
  
  properties.delete(id);
  return property;
};
