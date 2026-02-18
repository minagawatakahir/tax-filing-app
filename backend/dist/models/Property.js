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
const mongoose_1 = __importStar(require("mongoose"));
const PropertySchema = new mongoose_1.Schema({
    propertyId: {
        type: String,
        unique: true,
        required: true,
    },
    propertyName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    landValue: {
        type: Number,
        default: 0,
    },
    buildingValue: {
        type: Number,
        default: 0,
    },
    totalValue: {
        type: Number,
        required: true,
    },
    acquisitionDate: {
        type: Date,
        required: true,
    },
    acquisitionCost: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        enum: ['residential', 'commercial', 'land'],
        required: true,
    },
    // 取得関連費用
    acquisitionTax: {
        type: Number,
    },
    registrationTax: {
        type: Number,
    },
    brokerFee: {
        type: Number,
    },
    otherAcquisitionCosts: {
        type: Number,
    },
    // ローン関連情報
    outstandingLoan: {
        type: Number,
        default: 0,
    },
    annualInterest: {
        type: Number,
        default: 0,
    },
    loanStartDate: {
        type: Date,
    },
    purpose: {
        type: String,
        enum: ['residential', 'investment', 'business'],
    },
    // 減価償却関連情報
    buildingStructure: {
        type: String,
        enum: ['wood', 'steel', 'rc', 'src'],
    },
    constructionDate: {
        type: Date,
    },
    usefulLife: {
        type: Number,
    },
    depreciationMethod: {
        type: String,
        enum: ['straight-line', 'declining-balance'],
        default: 'straight-line',
    },
    isNewProperty: {
        type: Boolean,
        default: false,
    },
    // TX-32: 火災・地震保険（複数年払い対応）
    insurancePaidAmount: {
        type: Number,
    },
    insuranceCoveragePeriodYears: {
        type: Number,
    },
    insurancePaymentStartDate: {
        type: Date,
    },
    // TX-32: ローン保証料（複数年払い対応）
    loanGuaranteePaidAmount: {
        type: Number,
    },
    loanGuaranteePeriodYears: {
        type: Number,
    },
    loanGuaranteeStartDate: {
        type: Date,
    },
    // TX-32: リフォーム・改修費用（配列）
    renovationExpenses: {
        type: [
            {
                date: Date,
                amount: Number,
                description: String,
                year: Number,
            },
        ],
        default: [],
    },
    // TX-32: ローン手数料
    loanProcessingFee: {
        type: Number,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Property', PropertySchema);
