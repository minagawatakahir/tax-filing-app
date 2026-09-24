import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RealEstateIncomeModule from '../RealEstateIncomeModule';
import { FiscalYearProvider } from '../../contexts/FiscalYearContext';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <FiscalYearProvider>{children}</FiscalYearProvider>;
};

describe('RealEstateIncomeModule', () => {
  describe('Component Rendering', () => {
    it('should render the real estate income module', () => {
      render(<RealEstateIncomeModule />, { wrapper: Wrapper });

      const elements = screen.getAllByText(/不動産所得/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should render form inputs for income and expenses', () => {
      render(<RealEstateIncomeModule />, { wrapper: Wrapper });

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should render without errors', () => {
      render(<RealEstateIncomeModule />, { wrapper: Wrapper });

      // Component should render without throwing errors
      expect(screen.getAllByText(/不動産所得/i).length).toBeGreaterThan(0);
    });
  })

  describe('Form State', () => {
    it('should have form elements', () => {
      render(<RealEstateIncomeModule />, { wrapper: Wrapper });

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            propertyId: 'prop-1',
            year: 2025,
            totalIncome: 1800000,
            totalExpenses: 800000,
            netIncome: 1000000,
            taxableIncome: 1000000,
          },
        },
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should render without crashing', () => {
      render(<RealEstateIncomeModule />, { wrapper: Wrapper });

      const elements = screen.getAllByText(/不動産所得/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
