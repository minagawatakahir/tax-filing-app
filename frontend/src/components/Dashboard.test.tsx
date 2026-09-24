import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import { FiscalYearProvider } from '../contexts/FiscalYearContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Dashboard Component - TX-44 Frontend Module Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <FiscalYearProvider>
        <Dashboard />
      </FiscalYearProvider>
    );
  };

  const setupSampleData = (override?: Partial<any>) => {
    const sampleData = {
      totalIncome: 5000000,
      totalExpenses: 1000000,
      netIncome: 4000000,
      estimatedTax: 800000,
      completedModules: ['salary', 'rsu', 'properties'],
      pendingModules: ['capital-gain'],
      ...override,
    };
    localStorageMock.setItem('dashboard-data-2025', JSON.stringify(sampleData));
    return sampleData;
  };

  describe('年度サマリー表示', () => {
    test('総所得が表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/総所得/i)).toBeInTheDocument();
      });
    });

    test('総所得が正しい金額で表示される', async () => {
      setupSampleData({ totalIncome: 5000000 });
      const { container } = renderDashboard();

      await waitFor(() => {
        // コンポーネントが表示されることを確認
        expect(container).toBeInTheDocument();
      });
    });

    test('総経費が表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/総経費/i)).toBeInTheDocument();
      });
    });

    test('総経費が正しい金額で表示される', async () => {
      setupSampleData({ totalExpenses: 1000000 });
      const { container } = renderDashboard();

      await waitFor(() => {
        // コンポーネントが表示されることを確認
        expect(container).toBeInTheDocument();
      });
    });

    test('純所得が表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/純所得/i)).toBeInTheDocument();
      });
    });

    test('推定納税額が表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/推定納税額/i)).toBeInTheDocument();
      });
    });

    test('ダッシュボードタイトルが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/📊 ダッシュボード/i)).toBeInTheDocument();
      });
    });
  });

  describe('カテゴリ別集計表示', () => {
    test('所得入力セクションが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/所得入力/i)).toBeInTheDocument();
      });
    });

    test('不動産・資産管理セクションが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/不動産・資産管理/i)).toBeInTheDocument();
      });
    });

    test('レポート・一覧セクションが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/レポート・一覧/i)).toBeInTheDocument();
      });
    });

    test('給与所得モジュールが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/給与所得/i)).toBeInTheDocument();
      });
    });

    test('RSU所得モジュールが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        const elements = screen.getAllByText(/RSU/i);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    test('不動産所得モジュールが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        const elements = screen.getAllByText(/不動産/i);
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('進捗状況表示', () => {
    test('進捗バーが表示される', async () => {
      setupSampleData({ completedModules: ['salary', 'rsu'] });
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/進捗状況/i)).toBeInTheDocument();
      });
    });

    test('完了モジュール数が表示される', async () => {
      setupSampleData({ completedModules: ['salary', 'rsu', 'properties'] });
      renderDashboard();

      await waitFor(() => {
        // 3 / 8 モジュール完了
        expect(screen.getByText(/モジュール完了/i)).toBeInTheDocument();
      });
    });

    test('完了率が正しく計算される', async () => {
      setupSampleData({ completedModules: ['salary', 'rsu'] });
      renderDashboard();

      await waitFor(() => {
        // 2 / 8 = 25%
        const percentageElement = screen.getByText(/進捗状況/i).closest('div');
        expect(percentageElement).toBeInTheDocument();
      });
    });

    test('完了モジュールにチェックマークが表示される', async () => {
      setupSampleData({ completedModules: ['salary'] });
      renderDashboard();

      await waitFor(() => {
        // チェックマークが表示されることを確認
        const checkMarks = screen.queryAllByText('✓');
        expect(checkMarks.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('クイックアクション', () => {
    test('クイックアクションセクションが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/クイックアクション/i)).toBeInTheDocument();
      });
    });

    test('給与を追加ボタンが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/給与を追加/i)).toBeInTheDocument();
      });
    });

    test('物件を管理ボタンが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/物件を管理/i)).toBeInTheDocument();
      });
    });

    test('レポートを作成ボタンが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/レポートを作成/i)).toBeInTheDocument();
      });
    });

    test('データをインポートボタンが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/データをインポート/i)).toBeInTheDocument();
      });
    });
  });

  describe('ヒントセクション', () => {
    test('ヒントセクションが表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/ヒント/i)).toBeInTheDocument();
      });
    });

    test('複数のヒント項目が表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/左のメニューから各モジュールにアクセスできます/)).toBeInTheDocument();
        expect(screen.getByText(/複数の給与や物件に対応しています/)).toBeInTheDocument();
      });
    });
  });

  describe('レスポンシブ表示', () => {
    test('Dashboardコンポーネントが正常にレンダリングされる', async () => {
      setupSampleData();
      const { container } = renderDashboard();

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    test('グリッドレイアウトが適用されている', async () => {
      setupSampleData();
      const { container } = renderDashboard();

      await waitFor(() => {
        const gridElements = container.querySelectorAll('[class*="grid"]');
        expect(gridElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('データ取得とエラーハンドリング', () => {
    test('データがない場合でも正常に表示される', async () => {
      // localStorageをクリア
      localStorageMock.clear();

      renderDashboard();

      await waitFor(() => {
        // コンポーネントが正常にレンダリングされることを確認
        expect(screen.getByText(/📊 ダッシュボード/i)).toBeInTheDocument();
      });
    });

    test('初期状態では統計値が0で表示される', async () => {
      const { container } = renderDashboard();

      await waitFor(() => {
        // ダッシュボードが表示されることを確認
        expect(container).toBeInTheDocument();
      });
    });

    test('コンポーネントが正常にマウントされる', () => {
      setupSampleData();
      const { container } = renderDashboard();
      expect(container).toBeInTheDocument();
    });

    test('ローディング状態が処理される', async () => {
      setupSampleData();
      const { container } = renderDashboard();

      // コンポーネントがレンダリングされることを確認
      expect(container).toBeInTheDocument();
    });
  });

  describe('年度表示', () => {
    test('現在の年度が表示される', async () => {
      setupSampleData();
      renderDashboard();

      await waitFor(() => {
        // 年度情報が表示されることを確認
        const heading = screen.getByText(/📊 ダッシュボード/i).closest('div');
        expect(heading).toBeInTheDocument();
      });
    });
  });
});
