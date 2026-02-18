"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePortfolioIncomeHandler = exports.calculateSinglePropertyIncomeHandler = void 0;
const realEstateIncomeService_1 = require("../services/realEstateIncomeService");
const Property_1 = __importDefault(require("../models/Property"));
/**
 * 単一物件の不動産所得を計算
 */
const calculateSinglePropertyIncomeHandler = async (req, res) => {
    try {
        const { income, expenses, depreciationAsset } = req.body;
        if (!income || !expenses) {
            res.status(400).json({
                success: false,
                error: '収入データと経費データが必要です',
            });
            return;
        }
        // 物件IDが指定されている場合、物件情報から減価償却資産を作成
        let depreciationAssetToUse = depreciationAsset;
        if (income.propertyId && !depreciationAsset) {
            const property = await Property_1.default.findOne({ propertyId: income.propertyId });
            if (property && property.buildingValue && property.buildingValue > 0) {
                // 物件情報から減価償却資産を自動生成
                depreciationAssetToUse = {
                    assetId: property.propertyId,
                    assetName: property.propertyName || '建物',
                    acquisitionDate: property.acquisitionDate,
                    acquisitionCost: property.buildingValue, // 建物価値を取得価額とする
                    category: 'building',
                    usefulLife: property.usefulLife || getDefaultUsefulLife(property.buildingStructure, property.category),
                    depreciationMethod: property.depreciationMethod === 'declining-balance' ? 'declining' : 'straight',
                };
            }
        }
        const result = (0, realEstateIncomeService_1.calculateRealEstateIncome)(income, expenses, depreciationAssetToUse);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.calculateSinglePropertyIncomeHandler = calculateSinglePropertyIncomeHandler;
/**
 * 建物構造とカテゴリーからデフォルト耐用年数を取得
 */
function getDefaultUsefulLife(structure, category) {
    // デフォルト値
    if (!structure)
        return 22; // RC造住宅用のデフォルト
    // 住宅用建物の耐用年数
    if (category === 'residential') {
        switch (structure) {
            case 'wood':
                return 22; // 木造
            case 'steel':
                return 27; // 鉄骨造（3mm超4mm以下）
            case 'rc':
            case 'src':
                return 47; // RC造・SRC造
            default:
                return 22;
        }
    }
    // 事業用建物の耐用年数
    if (category === 'commercial') {
        switch (structure) {
            case 'wood':
                return 22;
            case 'steel':
                return 38;
            case 'rc':
            case 'src':
                return 50;
            default:
                return 22;
        }
    }
    return 22; // その他のデフォルト
}
/**
 * 複数物件の不動産所得を一括計算
 */
const calculatePortfolioIncomeHandler = async (req, res) => {
    try {
        const { year, properties } = req.body;
        if (!year || !properties || !Array.isArray(properties)) {
            res.status(400).json({
                success: false,
                error: '年度と物件データ配列が必要です',
            });
            return;
        }
        const calculations = properties.map((property) => {
            return (0, realEstateIncomeService_1.calculateRealEstateIncome)(property.income, property.expenses, property.depreciationAsset);
        });
        const portfolio = (0, realEstateIncomeService_1.calculateRealEstateIncomePortfolio)(year, calculations);
        res.json({
            success: true,
            data: portfolio,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.calculatePortfolioIncomeHandler = calculatePortfolioIncomeHandler;
