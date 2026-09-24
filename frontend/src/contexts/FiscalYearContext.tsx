import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * 確定申告年度の型定義
 * 日本の確定申告は暦年（1月〜12月）
 */
export interface FiscalYear {
  year: number; // 年度（例：2024年 = 2024年1月〜2024年12月）
  label: string; // 表示ラベル（例：「2024年」）
  startDate: Date; // 開始日
  endDate: Date; // 終了日
}

/**
 * FiscalYearContextの型定義
 */
interface FiscalYearContextType {
  currentFiscalYear: FiscalYear;
  setCurrentFiscalYear: (fiscalYear: FiscalYear) => void;
  availableFiscalYears: FiscalYear[];
}

/**
 * 現在の日付から確定申告年度を計算
 * 確定申告は暦年なので、現在の年をそのまま返す
 */
export const getCurrentFiscalYear = (): number => {
  const now = new Date();
  return now.getFullYear();
};

/**
 * 確定申告年度オブジェクトを生成
 */
export const createFiscalYear = (year: number): FiscalYear => {
  return {
    year,
    label: `${year}年`,
    startDate: new Date(year, 0, 1), // 1月1日
    endDate: new Date(year, 11, 31), // 12月31日
  };
};

/**
 * 利用可能な確定申告年度リストを生成（過去5年分）
 */
export const getAvailableFiscalYears = (): FiscalYear[] => {
  const currentYear = getCurrentFiscalYear();
  const years: FiscalYear[] = [];
  
  // 現在の年と過去4年分（合計5年分）
  for (let i = 0; i < 5; i++) {
    years.push(createFiscalYear(currentYear - i));
  }
  
  return years;
};

/**
 * FiscalYearContext
 */
const FiscalYearContext = createContext<FiscalYearContextType | undefined>(undefined);

/**
 * FiscalYearProvider Props
 */
interface FiscalYearProviderProps {
  children: ReactNode;
}

/**
 * FiscalYearProvider
 * 確定申告年度情報を全アプリケーションで共有
 */
export const FiscalYearProvider: React.FC<FiscalYearProviderProps> = ({ children }) => {
  const availableFiscalYears = getAvailableFiscalYears();
  
  // LocalStorageから前回選択した年度を取得、なければ現在の年度
  const getInitialFiscalYear = (): FiscalYear => {
    const savedYear = localStorage.getItem('selectedFiscalYear');
    if (savedYear) {
      const year = parseInt(savedYear, 10);
      if (!isNaN(year)) {
        return createFiscalYear(year);
      }
    }
    return availableFiscalYears[0]; // デフォルトは最新の年度
  };

  const [currentFiscalYear, setCurrentFiscalYearState] = useState<FiscalYear>(getInitialFiscalYear());

  /**
   * 年度を変更し、LocalStorageに保存
   */
  const setCurrentFiscalYear = (fiscalYear: FiscalYear) => {
    setCurrentFiscalYearState(fiscalYear);
    localStorage.setItem('selectedFiscalYear', fiscalYear.year.toString());
  };

  const value: FiscalYearContextType = {
    currentFiscalYear,
    setCurrentFiscalYear,
    availableFiscalYears,
  };

  return (
    <FiscalYearContext.Provider value={value}>
      {children}
    </FiscalYearContext.Provider>
  );
};

/**
 * useFiscalYear Hook
 * コンポーネントから確定申告年度情報にアクセスするためのフック
 */
export const useFiscalYear = (): FiscalYearContextType => {
  const context = useContext(FiscalYearContext);
  if (!context) {
    throw new Error('useFiscalYear must be used within a FiscalYearProvider');
  }
  return context;
};
