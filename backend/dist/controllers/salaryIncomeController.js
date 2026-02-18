"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalaryIncomeRecordHandler = exports.getSalaryIncomeRecordsHandler = exports.saveSalaryIncomeHandler = exports.calculateSalaryIncomeHandler = void 0;
const salaryIncomeService_1 = require("../services/salaryIncomeService");
const salaryIncomeStorageService_1 = require("../services/salaryIncomeStorageService");
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
/**
 * 給与所得計算結果を保存
 */
const saveSalaryIncomeHandler = async (req, res) => {
    try {
        const { year, input, result } = req.body;
        const userId = req.userId || 'demo-user'; // ミドルウェアで設定されるユーザーID
        // バリデーション
        if (!year || !input || !result) {
            return res.status(400).json({
                success: false,
                error: '年度、入力値、計算結果は必須です',
            });
        }
        const savedRecord = await (0, salaryIncomeStorageService_1.saveSalaryIncomeRecord)({
            userId,
            year,
            input,
            result,
        });
        res.json({
            success: true,
            data: {
                id: savedRecord._id,
                year: savedRecord.year,
                createdAt: savedRecord.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error saving salary income record:', error);
        res.status(500).json({
            success: false,
            error: error.message || '保存に失敗しました',
        });
    }
};
exports.saveSalaryIncomeHandler = saveSalaryIncomeHandler;
/**
 * 給与所得計算履歴を取得
 */
const getSalaryIncomeRecordsHandler = async (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { year, startDate, endDate } = req.query;
        const filters = {};
        if (year)
            filters.year = parseInt(year);
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        const records = await (0, salaryIncomeStorageService_1.getSalaryIncomeRecords)(filters);
        res.json({
            success: true,
            data: records,
        });
    }
    catch (error) {
        console.error('Error fetching salary income records:', error);
        res.status(500).json({
            success: false,
            error: error.message || '取得に失敗しました',
        });
    }
};
exports.getSalaryIncomeRecordsHandler = getSalaryIncomeRecordsHandler;
/**
 * 給与所得計算履歴を削除
 */
const deleteSalaryIncomeRecordHandler = async (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'IDは必須です',
            });
        }
        await (0, salaryIncomeStorageService_1.deleteSalaryIncomeRecord)(id);
        res.json({
            success: true,
            message: '計算結果を削除しました',
        });
    }
    catch (error) {
        console.error('Error deleting salary income record:', error);
        res.status(500).json({
            success: false,
            error: error.message || '削除に失敗しました',
        });
    }
};
exports.deleteSalaryIncomeRecordHandler = deleteSalaryIncomeRecordHandler;
