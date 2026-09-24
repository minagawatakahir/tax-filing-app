import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface IncomeData {
  businessIncome: number;
  otherIncome?: number;
}

export interface ExpenseData {
  rentExpense: number;
  utilityExpense: number;
  suppliesExpense: number;
  travelExpense: number;
  communicationExpense: number;
  otherExpense?: number;
}

export interface TaxCalculationResult {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  basicDeduction: number;
  taxableIncome: number;
  incomeTax: number;
  inhabTax: number;
  totalTax: number;
}

export interface CalculationResponse {
  success: boolean;
  data: {
    calculation: TaxCalculationResult;
    suggestions: string[];
  };
}

/**
 * 税務計算APIを呼び出し
 */
export const calculateTax = async (
  income: IncomeData,
  expense: ExpenseData
): Promise<CalculationResponse> => {
  const response = await apiClient.post('/tax/calculate', { income, expense });
  return response.data;
};

/**
 * 簡易シミュレーションAPIを呼び出し
 */
export const quickSimulation = async (annualIncome: number): Promise<CalculationResponse> => {
  const response = await apiClient.post('/tax/quick-simulation', { annualIncome });
  return response.data;
};

/**
 * 給与所得計算結果を保存
 */
export const saveSalaryIncomeRecord = async (year: number, input: any, result: any) => {
  const response = await apiClient.post('/salary-income/save', { year, input, result });
  return response.data;
};

/**
 * 給与所得計算履歴を取得
 */
export const getSalaryIncomeRecords = async (filters?: { year?: number }) => {
  const response = await apiClient.get('/salary-income/records', { params: filters });
  return response.data;
};

/**
 * 給与所得計算履歴を削除
 */
export const deleteSalaryIncomeRecord = async (id: string) => {
  const response = await apiClient.delete(`/salary-income/records/${id}`);
  return response.data;
};

/**
 * 譲渡所得計算結果を保存
 */
export const saveCapitalGainRecord = async (propertyId: string | undefined, input: any, result: any) => {
  const response = await apiClient.post('/capital-gain/save', { propertyId, input, result });
  return response.data;
};

/**
 * 譲渡所得計算履歴を取得
 */
export const getCapitalGainRecords = async (filters?: { propertyId?: string }) => {
  const response = await apiClient.get('/capital-gain/records', { params: filters });
  return response.data;
};

/**
 * 譲渡所得計算履歴を削除
 */
export const deleteCapitalGainRecord = async (id: string) => {
  const response = await apiClient.delete(`/capital-gain/records/${id}`);
  return response.data;
};

/**
 * RSU所得計算結果を保存
 */
export const saveRSUIncomeRecord = async (year: number, input: any, result: any, totalRSUIncome: number) => {
  const response = await apiClient.post('/rsu-income/save', { year, input, result, totalRSUIncome });
  return response.data;
};

/**
 * RSU所得計算履歴を取得
 */
export const getRSUIncomeRecords = async (filters?: { year?: number }) => {
  const response = await apiClient.get('/rsu-income/list', { params: filters });
  return response.data;
};

/**
 * RSU所得計算履歴を削除
 */
export const deleteRSUIncomeRecord = async (id: string) => {
  const response = await apiClient.delete(`/rsu-income/${id}`);
  return response.data;
};

export default apiClient;
