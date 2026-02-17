"use strict";
/**
 * 調書自動生成サービス
 * 資産データからの財産債務調書フォーマット出力
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFilingChecklist = exports.exportDocument = exports.generateTaxFilingDocuments = exports.exportPropertyDebtScheduleToJSON = exports.exportPropertyDebtScheduleToCSV = exports.generatePropertyDebtSchedule = void 0;
/**
 * 財産債務調書を生成
 * @param assets 資産情報
 * @param liabilities 負債情報
 * @param taxpayerInfo 納税者情報
 * @param year 年度
 * @returns 財産債務調書
 */
const generatePropertyDebtSchedule = (assets, liabilities, taxpayerInfo, year) => {
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
exports.generatePropertyDebtSchedule = generatePropertyDebtSchedule;
/**
 * 財産債務調書をCSVフォーマットに変換
 * @param schedule 財産債務調書
 * @returns CSV文字列
 */
const exportPropertyDebtScheduleToCSV = (schedule) => {
    const lines = [];
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
exports.exportPropertyDebtScheduleToCSV = exportPropertyDebtScheduleToCSV;
/**
 * 財産債務調書をJSONフォーマットに変換
 * @param schedule 財産債務調書
 * @returns JSON文字列
 */
const exportPropertyDebtScheduleToJSON = (schedule) => {
    return JSON.stringify(schedule, null, 2);
};
exports.exportPropertyDebtScheduleToJSON = exportPropertyDebtScheduleToJSON;
/**
 * 確定申告書類一式を生成
 * @param year 年度
 * @param taxpayerInfo 納税者情報
 * @param data 申告データ
 * @returns 申告書類一式
 */
const generateTaxFilingDocuments = (year, taxpayerInfo, data) => {
    const documents = [];
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
            const schedule = (0, exports.generatePropertyDebtSchedule)(data.assets, data.liabilities, taxpayerInfo, year);
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
exports.generateTaxFilingDocuments = generateTaxFilingDocuments;
/**
 * 書類をエクスポート（CSV形式）
 * @param document 書類データ
 * @returns エクスポートされたデータ
 */
const exportDocument = (document) => {
    if (document.documentType === '財産債務調書') {
        return {
            format: 'csv',
            data: (0, exports.exportPropertyDebtScheduleToCSV)(document.data),
        };
    }
    // その他の書類はJSON形式
    return {
        format: 'json',
        data: JSON.stringify(document, null, 2),
    };
};
exports.exportDocument = exportDocument;
/**
 * 提出必要書類のチェックリスト生成
 * @param year 年度
 * @param income 所得額
 * @param assets 資産額
 * @returns チェックリスト
 */
const generateFilingChecklist = (year, income, assets) => {
    const required = ['所得税確定申告書'];
    const optional = [];
    const deadlines = {
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
exports.generateFilingChecklist = generateFilingChecklist;
