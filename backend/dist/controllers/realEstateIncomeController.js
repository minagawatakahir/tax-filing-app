"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRealEstateIncomePDF = exports.calculatePortfolioIncomeHandler = exports.calculateSinglePropertyIncomeHandler = void 0;
const realEstateIncomeService_1 = require("../services/realEstateIncomeService");
const Property_1 = __importDefault(require("../models/Property"));
/**
 * 単一物件の不動産所得を計算
 */
const calculateSinglePropertyIncomeHandler = async (req, res) => {
    try {
        const { income, expenses, depreciationAsset, multiYearInsurance, loanGuarantee, additionalExpenses } = req.body;
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
                // 耐用年数の計算
                let calculatedUsefulLife = property.usefulLife;
                if (!calculatedUsefulLife) {
                    const legalUsefulLife = getDefaultUsefulLife(property.buildingStructure, property.category);
                    // 中古物件の場合、簡便法で耐用年数を計算
                    if (property.constructionDate && !property.isNewProperty) {
                        calculatedUsefulLife = calculateUsedPropertyUsefulLife(legalUsefulLife, property.constructionDate, property.acquisitionDate);
                    }
                    else {
                        // 新築物件の場合、法定耐用年数を使用
                        calculatedUsefulLife = legalUsefulLife;
                    }
                }
                // 物件情報から減価償却資産を自動生成
                depreciationAssetToUse = {
                    assetId: property.propertyId,
                    assetName: property.propertyName || '建物',
                    acquisitionDate: property.acquisitionDate,
                    acquisitionCost: property.buildingValue, // 建物価値を取得価額とする
                    category: 'building',
                    usefulLife: calculatedUsefulLife,
                    depreciationMethod: property.depreciationMethod === 'declining-balance' ? 'declining' : 'straight',
                };
            }
        }
        // TX-29: async/await対応
        const result = await (0, realEstateIncomeService_1.calculateRealEstateIncome)(income, expenses, depreciationAssetToUse);
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
 * 建物構造とカテゴリーからデフォルト耐用年数を取得（新築物件）
 */
function getDefaultUsefulLife(structure, category) {
    // デフォルト値
    if (!structure)
        return 47; // RC造住宅用のデフォルト
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
 * 中古物件の耐用年数を簡便法で計算
 * @param legalUsefulLife 法定耐用年数
 * @param constructionDate 建築年月
 * @param acquisitionDate 取得年月
 * @returns 計算後の耐用年数
 */
function calculateUsedPropertyUsefulLife(legalUsefulLife, constructionDate, acquisitionDate) {
    // 経過年数を計算（月単位）
    const elapsedMonths = Math.floor((acquisitionDate.getTime() - constructionDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const elapsedYears = Math.floor(elapsedMonths / 12);
    // 法定耐用年数をすべて経過している場合
    if (elapsedYears >= legalUsefulLife) {
        return Math.floor(legalUsefulLife * 0.2);
    }
    // 法定耐用年数の一部を経過している場合
    const remainingYears = legalUsefulLife - elapsedYears;
    const additionalYears = Math.floor(elapsedYears * 0.2);
    return remainingYears + additionalYears;
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
        // TX-29: async/await対応（Promise.allで並列処理）
        const calculations = await Promise.all(properties.map((property) => {
            return (0, realEstateIncomeService_1.calculateRealEstateIncome)(property.income, property.expenses, property.depreciationAsset);
        }));
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
/**
 * TX-35: 不動産所得一覧PDF出力
 */
const exportRealEstateIncomePDF = async (req, res) => {
    try {
        const year = parseInt(req.query.year);
        if (!year) {
            return res.status(400).json({
                success: false,
                error: 'year parameter is required',
            });
        }
        // データ取得
        const { getRealEstateIncomeByFiscalYear } = await Promise.resolve().then(() => __importStar(require('../services/realEstateIncomeStorageService')));
        const records = await getRealEstateIncomeByFiscalYear(year);
        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No real estate income records found for the specified year',
            });
        }
        // 合計計算
        const totalIncome = records.reduce((sum, r) => sum + r.totalIncome, 0);
        const totalExpenses = records.reduce((sum, r) => sum + r.totalExpenses, 0);
        const totalNetIncome = records.reduce((sum, r) => sum + r.realEstateIncome, 0);
        // PDF生成
        const { generateRealEstateIncomeListPDF } = await Promise.resolve().then(() => __importStar(require('../services/pdfGenerationService')));
        const pdfStream = generateRealEstateIncomeListPDF({
            year,
            properties: records.map(r => ({
                propertyId: r.propertyId,
                propertyName: r.propertyName,
                rentalIncome: r.totalIncome,
                expenses: r.totalExpenses,
                netIncome: r.realEstateIncome,
            })),
            totalIncome,
            totalExpenses,
            totalNetIncome,
        });
        // レスポンスヘッダー設定
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=RealEstateIncome_${year}.pdf`);
        // PDFをストリーム出力
        pdfStream.pipe(res);
    }
    catch (error) {
        console.error('Error exporting real estate income PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export real estate income PDF: ' + error.message,
        });
    }
};
exports.exportRealEstateIncomePDF = exportRealEstateIncomePDF;
