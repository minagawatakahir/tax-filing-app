/**
 * 年分別の税制ルール（所得税・復興特別所得税・住民税）
 *
 * 税額計算に関わる法定の数値はすべてこのモジュールに集約し、
 * 各計算サービス（taxCalculator / salaryIncomeService など）はここを参照する。
 *
 * 対応範囲（出典: 国税庁タックスアンサー No.1199 基礎控除 / No.1410 給与所得控除 /
 *            No.1191 配偶者控除 / No.2260 所得税の税率。いずれも令和8年4月1日現在法令等）:
 *   - 令和2年分〜令和6年分（2020〜2024年）: 基礎控除48万円、給与所得控除の最低保障額55万円
 *   - 令和7年分（2025年）: 令和7年度税制改正（基礎控除95万〜58万円、給与所得控除の最低保障額65万円）
 *   - 令和8年分・令和9年分（2026〜2027年）: 令和8年度税制改正（基礎控除104万〜62万円、
 *     給与所得控除の最低保障額74万円。令和8年12月1日施行）
 *   - 令和10年分以後（2028年〜）: 基礎控除は公表済みの令和10年分以後の額を適用。
 *     給与所得控除は未公表のため令和8年分・令和9年分の表を「暫定」として適用する
 *     （isProvisionalTaxYear が true を返す）
 */

/** ルールが確定している最新の年分 */
export const LATEST_CONFIRMED_TAX_YEAR = 2027;
/** 年分の既定値: 確定申告の対象となる前年分 */
export const defaultTaxYear = (today: Date = new Date()): number =>
  Math.min(today.getFullYear() - 1, LATEST_CONFIRMED_TAX_YEAR);
/** 対応している最も古い年分（令和2年分） */
export const EARLIEST_SUPPORTED_TAX_YEAR = 2020;

/** 復興特別所得税の課税期間（平成25年分〜令和19年分） */
const RECONSTRUCTION_TAX_FIRST_YEAR = 2013;
const RECONSTRUCTION_TAX_LAST_YEAR = 2037;
const RECONSTRUCTION_TAX_RATE = 0.021;

/** 住民税の均等割（道府県民税1,000円 + 市町村民税3,000円 + 森林環境税1,000円 の標準額） */
export const RESIDENT_TAX_PER_CAPITA = 5000;
/** 住民税の所得割の税率（道府県民税4% + 市町村民税6%） */
const RESIDENT_TAX_INCOME_RATE = 0.1;

/** 端数処理ヘルパー: unit 未満を切り捨てる（負の値は 0 とする） */
export const floorTo = (value: number, unit: number): number =>
  value <= 0 ? 0 : Math.floor(value / unit) * unit;

/**
 * 年分の妥当性チェック。サポート範囲外（令和元年分以前）は例外を投げる。
 * 未指定時は前年分（確定申告の対象年分）を使う。
 */
export const resolveTaxYear = (year?: number): number => {
  const y = year ?? defaultTaxYear();
  if (!Number.isInteger(y) || y < EARLIEST_SUPPORTED_TAX_YEAR) {
    throw new Error(
      `${y}年分の税額計算には対応していません（${EARLIEST_SUPPORTED_TAX_YEAR}年分以降に対応）`
    );
  }
  return y;
};

/** その年分のルールが暫定（未確定の改正がありうる）かどうか */
export const isProvisionalTaxYear = (year: number): boolean => year > LATEST_CONFIRMED_TAX_YEAR;

/** 暫定ルール適用時にユーザーへ表示する注意書き */
export const provisionalNotice = (year: number): string | undefined =>
  isProvisionalTaxYear(year)
    ? `${year}年分は給与所得控除などの税制が未確定のため、公表済みの最新ルールで暫定計算しています。申告前に最新の国税庁の情報を確認してください。`
    : undefined;

/**
 * 所得税の基礎控除額
 * @param totalIncome 合計所得金額
 * @param year 年分
 */
export const getBasicDeduction = (totalIncome: number, year: number): number => {
  const table =
    year >= 2028
      ? BASIC_DEDUCTION_R10
      : year >= 2026
        ? BASIC_DEDUCTION_R8
        : year >= 2025
          ? BASIC_DEDUCTION_R7
          : BASIC_DEDUCTION_R2;
  return table.find((row) => totalIncome <= row.maxIncome)!.amount;
};

/** 基礎控除（令和2年分〜令和6年分） */
const BASIC_DEDUCTION_R2 = [
  { maxIncome: 24000000, amount: 480000 },
  { maxIncome: 24500000, amount: 320000 },
  { maxIncome: 25000000, amount: 160000 },
  { maxIncome: Infinity, amount: 0 },
] as const;

