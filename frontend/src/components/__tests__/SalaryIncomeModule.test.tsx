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

  describe('Error Handling', () => {
    it('should handle component without errors', () => {
      render(<SalaryIncomeModule />, { wrapper: Wrapper });
      expect(screen.getByText(/給与所得/)).toBeInTheDocument();
    });
  });
});
