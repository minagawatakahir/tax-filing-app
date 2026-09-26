/**
 * RSU の計算結果に使われた為替レートの出どころの判定
 *
 *   official  : 公示TTM（出どころ・公示日の記録あり）
 *   simulated : シミュレーション（架空の値。申告には使えない）
 *   unknown   : 出どころの記録がない（この仕組みより前に保存された記録など）
 */
import { OFFICIAL_TTM_SOURCE } from './ttmRateService';

export type RateProvenance = 'official' | 'simulated' | 'unknown';

export interface RateInfo {
  ttmSource?: string;
  ttmRateDate?: string;
  isSimulated?: boolean;
}

export const getRateProvenance = (row: RateInfo): RateProvenance => {
  if (row.isSimulated) return 'simulated';
  if (row.ttmSource === OFFICIAL_TTM_SOURCE && row.ttmRateDate) return 'official';
  return 'unknown';
};

/** 申告用の出力に使えない行（シミュレーション・出どころ不明）の数 */
export const summarizeRateProvenance = (rows: RateInfo[]) => {
  const counts = { official: 0, simulated: 0, unknown: 0 };
  for (const row of rows) counts[getRateProvenance(row)]++;
  return { ...counts, usableForFiling: counts.simulated === 0 && counts.unknown === 0 };
};
