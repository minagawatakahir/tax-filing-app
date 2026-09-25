/**
 * TTM（対顧客電信売買相場の仲値）の取得
 *
 * 出どころ: 三菱UFJ銀行の公示相場（三菱UFJリサーチ&コンサルティングが公開している過去の相場）
 *   TTM = (TTS + TTB) / 2
 * その日に公示がない場合（休日など）は、直前の公示日の値を使う（最大 MAX_LOOKBACK_DAYS 日前まで）。
 *
 * 取得できないときは例外を投げる。**代わりの値（固定値・実勢レート・今日のレートなど）を黙って使わない。**
 * シミュレーションのレートは USE_SIMULATED_TTM=true のときだけ使い、必ず isSimulated=true を付ける。
 */
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export const OFFICIAL_TTM_SOURCE = '三菱UFJ銀行 公示相場（三菱UFJリサーチ&コンサルティング）';
export const SIMULATED_TTM_SOURCE = 'シミュレーション（デモ用・申告には使えません）';
export const MAX_LOOKBACK_DAYS = 7;

const MURC_URL = 'https://www.murc-kawasesouba.jp/fx/past/index.php';
const CACHE_FILE = path.join(__dirname, '../../cache/ttm_official_v1.json');

export interface TTMRate {
  requestedDate: string; // yyyy-MM-dd（権利確定日など）
  rateDate: string; // yyyy-MM-dd（実際に使った公示日）
  rate: number; // 1 USD あたりの円
  tts?: number;
  ttb?: number;
  source: string;
  isSimulated: boolean;
}

export class TTMUnavailableError extends Error {
  constructor(public readonly requestedDate: string, reason: string) {
    super(`${requestedDate} の為替レート（TTM）を取得できませんでした: ${reason}`);
    this.name = 'TTMUnavailableError';
  }
}

// ---------------------------------------------------------------- 日付（ローカル日付として扱う）

export const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const fromDateKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (key: string, days: number): string => {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

// ---------------------------------------------------------------- 公示相場ページの解析

const MONTHS: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

/**
 * 公示相場のページ（HTML）から、公示日と米ドルの TTS/TTB を取り出す。
 * 米ドルの行がないページ（休日など）は null を返す。
 */
export const parseMurcUsdRate = (html: string): { rateDate: string; tts: number; ttb: number } | null => {
  const text = html
    .replace(/<[^>]+>/g, ' | ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
  const asOf = text.match(/As of (\w+) (\d{1,2}), (\d{4})/);
  const usd = text.match(/\|\s*USD\s*\|[\s|]*([\d.]+)\s*\|[\s|]*([\d.]+)/);
  if (!asOf || !usd || !MONTHS[asOf[1]]) return null;
  const tts = parseFloat(usd[1]);
  const ttb = parseFloat(usd[2]);
  if (!Number.isFinite(tts) || !Number.isFinite(ttb) || tts <= 0 || ttb <= 0 || tts < ttb) return null;
  const rateDate = `${asOf[3]}-${String(MONTHS[asOf[1]]).padStart(2, '0')}-${asOf[2].padStart(2, '0')}`;
  return { rateDate, tts, ttb };
};

/** TTM = (TTS + TTB) / 2（銭単位に丸める） */
export const toTTM = (tts: number, ttb: number): number => Math.round(((tts + ttb) / 2) * 100) / 100;

// ---------------------------------------------------------------- キャッシュ（公示相場だけを保存する）

let cache: Map<string, TTMRate> | null = null;

const loadCache = (): Map<string, TTMRate> => {
  if (cache) return cache;
  cache = new Map();
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) as Record<string, TTMRate>;
      for (const [key, value] of Object.entries(data)) {
        if (value && value.source === OFFICIAL_TTM_SOURCE && !value.isSimulated && value.rate > 0) {
          cache.set(key, value);
        }
      }
    }
  } catch (error) {
    console.warn('TTMキャッシュを読み込めませんでした（無視して取得し直します）:', error);
  }
  return cache;
};

