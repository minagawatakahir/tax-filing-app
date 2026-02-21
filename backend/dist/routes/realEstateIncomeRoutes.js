"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const realEstateIncomeController_1 = require("../controllers/realEstateIncomeController");
const router = express_1.default.Router();
/**
 * POST /api/real-estate-income/calculate
 * 単一物件の不動産所得を計算
 */
router.post('/calculate', realEstateIncomeController_1.calculateSinglePropertyIncomeHandler);
/**
 * POST /api/real-estate-income/portfolio
 * 複数物件の不動産所得を一括計算
 */
router.post('/portfolio', realEstateIncomeController_1.calculatePortfolioIncomeHandler);
/**
 * GET /api/real-estate-income/export-pdf?year=2026
 * TX-35: 不動産所得一覧をPDF出力
 */
router.get('/export-pdf', realEstateIncomeController_1.exportRealEstateIncomePDF);
exports.default = router;
