"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTTMRateCache = exports.aggregateAnnualRSUIncome = exports.calculateBatchRSUTax = exports.calculateRSUTax = exports.getBatchTTMRates = exports.getTTMRate = void 0;
const axios_1 = __importDefault(require("axios"));
const date_fns_1 = require("date-fns");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * RSU為替自動連携サービス
 * 証券会社APIとの連携、権利確定日TTMの自動取得
 */
// 為替レートAPI（複数のデータソースに対応）
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const HISTORICAL_DATA_CACHE = path.join(__dirname, '../../cache/ttm_rates.json');
// TTMレートキャッシュ（メモリ内）
let ttmRateCache = new Map();
/**
 * ファイルキャッシュの初期化
 * サーバー起動時に呼び出される
 */
const initializeFileCache = () => {
    try {
        if (fs.existsSync(HISTORICAL_DATA_CACHE)) {
            const cachedData = JSON.parse(fs.readFileSync(HISTORICAL_DATA_CACHE, 'utf-8'));
            Object.entries(cachedData).forEach(([dateKey, rate]) => {
                ttmRateCache.set(dateKey, rate);
            });
            console.log(`✅ Loaded ${ttmRateCache.size} cached TTM rates from file`);
        }
    }
    catch (error) {
        console.warn('⚠️ Failed to load file cache, starting with empty cache:', error);
    }
};
/**
 * ファイルキャッシュに保存
 */
const saveFileCache = () => {
    try {
        const cacheDir = path.dirname(HISTORICAL_DATA_CACHE);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        const cacheData = Object.fromEntries(ttmRateCache);
        fs.writeFileSync(HISTORICAL_DATA_CACHE, JSON.stringify(cacheData, null, 2), 'utf-8');
    }
    catch (error) {
        console.error('Failed to save TTM rate cache to file:', error);
    }
};
/**
 * キャッシュから日付のTTMレートを取得
 * @param date 取得日
 * @returns キャッシュされたレート、またはnull
 */
const getCachedTTMRate = (date) => {
    const dateKey = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
    return ttmRateCache.get(dateKey) || null;
};
/**
 * キャッシュにTTMレートを保存
 * @param date 日付
 * @param rate レート
 */
const cacheTTMRate = (date, rate) => {
    const dateKey = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
    ttmRateCache.set(dateKey, rate);
    saveFileCache(); // ファイルにも保存
};
/**
 * Open Exchange Rates APIから過去のレートを取得
 * @param date 取得日
 * @returns 為替レート
 */
const getTTMRateFromOpenExchangeRates = async (date) => {
    try {
        const dateStr = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
        const apiKey = process.env.OPEN_EXCHANGE_RATES_API_KEY;
        if (!apiKey) {
            console.warn('Open Exchange Rates API key not configured');
            return null;
        }
        const response = await axios_1.default.get(`https://openexchangerates.org/api/historical/${dateStr}.json`, {
            params: {
                app_id: apiKey,
                symbols: 'JPY',
                base: 'USD',
            },
            timeout: 5000,
        });
        if (response.data.rates && response.data.rates.JPY) {
            return response.data.rates.JPY;
        }
        return null;
    }
    catch (error) {
        console.error(`Error fetching rate from Open Exchange Rates for ${(0, date_fns_1.format)(date, 'yyyy-MM-dd')}:`, error);
        return null;
    }
};
/**
 * Fixer APIから過去のレートを取得
 * @param date 取得日
 * @returns 為替レート
 */
const getTTMRateFromFixer = async (date) => {
    try {
        const dateStr = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
        const apiKey = process.env.FIXER_API_KEY;
        if (!apiKey) {
            console.warn('Fixer API key not configured');
            return null;
        }
        const response = await axios_1.default.get('https://api.fixer.io/' + dateStr, {
            params: {
                access_key: apiKey,
                symbols: 'JPY',
                base: 'USD',
            },
            timeout: 5000,
        });
        if (response.data.rates && response.data.rates.JPY) {
            return response.data.rates.JPY;
        }
        return null;
    }
    catch (error) {
        console.error(`Error fetching rate from Fixer for ${(0, date_fns_1.format)(date, 'yyyy-MM-dd')}:`, error);
        return null;
    }
};
/**
 * 現在のレートをフォールバック取得
 * @returns 現在のUSD/JPYレート
 */
