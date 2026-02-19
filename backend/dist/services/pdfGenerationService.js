"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCapitalGainListPDF = exports.generateRealEstateIncomeListPDF = exports.generateRSUIncomeListPDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * RSU所得一覧PDF生成
 */
const generateRSUIncomeListPDF = (data) => {
    const doc = new pdfkit_1.default({
        size: 'A4',
        margin: 40,
    });
    // タイトル（英語表記）
    doc.fontSize(16).font('Helvetica-Bold').text('Tax Filing Support - RSU Income List', { align: 'center' });
    doc.moveDown(0.5);
    // メタ情報
    doc.fontSize(10).font('Helvetica')
        .text(`Fiscal Year: ${data.year}`, { align: 'left' })
        .text(`Generated: ${new Date().toLocaleDateString('en-US')}`, { align: 'left' });
    doc.fontSize(8)
        .fillColor('#666666')
        .text('Note: This document is for reference only. Please consult with a tax accountant.', {
        align: 'left',
    })
        .fillColor('#000000');
    doc.moveDown(0.8);
    // テーブルヘッダー
    const startY = doc.y;
    const columns = [
        { x: 40, width: 100, header: '企業名' },
        { x: 140, width: 90, header: '権利確定日' },
        { x: 230, width: 70, header: '株数' },
        { x: 300, width: 70, header: 'USD単価' },
        { x: 370, width: 75, header: 'TTMレート' },
        { x: 445, width: 90, header: 'JPY評価額' },
    ];
    // ヘッダー背景
    doc.rect(40, startY, 515, 20).fill('#E8E8E8');
    doc.fillColor('#000000');
    // ヘッダーテキスト
    columns.forEach((col) => {
        doc.fontSize(9)
            .font('Helvetica')
            .text(col.header, col.x, startY + 5, {
            width: col.width,
            align: 'center',
        });
    });
    doc.moveDown(1.5);
    // データ行
    let rowY = doc.y;
    data.result.forEach((item, index) => {
        const rowHeight = 20;
        // 背景色（交互）
        if (index % 2 === 0) {
            doc.rect(40, rowY - 5, 515, rowHeight).fill('#F8F8F8');
        }
        doc.fillColor('#000000').fontSize(9).font('Helvetica');
        // 企業名
        doc.text(item.companyName, 40, rowY, { width: 100, align: 'left' });
        // 権利確定日
        doc.text(new Date(item.vestingDate).toLocaleDateString('ja-JP'), 140, rowY, {
            width: 90,
            align: 'center',
        });
        // 株数
        doc.text(item.shares.toLocaleString(), 230, rowY, { width: 70, align: 'right' });
        // USD単価
        doc.text(`$${item.pricePerShareUSD.toFixed(2)}`, 300, rowY, { width: 70, align: 'right' });
        // TTMレート
        doc.text(`¥${item.ttmRate.toFixed(2)}`, 370, rowY, { width: 75, align: 'right' });
        // JPY評価額
        doc.text(`¥${item.totalValueJPY.toLocaleString()}`, 445, rowY, {
            width: 90,
            align: 'right',
        });
        rowY += rowHeight;
    });
    // 合計行
    doc.rect(40, rowY - 5, 515, 25).fill('#D4E6F1');
    doc.fillColor('#000000').fontSize(10).font('Helvetica');
    doc.text('年間合計', 40, rowY, { width: 100, align: 'left' });
    doc.text('', 140, rowY, { width: 90 });
    doc.text('', 230, rowY, { width: 70 });
    doc.text('', 300, rowY, { width: 70 });
    doc.text('', 370, rowY, { width: 75 });
    doc.text(`¥${data.totalRSUIncome.toLocaleString()}`, 445, rowY, {
        width: 90,
        align: 'right',
    });
    doc.end();
    return doc;
};
exports.generateRSUIncomeListPDF = generateRSUIncomeListPDF;
/**
 * 不動産所得一覧PDF生成
 */
