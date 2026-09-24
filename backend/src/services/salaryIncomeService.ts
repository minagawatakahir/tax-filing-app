/**
 * 給与所得サービス
 * 給与所得の計算ロジックを提供（法定の数値は taxRules に集約）
 */
import {
  calculateIncomeTaxBreakdown,
  calculateSalaryIncomeAmount,
  getBasicDeduction,
  getSpouseDeduction,
  isProvisionalTaxYear,
  provisionalNotice,
  resolveTaxYear,
  settleIncomeTax,
} from './taxRules';

export interface SalaryIncomeInput {
  annualSalary: number; // 年間給与収入
  withheldTax: number; // 源泉徴収税額
  socialInsurance: number; // 社会保険料控除
  lifeInsurance?: number; // 生命保険料控除
  dependents?: number; // 扶養親族の数
  spouseDeduction?: boolean; // 配偶者控除の有無
  fiscalYear?: number; // 年分（未指定時は前年分）
}

export interface SalaryIncomeResult {
  taxYear: number; // 計算に使った年分
  isProvisional: boolean; // 暫定ルールで計算したか
  notice?: string; // 注意事項
  annualSalary: number; // 給与収入
  salaryIncomeDeduction: number; // 給与所得控除額
  salaryIncome: number; // 給与所得金額
  socialInsurance: number; // 社会保険料控除
  lifeInsurance: number; // 生命保険料控除
  basicDeduction: number; // 基礎控除
  dependentDeduction: number; // 扶養控除
  spouseDeduction: number; // 配偶者控除
  totalDeduction: number; // 控除額合計
  taxableIncome: number; // 課税所得（1,000円未満切捨て）
  baseIncomeTax: number; // 基準所得税額
  reconstructionTax: number; // 復興特別所得税額
  estimatedTax: number; // 所得税及び復興特別所得税の額
  withheldTax: number; // 源泉徴収税額
  taxPayable: number; // 申告納税額（納付、100円未満切捨て）
  taxRefund: number; // 還付される税金
}

/** DB に保存される計算結果（v1 形式のレコードには新しい項目が無い） */
export type StoredSalaryIncomeResult = Omit<
  SalaryIncomeResult,
  'taxYear' | 'isProvisional' | 'baseIncomeTax' | 'reconstructionTax' | 'withheldTax' | 'taxPayable' | 'taxRefund'
> &
  Partial<SalaryIncomeResult>;

/** 生命保険料控除の上限（新制度・旧制度合計の所得税の上限） */
const LIFE_INSURANCE_DEDUCTION_LIMIT = 120000;
/** 一般の扶養親族の扶養控除額 */
const GENERAL_DEPENDENT_DEDUCTION = 380000;

/**
 * 給与所得控除額を計算
 * @param annualSalary 給与等の収入金額
 * @param fiscalYear 年分（未指定時は前年分）
 */
export const calculateSalaryIncomeDeduction = (annualSalary: number, fiscalYear?: number): number => {
  const year = resolveTaxYear(fiscalYear);
  const salary = Math.max(0, Math.floor(annualSalary));
  return salary - calculateSalaryIncomeAmount(salary, year);
};

/**
 * 扶養控除額を計算（一般の扶養親族として計算）
 */
export const calculateDependentDeduction = (dependents: number): number => {
  return Math.max(0, Math.floor(dependents || 0)) * GENERAL_DEPENDENT_DEDUCTION;
};

/**
 * 給与所得を計算
 */
export const calculateSalaryIncome = (input: SalaryIncomeInput): SalaryIncomeResult => {
  const year = resolveTaxYear(input.fiscalYear);
  const annualSalary = Math.max(0, Math.floor(input.annualSalary));

  // 給与所得金額（別表第五による）と給与所得控除額
  const salaryIncome = calculateSalaryIncomeAmount(annualSalary, year);
  const salaryIncomeDeduction = annualSalary - salaryIncome;

  // 合計所得金額（本サービスでは給与所得のみ）
  const totalIncome = salaryIncome;

  // 所得控除
  const socialInsurance = Math.max(0, input.socialInsurance || 0);
  const lifeInsurance = Math.min(Math.max(0, input.lifeInsurance || 0), LIFE_INSURANCE_DEDUCTION_LIMIT);
  const basicDeduction = getBasicDeduction(totalIncome, year);
  const dependentDeduction = calculateDependentDeduction(input.dependents || 0);
  const spouseDeduction = input.spouseDeduction ? getSpouseDeduction(totalIncome) : 0;

  const totalDeduction =
    socialInsurance + lifeInsurance + basicDeduction + dependentDeduction + spouseDeduction;

  // 所得税及び復興特別所得税
  const tax = calculateIncomeTaxBreakdown(salaryIncome - totalDeduction, year);

  // 源泉徴収税額との差引
  const withheldTax = Math.max(0, input.withheldTax || 0);
  const { taxPayable, taxRefund } = settleIncomeTax(tax.totalIncomeTax, withheldTax);

  return {
    taxYear: year,
    isProvisional: isProvisionalTaxYear(year),
    notice: provisionalNotice(year),
    annualSalary,
    salaryIncomeDeduction,
    salaryIncome,
    socialInsurance,
    lifeInsurance,
    basicDeduction,
    dependentDeduction,
    spouseDeduction,
    totalDeduction,
    taxableIncome: tax.taxableIncome,
    baseIncomeTax: tax.baseIncomeTax,
    reconstructionTax: tax.reconstructionTax,
    estimatedTax: tax.totalIncomeTax,
    withheldTax,
    taxPayable,
    taxRefund,
  };
};
