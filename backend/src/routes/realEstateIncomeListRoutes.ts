import { Router } from 'express';
import {
  saveRealEstateIncome,
  getRealEstateIncomeByFiscalYear,
  deleteRealEstateIncome,
  calculateFiscalYearTotal,
} from '../services/realEstateIncomeStorageService';
import { generateRealEstateIncomeListPDF } from '../services/pdfGenerationService';
import { Request, Response } from 'express';

const router = Router();

/**
 * POST /api/real-estate-income-list
 * 不動産所得データを保存
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const savedRecord = await saveRealEstateIncome(data);
    res.status(201).json({
      success: true,
      data: savedRecord,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/real-estate-income-list/:year
 * 年度別不動産所得一覧を取得
 */
router.get('/:year', async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year as string);
    const records = await getRealEstateIncomeByFiscalYear(year);
    const summary = await calculateFiscalYearTotal(year);
    
    res.json({
      success: true,
      records,
      summary,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/real-estate-income-list/:id
 * 不動産所得データを削除
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await deleteRealEstateIncome(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/real-estate-income-list/export-pdf/:year
 * 不動産所得一覧をPDF形式で出力
 */
router.get('/export-pdf/:year', async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year as string);
    
    if (isNaN(year)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year parameter',
      });
    }
    
    const records = await getRealEstateIncomeByFiscalYear(year);
    const summary = await calculateFiscalYearTotal(year);
    
    // PDF生成用のデータ構造を作成
    const pdfData = {
      year,
      properties: records.map(record => ({
        propertyId: record.propertyId,
        propertyName: record.propertyName || `Property ${record.propertyId}`,
        rentalIncome: record.totalIncome || 0,
        expenses: record.totalExpenses || 0,
        netIncome: record.realEstateIncome || 0,
      })),
      totalIncome: summary.totalIncome || 0,
      totalExpenses: summary.totalExpenses || 0,
      totalNetIncome: summary.totalRealEstateIncome || 0,
    };
    
    const pdfDoc = generateRealEstateIncomeListPDF(pdfData);
    
    // PDFレスポンスヘッダーを設定
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="real-estate-income-${year}.pdf"`);
    
    // PDFストリームをレスポンスにパイプ
    pdfDoc.pipe(res);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'PDF generation failed',
    });
  }
});

/**
 * TX-27: GET /api/real-estate-income-list/export-csv/:year
 * 不動産所得一覧をCSV形式で出力
 */
router.get('/export-csv/:year', async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year as string);
    
    if (isNaN(year)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year parameter',
      });
    }
    
    const records = await getRealEstateIncomeByFiscalYear(year);
    const summary = await calculateFiscalYearTotal(year);
    
    // CSV生成
    const csvLines: string[] = [];
    
    // ヘッダー行
    csvLines.push('物件ID,物件名,月額家賃,契約月数,その他収入,収入合計,管理費,修繕費,固定資産税,ローン利息,保険料,光熱費,その他経費,減価償却費,経費合計,不動産所得');
    
    // データ行
    records.forEach(record => {
      const line = [
        record.propertyId,
        `"${record.propertyName || ''}"`,
        record.monthlyRent || 0,
        record.months || 0,
        record.otherIncome || 0,
        record.totalIncome || 0,
        record.managementFee || 0,
        record.repairCost || 0,
        record.propertyTax || 0,
        record.loanInterest || 0,
        record.insurance || 0,
        record.utilities || 0,
        record.otherExpenses || 0,
        record.depreciationExpense || 0,
        record.totalExpenses || 0,
        record.realEstateIncome || 0,
      ].join(',');
      csvLines.push(line);
    });
    
    // 集計行
    csvLines.push(''); // 空行
    csvLines.push(`合計,${records.length}件,,,${summary.totalIncome || 0},,,,,,,,${summary.totalExpenses || 0},${summary.totalRealEstateIncome || 0}`);
    
    const csv = csvLines.join('\n');
    
    // CSVレスポンスヘッダーを設定
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="real-estate-income-${year}.csv"`);
    
    // BOM（Byte Order Mark）を追加してExcelで正しく表示
    res.send('\uFEFF' + csv);
  } catch (error: any) {
    console.error('Error generating CSV:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'CSV generation failed',
    });
  }
});

export default router;
