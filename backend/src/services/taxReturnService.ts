/**
 * 確定申告（総合）の計算
 *
 * 給与所得・不動産所得の損益通算、所得控除（寄附金控除を含む）、
 * 税額控除（認定NPO法人等寄附金特別控除）、源泉徴収税額・予定納税額の差引までを、
 * 申告書 第一表の順序で計算する。法定の数値は taxRules に集約している。
 *
 * 対象外（入力された場合は notices で知らせ、計算には含めない）:
 *   公益社団法人等寄附金特別控除、政党等寄附金特別控除、住宅借入金等特別控除、配当控除、
 *   雑所得・譲渡所得など給与・不動産以外の所得、純損失の繰越
 */
import {
  calculateBaseIncomeTax,
  calculateReconstructionTax,
  calculateSalaryIncomeAmount,
  floorTo,
  getBasicDeduction,
  getMarginalIncomeTaxRate,
  getSpouseDeduction,
  isProvisionalTaxYear,
  provisionalNotice,
  resolveTaxYear,
  toTaxableIncome,
} from './taxRules';

export type DonationKind =
  | 'deduction' // 寄附金控除（所得控除）として扱う寄附（ふるさと納税など）
  | 'npo-credit' // 認定NPO法人等寄附金特別控除（税額控除）
  | 'public-interest-credit' // 公益社団法人等寄附金特別控除（未対応）
  | 'political-credit'; // 政党等寄附金特別控除（未対応）

export interface DonationInput {
  kind: DonationKind;
  amount: number;
  name?: string;
}

export interface TaxReturnInput {
  fiscalYear?: number;
  salaryRevenue: number; // 給与の収入金額（全支払者の合計）
  withheldTax: number; // 源泉徴収税額
  realEstateIncome?: number; // 不動産所得（損益通算前。赤字は負の値）
  landLoanInterest?: number; // 土地等を取得するために要した負債の利子（不動産所得が赤字の場合の通算制限）
  socialInsurance: number; // 社会保険料控除
  lifeInsurance?: number; // 生命保険料控除（控除額）
  earthquakeInsurance?: number; // 地震保険料控除（控除額）
  spouseDeduction?: boolean; // 一般の控除対象配偶者の有無
  dependents?: number; // 一般の扶養親族の数
  donations?: DonationInput[];
  estimatedTaxPrepaid?: number; // 予定納税額（第1期分・第2期分）
}

export interface TaxReturnResult {
  taxYear: number;
  isProvisional: boolean;
  notices: string[];
  // 所得金額等
  salaryRevenue: number;
  salaryIncome: number; // 給与所得
  realEstateIncome: number; // 不動産所得（損益通算前）
  realEstateLossNotOffset: number; // 損益通算できない不動産所得の損失（土地等の負債利子相当）
  realEstateIncomeForTotal: number; // 合計に算入する不動産所得
  totalIncome: number; // 所得金額等の合計（合計所得金額）
  // 所得から差し引かれる金額
  socialInsurance: number;
  lifeInsurance: number;
  earthquakeInsurance: number;
  spouseDeduction: number;
  dependentDeduction: number;
  basicDeduction: number;
  deductionsBeforeDonation: number; // 寄附金控除を除く所得控除の計
  donationDeduction: number; // 寄附金控除
  totalDeductions: number; // 所得控除の合計
  // 税金の計算
  taxableIncome: number; // 課税される所得金額（1,000円未満切捨て）
  calculatedTax: number; // 上の所得に対する税額
  marginalRate: number;
  npoDonationCredit: number; // 認定NPO法人等寄附金特別控除
  baseIncomeTax: number; // 再差引所得税額（基準所得税額）
  reconstructionTax: number; // 復興特別所得税額
  totalIncomeTax: number; // 所得税及び復興特別所得税の額
  withheldTax: number; // 源泉徴収税額
  declaredTax: number; // 申告納税額（納付は100円未満切捨て、還付は負の値）
  estimatedTaxPrepaid: number; // 予定納税額
  taxPayable: number; // 第3期分の税額: 納める税金
  taxRefund: number; // 第3期分の税額: 還付される税金
}

/** 生命保険料控除の上限（所得税） */
const LIFE_INSURANCE_LIMIT = 120000;
/** 地震保険料控除の上限（所得税） */
const EARTHQUAKE_INSURANCE_LIMIT = 50000;
/** 一般の扶養親族1人あたりの扶養控除額 */
const DEPENDENT_DEDUCTION = 380000;
/** 寄附金控除・寄附金特別控除の足切り額 */
const DONATION_THRESHOLD = 2000;

const nonNegative = (value: number | undefined): number => Math.max(0, Math.floor(value || 0));

const sumDonations = (donations: DonationInput[], kind: DonationKind): number =>
  donations.filter((d) => d.kind === kind).reduce((sum, d) => sum + nonNegative(d.amount), 0);

/**
 * 認定NPO法人等寄附金特別控除額（租税特別措置法41条の18の2、計算明細書の①〜⑬）
 * @param npoDonations ① 認定NPO法人等寄附金の額
 * @param otherDonations ② ①以外の寄附金の額（寄附金控除の対象としたもの）
 * @param totalIncome ④ 所得金額の合計額
 * @param calculatedTax ⑩ 所得税の額
 */
