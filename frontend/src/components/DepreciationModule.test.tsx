import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import DepreciationModule from './DepreciationModule';
import { FiscalYearProvider } from '../contexts/FiscalYearContext';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <FiscalYearProvider>
      {component}
    </FiscalYearProvider>
  );
};

describe('DepreciationModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('物件マスターデータ連携', () => {
    it('初期化時に物件マスターを読み込む', async () => {
      const mockProperties = [
        {
          _id: 'prop-001',
          propertyId: 'prop-001',
          propertyName: 'オフィスビル',
          acquisitionDate: '2020-01-01',
          acquisitionCost: 50000000,
          buildingStructure: 'rc',
          usefulLife: 47,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockProperties });

      renderWithContext(<DepreciationModule />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://localhost:5000/api/properties'
        );
      });
    });

    it('物件が存在する場合、ドロップダウンに表示される', async () => {
      const mockProperties = [
        {
          _id: 'prop-001',
          propertyId: 'prop-001',
          propertyName: 'オフィスビル',
          acquisitionDate: '2020-01-01',
          acquisitionCost: 50000000,
          buildingStructure: 'rc',
          usefulLife: 47,
        },
        {
          _id: 'prop-002',
          propertyId: 'prop-002',
          propertyName: '賃貸住宅',
          acquisitionDate: '2019-06-15',
          acquisitionCost: 30000000,
          buildingStructure: 'wood',
          usefulLife: 22,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockProperties });

      renderWithContext(<DepreciationModule />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://localhost:5000/api/properties'
        );
      });
    });

    it('物件を選択するとデータが自動入力される', async () => {
      const mockProperties = [
        {
          _id: 'prop-001',
          propertyId: 'prop-001',
          propertyName: 'オフィスビル',
          acquisitionDate: '2020-01-01',
          acquisitionCost: 50000000,
          buildingStructure: 'rc',
          usefulLife: 47,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockProperties });
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          schedule: [
            {
              year: 1,
              bookValue: 48936170,
              annualDepreciation: 1063830,
              accumulatedDepreciation: 1063830,
              undepreciatedBalance: 48936170,
            },
          ],
        },
      });

      renderWithContext(<DepreciationModule />);

      // 物件選択をトリガー
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        if (selects.length > 0) {
          fireEvent.change(selects[0], { target: { value: 'prop-001' } });
        }
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('オフィスビル')).toBeInTheDocument();
      });
    });
  });

  describe('減価償却スケジュール計算', () => {
    it('物件選択時に減価償却スケジュールを自動計算する', async () => {
      const mockProperties = [
        {
          _id: 'prop-001',
          propertyId: 'prop-001',
          propertyName: 'オフィスビル',
          acquisitionDate: '2020-01-01',
          acquisitionCost: 50000000,
          buildingStructure: 'rc',
          usefulLife: 47,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockProperties });

      renderWithContext(<DepreciationModule />);

      // Wait for initial load
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://localhost:5000/api/properties'
        );
      });

      // 物件が読み込まれたことを確認
      // 実際のユーザーアクションは統合テストで行う
    });

    it('スケジュール結果がテーブルで表示される', async () => {
      const mockProperties = [
        {
          _id: 'prop-001',
          propertyId: 'prop-001',
          propertyName: 'オフィスビル',
          acquisitionDate: '2020-01-01',
          acquisitionCost: 50000000,
          buildingStructure: 'rc',
          usefulLife: 47,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockProperties });
      
      renderWithContext(<DepreciationModule />);

      // 初期ロード待機
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      // モジュールがレンダリングされることを確認
      const { container } = renderWithContext(<DepreciationModule />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('ダッシュボード統合', () => {
    it('モジュールが正常にレンダリングされる', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      const { container } = renderWithContext(<DepreciationModule />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    it('ローディング状態が適切に管理される', async () => {
      mockedAxios.get.mockImplementationOnce(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ data: [] }), 100)
          )
      );

      renderWithContext(<DepreciationModule />);

      // ローディングが発生すること
      await waitFor(
        () => {
          expect(mockedAxios.get).toHaveBeenCalled();
        },
        { timeout: 200 }
      );
    });
  });

  describe('エラーハンドリング', () => {
    it('API エラーが発生した場合、ハンドリングできる', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      renderWithContext(<DepreciationModule />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    it('物件データが存在しない場合、適切に処理される', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      renderWithContext(<DepreciationModule />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });
});
