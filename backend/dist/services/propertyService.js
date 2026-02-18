"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getAllProperties = exports.createProperty = void 0;
// 一時的なメモリストレージ（本来はMongoDBを使用）
const properties = new Map();
let idCounter = 1;
/**
 * 不動産物件を作成
 */
const createProperty = async (propertyData) => {
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
        constructionDate: propertyData.constructionDate ? new Date(propertyData.constructionDate) : undefined,
        usefulLife: propertyData.usefulLife,
        depreciationMethod: propertyData.depreciationMethod,
        isNewProperty: propertyData.isNewProperty,
        createdAt: now,
        updatedAt: now,
    };
    properties.set(id, property);
    return property;
};
exports.createProperty = createProperty;
/**
 * すべての不動産物件を取得
 */
const getAllProperties = async () => {
    return Array.from(properties.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
exports.getAllProperties = getAllProperties;
/**
 * IDで不動産物件を取得
 */
const getPropertyById = async (id) => {
    return properties.get(id) || null;
};
exports.getPropertyById = getPropertyById;
/**
 * 不動産物件を更新
 */
const updateProperty = async (id, propertyData) => {
    const property = properties.get(id);
    if (!property)
        return null;
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
exports.updateProperty = updateProperty;
/**
 * 不動産物件を削除
 */
const deleteProperty = async (id) => {
    const property = properties.get(id);
    if (!property)
        return null;
    properties.delete(id);
    return property;
};
exports.deleteProperty = deleteProperty;
