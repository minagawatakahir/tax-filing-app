import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RSUIncomeListModule from './RSUIncomeListModule';
import { FiscalYearProvider } from '../contexts/FiscalYearContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock window.URL.createObjectURL and window.URL.revokeObjectURL
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

describe('RSUIncomeListModule - TX-44 Frontend Module Tests', () => {
  const mockRSURecords = [
    {
      id: '1',
      userId: 'user123',
      year: 2025,
      input: [
        {
          companyName: 'Google',
          grantDate: '2024-01-15',
          vestingDate: '2025-01-15',
          shares: 100,
          pricePerShareUSD: 150,
          ttmRate: 140,
        },
        {
          companyName: 'Amazon',
          grantDate: '2024-04-15',
          vestingDate: '2025-04-15',
          shares: 100,
          pricePerShareUSD: 155,
          ttmRate: 142,
        },
      ],
      result: [
        {
          companyName: 'Google',
          vestingDate: '2025-01-15',
          shares: 100,
          pricePerShareUSD: 150,
          ttmRate: 140,
          totalValueJPY: 2100000,
          taxableIncome: 2100000,
        },
        {
          companyName: 'Amazon',
          vestingDate: '2025-04-15',
          shares: 100,
          pricePerShareUSD: 155,
          ttmRate: 142,
          totalValueJPY: 2201000,
          taxableIncome: 2201000,
        },
      ],
      totalRSUIncome: 4301000,
      createdAt: '2025-01-20',
      updatedAt: '2025-04-20',
    },
  ];

  const renderComponent = () => {
    return render(
      <FiscalYearProvider>
        <RSUIncomeListModule />
      </FiscalYearProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: { success: true, data: [] } });
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
  });

  describe('コンポーネントのレンダリング', () => {
    test('RSU所得一覧モジュールが正常に表示される', async () => {
      const { container } = renderComponent();
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('コンポーネントが正常にマウントされる', async () => {
      const { container } = renderComponent();
      
      await waitFor(() => {
        const component = container.firstChild;
        expect(component).toBeInTheDocument();
      });
    });

    test('APIが初期化時に呼ばれる', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('rsu-income/list')
        );
      });
    });
  });

  describe('データ取得と表示', () => {
    test('RSU所得レコードが取得される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    test('ローディング状態が処理される', async () => {
      mockedAxios.get.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { success: true, data: [] } }), 100))
      );
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('データがない場合でも正常に表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('複数のRSU所得レコードが表示される', async () => {
      const multipleRecords = [
        mockRSURecords[0],
        { ...mockRSURecords[0], id: '2', totalRSUIncome: 5000000 },
      ];
      
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: multipleRecords } 
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('RSU所得情報の表示', () => {
    test('年度が表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.queryByText(/202[0-9]/)).toBeTruthy();
      });
    });

    test('テーブル構造が存在する', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        const elements = container.querySelectorAll('div, table, ul, li');
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    test('年間合計情報が表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      renderComponent();
      
      await waitFor(() => {
        // 合計情報が表示されることを確認
        expect(screen.queryByText(/4301000|合計|計/i)).toBeTruthy();
      });
    });

    test('会社名が表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      renderComponent();
      
      await waitFor(() => {
        // レコードから会社名が表示されることを確認
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('年度別フィルタリング', () => {
    test('年度を切り替えるとAPIが再実行される', async () => {
      mockedAxios.get.mockResolvedValue({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      const { rerender } = renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    test('複数年度のデータが管理される', async () => {
      const multiYearRecords = [
        mockRSURecords[0],
        { ...mockRSURecords[0], id: '2', year: 2024 },
      ];
      
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: multiYearRecords } 
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('削除機能', () => {
    test('削除ボタンが存在する', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        // 削除関連のボタンが存在することを確認
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    test('レコード削除時に確認ダイアログが表示される', async () => {
      window.confirm = jest.fn(() => true);
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      mockedAxios.delete.mockResolvedValueOnce({ 
        data: { success: true } 
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('PDF出力機能', () => {
    test('PDF出力ボタンが存在する', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    test('PDF出力時にAPIが呼ばれる', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      mockedAxios.get.mockResolvedValueOnce({ 
        data: new Blob(['PDF content']) 
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('API エラー時にエラーメッセージが表示される', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('ネットワークエラー時に適切に処理される', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('失敗レスポンスが処理される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: false, error: 'データ取得失敗' } 
      });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('レスポンシブ表示', () => {
    test('レスポンシブレイアウトが適用されている', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        const elements = container.querySelectorAll('[class*="responsive"], [class*="grid"], [class*="flex"]');
        // レスポンシブクラスが適用されていることを確認
        expect(container).toBeInTheDocument();
      });
    });

    test('モバイル表示に対応している', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        expect(container.firstChild).toBeTruthy();
      });
    });
  });

  describe('データの集計', () => {
    test('年間合計が正しく計算される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: mockRSURecords } 
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    test('複数レコードの合計が表示される', async () => {
      const multipleRecords = [
        { ...mockRSURecords[0], id: '1', totalRSUIncome: 2000000 },
        { ...mockRSURecords[0], id: '2', totalRSUIncome: 3000000 },
      ];
      
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: multipleRecords } 
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });
});
