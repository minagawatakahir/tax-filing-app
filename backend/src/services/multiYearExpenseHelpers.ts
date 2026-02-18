/**
 * TX-32: 複数年払い経費の按分計算ヘルパー関数
 * 火災・地震保険、ローン保証料などの複数年払い費用を年度別に按分計算
 */

/**
 * 複数年払いの保険料・保証料を年度別に按分計算
 * 
 * @param totalAmount - 支払総額
 * @param coveragePeriodYears - カバー期間（年数）
 * @param startDate - 開始日
 * @param targetYear - 計算対象年度
 * @returns その年度に計上すべき経費額
 */
export const calculateAnnualExpenseFromMultiYearPayment = (
  totalAmount: number,
  coveragePeriodYears: number,
  startDate: Date,
  targetYear: number
): number => {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1; // 1-12
  const endYear = startYear + coveragePeriodYears - 1;
  
  // 年間当たりの基本額
  const annualAmount = totalAmount / coveragePeriodYears;
  
  // 対象年度が期間外の場合
  if (targetYear < startYear || targetYear > endYear) {
    return 0;
  }
  
  // 初年度（取得年）
  if (targetYear === startYear) {
    // 取得月から12月までの月数
    const monthsInFirstYear = 13 - startMonth;
    return Math.round(annualAmount * monthsInFirstYear / 12);
  }
  
  // 最終年度
  if (targetYear === endYear) {
    // 1月から取得月の前月までの月数
    const monthsInLastYear = startMonth - 1;
    return Math.round(annualAmount * monthsInLastYear / 12);
  }
  
  // 中間年度（取得月～翌年の取得月の前月）
  return Math.round(annualAmount);
};

/**
 * リフォーム費用を年度別に集計
 * 
 * @param renovationExpenses - リフォーム費用配列
 * @param targetYear - 計算対象年度
 * @returns その年度のリフォーム費用合計
 */
export const calculateRenovationExpenseForYear = (
  renovationExpenses: Array<{ date: Date; amount: number }> | undefined,
  targetYear: number
): number => {
  if (!renovationExpenses || renovationExpenses.length === 0) {
    return 0;
  }
  
  return renovationExpenses
    .filter(expense => expense.date.getFullYear() === targetYear)
    .reduce((sum, expense) => sum + expense.amount, 0);
};

/**
 * TX-32: 複数年払い経費の年度別スケジュール生成
 * 
 * @param totalAmount - 支払総額
 * @param coveragePeriodYears - カバー期間（年数）
 * @param startDate - 開始日
 * @returns 年度別の経費スケジュール
 */
export interface MultiYearExpenseSchedule {
  year: number;
  expenseAmount: number;
  description: string;
}

export const generateMultiYearExpenseSchedule = (
  totalAmount: number,
  coveragePeriodYears: number,
  startDate: Date
): MultiYearExpenseSchedule[] => {
  const schedule: MultiYearExpenseSchedule[] = [];
  const startYear = startDate.getFullYear();
  const endYear = startYear + coveragePeriodYears - 1;
  
  for (let year = startYear; year <= endYear; year++) {
    const expenseAmount = calculateAnnualExpenseFromMultiYearPayment(
      totalAmount,
      coveragePeriodYears,
      startDate,
      year
    );
    
    let description = '';
    if (year === startYear) {
      description = `初年度（${startDate.getMonth() + 1}月～12月）`;
    } else if (year === endYear) {
      description = `最終年度（1月～${startDate.getMonth()}月）`;
    } else {
      description = `${year}年度`;
    }
    
    schedule.push({
      year,
      expenseAmount,
      description,
    });
  }
  
  return schedule;
};

/**
 * TX-32: 複数の複数年払い経費をマージ
 * （火災保険とローン保証料など複数がある場合）
 * 
 * @param expenses - 複数の複数年払い経費配列
 * @param targetYear - 計算対象年度
 * @returns その年度の合計経費
 */
export interface MultiYearExpenseItem {
  totalAmount: number;
  coveragePeriodYears: number;
  startDate: Date;
  name: string;
}

export const calculateTotalMultiYearExpenseForYear = (
  expenses: MultiYearExpenseItem[],
  targetYear: number
): { total: number; breakdown: { [key: string]: number } } => {
  const breakdown: { [key: string]: number } = {};
  let total = 0;
  
  for (const expense of expenses) {
    const amount = calculateAnnualExpenseFromMultiYearPayment(
      expense.totalAmount,
      expense.coveragePeriodYears,
      expense.startDate,
      targetYear
    );
    
    if (amount > 0) {
      breakdown[expense.name] = amount;
      total += amount;
    }
  }
  
  return {
    total,
    breakdown,
  };
};
