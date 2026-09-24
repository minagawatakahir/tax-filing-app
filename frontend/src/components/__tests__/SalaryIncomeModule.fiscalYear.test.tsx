/**
 * 給与所得モジュール: 年度切替時の計算結果・履歴の扱い
 * 計算結果は年分ごとの税制に依存するため、別の年度として保存されてはならない。
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import SalaryIncomeModule from '../SalaryIncomeModule';
import { FiscalYearProvider, useFiscalYear } from '../../contexts/FiscalYearContext';
import { saveSalaryIncomeRecord, getSalaryIncomeRecords } from '../../services/api';

jest.mock('axios');
jest.mock('../../services/api', () => ({
  saveSalaryIncomeRecord: jest.fn(),
  getSalaryIncomeRecords: jest.fn(),
  deleteSalaryIncomeRecord: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSave = saveSalaryIncomeRecord as jest.Mock;
const mockedGetRecords = getSalaryIncomeRecords as jest.Mock;

/** テスト用: 年度を切り替えるボタン */
const YearSwitcher: React.FC = () => {
  const { availableFiscalYears, setCurrentFiscalYear, currentFiscalYear } = useFiscalYear();
  return (
    <div>
      <span data-testid="current-year">{currentFiscalYear.year}</span>
      {availableFiscalYears.map((fy) => (
        <button key={fy.year} onClick={() => setCurrentFiscalYear(fy)}>
          switch-{fy.year}
        </button>
      ))}
    </div>
  );
};

const renderModule = () =>
  render(
    <FiscalYearProvider>
      <YearSwitcher />
      <SalaryIncomeModule />
    </FiscalYearProvider>
  );

const resultFor = (taxYear: number) => ({
  data: {
    data: {
      taxYear,
      isProvisional: false,
      annualSalary: 5000000,
      salaryIncomeDeduction: 1440000,
      salaryIncome: 3560000,
      socialInsurance: 0,
      lifeInsurance: 0,
      basicDeduction: 680000,
      dependentDeduction: 0,
      spouseDeduction: 0,
      totalDeduction: 680000,
      taxableIncome: 2880000,
      baseIncomeTax: 190500,
      reconstructionTax: 4000,
      estimatedTax: 194500,
      withheldTax: 0,
      taxPayable: 194500,
      taxRefund: 0,
    },
  },
});

describe('SalaryIncomeModule - 年度切替', () => {
  beforeEach(() => {
    localStorage.setItem('selectedFiscalYear', '2025');
    mockedSave.mockResolvedValue({ success: true });
    mockedGetRecords.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    localStorage.removeItem('selectedFiscalYear');
    jest.clearAllMocks();
  });

  it('同じ年度なら計算結果を保存できる（年度と結果を送る）', async () => {
    mockedAxios.post.mockResolvedValue(resultFor(2025));
    renderModule();

    fireEvent.click(screen.getByText('計算する'));
    fireEvent.click(await screen.findByText('この結果を保存'));

    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(1));
    expect(mockedSave.mock.calls[0][0]).toBe(2025);
    expect(mockedSave.mock.calls[0][2]).toMatchObject({ taxYear: 2025 });
    expect(await screen.findByText('✅ 計算結果を保存しました')).toBeInTheDocument();
  });

  it('年度を切り替えると前の年度の計算結果は破棄され、保存できない', async () => {
    mockedAxios.post.mockResolvedValue(resultFor(2025));
    renderModule();

    fireEvent.click(screen.getByText('計算する'));
    expect(await screen.findByText('この結果を保存')).toBeInTheDocument();

    fireEvent.click(screen.getByText('switch-2026'));

    expect(screen.getByTestId('current-year')).toHaveTextContent('2026');
    expect(screen.queryByText('この結果を保存')).not.toBeInTheDocument();
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('計算中に年度を切り替えた場合、結果の年分が違うので保存を拒否する', async () => {
    let resolveCalc: (v: unknown) => void = () => undefined;
    mockedAxios.post.mockReturnValue(new Promise((resolve) => (resolveCalc = resolve)) as any);
    renderModule();

    fireEvent.click(screen.getByText('計算する'));
    fireEvent.click(screen.getByText('switch-2026'));
    await act(async () => resolveCalc(resultFor(2025)));

    fireEvent.click(await screen.findByText('この結果を保存'));

    expect(
      await screen.findByText('❌ 計算結果は2025年分です。2026年度で保存するには再計算してください')
    ).toBeInTheDocument();
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('履歴表示中に年度を切り替えると、新しい年度の履歴を読み込み直す', async () => {
    renderModule();

    fireEvent.click(screen.getByText('📊 計算履歴を表示'));
    await waitFor(() => expect(mockedGetRecords).toHaveBeenCalledWith({ year: 2025 }));

    fireEvent.click(screen.getByText('switch-2026'));

    await waitFor(() => expect(mockedGetRecords).toHaveBeenLastCalledWith({ year: 2026 }));
  });
});
