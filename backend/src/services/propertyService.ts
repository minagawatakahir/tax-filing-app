// 一時的なメモリストレージ（本来はMongoDBを使用）
const properties: Map<string, any> = new Map();
let idCounter = 1;

export interface IPropertyData {
  propertyName: string;
  address: string;
  landValue: number;
  buildingValue: number;
  totalValue: number;
  acquisitionDate: string | Date;
  acquisitionCost: number;
  category: 'residential' | 'commercial' | 'land';
  propertyId?: string; // オプション（指定されない場合は自動生成）
  // ローン関連情報
  outstandingLoan?: number;
  annualInterest?: number;
  loanStartDate?: string | Date;
  purpose?: 'residential' | 'investment' | 'business';
  // 減価償却関連情報
  buildingStructure?: 'wood' | 'steel' | 'rc' | 'src';
  usefulLife?: number;
  depreciationMethod?: 'straight-line' | 'declining-balance';
}

/**
 * 不動産物件を作成
 */
export const createProperty = async (propertyData: IPropertyData): Promise<any> => {
  const id = `${idCounter++}`;
  // propertyIdが指定されていない場合は自動採番
  const propertyId = propertyData.propertyId || `property-${String(idCounter).padStart(3, '0')}`;
  
  const now = new Date();
  const property = {
    _id: id,
    propertyId,
    propertyName: propertyData.propertyName,
    address: propertyData.address,
    landValue: propertyData.landValue,
    buildingValue: propertyData.buildingValue,
    totalValue: propertyData.totalValue,
    acquisitionDate: new Date(propertyData.acquisitionDate),
    acquisitionCost: propertyData.acquisitionCost,
    category: propertyData.category,
    // ローン関連情報
    outstandingLoan: propertyData.outstandingLoan,
    annualInterest: propertyData.annualInterest,
    loanStartDate: propertyData.loanStartDate ? new Date(propertyData.loanStartDate) : undefined,
    purpose: propertyData.purpose,
    // 減価償却関連情報
    buildingStructure: propertyData.buildingStructure,
    usefulLife: propertyData.usefulLife,
    depreciationMethod: propertyData.depreciationMethod,
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
