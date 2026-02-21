"use strict";
/**
 * 不動産所得データモデル
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealEstateIncome = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RealEstateIncomeSchema = new mongoose_1.Schema({
    userId: { type: String, required: false, default: 'demo-user' },
    fiscalYear: { type: Number, required: true, index: true },
    propertyId: { type: String, required: true },
    propertyName: { type: String, required: true },
    // 収入
    monthlyRent: { type: Number, required: true, default: 0 },
    months: { type: Number, required: true, default: 12 },
    otherIncome: { type: Number, required: true, default: 0 },
    totalIncome: { type: Number, required: true, default: 0 },
    // 経費
    managementFee: { type: Number, required: true, default: 0 },
    repairCost: { type: Number, required: true, default: 0 },
    propertyTax: { type: Number, required: true, default: 0 },
    loanInterest: { type: Number, required: true, default: 0 },
    insurance: { type: Number, required: true, default: 0 },
    utilities: { type: Number, required: true, default: 0 },
    otherExpenses: { type: Number, required: true, default: 0 },
    depreciationExpense: { type: Number, required: true, default: 0 },
    totalExpenses: { type: Number, required: true, default: 0 },
    // 所得
    realEstateIncome: { type: Number, required: true, default: 0 },
}, {
    timestamps: true,
});
exports.RealEstateIncome = mongoose_1.default.model('RealEstateIncome', RealEstateIncomeSchema);
