"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const capitalGainController_1 = require("../controllers/capitalGainController");
const router = express_1.default.Router();
/**
 * POST /api/capital-gain/calculate
 * 譲渡所得を計算
 */
router.post('/calculate', capitalGainController_1.calculateCapitalGainHandler);
/**
 * GET /api/capital-gain/export-pdf?year=2026
 * TX-35: 譲渡所得一覧をPDF出力
 */
router.get('/export-pdf', capitalGainController_1.exportCapitalGainListPDF);
/**
 * GET /api/capital-gain/sold-properties
 * TX-39: 売却済み物件の一覧を取得（譲渡所得計算の候補）
 */
router.get('/sold-properties', capitalGainController_1.getSoldPropertiesHandler);
exports.default = router;