const getCurrentTTMRate = async () => {
    try {
        const response = await axios_1.default.get(EXCHANGE_RATE_API, { timeout: 5000 });
        if (response.data.rates && response.data.rates.JPY) {
            return response.data.rates.JPY;
        }
        return 150.0; // デフォルトレート
    }
    catch (error) {
        console.error('Error fetching current exchange rate:', error);
        return 150.0; // デフォルトレート
    }
};
/**
 * TTM（電信仲値）レートを取得
 * 日付ごとに異なるレートを取得します
 * @param date 取得日
 * @returns 為替レート
 */
const getTTMRate = async (date) => {
    try {
        // 1. キャッシュから確認
        let rate = getCachedTTMRate(date);
        let source = 'Cache';
        // 2. キャッシュにない場合、外部APIから取得
        if (rate === null) {
            // Open Exchange Rates（優先）
            rate = await getTTMRateFromOpenExchangeRates(date);
            if (rate !== null) {
                source = 'Open Exchange Rates';
            }
            else {
                // Fixer（代替）
                rate = await getTTMRateFromFixer(date);
                if (rate !== null) {
                    source = 'Fixer';
                }
                else {
                    // 現在のレートをフォールバック
                    rate = await getCurrentTTMRate();
                    source = 'Current Rate (Fallback)';
                }
            }
            // キャッシュに保存
            cacheTTMRate(date, rate);
        }
        return {
            date: date,
            rate: rate,
            source: source,
        };
    }
    catch (error) {
        console.error('Error in getTTMRate:', error);
        // 最後のフォールバック
        return {
            date: date,
            rate: 150.0,
            source: 'Fallback Rate (Error)',
        };
    }
};
exports.getTTMRate = getTTMRate;
/**
 * デモ用：日付ベースでシミュレートされたTTMレートを生成
 * @param date 日付
 * @returns シミュレートされたレート
 */
const getSimulatedTTMRate = (date) => {
    // 日付からシード値を生成（同じ日付なら同じレートになる）
    const dateStr = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    // 140円～160円の範囲でシミュレート
    const minRate = 140;
    const maxRate = 160;
    const range = maxRate - minRate;
    const normalizedHash = Math.abs(hash % 10000) / 10000;
    return minRate + (normalizedHash * range);
};
/**
 * 複数日のTTMレートを一括取得（最適化版）
 * キャッシュヒット率を最大化し、API呼び出しを最小限に抑える
 * @param dates 日付配列
 * @returns 為替レートの配列
 */
const getBatchTTMRates = async (dates) => {
    const useSimulation = process.env.USE_SIMULATED_TTM === 'true';
    if (useSimulation) {
        // デモモード：シミュレートされたレート
        return dates.map(date => ({
            date: date,
            rate: getSimulatedTTMRate(date),
            source: 'Simulated (Demo)',
        }));
    }
    // キャッシュミスの日付のみAPIから取得
    const uncachedDates = [];
    const results = [];
    // 1. まずキャッシュから取得を試みる
    for (const date of dates) {
        const cachedRate = getCachedTTMRate(date);
        if (cachedRate !== null) {
            results.push({
                date: date,
                rate: cachedRate,
                source: 'Cache',
            });
        }
        else {
            uncachedDates.push(date);
        }
    }
    // 2. キャッシュミスの日付を並列取得
    if (uncachedDates.length > 0) {
        console.log(`Fetching ${uncachedDates.length} uncached TTM rates...`);
        const uncachedResults = await Promise.all(uncachedDates.map(date => (0, exports.getTTMRate)(date)));
        results.push(...uncachedResults);
    }
    // 3. 元の日付の順序で並び替え
    const dateMap = new Map();
    results.forEach(result => {
        const key = (0, date_fns_1.format)(result.date, 'yyyy-MM-dd');
        dateMap.set(key, result);
    });
    return dates.map(date => {
        const key = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
        return dateMap.get(key);
    });
};
exports.getBatchTTMRates = getBatchTTMRates;
/**
 * RSU権利確定時の税務計算
 * @param vestingData RSU権利確定データ
 * @returns 税務計算結果
 */
