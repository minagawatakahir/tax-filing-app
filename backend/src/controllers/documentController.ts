import { Request, Response } from 'express';
import {
  generatePropertyDebtSchedule,
  generateTaxFilingDocuments,
  exportDocument,
  generateFilingChecklist,
  PropertyDebtItem,
} from '../services/documentGenerationService';

/**
 * 財産債務調書生成ハンドラー
 */
export const generatePropertyDebtScheduleHandler = async (req: Request, res: Response) => {
  try {
    const { assets, liabilities, taxpayerInfo, year } = req.body;

    const schedule = generatePropertyDebtSchedule(assets, liabilities, taxpayerInfo, year);

    res.json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 税務申告書類生成ハンドラー
 */
export const generateTaxFilingDocumentsHandler = async (req: Request, res: Response) => {
  try {
    const { year, taxpayerInfo, income, deductions, assets, liabilities } = req.body;

    const documents = generateTaxFilingDocuments(year, taxpayerInfo, {
      income,
      deductions,
      assets,
      liabilities,
    });

    res.json({ success: true, data: documents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 書類エクスポートハンドラー
 */
export const exportDocumentHandler = async (req: Request, res: Response) => {
  try {
    const documentData = req.body.document;

    const exported = exportDocument(documentData);

    res.setHeader('Content-Type', exported.format === 'csv' ? 'text/csv' : 'application/json');
    res.send(exported.data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 提出必要書類チェックリスト生成ハンドラー
 */
export const generateFilingChecklistHandler = async (req: Request, res: Response) => {
  try {
    const { year, income, assets } = req.body;

    const checklist = generateFilingChecklist(year, income, assets);

    res.json({ success: true, data: checklist });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
