"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickSimulationHandler = exports.calculateTaxHandler = void 0;
const taxCalculator_1 = require("../services/taxCalculator");
/**
 * 税務計算を実行
 */
const calculateTaxHandler = (req, res) => {
    try {
        const { income, expense } = req.body;
        // バリデーション
        if (!income || !expense) {
            return res.status(400).json({ error: '収入と経費のデータが必要です' });
        }
        // 税務計算を実行
        const result = (0, taxCalculator_1.calculateTax)(income, expense);
        // 節税提案を生成
        const suggestions = (0, taxCalculator_1.generateTaxSavingsSuggestions)(income, expense);
        res.json({
            success: true,
            data: {
                calculation: result,
                suggestions,
            },
        });
    }
    catch (error) {
        console.error('Tax calculation error:', error);
        res.status(500).json({ error: '税務計算中にエラーが発生しました' });
    }
};
exports.calculateTaxHandler = calculateTaxHandler;
/**
 * 簡易シミュレーション（クイック計算）
 */
const quickSimulationHandler = (req, res) => {
    try {
        const { annualIncome } = req.body;
        if (!annualIncome || annualIncome <= 0) {
            return res.status(400).json({ error: '年間収入を入力してください' });
        }
        // 標準的な経費率を使用（30%）
        const estimatedExpense = annualIncome * 0.3;
        const netIncome = annualIncome - estimatedExpense;
        const income = {
            businessIncome: annualIncome,
        };
        const expense = {
            rentExpense: estimatedExpense * 0.4,
            utilityExpense: estimatedExpense * 0.1,
            suppliesExpense: estimatedExpense * 0.1,
            travelExpense: estimatedExpense * 0.2,
            communicationExpense: estimatedExpense * 0.1,
            otherExpense: estimatedExpense * 0.1,
        };
        const result = (0, taxCalculator_1.calculateTax)(income, expense);
        res.json({
            success: true,
            data: {
                note: 'これは概算です。正確な計算には詳細な経費入力が必要です。',
                calculation: result,
            },
        });
    }
    catch (error) {
        console.error('Quick simulation error:', error);
        res.status(500).json({ error: 'シミュレーション中にエラーが発生しました' });
    }
};
exports.quickSimulationHandler = quickSimulationHandler;
