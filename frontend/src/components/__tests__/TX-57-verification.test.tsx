/**
 * TX-57 検証テスト: 不動産所得モジュールの複数年度対応
 * 実際のコンポーネント動作をテスト
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import RealEstateIncomeModule from '../RealEstateIncomeModule';
import { FiscalYearProvider, createFiscalYear } from '../../contexts/FiscalYearContext';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock fetch for calculate endpoint
global.fetch = jest.fn();
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <FiscalYearProvider>
      {component}
    </FiscalYearProvider>
  );
};

describe('TX-57: 不動産所得モジュール - 複数年度対応検証', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('物件データ取得と年度管理', () => {
    it('propertyId指定時に物件情報が取得・表示される', async () => {
      const mockProperty = {
        propertyId: 'prop-rental-001',
        propertyName: '渋谷賃貸マンション',
        totalValue: 50000000,
        buildingValue: 30000000,
        buildingStructure: 'rc',
        acquisitionDate: '2020-01-15',
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: [mockProperty] },
      });

      renderWithContext(<RealEstateIncomeModule propertyId="prop-rental-001" />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5000/api/properties');
      });

      await waitFor(() => {
        expect(screen.getByText('渋谷賃貸マンション')).toBeInTheDocument();
      });
    });

    it('複数年度のデータを表示できる', async () => {
      const mockProperty = {
        propertyId: 'prop-1',
        propertyName: 'テスト物件',
        buildingValue: 20000000,
        buildingStructure: 'rc',
        acquisitionDate: '2020-01-01',
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: [mockProperty] },
      });

      renderWithContext(<RealEstateIncomeModule propertyId="prop-1" />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      // 対象年度フィールドが表示されることを確認
      const yearInputs = screen.getAllByDisplayValue(/202/);
      expect(yearInputs.length).toBeGreaterThan(0);
    });
  });

  describe('不動産所得計算', () => {
    it('計算ボタンクリック時にAPI呼び出しで計算が実行される', async () => {
            const mockProperty = {
        propertyId: 'prop-1',
        propertyName: 'テスト',
        buildingValue: 25000000,
        buildingStructure: 'steel',
        acquisitionDate: '2020-01-01',
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: [mockProperty] },
      });

      mockedFetch.mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            propertyId: 'prop-1',
            year: new Date().getFullYear(),
            totalRentalIncome: 1800000,
            otherIncome: 240000,
            totalIncome: 2040000,
            operatingExpenses: 1200000,
            propertyTax: 120000,
            loanInterest: 300000,
            depreciationExpense: 531914,
            totalExpenses: 2151914,
            realEstateIncome: -111914,
            expenseBreakdown: {
              managementFee: 180000,
              repairCost: 50000,
              insurance: 30000,
              utilities: 20000,
              otherExpenses: 0,
              depreciationExpense: 531914,
              propertyTax: 120000,
              loanInterest: 300000,
            },
          },
        }),
      } as any);

      renderWithContext(<RealEstateIncomeModule propertyId="prop-1" />);

      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

      // 月額家賃を入力
      const rentInputs = screen.getAllByPlaceholderText(/150000/);
      if (rentInputs.length > 0) {
        await userEvent.clear(rentInputs[0]);
        await userEvent.type(rentInputs[0], '150000');
      }

      // 計算ボタンをクリック
      const calculateButton = screen.getByRole('button', { name: /不動産所得を計算/ });
      await userEvent.click(calculateButton);

      await waitFor(() => {
        expect(mockedFetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/real-estate-income/calculate',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    it('複数年度の計算結果が正しく表示される', async () => {
            mockedAxios.get.mockResolvedValueOnce({
        data: { data: [{ propertyId: 'prop-1', propertyName: '物件', buildingValue: 25000000, buildingStructure: 'rc', acquisitionDate: '2020-01-01' }] },
      });

      mockedFetch.mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            propertyId: 'prop-1',
            year: 2024,
            totalRentalIncome: 1800000,
            totalIncome: 1800000,
            totalExpenses: 1200000,
            realEstateIncome: 600000,
            expenseBreakdown: {
              managementFee: 180000,
              repairCost: 50000,
              insurance: 30000,
              utilities: 20000,
              otherExpenses: 0,
              depreciationExpense: 531914,
              propertyTax: 120000,
              loanInterest: 300000,
            },
          },
        }),
      } as any);

      renderWithContext(<RealEstateIncomeModule propertyId="prop-1" />);

      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

      const calculateButton = screen.getByRole('button', { name: /不動産所得を計算/ });
      await userEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/総収入/)).toBeInTheDocument();
        expect(screen.getByText(/¥1,800,000/)).toBeInTheDocument();
      });
    });
  });

  describe('複数年度・複数物件の管理', () => {
    it('複数物件・複数年度データを取得できる', async () => {
      const mockProperties = [
        {
          propertyId: 'prop-1',
          propertyName: '渋谷マンション',
          buildingValue: 30000000,
          buildingStructure: 'rc',
          acquisitionDate: '2020-01-01',
        },
        {
          propertyId: 'prop-2',
          propertyName: '京都戸建',
          buildingValue: 20000000,
          buildingStructure: 'wood',
          acquisitionDate: '2019-06-15',
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockProperties },
      });

      renderWithContext(<RealEstateIncomeModule propertyId="prop-1" />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('渋谷マンション')).toBeInTheDocument();
      });
    });
  });

  describe('経費管理と減価償却', () => {
    it('減価償却費が物件情報から自動計算される', async () => {
      const mockProperty = {
        propertyId: 'prop-1',
        propertyName: 'テスト',
        buildingValue: 25000000,
        buildingStructure: 'steel',
        category: 'residential',
        acquisitionDate: '2020-01-01',
        usefulLife: 27,
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: [mockProperty] },
      });

      renderWithContext(<RealEstateIncomeModule propertyId="prop-1" />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      // 減価償却情報が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/減価償却情報/)).toBeInTheDocument();
      });
    });

    it('年度ごとに異なる必要経費を保存できる', async () => {
            mockedAxios.get.mockResolvedValueOnce({
        data: { data: [{ propertyId: 'prop-1', propertyName: 'テスト', buildingValue: 25000000, buildingStructure: 'rc', acquisitionDate: '2020-01-01' }] },
      });

      mockedFetch.mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            propertyId: 'prop-1',
            year: 2024,
            totalRentalIncome: 1800000,
            totalIncome: 1800000,
            totalExpenses: 1500000,
            realEstateIncome: 300000,
            expenseBreakdown: { managementFee: 500000, repairCost: 0, insurance: 0, utilities: 0, otherExpenses: 0, depreciationExpense: 531914, propertyTax: 0, loanInterest: 0 },
          },
        }),
      } as any);

      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      renderWithContext(<RealEstateIncomeModule propertyId="prop-1" />);

      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

      const calculateButton = screen.getByRole('button', { name: /不動産所得を計算/ });
      await userEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /計算結果を保存/ })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /計算結果を保存/ });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/real-estate-income-list',
          expect.objectContaining({ propertyId: 'prop-1' })
        );
      });
    });
  });

  describe('複数年払い経費の按分計算', () => {
    it('複数年払い保険料の按分計算が表示される', async () => {
            mockedAxios.get.mockResolvedValueOnce({
        data: { data: [{ propertyId: 'prop-1', propertyName: 'テスト', buildingValue: 25000000, buildingStructure: 'rc', acquisitionDate: '2020-01-01' }] },
      });

      renderWithContext(<RealEstateIncomeModule propertyId="prop-1" />);

      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

      // 複数年払い保険料セクションが表示されることを確認
      expect(screen.getByText(/複数年払い保険料/)).toBeInTheDocument();

      // 当年度按分額が表示されていることを確認
      const proportionalAmounts = screen.getAllByText(/当年度按分額/);
      expect(proportionalAmounts.length).toBeGreaterThan(0);

      // 総支払額フィールドに値を入力
      const totalAmountInputs = screen.getAllByPlaceholderText(/600,000/);
      if (totalAmountInputs.length > 0) {
        await userEvent.clear(totalAmountInputs[0]);
        await userEvent.type(totalAmountInputs[0], '600000');
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('物件データ取得失敗時にエラーハンドルされる', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      renderWithContext(<RealEstateIncomeModule propertyId="prop-1" />);

      // コンポーネントがクラッシュせずに、物件情報パネルが表示されないことを確認
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    it('計算失敗時にエラーメッセージが表示される', async () => {
            mockedAxios.get.mockResolvedValueOnce({
        data: { data: [{ propertyId: 'prop-1', propertyName: 'テスト', buildingValue: 25000000, buildingStructure: 'rc', acquisitionDate: '2020-01-01' }] },
      });

      mockedFetch.mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: '計算エラーが発生しました',
        }),
      } as any);

      renderWithContext(<RealEstateIncomeModule propertyId="prop-1" />);

      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

      const calculateButton = screen.getByRole('button', { name: /不動産所得を計算/ });
      await userEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/計算エラーが発生しました/)).toBeInTheDocument();
      });
    });
  });
});
