/**
 * TX-56 検証テスト: 譲渡所得モジュールの複数物件対応
 * 実際のコンポーネント動作をテスト
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import CapitalGainModule from '../CapitalGainModule';
import { FiscalYearProvider } from '../../contexts/FiscalYearContext';
import * as api from '../../services/api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../services/api', () => ({
  saveCapitalGainRecord: jest.fn(() => Promise.resolve({ success: true })),
  getCapitalGainRecords: jest.fn(() => Promise.resolve([])),
  deleteCapitalGainRecord: jest.fn(() => Promise.resolve({ success: true })),
}));

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <FiscalYearProvider>
      {component}
    </FiscalYearProvider>
  );
};

describe('TX-56: 譲渡所得モジュール - 複数物件対応検証', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('物件IDが指定された場合の物件データ取得', () => {
    it('propertyId指定時に物件情報が正しく取得・表示される', async () => {
      const mockProperty = {
        propertyId: 'prop-tokyo-001',
        propertyName: '渋谷マンション',
        address: '東京都渋谷区',
        acquisitionDate: '2020-01-15',
        acquisitionCost: 40000000,
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: [mockProperty] },
      });

      renderWithContext(<CapitalGainModule propertyId="prop-tokyo-001" />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5000/api/properties');
      });

      await waitFor(() => {
        expect(screen.getByText('渋谷マンション')).toBeInTheDocument();
      });
    });

    it('指定された物件が見つからない場合にエラー表示', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: [{ propertyId: 'other-prop', propertyName: '他の物件' }] },
      });

      renderWithContext(<CapitalGainModule propertyId="prop-not-found" />);

      await waitFor(() => {
        expect(screen.getByText('指定された物件が見つかりません')).toBeInTheDocument();
      });
    });
  });

  describe('複数物件の取得と表示', () => {
    it('複数物件が取得できる', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [
            { propertyId: 'prop-1', propertyName: 'マンション', acquisitionDate: '2020-01-01', acquisitionCost: 50000000 },
            { propertyId: 'prop-2', propertyName: '戸建', acquisitionDate: '2021-06-15', acquisitionCost: 40000000 },
            { propertyId: 'prop-3', propertyName: 'ビル', acquisitionDate: '2019-03-20', acquisitionCost: 100000000 },
          ],
        },
      });

      renderWithContext(<CapitalGainModule propertyId="prop-1" />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('譲渡所得計算', () => {
    it('計算ボタンクリック時にAPI呼び出しとデータ計算が実行される', async () => {
      const mockProperty = {
        propertyId: 'prop-1',
        propertyName: 'テスト物件',
        acquisitionDate: '2019-01-01',
        acquisitionCost: 40000000,
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: [mockProperty] },
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          result: {
            salePrice: 50000000,
            totalExpenses: 2000000,
            grossGain: 48000000,
            ownershipPeriod: { years: 5, months: 0, type: 'long-term' },
            specialDeduction: 30000000,
            taxableIncome: 18000000,
            taxRate: 0.15,
            incomeTax: 2700000,
            residentialTax: 900000,
            totalTax: 3600000,
          },
        },
      });

      renderWithContext(<CapitalGainModule propertyId="prop-1" />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      // 売却価格を入力
      const saleInputs = screen.getAllByPlaceholderText(/50,000,000/);
      if (saleInputs.length > 0) {
        await userEvent.clear(saleInputs[0]);
        await userEvent.type(saleInputs[0], '50000000');
      }

      // 計算ボタンをクリック
      const calculateButton = screen.getByRole('button', { name: /譲渡所得を計算/ });
      await userEvent.click(calculateButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/capital-gain/calculate',
          expect.objectContaining({ propertyId: 'prop-1' })
        );
      });
    });

    it('3000万円控除が結果に正しく反映される', async () => {
            mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [{
            propertyId: 'prop-1',
            propertyName: 'テスト',
            acquisitionDate: '2015-01-01',
            acquisitionCost: 30000000,
          }],
        },
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          result: {
            salePrice: 80000000,
            totalExpenses: 2000000,
            grossGain: 78000000,
            ownershipPeriod: { years: 8, months: 0, type: 'long-term' },
            specialDeduction: 30000000,
            taxableIncome: 48000000,
            taxRate: 0.15,
            incomeTax: 7200000,
            residentialTax: 2400000,
            totalTax: 9600000,
          },
        },
      });

      renderWithContext(<CapitalGainModule propertyId="prop-1" />);

      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

      const calculateButton = screen.getByRole('button', { name: /譲渡所得を計算/ });
      await userEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/特別控除額/)).toBeInTheDocument();
        expect(screen.getByText(/¥30,000,000/)).toBeInTheDocument();
      });
    });
  });

  describe('長期・短期判定', () => {
    it('5年以上の所有で長期譲渡所得と判定される', async () => {
            mockedAxios.get.mockResolvedValueOnce({
        data: { data: [{ propertyId: 'prop-1', propertyName: 'テスト', acquisitionDate: '2015-01-01', acquisitionCost: 30000000 }] },
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          result: {
            salePrice: 50000000,
            totalExpenses: 1000000,
            grossGain: 49000000,
            ownershipPeriod: { years: 8, months: 6, type: 'long-term' },
            specialDeduction: 0,
            taxableIncome: 49000000,
            taxRate: 0.15,
            incomeTax: 7350000,
            residentialTax: 2450000,
            totalTax: 9800000,
          },
        },
      });

      renderWithContext(<CapitalGainModule propertyId="prop-1" />);
      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

      await userEvent.click(screen.getByRole('button', { name: /譲渡所得を計算/ }));

      await waitFor(() => {
        expect(screen.getByText(/長期/)).toBeInTheDocument();
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('API呼び出し失敗時にエラーメッセージが表示される', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      renderWithContext(<CapitalGainModule propertyId="prop-1" />);

      await waitFor(() => {
        expect(screen.getByText(/物件情報の取得に失敗しました/)).toBeInTheDocument();
      });
    });

    it('計算失敗時にエラー表示される', async () => {
            mockedAxios.get.mockResolvedValueOnce({
        data: { data: [{ propertyId: 'prop-1', propertyName: 'テスト', acquisitionDate: '2020-01-01', acquisitionCost: 30000000 }] },
      });

      mockedAxios.post.mockRejectedValueOnce(
        new Error('Calculation error')
      );

      renderWithContext(<CapitalGainModule propertyId="prop-1" />);
      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

      await userEvent.click(screen.getByRole('button', { name: /譲渡所得を計算/ }));

      await waitFor(() => {
        expect(screen.getByText(/計算処理中にエラーが発生しました/)).toBeInTheDocument();
      });
    });
  });
});
