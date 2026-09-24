import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import {
  FiscalYearProvider,
  useFiscalYear,
  getCurrentFiscalYear,
  createFiscalYear,
  getAvailableFiscalYears,
} from './FiscalYearContext';

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

describe('FiscalYearContext - TX-44 Frontend Module Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('getCurrentFiscalYear', () => {
    test('現在の年度を取得できる', () => {
      const currentYear = getCurrentFiscalYear();
      const now = new Date();
      
      expect(currentYear).toBe(now.getFullYear());
    });

    test('取得した年度が数値である', () => {
      const currentYear = getCurrentFiscalYear();
      
      expect(typeof currentYear).toBe('number');
    });

    test('取得した年度が正の整数である', () => {
      const currentYear = getCurrentFiscalYear();
      
      expect(currentYear).toBeGreaterThan(0);
      expect(Number.isInteger(currentYear)).toBe(true);
    });
  });

  describe('createFiscalYear', () => {
    test('年度オブジェクトを生成できる', () => {
      const fiscalYear = createFiscalYear(2025);
      
      expect(fiscalYear).toHaveProperty('year');
      expect(fiscalYear).toHaveProperty('label');
      expect(fiscalYear).toHaveProperty('startDate');
      expect(fiscalYear).toHaveProperty('endDate');
    });

    test('年度が正しく設定される', () => {
      const fiscalYear = createFiscalYear(2025);
      
      expect(fiscalYear.year).toBe(2025);
    });

    test('ラベルが正しく生成される', () => {
      const fiscalYear = createFiscalYear(2025);
      
      expect(fiscalYear.label).toBe('2025年');
    });

    test('開始日が1月1日である', () => {
      const fiscalYear = createFiscalYear(2025);
      
      expect(fiscalYear.startDate.getMonth()).toBe(0); // 1月
      expect(fiscalYear.startDate.getDate()).toBe(1);
      expect(fiscalYear.startDate.getFullYear()).toBe(2025);
    });

    test('終了日が12月31日である', () => {
      const fiscalYear = createFiscalYear(2025);
      
      expect(fiscalYear.endDate.getMonth()).toBe(11); // 12月
      expect(fiscalYear.endDate.getDate()).toBe(31);
      expect(fiscalYear.endDate.getFullYear()).toBe(2025);
    });
  });

  describe('getAvailableFiscalYears', () => {
    test('利用可能な年度リストを取得できる', () => {
      const fiscalYears = getAvailableFiscalYears();
      
      expect(Array.isArray(fiscalYears)).toBe(true);
    });

    test('5年分の年度が取得される', () => {
      const fiscalYears = getAvailableFiscalYears();
      
      expect(fiscalYears.length).toBe(5);
    });

    test('最新の年度が最初に配置される', () => {
      const fiscalYears = getAvailableFiscalYears();
      const currentYear = getCurrentFiscalYear();
      
      expect(fiscalYears[0].year).toBe(currentYear);
    });

    test('年度が降順で並んでいる', () => {
      const fiscalYears = getAvailableFiscalYears();
      
      for (let i = 0; i < fiscalYears.length - 1; i++) {
        expect(fiscalYears[i].year).toBeGreaterThan(fiscalYears[i + 1].year);
      }
    });

    test('各年度オブジェクトが正しく生成されている', () => {
      const fiscalYears = getAvailableFiscalYears();
      
      fiscalYears.forEach(fiscalYear => {
        expect(fiscalYear).toHaveProperty('year');
        expect(fiscalYear).toHaveProperty('label');
        expect(fiscalYear).toHaveProperty('startDate');
        expect(fiscalYear).toHaveProperty('endDate');
      });
    });
  });

  describe('FiscalYearProvider', () => {
    test('Providerが正常にレンダリングされる', () => {
      const { container } = render(
        <FiscalYearProvider>
          <div>Test Content</div>
        </FiscalYearProvider>
      );
      
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('子コンポーネントが正常にレンダリングされる', () => {
      render(
        <FiscalYearProvider>
          <div data-testid="child">Child Component</div>
        </FiscalYearProvider>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('useFiscalYear Hook', () => {
    test('Provider内でフックが正常に動作する', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FiscalYearProvider>{children}</FiscalYearProvider>
      );

      const { result } = renderHook(() => useFiscalYear(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.currentFiscalYear).toBeDefined();
      expect(result.current.setCurrentFiscalYear).toBeDefined();
      expect(result.current.availableFiscalYears).toBeDefined();
    });

    test('currentFiscalYearが取得できる', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FiscalYearProvider>{children}</FiscalYearProvider>
      );

      const { result } = renderHook(() => useFiscalYear(), { wrapper });

      expect(result.current.currentFiscalYear).toHaveProperty('year');
      expect(result.current.currentFiscalYear).toHaveProperty('label');
      expect(result.current.currentFiscalYear).toHaveProperty('startDate');
      expect(result.current.currentFiscalYear).toHaveProperty('endDate');
    });

    test('availableFiscalYearsが取得できる', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FiscalYearProvider>{children}</FiscalYearProvider>
      );

      const { result } = renderHook(() => useFiscalYear(), { wrapper });

      expect(Array.isArray(result.current.availableFiscalYears)).toBe(true);
      expect(result.current.availableFiscalYears.length).toBe(5);
    });

    test('Provider外でフックを使用するとエラーが発生する', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useFiscalYear());
      }).toThrow('useFiscalYear must be used within a FiscalYearProvider');

      console.error = originalError;
    });
  });

  describe('年度切り替え機能', () => {
    test('年度を切り替えることができる', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FiscalYearProvider>{children}</FiscalYearProvider>
      );

      const { result } = renderHook(() => useFiscalYear(), { wrapper });

      const newFiscalYear = createFiscalYear(2024);

      act(() => {
        result.current.setCurrentFiscalYear(newFiscalYear);
      });

      expect(result.current.currentFiscalYear.year).toBe(2024);
    });

    test('年度切り替え時にlocalStorageに保存される', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FiscalYearProvider>{children}</FiscalYearProvider>
      );

      const { result } = renderHook(() => useFiscalYear(), { wrapper });

      const newFiscalYear = createFiscalYear(2024);

      act(() => {
        result.current.setCurrentFiscalYear(newFiscalYear);
      });

      expect(localStorageMock.getItem('selectedFiscalYear')).toBe('2024');
    });

    test('複数回年度を切り替えることができる', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FiscalYearProvider>{children}</FiscalYearProvider>
      );

      const { result } = renderHook(() => useFiscalYear(), { wrapper });

      act(() => {
        result.current.setCurrentFiscalYear(createFiscalYear(2024));
      });
      expect(result.current.currentFiscalYear.year).toBe(2024);

      act(() => {
        result.current.setCurrentFiscalYear(createFiscalYear(2023));
      });
      expect(result.current.currentFiscalYear.year).toBe(2023);

      act(() => {
        result.current.setCurrentFiscalYear(createFiscalYear(2025));
      });
      expect(result.current.currentFiscalYear.year).toBe(2025);
    });
  });

  describe('localStorageとの統合', () => {
    test('localStorageに保存された年度が読み込まれる', () => {
      localStorageMock.setItem('selectedFiscalYear', '2023');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FiscalYearProvider>{children}</FiscalYearProvider>
      );

      const { result } = renderHook(() => useFiscalYear(), { wrapper });

      expect(result.current.currentFiscalYear.year).toBe(2023);
    });

    test('localStorageに保存されていない場合は現在の年度が使用される', () => {
      localStorageMock.clear();

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FiscalYearProvider>{children}</FiscalYearProvider>
      );

      const { result } = renderHook(() => useFiscalYear(), { wrapper });
      const currentYear = getCurrentFiscalYear();

      expect(result.current.currentFiscalYear.year).toBe(currentYear);
    });

    test('不正な値がlocalStorageに保存されている場合は現在の年度が使用される', () => {
      localStorageMock.setItem('selectedFiscalYear', 'invalid');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FiscalYearProvider>{children}</FiscalYearProvider>
      );

      const { result } = renderHook(() => useFiscalYear(), { wrapper });
      const currentYear = getCurrentFiscalYear();

      expect(result.current.currentFiscalYear.year).toBe(currentYear);
    });
  });

  describe('年度オブジェクトの整合性', () => {
    test('年度とラベルが一致する', () => {
      const fiscalYear = createFiscalYear(2025);
      
      expect(fiscalYear.label).toBe(`${fiscalYear.year}年`);
    });

    test('開始日と終了日が同じ年である', () => {
      const fiscalYear = createFiscalYear(2025);
      
      expect(fiscalYear.startDate.getFullYear()).toBe(fiscalYear.year);
      expect(fiscalYear.endDate.getFullYear()).toBe(fiscalYear.year);
    });

    test('開始日が終了日より前である', () => {
      const fiscalYear = createFiscalYear(2025);
      
      expect(fiscalYear.startDate.getTime()).toBeLessThan(fiscalYear.endDate.getTime());
    });
  });

  describe('エッジケース', () => {
    test('過去の年度を作成できる', () => {
      const fiscalYear = createFiscalYear(2000);
      
      expect(fiscalYear.year).toBe(2000);
      expect(fiscalYear.label).toBe('2000年');
    });

    test('未来の年度を作成できる', () => {
      const fiscalYear = createFiscalYear(2030);
      
      expect(fiscalYear.year).toBe(2030);
      expect(fiscalYear.label).toBe('2030年');
    });
  });
});
