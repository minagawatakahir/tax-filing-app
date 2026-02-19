import { Request, Response } from 'express';
import {
  saveRSUIncomeRecord,
  getRSUIncomeRecords,
  getRSUIncomeRecordById,
  deleteRSUIncomeRecord,
  updateRSUIncomeRecord,
  getTotalRSUIncomeByYear,
} from '../services/rsuIncomeStorageService';
import { generateRSUIncomeListPDF } from '../services/pdfGenerationService';

/**
 * RSU所得の保存・取得・削除を行うコントローラー
 */

/**
 * RSU所得計算結果を保存
 * POST /api/rsu-income/save
 */
export const saveRSUIncome = async (req: Request, res: Response) => {
  try {
    const { year, input, result, totalRSUIncome } = req.body;
    const userId = req.query.userId as string || 'demo-user';

    // バリデーション
    if (!year || !input || !result || totalRSUIncome === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: year, input, result, totalRSUIncome',
      });
    }

    if (!Array.isArray(input) || !Array.isArray(result)) {
      return res.status(400).json({
        success: false,
        error: 'input and result must be arrays',
      });
    }

    const savedRecord = await saveRSUIncomeRecord(
      userId,
      year,
      input,
      result,
      totalRSUIncome
    );

    res.status(201).json({
      success: true,
      data: {
        id: savedRecord._id,
        userId: savedRecord.userId,
        year: savedRecord.year,
        totalRSUIncome: savedRecord.totalRSUIncome,
        createdAt: savedRecord.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error saving RSU income record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save RSU income record: ' + error.message,
    });
  }
};

/**
 * RSU所得記録を取得
 * GET /api/rsu-income/list?year=2026
 */
export const getRSUIncomeList = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'demo-user';
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const records = await getRSUIncomeRecords(userId, year);

    res.status(200).json({
      success: true,
      data: records.map((record) => ({
        id: record._id,
        userId: record.userId,
        year: record.year,
        input: record.input,
        result: record.result,
        totalRSUIncome: record.totalRSUIncome,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching RSU income records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RSU income records: ' + error.message,
    });
  }
};

/**
 * RSU所得記録を1件取得
 * GET /api/rsu-income/:id
 */
export const getRSUIncomeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const record = await getRSUIncomeRecordById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'RSU income record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: record._id,
        userId: record.userId,
        year: record.year,
        input: record.input,
        result: record.result,
        totalRSUIncome: record.totalRSUIncome,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching RSU income record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RSU income record: ' + error.message,
    });
  }
};

/**
 * RSU所得記録を削除
 * DELETE /api/rsu-income/:id
 */
export const deleteRSUIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const deleted = await deleteRSUIncomeRecord(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'RSU income record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'RSU income record deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting RSU income record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete RSU income record: ' + error.message,
    });
  }
};

/**
 * RSU所得記録を更新
 * PUT /api/rsu-income/:id
 */
export const updateRSUIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const updateData = req.body;

    const updatedRecord = await updateRSUIncomeRecord(id, updateData);

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        error: 'RSU income record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedRecord._id,
        userId: updatedRecord.userId,
        year: updatedRecord.year,
        totalRSUIncome: updatedRecord.totalRSUIncome,
        updatedAt: updatedRecord.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating RSU income record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update RSU income record: ' + error.message,
    });
  }
};

/**
 * 年度別合計RSU所得を取得
 * GET /api/rsu-income/summary?year=2026
 */
export const getRSUIncomeSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'demo-user';
    const year = parseInt(req.query.year as string);

    if (!year) {
      return res.status(400).json({
        success: false,
        error: 'year parameter is required',
      });
    }

    const totalIncome = await getTotalRSUIncomeByYear(userId, year);

    res.status(200).json({
      success: true,
      data: {
        userId,
        year,
        totalRSUIncome: totalIncome,
      },
    });
  } catch (error: any) {
    console.error('Error fetching RSU income summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RSU income summary: ' + error.message,
    });
  }
};

/**
 * RSU所得一覧をPDF形式で出力
 * GET /api/rsu-income/export-pdf?year=2026
 */
export const exportRSUIncomePDF = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'demo-user';
    const year = parseInt(req.query.year as string);

    if (!year) {
      return res.status(400).json({
        success: false,
        error: 'year parameter is required',
      });
    }

    // データ取得
    const records = await getRSUIncomeRecords(userId, year);

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No RSU income records found for the specified year',
      });
    }

    // 複数レコードがある場合は統合
    const allResults = records.flatMap(record => record.result);
    const totalRSUIncome = records.reduce((sum, record) => sum + record.totalRSUIncome, 0);

    // PDF生成
    const pdfStream = generateRSUIncomeListPDF({
      year,
      result: allResults,
      totalRSUIncome,
    });

    // レスポンスヘッダー設定
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=RSU_Income_${year}.pdf`);

    // PDFをストリーム出力
    pdfStream.pipe(res);
  } catch (error: any) {
    console.error('Error exporting RSU income PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export RSU income PDF: ' + error.message,
    });
  }
};