export const calculateNpoDonationCredit = (
  npoDonations: number,
  otherDonations: number,
  totalIncome: number,
  calculatedTax: number
): number => {
  if (npoDonations <= 0) return 0;
  const limit = Math.floor((totalIncome * 40) / 100); // ⑤ ④×40%
  const available = Math.max(0, limit - otherDonations); // ⑥ ⑤−②
  const eligible = Math.min(npoDonations, available); // ⑦
  const remainingThreshold = Math.max(0, DONATION_THRESHOLD - otherDonations); // ⑧ 2千円−②
  const credit = floorTo(((eligible - remainingThreshold) * 40) / 100, 100); // ⑨（100円未満切捨て）
  const cap = floorTo((calculatedTax * 25) / 100, 100); // ⑪ ⑩×25%（100円未満切捨て）
  return Math.max(0, Math.min(credit, cap)); // ⑬
};

/**
 * 確定申告（総合）の計算
 */
export const calculateTaxReturn = (input: TaxReturnInput): TaxReturnResult => {
  const taxYear = resolveTaxYear(input.fiscalYear);
  const notices: string[] = [];
  const provisional = provisionalNotice(taxYear);
  if (provisional) notices.push(provisional);

  // ---- 所得金額等（損益通算）
  const salaryRevenue = nonNegative(input.salaryRevenue);
  const salaryIncome = calculateSalaryIncomeAmount(salaryRevenue, taxYear);
  const realEstateIncome = Math.floor(input.realEstateIncome || 0);
  const realEstateLossNotOffset =
    realEstateIncome < 0 ? Math.min(nonNegative(input.landLoanInterest), -realEstateIncome) : 0;
  const realEstateIncomeForTotal = realEstateIncome + realEstateLossNotOffset;
  const rawTotal = salaryIncome + realEstateIncomeForTotal;
  if (rawTotal < 0) {
    notices.push('所得金額の合計が赤字です（純損失の繰越は計算に含めていません）。');
  }
  const totalIncome = Math.max(0, rawTotal);

  // ---- 所得から差し引かれる金額
  const socialInsurance = nonNegative(input.socialInsurance);
  const lifeInsurance = Math.min(nonNegative(input.lifeInsurance), LIFE_INSURANCE_LIMIT);
  const earthquakeInsurance = Math.min(nonNegative(input.earthquakeInsurance), EARTHQUAKE_INSURANCE_LIMIT);
  const spouseDeduction = input.spouseDeduction ? getSpouseDeduction(totalIncome) : 0;
  const dependentDeduction = nonNegative(input.dependents) * DEPENDENT_DEDUCTION;
  const basicDeduction = getBasicDeduction(totalIncome, taxYear);
  const deductionsBeforeDonation =
    socialInsurance + lifeInsurance + earthquakeInsurance + spouseDeduction + dependentDeduction + basicDeduction;

  const donations = input.donations || [];
  const deductionDonations = sumDonations(donations, 'deduction');
  const donationLimit = Math.floor((totalIncome * 40) / 100);
  const donationDeduction = Math.max(0, Math.min(deductionDonations, donationLimit) - DONATION_THRESHOLD);
  for (const [kind, label] of [
    ['public-interest-credit', '公益社団法人等寄附金特別控除'],
    ['political-credit', '政党等寄附金特別控除'],
  ] as const) {
    if (sumDonations(donations, kind) > 0) {
      notices.push(`${label}には未対応のため、その寄附金は計算に含めていません。`);
    }
  }

  const totalDeductions = deductionsBeforeDonation + donationDeduction;

  // ---- 税金の計算
  const taxableIncome = toTaxableIncome(totalIncome - totalDeductions);
  const calculatedTax = calculateBaseIncomeTax(taxableIncome);
  const npoDonationCredit = calculateNpoDonationCredit(
    sumDonations(donations, 'npo-credit'),
    deductionDonations,
    totalIncome,
    calculatedTax
  );
  const baseIncomeTax = Math.max(0, calculatedTax - npoDonationCredit);
  const reconstructionTax = calculateReconstructionTax(baseIncomeTax, taxYear);
  const totalIncomeTax = baseIncomeTax + reconstructionTax;

  // ---- 源泉徴収税額・予定納税額の差引
  const withheldTax = nonNegative(input.withheldTax);
  const beforeRounding = totalIncomeTax - withheldTax;
  const declaredTax = beforeRounding >= 0 ? floorTo(beforeRounding, 100) : beforeRounding;
  const estimatedTaxPrepaid = nonNegative(input.estimatedTaxPrepaid);
  const thirdInstallment = declaredTax - estimatedTaxPrepaid;

  return {
    taxYear,
    isProvisional: isProvisionalTaxYear(taxYear),
    notices,
    salaryRevenue,
    salaryIncome,
    realEstateIncome,
    realEstateLossNotOffset,
    realEstateIncomeForTotal,
    totalIncome,
    socialInsurance,
    lifeInsurance,
    earthquakeInsurance,
    spouseDeduction,
    dependentDeduction,
    basicDeduction,
    deductionsBeforeDonation,
    donationDeduction,
    totalDeductions,
    taxableIncome,
    calculatedTax,
    marginalRate: getMarginalIncomeTaxRate(taxableIncome),
    npoDonationCredit,
    baseIncomeTax,
    reconstructionTax,
    totalIncomeTax,
    withheldTax,
    declaredTax,
    estimatedTaxPrepaid,
    taxPayable: thirdInstallment > 0 ? floorTo(thirdInstallment, 100) : 0,
    taxRefund: thirdInstallment < 0 ? -thirdInstallment : 0,
  };
};
