import PDFDocument from 'pdfkit';
import { JP_FONT, JP_FONT_BOLD, registerJapaneseFonts } from './pdfFonts';

/**
 * PDF生成サービス
 * RSU所得、不動産所得、譲渡所得のPDF出力機能を提供
 * 
 * 日本語は pdfFonts の日本語フォントで表示する（見つからない環境では Helvetica）
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
    ttmRateDate?: string; // 為替レートの公示日
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
  registerJapaneseFonts(doc);

  const yen = (value: number) => `¥${Math.floor(value).toLocaleString('ja-JP')}`;

  // タイトル
  doc.fontSize(16).font(JP_FONT_BOLD).text('RSU所得一覧', { align: 'center' });
  doc.moveDown(0.5);

  // メタ情報
  doc.fontSize(10).font(JP_FONT)
    .text(`対象年度: ${data.year}年`, { align: 'left' })
    .text(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, { align: 'left' })
    .text('為替レート: 三菱UFJ銀行の公示相場（TTM）。公示のない日は直前の公示日の値', { align: 'left' });

  doc.fontSize(8)
    .fillColor('#666666')
    .text('※ 参考資料です。申告の際は、税理士または税務署に確認してください。円換算額は1円未満を切り捨てて表示しています。', {
      align: 'left',
    })
    .fillColor('#000000');

  doc.moveDown(0.8);

  // テーブルヘッダー
  const startY = doc.y;
  const columns = [
    { x: 40, width: 85, header: '会社名', align: 'left' as const },
    { x: 125, width: 70, header: '権利確定日', align: 'center' as const },
    { x: 195, width: 45, header: '株数', align: 'right' as const },
    { x: 240, width: 60, header: '単価(USD)', align: 'right' as const },
    { x: 300, width: 55, header: 'TTM', align: 'right' as const },
    { x: 355, width: 80, header: 'レートの公示日', align: 'center' as const },
    { x: 435, width: 120, header: '円換算額', align: 'right' as const },
  ];

  // ヘッダー背景
  doc.rect(40, startY, 515, 20).fill('#E8E8E8');
  doc.fillColor('#000000');

  columns.forEach((col) => {
    doc.fontSize(9).font(JP_FONT_BOLD).text(col.header, col.x, startY + 5, { width: col.width, align: 'center' });
  });

  doc.moveDown(1.5);

  // データ行
  let rowY = doc.y;
  data.result.forEach((item, index) => {
    const rowHeight = 20;
    if (index % 2 === 0) {
      doc.rect(40, rowY - 5, 515, rowHeight).fill('#F8F8F8');
    }
    doc.fillColor('#000000').fontSize(9).font(JP_FONT);
    const cells = [
      item.companyName,
      new Date(item.vestingDate).toLocaleDateString('ja-JP'),
      item.shares.toLocaleString('ja-JP'),
      `$${item.pricePerShareUSD.toFixed(2)}`,
      `¥${item.ttmRate.toFixed(2)}`,
      item.ttmRateDate ?? '不明',
      yen(item.totalValueJPY),
    ];
    cells.forEach((text, i) => {
      doc.text(text, columns[i].x, rowY, { width: columns[i].width, align: columns[i].align });
    });
    rowY += rowHeight;
  });

  // 合計行
  doc.rect(40, rowY - 5, 515, 25).fill('#D4E6F1');
  doc.fillColor('#000000').fontSize(10).font(JP_FONT_BOLD);
  doc.text('年間合計', 40, rowY, { width: 100, align: 'left' });
  doc.text(yen(data.totalRSUIncome), 435, rowY, { width: 120, align: 'right' });

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
  registerJapaneseFonts(doc);

  // タイトル（英語表記）
  doc.fontSize(16).font(JP_FONT_BOLD).text('Tax Filing Support - Real Estate Income List', { align: 'center' });
  doc.moveDown(0.5);

  // メタ情報
  doc.fontSize(10).font(JP_FONT)
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
      .font(JP_FONT)
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

    doc.fillColor('#000000').fontSize(9).font(JP_FONT);

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
  doc.fillColor('#000000').fontSize(10).font(JP_FONT);

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
  registerJapaneseFonts(doc);

  // タイトル（英語表記）
  doc.fontSize(16).font(JP_FONT_BOLD).text('Tax Filing Support - Capital Gain List', { align: 'center' });
  doc.moveDown(0.5);

  // メタ情報
  doc.fontSize(10).font(JP_FONT)
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
      .font(JP_FONT)
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

    doc.fillColor('#000000').fontSize(9).font(JP_FONT);

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
  doc.fillColor('#000000').fontSize(10).font(JP_FONT);

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
