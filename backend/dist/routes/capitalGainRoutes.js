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
exports.default = router;