const saveCache = (): void => {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(loadCache()), null, 2), 'utf-8');
  } catch (error) {
    console.warn('TTMキャッシュを保存できませんでした:', error);
  }
};

/** テスト用: メモリ上のキャッシュを捨てる */
export const resetTTMCache = (): void => {
  cache = null;
};

// ---------------------------------------------------------------- 取得

const fetchMurcPage = async (dateKey: string): Promise<string> => {
  const [y, m, d] = dateKey.split('-');
  const response = await axios.get(MURC_URL, {
    params: { id: `${y.slice(2)}${m}${d}` },
    timeout: 15000,
    responseType: 'text',
    headers: { 'User-Agent': 'tax-filing-app (TTM lookup)' },
  });
  return String(response.data);
};

/** その日の公示相場（なければ null） */
const fetchOfficialRateOn = async (dateKey: string): Promise<{ tts: number; ttb: number } | null> => {
  const parsed = parseMurcUsdRate(await fetchMurcPage(dateKey));
  // 別の日のページが返ってきた場合も「その日の公示なし」として扱う
  return parsed && parsed.rateDate === dateKey ? { tts: parsed.tts, ttb: parsed.ttb } : null;
};

/**
 * 公示TTMを取得する（その日に公示がなければ、直前の公示日の値）
 * @throws TTMUnavailableError 取得できない場合（未来の日付、公示が見つからない、通信エラーなど）
 */
export const getOfficialTTM = async (date: Date, today: Date = new Date()): Promise<TTMRate> => {
  const requestedDate = toDateKey(date);
  if (Number.isNaN(date.getTime())) throw new TTMUnavailableError('不正な日付', '日付の形式が不正です');
  if (requestedDate > toDateKey(today)) {
    throw new TTMUnavailableError(requestedDate, 'まだ公示されていない日付です');
  }

  const cached = loadCache().get(requestedDate);
  if (cached) return cached;

  for (let back = 0; back <= MAX_LOOKBACK_DAYS; back++) {
    const candidate = addDays(requestedDate, -back);
    let rate: { tts: number; ttb: number } | null;
    try {
      rate = await fetchOfficialRateOn(candidate);
    } catch (error: any) {
      throw new TTMUnavailableError(requestedDate, `公示相場のページを取得できませんでした（${error?.message || error}）`);
    }
    if (rate) {
      const result: TTMRate = {
        requestedDate,
        rateDate: candidate,
        rate: toTTM(rate.tts, rate.ttb),
        tts: rate.tts,
        ttb: rate.ttb,
        source: OFFICIAL_TTM_SOURCE,
        isSimulated: false,
      };
      loadCache().set(requestedDate, result);
      saveCache();
      return result;
    }
  }
  throw new TTMUnavailableError(requestedDate, `${MAX_LOOKBACK_DAYS}日前までさかのぼっても公示相場が見つかりませんでした`);
};

// ---------------------------------------------------------------- シミュレーション（デモ・E2E用）

export const isSimulationEnabled = (): boolean => process.env.USE_SIMULATED_TTM === 'true';

/** 日付から決まる架空のレート（140〜160円）。申告には使えない */
export const getSimulatedTTM = (date: Date): TTMRate => {
  const key = toDateKey(date);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash = hash & hash;
  }
  const rate = Math.round((140 + (Math.abs(hash % 10000) / 10000) * 20) * 1000) / 1000;
  return { requestedDate: key, rateDate: key, rate, source: SIMULATED_TTM_SOURCE, isSimulated: true };
};

/**
 * 権利確定日などのTTMを取得する。
 * USE_SIMULATED_TTM=true のときだけシミュレーション（isSimulated=true）、それ以外は公示TTM。
 */
export const getTTM = (date: Date): Promise<TTMRate> =>
  isSimulationEnabled() ? Promise.resolve(getSimulatedTTM(date)) : getOfficialTTM(date);
