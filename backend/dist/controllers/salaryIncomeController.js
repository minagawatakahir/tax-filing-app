"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportSalaryIncomeCSVHandler = exports.deleteSalaryIncomeRecordHandler = exports.getSalaryIncomeRecordsHandler = exports.saveSalaryIncomeHandler = exports.calculateSalaryIncomeHandler = void 0;
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
/**
 * 給与所得一覧をCSV形式でエクスポート
 */
const exportSalaryIncomeCSVHandler = async (req, res) => {
    try {
        const yearParam = Array.isArray(req.params.year) ? req.params.year[0] : req.params.year;
        const year = parseInt(yearParam);
        const userId = req.userId || 'demo-user';
        if (!year || isNaN(year)) {
            return res.status(400).json({
                success: false,
                error: '年度は必須です',
            });
        }
        const records = await (0, salaryIncomeStorageService_1.getSalaryIncomeRecords)({ year });
        // CSVヘッダー
        const headers = [
            '年度',
            '給与収入',
            '給与所得控除額',
            '給与所得',
            '社会保険料控除',
            '生命保険料控除',
            '基礎控除',
            '扶養控除',
            '配偶者控除',
            '控除額合計',
            '課税所得',
            '推定税額',
            '作成日',
        ];
        // CSVデータ行
        const rows = records.map((record) => [
            record.year,
            record.result.annualSalary,
            record.result.salaryIncomeDeduction,
            record.result.salaryIncome,
            record.result.socialInsurance,
            record.result.lifeInsurance,
            record.result.basicDeduction,
            record.result.dependentDeduction,
            record.result.spouseDeduction,
            record.result.totalDeduction,
            record.result.taxableIncome,
            record.result.estimatedTax,
            new Date(record.createdAt).toLocaleDateString('ja-JP'),
        ]);
        // 集計行
        const totalRow = [
            '合計',
            rows.reduce((sum, row) => sum + Number(row[1]), 0),
            rows.reduce((sum, row) => sum + Number(row[2]), 0),
            rows.reduce((sum, row) => sum + Number(row[3]), 0),
            rows.reduce((sum, row) => sum + Number(row[4]), 0),
            rows.reduce((sum, row) => sum + Number(row[5]), 0),
            rows.reduce((sum, row) => sum + Number(row[6]), 0),
            rows.reduce((sum, row) => sum + Number(row[7]), 0),
            rows.reduce((sum, row) => sum + Number(row[8]), 0),
            rows.reduce((sum, row) => sum + Number(row[9]), 0),
            rows.reduce((sum, row) => sum + Number(row[10]), 0),
            rows.reduce((sum, row) => sum + Number(row[11]), 0),
            '',
        ];
        // CSV生成
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(',')),
            totalRow.join(','),
        ].join('\n');
        // UTF-8 BOMを追加（Excel対応）
        const bom = '\uFEFF';
        const csvWithBom = bom + csvContent;
        // レスポンス設定
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="salary-income-${year}.csv"`);
        res.send(csvWithBom);
    }
    catch (error) {
        console.error('Error exporting salary income CSV:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'CSV出力に失敗しました',
        });
    }
};
exports.exportSalaryIncomeCSVHandler = exportSalaryIncomeCSVHandler;
