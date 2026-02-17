"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentController_1 = require("../controllers/documentController");
const router = (0, express_1.Router)();
/**
 * POST /api/documents/property-debt-schedule
 * 財産債務調書の自動生成
 */
router.post('/property-debt-schedule', documentController_1.generatePropertyDebtScheduleHandler);
/**
 * POST /api/documents/tax-filing
 * 税務申告書類一式の生成
 */
router.post('/tax-filing', documentController_1.generateTaxFilingDocumentsHandler);
/**
 * GET /api/documents/export/:documentId
 * 書類のエクスポート（PDF/Excel）
 */
router.get('/export/:documentId', documentController_1.exportDocumentHandler);
exports.default = router;
