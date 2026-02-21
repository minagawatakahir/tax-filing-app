import { Request, Response } from 'express';
import { calculateSalaryIncome, SalaryIncomeInput } from '../services/salaryIncomeService';
import {
  saveSalaryIncomeRecord,
  getSalaryIncomeRecords,
  deleteSalaryIncomeRecord,
} from '../services/salaryIncomeStorageService';

/**
 * 給与所得計算ハンドラー
 */
export const calculateSalaryIncomeHandler = async (req: Request, res: Response) => {
  try {
    const {
      annualSalary,
      withheldTax,
      socialInsurance,
      lifeInsurance,
      dependents,
      spouseDeduction,
    } = req.body;

    // バリデーション
    if (!annualSalary || annualSalary < 0) {
      return res.status(400).json({
        success: false,
        error: '給与収入は0以上の数値を指定してください',
      });
    }

    const input: SalaryIncomeInput = {
      annualSalary: parseFloat(annualSalary),
      withheldTax: parseFloat(withheldTax) || 0,
      socialInsurance: parseFloat(socialInsurance) || 0,
      lifeInsurance: parseFloat(lifeInsurance),
      dependents: parseInt(dependents) || 0,
      spouseDeduction: spouseDeduction || false,
    };

    const result = calculateSalaryIncome(input);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 給与所得計算結果を保存
 */
export const saveSalaryIncomeHandler = async (req: Request, res: Response) => {
  try {
    const { year, input, result } = req.body;
    const userId = (req as any).userId || 'demo-user'; // ミドルウェアで設定されるユーザーID

    // バリデーション
    if (!year || !input || !result) {
      return res.status(400).json({
        success: false,
        error: '年度、入力値、計算結果は必須です',
      });
    }

    const savedRecord = await saveSalaryIncomeRecord({
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
  } catch (error: any) {
    console.error('Error saving salary income record:', error);
    res.status(500).json({
      success: false,
      error: error.message || '保存に失敗しました',
    });
  }
};

/**
 * 給与所得計算履歴を取得
 */
export const getSalaryIncomeRecordsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 'demo-user';
    const { year, startDate, endDate } = req.query;

    const filters: any = {};
    if (year) filters.year = parseInt(year as string);
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const records = await getSalaryIncomeRecords(filters);

    res.json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    console.error('Error fetching salary income records:', error);
    res.status(500).json({
      success: false,
      error: error.message || '取得に失敗しました',
    });
  }
};

/**
 * 給与所得計算履歴を削除
 */
export const deleteSalaryIncomeRecordHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 'demo-user';
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'IDは必須です',
      });
    }

    await deleteSalaryIncomeRecord(id);

    res.json({
      success: true,
      message: '計算結果を削除しました',
    });
  } catch (error: any) {
    console.error('Error deleting salary income record:', error);
    res.status(500).json({
      success: false,
      error: error.message || '削除に失敗しました',
    });
  }
};

/**
 * 給与所得一覧をCSV形式でエクスポート
 */
export const exportSalaryIncomeCSVHandler = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year);
    const userId = (req as any).userId || 'demo-user';

    if (!year || isNaN(year)) {
      return res.status(400).json({
        success: false,
        error: '年度は必須です',
      });
    }

    const records = await getSalaryIncomeRecords({ year });

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
  } catch (error: any) {
    console.error('Error exporting salary income CSV:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'CSV出力に失敗しました',
    });
  }
};
