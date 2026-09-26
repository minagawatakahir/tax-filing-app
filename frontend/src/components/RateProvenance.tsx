import React from 'react';
import { Alert } from './ui';

/**
 * RSU の為替レートの出どころの表示
 * 判定は backend/src/services/rsuRateProvenance.ts と同じ。
 *   official  : 公示TTM（出どころ・公示日の記録あり）
 *   simulated : シミュレーション（架空の値。申告には使えない）
 *   unknown   : 出どころの記録がない（以前に保存された記録など）
 */
export type RateProvenance = 'official' | 'simulated' | 'unknown';

export interface RateInfo {
  vestingDate: string | Date;
  ttmSource?: string;
  ttmRateDate?: string;
  isSimulated?: boolean;
}

export const provenanceOf = (c: Omit<RateInfo, 'vestingDate'>): RateProvenance =>
  c.isSimulated ? 'simulated' : c.ttmSource && c.ttmRateDate ? 'official' : 'unknown';

const localDateKey = (value: string | Date) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** 各行のレートの出どころ（公示日） */
export const RateSourceBadge: React.FC<{ calc: RateInfo }> = ({ calc }) => {
  const provenance = provenanceOf(calc);
  if (provenance === 'simulated') {
    return (
      <span data-testid="rate-source" className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">
        シミュレーション
      </span>
    );
  }
  if (provenance === 'unknown') {
    return (
      <span data-testid="rate-source" className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">
        出どころ不明
      </span>
    );
  }
  const shifted = calc.ttmRateDate !== localDateKey(calc.vestingDate);
  return (
    <span data-testid="rate-source" className="text-xs text-gray-700" title={calc.ttmSource}>
      公示日 {calc.ttmRateDate}
      {shifted && <span className="text-gray-500">（直前の公示日）</span>}
    </span>
  );
};

/** 申告に使えないレートが含まれるときの警告 */
export const RateProvenanceWarning: React.FC<{ calculations: RateInfo[] }> = ({ calculations }) => {
  const simulated = calculations.filter((c) => provenanceOf(c) === 'simulated').length;
  const unknown = calculations.filter((c) => provenanceOf(c) === 'unknown').length;
  return (
    <>
      {simulated > 0 && (
        <Alert
          variant="error"
          title="シミュレーションの為替レートです（申告には使えません）"
          message={`${simulated}件の権利確定に、架空の為替レートが使われています。サーバーの設定 USE_SIMULATED_TTM を無効にして計算し直してください。`}
        />
      )}
      {unknown > 0 && (
        <Alert
          variant="warning"
          title="為替レートの出どころが確認できません"
          message={`${unknown}件の権利確定に、出どころの記録がないレートが使われています（以前に保存された記録）。RSUの画面の「一括計算」で計算し直して保存してください。`}
        />
      )}
    </>
  );
};
