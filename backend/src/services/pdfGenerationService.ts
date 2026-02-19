import PDFDocument from 'pdfkit';

/**
 * PDF生成サービス
 * RSU所得、不動産所得、譲渡所得のPDF出力機能を提供
 * 
 * Note: 日本語表示の問題を避けるため、現在は英語表記を使用
 */

interface RSUIncomeData {
  year: number;
  result: Array<{
    companyName: string;
    vestingDate: Date;
    shares: number;
    pricePerShareUSD: number;
    ttmRate: number;
    totalValueJPY: number;
    taxableIncome: number;
  }>;
  totalRSUIncome: number;
}

interface RealEstateIncomeData {
  year: number;
  properties: Array<{
    propertyId: string;
    propertyName: string;
    rentalIncome: number;
    expenses: number;
    netIncome: number;
  }>;
  totalIncome: number;
  totalExpenses: number;
  totalNetIncome: number;
}

interface CapitalGainData {
  year: number;
  properties: Array<{
    propertyId: string;
    propertyName: string;
    salePrice: number;
    acquisitionCost: number;
    transferCost: number;
    gain: number;
  }>;
  totalGain: number;
}

/**
 * RSU所得一覧PDF生成
 */
export const generateRSUIncomeListPDF = (data: RSUIncomeData): PDFKit.PDFDocument => {
  const doc = new PDFDocument({
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
    { x: 40, width: 100, header: 'Company' },
    { x: 140, width: 90, header: 'Vesting Date' },
    { x: 230, width: 70, header: 'Shares' },
    { x: 300, width: 70, header: 'USD Price' },
    { x: 370, width: 75, header: 'TTM Rate' },
    { x: 445, width: 90, header: 'JPY Amount' },
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

  doc.text('Total', 40, rowY, { width: 100, align: 'left' });
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

/**
 * 不動産所得一覧PDF生成
 */
export const generateRealEstateIncomeListPDF = (data: RealEstateIncomeData): PDFKit.PDFDocument => {
  const doc = new PDFDocument({
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
    { x: 40, width: 120, header: 'Property' },
    { x: 160, width: 100, header: 'Rental Income' },
    { x: 260, width: 100, header: 'Expenses' },
    { x: 360, width: 100, header: 'Net Income' },
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

/**
 * 譲渡所得一覧PDF生成
 */
export const generateCapitalGainListPDF = (data: CapitalGainData): PDFKit.PDFDocument => {
  const doc = new PDFDocument({
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
    { x: 40, width: 110, header: 'Property' },
    { x: 150, width: 90, header: 'Sale Price' },
    { x: 240, width: 90, header: 'Acquisition Cost' },
    { x: 330, width: 90, header: 'Transfer Cost' },
    { x: 420, width: 90, header: 'Capital Gain' },
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
