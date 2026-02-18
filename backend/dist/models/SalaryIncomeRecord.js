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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryIncomeRecord = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SalaryIncomeRecordSchema = new mongoose_1.Schema({
    userId: { type: String, required: false, default: 'demo-user' },
    year: { type: Number, required: true },
    input: {
        annualSalary: { type: Number, required: true },
        withheldTax: { type: Number, required: true },
        socialInsurance: { type: Number, required: true },
        lifeInsurance: { type: Number },
        dependents: { type: Number },
        spouseDeduction: { type: Boolean },
    },
    result: {
        annualSalary: { type: Number, required: true },
        salaryIncomeDeduction: { type: Number, required: true },
        salaryIncome: { type: Number, required: true },
        socialInsurance: { type: Number, required: true },
        lifeInsurance: { type: Number, required: true },
        basicDeduction: { type: Number, required: true },
        dependentDeduction: { type: Number, required: true },
        spouseDeduction: { type: Number, required: true },
        totalDeduction: { type: Number, required: true },
        taxableIncome: { type: Number, required: true },
        estimatedTax: { type: Number, required: true },
    },
}, {
    timestamps: true,
});
exports.SalaryIncomeRecord = mongoose_1.default.model('SalaryIncomeRecord', SalaryIncomeRecordSchema);