/** 基礎控除（令和7年分） */
const BASIC_DEDUCTION_R7 = [
  { maxIncome: 1320000, amount: 950000 },
  { maxIncome: 3360000, amount: 880000 },
  { maxIncome: 4890000, amount: 680000 },
  { maxIncome: 6550000, amount: 630000 },
  { maxIncome: 23500000, amount: 580000 },
  { maxIncome: 24000000, amount: 480000 },
  { maxIncome: 24500000, amount: 320000 },
  { maxIncome: 25000000, amount: 160000 },
  { maxIncome: Infinity, amount: 0 },
] as const;

/** 基礎控除（令和8年分・令和9年分） */
const BASIC_DEDUCTION_R8 = [
  { maxIncome: 4890000, amount: 1040000 },
  { maxIncome: 6550000, amount: 670000 },
  { maxIncome: 23500000, amount: 620000 },
  { maxIncome: 24000000, amount: 480000 },
  { maxIncome: 24500000, amount: 320000 },
  { maxIncome: 25000000, amount: 160000 },
  { maxIncome: Infinity, amount: 0 },
] as const;

/** 基礎控除（令和10年分以後） */
const BASIC_DEDUCTION_R10 = [
  { maxIncome: 1320000, amount: 990000 },
  { maxIncome: 23500000, amount: 620000 },
  { maxIncome: 24000000, amount: 480000 },
  { maxIncome: 24500000, amount: 320000 },
  { maxIncome: 25000000, amount: 160000 },
  { maxIncome: Infinity, amount: 0 },
] as const;

/**
 * 住民税の基礎控除額（令和3年度分以降。令和7年度改正の対象外）
 * @param totalIncome 合計所得金額
 */
export const getResidentBasicDeduction = (totalIncome: number): number => {
  if (totalIncome <= 24000000) return 430000;
  if (totalIncome <= 24500000) return 290000;
  if (totalIncome <= 25000000) return 150000;
  return 0;
};

/**
 * 給与所得の金額（給与所得控除後の金額）
 * 給与等の収入金額が660万円未満の場合は所得税法別表第五に従い、
 * 収入金額を4,000円単位に切り捨ててから計算する。
 * @param annualSalary 給与等の収入金額
 * @param year 年分
 */
export const calculateSalaryIncomeAmount = (annualSalary: number, year: number): number => {
  const salary = Math.max(0, Math.floor(annualSalary));
  const a = Math.floor(salary / 4000) * 1000; // 収入金額÷4（千円未満切捨て）
  // 以降は浮動小数点誤差を避けるため整数演算（×2.8 → ×28÷10 など）で計算する

  let income: number;
  if (year >= 2026) {
    // 令和8年分・令和9年分: 最低保障額74万円（令和10年分以後は未公表のため暫定適用）
    if (salary < 741000) income = 0;
    else if (salary < 2191000) income = salary - 740000;
    else if (salary < 2193000) income = 1451000;
    else if (salary < 2196000) income = 1453000;
    else if (salary < 2200000) income = 1456000;
    else if (salary < 3600000) income = (a * 28) / 10 - 80000;
    else if (salary < 6600000) income = (a * 32) / 10 - 440000;
    else if (salary < 8500000) income = (salary * 9) / 10 - 1100000;
    else income = salary - 1950000;
  } else if (year >= 2025) {
    // 令和7年分以降: 最低保障額65万円
    if (salary < 651000) income = 0;
    else if (salary < 1900000) income = salary - 650000;
    else if (salary < 3600000) income = (a * 28) / 10 - 80000;
    else if (salary < 6600000) income = (a * 32) / 10 - 440000;
    else if (salary < 8500000) income = (salary * 9) / 10 - 1100000;
    else income = salary - 1950000;
  } else {
    // 令和2年分〜令和6年分: 最低保障額55万円
    if (salary < 551000) income = 0;
    else if (salary < 1619000) income = salary - 550000;
    else if (salary < 1620000) income = 1069000;
    else if (salary < 1622000) income = 1070000;
    else if (salary < 1624000) income = 1072000;
    else if (salary < 1628000) income = 1074000;
    else if (salary < 1800000) income = (a * 24) / 10 + 100000;
    else if (salary < 3600000) income = (a * 28) / 10 - 80000;
    else if (salary < 6600000) income = (a * 32) / 10 - 440000;
    else if (salary < 8500000) income = (salary * 9) / 10 - 1100000;
    else income = salary - 1950000;
  }
  return Math.max(0, Math.floor(income));
};

/** 給与所得控除額（= 収入金額 − 給与所得の金額） */
export const calculateSalaryIncomeDeductionAmount = (annualSalary: number, year: number): number => {
  const salary = Math.max(0, Math.floor(annualSalary));
  return salary - calculateSalaryIncomeAmount(salary, year);
};

/**
 * 配偶者控除額（一般の控除対象配偶者）
 * 納税者本人の合計所得金額が900万円超で段階的に減少し、1,000万円超で適用なし。
 * @param taxpayerTotalIncome 納税者本人の合計所得金額
 */
