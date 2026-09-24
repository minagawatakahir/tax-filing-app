/**
 * 数値フォーマット関連のユーティリティ関数
 */

/**
 * 数値を日本円形式にフォーマット（カンマ区切り）
 * @param value 数値
 * @returns フォーマット済み文字列
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('ja-JP');
};

/**
 * フォーマット済み文字列（カンマ含む）を数値に変換
 * @param value フォーマット済み文字列
 * @returns 数値
 */
export const parseCurrency = (value: string): number => {
  // カンマを削除して数値に変換
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * 入力値をカンマ区切りにフォーマット
 * @param value 入力値
 * @returns フォーマット済み文字列
 */
export const formatInputCurrency = (value: string | number): string => {
  if (value === '' || value === null || value === undefined) {
    return '';
  }
  
  // 文字列の場合、カンマを削除
  const stringValue = typeof value === 'string' ? value : value.toString();
  const cleaned = stringValue.replace(/,/g, '');
  
  // 数値に変換できない場合は空文字列を返す
  if (cleaned === '' || isNaN(parseFloat(cleaned))) {
    return '';
  }
  
  // 小数点以下がある場合は保持
  const parts = cleaned.split('.');
  parts[0] = parseInt(parts[0]).toLocaleString('ja-JP');
  
  return parts.join('.');
};

/**
 * 数値入力フィールド用の値とハンドラーを生成
 */
export const useCurrencyInput = (
  value: number,
  onChange: (value: number) => void
) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrency(inputValue);
    onChange(numericValue);
  };

  return {
    value: formatInputCurrency(value),
    onChange: handleChange,
  };
};
