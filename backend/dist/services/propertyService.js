"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getAllProperties = exports.createProperty = void 0;
const Property_1 = __importDefault(require("../models/Property"));
/**
 * 自動採番されたpropertyIdを生成
 */
const generatePropertyId = async () => {
    const count = await Property_1.default.countDocuments();
    return `property-${String(count + 1).padStart(3, '0')}`;
};
/**
 * 不動産物件を作成（MongoDB保存）
 */
const createProperty = async (propertyData) => {
    try {
        // propertyIdが指定されていない場合は自動採番
        const propertyId = propertyData.propertyId || (await generatePropertyId());
        const property = new Property_1.default({
            propertyId,
            propertyName: propertyData.propertyName,
            address: propertyData.address,
            landValue: propertyData.landValue,
            buildingValue: propertyData.buildingValue,
            totalValue: propertyData.totalValue,
            acquisitionDate: new Date(propertyData.acquisitionDate),
            acquisitionCost: propertyData.acquisitionCost,
            category: propertyData.category,
            // 取得関連費用
            acquisitionTax: propertyData.acquisitionTax,
            registrationTax: propertyData.registrationTax,
            brokerFee: propertyData.brokerFee,
            otherAcquisitionCosts: propertyData.otherAcquisitionCosts,
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
            // TX-32: 火災・地震保険
            insurancePaidAmount: propertyData.insurancePaidAmount,
            insuranceCoveragePeriodYears: propertyData.insuranceCoveragePeriodYears,
            insurancePaymentStartDate: propertyData.insurancePaymentStartDate ? new Date(propertyData.insurancePaymentStartDate) : undefined,
            // TX-32: ローン保証料
            loanGuaranteePaidAmount: propertyData.loanGuaranteePaidAmount,
            loanGuaranteePeriodYears: propertyData.loanGuaranteePeriodYears,
            loanGuaranteeStartDate: propertyData.loanGuaranteeStartDate ? new Date(propertyData.loanGuaranteeStartDate) : undefined,
            // TX-32: リフォーム・改修費用
            renovationExpenses: propertyData.renovationExpenses?.map(exp => ({
                date: new Date(exp.date),
                amount: exp.amount,
                description: exp.description,
                year: exp.year,
            })),
            // TX-32: ローン手数料
            loanProcessingFee: propertyData.loanProcessingFee,
        });
        return await property.save();
    }
    catch (error) {
        throw new Error(`物件の作成に失敗しました: ${error.message}`);
    }
};
exports.createProperty = createProperty;
/**
 * すべての不動産物件を取得（MongoDB）
 */
const getAllProperties = async () => {
    try {
        return await Property_1.default.find().sort({ createdAt: -1 }).lean();
    }
    catch (error) {
        throw new Error(`物件の取得に失敗しました: ${error.message}`);
    }
};
exports.getAllProperties = getAllProperties;
/**
 * IDで不動産物件を取得（MongoDB）
 */
const getPropertyById = async (id) => {
    try {
        return await Property_1.default.findById(id).lean();
    }
    catch (error) {
        throw new Error(`物件の取得に失敗しました: ${error.message}`);
    }
};
exports.getPropertyById = getPropertyById;
/**
 * 不動産物件を更新（MongoDB）
 */
const updateProperty = async (id, propertyData) => {
    try {
        const updateData = {
            propertyName: propertyData.propertyName,
            address: propertyData.address,
            landValue: propertyData.landValue,
            buildingValue: propertyData.buildingValue,
            totalValue: propertyData.totalValue,
            acquisitionDate: propertyData.acquisitionDate ? new Date(propertyData.acquisitionDate) : undefined,
            acquisitionCost: propertyData.acquisitionCost,
            category: propertyData.category,
            // 取得関連費用
            acquisitionTax: propertyData.acquisitionTax,
            registrationTax: propertyData.registrationTax,
            brokerFee: propertyData.brokerFee,
            otherAcquisitionCosts: propertyData.otherAcquisitionCosts,
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
            // TX-32: 火災・地震保険
            insurancePaidAmount: propertyData.insurancePaidAmount,
            insuranceCoveragePeriodYears: propertyData.insuranceCoveragePeriodYears,
            insurancePaymentStartDate: propertyData.insurancePaymentStartDate ? new Date(propertyData.insurancePaymentStartDate) : undefined,
            // TX-32: ローン保証料
            loanGuaranteePaidAmount: propertyData.loanGuaranteePaidAmount,
            loanGuaranteePeriodYears: propertyData.loanGuaranteePeriodYears,
            loanGuaranteeStartDate: propertyData.loanGuaranteeStartDate ? new Date(propertyData.loanGuaranteeStartDate) : undefined,
            // TX-32: リフォーム・改修費用
            renovationExpenses: propertyData.renovationExpenses?.map(exp => ({
                date: new Date(exp.date),
                amount: exp.amount,
                description: exp.description,
                year: exp.year,
            })),
            // TX-32: ローン手数料
            loanProcessingFee: propertyData.loanProcessingFee,
        };
        // undefinedの値を削除
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        return await Property_1.default.findByIdAndUpdate(id, updateData, { new: true }).lean();
    }
    catch (error) {
        throw new Error(`物件の更新に失敗しました: ${error.message}`);
    }
};
exports.updateProperty = updateProperty;
/**
 * 不動産物件を削除（MongoDB）
 */
const deleteProperty = async (id) => {
    try {
        return await Property_1.default.findByIdAndDelete(id).lean();
    }
    catch (error) {
        throw new Error(`物件の削除に失敗しました: ${error.message}`);
    }
};
exports.deleteProperty = deleteProperty;