const generateRealEstateIncomeListPDF = (data) => {
    const doc = new pdfkit_1.default({
        size: 'A4',
        margin: 40,
    });
    // タイトル（英語表記）
    doc.fontSize(16).font('Helvetica-Bold').text('Tax Filing Support - Real Estate Income List', { align: 'center' });
    doc.moveDown(0.5);
    // メタ情報
    doc.fontSize(10).font('Helvetica')
        .text(`Fiscal Year: ${data.year}`, { align: 'left' })
        .text(`Generated: ${new Date().toLocaleDateString('en-US')}`, { align: 'left' });
    doc.moveDown(0.8);
    // テーブルヘッダー
    const startY = doc.y;
    const columns = [
        { x: 40, width: 120, header: '物件名' },
        { x: 160, width: 100, header: '賃料収入' },
        { x: 260, width: 100, header: '経費' },
        { x: 360, width: 100, header: '所得額' },
    ];
    // ヘッダー背景
    doc.rect(40, startY, 420, 20).fill('#E8E8E8');
    doc.fillColor('#000000');
    // ヘッダーテキスト
    columns.forEach((col) => {
        doc.fontSize(9)
            .font('Helvetica')
            .text(col.header, col.x, startY + 5, {
            width: col.width,
            align: 'center',
        });
    });
    doc.moveDown(1.5);
    // データ行
    let rowY = doc.y;
    data.properties.forEach((property, index) => {
        const rowHeight = 20;
        // 背景色（交互）
        if (index % 2 === 0) {
            doc.rect(40, rowY - 5, 420, rowHeight).fill('#F8F8F8');
        }
        doc.fillColor('#000000').fontSize(9).font('Helvetica');
        // 物件名
        doc.text(property.propertyName, 40, rowY, { width: 120, align: 'left' });
        // 賃料収入
        doc.text(`¥${property.rentalIncome.toLocaleString()}`, 160, rowY, {
            width: 100,
            align: 'right',
        });
        // 経費
        doc.text(`¥${property.expenses.toLocaleString()}`, 260, rowY, {
            width: 100,
            align: 'right',
        });
        // 所得額
        doc.text(`¥${property.netIncome.toLocaleString()}`, 360, rowY, {
            width: 100,
            align: 'right',
        });
        rowY += rowHeight;
    });
    // 合計行
    doc.rect(40, rowY - 5, 420, 25).fill('#D4E6F1');
    doc.fillColor('#000000').fontSize(10).font('Helvetica');
    doc.text('合計', 40, rowY, { width: 120, align: 'left' });
    doc.text(`¥${data.totalIncome.toLocaleString()}`, 160, rowY, { width: 100, align: 'right' });
    doc.text(`¥${data.totalExpenses.toLocaleString()}`, 260, rowY, {
        width: 100,
        align: 'right',
    });
    doc.text(`¥${data.totalNetIncome.toLocaleString()}`, 360, rowY, {
        width: 100,
        align: 'right',
    });
    doc.end();
    return doc;
};
exports.generateRealEstateIncomeListPDF = generateRealEstateIncomeListPDF;
/**
 * 譲渡所得一覧PDF生成
 */
const generateCapitalGainListPDF = (data) => {
    const doc = new pdfkit_1.default({
        size: 'A4',
        margin: 40,
    });
    // タイトル（英語表記）
    doc.fontSize(16).font('Helvetica-Bold').text('Tax Filing Support - Capital Gain List', { align: 'center' });
    doc.moveDown(0.5);
    // メタ情報
    doc.fontSize(10).font('Helvetica')
        .text(`Fiscal Year: ${data.year}`, { align: 'left' })
        .text(`Generated: ${new Date().toLocaleDateString('en-US')}`, { align: 'left' });
    doc.moveDown(0.8);
    // テーブルヘッダー
    const startY = doc.y;
    const columns = [
        { x: 40, width: 110, header: '物件名' },
        { x: 150, width: 90, header: '売却価格' },
        { x: 240, width: 90, header: '取得費' },
        { x: 330, width: 90, header: '譲渡費用' },
        { x: 420, width: 90, header: '譲渡所得' },
    ];
    // ヘッダー背景
    doc.rect(40, startY, 470, 20).fill('#E8E8E8');
    doc.fillColor('#000000');
    // ヘッダーテキスト
    columns.forEach((col) => {
        doc.fontSize(9)
            .font('Helvetica')
            .text(col.header, col.x, startY + 5, {
            width: col.width,
            align: 'center',
        });
    });
    doc.moveDown(1.5);
    // データ行
    let rowY = doc.y;
    data.properties.forEach((property, index) => {
        const rowHeight = 20;
        // 背景色（交互）
        if (index % 2 === 0) {
            doc.rect(40, rowY - 5, 470, rowHeight).fill('#F8F8F8');
        }
        doc.fillColor('#000000').fontSize(9).font('Helvetica');
        // 物件名
        doc.text(property.propertyName, 40, rowY, { width: 110, align: 'left' });
        // 売却価格
        doc.text(`¥${property.salePrice.toLocaleString()}`, 150, rowY, {
            width: 90,
            align: 'right',
        });
        // 取得費
        doc.text(`¥${property.acquisitionCost.toLocaleString()}`, 240, rowY, {
            width: 90,
            align: 'right',
        });
        // 譲渡費用
        doc.text(`¥${property.transferCost.toLocaleString()}`, 330, rowY, {
            width: 90,
            align: 'right',
        });
        // 譲渡所得
        doc.text(`¥${property.gain.toLocaleString()}`, 420, rowY, {
            width: 90,
            align: 'right',
        });
        rowY += rowHeight;
    });
    // 合計行
    doc.rect(40, rowY - 5, 470, 25).fill('#D4E6F1');
    doc.fillColor('#000000').fontSize(10).font('Helvetica');
    doc.text('合計', 40, rowY, { width: 110, align: 'left' });
    doc.text('', 150, rowY, { width: 90 });
    doc.text('', 240, rowY, { width: 90 });
    doc.text('', 330, rowY, { width: 90 });
    doc.text(`¥${data.totalGain.toLocaleString()}`, 420, rowY, {
        width: 90,
        align: 'right',
    });
    doc.end();
    return doc;
};
exports.generateCapitalGainListPDF = generateCapitalGainListPDF;
