import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useFiscalYear } from '../contexts/FiscalYearContext';
import { formatCurrency } from '../utils/formatters';
import { Alert, Button, Card, Input, Select } from './ui';

const API = 'http://localhost:5000/api/tax-return';

type DonationKind = 'deduction' | 'npo-credit' | 'public-interest-credit' | 'political-credit';

interface Donation {
  kind: DonationKind;
  amount: number;
  name?: string;
}

interface Extras {
  donations: Donation[];
  estimatedTaxPrepaid: number;
  landLoanInterest: number;
  earthquakeInsurance: number;
}

interface TaxReturnResult {
  taxYear: number;
  isProvisional: boolean;
  notices: string[];
  salaryRevenue: number;
  salaryIncome: number;
  realEstateIncome: number;
  realEstateLossNotOffset: number;
  realEstateIncomeForTotal: number;
  totalIncome: number;
  socialInsurance: number;
  lifeInsurance: number;
  earthquakeInsurance: number;
  spouseDeduction: number;
  dependentDeduction: number;
  basicDeduction: number;
  deductionsBeforeDonation: number;
  donationDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  calculatedTax: number;
  marginalRate: number;
  npoDonationCredit: number;
  baseIncomeTax: number;
  reconstructionTax: number;
  totalIncomeTax: number;
  withheldTax: number;
  declaredTax: number;
  estimatedTaxPrepaid: number;
  taxPayable: number;
  taxRefund: number;
}

interface TaxReturnData {
  fiscalYear: number;
  sources: {
    salary: { annualSalary: number; withheldTax: number } | null;
    realEstate: { recordCount: number; totalRealEstateIncome: number };
  };
  extras: Extras;
  saved: boolean;
  missing: string[];
  result: TaxReturnResult | null;
}

export const DONATION_KIND_OPTIONS: { value: DonationKind; label: string }[] = [
  { value: 'deduction', label: '寄附金控除（所得控除）' },
  { value: 'npo-credit', label: '認定NPO法人等寄附金特別控除（税額控除）' },
  { value: 'public-interest-credit', label: '公益社団法人等寄附金特別控除（未対応）' },
  { value: 'political-credit', label: '政党等寄附金特別控除（未対応）' },
];

const EMPTY_EXTRAS: Extras = { donations: [], estimatedTaxPrepaid: 0, landLoanInterest: 0, earthquakeInsurance: 0 };

