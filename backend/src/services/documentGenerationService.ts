/**
 * 調書自動生成サービス
 * 資産データからの財産債務調書フォーマット出力
 */

export interface PropertyDebtItem {
  category: '不動産' | '有価証券' | '現金・預金' | 'その他資産' | '債務';
  description: string;
  quantity?: number;
  unitPrice?: number;
  totalValue: number;
  location?: string;
  remarks?: string;
}

export interface PropertyDebtSchedule {
  year: number;
  taxpayerName: string;
  taxpayerId: string;
  asOfDate: Date;
  assets: PropertyDebtItem[];
  liabilities: PropertyDebtItem[];
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface TaxFilingDocument {
  documentType: string;
  year: number;
  taxpayerInfo: {
    name: string;
    taxpayerId: string;
    address: string;
  };
  data: any;
  generatedDate: Date;
}

/**
 * 財産債務調書を生成
 * @param assets 資産情報
 * @param liabilities 負債情報
 * @param taxpayerInfo 納税者情報
 * @param year 年度
 * @returns 財産債務調書
 */
export const generatePropertyDebtSchedule = (
  assets: PropertyDebtItem[],
  liabilities: PropertyDebtItem[],
  taxpayerInfo: { name: string; taxpayerId: string },
  year: number
): PropertyDebtSchedule => {
  // 資産合計
  const totalAssets = assets.reduce((sum, item) => sum + item.totalValue, 0);
  
  // 負債合計
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.totalValue, 0);
  
  // 純資産
  const netWorth = totalAssets - totalLiabilities;
  
  return {
    year,
    taxpayerName: taxpayerInfo.name,
    taxpayerId: taxpayerInfo.taxpayerId,
    asOfDate: new Date(year, 11, 31), // 12月31日時点
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
  };
};

/**
 * 財産債務調書をCSVフォーマットに変換
 * @param schedule 財産債務調書
 * @returns CSV文字列
 */
export const exportPropertyDebtScheduleToCSV = (schedule: PropertyDebtSchedule): string => {
  const lines: string[] = [];
  
  // ヘッダー
  lines.push('財産債務調書');
  lines.push(`年度,${schedule.year}`);
  lines.push(`納税者氏名,${schedule.taxpayerName}`);
  lines.push(`納税者番号,${schedule.taxpayerId}`);
  lines.push(`基準日,${schedule.asOfDate.toISOString().split('T')[0]}`);
  lines.push('');
  
  // 資産の部
  lines.push('【資産の部】');
  lines.push('区分,内容,数量,単価,評価額,所在地,備考');
  
  schedule.assets.forEach(item => {
    lines.push([
      item.category,
      item.description,
      item.quantity || '',
      item.unitPrice || '',
      item.totalValue,
      item.location || '',
      item.remarks || '',
    ].join(','));
  });
  
  lines.push(`資産合計,,,,,${schedule.totalAssets},`);
  lines.push('');
  
  // 負債の部
  lines.push('【負債の部】');
  lines.push('区分,内容,数量,単価,評価額,所在地,備考');
  
  schedule.liabilities.forEach(item => {
    lines.push([
      item.category,
      item.description,
      item.quantity || '',
      item.unitPrice || '',
      item.totalValue,
      item.location || '',
      item.remarks || '',
    ].join(','));
  });
  
  lines.push(`負債合計,,,,,${schedule.totalLiabilities},`);
  lines.push('');
  
  // 純資産
  lines.push(`純資産,,,,,${schedule.netWorth},`);
  
  return lines.join('\n');
};

/**
 * 財産債務調書をJSONフォーマットに変換
 * @param schedule 財産債務調書
 * @returns JSON文字列
 */
export const exportPropertyDebtScheduleToJSON = (schedule: PropertyDebtSchedule): string => {
  return JSON.stringify(schedule, null, 2);
};

/**
 * 確定申告書類一式を生成
 * @param year 年度
 * @param taxpayerInfo 納税者情報
 * @param data 申告データ
 * @returns 申告書類一式
 */
export const generateTaxFilingDocuments = (
  year: number,
  taxpayerInfo: { name: string; taxpayerId: string; address: string },
  data: {
    income: any;
    deductions: any;
    assets?: PropertyDebtItem[];
    liabilities?: PropertyDebtItem[];
  }
): TaxFilingDocument[] => {
  const documents: TaxFilingDocument[] = [];
  
  // 1. 所得税申告書
  documents.push({
    documentType: '所得税確定申告書',
    year,
    taxpayerInfo,
    data: {
      income: data.income,
      deductions: data.deductions,
    },
    generatedDate: new Date(),
  });
  
  // 2. 財産債務調書（該当者のみ）
  if (data.assets && data.liabilities) {
    const totalAssets = data.assets.reduce((sum, item) => sum + item.totalValue, 0);
    
    // 資産3億円以上、または有価証券1億円以上の場合に提出義務
    if (totalAssets >= 300000000) {
      const schedule = generatePropertyDebtSchedule(
        data.assets,
        data.liabilities,
        taxpayerInfo,
        year
      );
      
      documents.push({
        documentType: '財産債務調書',
        year,
        taxpayerInfo,
        data: schedule,
        generatedDate: new Date(),
      });
    }
  }
  
  return documents;
};

/**
 * 書類をエクスポート（CSV形式）
 * @param document 書類データ
 * @returns エクスポートされたデータ
 */
export const exportDocument = (document: TaxFilingDocument): { format: string; data: string } => {
  if (document.documentType === '財産債務調書') {
    return {
      format: 'csv',
      data: exportPropertyDebtScheduleToCSV(document.data as PropertyDebtSchedule),
    };
  }
  
  // その他の書類はJSON形式
  return {
    format: 'json',
    data: JSON.stringify(document, null, 2),
  };
};

/**
 * 提出必要書類のチェックリスト生成
 * @param year 年度
 * @param income 所得額
 * @param assets 資産額
 * @returns チェックリスト
 */
export const generateFilingChecklist = (
  year: number,
  income: number,
  assets: number
): {
  required: string[];
  optional: string[];
  deadlines: { [key: string]: string };
} => {
  const required: string[] = ['所得税確定申告書'];
  const optional: string[] = [];
  const deadlines: { [key: string]: string } = {
    '所得税確定申告書': `${year + 1}年3月15日`,
  };
  
  // 財産債務調書の提出義務判定
  if (assets >= 300000000) {
    required.push('財産債務調書');
    deadlines['財産債務調書'] = `${year + 1}年3月15日`;
  }
  
  // 青色申告の場合
  if (income > 0) {
    optional.push('青色申告決算書');
    optional.push('収支内訳書');
  }
  
  return {
    required,
    optional,
    deadlines,
  };
};
