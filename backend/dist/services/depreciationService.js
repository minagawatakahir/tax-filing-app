"use strict";
/**
 * 減価償却ライフサイクルサービス
 * 物件ごとの耐用年数管理、将来の未償却残高予測
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeDepreciation = exports.calculateAcquisitionCostForDisposal = exports.predictFutureUndepreciatedBalance = exports.generateDepreciationSchedule = exports.calculateDecliningBalanceDepreciation = exports.calculateStraightLineDepreciation = void 0;
/**
 * 耐用年数テーブル（日本の税法基準）
 */
const USEFUL_LIFE_TABLE = {
    'wooden_building': 22,
    'concrete_building': 47,
    'office_equipment': 5,
    'machinery': 10,
    'vehicle': 4,
    'furniture': 8,
    'land': Infinity, // 土地は償却対象外
};
/**
 * 定額法による年間減価償却費を計算
 * @param acquisitionCost 取得原価
 * @param usefulLife 耐用年数
 * @returns 年間減価償却費
 */
const calculateStraightLineDepreciation = (acquisitionCost, usefulLife) => {
    return acquisitionCost / usefulLife;
};
exports.calculateStraightLineDepreciation = calculateStraightLineDepreciation;
/**
 * 定率法による年間減価償却費を計算
 * @param bookValue 帳簿価額
 * @param rate 償却率（%)
 * @returns 年間減価償却費
 */
const calculateDecliningBalanceDepreciation = (bookValue, rate) => {
    return bookValue * (rate / 100);
};
exports.calculateDecliningBalanceDepreciation = calculateDecliningBalanceDepreciation;
/**
 * 減価償却スケジュールを生成
 * @param asset 減価償却資産
 * @returns 減価償却スケジュール
 */
const generateDepreciationSchedule = (asset) => {
    const schedule = [];
    let bookValue = asset.acquisitionCost;
    let accumulatedDepreciation = 0;
    const startYear = asset.acquisitionDate.getFullYear();
    const currentYear = new Date().getFullYear();
    for (let year = startYear; year < startYear + asset.usefulLife + 1; year++) {
        let annualDepreciation = 0;
        if (asset.depreciationMethod === 'straight') {
            annualDepreciation = (0, exports.calculateStraightLineDepreciation)(asset.acquisitionCost, asset.usefulLife);
        }
        else {
            // 定率法の場合、償却率を計算
            const rate = (100 / asset.usefulLife);
            annualDepreciation = (0, exports.calculateDecliningBalanceDepreciation)(bookValue, rate);
        }
        // 償却不能限度額（最後の年の調整）
        if (bookValue - annualDepreciation < asset.acquisitionCost * 0.1) {
            annualDepreciation = Math.max(0, bookValue - asset.acquisitionCost * 0.1);
        }
        bookValue -= annualDepreciation;
        accumulatedDepreciation += annualDepreciation;
        schedule.push({
            assetId: asset.assetId,
            assetName: asset.assetName,
            acquisitionCost: asset.acquisitionCost,
            year,
            bookValue: Math.max(0, bookValue),
            annualDepreciation,
            accumulatedDepreciation,
            undepreciatedBalance: Math.max(0, bookValue),
        });
    }
    return schedule;
};
exports.generateDepreciationSchedule = generateDepreciationSchedule;
/**
 * 将来の未償却残高を予測
 * @param asset 減価償却資産
 * @param projectionYears 予測期間（年）
 * @returns 未償却残高の予測
 */
const predictFutureUndepreciatedBalance = (asset, projectionYears = 10) => {
    const schedule = (0, exports.generateDepreciationSchedule)(asset);
    const startYear = asset.acquisitionDate.getFullYear();
    const currentYear = new Date().getFullYear();
    const yearsElapsed = currentYear - startYear;
    // 現在の帳簿価額を取得
    const currentSchedule = schedule[Math.min(yearsElapsed, schedule.length - 1)];
    const currentBookValue = currentSchedule ? currentSchedule.bookValue : 0;
    // 将来の予測（最大10年）
    const projectionSchedule = schedule
        .filter(s => s.year > currentYear && s.year <= currentYear + projectionYears)
        .slice(0, projectionYears);
    // 償却完了年
    const completionYear = schedule.find(s => s.undepreciatedBalance <= asset.acquisitionCost * 0.1)?.year || startYear + asset.usefulLife;
    // 残存価額
    const residualValue = schedule[schedule.length - 1].undepreciatedBalance;
    return {
        assetId: asset.assetId,
        assetName: asset.assetName,
        acquisitionCost: asset.acquisitionCost,
        currentYear,
        currentBookValue,
        projectionYears: projectionSchedule,
        completionYear,
        residualValue,
    };
};
exports.predictFutureUndepreciatedBalance = predictFutureUndepreciatedBalance;
/**
 * 取得費を計算（譲渡時の必要経費算出用）
 * @param asset 減価償却資産
 * @param disposalDate 譲渡日
 * @returns 取得費（残存価額）
 */
const calculateAcquisitionCostForDisposal = (asset, disposalDate) => {
    const schedule = (0, exports.generateDepreciationSchedule)(asset);
    // 譲渡日までのスケジュールを取得
    const relevantSchedule = schedule.filter(s => s.year <= disposalDate.getFullYear());
    if (relevantSchedule.length === 0) {
        return asset.acquisitionCost;
    }
    return relevantSchedule[relevantSchedule.length - 1].undepreciatedBalance;
};
exports.calculateAcquisitionCostForDisposal = calculateAcquisitionCostForDisposal;
/**
 * 複数資産の減価償却分析
 * @param assets 資産の配列
 * @returns 全資産の分析結果
 */
const analyzeDepreciation = (assets) => {
    const analyses = assets.map(asset => ({
        asset,
        schedule: (0, exports.generateDepreciationSchedule)(asset),
        projection: (0, exports.predictFutureUndepreciatedBalance)(asset),
    }));
    const totalAcquisitionCost = assets.reduce((sum, a) => sum + a.acquisitionCost, 0);
    const totalCurrentBookValue = analyses.reduce((sum, a) => sum + a.projection.currentBookValue, 0);
    const totalAccumulatedDepreciation = totalAcquisitionCost - totalCurrentBookValue;
    return {
        totalAcquisitionCost,
        totalCurrentBookValue,
        totalAccumulatedDepreciation,
        analyses,
    };
};
exports.analyzeDepreciation = analyzeDepreciation;
