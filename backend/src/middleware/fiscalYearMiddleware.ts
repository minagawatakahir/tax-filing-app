/**
 * TX-25: 年度管理ミドルウェア
 * すべてのAPIリクエストに fiscalYear を追加
 */

import { Request, Response, NextFunction } from 'express';

export interface FiscalYearRequest extends Request {
  fiscalYear?: number;
}

/**
 * 年度パラメータをリクエストに追加するミドルウェア
 * クエリまたはボディから年度を取得、デフォルトは現在の会計年度
 */
export const fiscalYearMiddleware = (req: FiscalYearRequest, res: Response, next: NextFunction) => {
  // クエリパラメータ、ボディ、またはヘッダーから年度を取得
  const fiscalYear = req.query.fiscalYear || req.body?.fiscalYear || req.headers['x-fiscal-year'];
  
  if (fiscalYear) {
    const year = parseInt(fiscalYear as string, 10);
    if (!isNaN(year) && year >= 1900 && year <= 2100) {
      req.fiscalYear = year;
    }
  }
  
  // デフォルト：現在の年（暦年ベース：1月〜12月）
  if (!req.fiscalYear) {
    req.fiscalYear = new Date().getFullYear();
  }
  
  next();
};

/**
 * 現在の会計年度を取得（暦年：1月〜12月）
 */
export const getCurrentFiscalYear = (): number => {
  return new Date().getFullYear();
};