const calculateRSUTax = async (vestingData) => {
    // 権利確定日のTTMレートを取得
    const exchangeRateData = await (0, exports.getTTMRate)(vestingData.vestingDate);
    // 円貨換算
    const pricePerShareJPY = vestingData.pricePerShare * exchangeRateData.rate;
    const totalValueJPY = pricePerShareJPY * vestingData.shares;
    // 課税所得（給与所得として計算）
    const taxableIncomeJPY = totalValueJPY;
    return {
        vestingDate: vestingData.vestingDate,
        shares: vestingData.shares,
        pricePerShareUSD: vestingData.pricePerShare,
        exchangeRate: exchangeRateData.rate,
        pricePerShareJPY: pricePerShareJPY,
        totalValueJPY: totalValueJPY,
        taxableIncomeJPY: taxableIncomeJPY,
    };
};
exports.calculateRSUTax = calculateRSUTax;
/**
 * 複数のRSU権利確定の一括計算
 * 複数の日付に対して効率的にTTMレートを取得します
 * @param vestingDataList RSU権利確定データの配列
 * @returns 税務計算結果の配列
 */
const calculateBatchRSUTax = async (vestingDataList) => {
    // 1. 全ての権利確定日を抽出
    const vestingDates = vestingDataList.map(data => data.vestingDate);
    // 2. 全てのTTMレートを一括取得（シミュレーションまたはAPIから）
    const exchangeRates = await (0, exports.getBatchTTMRates)(vestingDates);
    // 3. 日付をキーにした為替レートマップを作成
    const rateMap = new Map();
    exchangeRates.forEach(rateData => {
        const dateKey = (0, date_fns_1.format)(rateData.date, 'yyyy-MM-dd');
        rateMap.set(dateKey, rateData.rate);
    });
    // 4. 各RSUデータに対して計算を実行
    const calculations = vestingDataList.map(data => {
        const dateKey = (0, date_fns_1.format)(data.vestingDate, 'yyyy-MM-dd');
        const exchangeRate = rateMap.get(dateKey) || 150.0; // フォールバック
        const pricePerShareJPY = data.pricePerShare * exchangeRate;
        const totalValueJPY = pricePerShareJPY * data.shares;
        return {
            vestingDate: data.vestingDate,
            shares: data.shares,
            pricePerShareUSD: data.pricePerShare,
            exchangeRate: exchangeRate,
            pricePerShareJPY: pricePerShareJPY,
            totalValueJPY: totalValueJPY,
            taxableIncomeJPY: totalValueJPY,
        };
    });
    return calculations;
};
exports.calculateBatchRSUTax = calculateBatchRSUTax;
/**
 * 年間のRSU収入集計
 * @param vestingDataList RSU権利確定データの配列
 * @param year 対象年度
 * @returns 年間集計結果
 */
const aggregateAnnualRSUIncome = async (vestingDataList, year) => {
    // 対象年度のデータのみフィルタ
    const yearData = vestingDataList.filter(data => data.vestingDate.getFullYear() === year);
    // 一括計算
    const calculations = await (0, exports.calculateBatchRSUTax)(yearData);
    // 集計
    const totalShares = calculations.reduce((sum, calc) => sum + calc.shares, 0);
    const totalIncomeJPY = calculations.reduce((sum, calc) => sum + calc.totalValueJPY, 0);
    return {
        year,
        totalShares,
        totalIncomeJPY,
        vestingCount: calculations.length,
        calculations,
    };
};
exports.aggregateAnnualRSUIncome = aggregateAnnualRSUIncome;
/**
 * TX-22: キャッシュ初期化（サーバー起動時に呼び出す）
 */
const initializeTTMRateCache = () => {
    initializeFileCache();
};
exports.initializeTTMRateCache = initializeTTMRateCache;
