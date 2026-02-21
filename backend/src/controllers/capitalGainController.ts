/**
 * 譲渡所得計算コントローラー
 */

import { Request, Response } from 'express';
import { calculateCapitalGain, CapitalGainInput } from '../services/capitalGainService';
import {
  saveCapitalGainRecord,
  getCapitalGainRecords,
  deleteCapitalGainRecord,
} from '../services/capitalGainStorageService';

/**
 * 譲渡所得計算ハンドラー
 */
export const calculateCapitalGainHandler = async (req: Request, res: Response) => {
  try {
    const input: CapitalGainInput = req.body;

    // バリデーション
    if (!input.propertyId || !input.saleDate || !input.salePrice) {
      return res.status(400).json({
        success: false,
        error: '必須項目が入力されていません',
      });
    }

    // 計算実行（TX-30: async/await対応）
    const result = await calculateCapitalGain(input);

    return res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Error calculating capital gain:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '計算に失敗しました',
    });
  }
};

/**
 * 譲渡所得計算結果を保存
 */
export const saveCapitalGainHandler = async (req: Request, res: Response) => {
  try {
    const { fiscalYear, propertyId, input, result } = req.body;
    const userId = (req as any).userId || 'demo-user';

    // バリデーション
    if (!fiscalYear || !input || !result) {
      return res.status(400).json({
        success: false,
        error: '年度、入力値と計算結果は必須です',
      });
    }

    const savedRecord = await saveCapitalGainRecord({
      userId,
      fiscalYear,
      propertyId,
      input,
      result,
    });

    res.json({
      success: true,
      data: {
        id: savedRecord._id,
        fiscalYear: savedRecord.fiscalYear,
        propertyId: savedRecord.propertyId,
        createdAt: savedRecord.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error saving capital gain record:', error);
    res.status(500).json({
      success: false,
      error: error.message || '保存に失敗しました',
    });
  }
};

/**
 * 譲渡所得計算履歴を取得
 */
export const getCapitalGainRecordsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 'demo-user';
    const { fiscalYear, propertyId, startDate, endDate } = req.query;

    const filters: any = {};
    if (fiscalYear) filters.fiscalYear = parseInt(fiscalYear as string);
    if (propertyId) filters.propertyId = propertyId as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const records = await getCapitalGainRecords(filters);

    res.json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    console.error('Error fetching capital gain records:', error);
    res.status(500).json({
      success: false,
      error: error.message || '取得に失敗しました',
    });
  }
};

/**
 * 譲渡所得計算履歴を削除
 */
export const deleteCapitalGainRecordHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 'demo-user';
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'IDは必須です',
      });
    }

    await deleteCapitalGainRecord(id);

    res.json({
      success: true,
      message: '計算結果を削除しました',
    });
  } catch (error: any) {
    console.error('Error deleting capital gain record:', error);
    res.status(500).json({
      success: false,
      error: error.message || '削除に失敗しました',
    });
  }
};

/**
 * TX-35: 譲渡所得一覧PDF出力
 */
export const exportCapitalGainListPDF = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string);

    if (!year) {
      return res.status(400).json({
        success: false,
        error: 'year parameter is required',
      });
    }

    // データ取得
    const { getCapitalGainRecords } = await import('../services/capitalGainStorageService');
    const records = await getCapitalGainRecords({ fiscalYear: year });

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No capital gain records found for the specified year',
      });
    }

    // 合計計算
    const totalGain = records.reduce((sum, r: any) => sum + (r.result?.capitalGain || 0), 0);

    // PDF生成
    const { generateCapitalGainListPDF } = await import('../services/pdfGenerationService');
    const pdfStream = generateCapitalGainListPDF({
      year,
      properties: records.map((r: any) => ({
        propertyId: r.propertyId,
        propertyName: `Property ${r.propertyId}`,
        salePrice: r.input?.salePrice || 0,
        acquisitionCost: r.input?.acquisitionCost || 0,
        transferCost: r.input?.sellingExpenses || 0,
        gain: r.result?.capitalGain || 0,
      })),
      totalGain,
    });

    // レスポンスヘッダー設定
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=CapitalGain_${year}.pdf`);

    // PDFをストリーム出力
    pdfStream.pipe(res);
  } catch (error: any) {
    console.error('Error exporting capital gain PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export capital gain PDF: ' + error.message,
    });
  }
};
