import { Router } from 'express';
import {
  generatePropertyDebtScheduleHandler,
  generateTaxFilingDocumentsHandler,
  exportDocumentHandler,
} from '../controllers/documentController';

const router = Router();

/**
 * POST /api/documents/property-debt-schedule
 * 財産債務調書の自動生成
 */
router.post('/property-debt-schedule', generatePropertyDebtScheduleHandler);

/**
 * POST /api/documents/tax-filing
 * 税務申告書類一式の生成
 */
router.post('/tax-filing', generateTaxFilingDocumentsHandler);

/**
 * GET /api/documents/export/:documentId
 * 書類のエクスポート（PDF/Excel）
 */
router.get('/export/:documentId', exportDocumentHandler);

export default router;
