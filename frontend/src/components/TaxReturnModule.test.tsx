/**
 * 確定申告書（総合）画面のテスト（数値はすべて架空）
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import TaxReturnModule from './TaxReturnModule';
import { FiscalYearProvider } from '../contexts/FiscalYearContext';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const result = {
  taxYear: 2025,
  isProvisional: false,
  notices: [] as string[],
  salaryRevenue: 12000000,
  salaryIncome: 10050000,
  realEstateIncome: -850000,
  realEstateLossNotOffset: 0,
  realEstateIncomeForTotal: -850000,
  totalIncome: 9200000,
  socialInsurance: 1500000,
  lifeInsurance: 40000,
  earthquakeInsurance: 0,
  spouseDeduction: 0,
  dependentDeduction: 0,
  basicDeduction: 580000,
  deductionsBeforeDonation: 2120000,
  donationDeduction: 0,
  totalDeductions: 2120000,
  taxableIncome: 7080000,
  calculatedTax: 992400,
  marginalRate: 0.23,
  npoDonationCredit: 0,
  baseIncomeTax: 992400,
  reconstructionTax: 20840,
  totalIncomeTax: 1013240,
  withheldTax: 1000000,
  declaredTax: 13200,
  estimatedTaxPrepaid: 0,
  taxPayable: 13200,
  taxRefund: 0,
};

const payload = (overrides: Record<string, unknown> = {}) => ({
  data: {
    success: true,
    data: {
      fiscalYear: 2025,
      sources: {
        salary: { annualSalary: 12000000, withheldTax: 1000000 },
        realEstate: { recordCount: 2, totalRealEstateIncome: -850000 },
      },
      extras: { donations: [], estimatedTaxPrepaid: 0, landLoanInterest: 0, earthquakeInsurance: 0 },
      saved: false,
      missing: [],
      result,
      ...overrides,
    },
  },
});

const renderModule = () =>
  render(
    <FiscalYearProvider>
      <TaxReturnModule />
    </FiscalYearProvider>
  );

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('selectedFiscalYear', '2025');
});

describe('TaxReturnModule', () => {
  test('選択中の年度の申告データを読み込み、納める税金と各欄を表示する', async () => {
    mockedAxios.get.mockResolvedValueOnce(payload());
    renderModule();

    expect(await screen.findByText('納める税金')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5000/api/tax-return/2025');
    expect(screen.getByTestId('tax-return-amount')).toHaveTextContent('¥13,200');
    expect(screen.getByTestId('total-income')).toHaveTextContent('¥9,200,000');
    expect(screen.getByTestId('taxable-income')).toHaveTextContent('¥7,080,000');
    expect(screen.getByTestId('total-income-tax')).toHaveTextContent('¥1,013,240');
    expect(screen.getByText('不動産所得（不動産所得一覧 2件の合計）')).toBeInTheDocument();
  });

  test('給与所得が保存されていなければ警告を出し、計算結果は表示しない', async () => {
    mockedAxios.get.mockResolvedValueOnce(payload({ missing: ['給与所得'], result: null, sources: {
      salary: null,
      realEstate: { recordCount: 0, totalRealEstateIncome: 0 },
    } }));
    renderModule();

    expect(await screen.findByText('計算に必要な情報が足りません')).toBeInTheDocument();
    expect(screen.getByText(/2025年度の給与所得が保存されていません/)).toBeInTheDocument();
    expect(screen.queryByTestId('tax-return-summary')).not.toBeInTheDocument();
  });

  test('寄附を追加して保存すると、その内容をPUTし、結果を更新する', async () => {
    mockedAxios.get.mockResolvedValueOnce(payload());
    const donations = [{ kind: 'npo-credit', amount: 30000, name: 'NPO' }];
    mockedAxios.put.mockResolvedValueOnce(
      payload({
        saved: true,
        extras: { donations, estimatedTaxPrepaid: 0, landLoanInterest: 0, earthquakeInsurance: 0 },
        result: { ...result, npoDonationCredit: 12000, taxPayable: 0, taxRefund: 26722 },
      })
    );
    renderModule();
    await screen.findByText('納める税金');

    fireEvent.click(screen.getByRole('button', { name: '+ 寄附を追加' }));
    const row = screen.getByTestId('donation-row');
    fireEvent.change(row.querySelector('select')!, { target: { value: 'npo-credit' } });
    const [nameInput, amountInput] = Array.from(row.querySelectorAll('input'));
    fireEvent.change(nameInput, { target: { value: 'NPO' } });
    fireEvent.change(amountInput, { target: { value: '30,000' } });
    fireEvent.click(screen.getByRole('button', { name: '保存して再計算' }));

    await waitFor(() =>
      expect(mockedAxios.put).toHaveBeenCalledWith('http://localhost:5000/api/tax-return/2025', {
        donations,
        estimatedTaxPrepaid: 0,
        landLoanInterest: 0,
        earthquakeInsurance: 0,
      })
    );
    expect(await screen.findByText('2025年分の申告データを保存しました')).toBeInTheDocument();
    expect(screen.getByText('還付される税金')).toBeInTheDocument();
    expect(screen.getByTestId('tax-return-amount')).toHaveTextContent('¥26,722');
  });

  test('計算の注意（未対応の控除など）を表示する', async () => {
    mockedAxios.get.mockResolvedValueOnce(
      payload({ result: { ...result, notices: ['政党等寄附金特別控除には未対応のため、その寄附金は計算に含めていません。'] } })
    );
    renderModule();
    expect(await screen.findByText(/政党等寄附金特別控除には未対応/)).toBeInTheDocument();
  });

  test('読み込みに失敗したらエラーを表示する', async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { data: { error: 'サーバーエラー' } } });
    renderModule();
    expect(await screen.findByText('サーバーエラー')).toBeInTheDocument();
    expect(screen.queryByTestId('tax-return-summary')).not.toBeInTheDocument();
  });
});
