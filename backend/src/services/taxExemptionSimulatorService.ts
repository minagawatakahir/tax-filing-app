/**
 * 特例併用シミュレーターサービス
 * 3,000万円控除 vs 住宅ローン控除の損得判定
 */

export interface PropertySaleScenario {
  propertyId: string;
  sellingPrice: number;
  acquisitionCost: number;
  acquisitionDate: Date;
  sellingDate: Date;
  ownershipYears: number;
  mortgageBalance: number;
  annualMortgagePayment: number;
  remainingMortgageYears: number;
}

export interface TaxExemptionScenario30M {
  name: '3,000万円控除'; 
  taxableGain: number;
  exclusion: number; // 3,000万円
  taxableIncome: number;
  incomeTaxRate: number;
  incomeTax: number;
  inhersitanceTaxConsideration: boolean;
}

export interface TaxExemptionScenarioMortgage {
  name: '住宅ローン控除';
  totalMortgagePayment: number;
  annualDeduction: number;
  deductionPeriod: number; // 年
  totalTaxReduction: number;
  effectiveRate: number;
}

export interface TaxExemptionComparison {
  propertyId: string;
  scenario30M: TaxExemptionScenario30M;
  scenarioMortgage: TaxExemptionScenarioMortgage;
  optimalChoice: '3,000万円控除' | '住宅ローン控除' | '併用不可';
  netBenefit: number;
  recommendation: string;
}

/**
 * 3,000万円控除のシミュレーション
 * @param scenario 物件売却シナリオ
 * @returns 3,000万円控除の計算結果
 */
export const simulate30MExemption = (scenario: PropertySaleScenario): TaxExemptionScenario30M => {
  // 譲渡益
  const gain = scenario.sellingPrice - scenario.acquisitionCost;
  
  // 控除（3,000万円）
  const exclusion = 3000000;
  
  // 課税譲渡所得
  const taxableGain = Math.max(0, gain - exclusion);
  
  // 短期譲渡（5年以下）と長期譲渡（5年超）で税率が異なる
  const isLongTermGain = scenario.ownershipYears > 5;
  
  // 税率（長期譲渡: 15% + 復興特別税 0.315% ≈ 15.315%, 短期: 30% + 復興特別税）
  const incomeTaxRate = isLongTermGain ? 15.315 : 30.315;
  
  // 所得税
  const incomeTax = taxableGain * (incomeTaxRate / 100);
  
  return {
    name: '3,000万円控除',
    taxableGain: gain,
    exclusion,
    taxableIncome: taxableGain,
    incomeTaxRate,
    incomeTax,
    inhersitanceTaxConsideration: gain > 0, // 相続税への影響あり
  };
};

/**
 * 住宅ローン控除のシミュレーション
 * @param scenario 物件売却シナリオ
 * @returns 住宅ローン控除の計算結果
 */
export const simulateMortgageDeduction = (scenario: PropertySaleScenario): TaxExemptionScenarioMortgage => {
  // 住宅ローン控除は年末の残債の1%を控除（最大40万円/年）
  // ただし、売却時点で残債がなくなるため、残りの年数のみ適用
  
  // 年間控除額（残債の1%、最大40万円）
  const annualDeduction = Math.min(
    scenario.mortgageBalance * 0.01,
    400000
  );
  
  // 控除可能期間
  const deductionPeriod = Math.min(scenario.remainingMortgageYears, 13);
  
  // 総控除額（税額減）
  const totalTaxReduction = annualDeduction * deductionPeriod;
  
  // 効果的な税率削減
  const effectiveRate = scenario.annualMortgagePayment > 0 
    ? (annualDeduction / scenario.annualMortgagePayment) * 100 
    : 0;
  
  return {
    name: '住宅ローン控除',
    totalMortgagePayment: scenario.annualMortgagePayment * scenario.remainingMortgageYears,
    annualDeduction,
    deductionPeriod,
    totalTaxReduction,
    effectiveRate,
  };
};

/**
 * 3,000万円控除と住宅ローン控除を比較
 * @param scenario 物件売却シナリオ
 * @returns 比較結果と最適な選択肢
 */
export const compareExemptions = (scenario: PropertySaleScenario): TaxExemptionComparison => {
  // 両シナリオをシミュレーション
  const scenario30M = simulate30MExemption(scenario);
  const scenarioMortgage = simulateMortgageDeduction(scenario);
  
  // 注：実際には併用不可（売却時は3,000万円控除を選択）
  let optimalChoice: '3,000万円控除' | '住宅ローン控除' | '併用不可';
  let netBenefit: number;
  let recommendation: string;
  
  // 売却する場合は3,000万円控除のみ適用
  if (scenario.sellingPrice > scenario.acquisitionCost) {
    optimalChoice = '3,000万円控除';
    netBenefit = scenario30M.exclusion; // 3,000万円の控除が得られる
    recommendation = `譲渡益が発生しているため、3,000万円控除により約${Math.round(scenario30M.incomeTax * 100) / 100}万円の税金削減が期待できます。`;
  } else {
    optimalChoice = '併用不可';
    netBenefit = 0;
    recommendation = '譲渡損が発生しているため、所得税の控除対象外です。翌年以降の損失繰越を検討してください。';
  }
  
  return {
    propertyId: scenario.propertyId,
    scenario30M,
    scenarioMortgage,
    optimalChoice,
    netBenefit,
    recommendation,
  };
};

/**
 * 複数物件の売却戦略をシミュレーション
 * @param scenarios 物件シナリオの配列
 * @returns 全体の最適化提案
 */
export const optimizeMultiplePropertySales = (scenarios: PropertySaleScenario[]) => {
  const comparisons = scenarios.map(scenario => compareExemptions(scenario));
  
  const totalGain = comparisons.reduce((sum, c) => sum + c.scenario30M.taxableGain, 0);
  const totalTaxSavings = comparisons.reduce((sum, c) => sum + (c.scenario30M.exclusion * comparisons.length), 0) / comparisons.length;
  
  // 損失繰越の機会の確認
  const hasLossCarryforward = comparisons.some(c => c.scenario30M.taxableGain < 0);
  
  return {
    totalProperties: scenarios.length,
    totalGain,
    totalTaxSavings: Math.min(totalTaxSavings, 3000000 * comparisons.length),
    comparisons,
    hasLossCarryforward,
    overallRecommendation: totalGain > 0 
      ? '複数物件の売却により税負担が高くなるため、売却時期の分散や減税制度の活用を検討してください。'
      : '損失が発生しているため、損失繰越制度の活用を検討してください。',
  };
};