export const getSpouseDeduction = (taxpayerTotalIncome: number): number => {
  if (taxpayerTotalIncome <= 9000000) return 380000;
  if (taxpayerTotalIncome <= 9500000) return 260000;
  if (taxpayerTotalIncome <= 10000000) return 130000;
  return 0;
};

/** 所得税の速算表（平成27年分以降） */
// 各区分は「下限以上・上限未満」（例: 1,950,000円から10%）
const INCOME_TAX_BRACKETS = [
  { below: 1950000, rate: 0.05, deduction: 0 },
  { below: 3300000, rate: 0.1, deduction: 97500 },
  { below: 6950000, rate: 0.2, deduction: 427500 },
  { below: 9000000, rate: 0.23, deduction: 636000 },
  { below: 18000000, rate: 0.33, deduction: 1536000 },
  { below: 40000000, rate: 0.4, deduction: 2796000 },
  { below: Infinity, rate: 0.45, deduction: 4796000 },
] as const;

const findBracket = (taxableIncome: number) =>
  INCOME_TAX_BRACKETS.find((b) => taxableIncome < b.below)!;

/**
 * 課税総所得金額（1,000円未満切捨て）
 * @param incomeAfterDeductions 所得金額 − 所得控除
 */
export const toTaxableIncome = (incomeAfterDeductions: number): number =>
  floorTo(incomeAfterDeductions, 1000);

/**
 * 基準所得税額（速算表による所得税額）
 * @param taxableIncome 課税総所得金額（1,000円未満切捨て済みであること）
 */
export const calculateBaseIncomeTax = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0;
  const bracket = findBracket(taxableIncome);
  // 浮動小数点誤差を避けるため整数で計算（課税所得は1,000円単位）
  return Math.max(0, Math.round(taxableIncome * bracket.rate) - bracket.deduction);
};

/** 適用税率（限界税率） */
export const getMarginalIncomeTaxRate = (taxableIncome: number): number =>
  taxableIncome <= 0 ? 0 : findBracket(taxableIncome).rate;

/**
 * 復興特別所得税（基準所得税額 × 2.1%、1円未満切捨て）
 */
export const calculateReconstructionTax = (baseIncomeTax: number, year: number): number => {
  if (year < RECONSTRUCTION_TAX_FIRST_YEAR || year > RECONSTRUCTION_TAX_LAST_YEAR) return 0;
  // 整数演算: base × 21 / 1000
  return Math.floor((Math.max(0, baseIncomeTax) * 21) / 1000);
};

export interface IncomeTaxBreakdown {
  taxableIncome: number; // 課税総所得金額（1,000円未満切捨て）
  baseIncomeTax: number; // 基準所得税額
  reconstructionTax: number; // 復興特別所得税額
  totalIncomeTax: number; // 所得税及び復興特別所得税の額
  marginalRate: number; // 適用税率
}

/**
 * 所得税及び復興特別所得税の額を計算
 * @param incomeAfterDeductions 所得金額 − 所得控除（端数処理前）
 */
export const calculateIncomeTaxBreakdown = (
  incomeAfterDeductions: number,
  year: number
): IncomeTaxBreakdown => {
  const taxableIncome = toTaxableIncome(incomeAfterDeductions);
  const baseIncomeTax = calculateBaseIncomeTax(taxableIncome);
  const reconstructionTax = calculateReconstructionTax(baseIncomeTax, year);
  return {
    taxableIncome,
    baseIncomeTax,
    reconstructionTax,
    totalIncomeTax: baseIncomeTax + reconstructionTax,
    marginalRate: getMarginalIncomeTaxRate(taxableIncome),
  };
};

export interface TaxSettlement {
  /** 申告納税額（納付の場合は100円未満切捨て）。還付の場合は0 */
  taxPayable: number;
  /** 還付される税金（源泉徴収税額が上回る場合） */
  taxRefund: number;
}

/**
 * 源泉徴収税額との差引計算
 * @param totalIncomeTax 所得税及び復興特別所得税の額
 * @param withheldTax 源泉徴収税額
 */
export const settleIncomeTax = (totalIncomeTax: number, withheldTax: number): TaxSettlement => {
  const diff = totalIncomeTax - Math.max(0, withheldTax || 0);
  if (diff >= 0) return { taxPayable: floorTo(diff, 100), taxRefund: 0 };
  return { taxPayable: 0, taxRefund: -diff };
};

/**
 * 住民税（所得割 + 均等割）の概算
 * 調整控除・税額控除・非課税限度額は考慮しない。
 * @param incomeAfterResidentDeductions 所得金額 − 住民税の所得控除
 */
export const calculateResidentTax = (incomeAfterResidentDeductions: number): number => {
  const taxable = floorTo(incomeAfterResidentDeductions, 1000);
  if (taxable <= 0) return 0;
  const incomeLevy = floorTo(Math.round(taxable * RESIDENT_TAX_INCOME_RATE), 100);
  return incomeLevy + RESIDENT_TAX_PER_CAPITA;
};
