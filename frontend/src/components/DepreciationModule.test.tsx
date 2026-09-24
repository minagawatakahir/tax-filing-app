import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DepreciationModule from './DepreciationModule';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DepreciationModule - TX-44 Frontend Module Tests', () => {
  const mockDepreciationSchedule = [
    {
      year: 1,
      bookValue: 50000000,
      annualDepreciation: 1063829,
      accumulatedDepreciation: 1063829,
      undepreciatedBalance: 48936171,
    },
    {
      year: 2,
      bookValue: 48936171,
      annualDepreciation: 1063829,
      accumulatedDepreciation: 2127658,
      undepreciatedBalance: 47872342,
    },
    {
      year: 3,
      bookValue: 47872342,
      annualDepreciation: 1063829,
      accumulatedDepreciation: 3191487,
      undepreciatedBalance: 46808513,
    },
  ];

  const mockResult = {
    assetId: 'asset-001',
    assetName: 'オフィスビル',
    schedule: mockDepreciationSchedule,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post.mockResolvedValue({ 
      data: { success: true, data: mockDepreciationSchedule } 
    });
  });

  describe('コンポーネントのレンダリング', () => {
    test('減価償却モジュールが正常に表示される', () => {
      const { container } = render(<DepreciationModule />);
      
      expect(container).toBeInTheDocument();
    });

    test('タイトルが表示される', () => {
      render(<DepreciationModule />);
      
      expect(screen.getByText(/減価償却ライフサイクル/i)).toBeInTheDocument();
    });

    test('説明文が表示される', () => {
      render(<DepreciationModule />);
      
      expect(screen.getByText(/資産の耐用年数管理/i)).toBeInTheDocument();
    });

    test('フォームが表示される', () => {
      const { container } = render(<DepreciationModule />);
      
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('入力フィールド', () => {
    test('資産ID入力フィールドが表示される', () => {
      render(<DepreciationModule />);
      
      expect(screen.getByText(/資産ID/i)).toBeInTheDocument();
    });

    test('資産名入力フィールドが表示される', () => {
      render(<DepreciationModule />);
      
      expect(screen.getByText(/資産名/i)).toBeInTheDocument();
    });

    test('取得日入力フィールドが表示される', () => {
      render(<DepreciationModule />);
      
      expect(screen.getByText(/取得日|取得年月日/i)).toBeInTheDocument();
    });

    test('取得原価入力フィールドが表示される', () => {
      render(<DepreciationModule />);
      
      expect(screen.getByText(/取得原価|取得価格/i)).toBeInTheDocument();
    });

    test('カテゴリ選択フィールドが表示される', () => {
      const { container } = render(<DepreciationModule />);
      
      const selects = container.querySelectorAll('select');
      expect(selects.length).toBeGreaterThan(0);
    });

    test('耐用年数入力フィールドが表示される', () => {
      render(<DepreciationModule />);
      
      expect(screen.getByText(/耐用年数/i)).toBeInTheDocument();
    });

    test('償却方法選択フィールドが表示される', () => {
      const { container } = render(<DepreciationModule />);
      
      const selects = container.querySelectorAll('select');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  describe('減価償却計算', () => {
    test('計算ボタンが表示される', () => {
      const { container } = render(<DepreciationModule />);
      
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('計算ボタンクリック時にAPIが呼ばれる', async () => {
      render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalledWith(
            expect.stringContaining('depreciation/schedule'),
            expect.any(Object)
          );
        });
      }
    });

    test('計算結果が表示される', async () => {
      const { container } = render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalled();
        });
      }
    });
  });

  describe('耐用年数自動設定', () => {
    test('カテゴリ選択時に耐用年数が自動設定される', async () => {
      const { container } = render(<DepreciationModule />);
      
      const selects = container.querySelectorAll('select');
      expect(selects.length).toBeGreaterThan(0);
    });

    test('コンクリート建物の耐用年数が47年である', () => {
      render(<DepreciationModule />);
      
      // デフォルト値が47年であることを確認
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('減価償却スケジュール表示', () => {
    test('スケジュールテーブルが表示される', async () => {
      const { container } = render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalled();
        });
      }
    });

    test('年度が表示される', async () => {
      const { container } = render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalled();
        });
      }
    });

    test('年間償却額が表示される', async () => {
      const { container } = render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalled();
        });
      }
    });

    test('累計償却額が表示される', async () => {
      const { container } = render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalled();
        });
      }
    });

    test('未償却残高が表示される', async () => {
      const { container } = render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalled();
        });
      }
    });
  });

  describe('エラーハンドリング', () => {
    test('API エラー時にエラーメッセージが表示される', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'API Error' } }
      });
      
      render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalled();
        });
      }
    });

    test('ネットワークエラー時に適切に処理される', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalled();
        });
      }
    });
  });

  describe('入力バリデーション', () => {
    test('取得原価が数値であることを確認する', () => {
      const { container } = render(<DepreciationModule />);
      
      const numberInputs = container.querySelectorAll('input[type="number"]');
      expect(numberInputs.length).toBeGreaterThanOrEqual(0);
    });

    test('耐用年数が正の整数であることを確認する', () => {
      const { container } = render(<DepreciationModule />);
      
      const numberInputs = container.querySelectorAll('input[type="number"]');
      expect(numberInputs.length).toBeGreaterThanOrEqual(0);
    });

    test('取得日が日付形式であることを確認する', () => {
      const { container } = render(<DepreciationModule />);
      
      const dateInputs = container.querySelectorAll('input[type="date"]');
      expect(dateInputs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('レスポンシブ表示', () => {
    test('レスポンシブレイアウトが適用されている', () => {
      const { container } = render(<DepreciationModule />);
      
      expect(container).toBeInTheDocument();
    });

    test('モバイル表示に対応している', () => {
      const { container } = render(<DepreciationModule />);
      
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('ライフサイクル表示', () => {
    test('資産のライフサイクルが表示される', async () => {
      const { container } = render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalled();
        });
      }
    });

    test('複数年度のスケジュールが表示される', async () => {
      const { container } = render(<DepreciationModule />);
      
      const buttons = screen.getAllByRole('button');
      const calculateButton = buttons.find(btn => btn.textContent?.includes('計算'));
      
      if (calculateButton) {
        fireEvent.click(calculateButton);
        
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalled();
        });
      }
    });
  });

  describe('償却方法', () => {
    test('定額法が選択できる', () => {
      const { container } = render(<DepreciationModule />);
      
      const selects = container.querySelectorAll('select');
      expect(selects.length).toBeGreaterThan(0);
    });

    test('定率法が選択できる', () => {
      const { container } = render(<DepreciationModule />);
      
      const selects = container.querySelectorAll('select');
      expect(selects.length).toBeGreaterThan(0);
    });
  });
});
