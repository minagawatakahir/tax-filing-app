/**
 * ローカルストレージでのデータ保存サービス
 */

export interface SavedCalculation {
  id: string;
  date: string;
  income: {
    businessIncome: number;
    otherIncome?: number;
  };
  expense: {
    rentExpense: number;
    utilityExpense: number;
    suppliesExpense: number;
    travelExpense: number;
    communicationExpense: number;
    otherExpense?: number;
  };
  result: {
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    basicDeduction: number;
    taxableIncome: number;
    incomeTax: number;
    inhabTax: number;
    totalTax: number;
  };
}

const STORAGE_KEY = 'tax_calculations';

/**
 * 計算結果を保存
 */
export const saveCalculation = (calculation: Omit<SavedCalculation, 'id' | 'date'>): void => {
  const calculations = getAllCalculations();
  const newCalculation: SavedCalculation = {
    ...calculation,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };
  
  calculations.push(newCalculation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
};

/**
 * すべての計算結果を取得
 */
export const getAllCalculations = (): SavedCalculation[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse saved calculations:', error);
    return [];
  }
};

/**
 * 計算結果を削除
 */
export const deleteCalculation = (id: string): void => {
  const calculations = getAllCalculations();
  const filtered = calculations.filter(calc => calc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * すべてのデータをクリア
 */
export const clearAllCalculations = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * 計算結果をエクスポート（JSON形式）
 */
export const exportCalculations = (): void => {
  const calculations = getAllCalculations();
  const dataStr = JSON.stringify(calculations, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `tax_calculations_${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};
