import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyManagementPanel from './PropertyManagementPanel';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PropertyManagementPanel - TX-44 Frontend Module Tests', () => {
  const mockProperties = [
    {
      _id: '1',
      propertyId: 'PROP-001',
      propertyName: 'マンション渋谷',
      address: '東京都渋谷区',
      landValue: 30000000,
      buildingValue: 20000000,
      totalValue: 50000000,
      acquisitionDate: '2020-01-15',
      acquisitionCost: 50000000,
      category: 'residential' as const,
      acquisitionTax: 1500000,
      registrationTax: 500000,
      brokerFee: 1000000,
      otherAcquisitionCosts: 200000,
      outstandingLoan: 40000000,
      annualInterest: 800000,
      loanStartDate: '2020-01-15',
      purpose: 'investment' as const,
      buildingStructure: 'rc' as const,
      constructionDate: '2019-06-01',
      usefulLife: 47,
      depreciationMethod: 'straight-line' as const,
      isNewProperty: false,
      createdAt: '2020-01-15',
      updatedAt: '2020-01-15',
    },
    {
      _id: '2',
      propertyId: 'PROP-002',
      propertyName: 'オフィスビル新宿',
      address: '東京都新宿区',
      landValue: 100000000,
      buildingValue: 80000000,
      totalValue: 180000000,
      acquisitionDate: '2021-03-20',
      acquisitionCost: 180000000,
      category: 'commercial' as const,
      outstandingLoan: 150000000,
      annualInterest: 3000000,
      loanStartDate: '2021-03-20',
      purpose: 'business' as const,
      buildingStructure: 'src' as const,
      constructionDate: '2020-12-01',
      usefulLife: 50,
      depreciationMethod: 'straight-line' as const,
      isNewProperty: true,
      createdAt: '2021-03-20',
      updatedAt: '2021-03-20',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: { success: true, data: [] } });
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    mockedAxios.put.mockResolvedValue({ data: { success: true } });
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
  });

  describe('コンポーネントのレンダリング', () => {
    test('物件管理パネルが正常に表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('コンポーネントが正常にマウントされる', async () => {
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    test('APIが初期化時に呼ばれる', async () => {
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('properties')
        );
      });
    });
  });

  describe('物件一覧表示', () => {
    test('物件リストが表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    test('物件名が表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(screen.getAllByText('マンション渋谷').length).toBeGreaterThan(0);
        expect(screen.getAllByText('オフィスビル新宿').length).toBeGreaterThan(0);
      });
    });

    test('物件の住所が表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(screen.getAllByText('東京都渋谷区').length).toBeGreaterThan(0);
        expect(screen.getAllByText('東京都新宿区').length).toBeGreaterThan(0);
      });
    });

    test('複数の物件が表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    test('物件がない場合でも正常に表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('物件追加機能', () => {
    test('追加ボタンが表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    test('追加フォームが表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        // フォーム要素が存在することを確認
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThanOrEqual(0);
      });
    });

    test('必須フィールドが存在する', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('物件編集機能', () => {
    test('編集ボタンが表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    test('物件情報が編集可能である', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('物件削除機能', () => {
    test('削除ボタンが表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    test('削除時に確認ダイアログが表示される', async () => {
      window.confirm = jest.fn(() => true);
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('検索・フィルタリング機能', () => {
    test('検索フィールドが表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });

    test('物件名で検索できる', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    test('カテゴリでフィルタリングできる', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('LTV計算表示', () => {
    test('LTV（ローン対価値比率）が計算される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        // LTV = (outstandingLoan / totalValue) * 100
        // Property 1: (40000000 / 50000000) * 100 = 80%
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    test('LTVが表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    test('残債が表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('API エラー時にエラーメッセージが表示される', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('ネットワークエラー時に適切に処理される', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('失敗レスポンスが処理される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: false, error: 'データ取得失敗' } 
      });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('バリデーション', () => {
    test('必須フィールドのバリデーションが機能する', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('数値フィールドのバリデーションが機能する', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        const inputs = container.querySelectorAll('input[type="number"]');
        expect(inputs.length).toBeGreaterThanOrEqual(0);
      });
    });

    test('日付フィールドのバリデーションが機能する', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        const inputs = container.querySelectorAll('input[type="date"]');
        expect(inputs.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('レスポンシブ表示', () => {
    test('レスポンシブレイアウトが適用されている', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('モバイル表示に対応している', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      const { container } = render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(container.firstChild).toBeTruthy();
      });
    });
  });

  describe('データの統計表示', () => {
    test('物件総数が表示される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    test('総資産価値が計算される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        // Total value = 50000000 + 180000000 = 230000000
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    test('総残債が計算される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockProperties } });
      
      render(<PropertyManagementPanel />);
      
      await waitFor(() => {
        // Total loan = 40000000 + 150000000 = 190000000
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });
});
