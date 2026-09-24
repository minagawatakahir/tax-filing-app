import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SalaryIncomeModule from '../SalaryIncomeModule';
import { FiscalYearProvider } from '../../contexts/FiscalYearContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Wrapper component to provide context
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <FiscalYearProvider>{children}</FiscalYearProvider>;
};

describe('SalaryIncomeModule', () => {
  describe('Component Rendering', () => {
    it('should render the salary income form', () => {
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      expect(screen.getByText(/給与所得/)).toBeInTheDocument();
      expect(screen.getByText('年間給与収入 (円)')).toBeInTheDocument();
    });

    it('should render with default form values', () => {
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should render calculate button', () => {
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      const calculateButton = screen.getByText('計算する');
      expect(calculateButton).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should handle form interactions', () => {
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should have checkbox for spouse deduction', () => {
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      // Mock successful API response
      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            annualSalary: 5000000,
            salaryIncomeDeduction: 1440000,
            salaryIncome: 3560000,
            socialInsurance: 750000,
            lifeInsurance: 100000,
            basicDeduction: 480000,
            dependentDeduction: 0,
            spouseDeduction: 0,
            totalDeduction: 1330000,
            taxableIncome: 2230000,
            estimatedTax: 111500,
          },
        },
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should calculate salary income when form is submitted', async () => {
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      const calculateButton = screen.getByText('計算する');
      
      fireEvent.click(calculateButton);

      // Wait for the API call
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });
  });

  describe('年分別の税額表示（還付・納付）', () => {
    const v2Result = (overrides: Record<string, unknown> = {}) => ({
      data: {
        data: {
          taxYear: 2025,
          isProvisional: false,
          annualSalary: 5000000,
          salaryIncomeDeduction: 1440000,
          salaryIncome: 3560000,
          socialInsurance: 600000,
          lifeInsurance: 80000,
          basicDeduction: 680000,
          dependentDeduction: 380000,
          spouseDeduction: 380000,
          totalDeduction: 2120000,
          taxableIncome: 1440000,
          baseIncomeTax: 72000,
          reconstructionTax: 1512,
          estimatedTax: 73512,
          withheldTax: 500000,
          taxPayable: 0,
          taxRefund: 426488,
          ...overrides,
        },
      },
    });

    beforeEach(() => {
      localStorage.setItem('selectedFiscalYear', '2025');
    });

    afterEach(() => {
      localStorage.removeItem('selectedFiscalYear');
      jest.clearAllMocks();
    });

    it('選択中の年分を計算APIに送る', async () => {
      mockedAxios.post.mockResolvedValue(v2Result());
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('計算する'));

      await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
      expect(mockedAxios.post.mock.calls[0][0]).toContain('/api/salary-income/calculate');
      expect(mockedAxios.post.mock.calls[0][1]).toMatchObject({ fiscalYear: 2025 });
    });

    it('復興特別所得税の内訳と還付見込み額を表示する', async () => {
      mockedAxios.post.mockResolvedValue(v2Result());
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('計算する'));

      const settlement = await screen.findByTestId('salary-tax-settlement');
      expect(settlement).toHaveTextContent('還付見込み ¥426,488');
      expect(settlement).toHaveTextContent('源泉徴収税額 ¥500,000');
      expect(screen.getByText('所得税及び復興特別所得税')).toBeInTheDocument();
      expect(screen.getByText(/復興特別所得税 ¥\s*1,512/)).toBeInTheDocument();
    });

    it('源泉徴収税額が不足する場合は納付見込み額を表示する', async () => {
      mockedAxios.post.mockResolvedValue(v2Result({ withheldTax: 50000, taxPayable: 23500, taxRefund: 0 }));
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('計算する'));

      const settlement = await screen.findByTestId('salary-tax-settlement');
      expect(settlement).toHaveTextContent('納付見込み ¥23,500');
      expect(settlement).not.toHaveTextContent('還付見込み');
    });

    it('暫定ルールで計算した場合は注意書きを表示する', async () => {
      mockedAxios.post.mockResolvedValue(
        v2Result({ taxYear: 2028, isProvisional: true, notice: '2028年分は給与所得控除などの税制が未確定のため、公表済みの最新ルールで暫定計算しています。' })
      );
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('計算する'));

      expect(await screen.findByText(/2028年分は給与所得控除などの税制が未確定/)).toBeInTheDocument();
    });

    it('旧形式（v1）の結果では差引表示を出さない', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            annualSalary: 5000000, salaryIncomeDeduction: 1440000, salaryIncome: 3560000,
            socialInsurance: 750000, lifeInsurance: 100000, basicDeduction: 480000,
            dependentDeduction: 0, spouseDeduction: 0, totalDeduction: 1330000,
            taxableIncome: 2230000, estimatedTax: 111500,
          },
        },
      });
      render(<SalaryIncomeModule />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('計算する'));

      expect(await screen.findByText('¥111,500')).toBeInTheDocument();
      expect(screen.queryByTestId('salary-tax-settlement')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle component without errors', () => {
      render(<SalaryIncomeModule />, { wrapper: Wrapper });
      expect(screen.getByText(/給与所得/)).toBeInTheDocument();
    });
  });
});
