"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFilingChecklistHandler = exports.exportDocumentHandler = exports.generateTaxFilingDocumentsHandler = exports.generatePropertyDebtScheduleHandler = void 0;
const documentGenerationService_1 = require("../services/documentGenerationService");
/**
 * 財産債務調書生成ハンドラー
 */
const generatePropertyDebtScheduleHandler = async (req, res) => {
    try {
        const { assets, liabilities, taxpayerInfo, year } = req.body;
        const schedule = (0, documentGenerationService_1.generatePropertyDebtSchedule)(assets, liabilities, taxpayerInfo, year);
        res.json({ success: true, data: schedule });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.generatePropertyDebtScheduleHandler = generatePropertyDebtScheduleHandler;
/**
 * 税務申告書類生成ハンドラー
 */
const generateTaxFilingDocumentsHandler = async (req, res) => {
    try {
        const { year, taxpayerInfo, income, deductions, assets, liabilities } = req.body;
        const documents = (0, documentGenerationService_1.generateTaxFilingDocuments)(year, taxpayerInfo, {
            income,
            deductions,
            assets,
            liabilities,
        });
        res.json({ success: true, data: documents });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.generateTaxFilingDocumentsHandler = generateTaxFilingDocumentsHandler;
/**
 * 書類エクスポートハンドラー
 */
const exportDocumentHandler = async (req, res) => {
    try {
        const documentData = req.body.document;
        const exported = (0, documentGenerationService_1.exportDocument)(documentData);
        res.setHeader('Content-Type', exported.format === 'csv' ? 'text/csv' : 'application/json');
        res.send(exported.data);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.exportDocumentHandler = exportDocumentHandler;
/**
 * 提出必要書類チェックリスト生成ハンドラー
 */
const generateFilingChecklistHandler = async (req, res) => {
    try {
        const { year, income, assets } = req.body;
        const checklist = (0, documentGenerationService_1.generateFilingChecklist)(year, income, assets);
        res.json({ success: true, data: checklist });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.generateFilingChecklistHandler = generateFilingChecklistHandler;
