"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSalaryIncomeHandler = void 0;
const salaryIncomeService_1 = require("../services/salaryIncomeService");
/**
 * 給与所得計算ハンドラー
 */
const calculateSalaryIncomeHandler = async (req, res) => {
    try {
        const { annualSalary, withheldTax, socialInsurance, lifeInsurance, dependents, spouseDeduction, } = req.body;
        // バリデーション
        if (!annualSalary || annualSalary < 0) {
            return res.status(400).json({
                success: false,
                error: '給与収入は0以上の数値を指定してください',
            });
        }
        const input = {
            annualSalary: parseFloat(annualSalary),
            withheldTax: parseFloat(withheldTax) || 0,
            socialInsurance: parseFloat(socialInsurance) || 0,
            lifeInsurance: parseFloat(lifeInsurance),
            dependents: parseInt(dependents) || 0,
            spouseDeduction: spouseDeduction || false,
        };
        const result = (0, salaryIncomeService_1.calculateSalaryIncome)(input);
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
exports.calculateSalaryIncomeHandler = calculateSalaryIncomeHandler;