const yen = (value: number) => `¥${formatCurrency(value)}`;
const toNumber = (value: string) => {
  const n = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

const Row: React.FC<{ label: string; value: number; strong?: boolean; testId?: string }> = ({
  label,
  value,
  strong,
  testId,
}) => (
  <div className={`flex justify-between py-1.5 border-b border-gray-100 ${strong ? 'font-semibold' : ''}`}>
    <span className="text-gray-700">{label}</span>
    <span data-testid={testId} className="tabular-nums">
      {yen(value)}
    </span>
  </div>
);

const TaxReturnModule: React.FC = () => {
  const { currentFiscalYear } = useFiscalYear();
  const year = currentFiscalYear.year;
  const [data, setData] = useState<TaxReturnData | null>(null);
  const [extras, setExtras] = useState<Extras>(EMPTY_EXTRAS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const requestId = useRef(0);

  const apply = (next: TaxReturnData) => {
    setData(next);
    setExtras(next.extras);
  };

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    setMessage(null);
    setData(null);
    setExtras(EMPTY_EXTRAS);
    try {
      const response = await axios.get(`${API}/${year}`);
      if (id === requestId.current) apply(response.data.data);
    } catch (e: any) {
      if (id === requestId.current) setError(e.response?.data?.error || '申告データの取得に失敗しました');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    const id = ++requestId.current;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await axios.put(`${API}/${year}`, extras);
      if (id === requestId.current) {
        apply(response.data.data);
        setMessage(`${year}年分の申告データを保存しました`);
      }
    } catch (e: any) {
      if (id === requestId.current) setError(e.response?.data?.error || '保存に失敗しました');
    } finally {
      if (id === requestId.current) setSaving(false);
    }
  };

  const updateDonation = (index: number, patch: Partial<Donation>) =>
    setExtras((prev) => ({
      ...prev,
      donations: prev.donations.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    }));

  const result = data?.result;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">🧾 確定申告書（総合）- {year}年分</h2>
        <p className="text-sm text-gray-600 mt-1">
          保存済みの給与所得と不動産所得を損益通算し、寄附金控除・税額控除・予定納税を含めて申告書の順に計算します（概算）。
        </p>
      </div>

      {error && <Alert variant="error" message={error} />}
      {message && <Alert variant="success" message={message} />}
      {loading && <p className="text-gray-500">読み込み中...</p>}

      {data && data.missing.length > 0 && (
        <Alert
          variant="warning"
          title="計算に必要な情報が足りません"
          message={`${year}年度の${data.missing.join('・')}が保存されていません。先に「給与所得」で計算して保存してください。`}
        />
      )}

      {data && (
        <Card title="集計元のデータ" color="report">
          <Row label="給与の収入金額（保存済みの給与所得）" value={data.sources.salary?.annualSalary ?? 0} />
          <Row label="源泉徴収税額" value={data.sources.salary?.withheldTax ?? 0} />
          <Row
            label={`不動産所得（不動産所得一覧 ${data.sources.realEstate.recordCount}件の合計）`}
            value={data.sources.realEstate.totalRealEstateIncome}
          />
        </Card>
      )}

      {data && (
        <Card title="追加の入力" color="report">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">寄附金</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setExtras((prev) => ({ ...prev, donations: [...prev.donations, { kind: 'deduction', amount: 0 }] }))
                  }
                >
                  + 寄附を追加
                </Button>
              </div>
              {extras.donations.length === 0 && <p className="text-sm text-gray-500">寄附はありません</p>}
              {extras.donations.map((d, i) => (
                <div key={i} data-testid="donation-row" className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mb-2">
                  <Select
                    label="種類"
                    value={d.kind}
                    options={DONATION_KIND_OPTIONS}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateDonation(i, { kind: e.target.value as DonationKind })
                    }
                  />
                  <Input
                    label="寄附先（任意）"
                    value={d.name ?? ''}
                    onChange={(e) => updateDonation(i, { name: e.target.value })}
                  />
                  <Input
                    label="金額（円）"
                    inputMode="numeric"
                    value={d.amount ? String(d.amount) : ''}
                    onChange={(e) => updateDonation(i, { amount: toNumber(e.target.value) })}
                  />
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setExtras((prev) => ({ ...prev, donations: prev.donations.filter((_, j) => j !== i) }))
                    }
                  >
                    削除
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="予定納税額（第1期分・第2期分）"
                inputMode="numeric"
                value={extras.estimatedTaxPrepaid ? String(extras.estimatedTaxPrepaid) : ''}
                onChange={(e) => setExtras((prev) => ({ ...prev, estimatedTaxPrepaid: toNumber(e.target.value) }))}
              />
              <Input
                label="土地等を取得するための負債の利子"
                helperText="不動産所得が赤字のとき、この額までの損失は損益通算できません"
                inputMode="numeric"
                value={extras.landLoanInterest ? String(extras.landLoanInterest) : ''}
                onChange={(e) => setExtras((prev) => ({ ...prev, landLoanInterest: toNumber(e.target.value) }))}
              />
              <Input
                label="地震保険料控除（控除額）"
                inputMode="numeric"
                value={extras.earthquakeInsurance ? String(extras.earthquakeInsurance) : ''}
                onChange={(e) => setExtras((prev) => ({ ...prev, earthquakeInsurance: toNumber(e.target.value) }))}
              />
            </div>
            <Button onClick={save} loading={saving} disabled={saving || loading}>
              保存して再計算
            </Button>
          </div>
        </Card>
      )}

      {result && (
        <>
          {result.notices.map((notice) => (
            <Alert key={notice} variant="warning" message={notice} />
          ))}

          <div
            data-testid="tax-return-summary"
            className={`rounded-lg p-6 text-center ${result.taxRefund > 0 ? 'bg-green-50' : 'bg-orange-50'}`}
          >
            <p className="text-sm text-gray-600">{result.taxRefund > 0 ? '還付される税金' : '納める税金'}</p>
            <p className="text-3xl font-bold" data-testid="tax-return-amount">
              {yen(result.taxRefund > 0 ? result.taxRefund : result.taxPayable)}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="所得金額等" color="income">
              <Row label="給与所得" value={result.salaryIncome} />
              <Row label="不動産所得" value={result.realEstateIncome} />
              {result.realEstateLossNotOffset > 0 && (
                <Row label="うち損益通算できない損失" value={result.realEstateLossNotOffset} />
              )}
              <Row label="合計" value={result.totalIncome} strong testId="total-income" />
            </Card>

            <Card title="所得から差し引かれる金額" color="income">
              <Row label="社会保険料控除" value={result.socialInsurance} />
              <Row label="生命保険料控除" value={result.lifeInsurance} />
              {result.earthquakeInsurance > 0 && <Row label="地震保険料控除" value={result.earthquakeInsurance} />}
              {result.spouseDeduction > 0 && <Row label="配偶者控除" value={result.spouseDeduction} />}
              {result.dependentDeduction > 0 && <Row label="扶養控除" value={result.dependentDeduction} />}
              <Row label="基礎控除" value={result.basicDeduction} />
              <Row label="寄附金控除" value={result.donationDeduction} testId="donation-deduction" />
              <Row label="合計" value={result.totalDeductions} strong />
            </Card>

            <Card title="税金の計算" color="income">
              <Row label="課税される所得金額" value={result.taxableIncome} testId="taxable-income" />
              <Row label={`上の所得に対する税額（${Math.round(result.marginalRate * 100)}%）`} value={result.calculatedTax} />
              {result.npoDonationCredit > 0 && (
                <Row label="認定NPO法人等寄附金特別控除" value={result.npoDonationCredit} />
              )}
              <Row label="再差引所得税額（基準所得税額）" value={result.baseIncomeTax} />
              <Row label="復興特別所得税額" value={result.reconstructionTax} />
              <Row label="所得税及び復興特別所得税の額" value={result.totalIncomeTax} strong testId="total-income-tax" />
              <Row label="源泉徴収税額" value={result.withheldTax} />
              <Row label="申告納税額" value={result.declaredTax} />
              <Row label="予定納税額" value={result.estimatedTaxPrepaid} />
            </Card>
          </div>

          <p className="text-xs text-gray-500">
            ※ 概算です。公益社団法人等・政党等の寄附金特別控除、住宅借入金等特別控除、配当控除、給与・不動産以外の所得には対応していません。
            実際の申告は国税庁の「確定申告書等作成コーナー」などで確認してください。
          </p>
        </>
      )}
    </div>
  );
};

export default TaxReturnModule;
