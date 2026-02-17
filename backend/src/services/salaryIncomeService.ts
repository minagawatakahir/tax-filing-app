/**
 * 給与所得サービス
 * 給与所得の計算ロジックを提供
 */

export interface SalaryIncomeInput {
  annualSalary: number; // 年間給与収入
  withheldTax: number; // 源泉徴収税額
  socialInsurance: number; // 社会保険料控除
  lifeInsurance?: number; // 生命保険料控除
  dependents?: number; // 扶養親族の数
  spouseDeduction?: boolean; // 配偶者控除の有無
}

export interface SalaryIncomeResult {
  annualSalary: number; // 給与収入
  salaryIncomeDeduction: number; // 給与所得控除額
  salaryIncome: number; // 給与所得金額
  socialInsurance: number; // 社会保険料控除
  lifeInsurance: number; // 生命保険料控除
  basicDeduction: number; // 基礎控除
  dependentDeduction: number; // 扶養控除
  spouseDeduction: number; // 配偶者控除
  totalDeduction: number; // 控除額合計
  taxableIncome: number; // 課税所得
  estimatedTax: number; // 推定税額
}

/**
 * 給与所得控除額を計算
 * 令和2年以降の給与所得控除額
 */
export const calculateSalaryIncomeDeduction = (annualSalary: number): number => {
  if (annualSalary <= 1625000) {
    return 550000;
  } else if (annualSalary <= 1800000) {
    return annualSalary * 0.4 - 100000;
  } else if (annualSalary <= 3600000) {
    return annualSalary * 0.3 + 80000;
  } else if (annualSalary <= 6600000) {
    return annualSalary * 0.2 + 440000;
  } else if (annualSalary <= 8500000) {
    return annualSalary * 0.1 + 1100000;
  } else {
    return 1950000; // 上限
  }
};

/**
 * 扶養控除額を計算
 */
export const calculateDependentDeduction = (dependents: number): number => {
  return dependents * 380000; // 一般扶養親族 38万円/人
};

/**
 * 給与所得を計算
 */
export const calculateSalaryIncome = (input: SalaryIncomeInput): SalaryIncomeResult => {
  // 給与所得控除額
  const salaryIncomeDeduction = calculateSalaryIncomeDeduction(input.annualSalary);
  
  // 給与所得金額
  const salaryIncome = Math.max(0, input.annualSalary - salaryIncomeDeduction);
  
  // 基礎控除（令和2年以降: 48万円）
  const basicDeduction = 480000;
  
  // 扶養控除
  const dependentDeduction = calculateDependentDeduction(input.dependents || 0);
  
  // 配偶者控除
  const spouseDeduction = input.spouseDeduction ? 380000 : 0;
  
  // 生命保険料控除
  const lifeInsurance = Math.min(input.lifeInsurance || 0, 120000); // 上限12万円
  
  // 控除額合計
  const totalDeduction = 
    input.socialInsurance + 
    lifeInsurance + 
    basicDeduction + 
    dependentDeduction + 
    spouseDeduction;
  
  // 課税所得
  const taxableIncome = Math.max(0, salaryIncome - totalDeduction);
  
  // 推定税額（簡易計算）
  const estimatedTax = calculateIncomeTax(taxableIncome);
  
  return {
    annualSalary: input.annualSalary,
    salaryIncomeDeduction,
    salaryIncome,
    socialInsurance: input.socialInsurance,
    lifeInsurance,
    basicDeduction,
    dependentDeduction,
    spouseDeduction,
    totalDeduction,
    taxableIncome,
    estimatedTax,
  };
};

/**
 * 所得税を計算（簡易版）
 */
const calculateIncomeTax = (taxableIncome: number): number => {
  if (taxableIncome <= 1950000) {
    return taxableIncome * 0.05;
  } else if (taxableIncome <= 3300000) {
    return taxableIncome * 0.1 - 97500;
  } else if (taxableIncome <= 6950000) {
    return taxableIncome * 0.2 - 427500;
  } else if (taxableIncome <= 9000000) {
    return taxableIncome * 0.23 - 636000;
  } else if (taxableIncome <= 18000000) {
    return taxableIncome * 0.33 - 1536000;
  } else if (taxableIncome <= 40000000) {
    return taxableIncome * 0.40 - 2796000;
  } else {
    return taxableIncome * 0.45 - 4796000;
  }
};
